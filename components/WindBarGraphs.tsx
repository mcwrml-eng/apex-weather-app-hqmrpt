
import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart, YAxis } from 'react-native-svg-charts';
import Svg, { Polygon, Line } from 'react-native-svg';
import { colors } from '../styles/commonStyles';

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

function getWindDirectionLabel(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Enhanced Wind direction arrow component
function WindDirectionArrow({ direction, size = 20 }: { direction: number; size?: number }) {
  // Adjust rotation so arrow points in the direction wind is blowing TO
  // Add 180 degrees to convert from "coming from" to "blowing to"
  const rotation = (direction + 180) % 360;
  const arrowSize = size;
  const center = arrowSize / 2;
  
  // Create arrow shape points (pointing upward initially)
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

function WindBarGraphs({ hourlyData, unit }: Props) {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No wind data available</Text>
      </View>
    );
  }

  // Use the first 24 hours of data instead of filtering by today's date
  // This ensures we always have data to display
  const displayData = hourlyData.slice(0, 24);

  if (displayData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No wind data available for display</Text>
      </View>
    );
  }

  // Extract and validate wind data with proper fallbacks
  const windSpeedData = displayData.map((hour, index) => {
    const speed = Number(hour.windSpeed) || 0;
    return { value: speed, index };
  });
  
  const windGustData = displayData.map((hour, index) => {
    const gusts = Number(hour.windGusts) || 0;
    return { value: gusts, index };
  });
  
  const windDirectionData = displayData.map((hour, index) => {
    const direction = Number(hour.windDirection) || 0;
    return { value: direction, index };
  });
  
  // Calculate scales with proper minimums to ensure visibility
  const maxWindSpeed = Math.max(...windSpeedData.map(d => d.value), 5); // Minimum scale of 5
  const maxWindGust = Math.max(...windGustData.map(d => d.value), 5);
  const maxWind = Math.max(maxWindSpeed, maxWindGust, 10); // Ensure minimum scale of 10
  const minWindSpeed = Math.min(...windSpeedData.map(d => d.value));
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  // Generate Y-axis labels for wind speed (including gusts)
  const speedYAxisLabels = [];
  const speedStep = Math.max(Math.ceil(maxWind / 5), 2); // Minimum step of 2
  for (let i = 0; i <= maxWind + speedStep; i += speedStep) {
    speedYAxisLabels.push(i);
  }

  // Prepare data for BarChart - it expects simple number arrays
  const windSpeedValues = windSpeedData.map(d => d.value);
  const windGustValues = windGustData.map(d => d.value);
  const windDirectionValues = windDirectionData.map(d => d.value);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wind Conditions</Text>
      <Text style={styles.subtitle}>Next 24 hours of wind speed, gusts, and direction</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Wind Speed and Gusts Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Wind Speed & Gusts ({speedUnit})</Text>
          <View style={styles.chartWrapper}>
            <YAxis
              data={speedYAxisLabels}
              contentInset={{ top: 20, bottom: 20 }}
              svg={{
                fill: colors.textMuted,
                fontSize: 10,
              }}
              numberOfTicks={5}
              formatLabel={(value) => `${Math.round(value)}`}
              style={styles.yAxis}
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
                yMax={maxWind}
                yMin={0}
              />
              {/* Wind Gust Bars (overlay) */}
              <BarChart
                style={[styles.chart, { position: 'absolute', top: 0 }]}
                data={windGustValues}
                svg={{ fill: colors.accent, fillOpacity: 0.6 }}
                contentInset={{ top: 20, bottom: 20 }}
                spacingInner={0.2}
                spacingOuter={0.1}
                yMax={maxWind}
                yMin={0}
              />
              <View style={styles.xAxisLabels}>
                {displayData.map((hour, index) => (
                  <Text key={index} style={styles.xAxisLabel}>
                    {formatHour(hour.time)}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.wind }]} />
              <Text style={styles.legendText}>Wind Speed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Wind Gusts</Text>
            </View>
          </View>
          <View style={styles.chartStats}>
            <Text style={styles.statText}>
              Max Speed: {Math.round(maxWindSpeed)} {speedUnit}
            </Text>
            <Text style={styles.statText}>
              Max Gust: {Math.round(maxWindGust)} {speedUnit}
            </Text>
            <Text style={styles.statText}>
              Avg Speed: {Math.round(windSpeedValues.reduce((a, b) => a + b, 0) / windSpeedValues.length)} {speedUnit}
            </Text>
          </View>
        </View>

        {/* Wind Direction Chart with Arrows */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Wind Direction with Visual Arrows</Text>
          <View style={styles.chartWrapper}>
            <YAxis
              data={[0, 90, 180, 270, 360]}
              contentInset={{ top: 20, bottom: 20 }}
              svg={{
                fill: colors.textMuted,
                fontSize: 10,
              }}
              numberOfTicks={5}
              formatLabel={(value) => `${Math.round(value)}°`}
              style={styles.yAxis}
            />
            <View style={styles.chartContent}>
              <BarChart
                style={styles.chart}
                data={windDirectionValues}
                svg={{ fill: colors.accent, fillOpacity: 0.7 }}
                contentInset={{ top: 20, bottom: 20 }}
                spacingInner={0.2}
                spacingOuter={0.1}
                yMax={360}
                yMin={0}
              />
              <View style={styles.xAxisLabels}>
                {displayData.map((hour, index) => (
                  <Text key={index} style={styles.xAxisLabel}>
                    {formatHour(hour.time)}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          
          {/* Enhanced Wind Direction Arrows */}
          <View style={styles.arrowSection}>
            <Text style={styles.arrowSectionTitle}>Wind Direction Arrows</Text>
            <Text style={styles.arrowSectionSubtitle}>Arrows point in the direction wind is blowing TO</Text>
            <View style={styles.arrowContainer}>
              {displayData.map((hour, index) => {
                return (
                  <View key={index} style={styles.arrowItem}>
                    <WindDirectionArrow direction={hour.windDirection} size={24} />
                  </View>
                );
              })}
            </View>
          </View>
          
          {/* Compass Direction Labels */}
          <View style={styles.directionLabels}>
            {displayData.map((hour, index) => (
              <View key={index} style={styles.directionLabelContainer}>
                <Text style={styles.directionLabel}>
                  {getWindDirectionLabel(hour.windDirection)}
                </Text>
                <Text style={styles.directionDegrees}>
                  {Math.round(hour.windDirection)}°
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Wind Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Wind Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Strongest Wind</Text>
              <Text style={styles.summaryValue}>
                {Math.round(maxWindSpeed)} {speedUnit}
              </Text>
              <Text style={styles.summaryTime}>
                at {formatHour(displayData[windSpeedValues.indexOf(maxWindSpeed)].time)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Strongest Gust</Text>
              <Text style={styles.summaryValue}>
                {Math.round(maxWindGust)} {speedUnit}
              </Text>
              <Text style={styles.summaryTime}>
                at {formatHour(displayData[windGustValues.indexOf(maxWindGust)].time)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Calmest Period</Text>
              <Text style={styles.summaryValue}>
                {Math.round(minWindSpeed)} {speedUnit}
              </Text>
              <Text style={styles.summaryTime}>
                at {formatHour(displayData[windSpeedValues.indexOf(minWindSpeed)].time)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg Gust Factor</Text>
              <Text style={styles.summaryValue}>
                {windSpeedValues.reduce((a, b) => a + b, 0) > 0 ? 
                  (windGustValues.reduce((a, b) => a + b, 0) / windSpeedValues.reduce((a, b) => a + b, 0)).toFixed(1) : '0.0'}x
              </Text>
              <Text style={styles.summaryTime}>
                gusts vs wind speed
              </Text>
            </View>
          </View>
          <Text style={styles.summaryNote}>
            Wind direction arrows show where wind is blowing TO. 0°=North, 90°=East, 180°=South, 270°=West. 
            Red arrows indicate wind direction, with larger arrows for stronger winds.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(WindBarGraphs);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 12,
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
    marginBottom: 12,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 8,
  },
  yAxis: {
    width: 40,
  },
  chartContent: {
    flex: 1,
    position: 'relative',
  },
  chart: {
    flex: 1,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    flex: 1,
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
    padding: 8,
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
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
    flex: 1,
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
    flex: 1,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 2,
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
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    padding: 20,
  },
});
