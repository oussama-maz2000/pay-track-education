import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_PROMOTION_SESSION_ENDPOINTS } from '../api/promotion-session.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';
import {
  PromotionSessionDto,
  PromotionSessionRequest,
  PromotionSessionResponse,
} from '../model/promotion-sessions.model';

@Service()
export class PromotionSessionService {
  private readonly httpClientApi = inject(HttpClientApi);

  createPromotionSession$(
    payload: PromotionSessionRequest,
  ): Observable<ApiResponse<PromotionSessionResponse>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<PromotionSessionResponse>
    >(API_PROMOTION_SESSION_ENDPOINTS.SAVE_PROMOTION_SESSIONS, {
      body: payload,
    });
  }

  fetchPromotionSessions$(
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<PromotionSessionResponse>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<PromotionSessionResponse>>
    >(API_PROMOTION_SESSION_ENDPOINTS.FETCH_PROMOTION_SESSIONS, {
      queryParams: { page, size },
    });
  }

  fetchPromotionSessionsForPaymentPlan$(
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<PromotionSessionDto>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<PromotionSessionDto>>
    >(
      API_PROMOTION_SESSION_ENDPOINTS.FETCH_PROMOTION_SESSIONS_FOR_PAYMENT_PLAN,
      {
        queryParams: { page, size },
      },
    );
  }

  getPromotionSessionsById$(
    id: string,
  ): Observable<ApiResponse<PromotionSessionResponse>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<PromotionSessionResponse>
    >(API_PROMOTION_SESSION_ENDPOINTS.GET_PROMOTION_SESSIONS_BY_ID, {
      pathParams: { id },
    });
  }

  updatePromotionSessions$(
    id: string,
    payload: PromotionSessionRequest,
  ): Observable<ApiResponse<PromotionSessionResponse>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<PromotionSessionResponse>
    >(API_PROMOTION_SESSION_ENDPOINTS.UPDATE_PROMOTION_SESSIONS, {
      pathParams: { id },
      body: payload,
    });
  }

  deletePromotionSessions$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_PROMOTION_SESSION_ENDPOINTS.DELETE_PROMOTION_SESSIONS,
      { pathParams: { id } },
    );
  }

  restorePromotionSessions$(
    id: string,
  ): Observable<ApiResponse<PromotionSessionResponse>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<PromotionSessionResponse>
    >(API_PROMOTION_SESSION_ENDPOINTS.RESTORE_PROMOTION_SESSIONS, {
      pathParams: { id },
    });
  }
}
