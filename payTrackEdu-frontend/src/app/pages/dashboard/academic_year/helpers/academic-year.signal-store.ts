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
  AcademicYearRequest,
  AcademicYearResponse,
  normalizeAcademicYearStatus,
} from '../../../../core/model/academic.model';
import { AcademicYearService } from '../../../../core/services/academic.service';

type UpdateAcademicYear = {
  id: string;
  academicYear: AcademicYearRequest;
};

type PageRequest = {
  pageIndex: number;
  pageSize: number;
};

const initialState = {
  academicYears: [] as AcademicYearResponse[],

  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },

  loadingAcademicYear: false,
  savingAcademicYear: false,
  saveSuccess: false,

  error: null as string | null,

  filter: {},

  academicYear: null as AcademicYearResponse | null,
};

export const AcademicYearSignalStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withProps(() => ({
    academicYearService: inject(AcademicYearService),
    storeNgrx: inject(Store<State>),
  })),

  withComputed((store) => ({
    academicYearsList: computed(() => store.academicYears()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),

  withMethods((store) => {
    const loadAcademicYears = rxMethod<PageRequest | void>(
      pipe(
        tap((request) =>
          patchState(store, {
            loadingAcademicYear: true,
            error: null,
            pagination: {
              ...store.pagination(),
              page: request?.pageIndex ?? store.pagination().page,
              size: request?.pageSize ?? store.pagination().size,
            },
          }),
        ),
        switchMap(() =>
          store.academicYearService
            .fetchAcademicYears$(
              store.pagination().page,
              store.pagination().size,
            )
            .pipe(
            tapResponse({
              next: ({ data }) =>
                patchState(store, {
                  academicYears: data.content.map((academicYear) => ({
                    ...academicYear,
                    status: normalizeAcademicYearStatus(academicYear.status),
                  })),
                  pagination: {
                    page: data.number,
                    size: data.size,
                    totalElements: data.totalElements,
                    totalPages: data.totalPages,
                  },
                }),
              error: () =>
                patchState(store, { error: 'Failed to load academic years' }),
              complete: () => patchState(store, { loadingAcademicYear: false }),
            }),
          ),
        ),
      ),
    );

    const getAcademicYearById = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loadingAcademicYear: true, error: null })),
        switchMap((id) =>
          store.academicYearService.getAcademicYearById$(id).pipe(
            tapResponse({
              next: ({ data }) =>
                patchState(store, {
                  academicYear: {
                    ...data,
                    status: normalizeAcademicYearStatus(data.status),
                  },
                }),
              error: () =>
                patchState(store, { error: 'Failed to load academic year' }),
              complete: () => patchState(store, { loadingAcademicYear: false }),
            }),
          ),
        ),
      ),
    );

    const createAcademicYear = rxMethod<AcademicYearRequest>(
      pipe(
        tap(() =>
          patchState(store, {
            savingAcademicYear: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((academicYear) =>
          store.academicYearService.createAcademicYear$(academicYear).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Academic year has been added successfully',
                  }),
                );
                patchState(store, {
                  saveSuccess: true,
                  pagination: { ...store.pagination(), page: 0 },
                });
                loadAcademicYears();
              },
              error: (err) => {
                console.log('🔴 Create Academic Year ERROR:', err);
                patchState(store, {
                  error: 'Failed to create academic year',
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingAcademicYear: false }),
            }),
          ),
        ),
      ),
    );

    const updateAcademicYear = rxMethod<UpdateAcademicYear>(
      pipe(
        tap(() =>
          patchState(store, {
            savingAcademicYear: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap(({ id, academicYear }) =>
          store.academicYearService.updateAcademicYear$(id, academicYear).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Academic year has been updated successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadAcademicYears();
              },
              error: (err) => {
                console.log('🔴 Update Academic Year ERROR:', err);
                patchState(store, {
                  error: 'Failed to update academic year',
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingAcademicYear: false }),
            }),
          ),
        ),
      ),
    );

    const restoreAcademicYear = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingAcademicYear: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.academicYearService.restoreAcademicYear$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Academic year has been restored successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadAcademicYears();
              },
              error: (err) => {
                console.log('🔴 Restore Academic Year ERROR:', err);
                patchState(store, {
                  error: 'Failed to restore academic year',
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingAcademicYear: false }),
            }),
          ),
        ),
      ),
    );

    const deleteAcademicYear = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingAcademicYear: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.academicYearService.deleteAcademicYear$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Academic year has been deleted successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadAcademicYears();
              },
              error: (err) => {
                console.log('🔴 Delete Academic Year ERROR:', err);
                patchState(store, {
                  error: 'Failed to delete academic year',
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingAcademicYear: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadAcademicYears: (request?: PageRequest) => loadAcademicYears(request),
      createAcademicYear: (academicYear: AcademicYearRequest) =>
        createAcademicYear(academicYear),
      updateAcademicYear: (payload: UpdateAcademicYear) =>
        updateAcademicYear(payload),
      restoreAcademicYear: (id: string) => restoreAcademicYear(id),
      getAcademicYearById: (id: string) => getAcademicYearById(id),
      deleteAcademicYear: (id: string) => deleteAcademicYear(id),
    };
  }),
);
