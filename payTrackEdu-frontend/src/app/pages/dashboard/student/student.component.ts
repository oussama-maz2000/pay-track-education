import { DatePipe } from '@angular/common';
import { DestroyRef, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import {
  StudentDetails,
  StudentDto,
  StudentRequest,
} from '../../../core/model/student.model';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { StudentSignalStore } from './helpers/student.signal-store';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-student',
  imports: [DatePipe, ReactiveFormsModule, ModalComponent, PaginationComponent],
  templateUrl: './student.component.html',
})
export class StudentComponent {
  readonly studentStore = inject(StudentSignalStore);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  readonly isFormOpen = signal(false);
  readonly isDetailsOpen = signal(false);
  readonly isDeleteDialogOpen = signal(false);
  readonly editingStudent = signal<StudentDetails | null>(null);
  readonly selectedStudent = signal<StudentDetails | null>(null);
  readonly studentPendingDeletion = signal<StudentDto | null>(null);
  readonly pendingEditStudentId = signal<string | null>(null);
  readonly pendingDetailsStudentId = signal<string | null>(null);
  readonly openActionMenuId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly activeFilter = signal<boolean | null>(null);

  readonly studentForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(160)],
    ],
    phoneNumber1: ['', [Validators.required, Validators.maxLength(30)]],
    phoneNumber2: ['', Validators.maxLength(30)],
    birthDay: ['', Validators.required],
    parentEmail: ['', [Validators.email, Validators.maxLength(160)]],
    parentPhone: ['', Validators.maxLength(30)],
    active: [true],
  });

  readonly filteredStudents = computed(() => {
    const active = this.activeFilter();

    return this.studentStore
      .studentsList()
      .filter(
        (student) => active === null || student.active === active,
      );
  });

  readonly totalStudents = computed(
    () => this.studentStore.pagination().totalElements,
  );
  readonly activeStudentsOnPage = computed(
    () =>
      this.studentStore.studentsList().filter(({ active }) => active).length,
  );

  private readonly closeDialogsOnSuccess = effect(() => {
    if (this.studentStore.saveSuccess()) {
      this.closeForm();
      this.closeDeleteDialog();
    }
  });

  private readonly openLoadedStudent = effect(() => {
    const student = this.studentStore.student();
    if (
      student &&
      student.id === this.pendingEditStudentId() &&
      !this.studentStore.loadingStudentDetails()
    ) {
      this.editingStudent.set(student);
      this.studentForm.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phoneNumber1: student.phoneNumber1,
        phoneNumber2: student.phoneNumber2 ?? '',
        birthDay: this.toDateInputValue(student.birthDay),
        parentEmail: student.parentEmail ?? '',
        parentPhone: student.parentPhone ?? '',
        active: student.active,
      });
      this.isFormOpen.set(true);
    }
  });

  private readonly openLoadedStudentDetails = effect(() => {
    const student = this.studentStore.student();
    if (
      student &&
      student.id === this.pendingDetailsStudentId() &&
      !this.studentStore.loadingStudentDetails()
    ) {
      this.selectedStudent.set(student);
      this.isDetailsOpen.set(true);
    }
  });

  constructor() {
    this.searchInput$
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((studentName) =>
        this.studentStore.loadStudents({
          pageIndex: 0,
          pageSize: this.studentStore.pagination().size,
          studentName,
        }),
      );
    this.studentStore.loadStudents();
  }

  openCreateForm(): void {
    this.editingStudent.set(null);
    this.pendingEditStudentId.set(null);
    this.studentForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber1: '',
      phoneNumber2: '',
      birthDay: '',
      parentEmail: '',
      parentPhone: '',
      active: true,
    });
    this.studentForm.setErrors(null);
    this.isFormOpen.set(true);
  }

  openEditForm(student: StudentDto): void {
    this.closeActionMenu();
    this.editingStudent.set(null);
    this.pendingDetailsStudentId.set(null);
    this.pendingEditStudentId.set(student.id);
    this.studentStore.getStudentById(student.id);
  }

  openDetails(student: StudentDto): void {
    this.closeActionMenu();
    this.pendingEditStudentId.set(null);
    this.pendingDetailsStudentId.set(student.id);
    this.selectedStudent.set(null);
    this.studentStore.getStudentById(student.id);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingStudent.set(null);
    this.pendingEditStudentId.set(null);
  }

  closeDetails(): void {
    this.isDetailsOpen.set(false);
    this.pendingDetailsStudentId.set(null);
    this.selectedStudent.set(null);
  }

  submitStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValue = this.studentForm.getRawValue();
    const student: StudentRequest = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim(),
      phoneNumber1: formValue.phoneNumber1.trim(),
      phoneNumber2: formValue.phoneNumber2.trim(),
      birthDay: new Date(`${formValue.birthDay}T00:00:00`),
      parentEmail: formValue.parentEmail.trim(),
      parentPhone: formValue.parentPhone.trim(),
      active: formValue.active,
    };
    const editingStudent = this.editingStudent();

    if (editingStudent) {
      this.studentStore.updateStudent({ id: editingStudent.id, student });
      return;
    }

    this.studentStore.createStudent(student);
  }

  openDeleteDialog(student: StudentDto): void {
    this.closeActionMenu();
    this.studentPendingDeletion.set(student);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.studentPendingDeletion.set(null);
  }

  deleteStudent(): void {
    const student = this.studentPendingDeletion();
    if (student) this.studentStore.deleteStudent(student.id);
  }

  restoreStudent(student: StudentDto): void {
    this.closeActionMenu();
    this.studentStore.restoreStudent(student.id);
  }

  toggleActionMenu(studentId: string): void {
    this.openActionMenuId.update((openId) =>
      openId === studentId ? null : studentId,
    );
  }

  closeActionMenu(): void {
    this.openActionMenuId.set(null);
  }

  refreshStudents(): void {
    this.studentStore.loadStudents({
      studentName: this.searchTerm().trim(),
    });
  }

  onStudentsPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.studentStore.loadStudents({
      pageIndex,
      pageSize,
      studentName: this.searchTerm().trim(),
    });
  }

  onSearch(event: Event): void {
    const studentName = (event.target as HTMLInputElement).value;
    this.searchTerm.set(studentName);
    this.searchInput$.next(studentName.trim());
  }

  onActiveFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.activeFilter.set(value === 'all' ? null : value === 'active');
  }

  private toDateInputValue(value: Date | string): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
    return new Date(value).toISOString().slice(0, 10);
  }
}
