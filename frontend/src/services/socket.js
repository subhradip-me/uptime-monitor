import { io } from 'socket.io-client';
import { targetUpdated } from '../store/targetsSlice';
import { logAdded } from '../store/logsSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.store = null;
  }

  connect(store) {
    if (this.socket?.connected) {
      return;
    }

    this.store = store;
    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });

    // Listen for target updates
    this.socket.on('target:updated', (data) => {
      console.log('🎯 Target updated:', data);
      if (this.store) {
        this.store.dispatch(targetUpdated(data));
      }
    });

    // Listen for new logs
    this.socket.on('log:new', (data) => {
      console.log('📝 New log:', data);
      if (this.store) {
        this.store.dispatch(logAdded(data));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;
