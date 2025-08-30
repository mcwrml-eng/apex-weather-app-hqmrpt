
export type Category = 'f1' | 'motogp';

export interface WeekendSession {
  key: string;
  title: string;
  day: 'Fri' | 'Sat' | 'Sun' | 'Thu';
  time: string; // local time string e.g. '10:00'
  date?: string; // YYYY-MM-DD
}

export interface CalendarEvent extends WeekendSession {
  category: Category;
  circuitSlug: string;
  circuitName: string;
}

type ScheduleMap = Record<string, WeekendSession[]>;

type DateMap = Record<string, string>; // slug -> race Sunday date (YYYY-MM-DD)

// Default templates
const defaultF1Schedule: WeekendSession[] = [
  { key: 'fp1', title: 'Free Practice 1', day: 'Fri', time: '12:30' },
  { key: 'fp2', title: 'Free Practice 2', day: 'Fri', time: '16:00' },
  { key: 'fp3', title: 'Free Practice 3', day: 'Sat', time: '11:30' },
  { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '15:00' },
  { key: 'race', title: 'Grand Prix', day: 'Sun', time: '15:00' },
];

const defaultF1SprintSchedule: WeekendSession[] = [
  { key: 'fp1', title: 'Free Practice 1', day: 'Fri', time: '12:30' },
  { key: 'sprint-qual', title: 'Sprint Shootout', day: 'Fri', time: '16:00' },
  { key: 'sprint', title: 'Sprint', day: 'Sat', time: '12:00' },
  { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '16:00' },
  { key: 'race', title: 'Grand Prix', day: 'Sun', time: '15:00' },
];

// Customize for some 2025-style weekends (others fall back to default templates)
const f1Schedules: ScheduleMap = {
  bahrain: [
    { key: 'fp1', title: 'Free Practice 1', day: 'Fri', time: '13:30' },
    { key: 'fp2', title: 'Free Practice 2', day: 'Fri', time: '17:00' },
    { key: 'fp3', title: 'Free Practice 3', day: 'Sat', time: '13:30' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '17:00' },
    { key: 'race', title: 'Grand Prix (Night)', day: 'Sun', time: '18:00' },
  ],
  jeddah: defaultF1SprintSchedule,
  shanghai: defaultF1SprintSchedule,
  miami: defaultF1SprintSchedule,
  'red-bull-ring': defaultF1SprintSchedule,
  cota: defaultF1SprintSchedule,
  interlagos: defaultF1SprintSchedule,
  lusail: defaultF1SprintSchedule,
  monaco: [
    { key: 'fp1', title: 'Free Practice 1', day: 'Fri', time: '13:30' },
    { key: 'fp2', title: 'Free Practice 2', day: 'Fri', time: '17:00' },
    { key: 'fp3', title: 'Free Practice 3', day: 'Sat', time: '12:30' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '16:00' },
    { key: 'race', title: 'Grand Prix', day: 'Sun', time: '15:00' },
  ],
};

export const f1RaceDates: DateMap = {
  bahrain: '2025-03-16',
  jeddah: '2025-03-23',
  'albert-park': '2025-03-30',
  suzuka: '2025-04-13',
  shanghai: '2025-04-20',
  miami: '2025-05-04',
  imola: '2025-05-18',
  monaco: '2025-05-25',
  barcelona: '2025-06-01',
  'gilles-villeneuve': '2025-06-15',
  'red-bull-ring': '2025-06-29',
  silverstone: '2025-07-06',
  hungaroring: '2025-07-20',
  spa: '2025-07-27',
  zandvoort: '2025-08-24',
  monza: '2025-08-31',
  baku: '2025-09-14',
  'marina-bay': '2025-09-21',
  cota: '2025-10-19',
  'mexico-city': '2025-10-26',
  interlagos: '2025-11-09',
  'las-vegas': '2025-11-22',
  lusail: '2025-11-30',
  'yas-marina': '2025-12-07',
};

