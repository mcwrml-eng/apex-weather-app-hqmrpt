
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, AreaChart, YAxis, XAxis } from 'react-native-svg-charts';
import { colors } from '../styles/commonStyles';
import { getPrecipitationUnit } from '../hooks/useWeather';
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

export default function WeatherChart({ data, type, unit, height = 140 }: Props) {
  console.log('WeatherChart: Rendering accurate', type, 'chart with', data.length, 'data points, unit:', unit);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noData}>No data available</Text>
      </View>
    );
  }

  // Enhanced data validation and filtering
  const validData = data.filter(d => {
    const value = getDataValue(d);
    return value !== null && value !== undefined && !isNaN(value) && isFinite(value);
  });

  if (validData.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noData}>No valid data available</Text>
      </View>
    );
  }

  function getDataValue(dataPoint: WeatherDataPoint): number {
    switch (type) {
      case 'temperature':
        return dataPoint.temperature;
      case 'wind':
        return dataPoint.windSpeed;
      case 'humidity':
        return dataPoint.humidity;
      case 'precipitation':
        return dataPoint.precipitation;
      default:
        return 0;
    }
  }

  const getChartData = () => {
    return validData.map(d => getDataValue(d));
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
        return getPrecipitationUnit(unit);
      default:
        return '';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'temperature':
        return 'Temperature Analysis';
      case 'wind':
        return 'Wind Speed Analysis';
      case 'humidity':
        return 'Humidity Analysis';
      case 'precipitation':
        return 'Precipitation Analysis';
      default:
        return '';
    }
  };

  const formatValue = (value: number) => {
    if (type === 'precipitation') {
      if (unit === 'imperial') {
        // For imperial precipitation, show appropriate decimal places
        if (value < 0.01) return '0.00';
        if (value < 0.1) return value.toFixed(3);
        if (value < 1) return value.toFixed(2);
        return value.toFixed(1);
      } else {
        // For metric precipitation
        if (value < 0.1) return value.toFixed(2);
        if (value < 10) return value.toFixed(1);
        return Math.round(value).toString();
      }
    }
    
    if (type === 'temperature') {
      return value.toFixed(1);
    }
    
    if (type === 'humidity') {
      return Math.round(value).toString();
    }
    
    // Wind speed
    return value.toFixed(1);
  };

  // Enhanced time formatting with dynamic scaling based on data length and screen width
  const formatTimeLabel = (timeString: string, index: number, totalPoints: number) => {
    const date = new Date(timeString);
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    // Get screen width to determine how many labels we can fit
    const screenWidth = Dimensions.get('window').width;
    const availableWidth = screenWidth - 100; // Account for Y-axis and padding
    const maxLabels = Math.floor(availableWidth / 45); // Minimum 45px per label to prevent overlap
    
    // Determine optimal label frequency based on data length and screen space
    let labelFrequency: number;
    
    if (totalPoints <= 12) {
      // For 12 hours or less, show every hour if space allows
      labelFrequency = Math.max(1, Math.ceil(totalPoints / maxLabels));
    } else if (totalPoints <= 24) {
      // For 24 hours, show every 3-4 hours
      labelFrequency = Math.max(3, Math.ceil(totalPoints / maxLabels));
    } else if (totalPoints <= 48) {
      // For 48 hours, show every 6 hours
      labelFrequency = Math.max(6, Math.ceil(totalPoints / maxLabels));
    } else {
      // For 72+ hours, show every 8-12 hours
      labelFrequency = Math.max(8, Math.ceil(totalPoints / maxLabels));
    }
    
    // Always show first and last labels
    const isFirstOrLast = index === 0 || index === totalPoints - 1;
    const isKeyInterval = index % labelFrequency === 0;
    const isNewDay = hour === 0 && index > 0;
    
    if (isFirstOrLast || isKeyInterval || isNewDay) {
      if (totalPoints <= 24) {
        // For shorter periods, show just the hour
        return `${hour.toString().padStart(2, '0')}h`;
      } else {
        // For longer periods, show hour with day context for new days
        if (isNewDay || index === 0) {
          return `${hour.toString().padStart(2, '0')}h\n${day}/${month}`;
        } else {
          return `${hour.toString().padStart(2, '0')}h`;
        }
      }
    }
    
    return '';
  };

  // Generate optimized time labels that fit within screen bounds
  const generateTimeLabels = () => {
    const totalPoints = validData.length;
    console.log('WeatherChart: Generating optimized time labels for', totalPoints, 'data points');
    
    return validData.map((point, index) => {
      return formatTimeLabel(point.time, index, totalPoints);
    });
  };

  const chartData = getChartData();
  const chartColor = getChartColor();
  const unitLabel = getUnit();
  const title = getTitle();
  const timeLabels = generateTimeLabels();

  // Enhanced statistical calculations
  const minValue = Math.min(...chartData);
  const maxValue = Math.max(...chartData);
  const avgValue = chartData.reduce((sum, val) => sum + val, 0) / chartData.length;
  const medianValue = [...chartData].sort((a, b) => a - b)[Math.floor(chartData.length / 2)];
  
  // Calculate standard deviation for better scale determination
  const variance = chartData.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / chartData.length;
  const stdDev = Math.sqrt(variance);

  // Enhanced Y-axis scale calculation with intelligent padding
  let yAxisMin: number;
  let yAxisMax: number;

  if (type === 'humidity') {
    // Humidity should always show 0-100% range for context
    yAxisMin = 0;
    yAxisMax = 100;
  } else if (type === 'precipitation') {
    // Precipitation should start from 0
    yAxisMin = 0;
    const padding = Math.max(maxValue * 0.1, unit === 'imperial' ? 0.01 : 0.5);
    yAxisMax = maxValue + padding;
  } else {
    // For temperature and wind, use intelligent padding based on data distribution
    const range = maxValue - minValue;
    const padding = Math.max(range * 0.15, stdDev * 0.5, 1);
    
    if (type === 'wind') {
      yAxisMin = Math.max(0, minValue - padding);
    } else {
      yAxisMin = minValue - padding;
    }
    yAxisMax = maxValue + padding;
  }

  // Generate intelligent Y-axis labels
  const generateYAxisLabels = () => {
    const range = yAxisMax - yAxisMin;
    let stepCount = 6; // Default number of labels
    
    // Adjust step count based on range for better readability
    if (range < 5) stepCount = 6;
    else if (range < 20) stepCount = 5;
    else if (range < 100) stepCount = 5;
    else stepCount = 4;
    
    const step = range / (stepCount - 1);
    
    return Array.from({ length: stepCount }, (_, i) => {
      const value = yAxisMin + (step * i);
      return parseFloat(formatValue(value));
    });
  };

  const yAxisLabels = generateYAxisLabels();

  // Calculate trend (simple linear regression slope)
  const n = chartData.length;
  const sumX = chartData.reduce((sum, _, i) => sum + i, 0);
  const sumY = chartData.reduce((sum, val) => sum + val, 0);
  const sumXY = chartData.reduce((sum, val, i) => sum + i * val, 0);
  const sumXX = chartData.reduce((sum, _, i) => sum + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const trend = slope > 0.1 ? 'Rising' : slope < -0.1 ? 'Falling' : 'Stable';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            Avg: {formatValue(avgValue)}{unitLabel}
          </Text>
          <Text style={styles.statText}>
            Range: {formatValue(minValue)}-{formatValue(maxValue)}{unitLabel}
          </Text>
          <Text style={styles.trendText}>
            Trend: {trend}
          </Text>
        </View>
      </View>
      
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.chartWithAxis}>
          {/* Enhanced Y-axis with better formatting */}
          <View style={styles.yAxisContainer}>
            <YAxis
              data={yAxisLabels}
              contentInset={{ top: 15, bottom: 15 }}
              svg={{
                fill: colors.textMuted,
                fontSize: 10,
                fontFamily: 'Roboto_400Regular',
              }}
              numberOfTicks={yAxisLabels.length}
              formatLabel={(value) => formatValue(value)}
              style={styles.yAxis}
              min={yAxisMin}
              max={yAxisMax}
            />
            <Text style={styles.yAxisUnit}>{unitLabel}</Text>
          </View>
          
          {/* Enhanced Chart with better styling */}
          <View style={styles.chart}>
            {type === 'precipitation' ? (
              <AreaChart
                style={{ flex: 1 }}
                data={chartData}
                contentInset={{ top: 15, bottom: 15, left: 5, right: 5 }}
                curve={shape.curveMonotoneX} // Better curve for precipitation data
                svg={{
                  fill: chartColor,
                  fillOpacity: 0.4,
                  stroke: chartColor,
                  strokeWidth: 2.5,
                }}
                yMin={yAxisMin}
                yMax={yAxisMax}
              />
            ) : (
              <LineChart
                style={{ flex: 1 }}
                data={chartData}
                contentInset={{ top: 15, bottom: 15, left: 5, right: 5 }}
                curve={shape.curveMonotoneX} // Smoother curves for better accuracy representation
                svg={{
                  stroke: chartColor,
                  strokeWidth: 2.5,
                  strokeOpacity: 0.9,
                }}
                yMin={yAxisMin}
                yMax={yAxisMax}
              />
            )}
          </View>
        </View>
      </View>
      
      {/* Enhanced X-axis with responsive time scales that prevent overflow */}
      <View style={styles.xAxisContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.xAxisScrollContent}
        >
          <View style={styles.xAxisLabelsContainer}>
            {timeLabels.map((label, index) => (
              <View key={index} style={[
                styles.xAxisLabelWrapper,
                { 
                  minWidth: label ? 40 : 20,
                  opacity: label ? 1 : 0
                }
              ]}>
                <Text style={[
                  styles.xAxisLabel,
                  { 
                    fontSize: validData.length > 48 ? 9 : 10,
                    fontWeight: label ? '500' : '400',
                    textAlign: 'center',
                    lineHeight: validData.length > 48 ? 11 : 12,
                  }
                ]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <Text style={styles.xAxisTitle}>
          Time Scale ({validData.length <= 24 ? 'Hourly' : validData.length <= 48 ? '6-hour intervals' : '8-12 hour intervals'})
        </Text>
      </View>

      {/* Enhanced statistics panel */}
      <View style={styles.statsPanel}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={styles.statValue}>{formatValue(minValue)}{unitLabel}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max</Text>
          <Text style={styles.statValue}>{formatValue(maxValue)}{unitLabel}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>{formatValue(avgValue)}{unitLabel}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Median</Text>
          <Text style={styles.statValue}>{formatValue(medianValue)}{unitLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    flex: 1,
  },
  stats: {
    alignItems: 'flex-end',
    flex: 1,
  },
  statText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 2,
  },
  trendText: {
    fontSize: 11,
    color: colors.primary,
    fontFamily: 'Roboto_500Medium',
    fontWeight: '500',
  },
  chartContainer: {
    marginVertical: 10,
  },
  chartWithAxis: {
    flexDirection: 'row',
    flex: 1,
  },
  yAxisContainer: {
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yAxis: {
    flex: 1,
    width: 45,
  },
  yAxisUnit: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  chart: {
    flex: 1,
    marginLeft: 8,
  },
  xAxisContainer: {
    marginTop: 8,
    paddingLeft: 55, // Account for Y-axis width
  },
  xAxisScrollContent: {
    paddingHorizontal: 4,
  },
  xAxisLabelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
    gap: 2,
  },
  xAxisLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  xAxisLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
  xAxisTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  statsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    fontWeight: '500',
  },
  noData: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 20,
    fontSize: 14,
  },
});
