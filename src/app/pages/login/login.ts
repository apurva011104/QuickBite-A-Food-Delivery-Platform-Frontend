import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  identifier = '';
  password = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = '';

    const user = this.authService.login(this.identifier, this.password.trim());

    if (!user) {
      this.errorMessage = 'Invalid email/phone or password.';
      return;
    }

    const redirectRoute = this.authService.getRedirectRouteByRole(user.role);
    this.router.navigateByUrl(redirectRoute);
  }

  fillDemoCredentials(role: 'CUSTOMER' | 'OWNER' | 'AGENT' | 'ADMIN'): void {
    switch (role) {
      case 'CUSTOMER':
        this.identifier = 'customer@quickbite.com';
        this.password = '123456';
        break;
      case 'OWNER':
        this.identifier = 'owner@quickbite.com';
        this.password = '123456';
        break;
      case 'AGENT':
        this.identifier = 'agent@quickbite.com';
        this.password = '123456';
        break;
      case 'ADMIN':
        this.identifier = 'admin@quickbite.com';
        this.password = '123456';
        break;
    }
  }
}