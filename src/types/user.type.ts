import { BaseCommonType } from './base-common.type';

export type User = {
  username: string;
  email: string;
  password: string;
} & BaseCommonType;
