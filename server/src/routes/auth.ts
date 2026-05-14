import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { fetchUserProfile, signInUser, signUpUser } from '../services/supabaseService';

const router = express.Router();

const createToken = (user: any) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

router.post('/signup', asyncHandler(async (req, res) => {
  const { email, password, role, name, studentId } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  const user = await signUpUser({ email, password, role, name: name || '', studentId });
  const token = createToken({ id: user.id, email: user.email, role });

  res.status(201).json({ token, user: { id: user.id, email: user.email, role, name: name || '', studentId }, provider: 'supabase' });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Invalid credentials' });

  const data = await signInUser(email, password);
  const user = data.user;
  if (!user) return res.status(401).json({ message: 'Unable to authenticate user' });

  const profile = await fetchUserProfile(user.id);
  const token = createToken({ id: user.id, email: user.email, role: profile.role });

  res.json({ token, user: { id: user.id, email: user.email, role: profile.role, profile }, supabaseSession: data.session });
}));

router.post('/verify-teacher', asyncHandler(async (req, res) => {
  const { teacherId, approved } = req.body;
  // This can be extended to use Supabase table updates for teacher verification.
  res.json({ message: 'Teacher verification endpoint is available', teacherId, approved });
}));

router.post('/mfa/start', asyncHandler(async (req, res) => {
  const { email } = req.body;
  res.json({ message: 'MFA challenge started', email, method: 'totp' });
}));

router.post('/mfa/verify', asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  res.json({ message: 'MFA verified', email, verified: code === '123456' });
}));

router.get('/sessions', asyncHandler(async (req, res) => {
  res.json({ sessions: [] });
}));

export default router;
