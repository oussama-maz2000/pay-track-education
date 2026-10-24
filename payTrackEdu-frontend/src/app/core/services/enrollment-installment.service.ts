import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENROLLMENT_INSTALLMENT_ENDPOINTS } from '../api/enrollment-installment.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';
import {
  EnrollementInstallmentDto,
  EnrollmentInstallmentDetails,
  UpdateEnrollmentInstallmentDueDateRequest,
} from '../model/enrollment-installment.model';

@Service()
export class EnrollmentInstallmentService {
  private readonly httpClientApi = inject(HttpClientApi);

  generateEnrollmentInstallmentsForEnrollment$(
    enrollmentId: string,
  ): Observable<ApiResponse<void>> {
    return this.httpClientApi.processRequest$<ApiResponse<void>>(
      API_ENROLLMENT_INSTALLMENT_ENDPOINTS.GENERATE_ENROLLMENT_INSTALLMENT_BY_ENROLLMENT_ID,
      { pathParams: { enrollmentId } },
    );
  }

  fetchEnrollmentInstallmentsForEnrollment$(
    enrollmentId: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<EnrollementInstallmentDto>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<EnrollementInstallmentDto>>
    >(
      API_ENROLLMENT_INSTALLMENT_ENDPOINTS.FETCH_ENROLLMENT_INSTALLMENT_BY_ENROLLMENT_ID,
      {
        pathParams: { enrollmentId },
        queryParams: { page, size },
      },
    );
  }

  getEnrollmentInstallmentsById$(
    id: string,
  ): Observable<ApiResponse<EnrollmentInstallmentDetails>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<EnrollmentInstallmentDetails>
    >(API_ENROLLMENT_INSTALLMENT_ENDPOINTS.GET_ENROLLMENT_INSTALLMENT_BY_ID, {
      pathParams: { id },
    });
  }

  updateEnrollmentInstallmentDueDate$(
    id: string,
    payload: UpdateEnrollmentInstallmentDueDateRequest,
  ): Observable<ApiResponse<void>> {
    return this.httpClientApi.processRequest$<ApiResponse<void>>(
      API_ENROLLMENT_INSTALLMENT_ENDPOINTS.UPDATE_DUE_DATE_ENROLLMENT_INSTALLMENT_BY_ID,
      {
        pathParams: { id },
        body: payload,
      },
    );
  }

  cancelEnrollmentInstallment$(id: string): Observable<ApiResponse<void>> {
    return this.httpClientApi.processRequest$<ApiResponse<void>>(
      API_ENROLLMENT_INSTALLMENT_ENDPOINTS.CANCEL_ENROLLMENT_INSTALLMENT_BY_ID,
      {
        pathParams: { id },
      },
    );
  }
}
