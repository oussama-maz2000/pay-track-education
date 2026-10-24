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
  PaymentPlanForInstallmentDetails,
  PaymentPlanInstallmentDto,
  PaymentPlanInstallmentRequest,
} from '../../../../core/model/payment-plan-installment.model';
import { PaymentPlanInstallmentService } from '../../../../core/services/payment-plan-installment.service';

type PageRequest = { pageIndex: number; pageSize: number };
type UpdatePaymentPlanInstallment = {
  id: string;
  installment: PaymentPlanInstallmentRequest;
};

const initialState = {
  installments: [] as PaymentPlanInstallmentDto[],
  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  loadingInstallments: false,
  loadingInstallmentDetails: false,
  savingInstallment: false,
  saveSuccess: false,
  error: null as string | null,
  installment: null as PaymentPlanForInstallmentDetails | null,
};

export const PaymentPlanInstallmentSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    installmentService: inject(PaymentPlanInstallmentService),
    storeNgrx: inject(Store<State>),
  })),
  withComputed((store) => ({
    installmentsList: computed(() => store.installments()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),
  withMethods((store) => {
    const loadInstallments = rxMethod<PageRequest | void>(
      pipe(
        tap((request) =>
          patchState(store, {
            loadingInstallments: true,
            error: null,
            pagination: {
              ...store.pagination(),
              page: request?.pageIndex ?? store.pagination().page,
              size: request?.pageSize ?? store.pagination().size,
            },
          }),
        ),
        switchMap(() =>
          store.installmentService
            .fetchPaymentPlansInstallments$(
              store.pagination().page,
              store.pagination().size,
            )
            .pipe(
              tapResponse({
                next: ({ data }) =>
                  patchState(store, {
                    installments: data.content,
                    pagination: {
                      page: data.number,
                      size: data.size,
                      totalElements: data.totalElements,
                      totalPages: data.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, {
                    error: 'Failed to load payment plan installments',
                  }),
                finalize: () => patchState(store, { loadingInstallments: false }),
              }),
            ),
        ),
      ),
    );

    const getInstallmentById = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            loadingInstallmentDetails: true,
            error: null,
            installment: null,
          }),
        ),
        switchMap((id) =>
          store.installmentService.getPaymentPlanInstallmentById$(id).pipe(
            tapResponse({
              next: ({ data }) => patchState(store, { installment: data }),
              error: () =>
                patchState(store, {
                  error: 'Failed to load payment plan installment details',
                }),
              finalize: () =>
                patchState(store, { loadingInstallmentDetails: false }),
            }),
          ),
        ),
      ),
    );

    const createInstallment = rxMethod<PaymentPlanInstallmentRequest>(
      pipe(
        tap(() =>
          patchState(store, {
            savingInstallment: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((installment) =>
          store.installmentService.createPaymentPlanInstallment$(installment).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Payment plan installment has been added successfully',
                  }),
                );
                patchState(store, {
                  saveSuccess: true,
                  pagination: { ...store.pagination(), page: 0 },
                });
                loadInstallments();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to create payment plan installment',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingInstallment: false }),
            }),
          ),
        ),
      ),
    );

    const updateInstallment = rxMethod<UpdatePaymentPlanInstallment>(
      pipe(
        tap(() =>
          patchState(store, {
            savingInstallment: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap(({ id, installment }) =>
          store.installmentService
            .updatePaymentPlanInstallment$(id, installment)
            .pipe(
              tapResponse({
                next: () => {
                  store.storeNgrx.dispatch(
                    ApplicationActions.handleSuccess({
                      message: 'Payment plan installment has been updated successfully',
                    }),
                  );
                  patchState(store, { saveSuccess: true });
                  loadInstallments();
                },
                error: () =>
                  patchState(store, {
                    error: 'Failed to update payment plan installment',
                    saveSuccess: false,
                  }),
                finalize: () =>
                  patchState(store, { savingInstallment: false }),
              }),
            ),
        ),
      ),
    );

    const deleteInstallment = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingInstallment: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.installmentService.deletePaymentPlanInstallment$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Payment plan installment has been deleted successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadInstallments();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to delete payment plan installment',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingInstallment: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadInstallments: (request?: PageRequest) => loadInstallments(request),
      getInstallmentById: (id: string) => getInstallmentById(id),
      createInstallment: (installment: PaymentPlanInstallmentRequest) =>
        createInstallment(installment),
      updateInstallment: (payload: UpdatePaymentPlanInstallment) =>
        updateInstallment(payload),
      deleteInstallment: (id: string) => deleteInstallment(id),
    };
  }),
);
