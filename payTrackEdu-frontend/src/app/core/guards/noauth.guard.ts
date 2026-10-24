import { inject } from "@angular/core";
import { CanActivateChildFn, CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { State } from "../data-access/store";
import { selectAuthProp } from "../data-access/authentication/auth.selector";

export const noAuthGuard: CanActivateFn = () => {
    const store = inject(Store<State>);
    const router = inject(Router);

    const isAuthenticated = store.selectSignal(
        selectAuthProp('isAuthenticated')
    );

    if (isAuthenticated()) {
        router.navigateByUrl('/');
        return false;
    }

    return true;
};

export const noAuthChildGuard: CanActivateChildFn = (...args) =>
    noAuthGuard(...args);