import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type VehicleType = 'BIKE' | 'SCOOTER' | 'CYCLE' | 'TRUCK';
export type DeliveryStatus = 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'REJECTED';

export interface DeliveryAgentRequest {
  fullName: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
}

export interface DeliveryAgentResponse {
  agentId: number;
  userId: number;
  fullName: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  currentLatitude: number | null;
  currentLongitude: number | null;
  available: boolean;
  verified: boolean;
  avgRating: number | null;
  totalDeliveries: number;
}

export interface ActiveDeliveryResponse {
  orderId: number;
  agentId: number;
  status: DeliveryStatus;
}

export interface LocationUpdateRequest {
  currentLatitude: number;
  currentLongitude: number;
}

export interface AvailabilityUpdateRequest {
  available: boolean;
}

export interface CompleteDeliveryRequest {
  agentId: number;
  orderId: number;
  otp: string;
}

export interface PickupDeliveryRequest {
  agentId: number;
  orderId: number;
}

export interface DeliveryCompletionOtpResponse {
  orderId: number;
  otp: string;
  status: DeliveryStatus;
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/agents`;

  constructor(private readonly http: HttpClient) {}

  registerAgent(payload: DeliveryAgentRequest): Observable<DeliveryAgentResponse> {
    return this.http.post<DeliveryAgentResponse>(`${this.baseUrl}/register`, payload);
  }

  getAgentById(agentId: number): Observable<DeliveryAgentResponse> {
    return this.http.get<DeliveryAgentResponse>(`${this.baseUrl}/${agentId}`);
  }

  getAgentByUserId(userId: number): Observable<DeliveryAgentResponse> {
    return this.http.get<DeliveryAgentResponse>(`${this.baseUrl}/user/${userId}`);
  }

  getAllAvailableAgents(): Observable<DeliveryAgentResponse[]> {
    return this.http.get<DeliveryAgentResponse[]>(`${this.baseUrl}/available`);
  }

  getAllVerifiedAgents(): Observable<DeliveryAgentResponse[]> {
    return this.http.get<DeliveryAgentResponse[]>(`${this.baseUrl}/verified`);
  }

  getNearbyAgents(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Observable<DeliveryAgentResponse[]> {
    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('radiusKm', radiusKm);

    return this.http.get<DeliveryAgentResponse[]>(`${this.baseUrl}/nearby`, { params });
  }

  updateLocation(agentId: number, payload: LocationUpdateRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${agentId}/location`, payload);
  }

  setAvailability(agentId: number, payload: AvailabilityUpdateRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${agentId}/availability`, payload);
  }

  verifyAgent(agentId: number, verified: boolean): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${agentId}/verify`, { verified });
  }

  getActiveDeliveries(agentId: number): Observable<ActiveDeliveryResponse[]> {
    return this.http.get<ActiveDeliveryResponse[]>(`${this.baseUrl}/${agentId}/active-deliveries`);
  }

  getCompletionOtp(orderId: number): Observable<DeliveryCompletionOtpResponse> {
    return this.http.get<DeliveryCompletionOtpResponse>(`${this.baseUrl}/orders/${orderId}/completion-otp`);
  }

  assignOrder(agentId: number, orderId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/assign-order`, {
      agentId,
      orderId
    });
  }

  acceptDelivery(payload: PickupDeliveryRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/accept-delivery`, payload);
  }

  rejectDelivery(payload: PickupDeliveryRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/reject-delivery`, payload);
  }

  pickupDelivery(payload: PickupDeliveryRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/pickup-delivery`, payload);
  }

  completeDelivery(payload: CompleteDeliveryRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/complete-delivery`, payload);
  }
}
