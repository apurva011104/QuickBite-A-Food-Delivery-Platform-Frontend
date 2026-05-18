import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMode = 'CARD' | 'UPI' | 'WALLET' | 'COD';

export interface WalletStatementResponse {
  statementId: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  createdAt: string;
}

export interface WalletResponse {
  walletId: number;
  customerId: number;
  balance: number;
  statements: WalletStatementResponse[];
}

export interface RazorpayOrderRequest {
  orderId: number;
  amount: number;
}

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

export interface RazorpayVerifyRequest {
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RazorpayWalletTopUpRequest {
  amount: number;
}

export interface RazorpayWalletTopUpOrderResponse {
  paymentReferenceId: number;
  razorpayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

export interface RazorpayWalletTopUpVerifyRequest {
  paymentReferenceId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentResponse {
  paymentId: number;
  orderId: number;
  customerId: number;
  amount: number;
  status: PaymentStatus;
  mode: PaymentMode;
  transactionId?: string;
  currency: string;
  paidAt?: string;
  refundedAt?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getWallet(): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${this.baseUrl}/wallet`);
  }

  getWalletBalance(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/wallet/balance`);
  }

  addToWallet(amount: number): Observable<WalletResponse> {
    return this.http.post<WalletResponse>(`${this.baseUrl}/wallet/add`, { amount });
  }

  getWalletStatements(): Observable<WalletStatementResponse[]> {
    return this.http.get<WalletStatementResponse[]>(`${this.baseUrl}/wallet/statements`);
  }

  createRazorpayOrder(payload: RazorpayOrderRequest): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>(
      `${this.baseUrl}/payments/razorpay/create-order`,
      payload
    );
  }

  verifyRazorpayPayment(payload: RazorpayVerifyRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.baseUrl}/payments/razorpay/verify`,
      payload
    );
  }

  createWalletTopUpOrder(payload: RazorpayWalletTopUpRequest): Observable<RazorpayWalletTopUpOrderResponse> {
    return this.http.post<RazorpayWalletTopUpOrderResponse>(
      `${this.baseUrl}/wallet/razorpay/create-order`,
      payload
    );
  }

  verifyWalletTopUpPayment(payload: RazorpayWalletTopUpVerifyRequest): Observable<WalletResponse> {
    return this.http.post<WalletResponse>(
      `${this.baseUrl}/wallet/razorpay/verify`,
      payload
    );
  }
}
