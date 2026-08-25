import { Student } from '@models/student.model';

export interface LoginResponse {
   id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_staff: boolean
  profile: string
  students: Student[]
  parent_id: number
  role: string
  tokens: Tokens,
  teacher_id: number,
  school_id: number
}

export interface Tokens {
  refresh: string
  access: string
}
