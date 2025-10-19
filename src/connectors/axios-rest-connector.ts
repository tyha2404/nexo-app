import { API_URL } from '@/config/env';
import axios from 'axios';
import { router } from 'expo-router';

import {
  ACCESS_TOKEN_LOCAL_STORAGE,
  USER_LOCAL_STORAGE,
} from '@/services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const restConnector = axios.create({
  baseURL: API_URL,
});

// Add response interceptor
restConnector.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data
      AsyncStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE);
      AsyncStorage.removeItem(USER_LOCAL_STORAGE);

      // Client-side redirect
      try {
        router.replace('/(auth)/login');
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/(auth)/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default restConnector;
