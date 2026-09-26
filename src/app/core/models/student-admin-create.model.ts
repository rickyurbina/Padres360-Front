export interface StudentAdminCreateData {
  first_name: string;
  first_surname: string;
  second_surname: string;
  control_number: string;
  curp: string;
  group_id: number;
  active: boolean;
}

export interface ParentAdminCreateData {
  first_name: string;
  last_name: string;
  email: string;
  cell_phone: string;
}

export interface StudentAdminCreatePayload {
  student: StudentAdminCreateData;
  parents: ParentAdminCreateData[];
}

export interface StudentAdminCreateResponse {
  success: boolean;
  message: string;
  student: {
    id: number;
    first_name: string;
    first_surname: string;
    second_surname: string | null;
    control_number: string | null;
    curp: string;
    group_id: number;
    group: string;
    active: boolean;
    school_id: number;
  };
  parents: Array<{
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    username: string;
    cell_phone: string;
  }>;
}
