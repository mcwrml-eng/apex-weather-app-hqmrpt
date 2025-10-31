
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

function getSeverityBackgroundColor(severity: string): string {
  switch (severity) {
    case 'minor': return 'rgba(245, 158, 11, 0.15)';
    case 'moderate': return 'rgba(249, 115, 22, 0.2)';
    case 'severe': return 'rgba(220, 38, 38, 0.25)';
    case 'extreme': return 'rgba(139, 0, 0, 0.3)';
    default: return 'rgba(100, 116, 139, 0.1)';
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
        <Icon name="warning" size={28} color={colors.error} />
        <Text style={styles.title}>WEATHER ALERTS</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {sortedAlerts.map((alert, index) => {
          const severityColor = getSeverityColor(alert.severity);
          const severityBgColor = getSeverityBackgroundColor(alert.severity);
          const severityIcon = getSeverityIcon(alert.severity);
          const timeText = formatAlertTime(alert.start, alert.end);
          
          return (
            <View 
              key={index} 
              style={[
                styles.alertCard, 
                { 
                  borderLeftColor: severityColor,
                  backgroundColor: severityBgColor,
                }
              ]}
            >
              <View style={styles.alertHeader}>
                <Icon name={severityIcon} size={26} color={severityColor} />
                <Text style={[styles.alertTitle, { color: severityColor }]}>
                  {alert.title}
                </Text>
              </View>
              
              <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                <Text style={styles.severityBadgeText}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.alertDescription}>
                {alert.description}
              </Text>
              
              <View style={styles.timeContainer}>
                <Icon name="time" size={14} color={colors.textMuted} />
                <Text style={styles.alertTime}>
                  {timeText}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      <View style={styles.disclaimerContainer}>
        <Icon name="information-circle" size={16} color={colors.textMuted} />
        <Text style={styles.disclaimer}>
          Racing conditions may be affected. Monitor official race communications.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.error,
    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.error,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.error,
    fontFamily: 'Roboto_700Bold',
    flex: 1,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollContainer: {
    maxHeight: 400,
  },
  alertCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    borderWidth: 2,
    borderColor: colors.divider,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Roboto_700Bold',
    flex: 1,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  severityBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Roboto_700Bold',
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  alertDescription: {
    fontSize: 15,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  alertTime: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    fontWeight: '600',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    flex: 1,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
