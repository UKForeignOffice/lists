export interface User {
  email: string;
  roles?: Roles[];
}

export enum Roles {
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  Editor = "Editor",
}
