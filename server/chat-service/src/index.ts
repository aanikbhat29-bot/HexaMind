import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

app.use((req: any, res: any, next: any) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

const PORT = Number(process.env.PORT || 4003);
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const LOCAL_IP = process.env.LOCAL_IP || '192.168.1.37';
const PUBLIC_HOST = process.env.PUBLIC_HOST || `http://${LOCAL_IP}:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ai-edu-platform';
const client = new MongoClient(MONGODB_URI);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const connect = async () => {
  await client.connect();
  console.log('Chat service connected to MongoDB');
};

const conversations = client.db('ai_edu').collection('conversations');

io.on('connection', (socket) => {
  console.log('Chat connected', socket.id);
  socket.on('join-room', (room) => socket.join(room));
  socket.on('leave-room', (room) => socket.leave(room));
  socket.on('send-message', async (payload) => {
    await conversations.insertOne({ ...payload, createdAt: new Date() });
    io.to(payload.room).emit('receive-message', payload);
  });
  socket.on('typing', (payload) => socket.to(payload.room).emit('typing', payload));
  socket.on('disconnect', () => console.log('Chat disconnected', socket.id));
});

app.get('/api/chat/rooms', asyncHandler(async (req, res) => {
  const rooms = await conversations.distinct('room');
  res.json({ rooms });
}));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'chat-service', uptime: process.uptime(), time: new Date().toISOString() }));

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error in chat-service:', err?.message || err);
  res.status(500).json({ message: 'Internal server error' });
});

app.post('/api/chat/rooms/:room/messages', asyncHandler(async (req, res) => {
  const { room } = req.params;
  const messages = await conversations.find({ room }).sort({ createdAt: 1 }).toArray();
  res.json({ messages });
}));

httpServer.listen(PORT, BIND_HOST, async () => {
  await connect();
  console.log(`Chat service running on http://${LOCAL_IP}:${PORT}`);
});
