// src/hooks/useAuth.js - Aggiornato con reset API al logout
import { useSelector, useDispatch } from 'react-redux';
import { logout, clearError } from '../store/slices/authSlice';
import { useLoginMutation, useRegisterMutation } from '../store/services/authApi';
import { authApi } from '../store/services/authApi';
import { challengeApi } from '../store/services/challengeApi';
import { gameApi } from '../store/services/gameApi';
import { shopApi } from '../store/services/shopApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const { user, token, isAuthenticated, isLoading, error } = authState;
  
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  const login = async (email, password) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        message: error.data?.error || 'Errore durante il login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const result = await registerMutation(userData).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        message: error.data?.error || 'Errore durante la registrazione' 
      };
    }
  };

  const handleLogout = () => {
    // Pulisci lo stato di Redux
    dispatch(logout());
    
    // Pulisci la cache di tutte le API
    dispatch(authApi.util.resetApiState());
    dispatch(challengeApi.util.resetApiState());
    dispatch(gameApi.util.resetApiState());
    dispatch(shopApi.util.resetApiState());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: handleLogout,
    clearError: clearAuthError,
  };
};