import Target from '../models/Target.js';
import Log from '../models/Log.js';

// Add a new target to monitor
export const addTarget = async (req, res) => {
  try {
    const { url, name, interval, monitorType, port, keyword, isActive, alertSettings, failureThreshold, recoveryThreshold } = req.body;

    // Basic validation
    if (!url || !name) {
      return res.status(400).json({
        success: false,
        message: 'URL and name are required'
      });
    }

    // Validate URL format for HTTP/HTTPS types
    if (!monitorType || monitorType === 'http' || monitorType === 'https') {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format. Must start with http:// or https://'
        });
      }
    }

    // Validate port for TCP/UDP
    if ((monitorType === 'tcp' || monitorType === 'udp') && (!port || port < 1 || port > 65535)) {
      return res.status(400).json({
        success: false,
        message: 'Valid port number (1-65535) is required for TCP/UDP monitoring'
      });
    }

    // Validate keyword for keyword monitoring
    if (monitorType === 'keyword' && (!keyword || !keyword.settings || !keyword.settings.text)) {
      return res.status(400).json({
        success: false,
        message: 'Keyword text is required for keyword monitoring'
      });
    }

    // Check if target already exists (same URL and type)
    const existingTarget = await Target.findOne({ url, monitorType: monitorType || 'http' });
    if (existingTarget) {
      return res.status(409).json({
        success: false,
        message: 'Target with this URL and type already exists'
      });
    }

    const targetData = {
      url: url.trim(),
      name: name.trim(),
      interval: interval || 60000,
      monitorType: monitorType || 'http',
      isActive: typeof isActive === 'boolean' ? isActive : true
    };

    // Add port for TCP/UDP
    if (monitorType === 'tcp' || monitorType === 'udp') {
      targetData.port = port;
    }

    // Add keyword for keyword monitoring
    if (monitorType === 'keyword' && keyword) {
      targetData.keyword = keyword;
    }

    // Add alert settings if provided
    if (alertSettings) {
      targetData.alertSettings = alertSettings;
    }

    // Add thresholds if provided
    if (failureThreshold) {
      targetData.failureThreshold = failureThreshold;
    }
    if (recoveryThreshold) {
      targetData.recoveryThreshold = recoveryThreshold;
    }

    const target = new Target(targetData);
    await target.save();

    // Start monitoring if active
    if (target.isActive) {
      try {
        const monitoringService = (await import('../services/monitoringService.js')).default;
        await monitoringService.addTarget(target);
      } catch (error) {
        console.error('Error starting monitoring for new target:', error);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Target added successfully',
      data: target
    });
  } catch (error) {
    console.error('Error adding target:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add target',
      error: error.message
    });
  }
};

// Get all targets
export const getAllTargets = async (req, res) => {
  try {
    const targets = await Target.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: targets.length,
      data: targets
    });
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch targets',
      error: error.message
    });
  }
};

// Get a single target by ID
export const getTarget = async (req, res) => {
  try {
    const { id } = req.params;
    
    const target = await Target.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found'
      });
    }

    res.json({
      success: true,
      data: target
    });
  } catch (error) {
    console.error('Error fetching target:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch target',
      error: error.message
    });
  }
};

// Update a target
export const updateTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, interval, isActive, monitorType, port, keyword, alertSettings, failureThreshold, recoveryThreshold } = req.body;

    const target = await Target.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found'
      });
    }

    // Update fields if provided
    if (name) target.name = name.trim();
    if (url) target.url = url.trim();
    if (interval) target.interval = Math.max(30000, interval); // Minimum 30 seconds
    if (typeof isActive === 'boolean') target.isActive = isActive;
    
    // Update alert settings if provided
    if (alertSettings) {
      target.alertSettings = alertSettings;
    }
    
    // Update thresholds if provided
    if (failureThreshold !== undefined) {
      target.failureThreshold = Math.max(1, failureThreshold);
    }
    if (recoveryThreshold !== undefined) {
      target.recoveryThreshold = Math.max(1, recoveryThreshold);
    }
    
    // Update monitor type
    if (monitorType) {
      console.log(`🔄 Updating monitor type from ${target.monitorType} to ${monitorType}`);
      target.monitorType = monitorType;
      
      // Clear or update type-specific fields
      if (monitorType === 'tcp' || monitorType === 'udp') {
        if (port) {
          target.port = port;
        }
        target.keyword = undefined; // Clear keyword if switching to port monitoring
      } else if (monitorType === 'keyword') {
        if (keyword) {
          target.keyword = keyword;
        }
        target.port = undefined; // Clear port if switching to keyword
      } else {
        // HTTP/HTTPS - clear both port and keyword
        target.port = undefined;
        target.keyword = undefined;
      }
    } else {
      // Monitor type not changed, just update fields if provided
      if (port !== undefined) target.port = port || undefined;
      if (keyword !== undefined) target.keyword = keyword || undefined;
    }

    console.log(`💾 Saving target: ${target.name}, Type: ${target.monitorType}, URL: ${target.url}`);
    await target.save();
    console.log(`✅ Target saved successfully`);

    // Update monitoring service
    try {
      console.log(`🔄 Notifying monitoring service to update target ${target._id}`);
      const monitoringService = (await import('../services/monitoringService.js')).default;
      await monitoringService.updateTarget(target);
    } catch (error) {
      console.error('Error updating monitoring for target:', error);
    }

    res.json({
      success: true,
      message: 'Target updated successfully',
      data: target
    });
  } catch (error) {
    console.error('Error updating target:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update target',
      error: error.message
    });
  }
};

// Delete a target
export const deleteTarget = async (req, res) => {
  try {
    const { id } = req.params;

    const target = await Target.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found'
      });
    }

    // Delete associated logs
    await Log.deleteMany({ targetId: id });
    
    // Stop monitoring before deleting
    try {
      const monitoringService = (await import('../services/monitoringService.js')).default;
      await monitoringService.removeTarget(id);
    } catch (error) {
      console.error('Error stopping monitoring for target:', error);
    }
    
    // Delete the target
    await Target.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Target and associated logs deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting target:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete target',
      error: error.message
    });
  }
};

// Manual ping - for testing purposes
export const manualPing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const target = await Target.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found'
      });
    }

    // Import the monitoring service
    const { pingTarget } = await import('../services/monitoringService.js');
    
    // Perform manual ping
    const result = await pingTarget(target);
    
    res.json({
      success: true,
      message: 'Manual ping completed',
      data: {
        status: result.status,
        responseTime: result.responseTime,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error performing manual ping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform manual ping',
      error: error.message
    });
  }
};

// Pause monitoring for a target
export const pauseTarget = async (req, res) => {
  try {
    const { id } = req.params;

    const target = await Target.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found'
      });
    }

    // Import the monitoring service
    const monitoringService = (await import('../services/monitoringService.js')).default;
    
    const result = await monitoringService.pauseTarget(id);
    
    res.json({
      success: true,
      message: result.message,
      data: await Target.findById(id)
    });
  } catch (error) {
    console.error('Error pausing target:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause target monitoring',
      error: error.message
    });
  }
};

// Resume monitoring for a target
export const resumeTarget = async (req, res) => {
  try {
    const { id } = req.params;

    const target = await Target.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found'
      });
    }

    // Import the monitoring service
    const monitoringService = (await import('../services/monitoringService.js')).default;
    
    const result = await monitoringService.resumeTarget(id);
    
    res.json({
      success: true,
      message: result.message,
      data: await Target.findById(id)
    });
  } catch (error) {
    console.error('Error resuming target:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume target monitoring',
      error: error.message
    });
  }
};