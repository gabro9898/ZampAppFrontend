// src/screens/ChallengesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Modal
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useGetUserChallengesQuery } from '../store/services/challengeApi';
import { useGetLeaderboardQuery } from '../store/services/gameApi';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Componente Modal per la classifica
function LeaderboardModal({ visible, onClose, challengeId, challengeName }) {
  const { data: leaderboard, isLoading } = useGetLeaderboardQuery(
    challengeId,
    { skip: !visible || !challengeId }
  );
  
  const { user } = useAuth();
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end'
      }}>
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '80%',
          padding: 20
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#030213'
              }}>
                🏆 Classifica
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                marginTop: 4
              }}>
                {challengeName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={{
                fontSize: 24,
                color: '#6b7280'
              }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Contenuto */}
          {isLoading ? (
            <View style={{
              alignItems: 'center',
              paddingVertical: 40
            }}>
              <ActivityIndicator size="large" color="#030213" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Posizione dell'utente */}
              {leaderboard?.userRank && (
                <View style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280',
                    marginBottom: 4
                  }}>
                    La tua posizione
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Text style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#030213'
                    }}>
                      #{leaderboard.userRank.rank}
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: '#059669',
                      fontWeight: '600'
                    }}>
                      {(leaderboard.userRank.bestScore / 1000).toFixed(3)}s
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Classifica */}
              {leaderboard?.leaderboard?.map((entry, index) => {
                const isCurrentUser = entry.userId === user?.id;
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                
                return (
                  <View
                    key={entry.userId}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor: isCurrentUser ? '#e0f2fe' : 'white',
                      borderRadius: 12,
                      marginBottom: 8,
                      borderWidth: isCurrentUser ? 2 : 0,
                      borderColor: '#0284c7'
                    }}
                  >
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#030213',
                      width: 40
                    }}>
                      {medal || `#${entry.rank}`}
                    </Text>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: isCurrentUser ? 'bold' : '500',
                        color: '#030213'
                      }}>
                        {entry.firstName} {entry.lastName}
                        {isCurrentUser && ' (Tu)'}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#6b7280'
                      }}>
                        {entry.totalAttempts} tentativi
                      </Text>
                    </View>
                    
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#059669'
                    }}>
                      {(entry.bestScore / 1000).toFixed(3)}s
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

