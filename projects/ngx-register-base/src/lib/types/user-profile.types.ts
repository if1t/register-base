export interface IUserProfile<PermissionType = any> {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  photo?: string;
  groups?: string[];
  groups_name?: string[];
  token?: string;
  permissions?: PermissionType[];
  attributes?: IUserAttributes[];
}

export interface IUserAttributes {
  name: string;
  value: string;
}
