import type { User } from './auth';

export interface UserProfile extends User { id?: number; }

export interface UpdateUserData {
  name?: string;
  email?: string;
  login?: string;
  password?: string;
  location?: {
    lat?: number; lng?: number; address?: string; city?: string; state?: string; zip_code?: number;
  };
}
