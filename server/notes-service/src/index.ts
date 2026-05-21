import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '20mb' }));

app.use((req: any, res: any, next: any) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

const PORT = Number(process.env.PORT || 4004);
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const LOCAL_IP = process.env.LOCAL_IP || '192.168.1.37';
const PUBLIC_HOST = process.env.PUBLIC_HOST || `http://${LOCAL_IP}:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ai-edu-platform';
const client = new MongoClient(MONGODB_URI);
const upload = multer({ storage: multer.memoryStorage() });

const connect = async () => {
  await client.connect();
  console.log('Notes service connected to MongoDB');
};

const notes = client.db('ai_edu').collection('notes');

app.post('/api/notes', upload.single('file'), asyncHandler(async (req, res) => {
  const { title, description, course, author } = req.body;
  const note = {
    title,
    description,
    course,
    author,
    file: req.file ? { originalname: req.file.originalname, size: req.file.size } : null,
    createdAt: new Date()
  };
  const result = await notes.insertOne(note);
  res.status(201).json({ id: result.insertedId.toString(), note });
}));

app.get('/api/notes', asyncHandler(async (req, res) => {
  const items = await notes.find().sort({ createdAt: -1 }).toArray();
  res.json({ notes: items });
}));

app.get('/api/notes/:id', asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const note = await notes.findOne({ _id: new ObjectId(id) });
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  res.json({ note });
}));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'notes-service', uptime: process.uptime(), time: new Date().toISOString() }));

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error in notes-service:', err?.message || err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, BIND_HOST, async () => {
  await connect();
  console.log(`Notes service running on http://${LOCAL_IP}:${PORT}`);
});
