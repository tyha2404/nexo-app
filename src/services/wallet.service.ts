import restConnector from '../connectors/axios-rest-connector';
import type {
  Wallet,
  CreateWalletDTO,
  TransferMoneyDTO,
  WalletSummaryResponse,
} from '../interfaces/wallet.interface';

class WalletService {
  async getSummary(): Promise<WalletSummaryResponse> {
    const response = await restConnector.get<WalletSummaryResponse>('/wallets');
    return response.data;
  }

  async create(data: CreateWalletDTO): Promise<Wallet> {
    const response = await restConnector.post<Wallet>('/wallets', data);
    return response.data;
  }

  async transfer(data: TransferMoneyDTO): Promise<void> {
    await restConnector.post('/wallets/transfer', data);
  }
}

export const walletService = new WalletService();
