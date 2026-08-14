export interface VehicleImage {
  url: string;
  id: string;
}

export type CarType = 'sedan' | 'suv' | 'pickup';
export type VehicleVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VehicleBrand {
  _id: string;
  name: string;
  models?: VehicleModel[];
  isNew?: boolean;
}

export interface VehicleModel {
  _id: string;
  name: string;
  isNew?: boolean;
}

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
  verificationStatus?: VehicleVerificationStatus;
}

export interface CreateVehiclePayload {
  brand: string;
  model: string;
  /** Set when the brand was chosen from the catalog dropdown. */
  brandId?: string;
  /** Set when the model was chosen from the catalog dropdown. */
  modelId?: string;
  /** Set when the brand was chosen as OTHER (custom). */
  suggestedBrandName?: string;
  /** Set when the model was chosen as OTHER (custom). */
  suggestedModelName?: string;
  licensePlate: string;
  year: number;
  carType: CarType;
  files?: File[];
}

export interface UpdateVehiclePayload {
  brand?: string;
  model?: string;
  brandId?: string;
  modelId?: string;
  suggestedBrandName?: string;
  suggestedModelName?: string;
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
  requestType?: 'access_request' | 'brand_model_verification';
  /** Suggested brand name when the vehicle was submitted with a custom (OTHER) brand. */
  suggestedBrandName?: string;
  /** Suggested model name when the vehicle was submitted with a custom (OTHER) model. */
  suggestedModelName?: string;
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
