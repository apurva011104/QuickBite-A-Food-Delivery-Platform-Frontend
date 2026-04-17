import { User } from '../models/user.model';

export const USERS_MOCK: User[] = [
  {
    id: 1,
    firstName: 'Apurva',
    lastName: 'Customer',
    email: 'customer@quickbite.com',
    phone: '9999999991',
    password: '123456',
    role: 'CUSTOMER'
  },
  {
    id: 2,
    firstName: 'Owner',
    lastName: 'Demo',
    email: 'owner@quickbite.com',
    phone: '9999999992',
    password: '123456',
    role: 'OWNER'
  },
  {
    id: 3,
    firstName: 'Agent',
    lastName: 'Demo',
    email: 'agent@quickbite.com',
    phone: '9999999993',
    password: '123456',
    role: 'AGENT'
  },
  {
    id: 4,
    firstName: 'Admin',
    lastName: 'Demo',
    email: 'admin@quickbite.com',
    phone: '9999999994',
    password: '123456',
    role: 'ADMIN'
  }
];