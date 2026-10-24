import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_PAYMENT_PLAN_INSTALLMENT_ENDPOINTS } from '../api/payment-plan-installment.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';
import {
  PaymentPlanForInstallmentDetails,
  PaymentPlanInstallmentDto,
  PaymentPlanInstallmentRequest,
} from '../model/payment-plan-installment.model';

@Service()
export class PaymentPlanInstallmentService {
  private readonly httpClientApi = inject(HttpClientApi);

  createPaymentPlanInstallment$(
    payload: PaymentPlanInstallmentRequest,
  ): Observable<ApiResponse<PaymentPlanForInstallmentDetails>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<PaymentPlanForInstallmentDetails>
    >(API_PAYMENT_PLAN_INSTALLMENT_ENDPOINTS.SAVE_PAYMENT_PLAN_INSTALLMENT, {
      body: payload,
    });
  }

  fetchPaymentPlansInstallments$(
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<PaymentPlanInstallmentDto>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<PaymentPlanInstallmentDto>>
    >(API_PAYMENT_PLAN_INSTALLMENT_ENDPOINTS.FETCH_PAYMENT_PLAN_INSTALLMENT, {
      queryParams: { page, size },
    });
  }

  getPaymentPlanInstallmentById$(
    id: string,
  ): Observable<ApiResponse<PaymentPlanForInstallmentDetails>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<PaymentPlanForInstallmentDetails>
    >(
      API_PAYMENT_PLAN_INSTALLMENT_ENDPOINTS.GET_PAYMENT_PLAN_INSTALLMENT_BY_ID,
      {
        pathParams: { id },
      },
    );
  }

  updatePaymentPlanInstallment$(
    id: string,
    payload: PaymentPlanInstallmentRequest,
  ): Observable<ApiResponse<PaymentPlanForInstallmentDetails>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<PaymentPlanForInstallmentDetails>
    >(API_PAYMENT_PLAN_INSTALLMENT_ENDPOINTS.UPDATE_PAYMENT_PLAN_INSTALLMENT, {
      pathParams: { id },
      body: payload,
    });
  }

  deletePaymentPlanInstallment$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_PAYMENT_PLAN_INSTALLMENT_ENDPOINTS.DELETE_PAYMENT_PLAN_INSTALLMENT,
      { pathParams: { id } },
    );
  }

  restorePaymentPlanInstallment$(
    id: string,
  ): Observable<ApiResponse<PaymentPlanForInstallmentDetails>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<PaymentPlanForInstallmentDetails>
    >(API_PAYMENT_PLAN_INSTALLMENT_ENDPOINTS.RESTORE_PAYMENT_PLAN_INSTALLMENT, {
      pathParams: { id },
    });
  }
}
