
import { f1RaceDates, motogpRaceDates, indycarRaceDates, nascarRaceDates } from '../data/schedules';

export type Category = 'f1' | 'motogp' | 'indycar' | 'nascar';

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
         category === 'indycar' ? indycarRaceDates :
         nascarRaceDates;
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
    // Original logic for F1, IndyCar, and NASCAR
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

// Get status text for the track - returns a key for translation
export function getTrackStatusKey(trackOfWeek: TrackOfWeek): { key: string; days?: number; months?: number } {
  const { daysUntilRace, isRaceWeek, category } = trackOfWeek;
  
  if (daysUntilRace === 0) {
    return { key: 'race_day' };
  } else if (daysUntilRace === 1) {
    return { key: 'tomorrow' };
  } else if (daysUntilRace === -1) {
    return { key: 'yesterday' };
  } else if (isRaceWeek && daysUntilRace > 0) {
    return { key: 'days_to_go', days: daysUntilRace };
  } else if (daysUntilRace > 0) {
    // For MotoGP, always show days instead of months
    if (category === 'motogp') {
      return { key: 'next_race_in_days', days: daysUntilRace };
    }
    
    // For F1, IndyCar, and NASCAR, show months for longer periods
    if (daysUntilRace > 30) {
      const months = Math.floor(daysUntilRace / 30);
      if (months === 1) {
        return { key: 'next_race_in_month' };
      } else if (months < 12) {
        return { key: 'next_race_in_months', months };
      } else {
        return { key: 'next_race_2026' };
      }
    }
    return { key: 'next_race_in_days', days: daysUntilRace };
  } else {
    return { key: 'recently_completed' };
  }
}

// Get status text for the track (for backward compatibility)
export function getTrackStatusText(trackOfWeek: TrackOfWeek): string {
  const { daysUntilRace, isRaceWeek, category } = trackOfWeek;
  
  if (daysUntilRace === 0) {
    return 'Race Day!';
  } else if (daysUntilRace === 1) {
    return 'Tomorrow';
  } else if (daysUntilRace === -1) {
    return 'Yesterday';
  } else if (isRaceWeek && daysUntilRace > 0) {
    return `${daysUntilRace} days to go`;
  } else if (daysUntilRace > 0) {
    // For MotoGP, always show days instead of months
    if (category === 'motogp') {
      return `Next race in ${daysUntilRace} days`;
    }
    
    // For F1, IndyCar, and NASCAR, show months for longer periods
    if (daysUntilRace > 30) {
      const months = Math.floor(daysUntilRace / 30);
      if (months === 1) {
        return 'Next race in about 1 month';
      } else if (months < 12) {
        return `Next race in about ${months} months`;
      } else {
        return 'Next race in 2026 season';
      }
    }
    return `Next race in ${daysUntilRace} days`;
  } else {
    return 'Recently completed';
  }
}
