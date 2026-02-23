# Alert Configuration Guide

## Overview
The uptime monitoring tool now supports advanced alerting with multiple channels and false positive prevention.

## Features

### 1. **Multi-Channel Alerts**
- ✅ Email (SMTP)
- ✅ SMS (Twilio)
- ✅ Slack
- ✅ Discord
- ✅ Microsoft Teams
- ✅ Telegram
- ✅ Custom Webhooks

### 2. **Rate Limiting** 
- Prevents "alert storms"
- 5-minute cooldown between alerts of the same type
- If a site flickers, only 1 alert is sent, then wait

### 3. **False Positive Prevention**
- **Double-Check Logic**: On failure, a second check is performed after 2 seconds. Only alerts if both fail.
- **Up Confirmation**: Requires 2-3 consecutive successful checks before marking as "Recovered"
- **Configurable Thresholds**: 
  - `failureThreshold`: Number of consecutive failures before alerting (default: 2)
  - `recoveryThreshold`: Number of consecutive successes to mark as recovered (default: 2)

## Environment Setup

### Email Alerts (SMTP)

Add to your `.env` file:

\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Uptime Monitor <your-email@gmail.com>
\`\`\`

**Gmail Setup:**
1. Enable 2FA on your Google account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password in `SMTP_PASS`

### SMS Alerts (Twilio)

Add to your `.env` file:

\`\`\`env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
\`\`\`

**Twilio Setup:**
1. Sign up at https://www.twilio.com
2. Get a phone number
3. Copy Account SID and Auth Token from console

### Slack Alerts

1. Create a Slack Incoming Webhook: https://api.slack.com/messaging/webhooks
2. Configure in the UI per-target (webhook URL field)

### Discord Alerts

1. Create a Discord Webhook in your server settings
2. Configure in the UI per-target (webhook URL field)

### Microsoft Teams Alerts

1. Add "Incoming Webhook" connector to your Teams channel
2. Configure in the UI per-target (webhook URL field)

### Telegram Alerts

1. Create a bot with @BotFather
2. Get your chat ID by messaging your bot and visiting: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Configure Bot Token and Chat ID in the UI per-target

### Custom Webhooks

Configure any custom webhook endpoint that accepts POST requests with this payload:

\`\`\`json
{
  "event": "target.down" | "target.up",
  "timestamp": "2026-02-20T10:30:00.000Z",
  "target": {
    "id": "...",
    "name": "My Website",
    "url": "https://example.com",
    "monitorType": "https"
  },
  "status": "DOWN" | "UP",
  "details": {
    "responseTime": 500,
    "statusCode": 404,
    "errorMessage": "HTTP 404"
  }
}
\`\`\`

## Target Configuration

### Example Target with Alerts

\`\`\`json
{
  "name": "Production API",
  "url": "https://api.example.com",
  "monitorType": "https",
  "interval": 60000,
  "failureThreshold": 2,
  "recoveryThreshold": 3,
  "alertSettings": {
    "email": {
      "enabled": true,
      "addresses": ["admin@example.com", "ops@example.com"]
    },
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/services/..."
    },
    "discord": {
      "enabled": true,
      "webhookUrl": "https://discord.com/api/webhooks/..."
    },
    "webhook": {
      "enabled": true,
      "url": "https://your-api.com/webhook",
      "headers": {
        "Authorization": "Bearer your-token",
        "Content-Type": "application/json"
      }
    }
  }
}
\`\`\`

## How It Works

### False Positive Prevention Flow

1. **First Check**: Monitor performs regular check
   - ✅ If UP → Count consecutive successes
   - ❌ If DOWN → Trigger second check

2. **Second Check** (only if first failed):
   - Wait 2 seconds
   - Perform another check
   - ✅ If UP → Treat as false positive, don't alert
   - ❌ If DOWN → Confirmed failure, proceed

3. **Alert Decision**:
   - **Down Alert**: Send only if `consecutiveFailures >= failureThreshold` (default: 2)
   - **Up Alert**: Send only if `consecutiveSuccesses >= recoveryThreshold` (default: 2)

4. **Rate Limiting**:
   - Track last alert time per target
   - Skip alerts if sent within last 5 minutes
   - Prevents alert spam during outages

### Example Scenarios

**Scenario 1: Temporary Blip**
- Check 1: DOWN (404)
- Wait 2 seconds...
- Check 2: UP (200)
- **Result**: No alert sent ✅ (false positive avoided)

**Scenario 2: Real Outage**
- Check 1: DOWN (connection refused)
- Wait 2 seconds...
- Check 2: DOWN (connection refused)
- Consecutive failures: 1 → 2
- **Result**: Alert sent to all channels 🚨

**Scenario 3: Recovery**
- Previous status: DOWN
- Check 1: UP (200) → consecutive successes: 1
- Check 2: UP (200) → consecutive successes: 2
- **Result**: Recovery alert sent ✅

**Scenario 4: Flapping Site**
- 10:00 - DOWN alert sent
- 10:01 - Still down, but alert skipped (rate limit)
- 10:02 - Still down, alert skipped
- 10:06 - Still down, alert sent (5 min passed)

## Testing Alerts

You can test alerts using these public endpoints:

\`\`\`
✅ Always UP: https://httpbin.org/status/200
❌ Always DOWN: https://httpbin.org/status/500
⏱️ Slow response: https://httpbin.org/delay/5
\`\`\`

## Console Logs

The monitoring service provides detailed logs:

\`\`\`
⚠️ [Double-Check] First check failed for My API, performing second check...
✅ [Double-Check] Second check succeeded for My API - false positive avoided!
🟢 [HTTPS] My API: UP (2/2 for recovery) (150ms) [200]
🚨 [Alert] Sending DOWN alert for My API
✅ [Alert] Sent to: email, slack, discord
⏳ [Alert] Skipping down alert for My API - cooldown active (240s remaining)
\`\`\`

## Recommendations

1. **failureThreshold**: Set to 2-3 to avoid false positives
2. **recoveryThreshold**: Set to 2-3 to confirm stability
3. **interval**: Minimum 30 seconds (faster = more API calls/costs)
4. **Email**: Use for critical alerts
5. **Slack/Discord**: Use for team notifications
6. **SMS**: Use sparingly (costs money per SMS)
7. **Webhooks**: Use for integration with incident management tools

## Troubleshooting

### Alerts Not Sending

1. Check environment variables are set
2. Check console logs for error messages
3. Test SMTP/Twilio credentials separately
4. Verify webhook URLs are accessible
5. Check rate limiting (5 min cooldown)

### Too Many Alerts

1. Increase `failureThreshold` (e.g., 3-5)
2. Increase monitoring `interval` (e.g., 120000ms = 2 minutes)
3. Review site stability

### No Recovery Alerts

1. Check `recoveryThreshold` setting
2. Site must be UP for consecutive checks
3. Check console logs for consecutive success count
