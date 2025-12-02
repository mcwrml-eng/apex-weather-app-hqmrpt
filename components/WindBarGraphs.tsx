
import { useTheme } from '../state/ThemeContext';
import { validateWindSpeed, validateWindDirection } from '../hooks/useWeather';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Polygon, Line, Circle, Rect, G } from 'react-native-svg';
import { getColors } from '../styles/commonStyles';
import React, { memo } from 'react';

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

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Roboto_700Bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'Roboto_400Regular',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Roboto_600SemiBold',
  },
  chartRow: {
    flexDirection: 'row',
    height: 220,
    marginBottom: 8,
  },
  yAxisContainer: {
    width: 50,
    paddingRight: 8,
  },
  chartContent: {
    flex: 1,
  },
  xAxisContainer: {
    height: 40,
    marginLeft: 50,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16,
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
    fontFamily: 'Roboto_400Regular',
  },
  directionContainer: {
    marginTop: 16,
  },
  directionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Roboto_600SemiBold',
  },
  directionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'Roboto_400Regular',
  },
  yAxisLabel: {
    fontSize: 10,
    fontFamily: 'Roboto_400Regular',
  },
  xAxisLabel: {
    fontSize: 10,
    fontFamily: 'Roboto_400Regular',
  },
});

function formatHour(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: 'numeric' });
  } catch (err) {
    console.error('WindBarGraphs: Error formatting hour:', err);
    return '';
  }
}

function formatTimeLabel(timeString: string, index: number, totalPoints: number): string {
  try {
    if (totalPoints <= 24) {
      if (index % 3 === 0) {
        return formatHour(timeString);
      }
    } else if (totalPoints <= 48) {
      if (index % 6 === 0) {
        return formatHour(timeString);
      }
    } else {
      if (index % 12 === 0) {
        return formatHour(timeString);
      }
    }
    return '';
  } catch (err) {
    console.error('WindBarGraphs: Error formatting time label:', err);
    return '';
  }
}

function getWindDirectionLabel(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function getStyles(colors: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: colors.shadows?.md || '0px 2px 4px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      fontFamily: 'Roboto_700Bold',
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 12,
      fontFamily: 'Roboto_400Regular',
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      fontFamily: 'Roboto_600SemiBold',
    },
    legendText: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    directionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      fontFamily: 'Roboto_600SemiBold',
    },
    directionSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 12,
      fontFamily: 'Roboto_400Regular',
    },
  });
}

const WindDirectionArrow = memo(({ direction, size = 20, colors }: { direction: number; size?: number; colors: any }) => {
  const rotation = direction;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12,2 16,10 12,8 8,10"
        fill={colors.wind}
        rotation={rotation}
        origin="12, 12"
      />
      <Circle cx="12" cy="12" r="2" fill={colors.wind} opacity={0.5} />
    </Svg>
  );
});

WindDirectionArrow.displayName = 'WindDirectionArrow';

const CustomBarChart = memo(({ 
  data, 
  width, 
  height, 
  colors,
  unit 
}: { 
  data: { windSpeed: number; windGusts: number }[];
  width: number;
  height: number;
  colors: any;
  unit: 'metric' | 'imperial';
}) => {
  const padding = { top: 10, bottom: 10, left: 0, right: 0 };
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;
  
  // Calculate max value for scaling
  const maxSpeed = Math.max(...data.map(d => Math.max(d.windSpeed, d.windGusts)));
  const yMax = Math.ceil(maxSpeed / 10) * 10 || 10;
  
  // Calculate bar width and spacing
  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.max(barGroupWidth * 0.35, 8); // Each bar takes 35% of group width
  const barSpacing = barWidth * 0.2; // Small gap between speed and gust bars
  
  // Scale function
  const scaleY = (value: number) => {
    return chartHeight - (value / yMax) * chartHeight;
  };
  
  return (
    <Svg width={width} height={height}>
      <G transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight * (1 - ratio);
          return (
            <Line
              key={ratio}
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke={colors.divider}
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}
        
        {/* Bars */}
        {data.map((d, index) => {
          const groupX = index * barGroupWidth;
          const centerX = groupX + barGroupWidth / 2;
          
          // Wind speed bar (left)
          const speedBarX = centerX - barWidth - barSpacing / 2;
          const speedBarHeight = chartHeight - scaleY(d.windSpeed);
          const speedBarY = scaleY(d.windSpeed);
          
          // Wind gust bar (right)
          const gustBarX = centerX + barSpacing / 2;
          const gustBarHeight = chartHeight - scaleY(d.windGusts);
          const gustBarY = scaleY(d.windGusts);
          
          return (
            <G key={index}>
              {/* Wind Speed Bar */}
              <Rect
                x={speedBarX}
                y={speedBarY}
                width={barWidth}
                height={speedBarHeight}
                fill={colors.wind}
                rx={2}
              />
              
              {/* Wind Gust Bar */}
              <Rect
                x={gustBarX}
                y={gustBarY}
                width={barWidth}
                height={gustBarHeight}
                fill={colors.windGust}
                rx={2}
              />
            </G>
          );
        })}
      </G>
    </Svg>
  );
});

