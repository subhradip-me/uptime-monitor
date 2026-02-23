import axios from 'axios';
import nodemailer from 'nodemailer';

class AlertingService {
  constructor() {
    // Rate limiting: Track last alert time per target
    this.lastAlertTime = new Map(); // targetId -> { down: timestamp, up: timestamp }
    this.alertCooldown = 5 * 60 * 1000; // 5 minutes cooldown between alerts
  }

  // Check if we should send an alert (rate limiting)
  shouldSendAlert(targetId, alertType) {
    const now = Date.now();
    const lastAlerts = this.lastAlertTime.get(targetId) || {};
    const lastAlertOfType = lastAlerts[alertType] || 0;

    // If last alert of this type was sent less than cooldown period ago, skip
    if (now - lastAlertOfType < this.alertCooldown) {
      console.log(`⏳ [Alert] Skipping ${alertType} alert for ${targetId} - cooldown active (${Math.round((this.alertCooldown - (now - lastAlertOfType)) / 1000)}s remaining)`);
      return false;
    }

    return true;
  }

  // Record that an alert was sent
  recordAlert(targetId, alertType) {
    const lastAlerts = this.lastAlertTime.get(targetId) || {};
    lastAlerts[alertType] = Date.now();
    this.lastAlertTime.set(targetId, lastAlerts);
  }

  // Send alert through all configured channels
  async sendAlert(target, status, details = {}) {
    const targetId = target._id.toString();
    const alertType = status === 'SSL_EXPIRY' ? 'ssl_expiry' : (status === 'DOWN' ? 'down' : 'up');

    // Rate limiting check (but always allow SSL expiry alerts)
    if (status !== 'SSL_EXPIRY' && !this.shouldSendAlert(targetId, alertType)) {
      return { sent: false, reason: 'rate_limited' };
    }

    const alertConfig = target.alertSettings || {};
    const sentChannels = [];
    const failedChannels = [];

    console.log(`🚨 [Alert] Sending ${alertType.toUpperCase()} alert for ${target.name}`);

    // Email alerts
    if (alertConfig.email?.enabled && alertConfig.email?.addresses?.length > 0) {
      try {
        await this.sendEmailAlert(target, status, details, alertConfig.email.addresses);
        sentChannels.push('email');
      } catch (error) {
        console.error(`❌ [Alert] Email failed:`, error.message);
        failedChannels.push('email');
      }
    }

    // SMS alerts (Twilio)
    if (alertConfig.sms?.enabled && alertConfig.sms?.phoneNumbers?.length > 0) {
      try {
        await this.sendSMSAlert(target, status, details, alertConfig.sms.phoneNumbers);
        sentChannels.push('sms');
      } catch (error) {
        console.error(`❌ [Alert] SMS failed:`, error.message);
        failedChannels.push('sms');
      }
    }

    // Slack alerts
    if (alertConfig.slack?.enabled && alertConfig.slack?.webhookUrl) {
      try {
        await this.sendSlackAlert(target, status, details, alertConfig.slack.webhookUrl);
        sentChannels.push('slack');
      } catch (error) {
        console.error(`❌ [Alert] Slack failed:`, error.message);
        failedChannels.push('slack');
      }
    }

    // Discord alerts
    if (alertConfig.discord?.enabled && alertConfig.discord?.webhookUrl) {
      try {
        await this.sendDiscordAlert(target, status, details, alertConfig.discord.webhookUrl);
        sentChannels.push('discord');
      } catch (error) {
        console.error(`❌ [Alert] Discord failed:`, error.message);
        failedChannels.push('discord');
      }
    }

    // Microsoft Teams alerts
    if (alertConfig.teams?.enabled && alertConfig.teams?.webhookUrl) {
      try {
        await this.sendTeamsAlert(target, status, details, alertConfig.teams.webhookUrl);
        sentChannels.push('teams');
      } catch (error) {
        console.error(`❌ [Alert] Teams failed:`, error.message);
        failedChannels.push('teams');
      }
    }

    // Telegram alerts
    if (alertConfig.telegram?.enabled && alertConfig.telegram?.botToken && alertConfig.telegram?.chatId) {
      try {
        await this.sendTelegramAlert(target, status, details, alertConfig.telegram);
        sentChannels.push('telegram');
      } catch (error) {
        console.error(`❌ [Alert] Telegram failed:`, error.message);
        failedChannels.push('telegram');
      }
    }

    // Custom Webhook
    if (alertConfig.webhook?.enabled && alertConfig.webhook?.url) {
      try {
        await this.sendWebhookAlert(target, status, details, alertConfig.webhook);
        sentChannels.push('webhook');
      } catch (error) {
        console.error(`❌ [Alert] Webhook failed:`, error.message);
        failedChannels.push('webhook');
      }
    }

    // Record alert sent
    if (sentChannels.length > 0) {
      this.recordAlert(targetId, alertType);
      console.log(`✅ [Alert] Sent to: ${sentChannels.join(', ')}`);
    }

    return {
      sent: sentChannels.length > 0,
      channels: sentChannels,
      failed: failedChannels
    };
  }

