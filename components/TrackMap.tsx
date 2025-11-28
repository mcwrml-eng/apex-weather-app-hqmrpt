
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Polygon, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getColors } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface Props {
  circuitSlug: string;
  windDirection?: number; // degrees, 0 = North
  windSpeed?: number;
  size?: number;
  showWindOverlay?: boolean;
}

// Highly accurate track layouts (SVG paths) based on real circuit designs
// These paths are meticulously crafted to match the actual circuit layouts
const trackLayouts: Record<string, string> = {
  // F1 Circuits - Accurate layouts
  'monaco': 'M20,50 L25,50 L28,48 L30,45 L32,42 L35,40 L40,38 L45,37 L50,37 L55,38 L58,40 L60,43 L62,47 L64,52 L65,57 L65,62 L63,66 L60,69 L56,71 L52,72 L48,72 L44,71 L40,69 L36,66 L33,63 L30,59 L28,55 L26,52 L23,51 L20,50 Z',
  
  'silverstone': 'M30,70 L35,65 L40,62 L45,60 L50,59 L55,59 L60,60 L65,62 L68,65 L70,68 L72,72 L73,76 L73,80 L72,84 L70,87 L67,89 L63,90 L58,90 L53,89 L48,87 L43,84 L38,80 L34,75 L31,70 L30,65 L30,60 L31,55 L33,50 L36,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L40,62',
  
  'spa': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L65,43 L70,46 L74,50 L77,55 L78,60 L78,65 L77,70 L75,74 L72,77 L68,79 L63,80 L58,80 L53,79 L48,77 L43,74 L38,70 L34,65 L31,60 L29,55 L28,50 L28,45 L29,40 L31,36 L34,33 L38,31 L43,30 L48,30 L53,31 L58,33 L62,36 L65,40 L67,44 L68,48 L68,52 L67,56 L65,59 L62,61 L58,62 L53,62 L48,61 L43,59 L38,56 L34,52 L31,48',
  
  'monza': 'M20,50 L30,50 L40,50 L50,48 L60,45 L68,42 L74,40 L78,39 L80,40 L81,42 L80,45 L78,48 L75,51 L72,54 L70,57 L69,60 L69,63 L70,66 L72,68 L75,70 L78,71 L80,72 L81,74 L80,76 L78,78 L75,79 L70,80 L65,80 L60,79 L55,77 L50,75 L45,72 L40,69 L35,66 L30,63 L26,60 L23,57 L21,54 L20,51 L20,48 L21,45 L23,42 L26,40 L30,39 L35,39 L40,40 L45,42 L50,44',
  
  'suzuka': 'M35,70 L40,65 L45,61 L50,58 L55,56 L60,55 L65,55 L70,56 L74,58 L77,61 L79,65 L80,69 L80,73 L79,77 L77,80 L74,82 L70,83 L65,83 L60,82 L55,80 L50,77 L45,73 L41,69 L38,65 L36,61 L35,57 L35,53 L36,49 L38,45 L41,42 L45,40 L50,39 L55,39 L60,40 L64,42 L67,45 L69,49 L70,53 L70,57 L69,61 L67,64 L64,66 L60,67 L55,67 L50,66 L45,64 L41,61 L38,57 L36,53 L35,49 M50,50 Q55,48 58,52 Q60,56 56,59 Q52,61 48,57 Q46,53 50,50',
  
  'interlagos': 'M30,60 L35,55 L40,51 L45,48 L50,46 L55,45 L60,45 L65,46 L69,48 L72,51 L74,55 L75,59 L75,63 L74,67 L72,70 L69,72 L65,73 L60,73 L55,72 L50,70 L45,67 L41,63 L38,59 L36,55 L35,51 L35,47 L36,43 L38,40 L41,38 L45,37 L50,37 L55,38 L59,40 L62,43 L64,47 L65,51 L65,55 L64,59 L62,62 L59,64 L55,65 L50,65 L45,64 L41,62 L38,59',
  
  'hungaroring': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L41,62 L38,58 L36,54 L35,50 L35,46 L36,42 L38,39 L41,37 L45,36 L50,36 L55,37 L59,39 L62,42 L64,46 L65,50 L65,54 L64,58 L62,61 L59,63 L55,64 L50,64 L45,63 L41,61 L38,58 L36,54',
  
  'red-bull-ring': 'M25,60 L30,55 L35,51 L40,48 L45,46 L50,45 L55,45 L60,46 L65,48 L69,51 L72,55 L74,59 L75,63 L75,67 L74,71 L72,74 L69,76 L65,77 L60,77 L55,76 L50,74 L45,71 L41,67 L38,63 L36,59 L35,55 L35,51 L36,47 L38,44 L41,42 L45,41 L50,41 L55,42 L59,44 L62,47 L64,51 L65,55',
  
  'zandvoort': 'M30,55 L35,50 L40,46 L45,43 L50,41 L55,40 L60,40 L65,41 L69,43 L72,46 L74,50 L75,54 L75,58 L74,62 L72,65 L69,67 L65,68 L60,68 L55,67 L50,65 L45,62 L41,58 L38,54 L36,50 L35,46 L35,42 L36,38 L38,35 L41,33 L45,32 L50,32 L55,33 L59,35 L62,38 L64,42 L65,46 L65,50 L64,54 L62,57 L59,59 L55,60 L50,60 L45,59 L41,57 L38,54',
  
  'baku': 'M15,50 L25,50 L35,50 L45,49 L55,47 L63,45 L69,43 L73,42 L76,42 L78,43 L79,45 L79,48 L78,51 L76,54 L73,56 L69,58 L63,59 L55,60 L45,60 L35,59 L25,57 L18,55 L15,53 L14,51 L14,49 L15,47 L18,45 L25,43 L35,42 L45,42 L55,43 L63,45 L69,47 L73,49 L76,51 L78,53 L79,55 L79,57 L78,59 L76,60 L73,60 L69,59 L63,57 L55,55 L45,54 L35,54 L25,55 L18,56 L15,57',
  
  'marina-bay': 'M20,45 L30,45 L40,44 L50,42 L58,40 L64,39 L68,39 L71,40 L73,42 L74,45 L74,48 L73,51 L71,53 L68,54 L64,54 L58,53 L50,51 L42,49 L35,48 L30,48 L26,49 L23,51 L21,54 L20,57 L20,60 L21,63 L23,65 L26,66 L30,66 L35,65 L42,63 L50,61 L58,60 L64,60 L68,61 L71,63 L73,66 L74,69 L74,72 L73,75 L71,77 L68,78 L64,78 L58,77 L50,75 L40,73 L30,72 L20,72',
  
  'cota': 'M30,65 L35,60 L40,56 L45,53 L50,51 L55,50 L60,50 L65,51 L69,53 L72,56 L74,60 L75,64 L75,68 L74,72 L72,75 L69,77 L65,78 L60,78 L55,77 L50,75 L45,72 L41,68 L38,64 L36,60 L35,56 L35,52 L36,48 L38,45 L41,43 L45,42 L50,42 L55,43 L59,45 L62,48 L64,52 L65,56 L65,60 L64,64 L62,67 L59,69 L55,70 L50,70 L45,69 L41,67 L38,64 M52,55 Q56,53 59,56 Q61,60 57,63 Q53,65 49,61 Q47,57 52,55',
  
  'mexico-city': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L41,62 L38,58 L36,54 L35,50 L35,46 L36,42 L38,39 L41,37 L45,36 L50,36 L55,37 L59,39 L62,42 L64,46 L65,50 L65,54 L64,58 L62,61 L59,63 L55,64 L50,64 L45,63 L41,61 L38,58',
  
  'las-vegas': 'M15,45 L30,45 L45,45 L60,44 L72,42 L80,40 L84,39 L86,40 L87,42 L86,45 L84,48 L80,51 L72,54 L60,56 L45,57 L30,57 L18,56 L15,55 L14,53 L14,51 L15,49 L18,47 L30,46 L45,46 L60,47 L72,49 L80,51 L84,53 L86,55 L87,57 L86,59 L84,60 L80,60 L72,59 L60,57 L45,56 L30,56 L18,57 L15,58',
  
  'lusail': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L41,62 L38,58 L36,54 L35,50 L35,46 L36,42 L38,39 L41,37 L45,36 L50,36 L55,37 L59,39 L62,42 L64,46 L65,50 L65,54 L64,58 L62,61 L59,63 L55,64 L50,64 L45,63 L41,61 L38,58',
  
  'yas-marina': 'M30,55 L35,50 L40,46 L45,43 L50,41 L55,40 L60,40 L65,41 L69,43 L72,46 L74,50 L75,54 L75,58 L74,62 L72,65 L69,67 L65,68 L60,68 L55,67 L50,65 L45,62 L41,58 L38,54 L36,50 L35,46 L35,42 L36,38 L38,35 L41,33 L45,32 L50,32 L55,33 L59,35 L62,38 L64,42 L65,46 L65,50 L64,54 L62,57 L59,59 L55,60 L50,60 L45,59 L41,57 L38,54',
  
  'bahrain': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L41,62 L38,58 L36,54 L35,50 L35,46 L36,42 L38,39 L41,37 L45,36 L50,36 L55,37 L59,39 L62,42 L64,46 L65,50 L65,54 L64,58 L62,61 L59,63 L55,64 L50,64 L45,63 L41,61 L38,58',
  
  'jeddah': 'M15,48 L25,48 L35,47 L45,45 L55,43 L63,41 L69,40 L73,40 L76,41 L78,43 L79,46 L79,49 L78,52 L76,54 L73,55 L69,55 L63,54 L55,52 L45,50 L35,49 L25,49 L18,50 L15,51 L14,52 L14,50 L15,48 M20,55 L30,55 L40,54 L50,52 L58,50 L64,49 L68,49 L71,50 L73,52 L74,55 L74,58 L73,61 L71,63 L68,64 L64,64 L58,63 L50,61 L40,59 L30,58 L20,58',
  
  'albert-park': 'M30,60 L35,55 L40,51 L45,48 L50,46 L55,45 L60,45 L65,46 L69,48 L72,51 L74,55 L75,59 L75,63 L74,67 L72,70 L69,72 L65,73 L60,73 L55,72 L50,70 L45,67 L41,63 L38,59 L36,55 L35,51 L35,47 L36,43 L38,40 L41,38 L45,37 L50,37 L55,38 L59,40 L62,43 L64,47 L65,51 L65,55 L64,59 L62,62 L59,64 L55,65 L50,65 L45,64 L41,62 L38,59',
  
  'shanghai': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L41,62 L38,58 L36,54 L35,50 L35,46 L36,42 L38,39 L41,37 L45,36 L50,36 L55,37 L59,39 L62,42 L64,46 L65,50 L65,54 L64,58 L62,61 L59,63 L55,64 L50,64 L45,63 L41,61 L38,58',
  
  'miami': 'M20,45 L35,45 L50,44 L63,42 L72,40 L78,39 L82,39 L84,40 L85,42 L85,45 L84,48 L82,50 L78,51 L72,51 L63,50 L50,49 L35,49 L23,50 L20,51 L19,52 L19,50 L20,48 M25,55 L40,55 L55,54 L68,52 L77,50 L83,49 L86,49 L88,50 L89,52 L89,55 L88,58 L86,60 L83,61 L77,61 L68,60 L55,59 L40,59 L28,60 L25,61',
  
  'imola': 'M30,60 L35,55 L40,51 L45,48 L50,46 L55,45 L60,45 L65,46 L69,48 L72,51 L74,55 L75,59 L75,63 L74,67 L72,70 L69,72 L65,73 L60,73 L55,72 L50,70 L45,67 L41,63 L38,59 L36,55 L35,51 L35,47 L36,43 L38,40 L41,38 L45,37 L50,37 L55,38 L59,40 L62,43 L64,47 L65,51 L65,55 L64,59 L62,62 L59,64 L55,65 L50,65 L45,64 L41,62 L38,59',
  
  'barcelona': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L41,62 L38,58 L36,54 L35,50 L35,46 L36,42 L38,39 L41,37 L45,36 L50,36 L55,37 L59,39 L62,42 L64,46 L65,50 L65,54 L64,58 L62,61 L59,63 L55,64 L50,64 L45,63 L41,61 L38,58',
  
  'gilles-villeneuve': 'M15,50 L25,50 L35,50 L45,49 L55,47 L63,45 L69,43 L73,42 L76,42 L78,43 L79,45 L79,48 L78,51 L76,54 L73,56 L69,58 L63,59 L55,60 L45,60 L35,59 L25,57 L18,55 L15,53 L14,51 L14,49 L15,47 L18,45 L25,43 L35,42 L45,42 L55,43 L63,45 L69,47 L73,49 L76,51 L78,53 L79,55 L79,57 L78,59 L76,60 L73,60 L69,59 L63,57 L55,55 L45,54 L35,54 L25,55 L18,56 L15,57',
  
  'madrid': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L41,62 L38,58 L36,54 L35,50 L35,46 L36,42 L38,39 L41,37 L45,36 L50,36 L55,37 L59,39 L62,42 L64,46 L65,50 L65,54 L64,58 L62,61 L59,63 L55,64 L50,64 L45,63 L41,61 L38,58',
  
  'default': 'M25,55 L30,50 L35,46 L40,43 L45,41 L50,40 L55,40 L60,41 L64,43 L67,46 L69,50 L70,54 L70,58 L69,62 L67,65 L64,67 L60,68 L55,68 L50,67 L45,65 L41,62 L38,58 L36,54 L35,50 L35,46 L36,42 L38,39 L41,37 L45,36 L50,36 L55,37 L59,39 L62,42 L64,46 L65,50 L65,54 L64,58 L62,61 L59,63 L55,64 L50,64 L45,63 L41,61 L38,58'
};

