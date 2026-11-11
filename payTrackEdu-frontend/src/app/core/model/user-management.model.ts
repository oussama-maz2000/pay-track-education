export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export type RequestUser = {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
};

export type UpdateUser = Omit<RequestUser, 'password'> & {
  isActive: boolean;
};

export type ResponseUser = Omit<UpdateUser, 'password'> & {
  id: string;
  createdAt: Date | string | null;
  createdBy: string | null;
};

export type UpdateUserPassword = {
  oldPassword: string;
  newPassword: string;
};

export type UpdatePasswordRequest = {
  newPassword: string;
};
