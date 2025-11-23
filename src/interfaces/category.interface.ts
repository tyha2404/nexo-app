import { BaseCommonType } from './base-common.interface';
import { User } from './user.interface';

export interface Category extends BaseCommonType {
  userId: string;
  user: User;
  name: string;
  description: string;
}
