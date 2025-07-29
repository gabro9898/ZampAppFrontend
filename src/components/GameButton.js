// src/components/GameButton.js - Versione Corretta Senza Loop
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

export function GameButton({ challenge, isParticipating, onJoin, onPlay, isJoining }) {
  // ✅ SOLUZIONE: Rimuovi completamente la query che causava loop
  // Lo stato del pulsante sarà gestito dal componente padre
  
  if (!isParticipating) {
    return (
      <TouchableOpacity 
        style={{
          backgroundColor: '#030213',
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          opacity: isJoining ? 0.6 : 1
        }}
        onPress={() => onJoin(challenge.id)}
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
    );
  }

  // Se l'utente è iscritto, mostra sempre il pulsante "Gioca Ora"
  return (
    <TouchableOpacity 
      style={{
        backgroundColor: '#059669',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
      }}
      onPress={() => onPlay(challenge)}
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
  );
}