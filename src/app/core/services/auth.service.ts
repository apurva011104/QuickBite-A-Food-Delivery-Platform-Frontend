import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfileResponse,
  UserRole
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenKey = 'quickbite_token';
  private readonly authUserKey = 'quickbite_auth_user';

  constructor(private readonly http: HttpClient) {}

  signup(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap((response) => this.storeAuthData(response))
    );
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((response) => this.storeAuthData(response))
    );
  }

  logout(): Observable<string> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { responseType: 'text' }).pipe(
      tap(() => this.clearAuthData())
    );
  }

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}/profile`);
  }

  getLoggedInUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.authUserKey);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRedirectRouteByRole(role: UserRole): string {
    switch (role) {
      case 'CUSTOMER':
        return '/';
      case 'OWNER':
        return '/restaurants';
      case 'AGENT':
        return '/';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  }

  isCustomer(): boolean {
    return this.getLoggedInUser()?.role === 'CUSTOMER';
  }

  isOwner(): boolean {
    return this.getLoggedInUser()?.role === 'OWNER';
  }

  isAgent(): boolean {
    return this.getLoggedInUser()?.role === 'AGENT';
  }

  isAdmin(): boolean {
    return this.getLoggedInUser()?.role === 'ADMIN';
  }

  clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.authUserKey);
    window.dispatchEvent(new Event('storage'));
  }

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.authUserKey, JSON.stringify(response));
    window.dispatchEvent(new Event('storage'));
  }
}