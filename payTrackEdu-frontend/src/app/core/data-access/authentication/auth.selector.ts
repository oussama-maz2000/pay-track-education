import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthModel } from "./auth.state";

export const selectAuthState = createFeatureSelector<AuthModel>('AUTH_STORE');
export const selectApplication = createSelector(selectAuthState, (state) => state);

// to use dynamic select : store.select(selectApplicationProp('isAuthenticated'))
export const selectAuthProp = <K extends keyof AuthModel>(prop: K) =>
    createSelector(selectAuthState, (state) => state[prop]);
