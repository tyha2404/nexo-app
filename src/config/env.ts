import Constants from 'expo-constants';

// Centralized environment access using Expo runtime constants
// Values come from app.config.ts -> extra

type Extra = {
  API_URL?: string;
  APP_ENV?: string;
};

const extra: Extra =
  (Constants.expoConfig?.extra as Extra | undefined) ||
  (Constants.manifest?.extra as Extra | undefined) ||
  {};

export const API_URL = extra.API_URL || process.env.API_URL || '';
export const APP_ENV = extra.APP_ENV || process.env.APP_ENV || 'development';

export const isDev = APP_ENV === 'development' || __DEV__;
