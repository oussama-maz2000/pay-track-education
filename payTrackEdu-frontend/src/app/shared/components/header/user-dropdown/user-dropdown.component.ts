import {Component, inject} from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import {Store} from "@ngrx/store";
import {State} from "../../../../core/data-access/store";
import {UserActions} from "../../../../core/data-access/user/user.actions";
import {ApplicationActions} from "../../../../core/data-access/application/application.action";
import {AuthenticationActions} from "../../../../core/data-access/authentication/auth.action";

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
};
import {selectUser} from "../../../../core/data-access/user/user.selector";

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent {
  isOpen = false;
  private store:Store<State>=inject(Store<State>)
  protected user=this.store.selectSignal(selectUser);

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  onSignOut(): void {
    this.store.dispatch(AuthenticationActions.logOut());
  }
}
