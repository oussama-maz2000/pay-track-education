import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import {
  AcademicYearRequest,
  AcademicYearResponse,
  AcademicYearStatus,
} from '../../../core/model/academic.model';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { AcademicYearSignalStore } from './helpers/academic-year.signal-store';

@Component({
  selector: 'app-academic-year',
  imports: [DatePipe, ReactiveFormsModule, ModalComponent, PaginationComponent],
  templateUrl: './academic.component.html',
})
export class AcademicYearComponent {
  readonly academicYearStore = inject(AcademicYearSignalStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly AcademicYearStatus = AcademicYearStatus;
  readonly isFormOpen = signal(false);
  readonly isDeleteDialogOpen = signal(false);
  readonly editingAcademicYear = signal<AcademicYearResponse | null>(null);
  readonly academicYearPendingDeletion = signal<AcademicYearResponse | null>(null);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<AcademicYearStatus | null>(null);

  readonly statusOptions = [
    { value: AcademicYearStatus.DRAFT, label: 'Brouillon' },
    { value: AcademicYearStatus.ACTIVE, label: 'Active' },
    { value: AcademicYearStatus.CLOSED, label: 'Clôturée' },
    { value: AcademicYearStatus.ARCHIVED, label: 'Archivée' },
  ];

  readonly academicYearForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(40)]],
    status: [AcademicYearStatus.DRAFT, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  readonly filteredAcademicYears = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.academicYearStore
      .academicYearsList()
      .filter(
        (academicYear) =>
          (!term || academicYear.code.toLowerCase().includes(term)) &&
          (status === null || academicYear.status === status),
      )
      .slice()
      .sort(
        (left, right) =>
          new Date(right.startDate).getTime() -
          new Date(left.startDate).getTime(),
      );
  });

  readonly totalAcademicYears = computed(
    () => this.academicYearStore.academicYearsList().length,
  );
  readonly activeAcademicYears = computed(
    () =>
      this.academicYearStore
        .academicYearsList()
        .filter(({ status }) => status === AcademicYearStatus.ACTIVE).length,
  );
  readonly archivedAcademicYears = computed(
    () =>
      this.academicYearStore
        .academicYearsList()
        .filter(({ status }) => status === AcademicYearStatus.ARCHIVED).length,
  );

  private readonly closeDialogsOnSuccess = effect(() => {
    if (this.academicYearStore.saveSuccess()) {
      this.closeForm();
      this.closeDeleteDialog();
    }
  });

  constructor() {
    this.academicYearStore.loadAcademicYears();
  }

  openCreateForm(): void {
    const year = new Date().getFullYear();
    this.editingAcademicYear.set(null);
    this.academicYearForm.reset({
      code: `${year}-${year + 1}`,
      status: AcademicYearStatus.DRAFT,
      startDate: `${year}-09-01`,
      endDate: `${year + 1}-06-30`,
    });
    this.academicYearForm.setErrors(null);
    this.isFormOpen.set(true);
  }

  openEditForm(academicYear: AcademicYearResponse): void {
    this.editingAcademicYear.set(academicYear);
    this.academicYearForm.reset({
      code: academicYear.code,
      status: academicYear.status,
      startDate: this.toDateInputValue(academicYear.startDate),
      endDate: this.toDateInputValue(academicYear.endDate),
    });
    this.academicYearForm.setErrors(null);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingAcademicYear.set(null);
  }

  submitAcademicYear(): void {
    if (this.academicYearForm.invalid) {
      this.academicYearForm.markAllAsTouched();
      return;
    }

    const { code, status, startDate, endDate } = this.academicYearForm.getRawValue();
    const request: AcademicYearRequest = {
      code: code.trim(),
      status,
      startDate,
      endDate,
    };

    if (new Date(request.endDate) < new Date(request.startDate)) {
      this.academicYearForm.setErrors({ invalidDateRange: true });
      return;
    }

    const academicYear = this.editingAcademicYear();
    if (academicYear) {
      this.academicYearStore.updateAcademicYear({
        id: academicYear.id,
        academicYear: request,
      });
      return;
    }

    this.academicYearStore.createAcademicYear(request);
  }

  openDeleteDialog(academicYear: AcademicYearResponse): void {
    this.academicYearPendingDeletion.set(academicYear);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.academicYearPendingDeletion.set(null);
  }

  deleteAcademicYear(): void {
    const academicYear = this.academicYearPendingDeletion();
    if (academicYear) {
      this.academicYearStore.deleteAcademicYear(academicYear.id);
    }
  }

  restoreAcademicYear(academicYear: AcademicYearResponse): void {
    this.academicYearStore.restoreAcademicYear(academicYear.id);
  }

  refreshAcademicYears(): void {
    this.academicYearStore.loadAcademicYears();
  }

  onAcademicYearsPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.academicYearStore.loadAcademicYears({ pageIndex, pageSize });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(
      value === 'all' ? null : (value as AcademicYearStatus),
    );
  }

  statusLabel(status: AcademicYearStatus): string {
    return this.statusOptions.find((option) => option.value === status)?.label ?? 'Unknown';
  }

  statusClasses(status: AcademicYearStatus): string {
    const shared = 'border ';
    switch (status) {
      case AcademicYearStatus.ACTIVE:
        return `${shared}border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300`;
      case AcademicYearStatus.CLOSED:
        return `${shared}border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300`;
      case AcademicYearStatus.ARCHIVED:
        return `${shared}border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300`;
      default:
        return `${shared}border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300`;
    }
  }

  private toDateInputValue(value: Date | string): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
    return new Date(value).toISOString().slice(0, 10);
  }
}
