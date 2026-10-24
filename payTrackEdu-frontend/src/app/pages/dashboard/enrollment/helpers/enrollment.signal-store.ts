import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { exhaustMap, pipe, switchMap, tap } from "rxjs";
import { ApplicationActions } from "../../../../core/data-access/application/application.action";
import { State } from "../../../../core/data-access/store";
import {
  EnrollmentDto,
  EnrollmentRequest,
  EnrollmentResponse,
} from "../../../../core/model/enrollment.model";
import { EnrollmentService } from "../../../../core/services/enrollment.service";

type PageRequest = {
  pageIndex?: number;
  pageSize?: number;
  studentName?: string;
};
type UpdateEnrollment = { id: string; enrollment: EnrollmentRequest };

const initialState = {
  enrollments: [] as EnrollmentDto[],
  studentName: "",
  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  loadingEnrollments: false,
  loadingEnrollmentDetails: false,
  savingEnrollment: false,
  saveSuccess: false,
  error: null as string | null,
  enrollment: null as EnrollmentResponse | null,
};

export const EnrollmentSignalStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withProps(() => ({
    enrollmentService: inject(EnrollmentService),
    storeNgrx: inject(Store<State>),
  })),
  withComputed((store) => ({
    enrollmentsList: computed(() => store.enrollments()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),
  withMethods((store) => {
    const loadEnrollments = rxMethod<PageRequest | void>(
      pipe(
        tap((request) =>
          patchState(store, {
            loadingEnrollments: true,
            error: null,
            studentName: request?.studentName ?? store.studentName(),
            pagination: {
              ...store.pagination(),
              page: request?.pageIndex ?? store.pagination().page,
              size: request?.pageSize ?? store.pagination().size,
            },
          }),
        ),
        switchMap(() =>
          store.enrollmentService
            .fetchEnrollments$(
              store.pagination().page,
              store.pagination().size,
              store.studentName() || undefined,
            )
            .pipe(
              tapResponse({
                next: ({ data }) =>
                  patchState(store, {
                    enrollments: data.content,
                    pagination: {
                      page: data.number,
                      size: data.size,
                      totalElements: data.totalElements,
                      totalPages: data.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, { error: "Failed to load enrollments" }),
                finalize: () =>
                  patchState(store, { loadingEnrollments: false }),
              }),
            ),
        ),
      ),
    );

    const getEnrollmentById = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            loadingEnrollmentDetails: true,
            error: null,
            enrollment: null,
          }),
        ),
        switchMap((id) =>
          store.enrollmentService.getEnrollmentById$(id).pipe(
            tapResponse({
              next: ({ data }) => patchState(store, { enrollment: data }),
              error: () =>
                patchState(store, {
                  error: "Failed to load enrollment details",
                }),
              finalize: () =>
                patchState(store, { loadingEnrollmentDetails: false }),
            }),
          ),
        ),
      ),
    );

    const createEnrollment = rxMethod<EnrollmentRequest>(
      pipe(
        tap(() =>
          patchState(store, {
            savingEnrollment: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((enrollment) =>
          store.enrollmentService.createEnrollment$(enrollment).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: "Enrollment has been created successfully",
                  }),
                );
                patchState(store, {
                  saveSuccess: true,
                  pagination: { ...store.pagination(), page: 0 },
                });
                loadEnrollments();
              },
              error: () =>
                patchState(store, {
                  error: "Failed to create enrollment",
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingEnrollment: false }),
            }),
          ),
        ),
      ),
    );
    const updateEnrollment = rxMethod<UpdateEnrollment>(
      pipe(
        tap(() =>
          patchState(store, {
            savingEnrollment: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap(({ id, enrollment }) =>
          store.enrollmentService.updateEnrollment$(id, enrollment).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: "Enrollment has been updated successfully",
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadEnrollments();
              },
              error: () =>
                patchState(store, {
                  error: "Failed to update enrollment",
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingEnrollment: false }),
            }),
          ),
        ),
      ),
    );
    const activateEnrollment = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingEnrollment: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.enrollmentService.activateEnrollment$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Enrollment has been activated successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadEnrollments();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to activate enrollment',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingEnrollment: false }),
            }),
          ),
        ),
      ),
    );
    const suspendEnrollment = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingEnrollment: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.enrollmentService.suspendEnrollment$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Enrollment has been suspended successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadEnrollments();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to suspend enrollment',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingEnrollment: false }),
            }),
          ),
        ),
      ),
    );
    const cancelEnrollment = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingEnrollment: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.enrollmentService.cancelEnrollment$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Enrollment has been cancelled successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadEnrollments();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to cancel enrollment',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingEnrollment: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadEnrollments: (request?: PageRequest) => loadEnrollments(request),
      getEnrollmentById: (id: string) => getEnrollmentById(id),
      createEnrollment: (enrollment: EnrollmentRequest) =>
        createEnrollment(enrollment),
      updateEnrollment: (payload: UpdateEnrollment) =>
        updateEnrollment(payload),
      activateEnrollment: (id: string) => activateEnrollment(id),
      suspendEnrollment: (id: string) => suspendEnrollment(id),
      cancelEnrollment: (id: string) => cancelEnrollment(id),
    };
  }),
);
