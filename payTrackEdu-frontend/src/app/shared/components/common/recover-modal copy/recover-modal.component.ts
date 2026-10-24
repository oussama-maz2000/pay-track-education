import { Component, EventEmitter, input, Input, Output } from "@angular/core";
import { ButtonComponent } from "../../ui/button/button.component";

@Component({
  selector: "app-recover-modal",
  imports: [ButtonComponent],
  templateUrl: "./recover-modal.component.html",
  styles: ``,
})
export class ModalRecoverAlertsComponent {
  title = input();
  text = input();
  @Output() modalClose = new EventEmitter<{
    submit: boolean;
    close: boolean;
  }>();

  submitButton() {
    this.modalClose.emit({ submit: true, close: true });
  }

  cancelButton() {
    this.modalClose.emit({ submit: false, close: true });
  }
}
