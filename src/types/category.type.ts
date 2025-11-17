import { BaseCommonType } from './base-common.type';
import { User } from './user.type';

export type Category = {
  userId: string;
  user: User;
  name: string;
  description: string;
} & BaseCommonType;
