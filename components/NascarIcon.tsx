
import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface NascarIconProps {
  size?: number;
  color?: string;
}

const NascarIcon: React.FC<NascarIconProps> = ({ size = 24, color = '#000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Stock car body */}
      <Path
        d="M3 10 L5 8 L8 7 L16 7 L19 8 L21 10 L21 14 L19 16 L5 16 L3 14 Z"
        fill={color}
        opacity={0.9}
      />
      
      {/* Windshield */}
      <Path
        d="M8 7 L10 9 L14 9 L16 7"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Side window */}
      <Path
        d="M6 10 L8 10 L8 13 L6 13 Z"
        fill={color}
        opacity={0.6}
      />
      
      {/* Number circle */}
      <Circle
        cx="12"
        cy="12"
        r="3"
        fill="white"
        stroke={color}
        strokeWidth="1.5"
      />
      
      {/* Number "1" */}
      <Path
        d="M11.5 10.5 L12.5 10.5 L12.5 13.5 L11.5 13.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      
      {/* Front wheel */}
      <Circle
        cx="7"
        cy="16"
        r="2"
        fill={color}
      />
      
      {/* Rear wheel */}
      <Circle
        cx="17"
        cy="16"
        r="2"
        fill={color}
      />
      
      {/* Speed lines */}
      <Path
        d="M1 11 L3 11 M1 13 L2.5 13"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  );
};

export default NascarIcon;
