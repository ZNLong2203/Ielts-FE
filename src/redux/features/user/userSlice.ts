import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

import { IUser } from "@/interface/user";
import { IProfile } from "@/interface/profile";

const initialState: IUser = {
    id: "",
    email: "",
    password: "",
    role: "",
    status: "",
    email_verified: false,
    email_verification_token: "",
    password_reset_token: "",
    password_reset_expires: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    last_login: new Date(),
    profile: undefined as IProfile | undefined,
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        saveUser: (state, action: PayloadAction<IUser>) => {
           return { ...state, ...action.payload };
        }
    },
})

// Action
export const { saveUser } = userSlice.actions;

// Selector
export const selectUser = (state: RootState): IUser => state.user;

