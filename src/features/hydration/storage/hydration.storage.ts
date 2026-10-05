import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeHydration } from '../hydration.model';
import type { HydrationData } from '../hydration.types';

export const HYDRATION_STORAGE_KEY = 'fitnessfreak:hydration:v1';

export async function loadHydration(): Promise<HydrationData> {
  return decodeHydration(await AsyncStorage.getItem(HYDRATION_STORAGE_KEY));
}

export async function saveHydration(data: HydrationData): Promise<void> {
  await AsyncStorage.setItem(HYDRATION_STORAGE_KEY, JSON.stringify(data));
}
