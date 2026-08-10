import type { User } from '@/types/user';

export interface AuthSession {
  user: User;
  accessToken: string;
}
