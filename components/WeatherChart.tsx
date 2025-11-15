
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, AreaChart, YAxis, XAxis } from 'react-native-svg-charts';
import { getColors } from '../styles/commonStyles';
import { getPrecipitationUnit } from '../hooks/useWeather';
import * as shape from 'd3-shape';
import { useTheme } from '../state/ThemeContext';

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
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  console.log('WeatherChart: Rendering', type, 'chart with', data.length, 'data points, unit:', unit);

  if (!data || data.length === 0) {
    return (
      <View style={[getStyles(colors).container, { height }]}>
        <Text style={getStyles(colors).noData}>No data available</Text>
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
      <View style={[getStyles(colors).container, { height }]}>
        <Text style={getStyles(colors).noData}>No valid data available</Text>
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

  // Get day name from date
  const getDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Get month name from date
  const getMonthName = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  };

  // Enhanced time formatting with better date context and clearer labeling
  const formatTimeLabel = (timeString: string, index: number, totalPoints: number) => {
    const date = new Date(timeString);
    const hour = date.getHours();
    const day = date.getDate();
    const dayName = getDayName(date);
    const monthName = getMonthName(date);
    
    // Check if this is a new day compared to previous point
    let isNewDay = false;
    if (index > 0) {
      const prevDate = new Date(validData[index - 1].time);
      isNewDay = prevDate.getDate() !== date.getDate();
    }
    
    // Get screen width to determine how many labels we can fit
    const screenWidth = Dimensions.get('window').width;
    const availableWidth = screenWidth - 100; // Account for Y-axis and padding
    const maxLabels = Math.floor(availableWidth / 60); // Minimum 60px per label to prevent overlap
    
    // Determine optimal label frequency based on data length and screen space
    let labelFrequency: number;
    
    if (totalPoints <= 12) {
      // For 12 hours or less, show every 2-3 hours
      labelFrequency = Math.max(2, Math.ceil(totalPoints / Math.min(maxLabels, 6)));
    } else if (totalPoints <= 24) {
      // For 24 hours, show every 4-6 hours
      labelFrequency = Math.max(4, Math.ceil(totalPoints / Math.min(maxLabels, 5)));
    } else if (totalPoints <= 48) {
      // For 48 hours, show every 8-12 hours
      labelFrequency = Math.max(8, Math.ceil(totalPoints / Math.min(maxLabels, 4)));
    } else if (totalPoints <= 72) {
      // For 72 hours, show every 12 hours
      labelFrequency = Math.max(12, Math.ceil(totalPoints / Math.min(maxLabels, 4)));
    } else {
      // For 96+ hours, show every 12-24 hours
      labelFrequency = Math.max(12, Math.ceil(totalPoints / Math.min(maxLabels, 4)));
    }
    
    // Always show first and last labels, plus key intervals and day transitions
    const isFirstOrLast = index === 0 || index === totalPoints - 1;
    const isKeyInterval = index % labelFrequency === 0;
    const isMidnight = hour === 0;
    
    // Show labels at strategic points
    if (isFirstOrLast || isKeyInterval || (isNewDay && isMidnight)) {
      if (totalPoints <= 24) {
        // For single day view, show time with AM/PM
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        if (index === 0) {
          // First label: show day and time
          return `${dayName} ${displayHour}${period}`;
        } else {
          return `${displayHour}${period}`;
        }
      } else if (totalPoints <= 48) {
        // For 2-day view, show time and indicate day changes
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        if (isNewDay || index === 0) {
          return `${dayName} ${displayHour}${period}`;
        } else {
          return `${displayHour}${period}`;
        }
      } else {
        // For 3+ day view, show day name and time for clarity
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        if (isNewDay || index === 0) {
          // Show full date context at day boundaries
          return `${dayName} ${day}`;
        } else if (isMidnight) {
          // Show time at midnight
          return `${displayHour}${period}`;
        } else {
          return `${displayHour}${period}`;
        }
      }
    }
    
    return '';
  };

  // Generate time labels array that matches data points exactly
  const generateTimeLabels = () => {
    const totalPoints = validData.length;
    console.log('WeatherChart: Generating time labels for', totalPoints, 'data points');
    
    // Create an array with the same length as data points
    // Each position corresponds to its data point
    return validData.map((point, index) => {
      return formatTimeLabel(point.time, index, totalPoints);
    });
  };

  const chartData = getChartData();
  const chartColor = getChartColor();
  const unitLabel = getUnit();
  const title = getTitle();
  const timeLabels = generateTimeLabels();

  console.log('WeatherChart: Chart data length:', chartData.length, 'Time labels length:', timeLabels.length);
  console.log('WeatherChart: Non-empty labels:', timeLabels.filter(l => l !== '').length);

  // Calculate time range for better context
  const firstDate = new Date(validData[0].time);
  const lastDate = new Date(validData[validData.length - 1].time);
  const hoursDiff = Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60));
  const daysDiff = Math.ceil(hoursDiff / 24);

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

  // Generate time range description
  const getTimeRangeDescription = () => {
    if (daysDiff === 1) {
      return `${hoursDiff} hours`;
    } else if (daysDiff <= 3) {
      return `${daysDiff} days`;
    } else {
      return `${daysDiff} days (${validData.length} data points)`;
    }
  };

  const styles = getStyles(colors);

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
                curve={shape.curveMonotoneX}
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
                curve={shape.curveMonotoneX}
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
      
      {/* Enhanced X-axis using XAxis component for proper alignment */}
      <View style={styles.xAxisContainer}>
        <View style={styles.xAxisWrapper}>
          <View style={styles.yAxisSpacer} />
          <XAxis
            style={styles.xAxis}
            data={chartData}
            formatLabel={(value, index) => timeLabels[index] || ''}
            contentInset={{ left: 10, right: 10 }}
            svg={{
              fill: colors.textMuted,
              fontSize: 9,
              fontFamily: 'Roboto_400Regular',
              rotation: 0,
              originY: 0,
              y: 5,
            }}
          />
        </View>
        <Text style={styles.xAxisTitle}>
          Time Period: {getTimeRangeDescription()} • {getDayName(firstDate)} {firstDate.getDate()} {getMonthName(firstDate)} - {getDayName(lastDate)} {lastDate.getDate()} {getMonthName(lastDate)}
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

function getStyles(colors: any) {
  return StyleSheet.create({
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
    },
    xAxisWrapper: {
      flexDirection: 'row',
      height: 40,
    },
    yAxisSpacer: {
      width: 55,
    },
    xAxis: {
      flex: 1,
      marginLeft: 8,
      height: 40,
    },
    xAxisTitle: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
      lineHeight: 14,
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
}
