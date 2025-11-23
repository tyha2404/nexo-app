import { BaseCommonType } from './base-common.interface';

export interface User extends BaseCommonType {
  username: string;
  email: string;
  password: string;
}
