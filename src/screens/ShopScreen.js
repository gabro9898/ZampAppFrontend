// src/screens/ShopScreen.js
import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export function ShopScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🛍️</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#030213' }}>
          Shop in arrivo!
        </Text>
      </View>
    </SafeAreaView>
  );
}