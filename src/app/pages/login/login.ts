import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest, LoginType } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  form: LoginRequest = {
    identifier: '',
    password: '',
    loginType: 'EMAIL'
  };

  errorMessage = '';
  submitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = '';

    if (!this.form.identifier.trim() || !this.form.password.trim()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.submitting = true;

    this.authService.login(this.form).subscribe({
      next: (response) => {
        this.submitting = false;
        this.router.navigateByUrl(this.authService.getRedirectRouteByRole(response.role));
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Invalid credentials.';
      }
    });
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  setLoginType(type: LoginType): void {
    this.form.loginType = type;
  }
}