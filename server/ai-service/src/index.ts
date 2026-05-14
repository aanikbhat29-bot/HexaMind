import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '20mb' }));

const PORT = process.env.PORT || 4002;
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const LOCAL_IP = process.env.LOCAL_IP || '192.168.1.37';
const PUBLIC_HOST = process.env.PUBLIC_HOST || `http://${LOCAL_IP}:${PORT}`;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ai-edu-platform';
const client = new MongoClient(MONGODB_URI);

const upload = multer({ storage: multer.memoryStorage() });

const connect = async () => {
  await client.connect();
  console.log('AI service connected to MongoDB');
};

const createOllamaCompletion = async (prompt: string) => {
  const response = await axios.post(`${OLLAMA_URL}/api/completions`, {
    model: 'llama3',
    prompt,
    max_tokens: 500
  });
  return response.data;
};

app.post('/api/ai/chat', asyncHandler(async (req, res) => {
  const { question, context } = req.body;
  const prompt = `You are a helpful AI tutor. Answer the following student question:\n\n${question}\n\nContext:\n${context || 'No additional context.'}`;
  const result = await createOllamaCompletion(prompt);
  res.json({ result });
}));

app.post('/api/ai/summarize', asyncHandler(async (req, res) => {
  const { text } = req.body;
  const prompt = `Summarize the following educational text into concise study notes and bullet points:\n\n${text}`;
  const result = await createOllamaCompletion(prompt);
  res.json({ result });
}));

app.post('/api/ai/quiz', asyncHandler(async (req, res) => {
  const { topic } = req.body;
  const prompt = `Create a short practice quiz with 5 questions and answers for the topic: ${topic}`;
  const result = await createOllamaCompletion(prompt);
  res.json({ result });
}));

app.post('/api/ai/flashcards', asyncHandler(async (req, res) => {
  const { subject } = req.body;
  const prompt = `Generate 10 study flashcards in JSON format for ${subject} with question and answer pairs.`;
  const result = await createOllamaCompletion(prompt);
  res.json({ result });
}));

app.post('/api/ai/planner', asyncHandler(async (req, res) => {
  const { goals, timeframe } = req.body;
  const prompt = `Create a personalized study plan for the following goals: ${goals}. Timeframe: ${timeframe}.`;
  const result = await createOllamaCompletion(prompt);
  res.json({ result });
}));

app.post('/api/ai/pdf', upload.single('file'), asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'PDF file is required' });
  res.json({ message: 'PDF ingest endpoint is ready. Use local OCR and embeddings to process documents.' });
}));

app.listen(PORT, BIND_HOST, async () => {
  await connect();
  console.log(`AI service running on http://${LOCAL_IP}:${PORT}`);
});
