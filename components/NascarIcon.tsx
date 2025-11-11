
import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

interface NascarIconProps {
  size?: number;
  color?: string;
}

const NascarIcon: React.FC<NascarIconProps> = ({ size = 24, color = '#000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Main stock car body - boxy NASCAR shape */}
      <Path
        d="M4 9 L6 7 L18 7 L20 9 L20 14 L18 15 L6 15 L4 14 Z"
        fill={color}
        opacity={0.9}
      />
      
      {/* Roof line */}
      <Path
        d="M6 7 L8 6 L16 6 L18 7"
        fill={color}
        opacity={0.95}
      />
      
      {/* Windshield - angled NASCAR style */}
      <Path
        d="M8 6 L9.5 8.5 L14.5 8.5 L16 6"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        opacity={0.7}
      />
      
      {/* Side window */}
      <Rect
        x="6"
        y="9"
        width="3"
        height="3.5"
        fill={color}
        opacity={0.5}
      />
      
      {/* Racing number circle on door */}
      <Circle
        cx="12"
        cy="11"
        r="2.5"
        fill="white"
        stroke={color}
        strokeWidth="1.3"
      />
      
      {/* Racing number "3" - iconic NASCAR number */}
      <Path
        d="M11 9.8 C11.5 9.8 12.5 9.8 12.8 10.2 C13 10.5 13 10.8 12.8 11 C13 11.2 13 11.5 12.8 11.8 C12.5 12.2 11.5 12.2 11 12.2"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Rear spoiler - distinctive NASCAR feature */}
      <Path
        d="M18 8 L20.5 7.5 L20.5 9 L18 9.5"
        fill={color}
        opacity={0.8}
      />
      
      {/* Front splitter */}
      <Path
        d="M4 13 L3 13.5 L4 14"
        fill={color}
        opacity={0.7}
      />
      
      {/* Front wheel */}
      <Circle
        cx="7.5"
        cy="15"
        r="2"
        fill={color}
      />
      
      {/* Front wheel rim detail */}
      <Circle
        cx="7.5"
        cy="15"
        r="0.8"
        fill={color}
        opacity={0.4}
      />
      
      {/* Rear wheel */}
      <Circle
        cx="16.5"
        cy="15"
        r="2"
        fill={color}
      />
      
      {/* Rear wheel rim detail */}
      <Circle
        cx="16.5"
        cy="15"
        r="0.8"
        fill={color}
        opacity={0.4}
      />
      
      {/* Hood vents */}
      <Line
        x1="9"
        y1="8"
        x2="9"
        y2="9.5"
        stroke={color}
        strokeWidth="0.8"
        opacity={0.5}
      />
      <Line
        x1="10.5"
        y1="8"
        x2="10.5"
        y2="9.5"
        stroke={color}
        strokeWidth="0.8"
        opacity={0.5}
      />
      
      {/* Speed lines for motion effect */}
      <Path
        d="M1 10 L3 10 M0.5 12 L2.5 12 M1 14 L3 14"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.4}
      />
    </Svg>
  );
};

export default NascarIcon;
