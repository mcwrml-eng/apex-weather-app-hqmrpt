
import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Polygon, Path } from 'react-native-svg';
import { getColors } from '../styles/commonStyles';
import { validateWindSpeed, validateWindDirection } from '../hooks/useWeather';
import { useTheme } from '../state/ThemeContext';

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
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalizedDegrees / 22.5) % 16;
  return directions[index];
}

function WindRadarGraph({ hourlyData, unit }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const styles = getStyles(colors);
  
  console.log('WindRadarGraph: Rendering radar chart for', hourlyData.length, 'hours, unit:', unit);

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No wind data available for radar analysis</Text>
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

  console.log('WindRadarGraph: Sample wind data after validation:', displayData.slice(0, 3).map(h => ({
    time: h.time,
    windSpeed: h.windSpeed,
    windGusts: h.windGusts,
    windDirection: h.windDirection
  })));

  if (displayData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No valid wind data available for radar display</Text>
      </View>
    );
  }

  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';
  
  // Calculate wind statistics
  const allWindSpeeds = displayData.map(d => d.windSpeed);
  const allWindGusts = displayData.map(d => d.windGusts);
  const maxWindSpeed = Math.max(...allWindSpeeds);
  const maxWindGust = Math.max(...allWindGusts);
  const maxValue = Math.max(maxWindSpeed, maxWindGust);
  
  // Radar chart configuration
  const radarSize = 280;
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = (radarSize / 2) - 40;
  
  // Create concentric circles for speed ranges
  const speedRanges = [
    maxValue * 0.25,
    maxValue * 0.5,
    maxValue * 0.75,
    maxValue
  ];
  
  // Convert wind direction to radar coordinates
  // Wind direction indicates where wind is coming FROM
  // To show where it's traveling TO, we add 180 degrees
  const getRadarPoint = (direction: number, speed: number, isGust: boolean = false) => {
    // Add 180 degrees to show where wind is traveling to, not from
    const travelDirection = direction + 180;
    
    // Convert direction to radians (0° = North, clockwise)
    // Subtract 90° to start from North instead of East
    const angleRad = ((travelDirection - 90) * Math.PI) / 180;
    
    // Calculate radius based on speed (normalized to maxValue)
    const normalizedSpeed = Math.min(speed / maxValue, 1);
    const radius = normalizedSpeed * maxRadius;
    
    // Calculate x, y coordinates
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);
    
    return { x, y, radius, angle: travelDirection };
  };

  // Generate compass directions
  const compassDirections = [
    { angle: 0, label: 'N' },
    { angle: 45, label: 'NE' },
    { angle: 90, label: 'E' },
    { angle: 135, label: 'SE' },
    { angle: 180, label: 'S' },
    { angle: 225, label: 'SW' },
    { angle: 270, label: 'W' },
    { angle: 315, label: 'NW' }
  ];

  // Calculate wind direction frequency for each sector
  // Note: We calculate frequency based on where wind is traveling TO (add 180)
  const sectorSize = 45; // 8 sectors of 45 degrees each
  const sectorCounts = new Array(8).fill(0);
  const sectorSpeeds = new Array(8).fill(0);
  
  displayData.forEach(hour => {
    // Convert to travel direction (where wind is going)
    const travelDirection = (hour.windDirection + 180) % 360;
    const sectorIndex = Math.floor(((travelDirection + sectorSize / 2) % 360) / sectorSize);
    sectorCounts[sectorIndex]++;
    sectorSpeeds[sectorIndex] += hour.windSpeed;
  });

  // Calculate average speeds per sector
  const sectorAvgSpeeds = sectorSpeeds.map((total, index) => 
    sectorCounts[index] > 0 ? total / sectorCounts[index] : 0
  );

  // Find dominant wind direction (where wind is traveling to)
  const maxSectorIndex = sectorCounts.indexOf(Math.max(...sectorCounts));
  const dominantDirection = maxSectorIndex * sectorSize;
  const dominantDirectionLabel = getWindDirectionLabel(dominantDirection);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wind Direction Analysis - Radar Chart</Text>
      <Text style={styles.subtitle}>
        Polar visualization showing where wind is traveling to (arrows point to destination)
      </Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Radar Chart */}
        <View style={styles.radarContainer}>
          <Svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
            {/* Background circles for speed ranges */}
            {speedRanges.map((speed, index) => {
              const radius = ((index + 1) / speedRanges.length) * maxRadius;
              return (
                <Circle
                  key={`circle-${index}`}
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke={colors.divider}
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
              );
            })}
            
            {/* Compass direction lines */}
            {compassDirections.map((dir, index) => {
              const angleRad = ((dir.angle - 90) * Math.PI) / 180;
              const endX = centerX + maxRadius * Math.cos(angleRad);
              const endY = centerY + maxRadius * Math.sin(angleRad);
              
              return (
                <Line
                  key={`line-${index}`}
                  x1={centerX}
                  y1={centerY}
                  x2={endX}
                  y2={endY}
                  stroke={colors.divider}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
              );
            })}
            
            {/* Compass direction labels */}
            {compassDirections.map((dir, index) => {
              const angleRad = ((dir.angle - 90) * Math.PI) / 180;
              const labelX = centerX + (maxRadius + 20) * Math.cos(angleRad);
              const labelY = centerY + (maxRadius + 20) * Math.sin(angleRad);
              
              return (
                <SvgText
                  key={`label-${index}`}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize="14"
                  fontWeight="600"
                  fill={colors.text}
                >
                  {dir.label}
                </SvgText>
              );
            })}
            
            {/* Speed range labels */}
            {speedRanges.map((speed, index) => {
              const radius = ((index + 1) / speedRanges.length) * maxRadius;
              return (
                <SvgText
                  key={`speed-label-${index}`}
                  x={centerX + radius + 5}
                  y={centerY - 5}
                  fontSize="10"
                  fill={colors.textMuted}
                >
                  {speed.toFixed(0)}
                </SvgText>
              );
            })}
            
            {/* Wind speed data points */}
            {displayData.map((hour, index) => {
              const point = getRadarPoint(hour.windDirection, hour.windSpeed);
              const gustPoint = getRadarPoint(hour.windDirection, hour.windGusts, true);
              
              return (
                <React.Fragment key={`data-${index}`}>
                  {/* Wind speed point */}
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={colors.wind}
                    fillOpacity="0.8"
                  />
                  
                  {/* Wind gust point */}
                  <Circle
                    cx={gustPoint.x}
                    cy={gustPoint.y}
                    r="2"
                    fill={colors.accent}
                    fillOpacity="0.6"
                  />
                  
                  {/* Connection line between speed and gust */}
                  <Line
                    x1={point.x}
                    y1={point.y}
                    x2={gustPoint.x}
                    y2={gustPoint.y}
                    stroke={colors.textMuted}
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                </React.Fragment>
              );
            })}
            
            {/* Sector frequency visualization */}
            {sectorCounts.map((count, index) => {
              if (count === 0) return null;
              
              const startAngle = index * sectorSize - sectorSize / 2;
              const endAngle = startAngle + sectorSize;
              const avgSpeed = sectorAvgSpeeds[index];
              const normalizedSpeed = avgSpeed / maxValue;
              const sectorRadius = normalizedSpeed * maxRadius * 0.3; // Make sectors smaller
              
              const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
              const endAngleRad = ((endAngle - 90) * Math.PI) / 180;
              
              const x1 = centerX + sectorRadius * Math.cos(startAngleRad);
              const y1 = centerY + sectorRadius * Math.sin(startAngleRad);
              const x2 = centerX + sectorRadius * Math.cos(endAngleRad);
              const y2 = centerY + sectorRadius * Math.sin(endAngleRad);
              
              const largeArcFlag = sectorSize > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${sectorRadius} ${sectorRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <Path
                  key={`sector-${index}`}
                  d={pathData}
                  fill={colors.primary}
                  fillOpacity={0.1 + (count / displayData.length) * 0.3}
                  stroke={colors.primary}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              );
            })}
            
            {/* Center point */}
            <Circle
              cx={centerX}
              cy={centerY}
              r="3"
              fill={colors.text}
            />
          </Svg>
          
          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.wind }]} />
                <Text style={styles.legendText}>Wind Speed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                <Text style={styles.legendText}>Wind Gusts</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary, opacity: 0.3 }]} />
                <Text style={styles.legendText}>Direction Frequency</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Wind Direction Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Wind Direction Analysis</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Dominant Direction</Text>
              <Text style={styles.statValue}>{dominantDirectionLabel}</Text>
              <Text style={styles.statSubtext}>{dominantDirection}° (traveling to)</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Frequency</Text>
              <Text style={styles.statValue}>
                {Math.round((Math.max(...sectorCounts) / displayData.length) * 100)}%
              </Text>
              <Text style={styles.statSubtext}>of time</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Max Speed</Text>
              <Text style={styles.statValue}>{maxWindSpeed.toFixed(1)}</Text>
              <Text style={styles.statSubtext}>{speedUnit}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Max Gust</Text>
              <Text style={styles.statValue}>{maxWindGust.toFixed(1)}</Text>
              <Text style={styles.statSubtext}>{speedUnit}</Text>
            </View>
          </View>
        </View>

        {/* Direction Frequency Table */}
        <View style={styles.frequencyContainer}>
          <Text style={styles.frequencyTitle}>Direction Frequency Distribution</Text>
          <View style={styles.frequencyGrid}>
            {compassDirections.map((dir, index) => {
              const count = sectorCounts[index];
              const percentage = (count / displayData.length) * 100;
              const avgSpeed = sectorAvgSpeeds[index];
              
              return (
                <View key={`freq-${index}`} style={styles.frequencyItem}>
                  <Text style={styles.frequencyDirection}>{dir.label}</Text>
                  <Text style={styles.frequencyPercentage}>
                    {percentage.toFixed(1)}%
                  </Text>
                  <Text style={styles.frequencySpeed}>
                    {avgSpeed.toFixed(1)} {speedUnit}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Radar Chart Explanation */}
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>How to Read the Radar Chart</Text>
          <Text style={styles.explanationText}>
            • <Text style={styles.bold}>Center</Text>: Calm conditions (0 {speedUnit})
          </Text>
          <Text style={styles.explanationText}>
            • <Text style={styles.bold}>Distance from center</Text>: Wind speed intensity
          </Text>
          <Text style={styles.explanationText}>
            • <Text style={styles.bold}>Direction</Text>: Where wind is traveling TO (N=North, E=East, etc.)
          </Text>
          <Text style={styles.explanationText}>
            • <Text style={styles.bold}>Blue dots</Text>: Average wind speed
          </Text>
          <Text style={styles.explanationText}>
            • <Text style={styles.bold}>Orange dots</Text>: Wind gust peaks
          </Text>
          <Text style={styles.explanationText}>
            • <Text style={styles.bold}>Shaded sectors</Text>: Direction frequency (darker = more common)
          </Text>
          <Text style={styles.explanationText}>
            • <Text style={styles.bold}>Note</Text>: All directions show where wind is blowing TO, not FROM
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(WindRadarGraph);

const getStyles = (colors: any) => StyleSheet.create({
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
    lineHeight: 20,
  },
  radarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
  },
  legendContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
  },
  statsContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  frequencyContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  frequencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 12,
    textAlign: 'center',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyItem: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
  },
  frequencyDirection: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 2,
  },
  frequencyPercentage: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 1,
  },
  frequencySpeed: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
  },
  explanationContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginBottom: 6,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    padding: 20,
  },
});
