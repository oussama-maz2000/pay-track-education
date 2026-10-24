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
  CancelPaymentDto,
  CreatePaymentDto,
  PaymentDto,
  PaymentResponse,
} from '../../../../core/model/payment.model';
import { PaymentService } from '../../../../core/services/payment.service';

type LoadRequest = {
  enrollmentId: string;
  pageIndex?: number;
  pageSize?: number;
};

type CancelRequest = {
  enrollmentId: string;
  paymentId: string;
  payload: CancelPaymentDto;
};

const initialState = {
  payments: [] as PaymentDto[],
  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  loading: false,
  loadingDetails: false,
  saving: false,
  saveSuccess: false,
  error: null as string | null,
  payment: null as PaymentResponse | null,
};

export const PaymentSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    service: inject(PaymentService),
    storeNgrx: inject(Store<State>),
  })),
  withComputed((store) => ({ paymentsList: computed(() => store.payments()) })),
  withMethods((store) => {
    const loadPayments = rxMethod<LoadRequest>(
      pipe(
        tap((request) =>
          patchState(store, {
            loading: true,
            error: null,
            pagination: {
              ...store.pagination(),
              page: request.pageIndex ?? store.pagination().page,
              size: request.pageSize ?? store.pagination().size,
            },
          }),
        ),
        switchMap(({ enrollmentId }) =>
          store.service
            .fetchPaymentsByEnrollmentId$(
              enrollmentId,
              store.pagination().page,
              store.pagination().size,
            )
            .pipe(
              tapResponse({
                next: ({ data }) =>
                  patchState(store, {
                    payments: data.content,
                    pagination: {
                      page: data.number,
                      size: data.size,
                      totalElements: data.totalElements,
                      totalPages: data.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, { error: 'Failed to load payments.' }),
                finalize: () => patchState(store, { loading: false }),
              }),
            ),
        ),
      ),
    );

    const getPaymentById = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            loadingDetails: true,
            error: null,
            payment: null,
          }),
        ),
        switchMap((paymentId) =>
          store.service.getPaymentById$(paymentId).pipe(
            tapResponse({
              next: ({ data }) => patchState(store, { payment: data }),
              error: () =>
                patchState(store, { error: 'Failed to load payment details.' }),
              finalize: () => patchState(store, { loadingDetails: false }),
            }),
          ),
        ),
      ),
    );

    const createPayment = rxMethod<{
      enrollmentId: string;
      payload: CreatePaymentDto;
    }>(
      pipe(
        tap(() =>
          patchState(store, { saving: true, error: null, saveSuccess: false }),
        ),
        exhaustMap(({ enrollmentId, payload }) =>
          store.service.createPayment$(payload).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Payment has been recorded successfully.',
                  }),
                );
                patchState(store, {
                  saveSuccess: true,
                  pagination: { ...store.pagination(), page: 0 },
                });
                loadPayments({ enrollmentId, pageIndex: 0 });
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to record the payment.',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { saving: false }),
            }),
          ),
        ),
      ),
    );

    const cancelPayment = rxMethod<CancelRequest>(
      pipe(
        tap(() =>
          patchState(store, { saving: true, error: null, saveSuccess: false }),
        ),
        exhaustMap(({ enrollmentId, paymentId, payload }) =>
          store.service.cancelPayment$(paymentId, payload).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Payment has been cancelled successfully.',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadPayments({ enrollmentId });
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to cancel the payment.',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { saving: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadPayments: (request: LoadRequest) => loadPayments(request),
      getPaymentById: (paymentId: string) => getPaymentById(paymentId),
      createPayment: (request: { enrollmentId: string; payload: CreatePaymentDto }) =>
        createPayment(request),
      cancelPayment: (request: CancelRequest) => cancelPayment(request),
    };
  }),
);
