
export type Category = 'f1' | 'motogp' | 'indycar';

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

// Customize for some 2026-style weekends (others fall back to default templates)
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
  madrid: defaultF1Schedule, // New Madrid circuit uses standard schedule
  monaco: [
    { key: 'fp1', title: 'Free Practice 1', day: 'Fri', time: '13:30' },
    { key: 'fp2', title: 'Free Practice 2', day: 'Fri', time: '17:00' },
    { key: 'fp3', title: 'Free Practice 3', day: 'Sat', time: '12:30' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '16:00' },
    { key: 'race', title: 'Grand Prix', day: 'Sun', time: '15:00' },
  ],
};

const f1RaceDates: DateMap = {
  'albert-park': '2026-03-08',      // March 6-8 Australia Melbourne
  shanghai: '2026-03-15',           // March 13-15 China Shanghai
  suzuka: '2026-03-29',             // March 27-29 Japan Suzuka
  bahrain: '2026-04-12',            // April 10-12 Bahrain Sakhir
  jeddah: '2026-04-19',             // April 17-19 Saudi Arabia Jeddah
  miami: '2026-05-03',              // May 1-3 USA Miami
  'gilles-villeneuve': '2026-05-24', // May 22-24 Canada Montreal
  monaco: '2026-06-07',             // June 5-7 Monaco Monaco
  barcelona: '2026-06-14',          // June 12-14 Spain Barcelona-Catalunya
  'red-bull-ring': '2026-06-28',   // June 26-28 Austria Spielberg
  silverstone: '2026-07-05',       // July 3-5 Great Britain Silverstone
  spa: '2026-07-19',                // July 17-19 Belgium Spa-Francorchamps
  hungaroring: '2026-07-26',       // July 24-26 Hungary Budapest
  zandvoort: '2026-08-23',         // August 21-23 Netherlands Zandvoort
  monza: '2026-09-06',             // September 4-6 Italy Monza
  madrid: '2026-09-13',            // September 11-13 Spain Madrid
  baku: '2026-09-26',              // September 24-26 Azerbaijan Baku
  'marina-bay': '2026-10-11',      // October 9-11 Singapore Singapore
  cota: '2026-10-25',              // October 23-25 USA Austin
  'mexico-city': '2026-11-01',     // October 30 - November 1 Mexico Mexico City
  interlagos: '2026-11-08',        // November 6-8 Brazil Sao Paulo
  'las-vegas': '2026-11-21',       // November 19-21 USA Las Vegas
  lusail: '2026-11-29',            // November 27-29 Qatar Lusail
  'yas-marina': '2026-12-06',      // December 4-6 Abu Dhabi Yas Marina
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

const motogpRaceDates: DateMap = {
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

const defaultIndyCarSchedule: WeekendSession[] = [
  { key: 'p1', title: 'Practice 1', day: 'Fri', time: '12:00' },
  { key: 'p2', title: 'Practice 2', day: 'Fri', time: '16:00' },
  { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
  { key: 'race', title: 'Race', day: 'Sun', time: '15:00' },
];

const defaultIndyCarOvalSchedule: WeekendSession[] = [
  { key: 'p1', title: 'Practice 1', day: 'Fri', time: '12:00' },
  { key: 'p2', title: 'Practice 2', day: 'Sat', time: '10:00' },
  { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
  { key: 'race', title: 'Race', day: 'Sun', time: '15:00' },
];

const indycarSchedules: ScheduleMap = {
  'indianapolis-500': [
    { key: 'p1', title: 'Practice 1', day: 'Thu', time: '12:00' },
    { key: 'p2', title: 'Practice 2', day: 'Fri', time: '12:00' },
    { key: 'p3', title: 'Practice 3', day: 'Sat', time: '11:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '15:00' },
    { key: 'race', title: 'Indianapolis 500', day: 'Sun', time: '12:30' },
  ],
  // Other IndyCar rounds use defaults
};

const indycarRaceDates: DateMap = {
  'st-pete': '2026-03-08',
  'thermal': '2026-03-22',
  'long-beach': '2026-04-12',
  'barber': '2026-04-26',
  'indianapolis-gp': '2026-05-09',
  'indianapolis-500': '2026-05-24',
  'detroit': '2026-05-31',
  'road-america': '2026-06-21',
  'laguna-seca': '2026-06-28',
  'mid-ohio': '2026-07-05',
  'toronto': '2026-07-19',
  'iowa': '2026-07-26',
  'pocono': '2026-08-02',
  'gateway': '2026-08-23',
  'portland': '2026-08-30',
  'milwaukee': '2026-09-06',
  'nashville': '2026-09-13',
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
  const raceDate = category === 'f1' ? f1RaceDates[slug] : 
                   category === 'motogp' ? motogpRaceDates[slug] : 
                   indycarRaceDates[slug];
  if (!raceDate) return sessions; // fallback if unknown date
  return sessions.map((s) => ({ ...s, date: addDays(raceDate, dayOffsetFromSunday(s.day)) }));
}

export function getWeekendSchedule(slug: string, category: Category): WeekendSession[] {
  const sessions = category === 'f1' ? (f1Schedules[slug] || defaultF1Schedule) : 
                   category === 'motogp' ? (motogpSchedules[slug] || defaultMotoGPSchedule) :
                   (indycarSchedules[slug] || defaultIndyCarSchedule);
  return attachDates(slug, category, sessions);
}

export function getAllCalendarEvents(category: Category | 'all' = 'all', circuitLookup?: (slug: string, category: Category) => { name: string }) {
  const make = (cat: Category) => {
    const dates = cat === 'f1' ? f1RaceDates : 
                  cat === 'motogp' ? motogpRaceDates : 
                  indycarRaceDates;
    const allSlugs = Object.keys(dates);
    const col: CalendarEvent[] = [];
    for (const slug of allSlugs) {
      const base = cat === 'f1' ? (f1Schedules[slug] || defaultF1Schedule) : 
                   cat === 'motogp' ? (motogpSchedules[slug] || defaultMotoGPSchedule) :
                   (indycarSchedules[slug] || defaultIndyCarSchedule);
      const withDates = attachDates(slug, cat, base);
      for (const s of withDates) {
        const name = circuitLookup ? circuitLookup(slug, cat)?.name : slug;
        col.push({ ...s, circuitSlug: slug, category: cat, circuitName: name });
      }
    }
    return col;
  };

  if (category === 'all') {
    return [...make('f1'), ...make('motogp'), ...make('indycar')];
  }
  return make(category);
}

export { f1RaceDates, motogpRaceDates, indycarRaceDates };
