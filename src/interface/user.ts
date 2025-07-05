import { IProfile } from "./profile";
import { ITeacher } from "./teacher";

export interface IUser {
    id: String;
    email: String;
    password?: String;
    role: String;
    status: String;
    email_verified?: Boolean;
    email_verification_token?: String;
    password_reset_token?: String;
    password_reset_expires?: Date;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
    login_count?: Number;

    teacher?: ITeacher;
    profile?: IProfile
}

