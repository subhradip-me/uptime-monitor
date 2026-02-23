import axios from 'axios';
import cron from 'node-cron';
import net from 'net';
import dgram from 'dgram';
import https from 'https';
import tls from 'tls';
import Target from '../models/Target.js';
import Log from '../models/Log.js';

class MonitoringService {
  constructor() {
    this.activeJobs = new Map(); // Store active cron jobs
    this.isRunning = false;
  }
  // Pause monitoring for a specific target
  async pauseTarget(targetId) {
    try {
      const target = await Target.findById(targetId);
      if (!target) {
        throw new Error('Target not found');
      }

      target.isPaused = true;
      await target.save();

      // Stop the monitoring job
      this.stopMonitoringTarget(targetId);
      
      console.log(`⏸️  Paused monitoring for target: ${target.name}`);
      return { success: true, message: `Monitoring paused for ${target.name}` };
    } catch (error) {
      console.error('❌ Error pausing target:', error);
      throw error;
    }
  }

  // Resume monitoring for a specific target
  async resumeTarget(targetId) {
    try {
      const target = await Target.findById(targetId);
      if (!target) {
        throw new Error('Target not found');
      }

      target.isPaused = false;
      await target.save();

      // Start monitoring if target is active
      if (target.isActive) {
        this.startMonitoringTarget(target);
      }
      
      console.log(`▶️  Resumed monitoring for target: ${target.name}`);
      return { success: true, message: `Monitoring resumed for ${target.name}` };
    } catch (error) {
      console.error('❌ Error resuming target:', error);
      throw error;
    }
  }
  // Start the monitoring service
  async start() {
    if (this.isRunning) {
      console.log('🔄 Monitoring service is already running');
      return;
    }

    console.log('🚀 Starting monitoring service...');
    this.isRunning = true;

    // Start monitoring all active targets
    await this.initializeTargets();

    // Schedule periodic cleanup of old logs (daily at 2 AM)
    cron.schedule('0 2 * * *', () => {
      this.cleanupOldLogs();
    });

    console.log('✅ Monitoring service started successfully');
  }

  // Initialize monitoring for all active targets
  async initializeTargets() {
    try {
      const targets = await Target.find({ isActive: true, isPaused: { $ne: true } });
      
      for (const target of targets) {
        this.startMonitoringTarget(target);
      }

      console.log(`📊 Initialized monitoring for ${targets.length} targets`);
    } catch (error) {
      console.error('❌ Error initializing targets:', error);
    }
  }

  // Start monitoring a specific target
  startMonitoringTarget(target) {
    console.log(`🚀 [Monitoring Service] Starting monitoring for ${target.name} (Type: ${target.monitorType})`);
    // Stop existing job if any
    this.stopMonitoringTarget(target._id);

    // Convert interval from milliseconds to seconds for cron
    const intervalSeconds = Math.max(50, Math.floor(target.interval / 1000));
    
    // Create cron expression for the interval
    const cronExpression = `*/${intervalSeconds} * * * * *`;

    // Store the target ID, not the target object itself
    const targetId = target._id;

    // Create and start the cron job
    const job = cron.schedule(cronExpression, async () => {
      // Fetch fresh target data from database each time
      const freshTarget = await Target.findById(targetId);
      if (freshTarget && freshTarget.isActive && !freshTarget.isPaused) {
        console.log(`🔍 [Monitoring] Checking ${freshTarget.name} (Type: ${freshTarget.monitorType})`);
        await this.pingTarget(freshTarget);
      }
    }, {
      scheduled: true,
      name: `target-${target._id}`
    });

    this.activeJobs.set(target._id.toString(), job);
    
    console.log(`📡 Started monitoring ${target.name} (${target.url}) [${target.monitorType.toUpperCase()}] every ${intervalSeconds}s`);

    // Perform initial ping with fresh data
    setTimeout(async () => {
      const freshTarget = await Target.findById(targetId);
      if (freshTarget) {
        console.log(`🔍 [Initial Check] ${freshTarget.name} (Type: ${freshTarget.monitorType})`);
        await this.pingTarget(freshTarget);
      }
    }, 1000);
  }

