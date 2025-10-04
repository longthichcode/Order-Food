export enum Role {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

export interface User {
  userId: number;
  username: string;
  password: string;
  fullName: string;
  phone: number;
  email: string;
  role: Role;
  createdAt: string;
}
