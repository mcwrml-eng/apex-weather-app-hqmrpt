
/**
 * Wind Analysis Utilities
 * Calculate headwind, tailwind, and crosswind components for racing circuits
 */

/**
 * Calculate the angle difference between two directions
 * Returns a value between -180 and 180 degrees
 */
export function calculateAngleDifference(angle1: number, angle2: number): number {
  let diff = angle2 - angle1;
  
  // Normalize to -180 to 180 range
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  
  return diff;
}

/**
 * Calculate headwind/tailwind component
 * Positive = headwind, Negative = tailwind
 */
export function calculateHeadTailwind(
  windSpeed: number,
  windDirection: number,
  trackDirection: number
): number {
  // Calculate the angle difference between wind and track direction
  const angleDiff = calculateAngleDifference(trackDirection, windDirection);
  
  // Calculate the component along the track direction
  // cos(0°) = 1 (full headwind), cos(180°) = -1 (full tailwind)
  const component = windSpeed * Math.cos((angleDiff * Math.PI) / 180);
  
  return component;
}

/**
 * Calculate crosswind component
 * Always returns positive value
 */
export function calculateCrosswind(
  windSpeed: number,
  windDirection: number,
  trackDirection: number
): number {
  // Calculate the angle difference between wind and track direction
  const angleDiff = calculateAngleDifference(trackDirection, windDirection);
  
  // Calculate the component perpendicular to the track direction
  // sin(90°) = 1 (full crosswind from right), sin(-90°) = -1 (full crosswind from left)
  const component = Math.abs(windSpeed * Math.sin((angleDiff * Math.PI) / 180));
  
  return component;
}

/**
 * Get wind type description
 */
export function getWindType(
  windSpeed: number,
  windDirection: number,
  trackDirection: number
): 'headwind' | 'tailwind' | 'crosswind' | 'calm' {
  if (windSpeed < 5) return 'calm';
  
  const angleDiff = Math.abs(calculateAngleDifference(trackDirection, windDirection));
  
  // Headwind: wind coming from ahead (within 45° of track direction)
  if (angleDiff <= 45) return 'headwind';
  
  // Tailwind: wind coming from behind (within 45° of opposite track direction)
  if (angleDiff >= 135) return 'tailwind';
  
  // Crosswind: wind coming from the side
  return 'crosswind';
}

/**
 * Get detailed wind analysis for display
 */
export interface WindAnalysis {
  headTailwind: number;
  crosswind: number;
  windType: 'headwind' | 'tailwind' | 'crosswind' | 'calm';
  description: string;
  impactLevel: 'low' | 'moderate' | 'high' | 'severe';
}

export function analyzeWindForTrack(
  windSpeed: number,
  windDirection: number,
  trackDirection: number,
  unit: 'metric' | 'imperial' = 'metric'
): WindAnalysis {
  const headTailwind = calculateHeadTailwind(windSpeed, windDirection, trackDirection);
  const crosswind = calculateCrosswind(windSpeed, windDirection, trackDirection);
  const windType = getWindType(windSpeed, windDirection, trackDirection);
  
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';
  
  // Determine impact level based on wind speed and type
  let impactLevel: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  const threshold = unit === 'metric' ? 
    { moderate: 30, high: 50, severe: 70 } : 
    { moderate: 19, high: 31, severe: 43 };
  
  if (windSpeed >= threshold.severe) {
    impactLevel = 'severe';
  } else if (windSpeed >= threshold.high) {
    impactLevel = 'high';
  } else if (windSpeed >= threshold.moderate) {
    impactLevel = 'moderate';
  }
  
  // Generate description
  let description = '';
  
  if (windType === 'calm') {
    description = 'Calm conditions with minimal wind impact on racing.';
  } else if (windType === 'headwind') {
    const headwindValue = Math.abs(Math.round(headTailwind));
    description = `${headwindValue} ${speedUnit} headwind on the main straight. `;
    description += 'Reduces top speed and increases braking stability.';
  } else if (windType === 'tailwind') {
    const tailwindValue = Math.abs(Math.round(headTailwind));
    description = `${tailwindValue} ${speedUnit} tailwind on the main straight. `;
    description += 'Increases top speed but may reduce braking stability.';
  } else {
    const crosswindValue = Math.round(crosswind);
    description = `${crosswindValue} ${speedUnit} crosswind. `;
    description += 'May affect vehicle stability through corners and on straights.';
  }
  
  return {
    headTailwind,
    crosswind,
    windType,
    description,
    impactLevel,
  };
}

/**
 * Get wind direction label relative to track
 */
export function getRelativeWindDirection(
  windDirection: number,
  trackDirection: number
): string {
  const angleDiff = calculateAngleDifference(trackDirection, windDirection);
  const absAngle = Math.abs(angleDiff);
  
  if (absAngle <= 22.5) return 'Direct Headwind';
  if (absAngle <= 67.5) return angleDiff > 0 ? 'Headwind from Right' : 'Headwind from Left';
  if (absAngle <= 112.5) return angleDiff > 0 ? 'Crosswind from Right' : 'Crosswind from Left';
  if (absAngle <= 157.5) return angleDiff > 0 ? 'Tailwind from Right' : 'Tailwind from Left';
  return 'Direct Tailwind';
}
