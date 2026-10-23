export interface UserRoleSummary {
  id: string;
  code: string;
  name: string;
}

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  roles: UserRoleSummary[];
}

export interface RoleListItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
}

export interface UserRoleDetail {
  roleId: string;
  roleCode: string;
  roleName: string;
  description: string | null;
  isActive: boolean;
  assignedAt: string | null;
  assignedBy: string | null;
  assignedByName: string | null;
  permissionCount: number;
}

export interface AssignUserRolesRequest {
  roleIds: string[];
}

export interface UserRoleAssignment {
  userId: string;
  request: AssignUserRolesRequest;
}
