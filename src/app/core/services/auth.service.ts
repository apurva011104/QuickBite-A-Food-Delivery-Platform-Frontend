import { Injectable } from '@angular/core';
import { User, UserRole } from '../models/user.model';
import { USERS_MOCK } from '../mock-data/users.mock';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'quickbite_user';
  private readonly usersStorageKey = 'quickbite_registered_users';

  login(identifier: string, password: string): User | null {
    const allUsers = this.getAllUsers();
    const cleanedIdentifier = identifier.trim().toLowerCase();

    const user = allUsers.find(
      (item) =>
        (item.email.toLowerCase() === cleanedIdentifier || item.phone === identifier.trim()) &&
        item.password === password
    );

    if (user) {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      return user;
    }

    return null;
  }

  signup(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): { success: boolean; message: string } {
    const allUsers = this.getAllUsers();

    const emailExists = allUsers.some(
      (user) => user.email.toLowerCase() === userData.email.trim().toLowerCase()
    );

    if (emailExists) {
      return { success: false, message: 'Email is already registered.' };
    }

    const phoneExists = allUsers.some(
      (user) => user.phone === userData.phone.trim()
    );

    if (phoneExists) {
      return { success: false, message: 'Phone number is already registered.' };
    }

    const newUser: User = {
      id: Date.now(),
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone.trim(),
      password: userData.password,
      role: userData.role
    };

    const registeredUsers = this.getRegisteredUsers();
    registeredUsers.push(newUser);
    localStorage.setItem(this.usersStorageKey, JSON.stringify(registeredUsers));

    return { success: true, message: 'Account created successfully.' };
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    window.dispatchEvent(new Event('storage'));
  }

  getLoggedInUser(): User | null {
    const rawUser = localStorage.getItem(this.storageKey);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getLoggedInUser();
  }

    isCustomer(): boolean {
      const user = this.getLoggedInUser();
      return !!user && user.role === 'CUSTOMER';
    }
    
    isOwner(): boolean {
      const user = this.getLoggedInUser();
      return !!user && user.role === 'OWNER';
    }
    
    isAgent(): boolean {
      const user = this.getLoggedInUser();
      return !!user && user.role === 'AGENT';
    }

  getRedirectRouteByRole(role: string): string {
    switch (role) {
      case 'CUSTOMER':
        return '/';
      case 'OWNER':
        return '/restaurants';
      case 'AGENT':
        return '/cart';
      case 'ADMIN':
        return '/restaurants';
      default:
        return '/';
    }
  }

  private getRegisteredUsers(): User[] {
    const rawUsers = localStorage.getItem(this.usersStorageKey);
    return rawUsers ? (JSON.parse(rawUsers) as User[]) : [];
  }

  private getAllUsers(): User[] {
    return [...USERS_MOCK, ...this.getRegisteredUsers()];
  }
}