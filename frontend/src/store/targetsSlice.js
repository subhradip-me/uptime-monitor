import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { targetsAPI } from '../services/api';

// Async thunks
export const fetchTargets = createAsyncThunk(
  'targets/fetchTargets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await targetsAPI.getAll();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch targets');
    }
  }
);

export const addTarget = createAsyncThunk(
  'targets/addTarget',
  async (targetData, { rejectWithValue }) => {
    try {
      const response = await targetsAPI.create(targetData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add target');
    }
  }
);

export const updateTarget = createAsyncThunk(
  'targets/updateTarget',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await targetsAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update target');
    }
  }
);

export const deleteTarget = createAsyncThunk(
  'targets/deleteTarget',
  async (id, { rejectWithValue }) => {
    try {
      await targetsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete target');
    }
  }
);

export const pauseTarget = createAsyncThunk(
  'targets/pauseTarget',
  async (id, { rejectWithValue }) => {
    try {
      const response = await targetsAPI.pause(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pause target');
    }
  }
);

export const resumeTarget = createAsyncThunk(
  'targets/resumeTarget',
  async (id, { rejectWithValue }) => {
    try {
      const response = await targetsAPI.resume(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resume target');
    }
  }
);

const targetsSlice = createSlice({
  name: 'targets',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Real-time updates from WebSocket
    targetUpdated: (state, action) => {
      const index = state.items.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    targetAdded: (state, action) => {
      const exists = state.items.some(t => t._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    targetRemoved: (state, action) => {
      state.items = state.items.filter(t => t._id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch targets
      .addCase(fetchTargets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTargets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTargets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add target
      .addCase(addTarget.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(addTarget.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update target
      .addCase(updateTarget.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTarget.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete target
      .addCase(deleteTarget.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload);
      })
      .addCase(deleteTarget.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Pause target
      .addCase(pauseTarget.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Resume target
      .addCase(resumeTarget.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { targetUpdated, targetAdded, targetRemoved, clearError } = targetsSlice.actions;
export default targetsSlice.reducer;
