import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: ALLOWED_ORIGINS?.length ? ALLOWED_ORIGINS : true, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// Basic request logging
app.use((req: any, res: any, next: any) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

const PORT = Number(process.env.PORT || 4001);
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ai-edu-platform';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const client = new MongoClient(MONGODB_URI);

const connect = async () => {
  try {
    await client.connect();
    console.log('Auth service connected to MongoDB');
  } catch (err) {
    console.warn('Could not connect to MongoDB, continuing in degraded mode');
  }
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

// Health endpoint
app.get('/api/health', (req: any, res: any) => {
  res.json({ ok: true, service: 'auth-service', uptime: process.uptime(), time: new Date().toISOString() });
});

// Optional: if SUPABASE configured we will attempt to POST user metadata there (best-effort sync)
const syncToSupabase = async (profile: any) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/users`, profile, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, Prefer: 'resolution=merge-duplicates' }
    });
  } catch (err) {
    console.warn('Supabase sync failed:', (err as any)?.message || err);
  }
};

// SUPABASE auth helpers (optional)
const supabaseSignup = async (email: string, password: string, metadata: any = {}) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase not configured');
  const body = { email, password, user_metadata: metadata };
  const res = await axios.post(`${SUPABASE_URL}/auth/v1/admin/users`, body, {
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' }
  });
  return res.data;
};

const supabaseLogin = async (email: string, password: string) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase anon key not configured');
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('email', email);
  params.append('password', password);
  const res = await axios.post(`${SUPABASE_URL}/auth/v1/token`, params.toString(), {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return res.data; // { access_token, refresh_token, user }
};

app.post('/api/auth/signup', asyncHandler(async (req: any, res: any) => {
  const { email, password, role = 'student', name, studentId } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  // If Supabase is configured, prefer using it for auth
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sup = await supabaseSignup(email, password, { name, role, studentId });
      const uid = sup?.id || `sb-${Date.now()}`;
      const user = { id: uid, email, role, name: name || '', studentId: studentId || null };
      // best-effort local sync
      try { await usersCollection().insertOne({ supabaseId: uid, email, createdAt: new Date() }); } catch (e) { /* ignore */ }
      const token = createToken(user);
      res.status(201).json({ token, user });
      return;
    } catch (err) {
      console.warn('Supabase signup failed, falling back to local', (err as any)?.message || err);
    }
  }

  // Fallback: local Mongo-based signup
  let existing: any = null;
  try { existing = await usersCollection().findOne({ email }); } catch (err) { console.warn('usersCollection unavailable, skipping existing check', (err as any)?.message || err); }
  if (existing) { res.status(409).json({ message: 'User already exists' }); return; }

  const passwordHash = await bcrypt.hash(password, 10);
  let result: any = { insertedId: null };
  try {
    result = await usersCollection().insertOne({
      email,
      passwordHash,
      role,
      name: name || '',
      studentId: studentId || null,
      createdAt: new Date(),
      verifiedTeacher: role === 'teacher' ? false : undefined,
      sessions: []
    });
  } catch (err) { console.warn('Insert to users collection failed, operating with fallback id', (err as any)?.message || err); }

  const userId = result?.insertedId?.toString() || `local-${Date.now()}`;
  const user = { id: userId, email, role, name: name || '', studentId: studentId || null };
  syncToSupabase({ id: user.id, email: user.email, role: user.role, name: user.name, studentId: user.studentId });
  const token = createToken(user);
  res.status(201).json({ token, user });
}));

app.post('/api/auth/login', asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  // If Supabase is configured use it for authentication
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supRes = await supabaseLogin(email, password);
      const supUser = supRes?.user || null;
      if (!supUser) { res.status(401).json({ message: 'Invalid credentials' }); return; }
      const profile = { id: supUser.id, email: supUser.email, role: supUser.user_metadata?.role || 'student', name: supUser.user_metadata?.name || '', studentId: supUser.user_metadata?.studentId || null };
      const token = createToken(profile);
      // best-effort local session record
      try { await usersCollection().updateOne({ email }, { $set: { lastLogin: new Date(), supabaseId: supUser.id } }, { upsert: true } as any); } catch (e) { }
      res.json({ token, user: profile });
      return;
    } catch (err) {
      console.warn('Supabase login failed, falling back to local', (err as any)?.message || err);
    }
  }

  let user: any = null;
  try { user = await usersCollection().findOne({ email }); } catch (err) { console.warn('usersCollection unavailable, cannot lookup user', (err as any)?.message || err); }
  if (!user) { res.status(401).json({ message: 'Invalid credentials' }); return; }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ message: 'Invalid credentials' }); return; }
  const profile = { id: user._id.toString(), email: user.email, role: user.role, name: user.name, studentId: user.studentId, verifiedTeacher: user.verifiedTeacher || false };
  const token = createToken(profile);
  try { await usersCollection().updateOne({ _id: user._id }, { $push: { sessions: { loginAt: new Date(), ip: req.ip } } } as any); } catch (err) { console.warn('Failed to record session for user', (err as any)?.message || err); }
  res.json({ token, user: profile });
}));

app.get('/api/auth/profile', verifyToken, asyncHandler(async (req: any, res: any) => {
  const email = req.user?.email as string;
  if (!email) {
    res.status(400).json({ message: 'Email query required' });
    return;
  }
  let user: any = null;
  try {
    user = await usersCollection().findOne({ email });
  } catch (err) {
    console.warn('usersCollection unavailable, cannot fetch profile');
  }
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({ profile: { id: user._id.toString(), email: user.email, role: user.role, name: user.name, studentId: user.studentId } });
}));

app.post('/api/auth/verify-teacher', asyncHandler(async (req: any, res: any) => {
  const { teacherId, approved } = req.body;
  if (!teacherId) {
    res.status(400).json({ message: 'Teacher ID is required' });
    return;
  }
  let result: any = null;
  try {
    result = await usersCollection().findOneAndUpdate(
      { _id: new ObjectId(teacherId), role: 'teacher' },
      { $set: { verifiedTeacher: !!approved } },
      { returnDocument: 'after' }
    ) as any;
  } catch (err) {
    console.warn('verify-teacher update failed', (err as any)?.message || err);
  }
  if (!result?.value) {
    res.status(404).json({ message: 'Teacher not found' });
    return;
  }
  res.json({ teacher: { id: teacherId, verifiedTeacher: result.value.verifiedTeacher } });
}));

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', (err as any)?.message || err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, BIND_HOST, async () => {
  await connect();
  console.log(`Auth service running on ${BIND_HOST}:${PORT}`);
});
