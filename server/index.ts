import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenvSafe from 'dotenv-safe';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import winston from 'winston';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Winston Logger Setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsDir, 'app.log') })
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Load Environment Variables Safely
try {
  dotenvSafe.config({
    example: path.join(__dirname, '../.env.example')
  });
} catch (error) {
  logger.error('Missing required environment variables:', error);
  process.exit(1);
}

// Google Cloud Logging Setup
// Removed unused log variable

const app = express();
const port = process.env.PORT || 8080;

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

// Security: HTTPS-only redirect
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

// Middleware
app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "maps.googleapis.com"],
      connectSrc: ["'self'", "api.anthropic.com", "*.googleapis.com"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size

// Logging API Calls
app.use((req, _res, next) => {
  logger.info(`API Call: ${req.method} ${req.url}`);
  next();
});

// Rate limiting
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests from this IP, please try again after a minute',
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit hit (IP): ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  }
});

const sessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour
  keyGenerator: (req) => req.headers['authorization'] || req.ip || 'unknown',
  message: 'Session rate limit exceeded.',
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit hit (Session): ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  }
});

// JWT Middleware
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

app.get('/api/token', (_req, res) => {
  const token = jwt.sign({ role: 'anonymous' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      (req as any).user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.use('/api/chat', authenticateJWT, chatLimiter, sessionLimiter);
app.use('/api/quiz', authenticateJWT, chatLimiter, sessionLimiter);

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', models: ['gemini-1.5-flash'] });
});

// Gemini API setup
if (!process.env.VITE_GEMINI_KEY) {
  logger.error('VITE_GEMINI_KEY is missing. API will degrade gracefully.');
}

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_KEY || 'dummy_key');
const chatModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: "You are a nonpartisan civic education assistant. Explain election processes, voter registration, timelines, and ballot steps in simple language. Never express political opinions.",
});

// Routes
app.post('/api/chat', [
  body('message').isString().trim().isLength({ min: 1, max: 500 }).escape(),
  body('history').isArray().optional()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { history, message } = req.body;
    
    if (!process.env.VITE_GEMINI_KEY) {
       return res.status(503).json({ error: 'AI Assistant currently unavailable. Degraded mode.' });
    }

    const chat = chatModel.startChat({
      history: history || [],
    });

    const result = await chat.sendMessageStream(message);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }
    res.end();
  } catch (error: any) {
    logger.error('Gemini API Error:', error.message);
    res.status(500).json({ error: 'Failed to communicate with AI assistant.' });
  }
});

// Quiz Generation endpoint using Gemini Structured Outputs
const generateQuizTool: FunctionDeclaration = {
  name: 'generateQuizQuestion',
  description: 'Generate structured quiz questions about elections.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      question: { type: SchemaType.STRING, description: 'The quiz question text' },
      options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Exactly 4 answer options' },
      correctIndex: { type: SchemaType.INTEGER, description: 'Index of the correct option (0-3)' },
      explanation: { type: SchemaType.STRING, description: 'Explanation of the correct answer' },
    },
    required: ['question', 'options', 'correctIndex', 'explanation'],
  },
};

const quizModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  tools: [{ functionDeclarations: [generateQuizTool] }],
});

app.post('/api/quiz', [
  body('topic').isString().trim().isLength({ min: 1, max: 100 }).escape()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!process.env.VITE_GEMINI_KEY) {
      return res.status(503).json({ error: 'Quiz generation currently unavailable.' });
    }

    const result = await quizModel.generateContent(`Generate a 5-question quiz about: ${req.body.topic}`);
    const response = result.response;
    
    const calls = response.functionCalls();
    if (calls && calls.length > 0) {
      const questions = calls.filter(call => call.name === 'generateQuizQuestion').map(call => call.args);
      return res.json({ questions });
    } else {
      throw new Error("Model didn't call the function");
    }
  } catch (error: any) {
    logger.error('Quiz Generation Error:', error.message);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// Serve Vite's dist folder as static files
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
