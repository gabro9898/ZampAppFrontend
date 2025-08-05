// src/screens/ProfileScreen.js - Area Profilo Completa
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useGetProfileQuery } from '../store/services/authApi';
import { useGetUserPurchasesQuery } from '../store/services/shopApi';
import { useNavigation } from '@react-navigation/native';
import { formatPrice } from '../utils/challengeHelpers';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    data: profileData, 
    refetch: refetchProfile 
  } = useGetProfileQuery(undefined, {
    skip: !user?.id
  });
  
  const { 
    data: purchases = [], 
    refetch: refetchPurchases 
  } = useGetUserPurchasesQuery(user?.id, {
    skip: !user?.id
  });
  
  const currentUser = profileData || user;
  
  // Calcola statistiche
  const stats = {
    level: currentUser?.level || 1,
    xp: currentUser?.xp || 0,
    nextLevelXp: (currentUser?.level || 1) * 100,
    xpProgress: ((currentUser?.xp || 0) % 100),
    streak: currentUser?.streak || 0,
    challengesPlayed: currentUser?.challengesPlayed || 0,
    prizesWon: currentUser?.prizesWon || 0,
    totalSpent: purchases.reduce((sum, p) => sum + parseFloat(p.pricePaid || 0), 0)
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Conferma Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Esci', 
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Auth');
          }
        }
      ]
    );
  };
  
  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade Pacchetto',
      'Scegli il tuo nuovo pacchetto:',
      [
        { text: 'Pro (€9.99/mese)', onPress: () => handlePackageUpgrade('pro') },
        { text: 'Premium (€19.99/mese)', onPress: () => handlePackageUpgrade('premium') },
        { text: 'VIP (€29.99/mese)', onPress: () => handlePackageUpgrade('vip') },
        { text: 'Annulla', style: 'cancel' }
      ]
    );
  };
  
  const handlePackageUpgrade = (packageType) => {
    navigation.navigate('Payment', { packageType });
  };
  
  const handleCancelSubscription = () => {
    Alert.alert(
      'Annulla Abbonamento',
      'Sei sicuro di voler annullare il tuo abbonamento? Manterrai i benefici fino alla scadenza.',
      [
        { text: 'No, continua', style: 'cancel' },
        { 
          text: 'Sì, annulla', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Abbonamento annullato', 'Il tuo abbonamento è stato annullato.');
          }
        }
      ]
    );
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchPurchases()]);
    setRefreshing(false);
  };
  
  const getPackageIcon = (packageType) => {
    switch (packageType) {
      case 'vip': return '👑';
      case 'premium': return '💎';
      case 'pro': return '⭐';
      default: return '🎁';
    }
  };
  
  const getPackageColor = (packageType) => {
    switch (packageType) {
      case 'vip': return '#dc2626';
      case 'premium': return '#7c3aed';
      case 'pro': return '#2563eb';
      default: return '#059669';
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Profilo */}
        <View style={{
          backgroundColor: '#030213',
          padding: 20,
          paddingTop: 40,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          alignItems: 'center'
        }}>
          <View style={{
            width: 100,
            height: 100,
            backgroundColor: 'white',
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Text style={{ fontSize: 48 }}>
              {getPackageIcon(currentUser?.packageType)}
            </Text>
          </View>
          
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4
          }}>
            {currentUser?.firstName} {currentUser?.lastName}
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 16
          }}>
            {currentUser?.email}
          </Text>
          
          {/* Badge Pacchetto */}
          <View style={{
            backgroundColor: getPackageColor(currentUser?.packageType),
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 16, marginRight: 4 }}>
              {getPackageIcon(currentUser?.packageType)}
            </Text>
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: '600'
            }}>
              {currentUser?.packageType?.toUpperCase() || 'FREE'}
            </Text>
          </View>
        </View>
        
        {/* Statistiche Livello e XP */}
        <View style={{ padding: 16 }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <View>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#030213'
                }}>
                  Livello {stats.level}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#6b7280'
                }}>
                  {stats.xp} / {stats.nextLevelXp} XP
                </Text>
              </View>
              <View style={{
                width: 60,
                height: 60,
                backgroundColor: '#f3f4f6',
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 24 }}>🏆</Text>
              </View>
            </View>
            
            {/* Progress Bar XP */}
            <View style={{
              height: 8,
              backgroundColor: '#f3f4f6',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <View style={{
                height: '100%',
                width: `${stats.xpProgress}%`,
                backgroundColor: '#10b981',
                borderRadius: 4
              }} />
            </View>
          </View>
          
          {/* Grid Statistiche con STREAK */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -4
          }}>
            <StatCard
              icon="🔥"
              value={stats.streak}
              label="Giorni di Streak"
              color="#ef4444"
            />
            <StatCard
              icon="🎮"
              value={stats.challengesPlayed}
              label="Challenge Giocate"
              color="#3b82f6"
            />
            <StatCard
              icon="🏅"
              value={stats.prizesWon}
              label="Premi Vinti"
              color="#f59e0b"
            />
            <StatCard
              icon="💰"
              value={formatPrice(stats.totalSpent)}
              label="Speso Totale"
              color="#10b981"
            />
          </View>
          
          {/* Sezione Abbonamento */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            marginTop: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#030213',
              marginBottom: 16
            }}>
              Gestione Abbonamento
            </Text>
            
            <View style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280'
                  }}>
                    Pacchetto attuale
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#030213',
                    marginTop: 2
                  }}>
                    {getPackageIcon(currentUser?.packageType)} {currentUser?.packageType?.toUpperCase() || 'FREE'}
                  </Text>
                </View>
                {currentUser?.packageExpiresAt && (
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280'
                  }}>
                    Scade il {new Date(currentUser.packageExpiresAt).toLocaleDateString('it-IT')}
                  </Text>
                )}
              </View>
            </View>
            
            {currentUser?.packageType === 'free' ? (
              <TouchableOpacity
                style={{
                  backgroundColor: '#030213',
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center'
                }}
                onPress={handleUpgrade}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Passa a Premium
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#2563eb',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginBottom: 8
                  }}
                  onPress={handleUpgrade}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Cambia Pacchetto
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: '#dc2626',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center'
                  }}
                  onPress={handleCancelSubscription}
                >
                  <Text style={{
                    color: '#dc2626',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Annulla Abbonamento
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          {/* Menu Opzioni */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            marginTop: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4
          }}>
            <MenuOption
              icon="💳"
              title="Metodi di Pagamento"
              onPress={() => Alert.alert('Pagamenti', 'I pagamenti sono gestiti da App Store / Google Play')}
            />
            <MenuOption
              icon="🛍️"
              title="Storico Acquisti"
              subtitle={`${purchases.length} acquisti`}
              onPress={() => navigation.navigate('PurchaseHistory')}
            />
            <MenuOption
              icon="🔔"
              title="Impostazioni Notifiche"
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <MenuOption
              icon="⚙️"
              title="Impostazioni"
              onPress={() => Alert.alert('Impostazioni', 'In arrivo presto!')}
            />
            <MenuOption
              icon="❓"
              title="Supporto"
              onPress={() => Linking.openURL('mailto:support@zampapp.com')}
            />
            <MenuOption
              icon="📄"
              title="Termini e Condizioni"
              onPress={() => navigation.navigate('Terms')}
            />
            <MenuOption
              icon="🔒"
              title="Privacy Policy"
              onPress={() => navigation.navigate('Privacy')}
            />
            <MenuOption
              icon="🚪"
              title="Logout"
              onPress={handleLogout}
              isLast
              isDanger
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente StatCard
function StatCard({ icon, value, label, color }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 16,
      margin: 4,
      minWidth: '45%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    }}>
      <View style={{
        width: 40,
        height: 40,
        backgroundColor: `${color}20`,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#030213',
        marginBottom: 4
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {label}
      </Text>
    </View>
  );
}

// Componente MenuOption
function MenuOption({ icon, title, subtitle, onPress, isLast, isDanger }) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#f3f4f6'
      }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 20, marginRight: 16 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: isDanger ? '#dc2626' : '#030213'
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            marginTop: 2
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: 16, color: '#9ca3af' }}>›</Text>
    </TouchableOpacity>
  );
}