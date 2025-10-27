import express from 'express';
import { login, updatePassword, verifyToken } from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { loginValidation, updatePasswordValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, validateRequest, login);

// Protected routes
router.get('/verify', authenticateToken, isAdmin, verifyToken);
router.put('/password', authenticateToken, isAdmin, updatePasswordValidation, validateRequest, updatePassword);

export default router;
