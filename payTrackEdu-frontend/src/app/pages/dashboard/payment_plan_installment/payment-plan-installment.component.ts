import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Pageable } from '../../../core/model/pageable.model';
import {
  PaymentPlanForInstallmentDetails,
  PaymentPlanInstallmentDto,
  PaymentPlanInstallmentRequest,
  PaymentPlanInstallmentType,
} from '../../../core/model/payment-plan-installment.model';
import { PaymentPlanForInstallment } from '../../../core/model/payment-plan.model';
import { PaymentPlanService } from '../../../core/services/payment-plan.service';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { InfiniteScrollDirective } from '../../../shared/directives/infinite-scroll.directive';
import { PaymentPlanInstallmentSignalStore } from './helpers/payment-plan-installment.signal-store';

const firstPage: Pageable = {
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
};

@Component({
  selector: 'app-payment-plan-installment',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    ModalComponent,
    PaginationComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './payment-plan-installment.component.html',
})
export class PaymentPlanInstallmentComponent {
  readonly installmentStore = inject(PaymentPlanInstallmentSignalStore);
  private readonly paymentPlanService = inject(PaymentPlanService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly PaymentPlanInstallment = PaymentPlanInstallmentType;
  readonly typeOptions = [
    { value: PaymentPlanInstallmentType.DEPOSIT, label: 'Acompte' },
    { value: PaymentPlanInstallmentType.TUITION, label: 'Scolarité' },
  ];
  readonly isFormOpen = signal(false);
  readonly isDetailsOpen = signal(false);
  readonly isDeleteDialogOpen = signal(false);
  readonly isPaymentPlanDropdownOpen = signal(false);
  readonly editingInstallment = signal<PaymentPlanForInstallmentDetails | null>(
    null,
  );
  readonly selectedInstallment =
    signal<PaymentPlanForInstallmentDetails | null>(null);
  readonly installmentPendingDeletion =
    signal<PaymentPlanInstallmentDto | null>(null);
  readonly pendingEditId = signal<string | null>(null);
  readonly pendingDetailsId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly typeFilter = signal<PaymentPlanInstallmentType | null>(null);
  readonly paymentPlans = signal<PaymentPlanForInstallment[]>([]);
  readonly paymentPlansPagination = signal<Pageable>(firstPage);
  readonly loadingPaymentPlans = signal(false);
  readonly pickerError = signal<string | null>(null);
  readonly selectedPaymentPlanLabel = signal('Sélectionner un plan de paiement');

  readonly installmentForm = this.formBuilder.nonNullable.group({
    paymentPlanId: ['', Validators.required],
    sequenceNumber: [1, [Validators.required, Validators.min(1)]],
    type: [PaymentPlanInstallmentType.TUITION, Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    dueDate: ['', Validators.required],
  });

  readonly filteredInstallments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    return this.installmentStore
      .installmentsList()
      .filter(
        (installment) =>
          (!term ||
            installment.paymentPlanCode.toLowerCase().includes(term) ||
            installment.academicYearCode.toLowerCase().includes(term) ||
            String(installment.sequenceNumber).includes(term)) &&
          (type === null || installment.type === type),
      );
  });
  readonly totalInstallments = computed(
    () => this.installmentStore.pagination().totalElements,
  );
  readonly tuitionInstallmentsOnPage = computed(
    () =>
      this.installmentStore
        .installmentsList()
        .filter(({ type }) => type === PaymentPlanInstallmentType.TUITION)
        .length,
  );
  readonly canLoadNextPaymentPlans = computed(() => {
    const pagination = this.paymentPlansPagination();
    return (
      !this.loadingPaymentPlans() &&
      pagination.totalPages > 0 &&
      pagination.page < pagination.totalPages - 1
    );
  });

  private readonly closeDialogsOnSuccess = effect(() => {
    if (this.installmentStore.saveSuccess()) {
      this.closeForm();
      this.closeDeleteDialog();
    }
  });
  private readonly openLoadedEditForm = effect(() => {
    const installment = this.installmentStore.installment();
    if (
      installment &&
      installment.id === this.pendingEditId() &&
      !this.installmentStore.loadingInstallmentDetails()
    ) {
      this.editingInstallment.set(installment);
      this.installmentForm.reset({
        paymentPlanId: installment.paymentPlanId,
        sequenceNumber: installment.sequenceNumber,
        type: installment.type,
        amount: installment.amount,
        dueDate: this.toDateInputValue(installment.dueDate),
      });
      this.selectedPaymentPlanLabel.set(installment.paymentPlanCode);
      this.isFormOpen.set(true);
    }
  });
  private readonly openLoadedDetails = effect(() => {
    const installment = this.installmentStore.installment();
    if (
      installment &&
      installment.id === this.pendingDetailsId() &&
      !this.installmentStore.loadingInstallmentDetails()
    ) {
      this.selectedInstallment.set(installment);
      this.isDetailsOpen.set(true);
    }
  });

