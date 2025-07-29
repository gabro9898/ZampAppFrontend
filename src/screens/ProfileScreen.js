// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const stats = useSelector((state) => state.auth.user);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
            <Text style={{ fontSize: 48 }}>👤</Text>
          </View>
          
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4
          }}>
            {user?.firstName} {user?.lastName}
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Livello {user?.level || 1} • {user?.xp || 0} XP
          </Text>
        </View>
        
        {/* Aggiungi statistiche, impostazioni, logout button, etc. */}
      </ScrollView>
    </SafeAreaView>
  );
}