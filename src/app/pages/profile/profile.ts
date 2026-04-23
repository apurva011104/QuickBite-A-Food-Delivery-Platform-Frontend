import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ChangePasswordRequest,
  RegisterRequest,
  UserProfileResponse
} from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import {
  PaymentService,
  WalletResponse,
  WalletStatementResponse
} from '../../core/services/payment.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  profile: UserProfileResponse | null = null;

  profileForm: RegisterRequest = {
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'CUSTOMER'
  };

  passwordForm: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: ''
  };

  wallet: WalletResponse | null = null;
  walletStatements: WalletStatementResponse[] = [];
  walletTopUpAmount: number | null = null;

  loading = true;
  updatingProfile = false;
  updatingPassword = false;
  deactivating = false;
  loadingWallet = false;
  toppingUpWallet = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    public readonly authService: AuthService,
    private readonly paymentService: PaymentService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm = {
          name: profile.name,
          email: profile.email,
          phoneNumber: profile.phoneNumber || '',
          password: '',
          role: profile.role
        };
        this.loading = false;
        this.cdr.detectChanges();

        if (profile.role === 'CUSTOMER') {
          this.loadWallet();
        }
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load profile.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadWallet(): void {
    this.loadingWallet = true;

    this.paymentService.getWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.walletStatements = [...(wallet.statements || [])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loadingWallet = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load wallet.';
        this.loadingWallet = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateProfile(): void {
    if (!this.profile) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.updatingProfile = true;

    const payload: RegisterRequest = {
      name: this.profileForm.name,
      email: this.profile.email,
      phoneNumber: this.profileForm.phoneNumber,
      password: undefined,
      role: this.profile.role
    };

    this.authService.updateProfile(payload).subscribe({
      next: (updated) => {
        this.successMessage = 'Profile updated successfully.';
        this.updatingProfile = false;

        const currentUser = this.authService.getLoggedInUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: updated.name,
            email: updated.email,
            phoneNumber: updated.phoneNumber
          };
          localStorage.setItem('quickbite_auth_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('storage'));
        }

        this.loadProfile();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to update profile.';
        this.updatingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.passwordForm.currentPassword.trim() || !this.passwordForm.newPassword.trim()) {
      this.errorMessage = 'Please fill both password fields.';
      return;
    }

    if (this.profile?.authProvider === 'GOOGLE') {
      this.errorMessage = 'Password change is not allowed for Google-only accounts.';
      return;
    }

    this.updatingPassword = true;

    this.authService.changePassword(this.passwordForm).subscribe({
      next: () => {
        this.successMessage = 'Password updated successfully.';
        this.passwordForm = {
          currentPassword: '',
          newPassword: ''
        };
        this.updatingPassword = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to update password.';
        this.updatingPassword = false;
        this.cdr.detectChanges();
      }
    });
  }

  addToWallet(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.walletTopUpAmount === null || this.walletTopUpAmount <= 0) {
      this.errorMessage = 'Enter a valid wallet top-up amount.';
      return;
    }

    this.toppingUpWallet = true;

    this.paymentService.addToWallet(this.walletTopUpAmount).subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.walletStatements = [...(wallet.statements || [])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.walletTopUpAmount = null;
        this.toppingUpWallet = false;
        this.successMessage = 'Money added to wallet successfully.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toppingUpWallet = false;
        this.errorMessage = err?.error?.message || 'Unable to add money to wallet.';
        this.cdr.detectChanges();
      }
    });
  }

  deactivateAccount(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.deactivating = true;

    this.authService.deactivateAccount().subscribe({
      next: () => {
        this.deactivating = false;
        this.router.navigateByUrl('/login');
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to deactivate account.';
        this.deactivating = false;
        this.cdr.detectChanges();
      }
    });
  }
}