  // Stop monitoring a specific target
  stopMonitoringTarget(targetId) {
    const jobKey = targetId.toString();
    const existingJob = this.activeJobs.get(jobKey);
    
    if (existingJob) {
      existingJob.stop();
      existingJob.destroy();
      this.activeJobs.delete(jobKey);
      console.log(`⏹️ Stopped monitoring target ${targetId}`);
    }
  }

  // Remove target from monitoring (alias for stopMonitoringTarget)
  removeTargetFromMonitoring(targetId) {
    this.stopMonitoringTarget(targetId);
  }

  // Ping a target and record the result with false positive prevention
  async pingTarget(target) {
    // First check
    let result = await this.performCheck(target);
    
    // Double-check logic: If first check fails, do a second check before alerting
    if (result.status === 'DOWN' || result.status === 'ERROR') {
      console.log(`⚠️ [Double-Check] First check failed for ${target.name}, performing second check...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      // Second check
      const secondResult = await this.performCheck(target);
      
      if (secondResult.status === 'UP') {
        console.log(`✅ [Double-Check] Second check succeeded for ${target.name} - false positive avoided!`);
        result = secondResult; // Use the successful result
      } else {
        console.log(`❌ [Double-Check] Second check also failed for ${target.name} - confirmed down`);
      }
    }

    // Update consecutive counts and handle alerting
    await this.handleStatusChange(target, result);

    return result;
  }

  // Perform the actual check based on monitor type
  async performCheck(target) {
    switch (target.monitorType) {
      case 'tcp':
      case 'udp':
        return await this.checkPort(target);
      case 'keyword':
        return await this.checkKeyword(target);
      case 'http':
      case 'https':
      default:
        return await this.checkHttp(target);
    }
  }

  // Handle status changes with consecutive count tracking and alerting
  async handleStatusChange(target, result) {
    const { status, responseTime, statusCode, errorMessage } = result;
    const previousStatus = target.lastStatus;

    // Update consecutive counts
    if (status === 'UP') {
      target.consecutiveSuccesses = (target.consecutiveSuccesses || 0) + 1;
      target.consecutiveFailures = 0;
    } else {
      target.consecutiveFailures = (target.consecutiveFailures || 0) + 1;
      target.consecutiveSuccesses = 0;
    }

    // Check if we should alert
    const shouldAlertDown = 
      status === 'DOWN' && 
      target.consecutiveFailures >= (target.failureThreshold || 2) &&
      previousStatus !== 'DOWN';

    const shouldAlertUp = 
      status === 'UP' && 
      target.consecutiveSuccesses >= (target.recoveryThreshold || 2) &&
      previousStatus === 'DOWN';

    // Import and use alerting service
    if (shouldAlertDown || shouldAlertUp) {
      const alertingService = (await import('./alertingService.js')).default;
      await alertingService.sendAlert(target, status, { responseTime, statusCode, errorMessage });
    }

    // Update target status only after consecutive threshold is met
    if (status === 'UP' && target.consecutiveSuccesses >= (target.recoveryThreshold || 2)) {
      await this.updateTargetStatus(target, status, responseTime);
    } else if ((status === 'DOWN' || status === 'ERROR') && target.consecutiveFailures >= (target.failureThreshold || 2)) {
      await this.updateTargetStatus(target, status, responseTime);
    }

    // Always log the ping result for history
    await this.logPingResult(target._id, status, responseTime, statusCode, errorMessage, target.url);

    // Save consecutive counts
    await Target.findByIdAndUpdate(target._id, {
      consecutiveFailures: target.consecutiveFailures,
      consecutiveSuccesses: target.consecutiveSuccesses
    });

    // Check SSL certificate for HTTPS targets
    if (target.monitorType === 'https' || target.url.startsWith('https://')) {
      const certInfo = await this.checkSSLCertificate(target);
      if (certInfo) {
        // Update certificate info in database
        await Target.findByIdAndUpdate(target._id, {
          certificateInfo: certInfo
        });

        // Check if we should send expiry alert
        await this.checkSSLExpiryAlert(target, certInfo);

        // Log certificate status
        const certEmoji = certInfo.valid ? '🔒' : '⚠️';
        const expiryWarning = certInfo.daysUntilExpiry <= 30 
          ? ` (expires in ${certInfo.daysUntilExpiry} days!)` 
          : '';
        console.log(`${certEmoji} [SSL] ${target.name}: Certificate valid${expiryWarning}`);
      }
    }

    // Log to console
    const emoji = status === 'UP' ? '🟢' : (status === 'DOWN' ? '🔴' : '🟡');
    const consecutiveInfo = status === 'UP' 
      ? `(${target.consecutiveSuccesses}/${target.recoveryThreshold || 2} for recovery)`
      : `(${target.consecutiveFailures}/${target.failureThreshold || 2} for alert)`;
    console.log(`${emoji} [${target.monitorType.toUpperCase()}] ${target.name}: ${status} ${consecutiveInfo} (${responseTime}ms) ${statusCode ? `[${statusCode}]` : ''}`);
  }

  // HTTP/HTTPS monitoring - Check status codes (200-299 = UP)
  async checkHttp(target) {
    const startTime = Date.now();
    let status = 'DOWN';
    let responseTime = null;
    let statusCode = null;
    let errorMessage = null;

    console.log(`🌐 [${target.monitorType.toUpperCase()}] Requesting: ${target.url}`);

    try {
      const response = await axios.get(target.url, {
        timeout: 10000, // 10 second timeout
        validateStatus: () => true, // Accept all status codes
        maxRedirects: 5
      });

      responseTime = Date.now() - startTime;
      statusCode = response.status;
      
      // HTTP/HTTPS: 200-299 = UP, everything else = DOWN
      if (response.status >= 200 && response.status < 300) {
        status = 'UP';
      } else {
        status = 'DOWN';
        errorMessage = `HTTP ${response.status}`;
      }

    } catch (error) {
      responseTime = Date.now() - startTime;
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        status = 'DOWN';
        errorMessage = 'Connection refused or host not found';
      } else if (error.code === 'ETIMEDOUT') {
        status = 'DOWN';
        errorMessage = 'Request timeout';
      } else if (error.response) {
        statusCode = error.response.status;
        status = 'DOWN';
        errorMessage = `HTTP ${error.response.status}`;
      } else {
        status = 'ERROR';
        errorMessage = error.message;
      }
    }

    return { status, responseTime, statusCode, errorMessage };
  }

  // TCP/UDP Port Monitoring - Check if a specific port is open
  async checkPort(target) {
    const startTime = Date.now();
    let status = 'DOWN';
    let responseTime = null;
    let errorMessage = null;

    // Extract hostname and port from target.url or use target.port
    let hostname = target.url;
    let port = target.port;

    // Parse URL if it contains protocol
    try {
      const urlObj = new URL(target.url.startsWith('http') ? target.url : `http://${target.url}`);
      hostname = urlObj.hostname;
      if (!port) {
        port = urlObj.port || (target.monitorType === 'tcp' ? 80 : 53);
      }
    } catch (err) {
      // If URL parsing fails, treat as hostname:port or just hostname
      const parts = target.url.split(':');
      hostname = parts[0];
      if (parts[1] && !port) {
        port = parseInt(parts[1]);
      }
    }

    // Ensure we have a valid port
    if (!port || isNaN(port)) {
      return {
        status: 'ERROR',
        responseTime: 0,
        statusCode: null,
        errorMessage: 'Invalid port number'
      };
    }

    if (target.monitorType === 'tcp') {
      // TCP Port Check
      try {
        await new Promise((resolve, reject) => {
          const socket = new net.Socket();
          const timeout = setTimeout(() => {
            socket.destroy();
            reject(new Error('Connection timeout'));
          }, 10000);

          socket.connect(port, hostname, () => {
            clearTimeout(timeout);
            responseTime = Date.now() - startTime;
            status = 'UP';
            socket.destroy();
            resolve();
          });

          socket.on('error', (err) => {
            clearTimeout(timeout);
            errorMessage = err.message;
            reject(err);
          });
        });
      } catch (error) {
        responseTime = Date.now() - startTime;
        status = 'DOWN';
        errorMessage = errorMessage || error.message;
      }
    } else if (target.monitorType === 'udp') {
      // UDP Port Check (less reliable - we just send a packet and hope for response)
      try {
        await new Promise((resolve, reject) => {
          const client = dgram.createSocket('udp4');
          const message = Buffer.from('ping');
          let responded = false;

          const timeout = setTimeout(() => {
            if (!responded) {
              client.close();
              // UDP is connectionless, so no response might mean it's working
              // We'll consider it UP if we don't get an explicit error
              responseTime = Date.now() - startTime;
              status = 'UP';
              resolve();
            }
          }, 5000);

          client.on('error', (err) => {
            responded = true;
            clearTimeout(timeout);
            errorMessage = err.message;
            client.close();
            // Port unreachable error means port is closed
            if (err.code === 'ECONNREFUSED') {
              status = 'DOWN';
            }
            reject(err);
          });

          client.on('message', () => {
            responded = true;
            clearTimeout(timeout);
            responseTime = Date.now() - startTime;
            status = 'UP';
            client.close();
            resolve();
          });

          client.send(message, 0, message.length, port, hostname, (err) => {
            if (err) {
              responded = true;
              clearTimeout(timeout);
              errorMessage = err.message;
              client.close();
              reject(err);
            }
          });
        });
      } catch (error) {
        responseTime = Date.now() - startTime;
        if (status !== 'UP') {
          status = 'DOWN';
          errorMessage = errorMessage || error.message;
        }
      }
    }

    return { status, responseTime, statusCode: null, errorMessage };
  }

  // Keyword Monitoring - Check if a specific word exists (or is missing) in HTML body
  async checkKeyword(target) {
    const startTime = Date.now();
    let status = 'DOWN';
    let responseTime = null;
    let statusCode = null;
    let errorMessage = null;

    // Validate keyword settings
    if (!target.keyword || !target.keyword.settings || !target.keyword.settings.text) {
      return {
        status: 'ERROR',
        responseTime: 0,
        statusCode: null,
        errorMessage: 'Keyword text not configured'
      };
    }

    const keywordText = target.keyword.settings.text;
    const shouldExist = target.keyword.settings.shouldExist !== false; // default true

    try {
      const response = await axios.get(target.url, {
        timeout: 10000,
        validateStatus: () => true, // Accept all status codes
        maxRedirects: 5,
        responseType: 'text' // Ensure we get text response
      });

      responseTime = Date.now() - startTime;
      statusCode = response.status;
      
      // First check if HTTP request was successful
      if (response.status < 200 || response.status >= 300) {
        status = 'DOWN';
        errorMessage = `HTTP ${response.status} - cannot check keyword`;
      } else {
        // Check for keyword in response body
        const bodyText = String(response.data);
        const keywordFound = bodyText.includes(keywordText);
        
        if (shouldExist) {
          // Keyword SHOULD exist
          if (keywordFound) {
            status = 'UP';
          } else {
            status = 'DOWN';
            errorMessage = `Keyword "${keywordText}" not found in response`;
          }
        } else {
          // Keyword should NOT exist
          if (!keywordFound) {
            status = 'UP';
          } else {
            status = 'DOWN';
            errorMessage = `Keyword "${keywordText}" found (should be absent)`;
          }
        }
      }

    } catch (error) {
      responseTime = Date.now() - startTime;
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        status = 'DOWN';
        errorMessage = 'Connection refused or host not found';
      } else if (error.code === 'ETIMEDOUT') {
        status = 'DOWN';
        errorMessage = 'Request timeout';
      } else if (error.response) {
        statusCode = error.response.status;
        status = 'DOWN';
        errorMessage = `HTTP ${error.response.status}`;
      } else {
        status = 'ERROR';
        errorMessage = error.message;
      }
    }

    return { status, responseTime, statusCode, errorMessage };
  }

