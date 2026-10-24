import { ApiEndpoint } from './api.config';

export const API_PAYMENT_PLAN_INSTALLMENT_ENDPOINTS = {
  FETCH_PAYMENT_PLAN_INSTALLMENT: {
    path: 'payment-plan-installments',
    httpVerb: 'GET',
  },
  SAVE_PAYMENT_PLAN_INSTALLMENT: {
    path: 'payment-plan-installments',
    httpVerb: 'POST',
  },
  GET_PAYMENT_PLAN_INSTALLMENT_BY_ID: {
    path: 'payment-plan-installments/:id',
    httpVerb: 'GET',
  },
  UPDATE_PAYMENT_PLAN_INSTALLMENT: {
    path: 'payment-plan-installments/:id',
    httpVerb: 'PUT',
  },
  DELETE_PAYMENT_PLAN_INSTALLMENT: {
    path: 'payment-plan-installments/:id',
    httpVerb: 'DELETE',
  },
  RESTORE_PAYMENT_PLAN_INSTALLMENT: {
    path: 'payment-plan-installments/:id',
    httpVerb: 'PATCH',
  },
} satisfies Record<string, ApiEndpoint>;