  // Email Alert (using nodemailer)
  async sendEmailAlert(target, status, details, emailAddresses) {
    const isSSLAlert = status === 'SSL_EXPIRY';
    const emoji = isSSLAlert ? '🔒⚠️' : (status === 'UP' ? '✅' : '🔴');
    const subject = isSSLAlert 
      ? `${emoji} SSL Certificate Expiring Soon - ${target.name}`
      : `${emoji} ${target.name} is ${status}`;
    
    const body = isSSLAlert ? `
      <h2>${emoji} SSL Certificate Alert: ${target.name}</h2>
      <p><strong>URL:</strong> ${target.url}</p>
      <p><strong>Alert:</strong> SSL Certificate Expiring Soon</p>
      ${details.errorMessage ? `<p>${details.errorMessage.replace(/\n/g, '<br>')}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p style="margin-top: 20px; padding: 10px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
        <strong>⚠️ Action Required:</strong> Please renew your SSL certificate before it expires to avoid service disruption.
      </p>
    ` : `
      <h2>${emoji} Alert: ${target.name} is ${status}</h2>
      <p><strong>URL:</strong> ${target.url}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Response Time:</strong> ${details.responseTime || 'N/A'}ms</p>
      <p><strong>Status Code:</strong> ${details.statusCode || 'N/A'}</p>
      ${details.errorMessage ? `<p><strong>Error:</strong> ${details.errorMessage}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Monitor Type:</strong> ${target.monitorType.toUpperCase()}</p>
    `;

    // Configure email transport (using environment variables)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: emailAddresses.join(', '),
      subject,
      html: body
    });
  }

  // SMS Alert (using Twilio)
  async sendSMSAlert(target, status, details, phoneNumbers) {
    const emoji = status === 'UP' ? '✅' : '🔴';
    const message = `${emoji} ${target.name} is ${status}. URL: ${target.url}. Time: ${new Date().toLocaleTimeString()}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    for (const toNumber of phoneNumbers) {
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          From: fromNumber,
          To: toNumber,
          Body: message
        }),
        {
          auth: {
            username: accountSid,
            password: authToken
          }
        }
      );
    }
  }

  // Slack Alert
  async sendSlackAlert(target, status, details, webhookUrl) {
    const isSSLAlert = status === 'SSL_EXPIRY';
    const emoji = isSSLAlert ? ':lock::warning:' : (status === 'UP' ? ':white_check_mark:' : ':red_circle:');
    const color = isSSLAlert ? 'warning' : (status === 'UP' ? 'good' : 'danger');
    const title = isSSLAlert ? 'SSL Certificate Expiring Soon' : status;

    const fields = isSSLAlert ? [
      { title: 'URL', value: target.url, short: true },
      { title: 'Alert Type', value: 'SSL Certificate Expiry', short: true },
      { title: 'Time', value: new Date().toLocaleString(), short: true }
    ] : [
      { title: 'URL', value: target.url, short: true },
      { title: 'Status', value: status, short: true },
      { title: 'Response Time', value: `${details.responseTime || 'N/A'}ms`, short: true },
      { title: 'Status Code', value: details.statusCode || 'N/A', short: true },
      { title: 'Monitor Type', value: target.monitorType.toUpperCase(), short: true },
      { title: 'Time', value: new Date().toLocaleString(), short: true }
    ];

    await axios.post(webhookUrl, {
      text: `${emoji} *${target.name}* ${isSSLAlert ? '- SSL Certificate Expiring' : 'is ' + status}`,
      attachments: [
        {
          color,
          fields,
          ...(details.errorMessage && { footer: `Error: ${details.errorMessage}` })
        }
      ]
    });
  }

  // Discord Alert
  async sendDiscordAlert(target, status, details, webhookUrl) {
    const emoji = status === 'UP' ? '✅' : '🔴';
    const color = status === 'UP' ? 0x00ff00 : 0xff0000;

    await axios.post(webhookUrl, {
      embeds: [
        {
          title: `${emoji} ${target.name} is ${status}`,
          description: `Monitor alert for ${target.url}`,
          color,
          fields: [
            { name: 'URL', value: target.url, inline: true },
            { name: 'Status', value: status, inline: true },
            { name: 'Response Time', value: `${details.responseTime || 'N/A'}ms`, inline: true },
            { name: 'Status Code', value: `${details.statusCode || 'N/A'}`, inline: true },
            { name: 'Monitor Type', value: target.monitorType.toUpperCase(), inline: true },
            ...(details.errorMessage ? [{ name: 'Error', value: details.errorMessage }] : [])
          ],
          timestamp: new Date().toISOString()
        }
      ]
    });
  }

  // Microsoft Teams Alert
  async sendTeamsAlert(target, status, details, webhookUrl) {
    const emoji = status === 'UP' ? '✅' : '🔴';
    const color = status === 'UP' ? '00ff00' : 'ff0000';

    await axios.post(webhookUrl, {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: `${target.name} is ${status}`,
      themeColor: color,
      title: `${emoji} ${target.name} is ${status}`,
      sections: [
        {
          facts: [
            { name: 'URL', value: target.url },
            { name: 'Status', value: status },
            { name: 'Response Time', value: `${details.responseTime || 'N/A'}ms` },
            { name: 'Status Code', value: `${details.statusCode || 'N/A'}` },
            { name: 'Monitor Type', value: target.monitorType.toUpperCase() },
            { name: 'Time', value: new Date().toLocaleString() },
            ...(details.errorMessage ? [{ name: 'Error', value: details.errorMessage }] : [])
          ]
        }
      ]
    });
  }

  // Telegram Alert
  async sendTelegramAlert(target, status, details, config) {
    const emoji = status === 'UP' ? '✅' : '🔴';
    const message = `
${emoji} *${target.name}* is ${status}

*URL:* ${target.url}
*Status:* ${status}
*Response Time:* ${details.responseTime || 'N/A'}ms
*Status Code:* ${details.statusCode || 'N/A'}
*Monitor Type:* ${target.monitorType.toUpperCase()}
*Time:* ${new Date().toLocaleString()}
${details.errorMessage ? `\n*Error:* ${details.errorMessage}` : ''}
    `.trim();

    await axios.post(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        chat_id: config.chatId,
        text: message,
        parse_mode: 'Markdown'
      }
    );
  }

  // Custom Webhook Alert
  async sendWebhookAlert(target, status, details, webhookConfig) {
    const payload = {
      event: status === 'DOWN' ? 'target.down' : 'target.up',
      timestamp: new Date().toISOString(),
      target: {
        id: target._id,
        name: target.name,
        url: target.url,
        monitorType: target.monitorType
      },
      status,
      details: {
        responseTime: details.responseTime,
        statusCode: details.statusCode,
        errorMessage: details.errorMessage
      }
    };

    const headers = webhookConfig.headers || {};
    
    await axios.post(webhookConfig.url, payload, {
      headers,
      timeout: 10000
    });
  }
}

export default new AlertingService();
