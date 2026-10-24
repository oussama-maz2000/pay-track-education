import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, of, tap } from 'rxjs';
import { AuthFacade } from '../../facade/auth.facade';
import { ResponseLogin, User } from '../../model/auth.model';
import { UserActions } from '../user/user.actions';
import { AuthenticationActions } from './auth.action';

@Injectable({ providedIn: 'root' })
export class AuthenticationEffect {
  private actions$: Actions = inject(Actions);
  private authFacade = inject(AuthFacade);
  private router: Router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthenticationActions.requestLogin),
      exhaustMap(({ request }) =>
        this.authFacade.login(request).pipe(
          map((res: ResponseLogin) =>
            AuthenticationActions.successLogin({ response: res }),
          ),
          catchError(() => of(AuthenticationActions.failureLogin())),
        ),
      ),
    ),
  );

  onLoginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthenticationActions.successLogin),
      map(({ response }) => {
        const user: User = this.authFacade.storeLoginSession(response.data);
        return UserActions.setUser({ user });
      }),
    ),
  );

  restoreCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthenticationActions.restoreLogin),
      exhaustMap(() =>
        this.authFacade.currentUser().pipe(
          map(({ data }) =>
            UserActions.setUser({
              user: this.authFacade.userFromProfile(data),
            }),
          ),
          catchError(() => of(AuthenticationActions.logOut())),
        ),
      ),
    ),
  );

  redirectAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          AuthenticationActions.successLogin,
          AuthenticationActions.restoreLogin,
        ),
        tap(() => {
          this.router.navigateByUrl('/');
        }),
      ),
    { dispatch: false },
  );

  logOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthenticationActions.logOut),
      tap(() => this.authFacade.signOut()),
      mergeMap(() => [
        UserActions.clearUser(),
        AuthenticationActions.successLogout(),
      ]),
    ),
  );
}
