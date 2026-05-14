import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '20mb' }));

const PORT = process.env.PORT || 4005;
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const LOCAL_IP = process.env.LOCAL_IP || '192.168.1.37';
const PUBLIC_HOST = process.env.PUBLIC_HOST || `http://${LOCAL_IP}:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ai-edu-platform';
const client = new MongoClient(MONGODB_URI);

const connect = async () => {
  await client.connect();
  console.log('Community service connected to MongoDB');
};

const posts = client.db('ai_edu').collection('community_posts');

app.post('/api/community/posts', asyncHandler(async (req, res) => {
  const { author, title, content, channel, tags = [] } = req.body;
  const post = { author, title, content, channel, tags, likes: 0, comments: [], createdAt: new Date() };
  const result = await posts.insertOne(post);
  res.status(201).json({ id: result.insertedId.toString(), post });
}));

app.get('/api/community/posts', asyncHandler(async (req, res) => {
  const items = await posts.find().sort({ createdAt: -1 }).toArray();
  res.json({ posts: items });
}));

app.post('/api/community/posts/:id/comments', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;
  const result = await posts.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $push: { comments: { author, text, createdAt: new Date() } } },
    { returnDocument: 'after' }
  );
  if (!result.value) return res.status(404).json({ message: 'Post not found' });
  res.json({ post: result.value });
}));

app.post('/api/community/posts/:id/like', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await posts.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { likes: 1 } },
    { returnDocument: 'after' }
  );
  if (!result.value) return res.status(404).json({ message: 'Post not found' });
  res.json({ post: result.value });
}));

app.listen(PORT, BIND_HOST, async () => {
  await connect();
  console.log(`Community service running on http://${LOCAL_IP}:${PORT}`);
});
