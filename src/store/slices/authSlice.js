// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import jwtDecode from 'jwt-decode';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Funzione helper per verificare se il token è scaduto
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Errore verifica scadenza token:', error);
    return true;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Nuovo reducer per verificare e pulire token scaduti
    checkTokenExpiry: (state) => {
      if (state.token && isTokenExpired(state.token)) {
        console.log('⏰ Token scaduto, logout automatico');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = 'Sessione scaduta, effettua nuovamente il login';
      }
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        
        try {
          const decoded = jwtDecode(action.payload.token);
          console.log("🔓 Token decodificato:", decoded);
          console.log("📦 Dati utente dal backend:", action.payload.user);
          
          // Verifica che il token non sia già scaduto
          if (isTokenExpired(action.payload.token)) {
            state.error = 'Token già scaduto';
            state.isAuthenticated = false;
            return;
          }
          
          // Salva TUTTI i dati utente dal backend
          state.user = {
            // Dati dal token JWT
            id: decoded.userId || action.payload.user?.id,
            
            // IMPORTANTE: Usa i dati che arrivano dal backend
            firstName: action.payload.user?.firstName || '',
            lastName: action.payload.user?.lastName || '',
            email: action.payload.user?.email || decoded.email || '',
            level: action.payload.user?.level || 1,
            xp: action.payload.user?.xp || 0,
            streak: action.payload.user?.streak || 0,
            challengesPlayed: action.payload.user?.challengesPlayed || 0,
            prizesWon: action.payload.user?.prizesWon || 0,
            packageType: action.payload.user?.packageType || 'free',
            lastPlayedDate: action.payload.user?.lastPlayedDate,
            
            // Aggiungi tutti gli altri campi dal backend
            ...action.payload.user
          };
          
          state.token = action.payload.token;
          state.isAuthenticated = true;
          
          // Log della scadenza
          const expiryDate = new Date(decoded.exp * 1000);
          console.log('📅 Token scadrà il:', expiryDate.toLocaleString());
          console.log('👤 Dati utente salvati:', state.user);
        } catch (err) {
          console.error("Errore nella decodifica del token:", err);
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = 'Token non valido';
        }
        
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.error.message || 'Errore durante il login';
      });

    // REGISTER
    builder
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.isLoading = false;
        
        try {
          const decoded = jwtDecode(action.payload.token);
          console.log("🔓 Token decodificato (register):", decoded);
          
          // Verifica che il token non sia già scaduto
          if (isTokenExpired(action.payload.token)) {
            state.error = 'Token già scaduto';
            state.isAuthenticated = false;
            return;
          }
          
          // Salva TUTTI i dati utente dal backend
          state.user = {
            // Dati dal token JWT
            id: decoded.userId || action.payload.user?.id,
            
            // IMPORTANTE: Usa i dati che arrivano dal backend
            firstName: action.payload.user?.firstName || '',
            lastName: action.payload.user?.lastName || '',
            email: action.payload.user?.email || decoded.email || '',
            level: action.payload.user?.level || 1,
            xp: action.payload.user?.xp || 0,
            streak: action.payload.user?.streak || 0,
            challengesPlayed: action.payload.user?.challengesPlayed || 0,
            prizesWon: action.payload.user?.prizesWon || 0,
            packageType: action.payload.user?.packageType || 'free',
            lastPlayedDate: action.payload.user?.lastPlayedDate,
            
            // Aggiungi tutti gli altri campi dal backend
            ...action.payload.user
          };
          
          state.token = action.payload.token;
          state.isAuthenticated = true;
          
          console.log('👤 Nuovo utente registrato:', state.user);
        } catch (err) {
          console.error("Errore nella decodifica del token:", err);
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = 'Token non valido';
        }
        
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.error.message || 'Errore durante la registrazione';
      });

    // GET PROFILE (se implementato)
    builder
      .addMatcher(authApi.endpoints.getProfile.matchFulfilled, (state, action) => {
        if (state.user && action.payload) {
          // Aggiorna i dati utente con quelli freschi dal backend
          state.user = {
            ...state.user,
            ...action.payload,
          };
          console.log('👤 Profilo aggiornato:', state.user);
        }
      });
  },
});

export const { logout, clearError, updateUserProfile, checkTokenExpiry } = authSlice.actions;
export default authSlice.reducer;