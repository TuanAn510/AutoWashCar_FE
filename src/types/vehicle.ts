export interface VehicleImage {
  url: string;
  id: string;
}

export type CarType = 'sedan' | 'suv' | 'pickup';

export interface VehicleCustomerSummary {
  _id: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ApiVehicle {
  _id: string;
  customerId?: string | VehicleCustomerSummary;
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  carType: CarType;
  images?: VehicleImage[];
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehiclePayload {
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  carType: CarType;
  files?: File[];
}

export interface UpdateVehiclePayload {
  brand?: string;
  model?: string;
  licensePlate?: string;
  year?: number;
  carType?: CarType;
  files?: File[];
}

export interface VehicleListResult {
  vehicles: ApiVehicle[];
  total: number;
  message: string;
}

export type VehicleAccessRequestStatus = 'pending' | 'approved' | 'rejected';
export interface VehicleAccessRequest {
  _id: string;
  licensePlate: string;
  relationship: string;
  note?: string;
  status: VehicleAccessRequestStatus;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
  requesterId?: string | { _id: string; displayName?: string; phone?: string; email?: string };
  vehicleId?: ApiVehicle;
  documents?: Array<{ url: string; id: string; mimeType: string; name?: string }>;
}
export interface CreateVehicleAccessRequestPayload {
  licensePlate: string;
  relationship: string;
  note?: string;
  documents?: File[];
}
