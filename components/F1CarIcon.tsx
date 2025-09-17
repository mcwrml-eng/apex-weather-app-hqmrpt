
import React from 'react';
import Svg, { Path, Circle, Ellipse, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function F1CarIcon({ size = 24, color = '#000' }: Props) {
  const isDark = color === '#fff' || color === 'white';
  const accentColor = isDark ? '#666' : '#ccc';
  const wheelColor = isDark ? '#333' : '#222';
  
  return (
    <Svg width={size} height={size} viewBox="0 0 40 20" fill="none">
      <Defs>
        <LinearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={accentColor} stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={wheelColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Nose cone - sharp and aerodynamic */}
      <Path
        d="M1 10 L9 7.5 L9 12.5 L1 10 Z"
        fill="url(#carGradient)"
      />
      
      {/* Front wing - complex aerodynamic element */}
      <Path
        d="M1 13 L10 13 L11 13.5 L10 14 L1 14 Z"
        fill={color}
      />
      <Path
        d="M2 14.5 L8 14.5 L8 15 L2 15 Z"
        fill={accentColor}
      />
      
      {/* Main chassis/monocoque - sleek profile */}
      <Path
        d="M9 7.5 L28 7 L30 8 L30 12 L28 13 L9 12.5 Z"
        fill="url(#carGradient)"
      />
      
      {/* Cockpit opening - realistic F1 cockpit */}
      <Path
        d="M14 8 L24 8 L24 12 L14 12 Z"
        fill="none"
        stroke={isDark ? '#fff' : '#000'}
        strokeWidth="0.3"
      />
      
      {/* Halo safety device - modern F1 feature */}
      <Path
        d="M16 7.5 Q19 5.5 22 7.5"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
      />
      <Path
        d="M19 7.5 L19 6"
        stroke={color}
        strokeWidth="0.6"
      />
      
      {/* Side pods - aerodynamic air intakes */}
      <Path
        d="M12 8.5 L12 7 L26 7 L26 8.5"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.4"
      />
      <Path
        d="M12 11.5 L12 13 L26 13 L26 11.5"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.4"
      />
      
      {/* Air intake above cockpit */}
      <Rect x="18" y="6" width="2" height="1" fill={color} rx="0.2" />
      
      {/* Engine cover spine */}
      <Path
        d="M20 7 L28 7.5"
        stroke={accentColor}
        strokeWidth="0.3"
      />
      
      {/* Rear wing assembly - prominent F1 feature */}
      <Rect x="30" y="3" width="1" height="14" fill={color} />
      <Rect x="31" y="2" width="6" height="1" fill={color} rx="0.2" />
      <Rect x="31" y="4" width="6" height="0.8" fill={color} rx="0.2" />
      <Rect x="31" y="6" width="5" height="0.6" fill={accentColor} rx="0.2" />
      <Rect x="31" y="13.2" width="5" height="0.6" fill={accentColor} rx="0.2" />
      <Rect x="31" y="15.2" width="6" height="0.8" fill={color} rx="0.2" />
      <Rect x="31" y="17" width="6" height="1" fill={color} rx="0.2" />
      
      {/* DRS flap indicator */}
      <Rect x="32" y="8" width="3" height="0.4" fill={accentColor} rx="0.1" />
      
      {/* Front wheels - positioned correctly */}
      <Circle cx="8" cy="16" r="2.2" fill="url(#wheelGradient)" />
      <Circle cx="8" cy="16" r="1.5" fill={wheelColor} />
      <Circle cx="8" cy="16" r="0.8" fill={accentColor} />
      <Circle cx="8" cy="16" r="0.3" fill={color} />
      
      {/* Rear wheels - larger for F1 proportions */}
      <Circle cx="26" cy="16" r="2.5" fill="url(#wheelGradient)" />
      <Circle cx="26" cy="16" r="1.8" fill={wheelColor} />
      <Circle cx="26" cy="16" r="1" fill={accentColor} />
      <Circle cx="26" cy="16" r="0.4" fill={color} />
      
      {/* Suspension elements - visible F1 suspension */}
      <Path d="M8 13.8 L8 14.5" stroke={color} strokeWidth="0.6" />
      <Path d="M7 13.8 L9 13.8" stroke={color} strokeWidth="0.4" />
      <Path d="M26 13.5 L26 14.2" stroke={color} strokeWidth="0.6" />
      <Path d="M25 13.5 L27 13.5" stroke={color} strokeWidth="0.4" />
      
      {/* Brake discs - F1 detail */}
      <Circle cx="8" cy="16" r="1.2" fill="none" stroke={accentColor} strokeWidth="0.2" />
      <Circle cx="26" cy="16" r="1.4" fill="none" stroke={accentColor} strokeWidth="0.2" />
      
      {/* Exhaust pipe - modern F1 exhaust */}
      <Ellipse cx="29" cy="10" rx="0.8" ry="0.4" fill={wheelColor} />
      <Ellipse cx="29" cy="10" rx="0.5" ry="0.2" fill={accentColor} />
      
      {/* Aerodynamic details */}
      <Path
        d="M10 9 L12 9.5 M10 11 L12 10.5"
        stroke={accentColor}
        strokeWidth="0.3"
      />
      <Path
        d="M24 9 L26 9.2 M24 11 L26 10.8"
        stroke={accentColor}
        strokeWidth="0.3"
      />
      
      {/* Front wing endplates */}
      <Rect x="3" y="12.5" width="0.5" height="2" fill={color} />
      <Rect x="12" y="12.5" width="0.5" height="2" fill={color} />
    </Svg>
  );
}
