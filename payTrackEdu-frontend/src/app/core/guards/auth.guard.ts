import { inject } from "@angular/core";
import { CanActivateChildFn, CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { State } from "../data-access/store";
import { selectAuthProp } from "../data-access/authentication/auth.selector";

export const authGuard: CanActivateFn = () => {
    const store = inject(Store<State>)
    const isAuthenticated = store.selectSignal(selectAuthProp('isAuthenticated'))
    const router = inject(Router);
    if (!isAuthenticated()) {
        router.navigateByUrl('/signin');
        return false;
    }
    return true;
}
export const authChildGuard: CanActivateChildFn = (...args) => authGuard(...args);
