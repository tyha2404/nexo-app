/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance } from "axios";

export interface ICRUDService<T> {
  getAll(filters?: Record<string, any>): Promise<PaginatedResponse<T>>;
  getById(id: number): Promise<T | null>;
  create(body: Partial<T>): Promise<T | null>;
  update(id: number, body: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<void>;
}

export interface PaginatedResponse<T = any> {
  list: Array<T>;
  items?: Array<T>;
  total: number;
  page: number;
  perPage: number;
}

export class CRUDService<T> implements ICRUDService<T> {
  protected restConnector: AxiosInstance;
  private subPath: string;

  constructor(options: { restConnector: AxiosInstance; subPath: string }) {
    this.restConnector = options.restConnector;
    this.subPath = options.subPath;
  }

  async getAll(filters?: Record<string, any>): Promise<PaginatedResponse<T>> {
    try {
      const { data } = await this.restConnector.get(this.subPath, {
        params: filters ?? {},
      });

      if (data.success) {
        return data.data;
      }

      return { list: [], total: 0, page: 1, perPage: 10 };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to fetch items");
      }
      throw new Error("Failed to fetch items");
    }
  }

  async getById(id: number): Promise<T | null> {
    try {
      const { data } = await this.restConnector.get(`${this.subPath}/${id}`);
      if (data.success) {
        return data.data;
      }

      return null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to fetch item by ID");
      }
      throw new Error("Failed to fetch item by ID");
    }
  }

  async create(body: Partial<T>): Promise<T | null> {
    try {
      const { data } = await this.restConnector.post(this.subPath, body);
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to create item");
      }
      throw new Error("Failed to create item");
    }
  }

  async update(id: number, body: Partial<T>): Promise<T | null> {
    try {
      const { data } = await this.restConnector.put(
        `${this.subPath}/${id}`,
        body
      );
      if (data.success) {
        return data.data;
      }

      return null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to update item");
      }
      throw new Error("Failed to update item");
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const { data } = await this.restConnector.delete(`${this.subPath}/${id}`);
      if (!data.success) {
        throw new Error("Failed to delete the item");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to delete item");
      }
      throw new Error("Failed to delete item");
    }
  }
}
