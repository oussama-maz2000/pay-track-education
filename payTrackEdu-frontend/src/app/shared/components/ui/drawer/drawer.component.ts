import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { SHARED_IMPORTS } from "../../../../core/utils/shared.imports";
import { MatSidenavModule, MatDrawer } from "@angular/material/sidenav";
import { ButtonComponent } from "../button/button.component";
@Component({
  selector: "app-drawer",
  templateUrl: "./drawer.component.html",

  standalone: true,
  imports: [SHARED_IMPORTS, MatSidenavModule],
  styles: `.drawer-container {
      position: fixed;
      
      top: var(--app-header-h, 0px);
  height: calc(100vh - var(--app-header-h, 0px));
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 999998;
      pointer-events: none;
    }

    .drawer-container ::ng-deep .mat-drawer-backdrop {
      position: fixed;
      pointer-events: auto;
    }

    .custom-drawer {
      width: min(450px, 90vw);
      display: flex;
      flex-direction: column;
      pointer-events: auto;
    }

    .drawer-header {
       display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: #ffffff;
      min-height: 64px;
      flex-shrink: 0;
    }

    .close-btn {
      flex-shrink: 0;
      margin-left: 12px;
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background:#ffffff;
    }

    .drawer-body::-webkit-scrollbar {
      width: 8px;
    }

    .drawer-body::-webkit-scrollbar-track {
      background: #f3f4f6;
    }

    .drawer-body::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 4px;
    }

    .drawer-body::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }

    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
     background:#ffffff;
    }

    .drawer-footer:empty {
      display: none;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .drawer-header {
        border-bottom-color: #374151;
        background: #1f2937;
      }

      .drawer-body::-webkit-scrollbar-track {
        background: #374151;
      }

      .drawer-body::-webkit-scrollbar-thumb {
        background: #4b5563;
      }

      .drawer-footer {
        border-top-color: #374151;
        background: #111827;
      }
    }

    /* Header content styling */
    .drawer-header ::ng-deep h2,
    .drawer-header ::ng-deep h3,
    .drawer-header ::ng-deep h4,
    .drawer-header ::ng-deep h5 {
      margin: 0;
      font-weight: 600;
    }`,
})
export class DrawerComponent {
  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value;
    if (this.drawer) {
      value ? this.drawer.open() : this.drawer.close();
    }
  }
  get isOpen(): boolean {
    return this._isOpen;
  }
  private _isOpen = false;

  @Output() closed = new EventEmitter<void>();

  @ViewChild("drawer") drawer!: MatDrawer;

  close() {
    this.drawer.close();
  }

  onDrawerClosed() {
    this._isOpen = false;
    this.closed.emit();
  }
}
