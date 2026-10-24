import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAppProp } from '../../../../core/data-access/application/application.selector';
import { AuthenticationActions } from '../../../../core/data-access/authentication/auth.action';
import { State } from '../../../../core/data-access/store';
import { RequestLogin } from '../../../../core/model/auth.model';
import { CustomInputFieldComponent } from '../../form/input/custom-input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    ButtonComponent,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CustomInputFieldComponent,
  ],
  templateUrl: './signin-form.component.html',
  styles: ``,
})
export class SigninFormComponent {
  showPassword = false;
  isChecked = false;
  private fb = inject(FormBuilder);
  private store = inject(Store<State>);
  protected readonly loading = this.store.selectSignal(selectAppProp('loading'));

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ],
    ],
  });

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    if (this.loginForm.invalid) return;
    this.store.dispatch(
      AuthenticationActions.requestLogin({
        request: this.loginForm.getRawValue() as RequestLogin,
      }),
    );
  }
}
