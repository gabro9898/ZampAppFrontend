// src/screens/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  Switch,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotificationService from '../store/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [preferences, setPreferences] = useState({
    newAttempts: true,
    reminders: true,
    leaderboardUpdates: true,
    challengeEndings: true,
    streakWarnings: true,
  });
  
  useEffect(() => {
    loadPreferences();
  }, []);
  
  const loadPreferences = async () => {
    try {
      const savedPrefs = await NotificationService.getNotificationPreferences();
      if (savedPrefs) {
        setPreferences(savedPrefs);
      }
    } catch (error) {
      console.error('Errore caricamento preferenze:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      await NotificationService.saveNotificationPreferences(preferences);
      // Feedback visivo
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Errore salvataggio preferenze:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const notificationSettings = [
    {
      key: 'newAttempts',
      icon: '🎮',
      title: 'Nuovi tentativi disponibili',
      description: 'Ricevi una notifica quando hai nuovi tentativi disponibili alle 10:00',
      time: '10:00'
    },
    {
      key: 'reminders',
      icon: '⏰',
      title: 'Promemoria giornalieri',
      description: 'Ricevi promemoria per non dimenticare le tue challenge',
      time: '15:00 e 20:00'
    },
    {
      key: 'leaderboardUpdates',
      icon: '📊',
      title: 'Aggiornamenti classifica',
      description: 'Ricevi notifiche quando vieni superato in classifica',
      time: 'In tempo reale'
    },
    {
      key: 'challengeEndings',
      icon: '⏳',
      title: 'Challenge in scadenza',
      description: 'Avvisi quando una challenge sta per terminare',
      time: '3 ore prima'
    },
    {
      key: 'streakWarnings',
      icon: '🔥',
      title: 'Avvisi streak',
      description: 'Non perdere il tuo streak! Ricevi un avviso se non hai ancora giocato',
      time: '19:00'
    }
  ];
  
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#030213" />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#030213',
          padding: 20,
          paddingTop: 40,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginBottom: 20 }}
          >
            <Text style={{ color: 'white', fontSize: 16 }}>← Indietro</Text>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 8
          }}>
            Notifiche 🔔
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Gestisci le tue preferenze di notifica
          </Text>
        </View>
        
        {/* Info banner */}
        <View style={{
          backgroundColor: '#e0f2fe',
          margin: 16,
          padding: 16,
          borderRadius: 12
        }}>
          <Text style={{
            fontSize: 14,
            color: '#0369a1',
            lineHeight: 20
          }}>
            💡 Le notifiche ti aiutano a non perdere i tuoi tentativi giornalieri e a mantenere il tuo streak attivo!
          </Text>
        </View>
        
        {/* Lista preferenze */}
        <View style={{ paddingHorizontal: 16 }}>
          {notificationSettings.map((setting, index) => (
            <View
              key={setting.key}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <Text style={{ fontSize: 20, marginRight: 8 }}>
                      {setting.icon}
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#030213',
                      flex: 1
                    }}>
                      {setting.title}
                    </Text>
                  </View>
                  
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280',
                    lineHeight: 20,
                    marginBottom: 8
                  }}>
                    {setting.description}
                  </Text>
                  
                  {setting.time && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Text style={{ fontSize: 12, marginRight: 4 }}>🕐</Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#059669',
                        fontWeight: '500'
                      }}>
                        {setting.time}
                      </Text>
                    </View>
                  )}
                </View>
                
                <Switch
                  value={preferences[setting.key]}
                  onValueChange={() => handleToggle(setting.key)}
                  trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                  thumbColor={preferences[setting.key] ? '#059669' : '#9ca3af'}
                  ios_backgroundColor="#e5e7eb"
                />
              </View>
            </View>
          ))}
        </View>
        
        {/* Pulsante salva */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#030213',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: isSaving ? 0.6 : 1
            }}
            onPress={savePreferences}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600'
              }}>
                Salva Preferenze
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Note */}
        <View style={{
          backgroundColor: '#fef3c7',
          margin: 16,
          padding: 16,
          borderRadius: 12
        }}>
          <Text style={{
            fontSize: 14,
            color: '#92400e',
            fontWeight: '600',
            marginBottom: 8
          }}>
            ⚠️ Nota importante
          </Text>
          <Text style={{
            fontSize: 13,
            color: '#78350f',
            lineHeight: 20
          }}>
            Per ricevere le notifiche, assicurati di aver dato i permessi all'app nelle impostazioni del tuo dispositivo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}