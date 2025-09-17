
import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function F1CarIcon({ size = 24, color = '#000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Main car body */}
      <Path
        d="M3 14h2l1-2h12l1 2h2c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-1l-2-3H6L4 7H3c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2z"
        fill={color}
      />
      
      {/* Front wing */}
      <Rect x="1" y="13" width="4" height="1" fill={color} />
      <Rect x="19" y="13" width="4" height="1" fill={color} />
      
      {/* Rear wing */}
      <Rect x="2" y="6" width="2" height="1" fill={color} />
      <Rect x="20" y="6" width="2" height="1" fill={color} />
      
      {/* Wheels */}
      <Circle cx="6" cy="16" r="2" fill={color} />
      <Circle cx="18" cy="16" r="2" fill={color} />
      
      {/* Cockpit */}      
      <Path
        d="M8 9h8v2H8z"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />
      
      {/* Nose cone */}
      <Path
        d="M12 4l-2 3h4l-2-3z"
        fill={color}
      />
    </Svg>
  );
}
