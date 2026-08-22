import { AxiosInstance } from 'axios';
import restConnector from '../connectors/axios-rest-connector';
import { TransactionType } from '@/interfaces/transaction.interface';

export interface ParseNLPResponse {
  amount: number;
  type: TransactionType;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  confidenceScore?: number;
}

export class NLPService {
  private restConnector: AxiosInstance;

  constructor(options: { restConnector: AxiosInstance }) {
    this.restConnector = options.restConnector;
  }

  async parseNLP(text: string): Promise<ParseNLPResponse> {
    try {
      const response = await this.restConnector.post('/transactions/parse-nlp', { text });
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to parse text');
      }
      throw new Error('Failed to parse text');
    }
  }
}

export const nlpService = new NLPService({ restConnector });
