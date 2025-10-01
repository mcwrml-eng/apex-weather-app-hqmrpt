
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getColors, spacing } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import ChequeredFlag from '../../components/ChequeredFlag';
import IndyCarIcon from '../../components/IndyCarIcon';
import { useEffect } from 'react';

export default function TabLayout() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  useEffect(() => {
    console.log('TabLayout: Component mounted');
    console.log('TabLayout: Theme is', isDark ? 'dark' : 'light');
    console.log('TabLayout: Colors loaded:', colors.primary);
  }, []);

  useEffect(() => {
    console.log('TabLayout: Theme changed to', isDark ? 'dark' : 'light');
  }, [isDark]);

  console.log('TabLayout: Rendering tabs');

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
          tabBarIcon: ({ color, size }) => {
            console.log('TabLayout: Rendering F1 icon');
            return <ChequeredFlag size={size} />;
          },
        }}
      />
      <Tabs.Screen
        name="motogp"
        options={{
          title: 'MotoGP',
          tabBarIcon: ({ color, size }) => {
            console.log('TabLayout: Rendering MotoGP icon');
            return <Ionicons name="bicycle" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="indycar"
        options={{
          title: 'IndyCar',
          tabBarIcon: ({ color, size }) => {
            console.log('TabLayout: Rendering IndyCar icon');
            return <IndyCarIcon size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => {
            console.log('TabLayout: Rendering Calendar icon');
            return <Ionicons name="calendar" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="disclaimer"
        options={{
          title: 'Legal',
          tabBarIcon: ({ color, size }) => {
            console.log('TabLayout: Rendering Legal icon');
            return <Ionicons name="information-circle" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
