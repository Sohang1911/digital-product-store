import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from '../controllers/productController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { productValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected admin routes
router.post('/', authenticateToken, isAdmin, productValidation, validateRequest, createProduct);
router.put('/:id', authenticateToken, isAdmin, productValidation, validateRequest, updateProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

export default router;