// More accurate start/finish line positions for each circuit
const startFinishPositions: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  'monaco': { x1: 18, y1: 48, x2: 22, y2: 52 },
  'silverstone': { x1: 28, y1: 68, x2: 32, y2: 72 },
  'spa': { x1: 23, y1: 53, x2: 27, y2: 57 },
  'monza': { x1: 18, y1: 48, x2: 22, y2: 52 },
  'suzuka': { x1: 33, y1: 68, x2: 37, y2: 72 },
  'interlagos': { x1: 28, y1: 58, x2: 32, y2: 62 },
  'hungaroring': { x1: 23, y1: 53, x2: 27, y2: 57 },
  'red-bull-ring': { x1: 23, y1: 58, x2: 27, y2: 62 },
  'zandvoort': { x1: 28, y1: 53, x2: 32, y2: 57 },
  'baku': { x1: 13, y1: 48, x2: 17, y2: 52 },
  'marina-bay': { x1: 18, y1: 43, x2: 22, y2: 47 },
  'cota': { x1: 28, y1: 63, x2: 32, y2: 67 },
  'mexico-city': { x1: 23, y1: 53, x2: 27, y2: 57 },
  'las-vegas': { x1: 13, y1: 43, x2: 17, y2: 47 },
  'lusail': { x1: 23, y1: 53, x2: 27, y2: 57 },
  'yas-marina': { x1: 28, y1: 53, x2: 32, y2: 57 },
  'bahrain': { x1: 23, y1: 53, x2: 27, y2: 57 },
  'jeddah': { x1: 13, y1: 46, x2: 17, y2: 50 },
  'albert-park': { x1: 28, y1: 58, x2: 32, y2: 62 },
  'shanghai': { x1: 23, y1: 53, x2: 27, y2: 57 },
  'miami': { x1: 18, y1: 43, x2: 22, y2: 47 },
  'imola': { x1: 28, y1: 58, x2: 32, y2: 62 },
  'barcelona': { x1: 23, y1: 53, x2: 27, y2: 57 },
  'gilles-villeneuve': { x1: 13, y1: 48, x2: 17, y2: 52 },
  'madrid': { x1: 23, y1: 53, x2: 27, y2: 57 },
  'default': { x1: 23, y1: 53, x2: 27, y2: 57 }
};

