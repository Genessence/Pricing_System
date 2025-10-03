import { tokenStorageKey, userDataStorageKey } from "./env";

const STORAGE_KEYS = {
  AUTH_TOKEN: tokenStorageKey,
  USER_DATA: userDataStorageKey,
} as const;

export const storage = {
  // Token operations
  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // User data operations
  setUserData: (userData: any): void => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  getUserData: (): any | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  removeUserData: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  // Clear all auth data
  clearAuthData: (): void => {
    storage.removeToken();
    storage.removeUserData();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!(storage.getToken() && storage.getUserData());
  },
};
