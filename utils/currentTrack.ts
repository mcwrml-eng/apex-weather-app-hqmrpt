
import { f1RaceDates, motogpRaceDates, indycarRaceDates } from '../data/schedules';

export type Category = 'f1' | 'motogp' | 'indycar';

interface TrackOfWeek {
  slug: string;
  category: Category;
  raceDate: string;
  daysUntilRace: number;
  isRaceWeek: boolean;
}

// Get the race dates for a category
function getRaceDates(category: Category): Record<string, string> {
  return category === 'f1' ? f1RaceDates : 
         category === 'motogp' ? motogpRaceDates : 
         indycarRaceDates;
}

// Calculate days between two dates
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get the current track of the week for a category
export function getCurrentTrackOfWeek(category: Category): TrackOfWeek | null {
  console.log('getCurrentTrackOfWeek: Getting current track for', category);
  
  const raceDates = getRaceDates(category);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  let closestTrack: TrackOfWeek | null = null;
  let minDaysUntilRace = Infinity;
  
  // For MotoGP in 2026, always show the next upcoming race
  if (category === 'motogp') {
    // Find the next race in 2026
    for (const [slug, dateString] of Object.entries(raceDates)) {
      const raceDate = new Date(dateString + 'T00:00:00');
      const daysUntilRace = daysBetween(today, raceDate);
      
      // For 2026 races, find the next upcoming one (even if it's far in the future)
      if (daysUntilRace >= 0 && daysUntilRace < minDaysUntilRace) {
        const isRaceWeek = daysUntilRace >= -1 && daysUntilRace <= 7;
        closestTrack = {
          slug,
          category,
          raceDate: dateString,
          daysUntilRace,
          isRaceWeek
        };
        minDaysUntilRace = daysUntilRace;
      }
    }
    
    // If no future race found (all races have passed), show the first race of the season
    if (!closestTrack) {
      const sortedRaces = Object.entries(raceDates).sort(([, a], [, b]) => a.localeCompare(b));
      if (sortedRaces.length > 0) {
        const [slug, dateString] = sortedRaces[0];
        const raceDate = new Date(dateString + 'T00:00:00');
        const daysUntilRace = daysBetween(today, raceDate);
        closestTrack = {
          slug,
          category,
          raceDate: dateString,
          daysUntilRace,
          isRaceWeek: false
        };
      }
    }
  } else {
    // Original logic for F1 and IndyCar
    for (const [slug, dateString] of Object.entries(raceDates)) {
      const raceDate = new Date(dateString + 'T00:00:00');
      const daysUntilRace = daysBetween(today, raceDate);
      
      // Consider it "race week" if it's within 7 days before the race or 1 day after
      const isRaceWeek = daysUntilRace >= -1 && daysUntilRace <= 7;
      
      // If we're in race week, prioritize this track
      if (isRaceWeek && daysUntilRace < minDaysUntilRace) {
        closestTrack = {
          slug,
          category,
          raceDate: dateString,
          daysUntilRace,
          isRaceWeek: true
        };
        minDaysUntilRace = daysUntilRace;
      }
      // If no race week found yet, find the next upcoming race
      else if (!closestTrack?.isRaceWeek && daysUntilRace >= 0 && daysUntilRace < minDaysUntilRace) {
        closestTrack = {
          slug,
          category,
          raceDate: dateString,
          daysUntilRace,
          isRaceWeek: false
        };
        minDaysUntilRace = daysUntilRace;
      }
    }
  }
  
  console.log('getCurrentTrackOfWeek: Found track', closestTrack?.slug, 'for', category, 'days until race:', closestTrack?.daysUntilRace);
  return closestTrack;
}

// Get status text for the track
export function getTrackStatusText(trackOfWeek: TrackOfWeek): string {
  const { daysUntilRace, isRaceWeek } = trackOfWeek;
  
  if (daysUntilRace === 0) {
    return 'Race Day!';
  } else if (daysUntilRace === 1) {
    return 'Tomorrow';
  } else if (daysUntilRace === -1) {
    return 'Yesterday';
  } else if (isRaceWeek && daysUntilRace > 0) {
    return `${daysUntilRace} days to go`;
  } else if (daysUntilRace > 0) {
    // Always show days for all categories instead of months
    return `Next race in ${daysUntilRace} days`;
  } else {
    return 'Recently completed';
  }
}
