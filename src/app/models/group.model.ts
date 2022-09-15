import { Role } from "./role.model";
//Model for Groups
export interface Group {
  id: string;
  label: string;
  roleIds: string[];
  isActive: boolean;
}
