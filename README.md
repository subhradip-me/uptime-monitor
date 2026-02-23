
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

# Uptime Monitor 🚀

A modern, real-time uptime monitoring tool built with React, Redux, Node.js, Express, MongoDB, and Socket.IO. Features a minimalist Neobrutalism UI design.

## ✨ Features

- **Real-Time Monitoring**: Live updates via WebSocket (Socket.IO)
- **Redux State Management**: Centralized state with Redux Toolkit
- **Target Management**: Monitor websites, APIs, and services
- **Activity Logs**: Track all status changes and events
- **Dashboard**: Overview of all monitored targets
- **User Authentication**: Secure JWT-based authentication
- **Responsive Design**: Clean Neobrutalism UI with Tailwind CSS
- **Docker Support**: Easy deployment with Docker Compose

## 🏗️ Architecture

### Frontend
- **React 18** with functional components and hooks
- **Redux Toolkit** for state management
- **Socket.IO Client** for real-time updates
- **React Router** for navigation
- **Tailwind CSS** with custom Neobrutalism design
- **Vite** for fast development and optimized builds

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for WebSocket communication
- **JWT** authentication
- **Node-cron** for scheduled monitoring
- **Axios** for HTTP requests

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 7+
- Docker and Docker Compose (for containerized deployment)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/subhradip-me/uptime-monitor.git
   cd uptime-tool
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set secure values:
   ```env
   JWT_SECRET=your-secret-key-min-32-characters
   MONGO_ROOT_PASSWORD=your-secure-password
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start MongoDB (if not using Docker)
# mongod

# Start the server
npm start
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Access the application at http://localhost:3000

## 📁 Project Structure

```
uptime-tool/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API & Socket services
│   │   ├── store/       # Redux store & slices
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── docker-compose.yml   # Docker orchestration
└── .env.example         # Environment template
```

## 🔧 Configuration

### Environment Variables

#### Root `.env`
```env
JWT_SECRET=your-jwt-secret-key
MONGO_ROOT_PASSWORD=your-mongo-password
NODE_ENV=production
```

#### Backend `.env`
```env
NODE_ENV=development|production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uptime-tool
JWT_SECRET=your-secret-key
```

#### Frontend `.env.production`
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

## 🎨 UI Design

The application features a minimalist **Neobrutalism** design with:
- Bold black borders (2px)
- Flat shadows
- Limited color palette (yellow, blue, red, gray)
- Clean typography with Inter font
- Consistent spacing and components

## 🔌 Real-Time Features

### WebSocket Events

**Server → Client:**
- `target:updated` - Target status changed
- `log:new` - New activity log created

**Auto-reconnection:** Client automatically reconnects on disconnect

### Redux State Management

**Slices:**
- `targetsSlice` - Manages monitoring targets
- `logsSlice` - Manages activity logs

**Async Operations:**
- Fetch, create, update, delete targets
- Fetch logs with filtering
- Real-time state updates via WebSocket

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Targets
- `GET /targets` - Get all targets
- `POST /targets` - Create target
- `PUT /targets/:id` - Update target
- `DELETE /targets/:id` - Delete target
- `POST /targets/:id/pause` - Pause monitoring
- `POST /targets/:id/resume` - Resume monitoring
- `POST /targets/:id/ping` - Manual ping

### Logs
- `GET /logs/recent` - Get recent logs
- `GET /logs/:targetId` - Get logs for target
- `GET /logs/stats` - Get statistics

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# View container status
docker-compose ps
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend (uses production dependencies)
cd backend
npm ci --only=production
```

## 🧪 Testing

### Test Backend API
```bash
cd backend
npm test
```

### Manual Testing
1. Start the application
2. Register a new account
3. Add monitoring targets
4. Check Dashboard for live updates
5. View Logs page for activity
6. Test real-time updates by opening multiple tabs

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Docker deployment
- Manual deployment
- Environment configuration
- Security checklist
- Reverse proxy setup
- Monitoring and maintenance

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Environment variables for secrets
- CORS configuration
- Input validation
- MongoDB connection security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check existing documentation
2. Review Docker logs: `docker-compose logs`
3. Check application logs
4. Open an issue on GitHub

## 🙏 Acknowledgments

- React team for React
- Redux team for Redux Toolkit
- Socket.IO team for real-time capabilities
- Tailwind CSS team for the utility-first CSS framework
- MongoDB team for the database

---

**Built with ❤️ using modern web technologies**
