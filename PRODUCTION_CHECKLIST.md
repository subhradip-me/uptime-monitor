# Production Build Checklist

Complete this checklist before deploying to production.

## Security

- [ ] Changed `JWT_SECRET` to a strong random value (min 32 characters)
- [ ] Changed `MONGO_ROOT_PASSWORD` to a secure password
- [ ] Removed or secured MongoDB port exposure (27017)
- [ ] Set `NODE_ENV=production` in all .env files
- [ ] Verified no sensitive data in source code
- [ ] Added `.env` to `.gitignore`
- [ ] CORS origins properly configured in backend
- [ ] HTTPS configured (via reverse proxy)

## Environment Variables

- [ ] Created `.env` file in root directory
- [ ] Created `backend/.env` file
- [ ] Created `frontend/.env.production` file
- [ ] All required variables set:
  - JWT_SECRET
  - MONGO_ROOT_PASSWORD
  - MONGODB_URI (backend)
  - VITE_API_URL (frontend)
  - VITE_WS_URL (frontend)

## Build & Test

- [ ] Backend builds without errors: `cd backend && npm install`
- [ ] Frontend builds without errors: `cd frontend && npm run build`
- [ ] No console errors in production build
- [ ] Database migrations completed (if any)
- [ ] Test user registration works
- [ ] Test user login works
- [ ] Test target creation works
- [ ] Test real-time updates work
- [ ] Test WebSocket connection works

## Docker

- [ ] Built Docker images: `docker-compose build`
- [ ] Started containers: `docker-compose up -d`
- [ ] All containers running: `docker-compose ps`
- [ ] Health checks passing
- [ ] Frontend accessible on port 80
- [ ] Backend accessible on port 5000
- [ ] MongoDB accessible internally only
- [ ] Volumes configured for data persistence

## Performance

- [ ] Frontend assets compressed (gzip enabled in nginx)
- [ ] Static assets cached properly
- [ ] MongoDB indexes created (automatic with Mongoose)
- [ ] Connection pooling configured
- [ ] Monitoring interval set appropriately (default 30s)

## Monitoring & Logging

- [ ] Application logs accessible: `docker-compose logs`
- [ ] MongoDB logs accessible
- [ ] Health check endpoints responding:
  - `curl http://localhost:5000/health`
- [ ] Resource usage acceptable: `docker stats`

## Backup & Recovery

- [ ] Database backup strategy in place
- [ ] Backup script tested: `mongodump`
- [ ] Restore process documented
- [ ] Data volumes identified and protected

## Documentation

- [ ] README.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment process documented

## Post-Deployment

- [ ] Created first admin user
- [ ] Added at least one monitoring target
- [ ] Verified email/alerts work (if configured)
- [ ] Tested from external network
- [ ] SSL certificate valid (if HTTPS)
- [ ] DNS records correct
- [ ] Firewall rules configured
- [ ] Backup schedule active

## Optional Production Enhancements

- [ ] Set up reverse proxy (nginx/Caddy)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Set up automated backups
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring for the monitoring tool itself
- [ ] Load balancing configured (if needed)

## Final Checks

- [ ] All services restart automatically
- [ ] Application survives server reboot
- [ ] Error pages display correctly
- [ ] 404 pages handled properly
- [ ] No default passwords in use
- [ ] All test accounts removed
- [ ] Production domain configured
- [ ] Support contact information added

---

**Date Completed**: _____________

**Deployed By**: _____________

**Notes**:
