import { AxiosInstance } from 'axios';

import { CRUDService } from './crud.service';
import restConnector from '../connectors/axios-rest-connector';
import { Category } from '@/interfaces/category.interface';
import { Cost } from '@/interfaces';

export class CostService extends CRUDService<Cost> {
  constructor(options: { restConnector: AxiosInstance }) {
    super({ restConnector: options.restConnector, subPath: '/costs' });
  }
}

export const costService = new CostService({ restConnector });
