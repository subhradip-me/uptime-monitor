import express from 'express';
import {
  getTargetLogs,
  getAllRecentLogs,
  getSystemStats
} from '../controllers/logController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Log routes
router.get('/recent', getAllRecentLogs);
router.get('/stats', getSystemStats);
router.get('/:targetId', getTargetLogs);

export default router;