import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  approveOrder,
  getOrderStats
} from '../controllers/orderController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { orderValidation, validateRequest } from '../middleware/validation.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Middleware to parse JSON strings in FormData
const parseFormDataJSON = (req, res, next) => {
  try {
    console.log('📦 Raw request body:', req.body);
    
    if (req.body.items && typeof req.body.items === 'string') {
      req.body.items = JSON.parse(req.body.items);
      console.log('✅ Parsed items:', req.body.items);
    }
    if (req.body.customer && typeof req.body.customer === 'string') {
      req.body.customer = JSON.parse(req.body.customer);
      console.log('✅ Parsed customer:', req.body.customer);
    }
    
    console.log('📋 Final request body:', req.body);
    next();
  } catch (error) {
    console.error('❌ JSON parse error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      error: error.message
    });
  }
};

// Public routes
router.post('/', upload.single('paymentProof'), parseFormDataJSON, orderValidation, validateRequest, createOrder);

// Protected admin routes
router.get('/', authenticateToken, isAdmin, getAllOrders);
router.get('/stats', authenticateToken, isAdmin, getOrderStats);
router.get('/:id', authenticateToken, isAdmin, getOrderById);
router.put('/:id/approve', authenticateToken, isAdmin, approveOrder);

export default router;
