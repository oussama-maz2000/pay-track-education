import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { Store } from '@ngrx/store';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { ApplicationActions } from '../../../../core/data-access/application/application.action';
import { State } from '../../../../core/data-access/store';
import {
  RequestUser,
  ResponseUser,
  UpdatePasswordRequest,
  UpdateUser,
  UpdateUserPassword,
} from '../../../../core/model/user-management.model';
import { UserManagementService } from '../../../../core/services/user-management.service';

type PageRequest = { pageIndex?: number; pageSize?: number };
type UpdateUserPayload = { id: string; user: UpdateUser };
type ResetPasswordPayload = { id: string; request: UpdatePasswordRequest };

const initialState = {
  users: [] as ResponseUser[],
  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  loadingUsers: false,
  savingUser: false,
  saveSuccess: false,
  error: null as string | null,
};

export const UserSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    userManagementService: inject(UserManagementService),
    storeNgrx: inject(Store<State>),
  })),
  withComputed((store) => ({
    usersList: computed(() => store.users()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),
  withMethods((store) => {
    const loadUsers = rxMethod<PageRequest | void>(
      pipe(
        tap((request) =>
          patchState(store, {
            loadingUsers: true,
            error: null,
            pagination: {
              ...store.pagination(),
              page: request?.pageIndex ?? store.pagination().page,
              size: request?.pageSize ?? store.pagination().size,
            },
          }),
        ),
        switchMap(() =>
          store.userManagementService
            .fetchUsers$(store.pagination().page, store.pagination().size)
            .pipe(
              tapResponse({
                next: ({ data }) =>
                  patchState(store, {
                    users: data.content,
                    pagination: {
                      page: data.number,
                      size: data.size,
                      totalElements: data.totalElements,
                      totalPages: data.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, { error: 'Impossible de charger les utilisateurs.' }),
                finalize: () => patchState(store, { loadingUsers: false }),
              }),
            ),
        ),
      ),
    );

    const createUser = rxMethod<RequestUser>(
      pipe(
        tap(() =>
          patchState(store, { savingUser: true, error: null, saveSuccess: false }),
        ),
        exhaustMap((user) =>
          store.userManagementService.createUser$(user).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({ message: 'Utilisateur créé avec succès.' }),
                );
                patchState(store, {
                  saveSuccess: true,
                  pagination: { ...store.pagination(), page: 0 },
                });
                loadUsers();
              },
              error: () =>
                patchState(store, {
                  error: 'Impossible de créer cet utilisateur.',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingUser: false }),
            }),
          ),
        ),
      ),
    );

    const updateUser = rxMethod<UpdateUserPayload>(
      pipe(
        tap(() =>
          patchState(store, { savingUser: true, error: null, saveSuccess: false }),
        ),
        exhaustMap(({ id, user }) =>
          store.userManagementService.updateUser$(id, user).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({ message: 'Utilisateur mis à jour.' }),
                );
                patchState(store, { saveSuccess: true });
                loadUsers();
              },
              error: () =>
                patchState(store, {
                  error: 'Impossible de mettre à jour cet utilisateur.',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingUser: false }),
            }),
          ),
        ),
      ),
    );

    const deactivateUser = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, { savingUser: true, error: null, saveSuccess: false }),
        ),
        exhaustMap((id) =>
          store.userManagementService.deactivateUser$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({ message: 'Utilisateur désactivé.' }),
                );
                patchState(store, { saveSuccess: true });
                loadUsers();
              },
              error: () =>
                patchState(store, {
                  error: 'Impossible de désactiver cet utilisateur.',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingUser: false }),
            }),
          ),
        ),
      ),
    );

    const resetUserPassword = rxMethod<ResetPasswordPayload>(
      pipe(
        tap(() =>
          patchState(store, { savingUser: true, error: null, saveSuccess: false }),
        ),
        exhaustMap(({ id, request }) =>
          store.userManagementService.resetUserPassword$(id, request).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({ message: 'Mot de passe réinitialisé.' }),
                );
                patchState(store, { saveSuccess: true });
              },
              error: () =>
                patchState(store, {
                  error: 'Impossible de réinitialiser le mot de passe.',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingUser: false }),
            }),
          ),
        ),
      ),
    );

    const changePassword = rxMethod<UpdateUserPassword>(
      pipe(
        tap(() =>
          patchState(store, { savingUser: true, error: null, saveSuccess: false }),
        ),
        exhaustMap((request) =>
          store.userManagementService.changePassword$(request).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({ message: 'Mot de passe modifié.' }),
                );
                patchState(store, { saveSuccess: true });
              },
              error: () =>
                patchState(store, {
                  error: 'Impossible de modifier le mot de passe.',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingUser: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadUsers: (request?: PageRequest) => loadUsers(request),
      createUser: (user: RequestUser) => createUser(user),
      updateUser: (payload: UpdateUserPayload) => updateUser(payload),
      deactivateUser: (id: string) => deactivateUser(id),
      resetUserPassword: (payload: ResetPasswordPayload) => resetUserPassword(payload),
      changePassword: (request: UpdateUserPassword) => changePassword(request),
    };
  }),
);
