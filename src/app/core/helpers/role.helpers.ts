import { UserRole } from '../enums/user-role.enum';

export function toUserRole(value: string): UserRole | null {
  const values = Object.values(UserRole) as string[];
  return values.includes(value) ? (value as UserRole) : null;
}
