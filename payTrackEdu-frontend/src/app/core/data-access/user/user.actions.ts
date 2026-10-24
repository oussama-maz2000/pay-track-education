import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { User } from "../../model/auth.model";


export const UserActions = createActionGroup({
    source: 'USER',
    events: {
        setUser: props<{ user: User }>(),
        clearUser: emptyProps()
    },
});
