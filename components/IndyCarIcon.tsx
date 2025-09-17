
import React from 'react';
import Svg, { Path, Circle, Ellipse, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function IndyCarIcon({ size = 24, color = '#000' }: Props) {
  const isDark = color === '#fff' || color === 'white';
  const accentColor = isDark ? '#666' : '#ccc';
  const wheelColor = isDark ? '#333' : '#222';
  
  return (
    <Svg width={size} height={size} viewBox="0 0 40 20" fill="none">
      <Defs>
        <LinearGradient id="indycarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={accentColor} stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="indyWheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={wheelColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Nose cone - IndyCar style, more rounded for oval racing */}
      <Path
        d="M1 10 L8 8.5 L8 11.5 L1 10 Z"
        fill="url(#indycarGradient)"
      />
      
      {/* Front wing - simpler than F1, optimized for ovals */}
      <Path
        d="M1 12.5 L9 12.5 L10 13 L9 13.5 L1 13.5 Z"
        fill={color}
      />
      
      {/* Main chassis - IndyCar monocoque with distinctive shape */}
      <Path
        d="M8 8.5 L26 8 L28 9 L28 11 L26 12 L8 11.5 Z"
        fill="url(#indycarGradient)"
      />
      
      {/* Cockpit - open cockpit IndyCar style */}
      <Path
        d="M12 9 L22 9 L22 11 L12 11 Z"
        fill="none"
        stroke={isDark ? '#fff' : '#000'}
        strokeWidth="0.3"
      />
      
      {/* Aeroscreen - IndyCar safety feature */}
      <Path
        d="M14 8.5 Q17 7 20 8.5"
        fill="none"
        stroke={color}
        strokeWidth="0.6"
      />
      <Path
        d="M17 8.5 L17 7.5"
        stroke={color}
        strokeWidth="0.4"
      />
      
      {/* Side pods - IndyCar aerodynamics for oval racing */}
      <Path
        d="M10 9.5 L10 8.2 L24 8.2 L24 9.5"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.4"
      />
      <Path
        d="M10 10.5 L10 11.8 L24 11.8 L24 10.5"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.4"
      />
      
      {/* Air intake - IndyCar engine air intake */}
      <Rect x="16" y="7" width="2" height="1" fill={color} rx="0.3" />
      
      {/* Engine cover - distinctive IndyCar profile */}
      <Path
        d="M18 8 L26 8.5"
        stroke={accentColor}
        strokeWidth="0.3"
      />
      
      {/* Rear wing - IndyCar rear wing for oval racing */}
      <Rect x="28" y="4" width="1" height="12" fill={color} />
      <Rect x="29" y="3" width="5" height="1" fill={color} rx="0.2" />
      <Rect x="29" y="5" width="5" height="0.8" fill={color} rx="0.2" />
      <Rect x="29" y="14.2" width="5" height="0.8" fill={color} rx="0.2" />
      <Rect x="29" y="16" width="5" height="1" fill={color} rx="0.2" />
      
      {/* Rear wing support struts */}
      <Path d="M28.5 7 L28.5 13" stroke={accentColor} strokeWidth="0.3" />
      
      {/* Front wheels - IndyCar open wheel design */}
      <Circle cx="7" cy="15.5" r="2.3" fill="url(#indyWheelGradient)" />
      <Circle cx="7" cy="15.5" r="1.6" fill={wheelColor} />
      <Circle cx="7" cy="15.5" r="0.9" fill={accentColor} />
      <Circle cx="7" cy="15.5" r="0.3" fill={color} />
      
      {/* Rear wheels - IndyCar proportions */}
      <Circle cx="25" cy="15.5" r="2.4" fill="url(#indyWheelGradient)" />
      <Circle cx="25" cy="15.5" r="1.7" fill={wheelColor} />
      <Circle cx="25" cy="15.5" r="1" fill={accentColor} />
      <Circle cx="25" cy="15.5" r="0.4" fill={color} />
      
      {/* Suspension - IndyCar suspension elements */}
      <Path d="M7 13.2 L7 14" stroke={color} strokeWidth="0.5" />
      <Path d="M6.2 13.2 L7.8 13.2" stroke={color} strokeWidth="0.4" />
      <Path d="M25 13.1 L25 13.8" stroke={color} strokeWidth="0.5" />
      <Path d="M24.2 13.1 L25.8 13.1" stroke={color} strokeWidth="0.4" />
      
      {/* Brake discs - visible through open wheels */}
      <Circle cx="7" cy="15.5" r="1.3" fill="none" stroke={accentColor} strokeWidth="0.2" />
      <Circle cx="25" cy="15.5" r="1.4" fill="none" stroke={accentColor} strokeWidth="0.2" />
      
      {/* Exhaust - IndyCar exhaust configuration */}
      <Ellipse cx="27" cy="10" rx="0.7" ry="0.3" fill={wheelColor} />
      <Ellipse cx="27" cy="10" rx="0.4" ry="0.2" fill={accentColor} />
      
      {/* Aerodynamic elements - IndyCar specific */}
      <Path
        d="M9 9.5 L11 10 M9 10.5 L11 10"
        stroke={accentColor}
        strokeWidth="0.3"
      />
      
      {/* Roll hoop - IndyCar safety feature */}
      <Path
        d="M15 8.5 L15 6.5 Q17 5.5 19 6.5 L19 8.5"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
      />
      
      {/* Front wing endplates - IndyCar style */}
      <Rect x="2" y="12" width="0.4" height="2" fill={color} />
      <Rect x="10" y="12" width="0.4" height="2" fill={color} />
      
      {/* Oval racing number plate area */}
      <Rect x="13" y="9.2" width="8" height="1.6" fill="none" stroke={accentColor} strokeWidth="0.2" rx="0.2" />
      
      {/* IndyCar distinctive side vents */}
      <Path d="M11 9.8 L13 9.8 M11 10.2 L13 10.2" stroke={accentColor} strokeWidth="0.2" />
      <Path d="M21 9.8 L23 9.8 M21 10.2 L23 10.2" stroke={accentColor} strokeWidth="0.2" />
    </Svg>
  );
}
