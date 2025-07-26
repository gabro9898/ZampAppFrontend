import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import { authApi } from './services/authApi';
import { challengeApi } from './services/challengeApi';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';

// Configurazione Redux Persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Solo auth viene persistito
  blacklist: ['ui'], // ui non viene salvato (loading states, ecc.)
};

// Combina tutti i reducers
const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  [authApi.reducerPath]: authApi.reducer,
  [challengeApi.reducerPath]: challengeApi.reducer,
});

// Crea il persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configura lo store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'persist/REGISTER'
        ],
      },
    }).concat(authApi.middleware, challengeApi.middleware),
});

export const persistor = persistStore(store);