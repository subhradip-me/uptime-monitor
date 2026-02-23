# 🚀 Uptime Monitoring Tool

A comprehensive uptime monitoring system built with Node.js, Express, and MongoDB that continuously monitors your web services and provides real-time status updates.

## ✨ Features

- 🔄 **Continuous Monitoring**: Automatic periodic health checks for your URLs
- 📊 **Real-time Statistics**: Uptime percentage, response times, and status tracking
- 🔐 **Secure Authentication**: JWT-based authentication system
- 📝 **Detailed Logging**: Comprehensive logs of all monitoring activities
- ⚡ **Manual Testing**: On-demand ping functionality for immediate testing
- 🎯 **Configurable Intervals**: Custom monitoring intervals per target (minimum 30 seconds)
- 🧹 **Automatic Cleanup**: Old logs are automatically cleaned up (30-day retention)
- 🔥 **Background Monitoring**: Uses cron jobs for reliable background processing

## 🛠 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)
- npm or yarn

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

4. **Start the Server**
   ```bash
   npm run dev
   ```

5. **Test the API**
   ```bash
   node test-api.js
   ```

## 📋 Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration  
MONGODB_URI=mongodb://localhost:27017/uptime-tool

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Default Admin User (for initial setup)
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
```

## 🔌 API Endpoints

### Authentication

- **POST** `/auth/login` - Login with username/password
- **POST** `/auth/register` - Register new user
- **GET** `/auth/me` - Get current user info

### Target Management

- **POST** `/targets` - Add new monitoring target
- **GET** `/targets` - Get all targets
- **GET** `/targets/:id` - Get specific target
- **PUT** `/targets/:id` - Update target
- **DELETE** `/targets/:id` - Delete target
- **POST** `/targets/:id/ping` - Manual ping target

### Logs & Statistics

- **GET** `/logs/:targetId` - Get logs for specific target
- **GET** `/logs/recent` - Get recent logs across all targets  
- **GET** `/logs/stats` - Get system statistics

### System

- **GET** `/` - API information
- **GET** `/health` - Health check

## 📡 Adding a Monitoring Target

```bash
curl -X POST http://localhost:5000/targets \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Website",
    "url": "https://example.com",
    "interval": 60000
  }'
```

## 📊 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

## 🔐 Authentication

1. **Login** to get a JWT token:
   ```bash
   curl -X POST http://localhost:5000/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{"username": "admin", "password": "admin123"}'
   ```

2. **Use the token** in subsequent requests:
   ```bash
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## 📈 Monitoring Logic

### Status Determination
- ✅ **UP**: HTTP status 2xx or 3xx
- ❌ **DOWN**: HTTP status 5xx, connection refused, timeout, DNS failure
- ⚠️ **ERROR**: Unexpected errors

### Uptime Calculation
```
Uptime % = (Successful Checks / Total Checks) × 100
```

### Default Settings
- **Minimum Interval**: 30 seconds
- **Request Timeout**: 10 seconds
- **Log Retention**: 30 days
- **Max Redirects**: 5

## 🏗 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── targetController.js  # Target management
│   └── logController.js     # Logging and stats
├── models/
│   ├── User.js             # User schema
│   ├── Target.js           # Target schema
│   └── Log.js              # Log schema
├── routes/
│   ├── auth.js             # Auth routes
│   ├── targets.js          # Target routes
│   └── logs.js             # Log routes
├── services/
│   ├── monitoringService.js # Core monitoring logic
│   └── userService.js      # User initialization
├── server.js               # Main application
├── test-api.js            # API test script
└── .env                   # Environment config
```

## 🧪 Testing

Run the comprehensive API test:

```bash
node test-api.js
```

This test will:
- Check server health
- Authenticate with default credentials
- Add monitoring targets
- Perform manual pings
- Wait for automatic monitoring
- Check logs and statistics

## 🔧 Customization

### Custom Monitoring Intervals
Each target can have its own monitoring interval (minimum 30 seconds):

```javascript
{
  "name": "Critical Service",
  "url": "https://critical-app.com",
  "interval": 15000  // 15 seconds (will be clamped to 30s minimum)
}
```

### Custom Status Logic
Modify the `pingTarget` method in `services/monitoringService.js` to customize how status is determined.

## 📱 Building a Frontend

This backend provides a complete REST API for building frontends. Recommended approach:

### Dashboard Components
- **Target List**: Show all monitored URLs with status indicators
- **Add Target Form**: Simple form to add new monitoring targets  
- **Status Cards**: Real-time status for each target
- **Response Time Charts**: Historical response time graphs
- **Uptime Statistics**: Overall system health metrics

### Sample Frontend API Calls
```javascript
// Login
const login = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});

// Get targets
const targets = await fetch('/targets', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Add target
const newTarget = await fetch('/targets', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  },
  body: JSON.stringify({
    name: 'My API',
    url: 'https://api.example.com/health',
    interval: 60000
  })
});
```

## 🚨 Production Deployment

### Security Considerations
1. Change default admin credentials
2. Use strong JWT_SECRET
3. Enable HTTPS
4. Use environment variables for secrets
5. Set up proper MongoDB authentication
6. Configure firewall rules

### Performance Optimization
1. Set up MongoDB indexes
2. Configure log rotation
3. Monitor system resources
4. Set appropriate monitoring intervals
5. Use MongoDB replica sets for high availability

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running
- Check connection string in .env
- Verify network connectivity

**Authentication Errors**  
- Check JWT_SECRET in environment
- Verify token is being sent correctly
- Check token expiration

**Monitoring Not Working**
- Check target URLs are accessible
- Verify intervals are >= 30 seconds
- Check server logs for errors

### Debug Mode
Set `NODE_ENV=development` for detailed error messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Next Steps

1. **Frontend Development**: Build a React/Vue dashboard
2. **Alerting System**: Add email/SMS notifications
3. **Advanced Metrics**: Response time trends, availability SLAs
4. **Multi-user Support**: Team management and permissions
5. **API Integration**: Webhook notifications, Slack integration
6. **Mobile App**: Native mobile monitoring app

---

**Happy Monitoring! 🚀**