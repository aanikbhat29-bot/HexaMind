import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

const PORT = Number(process.env.PORT || 4001);
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const LOCAL_IP = process.env.LOCAL_IP || '192.168.1.37';
const PUBLIC_HOST = process.env.PUBLIC_HOST || `http://${LOCAL_IP}:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ai-edu-platform';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const client = new MongoClient(MONGODB_URI);

const connect = async () => {
  await client.connect();
  console.log('Auth service connected to MongoDB');
};

const usersCollection = () => client.db('ai_edu').collection('users');

const createToken = (payload: object) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });


const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization token required' });
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.post('/api/auth/signup', asyncHandler(async (req: any, res: any) => {
  const { email, password, role = 'student', name, studentId } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  const existing = await usersCollection().findOne({ email });
  if (existing) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await usersCollection().insertOne({
    email,
    passwordHash,
    role,
    name: name || '',
    studentId: studentId || null,
    createdAt: new Date(),
    verifiedTeacher: role === 'teacher' ? false : undefined,
    sessions: []
  });

  const user = { id: result.insertedId.toString(), email, role, name: name || '', studentId: studentId || null };
  const token = createToken(user);
  res.status(201).json({ token, user });
}));

app.post('/api/auth/login', asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = await usersCollection().findOne({ email });
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const profile = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    studentId: user.studentId,
    verifiedTeacher: user.verifiedTeacher || false
  };
  const token = createToken(profile);

  await usersCollection().updateOne({ _id: user._id }, {
    $push: { sessions: { loginAt: new Date(), ip: req.ip } }
  } as any);

  res.json({ token, user: profile });
}));

app.get('/api/auth/profile', verifyToken, asyncHandler(async (req: any, res: any) => {
  const email = req.user?.email as string;
  if (!email) {
    res.status(400).json({ message: 'Email query required' });
    return;
  }
  const user = await usersCollection().findOne({ email });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({ profile: { id: user._id.toString(), email: user.email, role: user.role, name: user.name, studentId: user.studentId } });
}));

app.post('/api/auth/verify-teacher', asyncHandler(async (req, res) => {
  const { teacherId, approved } = req.body;
  if (!teacherId) return res.status(400).json({ message: 'Teacher ID is required' });
  const result = await usersCollection().findOneAndUpdate(
    { _id: new ObjectId(teacherId), role: 'teacher' },
    { $set: { verifiedTeacher: !!approved } },
    { returnDocument: 'after' }
  );
  if (!result.value) return res.status(404).json({ message: 'Teacher not found' });
  res.json({ teacher: { id: teacherId, verifiedTeacher: result.value.verifiedTeacher } });
}));

app.listen(PORT, BIND_HOST, async () => {
  await connect();
  console.log(`Auth service running on http://${LOCAL_IP}:${PORT}`);
});
