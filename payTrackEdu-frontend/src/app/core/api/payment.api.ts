import { ApiEndpoint } from './api.config';

export const API_PAYMENT_ENDPOINTS = {
  FETCH_PAYMENTS_BY_ENROLLMENT_ID: {
    path: 'payments/enrollment/:enrollmentId',
    httpVerb: 'GET',
  },
  CREATE_PAYMENT: { path: 'payments', httpVerb: 'POST' },
  CANCEL_PAYMENT: { path: 'payments/:paymentId/cancel', httpVerb: 'POST' },
  FETCH_PAYMENT_BY_ID: { path: 'payments/:paymentId', httpVerb: 'GET' },
} satisfies Record<string, ApiEndpoint>;
