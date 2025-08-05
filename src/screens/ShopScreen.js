// src/screens/ShopScreen.js - Versione Corretta con Redux
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useGetShopChallengesQuery, usePurchaseChallengeMutation } from '../store/services/shopApi';
import { useJoinChallengeMutation } from '../store/services/challengeApi';
import { useValidateReceiptMutation } from '../store/services/subscriptionApi';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../store/slices/uiSlice';
import { useNavigation } from '@react-navigation/native';
import { 
  formatPrice, 
  formatPrize, 
  formatTimeLeft,
  getGameIcon 
} from '../utils/challengeHelpers';

export function ShopScreen() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [purchasingId, setPurchasingId] = useState(null);
  
  const { 
    data: shopChallenges = [], 
    isLoading,
    refetch 
  } = useGetShopChallengesQuery(user?.id, {
    skip: !user?.id
  });
  
  const [purchaseChallenge] = usePurchaseChallengeMutation();
  const [joinChallenge] = useJoinChallengeMutation();
  
  const handlePurchase = async (challenge) => {
    Alert.alert(
      'Conferma acquisto',
      `Vuoi acquistare "${challenge.name}" per ${formatPrice(challenge.userPrice || challenge.price)}?`,
      [
        {
          text: 'Annulla',
          style: 'cancel'
        },
        {
          text: 'Acquista',
          onPress: async () => {
            setPurchasingId(challenge.id);
            try {
              // Mock payment per development
              await purchaseChallenge({
                userId: user.id,
                challengeId: challenge.id,
                paymentData: {
                  method: 'mock',
                  transactionId: `mock_${Date.now()}`
                }
              }).unwrap();
              
              // Iscriviti automaticamente
              try {
                await joinChallenge(challenge.id).unwrap();
                Alert.alert(
                  'Successo!',
                  'Challenge acquistata e iscrizione completata!',
                  [
                    {
                      text: 'Vai alle mie challenge',
                      onPress: () => dispatch(setActiveTab('challenges'))
                    },
                    {
                      text: 'OK',
                      style: 'cancel'
                    }
                  ]
                );
              } catch (joinError) {
                Alert.alert(
                  'Acquisto completato',
                  'Challenge acquistata! Vai nelle tue challenge per iscriverti.',
                  [{ text: 'OK' }]
                );
              }
              
              refetch();
            } catch (error) {
              Alert.alert(
                'Errore',
                error.data?.error || 'Errore durante l\'acquisto'
              );
            } finally {
              setPurchasingId(null);
            }
          }
        }
      ]
    );
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  const handleShowPackages = () => {
    // Mostra direttamente le opzioni dei pacchetti
    Alert.alert(
      '🎁 Scegli il tuo pacchetto',
      'Sblocca più challenge e funzionalità premium!',
      [
        { 
          text: '⭐ Pro (€9.99/mese)', 
          onPress: () => navigation.navigate('Payment', { packageType: 'pro' }) 
        },
        { 
          text: '💎 Premium (€19.99/mese)', 
          onPress: () => navigation.navigate('Payment', { packageType: 'premium' }) 
        },
        { 
          text: '👑 VIP (€29.99/mese)', 
          onPress: () => navigation.navigate('Payment', { packageType: 'vip' }) 
        },
        { text: 'Annulla', style: 'cancel' }
      ]
    );
  };
  
  const PackageUpgradeCard = () => (
    <View style={{
      backgroundColor: '#030213',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      marginHorizontal: 16
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <Text style={{ fontSize: 32, marginRight: 12 }}>
          {user?.packageType === 'free' ? '🎁' : '⭐'}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4
          }}>
            Pacchetto {user?.packageType?.toUpperCase() || 'FREE'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            {user?.packageType === 'free' 
              ? 'Accedi a più challenge con un upgrade!'
              : 'Sblocca challenge esclusive con un upgrade!'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: 'center'
        }}
        onPress={handleShowPackages}
      >
        <Text style={{
          color: '#030213',
          fontSize: 16,
          fontWeight: '600'
        }}>
          Vedi pacchetti disponibili
        </Text>
      </TouchableOpacity>
    </View>
  );
  
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
        contentContainerStyle={{ paddingBottom: 100 }}
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
            Shop Challenge 🛍️
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Acquista challenge esclusive
          </Text>
        </View>
        
        <View style={{ marginTop: 20 }}>
          {/* Card upgrade pacchetto */}
          <PackageUpgradeCard />
          
          {/* Titolo sezione */}
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#030213'
            }}>
              Challenge disponibili
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginTop: 4
            }}>
              Prezzi personalizzati per il tuo pacchetto {user?.packageType || 'free'}
            </Text>
          </View>
          
          {/* Lista challenge */}
          <View style={{ paddingHorizontal: 16 }}>
            {shopChallenges.length === 0 ? (
              <View style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 40,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>🎁</Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#030213',
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  Nessuna challenge disponibile
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  Torna presto per nuove challenge esclusive!
                </Text>
              </View>
            ) : (
              shopChallenges.map((challenge) => (
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
                  onPress={() => handlePurchase(challenge)}
                  disabled={purchasingId === challenge.id}
                >
                  <View style={{
                    flexDirection: 'row',
                    padding: 16
                  }}>
                    {/* Icona gioco */}
                    <View style={{
                      width: 80,
                      height: 80,
                      backgroundColor: '#f59e0b20',
                      borderRadius: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16
                    }}>
                      <Text style={{ fontSize: 40 }}>
                        {getGameIcon(challenge.game?.type)}
                      </Text>
                    </View>
                    
                    {/* Info challenge */}
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
                        marginBottom: 8,
                        numberOfLines: 2
                      }}>
                        {challenge.description || 'Challenge esclusiva'}
                      </Text>
                      
                      {/* Info rapide */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <View style={{
                          backgroundColor: '#f3f4f6',
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginRight: 8,
                          marginBottom: 4
                        }}>
                          <Text style={{
                            fontSize: 12,
                            color: '#030213'
                          }}>
                            ⏰ {formatTimeLeft(challenge.endDate)}
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: '#f0fdf4',
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginRight: 8,
                          marginBottom: 4
                        }}>
                          <Text style={{
                            fontSize: 12,
                            color: '#059669',
                            fontWeight: '600'
                          }}>
                            🏆 {formatPrize(challenge.prize)}
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: '#f3f4f6',
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginBottom: 4
                        }}>
                          <Text style={{
                            fontSize: 12,
                            color: '#6b7280'
                          }}>
                            👥 {challenge._count?.participants || 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  {/* Footer con prezzo */}
                  <View style={{
                    backgroundColor: '#f59e0b',
                    padding: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <View>
                      <Text style={{
                        fontSize: 12,
                        color: 'white',
                        opacity: 0.8
                      }}>
                        Prezzo per te
                      </Text>
                      <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {formatPrice(challenge.userPrice || challenge.price || 0)}
                      </Text>
                    </View>
                    {purchasingId === challenge.id ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <View style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        paddingHorizontal: 20,
                        paddingVertical: 10
                      }}>
                        <Text style={{
                          color: '#f59e0b',
                          fontSize: 16,
                          fontWeight: '600'
                        }}>
                          Acquista
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}