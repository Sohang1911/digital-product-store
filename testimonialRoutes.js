import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController.js';

const router = express.Router();

// Public routes
router.get('/', getAllTestimonials);

// Protected routes (admin only)
router.post('/', authenticateToken, createTestimonial);
router.put('/:id', authenticateToken, updateTestimonial);
router.delete('/:id', authenticateToken, deleteTestimonial);

export default router;
