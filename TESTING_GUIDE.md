# Testing the Updated Frontend

## What Was Fixed

### 1. **Form Data Handling** ✅
- Port field now stores value as string and converts to number on submit
- Keyword settings properly initialized with nested structure
- Proper cleanup of unused fields based on monitor type

### 2. **Submit Handlers** ✅
- `handleAddTarget` - Validates and cleans data before sending
- `handleEditTarget` - Properly handles all monitor types
- Port conversion happens at submit time (avoids NaN issues)
- Empty ports are removed from payload
- Empty keywords are removed from payload

### 3. **Error Handling** ✅
- Added user-friendly error alerts
- Shows backend error messages
- Catches and logs errors properly

### 4. **Edit Target** ✅
- Properly loads keyword settings from existing targets
- Handles targets without keyword field
- Port number loaded correctly

## Test Cases

### Test 1: Add HTTP Monitor
```
Name: Google Homepage
Type: HTTP
URL: https://google.com
Interval: 1 minute
```
**Expected**: Creates target with monitorType='http', no port, no keyword

---

### Test 2: Add TCP Port Monitor
```
Name: PostgreSQL Database
Type: TCP
URL: localhost
Port: 5432
Interval: 1 minute
```
**Expected**: Creates target with monitorType='tcp', port=5432

---

### Test 3: Add Keyword Monitor (Exists)
```
Name: Homepage Check
Type: Keyword
URL: https://example.com
Keyword: "Welcome"
Should Exist: ✓ Checked
Interval: 1 minute
```
**Expected**: Creates target with monitorType='keyword', keyword.settings.text='Welcome', keyword.settings.shouldExist=true

---

### Test 4: Add Keyword Monitor (Should NOT Exist)
```
Name: Error Detection
Type: Keyword
URL: https://example.com
Keyword: "Error 500"
Should Exist: ☐ Unchecked
Interval: 1 minute
```
**Expected**: Creates target with monitorType='keyword', keyword.settings.shouldExist=false

---

### Test 5: Edit Existing Target
1. Click Edit on any target
2. Change monitor type from HTTP to TCP
3. Add port number
4. Submit

**Expected**: Updates successfully with new monitor type and port

---

### Test 6: Switch Monitor Types in Form
1. Open Add Target modal
2. Select TCP - enter port
3. Switch to HTTP
4. Submit

**Expected**: Port field hidden, port not sent to backend

---

## How to Test

1. **Start Backend**:
```bash
cd backend
npm start
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Test the Forms**:
   - Navigate to Targets page
   - Click "Add Target"
   - Try each monitor type
   - Verify forms show/hide fields correctly
   - Submit and check network tab for payload

4. **Check Console**:
   - Open browser DevTools
   - Look for errors
   - Check Network tab for API calls

## Data Sent to Backend

### HTTP Monitor
```json
{
  "name": "My Website",
  "url": "https://example.com",
  "monitorType": "http",
  "interval": 60000,
  "isActive": true
}
```

### TCP Monitor
```json
{
  "name": "Database",
  "url": "localhost",
  "monitorType": "tcp",
  "port": 5432,
  "interval": 60000,
  "isActive": true
}
```

### Keyword Monitor
```json
{
  "name": "Content Check",
  "url": "https://example.com",
  "monitorType": "keyword",
  "keyword": {
    "settings": {
      "text": "Welcome",
      "shouldExist": true
    }
  },
  "interval": 60000,
  "isActive": true
}
```

## Known Behaviors

1. **Port Field**: Only shows for TCP/UDP types
2. **Keyword Field**: Only shows for Keyword type
3. **URL vs Hostname**: Label changes based on monitor type
4. **Validation**: Required fields enforced by HTML5
5. **Error Messages**: Displayed via browser alert
6. **Success**: Modal closes, table refreshes automatically

## If Issues Occur

**Port shows as empty after typing**:
- This is fixed - port is stored as string until submit

**Keyword not saving**:
- Make sure keyword text is entered
- Check browser console for errors

**Edit doesn't load existing data**:
- Verify backend is returning full target object
- Check for keyword.settings structure

**Form doesn't submit**:
- Check browser console
- Verify all required fields filled
- Check network tab for API error