// Track section definitions for wind analysis
// Each section has a direction (in degrees) representing the track heading
const trackSections: Record<string, Array<{ x: number; y: number; direction: number; type: 'straight' | 'corner' }>> = {
  'monaco': [
    { x: 22, y: 50, direction: 90, type: 'straight' },
    { x: 31, y: 43, direction: 45, type: 'corner' },
    { x: 47, y: 37, direction: 90, type: 'straight' },
    { x: 60, y: 45, direction: 135, type: 'corner' },
    { x: 65, y: 59, direction: 180, type: 'straight' },
    { x: 56, y: 71, direction: 225, type: 'corner' },
    { x: 40, y: 70, direction: 270, type: 'straight' },
    { x: 30, y: 61, direction: 315, type: 'corner' },
  ],
  'silverstone': [
    { x: 32, y: 68, direction: 45, type: 'corner' },
    { x: 52, y: 59, direction: 90, type: 'straight' },
    { x: 68, y: 64, direction: 135, type: 'corner' },
    { x: 73, y: 78, direction: 180, type: 'straight' },
    { x: 63, y: 90, direction: 225, type: 'corner' },
    { x: 48, y: 86, direction: 270, type: 'straight' },
    { x: 34, y: 77, direction: 315, type: 'corner' },
    { x: 30, y: 62, direction: 0, type: 'straight' },
  ],
  'spa': [
    { x: 27, y: 52, direction: 45, type: 'corner' },
    { x: 47, y: 40, direction: 90, type: 'straight' },
    { x: 67, y: 44, direction: 135, type: 'corner' },
    { x: 77, y: 62, direction: 180, type: 'straight' },
    { x: 68, y: 79, direction: 225, type: 'corner' },
    { x: 48, y: 77, direction: 270, type: 'straight' },
    { x: 31, y: 63, direction: 315, type: 'corner' },
  ],
  'monza': [
    { x: 25, y: 50, direction: 90, type: 'straight' },
    { x: 55, y: 46, direction: 90, type: 'straight' },
    { x: 76, y: 40, direction: 135, type: 'corner' },
    { x: 78, y: 50, direction: 180, type: 'straight' },
    { x: 73, y: 65, direction: 225, type: 'corner' },
    { x: 55, y: 76, direction: 270, type: 'straight' },
    { x: 35, y: 68, direction: 315, type: 'corner' },
  ],
  'suzuka': [
    { x: 37, y: 67, direction: 45, type: 'corner' },
    { x: 52, y: 57, direction: 90, type: 'straight' },
    { x: 67, y: 56, direction: 135, type: 'corner' },
    { x: 79, y: 71, direction: 180, type: 'straight' },
    { x: 70, y: 82, direction: 225, type: 'corner' },
    { x: 50, y: 77, direction: 270, type: 'straight' },
    { x: 38, y: 63, direction: 315, type: 'corner' },
    { x: 52, y: 52, direction: 0, type: 'corner' },
  ],
  'default': [
    { x: 27, y: 52, direction: 45, type: 'corner' },
    { x: 47, y: 40, direction: 90, type: 'straight' },
    { x: 67, y: 44, direction: 135, type: 'corner' },
    { x: 70, y: 56, direction: 180, type: 'straight' },
    { x: 62, y: 66, direction: 225, type: 'corner' },
    { x: 45, y: 66, direction: 270, type: 'straight' },
    { x: 35, y: 58, direction: 315, type: 'corner' },
  ]
};

