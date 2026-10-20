import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeWellness } from './wellness.codec';
import type { WellnessData } from './wellness.types';
const KEY = 'fitnessfreak:wellness:v1';
export async function loadWellness() {
  return decodeWellness(await AsyncStorage.getItem(KEY));
}
export async function saveWellness(data: WellnessData) {
  const raw = JSON.stringify(data);
  decodeWellness(raw);
  await AsyncStorage.setItem(KEY, raw);
}
