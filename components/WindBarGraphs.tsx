
import React from 'react';
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
  console.log('WindDirectionArrow: Rendering arrow with direction:', direction, 'size:', size);
  
  // Adjust rotation so arrow points in the direction wind is coming FROM
  const rotation = direction;
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

export default function WindBarGraphs({ hourlyData, unit }: Props) {
  console.log('WindBarGraphs: Rendering with', hourlyData.length, 'hours of wind data');
  console.log('WindBarGraphs: Sample wind direction data:', hourlyData.slice(0, 3).map(h => ({ time: h.time, direction: h.windDirection })));

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No wind data available</Text>
      </View>
    );
  }

  // Get current day's data (24 hours)
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const todayData = hourlyData.filter(hour => {
    const hourDate = new Date(hour.time);
    return hourDate >= todayStart && hourDate < todayEnd;
  }).slice(0, 24); // Ensure we only get 24 hours

  if (todayData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No wind data available for today</Text>
      </View>
    );
  }

  const windSpeedData = todayData.map(hour => hour.windSpeed);
  const windGustData = todayData.map(hour => hour.windGusts);
  const windDirectionData = todayData.map(hour => hour.windDirection);
  
  const maxWindSpeed = Math.max(...windSpeedData);
  const maxWindGust = Math.max(...windGustData);
  const maxWind = Math.max(maxWindSpeed, maxWindGust);
  const minWindSpeed = Math.min(...windSpeedData);
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  // Generate Y-axis labels for wind speed (including gusts)
  const speedYAxisLabels = [];
  const speedStep = Math.ceil(maxWind / 5);
  for (let i = 0; i <= maxWind + speedStep; i += speedStep) {
    speedYAxisLabels.push(i);
  }

  // Generate Y-axis labels for wind direction (0-360 degrees)
  const directionYAxisLabels = [0, 90, 180, 270, 360];

  // Combine wind speed and gust data for layered chart
  const combinedWindData = todayData.map((hour, index) => ({
    windSpeed: hour.windSpeed,
    windGusts: hour.windGusts,
    index
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Wind Conditions</Text>
      <Text style={styles.subtitle}>Hourly wind speed, gusts, and direction for {today.toLocaleDateString()}</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Wind Speed and Gusts Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Wind Speed & Gusts ({speedUnit})</Text>
          <View style={styles.chartWrapper}>
            <YAxis
              data={[0, maxWind]}
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
                style={[styles.chart, { position: 'absolute' }]}
                data={windSpeedData}
                svg={{ fill: colors.wind, fillOpacity: 0.8 }}
                contentInset={{ top: 20, bottom: 20 }}
                spacingInner={0.2}
                spacingOuter={0.1}
                yMax={maxWind}
              />
              {/* Wind Gust Bars (overlay) */}
              <BarChart
                style={[styles.chart, { position: 'absolute' }]}
                data={windGustData}
                svg={{ fill: colors.accent, fillOpacity: 0.6 }}
                contentInset={{ top: 20, bottom: 20 }}
                spacingInner={0.2}
                spacingOuter={0.1}
                yMax={maxWind}
              />
              <View style={styles.xAxisLabels}>
                {todayData.map((hour, index) => (
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
              Avg Speed: {Math.round(windSpeedData.reduce((a, b) => a + b, 0) / windSpeedData.length)} {speedUnit}
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
                data={windDirectionData}
                svg={{ fill: colors.accent, fillOpacity: 0.7 }}
                contentInset={{ top: 20, bottom: 20 }}
                spacingInner={0.2}
                spacingOuter={0.1}
                yMax={360}
                yMin={0}
              />
              <View style={styles.xAxisLabels}>
                {todayData.map((hour, index) => (
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
            <Text style={styles.arrowSectionSubtitle}>Arrows point in the direction wind is coming FROM</Text>
            <View style={styles.arrowContainer}>
              {todayData.map((hour, index) => {
                console.log(`Arrow ${index}: direction=${hour.windDirection}°, time=${hour.time}`);
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
            {todayData.map((hour, index) => (
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
                at {formatHour(todayData[windSpeedData.indexOf(maxWindSpeed)].time)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Strongest Gust</Text>
              <Text style={styles.summaryValue}>
                {Math.round(maxWindGust)} {speedUnit}
              </Text>
              <Text style={styles.summaryTime}>
                at {formatHour(todayData[windGustData.indexOf(maxWindGust)].time)}
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
                at {formatHour(todayData[windSpeedData.indexOf(minWindSpeed)].time)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg Gust Factor</Text>
              <Text style={styles.summaryValue}>
                {(windGustData.reduce((a, b) => a + b, 0) / windSpeedData.reduce((a, b) => a + b, 0)).toFixed(1)}x
              </Text>
              <Text style={styles.summaryTime}>
                gusts vs wind speed
              </Text>
            </View>
          </View>
          <Text style={styles.summaryNote}>
            Wind direction arrows show where wind is coming FROM. 0°=North, 90°=East, 180°=South, 270°=West. 
            Red arrows indicate wind direction, with larger arrows for stronger winds.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

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
