import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import {
  RequestUser,
  ResponseUser,
  UpdateUser,
  UserRole,
} from '../../../core/model/user-management.model';
import { PaginationComponent } from '../../../shared/components/common/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { UserSignalStore } from './helpers/user.signal-store';

@Component({
  selector: 'app-user-management',
  imports: [DatePipe, ReactiveFormsModule, ModalComponent, PaginationComponent],
  templateUrl: './user.component.html',
})
export class UserManagementComponent {
  readonly userStore = inject(UserSignalStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly UserRole = UserRole;
  readonly searchTerm = signal('');
  readonly roleFilter = signal<UserRole | null>(null);
  readonly isFormOpen = signal(false);
  readonly isDeactivateDialogOpen = signal(false);
  readonly isPasswordDialogOpen = signal(false);
  readonly isOwnPasswordDialogOpen = signal(false);
  readonly editingUser = signal<ResponseUser | null>(null);
  readonly userPendingDeactivation = signal<ResponseUser | null>(null);
  readonly userPendingPasswordReset = signal<ResponseUser | null>(null);

  readonly userForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    userName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    role: [UserRole.STAFF, Validators.required],
    phone: ['', Validators.maxLength(30)],
    isActive: [true],
  });

  readonly passwordResetForm = this.formBuilder.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  readonly ownPasswordForm = this.formBuilder.nonNullable.group({
    oldPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const role = this.roleFilter();

    return this.userStore.usersList().filter(
      (user) =>
        (!term ||
          [user.fullName, user.userName, user.email, user.phone]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))) &&
        (role === null || user.role === role),
    );
  });

  readonly activeUsers = computed(
    () => this.userStore.usersList().filter(({ isActive }) => isActive).length,
  );
  readonly adminUsers = computed(
    () =>
      this.userStore.usersList().filter(({ role }) => role === UserRole.ADMIN)
        .length,
  );

  private readonly closeSuccessfulDialogs = effect(() => {
    if (this.userStore.saveSuccess()) {
      this.closeForm();
      this.closeDeactivateDialog();
      this.closePasswordDialog();
      this.closeOwnPasswordDialog();
    }
  });

  constructor() {
    this.userStore.loadUsers();
  }

  openCreateForm(): void {
    this.editingUser.set(null);
    this.userForm.reset({
      fullName: '',
      userName: '',
      email: '',
      password: '',
      role: UserRole.STAFF,
      phone: '',
      isActive: true,
    });
    this.isFormOpen.set(true);
  }

  openEditForm(user: ResponseUser): void {
    this.editingUser.set(user);
    this.userForm.reset({
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone ?? '',
      isActive: user.isActive,
    });
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingUser.set(null);
    this.userForm.controls.password.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(72),
    ]);
    this.userForm.controls.password.updateValueAndValidity();
  }

  submitUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const value = this.userForm.getRawValue();
    const editingUser = this.editingUser();
    if (editingUser) {
      const request: UpdateUser = {
        fullName: value.fullName.trim(),
        userName: value.userName.trim(),
        email: value.email.trim().toLowerCase(),
        role: value.role,
        phone: value.phone.trim(),
        isActive: value.isActive,
      };
      this.userStore.updateUser({ id: editingUser.id, user: request });
      return;
    }

    const request: RequestUser = {
      fullName: value.fullName.trim(),
      userName: value.userName.trim(),
      email: value.email.trim().toLowerCase(),
      password: value.password,
      role: value.role,
      phone: value.phone.trim(),
    };
    this.userStore.createUser(request);
  }

  openDeactivateDialog(user: ResponseUser): void {
    this.userPendingDeactivation.set(user);
    this.isDeactivateDialogOpen.set(true);
  }

  closeDeactivateDialog(): void {
    this.isDeactivateDialogOpen.set(false);
    this.userPendingDeactivation.set(null);
  }

  deactivateUser(): void {
    const user = this.userPendingDeactivation();
    if (user) this.userStore.deactivateUser(user.id);
  }

  openPasswordDialog(user: ResponseUser): void {
    this.userPendingPasswordReset.set(user);
    this.passwordResetForm.reset({ newPassword: '' });
    this.isPasswordDialogOpen.set(true);
  }

  closePasswordDialog(): void {
    this.isPasswordDialogOpen.set(false);
    this.userPendingPasswordReset.set(null);
  }

  resetUserPassword(): void {
    const user = this.userPendingPasswordReset();
    if (!user || this.passwordResetForm.invalid) {
      this.passwordResetForm.markAllAsTouched();
      return;
    }
    this.userStore.resetUserPassword({
      id: user.id,
      request: this.passwordResetForm.getRawValue(),
    });
  }

  openOwnPasswordDialog(): void {
    this.ownPasswordForm.reset({ oldPassword: '', newPassword: '' });
    this.isOwnPasswordDialogOpen.set(true);
  }

  closeOwnPasswordDialog(): void {
    this.isOwnPasswordDialogOpen.set(false);
  }

  changeOwnPassword(): void {
    if (this.ownPasswordForm.invalid) {
      this.ownPasswordForm.markAllAsTouched();
      return;
    }
    this.userStore.changePassword(this.ownPasswordForm.getRawValue());
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onRoleFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.roleFilter.set(value === 'all' ? null : (value as UserRole));
  }

  onUsersPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.userStore.loadUsers({ pageIndex, pageSize });
  }

  initials(user: ResponseUser): string {
    return user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
