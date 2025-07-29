// src/store/index.js - Versione Completa con Shop API
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// API Services
import { authApi } from './services/authApi';
import { challengeApi } from './services/challengeApi';
import { gameApi } from './services/gameApi';
import { shopApi } from './services/shopApi'; // ✨ NUOVO

// Slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';

// --------------------------------------------------
// Redux‑Persist configuration
// --------------------------------------------------
const persistConfig = {
  key: 'root',
  version: 5, // ✅ BUMP version per includere shopApi
  storage: AsyncStorage,
  whitelist: ['auth'], // salviamo solo auth
  blacklist: ['ui', authApi.reducerPath, challengeApi.reducerPath, gameApi.reducerPath, shopApi.reducerPath], // ✅ Blacklist le API per evitare problemi
};

// --------------------------------------------------
// Root reducer
// --------------------------------------------------
const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  [authApi.reducerPath]: authApi.reducer,
  [challengeApi.reducerPath]: challengeApi.reducer,
  [gameApi.reducerPath]: gameApi.reducer,
  [shopApi.reducerPath]: shopApi.reducer, // ✨ NUOVO
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --------------------------------------------------
// Store
// --------------------------------------------------
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH, 
          REHYDRATE, 
          PAUSE, 
          PERSIST, 
          PURGE, 
          REGISTER,
          // ✅ Ignora le azioni RTK Query per evitare warning sui Request/Response
          'authApi/executeQuery/fulfilled',
          'authApi/executeQuery/pending',
          'authApi/executeQuery/rejected',
          'authApi/executeMutation/fulfilled',
          'authApi/executeMutation/pending',
          'authApi/executeMutation/rejected',
          'challengeApi/executeQuery/fulfilled',
          'challengeApi/executeQuery/pending',
          'challengeApi/executeQuery/rejected',
          'challengeApi/executeMutation/fulfilled',
          'challengeApi/executeMutation/pending',
          'challengeApi/executeMutation/rejected',
          'gameApi/executeQuery/fulfilled',
          'gameApi/executeQuery/pending',
          'gameApi/executeQuery/rejected',
          'gameApi/executeMutation/fulfilled',
          'gameApi/executeMutation/pending',
          'gameApi/executeMutation/rejected',
          'shopApi/executeQuery/fulfilled',
          'shopApi/executeQuery/pending',
          'shopApi/executeQuery/rejected',
          'shopApi/executeMutation/fulfilled',
          'shopApi/executeMutation/pending',
          'shopApi/executeMutation/rejected',
        ],
        // ✅ Ignora i percorsi specifici che contengono oggetti non serializzabili
        ignoredActionPaths: [
          'meta.arg',
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
          'meta.baseQueryMeta',
          'payload.timestamp',
        ],
        ignoredPaths: [
          'auth.user.joinedAt',
          'auth.user.lastPlayedDate',
          'auth.user.birthDate',
          'auth.user.packageExpiresAt',
          // Ignora anche i reducer delle API
          `${authApi.reducerPath}.queries`,
          `${authApi.reducerPath}.mutations`,
          `${authApi.reducerPath}.provided`,
          `${authApi.reducerPath}.subscriptions`,
          `${authApi.reducerPath}.config`,
          `${challengeApi.reducerPath}.queries`,
          `${challengeApi.reducerPath}.mutations`,
          `${challengeApi.reducerPath}.provided`,
          `${challengeApi.reducerPath}.subscriptions`,
          `${challengeApi.reducerPath}.config`,
          `${gameApi.reducerPath}.queries`,
          `${gameApi.reducerPath}.mutations`,
          `${gameApi.reducerPath}.provided`,
          `${gameApi.reducerPath}.subscriptions`,
          `${gameApi.reducerPath}.config`,
          `${shopApi.reducerPath}.queries`,
          `${shopApi.reducerPath}.mutations`,
          `${shopApi.reducerPath}.provided`,
          `${shopApi.reducerPath}.subscriptions`,
          `${shopApi.reducerPath}.config`,
        ],
      },
    }).concat(authApi.middleware, challengeApi.middleware, gameApi.middleware, shopApi.middleware),
  // ✅ Disabilita devTools in produzione per performance
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);