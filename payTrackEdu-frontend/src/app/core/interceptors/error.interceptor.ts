import {HttpErrorResponse, HttpInterceptorFn} from "@angular/common/http";
import {catchError, EMPTY, throwError} from "rxjs";
import {inject} from "@angular/core";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {State} from "../data-access/store";
import {ApplicationActions} from "../data-access/application/application.action";
import {ErrorUtils} from "../utils/extract.error";
import {AuthenticationActions} from "../data-access/authentication/auth.action";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
   const store = inject(Store<State>);

    const router = inject(Router);
    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {

            switch (err.status) {
                case 400:
                    store.dispatch(ApplicationActions.handleError({message:ErrorUtils.extractErrorMessage(err)}));
                    break;

                case 403:
                    store.dispatch(ApplicationActions.handleError({message:ErrorUtils.extractErrorMessage(err)}));
                    break;
                case 404:
                    store.dispatch(ApplicationActions.handleError({message:ErrorUtils.extractErrorMessage(err)}));
                    router.navigateByUrl('/dashboard')
                    break;
                case 406:
                    store.dispatch(ApplicationActions.handleError({message:ErrorUtils.extractErrorMessage(err)}));
                    break;
                case 409:
                    store.dispatch(ApplicationActions.handleError({message:ErrorUtils.extractErrorMessage(err)}));
                    break;
                case 422:
                    store.dispatch(ApplicationActions.handleError({message:ErrorUtils.extractErrorMessage(err)}));
                    break;
                case 500:
                    store.dispatch(ApplicationActions.handleError({message:'Le serveur est actuellement indisponible. Veuillez réessayer plus tard.'}));
                    break;
                case 502:
                    store.dispatch(ApplicationActions.handleError({message:ErrorUtils.extractErrorMessage(err)}));
                    break;
                case 401:
                    store.dispatch(ApplicationActions.handleError({message:err?.message || 'Unauthorized'}));
                    store.dispatch(AuthenticationActions.logOut());
                    return EMPTY;
            }
            return throwError(() => new HttpErrorResponse({
                error: 'An error occurred, try again.',
                status: err.status,
                statusText: err.statusText
            }));
        })
    );
}








