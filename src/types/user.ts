export interface User {
  _id: string;
  phone: string;
  email?: string;
  displayName: string;
  role?: 'admin' | 'staff' | 'customer';
  avatarUrl?: string;
  isActive?: boolean;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  current_password?: string;
  new_password?: string;
  file?: File;
}
