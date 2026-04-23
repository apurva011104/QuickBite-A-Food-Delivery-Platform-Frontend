import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest, UserRole } from '../../core/models/auth.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html'
})
export class Signup {
  form: RegisterRequest = {
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'CUSTOMER'
  };

  errorMessage = '';
  submitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSignup(): void {
    this.errorMessage = '';

    if (!this.form.name.trim() || !this.form.email.trim() || !this.form.password?.trim()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.submitting = true;

    this.authService.signup(this.form).subscribe({
      next: (response) => {
        this.submitting = false;
        this.router.navigateByUrl(this.authService.getRedirectRouteByRole(response.role));
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Unable to create account.';
      }
    });
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  setRole(role: UserRole): void {
    this.form.role = role;
  }
}