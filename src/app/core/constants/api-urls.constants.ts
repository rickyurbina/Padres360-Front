import { Student } from '@models/student.model';
import { environment } from '../../../environments/environment';

const BASE_URL = environment.API_URL;

// Endpoints base
export const API_BASE = {
  V1: `${BASE_URL}`,
};

// Endpoints de Autenticación
export const AUTH_URLS = {
  LOGIN: `${API_BASE.V1}/api/accounts/login/`,
  LOGOUT: `${API_BASE.V1}/api/accounts/logout/`,
  REFRESH_TOKEN: `${API_BASE.V1}/api/token/refresh/`,
  PROFILE: `${API_BASE.V1}/api/accounts/user-information/`,
  CHANGE_PASSWORD: (pk: number) => `${API_BASE.V1}/api/accounts/user-update/${pk}/`,
};

// Groups API
export const GROUP_URLS = {
  GROUP: (groupId: number) => `${API_BASE.V1}/api/groups/${groupId}/`,
  GROUP_LIST: `${API_BASE.V1}/api/teachers/groups-subjects-teachers/`,
  GROUPS_LIST: `${API_BASE.V1}/api/groups/list/`,
  GROUPS_BY_SCHOOL: `${API_BASE.V1}/api/groups/by-school/`,
  STUDENT_LIST: (groupId: number) => `${API_BASE.V1}/api/groups/${groupId}/students/`,
  CREATE: `${API_BASE.V1}/api/groups/create/`,
  DELETE: (groupId: number) => `${API_BASE.V1}/api/groups/delete/${groupId}/`,
  UPDATE: (groupId: number) => `${API_BASE.V1}/api/groups/update/${groupId}/`
};

// Parents API
export const PARENT_URLS = {
  CREATE: `${API_BASE.V1}/api/parents/create/`,
  PARENT_LIST: `${API_BASE.V1}/api/parents/list/`,
  UPDATE: (parentId: number) => `${API_BASE.V1}/api/parents/${parentId}/update/`
};

// Students API
export const STUDENT_URLS = {
  CREATE: `${API_BASE.V1}/api/students/create/`,
  UPDATE: (studentId: number) => `${API_BASE.V1}/api/students/${studentId}/update/`,
  STUDENT_LIST: `${API_BASE.V1}/api/students/list`,
};

// Incidences API
export const INCIDENCE_URLS = {
  INCIDENCE_LIST: `${API_BASE.V1}/api/incidences/list/`,
  ALL_TEACHER_LIST: `${API_BASE.V1}/api/incidences/teacher-incidences/`,
  ALL_STUDENT_LIST: `${API_BASE.V1}/api/incidences/student-incidences/`,
  TEACHER_LIST: (teacherId: number) => `${API_BASE.V1}/api/incidences/teachers/${teacherId}/`,
  CREATE: `${API_BASE.V1}/api/incidences/incidence-records/`,
  READ_BY_PARENT: (parentId: number) => `${API_BASE.V1}/api/incidences/parents/${parentId}/`,
  MARK_READ: (incidenceId: number) => `${API_BASE.V1}/api/incidences/${incidenceId}/mark-read/`,

  RECORDS: `${API_BASE.V1}/api/incidences/records/`,
};

// Teachers API
export const TEACHER_URLS = {
  LIST: `${API_BASE.V1}/api/teachers/teachers-list/`,
  CREATE: `${API_BASE.V1}/api/teachers/create/`,
  UPDATE: (teacherId: number) => `${API_BASE.V1}/api/teachers/${teacherId}/update/`
};

export const EMERGENCY_DATA = {
  GET_DATA_STUDENT: `${API_BASE.V1}/api/students/medical-information/get/`,
  UPDATE_DATA: `${API_BASE.V1}/api/students/medical-information/create-update/`,
};

export const STUDENT_VALIDATION = {
  GET_DATA_STUDENT: `${API_BASE.V1}/api/students/by-curp/{CURP}`,
  UPDATE_DATA: `${API_BASE.V1}/api/students/by-curp/{CURP}/`,
};