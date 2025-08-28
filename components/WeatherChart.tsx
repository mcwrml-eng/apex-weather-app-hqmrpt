
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart, AreaChart } from 'react-native-svg-charts';
import { colors } from '../styles/commonStyles';
import * as shape from 'd3-shape';

interface WeatherDataPoint {
  time: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  precipitation: number;
}

interface Props {
  data: WeatherDataPoint[];
  type: 'temperature' | 'wind' | 'humidity' | 'precipitation';
  unit: 'metric' | 'imperial';
  height?: number;
}

export default function WeatherChart({ data, type, unit, height = 120 }: Props) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noData}>No data available</Text>
      </View>
    );
  }

  const getChartData = () => {
    switch (type) {
      case 'temperature':
        return data.map(d => d.temperature);
      case 'wind':
        return data.map(d => d.windSpeed);
      case 'humidity':
        return data.map(d => d.humidity);
      case 'precipitation':
        return data.map(d => d.precipitation);
      default:
        return [];
    }
  };

  const getChartColor = () => {
    switch (type) {
      case 'temperature':
        return colors.accent;
      case 'wind':
        return colors.primary;
      case 'humidity':
        return colors.secondary;
      case 'precipitation':
        return '#4FC3F7';
      default:
        return colors.primary;
    }
  };

  const getUnit = () => {
    switch (type) {
      case 'temperature':
        return unit === 'metric' ? '°C' : '°F';
      case 'wind':
        return unit === 'metric' ? 'km/h' : 'mph';
      case 'humidity':
        return '%';
      case 'precipitation':
        return 'mm';
      default:
        return '';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'temperature':
        return 'Temperature';
      case 'wind':
        return 'Wind Speed';
      case 'humidity':
        return 'Humidity';
      case 'precipitation':
        return 'Precipitation';
      default:
        return '';
    }
  };

  const chartData = getChartData();
  const chartColor = getChartColor();
  const unitLabel = getUnit();
  const title = getTitle();

  const minValue = Math.min(...chartData);
  const maxValue = Math.max(...chartData);
  const avgValue = chartData.reduce((sum, val) => sum + val, 0) / chartData.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            Avg: {Math.round(avgValue)}{unitLabel}
          </Text>
          <Text style={styles.statText}>
            Range: {Math.round(minValue)}-{Math.round(maxValue)}{unitLabel}
          </Text>
        </View>
      </View>
      
      <View style={[styles.chartContainer, { height }]}>
        {type === 'precipitation' ? (
          <AreaChart
            style={{ flex: 1 }}
            data={chartData}
            contentInset={{ top: 10, bottom: 10, left: 10, right: 10 }}
            curve={shape.curveNatural}
            svg={{
              fill: chartColor,
              fillOpacity: 0.3,
              stroke: chartColor,
              strokeWidth: 2,
            }}
          />
        ) : (
          <LineChart
            style={{ flex: 1 }}
            data={chartData}
            contentInset={{ top: 10, bottom: 10, left: 10, right: 10 }}
            curve={shape.curveNatural}
            svg={{
              stroke: chartColor,
              strokeWidth: 2,
            }}
          />
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeLabels}
      >
        {data.map((point, index) => (
          <Text key={index} style={styles.timeLabel}>
            {new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
  },
  stats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  chartContainer: {
    marginVertical: 8,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    gap: 20,
  },
  timeLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  noData: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 20,
  },
});
