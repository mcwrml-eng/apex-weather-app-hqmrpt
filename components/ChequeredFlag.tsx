
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getColors } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface ChequeredFlagProps {
  size?: number;
  style?: any;
}

export default function ChequeredFlag({ size = 24, style }: ChequeredFlagProps) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  console.log('ChequeredFlag: Rendering chequered flag with size:', size, 'theme:', isDark ? 'dark' : 'light');

  const squareSize = size / 6; // 6x6 grid for the chequered pattern
  
  const renderSquare = (row: number, col: number) => {
    const isBlack = (row + col) % 2 === 0;
    return (
      <View
        key={`${row}-${col}`}
        style={[
          styles.square,
          {
            width: squareSize,
            height: squareSize,
            backgroundColor: isBlack ? colors.text : colors.background,
          }
        ]}
      />
    );
  };

  const renderRow = (rowIndex: number) => {
    return (
      <View key={rowIndex} style={styles.row}>
        {Array.from({ length: 6 }, (_, colIndex) => renderSquare(rowIndex, colIndex))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      borderRadius: 2,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.divider,
    },
    row: {
      flexDirection: 'row',
    },
    square: {
      // Individual square styles are set dynamically
    },
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {Array.from({ length: 6 }, (_, rowIndex) => renderRow(rowIndex))}
    </View>
  );
}
