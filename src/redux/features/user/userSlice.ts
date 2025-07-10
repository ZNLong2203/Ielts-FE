import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

import { IUser } from "@/interface/user";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: IUser; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;

      // Save access token to localStorage
      localStorage.setItem("accessToken", action.payload.accessToken);
    },

    loginFailure: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // Remove access token from localStorage
      localStorage.removeItem("accessToken");
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // Remove access token from localStorage
      localStorage.removeItem("accessToken");
    },

    saveUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },

    restoreAuth: (state) => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        state.accessToken = token;
        state.isAuthenticated = true;
      }
    },
  },
});

// Export actions for use in components
export const { loginSuccess, loginFailure, logout, saveUser, restoreAuth } =
  userSlice.actions;

// Selectors to access user state
export const selectUser = (state: RootState) => state.user.user;
export const selectAccessToken = (state: RootState) => state.user.accessToken;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const selectUserRole = (state: RootState) => state.user.user?.role;
