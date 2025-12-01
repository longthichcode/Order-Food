export enum Role {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}
export enum Gender{
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export interface User {
  userId: number;
  username: string;
  password: string;
  fullName: string;
  gender: Gender;
  phone: string;
  email: string;
  role: Role;
  createdAt: string;
  status: boolean
}
