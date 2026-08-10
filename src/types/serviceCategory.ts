export interface ServiceCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateServiceCategoryPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ServiceCategoryListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
