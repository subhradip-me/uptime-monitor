import express from 'express';
import {
  login,
  register,
  getMe
} from '../controllers/authController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', verifyToken, getMe);

export default router;