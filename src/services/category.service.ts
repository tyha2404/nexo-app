import { AxiosInstance } from 'axios';

import { CRUDService } from './crud.service';
import restConnector from '../connectors/axios-rest-connector';
import { Category } from '@/interfaces';

export class CategoryService extends CRUDService<Category> {
  constructor(options: { restConnector: AxiosInstance }) {
    super({ restConnector: options.restConnector, subPath: '/categories' });
  }
}

export const categoryService = new CategoryService({ restConnector });
