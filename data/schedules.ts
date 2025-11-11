
export type Category = 'f1' | 'motogp' | 'indycar' | 'nascar';

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

// Updated MotoGP race dates in the new order you specified
const motogpRaceDates: DateMap = {
  buriram: '2026-03-01',            // 1. Thai Grand Prix Buriram - 27 February - 1 March
  'interlagos-mgp': '2026-03-22',   // 2. Brazilian Grand Prix Ayrton Senna Circuit - 20-22 March
  'cota-mgp': '2026-03-29',         // 3. Americas Grand Prix Circuit of the Americas - 27-29 March
  losail: '2026-04-12',             // 4. Qatar Grand Prix Lusail - 10-12 April
  jerez: '2026-04-26',              // 5. Spanish Grand Prix Jerez - 24-26 April
  lemans: '2026-05-10',             // 6. French Grand Prix Le Mans - 8-10 May
  'barcelona-mgp': '2026-05-17',    // 7. Catalan Grand Prix Barcelona - 15-17 May
  mugello: '2026-05-31',            // 8. Italian Grand Prix Mugello - 29-31 May
  'balaton-park': '2026-06-07',     // 9. Hungarian Grand Prix Balaton Park - 5-7 June
  brno: '2026-06-21',               // 10. Czech Grand Prix Brno - 19-21 June
  assen: '2026-06-28',              // 11. Dutch Grand Prix Assen - 26-28 June
  sachsenring: '2026-07-12',       // 12. German Grand Prix Sachsenring - 10-12 July
  'silverstone-mgp': '2026-08-09',  // 13. British Grand Prix Silverstone - 7-9 August
  aragon: '2026-08-30',             // 14. Aragon Grand Prix Aragon - 28-30 August
  misano: '2026-09-13',             // 15. San Marino Grand Prix Misano - 11-13 September
  'red-bull-ring-mgp': '2026-09-20', // 16. Austrian Grand Prix Red Bull Ring - 18-20 September
  motegi: '2026-10-04',             // 17. Japanese Grand Prix Motegi - 2-4 October
  mandalika: '2026-10-11',          // 18. Indonesian Grand Prix Mandalika - 9-11 October
  'phillip-island': '2026-10-25',   // 19. Australian Grand Prix Phillip Island - 23-25 October
  sepang: '2026-11-01',             // 20. Malaysian Grand Prix Sepang - 30 October - 1 November
  portimao: '2026-11-15',           // 21. Portuguese Grand Prix Portimao - 13-15 November
  valencia: '2026-11-22',           // 22. Valencia Grand Prix Ricardo Tormo - 20-22 November
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
  'phoenix': [
    { key: 'p1', title: 'Practice 1', day: 'Fri', time: '12:00' },
    { key: 'p2', title: 'Practice 2', day: 'Fri', time: '16:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '12:00' },
    { key: 'race', title: 'Race', day: 'Sat', time: '20:00' },
  ],
  'milwaukee-1': [
    { key: 'p1', title: 'Practice 1', day: 'Fri', time: '12:00' },
    { key: 'p2', title: 'Practice 2', day: 'Fri', time: '16:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '12:00' },
    { key: 'race', title: 'Race 1', day: 'Sat', time: '15:00' },
  ],
  'milwaukee-2': [
    { key: 'warmup', title: 'Warm Up', day: 'Sun', time: '10:00' },
    { key: 'race', title: 'Race 2', day: 'Sun', time: '15:00' },
  ],
  // Other IndyCar rounds use defaults
};

const indycarRaceDates: DateMap = {
  'st-pete': '2026-03-01',           // Sunday, March 1 - Streets of St. Petersburg
  'phoenix': '2026-03-07',           // Saturday, March 7 - Phoenix Raceway
  'arlington': '2026-03-15',         // Sunday, March 15 - Streets of Arlington
  'barber': '2026-03-29',            // Sunday, March 29 - Barber Motorsports Park
  'long-beach': '2026-04-19',       // Sunday, April 19 - Streets of Long Beach
  'indianapolis-gp': '2026-05-09',  // Saturday, May 9 - Indianapolis Motor Speedway Road Course
  'indianapolis-500': '2026-05-24', // Sunday, May 24 - The 110th Indianapolis 500
  'detroit': '2026-05-31',          // Sunday, May 31 - Streets of Detroit
  'gateway': '2026-06-07',          // Sunday, June 7 - World Wide Technology Raceway
  'road-america': '2026-06-21',     // Sunday, June 21 - Road America
  'mid-ohio': '2026-07-05',         // Sunday, July 5 - Mid-Ohio Sports Car Course
  'nashville': '2026-07-19',        // Sunday, July 19 - Nashville Superspeedway
  'portland': '2026-08-09',         // Sunday, Aug. 9 - Portland International Raceway
  'markham': '2026-08-16',          // Sunday, Aug. 16 - Streets of Markham
  'milwaukee-1': '2026-08-29',      // Saturday, Aug. 29 - Milwaukee Mile Race 1
  'milwaukee-2': '2026-08-30',      // Sunday, Aug. 30 - Milwaukee Mile Race 2
  'laguna-seca': '2026-09-06',      // Sunday, Sept. 6 - WeatherTech Raceway Laguna Seca
};

const defaultNascarSchedule: WeekendSession[] = [
  { key: 'p1', title: 'Practice', day: 'Fri', time: '12:00' },
  { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
  { key: 'race', title: 'Race', day: 'Sun', time: '15:00' },
];

const nascarSchedules: ScheduleMap = {
  'daytona': [
    { key: 'p1', title: 'Practice', day: 'Fri', time: '12:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
    { key: 'race', title: 'Daytona 500', day: 'Sun', time: '14:30' },
  ],
  'charlotte-600': [
    { key: 'p1', title: 'Practice', day: 'Fri', time: '12:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
    { key: 'race', title: 'Coca-Cola 600', day: 'Sun', time: '18:00' },
  ],
  'indianapolis-nascar': [
    { key: 'p1', title: 'Practice', day: 'Fri', time: '12:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
    { key: 'race', title: 'Brickyard 400', day: 'Sun', time: '14:00' },
  ],
  'daytona-2': [
    { key: 'p1', title: 'Practice', day: 'Fri', time: '12:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
    { key: 'race', title: 'Coke Zero Sugar 400', day: 'Sat', time: '19:00' },
  ],
  'talladega-2': [
    { key: 'p1', title: 'Practice', day: 'Fri', time: '12:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
    { key: 'race', title: 'YellaWood 500', day: 'Sun', time: '14:00' },
  ],
  'phoenix-championship': [
    { key: 'p1', title: 'Practice', day: 'Fri', time: '12:00' },
    { key: 'qualifying', title: 'Qualifying', day: 'Sat', time: '14:00' },
    { key: 'race', title: 'Championship Race', day: 'Sun', time: '15:00' },
  ],
};

const nascarRaceDates: DateMap = {
  'daytona': '2026-02-15',              // February 15 - Daytona 500
  'atlanta': '2026-02-22',              // February 22 - Atlanta Motor Speedway
  'las-vegas-nascar': '2026-03-01',     // March 1 - Las Vegas Motor Speedway
  'phoenix-nascar': '2026-03-08',       // March 8 - Phoenix Raceway
  'cota-nascar': '2026-03-15',          // March 15 - Circuit of The Americas
  'richmond': '2026-03-22',             // March 22 - Richmond Raceway
  'martinsville': '2026-03-29',         // March 29 - Martinsville Speedway
  'texas': '2026-04-05',                // April 5 - Texas Motor Speedway
  'talladega': '2026-04-26',            // April 26 - Talladega Superspeedway
  'dover': '2026-05-03',                // May 3 - Dover Motor Speedway
  'kansas': '2026-05-10',               // May 10 - Kansas Speedway
  'darlington': '2026-05-17',           // May 17 - Darlington Raceway
  'charlotte-600': '2026-05-24',        // May 24 - Coca-Cola 600
  'gateway-nascar': '2026-06-07',       // June 7 - World Wide Technology Raceway
  'sonoma': '2026-06-14',               // June 14 - Sonoma Raceway
  'iowa': '2026-06-21',                 // June 21 - Iowa Speedway
  'chicago': '2026-06-28',              // June 28 - Chicago Street Course
  'pocono': '2026-07-12',               // July 12 - Pocono Raceway
  'indianapolis-nascar': '2026-07-19',  // July 19 - Brickyard 400
  'michigan': '2026-08-02',             // August 2 - Michigan International Speedway
  'daytona-2': '2026-08-22',            // August 22 - Coke Zero Sugar 400
  'watkins-glen': '2026-08-30',         // August 30 - Watkins Glen International
  'bristol': '2026-09-13',              // September 13 - Bristol Motor Speedway
  'new-hampshire': '2026-09-20',        // September 20 - New Hampshire Motor Speedway
  'charlotte-roval': '2026-09-27',      // September 27 - Charlotte ROVAL
  'homestead': '2026-10-04',            // October 4 - Homestead-Miami Speedway
  'las-vegas-nascar-2': '2026-10-11',   // October 11 - South Point 400
  'talladega-2': '2026-10-18',          // October 18 - YellaWood 500
  'charlotte-fall': '2026-10-25',       // October 25 - Bank of America ROVAL 400
  'homestead-2': '2026-11-01',          // November 1 - Dixie Vodka 400
  'martinsville-2': '2026-11-08',       // November 8 - Xfinity 500
  'phoenix-championship': '2026-11-15', // November 15 - Championship Race
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
                   category === 'indycar' ? indycarRaceDates[slug] :
                   nascarRaceDates[slug];
  if (!raceDate) return sessions; // fallback if unknown date
  return sessions.map((s) => ({ ...s, date: addDays(raceDate, dayOffsetFromSunday(s.day)) }));
}

export function getWeekendSchedule(slug: string, category: Category): WeekendSession[] {
  const sessions = category === 'f1' ? (f1Schedules[slug] || defaultF1Schedule) : 
                   category === 'motogp' ? (motogpSchedules[slug] || defaultMotoGPSchedule) :
                   category === 'indycar' ? (indycarSchedules[slug] || defaultIndyCarSchedule) :
                   (nascarSchedules[slug] || defaultNascarSchedule);
  return attachDates(slug, category, sessions);
}

export function getAllCalendarEvents(category: Category | 'all' = 'all', circuitLookup?: (slug: string, category: Category) => { name: string }) {
  const make = (cat: Category) => {
    const dates = cat === 'f1' ? f1RaceDates : 
                  cat === 'motogp' ? motogpRaceDates : 
                  cat === 'indycar' ? indycarRaceDates :
                  nascarRaceDates;
    const allSlugs = Object.keys(dates);
    const col: CalendarEvent[] = [];
    for (const slug of allSlugs) {
      const base = cat === 'f1' ? (f1Schedules[slug] || defaultF1Schedule) : 
                   cat === 'motogp' ? (motogpSchedules[slug] || defaultMotoGPSchedule) :
                   cat === 'indycar' ? (indycarSchedules[slug] || defaultIndyCarSchedule) :
                   (nascarSchedules[slug] || defaultNascarSchedule);
      const withDates = attachDates(slug, cat, base);
      for (const s of withDates) {
        const name = circuitLookup ? circuitLookup(slug, cat)?.name : slug;
        col.push({ ...s, circuitSlug: slug, category: cat, circuitName: name });
      }
    }
    return col;
  };

  if (category === 'all') {
    return [...make('f1'), ...make('motogp'), ...make('indycar'), ...make('nascar')];
  }
  return make(category);
}

export { f1RaceDates, motogpRaceDates, indycarRaceDates, nascarRaceDates };
