import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import monitoringService from './services/monitoringService.js';
import { initializeDefaultUser } from './services/userService.js';

// Import routes
import targetRoutes from './routes/targets.js';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import alertRoutes from './routes/alerts.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Make io available globally for the monitoring service
global.io = io;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Uptime Monitoring Tool API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/auth/*',
      targets: '/targets/*',
      logs: '/logs/*'
    },
    monitoringService: monitoringService.getStatus()
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/targets', targetRoutes);
app.use('/logs', logRoutes);
app.use('/alerts', alertRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    monitoring: monitoringService.getStatus()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Initialize the application
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize default user if needed
    await initializeDefaultUser();
    
    // Start the monitoring service
    await monitoringService.start();
    
    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 WebSocket server ready`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}`);
      console.log(`📖 Health Check: http://localhost:${PORT}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  monitoringService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  monitoringService.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  monitoringService.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  monitoringService.stop();
  process.exit(1);
});

// Start the application
initializeApp();