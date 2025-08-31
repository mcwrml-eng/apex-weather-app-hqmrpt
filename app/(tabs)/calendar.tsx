
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, commonStyles, spacing, borderRadius, shadows, layout } from '../../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface RaceEvent {
  id: string;
  title: string;
  circuit: string;
  country: string;
  date: string;
  category: 'f1' | 'motogp';
  status: 'upcoming' | 'live' | 'completed';
}

// Mock race events data
const raceEvents: RaceEvent[] = [
  {
    id: '1',
    title: 'Bahrain Grand Prix',
    circuit: 'Bahrain International Circuit',
    country: 'Bahrain',
    date: '2025-03-15',
    category: 'f1',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Qatar Grand Prix',
    circuit: 'Losail International Circuit',
    country: 'Qatar',
    date: '2025-03-08',
    category: 'motogp',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Australian Grand Prix',
    circuit: 'Albert Park Circuit',
    country: 'Australia',
    date: '2025-03-22',
    category: 'f1',
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Portuguese Grand Prix',
    circuit: 'Portimão Circuit',
    country: 'Portugal',
    date: '2025-03-29',
    category: 'motogp',
    status: 'upcoming',
  },
];

export default function CalendarScreen() {
  console.log('CalendarScreen: Rendering enhanced calendar screen');
  
  const headerOpacity = useMemo(() => new Animated.Value(0), []);
  const headerTranslateY = useMemo(() => new Animated.Value(-20), []);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'f1' | 'motogp'>('all');

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { 
        toValue: 1, 
        duration: 600, 
        useNativeDriver: true 
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslateY]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return raceEvents;
    return raceEvents.filter(event => event.category === selectedCategory);
  }, [selectedCategory]);

  const getCategoryConfig = (category: 'f1' | 'motogp') => {
    return category === 'f1' ? {
      color: colors.f1Red,
      gradient: colors.gradientF1,
      label: 'F1',
      icon: 'speedometer' as const,
    } : {
      color: colors.motogpBlue,
      gradient: colors.gradientMotoGP,
      label: 'MotoGP',
      icon: 'bicycle' as const,
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en', { month: 'short' }),
      weekday: date.toLocaleDateString('en', { weekday: 'short' }),
    };
  };

  return (
    <View style={styles.wrapper}>
      {/* Enhanced header */}
      <Animated.View style={[
        styles.headerContainer,
        { 
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }
      ]}>
        <LinearGradient
          colors={[colors.background, colors.backgroundAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        />
        
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Race Calendar</Text>
              <View style={styles.titleAccent} />
            </View>
            <Text style={styles.subtitle}>2025 / 2026 Racing Schedule</Text>
          </View>

          {/* Category filter */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === 'all' && styles.filterButtonActive
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === 'all' && styles.filterButtonTextActive
              ]}>
                All Races
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === 'f1' && styles.filterButtonActive,
                selectedCategory === 'f1' && { backgroundColor: `${colors.f1Red}20` }
              ]}
              onPress={() => setSelectedCategory('f1')}
            >
              <Ionicons name="speedometer" size={16} color={selectedCategory === 'f1' ? colors.f1Red : colors.textMuted} />
              <Text style={[
                styles.filterButtonText,
                selectedCategory === 'f1' && { color: colors.f1Red }
              ]}>
                Formula 1
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === 'motogp' && styles.filterButtonActive,
                selectedCategory === 'motogp' && { backgroundColor: `${colors.motogpBlue}20` }
              ]}
              onPress={() => setSelectedCategory('motogp')}
            >
              <Ionicons name="bicycle" size={16} color={selectedCategory === 'motogp' ? colors.motogpBlue : colors.textMuted} />
              <Text style={[
                styles.filterButtonText,
                selectedCategory === 'motogp' && { color: colors.motogpBlue }
              ]}>
                MotoGP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Enhanced content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eventsContainer}>
          {filteredEvents.map((event, index) => {
            const categoryConfig = getCategoryConfig(event.category);
            const dateInfo = formatDate(event.date);
            
            return (
              <Animated.View
                key={event.id}
                style={{
                  opacity: headerOpacity,
                  transform: [{
                    translateY: headerTranslateY.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20 * (index + 1), 0],
                    })
                  }]
                }}
              >
                <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[colors.card, colors.cardElevated]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.eventGradient}
                  />
                  
                  {/* Date section */}
                  <View style={styles.dateSection}>
                    <View style={[styles.dateContainer, { borderColor: categoryConfig.color }]}>
                      <Text style={[styles.dateDay, { color: categoryConfig.color }]}>
                        {dateInfo.day}
                      </Text>
                      <Text style={styles.dateMonth}>{dateInfo.month}</Text>
                      <Text style={styles.dateWeekday}>{dateInfo.weekday}</Text>
                    </View>
                  </View>

                  {/* Event details */}
                  <View style={styles.eventDetails}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
                        <Ionicons name={categoryConfig.icon} size={12} color="#FFFFFF" />
                        <Text style={styles.categoryBadgeText}>{categoryConfig.label}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventMeta}>
                      <View style={styles.eventMetaItem}>
                        <Ionicons name="location" size={14} color={colors.textMuted} />
                        <Text style={styles.eventMetaText}>{event.circuit}</Text>
                      </View>
                      <View style={styles.eventMetaItem}>
                        <Ionicons name="flag" size={14} color={colors.textMuted} />
                        <Text style={styles.eventMetaText}>{event.country}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Status indicator */}
                  <View style={styles.statusSection}>
                    <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    ...commonStyles.title,
    fontSize: 32,
    color: colors.text,
  },
  titleAccent: {
    width: 4,
    height: 24,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  subtitle: {
    ...commonStyles.subtitle,
    fontSize: 16,
    color: colors.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  filterButtonActive: {
    backgroundColor: colors.backgroundTertiary,
    borderColor: colors.border,
  },
  filterButtonText: {
    ...commonStyles.bodyMedium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  filterButtonTextActive: {
    color: colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
  },
  eventsContainer: {
    gap: spacing.md,
  },
  eventCard: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: shadows.md,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eventGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dateSection: {
    padding: spacing.lg,
  },
  dateContainer: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    minWidth: 60,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
    lineHeight: 24,
  },
  dateMonth: {
    ...commonStyles.captionSmall,
    fontSize: 10,
    marginTop: 2,
  },
  dateWeekday: {
    ...commonStyles.captionSmall,
    fontSize: 9,
    marginTop: 1,
  },
  eventDetails: {
    flex: 1,
    padding: spacing.lg,
    paddingLeft: 0,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eventTitle: {
    ...commonStyles.headingSmall,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  eventMeta: {
    gap: spacing.xs,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eventMetaText: {
    ...commonStyles.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusSection: {
    padding: spacing.lg,
    paddingLeft: 0,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomSpacing: {
    height: spacing.huge,
  },
});
