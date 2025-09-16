
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { getColors, spacing, borderRadius } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

export default function TabLayout() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  console.log('TabLayout: Rendering with theme:', isDark ? 'dark' : 'light');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tabs.Screen
        name="f1"
        options={{
          title: 'F1',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="motogp"
        options={{
          title: 'MotoGP',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="indycar"
        options={{
          title: 'IndyCar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="disclaimer"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.settingsContainer}>
              <Ionicons name="settings" size={size} color={color} />
              <View style={styles.themeToggleContainer}>
                <ThemeToggle size={16} />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  themeToggleContainer: {
    position: 'absolute',
    top: -8,
    right: -12,
    transform: [{ scale: 0.6 }],
  },
});
