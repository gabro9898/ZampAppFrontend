// src/services/NotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configurazione handler notifiche
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Inizializza il servizio notifiche
   */
  async initialize() {
    try {
      // Verifica se siamo su un device fisico
      if (!Device.isDevice) {
        console.log('⚠️ Le notifiche push funzionano solo su dispositivi fisici');
        return false;
      }

      // Richiedi permessi
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Permesso notifiche negato');
        return false;
      }

      // Ottieni il token push
      const token = await this.getExpoPushToken();
      if (token) {
        await this.saveTokenToStorage(token);
        console.log('✅ Push token:', token);
      }

      // Setup listeners
      this.setupNotificationListeners();

      // Schedula notifiche di reminder
      await this.scheduleReminders();

      return true;
    } catch (error) {
      console.error('❌ Errore inizializzazione notifiche:', error);
      return false;
    }
  }

  /**
   * Ottieni Expo Push Token
   */
  async getExpoPushToken() {
    try {
      const projectId = 'your-project-id'; // Sostituisci con il tuo project ID
      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      return token.data;
    } catch (error) {
      console.error('Errore ottenimento token:', error);
      return null;
    }
  }

  /**
   * Salva token in AsyncStorage
   */
  async saveTokenToStorage(token) {
    try {
      await AsyncStorage.setItem('expoPushToken', token);
    } catch (error) {
      console.error('Errore salvataggio token:', error);
    }
  }

  /**
   * Setup listeners per notifiche
   */
  setupNotificationListeners() {
    // Listener per quando arriva una notifica
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notifica ricevuta:', notification);
    });

    // Listener per quando l'utente tocca la notifica
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notifica toccata:', response);
      // Naviga alla schermata appropriata
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Gestisci la risposta alla notifica
   */
  handleNotificationResponse(response) {
    const data = response.notification.request.content.data;
    
    if (data.type === 'new_attempt') {
      // Naviga alle challenge
      // navigation.navigate('challenges');
    } else if (data.type === 'leaderboard_update') {
      // Naviga alla challenge specifica
      // navigation.navigate('challenge', { id: data.challengeId });
    }
  }

  /**
   * Invia notifica locale immediata
   */
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          badge: 1,
        },
        trigger: null, // Immediata
      });
    } catch (error) {
      console.error('Errore invio notifica:', error);
    }
  }

  /**
   * Schedula notifica per nuovo tentativo disponibile
   */
  async scheduleNewAttemptNotification(resetTime) {
    try {
      const [hours, minutes] = resetTime.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎮 Nuovo tentativo disponibile!',
          body: 'Hai un nuovo tentativo per le tue challenge attive',
          data: { type: 'new_attempt' },
          sound: true,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
      
      console.log(`✅ Notifica nuovo tentativo schedulata per le ${resetTime}`);
    } catch (error) {
      console.error('Errore scheduling notifica:', error);
    }
  }

  /**
   * Schedula reminder periodici
   */
  async scheduleReminders() {
    try {
      // Cancella notifiche esistenti
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Notifica alle 10:00 per nuovo tentativo
      await this.scheduleNewAttemptNotification('10:00');

      // Reminder pomeridiano alle 15:00
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Non dimenticare le tue challenge!',
          body: 'Hai ancora tempo per migliorare il tuo punteggio',
          data: { type: 'reminder' },
        },
        trigger: {
          hour: 15,
          minute: 0,
          repeats: true,
        },
      });

      // Reminder serale alle 20:00
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Ultimo reminder del giorno',
          body: 'Domani avrai nuovi tentativi disponibili!',
          data: { type: 'evening_reminder' },
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });

      console.log('✅ Notifiche reminder schedulate');
    } catch (error) {
      console.error('Errore scheduling reminders:', error);
    }
  }

  /**
   * Notifica quando si viene superati in classifica
   */
  async notifyLeaderboardChange(challengeName, newPosition) {
    await this.sendLocalNotification(
      '📊 Sei stato superato!',
      `La tua posizione in "${challengeName}" è ora #${newPosition}`,
      { type: 'leaderboard_update', challengeName }
    );
  }

  /**
   * Notifica quando mancano poche ore alla fine
   */
  async notifyChallengeEnding(challengeName, hoursLeft) {
    await this.sendLocalNotification(
      '⏳ Challenge in scadenza!',
      `Mancano solo ${hoursLeft} ore alla fine di "${challengeName}"`,
      { type: 'challenge_ending', challengeName }
    );
  }

  /**
   * Notifica streak in pericolo
   */
  async notifyStreakWarning(currentStreak) {
    await this.sendLocalNotification(
      '🔥 Il tuo streak è in pericolo!',
      `Non perdere il tuo streak di ${currentStreak} giorni! Gioca ora`,
      { type: 'streak_warning' }
    );
  }

  /**
   * Ottieni preferenze notifiche utente
   */
  async getNotificationPreferences() {
    try {
      const prefs = await AsyncStorage.getItem('notificationPreferences');
      return prefs ? JSON.parse(prefs) : {
        newAttempts: true,
        reminders: true,
        leaderboardUpdates: true,
        challengeEndings: true,
        streakWarnings: true,
      };
    } catch (error) {
      console.error('Errore lettura preferenze:', error);
      return null;
    }
  }

  /**
   * Salva preferenze notifiche
   */
  async saveNotificationPreferences(preferences) {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      // Rischedula le notifiche in base alle nuove preferenze
      await this.scheduleReminders();
    } catch (error) {
      console.error('Errore salvataggio preferenze:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();