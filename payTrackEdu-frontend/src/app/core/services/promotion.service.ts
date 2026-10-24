import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_PROMOTION_ENDPOINTS } from '../api/promotion.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';
import { PromotionRequest, PromotionResponse } from '../model/promotion.model';

@Service()
export class PromotionService {
  private readonly httpClientApi = inject(HttpClientApi);

  createPromotion$(
    payload: PromotionRequest,
  ): Observable<ApiResponse<PromotionResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<PromotionResponse>>(
      API_PROMOTION_ENDPOINTS.SAVE_PROMOTION,
      { body: payload },
    );
  }

  fetchPromotions$(
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<PromotionResponse>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<PromotionResponse>>
    >(API_PROMOTION_ENDPOINTS.FETCH_PROMOTIONS, {
      queryParams: { page, size },
    });
  }

  getPromotionById$(id: string): Observable<ApiResponse<PromotionResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<PromotionResponse>>(
      API_PROMOTION_ENDPOINTS.GET_PROMOTION_BY_ID,
      {
        pathParams: { id },
      },
    );
  }

  updatePromotion$(
    id: string,
    payload: PromotionRequest,
  ): Observable<ApiResponse<PromotionResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<PromotionResponse>>(
      API_PROMOTION_ENDPOINTS.UPDATE_PROMOTION,
      {
        pathParams: { id },
        body: payload,
      },
    );
  }

  deletePromotion$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_PROMOTION_ENDPOINTS.DELETE_PROMOTION,
      { pathParams: { id } },
    );
  }

  restorePromotion$(id: string): Observable<ApiResponse<PromotionResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<PromotionResponse>>(
      API_PROMOTION_ENDPOINTS.RESTORE_PROMOTION,
      {
        pathParams: { id },
      },
    );
  }
}
