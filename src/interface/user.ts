import { IStudent } from "./student";
import { ITeacher } from "./teacher";

export interface IUser {
  id: string;
  email: string;
  password?: string;
  role: string;
  full_name?: string;
  avatar?: string;
  phone?: string;
  date_of_birth?: Date;
  gender?: string;
  country?: string;
  city?: string;
  status: string;
  email_verified?: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login?: Date;
  login_count?: number;
  created_at?: Date;
  updated_at?: Date;

  teachers?: ITeacher;
  students?: IStudent;
}

export interface IUsers {
  meta: {
    current: number;
    currentSize: number;
    pageSize: number;
    pages: number;
    total: number;
  },
  result: IUser[];
}

export interface IUserUpdate {
  full_name?: string;
  avatar?: string;
  phone?: string;
  date_of_birth?: Date;
  gender?: string;
  country?: string;
  city?: string;
}