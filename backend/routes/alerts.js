import express from 'express';
import Target from '../models/Target.js';

const router = express.Router();

// Test alert endpoint - manually trigger an alert
router.post('/test/:targetId', async (req, res) => {
  try {
    const { targetId } = req.params;
    const { status } = req.body; // 'UP' or 'DOWN'

    const target = await Target.findById(targetId);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found'
      });
    }

    // Import alerting service
    const alertingService = (await import('../services/alertingService.js')).default;

    // Send test alert
    const result = await alertingService.sendAlert(target, status || 'DOWN', {
      responseTime: 150,
      statusCode: status === 'UP' ? 200 : 500,
      errorMessage: status === 'UP' ? null : 'Test alert triggered manually'
    });

    res.json({
      success: true,
      message: 'Test alert sent',
      result
    });
  } catch (error) {
    console.error('Error sending test alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test alert',
      error: error.message
    });
  }
});

export default router;
