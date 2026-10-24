import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Pageable } from '../../../core/model/pageable.model';
import {
  PaymentPlan,
  PaymentPlanDetails,
  PaymentPlanRequest,
  PaymentPlanType,
} from '../../../core/model/payment-plan.model';
import { PromotionSessionDto } from '../../../core/model/promotion-sessions.model';
import { PromotionSessionService } from '../../../core/services/promotion-session.service';
import { InfiniteScrollDirective } from '../../../shared/directives/infinite-scroll.directive';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { PaymentPlanSignalStore } from './helpers/payment-plan.signal-store';

const firstPage: Pageable = { page: 0, size: 10, totalElements: 0, totalPages: 0 };

@Component({
  selector: 'app-payment-plan',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, ModalComponent, PaginationComponent, InfiniteScrollDirective],
  templateUrl: './payment-plan.component.html',
})
export class PaymentPlanComponent {
  readonly paymentPlanStore = inject(PaymentPlanSignalStore);
  private readonly promotionSessionService = inject(PromotionSessionService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly PaymentPlanType = PaymentPlanType;
  readonly planOptions = [
    { value: PaymentPlanType.CASH, label: 'Comptant' },
    { value: PaymentPlanType.TRIMESTRE, label: 'Trimestriel' },
    { value: PaymentPlanType.MENSUEL, label: 'Mensuel' },
  ];
  readonly isFormOpen = signal(false);
  readonly isDetailsOpen = signal(false);
  readonly isDeleteDialogOpen = signal(false);
  readonly isSessionDropdownOpen = signal(false);
  readonly paymentPlanPendingDeletion = signal<PaymentPlan | null>(null);
  readonly pendingEditId = signal<string | null>(null);
  readonly pendingDetailsId = signal<string | null>(null);
  readonly selectedPaymentPlan = signal<PaymentPlanDetails | null>(null);
  readonly searchTerm = signal('');
  readonly planFilter = signal<PaymentPlanType | null>(null);
  readonly promotionSessions = signal<PromotionSessionDto[]>([]);
  readonly promotionSessionsPagination = signal<Pageable>(firstPage);
  readonly loadingPromotionSessions = signal(false);
  readonly pickerError = signal<string | null>(null);
  readonly selectedPromotionSessionLabel = signal('Select a promotion session');

  readonly paymentPlanForm = this.formBuilder.nonNullable.group({
    promotionSessionId: ['', Validators.required],
    code: ['', [Validators.required, Validators.maxLength(50)]],
    plan: [PaymentPlanType.CASH, Validators.required],
    totalAmount: [0, [Validators.required, Validators.min(0)]],
  });

  readonly filteredPaymentPlans = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const plan = this.planFilter();
    return this.paymentPlanStore.paymentPlansList().filter(
      (paymentPlan) =>
        (!term ||
          paymentPlan.code.toLowerCase().includes(term) ||
          paymentPlan.academicYearCode.toLowerCase().includes(term) ||
          paymentPlan.promotionCode.toLowerCase().includes(term) ||
          paymentPlan.promotionName.toLowerCase().includes(term)) &&
        (plan === null || paymentPlan.plan === plan),
    );
  });
  readonly totalPaymentPlans = computed(() => this.paymentPlanStore.pagination().totalElements);
  readonly monthlyPlansOnPage = computed(
    () => this.paymentPlanStore.paymentPlansList().filter(({ plan }) => plan === PaymentPlanType.MENSUEL).length,
  );
  readonly canLoadNextPromotionSessions = computed(() => {
    const pagination = this.promotionSessionsPagination();
    return !this.loadingPromotionSessions() && pagination.totalPages > 0 && pagination.page < pagination.totalPages - 1;
  });

  private readonly closeDialogsOnSuccess = effect(() => {
    if (this.paymentPlanStore.saveSuccess()) {
      this.closeForm();
      this.closeDeleteDialog();
    }
  });
  private readonly fillEditForm = effect(() => {
    const paymentPlan = this.paymentPlanStore.paymentPlan();
    if (paymentPlan && paymentPlan.id === this.pendingEditId()) {
      this.populateEditForm(paymentPlan);
    }
  });
  private readonly openLoadedPaymentPlanDetails = effect(() => {
    const paymentPlan = this.paymentPlanStore.paymentPlan();
    if (
      paymentPlan &&
      paymentPlan.id === this.pendingDetailsId() &&
      !this.paymentPlanStore.loadingPaymentPlan()
    ) {
      this.selectedPaymentPlan.set(paymentPlan);
      this.isDetailsOpen.set(true);
    }
  });

  constructor() {
    this.paymentPlanStore.loadPaymentPlans();
    this.loadPromotionSessionsPage(0, true);
  }

  openCreateForm(): void {
    this.pendingEditId.set(null);
    this.paymentPlanForm.reset({ promotionSessionId: '', code: '', plan: PaymentPlanType.CASH, totalAmount: 0 });
    this.selectedPromotionSessionLabel.set('Select a promotion session');
    this.isFormOpen.set(true);
  }

  openEditForm(paymentPlan: PaymentPlan): void {
    this.pendingDetailsId.set(null);
    this.pendingEditId.set(paymentPlan.id);
    this.paymentPlanStore.getPaymentPlanById(paymentPlan.id);
  }

  openDetails(paymentPlan: PaymentPlan): void {
    this.pendingEditId.set(null);
    this.pendingDetailsId.set(paymentPlan.id);
    this.selectedPaymentPlan.set(null);
    this.paymentPlanStore.getPaymentPlanById(paymentPlan.id);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.isSessionDropdownOpen.set(false);
    this.pendingEditId.set(null);
  }

  closeDetails(): void {
    this.isDetailsOpen.set(false);
    this.pendingDetailsId.set(null);
    this.selectedPaymentPlan.set(null);
  }

  submitPaymentPlan(): void {
    if (this.paymentPlanForm.invalid) {
      this.paymentPlanForm.markAllAsTouched();
      return;
    }
    const paymentPlan: PaymentPlanRequest = this.paymentPlanForm.getRawValue();
    const paymentPlanId = this.pendingEditId();
    if (paymentPlanId) {
      this.paymentPlanStore.updatePaymentPlan({ id: paymentPlanId, paymentPlan });
      return;
    }
    this.paymentPlanStore.createPaymentPlan(paymentPlan);
  }

  togglePromotionSessionDropdown(): void {
    this.isSessionDropdownOpen.update((open) => !open);
  }

  selectPromotionSession(promotionSession: PromotionSessionDto): void {
    this.paymentPlanForm.controls.promotionSessionId.setValue(promotionSession.id);
    this.paymentPlanForm.controls.promotionSessionId.markAsTouched();
    this.selectedPromotionSessionLabel.set(promotionSession.code);
    this.isSessionDropdownOpen.set(false);
  }

  loadNextPromotionSessions(): void {
    if (this.canLoadNextPromotionSessions()) {
      this.loadPromotionSessionsPage(this.promotionSessionsPagination().page + 1);
    }
  }

  openDeleteDialog(paymentPlan: PaymentPlan): void {
    this.paymentPlanPendingDeletion.set(paymentPlan);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.paymentPlanPendingDeletion.set(null);
  }

  deletePaymentPlan(): void {
    const paymentPlan = this.paymentPlanPendingDeletion();
    if (paymentPlan) this.paymentPlanStore.deletePaymentPlan(paymentPlan.id);
  }

  refreshPaymentPlans(): void {
    this.paymentPlanStore.loadPaymentPlans();
  }

  onPaymentPlansPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.paymentPlanStore.loadPaymentPlans({ pageIndex, pageSize });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onPlanFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.planFilter.set(value === 'all' ? null : (value as PaymentPlanType));
  }

  planLabel(plan: PaymentPlanType): string {
    return this.planOptions.find((option) => option.value === plan)?.label ?? 'Unknown';
  }

  private populateEditForm(paymentPlan: PaymentPlanDetails): void {
    this.paymentPlanForm.reset({
      promotionSessionId: paymentPlan.promotionSessionId,
      code: paymentPlan.code,
      plan: paymentPlan.plan,
      totalAmount: paymentPlan.totalAmount,
    });
    this.selectedPromotionSessionLabel.set(`${paymentPlan.academicYearCode} · ${paymentPlan.promotionCode}`);
    this.isFormOpen.set(true);
  }

  private loadPromotionSessionsPage(page: number, replace = false): void {
    if (this.loadingPromotionSessions()) return;
    this.loadingPromotionSessions.set(true);
    this.pickerError.set(null);
    this.promotionSessionService
      .fetchPromotionSessionsForPaymentPlan$(page, firstPage.size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          this.promotionSessions.update((current) =>
            replace ? data.content : this.mergeById(current, data.content),
          );
          this.promotionSessionsPagination.set({ page: data.number, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages });
          this.loadingPromotionSessions.set(false);
        },
        error: () => {
          this.pickerError.set('Failed to load promotion session options.');
          this.loadingPromotionSessions.set(false);
        },
      });
  }

  private mergeById<T extends { id: string }>(current: T[], received: T[]): T[] {
    const itemById = new Map(current.map((item) => [item.id, item]));
    received.forEach((item) => itemById.set(item.id, item));
    return [...itemById.values()];
  }
}
