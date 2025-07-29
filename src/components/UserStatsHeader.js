// src/components/UserStatsHeader.js
import React from 'react';
import { View, Text } from 'react-native';

export function UserStatsHeader({ user, userStats }) {
  const xpPercentage = userStats.xp ? (userStats.xp % 100) : 0;

  return (
    <View style={{
      backgroundColor: '#030213',
      padding: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        marginTop: 20
      }}>
        <View>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4
          }}>
            Ciao, {user?.firstName || 'Utente'}! 👋
          </Text>
          <Text style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Livello {userStats.level} • {userStats.streak} giorni di streak
          </Text>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 8
        }}>
          <Text style={{ fontSize: 16, marginRight: 4 }}>🔥</Text>
          <Text style={{
            color: 'white',
            fontWeight: '600',
            fontSize: 14
          }}>
            {userStats.streak}
          </Text>
        </View>
      </View>

      {/* Progress bar per livello successivo */}
      <View style={{ marginBottom: 20 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8
        }}>
          <Text style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            XP Progress
          </Text>
          <Text style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            {userStats.xp}/{userStats.nextLevelXp}
          </Text>
        </View>
        <View style={{
          height: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <View style={{
            height: '100%',
            width: `${xpPercentage}%`,
            backgroundColor: '#10b981',
            borderRadius: 4
          }} />
        </View>
      </View>

      {/* Statistiche rapide */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}>
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          padding: 16,
          flex: 1,
          alignItems: 'center',
          marginRight: 8
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4
          }}>
            {userStats.challengesCompleted}
          </Text>
          <Text style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center'
          }}>
            Challenge Completate
          </Text>
        </View>
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          padding: 16,
          flex: 1,
          alignItems: 'center',
          marginHorizontal: 4
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4
          }}>
            {userStats.prizesWon}
          </Text>
          <Text style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center'
          }}>
            Premi Vinti
          </Text>
        </View>
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          padding: 16,
          flex: 1,
          alignItems: 'center',
          marginLeft: 8
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4
          }}>
            {userStats.level}
          </Text>
          <Text style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center'
          }}>
            Livello Attuale
          </Text>
        </View>
      </View>
    </View>
  );
}