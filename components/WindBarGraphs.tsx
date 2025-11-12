
import { useTheme } from '../state/ThemeContext';
import { validateWindSpeed, validateWindDirection } from '../hooks/useWeather';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import { getColors } from '../styles/commonStyles';
import React, { memo } from 'react';
import { BarChart, YAxis, XAxis } from 'react-native-svg-charts';

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
    height: 200,
    marginBottom: 8,
  },
  yAxisContainer: {
    width: 50,
  },
  chartContent: {
    flex: 1,
  },
  xAxisContainer: {
    height: 30,
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

const WindDirectionScatterPlot = memo(({ data, width, height, colors }: { data: any[], width: number, height: number, colors: any }) => {
  const padding = 40;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  
  const xScale = (index: number) => padding + (index / (data.length - 1)) * plotWidth;
  const yScale = (value: number) => padding + plotHeight - (value / 360) * plotHeight;
  
  return (
    <Svg width={width} height={height}>
      <Line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke={colors.divider}
        strokeWidth="2"
      />
      <Line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke={colors.divider}
        strokeWidth="2"
      />
      
      {[0, 90, 180, 270, 360].map((deg) => (
        <Line
          key={deg}
          x1={padding}
          y1={yScale(deg)}
          x2={width - padding}
          y2={yScale(deg)}
          stroke={colors.divider}
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity={0.3}
        />
      ))}
      
      {data.map((point, index) => {
        const x = xScale(index);
        const y = yScale(point.windDirection);
        const arrowSize = 16;
        
        return (
          <Svg key={index} x={x - arrowSize / 2} y={y - arrowSize / 2}>
            <Polygon
              points={`${arrowSize / 2},0 ${arrowSize},${arrowSize} ${arrowSize / 2},${arrowSize * 0.7} 0,${arrowSize}`}
              fill={colors.wind}
              rotation={point.windDirection}
              origin={`${arrowSize / 2}, ${arrowSize / 2}`}
              opacity={0.7}
            />
          </Svg>
        );
      })}
    </Svg>
  );
});

WindDirectionScatterPlot.displayName = 'WindDirectionScatterPlot';

function WindBarGraphs({ hourlyData, unit }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const dynamicStyles = getStyles(colors);

  const validData = hourlyData.map(h => ({
    time: h.time,
    windSpeed: validateWindSpeed(h.windSpeed, unit),
    windDirection: validateWindDirection(h.windDirection),
    windGusts: validateWindSpeed(h.windGusts, unit),
  }));

  const speedData = validData.map(d => d.windSpeed);
  const gustData = validData.map(d => d.windGusts);
  const maxSpeed = Math.max(...speedData, ...gustData);
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  const generateSpeedYAxisLabels = () => {
    const max = Math.ceil(maxSpeed / 10) * 10;
    const step = max / 4;
    return [0, step, step * 2, step * 3, max];
  };

  const generateTimeLabels = () => {
    return validData.map((d, i) => formatTimeLabel(d.time, i, validData.length));
  };

  console.log('WindBarGraphs: Rendering with', validData.length, 'data points');

  return (
    <View style={dynamicStyles.card}>
      <Text style={dynamicStyles.sectionTitle}>Enhanced Wind Analysis</Text>
      <Text style={dynamicStyles.sectionSubtitle}>
        24-hour wind speed and gust patterns
      </Text>

      <View style={styles.chartContainer}>
        <Text style={dynamicStyles.chartTitle}>Wind Speed & Gusts</Text>
        
        <View style={styles.chartRow}>
          <View style={styles.yAxisContainer}>
            <YAxis
              data={speedData}
              contentInset={{ top: 10, bottom: 10 }}
              svg={{ fontSize: 10, fill: colors.textMuted }}
              numberOfTicks={5}
              formatLabel={(value) => `${Math.round(value)}`}
            />
          </View>
          
          <View style={styles.chartContent}>
            <BarChart
              style={{ flex: 1 }}
              data={speedData}
              svg={{ fill: colors.wind }}
              contentInset={{ top: 10, bottom: 10 }}
              yAccessor={({ item }) => item}
            >
            </BarChart>
            <BarChart
              style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
              data={gustData}
              svg={{ fill: colors.windGust, opacity: 0.6 }}
              contentInset={{ top: 10, bottom: 10 }}
              yAccessor={({ item }) => item}
            >
            </BarChart>
          </View>
        </View>

        <View style={styles.xAxisContainer}>
          <XAxis
            style={{ flex: 1 }}
            data={validData}
            formatLabel={(value, index) => generateTimeLabels()[index]}
            contentInset={{ left: 10, right: 10 }}
            svg={{ fontSize: 10, fill: colors.textMuted }}
          />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.wind }]} />
            <Text style={dynamicStyles.legendText}>Wind Speed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.windGust, opacity: 0.6 }]} />
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
