# Deployment Guide

Complete guide for deploying the Uptime Monitor application to production.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- MongoDB 7+ (or use Docker)

## Quick Start (Docker Deployment)

### 1. Clone and Configure

```bash
git clone <your-repo-url>
cd uptime-tool
```

### 2. Set Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

**IMPORTANT**: Edit `.env` and change:
- `JWT_SECRET` - Use a strong random string (minimum 32 characters)
- `MONGO_ROOT_PASSWORD` - Set a secure password

```env
JWT_SECRET=your-generated-secret-key-here-minimum-32-chars
MONGO_ROOT_PASSWORD=your-secure-password-here
```

### 3. Build and Run

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 5. Create First User

Register at: http://localhost/register

## Production Deployment

### Environment Variables

Create `.env` file in the root directory:

```env
# Required
JWT_SECRET=<generate-strong-secret>
MONGO_ROOT_PASSWORD=<secure-password>

# Optional
NODE_ENV=production
MONGO_ROOT_USERNAME=admin
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart uptime-backend

# Rebuild and restart
docker-compose up -d --build

# Scale backend (if needed)
docker-compose up -d --scale uptime-backend=3
```

### Health Checks

All services include health checks:

```bash
# Check backend health
curl http://localhost:5000/auth/health

# Check MongoDB
docker exec uptime-mongo mongosh --eval "db.adminCommand('ping')"

# Check all containers
docker-compose ps
```

### Backup Database

```bash
# Backup
docker exec uptime-mongo mongodump --out=/backup

# Copy from container
docker cp uptime-mongo:/backup ./backup

# Restore
docker exec -i uptime-mongo mongorestore /backup
```

## Manual Deployment (Without Docker)

### Backend

```bash
cd backend

# Install dependencies
npm ci --only=production

# Create .env file
cp .env.example .env
# Edit .env with your values

# Start MongoDB separately
# Update MONGODB_URI in .env to point to your MongoDB instance

# Start server
npm start
```

### Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Serve with any static server
# Example with serve:
npx serve -s dist -p 80
```

## Environment Configuration

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password@localhost:27017/uptime-tool?authSource=admin
JWT_SECRET=your-secret-key
```

### Frontend

Update API URLs in production:

Create `frontend/.env.production`:
```env
VITE_API_URL=http://your-backend-url:5000
VITE_WS_URL=http://your-backend-url:5000
```

Then rebuild: `npm run build`

## Security Checklist

- [ ] Changed default `JWT_SECRET`
- [ ] Changed default `MONGO_ROOT_PASSWORD`
- [ ] MongoDB not exposed to public internet
- [ ] Backend API behind firewall/proxy
- [ ] HTTPS configured (use reverse proxy like nginx/Caddy)
- [ ] CORS configured correctly in backend
- [ ] Regular backups configured

## Reverse Proxy Setup (nginx)

Example nginx configuration for HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f uptime-backend
docker-compose logs -f uptime-frontend
docker-compose logs -f mongo
```

### Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats uptime-backend
```

### Application Logs

Backend logs are stored in `backend/logs/` directory (if configured).

## Troubleshooting

### Backend won't start

1. Check MongoDB is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs uptime-backend`
3. Verify environment variables: `docker-compose config`

### Frontend can't connect to backend

1. Check nginx proxy configuration
2. Verify backend is accessible: `curl http://localhost:5000/auth/health`
3. Check browser console for CORS errors

### MongoDB connection failed

1. Verify MongoDB is running: `docker ps | grep mongo`
2. Check credentials in `.env`
3. Test connection: `docker exec uptime-mongo mongosh -u admin -p`

### WebSocket not connecting

1. Check Socket.IO endpoint: `curl http://localhost:5000/socket.io/`
2. Verify nginx WebSocket proxy configuration
3. Check firewall allows WebSocket connections

## Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Database Migration

If schema changes are needed:

```bash
# Stop application
docker-compose stop uptime-backend

# Backup database
docker exec uptime-mongo mongodump --out=/backup

# Start application with new code
docker-compose up -d --build
```

## Performance Tuning

### MongoDB

Increase connection pool size in backend:
```javascript
mongoose.connect(uri, {
  maxPoolSize: 50,
  minPoolSize: 10
});
```

### Node.js

Use PM2 for production (alternative to Docker):
```bash
npm install -g pm2
pm2 start server.js -i max
pm2 save
pm2 startup
```

### nginx Cache

Enable caching in nginx for static assets (already configured in provided nginx.conf).

## Support

For issues, check:
1. Docker logs: `docker-compose logs`
2. Application logs in `backend/logs/`
3. MongoDB logs: `docker-compose logs mongo`
4. Health check endpoints

## License

See LICENSE file
