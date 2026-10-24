import { ApiResponse } from './api-response.model';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RequestLogin = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  email: string;
  userName: string;
  role: string;
};

export type ResponseLogin = ApiResponse<AuthResponse>;

/** The authenticated user's profile returned by GET /api/auth/me. */
export type UserProfileResponse = {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
};

export type ResponseCurrentUser = ApiResponse<UserProfileResponse>;

export type JwtClaims = {
  sub?: string;
  role?: string;
};

export type User = {
  id?: string;
  username?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  role?: string;
  enabled?: boolean;
  deleted?: boolean;
};