const defaultMotoGPSchedule: WeekendSession[] = [
  { key: 'p1', title: 'Practice 1', day: 'Fri', time: '10:00' },
  { key: 'p2', title: 'Practice 2', day: 'Fri', time: '14:00' },
  { key: 'p3', title: 'Practice 3', day: 'Sat', time: '09:30' },
  { key: 'q1', title: 'Qualifying 1', day: 'Sat', time: '11:00' },
  { key: 'q2', title: 'Qualifying 2', day: 'Sat', time: '11:25' },
  { key: 'sprint', title: 'Sprint', day: 'Sat', time: '15:00' },
  { key: 'warmup', title: 'Warm Up', day: 'Sun', time: '10:30' },
  { key: 'race', title: 'Grand Prix', day: 'Sun', time: '14:00' },
];

const motogpSchedules: ScheduleMap = {
  losail: [
    { key: 'p1', title: 'Practice 1', day: 'Fri', time: '12:00' },
    { key: 'p2', title: 'Practice 2 (Night)', day: 'Fri', time: '18:00' },
    { key: 'q1', title: 'Qualifying 1', day: 'Sat', time: '15:00' },
    { key: 'q2', title: 'Qualifying 2', day: 'Sat', time: '15:25' },
    { key: 'sprint', title: 'Sprint', day: 'Sat', time: '19:00' },
    { key: 'warmup', title: 'Warm Up', day: 'Sun', time: '14:00' },
    { key: 'race', title: 'Grand Prix (Night)', day: 'Sun', time: '19:00' },
  ],
  // Other MotoGP rounds use defaults; times vary per venue in reality.
};

export const motogpRaceDates: DateMap = {
  losail: '2025-03-09',
  portimao: '2025-03-23',
  'cota-mgp': '2025-04-06',
  jerez: '2025-04-13',
  lemans: '2025-05-11',
  'barcelona-mgp': '2025-05-25',
  mugello: '2025-06-01',
  assen: '2025-06-29',
  sachsenring: '2025-07-06',
  'silverstone-mgp': '2025-08-03',
  'red-bull-ring-mgp': '2025-08-17',
  aragon: '2025-08-31',
  misano: '2025-09-07',
  sokol: '2025-09-21',
  mandalika: '2025-10-05',
  motegi: '2025-10-12',
  buriram: '2025-10-19',
  'phillip-island': '2025-10-26',
  sepang: '2025-11-09',
  valencia: '2025-11-16',
};

function addDays(isoDate: string, days: number) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayOffsetFromSunday(day: WeekendSession['day']) {
  switch (day) {
    case 'Thu':
      return -3;
    case 'Fri':
      return -2;
    case 'Sat':
      return -1;
    case 'Sun':
    default:
      return 0;
  }
}

function attachDates(slug: string, category: Category, sessions: WeekendSession[]): WeekendSession[] {
  const raceDate = category === 'f1' ? f1RaceDates[slug] : motogpRaceDates[slug];
  if (!raceDate) return sessions; // fallback if unknown date
  return sessions.map((s) => ({ ...s, date: addDays(raceDate, dayOffsetFromSunday(s.day)) }));
}

export function getWeekendSchedule(slug: string, category: Category): WeekendSession[] {
  const sessions = category === 'f1' ? (f1Schedules[slug] || defaultF1Schedule) : (motogpSchedules[slug] || defaultMotoGPSchedule);
  return attachDates(slug, category, sessions);
}

export function getAllCalendarEvents(category: Category | 'all' = 'all', circuitLookup?: (slug: string, category: Category) => { name: string }) {
  const make = (cat: Category) => {
    const dates = cat === 'f1' ? f1RaceDates : motogpRaceDates;
    const allSlugs = Object.keys(dates);
    const col: CalendarEvent[] = [];
    for (const slug of allSlugs) {
      const base = cat === 'f1' ? (f1Schedules[slug] || defaultF1Schedule) : (motogpSchedules[slug] || defaultMotoGPSchedule);
      const withDates = attachDates(slug, cat, base);
      for (const s of withDates) {
        const name = circuitLookup ? circuitLookup(slug, cat)?.name : slug;
        col.push({ ...s, circuitSlug: slug, category: cat, circuitName: name });
      }
    }
    return col;
  };

  if (category === 'all') {
    return [...make('f1'), ...make('motogp')];
  }
  return make(category);
}