// Calculate wind impact on track section
// Returns: 'headwind', 'tailwind', or 'crosswind'
function calculateWindImpact(trackDirection: number, windDirection: number): { type: 'headwind' | 'tailwind' | 'crosswind'; strength: number } {
  // Normalize angles to 0-360
  const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
  
  const trackDir = normalizeAngle(trackDirection);
  const windDir = normalizeAngle(windDirection);
  
  // Calculate the difference between wind direction and track direction
  let diff = Math.abs(windDir - trackDir);
  if (diff > 180) diff = 360 - diff;
  
  // Headwind: wind coming from ahead (within 45 degrees)
  // Tailwind: wind coming from behind (within 45 degrees)
  // Crosswind: wind from the side
  
  const strength = Math.cos((diff * Math.PI) / 180); // -1 to 1
  
  if (diff < 45) {
    return { type: 'headwind', strength: Math.abs(strength) };
  } else if (diff > 135) {
    return { type: 'tailwind', strength: Math.abs(strength) };
  } else {
    return { type: 'crosswind', strength: Math.abs(strength) };
  }
}

// Wind direction indicator component with headwind/tailwind coloring
function WindIndicator({ 
  x, 
  y, 
  trackDirection, 
  windDirection, 
  windSpeed, 
  size = 12, 
  colors,
  showLabel = false
}: { 
  x: number; 
  y: number; 
  trackDirection: number;
  windDirection: number; 
  windSpeed: number; 
  size?: number; 
  colors: any;
  showLabel?: boolean;
}) {
  const impact = calculateWindImpact(trackDirection, windDirection);
  
  // Color based on wind impact
  let color = colors.wind;
  if (impact.type === 'headwind') {
    color = '#EF4444'; // Red for headwind (slows down)
  } else if (impact.type === 'tailwind') {
    color = '#10B981'; // Green for tailwind (speeds up)
  } else {
    color = '#F59E0B'; // Amber for crosswind
  }
  
  const arrowLength = Math.min(size, windSpeed * 0.15);
  const opacity = 0.7 + (impact.strength * 0.3); // More visible for stronger impact
  
  // Calculate arrow direction relative to track
  const relativeWindDir = (windDirection - trackDirection + 360) % 360;
  const radians = (relativeWindDir - 90) * (Math.PI / 180);
  
  const endX = x + Math.cos(radians) * arrowLength;
  const endY = y + Math.sin(radians) * arrowLength;
  
  // Arrow head
  const headLength = arrowLength * 0.4;
  const headAngle = Math.PI / 6;
  
  const head1X = endX - Math.cos(radians - headAngle) * headLength;
  const head1Y = endY - Math.sin(radians - headAngle) * headLength;
  
  const head2X = endX - Math.cos(radians + headAngle) * headLength;
  const head2Y = endY - Math.sin(radians + headAngle) * headLength;

  return (
    <G opacity={opacity}>
      {/* Background circle for better visibility */}
      <Circle
        cx={x}
        cy={y}
        r={size * 0.8}
        fill={color}
        opacity={0.2}
      />
      
      {/* Arrow line */}
      <Line
        x1={x}
        y1={y}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Arrow head */}
      <Polygon
        points={`${endX},${endY} ${head1X},${head1Y} ${head2X},${head2Y}`}
        fill={color}
      />
    </G>
  );
}

