
import { Circuit } from '../components/CircuitCard';

export const f1Circuits: Circuit[] = [
  { slug: 'bahrain', name: 'Bahrain International Circuit', country: 'Bahrain', latitude: 26.0325, longitude: 50.5106 },
  { slug: 'jeddah', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', latitude: 21.6319, longitude: 39.1044 },
  { slug: 'albert-park', name: 'Albert Park Circuit', country: 'Australia', latitude: -37.8497, longitude: 144.968 },
  { slug: 'suzuka', name: 'Suzuka Circuit', country: 'Japan', latitude: 34.8431, longitude: 136.5419 },
  { slug: 'shanghai', name: 'Shanghai International Circuit', country: 'China', latitude: 31.3389, longitude: 121.2206 },
  { slug: 'imola', name: 'Imola - Autodromo Enzo e Dino Ferrari', country: 'Italy', latitude: 44.3439, longitude: 11.7167 },
  { slug: 'monaco', name: 'Circuit de Monaco', country: 'Monaco', latitude: 43.7347, longitude: 7.4206 },
  { slug: 'barcelona', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611 },
  { slug: 'red-bull-ring', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647 },
  { slug: 'silverstone', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142 },
  { slug: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', latitude: 50.4372, longitude: 5.9714 },
  { slug: 'monza', name: 'Monza - Autodromo Nazionale', country: 'Italy', latitude: 45.6183, longitude: 9.2811 },
  { slug: 'cota', name: 'Circuit of The Americas', country: 'USA', latitude: 30.1328, longitude: -97.6411 },
  { slug: 'interlagos', name: 'Autódromo José Carlos Pace', country: 'Brazil', latitude: -23.701, longitude: -46.6988 },
  { slug: 'yas-marina', name: 'Yas Marina Circuit', country: 'UAE', latitude: 24.4672, longitude: 54.6031 },
];

export const motogpCircuits: Circuit[] = [
  { slug: 'losail', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542 },
  { slug: 'portimao', name: 'Algarve International Circuit', country: 'Portugal', latitude: 37.2301, longitude: -8.6267 },
  { slug: 'jerez', name: 'Circuito de Jerez', country: 'Spain', latitude: 36.7081, longitude: -6.0353 },
  { slug: 'lemans', name: 'Bugatti Circuit (Le Mans)', country: 'France', latitude: 47.955, longitude: 0.2243 },
  { slug: 'mugello', name: 'Mugello Circuit', country: 'Italy', latitude: 43.9975, longitude: 11.3713 },
  { slug: 'assen', name: 'TT Circuit Assen', country: 'Netherlands', latitude: 52.9553, longitude: 6.5222 },
  { slug: 'sachsenring', name: 'Sachsenring', country: 'Germany', latitude: 50.7972, longitude: 12.6883 },
  { slug: 'silverstone-mgp', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142 },
  { slug: 'misano', name: 'Misano World Circuit', country: 'San Marino', latitude: 43.9947, longitude: 12.6928 },
  { slug: 'phillip-island', name: 'Phillip Island', country: 'Australia', latitude: -38.5042, longitude: 145.237 },
  { slug: 'sepang', name: 'Sepang International Circuit', country: 'Malaysia', latitude: 2.7608, longitude: 101.7372 },
  { slug: 'valencia', name: 'Circuit Ricardo Tormo', country: 'Spain', latitude: 39.4895, longitude: -0.6262 },
];

export function getCircuitBySlug(slug: string, category: 'f1' | 'motogp') {
  const list = category === 'f1' ? f1Circuits : motogpCircuits;
  const hit = list.find((c) => c.slug === slug);
  if (!hit) {
    console.log('Circuit not found', slug, category);
    return list[0];
  }
  return hit;
}
