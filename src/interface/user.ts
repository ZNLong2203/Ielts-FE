import { IProfile } from "./profile";
import { ITeacher } from "./teacher";

export interface IUser {
    id: string;
    email: string;
    password?: string;
    role: string;
    status: string;
    email_verified?: boolean;
    email_verification_token?: string;
    password_reset_token?: string;
    password_reset_expires?: Date;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
    login_count?: number;

    teachers?: ITeacher;
    profiles?: IProfile
}

