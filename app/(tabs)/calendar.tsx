
import { Redirect } from 'expo-router';

// Calendar functionality has been removed
// Redirect to F1 tab instead
export default function CalendarScreen() {
  return <Redirect href="/f1" />;
}
