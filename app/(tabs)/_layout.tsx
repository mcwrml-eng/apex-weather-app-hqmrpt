
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../styles/commonStyles';
import { Platform, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabsLayout() {
  console.log('TabsLayout: Rendering enhanced tabs');
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundAlt,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 70 : 90,
          paddingBottom: Platform.OS === 'android' ? spacing.md : spacing.xl,
          paddingTop: spacing.sm,
          paddingHorizontal: spacing.sm,
          borderTopLeftRadius: borderRadius.xl,
          borderTopRightRadius: borderRadius.xl,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 8,
          shadowColor: colors.shadowDark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Roboto_500Medium',
          fontWeight: '500',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarItemStyle: {
          borderRadius: borderRadius.md,
          marginHorizontal: spacing.xs,
          paddingVertical: spacing.xs,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={[colors.backgroundAlt, colors.backgroundTertiary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="f1"
        options={{
          title: 'Formula 1',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.f1Red}20` : 'transparent',
              borderRadius: borderRadius.sm,
              padding: spacing.xs,
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? `${colors.f1Red}40` : 'transparent',
            }}>
              <Ionicons 
                name="speedometer" 
                size={size} 
                color={focused ? colors.f1Red : colors.textMuted} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="motogp"
        options={{
          title: 'MotoGP',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.motogpBlue}20` : 'transparent',
              borderRadius: borderRadius.sm,
              padding: spacing.xs,
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? `${colors.motogpBlue}40` : 'transparent',
            }}>
              <Ionicons 
                name="bicycle" 
                size={size} 
                color={focused ? colors.motogpBlue : colors.textMuted} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.accent}20` : 'transparent',
              borderRadius: borderRadius.sm,
              padding: spacing.xs,
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? `${colors.accent}40` : 'transparent',
            }}>
              <Ionicons 
                name="calendar" 
                size={size} 
                color={focused ? colors.accent : colors.textMuted} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