  // SSL Certificate Check - Get certificate info and calculate expiry
  async checkSSLCertificate(target) {
    // Only check SSL for https URLs
    if (target.monitorType !== 'https' && !target.url.startsWith('https://')) {
      return null;
    }

    try {
      // Parse URL to get hostname and port
      const urlObj = new URL(target.url);
      const hostname = urlObj.hostname;
      const port = urlObj.port || 443;

      return new Promise((resolve, reject) => {
        const socket = tls.connect(port, hostname, { 
          servername: hostname,
          rejectUnauthorized: false // Accept self-signed certs for monitoring
        }, () => {
          const cert = socket.getPeerCertificate();
          
          if (!cert || !cert.subject) {
            socket.destroy();
            return resolve(null);
          }

          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
          
          const certInfo = {
            valid: now >= validFrom && now <= validTo,
            issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
            validFrom,
            validTo,
            daysUntilExpiry,
            lastChecked: now
          };

          socket.destroy();
          resolve(certInfo);
        });

        socket.on('error', (err) => {
          console.error(`SSL check error for ${hostname}:`, err.message);
          resolve(null);
        });

        socket.setTimeout(10000, () => {
          socket.destroy();
          resolve(null);
        });
      });
    } catch (error) {
      console.error(`SSL certificate check failed for ${target.url}:`, error.message);
      return null;
    }
  }