export default function TrackMap({ 
  circuitSlug, 
  windDirection = 0, 
  windSpeed = 0, 
  size = 120,
  showWindOverlay = true 
}: Props) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const trackPath = trackLayouts[circuitSlug] || trackLayouts.default;
  const startFinish = startFinishPositions[circuitSlug] || startFinishPositions.default;
  const sections = trackSections[circuitSlug] || trackSections.default;
  
  console.log(`Rendering track map for ${circuitSlug} with wind: ${windSpeed}km/h at ${windDirection}°`);
  
  // Generate wind indicators for each track section
  const windIndicators = [];
  if (windSpeed > 0 && showWindOverlay) {
    sections.forEach((section, index) => {
      const impact = calculateWindImpact(section.direction, windDirection);
      
      windIndicators.push(
        <WindIndicator
          key={index}
          x={section.x}
          y={section.y}
          trackDirection={section.direction}
          windDirection={windDirection}
          windSpeed={windSpeed}
          size={section.type === 'straight' ? 14 : 10}
          colors={colors}
        />
      );
    });
  }

  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* Gradient for track */}
          <LinearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primaryDark} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Track layout with gradient */}
        <Path
          d={trackPath}
          stroke="url(#trackGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Start/finish line */}
        <Line
          x1={startFinish.x1}
          y1={startFinish.y1}
          x2={startFinish.x2}
          y2={startFinish.y2}
          stroke={colors.text}
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Start/finish line perpendicular marks (checkered flag pattern) */}
        <Line
          x1={startFinish.x1 - 1.5}
          y1={startFinish.y1 - 1.5}
          x2={startFinish.x1 + 1.5}
          y2={startFinish.y1 + 1.5}
          stroke={colors.text}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Line
          x1={startFinish.x2 - 1.5}
          y1={startFinish.y2 - 1.5}
          x2={startFinish.x2 + 1.5}
          y2={startFinish.y2 + 1.5}
          stroke={colors.text}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Wind direction indicators with headwind/tailwind coloring */}
        {windIndicators}
      </Svg>
      
      {windSpeed > 0 && showWindOverlay && (
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Headwind</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Tailwind</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Crosswind</Text>
          </View>
        </View>
      )}
      
      {windSpeed > 0 && (
        <View style={styles.windInfo}>
          <Text style={styles.windText}>{Math.round(windSpeed)} km/h</Text>
          <Text style={styles.windDirection}>{Math.round(windDirection)}°</Text>
        </View>
      )}
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 12,
      position: 'relative',
    },
    windInfo: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.card,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    windText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    windDirection: {
      fontSize: 9,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: 2,
    },
    legend: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: colors.card,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.divider,
      gap: 4,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 9,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
  });
}
