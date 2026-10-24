import { CurrencyPipe, DatePipe } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  WritableSignal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";
import {
  EnrollmentDto,
  EnrollmentRequest,
  EnrollmentResponse,
  EnrollmentStatus,
} from "../../../core/model/enrollment.model";
import { Pageable } from "../../../core/model/pageable.model";
import { PaymentPlanForInstallment } from "../../../core/model/payment-plan.model";
import { PromotionSessionDto } from "../../../core/model/promotion-sessions.model";
import { StudentForEnrollment } from "../../../core/model/student.model";
import { PaymentPlanService } from "../../../core/services/payment-plan.service";
import { PromotionSessionService } from "../../../core/services/promotion-session.service";
import { StudentService } from "../../../core/services/student.service";
import { PaginationComponent } from "../../../shared/components/common/pagination/pagination.component";
import { ModalComponent } from "../../../shared/components/ui/modal/modal.component";
import { InfiniteScrollDirective } from "../../../shared/directives/infinite-scroll.directive";
import { EnrollmentSignalStore } from "./helpers/enrollment.signal-store";
import { debounceTime, distinctUntilChanged, Observable, Subject } from "rxjs";
import { ApiResponse } from "../../../core/model/api-response.model";
import { ResponsePage } from "../../../core/model/application.model";

const firstPage: Pageable = {
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
};

