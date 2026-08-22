import { AxiosInstance } from 'axios';
import { CRUDService } from './crud.service';
import restConnector from '../connectors/axios-rest-connector';
import { Preset, CreatePresetDTO } from '@/interfaces/preset.interface';

export class PresetService extends CRUDService<Preset> {
  constructor(options: { restConnector: AxiosInstance }) {
    super({ restConnector: options.restConnector, subPath: '/presets' });
  }

  async createPreset(dto: CreatePresetDTO): Promise<Preset | null> {
    return this.create(dto);
  }
}

export const presetService = new PresetService({ restConnector });
