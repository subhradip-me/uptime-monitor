import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logsAPI } from '../services/api';

// Async thunks
export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (targetId = null, { rejectWithValue }) => {
    try {
      const response = targetId 
        ? await logsAPI.getTargetLogs(targetId)
        : await logsAPI.getRecent();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs');
    }
  }
);

const logsSlice = createSlice({
  name: 'logs',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedTarget: 'all',
  },
  reducers: {
    // Real-time updates from WebSocket
    logAdded: (state, action) => {
      // Add new log at the beginning
      state.items.unshift(action.payload);
      // Keep only the most recent 1000 logs to prevent memory issues
      if (state.items.length > 1000) {
        state.items = state.items.slice(0, 1000);
      }
    },
    setSelectedTarget: (state, action) => {
      state.selectedTarget = action.payload;
    },
    clearLogs: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logAdded, setSelectedTarget, clearLogs, clearError } = logsSlice.actions;
export default logsSlice.reducer;
