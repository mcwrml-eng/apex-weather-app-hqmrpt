
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../styles/commonStyles';
import { Platform, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabsLayout() {
  console.log('TabsLayout: Rendering enhanced tabs with improved text label visibility');
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 95 : 115, // Further increased height
          paddingBottom: Platform.OS === 'android' ? spacing.xxl : spacing.xxxl, // Increased bottom padding
          paddingTop: spacing.lg, // Maintained top padding
          paddingHorizontal: spacing.md,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Roboto_500Medium',
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: spacing.md, // Increased from sm (8px) to md (12px)
          marginBottom: spacing.sm, // Increased bottom margin for better spacing
          color: colors.text, // Ensure text color is always visible
        },
        tabBarIconStyle: {
          marginBottom: spacing.sm, // Increased from xs to sm for better spacing
          marginTop: spacing.xs, // Maintained top margin
        },
        tabBarItemStyle: {
          borderRadius: borderRadius.lg,
          marginHorizontal: spacing.xs / 2,
          paddingVertical: spacing.lg, // Increased vertical padding
          paddingHorizontal: spacing.xs / 2,
          height: Platform.OS === 'android' ? 80 : 90, // Increased height for tab items
          justifyContent: 'center', // Center content vertically
          alignItems: 'center', // Center content horizontally
        },
        tabBarBackground: () => (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}>
            {/* Enhanced background with glass morphism effect */}
            <LinearGradient
              colors={[colors.glass, colors.backgroundAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: spacing.md,
                right: spacing.md,
                bottom: Platform.OS === 'android' ? spacing.xxl : spacing.xxxl,
                borderTopLeftRadius: borderRadius.xl,
                borderTopRightRadius: borderRadius.xl,
                borderWidth: 1,
                borderColor: colors.glassBorder,
                borderBottomWidth: 0,
                boxShadow: shadows.lg,
              }}
            />
            
            {/* Subtle top border accent */}
            <View style={{
              position: 'absolute',
              top: 0,
              left: spacing.md,
              right: spacing.md,
              height: 2,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              backgroundColor: colors.primary,
              opacity: 0.3,
            }} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="f1"
        options={{
          title: 'Formula 1',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? colors.f1Red : 'transparent',
              borderRadius: borderRadius.md,
              padding: spacing.sm,
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? colors.f1RedLight : 'transparent',
              boxShadow: focused ? `0 4px 12px ${colors.f1Red}30` : 'none',
              transform: [{ scale: focused ? 1.05 : 1 }],
            }}>
              <Ionicons 
                name="speedometer" 
                size={size} 
                color={focused ? '#FFFFFF' : colors.textMuted} 
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'Roboto_500Medium',
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: spacing.md,
            marginBottom: spacing.sm,
            color: colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="motogp"
        options={{
          title: 'MotoGP',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? colors.motogpBlue : 'transparent',
              borderRadius: borderRadius.md,
              padding: spacing.sm,
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? colors.motogpBlueLight : 'transparent',
              boxShadow: focused ? `0 4px 12px ${colors.motogpBlue}30` : 'none',
              transform: [{ scale: focused ? 1.05 : 1 }],
            }}>
              <Ionicons 
                name="bicycle" 
                size={size} 
                color={focused ? '#FFFFFF' : colors.textMuted} 
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'Roboto_500Medium',
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: spacing.md,
            marginBottom: spacing.sm,
            color: colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="indycar"
        options={{
          title: 'IndyCar',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? colors.indycarBlue : 'transparent',
              borderRadius: borderRadius.md,
              padding: spacing.sm,
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? colors.indycarBlueLight : 'transparent',
              boxShadow: focused ? `0 4px 12px ${colors.indycarBlue}30` : 'none',
              transform: [{ scale: focused ? 1.05 : 1 }],
            }}>
              <Ionicons 
                name="car-sport" 
                size={size} 
                color={focused ? '#FFFFFF' : colors.textMuted} 
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'Roboto_500Medium',
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: spacing.md,
            marginBottom: spacing.sm,
            color: colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="disclaimer"
        options={{
          title: 'Legal',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? colors.textSecondary : 'transparent',
              borderRadius: borderRadius.md,
              padding: spacing.sm,
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? colors.text : 'transparent',
              boxShadow: focused ? `0 4px 12px ${colors.textSecondary}30` : 'none',
              transform: [{ scale: focused ? 1.05 : 1 }],
            }}>
              <Ionicons 
                name="shield-checkmark" 
                size={size} 
                color={focused ? '#FFFFFF' : colors.textMuted} 
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'Roboto_500Medium',
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: spacing.md,
            marginBottom: spacing.sm,
            color: colors.text,
          },
        }}
      />
    </Tabs>
  );
}
