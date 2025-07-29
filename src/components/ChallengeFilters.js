// src/components/ChallengeFilters.js - Versione Completa con Shop
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export function ChallengeFilters({ activeFilter, onFilterChange, userPackage }) {
  // Filtri disponibili in base al pacchetto dell'utente
  const getAvailableFilters = () => {
    const baseFilters = [
      { id: 'all', label: 'Tutte', available: true },
      { id: 'free', label: 'Gratis', available: true },
    ];
    
    // Aggiungi filtri in base al pacchetto
    if (userPackage === 'pro' || userPackage === 'premium' || userPackage === 'vip') {
      baseFilters.push({ id: 'pro', label: 'Pro', available: true });
    }
    
    if (userPackage === 'premium' || userPackage === 'vip') {
      baseFilters.push({ id: 'premium', label: 'Premium', available: true });
    }
    
    if (userPackage === 'vip') {
      baseFilters.push({ id: 'vip', label: 'VIP', available: true });
    }
    
    // Il filtro shop è sempre disponibile
    baseFilters.push({ id: 'shop', label: 'Shop', available: true });
    
    return baseFilters;
  };
  
  const filters = getAvailableFilters();
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 20 }}
    >
      <View style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4
      }}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: activeFilter === filter.id ? '#030213' : 'transparent',
              marginHorizontal: 2,
              opacity: filter.available ? 1 : 0.5
            }}
            onPress={() => filter.available && onFilterChange(filter.id)}
            disabled={!filter.available}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: activeFilter === filter.id ? 'white' : '#6b7280',
              textAlign: 'center'
            }}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}