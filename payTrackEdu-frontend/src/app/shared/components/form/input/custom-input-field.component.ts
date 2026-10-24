import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';

@Component({
  selector: 'app-custom-input-field',
  template: `<div class="w-full h-22">
    <!-- Label -->
    @if (label) {}
    <label
      [for]="id"
      class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      @if (control?.hasError('required')) {
        <span class="text-error-500">*</span>
      }
    </label>

    <!-- Input Field -->
    <input
      [type]="type"
      [id]="id"
      [name]="name"
      [placeholder]="placeholder"
      [value]="value"
      [min]="min"
      [max]="max"
      [step]="step"
      [disabled]="disabled"
      [class]="inputClasses"
      (input)="onInput($event)"
      (blur)="onBlur()"
    />

    <!-- Hint Text (shown when no error) -->
    @if (hint && !hasError) {
      <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        {{ hint }}
      </p>
    }

    <!-- Error Message -->
    @if (hasError && errorMessage) {
      <p class="mt-1.5 text-xs text-error-500 dark:text-error-400">
        {{ errorMessage }}
      </p>
    }

    <!-- Success Message (optional) -->
    <!--   @if(hasSuccess && !hasError){
      <p
          class="mt-1.5 text-xs text-success-500 dark:text-success-400">
        ✓ Looks good!
      </p>
    } -->
  </div>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputFieldComponent),
      multi: true,
    },
  ],
})
export class CustomInputFieldComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() id?: string = '';
  @Input() name?: string = '';
  @Input() placeholder?: string = '';
  @Input() label?: string = '';
  @Input() min?: string;
  @Input() max?: string;
  @Input() step?: number;
  @Input() disabled: boolean = false;
  @Input() hint?: string;
  @Input() className: string = '';

  // Add FormControl input for better integration
  @Input() control?: AbstractControl | null;

  // Optional: Override error/success states manually
  @Input() success: boolean = false;
  @Input() error: boolean = false;

  // Custom error messages
  @Input() errorMessages: { [key: string]: string } = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'Input is too short',
    maxlength: 'Input is too long',
    min: 'Value is too low',
    max: 'Value is too high',
    pattern: 'Invalid format',
  };

  @Output() valueChange = new EventEmitter<string | number>();

  value: string | number = '';

  // ControlValueAccessor implementation
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Check if field has errors and is touched
  get hasError(): boolean {
    if (this.error) return true;
    if (this.control) {
      return !!(
        this.control.invalid &&
        (this.control.dirty || this.control.touched)
      );
    }
    return false;
  }

  // Check if field is valid and touched
  get hasSuccess(): boolean {
    if (this.success) return true;
    if (this.control) {
      return !!(
        this.control.valid &&
        (this.control.dirty || this.control.touched) &&
        this.control.value
      );
    }
    return false;
  }

  // Get error message from control
  get errorMessage(): string {
    if (!this.control || !this.hasError) return '';

    const errors: ValidationErrors | null = this.control.errors;
    if (!errors) return '';

    // Return first error message
    const firstError = Object.keys(errors)[0];

    // Handle errors with parameters (like minlength, maxlength)
    if (firstError === 'minlength') {
      return `Minimum length is ${errors[firstError].requiredLength} characters`;
    }
    if (firstError === 'maxlength') {
      return `Maximum length is ${errors[firstError].requiredLength} characters`;
    }
    if (firstError === 'min') {
      return `Minimum value is ${errors[firstError].min}`;
    }
    if (firstError === 'max') {
      return `Maximum value is ${errors[firstError].max}`;
    }

    return this.errorMessages[firstError] || 'Invalid input';
  }

  get inputClasses(): string {
    let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${this.className}`;

    if (this.disabled) {
      inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
    } else if (this.hasError) {
      inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
    } else if (this.hasSuccess) {
      inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
    } else {
      inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
    }

    return inputClasses;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newValue = this.type === 'number' ? +input.value : input.value;

    this.value = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  onBlur(): void {
    this.onTouched();
  }
}
