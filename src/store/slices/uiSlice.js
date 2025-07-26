// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'home',
  isLoading: false,
  notifications: [],
  theme: 'light',
  selectedChallenge: null,
  currentView: 'home',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    
    setSelectedChallenge: (state, action) => {
      state.selectedChallenge = action.payload;
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  setActiveTab,
  setCurrentView,
  setSelectedChallenge,
  setLoading,
  addNotification,
  removeNotification,
  toggleTheme,
} = uiSlice.actions;

export default uiSlice.reducer;