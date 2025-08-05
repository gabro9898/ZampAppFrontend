// src/screens/HomeScreen.js - Versione COMPLETA con gestione pacchetti e challenge paid
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useGetChallengesQuery, useJoinChallengeMutation } from '../store/services/challengeApi';
import { usePurchaseChallengeMutation } from '../store/services/shopApi';
import { useGetProfileQuery } from '../store/services/authApi';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Componenti separati
import { UserStatsHeader } from '../components/UserStatsHeader';
import { ChallengeFilters } from '../components/ChallengeFilters';
import { ChallengeCard } from '../components/ChallengeCard';

// Funzioni helper aggiornate
import { 
  filterChallenges, 
  isUserParticipating,
  canUserAccessChallenge,
  getAccessMessage 
} from '../utils/challengeHelpers';

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const hasInitialized = useRef(false);
  
  // API calls
  const { 
    data: challenges = [], 
    isLoading, 
    error, 
    refetch 
  } = useGetChallengesQuery();
  
  const [joinChallenge, { isLoading: isJoining }] = useJoinChallengeMutation();
  const [purchaseChallenge] = usePurchaseChallengeMutation();

  const { data: profileData } = useGetProfileQuery(undefined, { 
    skip: !user?.id,
  });

  useFocusEffect(
    useCallback(() => {
      if (hasInitialized.current && !isLoading && !refreshing) {
        console.log('🏠 HomeScreen focused - refreshing data...');
        refetch();
      }
      hasInitialized.current = true;
      
      return () => {
        console.log('🏠 HomeScreen unfocused');
      };
    }, [])
  );

  // Calcola statistiche utente
  const userStats = {
    level: profileData?.level || user?.level || 1,
    xp: profileData?.xp || user?.xp || 0,
    nextLevelXp: (profileData?.level || user?.level || 1) * 100,
    streak: profileData?.streak || user?.streak || 0,
    challengesCompleted: profileData?.challengesPlayed || user?.challengesPlayed || 0,
    prizesWon: profileData?.prizesWon || user?.prizesWon || 0
  };

  // Usa l'utente completo (con packageType) per il filtro
  const currentUser = profileData || user;
  
  // Filtra le challenge usando l'helper aggiornato
  const filteredChallenges = filterChallenges(challenges, activeFilter, currentUser);

  // Handlers
  const handleJoinChallenge = async (challengeId) => {
    try {
      await joinChallenge(challengeId).unwrap();
      Alert.alert(
        'Successo!',
        'Ti sei iscritto alla challenge! Ora puoi giocare.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Errore',
        error.data?.error || 'Non è stato possibile iscriverti alla challenge',
        [{ text: 'OK' }]
      );
    }
  };

  const handleNavigateToGame = (challenge) => {
    // Verifica che l'utente possa accedere
    if (!canUserAccessChallenge(challenge, currentUser)) {
      const message = getAccessMessage(challenge, currentUser);
      Alert.alert('Accesso negato', message);
      return;
    }
    
    navigation.navigate('TimerGame', {
      challengeId: challenge.id,
      challengeName: challenge.name
    });
  };

  // ✨ FUNZIONE AGGIORNATA per gestire acquisto + iscrizione automatica
  const handleChallengePress = async (challenge) => {
    // Se la challenge è a pagamento e non è stata acquistata
    if (challenge.gameMode === 'paid' && !challenge.purchasedBy?.some(p => p.userId === currentUser?.id)) {
      Alert.alert(
        'Challenge a pagamento',
        `Questa challenge costa ${challenge.userPrice || challenge.price}€. Vuoi acquistarla?`,
        [
          { text: 'Annulla', style: 'cancel' },
          { 
            text: 'Acquista e Iscriviti', 
            onPress: async () => {
              try {
                // Step 1: Acquista la challenge
                await purchaseChallenge({
                  userId: currentUser.id,
                  challengeId: challenge.id
                }).unwrap();
                
                console.log('✅ Challenge acquistata, ora iscrivo...');
                
                // Step 2: Iscriviti automaticamente
                try {
                  await joinChallenge(challenge.id).unwrap();
                  
                  Alert.alert(
                    'Successo!', 
                    'Challenge acquistata e iscrizione completata! Ora puoi giocare.',
                    [{ text: 'OK' }]
                  );
                  
                  // Ricarica le challenge per aggiornare lo stato
                  refetch();
                } catch (joinError) {
                  // Se l'iscrizione fallisce, almeno l'acquisto è andato
                  Alert.alert(
                    'Acquisto completato',
                    'Challenge acquistata! Ora puoi iscriverti.',
                    [{ text: 'OK' }]
                  );
                  refetch();
                }
                
              } catch (error) {
                Alert.alert(
                  'Errore',
                  error.data?.error || 'Errore durante l\'acquisto'
                );
              }
            }
          }
        ]
      );
      return;
    }
    
    // Se non è paid o è già stata acquistata, gestisci normalmente
    if (isUserParticipating(challenge, currentUser?.id)) {
      handleNavigateToGame(challenge);
    } else {
      // Verifica che possa accedere prima di iscriversi
      if (!canUserAccessChallenge(challenge, currentUser)) {
        const message = getAccessMessage(challenge, currentUser);
        Alert.alert('Accesso negato', message);
        return;
      }
      
      handleJoinChallenge(challenge.id);
    }
  };

  const onRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (isLoading && !refreshing && !hasInitialized.current) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f9fafb',
        paddingBottom: 100 
      }}>
        <ActivityIndicator size="large" color="#030213" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
          Caricamento challenge...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !isLoading) {
    console.log('❌ Error loading challenges:', error);
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f9fafb',
        padding: 20,
        paddingBottom: 100 
      }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>😵</Text>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#dc2626', 
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Errore nel caricamento
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: '#6b7280', 
          textAlign: 'center',
          marginBottom: 20
        }}>
          {error.data?.error || error.message || 'Errore di connessione'}
        </Text>
        <TouchableOpacity 
          onPress={refetch}
          style={{
            backgroundColor: '#030213',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 24
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Riprova
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con statistiche utente */}
        <UserStatsHeader user={currentUser} userStats={userStats} />

        {/* Badge pacchetto attivo */}
        {currentUser?.packageType && (
          <View style={{ 
            padding: 16, 
            paddingTop: 0 
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>
                  {currentUser.packageType === 'vip' ? '👑' : 
                   currentUser.packageType === 'premium' ? '💎' :
                   currentUser.packageType === 'pro' ? '⭐' : '🎁'}
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#030213'
                }}>
                  Pacchetto {currentUser.packageType.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('profile')}
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: '#030213'
                }}>
                  Upgrade
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Contenuto principale */}
        <View style={{ padding: 16 }}>
          {/* Filtri Challenge */}
          <ChallengeFilters 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            userPackage={currentUser?.packageType}
          />

          {/* Lista Challenge */}
          {filteredChallenges.length === 0 ? (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 40,
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🏆</Text>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#030213',
                marginBottom: 8
              }}>
                Nessuna challenge trovata
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {activeFilter !== 'all' ? 
                  'Non ci sono challenge disponibili per questo filtro con il tuo pacchetto' : 
                  'Non ci sono challenge attive al momento'}
              </Text>
              {currentUser?.packageType === 'free' && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('shop')}
                  style={{
                    marginTop: 16,
                    backgroundColor: '#030213',
                    borderRadius: 8,
                    paddingHorizontal: 20,
                    paddingVertical: 10
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    Esplora lo Shop
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredChallenges.map((challenge) => {
              const participating = isUserParticipating(challenge, currentUser?.id);
              const canAccess = canUserAccessChallenge(challenge, currentUser);
              
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isParticipating={participating}
                  canAccess={canAccess}
                  onNavigateToGame={handleNavigateToGame}
                  onJoinChallenge={handleJoinChallenge}
                  onPress={() => handleChallengePress(challenge)}
                  onPurchase={handleChallengePress}
                  isJoining={isJoining}
                  user={currentUser}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}