# Docker Setup for Uptime Tool Backend

This directory contains Docker configuration for the Uptime Tool backend service.

## Quick Start

### Development Mode
```bash
# Build and run with development settings
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

### Production Mode
```bash
# Copy environment template and configure
cp .env.example .env
# Edit .env file with your production values

# Build and run with production settings
docker-compose -f docker-compose.prod.yml up --build -d
```

## Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   - `JWT_SECRET`: Strong secret key for JWT tokens
   - `MONGO_ROOT_PASSWORD`: Secure password for MongoDB
   - `MONGODB_URI`: Database connection string

## Docker Commands

### Build only
```bash
docker build -t uptime-backend .
```

### Run standalone (without MongoDB)
```bash
docker run -p 5000:5000 --env-file .env uptime-backend
```

### View logs
```bash
# Development
docker-compose logs -f uptime-backend

# Production
docker-compose -f docker-compose.prod.yml logs -f uptime-backend
```

### Stop services
```bash
# Development
docker-compose down

# Production (with volume cleanup)
docker-compose -f docker-compose.prod.yml down -v
```

## Health Check

The production container includes a health check endpoint. You can verify the service is healthy:

```bash
curl http://localhost:5000/health
```

## Volumes

- `mongo_data`: Persistent MongoDB data storage
- `./logs`: Application logs (production only)

## Network

Both containers run on the `uptime-network` bridge network, allowing internal communication between services.