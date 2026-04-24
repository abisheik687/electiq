import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Vite dev server compatibility and static file serving
}));
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per window
  message: 'Too many requests from this IP, please try again after a minute',
});
app.use('/api', limiter);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: "You are a nonpartisan civic education assistant. Explain election processes, voter registration, timelines, and ballot steps in simple language. Never express political opinions.",
});

// Routes
// Chat endpoint (Gemini proxy)
app.post('/api/chat', async (req, res) => {
  try {
    const { history, message } = req.body;
    
    if (!message || message.length > 500) {
      return res.status(400).json({ error: 'Message must be between 1 and 500 characters.' });
    }

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI assistant.' });
  }
});

// Serve Vite's dist folder as static files
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
