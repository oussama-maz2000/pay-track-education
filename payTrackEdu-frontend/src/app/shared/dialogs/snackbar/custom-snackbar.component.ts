import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";
import { SafeHtmlPipe } from "../../pipe/safe-html.pipe";

@Component({
  selector: "app-custom-snackbar",
  imports: [MatIconModule, CommonModule, SafeHtmlPipe],
  standalone: true,
  template: `
    <div
      class="flex items-center justify-start cursor-pointer z-100"
      (click)="closeSnackBar()"
    >
      @if(data.type === 'success') {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6 text-emerald-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      } @else {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6 text-emerald-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      } &nbsp;&nbsp;
      <span
        class="text-emerald-50 pl-3"
        [ngClass]="{}"
        [innerHTML]="data?.message | safeHtml"
      >
      </span>
    </div>
  `,
})
export class CustomSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  closeSnackBar() {
    this.data.snackBar.dismiss();
  }
}
