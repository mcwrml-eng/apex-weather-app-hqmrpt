
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { getColors, spacing, borderRadius, getShadows } from '../../styles/commonStyles';
import { useTheme } from '../../state/ThemeContext';
import { useLanguage } from '../../state/LanguageContext';
import { f1Circuits, motogpCircuits, indycarCircuits, nascarCircuits } from '../../data/circuits';
import { f2Circuits, f3Circuits } from '../../data/f2f3-circuits';
import { Circuit, Category } from '../../components/CircuitCard';
import InteractiveWorldMap from '../../components/InteractiveWorldMap';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MapScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);

  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['f1', 'motogp', 'indycar', 'nascar', 'f2', 'f3']);
  const [selectedCircuit, setSelectedCircuit] = useState<{ circuit: Circuit; category: Category } | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 48,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      marginBottom: spacing.md,
    },
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    filterButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.background,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
    },
    mapContainer: {
      flex: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: 'Roboto_700Bold',
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
      marginTop: 2,
    },
    legendContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      marginBottom: spacing.sm,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Roboto_400Regular',
    },
  });

  const categoryColors: Record<Category, string> = {
    f1: '#E10600',
    f2: '#FF8700',
    f3: '#FFD700',
    motogp: '#FF0000',
    indycar: '#0033A0',
    nascar: '#FFD700',
  };

  const categoryLabels: Record<Category, string> = {
    f1: 'Formula 1',
    f2: 'Formula 2',
    f3: 'Formula 3',
    motogp: 'MotoGP',
    indycar: 'IndyCar',
    nascar: 'NASCAR',
  };

  const allCircuits = useMemo(() => {
    const circuits: { circuit: Circuit; category: Category }[] = [];
    
    if (selectedCategories.includes('f1')) {
      f1Circuits.forEach(c => circuits.push({ circuit: c, category: 'f1' }));
    }
    if (selectedCategories.includes('f2')) {
      f2Circuits.forEach(c => circuits.push({ circuit: c, category: 'f2' }));
    }
    if (selectedCategories.includes('f3')) {
      f3Circuits.forEach(c => circuits.push({ circuit: c, category: 'f3' }));
    }
    if (selectedCategories.includes('motogp')) {
      motogpCircuits.forEach(c => circuits.push({ circuit: c, category: 'motogp' }));
    }
    if (selectedCategories.includes('indycar')) {
      indycarCircuits.forEach(c => circuits.push({ circuit: c, category: 'indycar' }));
    }
    if (selectedCategories.includes('nascar')) {
      nascarCircuits.forEach(c => circuits.push({ circuit: c, category: 'nascar' }));
    }
    
    return circuits;
  }, [selectedCategories]);

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const countByCategory = useMemo(() => {
    const counts: Record<Category, number> = {
      f1: 0,
      f2: 0,
      f3: 0,
      motogp: 0,
      indycar: 0,
      nascar: 0,
    };
    
    allCircuits.forEach(({ category }) => {
      counts[category]++;
    });
    
    return counts;
  }, [allCircuits]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Circuit Map</Text>
        <Text style={styles.subtitle}>
          Explore {allCircuits.length} motorsport circuits worldwide
        </Text>
        
        <View style={styles.filterContainer}>
          {(['f1', 'f2', 'f3', 'motogp', 'indycar', 'nascar'] as Category[]).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategories.includes(category) && styles.filterButtonActive,
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategories.includes(category) && styles.filterButtonTextActive,
                ]}
              >
                {categoryLabels[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          {selectedCategories.map((category) => (
            <View key={category} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: categoryColors[category] }]} />
              <Text style={styles.legendText}>
                {categoryLabels[category]} ({countByCategory[category]})
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <InteractiveWorldMap
          circuits={allCircuits}
          categoryColors={categoryColors}
          onCircuitPress={(circuit, category) => {
            console.log('Circuit pressed:', circuit.name, category);
            setSelectedCircuit({ circuit, category });
          }}
          selectedCircuit={selectedCircuit}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{allCircuits.length}</Text>
          <Text style={styles.statLabel}>Total Circuits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{selectedCategories.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Set(allCircuits.map(c => c.circuit.country)).size}
          </Text>
          <Text style={styles.statLabel}>Countries</Text>
        </View>
      </View>
    </View>
  );
}
