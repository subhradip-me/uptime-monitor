import { configureStore } from '@reduxjs/toolkit';
import targetsReducer from './targetsSlice';
import logsReducer from './logsSlice';

export const store = configureStore({
  reducer: {
    targets: targetsReducer,
    logs: logsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['logs/logAdded', 'targets/targetUpdated'],
      },
    }),
});

export default store;
