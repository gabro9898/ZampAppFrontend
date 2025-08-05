// src/screens/PaymentScreen.js - Versione Mock per Development
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useUpgradePackageMutation } from '../store/services/subscriptionApi';

export function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { packageType } = route.params || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [upgradePackage] = useUpgradePackageMutation();
  
  const packages = {
    pro: {
      name: 'Pro',
      price: 9.99,
      icon: '⭐',
      color: '#2563eb',
      features: [
        'Accesso a challenge Pro',
        'Statistiche avanzate',
        '3 tentativi al giorno',
        'Badge esclusivi'
      ]
    },
    premium: {
      name: 'Premium',
      price: 19.99,
      icon: '💎',
      color: '#7c3aed',
      features: [
        'Tutto di Pro +',
        'Accesso a challenge Premium',
        '5 tentativi al giorno',
        'Priorità nelle classifiche',
        'Premi raddoppiati'
      ]
    },
    vip: {
      name: 'VIP',
      price: 29.99,
      icon: '👑',
      color: '#dc2626',
      features: [
        'Tutto di Premium +',
        'Accesso a TUTTE le challenge',
        'Tentativi illimitati',
        'Badge VIP esclusivo',
        'Accesso anticipato',
        'Supporto prioritario'
      ]
    }
  };
  
  const selectedPackage = packages[packageType] || packages.pro;
  
  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      // Simula delay di processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock upgrade per development
      await upgradePackage({
        packageType: packageType
      }).unwrap();
      
      Alert.alert(
        '✅ Acquisto completato!',
        `Ora hai il pacchetto ${selectedPackage.name}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('profile')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Errore', error.message || 'Errore durante l\'acquisto');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatPrice = (price) => {
    return `€${price}/mese`;
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
            Upgrade a {selectedPackage.name}
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Sblocca tutte le funzionalità premium
          </Text>
        </View>
        
        <View style={{ padding: 16 }}>
          {/* Riepilogo pacchetto */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <View style={{
                width: 60,
                height: 60,
                backgroundColor: `${selectedPackage.color}20`,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Text style={{ fontSize: 32 }}>{selectedPackage.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#030213'
                }}>
                  Pacchetto {selectedPackage.name}
                </Text>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: selectedPackage.color
                }}>
                  {formatPrice(selectedPackage.price)}
                </Text>
              </View>
            </View>
            
            {selectedPackage.features.map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>✓</Text>
                <Text style={{
                  fontSize: 14,
                  color: '#030213',
                  flex: 1
                }}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Confronto con pacchetto attuale */}
          {user?.packageType && user.packageType !== packageType && (
            <View style={{
              backgroundColor: '#fef3c7',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 14,
                color: '#92400e',
                textAlign: 'center'
              }}>
                Attualmente hai il pacchetto {user.packageType.toUpperCase()}.
                {'\n'}
                L'upgrade sarà effettivo immediatamente.
              </Text>
            </View>
          )}
          
          {/* Informazioni pagamento */}
          <View style={{
            backgroundColor: '#e0f2fe',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20
          }}>
            <Text style={{
              fontSize: 14,
              color: '#0369a1',
              textAlign: 'center',
              lineHeight: 20
            }}>
              🔒 Pagamento sicuro
              {'\n\n'}
              ⚠️ DEMO MODE: Questo è un pagamento di test.
              {'\n'}
              In produzione useremo Apple Pay / Google Pay.
              {'\n\n'}
              Puoi annullare in qualsiasi momento dalle impostazioni.
            </Text>
          </View>
          
          {/* Pulsante acquisto */}
          <TouchableOpacity
            style={{
              backgroundColor: selectedPackage.color,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 12,
              opacity: isLoading ? 0.6 : 1
            }}
            onPress={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600'
              }}>
                Abbonati per {formatPrice(selectedPackage.price)}
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Pulsante annulla */}
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center'
            }}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={{
              color: '#030213',
              fontSize: 16,
              fontWeight: '500'
            }}>
              Annulla
            </Text>
          </TouchableOpacity>
          
          {/* Disclaimer */}
          <Text style={{
            fontSize: 12,
            color: '#6b7280',
            textAlign: 'center',
            marginTop: 20,
            lineHeight: 16
          }}>
            🛠️ Ambiente di sviluppo - Pagamenti simulati
            {'\n'}
            L'abbonamento si rinnova automaticamente
            {'\n'}
            Termini di servizio • Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}