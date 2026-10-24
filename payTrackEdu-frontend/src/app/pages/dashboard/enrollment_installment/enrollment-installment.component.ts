import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { EnrollmentInstallmentDetails, EnrollmentInstallmentType, EnrollementInstallmentDto, InstallmentStatus } from '../../../core/model/enrollment-installment.model';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { EnrollmentInstallmentSignalStore } from './helpers/enrollment-installment.signal-store';

@Component({
  selector: 'app-enrollment-installment',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, ModalComponent, PaginationComponent],
  templateUrl: './enrollment-installment.component.html',
})
export class EnrollmentInstallmentComponent {
  readonly installmentStore = inject(EnrollmentInstallmentSignalStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  readonly enrollmentId = this.route.snapshot.paramMap.get('enrollmentId') ?? '';
  readonly EnrollmentInstallmentType = EnrollmentInstallmentType;
  readonly InstallmentStatus = InstallmentStatus;
  readonly isDetailsOpen = signal(false);
  readonly isDueDateFormOpen = signal(false);
  readonly isCancelDialogOpen = signal(false);
  readonly selectedInstallment = signal<EnrollmentInstallmentDetails | null>(null);
  readonly editingDueDateInstallment = signal<EnrollmentInstallmentDetails | null>(null);
  readonly pendingCancelInstallment = signal<EnrollementInstallmentDto | null>(null);
  readonly pendingDetailsId = signal<string | null>(null);
  readonly pendingDueDateId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<InstallmentStatus | null>(null);
  readonly dueDateForm = this.formBuilder.nonNullable.group({ dueDate: ['', Validators.required] });

  readonly filteredInstallments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase(); const status = this.statusFilter();
    return this.installmentStore.installmentsList().filter((installment) => (!term || installment.label.toLowerCase().includes(term) || String(installment.sequenceNumber).includes(term) || installment.type.toLowerCase().includes(term)) && (status === null || installment.status === status));
  });
  readonly totalInstallments = computed(() => this.installmentStore.pagination().totalElements);
  readonly paidInstallmentsOnPage = computed(() => this.installmentStore.installmentsList().filter(({ status }) => status === InstallmentStatus.PAID).length);
  private readonly closeOnSuccess = effect(() => { if (this.installmentStore.saveSuccess()) { this.closeDueDateForm(); this.closeCancelDialog(); } });
  private readonly openLoadedDetails = effect(() => {
    const installment = this.installmentStore.installment();
    if (installment && installment.id === this.pendingDetailsId() && !this.installmentStore.loadingDetails()) { this.selectedInstallment.set(installment); this.isDetailsOpen.set(true); }
    if (installment && installment.id === this.pendingDueDateId() && !this.installmentStore.loadingDetails()) { this.editingDueDateInstallment.set(installment); this.dueDateForm.reset({ dueDate: this.toDateInputValue(installment.dueDate) }); this.isDueDateFormOpen.set(true); }
  });

  constructor() { if (this.enrollmentId) this.installmentStore.loadInstallments({ enrollmentId: this.enrollmentId }); }
  goBack(): void { this.router.navigate(['/enrollments']); }
  generateInstallments(): void { this.installmentStore.generateInstallments(this.enrollmentId); }
  openDetails(installment: EnrollementInstallmentDto): void { this.pendingDueDateId.set(null); this.pendingDetailsId.set(installment.id); this.installmentStore.getInstallmentById(installment.id); }
  closeDetails(): void { this.isDetailsOpen.set(false); this.pendingDetailsId.set(null); this.selectedInstallment.set(null); }
  openDueDateForm(installment: EnrollementInstallmentDto): void { this.pendingDetailsId.set(null); this.pendingDueDateId.set(installment.id); this.installmentStore.getInstallmentById(installment.id); }
  closeDueDateForm(): void { this.isDueDateFormOpen.set(false); this.pendingDueDateId.set(null); this.editingDueDateInstallment.set(null); }
  saveDueDate(): void { const installment = this.editingDueDateInstallment(); if (this.dueDateForm.invalid || !installment) { this.dueDateForm.markAllAsTouched(); return; } this.installmentStore.updateDueDate({ id: installment.id, enrollmentId: this.enrollmentId, dueDate: { dueDate: new Date(`${this.dueDateForm.controls.dueDate.value}T00:00:00`) } }); }
  openCancelDialog(installment: EnrollementInstallmentDto): void { this.pendingCancelInstallment.set(installment); this.isCancelDialogOpen.set(true); }
  closeCancelDialog(): void { this.isCancelDialogOpen.set(false); this.pendingCancelInstallment.set(null); }
  cancelInstallment(): void { const installment = this.pendingCancelInstallment(); if (installment) this.installmentStore.cancelInstallment({ id: installment.id, enrollmentId: this.enrollmentId }); }
  refreshInstallments(): void { this.installmentStore.loadInstallments({ enrollmentId: this.enrollmentId }); }
  onPageChange({ pageIndex, pageSize }: PageEvent): void { this.installmentStore.loadInstallments({ enrollmentId: this.enrollmentId, pageIndex, pageSize }); }
  onSearch(event: Event): void { this.searchTerm.set((event.target as HTMLInputElement).value); }
  onStatusFilterChange(event: Event): void { const value = (event.target as HTMLSelectElement).value; this.statusFilter.set(value === 'all' ? null : value as InstallmentStatus); }
  typeLabel(type: EnrollmentInstallmentType): string { return ({ [EnrollmentInstallmentType.REGISTRATION]: 'Inscription', [EnrollmentInstallmentType.DEPOSIT]: 'Acompte', [EnrollmentInstallmentType.TUITION]: 'Scolarité' })[type]; }
  statusLabel(status: InstallmentStatus): string { return ({ [InstallmentStatus.PENDING]: 'En attente', [InstallmentStatus.PARTIALLY_PAID]: 'Partiellement payée', [InstallmentStatus.PAID]: 'Payée', [InstallmentStatus.OVERDUE]: 'En retard', [InstallmentStatus.CANCELLED]: 'Annulée' })[status]; }
  statusClasses(status: InstallmentStatus): string { if (status === InstallmentStatus.PAID) return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'; if (status === InstallmentStatus.OVERDUE) return 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-300'; if (status === InstallmentStatus.PARTIALLY_PAID) return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300'; if (status === InstallmentStatus.CANCELLED) return 'border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'; return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'; }
  private toDateInputValue(value: Date | string): string { if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10); return new Date(value).toISOString().slice(0, 10); }
}
