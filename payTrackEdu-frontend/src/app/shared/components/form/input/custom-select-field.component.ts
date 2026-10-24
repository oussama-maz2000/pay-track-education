import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Option } from "../select/select.component";

@Component({
  selector: "app-custom-select",
  imports: [CommonModule],
  template: `
    <div class="w-full h-22">
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

      <!-- Select Field -->
      <div class="relative">
        <select
          [id]="id"
          [name]="name"
          [disabled]="disabled"
          [class]="selectClasses"
          [value]="value"
          (change)="onSelectChange($event)"
          (blur)="onBlur()"
        >
          <!-- Placeholder option -->
          <option
            value=""
            disabled
            [selected]="!value"
            class="text-gray-400 dark:text-gray-500"
          >
            {{ placeholder }}
          </option>

          <!-- Map over options -->
          @for (option of options; track option.value) {
          <option
            [value]="option.value"
            [selected]="option.value === value"
            class="text-gray-900 dark:bg-gray-900 dark:text-white/90"
          >
            {{ option.label }}
          </option>
          }
        </select>

        <!-- Custom Arrow Icon -->
        <div
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <svg
            class="h-5 w-5 transition-colors"
            [class.text-gray-400]="!hasError && !disabled"
            [class.text-error-500]="hasError"
            [class.text-gray-300]="disabled"
            [class.dark:text-gray-500]="!hasError && !disabled"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

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
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: Option[] = [];
  @Input() id?: string = "";
  @Input() name?: string = "";
  @Input() placeholder: string = "Select an option";
  @Input() label?: string = "";
  @Input() disabled: boolean = false;
  @Input() hint?: string;
  @Input() className: string = "";

  // Add FormControl input for better integration
  @Input() control?: AbstractControl | null;

  // Optional: Override error/success states manually
  @Input() success: boolean = false;
  @Input() error: boolean = false;

  // Custom error messages
  @Input() errorMessages: { [key: string]: string } = {
    required: "Please select an option",
  };

  @Output() valueChange = new EventEmitter<string | number>();

  value: string = "";

  // ControlValueAccessor implementation
  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: any): void {
    this.value = value != null ? String(value) : "";
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
    if (!this.control || !this.hasError) return "";

    const errors: ValidationErrors | null = this.control.errors;
    if (!errors) return "";

    // Return first error message
    const firstError = Object.keys(errors)[0];
    return this.errorMessages[firstError] || "Invalid selection";
  }

  get selectClasses(): string {
    let selectClasses = `h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 ${this.className}`;

    if (this.disabled) {
      selectClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
    } else if (this.hasError) {
      selectClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
    } else if (this.hasSuccess) {
      selectClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
    } else {
      selectClasses += ` bg-transparent border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800`;
    }

    // Text color based on value
    if (!this.value) {
      selectClasses += ` text-gray-400 dark:text-gray-500`;
    } else {
      selectClasses += ` text-gray-800 dark:text-white/90`;
    }

    return selectClasses;
  }

  onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newValue = select.value;

    this.value = newValue;
    const selectedOption = this.options.find(opt => String(opt.value) === newValue);
    const actualValue = selectedOption ? selectedOption.value : newValue;

    this.onChange(actualValue);
    this.valueChange.emit(actualValue);
  }

  onBlur(): void {
    this.onTouched();
  }
}
