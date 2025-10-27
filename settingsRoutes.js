import express from 'express';
import {
  getPaymentSettings,
  updatePaymentSettings,
  getSiteSettings,
  updateSiteSettings
} from '../controllers/settingsController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/payment', getPaymentSettings);
router.get('/site', getSiteSettings);

// Protected admin routes
router.put('/payment', authenticateToken, isAdmin, upload.single('qrCode'), updatePaymentSettings);
router.put('/site', authenticateToken, isAdmin, updateSiteSettings);

export default router;
