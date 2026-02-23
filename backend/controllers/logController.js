import Log from '../models/Log.js';

// Get logs for a specific target
export const getTargetLogs = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { 
      limit = 100, 
      page = 1, 
      status,
      startDate,
      endDate
    } = req.query;

    // Build query filter
    const filter = { targetId };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get logs with pagination
    const logs = await Log.find(filter)
      .populate('targetId', 'url name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalLogs = await Log.countDocuments(filter);
    
    // Calculate stats
    const stats = await Log.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalChecks: { $sum: 1 },
          upChecks: {
            $sum: { $cond: [{ $eq: ['$status', 'UP'] }, 1, 0] }
          },
          downChecks: {
            $sum: { $cond: [{ $eq: ['$status', 'DOWN'] }, 1, 0] }
          },
          errorChecks: {
            $sum: { $cond: [{ $eq: ['$status', 'ERROR'] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const logStats = stats[0] || {
      totalChecks: 0,
      upChecks: 0,
      downChecks: 0,
      errorChecks: 0,
      avgResponseTime: 0
    };

    res.json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalLogs / parseInt(limit)),
        totalLogs,
        limit: parseInt(limit)
      },
      stats: {
        ...logStats,
        uptimePercentage: logStats.totalChecks > 0 
          ? Math.round((logStats.upChecks / logStats.totalChecks) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
};

// Get recent logs across all targets
export const getAllRecentLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await Log.find()
      .populate('targetId', 'url name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent logs',
      error: error.message
    });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    // Get overall stats from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stats = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: twentyFourHoursAgo }
        }
      },
      {
        $group: {
          _id: '$targetId',
          totalChecks: { $sum: 1 },
          upChecks: {
            $sum: { $cond: [{ $eq: ['$status', 'UP'] }, 1, 0] }
          },
          downChecks: {
            $sum: { $cond: [{ $eq: ['$status', 'DOWN'] }, 1, 0] }
          },
          errorChecks: {
            $sum: { $cond: [{ $eq: ['$status', 'ERROR'] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' },
          lastCheck: { $max: '$timestamp' }
        }
      }
    ]);

    // Calculate overall stats
    const overallStats = stats.reduce((acc, stat) => {
      acc.totalChecks += stat.totalChecks;
      acc.upChecks += stat.upChecks;
      acc.downChecks += stat.downChecks;
      acc.errorChecks += stat.errorChecks;
      acc.avgResponseTime = (acc.avgResponseTime + stat.avgResponseTime) / 2;
      return acc;
    }, {
      totalChecks: 0,
      upChecks: 0,
      downChecks: 0,
      errorChecks: 0,
      avgResponseTime: 0
    });

    overallStats.uptimePercentage = overallStats.totalChecks > 0
      ? Math.round((overallStats.upChecks / overallStats.totalChecks) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        last24Hours: overallStats,
        perTarget: stats,
        totalTargets: stats.length
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system stats',
      error: error.message
    });
  }
};