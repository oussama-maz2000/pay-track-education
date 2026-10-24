import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { StorageCoreService } from '../internal/storage/storage-core.service';
import { STORAGE_KEYS } from '../internal/storage/storage-keys';
import {
   AuthResponse,
   RequestLogin,
   ResponseCurrentUser,
   ResponseLogin,
   User,
   UserProfileResponse,
} from '../model/auth.model';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private jwtHelp = new JwtHelperService();
  private storageCoreService: StorageCoreService = inject(StorageCoreService);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  storeLoginSession(authResponse: AuthResponse): User {
    this.storageCoreService.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      authResponse.accessToken,
    );
    this.storageCoreService.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      authResponse.refreshToken,
    );
    return this.userFromResponse(authResponse);
  }

  userFromResponse(authResponse: AuthResponse): User {
    const claims = this.jwtHelp.decodeToken(authResponse.accessToken);
   
    return {
      id: authResponse.userId,
      email: authResponse.email,
      role: authResponse.role,
      username: authResponse.userName,
      fullName: authResponse.fullName,
    };
  }

  userFromProfile(profile: UserProfileResponse): User {
    return {
      id: profile.id,
      username: profile.userName,
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
      phone: profile.phone ?? undefined,
      enabled: profile.isActive,
    };
  }

  init(): { token: string | null; valid: boolean } {
    const token: string = this.storageCoreService.getItem(
      STORAGE_KEYS.ACCESS_TOKEN,
    )!;

    if (token && !this.jwtHelp.isTokenExpired(token)) {
      return { token, valid: true };
    }

    return { token: null, valid: false };
  }

  login(payload: RequestLogin): Observable<ResponseLogin> {
    return this.authService.login$(payload);
  }

  currentUser(): Observable<ResponseCurrentUser> {
    return this.authService.me$();
  }

  signOut() {
    this.storageCoreService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.storageCoreService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    this.router.navigateByUrl('/signin');
  }
}
