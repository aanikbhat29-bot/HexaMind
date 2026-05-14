import express from 'express';
import asyncHandler from 'express-async-handler';
import { authorize, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authorize(['teacher', 'student', 'parent', 'admin']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ notifications: [] });
}));

router.post('/send', authorize(['teacher', 'admin']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { title, message, audience } = req.body;
  res.status(201).json({ message: 'Notification queued', payload: { title, message, audience } });
}));

export default router;
