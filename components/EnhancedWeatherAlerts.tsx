
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface WeatherAlert {
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: string;
  end: string;
}

interface Props {
  alerts: WeatherAlert[];
  onDismiss?: (index: number) => void;
}

export default function EnhancedWeatherAlerts({ alerts, onDismiss }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return colors.error;
      case 'severe':
        return colors.warning;
      case 'moderate':
        return colors.info;
      case 'minor':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'alert-circle';
      case 'severe':
        return 'warning';
      case 'moderate':
        return 'information-circle';
      case 'minor':
        return 'checkmark-circle';
      default:
        return 'alert';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'EXTREME';
      case 'severe':
        return 'SEVERE';
      case 'moderate':
        return 'MODERATE';
      case 'minor':
        return 'MINOR';
      default:
        return 'ALERT';
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    alertsContainer: {
      gap: spacing.md,
    },
    alertCard: {
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 2,
      boxShadow: shadows.md,
      overflow: 'hidden',
    },
    alertHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    alertTitleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    alertIcon: {
      marginRight: spacing.md,
    },
    alertTitleText: {
      flex: 1,
    },
    alertTitle: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: 'Roboto_700Bold',
      marginBottom: spacing.xs,
    },
    alertSeverity: {
      fontSize: 11,
      fontWeight: '600',
      fontFamily: 'Roboto_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
    },
    dismissButton: {
      padding: spacing.sm,
    },
    alertDescription: {
      fontSize: 14,
      fontWeight: '400',
      fontFamily: 'Roboto_400Regular',
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    alertFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing.md,
      borderTopWidth: 1,
    },
    timeInfo: {
      fontSize: 12,
      fontWeight: '500',
      fontFamily: 'Roboto_500Medium',
      opacity: 0.8,
    },
    actionButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'Roboto_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
  });

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.alertsContainer} scrollEnabled={alerts.length > 2} nestedScrollEnabled>
        {alerts.map((alert, index) => {
          const severityColor = getSeverityColor(alert.severity);
          const severityIcon = getSeverityIcon(alert.severity);

          return (
            <View
              key={index}
              style={[
                styles.alertCard,
                {
                  borderColor: severityColor,
                  backgroundColor: severityColor + '15',
                },
              ]}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertTitleContainer}>
                  <Ionicons
                    name={severityIcon}
                    size={24}
                    color={severityColor}
                    style={styles.alertIcon}
                  />
                  <View style={styles.alertTitleText}>
                    <Text style={[styles.alertSeverity, { color: severityColor }]}>
                      {getSeverityLabel(alert.severity)}
                    </Text>
                    <Text style={[styles.alertTitle, { color: severityColor }]}>
                      {alert.title}
                    </Text>
                  </View>
                </View>

                {onDismiss && (
                  <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={() => onDismiss(index)}
                  >
                    <Ionicons name="close" size={20} color={severityColor} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.alertDescription, { color: colors.text }]}>
                {alert.description}
              </Text>

              <View
                style={[
                  styles.alertFooter,
                  { borderTopColor: severityColor + '40' },
                ]}
              >
                <Text style={[styles.timeInfo, { color: severityColor }]}>
                  {formatTime(alert.start)} - {formatTime(alert.end)}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: severityColor + '25' },
                  ]}
                >
                  <Text style={[styles.actionButtonText, { color: severityColor }]}>
                    Learn More
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
