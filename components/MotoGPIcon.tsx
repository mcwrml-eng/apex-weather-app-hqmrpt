
import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface MotoGPIconProps {
  size?: number;
  color?: string;
}

export default function MotoGPIcon({ size = 24, color = '#000' }: MotoGPIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Motorcycle body and seat */}
      <Path
        d="M15 8.5C15 8.5 14.5 7 13 7C11.5 7 11 8 11 8L9 9.5L7.5 10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Handlebars */}
      <Path
        d="M15 8.5L16.5 8L17.5 8.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Front fork */}
      <Path
        d="M16.5 8L17 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Frame connecting to rear wheel */}
      <Path
        d="M11 8L9 11.5L7 14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Rear wheel */}
      <Circle
        cx="7"
        cy="16"
        r="3.5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Rear wheel inner detail */}
      <Circle
        cx="7"
        cy="16"
        r="1.5"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
      
      {/* Front wheel */}
      <Circle
        cx="17"
        cy="16"
        r="3.5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Front wheel inner detail */}
      <Circle
        cx="17"
        cy="16"
        r="1.5"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
      
      {/* Exhaust pipe */}
      <Path
        d="M9 11L8 13L6 14.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Fuel tank */}
      <Path
        d="M13 7C13 7 13.5 6 14.5 6C15.5 6 16 7 16 7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Rider silhouette */}
      <Circle
        cx="12"
        cy="5"
        r="1.2"
        fill={color}
      />
      
      {/* Rider back */}
      <Path
        d="M12 6.2C12 6.2 11.5 7.5 11 8"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      
      {/* Connecting frame */}
      <Path
        d="M13 9L15 12L17 14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
