import express from 'express';
import asyncHandler from 'express-async-handler';
import { authorize, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/dashboard', authorize(['parent']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    dashboard: {
      children: [],
      recentProgress: [],
      alerts: []
    }
  });
}));

router.get('/monitor', authorize(['parent']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ monitor: { attendance: [], assignments: [], performance: [] } });
}));

export default router;
