import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';
import metricsReducer from './slices/metricsSlice';

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    metrics: metricsReducer,
    // Add other reducers here as needed
  },
  // Add middleware or devTools configuration if needed
});

// Define RootState and AppDispatch types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 