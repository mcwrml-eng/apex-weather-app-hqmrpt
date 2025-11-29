
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getColors, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface CountdownProps {
  raceDate: string;
  raceName: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isRaceDay: boolean;
  isPast: boolean;
}

export default function RaceCountdown({ raceDate, raceName }: CountdownProps) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isRaceDay: false,
    isPast: false,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const race = new Date(raceDate);
      const diff = race.getTime() - now.getTime();

      if (diff < 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isRaceDay: false,
          isPast: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const isRaceDay = days === 0 && hours < 24;

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isRaceDay,
        isPast: false,
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [raceDate]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
      overflow: 'hidden',
    },
    containerRaceDay: {
      backgroundColor: colors.error + '15',
      borderColor: colors.error,
    },
    header: {
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
    },
    raceName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    countdownContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    timeUnit: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    timeUnitRaceDay: {
      backgroundColor: colors.error + '25',
      borderColor: colors.error,
    },
    timeValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: spacing.xs,
    },
    timeValueRaceDay: {
      color: colors.error,
    },
    timeLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    pastContainer: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    pastText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
    },
  });

  if (timeRemaining.isPast) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Race Completed</Text>
          <Text style={styles.raceName}>{raceName}</Text>
        </View>
        <View style={styles.pastContainer}>
          <Text style={styles.pastText}>This race has already taken place</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, timeRemaining.isRaceDay && styles.containerRaceDay]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {timeRemaining.isRaceDay ? '🚨 Race Day!' : 'Next Race'}
        </Text>
        <Text style={styles.raceName}>{raceName}</Text>
      </View>

      <View style={styles.countdownContainer}>
        <View style={[styles.timeUnit, timeRemaining.isRaceDay && styles.timeUnitRaceDay]}>
          <Text style={[styles.timeValue, timeRemaining.isRaceDay && styles.timeValueRaceDay]}>
            {String(timeRemaining.days).padStart(2, '0')}
          </Text>
          <Text style={styles.timeLabel}>Days</Text>
        </View>

        <View style={[styles.timeUnit, timeRemaining.isRaceDay && styles.timeUnitRaceDay]}>
          <Text style={[styles.timeValue, timeRemaining.isRaceDay && styles.timeValueRaceDay]}>
            {String(timeRemaining.hours).padStart(2, '0')}
          </Text>
          <Text style={styles.timeLabel}>Hours</Text>
        </View>

        <View style={[styles.timeUnit, timeRemaining.isRaceDay && styles.timeUnitRaceDay]}>
          <Text style={[styles.timeValue, timeRemaining.isRaceDay && styles.timeValueRaceDay]}>
            {String(timeRemaining.minutes).padStart(2, '0')}
          </Text>
          <Text style={styles.timeLabel}>Minutes</Text>
        </View>

        <View style={[styles.timeUnit, timeRemaining.isRaceDay && styles.timeUnitRaceDay]}>
          <Text style={[styles.timeValue, timeRemaining.isRaceDay && styles.timeValueRaceDay]}>
            {String(timeRemaining.seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.timeLabel}>Seconds</Text>
        </View>
      </View>
    </View>
  );
}
