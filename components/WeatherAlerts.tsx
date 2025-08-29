
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface WeatherAlert {
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: string;
  end: string;
}

interface Props {
  alerts: WeatherAlert[];
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'minor': return colors.warning;
    case 'moderate': return colors.accent;
    case 'severe': return colors.error;
    case 'extreme': return '#8B0000';
    default: return colors.textMuted;
  }
}

function getSeverityIcon(severity: string): keyof typeof Icon.prototype {
  switch (severity) {
    case 'minor': return 'information-circle';
    case 'moderate': return 'warning';
    case 'severe': return 'alert-circle';
    case 'extreme': return 'alert';
    default: return 'information-circle';
  }
}

function formatAlertTime(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const now = new Date();
  
  if (startDate <= now && endDate > now) {
    return `Active until ${endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  } else if (startDate > now) {
    return `Starting ${startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  } else {
    return 'Expired';
  }
}

export default function WeatherAlerts({ alerts }: Props) {
  console.log('WeatherAlerts: Rendering', alerts.length, 'alerts');

  if (!alerts || alerts.length === 0) {
    return null; // Don't render anything if no alerts
  }

  // Sort alerts by severity (extreme first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { extreme: 0, severe: 1, moderate: 2, minor: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="warning" size={20} color={colors.error} />
        <Text style={styles.title}>Weather Alerts</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {sortedAlerts.map((alert, index) => {
          const severityColor = getSeverityColor(alert.severity);
          const severityIcon = getSeverityIcon(alert.severity);
          const timeText = formatAlertTime(alert.start, alert.end);
          
          return (
            <View key={index} style={[styles.alertCard, { borderLeftColor: severityColor }]}>
              <View style={styles.alertHeader}>
                <Icon name={severityIcon} size={18} color={severityColor} />
                <Text style={[styles.alertTitle, { color: severityColor }]}>
                  {alert.title}
                </Text>
                <Text style={styles.severityBadge}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.alertDescription}>
                {alert.description}
              </Text>
              
              <Text style={styles.alertTime}>
                {timeText}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      
      <Text style={styles.disclaimer}>
        Racing conditions may be affected. Monitor official race communications.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.error,
    boxShadow: '0 6px 24px rgba(225,6,0,0.1)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
    fontFamily: 'Roboto_700Bold',
    flex: 1,
  },
  scrollContainer: {
    maxHeight: 300,
  },
  alertCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
    flex: 1,
  },
  severityBadge: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    backgroundColor: colors.divider,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertDescription: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 18,
    marginBottom: 6,
  },
  alertTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    fontStyle: 'italic',
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