  constructor() {
    this.installmentStore.loadInstallments();
    this.loadPaymentPlansPage(0, true);
  }

  openCreateForm(): void {
    this.pendingEditId.set(null);
    this.editingInstallment.set(null);
    this.installmentForm.reset({
      paymentPlanId: '',
      sequenceNumber: 1,
      type: PaymentPlanInstallmentType.TUITION,
      amount: 0,
      dueDate: '',
    });
    this.selectedPaymentPlanLabel.set('Sélectionner un plan de paiement');
    this.isFormOpen.set(true);
  }

  openEditForm(installment: PaymentPlanInstallmentDto): void {
    this.pendingDetailsId.set(null);
    this.pendingEditId.set(installment.id);
    this.installmentStore.getInstallmentById(installment.id);
  }

  openDetails(installment: PaymentPlanInstallmentDto): void {
    this.pendingEditId.set(null);
    this.pendingDetailsId.set(installment.id);
    this.selectedInstallment.set(null);
    this.installmentStore.getInstallmentById(installment.id);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.isPaymentPlanDropdownOpen.set(false);
    this.pendingEditId.set(null);
    this.editingInstallment.set(null);
  }

  closeDetails(): void {
    this.isDetailsOpen.set(false);
    this.pendingDetailsId.set(null);
    this.selectedInstallment.set(null);
  }

  submitInstallment(): void {
    if (this.installmentForm.invalid) {
      this.installmentForm.markAllAsTouched();
      return;
    }
    const value = this.installmentForm.getRawValue();
    const installment: PaymentPlanInstallmentRequest = {
      paymentPlanId: value.paymentPlanId,
      sequenceNumber: value.sequenceNumber,
      type: value.type,
      amount: value.amount,
      dueDate: new Date(`${value.dueDate}T00:00:00`),
    };
    const editingInstallment = this.editingInstallment();
    if (editingInstallment) {
      this.installmentStore.updateInstallment({
        id: editingInstallment.id,
        installment,
      });
      return;
    }
    this.installmentStore.createInstallment(installment);
  }

  togglePaymentPlanDropdown(): void {
    this.isPaymentPlanDropdownOpen.update((open) => !open);
  }

  selectPaymentPlan(paymentPlan: PaymentPlanForInstallment): void {
    this.installmentForm.controls.paymentPlanId.setValue(paymentPlan.id);
    this.installmentForm.controls.paymentPlanId.markAsTouched();
    this.selectedPaymentPlanLabel.set(paymentPlan.code);
    this.isPaymentPlanDropdownOpen.set(false);
  }

  loadNextPaymentPlans(): void {
    if (this.canLoadNextPaymentPlans()) {
      this.loadPaymentPlansPage(this.paymentPlansPagination().page + 1);
    }
  }

  openDeleteDialog(installment: PaymentPlanInstallmentDto): void {
    this.installmentPendingDeletion.set(installment);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.installmentPendingDeletion.set(null);
  }

  deleteInstallment(): void {
    const installment = this.installmentPendingDeletion();
    if (installment) this.installmentStore.deleteInstallment(installment.id);
  }

  refreshInstallments(): void {
    this.installmentStore.loadInstallments();
  }

  onInstallmentsPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.installmentStore.loadInstallments({ pageIndex, pageSize });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onTypeFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.typeFilter.set(
      value === 'all' ? null : (value as PaymentPlanInstallmentType),
    );
  }

  typeLabel(type: PaymentPlanInstallmentType): string {
    return (
      this.typeOptions.find((option) => option.value === type)?.label ??
      'Unknown'
    );
  }

  private loadPaymentPlansPage(page: number, replace = false): void {
    if (this.loadingPaymentPlans()) return;
    this.loadingPaymentPlans.set(true);
    this.pickerError.set(null);
    this.paymentPlanService
      .fetchPaymentPlansForInstallment$(page, firstPage.size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          this.paymentPlans.update((current) =>
            replace ? data.content : this.mergeById(current, data.content),
          );
          this.paymentPlansPagination.set({
            page: data.number,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
          });
          this.loadingPaymentPlans.set(false);
        },
        error: () => {
          this.pickerError.set('Failed to load payment plan options.');
          this.loadingPaymentPlans.set(false);
        },
      });
  }

  private mergeById<T extends { id: string }>(
    current: T[],
    received: T[],
  ): T[] {
    const itemById = new Map(current.map((item) => [item.id, item]));
    received.forEach((item) => itemById.set(item.id, item));
    return [...itemById.values()];
  }

  private toDateInputValue(value: Date | string): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
    return new Date(value).toISOString().slice(0, 10);
  }
}
