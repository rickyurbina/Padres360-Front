export interface StudentValidationResponse {
  student: StudentValidation;
  parents: ParentValidation[];
  message?: string;
}

export interface StudentValidation {
  id?: number;
  name: string;
  lastName: string;
  motherLastName: string;
  controlNumber: string;
  curp: string;
  group: string;
  groupId?: number;
  schoolId?: number;
  schoolName?: string;
}

export interface ParentValidation {
  id?: number;
  fullName: string;
  firstName: string;
  surnames: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  relationship?: string;
}