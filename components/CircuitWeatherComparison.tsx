
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useUnit } from '../state/UnitContext';
import { useWeather } from '../hooks/useWeather';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';
import WeatherSymbol from './WeatherSymbol';
import { HapticFeedback } from './HapticFeedback';

interface Circuit {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  slug: string;
}

interface CircuitWeatherComparisonProps {
  circuits: Circuit[];
  onRemoveCircuit?: (slug: string) => void;
}

const CircuitWeatherComparison: React.FC<CircuitWeatherComparisonProps> = ({
  circuits,
  onRemoveCircuit,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  const { unit } = useUnit();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: shadows.md,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 16,
    },
    comparisonGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    circuitColumn: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      minWidth: 160,
    },
    circuitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    circuitInfo: {
      flex: 1,
    },
    circuitName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: 2,
    },
    circuitCountry: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    removeButton: {
      padding: 4,
    },
    weatherRow: {
      marginBottom: 12,
      alignItems: 'center',
    },
    weatherLabel: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 4,
      textAlign: 'center',
    },
    weatherValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      textAlign: 'center',
    },
    weatherSubValue: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 2,
      textAlign: 'center',
    },
    symbolContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    loadingText: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    errorText: {
      fontSize: 11,
      color: colors.error,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: 12,
    },
    bestConditionBadge: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      marginTop: 8,
      alignSelf: 'center',
    },
    bestConditionText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.success,
      fontFamily: 'Roboto_600SemiBold',
    },
    worstConditionBadge: {
      backgroundColor: colors.error + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      marginTop: 8,
      alignSelf: 'center',
    },
    worstConditionText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.error,
      fontFamily: 'Roboto_600SemiBold',
    },
  }), [colors, shadows]);

  if (circuits.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="git-compare" size={20} color={colors.primary} />
            <Text style={styles.title}>Weather Comparison</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Icon name="analytics-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyStateText}>
            Select circuits to compare their weather conditions side-by-side
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="git-compare" size={20} color={colors.primary} />
          <Text style={styles.title}>Weather Comparison</Text>
        </View>
      </View>
      
      <Text style={styles.subtitle}>
        Comparing {circuits.length} circuit{circuits.length > 1 ? 's' : ''}
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.comparisonGrid}
      >
        {circuits.map((circuit) => (
          <CircuitWeatherColumn
            key={circuit.slug}
            circuit={circuit}
            unit={unit}
            colors={colors}
            styles={styles}
            onRemove={onRemoveCircuit}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface CircuitWeatherColumnProps {
  circuit: Circuit;
  unit: 'metric' | 'imperial';
  colors: any;
  styles: any;
  onRemove?: (slug: string) => void;
}

const CircuitWeatherColumn: React.FC<CircuitWeatherColumnProps> = ({
  circuit,
  unit,
  colors,
  styles,
  onRemove,
}) => {
  const { current, loading, error } = useWeather(
    circuit.latitude,
    circuit.longitude,
    unit
  );

  const handleRemove = () => {
    HapticFeedback.light();
    onRemove?.(circuit.slug);
  };

  return (
    <View style={styles.circuitColumn}>
      <View style={styles.circuitHeader}>
        <View style={styles.circuitInfo}>
          <Text style={styles.circuitName} numberOfLines={2}>
            {circuit.name}
          </Text>
          <Text style={styles.circuitCountry}>{circuit.country}</Text>
        </View>
        {onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
            activeOpacity={0.7}
          >
            <Icon name="close-circle" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <Text style={styles.loadingText}>Loading...</Text>
      )}

      {error && (
        <Text style={styles.errorText}>Failed to load</Text>
      )}

      {!loading && !error && current && (
        <>
          <View style={styles.weatherRow}>
            <View style={styles.symbolContainer}>
              <WeatherSymbol 
                weatherCode={current.weather_code}
                size={40}
                latitude={circuit.latitude}
                longitude={circuit.longitude}
              />
            </View>
          </View>

          <View style={styles.weatherRow}>
            <Text style={styles.weatherLabel}>Temperature</Text>
            <Text style={styles.weatherValue}>
              {Math.round(current.temperature)}°{unit === 'metric' ? 'C' : 'F'}
            </Text>
            <Text style={styles.weatherSubValue}>
              Feels {Math.round(current.apparent_temperature)}°
            </Text>
          </View>

          <View style={styles.weatherRow}>
            <Text style={styles.weatherLabel}>Wind</Text>
            <Text style={styles.weatherValue}>
              {Math.round(current.wind_speed)}
            </Text>
            <Text style={styles.weatherSubValue}>
              {unit === 'metric' ? 'km/h' : 'mph'}
            </Text>
          </View>

          <View style={styles.weatherRow}>
            <Text style={styles.weatherLabel}>Humidity</Text>
            <Text style={styles.weatherValue}>
              {current.humidity}%
            </Text>
          </View>

          <View style={styles.weatherRow}>
            <Text style={styles.weatherLabel}>Visibility</Text>
            <Text style={styles.weatherValue}>
              {Math.round(current.visibility / 1000)}km
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

export default CircuitWeatherComparison;
