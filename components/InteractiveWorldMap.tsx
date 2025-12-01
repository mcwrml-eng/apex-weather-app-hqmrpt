
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Text, Animated, PanResponder } from 'react-native';
import Svg, { Path, Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import { getColors, spacing, borderRadius, getShadows } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';
import { Circuit, Category } from './CircuitCard';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWeather } from '../hooks/useWeather';
import WeatherSymbol from './WeatherSymbol';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  circuits: { circuit: Circuit; category: Category }[];
  categoryColors: Record<Category, string>;
  onCircuitPress: (circuit: Circuit, category: Category) => void;
  selectedCircuit: { circuit: Circuit; category: Category } | null;
}

// Simple world map outline (simplified continents)
const WORLD_MAP_PATH = `
  M 50 150 L 150 140 L 200 160 L 250 150 L 300 170 L 350 160 L 400 180 L 450 170 L 500 190 L 550 180 L 600 200 L 650 190 L 700 210 L 750 200 L 800 220 L 850 210 L 900 230 L 950 220 L 1000 240
  M 100 250 L 200 240 L 300 260 L 400 250 L 500 270 L 600 260 L 700 280 L 800 270
  M 150 350 L 250 340 L 350 360 L 450 350 L 550 370 L 650 360
  M 200 450 L 300 440 L 400 460 L 500 450
`;

export default function InteractiveWorldMap({ circuits, categoryColors, onCircuitPress, selectedCircuit }: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);

  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mapContainer: {
      flex: 1,
    },
    controls: {
      position: 'absolute',
      bottom: spacing.lg,
      right: spacing.lg,
      gap: spacing.sm,
    },
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: shadows.md,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    infoCard: {
      position: 'absolute',
      bottom: 80,
      left: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      boxShadow: shadows.lg,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    infoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      flex: 1,
      marginRight: spacing.md,
    },
    infoCountry: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      marginTop: 2,
    },
    closeButton: {
      padding: spacing.xs,
    },
    weatherContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    temperature: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.temperature,
      fontFamily: 'Roboto_700Bold',
    },
    viewButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    viewButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: 'Roboto_500Medium',
    },
    categoryBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
      marginBottom: spacing.sm,
    },
    categoryBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: 'Roboto_500Medium',
      textTransform: 'uppercase',
    },
  });

  // Convert lat/long to SVG coordinates (Mercator projection simplified)
  const latLongToXY = (lat: number, lon: number) => {
    const mapWidth = 1000;
    const mapHeight = 500;
    
    // Simple equirectangular projection
    const x = ((lon + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    
    return { x, y };
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
  };

  const handleReset = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const CircuitInfoCard = ({ circuit, category }: { circuit: Circuit; category: Category }) => {
    const { current, loading } = useWeather(circuit.latitude, circuit.longitude, 'metric');

    return (
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={{ flex: 1 }}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColors[category] }]}>
              <Text style={styles.categoryBadgeText}>{category}</Text>
            </View>
            <Text style={styles.infoTitle}>{circuit.name}</Text>
            <Text style={styles.infoCountry}>{circuit.country}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onCircuitPress(circuit, category)}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {current && !loading && (
          <View style={styles.weatherContainer}>
            <WeatherSymbol
              weatherCode={current.weather_code}
              size={48}
              latitude={circuit.latitude}
              longitude={circuit.longitude}
            />
            <Text style={styles.temperature}>
              {Math.round(current.temperature)}°C
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            console.log('Navigating to circuit:', circuit.slug, category);
            router.push(`/circuit/${circuit.slug}?category=${category}`);
          }}
        >
          <Text style={styles.viewButtonText}>View Full Forecast</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.mapContainer}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: SCREEN_HEIGHT - 300,
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Svg
          width={SCREEN_WIDTH * scale}
          height={(SCREEN_HEIGHT - 300) * scale}
          viewBox="0 0 1000 500"
        >
          {/* Ocean background */}
          <Rect
            x="0"
            y="0"
            width="1000"
            height="500"
            fill={isDark ? '#1a2332' : '#e3f2fd'}
          />

          {/* Simplified world map outline */}
          <G>
            {/* North America */}
            <Path
              d="M 100 100 L 150 80 L 200 90 L 250 70 L 280 100 L 260 150 L 220 180 L 180 200 L 140 180 L 120 140 Z"
              fill={isDark ? '#2d3748' : '#cbd5e0'}
              stroke={colors.divider}
              strokeWidth="1"
            />
            
            {/* South America */}
            <Path
              d="M 200 250 L 240 230 L 260 260 L 250 320 L 220 360 L 200 340 L 190 300 Z"
              fill={isDark ? '#2d3748' : '#cbd5e0'}
              stroke={colors.divider}
              strokeWidth="1"
            />
            
            {/* Europe */}
            <Path
              d="M 450 80 L 520 70 L 560 90 L 540 120 L 500 140 L 460 130 L 440 100 Z"
              fill={isDark ? '#2d3748' : '#cbd5e0'}
              stroke={colors.divider}
              strokeWidth="1"
            />
            
            {/* Africa */}
            <Path
              d="M 480 160 L 540 150 L 580 180 L 590 240 L 560 300 L 520 320 L 480 300 L 460 240 L 470 200 Z"
              fill={isDark ? '#2d3748' : '#cbd5e0'}
              stroke={colors.divider}
              strokeWidth="1"
            />
            
            {/* Asia */}
            <Path
              d="M 600 60 L 700 50 L 800 70 L 850 100 L 820 150 L 750 180 L 680 160 L 620 140 L 590 100 Z"
              fill={isDark ? '#2d3748' : '#cbd5e0'}
              stroke={colors.divider}
              strokeWidth="1"
            />
            
            {/* Australia */}
            <Path
              d="M 750 320 L 820 310 L 860 340 L 850 380 L 800 390 L 750 370 Z"
              fill={isDark ? '#2d3748' : '#cbd5e0'}
              stroke={colors.divider}
              strokeWidth="1"
            />
          </G>

          {/* Circuit markers */}
          {circuits.map(({ circuit, category }, index) => {
            const { x, y } = latLongToXY(circuit.latitude, circuit.longitude);
            const isSelected = selectedCircuit?.circuit.slug === circuit.slug;
            
            return (
              <G key={`${circuit.slug}-${index}`}>
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8 : 5}
                  fill={categoryColors[category]}
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={isSelected ? 1 : 0.9}
                  onPress={() => onCircuitPress(circuit, category)}
                />
                {isSelected && (
                  <Circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill="none"
                    stroke={categoryColors[category]}
                    strokeWidth={2}
                    opacity={0.5}
                  />
                )}
              </G>
            );
          })}
        </Svg>
      </ScrollView>

      {/* Zoom controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
          <Ionicons name="remove" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Selected circuit info card */}
      {selectedCircuit && (
        <CircuitInfoCard
          circuit={selectedCircuit.circuit}
          category={selectedCircuit.category}
        />
      )}
    </View>
  );
}