CustomBarChart.displayName = 'CustomBarChart';

const YAxisLabels = memo(({ 
  maxValue, 
  height, 
  colors 
}: { 
  maxValue: number; 
  height: number; 
  colors: any;
}) => {
  const labels = [0, 0.25, 0.5, 0.75, 1].map(ratio => Math.round(maxValue * ratio));
  const padding = { top: 10, bottom: 10 };
  const chartHeight = height - padding.top - padding.bottom;
  
  return (
    <View style={{ height, justifyContent: 'space-between', paddingVertical: padding.top }}>
      {labels.reverse().map((label, index) => (
        <Text 
          key={index} 
          style={[styles.yAxisLabel, { color: colors.textMuted, textAlign: 'right' }]}
        >
          {label}
        </Text>
      ))}
    </View>
  );
});

YAxisLabels.displayName = 'YAxisLabels';

const XAxisLabels = memo(({ 
  data, 
  colors 
}: { 
  data: HourlyData[];
  colors: any;
}) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
      {data.map((d, index) => {
        const label = formatTimeLabel(d.time, index, data.length);
        if (!label) return <View key={index} style={{ flex: 1 }} />;
        
        return (
          <View key={index} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

XAxisLabels.displayName = 'XAxisLabels';

function WindBarGraphs({ hourlyData, unit }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const dynamicStyles = getStyles(colors);

  // Take first 24 hours for cleaner display
  const displayData = hourlyData.slice(0, 24);

  const validData = displayData.map(h => ({
    time: h.time,
    windSpeed: validateWindSpeed(h.windSpeed, unit),
    windDirection: validateWindDirection(h.windDirection),
    windGusts: validateWindSpeed(h.windGusts, unit),
  }));

  const speedData = validData.map(d => d.windSpeed);
  const gustData = validData.map(d => d.windGusts);
  const maxSpeed = Math.max(...speedData, ...gustData);
  const yMax = Math.ceil(maxSpeed / 10) * 10 || 10;
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  console.log('WindBarGraphs: Rendering with', validData.length, 'data points, max speed:', maxSpeed);

  return (
    <View style={dynamicStyles.card}>
      <Text style={dynamicStyles.sectionTitle}>Enhanced Wind Analysis</Text>
      <Text style={dynamicStyles.sectionSubtitle}>
        24-hour wind speed and gust patterns
      </Text>

      <View style={styles.chartContainer}>
        <Text style={dynamicStyles.chartTitle}>Wind Speed & Gusts ({speedUnit})</Text>
        
        <View style={styles.chartRow}>
          <View style={styles.yAxisContainer}>
            <YAxisLabels maxValue={yMax} height={220} colors={colors} />
          </View>
          
          <View style={styles.chartContent}>
            <CustomBarChart
              data={validData}
              width={280}
              height={220}
              colors={colors}
              unit={unit}
            />
          </View>
        </View>

        <View style={styles.xAxisContainer}>
          <XAxisLabels data={validData} colors={colors} />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.wind }]} />
            <Text style={dynamicStyles.legendText}>Wind Speed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.windGust }]} />
            <Text style={dynamicStyles.legendText}>Wind Gusts</Text>
          </View>
        </View>
      </View>

      <View style={styles.directionContainer}>
        <Text style={dynamicStyles.directionTitle}>Accurate Wind Direction Arrows</Text>
        <Text style={dynamicStyles.directionSubtitle}>
          Visual representation of wind direction changes over time
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 16, paddingVertical: 8 }}>
            {validData.map((d, index) => {
              if (index % 3 !== 0 && validData.length > 24) return null;
              
              return (
                <View key={d.time} style={{ alignItems: 'center', minWidth: 60 }}>
                  <WindDirectionArrow direction={d.windDirection} size={24} colors={colors} />
                  <Text style={[dynamicStyles.legendText, { marginTop: 4, fontSize: 11 }]}>
                    {getWindDirectionLabel(d.windDirection)}
                  </Text>
                  <Text style={[dynamicStyles.legendText, { fontSize: 10, marginTop: 2 }]}>
                    {formatHour(d.time)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export default memo(WindBarGraphs);
