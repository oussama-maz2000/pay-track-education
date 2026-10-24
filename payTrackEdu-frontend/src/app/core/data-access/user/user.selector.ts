import {createFeatureSelector, createSelector} from "@ngrx/store";
import {User} from "../../model/auth.model";


export const selectUserState = createFeatureSelector<User>('USER_STORE');
export const selectUser = createSelector(selectUserState, (state) => state);

// to use dynamic select : store.select(selectApplicationProp('isAuthenticated'))
export const selectUserProp = <K extends keyof User>(prop: K) =>
    createSelector(selectUserState, (state) => state[prop]);
