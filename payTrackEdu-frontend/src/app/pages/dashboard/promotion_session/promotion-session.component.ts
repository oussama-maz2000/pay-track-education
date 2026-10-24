import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import {
  AcademicYearResponse,
  normalizeAcademicYearStatus,
} from '../../../core/model/academic.model';
import { Pageable } from '../../../core/model/pageable.model';
import {
  PromotionSessionResponse,
  PromotionSessionStatus,
} from '../../../core/model/promotion-sessions.model';
import { PromotionResponse } from '../../../core/model/promotion.model';
import { AcademicYearService } from '../../../core/services/academic.service';
import { PromotionService } from '../../../core/services/promotion.service';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { InfiniteScrollDirective } from '../../../shared/directives/infinite-scroll.directive';
import { PromotionSessionSignalStore } from './helpers/promotion-session.signal-store';

const firstPage: Pageable = {
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
};

@Component({
  selector: 'app-promotion-session',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    ModalComponent,
    PaginationComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './promotion-session.component.html',
})
export class PromotionSessionComponent {
  readonly promotionSessionStore = inject(PromotionSessionSignalStore);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly promotionService = inject(PromotionService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly PromotionSessionStatus = PromotionSessionStatus;
  readonly statusOptions = [
    { value: PromotionSessionStatus.DRAFT, label: 'Brouillon' },
    { value: PromotionSessionStatus.OPEN, label: 'Ouverte' },
    { value: PromotionSessionStatus.CLOSED, label: 'Clôturée' },
    { value: PromotionSessionStatus.ARCHIVED, label: 'Archivée' },
  ];

  readonly isFormOpen = signal(false);
  readonly isDeleteDialogOpen = signal(false);
  readonly isAcademicYearDropdownOpen = signal(false);
  readonly isPromotionDropdownOpen = signal(false);
  readonly editingPromotionSession = signal<PromotionSessionResponse | null>(
    null,
  );
  readonly promotionSessionPendingDeletion =
    signal<PromotionSessionResponse | null>(null);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<PromotionSessionStatus | null>(null);

  readonly academicYears = signal<AcademicYearResponse[]>([]);
  readonly academicYearsPagination = signal<Pageable>(firstPage);
  readonly loadingAcademicYears = signal(false);
  readonly promotions = signal<PromotionResponse[]>([]);
  readonly promotionsPagination = signal<Pageable>(firstPage);
  readonly loadingPromotions = signal(false);
  readonly pickerError = signal<string | null>(null);
  readonly selectedAcademicYearLabel = signal('Select an academic year');
  readonly selectedPromotionLabel = signal('Select a promotion');

  readonly promotionSessionForm = this.formBuilder.nonNullable.group({
    academicYearId: ['', Validators.required],
    promotionId: ['', Validators.required],
    registrationFee: [0, [Validators.required, Validators.min(0)]],
    status: [PromotionSessionStatus.DRAFT, Validators.required],
  });

  readonly filteredPromotionSessions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.promotionSessionStore
      .promotionSessionsList()
      .filter(
        (promotionSession) =>
          (!term ||
            promotionSession.academicYearCode.toLowerCase().includes(term) ||
            promotionSession.promotionCode.toLowerCase().includes(term) ||
            promotionSession.promotionName.toLowerCase().includes(term)) &&
          (status === null || promotionSession.status === status),
      );
  });

  readonly totalPromotionSessions = computed(
    () => this.promotionSessionStore.pagination().totalElements,
  );
  readonly openPromotionSessionsOnPage = computed(
    () =>
      this.promotionSessionStore
        .promotionSessionsList()
        .filter(({ status }) => status === PromotionSessionStatus.OPEN).length,
  );
  readonly canLoadNextAcademicYears = computed(() => {
    const pagination = this.academicYearsPagination();
    return (
      !this.loadingAcademicYears() &&
      pagination.totalPages > 0 &&
      pagination.page < pagination.totalPages - 1
    );
  });
  readonly canLoadNextPromotions = computed(() => {
    const pagination = this.promotionsPagination();
    return (
      !this.loadingPromotions() &&
      pagination.totalPages > 0 &&
      pagination.page < pagination.totalPages - 1
    );
  });

  private readonly closeDialogsOnSuccess = effect(() => {
    if (this.promotionSessionStore.saveSuccess()) {
      this.closeForm();
      this.closeDeleteDialog();
    }
  });

  constructor() {
    this.promotionSessionStore.loadPromotionSessions();
    this.loadAcademicYearsPage(0, true);
    this.loadPromotionsPage(0, true);
  }

  openCreateForm(): void {
    this.editingPromotionSession.set(null);
    this.promotionSessionForm.reset({
      academicYearId: '',
      promotionId: '',
      registrationFee: 0,
      status: PromotionSessionStatus.DRAFT,
    });
    this.selectedAcademicYearLabel.set('Select an academic year');
    this.selectedPromotionLabel.set('Select a promotion');
    this.isFormOpen.set(true);
  }

  openEditForm(promotionSession: PromotionSessionResponse): void {
    this.editingPromotionSession.set(promotionSession);
    this.promotionSessionForm.reset({
      academicYearId: promotionSession.academicYearId,
      promotionId: promotionSession.promotionId,
      registrationFee: promotionSession.registrationFee,
      status: promotionSession.status,
    });
    this.selectedAcademicYearLabel.set(promotionSession.academicYearCode);
    this.selectedPromotionLabel.set(
      `${promotionSession.promotionCode} · ${promotionSession.promotionName}`,
    );
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.isAcademicYearDropdownOpen.set(false);
    this.isPromotionDropdownOpen.set(false);
    this.editingPromotionSession.set(null);
  }

  submitPromotionSession(): void {
    if (this.promotionSessionForm.invalid) {
      this.promotionSessionForm.markAllAsTouched();
      return;
    }

    const promotionSession = this.promotionSessionForm.getRawValue();
    const editingPromotionSession = this.editingPromotionSession();
    if (editingPromotionSession) {
      this.promotionSessionStore.updatePromotionSession({
        id: editingPromotionSession.id,
        promotionSession,
      });
      return;
    }

    this.promotionSessionStore.createPromotionSession(promotionSession);
  }

  toggleAcademicYearDropdown(): void {
    this.isAcademicYearDropdownOpen.update((open) => !open);
    this.isPromotionDropdownOpen.set(false);
  }

  togglePromotionDropdown(): void {
    this.isPromotionDropdownOpen.update((open) => !open);
    this.isAcademicYearDropdownOpen.set(false);
  }

  selectAcademicYear(academicYear: AcademicYearResponse): void {
    this.promotionSessionForm.controls.academicYearId.setValue(academicYear.id);
    this.promotionSessionForm.controls.academicYearId.markAsTouched();
    this.selectedAcademicYearLabel.set(academicYear.code);
    this.isAcademicYearDropdownOpen.set(false);
  }

  selectPromotion(promotion: PromotionResponse): void {
    this.promotionSessionForm.controls.promotionId.setValue(promotion.id);
    this.promotionSessionForm.controls.promotionId.markAsTouched();
    this.selectedPromotionLabel.set(`${promotion.code} · ${promotion.name}`);
    this.isPromotionDropdownOpen.set(false);
  }

  loadNextAcademicYears(): void {
    if (this.canLoadNextAcademicYears()) {
      this.loadAcademicYearsPage(this.academicYearsPagination().page + 1);
    }
  }

  loadNextPromotions(): void {
    if (this.canLoadNextPromotions()) {
      this.loadPromotionsPage(this.promotionsPagination().page + 1);
    }
  }

  openDeleteDialog(promotionSession: PromotionSessionResponse): void {
    this.promotionSessionPendingDeletion.set(promotionSession);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.promotionSessionPendingDeletion.set(null);
  }

  deletePromotionSession(): void {
    const promotionSession = this.promotionSessionPendingDeletion();
    if (promotionSession) {
      this.promotionSessionStore.deletePromotionSession(promotionSession.id);
    }
  }

  restorePromotionSession(promotionSession: PromotionSessionResponse): void {
    this.promotionSessionStore.restorePromotionSession(promotionSession.id);
  }

  refreshPromotionSessions(): void {
    this.promotionSessionStore.loadPromotionSessions();
  }

  onPromotionSessionsPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.promotionSessionStore.loadPromotionSessions({ pageIndex, pageSize });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(
      value === 'all' ? null : (value as PromotionSessionStatus),
    );
  }

  statusLabel(status: PromotionSessionStatus): string {
    return (
      this.statusOptions.find((option) => option.value === status)?.label ??
      'Unknown'
    );
  }

  statusClasses(status: PromotionSessionStatus): string {
    const shared = 'border ';
    switch (status) {
      case PromotionSessionStatus.OPEN:
        return `${shared}border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300`;
      case PromotionSessionStatus.CLOSED:
        return `${shared}border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300`;
      case PromotionSessionStatus.ARCHIVED:
        return `${shared}border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300`;
      default:
        return `${shared}border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300`;
    }
  }

  private loadAcademicYearsPage(page: number, replace = false): void {
    if (this.loadingAcademicYears()) return;

    this.loadingAcademicYears.set(true);
    this.pickerError.set(null);
    this.academicYearService
      .fetchAcademicYears$(page, firstPage.size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          const received = data.content.map((academicYear) => ({
            ...academicYear,
            status: normalizeAcademicYearStatus(academicYear.status),
          }));
          this.academicYears.update((current) =>
            replace ? received : this.mergeById(current, received),
          );
          this.academicYearsPagination.set({
            page: data.number,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
          });
          this.loadingAcademicYears.set(false);
        },
        error: () => {
          this.pickerError.set('Failed to load academic year options.');
          this.loadingAcademicYears.set(false);
        },
      });
  }

  private loadPromotionsPage(page: number, replace = false): void {
    if (this.loadingPromotions()) return;

    this.loadingPromotions.set(true);
    this.pickerError.set(null);
    this.promotionService
      .fetchPromotions$(page, firstPage.size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          this.promotions.update((current) =>
            replace ? data.content : this.mergeById(current, data.content),
          );
          this.promotionsPagination.set({
            page: data.number,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
          });
          this.loadingPromotions.set(false);
        },
        error: () => {
          this.pickerError.set('Failed to load promotion options.');
          this.loadingPromotions.set(false);
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
}
