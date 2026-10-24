import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_PAYMENT_PLAN_ENDPOINTS } from '../api/payment-plan.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';
import {
  PaymentPlan,
  PaymentPlanDetails,
  PaymentPlanForInstallment,
  PaymentPlanRequest,
} from '../model/payment-plan.model';

@Service()
export class PaymentPlanService {
  private readonly httpClientApi = inject(HttpClientApi);

  createPaymentPlan$(
    payload: PaymentPlanRequest,
  ): Observable<ApiResponse<PaymentPlanDetails>> {
    return this.httpClientApi.processRequest$<ApiResponse<PaymentPlanDetails>>(
      API_PAYMENT_PLAN_ENDPOINTS.SAVE_PAYMENT_PLANS,
      { body: payload },
    );
  }

  fetchPaymentPlans$(
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<PaymentPlan>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<PaymentPlan>>
    >(API_PAYMENT_PLAN_ENDPOINTS.FETCH_PAYMENT_PLANS, {
      queryParams: { page, size },
    });
  }

  fetchPaymentPlansForInstallment$(
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<PaymentPlanForInstallment>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<PaymentPlanForInstallment>>
    >(API_PAYMENT_PLAN_ENDPOINTS.FETCH_PAYMENT_PLANS_FOR_INSTALLMENT, {
      queryParams: { page, size },
    });
  }

  getPaymentPlanById$(id: string): Observable<ApiResponse<PaymentPlanDetails>> {
    return this.httpClientApi.processRequest$<ApiResponse<PaymentPlanDetails>>(
      API_PAYMENT_PLAN_ENDPOINTS.GET_PAYMENT_PLANS_BY_ID,
      {
        pathParams: { id },
      },
    );
  }

  updatePaymentPlan$(
    id: string,
    payload: PaymentPlanRequest,
  ): Observable<ApiResponse<PaymentPlanDetails>> {
    return this.httpClientApi.processRequest$<ApiResponse<PaymentPlanDetails>>(
      API_PAYMENT_PLAN_ENDPOINTS.UPDATE_PAYMENT_PLANS,
      {
        pathParams: { id },
        body: payload,
      },
    );
  }

  deletePaymentPlan$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_PAYMENT_PLAN_ENDPOINTS.DELETE_PAYMENT_PLANS,
      { pathParams: { id } },
    );
  }

  restorePaymentPlan$(id: string): Observable<ApiResponse<PaymentPlanDetails>> {
    return this.httpClientApi.processRequest$<ApiResponse<PaymentPlanDetails>>(
      API_PAYMENT_PLAN_ENDPOINTS.RESTORE_PAYMENT_PLANS,
      {
        pathParams: { id },
      },
    );
  }
}
