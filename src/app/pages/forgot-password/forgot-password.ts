import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ForgotPasswordRequest, LoginType } from '../../core/models/auth.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  form: ForgotPasswordRequest = {
    identifier: '',
    loginType: 'EMAIL'
  };

  verificationId = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  maskedEmail = '';

  errorMessage = '';
  infoMessage = '';
  otpRequested = false;
  requestingOtp = false;
  resettingPassword = false;
  resendingOtp = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  requestVerificationCode(): void {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.form.identifier.trim()) {
      this.errorMessage = this.form.loginType === 'EMAIL'
        ? 'Enter your email address.'
        : 'Enter your phone number.';
      return;
    }

    this.requestingOtp = true;

    this.authService.requestPasswordResetOtp(this.form).subscribe({
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

  resetPassword(): void {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.verificationId) {
      this.errorMessage = 'Request a verification code first.';
      return;
    }

    if (!this.otp.trim() || !this.newPassword.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'Enter the OTP, your new password, and confirm it.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirm password must match.';
      return;
    }

    this.resettingPassword = true;

    this.authService.verifyPasswordResetOtp({
      verificationId: this.verificationId,
      otp: this.otp.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: (response) => {
        this.resettingPassword = false;
        this.router.navigate(['/login'], {
          queryParams: { reset: 'success' },
          state: { message: response }
        });
      },
      error: (err: any) => {
        this.resettingPassword = false;
        this.errorMessage = err?.error?.message || 'Unable to reset password.';
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

    this.authService.resendPasswordResetOtp(this.verificationId).subscribe({
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
    this.newPassword = '';
    this.confirmPassword = '';
    this.maskedEmail = '';
    this.errorMessage = '';
    this.infoMessage = '';
  }

  setLoginType(type: LoginType): void {
    if (this.otpRequested) {
      return;
    }
    this.form.loginType = type;
  }
}
