import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_USERS_ENDPOINTS } from '../api/users.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';
import {
  RequestUser,
  ResponseUser,
  UpdatePasswordRequest,
  UpdateUser,
  UpdateUserPassword,
} from '../model/user-management.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly httpClientApi = inject(HttpClientApi);

  fetchUsers$(
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<ResponseUser>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<ResponseUser>>
    >(API_USERS_ENDPOINTS.FETCH_USERS, { queryParams: { page, size } });
  }

  createUser$(payload: RequestUser): Observable<ResponseUser> {
    return this.httpClientApi.processRequest$<ResponseUser>(
      API_USERS_ENDPOINTS.SAVE_USER,
      { body: payload },
    );
  }

  updateUser$(id: string, payload: UpdateUser): Observable<ResponseUser> {
    return this.httpClientApi.processRequest$<ResponseUser>(
      API_USERS_ENDPOINTS.UPDATE_USER,
      { pathParams: { id }, body: payload },
    );
  }

  deactivateUser$(id: string): Observable<ResponseUser> {
    return this.httpClientApi.processRequest$<ResponseUser>(
      API_USERS_ENDPOINTS.DEACTIVATE_USER,
      { pathParams: { id } },
    );
  }

  resetUserPassword$(
    id: string,
    payload: UpdatePasswordRequest,
  ): Observable<ResponseUser> {
    return this.httpClientApi.processRequest$<ResponseUser>(
      API_USERS_ENDPOINTS.RESET_USER_PASSWORD,
      { pathParams: { id }, body: payload },
    );
  }

  changePassword$(payload: UpdateUserPassword): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_USERS_ENDPOINTS.CHANGE_PASSWORD,
      { body: payload },
    );
  }
}
