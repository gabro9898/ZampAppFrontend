// src/screens/TimerGameScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useCheckAttemptStatusQuery, useSubmitTimerAttemptMutation } from '../store/services/gameApi';
import { useGetProfileQuery } from '../store/services/authApi';

export function TimerGameScreen({ route, navigation }) {
  const { challengeId, challengeName } = route.params;
  
  // Stati del timer
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMillis, setElapsedMillis] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  // Refs per il timer
  const startTimeRef = useRef(null); 
  const intervalRef = useRef(null);
  
  // API calls con polling per aggiornare lo stato
  const { 
    data: attemptStatus, 
    isLoading: isCheckingStatus,
    refetch: refetchStatus,
    error: statusError 
  } = useCheckAttemptStatusQuery(challengeId, {
    // Ricontrolla ogni 5 secondi se l'utente non può giocare
    pollingInterval: attemptStatus?.canPlay === false ? 5000 : 0,
    // Ricontrolla sempre quando si entra nella schermata
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  });
  
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitTimerAttemptMutation();

  // *** NUOVO: Hook per il refresh del profilo ***
  const { refetch: refetchProfile } = useGetProfileQuery(undefined, { 
    skip: false 
  });

  // Debug log per capire cosa sta succedendo
  useEffect(() => {
    console.log('🎮 Attempt Status:', attemptStatus);
    console.log('❓ Can Play:', attemptStatus?.canPlay);
    console.log('❌ Status Error:', statusError);
  }, [attemptStatus, statusError]);

  // Effetto per aggiornare il timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        setElapsedMillis(elapsed);
      }, 10); // Aggiorna ogni 10ms per mostrare i centesimi
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Formatta il tempo in formato MM:SS:CC
  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((millis % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // Gestione start/stop
  const handleStart = () => {
    setElapsedMillis(0);
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setLastResult(null);
  };

  // *** MODIFICATO: Gestione stop con aggiornamento profilo ***
  const handleStop = async () => {
    console.log('⏹️ Stopping timer');
    setIsRunning(false);
    const finalTime = elapsedMillis;
    
    // Calcola la differenza da 10 secondi
    const targetMillis = 10000;
    const diffMillis = Math.abs(targetMillis - finalTime);
    const accuracy = ((targetMillis - diffMillis) / targetMillis * 100).toFixed(2);
    
    console.log('📊 Timer result:', { finalTime, diffMillis, accuracy });
    
    // Mostra risultato temporaneo
    setLastResult({
      elapsedMillis: finalTime,
      diffMillis,
      accuracy
    });
    
    // Invia il tentativo
    try {
      console.log('📤 Submitting attempt...');
      const result = await submitAttempt({
        challengeId,
        attemptData: { elapsedMillis: finalTime }
      }).unwrap();
      
      console.log('✅ Attempt submitted:', result);
      setHasPlayed(true);
      
      // *** IMPORTANTE: Aggiorna il profilo per avere XP aggiornati ***
      console.log('🔄 Updating user profile after game...');
      setTimeout(() => {
        refetchProfile();
      }, 500);
      
      // Mostra feedback
      Alert.alert(
        '🎯 Tentativo Registrato!',
        `Tempo: ${formatTime(finalTime)}\nDifferenza: ${(diffMillis / 1000).toFixed(3)}s\nAccuratezza: ${accuracy}%\nPunteggio: ${result.scoreDetails?.score || result.score || diffMillis}`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('🔄 Refreshing status after submission');
              // Ricarica lo stato dopo aver giocato
              refetchStatus();
              setHasPlayed(false); // Reset per permettere di vedere lo stato aggiornato
            }
          }
        ]
      );
    } catch (error) {
      console.log('❌ Submit error:', error);
      Alert.alert(
        'Errore',
        error.data?.error || 'Errore nell\'invio del tentativo',
        [{ text: 'OK' }]
      );
    }
  };

  // Calcola se può giocare - usa tutti i possibili campi dal backend
  const canPlay = attemptStatus?.canPlay || 
                  attemptStatus?.canAttempt || 
                  (attemptStatus?.status?.remainingAttempts > 0);

  // Gestione errore di autorizzazione
  if (statusError?.status === 403) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', top: 60, left: 20 }}
          >
            <Text style={{ fontSize: 16 }}>← Indietro</Text>
          </TouchableOpacity>
          
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#030213',
            marginBottom: 8,
            textAlign: 'center'
          }}>
            Non sei iscritto
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 20
          }}>
            Devi iscriverti alla challenge per poter giocare
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: '#030213',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 24
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              Torna alla Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isCheckingStatus) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#030213" />
          <Text style={{ marginTop: 16, color: '#6b7280' }}>
            Caricamento stato gioco...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
            {challengeName}
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Timer 10 Secondi Challenge
          </Text>
        </View>

        {/* Stato del gioco */}
        {attemptStatus && (
          <View style={{
            backgroundColor: 'white',
            margin: 16,
            padding: 16,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#030213',
              marginBottom: 12
            }}>
              📊 Statistiche Giornaliere
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#6b7280' }}>Tentativi oggi:</Text>
              <Text style={{ fontWeight: '600', color: '#030213' }}>
                {attemptStatus.status?.attemptsToday || 0}/{attemptStatus.status?.maxAttemptsPerDay || 1}
              </Text>
            </View>
            
            {attemptStatus.todayBest && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#6b7280' }}>Miglior tempo oggi:</Text>
                <Text style={{ fontWeight: '600', color: '#059669' }}>
                  {(attemptStatus.todayBest.diffMillis / 1000).toFixed(3)}s di differenza
                </Text>
              </View>
            )}
            
            {!canPlay && attemptStatus.status?.nextResetDate && (
              <View style={{
                backgroundColor: '#fef3c7',
                borderRadius: 8,
                padding: 12,
                marginTop: 12
              }}>
                <Text style={{ color: '#92400e', fontSize: 14, textAlign: 'center' }}>
                  ⏰ Prossimo tentativo disponibile alle{' '}
                  {new Date(attemptStatus.status.nextResetDate).toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}

            {attemptStatus.message && (
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
                marginTop: 12,
                fontStyle: 'italic'
              }}>
                {attemptStatus.message}
              </Text>
            )}
          </View>
        )}

        {/* Area del gioco */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          {/* Display del timer */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 40,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
            marginBottom: 40
          }}>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              {isRunning ? 'Fermalo a 10 secondi!' : 'Pronto?'}
            </Text>
            
            <Text style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#030213',
              fontVariant: ['tabular-nums'],
              marginBottom: 8
            }}>
              {formatTime(elapsedMillis)}
            </Text>
            
            {lastResult && !isRunning && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 18,
                  color: lastResult.accuracy >= 95 ? '#059669' : 
                         lastResult.accuracy >= 90 ? '#eab308' : '#dc2626',
                  fontWeight: '600'
                }}>
                  {lastResult.accuracy >= 95 ? '🎯 Eccellente!' : 
                   lastResult.accuracy >= 90 ? '👍 Buono!' : '💪 Riprova!'}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#6b7280',
                  marginTop: 4
                }}>
                  Differenza: {(lastResult.diffMillis / 1000).toFixed(3)}s
                </Text>
              </View>
            )}
          </View>

          {/* Bottoni di controllo */}
          {canPlay ? (
            !isRunning ? (
              <TouchableOpacity
                onPress={handleStart}
                style={{
                  backgroundColor: '#059669',
                  borderRadius: 100,
                  width: 120,
                  height: 120,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold'
                }}>
                  START
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleStop}
                style={{
                  backgroundColor: '#dc2626',
                  borderRadius: 100,
                  width: 120,
                  height: 120,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#dc2626',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <Text style={{
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold'
                  }}>
                    STOP
                  </Text>
                )}
              </TouchableOpacity>
            )
          ) : (
            <View style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
              <Text style={{
                fontSize: 16,
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {hasPlayed ? 'Hai già giocato oggi!' : attemptStatus?.message || 'Non puoi giocare ora'}
              </Text>
            </View>
          )}
        </View>

        {/* Istruzioni */}
        <View style={{
          backgroundColor: '#e0f2fe',
          margin: 16,
          padding: 16,
          borderRadius: 12
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#0369a1',
            marginBottom: 8
          }}>
            💡 Come giocare
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#0c4a6e',
            lineHeight: 20
          }}>
            1. Premi START per avviare il timer{'\n'}
            2. Conta mentalmente fino a 10 secondi{'\n'}
            3. Premi STOP il più vicino possibile a 10.00{'\n'}
            4. Più ti avvicini, più alto sarà il punteggio!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}