@Component({
  selector: "app-enrollment",
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    ModalComponent,
    PaginationComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: "./enrollment.component.html",
})
export class EnrollmentComponent {
  readonly enrollmentStore = inject(EnrollmentSignalStore);
  private readonly studentService = inject(StudentService);
  private readonly promotionSessionService = inject(PromotionSessionService);
  private readonly paymentPlanService = inject(PaymentPlanService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly searchInput$ = new Subject<string>();

  readonly EnrollmentStatus = EnrollmentStatus;
  readonly isFormOpen = signal(false);
  readonly isDetailsOpen = signal(false);
  readonly isCancelDialogOpen = signal(false);
  readonly isActivateDialogOpen = signal(false);
  readonly isStudentDropdownOpen = signal(false);
  readonly isPromotionSessionDropdownOpen = signal(false);
  readonly isPaymentPlanDropdownOpen = signal(false);
  readonly editingEnrollment = signal<EnrollmentResponse | null>(null);
  readonly selectedEnrollment = signal<EnrollmentResponse | null>(null);
  readonly enrollmentPendingCancellation = signal<EnrollmentDto | null>(null);
  readonly enrollmentPendingActivation = signal<EnrollmentDto | null>(null);
  readonly pendingEditId = signal<string | null>(null);
  readonly pendingDetailsId = signal<string | null>(null);
  readonly openActionMenuId = signal<string | null>(null);
  readonly searchTerm = signal("");
  readonly statusFilter = signal<EnrollmentStatus | null>(null);
  readonly students = signal<StudentForEnrollment[]>([]);
  readonly studentsPagination = signal<Pageable>(firstPage);
  readonly loadingStudents = signal(false);
  readonly promotionSessions = signal<PromotionSessionDto[]>([]);
  readonly promotionSessionsPagination = signal<Pageable>(firstPage);
  readonly loadingPromotionSessions = signal(false);
  readonly paymentPlans = signal<PaymentPlanForInstallment[]>([]);
  readonly paymentPlansPagination = signal<Pageable>(firstPage);
  readonly loadingPaymentPlans = signal(false);
  readonly pickerError = signal<string | null>(null);
  readonly selectedStudentLabel = signal("Select a student");
  readonly selectedPromotionSessionLabel = signal("Select a promotion session");
  readonly selectedPaymentPlanLabel = signal("Select a payment plan");

  readonly enrollmentForm = this.formBuilder.nonNullable.group({
    studentId: ["", Validators.required],
    promotionSessionId: ["", Validators.required],
    paymentPlanId: ["", Validators.required],
    discountAmount: [0, [Validators.required, Validators.min(0)]],
    discountReason: ["", Validators.maxLength(250)],
  });

  readonly filteredEnrollments = computed(() => {
    const status = this.statusFilter();
    return this.enrollmentStore
      .enrollmentsList()
      .filter(
        (enrollment) => status === null || enrollment.status === status,
      );
  });
  readonly totalEnrollments = computed(
    () => this.enrollmentStore.pagination().totalElements,
  );
  readonly activeEnrollmentsOnPage = computed(
    () =>
      this.enrollmentStore
        .enrollmentsList()
        .filter(({ status }) => status === EnrollmentStatus.ACTIVE).length,
  );
  readonly canLoadNextStudents = computed(() =>
    this.canLoadNext(this.studentsPagination(), this.loadingStudents()),
  );
  readonly canLoadNextPromotionSessions = computed(() =>
    this.canLoadNext(
      this.promotionSessionsPagination(),
      this.loadingPromotionSessions(),
    ),
  );
  readonly canLoadNextPaymentPlans = computed(() =>
    this.canLoadNext(this.paymentPlansPagination(), this.loadingPaymentPlans()),
  );

  private readonly closeDialogsOnSuccess = effect(() => {
    if (this.enrollmentStore.saveSuccess()) {
      this.closeForm();
      this.closeCancelDialog();
      this.closeActivateDialog();
    }
  });
  private readonly openLoadedEditForm = effect(() => {
    const enrollment = this.enrollmentStore.enrollment();
    if (
      enrollment &&
      enrollment.id === this.pendingEditId() &&
      !this.enrollmentStore.loadingEnrollmentDetails()
    ) {
      this.editingEnrollment.set(enrollment);
      this.enrollmentForm.reset({
        studentId: enrollment.studentId,
        promotionSessionId: enrollment.promotionSessionId,
        paymentPlanId: enrollment.paymentPlanId,
        discountAmount: enrollment.discountAmount,
        discountReason: enrollment.discountReason ?? "",
      });
      this.selectedStudentLabel.set(
        `${enrollment.studentFirstName} ${enrollment.studentLastName}`,
      );
      this.selectedPromotionSessionLabel.set(
        `${enrollment.academicYearCode} · ${enrollment.promotionCode}`,
      );
      this.selectedPaymentPlanLabel.set(enrollment.paymentPlanCode);
      this.isFormOpen.set(true);
    }
  });
  private readonly openLoadedDetails = effect(() => {
    const enrollment = this.enrollmentStore.enrollment();
    if (
      enrollment &&
      enrollment.id === this.pendingDetailsId() &&
      !this.enrollmentStore.loadingEnrollmentDetails()
    ) {
      this.selectedEnrollment.set(enrollment);
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
        this.enrollmentStore.loadEnrollments({
          pageIndex: 0,
          pageSize: this.enrollmentStore.pagination().size,
          studentName,
        }),
      );
    this.enrollmentStore.loadEnrollments();
  }

  openCreateForm(): void {
    this.pendingEditId.set(null);
    this.editingEnrollment.set(null);
    this.enrollmentForm.reset({
      studentId: "",
      promotionSessionId: "",
      paymentPlanId: "",
      discountAmount: 0,
      discountReason: "",
    });
    this.selectedStudentLabel.set("Select a student");
    this.selectedPromotionSessionLabel.set("Select a promotion session");
    this.selectedPaymentPlanLabel.set("Select a payment plan");
    this.isFormOpen.set(true);
  }
  openEditForm(enrollment: EnrollmentDto): void {
    this.closeActionMenu();
    this.pendingDetailsId.set(null);
    this.pendingEditId.set(enrollment.id);
    this.enrollmentStore.getEnrollmentById(enrollment.id);
  }
  openDetails(enrollment: EnrollmentDto): void {
    this.closeActionMenu();
    this.pendingEditId.set(null);
    this.pendingDetailsId.set(enrollment.id);
    this.selectedEnrollment.set(null);
    this.enrollmentStore.getEnrollmentById(enrollment.id);
  }
  viewInstallments(enrollment: EnrollmentDto): void {
    this.closeActionMenu();
    this.router.navigate(['/enrollments', enrollment.id, 'installments']);
  }

  viewPayments(enrollment: EnrollmentDto): void {
    this.closeActionMenu();
    this.router.navigate(['/enrollments', enrollment.id, 'payments']);
  }
  closeForm(): void {
    this.isFormOpen.set(false);
    this.closePickers();
    this.pendingEditId.set(null);
    this.editingEnrollment.set(null);
  }
  closeDetails(): void {
    this.isDetailsOpen.set(false);
    this.pendingDetailsId.set(null);
    this.selectedEnrollment.set(null);
  }

  submitEnrollment(): void {
    if (this.enrollmentForm.invalid) {
      this.enrollmentForm.markAllAsTouched();
      return;
    }
    const value = this.enrollmentForm.getRawValue();
    const enrollment: EnrollmentRequest = {
      ...value,
      discountReason: value.discountReason.trim(),
    };
    const editingEnrollment = this.editingEnrollment();
    if (editingEnrollment) {
      this.enrollmentStore.updateEnrollment({
        id: editingEnrollment.id,
        enrollment,
      });
      return;
    }
    this.enrollmentStore.createEnrollment(enrollment);
  }

  toggleStudentDropdown(): void {
    const willOpen = !this.isStudentDropdownOpen();
    this.isStudentDropdownOpen.set(willOpen);
    this.isPromotionSessionDropdownOpen.set(false);
    this.isPaymentPlanDropdownOpen.set(false);
    if (willOpen && !this.students().length) this.loadStudentsPage(0, true);
  }
  togglePromotionSessionDropdown(): void {
    const willOpen = !this.isPromotionSessionDropdownOpen();
    this.isPromotionSessionDropdownOpen.set(willOpen);
    this.isStudentDropdownOpen.set(false);
    this.isPaymentPlanDropdownOpen.set(false);
    if (willOpen && !this.promotionSessions().length)
      this.loadPromotionSessionsPage(0, true);
  }
  togglePaymentPlanDropdown(): void {
    const willOpen = !this.isPaymentPlanDropdownOpen();
    this.isPaymentPlanDropdownOpen.set(willOpen);
    this.isStudentDropdownOpen.set(false);
    this.isPromotionSessionDropdownOpen.set(false);
    if (willOpen && !this.paymentPlans().length)
      this.loadPaymentPlansPage(0, true);
  }
  selectStudent(student: StudentForEnrollment): void {
    this.enrollmentForm.controls.studentId.setValue(student.id);
    this.selectedStudentLabel.set(`${student.firstName} ${student.lastName}`);
    this.isStudentDropdownOpen.set(false);
  }
  selectPromotionSession(session: PromotionSessionDto): void {
    this.enrollmentForm.controls.promotionSessionId.setValue(session.id);
    this.selectedPromotionSessionLabel.set(session.code);
    this.isPromotionSessionDropdownOpen.set(false);
  }
  selectPaymentPlan(plan: PaymentPlanForInstallment): void {
    this.enrollmentForm.controls.paymentPlanId.setValue(plan.id);
    this.selectedPaymentPlanLabel.set(plan.code);
    this.isPaymentPlanDropdownOpen.set(false);
  }
  loadNextStudents(): void {
    if (this.canLoadNextStudents())
      this.loadStudentsPage(this.studentsPagination().page + 1);
  }
  loadNextPromotionSessions(): void {
    if (this.canLoadNextPromotionSessions())
      this.loadPromotionSessionsPage(
        this.promotionSessionsPagination().page + 1,
      );
  }
  loadNextPaymentPlans(): void {
    if (this.canLoadNextPaymentPlans())
      this.loadPaymentPlansPage(this.paymentPlansPagination().page + 1);
  }

  openCancelDialog(enrollment: EnrollmentDto): void {
    this.closeActionMenu();
    this.enrollmentPendingCancellation.set(enrollment);
    this.isCancelDialogOpen.set(true);
  }
  closeCancelDialog(): void {
    this.isCancelDialogOpen.set(false);
    this.enrollmentPendingCancellation.set(null);
  }
  cancelEnrollment(): void {
    const enrollment = this.enrollmentPendingCancellation();
    if (enrollment) this.enrollmentStore.cancelEnrollment(enrollment.id);
  }
  openActivateDialog(enrollment: EnrollmentDto): void {
    this.closeActionMenu();
    this.enrollmentPendingActivation.set(enrollment);
    this.isActivateDialogOpen.set(true);
  }
  closeActivateDialog(): void {
    this.isActivateDialogOpen.set(false);
    this.enrollmentPendingActivation.set(null);
  }
  activateEnrollment(): void {
    const enrollment = this.enrollmentPendingActivation();
    if (enrollment) this.enrollmentStore.activateEnrollment(enrollment.id);
  }
  suspendEnrollment(enrollment: EnrollmentDto): void {
    this.closeActionMenu();
    this.enrollmentStore.suspendEnrollment(enrollment.id);
  }
  toggleActionMenu(enrollmentId: string): void {
    this.openActionMenuId.update((openId) =>
      openId === enrollmentId ? null : enrollmentId,
    );
  }
  closeActionMenu(): void {
    this.openActionMenuId.set(null);
  }
  refreshEnrollments(): void {
    this.enrollmentStore.loadEnrollments({
      studentName: this.searchTerm().trim(),
    });
  }
  onEnrollmentsPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.enrollmentStore.loadEnrollments({
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
  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value === "all" ? null : (value as EnrollmentStatus));
  }

  statusLabel(status: EnrollmentStatus): string {
    const labels: Record<EnrollmentStatus, string> = {
      [EnrollmentStatus.DRAFT]: 'Brouillon',
      [EnrollmentStatus.ACTIVE]: 'Active',
      [EnrollmentStatus.SUSPENDED]: 'Suspendue',
      [EnrollmentStatus.COMPLETED]: 'Terminée',
      [EnrollmentStatus.CANCELLED]: 'Annulée',
    };
    return labels[status];
  }
  statusClasses(status: EnrollmentStatus): string {
    if (status === EnrollmentStatus.ACTIVE)
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";
    if (status === EnrollmentStatus.SUSPENDED)
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300";
    if (status === EnrollmentStatus.CANCELLED)
      return "border-error-200 bg-error-50 text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-300";
    if (status === EnrollmentStatus.COMPLETED)
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300";
    return "border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }

  private closePickers(): void {
    this.isStudentDropdownOpen.set(false);
    this.isPromotionSessionDropdownOpen.set(false);
    this.isPaymentPlanDropdownOpen.set(false);
  }
  private canLoadNext(pagination: Pageable, loading: boolean): boolean {
    return (
      !loading &&
      pagination.totalPages > 0 &&
      pagination.page < pagination.totalPages - 1
    );
  }
  private loadStudentsPage(page: number, replace = false): void {
    this.loadPicker(
      this.loadingStudents,
      this.studentsPagination,
      this.students,
      page,
      replace,
      (p, s) => this.studentService.fetchStudentsForEnrollment$(p, s),
      "Failed to load student options.",
    );
  }
  private loadPromotionSessionsPage(page: number, replace = false): void {
    this.loadPicker(
      this.loadingPromotionSessions,
      this.promotionSessionsPagination,
      this.promotionSessions,
      page,
      replace,
      (p, s) =>
        this.promotionSessionService.fetchPromotionSessionsForPaymentPlan$(
          p,
          s,
        ),
      "Failed to load promotion session options.",
    );
  }
  private loadPaymentPlansPage(page: number, replace = false): void {
    this.loadPicker(
      this.loadingPaymentPlans,
      this.paymentPlansPagination,
      this.paymentPlans,
      page,
      replace,
      (p, s) => this.paymentPlanService.fetchPaymentPlansForInstallment$(p, s),
      "Failed to load payment plan options.",
    );
  }
  private loadPicker<T extends { id: string }>(
    loading: WritableSignal<boolean>,
    pagination: WritableSignal<Pageable>,
    items: WritableSignal<T[]>,
    page: number,
    replace: boolean,
    fetch: (
      page: number,
      size: number,
    ) => Observable<ApiResponse<ResponsePage<T>>>,
    errorMessage: string,
  ): void {
    if (loading()) return;
    loading.set(true);
    this.pickerError.set(null);
    fetch(page, firstPage.size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          items.update((current) =>
            replace
              ? (data.content as T[])
              : this.mergeById(current, data.content as T[]),
          );
          pagination.set({
            page: data.number,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
          });
          loading.set(false);
        },
        error: () => {
          this.pickerError.set(errorMessage);
          loading.set(false);
        },
      });
  }
  private mergeById<T extends { id: string }>(
    current: T[],
    received: T[],
  ): T[] {
    const values = new Map(current.map((item) => [item.id, item]));
    received.forEach((item) => values.set(item.id, item));
    return [...values.values()];
  }
}
