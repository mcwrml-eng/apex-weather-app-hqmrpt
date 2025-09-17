
import React from 'react';
import Svg, { Path, Circle, Ellipse, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function F1CarIcon({ size = 24, color = '#000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 16" fill="none">
      {/* Main chassis/monocoque */}
      <Path
        d="M8 6 L24 6 L26 8 L26 10 L24 12 L8 12 L6 10 L6 8 Z"
        fill={color}
      />
      
      {/* Nose cone - distinctive pointed front */}
      <Path
        d="M2 8 L8 6 L8 12 L2 10 Z"
        fill={color}
      />
      
      {/* Front wing - low and wide */}
      <Rect x="1" y="11" width="8" height="1" fill={color} />
      <Rect x="1" y="13" width="6" height="0.5" fill={color} />
      
      {/* Cockpit opening */}
      <Path
        d="M12 7 L20 7 L20 11 L12 11 Z"
        fill="none"
        stroke={color === '#000' ? '#fff' : '#000'}
        strokeWidth="0.5"
      />
      
      {/* Halo safety device */}
      <Path
        d="M14 6 Q16 4 18 6"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
      />
      
      {/* Rear wing - high and prominent */}
      <Rect x="26" y="4" width="1" height="8" fill={color} />
      <Rect x="27" y="3" width="4" height="1" fill={color} />
      <Rect x="27" y="5" width="4" height="1" fill={color} />
      <Rect x="27" y="12" width="4" height="1" fill={color} />
      
      {/* Side pods */}
      <Path
        d="M10 8 L10 6 L22 6 L22 8 L24 8 L24 10 L22 10 L22 12 L10 12 L10 10 Z"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
      />
      
      {/* Front wheels - smaller diameter, positioned forward */}
      <Circle cx="7" cy="14" r="1.5" fill={color} />
      <Circle cx="7" cy="14" r="1" fill={color === '#000' ? '#fff' : '#000'} />
      
      {/* Rear wheels - larger diameter, positioned back */}
      <Circle cx="23" cy="14" r="2" fill={color} />
      <Circle cx="23" cy="14" r="1.3" fill={color === '#000' ? '#fff' : '#000'} />
      
      {/* Suspension elements */}
      <Path d="M7 12 L7 13" stroke={color} strokeWidth="0.5" />
      <Path d="M23 12 L23 13" stroke={color} strokeWidth="0.5" />
      
      {/* Air intake above cockpit */}
      <Rect x="15" y="5" width="2" height="1" fill={color} />
      
      {/* Exhaust pipe */}
      <Circle cx="25" cy="9" r="0.5" fill={color} />
    </Svg>
  );
}
