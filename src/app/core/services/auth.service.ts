import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  OtpDispatchResponse,
  RegisterRequest,
  ResetPasswordWithOtpRequest,
  UserProfileResponse,
  UserRole,
  VerifyOtpRequest
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenKey = 'quickbite_token';
  private readonly authUserKey = 'quickbite_auth_user';

  constructor(private readonly http: HttpClient) {}

  requestSignupOtp(payload: RegisterRequest): Observable<OtpDispatchResponse> {
    return this.http.post<OtpDispatchResponse>(`${this.baseUrl}/register`, payload);
  }

  verifySignupOtp(payload: VerifyOtpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register/verify`, payload).pipe(
      tap((response) => this.storeAuthData(response))
    );
  }

  resendSignupOtp(verificationId: string): Observable<OtpDispatchResponse> {
    return this.http.post<OtpDispatchResponse>(`${this.baseUrl}/register/resend`, { verificationId });
  }

  requestLoginOtp(payload: LoginRequest): Observable<OtpDispatchResponse> {
    return this.http.post<OtpDispatchResponse>(`${this.baseUrl}/login`, payload);
  }

  verifyLoginOtp(payload: VerifyOtpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login/verify`, payload).pipe(
      tap((response) => this.storeAuthData(response))
    );
  }

  resendLoginOtp(verificationId: string): Observable<OtpDispatchResponse> {
    return this.http.post<OtpDispatchResponse>(`${this.baseUrl}/login/resend`, { verificationId });
  }

  requestPasswordResetOtp(payload: ForgotPasswordRequest): Observable<OtpDispatchResponse> {
    return this.http.post<OtpDispatchResponse>(`${this.baseUrl}/password/forgot`, payload);
  }

  verifyPasswordResetOtp(payload: ResetPasswordWithOtpRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/password/forgot/verify`, payload, { responseType: 'text' });
  }

  resendPasswordResetOtp(verificationId: string): Observable<OtpDispatchResponse> {
    return this.http.post<OtpDispatchResponse>(`${this.baseUrl}/password/forgot/resend`, { verificationId });
  }

  logout(): Observable<string> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { responseType: 'text' }).pipe(
      tap(() => this.clearAuthData())
    );
  }

  validateToken(): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/validate`, {});
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, {}).pipe(
      tap((response) => this.storeAuthData(response))
    );
  }

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}/profile`);
  }

  updateProfile(payload: RegisterRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.baseUrl}/profile`, payload);
  }

  changePassword(payload: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${this.baseUrl}/password`, payload, { responseType: 'text' });
  }

  deactivateAccount(): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deactivate`, { responseType: 'text' }).pipe(
      tap(() => this.clearAuthData())
    );
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
        return '/owner';
      case 'AGENT':
        return '/delivery';
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
