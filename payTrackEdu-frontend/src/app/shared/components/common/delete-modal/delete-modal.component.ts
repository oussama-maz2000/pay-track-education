import { Component, EventEmitter, input, Input, Output } from "@angular/core";
import { ButtonComponent } from "../../ui/button/button.component";

@Component({
  selector: "app-delete-modal",
  imports: [ButtonComponent],
  templateUrl: "./delete-modal.component.html",
  styles: ``,
})
export class ModalBasedAlertsComponent {
  title = input();
  text = input();
  @Output() modalClose = new EventEmitter<{
    delete: boolean;
    close: boolean;
  }>();

  deleteButton() {
    this.modalClose.emit({ delete: true, close: true });
  }

  cancelButton() {
    this.modalClose.emit({ delete: false, close: true });
  }
}
