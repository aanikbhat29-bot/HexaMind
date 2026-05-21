import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

app.use((req: any, res: any, next: any) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

const PORT = Number(process.env.PORT || 4006);
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const LOCAL_IP = process.env.LOCAL_IP || '192.168.1.37';
const PUBLIC_HOST = process.env.PUBLIC_HOST || `http://${LOCAL_IP}:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ai-edu-platform';
const client = new MongoClient(MONGODB_URI);

const connect = async () => {
  await client.connect();
  console.log('Notification service connected to MongoDB');
};

const notifications = client.db('ai_edu').collection('notifications');

app.post('/api/notifications', asyncHandler(async (req, res) => {
  const { userId, title, body, category } = req.body;
  const notification = { userId, title, body, category: category || 'general', read: false, createdAt: new Date() };
  const result = await notifications.insertOne(notification);
  res.status(201).json({ id: result.insertedId.toString(), notification });
}));

app.get('/api/notifications/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const items = await notifications.find({ userId }).sort({ createdAt: -1 }).toArray();
  res.json({ notifications: items });
}));

app.post('/api/notifications/:id/read', asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const result = await notifications.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { read: true } },
    { returnDocument: 'after' }
  ) as any;
  if (!result?.value) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }
  res.json({ notification: result.value });
}));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'notification-service', uptime: process.uptime(), time: new Date().toISOString() }));

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error in notification-service:', err?.message || err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, BIND_HOST, async () => {
  await connect();
  console.log(`Notification service running on http://${LOCAL_IP}:${PORT}`);
});
