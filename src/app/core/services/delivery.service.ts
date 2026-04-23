import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type VehicleType = 'BIKE' | 'SCOOTER' | 'CYCLE' | 'TRUCK';

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
  status: string;
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

  assignOrder(agentId: number, orderId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/assign-order`, {
      agentId,
      orderId
    });
  }

  completeDelivery(payload: CompleteDeliveryRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/complete-delivery`, payload);
  }
}