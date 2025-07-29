// src/components/ChallengeFilters.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function ChallengeFilters({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'Tutte' },
    { id: 'free', label: 'Gratis' },
    { id: 'premium', label: 'Premium' },
    { id: 'vip', label: 'VIP' }
  ];

  return (
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
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderRadius: 12,
            backgroundColor: activeFilter === filter.id ? '#030213' : 'transparent'
          }}
          onPress={() => onFilterChange(filter.id)}
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
  );
}