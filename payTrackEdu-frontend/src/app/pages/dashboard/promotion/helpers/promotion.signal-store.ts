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
  PromotionRequest,
  PromotionResponse,
} from '../../../../core/model/promotion.model';
import { PromotionService } from '../../../../core/services/promotion.service';

type UpdatePromotion = {
  id: string;
  promotion: PromotionRequest;
};

type PageRequest = {
  pageIndex: number;
  pageSize: number;
};

const initialState = {
  promotions: [] as PromotionResponse[],
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  loadingPromotion: false,
  savingPromotion: false,
  saveSuccess: false,
  error: null as string | null,
  filter: {},
  promotion: null as PromotionResponse | null,
};

export const PromotionSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    promotionService: inject(PromotionService),
    storeNgrx: inject(Store<State>),
  })),
  withComputed((store) => ({
    promotionsList: computed(() => store.promotions()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),
  withMethods((store) => {
    const loadPromotions = rxMethod<PageRequest | void>(
      pipe(
        tap((request) =>
          patchState(store, {
            loadingPromotion: true,
            error: null,
            pagination: {
              ...store.pagination(),
              page: request?.pageIndex ?? store.pagination().page,
              size: request?.pageSize ?? store.pagination().size,
            },
          }),
        ),
        switchMap(() =>
          store.promotionService
            .fetchPromotions$(store.pagination().page, store.pagination().size)
            .pipe(
              tapResponse({
                next: ({ data }) =>
                  patchState(store, {
                    promotions: data.content,
                    pagination: {
                      page: data.number,
                      size: data.size,
                      totalElements: data.totalElements,
                      totalPages: data.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, { error: 'Failed to load promotions' }),
                complete: () =>
                  patchState(store, { loadingPromotion: false }),
              }),
            ),
        ),
      ),
    );

    const getPromotionById = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loadingPromotion: true, error: null })),
        switchMap((id) =>
          store.promotionService.getPromotionById$(id).pipe(
            tapResponse({
              next: ({ data }) => patchState(store, { promotion: data }),
              error: () =>
                patchState(store, { error: 'Failed to load promotion' }),
              complete: () => patchState(store, { loadingPromotion: false }),
            }),
          ),
        ),
      ),
    );

    const createPromotion = rxMethod<PromotionRequest>(
      pipe(
        tap(() =>
          patchState(store, {
            savingPromotion: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((promotion) =>
          store.promotionService.createPromotion$(promotion).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Promotion has been added successfully',
                  }),
                );
                patchState(store, {
                  saveSuccess: true,
                  pagination: { ...store.pagination(), page: 0 },
                });
                loadPromotions();
              },
              error: (err) => {
                console.log('🔴 Create Promotion ERROR:', err);
                patchState(store, {
                  error: 'Failed to create promotion',
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingPromotion: false }),
            }),
          ),
        ),
      ),
    );

    const updatePromotion = rxMethod<UpdatePromotion>(
      pipe(
        tap(() =>
          patchState(store, {
            savingPromotion: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap(({ id, promotion }) =>
          store.promotionService.updatePromotion$(id, promotion).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Promotion has been updated successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadPromotions();
              },
              error: (err) => {
                console.log('🔴 Update Promotion ERROR:', err);
                patchState(store, {
                  error: 'Failed to update promotion',
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingPromotion: false }),
            }),
          ),
        ),
      ),
    );

    const deletePromotion = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingPromotion: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.promotionService.deletePromotion$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Promotion has been archived successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadPromotions();
              },
              error: (err) => {
                console.log('🔴 Delete Promotion ERROR:', err);
                patchState(store, {
                  error: 'Failed to archive promotion',
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingPromotion: false }),
            }),
          ),
        ),
      ),
    );

    const restorePromotion = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingPromotion: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.promotionService.restorePromotion$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Promotion has been restored successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadPromotions();
              },
              error: (err) => {
                console.log('🔴 Restore Promotion ERROR:', err);
                patchState(store, {
                  error: 'Failed to restore promotion',
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingPromotion: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadPromotions: (request?: PageRequest) => loadPromotions(request),
      getPromotionById: (id: string) => getPromotionById(id),
      createPromotion: (promotion: PromotionRequest) => createPromotion(promotion),
      updatePromotion: (payload: UpdatePromotion) => updatePromotion(payload),
      deletePromotion: (id: string) => deletePromotion(id),
      restorePromotion: (id: string) => restorePromotion(id),
    };
  }),
);
