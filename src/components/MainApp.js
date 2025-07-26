import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MobileNavigation } from './MobileNavigation'; // ← AGGIUNGI QUESTO IMPORT

export function MainApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <View style={{ flex: 1 }}> {/* ← AGGIUNGI IL VIEW CONTAINER */}
      <HomeScreen />
      <MobileNavigation /> {/* ← AGGIUNGI QUESTO COMPONENTE */}
    </View>
  );
}