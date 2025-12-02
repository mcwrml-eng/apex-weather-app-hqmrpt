
import { Circuit } from '../components/CircuitCard';
import { f2Circuits, f3Circuits } from './f2f3-circuits';

// Extended Circuit interface with track direction
export interface CircuitWithDirection extends Circuit {
  trackDirection?: number; // Main straight direction in degrees (0-360)
}

// F1 2026 calendar circuits (reordered to match official 2026 calendar)
// Track direction represents the main straight/start-finish line direction
export const f1Circuits: CircuitWithDirection[] = [
  { slug: 'albert-park', name: 'Albert Park Circuit', country: 'Australia', latitude: -37.8497, longitude: 144.968, trackDirection: 180 },
  { slug: 'shanghai', name: 'Shanghai International Circuit', country: 'China', latitude: 31.3389, longitude: 121.2206, trackDirection: 90 },
  { slug: 'suzuka', name: 'Suzuka Circuit', country: 'Japan', latitude: 34.8431, longitude: 136.5419, trackDirection: 45 },
  { slug: 'bahrain', name: 'Bahrain International Circuit', country: 'Bahrain', latitude: 26.0325, longitude: 50.5106, trackDirection: 0 },
  { slug: 'jeddah', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', latitude: 21.6319, longitude: 39.1044, trackDirection: 315 },
  { slug: 'miami', name: 'Miami International Autodrome', country: 'USA', latitude: 25.958, longitude: -80.2389, trackDirection: 270 },
  { slug: 'gilles-villeneuve', name: 'Circuit Gilles Villeneuve', country: 'Canada', latitude: 45.5, longitude: -73.5228, trackDirection: 180 },
  { slug: 'monaco', name: 'Circuit de Monaco', country: 'Monaco', latitude: 43.7347, longitude: 7.4206, trackDirection: 90 },
  { slug: 'barcelona', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611, trackDirection: 0 },
  { slug: 'red-bull-ring', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647, trackDirection: 45 },
  { slug: 'silverstone', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142, trackDirection: 180 },
  { slug: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', latitude: 50.4372, longitude: 5.9714, trackDirection: 270 },
  { slug: 'hungaroring', name: 'Hungaroring', country: 'Hungary', latitude: 47.5789, longitude: 19.2486, trackDirection: 135 },
  { slug: 'zandvoort', name: 'Circuit Zandvoort', country: 'Netherlands', latitude: 52.3885, longitude: 4.5402, trackDirection: 225 },
  { slug: 'monza', name: 'Monza - Autodromo Nazionale', country: 'Italy', latitude: 45.6183, longitude: 9.2811, trackDirection: 0 },
  { slug: 'madrid', name: 'Madrid Circuit', country: 'Spain', latitude: 40.4168, longitude: -3.7038, trackDirection: 90 },
  { slug: 'baku', name: 'Baku City Circuit', country: 'Azerbaijan', latitude: 40.3725, longitude: 49.8533, trackDirection: 180 },
  { slug: 'marina-bay', name: 'Marina Bay Street Circuit', country: 'Singapore', latitude: 1.2914, longitude: 103.864, trackDirection: 270 },
  { slug: 'cota', name: 'Circuit of The Americas', country: 'USA', latitude: 30.1328, longitude: -97.6411, trackDirection: 180 },
  { slug: 'mexico-city', name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', latitude: 19.4042, longitude: -99.0907, trackDirection: 90 },
  { slug: 'interlagos', name: 'Autódromo José Carlos Pace', country: 'Brazil', latitude: -23.701, longitude: -46.6988, trackDirection: 180 },
  { slug: 'las-vegas', name: 'Las Vegas Strip Circuit', country: 'USA', latitude: 36.1147, longitude: -115.173, trackDirection: 0 },
  { slug: 'lusail', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542, trackDirection: 180 },
  { slug: 'yas-marina', name: 'Yas Marina Circuit', country: 'UAE', latitude: 24.4672, longitude: 54.6031, trackDirection: 270 },
];

// MotoGP 2026 calendar circuits (reordered to match 2026 calendar)
export const motogpCircuits: CircuitWithDirection[] = [
  { slug: 'buriram', name: 'Chang International Circuit', country: 'Thailand', latitude: 15.2296, longitude: 103.0439, trackDirection: 180 },
  { slug: 'goiania', name: 'Autódromo Internacional de Goiânia', country: 'Brazil', latitude: -16.6869, longitude: -49.2648, trackDirection: 90 },
  { slug: 'cota-mgp', name: 'Circuit of The Americas', country: 'USA', latitude: 30.1328, longitude: -97.6411, trackDirection: 180 },
  { slug: 'losail', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542, trackDirection: 180 },
  { slug: 'jerez', name: 'Circuito de Jerez', country: 'Spain', latitude: 36.7081, longitude: -6.0353, trackDirection: 270 },
  { slug: 'lemans', name: 'Bugatti Circuit (Le Mans)', country: 'France', latitude: 47.955, longitude: 0.2243, trackDirection: 90 },
  { slug: 'barcelona-mgp', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611, trackDirection: 0 },
  { slug: 'mugello', name: 'Mugello Circuit', country: 'Italy', latitude: 43.9975, longitude: 11.3713, trackDirection: 180 },
  { slug: 'balaton-park', name: 'Balaton Park', country: 'Hungary', latitude: 46.8167, longitude: 17.7667, trackDirection: 90 },
  { slug: 'brno', name: 'Automotodrom Brno', country: 'Czech Republic', latitude: 49.2108, longitude: 16.6083, trackDirection: 135 },
  { slug: 'assen', name: 'TT Circuit Assen', country: 'Netherlands', latitude: 52.9553, longitude: 6.5222, trackDirection: 270 },
  { slug: 'sachsenring', name: 'Sachsenring', country: 'Germany', latitude: 50.7972, longitude: 12.6883, trackDirection: 45 },
  { slug: 'silverstone-mgp', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142, trackDirection: 180 },
  { slug: 'aragon', name: 'MotorLand Aragón', country: 'Spain', latitude: 41.227, longitude: -0.2089, trackDirection: 90 },
  { slug: 'misano', name: 'Misano World Circuit', country: 'San Marino', latitude: 43.9947, longitude: 12.6928, trackDirection: 315 },
  { slug: 'red-bull-ring-mgp', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647, trackDirection: 45 },
  { slug: 'motegi', name: 'Mobility Resort Motegi', country: 'Japan', latitude: 36.5319, longitude: 140.2279, trackDirection: 180 },
  { slug: 'mandalika', name: 'Pertamina Mandalika International Circuit', country: 'Indonesia', latitude: -8.8441, longitude: 116.324, trackDirection: 270 },
  { slug: 'phillip-island', name: 'Phillip Island', country: 'Australia', latitude: -38.5042, longitude: 145.237, trackDirection: 225 },
  { slug: 'sepang', name: 'Sepang International Circuit', country: 'Malaysia', latitude: 2.7608, longitude: 101.7381, trackDirection: 180 },
  { slug: 'portimao', name: 'Algarve International Circuit', country: 'Portugal', latitude: 37.2301, longitude: -8.6267, trackDirection: 90 },
  { slug: 'valencia', name: 'Circuit Ricardo Tormo', country: 'Spain', latitude: 39.4895, longitude: -0.6262, trackDirection: 180 },
];

// IndyCar 2026 calendar circuits (reordered to match new 2026 calendar)
export const indycarCircuits: CircuitWithDirection[] = [
  { slug: 'st-pete', name: 'Streets of St. Petersburg', country: 'USA', latitude: 27.7663, longitude: -82.6404, trackDirection: 90 },
  { slug: 'phoenix', name: 'Phoenix Raceway', country: 'USA', latitude: 33.3750, longitude: -112.3111, trackDirection: 270 },
  { slug: 'arlington', name: 'Streets of Arlington', country: 'USA', latitude: 32.7357, longitude: -97.1081, trackDirection: 0 },
  { slug: 'barber', name: 'Barber Motorsports Park', country: 'USA', latitude: 33.5447, longitude: -86.3928, trackDirection: 180 },
  { slug: 'long-beach', name: 'Streets of Long Beach', country: 'USA', latitude: 33.7701, longitude: -118.1937, trackDirection: 270 },
  { slug: 'indianapolis-gp', name: 'Indianapolis Motor Speedway Road Course', country: 'USA', latitude: 39.7950, longitude: -86.2336, trackDirection: 180 },
  { slug: 'indianapolis-500', name: 'The 110th Indianapolis 500', country: 'USA', latitude: 39.7950, longitude: -86.2336, trackDirection: 180 },
  { slug: 'detroit', name: 'Streets of Detroit', country: 'USA', latitude: 42.3314, longitude: -83.0458, trackDirection: 90 },
  { slug: 'gateway', name: 'World Wide Technology Raceway', country: 'USA', latitude: 38.6470, longitude: -90.1560, trackDirection: 270 },
  { slug: 'road-america', name: 'Road America', country: 'USA', latitude: 43.8003, longitude: -87.9890, trackDirection: 0 },
  { slug: 'mid-ohio', name: 'Mid-Ohio Sports Car Course', country: 'USA', latitude: 40.3392, longitude: -82.6275, trackDirection: 90 },
  { slug: 'nashville', name: 'Nashville Superspeedway', country: 'USA', latitude: 36.2058, longitude: -86.8119, trackDirection: 270 },
  { slug: 'portland', name: 'Portland International Raceway', country: 'USA', latitude: 45.5992, longitude: -122.6928, trackDirection: 180 },
  { slug: 'markham', name: 'Streets of Markham', country: 'Canada', latitude: 43.8561, longitude: -79.3370, trackDirection: 90 },
  { slug: 'milwaukee-1', name: 'Milwaukee Mile Race 1', country: 'USA', latitude: 43.0389, longitude: -88.0053, trackDirection: 270 },
  { slug: 'milwaukee-2', name: 'Milwaukee Mile Race 2', country: 'USA', latitude: 43.0389, longitude: -88.0053, trackDirection: 270 },
  { slug: 'laguna-seca', name: 'WeatherTech Raceway Laguna Seca', country: 'USA', latitude: 36.5844, longitude: -121.7544, trackDirection: 315 },
];

// NASCAR 2026 Cup Series calendar circuits
export const nascarCircuits: CircuitWithDirection[] = [
  { slug: 'daytona', name: 'Daytona International Speedway', country: 'USA', latitude: 29.1864, longitude: -81.0712, trackDirection: 270 },
  { slug: 'atlanta', name: 'Atlanta Motor Speedway', country: 'USA', latitude: 33.3881, longitude: -84.3189, trackDirection: 270 },
  { slug: 'las-vegas-nascar', name: 'Las Vegas Motor Speedway', country: 'USA', latitude: 36.2719, longitude: -115.0094, trackDirection: 270 },
  { slug: 'phoenix-nascar', name: 'Phoenix Raceway', country: 'USA', latitude: 33.3750, longitude: -112.3111, trackDirection: 270 },
  { slug: 'cota-nascar', name: 'Circuit of The Americas', country: 'USA', latitude: 30.1328, longitude: -97.6411, trackDirection: 180 },
  { slug: 'richmond', name: 'Richmond Raceway', country: 'USA', latitude: 37.5917, longitude: -77.4208, trackDirection: 270 },
  { slug: 'martinsville', name: 'Martinsville Speedway', country: 'USA', latitude: 36.6317, longitude: -79.8472, trackDirection: 270 },
  { slug: 'texas', name: 'Texas Motor Speedway', country: 'USA', latitude: 33.0364, longitude: -97.2811, trackDirection: 270 },
  { slug: 'talladega', name: 'Talladega Superspeedway', country: 'USA', latitude: 33.5661, longitude: -86.0694, trackDirection: 270 },
  { slug: 'dover', name: 'Dover Motor Speedway', country: 'USA', latitude: 39.1886, longitude: -75.5297, trackDirection: 270 },
  { slug: 'kansas', name: 'Kansas Speedway', country: 'USA', latitude: 39.1153, longitude: -94.8303, trackDirection: 270 },
  { slug: 'darlington', name: 'Darlington Raceway', country: 'USA', latitude: 34.2997, longitude: -79.9006, trackDirection: 270 },
  { slug: 'charlotte-600', name: 'Charlotte Motor Speedway (Coca-Cola 600)', country: 'USA', latitude: 35.3525, longitude: -80.6828, trackDirection: 270 },
  { slug: 'gateway-nascar', name: 'World Wide Technology Raceway', country: 'USA', latitude: 38.6470, longitude: -90.1560, trackDirection: 270 },
  { slug: 'sonoma', name: 'Sonoma Raceway', country: 'USA', latitude: 38.1614, longitude: -122.4544, trackDirection: 180 },
  { slug: 'iowa', name: 'Iowa Speedway', country: 'USA', latitude: 41.6544, longitude: -93.4069, trackDirection: 270 },
  { slug: 'chicago', name: 'Chicago Street Course', country: 'USA', latitude: 41.8781, longitude: -87.6298, trackDirection: 0 },
  { slug: 'pocono', name: 'Pocono Raceway', country: 'USA', latitude: 41.0550, longitude: -75.5189, trackDirection: 180 },
  { slug: 'indianapolis-nascar', name: 'Indianapolis Motor Speedway (Brickyard 400)', country: 'USA', latitude: 39.7950, longitude: -86.2336, trackDirection: 180 },
  { slug: 'michigan', name: 'Michigan International Speedway', country: 'USA', latitude: 42.0678, longitude: -84.2397, trackDirection: 270 },
  { slug: 'daytona-2', name: 'Daytona International Speedway (Coke Zero Sugar 400)', country: 'USA', latitude: 29.1864, longitude: -81.0712, trackDirection: 270 },
  { slug: 'watkins-glen', name: 'Watkins Glen International', country: 'USA', latitude: 42.3369, longitude: -76.9275, trackDirection: 180 },
  { slug: 'bristol', name: 'Bristol Motor Speedway', country: 'USA', latitude: 36.5156, longitude: -82.2581, trackDirection: 270 },
  { slug: 'new-hampshire', name: 'New Hampshire Motor Speedway', country: 'USA', latitude: 43.3656, longitude: -71.4686, trackDirection: 270 },
  { slug: 'charlotte-roval', name: 'Charlotte Motor Speedway ROVAL', country: 'USA', latitude: 35.3525, longitude: -80.6828, trackDirection: 180 },
  { slug: 'homestead', name: 'Homestead-Miami Speedway', country: 'USA', latitude: 25.4492, longitude: -80.4142, trackDirection: 270 },
  { slug: 'las-vegas-nascar-2', name: 'Las Vegas Motor Speedway (South Point 400)', country: 'USA', latitude: 36.2719, longitude: -115.0094, trackDirection: 270 },
  { slug: 'talladega-2', name: 'Talladega Superspeedway (YellaWood 500)', country: 'USA', latitude: 33.5661, longitude: -86.0694, trackDirection: 270 },
  { slug: 'charlotte-fall', name: 'Charlotte Motor Speedway (Bank of America ROVAL 400)', country: 'USA', latitude: 35.3525, longitude: -80.6828, trackDirection: 180 },
  { slug: 'homestead-2', name: 'Homestead-Miami Speedway (Dixie Vodka 400)', country: 'USA', latitude: 25.4492, longitude: -80.4142, trackDirection: 270 },
  { slug: 'martinsville-2', name: 'Martinsville Speedway (Xfinity 500)', country: 'USA', latitude: 36.6317, longitude: -79.8472, trackDirection: 270 },
  { slug: 'phoenix-championship', name: 'Phoenix Raceway (Championship)', country: 'USA', latitude: 33.3750, longitude: -112.3111, trackDirection: 270 },
];

export function getCircuitBySlug(slug: string, category?: 'f1' | 'f2' | 'f3' | 'motogp' | 'indycar' | 'nascar'): CircuitWithDirection {
  if (category) {
    const list = category === 'f1' ? f1Circuits : 
                  category === 'f2' ? f2Circuits :
                  category === 'f3' ? f3Circuits :
                  category === 'motogp' ? motogpCircuits : 
                  category === 'indycar' ? indycarCircuits :
                  nascarCircuits;
    const hit = list.find((c) => c.slug === slug);
    if (!hit) {
      console.log('Circuit not found', slug, category);
      return list[0];
    }
    return hit;
  }
  
  // Search all circuits if no category specified
  const allCircuits = [...f1Circuits, ...f2Circuits, ...f3Circuits, ...motogpCircuits, ...indycarCircuits, ...nascarCircuits];
  const hit = allCircuits.find((c) => c.slug === slug);
  if (!hit) {
    console.log('Circuit not found', slug, 'in any category');
    return f1Circuits[0]; // fallback
  }
  return hit;
}
