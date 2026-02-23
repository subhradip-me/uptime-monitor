# Monitoring Types Documentation

This uptime monitoring tool now supports multiple monitoring types. Here's how to use each one:

## 1. HTTP/HTTPS Monitoring

**Purpose**: Check if a website returns a successful HTTP status code (200-299 = UP)

**Configuration**:
```json
{
  "name": "My Website",
  "url": "https://example.com",
  "monitorType": "http",  // or "https"
  "interval": 60000
}
```

**How it works**:
- Sends HTTP GET request to the URL
- Status codes 200-299 = UP
- All other status codes = DOWN
- Tracks response time

**Use cases**:
- Website availability monitoring
- API endpoint health checks
- Web service uptime tracking

---

## 2. TCP Port Monitoring

**Purpose**: Check if a specific TCP port is open and accepting connections

**Configuration**:
```json
{
  "name": "PostgreSQL Database",
  "url": "database.example.com",  // or "192.168.1.100"
  "monitorType": "tcp",
  "port": 5432,  // PostgreSQL default port
  "interval": 60000
}
```

**Common TCP Ports**:
- PostgreSQL: 5432
- MySQL: 3306
- MongoDB: 27017
- Redis: 6379
- SMTP: 25, 587
- SSH: 22
- FTP: 21
- Custom application ports

**How it works**:
- Attempts TCP connection to hostname:port
- Connection successful = UP
- Connection refused/timeout = DOWN
- Measures connection time

**Use cases**:
- Database availability monitoring
- Mail server monitoring
- SSH server monitoring
- Custom application port checks

---

## 3. UDP Port Monitoring

**Purpose**: Check if a UDP port is responding (less reliable than TCP)

**Configuration**:
```json
{
  "name": "DNS Server",
  "url": "dns.example.com",
  "monitorType": "udp",
  "port": 53,  // DNS default port
  "interval": 60000
}
```

**Common UDP Ports**:
- DNS: 53
- DHCP: 67, 68
- NTP: 123
- SNMP: 161
- Syslog: 514

**How it works**:
- Sends UDP packet to hostname:port
- No explicit error = UP (UDP is connectionless)
- Port unreachable error = DOWN
- Response received = UP

**Note**: UDP monitoring is less reliable because UDP is connectionless. A lack of response doesn't always mean the service is down.

**Use cases**:
- DNS server monitoring
- Game server monitoring
- VoIP service monitoring

---

## 4. Keyword Monitoring

**Purpose**: Check if a specific word/phrase exists (or is missing) in the HTML response

**Configuration - Keyword SHOULD exist**:
```json
{
  "name": "Website Content Check",
  "url": "https://example.com",
  "monitorType": "keyword",
  "keyword": {
    "settings": {
      "text": "Welcome",
      "shouldExist": true  // default
    }
  },
  "interval": 60000
}
```

**Configuration - Keyword should NOT exist**:
```json
{
  "name": "Error Detection",
  "url": "https://example.com",
  "monitorType": "keyword",
  "keyword": {
    "settings": {
      "text": "ERROR",
      "shouldExist": false  // keyword should be absent
    }
  },
  "interval": 60000
}
```

**How it works**:
1. Sends HTTP GET request to URL
2. Checks if HTTP status is 200-299
3. If `shouldExist: true`: Keyword found = UP, not found = DOWN
4. If `shouldExist: false`: Keyword absent = UP, found = DOWN

**Use cases**:
- Detect website defacement (check for specific content)
- Detect "soft" errors (error messages in HTML)
- Verify specific functionality is present
- Check if maintenance page is active/inactive
- Monitor for specific security alerts

**Examples**:
- Check homepage has "Login" button
- Verify "Error 500" is NOT present
- Check if "Under Maintenance" message appears
- Verify API returns specific JSON text
- Detect if site was hacked (unwanted text)

---

## API Examples

### Create HTTP Monitor
```bash
POST /api/targets
{
  "name": "Google Homepage",
  "url": "https://google.com",
  "monitorType": "http",
  "interval": 60000
}
```

### Create TCP Port Monitor
```bash
POST /api/targets
{
  "name": "PostgreSQL DB",
  "url": "db.myserver.com",
  "monitorType": "tcp",
  "port": 5432,
  "interval": 60000
}
```

### Create Keyword Monitor
```bash
POST /api/targets
{
  "name": "Homepage Content",
  "url": "https://mysite.com",
  "monitorType": "keyword",
  "keyword": {
    "settings": {
      "text": "Welcome to our site",
      "shouldExist": true
    }
  },
  "interval": 60000
}
```

---

## Migration Note

Existing targets without a `monitorType` field will default to `http` monitoring, maintaining backward compatibility.

## Future Enhancements

Potential future monitoring types:
- ICMP Ping (requires elevated privileges)
- SSL Certificate expiry monitoring
- Custom script execution
- Response time thresholds
- Multi-step transactions
