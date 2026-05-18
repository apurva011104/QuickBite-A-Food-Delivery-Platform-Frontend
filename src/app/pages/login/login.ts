import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

  verificationId = '';
  otp = '';
  maskedEmail = '';

  errorMessage = '';
  infoMessage = '';
  otpRequested = false;
  requestingOtp = false;
  verifyingOtp = false;
  resendingOtp = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    const navMessage = this.router.getCurrentNavigation()?.extras?.state?.['message'];
    if (typeof navMessage === 'string' && navMessage.trim()) {
      this.infoMessage = navMessage;
    }

    this.route.queryParamMap.subscribe((params) => {
      if (params.get('reset') === 'success' && !this.infoMessage) {
        this.infoMessage = 'Password reset successfully. Please log in with your new password.';
      }
    });
  }

  requestVerificationCode(): void {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.form.identifier.trim() || !this.form.password.trim()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.requestingOtp = true;

    this.authService.requestLoginOtp(this.form).subscribe({
      next: (response) => {
        this.requestingOtp = false;
        this.otpRequested = true;
        this.verificationId = response.verificationId;
        this.maskedEmail = response.maskedEmail;
        this.infoMessage = response.message;
      },
      error: (err: any) => {
        this.requestingOtp = false;
        this.errorMessage = err?.error?.message || 'Unable to send verification code.';
      }
    });
  }

  verifyAndLogin(): void {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.verificationId) {
      this.errorMessage = 'Request a verification code first.';
      return;
    }

    if (!this.otp.trim()) {
      this.errorMessage = 'Enter the OTP you received.';
      return;
    }

    this.verifyingOtp = true;

    this.authService.verifyLoginOtp({
      verificationId: this.verificationId,
      otp: this.otp.trim()
    }).subscribe({
      next: (response) => {
        this.verifyingOtp = false;
        this.router.navigateByUrl(this.authService.getRedirectRouteByRole(response.role));
      },
      error: (err: any) => {
        this.verifyingOtp = false;
        this.errorMessage = err?.error?.message || 'Unable to verify OTP.';
      }
    });
  }

  resendOtp(): void {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.verificationId) {
      this.errorMessage = 'Request a verification code first.';
      return;
    }

    this.resendingOtp = true;

    this.authService.resendLoginOtp(this.verificationId).subscribe({
      next: (response) => {
        this.resendingOtp = false;
        this.infoMessage = response.message;
      },
      error: (err: any) => {
        this.resendingOtp = false;
        this.errorMessage = err?.error?.message || 'Unable to resend OTP.';
      }
    });
  }

  editDetails(): void {
    this.otpRequested = false;
    this.verificationId = '';
    this.otp = '';
    this.maskedEmail = '';
    this.errorMessage = '';
    this.infoMessage = '';
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  setLoginType(type: LoginType): void {
    if (this.otpRequested) {
      return;
    }
    this.form.loginType = type;
  }
}
