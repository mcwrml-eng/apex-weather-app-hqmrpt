
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPreferences {
  raceReminders: boolean;
  weatherAlerts: boolean;
  dayBeforeRace: boolean;
  raceDay: boolean;
  weatherChanges: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  raceReminders: true,
  weatherAlerts: true,
  dayBeforeRace: true,
  raceDay: true,
  weatherChanges: true,
};

const PREFERENCES_KEY = '@notification_preferences';

export class NotificationService {
  private static instance: NotificationService;
  private notificationListener: any;
  private responseListener: any;

  private constructor() {
    console.log('NotificationService: Initializing');
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    try {
      console.log('NotificationService: Starting initialization');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('NotificationService: Permission not granted');
        return false;
      }

      console.log('NotificationService: Permission granted');

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('race-alerts', {
          name: 'Race Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        await Notifications.setNotificationChannelAsync('weather-alerts', {
          name: 'Weather Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Set up listeners
      this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('NotificationService: Notification received', notification);
      });

      this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('NotificationService: Notification response', response);
      });

      return true;
    } catch (error) {
      console.error('NotificationService: Initialization error', error);
      return false;
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('NotificationService: Error getting preferences', error);
      return DEFAULT_PREFERENCES;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...preferences };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      console.log('NotificationService: Preferences updated', updated);
    } catch (error) {
      console.error('NotificationService: Error updating preferences', error);
    }
  }

  async scheduleRaceReminder(
    circuitName: string,
    raceDate: Date,
    category: string
  ): Promise<string | null> {
    try {
      const preferences = await this.getPreferences();
      
      if (!preferences.raceReminders) {
        console.log('NotificationService: Race reminders disabled');
        return null;
      }

      const now = new Date();
      const dayBefore = new Date(raceDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      dayBefore.setHours(18, 0, 0, 0); // 6 PM day before

      // Schedule day-before reminder
      if (preferences.dayBeforeRace && dayBefore > now) {
        const dayBeforeId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${category.toUpperCase()} Race Tomorrow! 🏁`,
            body: `${circuitName} - Don't forget to check the weather forecast`,
            data: { type: 'race-reminder', circuitName, category },
            sound: true,
          },
          trigger: dayBefore,
        });
        console.log('NotificationService: Day-before reminder scheduled', dayBeforeId);
      }

      // Schedule race day reminder
      if (preferences.raceDay && raceDate > now) {
        const raceDay = new Date(raceDate);
        raceDay.setHours(8, 0, 0, 0); // 8 AM race day

        const raceDayId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Race Day! 🏎️`,
            body: `${circuitName} - ${category.toUpperCase()} - Check current weather conditions`,
            data: { type: 'race-day', circuitName, category },
            sound: true,
          },
          trigger: raceDay,
        });
        console.log('NotificationService: Race day reminder scheduled', raceDayId);
        return raceDayId;
      }

      return null;
    } catch (error) {
      console.error('NotificationService: Error scheduling race reminder', error);
      return null;
    }
  }

  async sendWeatherAlert(
    circuitName: string,
    alertTitle: string,
    alertBody: string,
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      
      if (!preferences.weatherAlerts) {
        console.log('NotificationService: Weather alerts disabled');
        return;
      }

      // Only send severe and extreme alerts immediately
      if (severity === 'severe' || severity === 'extreme') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⚠️ ${alertTitle}`,
            body: `${circuitName}: ${alertBody}`,
            data: { type: 'weather-alert', circuitName, severity },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // Send immediately
        });
        console.log('NotificationService: Weather alert sent', alertTitle);
      }
    } catch (error) {
      console.error('NotificationService: Error sending weather alert', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('NotificationService: All notifications cancelled');
    } catch (error) {
      console.error('NotificationService: Error cancelling notifications', error);
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('NotificationService: Notification cancelled', notificationId);
    } catch (error) {
      console.error('NotificationService: Error cancelling notification', error);
    }
  }

  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('NotificationService: Scheduled notifications', notifications.length);
      return notifications;
    } catch (error) {
      console.error('NotificationService: Error getting scheduled notifications', error);
      return [];
    }
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    console.log('NotificationService: Cleaned up');
  }
}

export default NotificationService.getInstance();
