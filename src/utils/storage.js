import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Cross-platform storage adapter that uses localStorage on web and AsyncStorage on mobile
 */
const getStorageAdapter = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
      multiRemove: (keys) => Promise.resolve(keys.forEach(key => localStorage.removeItem(key)))
    };
  }
  return AsyncStorage;
};

/**
 * Centralized storage service that works across web and mobile platforms
 * Uses localStorage on web and AsyncStorage on mobile
 */
export const StorageService = {
  /**
   * Retrieve data from storage with automatic JSON parsing
   * @param {string} key - Storage key
   * @param {*} defaultValue - Value to return if key doesn't exist
   * @returns {Promise<*>} Parsed data or default value
   */
  async get(key, defaultValue = null) {
    try {
      const storage = getStorageAdapter();
      const data = await storage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Storage read error for key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Store data in storage with automatic JSON stringification
   * @param {string} key - Storage key
   * @param {*} value - Data to store
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async set(key, value) {
    try {
      const storage = getStorageAdapter();
      await storage.setItem(key, JSON.stringify(value));
      return { success: true };
    } catch (error) {
      console.error(`Storage write error for key "${key}":`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove data from storage
   * @param {string} key - Storage key to remove
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async remove(key) {
    try {
      const storage = getStorageAdapter();
      await storage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove multiple keys at once
   * @param {string[]} keys - Array of keys to remove
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async removeMultiple(keys) {
    try {
      const storage = getStorageAdapter();
      if (Platform.OS === 'web') {
        await storage.multiRemove(keys);
      } else {
        await AsyncStorage.multiRemove(keys);
      }
      return { success: true };
    } catch (error) {
      console.error(`Storage multi-remove error:`, error);
      return { success: false, error: error.message };
    }
  }
};