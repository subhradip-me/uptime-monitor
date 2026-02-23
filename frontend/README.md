# Uptime Monitoring Tool - Frontend

A modern React frontend for the Uptime Monitoring Tool, featuring real-time monitoring dashboards, target management, and comprehensive logging analytics.

## Features

- 🔐 **Authentication** - Secure login/register with JWT tokens
- 📊 **Dashboard** - Real-time overview of all monitoring targets
- 🎯 **Target Management** - Add, edit, delete, and manually ping targets
- 📈 **Analytics** - Interactive charts showing uptime trends and response times
- 📋 **Logs** - Detailed logging with filtering and CSV export
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔄 **Real-time Updates** - Auto-refreshing data every 30 seconds

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts and graphs
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main app layout with sidebar
│   └── LoadingSpinner.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication state management
├── pages/              # Main page components
│   ├── Dashboard.jsx   # Overview dashboard
│   ├── Targets.jsx     # Target management
│   ├── Logs.jsx        # Logs and analytics
│   ├── Login.jsx       # Login form
│   └── Register.jsx    # Registration form
├── services/           # API services
│   └── api.js          # Axios configuration and API calls
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles and Tailwind
```

## API Integration

The frontend integrates with the backend API with the following endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `GET /targets` - Get all monitoring targets
- `POST /targets` - Create new target
- `PUT /targets/:id` - Update target
- `DELETE /targets/:id` - Delete target
- `POST /targets/:id/ping` - Manual ping target
- `GET /logs/recent` - Get recent logs
- `GET /logs/stats` - Get system statistics
- `GET /logs/:targetId` - Get logs for specific target

## Configuration

The app uses Vite's proxy configuration to forward API requests to the backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:5000
```

## Features in Detail

### Authentication
- JWT-based authentication with automatic token refresh
- Protected routes that redirect to login when unauthenticated
- User context for managing auth state across components

### Dashboard
- Real-time statistics overview
- Visual status indicators for all targets
- Recent activity feed
- Quick access to add new targets

### Target Management
- CRUD operations for monitoring targets
- Configurable check intervals (30s to 1h)
- Manual ping functionality for immediate checks
- Toggle active/inactive status

### Analytics & Logs
- Interactive charts showing uptime and response time trends
- Filterable logs by target and time period
- CSV export functionality
- Real-time updates with auto-refresh

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Collapsible sidebar on mobile devices
- Responsive tables and charts
- Touch-friendly interface elements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.