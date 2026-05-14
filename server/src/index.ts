import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import teacherRoutes from './routes/teacher';
import studentRoutes from './routes/student';
import adminRoutes from './routes/admin';
import parentRoutes from './routes/parent';
import communityRoutes from './routes/community';
import notificationsRoutes from './routes/notifications';
import { authenticate } from './middleware/auth';
import { connectDatabase } from './services/database';

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'AI Education Platform API ready' });
});

app.use('/api/auth', authRoutes);
app.use('/api/teacher', authenticate, teacherRoutes);
app.use('/api/student', authenticate, studentRoutes);
app.use('/api/admin', authenticate, adminRoutes);
app.use('/api/parent', authenticate, parentRoutes);
app.use('/api/community', authenticate, communityRoutes);
app.use('/api/notifications', authenticate, notificationsRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-room', (room) => socket.join(room));
  socket.on('send-message', (payload) => {
    io.to(payload.room).emit('receive-message', payload);
  });
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const start = async () => {
  await connectDatabase();
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
});
