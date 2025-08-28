
export type Category = 'f1' | 'motogp';

export interface WeekendSession {
  key: string;
  title: string;
  day: 'Fri' | 'Sat' | 'Sun' | 'Thu';
  time: string; // local time string e.g. '10:00'
}

type ScheduleMap = Record<string, WeekendSession[]>;

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

export function getWeekendSchedule(slug: string, category: Category): WeekendSession[] {
  if (category === 'f1') {
    return f1Schedules[slug] || defaultF1Schedule;
  }
  return motogpSchedules[slug] || defaultMotoGPSchedule;
}
