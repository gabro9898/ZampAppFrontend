// src/components/MainApp.js
import React, { useEffect, useRef } from 'react';
import { View, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProfileQuery } from '../store/services/authApi';

// Screens
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ChallengesScreen } from '../screens/ChallengesScreen';
import { TimerGameScreen } from '../screens/TimerGameScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { MobileNavigation } from './MobileNavigation';

const Stack = createNativeStackNavigator();

function MainNavigator() {
  const activeTab = useSelector((state) => state.ui.activeTab);
  const { isAuthenticated, user } = useAuth();
  const appState = useRef(AppState.currentState);
  
  // ✅ CORREZIONE: Rimuovi il polling continuo, usa solo refetch manuale
  const { refetch: refetchProfile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !user?.id,
    // ❌ RIMOSSO: pollingInterval: 60000
    // ❌ RIMOSSO: refetchOnFocus: true
    // ❌ RIMOSSO: refetchOnReconnect: true
  });
  
  // ✅ CORREZIONE: Refetch solo quando l'app torna attiva dopo essere stata in background
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Solo se passiamo da background/inactive a active
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App tornata attiva - aggiorno profilo');
        refetchProfile();
      }
      appState.current = nextAppState;
    });
    
    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, refetchProfile]);
  
  // ❌ RIMOSSO: useEffect per activeTab che causava loop
  
  // Componente che renderizza la schermata corretta basata sul tab attivo
  const TabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'challenges':
        return <ChallengesScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Main">
        {() => (
          <View style={{ flex: 1 }}>
            <TabContent />
            <MobileNavigation />
          </View>
        )}
      </Stack.Screen>
      
      <Stack.Screen 
        name="TimerGame" 
        component={TimerGameScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
}

export function MainApp() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AuthScreen />;
  }
  
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}