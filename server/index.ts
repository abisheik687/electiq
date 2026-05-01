/// <reference path="../src/types/express.d.ts" />
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenvSafe from 'dotenv-safe';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import winston from 'winston';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'SESSION_SECRET', 'GEMINI_API_KEY', 'CLIENT_URL'];
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

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
app.set('trust proxy', 1);

app.use(compression());

import MemoryStore from 'memorystore';
const SessionStore = MemoryStore(session);

app.use(session({
  store: new SessionStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || (() => {
    throw new Error('SESSION_SECRET env var is required');
  })(),
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  }
}));

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
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "maps.googleapis.com", "*.gstatic.com", "'unsafe-inline'"],
      styleSrc: ["'self'", "fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      connectSrc: ["'self'", "*.googleapis.com"],
      imgSrc: ["'self'", "data:", "*.googleapis.com", "*.gstatic.com"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip ?? req.socket?.remoteAddress ?? req.headers['x-forwarded-for'];
    return String(ip || 'fallback-' + Date.now());
  },
  message: 'Session rate limit exceeded.',
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit hit (Session): ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  }
});

// JWT Middleware
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

app.get('/api/token', (req, res) => {
  const token = jwt.sign(
    { role: 'anonymous', sessionId: req.sessionID },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
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
      req.user = user as { role: string; sessionId?: string };
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.use('/api/chat', authenticateJWT, chatLimiter, sessionLimiter);
app.use('/api/quiz', authenticateJWT, chatLimiter, sessionLimiter);

// Health check route
app.get('/health', (req, res) => {
  const geminiKeyPresent = !!process.env.GEMINI_API_KEY;
  res.status(geminiKeyPresent ? 200 : 503).json({
    status: geminiKeyPresent ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    models: geminiKeyPresent ? ['gemini-1.5-flash'] : [],
    message: geminiKeyPresent ? 'All systems operational' : 'GEMINI_API_KEY missing'
  });
});

// Gemini API setup
if (!process.env.GEMINI_API_KEY) {
  logger.error('GEMINI_API_KEY is missing. API will degrade gracefully.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
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
    
    if (!process.env.GEMINI_API_KEY) {
       return res.status(503).json({ error: 'AI Assistant currently unavailable. Degraded mode.' });
    }

    const chat = chatModel.startChat({
      history: history || [],
    });

    const result = await chat.sendMessageStream(message);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let buffer = '';
    for await (const chunk of result.stream) {
      buffer += chunk.text();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) {
          res.write(`data: ${JSON.stringify({ text: line })}\n\n`);
        }
      }
    }
    if (buffer.trim()) {
      res.write(`data: ${JSON.stringify({ text: buffer })}\n\n`);
    }
    res.end();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Gemini API Error:', message);
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

const QuizQuestionSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string()).length(4),
  correctAnswer: z.string(),
  explanation: z.string().min(5)
});
const QuizResponseSchema = z.array(QuizQuestionSchema).length(5);

app.post('/api/quiz', [
  body('topic').isString().trim().isLength({ min: 1, max: 100 }).escape()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Quiz generation currently unavailable.' });
    }

    const result = await quizModel.generateContent(`Generate a 5-question quiz about: ${req.body.topic}`);
    const response = result.response;
    
    const rawArgs = response.functionCalls()?.map(call => call.args) ?? [];
    let parsedData = null;
    for (const arg of rawArgs) {
      const parsed = QuizResponseSchema.safeParse(arg);
      if (parsed.success) {
        parsedData = parsed.data;
        break;
      }
    }

    if (!parsedData) {
      console.error('[Quiz] Gemini returned invalid schema or no matching payload');
      return res.status(502).json({ error: 'AI returned malformed quiz data. Please retry.' });
    }
    const questions = parsedData;
    return res.json({ questions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Quiz Generation Error:', message);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// Serve Vite's dist folder as static files
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1y',
  immutable: true,
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Fallback for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
