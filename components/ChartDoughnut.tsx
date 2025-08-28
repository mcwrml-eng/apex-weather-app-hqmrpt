
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../styles/commonStyles';

interface Props {
  size: number;
  strokeWidth: number;
  progress: number; // 0..1
  color?: string;
  backgroundColor?: string;
  centerText?: string;
  subText?: string;
}

export default function ChartDoughnut({
  size,
  strokeWidth,
  progress,
  color = colors.primary,
  backgroundColor = colors.divider,
  centerText,
  subText,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressLength = Math.min(Math.max(progress, 0), 1) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={backgroundColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progressLength}, ${circumference}`}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {centerText && (
        <View style={styles.center}>
          <Text style={styles.centerText}>{centerText}</Text>
          {subText ? <Text style={styles.subText}>{subText}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerText: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Roboto_700Bold' },
  subText: { fontSize: 12, color: colors.textMuted, fontFamily: 'Roboto_400Regular' },
});
