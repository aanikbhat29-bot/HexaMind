import express from 'express';
import asyncHandler from 'express-async-handler';
import { authorize, AuthenticatedRequest } from '../middleware/auth';
import { aiGenerateText } from '../services/aiService';

const router = express.Router();

router.get('/dashboard', authorize(['teacher']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    dashboard: {
      classes: [{ id: 'c1', name: 'Physics Batches' }, { id: 'c2', name: 'Math Olympiad' }],
      announcements: [],
      attendanceSummary: { present: 28, absent: 2 },
      performance: { averageScore: 88, engagement: 92 }
    }
  });
}));

router.post('/content', authorize(['teacher']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { title, type, subject, payload } = req.body;
  res.status(201).json({
    message: 'Content uploaded successfully',
    resource: { id: `${Date.now()}`, title, type, subject, payload, createdAt: new Date() }
  });
}));

router.post('/classrooms', authorize(['teacher']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { name, subject, batch } = req.body;
  res.status(201).json({ classroom: { id: `${Date.now()}`, name, subject, batch, createdAt: new Date() } });
}));

router.get('/attendance', authorize(['teacher']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ attendance: [{ student: 'Ria', status: 'Present' }, { student: 'Aman', status: 'Absent' }] });
}));

router.post('/grade', authorize(['teacher']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { studentId, assignmentId, grade, feedback } = req.body;
  res.json({ message: 'Grade submitted', result: { studentId, assignmentId, grade, feedback } });
}));

router.post('/ai/generate', authorize(['teacher']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { prompt, mode } = req.body;
  const generated = await aiGenerateText(prompt, mode);
  res.json({ prompt, mode, generated });
}));

router.get('/leaderboard', authorize(['teacher']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ leaderboard: [{ student: 'Nina', points: 940 }, { student: 'Aarav', points: 890 }] });
}));

export default router;
