import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENROLLMENT_ENDPOINTS } from '../api/enrollment.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';
import {
  EnrollmentDto,
  EnrollmentRequest,
  EnrollmentResponse,
} from '../model/enrollment.model';

@Service()
export class EnrollmentService {
  private readonly httpClientApi = inject(HttpClientApi);

  createEnrollment$(
    payload: EnrollmentRequest,
  ): Observable<ApiResponse<EnrollmentResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<EnrollmentResponse>>(
      API_ENROLLMENT_ENDPOINTS.SAVE_ENROLLMENT,
      { body: payload },
    );
  }

  fetchEnrollments$(
    page: number,
    size: number,
    studentName?: string,
  ): Observable<ApiResponse<ResponsePage<EnrollmentDto>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<EnrollmentDto>>
    >(API_ENROLLMENT_ENDPOINTS.FETCH_ENROLLMENTS, {
      queryParams: { page, size, ...(studentName ? { studentName } : {}) },
    });
  }

  getEnrollmentById$(id: string): Observable<ApiResponse<EnrollmentResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<EnrollmentResponse>>(
      API_ENROLLMENT_ENDPOINTS.GET_ENROLLMENT_BY_ID,
      {
        pathParams: { id },
      },
    );
  }

  updateEnrollment$(
    id: string,
    payload: EnrollmentRequest,
  ): Observable<ApiResponse<EnrollmentResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<EnrollmentResponse>>(
      API_ENROLLMENT_ENDPOINTS.UPDATE_ENROLLMENT,
      {
        pathParams: { id },
        body: payload,
      },
    );
  }

  cancelEnrollment$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_ENROLLMENT_ENDPOINTS.CANCEL_ENROLLMENT,
      { pathParams: { id } },
    );
  }

  activateEnrollment$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_ENROLLMENT_ENDPOINTS.ACTIVATE_ENROLLMENT,
      { pathParams: { id } },
    );
  }

  suspendEnrollment$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_ENROLLMENT_ENDPOINTS.SUSPEND_ENROLLMENT,
      { pathParams: { id } },
    );
  }
}
