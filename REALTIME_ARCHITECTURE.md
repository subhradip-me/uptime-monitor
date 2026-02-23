# Real-Time Update Flow

This diagram shows how real-time updates flow through the system.

## Example: Target Status Change

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MONITORING SERVICE                               │
│                                                                      │
│  1. Check Target (every 60s)                                        │
│     └─> HTTP/TCP/UDP/Keyword check                                  │
│                                                                      │
│  2. Update Database                                                 │
│     ├─> Update target status                                        │
│     └─> Create log entry                                            │
│                                                                      │
│  3. Emit WebSocket Events                                           │
│     ├─> global.io.emit('target:updated', data)                      │
│     └─> global.io.emit('log:new', logData)                          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SOCKET.IO SERVER                                │
│                                                                      │
│  Broadcasts to all connected clients                                │
│  (Multiple browser tabs, users, devices)                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND SOCKET CLIENT                            │
│                     (services/socket.js)                             │
│                                                                      │
│  socket.on('target:updated', (data) => {                            │
│    store.dispatch(targetUpdated(data));                             │
│  });                                                                 │
│                                                                      │
│  socket.on('log:new', (data) => {                                   │
│    store.dispatch(logAdded(data));                                  │
│  });                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         REDUX STORE                                  │
│                                                                      │
│  targetsSlice:                                                      │
│    items: [...targets] ──> Updated with new status                 │
│                                                                      │
│  logsSlice:                                                         │
│    items: [...logs] ──> New log added to top                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                                  │
│                                                                      │
│  const { items } = useSelector(state => state.targets);             │
│                                                                      │
│  ✅ Automatically re-render with new data                           │
│  ✅ No manual refresh needed                                        │
│  ✅ Instant updates across all tabs                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Example: User Adds New Target

```
┌─────────────────────────────────────────────────────────────────────┐
│                      USER ACTION                                     │
│                                                                      │
│  User clicks "Add Target" button                                    │
│  └─> Component calls: dispatch(addTarget(data))                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      REDUX THUNK                                     │
│                                                                      │
│  1. Makes API call: POST /api/targets                               │
│  2. Waits for response                                              │
│  3. Updates Redux state with new target                             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND API                                       │
│                                                                      │
│  1. Validates data                                                  │
│  2. Saves to database                                               │
│  3. Starts monitoring job                                           │
│  4. Returns target data                                             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REDUX STATE UPDATE                                │
│                                                                      │
│  targetsSlice.items.push(newTarget)                                 │
│                                                                      │
│  ✅ New target appears in list immediately                          │
│  ✅ Monitoring starts automatically                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    (Monitoring cycle begins)
                              │
                              ▼
              First check completes → WebSocket event
                              │
                              ▼
                  All clients see status update
```

## Benefits of This Architecture

### 1. **No Polling**
- ❌ Old: `setInterval(() => fetchData(), 30000)`
- ✅ New: WebSocket push notifications

### 2. **Instant Updates**
- Changes appear in <100ms
- All browser tabs update simultaneously
- Multi-user support built-in

### 3. **Efficient**
- Reduced server load (no constant HTTP requests)
- Reduced bandwidth (only send changes)
- Better performance (less React re-renders)

### 4. **Developer Experience**
- Redux DevTools for debugging
- Clear action history
- Time-travel debugging
- Predictable state updates

### 5. **Scalable**
- Socket.IO handles thousands of connections
- Redux scales to complex state requirements
- Easy to add new features

## Testing Real-Time Updates

### Test 1: Multi-Tab Updates
1. Open http://localhost:5173 in two browser tabs
2. In Tab 1: Add a new target
3. In Tab 2: See the target appear instantly
4. In Tab 1: Pause the target
5. In Tab 2: See the pause icon appear

### Test 2: Live Logs
1. Open the Logs page
2. Wait for monitoring checks to run
3. See new logs appear at the top automatically
4. No page refresh needed

### Test 3: Dashboard Stats
1. Open the Dashboard
2. Add/delete targets
3. See stats update in real-time
4. See recent logs stream in

### Test 4: Status Changes
1. Add a target that's currently down
2. Watch the status indicator
3. When service comes up, see instant green status
4. No manual refresh required

## Architecture Decisions

### Why Redux Toolkit?
- Less boilerplate than vanilla Redux
- Built-in async action handling (createAsyncThunk)
- Immer for immutable updates
- Better TypeScript support
- Redux DevTools integration

### Why Socket.IO?
- Auto-reconnection
- Fallback to polling if WebSocket unavailable
- Room/namespace support for scaling
- Binary data support
- Wide browser compatibility

### Why Global io Object?
- Monitoring service runs independently
- Needs to emit events from background jobs
- Simple to use: `global.io.emit()`
- No circular dependencies
