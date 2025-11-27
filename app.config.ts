import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['expo-router', { root: './src/app' }],
    'expo-splash-screen',
  ],
  extra: {
    ...(config.extra || {}),
    API_URL: process.env.API_URL || '',
    APP_ENV: process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development',
  },
});
