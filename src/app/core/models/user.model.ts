export type UserRole = 'CUSTOMER' | 'OWNER' | 'AGENT' | 'ADMIN';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}