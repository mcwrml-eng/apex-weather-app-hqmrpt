
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVOURITES_STORAGE_KEY = '@motorsport_weather_favourites';

export interface FavouriteLocation {
  id: string;
  type: 'circuit' | 'custom';
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  category?: 'f1' | 'f2' | 'f3' | 'motogp' | 'indycar' | 'nascar';
  slug?: string;
  addedAt: number;
}

export async function getFavourites(): Promise<FavouriteLocation[]> {
  try {
    console.log('Favourites Utils: Getting favourites from storage');
    const stored = await AsyncStorage.getItem(FAVOURITES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Favourites Utils: Found', parsed.length, 'favourites');
      return parsed;
    }
    console.log('Favourites Utils: No favourites found');
    return [];
  } catch (error) {
    console.error('Favourites Utils: Error loading favourites:', error);
    return [];
  }
}

export async function addFavourite(favourite: Omit<FavouriteLocation, 'addedAt'>): Promise<boolean> {
  try {
    console.log('Favourites Utils: Adding favourite:', favourite.id, favourite.name);
    const favourites = await getFavourites();
    
    // Check if already exists
    const exists = favourites.some(fav => fav.id === favourite.id);
    if (exists) {
      console.log('Favourites Utils: Already exists:', favourite.id);
      return false;
    }
    
    const newFavourite: FavouriteLocation = {
      ...favourite,
      addedAt: Date.now(),
    };
    
    const updated = [...favourites, newFavourite];
    await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(updated));
    console.log('Favourites Utils: Added successfully. Total favourites:', updated.length);
    return true;
  } catch (error) {
    console.error('Favourites Utils: Error adding favourite:', error);
    return false;
  }
}

export async function removeFavourite(id: string): Promise<boolean> {
  try {
    console.log('Favourites Utils: Removing favourite:', id);
    const favourites = await getFavourites();
    const beforeCount = favourites.length;
    const updated = favourites.filter(fav => fav.id !== id);
    const afterCount = updated.length;
    
    await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(updated));
    console.log('Favourites Utils: Removed successfully. Before:', beforeCount, 'After:', afterCount);
    return true;
  } catch (error) {
    console.error('Favourites Utils: Error removing favourite:', error);
    return false;
  }
}

export async function removeAllFavourites(): Promise<boolean> {
  try {
    console.log('Favourites Utils: Removing all favourites');
    await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify([]));
    console.log('Favourites Utils: Removed all favourites successfully');
    return true;
  } catch (error) {
    console.error('Favourites Utils: Error removing all favourites:', error);
    return false;
  }
}

export async function isFavourite(id: string): Promise<boolean> {
  try {
    const favourites = await getFavourites();
    const result = favourites.some(fav => fav.id === id);
    console.log('Favourites Utils: Checking if favourite:', id, 'Result:', result);
    return result;
  } catch (error) {
    console.error('Favourites Utils: Error checking favourite:', error);
    return false;
  }
}

export async function toggleFavourite(favourite: Omit<FavouriteLocation, 'addedAt'>): Promise<boolean> {
  try {
    console.log('Favourites Utils: Toggling favourite:', favourite.id, favourite.name);
    const isCurrentlyFavourite = await isFavourite(favourite.id);
    
    if (isCurrentlyFavourite) {
      await removeFavourite(favourite.id);
      console.log('Favourites Utils: Removed from favourites');
      return false;
    } else {
      await addFavourite(favourite);
      console.log('Favourites Utils: Added to favourites');
      return true;
    }
  } catch (error) {
    console.error('Favourites Utils: Error toggling favourite:', error);
    return false;
  }
}
