import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllDemoVideos,
  createDemoVideo,
  updateDemoVideo,
  deleteDemoVideo
} from '../controllers/demoVideoController.js';

const router = express.Router();

// Public routes
router.get('/', getAllDemoVideos);

// Protected routes (admin only)
router.post('/', authenticateToken, createDemoVideo);
router.put('/:id', authenticateToken, updateDemoVideo);
router.delete('/:id', authenticateToken, deleteDemoVideo);

export default router;
