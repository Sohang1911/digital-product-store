import express from 'express';
import { getAnalytics, trackVisitor } from '../controllers/analyticsController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/track-visitor', trackVisitor);

// Protected admin routes
router.get('/', authenticateToken, isAdmin, getAnalytics);

export default router;
