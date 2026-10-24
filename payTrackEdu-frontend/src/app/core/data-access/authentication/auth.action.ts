import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { RequestLogin, ResponseLogin } from "../../model/auth.model";

export const AuthenticationActions = createActionGroup({
    source: 'AUTH',
    events: {
        requestLogin: props<{ request: RequestLogin }>(),
        successLogin: props<{ response: ResponseLogin }>(),
        restoreLogin: props<{ accessToken: string }>(),
        failureLogin: emptyProps(),
        logOut: emptyProps(),
        successLogout: emptyProps(),
    },
});
