// src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { logout, clearError } from '../store/slices/authSlice';
import { useLoginMutation, useRegisterMutation } from '../store/services/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const { user, token, isAuthenticated, isLoading, error } = authState;
  
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  // ✅ RIMOSSI: Tutti i console.log che venivano eseguiti ad ogni render

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
    dispatch(logout());
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