// App.js
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { store, persistor } from './src/store/store';
import { MainApp } from './src/components/MainApp';
import NotificationService from './src/store/services/NotificationService';
import * as Notifications from 'expo-notifications';

// Configurazione Android per notifiche
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

export default function App() {
  useEffect(() => {
    // Inizializza il servizio notifiche
    initializeNotifications();
    
    // Cleanup
    return () => {
      NotificationService.cleanup();
    };
  }, []);
  
  const initializeNotifications = async () => {
    try {
      const initialized = await NotificationService.initialize();
      if (initialized) {
        console.log('✅ Servizio notifiche inizializzato');
      }
    } catch (error) {
      console.error('❌ Errore inizializzazione notifiche:', error);
    }
  };
  
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#030213" />
          </View>
        } 
        persistor={persistor}
      >
        <MainApp />
      </PersistGate>
    </Provider>
  );
}