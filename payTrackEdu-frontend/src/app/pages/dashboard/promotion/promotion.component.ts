import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import {
  PromotionRequest,
  PromotionResponse,
} from '../../../core/model/promotion.model';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { PromotionSignalStore } from './helpers/promotion.signal-store';

@Component({
  selector: 'app-promotion',
  imports: [DatePipe, ReactiveFormsModule, ModalComponent, PaginationComponent],
  templateUrl: './promotion.component.html',
})
export class PromotionComponent {
  readonly promotionStore = inject(PromotionSignalStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly isFormOpen = signal(false);
  readonly isDeleteDialogOpen = signal(false);
  readonly editingPromotion = signal<PromotionResponse | null>(null);
  readonly promotionPendingDeletion = signal<PromotionResponse | null>(null);
  readonly searchTerm = signal('');
  readonly activeFilter = signal<boolean | null>(null);

  readonly promotionForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(40)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    active: [true],
  });

  readonly filteredPromotions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const active = this.activeFilter();

    return this.promotionStore.promotionsList().filter(
      (promotion) =>
        (!term ||
          promotion.code.toLowerCase().includes(term) ||
          promotion.name.toLowerCase().includes(term)) &&
        (active === null || promotion.active === active),
    );
  });

  readonly totalPromotions = computed(
    () => this.promotionStore.pagination().totalElements,
  );
  readonly activePromotionsOnPage = computed(
    () => this.promotionStore.promotionsList().filter(({ active }) => active).length,
  );

  private readonly closeDialogsOnSuccess = effect(() => {
    if (this.promotionStore.saveSuccess()) {
      this.closeForm();
      this.closeDeleteDialog();
    }
  });

  constructor() {
    this.promotionStore.loadPromotions();
  }

  openCreateForm(): void {
    this.editingPromotion.set(null);
    this.promotionForm.reset({ code: '', name: '', active: true });
    this.isFormOpen.set(true);
  }

  openEditForm(promotion: PromotionResponse): void {
    this.editingPromotion.set(promotion);
    this.promotionForm.reset({
      code: promotion.code,
      name: promotion.name,
      active: promotion.active,
    });
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingPromotion.set(null);
  }

  submitPromotion(): void {
    if (this.promotionForm.invalid) {
      this.promotionForm.markAllAsTouched();
      return;
    }

    const { code, name, active } = this.promotionForm.getRawValue();
    const promotion: PromotionRequest = {
      code: code.trim(),
      name: name.trim(),
      active,
    };
    const editingPromotion = this.editingPromotion();

    if (editingPromotion) {
      this.promotionStore.updatePromotion({
        id: editingPromotion.id,
        promotion,
      });
      return;
    }

    this.promotionStore.createPromotion(promotion);
  }

  openDeleteDialog(promotion: PromotionResponse): void {
    this.promotionPendingDeletion.set(promotion);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.promotionPendingDeletion.set(null);
  }

  deletePromotion(): void {
    const promotion = this.promotionPendingDeletion();
    if (promotion) {
      this.promotionStore.deletePromotion(promotion.id);
    }
  }

  restorePromotion(promotion: PromotionResponse): void {
    this.promotionStore.restorePromotion(promotion.id);
  }

  refreshPromotions(): void {
    this.promotionStore.loadPromotions();
  }

  onPromotionsPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.promotionStore.loadPromotions({ pageIndex, pageSize });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onActiveFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.activeFilter.set(value === 'all' ? null : value === 'active');
  }
}
