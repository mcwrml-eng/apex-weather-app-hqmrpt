
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { getColors } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface Props {
  size: number;
  strokeWidth: number;
  progress: number; // 0..1
  color?: string;
  backgroundColor?: string;
  centerText?: string;
  subText?: string;
  showScale?: boolean;
  maxValue?: number;
  unit?: string;
}

export default function ChartDoughnut({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor,
  centerText,
  subText,
  showScale = true,
  maxValue = 100,
  unit = '%',
}: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  // Set default colors based on theme
  const primaryColor = color || colors.primary;
  const bgColor = backgroundColor || colors.divider;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressLength = Math.min(Math.max(progress, 0), 1) * circumference;
  const center = size / 2;
  const containerSize = size + 40;

  // Generate scale marks
  const generateScaleMarks = () => {
    if (!showScale) return [];
    
    const marks = [];
    const numberOfMarks = 8; // 0%, 12.5%, 25%, 37.5%, 50%, 62.5%, 75%, 87.5%, 100%
    
    for (let i = 0; i <= numberOfMarks; i++) {
      const angle = (i / numberOfMarks) * 270 - 135; // Start from -135° (bottom left), go 270° clockwise
      const value = (i / numberOfMarks) * maxValue;
      const radian = (angle * Math.PI) / 180;
      
      // Position for scale text (slightly outside the circle)
      const textRadius = radius + strokeWidth / 2 + 16;
      const x = center + textRadius * Math.cos(radian);
      const y = center + textRadius * Math.sin(radian);
      
      // Position for scale tick marks
      const tickOuterRadius = radius + strokeWidth / 2 + 8;
      const tickInnerRadius = radius + strokeWidth / 2 + 4;
      const tickX1 = center + tickInnerRadius * Math.cos(radian);
      const tickY1 = center + tickInnerRadius * Math.sin(radian);
      const tickX2 = center + tickOuterRadius * Math.cos(radian);
      const tickY2 = center + tickOuterRadius * Math.sin(radian);
      
      marks.push({
        value: Math.round(value),
        x,
        y,
        tickX1,
        tickY1,
        tickX2,
        tickY2,
        angle,
      });
    }
    
    return marks;
  };

  const scaleMarks = generateScaleMarks();

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <Svg width={containerSize} height={containerSize}>
        {/* Background circle */}
        <Circle
          stroke={bgColor}
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <Circle
          stroke={primaryColor}
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progressLength}, ${circumference}`}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-135 ${containerSize / 2} ${containerSize / 2})`}
        />
        
        {/* Scale marks and labels */}
        {showScale && scaleMarks.map((mark, index) => (
          <React.Fragment key={index}>
            {/* Tick mark */}
            <Circle
              cx={mark.tickX2 + 20}
              cy={mark.tickY2 + 20}
              r={1.5}
              fill={colors.textMuted}
            />
            
            {/* Scale label - only show every other mark to avoid crowding */}
            {index % 2 === 0 && (
              <SvgText
                x={mark.x + 20}
                y={mark.y + 20}
                fontSize="10"
                fill={colors.textMuted}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontFamily="Roboto_400Regular"
              >
                {mark.value}{unit}
              </SvgText>
            )}
          </React.Fragment>
        ))}
      </Svg>
      
      {/* Center text - properly centered using absolute positioning with transform-like behavior */}
      {centerText && (
        <View style={[styles.centerTextContainer, {
          width: containerSize,
          height: containerSize,
        }]}>
          <View style={styles.textWrapper}>
            <Text style={styles.centerText}>{centerText}</Text>
            {subText ? <Text style={styles.subText}>{subText}</Text> : null}
          </View>
        </View>
      )}
    </View>
  );
}

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    centerTextContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerText: { 
      fontSize: 18, 
      fontWeight: '700', 
      color: colors.text, 
      fontFamily: 'Roboto_700Bold',
      textAlign: 'center',
    },
    subText: { 
      fontSize: 12, 
      color: colors.textMuted, 
      fontFamily: 'Roboto_400Regular',
      marginTop: 2,
      textAlign: 'center',
    },
  });
