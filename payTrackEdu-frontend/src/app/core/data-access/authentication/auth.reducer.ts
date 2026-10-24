import { createReducer, on } from "@ngrx/store";
import { AuthModel } from "./auth.state";
import { AuthenticationActions } from "../authentication/auth.action";

export const initialAuth: AuthModel = {
    isAuthenticated: false,
    lastTimeAuthenticated: null,
};

export const authReducer = createReducer(
    initialAuth,
    on(AuthenticationActions.successLogin, (state, { response }) => ({
        ...state,
        isAuthenticated: true,
        lastTimeAuthenticated: new Date()
    })),
    on(AuthenticationActions.restoreLogin, (state) => ({
        ...state,
        isAuthenticated: true,
        lastTimeAuthenticated: new Date()
    })),
    on(AuthenticationActions.successLogout, (state) => ({
        ...state,
        isAuthenticated: false,
        lastTimeAuthenticated: null
    }))
);
