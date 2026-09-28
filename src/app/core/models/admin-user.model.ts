export interface AdminUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_label: string;
  school_id: number;
  school_name: string;
  is_active: boolean;
}

export interface AdminUserRole {
  value: string;
  label: string;
}

export interface AdminUserSchool {
  id: number;
  name: string;
}

export interface AdminUserPayload {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  school_id: number;
  is_active: boolean;
  password?: string;
}

export interface AdminUserListResponse {
  success: boolean;
  users: AdminUser[];
  roles: AdminUserRole[];
  schools: AdminUserSchool[];
}

export interface AdminUserResponse {
  success: boolean;
  message?: string;
  user: AdminUser;
}