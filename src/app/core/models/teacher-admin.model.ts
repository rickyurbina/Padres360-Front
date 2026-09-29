export interface TeacherAssignmentAdmin {
  id?: number;
  subject_id: number;
  group_id: number;
}

export interface TeacherGroupOption {
  id: number;
  grade: number;
  name: string;
  group: string;
  specialty: string;
  shift: string;
}

export interface TeacherSubjectOption {
  id: number;
  subject_key: string;
  name: string;
}

export interface TeacherAdminData {
  id: number;
  first_name: string;
  first_surname: string;
  second_surname: string;
  phone: string;
  email: string;
  active: boolean;
  school_id: number;
  assignments: TeacherAssignmentAdmin[];
}

export interface TeacherAdminPayload {
  first_name: string;
  first_surname: string;
  second_surname: string;
  phone: string;
  email: string;
  active: boolean;
  password?: string;
  assignments: TeacherAssignmentAdmin[];
}

export interface TeacherCreateOptionsResponse {
  success: boolean;
  school_id: number;
  groups: TeacherGroupOption[];
  subjects: TeacherSubjectOption[];
}

export interface TeacherEditResponse {
  success: boolean;
  teacher: TeacherAdminData;
  groups: TeacherGroupOption[];
  subjects: TeacherSubjectOption[];
}

export interface TeacherSaveResponse {
  success: boolean;
  message: string;
  teacher: TeacherAdminData;
}