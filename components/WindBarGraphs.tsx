
import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart, YAxis, XAxis } from 'react-native-svg-charts';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import { getColors, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';
import { validateWindSpeed, validateWindDirection } from '../hooks/useWeather';

interface HourlyData {
  time: string;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
}

interface Props {
  hourlyData: HourlyData[];
  unit: 'metric' | 'imperial';
}

function formatHour(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    hour12: false 
  });
}

// Enhanced time formatting for 3-hour intervals on 24-hour day
function formatTimeLabel(timeString: string, index: number, totalPoints: number): string {
  const date = new Date(timeString);
  const hour = date.getHours();
  
  // For 24-hour display with 3-hour intervals, show: 0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h
  return `${hour.toString().padStart(2, '0')}h`;
}

function getWindDirectionLabel(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const normalizedDegrees = ((degrees % 360) + 360) % 360; // Ensure positive
  const index = Math.round(normalizedDegrees / 22.5) % 16;
  return directions[index];
}

// Enhanced Wind direction arrow component with better accuracy
function WindDirectionArrow({ direction, size = 20 }: { direction: number; size?: number }) {
  // Validate and normalize direction
  const normalizedDirection = validateWindDirection(direction);
  
  // Adjust rotation so arrow points in the direction wind is blowing TO
  // Add 180 degrees to convert from "coming from" to "blowing to"
  const rotation = (normalizedDirection + 180) % 360;
  const arrowSize = size;
  const center = arrowSize / 2;
  
  // Create more accurate arrow shape points (pointing upward initially)
  const arrowPoints = [
    `${center},2`,           // Top point
    `${arrowSize - 3},${arrowSize - 3}`, // Bottom right
    `${center},${arrowSize - 6}`,        // Bottom center (shaft)
    `3,${arrowSize - 3}`     // Bottom left
  ].join(' ');
  
  return (
    <View style={[styles.arrowWrapper, { width: arrowSize, height: arrowSize }]}>
      <Svg 
        width={arrowSize} 
        height={arrowSize} 
        style={{ 
          transform: [{ rotate: `${rotation}deg` }],
        }}
        viewBox={`0 0 ${arrowSize} ${arrowSize}`}
      >
        {/* Arrow body */}
        <Polygon
          points={arrowPoints}
          fill={colors.primary}
          stroke={colors.primary}
          strokeWidth="1"
        />
        {/* Arrow shaft line for better visibility */}
        <Line
          x1={center}
          y1={4}
          x2={center}
          y2={arrowSize - 4}
          stroke={colors.primary}
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
}

// Custom Scatter Plot Component for Wind Direction
function WindDirectionScatterPlot({ data, width, height }: { data: any[], width: number, height: number }) {
  console.log('WindDirectionScatterPlot: Rendering scatter plot with', data.length, 'points');
  
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Calculate scales
  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth + margin.left;
  const yScale = (value: number) => chartHeight - ((value / 360) * chartHeight) + margin.top;
  
  return (
    <Svg width={width} height={height}>
      {/* Grid lines for better readability */}
      {[0, 90, 180, 270, 360].map((value) => (
        <Line
          key={value}
          x1={margin.left}
          y1={yScale(value)}
          x2={width - margin.right}
          y2={yScale(value)}
          stroke={colors.divider}
          strokeWidth="1"
          strokeOpacity="0.3"
        />
      ))}
      
      {/* Vertical grid lines */}
      {data.map((_, index) => {
        if (index % 3 === 0) { // Show grid lines every 3 hours
          return (
            <Line
              key={index}
              x1={xScale(index)}
              y1={margin.top}
              x2={xScale(index)}
              y2={height - margin.bottom}
              stroke={colors.divider}
              strokeWidth="1"
              strokeOpacity="0.2"
            />
          );
        }
        return null;
      })}
      
      {/* Scatter plot points */}
      {data.map((point, index) => (
        <Circle
          key={index}
          cx={xScale(index)}
          cy={yScale(point.value)}
          r="4"
          fill={colors.text}
          fillOpacity="0.8"
          stroke={colors.primary}
          strokeWidth="1"
        />
      ))}
      
      {/* Connect points with a line for trend visibility */}
      {data.length > 1 && (
        <Line
          x1={xScale(0)}
          y1={yScale(data[0].value)}
          x2={xScale(data.length - 1)}
          y2={yScale(data[data.length - 1].value)}
          stroke={colors.textMuted}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="5,5"
        />
      )}
    </Svg>
  );
}

function WindBarGraphs({ hourlyData, unit }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  console.log('WindBarGraphs: Rendering accurate wind data for', hourlyData.length, 'hours, unit:', unit);

  if (!hourlyData || hourlyData.length === 0) {
    const styles = getStyles(colors, shadows);
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No wind data available</Text>
      </View>
    );
  }

  // Use the first 24 hours of data and validate all values
  const displayData = hourlyData.slice(0, 24).map(hour => ({
    ...hour,
    windSpeed: validateWindSpeed(hour.windSpeed, unit),
    windGusts: validateWindSpeed(hour.windGusts, unit),
    windDirection: validateWindDirection(hour.windDirection),
  }));

  console.log('WindBarGraphs: Sample wind data after validation:', displayData.slice(0, 3).map(h => ({
    time: h.time,
    windSpeed: h.windSpeed,
    windGusts: h.windGusts,
    windDirection: h.windDirection
  })));

  if (displayData.length === 0) {
    const styles = getStyles(colors, shadows);
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No valid wind data available for display</Text>
      </View>
    );
  }

  // Extract and validate wind data with enhanced accuracy
  const windSpeedData = displayData.map((hour, index) => {
    const speed = hour.windSpeed;
    return { value: speed, index, hour };
  });
  
  const windGustData = displayData.map((hour, index) => {
    const gusts = hour.windGusts;
    return { value: gusts, index, hour };
  });
  
  const windDirectionData = displayData.map((hour, index) => {
    const direction = hour.windDirection;
    return { value: direction, index, hour };
  });
  
  // Enhanced scale calculations with better accuracy
  const allWindSpeeds = windSpeedData.map(d => d.value);
  const allWindGusts = windGustData.map(d => d.value);
  const allWindValues = [...allWindSpeeds, ...allWindGusts];
  
  console.log('WindBarGraphs: Wind speed values:', allWindSpeeds.slice(0, 5));
  console.log('WindBarGraphs: Wind gust values:', allWindGusts.slice(0, 5));
  console.log('WindBarGraphs: All wind values range:', Math.min(...allWindValues), 'to', Math.max(...allWindValues));
  
  const minWind = Math.min(...allWindValues);
  const maxWind = Math.max(...allWindValues);
  const avgWindSpeed = allWindSpeeds.reduce((sum, val) => sum + val, 0) / allWindSpeeds.length;
  const avgWindGusts = allWindGusts.reduce((sum, val) => sum + val, 0) / allWindGusts.length;
  
  // Calculate intelligent scale with proper padding
  const range = maxWind - minWind;
  const padding = Math.max(range * 0.1, 2); // Minimum 2 unit padding
  const chartMin = Math.max(0, minWind - padding);
  const chartMax = maxWind + padding;
  
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  // Generate accurate Y-axis labels for wind speed
  const generateSpeedYAxisLabels = () => {
    const range = chartMax - chartMin;
    const stepCount = 6;
    const step = range / (stepCount - 1);
    
    return Array.from({ length: stepCount }, (_, i) => {
      const value = chartMin + (step * i);
      return Math.round(value * 10) / 10; // Round to 1 decimal place
    });
  };

  const speedYAxisLabels = generateSpeedYAxisLabels();

  // Generate time labels at 3-hour intervals for 24-hour day
  const generateTimeLabels = () => {
    const totalPoints = displayData.length;
    console.log('WindBarGraphs: Generating 3-hour interval labels for', totalPoints, 'data points');
    
    // For 24-hour period, we want labels at 3-hour intervals: 0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h
    const targetHours = [0, 3, 6, 9, 12, 15, 18, 21];
    
    return displayData.map((hour, index) => {
      const date = new Date(hour.time);
      const hourValue = date.getHours();
      
      // Show label if this hour matches one of our target 3-hour intervals
      if (targetHours.includes(hourValue)) {
        return formatTimeLabel(hour.time, index, totalPoints);
      }
      return '';
    });
  };

  const timeLabels = generateTimeLabels();

  // Prepare data for BarChart - it expects simple number arrays
  const windSpeedValues = windSpeedData.map(d => d.value);
  const windGustValues = windGustData.map(d => d.value);
  const windDirectionValues = windDirectionData.map(d => d.value);

  console.log('WindBarGraphs: Final chart data - Speed values:', windSpeedValues.slice(0, 5));
  console.log('WindBarGraphs: Final chart data - Gust values:', windGustValues.slice(0, 5));
  console.log('WindBarGraphs: Chart scale - min:', chartMin, 'max:', chartMax);

  // Calculate wind statistics for enhanced accuracy
  const maxSpeedIndex = windSpeedValues.indexOf(Math.max(...windSpeedValues));
  const maxGustIndex = windGustValues.indexOf(Math.max(...windGustValues));
  const minSpeedIndex = windSpeedValues.indexOf(Math.min(...windSpeedValues));
  
  const gustFactor = avgWindSpeed > 0 ? avgWindGusts / avgWindSpeed : 1;
  
  // Calculate wind variability (standard deviation)
  const speedVariance = windSpeedValues.reduce((sum, val) => sum + Math.pow(val - avgWindSpeed, 2), 0) / windSpeedValues.length;
  const speedStdDev = Math.sqrt(speedVariance);

  const styles = getStyles(colors, shadows);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enhanced Wind Analysis</Text>
      <Text style={styles.subtitle}>Separate charts for wind speed and gusts with accurate 24-hour analysis and 3-hour interval time scales</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Wind Speed Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Wind Speed ({speedUnit})</Text>
          <Text style={styles.chartSubtitle}>
            Average: {avgWindSpeed.toFixed(1)} {speedUnit} | Peak: {Math.max(...windSpeedValues).toFixed(1)} {speedUnit} | Variability: ±{speedStdDev.toFixed(1)} {speedUnit}
          </Text>
          <View style={styles.chartWrapper}>
            <YAxis
              data={speedYAxisLabels}
              contentInset={{ top: 20, bottom: 20 }}
              svg={{
                fill: colors.textMuted,
                fontSize: 10,
                fontFamily: 'Roboto_400Regular',
              }}
              numberOfTicks={speedYAxisLabels.length}
              formatLabel={(value) => `${value.toFixed(1)}`}
              style={styles.yAxis}
              min={chartMin}
              max={chartMax}
            />
            <View style={styles.chartContent}>
              {/* Wind Speed Bars */}
              <BarChart
                style={[styles.chart]}
                data={windSpeedValues}
                svg={{ fill: colors.wind, fillOpacity: 0.8 }}
                contentInset={{ top: 20, bottom: 20 }}
                spacingInner={0.2}
                spacingOuter={0.1}
                yMax={chartMax}
                yMin={chartMin}
              />
            </View>
          </View>
          
          {/* Enhanced X-axis with 3-hour interval time scales */}
          <View style={styles.xAxisContainer}>
            <View style={styles.xAxisLabelsContainer}>
              {timeLabels.map((label, index) => (
                <View key={index} style={[
                  styles.xAxisLabelWrapper,
                  { flex: 1 }
                ]}>
                  <Text style={[
                    styles.xAxisLabel,
                    { 
                      opacity: label ? 1 : 0,
                      fontSize: 10,
                      fontWeight: label ? '500' : '400'
                    }
                  ]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.xAxisTitle}>Time Scale (3-hour intervals)</Text>
          </View>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.wind }]} />
              <Text style={styles.legendText}>Wind Speed</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Wind Gusts Chart - Separate Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Wind Gusts ({speedUnit})</Text>
          <Text style={styles.chartSubtitle}>
            Average: {avgWindGusts.toFixed(1)} {speedUnit} | Peak: {Math.max(...windGustValues).toFixed(1)} {speedUnit} | Gust Factor: {gustFactor.toFixed(2)}x
          </Text>
          <View style={styles.chartWrapper}>
            <YAxis
              data={speedYAxisLabels}
              contentInset={{ top: 20, bottom: 20 }}
              svg={{
                fill: colors.textMuted,
                fontSize: 10,
                fontFamily: 'Roboto_400Regular',
              }}
              numberOfTicks={speedYAxisLabels.length}
              formatLabel={(value) => `${value.toFixed(1)}`}
              style={styles.yAxis}
              min={chartMin}
              max={chartMax}
            />
            <View style={styles.chartContent}>
              {/* Wind Gust Bars */}
              <BarChart
                style={[styles.chart]}
                data={windGustValues}
                svg={{ fill: colors.accent, fillOpacity: 0.8 }}
                contentInset={{ top: 20, bottom: 20 }}
                spacingInner={0.2}
                spacingOuter={0.1}
                yMax={chartMax}
                yMin={chartMin}
              />
            </View>
          </View>
          
          {/* Enhanced X-axis with 3-hour interval time scales for gusts */}
          <View style={styles.xAxisContainer}>
            <View style={styles.xAxisLabelsContainer}>
              {timeLabels.map((label, index) => (
                <View key={index} style={[
                  styles.xAxisLabelWrapper,
                  { flex: 1 }
                ]}>
                  <Text style={[
                    styles.xAxisLabel,
                    { 
                      opacity: label ? 1 : 0,
                      fontSize: 10,
                      fontWeight: label ? '500' : '400'
                    }
                  ]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.xAxisTitle}>Time Scale (3-hour intervals)</Text>
          </View>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Wind Gusts</Text>
            </View>
          </View>
          
          <View style={styles.chartStats}>
            <Text style={styles.statText}>
              Peak Gust: {Math.max(...windGustValues).toFixed(1)} {speedUnit}
            </Text>
            <Text style={styles.statText}>
              Gust Factor: {gustFactor.toFixed(2)}x
            </Text>
            <Text style={styles.statText}>
              Consistency: {speedStdDev < 2 ? 'Stable' : 'Variable'}
            </Text>
          </View>
        </View>

        {/* Enhanced Wind Direction Scatter Plot Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Wind Direction Analysis (Degrees) - Scatter Plot</Text>
          <Text style={styles.chartSubtitle}>
            0°=North, 90°=East, 180°=South, 270°=West | Scatter plot shows direction trends over time
          </Text>
          <View style={styles.chartWrapper}>
            <YAxis
              data={[0, 90, 180, 270, 360]}
              contentInset={{ top: 20, bottom: 20 }}
              svg={{
                fill: colors.textMuted,
                fontSize: 10,
                fontFamily: 'Roboto_400Regular',
              }}
              numberOfTicks={5}
              formatLabel={(value) => `${Math.round(value)}°`}
              style={styles.yAxis}
              min={0}
              max={360}
            />
            <View style={styles.chartContent}>
              <WindDirectionScatterPlot 
                data={windDirectionData}
                width={300}
                height={200}
              />
            </View>
          </View>
          
          {/* Enhanced X-axis with 3-hour interval time scales for direction */}
          <View style={styles.xAxisContainer}>
            <View style={styles.xAxisLabelsContainer}>
              {timeLabels.map((label, index) => (
                <View key={index} style={[
                  styles.xAxisLabelWrapper,
                  { flex: 1 }
                ]}>
                  <Text style={[
                    styles.xAxisLabel,
                    { 
                      opacity: label ? 1 : 0,
                      fontSize: 10,
                      fontWeight: label ? '500' : '400'
                    }
                  ]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.xAxisTitle}>Time Scale (3-hour intervals)</Text>
          </View>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.text }]} />
              <Text style={styles.legendText}>Wind Direction Points</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Point Outline</Text>
            </View>
          </View>
          
          {/* Enhanced Wind Direction Arrows with 3-hour interval spacing */}
          <View style={styles.arrowSection}>
            <Text style={styles.arrowSectionTitle}>Accurate Wind Direction Arrows</Text>
            <Text style={styles.arrowSectionSubtitle}>Arrows point in the direction wind is blowing TO (3-hour intervals)</Text>
            <View style={styles.arrowContainer}>
              {displayData.map((hour, index) => {
                // Show arrows with same frequency as time labels (3-hour intervals)
                const shouldShow = timeLabels[index] !== '';
                return (
                  <View key={index} style={[
                    styles.arrowItem,
                    { flex: 1 }
                  ]}>
                    {shouldShow && <WindDirectionArrow direction={hour.windDirection} size={24} />}
                  </View>
                );
              })}
            </View>
          </View>
          
          {/* Enhanced Compass Direction Labels with 3-hour interval spacing */}
          <View style={styles.directionLabels}>
            {displayData.map((hour, index) => {
              const shouldShow = timeLabels[index] !== '';
              return (
                <View key={index} style={[
                  styles.directionLabelContainer,
                  { flex: 1 }
                ]}>
                  {shouldShow && (
                    <>
                      <Text style={styles.directionLabel}>
                        {getWindDirectionLabel(hour.windDirection)}
                      </Text>
                      <Text style={styles.directionDegrees}>
                        {Math.round(hour.windDirection)}°
                      </Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Enhanced Wind Summary with Accuracy Metrics */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Detailed Wind Analysis Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Strongest Wind</Text>
              <Text style={styles.summaryValue}>
                {Math.max(...windSpeedValues).toFixed(1)} {speedUnit}
              </Text>
              <Text style={styles.summaryTime}>
                at {formatHour(displayData[maxSpeedIndex].time)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Strongest Gust</Text>
              <Text style={styles.summaryValue}>
                {Math.max(...windGustValues).toFixed(1)} {speedUnit}
              </Text>
              <Text style={styles.summaryTime}>
                at {formatHour(displayData[maxGustIndex].time)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Calmest Period</Text>
              <Text style={styles.summaryValue}>
                {Math.min(...windSpeedValues).toFixed(1)} {speedUnit}
              </Text>
              <Text style={styles.summaryTime}>
                at {formatHour(displayData[minSpeedIndex].time)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Wind Consistency</Text>
              <Text style={styles.summaryValue}>
                {speedStdDev < 2 ? 'Very Stable' : speedStdDev < 5 ? 'Stable' : speedStdDev < 10 ? 'Variable' : 'Highly Variable'}
              </Text>
              <Text style={styles.summaryTime}>
                ±{speedStdDev.toFixed(1)} {speedUnit}
              </Text>
            </View>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg Gust Factor</Text>
              <Text style={styles.summaryValue}>
                {gustFactor.toFixed(2)}x
              </Text>
              <Text style={styles.summaryTime}>
                gusts vs wind speed
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Direction Range</Text>
              <Text style={styles.summaryValue}>
                {Math.round(Math.max(...windDirectionValues) - Math.min(...windDirectionValues))}°
              </Text>
              <Text style={styles.summaryTime}>
                variation span
              </Text>
            </View>
          </View>
          <Text style={styles.summaryNote}>
            Enhanced accuracy: Wind speed and gusts now displayed in separate charts for better visibility. 
            Wind direction now shown as a scatter plot for better trend analysis and pattern recognition.
            Wind direction arrows show precise direction wind is blowing TO. 
            All measurements validated and normalized for motorsport analysis. 
            Gust factor indicates wind turbulence level - higher values mean more gusty conditions.
            Time scales display at optimal 3-hour intervals for 24-hour racing strategy analysis.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(WindBarGraphs);

const getStyles = (colors: any, shadows: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: shadows.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 20,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 12,
    lineHeight: 16,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 8,
  },
  yAxis: {
    width: 45,
  },
  chartContent: {
    flex: 1,
    position: 'relative',
  },
  chart: {
    flex: 1,
  },
  xAxisContainer: {
    marginTop: 8,
    paddingLeft: 45, // Account for Y-axis width
  },
  xAxisLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    minHeight: 16,
  },
  xAxisLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  xAxisLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    lineHeight: 12,
  },
  xAxisTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
  },
  arrowSection: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  arrowSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
    marginBottom: 4,
  },
  arrowSectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  arrowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    minHeight: 32,
    alignItems: 'center',
  },
  arrowItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  arrowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
    borderRadius: 12,
    padding: 2,
  },
  directionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  directionLabelContainer: {
    alignItems: 'center',
  },
  directionLabel: {
    fontSize: 11,
    color: colors.primary,
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
    marginBottom: 2,
  },
  directionDegrees: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  summaryTime: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
  summaryNote: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: 8,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    padding: spacing.xl,
  },
});
