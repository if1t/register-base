export interface IUserProfile {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  photo?: string;
  groups?: string[];
  groups_name?: string[];
  token?: string;
  permissions?: any[];
  attributes?: IUserAttributes[];
}

export interface IUserAttributes {
  name: string;
  value: string;
}
