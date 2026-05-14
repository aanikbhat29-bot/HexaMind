import express from 'express';
import asyncHandler from 'express-async-handler';
import { authorize, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authorize(['teacher', 'student', 'parent', 'admin']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    trending: [],
    groups: [],
    recentPosts: []
  });
}));

router.post('/post', authorize(['teacher', 'student']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { title, body, tags } = req.body;
  res.status(201).json({ message: 'Post created', post: { id: `${Date.now()}`, title, body, tags, author: req.user?.email } });
}));

router.post('/comment', authorize(['teacher', 'student', 'parent']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Comment submitted' });
}));

router.get('/groups', authorize(['teacher', 'student', 'parent']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ groups: [] });
}));

export default router;
