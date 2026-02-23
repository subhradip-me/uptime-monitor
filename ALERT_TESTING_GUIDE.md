# Alert System Testing Guide

## ✅ Alert System is Now Functional!

The alert system has been fully implemented with the following features:

### 🎯 What's Working

1. **Multi-Channel Alerts** ✅
   - Email (SMTP)
   - SMS (Twilio)
   - Slack
   - Discord
   - Microsoft Teams
   - Telegram
   - Custom Webhooks

2. **False Positive Prevention** ✅
   - Double-check on failures (waits 2 seconds, checks again)
   - Consecutive failure tracking (default: 2 failures before alert)
   - Consecutive success tracking (default: 2 successes to mark recovered)
   - Rate limiting (5-minute cooldown between alerts)

3. **UI Features** ✅
   - Alert configuration in Add/Edit modals
   - 🔔 Test Alert button (purple bell icon) for targets with configured alerts
   - Failure/Recovery threshold sliders
   - Collapsible alert settings section

---

## 🧪 How to Test

### Step 1: Configure a Target with Alerts

1. Go to http://localhost:3000/targets
2. Click **"Add Target"** or **Edit** an existing target
3. Fill in basic info (Name, URL, Monitor Type)
4. Scroll down to **"🔔 Alert Settings"** section and click to expand
5. Enable one or more alert channels:

#### Option A: Slack (Easiest to test)
- ✅ Enable Slack
- Paste webhook URL: Get from https://api.slack.com/messaging/webhooks
- Example: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

#### Option B: Discord
- ✅ Enable Discord  
- Paste webhook URL: Server Settings → Integrations → Webhooks → New Webhook
- Example: `https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz`

#### Option C: Email (Requires SMTP setup)
- ✅ Enable Email
- Add email addresses (comma-separated): `admin@example.com, alerts@example.com`
- Configure SMTP in backend `.env`:
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  SMTP_FROM=Uptime Monitor <your-email@gmail.com>
  ```

6. Click **Save**

### Step 2: Test Immediately with Test Alert Button

1. After saving, you'll see a **🔔 purple bell icon** next to the target actions
2. Click the bell icon
3. An alert popup will show:
   - ✅ Success: "Test alert sent! Channels: slack, discord..."
   - ⏳ Rate-limited: "Alert was rate-limited" (if you just sent one)
   - ❌ Error: Check backend console logs

4. **Check your alert channels!**
   - Slack: Check the configured channel
   - Discord: Check the configured channel
   - Email: Check your inbox

### Step 3: Test with Real Monitoring (DOWN Alert)

1. Edit a target and change URL to something that will fail:
   - `https://httpbin.org/status/500` (always returns 500 error)
   - `https://this-site-definitely-does-not-exist-12345.com` (connection error)

2. Set **Failure Threshold** to `1` (alert after just 1 failure for faster testing)
3. Set **Check Interval** to `30 seconds` (faster than 1 minute)
4. Save and wait

5. Watch backend console logs:
   ```
   🌐 [HTTPS] Requesting: https://httpbin.org/status/500
   ⚠️ [Double-Check] First check failed, performing second check...
   ❌ [Double-Check] Second check also failed - confirmed down
   🔴 [HTTPS] Test Site: DOWN (1/1 for alert) (150ms) [500]
   🚨 [Alert] Sending DOWN alert for Test Site
   ✅ [Alert] Sent to: slack, discord
   ```

6. **Check your alert channels again!** You should receive a DOWN alert with:
   - Target name
   - URL
   - Status (DOWN)
   - Response time
   - Status code or error message
   - Timestamp

### Step 4: Test Recovery Alert (UP Alert)

1. Edit the same target
2. Change URL back to something working: `https://www.google.com`
3. Set **Recovery Threshold** to `2` 
4. Save and wait

5. Watch backend console:
   ```
   🌐 [HTTPS] Requesting: https://www.google.com
   🟢 [HTTPS] Test Site: UP (1/2 for recovery) (150ms) [200]
   🟢 [HTTPS] Test Site: UP (2/2 for recovery) (145ms) [200]
   🚨 [Alert] Sending UP alert for Test Site
   ✅ [Alert] Sent to: slack, discord
   ```

6. **Check your alert channels!** You should receive an UP/Recovered alert

### Step 5: Test Rate Limiting

1. Click the 🔔 test alert button multiple times quickly
2. First click: Alert sent ✅
3. Second click (within 5 minutes): 
   ```
   ⏳ [Alert] Skipping down alert - cooldown active (280s remaining)
   ```
