import express from 'express';
import {
  addTarget,
  getAllTargets,
  getTarget,
  updateTarget,
  deleteTarget,
  manualPing,
  pauseTarget,
  resumeTarget
} from '../controllers/targetController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Target management routes
router.post('/', addTarget);
router.get('/', getAllTargets);
router.get('/:id', getTarget);
router.put('/:id', updateTarget);
router.delete('/:id', deleteTarget);

// Manual ping route
router.post('/:id/ping', manualPing);

// Pause/Resume routes
router.post('/:id/pause', pauseTarget);
router.post('/:id/resume', resumeTarget);

export default router;