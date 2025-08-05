// src/components/MobileNavigation.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../store/slices/uiSlice';

export function MobileNavigation() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.ui.activeTab);

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'challenges', icon: '🏆', label: 'Challenge' },
    { id: 'shop', icon: '🛍️', label: 'Shop' },
    { id: 'profile', icon: '👤', label: 'Profilo' },
  ];

  const handleTabChange = (tabId) => {
    dispatch(setActiveTab(tabId));
  };

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingTop: 8,
      paddingBottom: 20, // Safe area per iPhone
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 8
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabChange(tab.id)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: isActive ? '#030213' : 'transparent',
                marginHorizontal: 2
              }}
            >
              <Text style={{
                fontSize: 20,
                marginBottom: 4,
                opacity: isActive ? 1 : 0.6
              }}>
                {tab.icon}
              </Text>
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: isActive ? 'white' : '#6b7280',
                textAlign: 'center'
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}