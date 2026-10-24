import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ACADEMIC_YEAR_ENDPOINTS } from '../api/adacemic.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import {
  AcademicYearPage,
  AcademicYearRequest,
  AcademicYearResponse,
} from '../model/academic.model';
import { ApiResponse } from '../model/api-response.model';

@Service()
export class AcademicYearService {
  private readonly httpClientApi = inject(HttpClientApi);

  createAcademicYear$(
    payload: AcademicYearRequest,
  ): Observable<ApiResponse<AcademicYearResponse>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<AcademicYearResponse>
    >(API_ACADEMIC_YEAR_ENDPOINTS.SAVE_ACADEMIC_YEAR, { body: payload });
  }

  fetchAcademicYears$(
    page: number,
    size: number,
  ): Observable<ApiResponse<AcademicYearPage>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<AcademicYearPage>
    >(API_ACADEMIC_YEAR_ENDPOINTS.FETCH_ACADEMIC_YEARS, {
      queryParams: { page, size },
    });
  }

  getAcademicYearById$(
    id: string,
  ): Observable<ApiResponse<AcademicYearResponse>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<AcademicYearResponse>
    >(API_ACADEMIC_YEAR_ENDPOINTS.GET_ACADEMIC_YEAR_BY_ID, {
      pathParams: { id },
    });
  }

  updateAcademicYear$(
    id: string,
    payload: AcademicYearRequest,
  ): Observable<ApiResponse<AcademicYearResponse>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<AcademicYearResponse>
    >(API_ACADEMIC_YEAR_ENDPOINTS.UPDATE_ACADEMIC_YEAR, {
      pathParams: { id },
      body: payload,
    });
  }

  deleteAcademicYear$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_ACADEMIC_YEAR_ENDPOINTS.DELETE_ACADEMIC_YEAR,
      { pathParams: { id } },
    );
  }

  restoreAcademicYear$(
    id: string,
  ): Observable<ApiResponse<AcademicYearResponse>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<AcademicYearResponse>
    >(API_ACADEMIC_YEAR_ENDPOINTS.RESTORE_ACADEMIC_YEAR, {
      pathParams: { id },
    });
  }
}
