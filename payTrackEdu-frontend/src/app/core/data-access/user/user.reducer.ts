
import { createReducer, on } from "@ngrx/store";
import { UserActions } from "../user/user.actions";
import { User } from "../../model/auth.model";
export const initialUser: User = {
    id: undefined,
    username: undefined,
    fullName: undefined,
    phone: undefined,
    email: undefined,
    role: undefined,
    enabled:undefined,
    deleted:undefined
};

export const userReducer = createReducer(initialUser,
    on(UserActions.setUser, (state, { user }) => ({ ...state, ...user })),
    on(UserActions.clearUser,(state)=>({...state,...initialUser}))
)
