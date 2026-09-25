export interface StudentAdminEditData {
  id: number;
  first_name: string;
  first_surname: string;
  second_surname: string;
  control_number: string;
  curp: string;
  group_id: number | null;
  group: string | null;
  active: boolean;
  school_id: number;
}

export interface ParentAdminEditData {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  username?: string;
  cell_phone: string;
  password?: string;
}

export interface StudentAdminEditResponse {
  success: boolean;
  message?: string;
  student: StudentAdminEditData;
  parents: ParentAdminEditData[];
}

export interface StudentAdminEditPayload {
  student: {
    first_name: string;
    first_surname: string;
    second_surname: string;
    control_number: string;
    curp: string;
    group_id: number | null;
    active: boolean;
  };
  parents: Array<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    cell_phone: string;
    password?: string;
  }>;
}