  // Check if SSL certificate expiry alert should be sent
  async checkSSLExpiryAlert(target, certInfo) {
    if (!certInfo || !target.sslCheck?.enabled) {
      return;
    }

    const alertDays = target.sslCheck.alertDays || [30, 14, 7];
    const daysUntilExpiry = certInfo.daysUntilExpiry;
    const lastAlertDay = target.sslCheck.lastAlertDay;

    // Find the highest alert threshold that we've crossed
    let shouldAlert = false;
    let alertDay = null;

    for (const day of alertDays.sort((a, b) => b - a)) { // Sort descending
      if (daysUntilExpiry <= day) {
        // Only alert if we haven't already alerted for this threshold or a lower one
        if (!lastAlertDay || day < lastAlertDay) {
          shouldAlert = true;
          alertDay = day;
          break;
        }
      }
    }

    if (shouldAlert) {
      const alertingService = (await import('./alertingService.js')).default;
      
      const emoji = daysUntilExpiry <= 7 ? '🔴' : daysUntilExpiry <= 14 ? '🟡' : '🟠';
      const urgency = daysUntilExpiry <= 7 ? 'URGENT' : 'WARNING';
      
      await alertingService.sendAlert(target, 'SSL_EXPIRY', {
        responseTime: null,
        statusCode: null,
        errorMessage: `${emoji} ${urgency}: SSL certificate expires in ${daysUntilExpiry} days!\n\nIssuer: ${certInfo.issuer}\nExpires: ${certInfo.validTo.toLocaleString()}\n\nPlease renew the certificate soon.`
      });

      // Update last alert day
      await Target.findByIdAndUpdate(target._id, {
        'sslCheck.lastAlertDay': alertDay
      });

      console.log(`${emoji} [SSL] ${target.name}: Certificate expires in ${daysUntilExpiry} days - alert sent`);
    }
  }

