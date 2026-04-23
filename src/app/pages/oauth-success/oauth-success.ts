import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthResponse, UserRole } from '../../core/models/auth.model';

@Component({
  selector: 'app-oauth-success',
  standalone: true,
  template: `
    <section class="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-12">
      <div class="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <h1 class="text-2xl font-bold text-[var(--qb-text)]">Signing you in...</h1>
        <p class="mt-2 text-[var(--qb-muted)]">Please wait while we complete Google login.</p>
      </div>
    </section>
  `
})
export class OAuthSuccess implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const name = this.route.snapshot.queryParamMap.get('name');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: AuthResponse = {
        id: payload.userId,
        name: name || payload.name || email || 'Google User',
        email: email || payload.sub || '',
        role: (payload.role as UserRole) || 'CUSTOMER',
        accessToken: token
      };

      localStorage.setItem('quickbite_token', token);
      localStorage.setItem('quickbite_auth_user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));

      switch (user.role) {
        case 'OWNER':
          this.router.navigateByUrl('/owner');
          break;
        case 'ADMIN':
          this.router.navigateByUrl('/admin');
          break;
        case 'AGENT':
          this.router.navigateByUrl('/');
          break;
        default:
          this.router.navigateByUrl('/');
      }
    } catch {
      this.router.navigateByUrl('/login');
    }
  }
}