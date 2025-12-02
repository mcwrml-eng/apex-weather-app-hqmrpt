
import { Circuit } from '../components/CircuitCard';

// Extended Circuit interface with track direction
export interface CircuitWithDirection extends Circuit {
  trackDirection?: number; // Main straight direction in degrees (0-360)
}

// F2 2026 calendar circuits (follows F1 calendar closely)
export const f2Circuits: CircuitWithDirection[] = [
  { slug: 'albert-park-f2', name: 'Albert Park Circuit', country: 'Australia', latitude: -37.8497, longitude: 144.968, trackDirection: 180 },
  { slug: 'bahrain-f2', name: 'Bahrain International Circuit', country: 'Bahrain', latitude: 26.0325, longitude: 50.5106, trackDirection: 0 },
  { slug: 'jeddah-f2', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', latitude: 21.6319, longitude: 39.1044, trackDirection: 315 },
  { slug: 'monaco-f2', name: 'Circuit de Monaco', country: 'Monaco', latitude: 43.7347, longitude: 7.4206, trackDirection: 90 },
  { slug: 'barcelona-f2', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611, trackDirection: 0 },
  { slug: 'red-bull-ring-f2', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647, trackDirection: 45 },
  { slug: 'silverstone-f2', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142, trackDirection: 180 },
  { slug: 'spa-f2', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', latitude: 50.4372, longitude: 5.9714, trackDirection: 270 },
  { slug: 'hungaroring-f2', name: 'Hungaroring', country: 'Hungary', latitude: 47.5789, longitude: 19.2486, trackDirection: 135 },
  { slug: 'monza-f2', name: 'Monza - Autodromo Nazionale', country: 'Italy', latitude: 45.6183, longitude: 9.2811, trackDirection: 0 },
  { slug: 'madrid-ring-f2', name: 'Madrid Ring', country: 'Spain', latitude: 40.4168, longitude: -3.7038, trackDirection: 90 },
  { slug: 'baku-f2', name: 'Baku City Circuit', country: 'Azerbaijan', latitude: 40.3725, longitude: 49.8533, trackDirection: 180 },
  { slug: 'lusail-f2', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542, trackDirection: 180 },
  { slug: 'yas-marina-f2', name: 'Yas Marina Circuit', country: 'UAE', latitude: 24.4672, longitude: 54.6031, trackDirection: 270 },
];

// F3 2026 calendar circuits (follows F1 calendar closely)
export const f3Circuits: CircuitWithDirection[] = [
  { slug: 'albert-park-f3', name: 'Albert Park Circuit', country: 'Australia', latitude: -37.8497, longitude: 144.968, trackDirection: 180 },
  { slug: 'bahrain-f3', name: 'Bahrain International Circuit', country: 'Bahrain', latitude: 26.0325, longitude: 50.5106, trackDirection: 0 },
  { slug: 'monaco-f3', name: 'Circuit de Monaco', country: 'Monaco', latitude: 43.7347, longitude: 7.4206, trackDirection: 90 },
  { slug: 'barcelona-f3', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611, trackDirection: 0 },
  { slug: 'red-bull-ring-f3', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647, trackDirection: 45 },
  { slug: 'silverstone-f3', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142, trackDirection: 180 },
  { slug: 'spa-f3', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', latitude: 50.4372, longitude: 5.9714, trackDirection: 270 },
  { slug: 'hungaroring-f3', name: 'Hungaroring', country: 'Hungary', latitude: 47.5789, longitude: 19.2486, trackDirection: 135 },
  { slug: 'monza-f3', name: 'Monza - Autodromo Nazionale', country: 'Italy', latitude: 45.6183, longitude: 9.2811, trackDirection: 0 },
  { slug: 'madrid-ring-f3', name: 'Madrid Ring', country: 'Spain', latitude: 40.4168, longitude: -3.7038, trackDirection: 90 },
];

// F2 race dates for 2026
export const f2RaceDates: Record<string, string> = {
  'albert-park-f2': '2026-03-08',
  'bahrain-f2': '2026-04-12',
  'jeddah-f2': '2026-04-19',
  'monaco-f2': '2026-06-07',
  'barcelona-f2': '2026-06-14',
  'red-bull-ring-f2': '2026-06-28',
  'silverstone-f2': '2026-07-05',
  'spa-f2': '2026-07-19',
  'hungaroring-f2': '2026-07-26',
  'monza-f2': '2026-09-06',
  'madrid-ring-f2': '2026-09-20',
  'baku-f2': '2026-09-26',
  'lusail-f2': '2026-11-29',
  'yas-marina-f2': '2026-12-06',
};

// F3 race dates for 2026
export const f3RaceDates: Record<string, string> = {
  'albert-park-f3': '2026-03-08',
  'bahrain-f3': '2026-04-12',
  'monaco-f3': '2026-06-07',
  'barcelona-f3': '2026-06-14',
  'red-bull-ring-f3': '2026-06-28',
  'silverstone-f3': '2026-07-05',
  'spa-f3': '2026-07-19',
  'hungaroring-f3': '2026-07-26',
  'monza-f3': '2026-09-06',
  'madrid-ring-f3': '2026-09-13',
};

export function getF2F3CircuitBySlug(slug: string, category: 'f2' | 'f3'): CircuitWithDirection {
  const list = category === 'f2' ? f2Circuits : f3Circuits;
  const hit = list.find((c) => c.slug === slug);
  if (!hit) {
    console.log('F2/F3 Circuit not found', slug, category);
    return list[0];
  }
  return hit;
}
