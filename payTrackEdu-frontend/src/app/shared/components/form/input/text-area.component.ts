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
  selector: 'app-text-area',
  template: `
    <div class="w-full">
      <!-- Label -->
      @if (label) {
        <label
          [for]="id"
          class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ label }}
          @if (control?.hasError('required')) {
            <span class="text-error-500">*</span>
          }
        </label>
      }

      <!-- Textarea -->
      <textarea
        [id]="id"
        [name]="name"
        [placeholder]="placeholder"
        [rows]="rows"
        [disabled]="disabled"
        [class]="textareaClasses"
        (input)="onInput($event)"
        [value]="value"
        (blur)="onBlur()"
      ></textarea>

      <!-- Hint (only when no error) -->
      @if (hint && !hasError) {
        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {{ hint }}
        </p>
      }

      <!-- Error -->
      @if (hasError && errorMessage) {
        <p class="mt-1.5 text-xs text-error-500 dark:text-error-400">
          {{ errorMessage }}
        </p>
      }

      <!-- Success -->
      @if (hasSuccess && !hasError) {
        <p class="mt-1.5 text-xs text-success-500 dark:text-success-400">
          ✓ Looks good!
        </p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true
    }
  ]
})
export class TextAreaComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label: string = '';

  @Input() placeholder = 'Enter your message';
  @Input() rows = 3;

  @Input() disabled = false;
  @Input() hint?: string;
  @Input() className: string = '';

  // Integration formulaire
  @Input() control?: AbstractControl | null;

  // Overrides optionnels
  @Input() success: boolean = false;
  @Input() error: boolean = false;

  @Input() errorMessages: { [key: string]: string } = {
    required: 'This field is required',
    minlength: 'Input is too short',
    maxlength: 'Input is too long',
    pattern: 'Invalid format',
  };

  @Output() valueChange = new EventEmitter<string>();

  value: string = '';

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: any): void {
    this.value = value ?? '';
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

  get hasError(): boolean {
    if (this.error) return true;
    if (this.control) {
      return !!(this.control.invalid && (this.control.dirty || this.control.touched));
    }
    return false;
  }

  get hasSuccess(): boolean {
    if (this.success) return true;
    if (this.control) {
      return !!(this.control.valid && (this.control.dirty || this.control.touched) && this.control.value);
    }
    return false;
  }

  get errorMessage(): string {
    if (!this.control || !this.hasError) return '';

    const errors: ValidationErrors | null = this.control.errors;
    if (!errors) return '';

    const firstError = Object.keys(errors)[0];

    // messages paramétrés
    if (firstError === 'minlength') {
      return `Minimum length is ${errors[firstError].requiredLength} characters`;
    }
    if (firstError === 'maxlength') {
      return `Maximum length is ${errors[firstError].requiredLength} characters`;
    }

    return this.errorMessages[firstError] || 'Invalid input';
  }

  get textareaClasses(): string {
    let c =
      `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs ` +
      `placeholder:text-gray-400 focus:outline-hidden focus:ring-3 ` +
      `dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ` +
      `${this.className}`;

    if (this.disabled) {
      c +=
        ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed` +
        ` dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
    } else if (this.hasError) {
      c +=
        ` border-error-500 focus:border-error-300 focus:ring-error-500/20` +
        ` dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
    } else if (this.hasSuccess) {
      c +=
        ` border-success-500 focus:border-success-300 focus:ring-success-500/20` +
        ` dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
    } else {
      c +=
        ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20` +
        ` dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
    }

    return c;
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const newValue = textarea.value;

    this.value = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  onBlur(): void {
    this.onTouched();
  }
}
