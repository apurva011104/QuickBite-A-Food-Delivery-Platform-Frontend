import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
}