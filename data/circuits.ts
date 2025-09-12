
import { Circuit } from '../components/CircuitCard';

// F1 2026 calendar circuits (reordered to match official 2026 calendar)
export const f1Circuits: Circuit[] = [
  { slug: 'albert-park', name: 'Albert Park Circuit', country: 'Australia', latitude: -37.8497, longitude: 144.968 },
  { slug: 'shanghai', name: 'Shanghai International Circuit', country: 'China', latitude: 31.3389, longitude: 121.2206 },
  { slug: 'suzuka', name: 'Suzuka Circuit', country: 'Japan', latitude: 34.8431, longitude: 136.5419 },
  { slug: 'bahrain', name: 'Bahrain International Circuit', country: 'Bahrain', latitude: 26.0325, longitude: 50.5106 },
  { slug: 'jeddah', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', latitude: 21.6319, longitude: 39.1044 },
  { slug: 'miami', name: 'Miami International Autodrome', country: 'USA', latitude: 25.958, longitude: -80.2389 },
  { slug: 'gilles-villeneuve', name: 'Circuit Gilles Villeneuve', country: 'Canada', latitude: 45.5, longitude: -73.5228 },
  { slug: 'monaco', name: 'Circuit de Monaco', country: 'Monaco', latitude: 43.7347, longitude: 7.4206 },
  { slug: 'barcelona', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611 },
  { slug: 'red-bull-ring', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647 },
  { slug: 'silverstone', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142 },
  { slug: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', latitude: 50.4372, longitude: 5.9714 },
  { slug: 'hungaroring', name: 'Hungaroring', country: 'Hungary', latitude: 47.5789, longitude: 19.2486 },
  { slug: 'zandvoort', name: 'Circuit Zandvoort', country: 'Netherlands', latitude: 52.3885, longitude: 4.5402 },
  { slug: 'monza', name: 'Monza - Autodromo Nazionale', country: 'Italy', latitude: 45.6183, longitude: 9.2811 },
  { slug: 'madrid', name: 'Madrid Circuit', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
  { slug: 'baku', name: 'Baku City Circuit', country: 'Azerbaijan', latitude: 40.3725, longitude: 49.8533 },
  { slug: 'marina-bay', name: 'Marina Bay Street Circuit', country: 'Singapore', latitude: 1.2914, longitude: 103.864 },
  { slug: 'cota', name: 'Circuit of The Americas', country: 'USA', latitude: 30.1328, longitude: -97.6411 },
  { slug: 'mexico-city', name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', latitude: 19.4042, longitude: -99.0907 },
  { slug: 'interlagos', name: 'Autódromo José Carlos Pace', country: 'Brazil', latitude: -23.701, longitude: -46.6988 },
  { slug: 'las-vegas', name: 'Las Vegas Strip Circuit', country: 'USA', latitude: 36.1147, longitude: -115.173 },
  { slug: 'lusail', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542 },
  { slug: 'yas-marina', name: 'Yas Marina Circuit', country: 'UAE', latitude: 24.4672, longitude: 54.6031 },
];

// MotoGP 2026 calendar circuits (reordered to match 2026 calendar)
export const motogpCircuits: Circuit[] = [
  { slug: 'buriram', name: 'Chang International Circuit', country: 'Thailand', latitude: 15.2296, longitude: 103.0439 },
  { slug: 'goiania', name: 'Autódromo Internacional de Goiânia', country: 'Brazil', latitude: -16.6869, longitude: -49.2648 },
  { slug: 'cota-mgp', name: 'Circuit of The Americas', country: 'USA', latitude: 30.1328, longitude: -97.6411 },
  { slug: 'losail', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542 },
  { slug: 'jerez', name: 'Circuito de Jerez', country: 'Spain', latitude: 36.7081, longitude: -6.0353 },
  { slug: 'lemans', name: 'Bugatti Circuit (Le Mans)', country: 'France', latitude: 47.955, longitude: 0.2243 },
  { slug: 'barcelona-mgp', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611 },
  { slug: 'mugello', name: 'Mugello Circuit', country: 'Italy', latitude: 43.9975, longitude: 11.3713 },
  { slug: 'balaton-park', name: 'Balaton Park', country: 'Hungary', latitude: 46.8167, longitude: 17.7667 },
  { slug: 'brno', name: 'Automotodrom Brno', country: 'Czech Republic', latitude: 49.2108, longitude: 16.6083 },
  { slug: 'assen', name: 'TT Circuit Assen', country: 'Netherlands', latitude: 52.9553, longitude: 6.5222 },
  { slug: 'sachsenring', name: 'Sachsenring', country: 'Germany', latitude: 50.7972, longitude: 12.6883 },
  { slug: 'silverstone-mgp', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142 },
  { slug: 'aragon', name: 'MotorLand Aragón', country: 'Spain', latitude: 41.227, longitude: -0.2089 },
  { slug: 'misano', name: 'Misano World Circuit', country: 'San Marino', latitude: 43.9947, longitude: 12.6928 },
  { slug: 'red-bull-ring-mgp', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647 },
  { slug: 'motegi', name: 'Mobility Resort Motegi', country: 'Japan', latitude: 36.5319, longitude: 140.2279 },
  { slug: 'mandalika', name: 'Pertamina Mandalika International Circuit', country: 'Indonesia', latitude: -8.8441, longitude: 116.324 },
  { slug: 'phillip-island', name: 'Phillip Island', country: 'Australia', latitude: -38.5042, longitude: 145.237 },
  { slug: 'sepang', name: 'Sepang International Circuit', country: 'Malaysia', latitude: 2.7608, longitude: 101.7381 },
  { slug: 'portimao', name: 'Algarve International Circuit', country: 'Portugal', latitude: 37.2301, longitude: -8.6267 },
  { slug: 'valencia', name: 'Circuit Ricardo Tormo', country: 'Spain', latitude: 39.4895, longitude: -0.6262 },
];

// IndyCar 2025 calendar circuits
export const indycarCircuits: Circuit[] = [
  { slug: 'st-pete', name: 'Streets of St. Petersburg', country: 'USA', latitude: 27.7663, longitude: -82.6404 },
  { slug: 'thermal', name: 'Thermal Club', country: 'USA', latitude: 33.6405, longitude: -116.1669 },
  { slug: 'long-beach', name: 'Streets of Long Beach', country: 'USA', latitude: 33.7701, longitude: -118.1937 },
  { slug: 'barber', name: 'Barber Motorsports Park', country: 'USA', latitude: 33.5447, longitude: -86.3928 },
  { slug: 'indianapolis-gp', name: 'Indianapolis Motor Speedway (GP)', country: 'USA', latitude: 39.7950, longitude: -86.2336 },
  { slug: 'indianapolis-500', name: 'Indianapolis Motor Speedway (Oval)', country: 'USA', latitude: 39.7950, longitude: -86.2336 },
  { slug: 'detroit', name: 'Streets of Detroit', country: 'USA', latitude: 42.3314, longitude: -83.0458 },
  { slug: 'road-america', name: 'Road America', country: 'USA', latitude: 43.8003, longitude: -87.9890 },
  { slug: 'laguna-seca', name: 'WeatherTech Raceway Laguna Seca', country: 'USA', latitude: 36.5844, longitude: -121.7544 },
  { slug: 'mid-ohio', name: 'Mid-Ohio Sports Car Course', country: 'USA', latitude: 40.3392, longitude: -82.6275 },
  { slug: 'toronto', name: 'Streets of Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { slug: 'iowa', name: 'Iowa Speedway', country: 'USA', latitude: 41.4619, longitude: -93.4158 },
  { slug: 'gateway', name: 'World Wide Technology Raceway', country: 'USA', latitude: 38.6470, longitude: -90.1560 },
  { slug: 'portland', name: 'Portland International Raceway', country: 'USA', latitude: 45.5992, longitude: -122.6928 },
  { slug: 'nashville', name: 'Nashville Superspeedway', country: 'USA', latitude: 36.2058, longitude: -86.8119 },
];

export function getCircuitBySlug(slug: string, category: 'f1' | 'motogp' | 'indycar') {
  const list = category === 'f1' ? f1Circuits : category === 'motogp' ? motogpCircuits : indycarCircuits;
  const hit = list.find((c) => c.slug === slug);
  if (!hit) {
    console.log('Circuit not found', slug, category);
    return list[0];
  }
  return hit;
}