  // Update target with latest status and response time
  async updateTargetStatus(target, status, responseTime) {
    try {
      // Re-fetch the target to ensure it still exists in the database
      const existingTarget = await Target.findById(target._id);
      if (!existingTarget) {
        console.warn(`⚠️  Target ${target.name} (${target._id}) no longer exists, removing from monitoring`);
        this.removeTargetFromMonitoring(target._id);
        return;
      }

      const isUp = status === 'UP';
      
      // Increment counters
      existingTarget.totalChecks += 1;
      if (isUp) {
        existingTarget.successfulChecks += 1;
      }

      // Update target properties
      existingTarget.lastStatus = status;
      existingTarget.lastChecked = new Date();
      existingTarget.responseTime = responseTime;

      // Update uptime percentage
      existingTarget.updateUptimePercentage();

      await existingTarget.save();
      
      // Emit real-time update via Socket.IO
      if (global.io) {
        global.io.emit('target:updated', {
          _id: existingTarget._id,
          lastStatus: existingTarget.lastStatus,
          lastChecked: existingTarget.lastChecked,
          responseTime: existingTarget.responseTime,
          uptimePercentage: existingTarget.uptimePercentage,
          totalChecks: existingTarget.totalChecks,
          successfulChecks: existingTarget.successfulChecks
        });
      }
    } catch (error) {
      if (error.name === 'DocumentNotFoundError' || error.message.includes('No document found')) {
        console.warn(`⚠️  Target ${target.name} (${target._id}) was deleted, removing from monitoring`);
        this.removeTargetFromMonitoring(target._id);
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  // Log ping result to database
  async logPingResult(targetId, status, responseTime, statusCode, errorMessage, url) {
    const log = new Log({
      targetId,
      status,
      responseTime,
      statusCode,
      errorMessage,
      url,
      timestamp: new Date()
    });

    const savedLog = await log.save();
    
    // Populate the target info for the log
    const populatedLog = await Log.findById(savedLog._id).populate('targetId', 'name url monitorType');
    
    // Emit real-time log update via Socket.IO
    if (global.io) {
      global.io.emit('log:new', populatedLog);
    }
  }

  // Add a new target to monitoring
  async addTarget(target) {
    if (target.isActive && this.isRunning) {
      this.startMonitoringTarget(target);
    }
  }

  // Update target monitoring
  async updateTarget(target) {
    console.log(`🔄 [Monitoring Service] Updating target: ${target.name}, Type: ${target.monitorType}, Active: ${target.isActive}`);
    if (target.isActive && this.isRunning) {
      console.log(`🔄 [Monitoring Service] Restarting monitoring for ${target.name}`);
      this.startMonitoringTarget(target); // This will restart with new settings
    } else {
      console.log(`⏹️ [Monitoring Service] Stopping monitoring for ${target.name}`);
      this.stopMonitoringTarget(target._id);
    }
  }

  // Remove target from monitoring
  async removeTarget(targetId) {
    this.stopMonitoringTarget(targetId);
  }

  // Clean up old logs (keep last 30 days)
  async cleanupOldLogs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Log.deleteMany({
        timestamp: { $lt: thirtyDaysAgo }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old log entries`);
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error);
    }
  }

  // Stop the entire monitoring service
  stop() {
    if (!this.isRunning) {
      console.log('⏹️ Monitoring service is not running');
      return;
    }

    console.log('🛑 Stopping monitoring service...');

    // Stop all active jobs
    for (const [targetId, job] of this.activeJobs) {
      job.stop();
      job.destroy();
    }

    this.activeJobs.clear();
    this.isRunning = false;

    console.log('✅ Monitoring service stopped');
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTargets: this.activeJobs.size,
      monitoredTargets: Array.from(this.activeJobs.keys())
    };
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Export the service and individual functions
export default monitoringService;
export const { pingTarget } = monitoringService;