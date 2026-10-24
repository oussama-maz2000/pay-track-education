import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs';
import { AuthFacade } from '../../facade/auth.facade';
import { AuthenticationActions } from '../authentication/auth.action';
import { ApplicationActions } from './application.action';

@Injectable({ providedIn: 'root' })
export class ApplicationEffect {
  private _actions: Actions = inject(Actions);
  private _auhFacade: AuthFacade = inject(AuthFacade);
  private router: Router = inject(Router);

  errorHandler$ = createEffect(
    () =>
      this._actions.pipe(
        ofType(ApplicationActions.handleError),
        tap(({ message }) => console.error(message)),
      ),
    { dispatch: false },
  );

  successHandlerWithRouting$ = createEffect(
    () =>
      this._actions.pipe(
        ofType(ApplicationActions.handleSuccessWithRouting),
        tap(({ message, navigateTo }) => {
          console.info(message);
          this.router.navigateByUrl(navigateTo);
        }),
      ),
    { dispatch: false },
  );

  successHandler$ = createEffect(
    () =>
      this._actions.pipe(
        ofType(ApplicationActions.handleSuccess),
        tap(({ message }) => console.log('Success action received:', message)),
        tap(({ message }) => console.info(message)),
      ),
    { dispatch: false },
  );

  initApplication$ = createEffect(() =>
    this._actions.pipe(
      ofType(ApplicationActions.init),
      map(() => this._auhFacade.init()),
      map(({ token, valid }) =>
        valid
          ? AuthenticationActions.restoreLogin({ accessToken: token! })
          : ApplicationActions.initUnauthenticated(),
      ),
    ),
  );

  initUnauthenticatedNavigate$ = createEffect(
    () =>
      this._actions.pipe(
        ofType(ApplicationActions.initUnauthenticated),
        tap(() => this.router.navigateByUrl('/signin')),
      ),
    { dispatch: false },
  );

  loginLoading$ = createEffect(() =>
    this._actions.pipe(
      ofType(
        AuthenticationActions.requestLogin,
        AuthenticationActions.successLogin,
        AuthenticationActions.failureLogin,
        AuthenticationActions.logOut,
      ),
      map((action) =>
        ApplicationActions.setLoading({
          loading: action.type === AuthenticationActions.requestLogin.type,
        }),
      ),
    ),
  );
}
