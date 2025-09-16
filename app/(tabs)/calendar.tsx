
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import AppHeader from '../../components/AppHeader';
import { f1Circuits, motogpCircuits, indycarCircuits } from '../../data/circuits';
import { router } from 'expo-router';

interface RaceEvent {
  date: string;
  category: 'f1' | 'motogp' | 'indycar';
  circuit: any;
  round: number;
}

export default function CalendarScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'f1' | 'motogp' | 'indycar'>('all');
  const { isDark } = useTheme();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

  // Mock race calendar data - in a real app this would come from an API
  const raceEvents: RaceEvent[] = useMemo(() => {
    const events: RaceEvent[] = [];
    
    // Add F1 races (24 races starting March)
    f1Circuits.forEach((circuit, index) => {
      const date = new Date(2026, 2 + Math.floor(index * 0.4), 1 + (index % 4) * 7);
      events.push({
        date: date.toISOString().split('T')[0],
        category: 'f1',
        circuit,
        round: index + 1,
      });
    });

    // Add MotoGP races (22 races starting March)
    motogpCircuits.forEach((circuit, index) => {
      const date = new Date(2026, 2 + Math.floor(index * 0.45), 8 + (index % 4) * 7);
      events.push({
        date: date.toISOString().split('T')[0],
        category: 'motogp',
        circuit,
        round: index + 1,
      });
    });

    // Add IndyCar races (17 races starting March)
    indycarCircuits.forEach((circuit, index) => {
      const date = new Date(2026, 2 + Math.floor(index * 0.5), 15 + (index % 4) * 7);
      events.push({
        date: date.toISOString().split('T')[0],
        category: 'indycar',
        circuit,
        round: index + 1,
      });
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return raceEvents;
    return raceEvents.filter(event => event.category === selectedCategory);
  }, [raceEvents, selectedCategory]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: layout.screenPadding,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    filterButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundAlt,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: layout.screenPadding,
    },
    monthSection: {
      marginBottom: spacing.xl,
    },
    monthTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.lg,
    },
    eventCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    eventDate: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Roboto_500Medium',
    },
    categoryBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.backgroundAlt,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      textTransform: 'uppercase',
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.xs,
    },
    eventLocation: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.md,
    },
    statItem: {
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      flex: 1,
      marginHorizontal: spacing.xs,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: 'Roboto_700Bold',
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing.xs,
    },
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'f1': return colors.f1Red;
      case 'motogp': return colors.motogpBlue;
      case 'indycar': return colors.indycarBlue;
      default: return colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const groupEventsByMonth = (events: RaceEvent[]) => {
    const grouped: { [key: string]: RaceEvent[] } = {};
    
    events.forEach(event => {
      const month = formatMonth(event.date);
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(event);
    });

    return grouped;
  };

  const handleEventPress = (event: RaceEvent) => {
    console.log('Calendar: Navigating to circuit:', event.circuit.slug);
    router.push(`/circuit/${event.circuit.slug}`);
  };

  const groupedEvents = groupEventsByMonth(filteredEvents);

  console.log('CalendarScreen: Rendering with', filteredEvents.length, 'events, theme:', isDark ? 'dark' : 'light');

  return (
    <View style={styles.container}>
      <AppHeader
        title="Race Calendar"
        subtitle="2026 Championship Schedule"
        icon={<Ionicons name="calendar" size={32} color={colors.primary} />}
      />

      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'f1', label: 'F1' },
          { key: 'motogp', label: 'MotoGP' },
          { key: 'indycar', label: 'IndyCar' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedCategory === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(filter.key as any)}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === filter.key && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredEvents.length}</Text>
              <Text style={styles.statLabel}>Total Races</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Object.keys(groupedEvents).length}</Text>
              <Text style={styles.statLabel}>Months</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>

          {Object.entries(groupedEvents).map(([month, events]) => (
            <View key={month} style={styles.monthSection}>
              <Text style={styles.monthTitle}>{month}</Text>
              
              {events.map((event, index) => (
                <TouchableOpacity
                  key={`${event.category}-${event.round}`}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventDate}>
                      {formatDate(event.date)} • Round {event.round}
                    </Text>
                    <View style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(event.category) + '20' }
                    ]}>
                      <Text style={[
                        styles.categoryText,
                        { color: getCategoryColor(event.category) }
                      ]}>
                        {event.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.eventTitle}>{event.circuit.name}</Text>
                  <Text style={styles.eventLocation}>{event.circuit.country}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
