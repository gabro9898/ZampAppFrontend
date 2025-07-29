// src/screens/HomeScreen.js - Versione Corretta Senza Loop
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
import { useGetProfileQuery } from '../store/services/authApi';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Componenti separati
import { UserStatsHeader } from '../components/UserStatsHeader';
import { ChallengeFilters } from '../components/ChallengeFilters';
import { ChallengeCard } from '../components/ChallengeCard';

// Funzioni helper
import { filterChallenges, isUserParticipating } from '../utils/challengeHelpers';

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

  // ✅ CORREZIONE: Skip il profilo se non necessario per evitare loop
  const { data: profileData } = useGetProfileQuery(undefined, { 
    skip: !user?.id,
    // ❌ RIMOSSO: Qualsiasi polling automatico
  });

  // ✅ CORREZIONE: Usa useFocusEffect con useRef per evitare chiamate multiple
  useFocusEffect(
    useCallback(() => {
      // Solo se non è la prima volta e non stiamo già caricando
      if (hasInitialized.current && !isLoading && !refreshing) {
        console.log('🏠 HomeScreen focused - refreshing data...');
        refetch();
      }
      hasInitialized.current = true;
      
      return () => {
        console.log('🏠 HomeScreen unfocused');
      };
    }, []) // ✅ IMPORTANTE: Array vuoto per evitare loop
  );

  // ✅ CORREZIONE: Rimuovi useEffect che loggava continuamente
  
  // Calcola statistiche utente - usa profileData se disponibile
  const userStats = {
    level: profileData?.level || user?.level || 1,
    xp: profileData?.xp || user?.xp || 0,
    nextLevelXp: (profileData?.level || user?.level || 1) * 100,
    streak: profileData?.streak || user?.streak || 0,
    challengesCompleted: profileData?.challengesPlayed || user?.challengesPlayed || 0,
    prizesWon: profileData?.prizesWon || user?.prizesWon || 0
  };

  // Filtra le challenge usando l'helper ottimizzato
  const filteredChallenges = filterChallenges(challenges, activeFilter);

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
    navigation.navigate('TimerGame', {
      challengeId: challenge.id,
      challengeName: challenge.name
    });
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
        <UserStatsHeader user={profileData || user} userStats={userStats} />

        {/* Contenuto principale */}
        <View style={{ padding: 16 }}>
          {/* Filtri Challenge */}
          <ChallengeFilters 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
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
                Non ci sono challenge {activeFilter !== 'all' ? 'per questo filtro' : 'attive al momento'}
              </Text>
            </View>
          ) : (
            filteredChallenges.map((challenge) => {
              const participating = isUserParticipating(challenge, user?.id);
              
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isParticipating={participating}
                  onNavigateToGame={handleNavigateToGame}
                  onJoinChallenge={handleJoinChallenge}
                  isJoining={isJoining}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}