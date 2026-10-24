import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { ApplicationActions } from '../../../../core/data-access/application/application.action';
import { State } from '../../../../core/data-access/store';
import { EnrollmentInstallmentDetails, EnrollementInstallmentDto, UpdateEnrollmentInstallmentDueDateRequest } from '../../../../core/model/enrollment-installment.model';
import { EnrollmentInstallmentService } from '../../../../core/services/enrollment-installment.service';

type LoadRequest = { enrollmentId: string; pageIndex?: number; pageSize?: number };
type UpdateDueDate = { id: string; dueDate: UpdateEnrollmentInstallmentDueDateRequest; enrollmentId: string };

const initialState = {
  installments: [] as EnrollementInstallmentDto[],
  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  loading: false, loadingDetails: false, saving: false, saveSuccess: false,
  error: null as string | null, installment: null as EnrollmentInstallmentDetails | null,
};

export const EnrollmentInstallmentSignalStore = signalStore(
  { providedIn: 'root' }, withState(initialState),
  withProps(() => ({ service: inject(EnrollmentInstallmentService), storeNgrx: inject(Store<State>) })),
  withComputed((store) => ({ installmentsList: computed(() => store.installments()) })),
  withMethods((store) => {
    const loadInstallments = rxMethod<LoadRequest>(pipe(
      tap((request) => patchState(store, { loading: true, error: null, pagination: { ...store.pagination(), page: request.pageIndex ?? store.pagination().page, size: request.pageSize ?? store.pagination().size } })),
      switchMap(({ enrollmentId }) => store.service.fetchEnrollmentInstallmentsForEnrollment$(enrollmentId, store.pagination().page, store.pagination().size).pipe(tapResponse({
        next: ({ data }) => patchState(store, { installments: data.content, pagination: { page: data.number, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages } }),
        error: () => patchState(store, { error: 'Failed to load enrollment installments' }),
        finalize: () => patchState(store, { loading: false }),
      }))),
    ));
    const getInstallmentById = rxMethod<string>(pipe(
      tap(() => patchState(store, { loadingDetails: true, error: null, installment: null })),
      switchMap((id) => store.service.getEnrollmentInstallmentsById$(id).pipe(tapResponse({
        next: ({ data }) => patchState(store, { installment: data }),
        error: () => patchState(store, { error: 'Failed to load installment details' }),
        finalize: () => patchState(store, { loadingDetails: false }),
      }))),
    ));
    const generateInstallments = rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true, error: null, saveSuccess: false })),
      exhaustMap((enrollmentId) => store.service.generateEnrollmentInstallmentsForEnrollment$(enrollmentId).pipe(tapResponse({
        next: () => { store.storeNgrx.dispatch(ApplicationActions.handleSuccess({ message: 'Enrollment installments have been generated successfully' })); patchState(store, { saveSuccess: true, pagination: { ...store.pagination(), page: 0 } }); loadInstallments({ enrollmentId }); },
        error: () => patchState(store, { error: 'Failed to generate enrollment installments', saveSuccess: false }),
        finalize: () => patchState(store, { saving: false }),
      }))),
    ));
    const updateDueDate = rxMethod<UpdateDueDate>(pipe(
      tap(() => patchState(store, { saving: true, error: null, saveSuccess: false })),
      exhaustMap(({ id, dueDate, enrollmentId }) => store.service.updateEnrollmentInstallmentDueDate$(id, dueDate).pipe(tapResponse({
        next: () => { store.storeNgrx.dispatch(ApplicationActions.handleSuccess({ message: 'Installment due date has been updated successfully' })); patchState(store, { saveSuccess: true }); loadInstallments({ enrollmentId }); },
        error: () => patchState(store, { error: 'Failed to update installment due date', saveSuccess: false }),
        finalize: () => patchState(store, { saving: false }),
      }))),
    ));
    const cancelInstallment = rxMethod<{ id: string; enrollmentId: string }>(pipe(
      tap(() => patchState(store, { saving: true, error: null, saveSuccess: false })),
      exhaustMap(({ id, enrollmentId }) => store.service.cancelEnrollmentInstallment$(id).pipe(tapResponse({
        next: () => { store.storeNgrx.dispatch(ApplicationActions.handleSuccess({ message: 'Installment has been cancelled successfully' })); patchState(store, { saveSuccess: true }); loadInstallments({ enrollmentId }); },
        error: () => patchState(store, { error: 'Failed to cancel installment', saveSuccess: false }),
        finalize: () => patchState(store, { saving: false }),
      }))),
    ));
    return {
      loadInstallments: (request: LoadRequest) => loadInstallments(request), getInstallmentById: (id: string) => getInstallmentById(id), generateInstallments: (id: string) => generateInstallments(id), updateDueDate: (payload: UpdateDueDate) => updateDueDate(payload), cancelInstallment: (payload: { id: string; enrollmentId: string }) => cancelInstallment(payload),
    };
  }),
);
