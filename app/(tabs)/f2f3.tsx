
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import AppHeader from '../../components/AppHeader';
import { f2Circuits, f3Circuits, f2RaceDates, f3RaceDates } from '../../data/f2f3-circuits';
import { router } from 'expo-router';

interface RaceEvent {
  date: string;
  category: 'f2' | 'f3';
  circuit: any;
  round: number;
}

export default function F2F3CalendarScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

  // Generate race calendar data
  const raceEvents: RaceEvent[] = useMemo(() => {
    const events: RaceEvent[] = [];
    
    // Add F2 races
    f2Circuits.forEach((circuit, index) => {
      const date = f2RaceDates[circuit.slug];
      if (date) {
        events.push({
          date,
          category: 'f2',
          circuit,
          round: index + 1,
        });
      }
    });

    // Add F3 races
    f3Circuits.forEach((circuit, index) => {
      const date = f3RaceDates[circuit.slug];
      if (date) {
        events.push({
          date,
          category: 'f3',
          circuit,
          round: index + 1,
        });
      }
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      marginTop: spacing.xs,
    },
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'f2': return colors.f1Red;
      case 'f3': return colors.motogpBlue;
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
    console.log('F2F3 Calendar: Navigating to circuit:', event.circuit.slug, 'category:', event.category);
    // For now, we'll navigate to the F1 circuit detail page with the base slug
    // You can create a separate F2/F3 detail page if needed
    const baseSlug = event.circuit.slug.replace('-f2', '').replace('-f3', '');
    router.push(`/circuit/${baseSlug}?category=f1`);
  };

  const groupedEvents = groupEventsByMonth(raceEvents);

  const f2Count = raceEvents.filter(e => e.category === 'f2').length;
  const f3Count = raceEvents.filter(e => e.category === 'f3').length;

  console.log('F2F3CalendarScreen: Rendering with', raceEvents.length, 'events, theme:', isDark ? 'dark' : 'light');

  return (
    <View style={styles.container}>
      <AppHeader
        title="F2 / F3 Calendar"
        subtitle="FIA Formula 2 & Formula 3 Championship 2026"
        icon={<Ionicons name="trophy" size={32} color={colors.primary} />}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{f2Count}</Text>
              <Text style={styles.statLabel}>F2 Races</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{f3Count}</Text>
              <Text style={styles.statLabel}>F3 Races</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{raceEvents.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {Object.entries(groupedEvents).map(([month, events]) => (
            <View key={month} style={styles.monthSection}>
              <Text style={styles.monthTitle}>{month}</Text>
              
              {events.map((event, index) => (
                <TouchableOpacity
                  key={`${event.category}-${event.circuit.slug}-${index}`}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventDate}>
                      {formatDate(event.date)} • {t('round')} {event.round}
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