4. Alert popup will say "Alert was rate-limited"

---

## 🔍 Backend Console Logs

You'll see detailed logs showing exactly what's happening:

### Normal Check (UP)
```
🔍 [Monitoring] Checking www.google.com (Type: https)
🌐 [HTTPS] Requesting: https://www.google.com
🟢 [HTTPS] www.google.com: UP (2/2 for recovery) (150ms) [200]
```

### First Failure (Double-Check)
```
🔍 [Monitoring] Checking My API (Type: https)
🌐 [HTTPS] Requesting: https://my-api.com/health
⚠️ [Double-Check] First check failed for My API, performing second check...
🌐 [HTTPS] Requesting: https://my-api.com/health
✅ [Double-Check] Second check succeeded - false positive avoided!
🟢 [HTTPS] My API: UP (1/2 for recovery) (200ms) [200]
```

### Confirmed Failure (Alert)
```
⚠️ [Double-Check] First check failed for My API, performing second check...
❌ [Double-Check] Second check also failed - confirmed down
🔴 [HTTPS] My API: DOWN (2/2 for alert) (500ms) [500]
🚨 [Alert] Sending DOWN alert for My API
✅ [Alert] Sent to: slack, email
❌ [Alert] Discord failed: Invalid webhook URL
```

### Rate Limited
```
🚨 [Alert] Sending DOWN alert for My API
⏳ [Alert] Skipping down alert for My API - cooldown active (245s remaining)
```

---

## 📧 Alert Message Examples

### Slack/Discord
```
🔴 My API is DOWN

URL: https://my-api.com
Status: DOWN
Response Time: 500ms
Status Code: 500
Monitor Type: HTTPS
Time: 2/21/2026, 3:45:30 PM

Error: HTTP 500
```

### Email
```
Subject: 🔴 My API is DOWN

🔴 Alert: My API is DOWN

URL: https://my-api.com
Status: DOWN
Response Time: 500ms
Status Code: 500
Error: HTTP 500
Time: February 21, 2026, 3:45:30 PM
Monitor Type: HTTPS
```

---

## 🐛 Troubleshooting

### "Alert was rate-limited"
- Wait 5 minutes between test alerts
- Or restart backend to reset rate limit cache

### "No channels configured"
- Make sure you enabled at least one alert channel
- Check that webhook URLs are valid
- Verify email addresses are correct

### "Failed to send to [channel]"
Backend console will show specific errors:
```
❌ [Alert] Slack failed: Invalid webhook URL
❌ [Alert] Email failed: Invalid login: 535-5.7.8 Username and Password not accepted
❌ [Alert] Discord failed: 404 Not Found
```

Fix the configuration and try again.

### Alerts not sending during monitoring
- Check **Failure Threshold** - default is 2, so it needs 2 consecutive failures
- Check backend console for `🚨 [Alert]` messages
- Verify target has `alertSettings` configured (edit and re-save)

---

## 🎯 Quick Test Checklist

- [ ] Add target with Slack webhook
- [ ] Click 🔔 test alert button
- [ ] Receive test alert in Slack ✅
- [ ] Change URL to failing endpoint
- [ ] Wait for 2 checks (see DOWN alert)
- [ ] Receive DOWN alert in Slack ✅
- [ ] Change URL back to working
- [ ] Wait for 2 checks (see UP alert)
- [ ] Receive UP/Recovered alert in Slack ✅
- [ ] Try test button again (should be rate-limited) ⏳

---

## 🚀 Production Recommendations

1. **Email**: Use SendGrid or AWS SES for better deliverability
2. **SMS**: Twilio is reliable but costs per SMS
3. **Slack/Discord**: Free and instant - great for teams
4. **Failure Threshold**: Set to 2-3 to avoid false positives
5. **Recovery Threshold**: Set to 2-3 to confirm stability
6. **Check Interval**: 60 seconds minimum (30 seconds for critical services)
7. **Rate Limiting**: Current 5 minutes is good to prevent spam

---

## ✅ System Status

- ✅ Backend monitoring service running
- ✅ Alert service loaded
- ✅ Frontend with alert configuration UI
- ✅ Test alert endpoint: `POST /alerts/test/:targetId`
- ✅ Double-check logic active
- ✅ Rate limiting active (5 min cooldown)
- ✅ All 7 alert channels implemented

**The alert system is fully functional and ready for production use!** 🎉
