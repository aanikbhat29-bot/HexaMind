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

const PORT = process.env.PORT || 4004;
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

app.get('/api/notes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await notes.findOne({ _id: new ObjectId(id) });
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json({ note });
}));

app.listen(PORT, BIND_HOST, async () => {
  await connect();
  console.log(`Notes service running on http://${LOCAL_IP}:${PORT}`);
});
