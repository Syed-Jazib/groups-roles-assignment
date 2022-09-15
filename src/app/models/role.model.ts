//Model for Roles
export interface Role {
  id: string;
  label: string;
  accessRights: string[];
  isActive: boolean;
}
