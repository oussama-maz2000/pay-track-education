import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import {
  CreatePaymentDto,
  PaymentDto,
  PaymentMethod,
  PaymentResponse,
  PaymentStatus,
} from '../../../core/model/payment.model';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { PaymentSignalStore } from './helpers/payment.signal-store';

@Component({
  selector: 'app-payment',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    ModalComponent,
    PaginationComponent,
  ],
  templateUrl: './payment.component.html',
})
export class PaymentComponent {
  readonly paymentStore = inject(PaymentSignalStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  readonly enrollmentId = this.route.snapshot.paramMap.get('enrollmentId') ?? '';
  readonly PaymentMethod = PaymentMethod;
  readonly PaymentStatus = PaymentStatus;
  readonly isDetailsOpen = signal(false);
  readonly isFormOpen = signal(false);
  readonly isCancelDialogOpen = signal(false);
  readonly selectedPayment = signal<PaymentResponse | null>(null);
  readonly pendingDetailsId = signal<string | null>(null);
  readonly pendingCancelId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly paymentForm = this.formBuilder.nonNullable.group({
    paymentDate: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paymentMethod: [PaymentMethod.CASH, Validators.required],
    reference: [''],
    notes: [''],
  });
  readonly cancellationForm = this.formBuilder.nonNullable.group({
    cancellationReason: ['', Validators.required],
  });

  readonly filteredPayments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.paymentStore
      .paymentsList()
      .filter(
        (payment) =>
          !term ||
          payment.receiptNumber.toLowerCase().includes(term) ||
          payment.paymentMethod.toLowerCase().includes(term) ||
          (payment.reference ?? '').toLowerCase().includes(term),
      );
  });
  readonly totalPayments = computed(
    () => this.paymentStore.pagination().totalElements,
  );
  readonly amountOnPage = computed(() =>
    this.paymentStore
      .paymentsList()
      .reduce((total, payment) => total + payment.amount, 0),
  );

  private readonly showLoadedPayment = effect(() => {
    const payment = this.paymentStore.payment();
    if (!payment || this.paymentStore.loadingDetails()) return;

    if (payment.id === this.pendingDetailsId()) {
      this.selectedPayment.set(payment);
      this.isDetailsOpen.set(true);
    }
    if (payment.id === this.pendingCancelId()) {
      this.selectedPayment.set(payment);
      this.isCancelDialogOpen.set(true);
    }
  });
  private readonly closeOnSuccess = effect(() => {
    if (this.paymentStore.saveSuccess()) {
      this.closeForm();
      this.closeCancelDialog();
    }
  });

  constructor() {
    if (this.enrollmentId) {
      this.paymentStore.loadPayments({ enrollmentId: this.enrollmentId });
    }
  }

  goBack(): void {
    this.router.navigate(['/enrollments']);
  }

  openForm(): void {
    this.paymentForm.reset({
      paymentDate: this.today(),
      amount: 0,
      paymentMethod: PaymentMethod.CASH,
      reference: '',
      notes: '',
    });
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || !this.enrollmentId) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const value = this.paymentForm.getRawValue();
    const payload: CreatePaymentDto = {
      enrollmentId: this.enrollmentId,
      paymentDate: new Date(`${value.paymentDate}T00:00:00`),
      amount: value.amount,
      paymentMethod: value.paymentMethod,
      reference: value.reference.trim(),
      notes: value.notes.trim(),
    };
    this.paymentStore.createPayment({ enrollmentId: this.enrollmentId, payload });
  }

  openDetails(payment: PaymentDto): void {
    this.pendingCancelId.set(null);
    this.pendingDetailsId.set(payment.id);
    this.paymentStore.getPaymentById(payment.id);
  }

  closeDetails(): void {
    this.isDetailsOpen.set(false);
    this.pendingDetailsId.set(null);
    this.selectedPayment.set(null);
  }

  openCancelDialog(payment: PaymentDto): void {
    this.pendingDetailsId.set(null);
    this.pendingCancelId.set(payment.id);
    this.cancellationForm.reset({ cancellationReason: '' });
    this.paymentStore.getPaymentById(payment.id);
  }

  closeCancelDialog(): void {
    this.isCancelDialogOpen.set(false);
    this.pendingCancelId.set(null);
    this.selectedPayment.set(null);
  }

  cancelPayment(): void {
    const payment = this.selectedPayment();
    if (!payment || this.cancellationForm.invalid) {
      this.cancellationForm.markAllAsTouched();
      return;
    }
    this.paymentStore.cancelPayment({
      enrollmentId: this.enrollmentId,
      paymentId: payment.id,
      payload: {
        cancellationReason: this.cancellationForm.controls.cancellationReason.value.trim(),
      },
    });
  }

  refreshPayments(): void {
    this.paymentStore.loadPayments({ enrollmentId: this.enrollmentId });
  }

  onPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.paymentStore.loadPayments({
      enrollmentId: this.enrollmentId,
      pageIndex,
      pageSize,
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  paymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'Espèces',
      [PaymentMethod.CREDIT_CARD]: 'Carte bancaire',
      [PaymentMethod.BANK_TRANSFER]: 'Virement bancaire',
      [PaymentMethod.CHECK]: 'Chèque',
      [PaymentMethod.OTHER]: 'Autre',
    };
    return labels[method];
  }

  paymentStatusClasses(status: PaymentStatus): string {
    return status === PaymentStatus.ACTIVE
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
      : 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-300';
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
