export type UserRole = 'CUSTOMER' | 'OWNER' | 'AGENT' | 'ADMIN';
export type LoginType = 'EMAIL' | 'PHONE';

export interface LoginRequest {
  identifier: string;
  password: string;
  loginType: LoginType;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  role: UserRole;
}

export interface AuthResponse {
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  accessToken: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  authProvider: string;
  active: boolean;
}