
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/commonStyles';
import { Platform } from 'react-native';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.backgroundAlt,
          borderTopColor: colors.divider,
          height: Platform.OS === 'android' ? 64 : 84,
          paddingBottom: Platform.OS === 'android' ? 10 : 20,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="f1"
        options={{
          title: 'Formula 1',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={colors.text} />
          ),
        }}
      />
      <Tabs.Screen
        name="motogp"
        options={{
          title: 'MotoGP',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle" size={size} color={colors.text} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={colors.text} />
          ),
        }}
      />
    </Tabs>
  );
}
