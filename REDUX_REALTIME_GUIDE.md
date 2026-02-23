# Redux & Real-Time Implementation

This uptime monitoring tool now uses **Redux** for state management and **Socket.IO** for real-time updates.

## 🚀 Features

### Redux State Management
- Centralized state for targets and logs
- Async actions with Redux Toolkit
- Automatic state updates via WebSocket events

### Real-Time Updates
- Live target status updates
- Real-time log streaming
- Instant dashboard refresh
- No polling required

## 📁 File Structure

```
frontend/src/
├── store/
│   ├── index.js          # Redux store configuration
│   ├── targetsSlice.js   # Targets state & actions
│   └── logsSlice.js      # Logs state & actions
├── services/
│   ├── socket.js         # WebSocket client
│   └── api.js            # API service
└── pages/
    ├── Dashboard.jsx     # Uses Redux for real-time stats
    ├── Targets.jsx       # Uses Redux for target management
    └── Logs.jsx          # Uses Redux for log streaming
```

## 🔌 WebSocket Events

### Server → Client
- `target:updated` - Target status/stats changed
- `log:new` - New log entry created

### Connection
- Auto-reconnect on disconnect
- Connection status logging
- Graceful error handling

## 🎯 Redux Actions

### Targets
- `fetchTargets()` - Load all targets
- `addTarget(data)` - Create new target
- `updateTarget({ id, data })` - Update target
- `deleteTarget(id)` - Delete target
- `pauseTarget(id)` - Pause monitoring
- `resumeTarget(id)` - Resume monitoring

### Logs
- `fetchLogs(targetId?)` - Load logs (all or by target)
- `setSelectedTarget(id)` - Filter logs by target

### Real-Time Updates (via WebSocket)
- `targetUpdated(data)` - Update target in store
- `logAdded(data)` - Add new log to store

## 🔄 Data Flow

1. **User Action** → Component dispatches Redux action
2. **Redux Thunk** → Makes API call
3. **API Response** → Updates Redux state
4. **Backend Event** → Triggers monitoring check
5. **WebSocket Event** → Sent to all clients
6. **Socket Service** → Dispatches Redux action
7. **Redux State** → Updates automatically
8. **React Component** → Re-renders with new data

## 💡 Usage Examples

### Using Redux in Components

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { fetchTargets, addTarget } from '../store/targetsSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const { items: targets, loading } = useSelector((state) => state.targets);
  
  useEffect(() => {
    dispatch(fetchTargets());
  }, [dispatch]);
  
  const handleAdd = async (data) => {
    await dispatch(addTarget(data)).unwrap();
  };
  
  return <div>{/* Component JSX */}</div>;
}
```

### Real-Time Updates

No additional code needed! Once connected, the socket service automatically:
1. Receives WebSocket events from server
2. Dispatches Redux actions
3. Updates the state
4. Components re-render automatically

## 🛠️ Backend Changes

### server.js
- Created HTTP server with Socket.IO
- Configured CORS for WebSocket
- Exposed `global.io` for services

### monitoringService.js
- Emits `target:updated` on status changes
- Emits `log:new` when logs are created
- Real-time updates sent to all connected clients

## 📊 Benefits

1. **No Polling** - Eliminates 30-second refresh intervals
2. **Instant Updates** - See changes immediately
3. **Lower Server Load** - WebSocket vs HTTP polling
4. **Better UX** - Smooth, real-time experience
5. **Scalable** - Redux handles complex state efficiently

## 🔧 Configuration

WebSocket server URL is configured via environment variable:

```env
# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

Socket.IO automatically removes `/api` from URL for connection.

## 🐛 Debugging

Enable Socket.IO debug logs:
```bash
# In browser console
localStorage.debug = 'socket.io-client:*'
```

Redux DevTools Extension:
- Install Redux DevTools browser extension
- View all actions and state changes
- Time-travel debugging

## ✅ Testing

1. Open multiple browser tabs
2. Make changes in one tab
3. See updates appear instantly in other tabs
4. Check console for WebSocket connection logs
5. Monitor Redux actions in DevTools
