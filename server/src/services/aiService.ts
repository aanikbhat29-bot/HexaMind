import axios from 'axios';
import Tesseract from 'tesseract.js';
import { OLLAMA_URL } from '../config';

const ollamaClient = axios.create({
  baseURL: OLLAMA_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const aiGenerateText = async (prompt: string, mode: string) => {
  const response = await ollamaClient.post('/v1/completions', {
    model: 'llama3',
    prompt: `Generate ${mode} content for: ${prompt}`,
    max_tokens: 400
  });
  return response.data;
};

export const aiChatReply = async (message: string) => {
  const response = await ollamaClient.post('/v1/chat/completions', {
    model: 'llama3',
    messages: [{ role: 'user', content: message }]
  });
  return response.data;
};

export const aiDetectWeakTopics = async (studentId: string) => {
  return ['Algebra', 'History'];
};

export const extractTextFromImage = async (imagePath: string) => {
  const worker = await Tesseract.createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data } = await worker.recognize(imagePath);
  await worker.terminate();
  return data.text;
};

export const summarizePdfText = async (text: string) => {
  return await aiGenerateText(text, 'summary');
};
