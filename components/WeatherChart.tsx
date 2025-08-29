
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart, AreaChart, YAxis } from 'react-native-svg-charts';
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

  // Calculate Y-axis scale with proper padding
  const padding = (maxValue - minValue) * 0.1 || 1;
  const yAxisMin = Math.max(0, minValue - padding);
  const yAxisMax = maxValue + padding;

  // Generate Y-axis labels
  const generateYAxisLabels = () => {
    const range = yAxisMax - yAxisMin;
    const stepCount = 5; // Number of labels on Y-axis
    const step = range / (stepCount - 1);
    
    return Array.from({ length: stepCount }, (_, i) => {
      const value = yAxisMin + (step * i);
      return Math.round(value * 10) / 10; // Round to 1 decimal place
    });
  };

  const yAxisLabels = generateYAxisLabels();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            Avg: {Math.round(avgValue * 10) / 10}{unitLabel}
          </Text>
          <Text style={styles.statText}>
            Range: {Math.round(minValue * 10) / 10}-{Math.round(maxValue * 10) / 10}{unitLabel}
          </Text>
        </View>
      </View>
      
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.chartWithAxis}>
          {/* Y-axis with labels */}
          <View style={styles.yAxisContainer}>
            <YAxis
              data={yAxisLabels}
              contentInset={{ top: 10, bottom: 10 }}
              svg={{
                fill: colors.textMuted,
                fontSize: 10,
                fontFamily: 'Roboto_400Regular',
              }}
              numberOfTicks={5}
              formatLabel={(value) => `${Math.round(value * 10) / 10}`}
              style={styles.yAxis}
            />
            <Text style={styles.yAxisUnit}>{unitLabel}</Text>
          </View>
          
          {/* Chart */}
          <View style={styles.chart}>
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
                yMin={yAxisMin}
                yMax={yAxisMax}
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
                yMin={yAxisMin}
                yMax={yAxisMax}
              />
            )}
          </View>
        </View>
      </View>
      
      {/* X-axis time labels */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeLabels}
      >
        {data.map((point, index) => {
          // Show every 3rd label to avoid overcrowding
          if (index % 3 !== 0 && index !== data.length - 1) {
            return <View key={index} style={styles.timeLabel} />;
          }
          
          return (
            <Text key={index} style={styles.timeLabelText}>
              {new Date(point.time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </Text>
          );
        })}
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
  chartWithAxis: {
    flexDirection: 'row',
    flex: 1,
  },
  yAxisContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yAxis: {
    flex: 1,
    width: 40,
  },
  yAxisUnit: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  chart: {
    flex: 1,
    marginLeft: 8,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 58, // Account for Y-axis width
    gap: 20,
  },
  timeLabel: {
    width: 40, // Placeholder for hidden labels
  },
  timeLabelText: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    minWidth: 40,
  },
  noData: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 20,
  },
});
