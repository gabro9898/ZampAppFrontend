// src/components/ChallengeDetailModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { 
  getTypeColor, 
  getTypeIcon, 
  getTypeLabel, 
  formatTimeLeft, 
  formatPrize,
  formatPrice,
  getGameIcon,
  hasUserPurchased
} from '../utils/challengeHelpers';
import { GameButton } from './GameButton';

const { height: screenHeight } = Dimensions.get('window');

export function ChallengeDetailModal({
  visible,
  challenge,
  user,
  isParticipating,
  canAccess,
  onClose,
  onJoinChallenge,
  onNavigateToGame,
  onPurchase,
  isJoining
}) {
  if (!challenge) return null;
  
  const isPaid = challenge.gameMode === 'paid';
  const hasPurchased = hasUserPurchased(challenge, user?.id);
  const now = new Date();
  const joinDeadline = new Date(challenge.joinDeadline);
  const endDate = new Date(challenge.endDate);
  const canJoin = now < joinDeadline;
  
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
          maxHeight: screenHeight * 0.9,
          paddingBottom: 20
        }}>
          {/* Header con immagine */}
          <View style={{
            height: 200,
            backgroundColor: '#f3f4f6',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <Text style={{ fontSize: 64, opacity: 0.5 }}>
              {getGameIcon(challenge.game?.type)}
            </Text>
            
            {/* Bottone chiudi */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
            
            {/* Badge tipo */}
            <View style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              backgroundColor: getTypeColor(challenge),
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 16, marginRight: 6 }}>
                {getTypeIcon(challenge)}
              </Text>
              <Text style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '600'
              }}>
                {getTypeLabel(challenge)}
              </Text>
            </View>
          </View>
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ paddingHorizontal: 20 }}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Titolo e info principali */}
            <View style={{ marginTop: 20 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#030213',
                marginBottom: 8
              }}>
                {challenge.name}
              </Text>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <View style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: '#6b7280'
                  }}>
                    {challenge.game?.name || 'Game'}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 14, marginRight: 4 }}>👥</Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280'
                  }}>
                    {challenge._count?.participants || 0} partecipanti
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Descrizione completa */}
            <View style={{
              backgroundColor: '#f9fafb',
              borderRadius: 16,
              padding: 16,
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#030213',
                marginBottom: 8
              }}>
                Descrizione
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#4b5563',
                lineHeight: 22
              }}>
                {challenge.description || 'Nessuna descrizione disponibile'}
              </Text>
            </View>
            
            {/* Regole */}
            {challenge.rules && (
              <View style={{
                backgroundColor: '#fef3c7',
                borderRadius: 16,
                padding: 16,
                marginBottom: 20
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: 8
                }}>
                  📋 Regole
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#78350f',
                  lineHeight: 22
                }}>
                  {challenge.rules}
                </Text>
              </View>
            )}
            
            {/* Info temporali */}
            <View style={{
              flexDirection: 'row',
              marginBottom: 20
            }}>
              <View style={{
                flex: 1,
                backgroundColor: '#e0f2fe',
                borderRadius: 16,
                padding: 16,
                marginRight: 8
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#075985',
                  marginBottom: 4
                }}>
                  ⏰ Giorni rimanenti per iscriversi
                </Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#0c4a6e'
                }}>
                  {formatTimeLeft(challenge.joinDeadline)}
                </Text>
              </View>
              
              <View style={{
                flex: 1,
                backgroundColor: '#f0fdf4',
                borderRadius: 16,
                padding: 16,
                marginLeft: 8
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#14532d',
                  marginBottom: 4
                }}>
                  🏁 Giorni alla fine della challenge
                </Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#166534'
                }}>
                  {formatTimeLeft(challenge.endDate)}
                </Text>
              </View>
            </View>
            
            {/* Info premio/prezzo */}
            <View style={{
              backgroundColor: '#f0fdf4',
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: '#86efac'
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View>
                  <Text style={{
                    fontSize: 14,
                    color: '#14532d',
                    marginBottom: 4
                  }}>
                    🏆 Premio in palio
                  </Text>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#059669'
                  }}>
                    {formatPrize(challenge.prize)}
                  </Text>
                </View>
                
                {isPaid && !hasPurchased && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{
                      fontSize: 12,
                      color: '#92400e',
                      marginBottom: 4
                    }}>
                      💰 Costo
                    </Text>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#f59e0b'
                    }}>
                      {formatPrice(challenge.userPrice || challenge.price)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Informazioni aggiuntive */}
            <View style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              padding: 16,
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#030213',
                marginBottom: 12
              }}>
                ℹ️ Informazioni
              </Text>
              
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  • Massimo partecipanti: {challenge.maxParticipants}
                </Text>
              </View>
              
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  • Inizio: {new Date(challenge.startDate).toLocaleDateString('it-IT')}
                </Text>
              </View>
              
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  • Fine: {new Date(challenge.endDate).toLocaleDateString('it-IT')}
                </Text>
              </View>
              
              <View>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  • Tentativi al giorno: {challenge.game?.maxAttemptsPerDay || 1}
                </Text>
              </View>
            </View>
            
            {/* Bottoni azione */}
            <View style={{ marginTop: 10 }}>
              {canAccess ? (
                <>
                  {!isParticipating && canJoin ? (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#030213',
                        borderRadius: 12,
                        paddingVertical: 16,
                        alignItems: 'center',
                        opacity: isJoining ? 0.6 : 1
                      }}
                      onPress={() => onJoinChallenge(challenge.id)}
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
                  ) : isParticipating ? (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#059669',
                        borderRadius: 12,
                        paddingVertical: 16,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center'
                      }}
                      onPress={() => {
                        onClose();
                        onNavigateToGame(challenge);
                      }}
                    >
                      <Text style={{
                        color: 'white',
                        fontSize: 16,
                        fontWeight: '600'
                      }}>
                        Gioca Ora
                      </Text>
                      <Text style={{
                        color: 'white',
                        fontSize: 16,
                        marginLeft: 8
                      }}>
                        🎮
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: 12,
                      paddingVertical: 16,
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        color: '#6b7280',
                        fontSize: 14,
                        fontWeight: '600'
                      }}>
                        Iscrizioni chiuse
                      </Text>
                    </View>
                  )}
                </>
              ) : isPaid && !hasPurchased ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#f59e0b',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    onClose();
                    onPurchase(challenge);
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Acquista per {formatPrice(challenge.userPrice || challenge.price)}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{
                  backgroundColor: '#dc2626',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: '600'
                  }}>
                    Richiede pacchetto {getTypeLabel(challenge)}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}