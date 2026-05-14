import express from 'express';
import asyncHandler from 'express-async-handler';
import { authorize, AuthenticatedRequest } from '../middleware/auth';
import { aiChatReply, aiDetectWeakTopics } from '../services/aiService';

const router = express.Router();

router.get('/dashboard', authorize(['student']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    dashboard: {
      progress: { completedLessons: 18, streak: 7, xp: 1240 },
      recommendations: ['Smart revision path', 'Weekly challenge', 'AI tutor session'],
      recentResources: [{ title: 'Chemistry Notes' }, { title: 'English Summary' }]
    }
  });
}));

router.get('/materials', authorize(['student']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ materials: [{ id: 'm1', title: 'Algebra PDF', type: 'pdf' }, { id: 'm2', title: 'History Video', type: 'video' }] });
}));

router.post('/doubt', authorize(['student']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { question, attachments } = req.body;
  const answer = await aiChatReply(question);
  res.json({ answer, attachments, confidence: 'high' });
}));

router.get('/planner', authorize(['student']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ planner: [{ date: '2026-05-20', task: 'Physics revision', completed: false }] });
}));

router.get('/weak-topics', authorize(['student']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const weakTopics = await aiDetectWeakTopics(req.user?.id);
  res.json({ weakTopics });
}));

router.get('/achievements', authorize(['student']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ achievements: [{ name: '7 Day Streak', badge: 'streak-7' }] });
}));

router.get('/downloads', authorize(['student']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ downloads: [{ title: 'Math Notes', status: 'available' }] });
}));

export default router;
