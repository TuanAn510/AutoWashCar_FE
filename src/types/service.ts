export interface ServiceCategoryRef {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: ServiceCategoryRef;
  price: number;
  estimatedDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  estimatedDuration: number;
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  estimatedDuration?: number;
  isActive?: boolean;
}

export interface ServiceListParams {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'estimatedDuration' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
