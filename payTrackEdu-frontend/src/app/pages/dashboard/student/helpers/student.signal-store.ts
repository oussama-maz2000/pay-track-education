import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Store } from '@ngrx/store';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { ApplicationActions } from '../../../../core/data-access/application/application.action';
import { State } from '../../../../core/data-access/store';
import {
  StudentDetails,
  StudentDto,
  StudentRequest,
} from '../../../../core/model/student.model';
import { StudentService } from '../../../../core/services/student.service';

type PageRequest = {
  pageIndex?: number;
  pageSize?: number;
  studentName?: string;
};
type UpdateStudent = { id: string; student: StudentRequest };

const initialState = {
  students: [] as StudentDto[],
  studentName: '',
  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  loadingStudent: false,
  savingStudent: false,
  loadingStudentDetails: false,
  saveSuccess: false,
  error: null as string | null,
  student: null as StudentDetails | null,
};

export const StudentSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    studentService: inject(StudentService),
    storeNgrx: inject(Store<State>),
  })),
  withComputed((store) => ({
    studentsList: computed(() => store.students()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),
  withMethods((store) => {
    const loadStudents = rxMethod<PageRequest | void>(
      pipe(
        tap((request) =>
          patchState(store, {
            loadingStudent: true,
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
          store.studentService
            .fetchStudents$(
              store.pagination().page,
              store.pagination().size,
              store.studentName() || undefined,
            )
            .pipe(
              tapResponse({
                next: ({ data }) =>
                  patchState(store, {
                    students: data.content,
                    pagination: {
                      page: data.number,
                      size: data.size,
                      totalElements: data.totalElements,
                      totalPages: data.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, { error: 'Failed to load students' }),
                finalize: () => patchState(store, { loadingStudent: false }),
              }),
            ),
        ),
      ),
    );

    const getStudentById = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            loadingStudentDetails: true,
            error: null,
            student: null,
          }),
        ),
        switchMap((id) =>
          store.studentService.getStudentById$(id).pipe(
            tapResponse({
              next: ({ data }) => patchState(store, { student: data }),
              error: () =>
                patchState(store, { error: 'Failed to load student details' }),
              finalize: () =>
                patchState(store, { loadingStudentDetails: false }),
            }),
          ),
        ),
      ),
    );

    const createStudent = rxMethod<StudentRequest>(
      pipe(
        tap(() =>
          patchState(store, {
            savingStudent: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((student) =>
          store.studentService.createStudent$(student).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Student has been added successfully',
                  }),
                );
                patchState(store, {
                  saveSuccess: true,
                  pagination: { ...store.pagination(), page: 0 },
                });
                loadStudents();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to create student',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingStudent: false }),
            }),
          ),
        ),
      ),
    );

    const updateStudent = rxMethod<UpdateStudent>(
      pipe(
        tap(() =>
          patchState(store, {
            savingStudent: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap(({ id, student }) =>
          store.studentService.updateStudent$(id, student).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Student has been updated successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadStudents();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to update student',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingStudent: false }),
            }),
          ),
        ),
      ),
    );

    const deleteStudent = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingStudent: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.studentService.deleteStudent$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Student has been archived successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadStudents();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to archive student',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingStudent: false }),
            }),
          ),
        ),
      ),
    );

    const restoreStudent = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            savingStudent: true,
            error: null,
            saveSuccess: false,
          }),
        ),
        exhaustMap((id) =>
          store.studentService.restoreStudent$(id).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: 'Student has been restored successfully',
                  }),
                );
                patchState(store, { saveSuccess: true });
                loadStudents();
              },
              error: () =>
                patchState(store, {
                  error: 'Failed to restore student',
                  saveSuccess: false,
                }),
              finalize: () => patchState(store, { savingStudent: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadStudents: (request?: PageRequest) => loadStudents(request),
      getStudentById: (id: string) => getStudentById(id),
      createStudent: (student: StudentRequest) => createStudent(student),
      updateStudent: (payload: UpdateStudent) => updateStudent(payload),
      deleteStudent: (id: string) => deleteStudent(id),
      restoreStudent: (id: string) => restoreStudent(id),
    };
  }),
);
