
import { Circuit } from '../components/CircuitCard';

// F2 2026 calendar circuits (follows F1 calendar closely)
export const f2Circuits: Circuit[] = [
  { slug: 'bahrain-f2', name: 'Bahrain International Circuit', country: 'Bahrain', latitude: 26.0325, longitude: 50.5106 },
  { slug: 'jeddah-f2', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', latitude: 21.6319, longitude: 39.1044 },
  { slug: 'albert-park-f2', name: 'Albert Park Circuit', country: 'Australia', latitude: -37.8497, longitude: 144.968 },
  { slug: 'miami-f2', name: 'Miami International Autodrome', country: 'USA', latitude: 25.958, longitude: -80.2389 },
  { slug: 'monaco-f2', name: 'Circuit de Monaco', country: 'Monaco', latitude: 43.7347, longitude: 7.4206 },
  { slug: 'barcelona-f2', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611 },
  { slug: 'red-bull-ring-f2', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647 },
  { slug: 'silverstone-f2', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142 },
  { slug: 'spa-f2', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', latitude: 50.4372, longitude: 5.9714 },
  { slug: 'hungaroring-f2', name: 'Hungaroring', country: 'Hungary', latitude: 47.5789, longitude: 19.2486 },
  { slug: 'monza-f2', name: 'Monza - Autodromo Nazionale', country: 'Italy', latitude: 45.6183, longitude: 9.2811 },
  { slug: 'baku-f2', name: 'Baku City Circuit', country: 'Azerbaijan', latitude: 40.3725, longitude: 49.8533 },
  { slug: 'lusail-f2', name: 'Lusail International Circuit', country: 'Qatar', latitude: 25.4889, longitude: 51.4542 },
  { slug: 'yas-marina-f2', name: 'Yas Marina Circuit', country: 'UAE', latitude: 24.4672, longitude: 54.6031 },
];

// F3 2026 calendar circuits (follows F1 calendar closely)
export const f3Circuits: Circuit[] = [
  { slug: 'bahrain-f3', name: 'Bahrain International Circuit', country: 'Bahrain', latitude: 26.0325, longitude: 50.5106 },
  { slug: 'albert-park-f3', name: 'Albert Park Circuit', country: 'Australia', latitude: -37.8497, longitude: 144.968 },
  { slug: 'miami-f3', name: 'Miami International Autodrome', country: 'USA', latitude: 25.958, longitude: -80.2389 },
  { slug: 'monaco-f3', name: 'Circuit de Monaco', country: 'Monaco', latitude: 43.7347, longitude: 7.4206 },
  { slug: 'barcelona-f3', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', latitude: 41.57, longitude: 2.2611 },
  { slug: 'red-bull-ring-f3', name: 'Red Bull Ring', country: 'Austria', latitude: 47.2197, longitude: 14.7647 },
  { slug: 'silverstone-f3', name: 'Silverstone Circuit', country: 'UK', latitude: 52.0733, longitude: -1.0142 },
  { slug: 'spa-f3', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', latitude: 50.4372, longitude: 5.9714 },
  { slug: 'hungaroring-f3', name: 'Hungaroring', country: 'Hungary', latitude: 47.5789, longitude: 19.2486 },
  { slug: 'monza-f3', name: 'Monza - Autodromo Nazionale', country: 'Italy', latitude: 45.6183, longitude: 9.2811 },
];

// F2 race dates for 2026
export const f2RaceDates: Record<string, string> = {
  'bahrain-f2': '2026-04-12',
  'jeddah-f2': '2026-04-19',
  'albert-park-f2': '2026-03-08',
  'miami-f2': '2026-05-03',
  'monaco-f2': '2026-06-07',
  'barcelona-f2': '2026-06-14',
  'red-bull-ring-f2': '2026-06-28',
  'silverstone-f2': '2026-07-05',
  'spa-f2': '2026-07-19',
  'hungaroring-f2': '2026-07-26',
  'monza-f2': '2026-09-06',
  'baku-f2': '2026-09-26',
  'lusail-f2': '2026-11-29',
  'yas-marina-f2': '2026-12-06',
};

// F3 race dates for 2026
export const f3RaceDates: Record<string, string> = {
  'bahrain-f3': '2026-04-12',
  'albert-park-f3': '2026-03-08',
  'miami-f3': '2026-05-03',
  'monaco-f3': '2026-06-07',
  'barcelona-f3': '2026-06-14',
  'red-bull-ring-f3': '2026-06-28',
  'silverstone-f3': '2026-07-05',
  'spa-f3': '2026-07-19',
  'hungaroring-f3': '2026-07-26',
  'monza-f3': '2026-09-06',
};

export function getF2F3CircuitBySlug(slug: string, category: 'f2' | 'f3') {
  const list = category === 'f2' ? f2Circuits : f3Circuits;
  const hit = list.find((c) => c.slug === slug);
  if (!hit) {
    console.log('F2/F3 Circuit not found', slug, category);
    return list[0];
  }
  return hit;
}
