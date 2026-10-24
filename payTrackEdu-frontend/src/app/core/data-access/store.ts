import { ActionReducerMap } from '@ngrx/store';

import { AuthModel } from "./authentication/auth.state";
import { User } from '../model/auth.model';
import { Application } from '../model/application.model';
import { userReducer } from './user/user.reducer';
import { authReducer } from './authentication/auth.reducer';
import { applicationReducer } from './application/application.reducer';

export interface State {

    USER_STORE: User,
    AUTH_STORE: AuthModel,
    APPLICATION_STORE: Application,
}

export const reducers: ActionReducerMap<State> = {
    USER_STORE: userReducer,
    AUTH_STORE: authReducer,
    APPLICATION_STORE: applicationReducer,

};
