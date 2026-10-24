import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { ApplicationActions } from '../../../../core/data-access/application/application.action';
import { State } from '../../../../core/data-access/store';
import {
  normalizePromotionSessionStatus,
  PromotionSessionRequest,
  PromotionSessionResponse,
} from '../../../../core/model/promotion-sessions.model';
import { PromotionSessionService } from '../../../../core/services/promotion-session.service';

type PageRequest = { pageIndex: number; pageSize: number };
type UpdatePromotionSession = {
  id: string;
  promotionSession: PromotionSessionRequest;
};

const initialState = {
  promotionSessions: [] as PromotionSessionResponse[],
  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  loadingPromotionSession: false,
  savingPromotionSession: false,
  saveSuccess: false,
  error: null as string | null,
  filter: {},
  promotionSession: null as PromotionSessionResponse | null,
};

export const PromotionSessionSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    promotionSessionService: inject(PromotionSessionService),
    storeNgrx: inject(Store<State>),
  })),
  withComputed((store) => ({
    promotionSessionsList: computed(() => store.promotionSessions()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),
  withMethods((store) => {
    const loadPromotionSessions = rxMethod<PageRequest | void>(
      pipe(
        tap((request) =>
          patchState(store, {
            loadingPromotionSession: true,
            error: null,
            pagination: {
              ...store.pagination(),
              page: request?.pageIndex ?? store.pagination().page,
              size: request?.pageSize ?? store.pagination().size,
            },
          }),
        ),
        switchMap(() =>
          store.promotionSessionService
            .fetchPromotionSessions$(
              store.pagination().page,
              store.pagination().size,
            )
            .pipe(
              tapResponse({
                next: ({ data }) =>
                  patchState(store, {
                    promotionSessions: data.content.map((promotionSession) => ({
                      ...promotionSession,
                      status: normalizePromotionSessionStatus(
                        promotionSession.status,
                      ),
                    })),
                    pagination: {
                      page: data.number,
                      size: data.size,
                      totalElements: data.totalElements,
                      totalPages: data.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, {
                    error: 'Failed to load promotion sessions',
                  }),
                complete: () =>
                  patchState(store, { loadingPromotionSession: false }),
              }),
            ),
        ),
      ),
    );

    const getPromotionSessionById = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, { loadingPromotionSession: true, error: null }),
        ),
        switchMap((id) =>
          store.promotionSessionService.getPromotionSessionsById$(id).pipe(
            tapResponse({
              next: ({ data }) =>
                patchState(store, {
                  promotionSession: {
                    ...data,
                    status: normalizePromotionSessionStatus(data.status),
                  },
                }),
              error: () =>
                patchState(store, {
                  error: 'Failed to load promotion session',
                }),
              complete: () =>
                patchState(store, { loadingPromotionSession: false }),
            }),
          ),
        ),
      ),
    );

    const createPromotionSession = rxMethod<PromotionSessionRequest>(
      pipe(
        tap(() =>
          patchState(store, {
            savingPromotionSession: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((promotionSession) =>
          store.promotionSessionService
            .createPromotionSession$(promotionSession)
            .pipe(
              tapResponse({
                next: () => {
                  store.storeNgrx.dispatch(
                    ApplicationActions.handleSuccess({
                      message: 'Promotion session has been added successfully',
                    }),
                  );
                  patchState(store, {
                    saveSuccess: true,
                    pagination: { ...store.pagination(), page: 0 },
                  });
                  loadPromotionSessions();
                },
                error: (err) => {
                  console.log('🔴 Create Promotion Session ERROR:', err);
                  patchState(store, {
                    error: 'Failed to create promotion session',
                    saveSuccess: false,
                  });
                },
                finalize: () =>
                  patchState(store, { savingPromotionSession: false }),
              }),
            ),
        ),
      ),
    );

    const updatePromotionSession = rxMethod<UpdatePromotionSession>(
      pipe(
        tap(() =>
          patchState(store, {
            savingPromotionSession: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap(({ id, promotionSession }) =>
          store.promotionSessionService
            .updatePromotionSessions$(id, promotionSession)
            .pipe(
              tapResponse({
                next: () => {
                  store.storeNgrx.dispatch(
                    ApplicationActions.handleSuccess({
                      message: 'Promotion session has been updated successfully',
                    }),
                  );
                  patchState(store, { saveSuccess: true });
                  loadPromotionSessions();
                },
                error: (err) => {
                  console.log('🔴 Update Promotion Session ERROR:', err);
                  patchState(store, {
                    error: 'Failed to update promotion session',
                    saveSuccess: false,
                  });
                },
                finalize: () =>
                  patchState(store, { savingPromotionSession: false }),
              }),
            ),
        ),
      ),
    );

    const deletePromotionSession = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingPromotionSession: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.promotionSessionService.deletePromotionSessions$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Promotion session has been archived successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadPromotionSessions();
              },
              error: (err) => {
                console.log('🔴 Delete Promotion Session ERROR:', err);
                patchState(store, {
                  error: 'Failed to archive promotion session',
                  saveSuccess: false,
                });
              },
              finalize: () =>
                patchState(store, { savingPromotionSession: false }),
            }),
          ),
        ),
      ),
    );

    const restorePromotionSession = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingPromotionSession: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.promotionSessionService.restorePromotionSessions$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Promotion session has been restored successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadPromotionSessions();
              },
              error: (err) => {
                console.log('🔴 Restore Promotion Session ERROR:', err);
                patchState(store, {
                  error: 'Failed to restore promotion session',
                  saveSuccess: false,
                });
              },
              finalize: () =>
                patchState(store, { savingPromotionSession: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadPromotionSessions: (request?: PageRequest) =>
        loadPromotionSessions(request),
      getPromotionSessionById: (id: string) => getPromotionSessionById(id),
      createPromotionSession: (promotionSession: PromotionSessionRequest) =>
        createPromotionSession(promotionSession),
      updatePromotionSession: (payload: UpdatePromotionSession) =>
        updatePromotionSession(payload),
      deletePromotionSession: (id: string) => deletePromotionSession(id),
      restorePromotionSession: (id: string) => restorePromotionSession(id),
    };
  }),
);
