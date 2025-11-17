import { AxiosInstance } from 'axios';

import { User } from '@/types/user.type';

import AsyncStorage from '@react-native-async-storage/async-storage';
import restConnector from '../connectors/axios-rest-connector';

const AUTHORIZATION_HEADER = 'Authorization';
export const ACCESS_TOKEN_LOCAL_STORAGE = 'jwt';
export const USER_LOCAL_STORAGE = 'user';

export class AuthService {
  private jwt: string | null;
  private restConnector: AxiosInstance;

  constructor(options: { restConnector: AxiosInstance }) {
    this.jwt = null;
    this.restConnector = options.restConnector;
    this.loadAccessToken();
  }

  public async login(values: { email: string; password: string }) {
    try {
      const { data } = await this.restConnector.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      if (data.success) {
        await this.storeAuthenticatedInfo(data.data.user, data.data.token);

        await this.loadAccessToken();

        return data.data.user;
      }

      return null;
    } catch (error) {
      console.error('Login error:', error);

      return null;
    }
  }

  public async fetchCurrentUser() {
    if (!this.jwt) {
      return null;
    }
    try {
      const { data } = await this.restConnector.get('/whoiam');
      if (data.success) {
        return data.data;
      }
      await this.setAccessToken(null);

      return null;
    } catch {
      // Error is already being handled by setting access token to null
      // and returning null, no need for console.log in production
      await this.setAccessToken(null);

      return null;
    }
  }

  public async forgotPassword(email: string) {
    const response = await this.restConnector.post(`/auth/forgot-password`, {
      email,
    });

    return response.data;
  }

  public async resetPassword(password: string, token: string) {
    const response = await this.restConnector.post(`/auth/reset-password`, {
      password,
      token,
    });

    return response.data;
  }

  public async storeAuthenticatedInfo(
    user: User,
    token: string
  ): Promise<void> {
    await this.setAccessToken(token);
    await this.storeUser(user);
  }

  public async storeUser(user: User | null): Promise<void> {
    if (user) {
      await AsyncStorage.setItem(USER_LOCAL_STORAGE, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(USER_LOCAL_STORAGE);
    }
  }

  public async loadStoredUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem(USER_LOCAL_STORAGE);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error loading stored user:', error);
      return null;
    }
  }

  public async setAccessToken(
    token: string | null,
    opts?: { expiresIn: string }
  ): Promise<void> {
    if (token) {
      this.jwt = token;
      if (opts) {
        await AsyncStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE, token);
      } else {
        await AsyncStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE, token);
      }
    }
  }

  public async loadAccessToken(): Promise<void> {
    // Ensure code only runs in the browser
    if (typeof window !== 'undefined') {
      const accessToken = await AsyncStorage.getItem(
        ACCESS_TOKEN_LOCAL_STORAGE
      );
      if (accessToken) {
        this.jwt = accessToken;
        this.restConnector.defaults.headers[
          AUTHORIZATION_HEADER
        ] = `Bearer ${accessToken}`;
        this.restConnector.defaults.headers['ngrok-skip-browser-warning'] =
          'true';
      }
    }
  }
}

export const authService = new AuthService({ restConnector });
