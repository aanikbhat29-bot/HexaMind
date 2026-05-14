import express from 'express';
import asyncHandler from 'express-async-handler';
import { authorize } from '../middleware/auth';

const router = express.Router();

router.get('/overview', authorize(['admin']), asyncHandler(async (req, res) => {
  res.json({
    overview: {
      totalUsers: 1200,
      activeClasses: 85,
      flaggedContent: 4,
      reports: []
    }
  });
}));

router.get('/users', authorize(['admin']), asyncHandler(async (req, res) => {
  res.json({ users: [] });
}));

router.get('/reports', authorize(['admin']), asyncHandler(async (req, res) => {
  res.json({ reports: [] });
}));

router.get('/teacher-verification', authorize(['admin']), asyncHandler(async (req, res) => {
  res.json({ verificationRequests: [] });
}));

router.get('/device-sessions', authorize(['admin']), asyncHandler(async (req, res) => {
  res.json({ sessions: [] });
}));

export default router;
