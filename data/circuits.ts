
import { Circuit } from '../components/CircuitCard';

// F1 2025 calendar circuits
export const f1Circuits: Circuit[] = [
  { slug: 'bahrain', name: 'Bahrain International Circuit', country: 'Bahrain', latitude: 26.0325, longitude: 50.5106 },
  { slug: 'jeddah', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', latitude: 21.6319, longitude: 39.1044 },
  { slug: 'albert-park', name: 'Albert Park Circuit', country: 'Australia', latitude: -37.8497, longitude: 144.968 },
  { slug: 'suzuka', name: 'Suzuka Circuit', country: 'Japan', latitude: 34.8431, longitude: 136.5419 },
  { slug: 'shanghai', name: 'Shanghai International Circuit', country: 'China', latitude: 31.3389, longitude: 121.2206 },
  { slug: 'miami', name: 'Miami International Autodrome', country: 'USA', latitude: 25.958, longitude: -80.2389 },
  { slug: 'imola', name: 'Imola - Autodromo Enzo e Dino Ferrari', country: 'Italy', latitude: 44.3439, longitude: 11.7167 },
  { slug: 'monaco', name: 'Circuit de Monaco', country: 'Monaco', latitude: 43.7347, longitude: 7.4206 },
  { slug: 'barcelona', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611 },
  { slug: 'gilles-villeneuve', name: 'Circuit Gilles Villeneuve', country: 'Canada', latitude: 45.5, longitude: -73.5228 },
  { slug: 'red-bull-ring', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647 },
  { slug: 'silverstone', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142 },
  { slug: 'hungaroring', name: 'Hungaroring', country: 'Hungary', latitude: 47.5789, longitude: 19.2486 },
  { slug: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', latitude: 50.4372, longitude: 5.9714 },
  { slug: 'zandvoort', name: 'Circuit Zandvoort', country: 'Netherlands', latitude: 52.3885, longitude: 4.5402 },
  { slug: 'monza', name: 'Monza - Autodromo Nazionale', country: 'Italy', latitude: 45.6183, longitude: 9.2811 },
  { slug: 'baku', name: 'Baku City Circuit', country: 'Azerbaijan', latitude: 40.3725, longitude: 49.8533 },
  { slug: 'marina-bay', name: 'Marina Bay Street Circuit', country: 'Singapore', latitude: 1.2914, longitude: 103.864 },
  { slug: 'cota', name: 'Circuit of The Americas', country: 'USA', latitude: 30.1328, longitude: -97.6411 },
  { slug: 'mexico-city', name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', latitude: 19.4042, longitude: -99.0907 },
  { slug: 'interlagos', name: 'Autódromo José Carlos Pace', country: 'Brazil', latitude: -23.701, longitude: -46.6988 },
  { slug: 'las-vegas', name: 'Las Vegas Strip Circuit', country: 'USA', latitude: 36.1147, longitude: -115.173 },
  { slug: 'lusail', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542 },
  { slug: 'yas-marina', name: 'Yas Marina Circuit', country: 'UAE', latitude: 24.4672, longitude: 54.6031 },
];

// MotoGP 2025 calendar circuits
export const motogpCircuits: Circuit[] = [
  { slug: 'losail', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542 },
  { slug: 'portimao', name: 'Algarve International Circuit', country: 'Portugal', latitude: 37.2301, longitude: -8.6267 },
  { slug: 'cota-mgp', name: 'Circuit of The Americas', country: 'USA', latitude: 30.1328, longitude: -97.6411 },
  { slug: 'jerez', name: 'Circuito de Jerez', country: 'Spain', latitude: 36.7081, longitude: -6.0353 },
  { slug: 'lemans', name: 'Bugatti Circuit (Le Mans)', country: 'France', latitude: 47.955, longitude: 0.2243 },
  { slug: 'barcelona-mgp', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611 },
  { slug: 'mugello', name: 'Mugello Circuit', country: 'Italy', latitude: 43.9975, longitude: 11.3713 },
  { slug: 'assen', name: 'TT Circuit Assen', country: 'Netherlands', latitude: 52.9553, longitude: 6.5222 },
  { slug: 'sachsenring', name: 'Sachsenring', country: 'Germany', latitude: 50.7972, longitude: 12.6883 },
  { slug: 'silverstone-mgp', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142 },
  { slug: 'red-bull-ring-mgp', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647 },
  { slug: 'aragon', name: 'MotorLand Aragón', country: 'Spain', latitude: 41.227, longitude: -0.2089 },
  { slug: 'misano', name: 'Misano World Circuit', country: 'San Marino', latitude: 43.9947, longitude: 12.6928 },
  { slug: 'sokol', name: 'Sokol International Racetrack', country: 'Kazakhstan', latitude: 43.498, longitude: 77.116 },
  { slug: 'mandalika', name: 'Pertamina Mandalika International Circuit', country: 'Indonesia', latitude: -8.8441, longitude: 116.324 },
  { slug: 'motegi', name: 'Mobility Resort Motegi', country: 'Japan', latitude: 36.5319, longitude: 140.2279 },
  { slug: 'buriram', name: 'Chang International Circuit', country: 'Thailand', latitude: 15.2296, longitude: 103.0439 },
  { slug: 'phillip-island', name: 'Phillip Island', country: 'Australia', latitude: -38.5042, longitude: 145.237 },
  { slug: 'sepang', name: 'Sepang International Circuit', country: 'Malaysia', latitude: 2.7608, longitude: 101.7372 },
  { slug: 'valencia', name: 'Circuit Ricardo Tormo', country: 'Spain', latitude: 39.4895, longitude: -0.6262 },
];

export function getCircuitBySlug(slug: string, category: 'f1' | 'motogp') {
  try {
    console.log('getCircuitBySlug: Looking for', slug, 'in', category);
    
    if (!slug || typeof slug !== 'string') {
      console.error('getCircuitBySlug: Invalid slug provided:', slug);
      return null;
    }

    if (!category || (category !== 'f1' && category !== 'motogp')) {
      console.error('getCircuitBySlug: Invalid category provided:', category);
      return null;
    }

    const list = category === 'f1' ? f1Circuits : motogpCircuits;
    const circuit = list.find((c) => c.slug === slug);
    
    if (!circuit) {
      console.log('getCircuitBySlug: Circuit not found for slug:', slug, 'in category:', category);
      return null;
    }
    
    console.log('getCircuitBySlug: Found circuit:', circuit.name);
    return circuit;
  } catch (error) {
    console.error('getCircuitBySlug: Error during lookup:', error);
    return null;
  }
}

// Helper function to get all circuits
export function getAllCircuits(): { f1: Circuit[], motogp: Circuit[] } {
  return {
    f1: f1Circuits,
    motogp: motogpCircuits
  };
}

// Helper function to search circuits by name
export function searchCircuits(query: string, category?: 'f1' | 'motogp'): Circuit[] {
  try {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const circuits = category ? 
      (category === 'f1' ? f1Circuits : motogpCircuits) : 
      [...f1Circuits, ...motogpCircuits];

    return circuits.filter(circuit => 
      circuit.name.toLowerCase().includes(searchTerm) ||
      circuit.country.toLowerCase().includes(searchTerm) ||
      circuit.slug.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('searchCircuits: Error during search:', error);
    return [];
  }
}
