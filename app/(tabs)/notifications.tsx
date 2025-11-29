
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, getCommonStyles, spacing, borderRadius, getShadows, layout } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import AppHeader from '../../components/AppHeader';
import ErrorBoundary from '../../components/ErrorBoundary';
import NotificationService, { NotificationPreferences } from '../../utils/notificationService';
import OfflineStorageService from '../../utils/offlineStorage';

export default function NotificationsScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark);
  const shadows = getShadows(isDark);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    raceReminders: true,
    weatherAlerts: true,
    dayBeforeRace: true,
    raceDay: true,
    weatherChanges: true,
  });

  const [scheduledCount, setScheduledCount] = useState(0);
  const [cacheStats, setCacheStats] = useState({
    totalCached: 0,
    totalSize: '0 KB',
    oldestCache: null as number | null,
    newestCache: null as number | null,
  });

  useEffect(() => {
    loadPreferences();
    loadScheduledNotifications();
    loadCacheStats();
  }, []);

  const loadPreferences = async () => {
    const prefs = await NotificationService.getPreferences();
    setPreferences(prefs);
  };

  const loadScheduledNotifications = async () => {
    const notifications = await NotificationService.getAllScheduledNotifications();
    setScheduledCount(notifications.length);
  };

  const loadCacheStats = async () => {
    const stats = await OfflineStorageService.getCacheStats();
    setCacheStats(stats);
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await NotificationService.updatePreferences({ [key]: value });
    console.log('NotificationsScreen: Updated preference', key, value);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all offline weather data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await OfflineStorageService.clearAllCache();
            await loadCacheStats();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleClearNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'This will cancel all scheduled notifications. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await NotificationService.cancelAllNotifications();
            await loadScheduledNotifications();
            Alert.alert('Success', 'All notifications cancelled');
          },
        },
      ]
    );
  };

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
      paddingBottom: 100,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: spacing.md,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: spacing.lg,
      lineHeight: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 18,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: 'Roboto_700Bold',
      marginTop: spacing.xs,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    button: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonDanger: {
      backgroundColor: colors.error + '20',
      borderColor: colors.error,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    buttonTextDanger: {
      color: colors.error,
    },
    infoBox: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    infoText: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      lineHeight: 18,
    },
  });

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <AppHeader
          title="Notifications & Cache"
          subtitle="Manage alerts and offline data"
          icon={<Ionicons name="notifications" size={32} color={colors.primary} />}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.scrollContent}>
            {/* Race Reminders Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏁 Race Reminders</Text>
              <Text style={styles.sectionDescription}>
                Get notified before race events to check weather conditions
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Race Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications for upcoming races
                  </Text>
                </View>
                <Switch
                  value={preferences.raceReminders}
                  onValueChange={(value) => updatePreference('raceReminders', value)}
                  trackColor={{ false: colors.divider, true: colors.primary + '80' }}
                  thumbColor={preferences.raceReminders ? colors.primary : colors.textMuted}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Day Before Race</Text>
                  <Text style={styles.settingDescription}>
                    Reminder at 6 PM the day before
                  </Text>
                </View>
                <Switch
                  value={preferences.dayBeforeRace}
                  onValueChange={(value) => updatePreference('dayBeforeRace', value)}
                  disabled={!preferences.raceReminders}
                  trackColor={{ false: colors.divider, true: colors.primary + '80' }}
                  thumbColor={preferences.dayBeforeRace ? colors.primary : colors.textMuted}
                />
              </View>

              <View style={[styles.settingRow, styles.settingRowLast]}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Race Day Morning</Text>
                  <Text style={styles.settingDescription}>
                    Reminder at 8 AM on race day
                  </Text>
                </View>
                <Switch
                  value={preferences.raceDay}
                  onValueChange={(value) => updatePreference('raceDay', value)}
                  disabled={!preferences.raceReminders}
                  trackColor={{ false: colors.divider, true: colors.primary + '80' }}
                  thumbColor={preferences.raceDay ? colors.primary : colors.textMuted}
                />
              </View>
            </View>

            {/* Weather Alerts Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Weather Alerts</Text>
              <Text style={styles.sectionDescription}>
                Get notified about severe weather conditions at race circuits
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Weather Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Severe and extreme weather warnings
                  </Text>
                </View>
                <Switch
                  value={preferences.weatherAlerts}
                  onValueChange={(value) => updatePreference('weatherAlerts', value)}
                  trackColor={{ false: colors.divider, true: colors.primary + '80' }}
                  thumbColor={preferences.weatherAlerts ? colors.primary : colors.textMuted}
                />
              </View>

              <View style={[styles.settingRow, styles.settingRowLast]}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Weather Changes</Text>
                  <Text style={styles.settingDescription}>
                    Significant forecast changes
                  </Text>
                </View>
                <Switch
                  value={preferences.weatherChanges}
                  onValueChange={(value) => updatePreference('weatherChanges', value)}
                  disabled={!preferences.weatherAlerts}
                  trackColor={{ false: colors.divider, true: colors.primary + '80' }}
                  thumbColor={preferences.weatherChanges ? colors.primary : colors.textMuted}
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 Only severe and extreme weather alerts will trigger notifications to avoid spam
                </Text>
              </View>
            </View>

            {/* Notification Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Notification Stats</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="calendar" size={24} color={colors.primary} />
                  <Text style={styles.statValue}>{scheduledCount}</Text>
                  <Text style={styles.statLabel}>Scheduled Notifications</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.buttonDanger]}
                onPress={handleClearNotifications}
                disabled={scheduledCount === 0}
              >
                <Text style={[styles.buttonText, styles.buttonTextDanger]}>
                  Clear All Notifications
                </Text>
              </TouchableOpacity>
            </View>

            {/* Offline Cache Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💾 Offline Cache</Text>
              <Text style={styles.sectionDescription}>
                Weather data is automatically cached for offline access
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="cloud-download" size={24} color={colors.primary} />
                  <Text style={styles.statValue}>{cacheStats.totalCached}</Text>
                  <Text style={styles.statLabel}>Cached Circuits</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="server" size={24} color={colors.primary} />
                  <Text style={styles.statValue}>{cacheStats.totalSize}</Text>
                  <Text style={styles.statLabel}>Storage Used</Text>
                </View>
              </View>

              {cacheStats.newestCache && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    📅 Last cached: {new Date(cacheStats.newestCache).toLocaleString()}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, styles.buttonDanger]}
                onPress={handleClearCache}
                disabled={cacheStats.totalCached === 0}
              >
                <Text style={[styles.buttonText, styles.buttonTextDanger]}>
                  Clear Cache
                </Text>
              </TouchableOpacity>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 The app automatically caches weather data for the last 10 circuits you viewed. 
                  This allows you to access weather information even when offline.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}
