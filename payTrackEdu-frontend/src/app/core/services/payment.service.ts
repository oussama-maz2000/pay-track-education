import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';

import { API_PAYMENT_ENDPOINTS } from '../api/payment.api';
import {
  CancelPaymentDto,
  CreatePaymentDto,
  PaymentDto,
  PaymentResponse,
} from '../model/payment.model';

@Service()
export class PaymentService {
  private readonly httpClientApi = inject(HttpClientApi);

  createPayment$(
    payload: CreatePaymentDto,
  ): Observable<ApiResponse<PaymentResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<PaymentResponse>>(
      API_PAYMENT_ENDPOINTS.CREATE_PAYMENT,
      { body: payload },
    );
  }

  fetchPaymentsByEnrollmentId$(
    enrollmentId: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<PaymentDto>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<PaymentDto>>
    >(API_PAYMENT_ENDPOINTS.FETCH_PAYMENTS_BY_ENROLLMENT_ID, {
      queryParams: { page, size },
      pathParams: { enrollmentId },
    });
  }

  getPaymentById$(
    paymentId: string,
  ): Observable<ApiResponse<PaymentResponse>> {
    return this.httpClientApi.processRequest$<ApiResponse<PaymentResponse>>(
      API_PAYMENT_ENDPOINTS.FETCH_PAYMENT_BY_ID,
      {
        pathParams: { paymentId },
      },
    );
  }

  cancelPayment$(
    paymentId: string,
    payload: CancelPaymentDto,
  ): Observable<ApiResponse<void>> {
    return this.httpClientApi.processRequest$<ApiResponse<void>>(
      API_PAYMENT_ENDPOINTS.CANCEL_PAYMENT,
      { pathParams: { paymentId }, body: payload },
    );
  }
}
