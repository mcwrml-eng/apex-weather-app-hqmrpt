
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
    const stored = await AsyncStorage.getItem(FAVOURITES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Favourites: Error loading favourites:', error);
    return [];
  }
}

export async function addFavourite(favourite: Omit<FavouriteLocation, 'addedAt'>): Promise<boolean> {
  try {
    const favourites = await getFavourites();
    
    // Check if already exists
    const exists = favourites.some(fav => fav.id === favourite.id);
    if (exists) {
      console.log('Favourites: Already exists:', favourite.id);
      return false;
    }
    
    const newFavourite: FavouriteLocation = {
      ...favourite,
      addedAt: Date.now(),
    };
    
    const updated = [...favourites, newFavourite];
    await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(updated));
    console.log('Favourites: Added successfully:', favourite.id);
    return true;
  } catch (error) {
    console.error('Favourites: Error adding favourite:', error);
    return false;
  }
}

export async function removeFavourite(id: string): Promise<boolean> {
  try {
    const favourites = await getFavourites();
    const updated = favourites.filter(fav => fav.id !== id);
    await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(updated));
    console.log('Favourites: Removed successfully:', id);
    return true;
  } catch (error) {
    console.error('Favourites: Error removing favourite:', error);
    return false;
  }
}

export async function removeAllFavourites(): Promise<boolean> {
  try {
    await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify([]));
    console.log('Favourites: Removed all favourites successfully');
    return true;
  } catch (error) {
    console.error('Favourites: Error removing all favourites:', error);
    return false;
  }
}

export async function isFavourite(id: string): Promise<boolean> {
  try {
    const favourites = await getFavourites();
    return favourites.some(fav => fav.id === id);
  } catch (error) {
    console.error('Favourites: Error checking favourite:', error);
    return false;
  }
}

export async function toggleFavourite(favourite: Omit<FavouriteLocation, 'addedAt'>): Promise<boolean> {
  try {
    const isCurrentlyFavourite = await isFavourite(favourite.id);
    
    if (isCurrentlyFavourite) {
      await removeFavourite(favourite.id);
      return false;
    } else {
      await addFavourite(favourite);
      return true;
    }
  } catch (error) {
    console.error('Favourites: Error toggling favourite:', error);
    return false;
  }
}
