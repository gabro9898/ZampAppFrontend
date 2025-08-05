// src/screens/PurchaseHistoryScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useGetUserPurchasesQuery } from '../store/services/shopApi';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { formatPrice, formatTimeLeft } from '../utils/challengeHelpers';

export function PurchaseHistoryScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const { 
    data: purchases = [], 
    isLoading 
  } = useGetUserPurchasesQuery(user?.id, {
    skip: !user?.id
  });
  
  const totalSpent = purchases.reduce((sum, p) => sum + parseFloat(p.pricePaid || 0), 0);
  
  if (isLoading) {
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
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
            Storico Acquisti 🛍️
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            {purchases.length} acquisti • Totale: {formatPrice(totalSpent)}
          </Text>
        </View>
        
        <View style={{ padding: 16 }}>
          {purchases.length === 0 ? (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 40,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🛍️</Text>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#030213',
                marginBottom: 8
              }}>
                Nessun acquisto
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Non hai ancora acquistato nessuna challenge
              </Text>
            </View>
          ) : (
            purchases.map((purchase) => (
              <View
                key={purchase.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#030213',
                      marginBottom: 4
                    }}>
                      {purchase.challenge?.name || 'Challenge'}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#6b7280',
                      marginBottom: 8
                    }}>
                      {new Date(purchase.purchasedAt).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginRight: 8
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: '#6b7280'
                        }}>
                          {purchase.paymentMethod || 'Test'}
                        </Text>
                      </View>
                      {purchase.challenge?.endDate && (
                        <Text style={{
                          fontSize: 12,
                          color: '#6b7280'
                        }}>
                          Scade: {formatTimeLeft(purchase.challenge.endDate)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#059669'
                  }}>
                    {formatPrice(purchase.pricePaid)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}