export function ChallengesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const { 
    data: userChallenges = [], 
    isLoading, 
    refetch 
  } = useGetUserChallengesQuery(user?.id, {
    skip: !user?.id
  });

  // IMPORTANTE: Refresh automatico quando la schermata riceve il focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refetch();
      }
    }, [user?.id, refetch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Se non c'è utente autenticato
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 24, marginBottom: 16 }}>🔒</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
            Accesso richiesto
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, textAlign: 'center' }}>
            Devi effettuare il login per vedere le tue challenge
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={{ 
              paddingHorizontal: 24, 
              paddingVertical: 12, 
              backgroundColor: '#030213', 
              borderRadius: 8 
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Vai al Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Filtra challenge attive vs completate
  const now = new Date();
  const activeChallenges = userChallenges.filter(
    ch => new Date(ch.endDate) > now
  );
  const completedChallenges = userChallenges.filter(
    ch => new Date(ch.endDate) <= now
  );

  const displayedChallenges = activeTab === 'active' 
    ? activeChallenges 
    : completedChallenges;

  const formatTimeLeft = (endDate) => {
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Terminata';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 7) return `${Math.floor(days / 7)} settimane`;
    if (days > 0) return `${days} giorni`;
    if (hours > 0) return `${hours} ore`;
    return 'Poche ore';
  };

  const getGameTypeInfo = (gameType) => {
    switch (gameType) {
      case 'timer':
        return { icon: '⏱️', name: 'Timer 10s', color: '#3b82f6' };
      case 'steps':
        return { icon: '👣', name: 'Contapassi', color: '#10b981' };
      case 'quiz':
        return { icon: '🧠', name: 'Quiz', color: '#8b5cf6' };
      default:
        return { icon: '🎮', name: 'Gioco', color: '#6b7280' };
    }
  };

  const openLeaderboard = (challenge) => {
    setSelectedChallenge(challenge);
    setShowLeaderboard(true);
  };

  if (isLoading && !refreshing) {
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
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={{
          backgroundColor: '#030213',
          padding: 20,
          paddingTop: 40,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 8
          }}>
            Le Mie Challenge 🏆
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            {activeChallenges.length} challenge attive
          </Text>
        </View>

        <View style={{ padding: 16 }}>
          {/* Tabs */}
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
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: activeTab === 'active' ? '#030213' : 'transparent'
              }}
              onPress={() => setActiveTab('active')}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'active' ? 'white' : '#6b7280'
              }}>
                Attive ({activeChallenges.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: activeTab === 'completed' ? '#030213' : 'transparent'
              }}
              onPress={() => setActiveTab('completed')}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'completed' ? 'white' : '#6b7280'
              }}>
                Completate ({completedChallenges.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista Challenge */}
          {displayedChallenges.length === 0 ? (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 40,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>
                {activeTab === 'active' ? '🎯' : '🏅'}
              </Text>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#030213',
                marginBottom: 8,
                textAlign: 'center'
              }}>
                {activeTab === 'active' 
                  ? 'Nessuna challenge attiva'
                  : 'Nessuna challenge completata'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {activeTab === 'active' 
                  ? 'Iscriviti a una challenge dalla home!'
                  : 'Completa le tue prime challenge!'}
              </Text>
            </View>
          ) : (
            displayedChallenges.map((challenge) => {
              const gameInfo = getGameTypeInfo(challenge.game?.type);
              
              return (
                <TouchableOpacity
                  key={challenge.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4
                  }}
                  onPress={() => openLeaderboard(challenge)}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <View style={{
                      width: 60,
                      height: 60,
                      backgroundColor: `${gameInfo.color}20`,
                      borderRadius: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16
                    }}>
                      <Text style={{ fontSize: 32 }}>{gameInfo.icon}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#030213',
                        marginBottom: 4
                      }}>
                        {challenge.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                          backgroundColor: gameInfo.color,
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          marginRight: 8
                        }}>
                          <Text style={{
                            fontSize: 12,
                            color: 'white',
                            fontWeight: '500'
                          }}>
                            {gameInfo.name}
                          </Text>
                        </View>
                        <Text style={{
                          fontSize: 14,
                          color: '#6b7280'
                        }}>
                          {activeTab === 'active' 
                            ? `⏰ ${formatTimeLeft(challenge.endDate)}`
                            : '✅ Completata'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 4
                      }}>
                        Tocca per
                      </Text>
                      <View style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: 20,
                        paddingHorizontal: 12,
                        paddingVertical: 8
                      }}>
                        <Text style={{
                          color: '#030213',
                          fontSize: 12,
                          fontWeight: '600'
                        }}>
                          CLASSIFICA 📊
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Statistiche */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6'
                  }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#030213'
                      }}>
                        {challenge.score ? (challenge.score / 1000).toFixed(3) + 's' : '-'}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#6b7280'
                      }}>
                        Miglior Tempo
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#030213'
                      }}>
                        #{challenge.rank || '-'}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#6b7280'
                      }}>
                        Posizione
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#030213'
                      }}>
                        {challenge.attempts || 0}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#6b7280'
                      }}>
                        Tentativi
                      </Text>
                    </View>
                  </View>
                  
                  {/* Bottone Gioca per challenge attive */}
                  {activeTab === 'active' && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#059669',
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: 'center',
                        marginTop: 12
                      }}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('TimerGame', {
                          challengeId: challenge.id,
                          challengeName: challenge.name
                        });
                      }}
                    >
                      <Text style={{
                        color: 'white',
                        fontSize: 14,
                        fontWeight: '600'
                      }}>
                        GIOCA ORA 🎮
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
      
      {/* Modal Classifica */}
      <LeaderboardModal
        visible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        challengeId={selectedChallenge?.id}
        challengeName={selectedChallenge?.name}
      />
    </SafeAreaView>
  );
}