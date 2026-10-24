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
  PaymentPlan,
  PaymentPlanDetails,
  PaymentPlanRequest,
} from '../../../../core/model/payment-plan.model';
import { PaymentPlanService } from '../../../../core/services/payment-plan.service';

type PageRequest = { pageIndex: number; pageSize: number };
type UpdatePaymentPlan = { id: string; paymentPlan: PaymentPlanRequest };

const initialState = {
  paymentPlans: [] as PaymentPlan[],
  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  loadingPaymentPlan: false,
  savingPaymentPlan: false,
  saveSuccess: false,
  error: null as string | null,
  filter: {},
  paymentPlan: null as PaymentPlanDetails | null,
};

export const PaymentPlanSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    paymentPlanService: inject(PaymentPlanService),
    storeNgrx: inject(Store<State>),
  })),
  withComputed((store) => ({
    paymentPlansList: computed(() => store.paymentPlans()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),
  withMethods((store) => {
    const loadPaymentPlans = rxMethod<PageRequest | void>(
      pipe(
        tap((request) =>
          patchState(store, {
            loadingPaymentPlan: true,
            error: null,
            pagination: {
              ...store.pagination(),
              page: request?.pageIndex ?? store.pagination().page,
              size: request?.pageSize ?? store.pagination().size,
            },
          }),
        ),
        switchMap(() =>
          store.paymentPlanService
            .fetchPaymentPlans$(store.pagination().page, store.pagination().size)
            .pipe(
              tapResponse({
                next: ({ data }) =>
                  patchState(store, {
                    paymentPlans: data.content,
                    pagination: {
                      page: data.number,
                      size: data.size,
                      totalElements: data.totalElements,
                      totalPages: data.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, { error: 'Failed to load payment plans' }),
                complete: () => patchState(store, { loadingPaymentPlan: false }),
              }),
            ),
        ),
      ),
    );

    const getPaymentPlanById = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loadingPaymentPlan: true, error: null })),
        switchMap((id) =>
          store.paymentPlanService.getPaymentPlanById$(id).pipe(
            tapResponse({
              next: ({ data }) => patchState(store, { paymentPlan: data }),
              error: () => patchState(store, { error: 'Failed to load payment plan' }),
              complete: () => patchState(store, { loadingPaymentPlan: false }),
            }),
          ),
        ),
      ),
    );

    const createPaymentPlan = rxMethod<PaymentPlanRequest>(
      pipe(
        tap(() => patchState(store, { savingPaymentPlan: true, error: null, saveSuccess: false })),
        exhaustMap((paymentPlan) =>
          store.paymentPlanService.createPaymentPlan$(paymentPlan).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(ApplicationActions.handleSuccess({ message: 'Payment plan has been added successfully' }));
                patchState(store, { saveSuccess: true, pagination: { ...store.pagination(), page: 0 } });
                loadPaymentPlans();
              },
              error: (err) => {
                console.log('🔴 Create Payment Plan ERROR:', err);
                patchState(store, { error: 'Failed to create payment plan', saveSuccess: false });
              },
              finalize: () => patchState(store, { savingPaymentPlan: false }),
            }),
          ),
        ),
      ),
    );

    const updatePaymentPlan = rxMethod<UpdatePaymentPlan>(
      pipe(
        tap(() => patchState(store, { savingPaymentPlan: true, error: null, saveSuccess: false })),
        exhaustMap(({ id, paymentPlan }) =>
          store.paymentPlanService.updatePaymentPlan$(id, paymentPlan).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(ApplicationActions.handleSuccess({ message: 'Payment plan has been updated successfully' }));
                patchState(store, { saveSuccess: true });
                loadPaymentPlans();
              },
              error: (err) => {
                console.log('🔴 Update Payment Plan ERROR:', err);
                patchState(store, { error: 'Failed to update payment plan', saveSuccess: false });
              },
              finalize: () => patchState(store, { savingPaymentPlan: false }),
            }),
          ),
        ),
      ),
    );

    const deletePaymentPlan = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { savingPaymentPlan: true, error: null, saveSuccess: false })),
        exhaustMap((id) =>
          store.paymentPlanService.deletePaymentPlan$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(ApplicationActions.handleSuccess({ message: 'Payment plan has been deleted successfully' }));
                patchState(store, { saveSuccess: true });
                loadPaymentPlans();
              },
              error: (err) => {
                console.log('🔴 Delete Payment Plan ERROR:', err);
                patchState(store, { error: 'Failed to delete payment plan', saveSuccess: false });
              },
              finalize: () => patchState(store, { savingPaymentPlan: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadPaymentPlans: (request?: PageRequest) => loadPaymentPlans(request),
      getPaymentPlanById: (id: string) => getPaymentPlanById(id),
      createPaymentPlan: (paymentPlan: PaymentPlanRequest) => createPaymentPlan(paymentPlan),
      updatePaymentPlan: (payload: UpdatePaymentPlan) => updatePaymentPlan(payload),
      deletePaymentPlan: (id: string) => deletePaymentPlan(id),
    };
  }),
);
