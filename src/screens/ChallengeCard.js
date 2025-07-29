// src/components/ChallengeCard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GameButton } from './GameButton';
import { 
  getTypeColor, 
  getTypeIcon, 
  getTypeLabel, 
  formatTimeLeft, 
  formatPrize,
  formatPrice,
  getGameIcon,
  getAccessMessage,
  hasUserPurchased
} from '../utils/challengeHelpers';

export function ChallengeCard({ 
  challenge, 
  isParticipating, 
  canAccess,
  onNavigateToGame, 
  onJoinChallenge,
  onPress,
  isJoining,
  user
}) {
  const isPaid = challenge.gameMode === 'paid';
  const hasPurchased = hasUserPurchased(challenge, user?.id);
  const accessMessage = !canAccess ? getAccessMessage(challenge, user) : null;
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        opacity: canAccess ? 1 : 0.8
      }}
      onPress={onPress}
      disabled={!user}
    >
      {/* Header Challenge */}
      <View style={{
        height: 160,
        backgroundColor: canAccess ? '#f3f4f6' : '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        <Text style={{ fontSize: 48, opacity: canAccess ? 0.5 : 0.3 }}>
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

        {/* Badge stato */}
        {!canAccess && (
          <View style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            backgroundColor: '#dc2626',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 12, marginRight: 4 }}>🔒</Text>
            <Text style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '600'
            }}>
              {isPaid && !hasPurchased ? 'Da acquistare' : 'Pacchetto richiesto'}
            </Text>
          </View>
        )}
        
        {/* Badge iscritto */}
        {canAccess && isParticipating && (
          <View style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            backgroundColor: '#059669',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 12, marginRight: 4 }}>✅</Text>
            <Text style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '600'
            }}>
              Sei iscritto
            </Text>
          </View>
        )}
        
        {/* Badge acquistata */}
        {isPaid && hasPurchased && !isParticipating && (
          <View style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            backgroundColor: '#f59e0b',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 12, marginRight: 4 }}>🎫</Text>
            <Text style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '600'
            }}>
              Acquistata
            </Text>
          </View>
        )}
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

        {/* Info premio/prezzo */}
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
          
          {/* Mostra il prezzo se è una challenge a pagamento non acquistata */}
          {isPaid && !hasPurchased && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb'
            }}>
              <Text style={{
                fontSize: 14,
                color: '#6b7280'
              }}>
                Costo:
              </Text>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#f59e0b'
              }}>
                {formatPrice(challenge.userPrice || challenge.price)}
              </Text>
            </View>
          )}
        </View>

        {/* Bottone dinamico con stato */}
        {canAccess ? (
          <GameButton
            challenge={challenge}
            isParticipating={isParticipating}
            onJoin={onJoinChallenge}
            onPlay={onNavigateToGame}
            isJoining={isJoining}
          />
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
              {accessMessage}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}