
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import ChequeredFlag from '../../components/ChequeredFlag';
import IndyCarIcon from '../../components/IndyCarIcon';
import NascarIcon from '../../components/NascarIcon';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  console.log('TabLayout: Rendering with theme:', isDark ? 'dark' : 'light');
  console.log('TabLayout: Safe area insets:', insets);

  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.divider,
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
            height: 60 + Math.max(insets.bottom, 8),
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            fontFamily: 'Roboto_500Medium',
          },
        }}
      >
        <Tabs.Screen
          name="f1"
          options={{
            title: 'F1',
            tabBarIcon: ({ color, size }) => (
              <ChequeredFlag size={size} color={color} />
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
              <IndyCarIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="nascar"
          options={{
            title: 'NASCAR',
            tabBarIcon: ({ color, size }) => (
              <NascarIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="custom-weather"
          options={{
            title: 'Custom',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="location" size={size} color={color} />
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
          name="f2f3"
          options={{
            title: 'F2/F3',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="disclaimer"
          options={{
            title: 'About',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="information-circle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(home)"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}
