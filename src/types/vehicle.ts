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
  /** Khách đã ẩn xe này khỏi tab "Đã khóa". Dữ liệu vẫn còn trong hệ thống.
   *  Tên trường khớp BE `vehicle.customerDismissed`. */
  customerDismissed?: boolean;
  /** Xe mới này thay thế (khóa) xe có biển số nào — null nếu xe không phải kết quả
   *  của việc chuyển quyền biển số. Giúp hiện trạng thái "xe cũ đã bị khóa" / lịch sử. */
  replacedByVehicleId?: number | null;
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
  documents?: Array<{
    url: string;
    id: string;
    mimeType: string;
    name?: string;
    documentType?: 'BRAND_MODEL' | 'PLATE';
  }>;
  /** Vehicle draft carried by a BRAND_MODEL_VERIFICATION request that is waiting
   *  on admin approval before the vehicle is actually created. */
  carType?: CarType;
  manufactureYear?: number;
}
export interface CreateVehicleAccessRequestPayload {
  licensePlate: string;
  relationship: string;
  note?: string;
  documents?: File[];
  /** Minh chứng hãng/dòng xe — only for the combined (biển + hãng/dòng) flow. */
  brandModelDocuments?: File[];
  /** Tên hãng/dòng đề xuất (trường hợp trùng biển số + chọn "Khác"). */
  suggestedBrandName?: string;
  suggestedModelName?: string;
}
