
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteCircuit {
  slug: string;
  category: 'f1' | 'f2' | 'f3' | 'motogp' | 'indycar' | 'nascar';
  name: string;
  country: string;
  addedAt: number;
}

class FavoritesService {
  private static readonly STORAGE_KEY = 'motorsport_favorites';
  private static initialized = false;

  async initialize(): Promise<void> {
    if (FavoritesService.initialized) return;
    
    try {
      console.log('FavoritesService: Initializing');
      const data = await AsyncStorage.getItem(FavoritesService.STORAGE_KEY);
      if (!data) {
        await AsyncStorage.setItem(FavoritesService.STORAGE_KEY, JSON.stringify([]));
      }
      FavoritesService.initialized = true;
      console.log('FavoritesService: Initialized successfully');
    } catch (error) {
      console.error('FavoritesService: Error initializing:', error);
    }
  }

  async addFavorite(circuit: FavoriteCircuit): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      
      // Check if already exists
      const exists = favorites.some(f => f.slug === circuit.slug && f.category === circuit.category);
      if (exists) {
        console.log('FavoritesService: Circuit already in favorites:', circuit.slug);
        return;
      }

      favorites.push({
        ...circuit,
        addedAt: Date.now(),
      });

      await AsyncStorage.setItem(FavoritesService.STORAGE_KEY, JSON.stringify(favorites));
      console.log('FavoritesService: Added favorite:', circuit.slug);
    } catch (error) {
      console.error('FavoritesService: Error adding favorite:', error);
    }
  }

  async removeFavorite(slug: string, category: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(f => !(f.slug === slug && f.category === category));
      
      await AsyncStorage.setItem(FavoritesService.STORAGE_KEY, JSON.stringify(filtered));
      console.log('FavoritesService: Removed favorite:', slug);
    } catch (error) {
      console.error('FavoritesService: Error removing favorite:', error);
    }
  }

  async getFavorites(): Promise<FavoriteCircuit[]> {
    try {
      const data = await AsyncStorage.getItem(FavoritesService.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('FavoritesService: Error getting favorites:', error);
      return [];
    }
  }

  async isFavorite(slug: string, category: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(f => f.slug === slug && f.category === category);
    } catch (error) {
      console.error('FavoritesService: Error checking favorite:', error);
      return false;
    }
  }

  async clearAllFavorites(): Promise<void> {
    try {
      await AsyncStorage.setItem(FavoritesService.STORAGE_KEY, JSON.stringify([]));
      console.log('FavoritesService: Cleared all favorites');
    } catch (error) {
      console.error('FavoritesService: Error clearing favorites:', error);
    }
  }
}

export default new FavoritesService();
