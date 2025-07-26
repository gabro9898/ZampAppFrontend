// src/screens/HomeScreen.js (SOSTITUISCI QUELLO ESISTENTE)
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useGetChallengesQuery, useJoinChallengeMutation } from '../store/services/challengeApi';

export function HomeScreen() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // API calls
  const { 
    data: challenges = [], 
    isLoading, 
    error, 
    refetch 
  } = useGetChallengesQuery();
  
  const [joinChallenge, { isLoading: isJoining }] = useJoinChallengeMutation();

  const userStats = {
    level: user?.level || 12,
    xp: 2840,
    nextLevelXp: 3000,
    streak: user?.streak || 7,
    challengesCompleted: user?.challengesPlayed || 23,
    prizesWon: user?.prizesWon || 5
  };

  // Filtra le challenge
  const filteredChallenges = challenges.filter(challenge => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'free') return challenge.gameMode === 'free' || challenge.price == 0;
    if (activeFilter === 'premium') return challenge.gameMode === 'premium' || challenge.price > 0;
    if (activeFilter === 'vip') return challenge.gameMode === 'vip';
    return true;
  });

  // Funzioni helper
  const getTypeColor = (challenge) => {
    if (challenge.gameMode === 'free' || challenge.price == 0) return '#059669';
    if (challenge.gameMode === 'premium' || challenge.price > 0) return '#2563eb';
    if (challenge.gameMode === 'vip') return '#7c3aed';
    return '#6b7280';
  };

  const getTypeIcon = (challenge) => {
    if (challenge.gameMode === 'free' || challenge.price == 0) return '🎁';
    if (challenge.gameMode === 'premium' || challenge.price > 0) return '⭐';
    if (challenge.gameMode === 'vip') return '👑';
    return '📋';
  };

  const getTypeLabel = (challenge) => {
    if (challenge.gameMode === 'free' || challenge.price == 0) return 'Gratis';
    if (challenge.gameMode === 'premium' || challenge.price > 0) return 'Premium';
    if (challenge.gameMode === 'vip') return 'VIP';
    return challenge.gameMode;
  };

  const formatTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Terminata';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} giorni`;
    if (hours > 0) return `${hours} ore`;
    return 'Poche ore';
  };

  const formatPrize = (prize) => {
    if (typeof prize === 'number') return `€${prize}`;
    return String(prize || 'Da definire');
  };

  const getGameIcon = (gameType) => {
    switch (gameType) {
      case 'timer': return '⏱️';
      case 'steps': return '👣';
      case 'photo': return '📸';
      case 'quiz': return '🧠';
      default: return '🎮';
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await joinChallenge(challengeId).unwrap();
      // Potresti mostrare un toast di successo qui
      console.log('✅ Iscritto alla challenge con successo!');
    } catch (error) {
      console.log('❌ Errore iscrizione:', error);
      // Potresti mostrare un alert di errore qui
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f9fafb',
        paddingBottom: 100 
      }}>
        <ActivityIndicator size="large" color="#030213" />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: '#6b7280' 
        }}>
          Caricamento challenge...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !isLoading) {
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
        <View style={{
          backgroundColor: '#030213',
          padding: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
            marginTop: 20
          }}>
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 4
              }}>
                Ciao, {user?.firstName || 'Utente'}! 👋
              </Text>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Livello {userStats.level} • {userStats.streak} giorni di streak
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}>
              <Text style={{ fontSize: 16, marginRight: 4 }}>🔥</Text>
              <Text style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 14
              }}>
                {userStats.streak}
              </Text>
            </View>
          </View>

          {/* Progress bar per livello successivo */}
          <View style={{ marginBottom: 20 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 8
            }}>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                XP Progress
              </Text>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {userStats.xp}/{userStats.nextLevelXp}
              </Text>
            </View>
            <View style={{
              height: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <View style={{
                height: '100%',
                width: `${(userStats.xp / userStats.nextLevelXp) * 100}%`,
                backgroundColor: '#10b981',
                borderRadius: 4
              }} />
            </View>
          </View>

          {/* Statistiche rapide */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              padding: 16,
              flex: 1,
              alignItems: 'center',
              marginRight: 8
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 4
              }}>
                {userStats.challengesCompleted}
              </Text>
              <Text style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center'
              }}>
                Challenge Completate
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              padding: 16,
              flex: 1,
              alignItems: 'center',
              marginHorizontal: 4
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 4
              }}>
                {userStats.prizesWon}
              </Text>
              <Text style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center'
              }}>
                Premi Vinti
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              padding: 16,
              flex: 1,
              alignItems: 'center',
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 4
              }}>
                {userStats.level}
              </Text>
              <Text style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center'
              }}>
                Livello Attuale
              </Text>
            </View>
          </View>
        </View>

        {/* Contenuto principale */}
        <View style={{ padding: 16 }}>
          {/* Filtri Challenge */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 4,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4
          }}>
            {[
              { id: 'all', label: 'Tutte' },
              { id: 'free', label: 'Gratis' },
              { id: 'premium', label: 'Premium' },
              { id: 'vip', label: 'VIP' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderRadius: 12,
                  backgroundColor: activeFilter === filter.id ? '#030213' : 'transparent'
                }}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: activeFilter === filter.id ? 'white' : '#6b7280'
                }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
                Non ci sono challenge {activeFilter !== 'all' ? 'per questo filtro' : 'disponibili al momento'}
              </Text>
            </View>
          ) : (
            filteredChallenges.map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  marginBottom: 16,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                {/* Header Challenge */}
                <View style={{
                  height: 160,
                  backgroundColor: '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  <Text style={{ fontSize: 48, opacity: 0.5 }}>
                    {getGameIcon(challenge.game?.type)}
                  </Text>
                  
                  {/* Badge tipo challenge */}
                  <View style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    backgroundColor: getTypeColor(challenge),
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Text style={{ fontSize: 12, marginRight: 4 }}>
                      {getTypeIcon(challenge)}
                    </Text>
                    <Text style={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: '600'
                    }}>
                      {getTypeLabel(challenge)}
                    </Text>
                  </View>

                  {/* Badge tempo rimanente */}
                  <View style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Text style={{ fontSize: 12, marginRight: 4 }}>⏰</Text>
                    <Text style={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: '500'
                    }}>
                      {formatTimeLeft(challenge.endDate)}
                    </Text>
                  </View>
                </View>

                {/* Contenuto Challenge */}
                <View style={{ padding: 16 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#030213',
                        marginBottom: 4
                      }}>
                        {challenge.name}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: '#6b7280',
                        lineHeight: 20
                      }}>
                        {challenge.description || 'Nessuna descrizione disponibile'}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 24, marginLeft: 12 }}>🏆</Text>
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, marginRight: 4 }}>👥</Text>
                      <Text style={{
                        fontSize: 14,
                        color: '#6b7280'
                      }}>
                        {challenge._count?.participants || 0}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 4
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>
                        {challenge.game?.name || 'Game'}
                      </Text>
                    </View>
                  </View>

                  <View style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 16
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        fontSize: 14,
                        color: '#6b7280'
                      }}>
                        Premio:
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        {formatPrize(challenge.prize)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={{
                      backgroundColor: '#030213',
                      borderRadius: 12,
                      paddingVertical: 16,
                      alignItems: 'center',
                      opacity: isJoining ? 0.6 : 1
                    }}
                    onPress={() => handleJoinChallenge(challenge.id)}
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={{
                        color: 'white',
                        fontSize: 16,
                        fontWeight: '600'
                      }}>
                        Partecipa alla Challenge
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}