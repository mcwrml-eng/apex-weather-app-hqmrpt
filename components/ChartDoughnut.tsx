
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '../styles/commonStyles';

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
  color = colors.primary,
  backgroundColor = colors.divider,
  centerText,
  subText,
  showScale = true,
  maxValue = 100,
  unit = '%',
}: Props) {
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
          stroke={backgroundColor}
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <Circle
          stroke={color}
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
      
      {/* Center text - properly centered using absolute positioning */}
      {centerText && (
        <View style={[styles.centerTextContainer, {
          left: containerSize / 2,
          top: containerSize / 2,
        }]}>
          <Text style={styles.centerText}>{centerText}</Text>
          {subText ? <Text style={styles.subText}>{subText}</Text> : null}
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
    alignItems: 'center',
    justifyContent: 'center',
    // Use marginLeft and marginTop to properly center the text
    // This is equivalent to transform: translate(-50%, -50%) but works in RN
    marginLeft: -50, // Approximate half width of text container
    marginTop: -15,  // Approximate half height of text container
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
