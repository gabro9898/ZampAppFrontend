import { useSelector, useDispatch } from 'react-redux';
import { logout, clearError } from '../store/slices/authSlice';
import { useLoginMutation, useRegisterMutation } from '../store/services/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );
  
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

 const login = async (email, password) => {
  try {
    console.log('🔍 Tentativo login con:', email); // DEBUG
    const result = await loginMutation({ email, password }).unwrap();
    console.log('✅ Login riuscito:', result); // DEBUG
    return { success: true, data: result };
  } catch (error) {
    console.log('❌ Errore login:', error); // DEBUG
    console.log('❌ Dettagli errore:', JSON.stringify(error, null, 2)); // DEBUG
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
