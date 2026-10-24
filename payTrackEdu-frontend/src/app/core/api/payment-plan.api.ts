import { ApiEndpoint } from './api.config';

export const API_PAYMENT_PLAN_ENDPOINTS = {
  FETCH_PAYMENT_PLANS: { path: 'payment-plans', httpVerb: 'GET' },
  FETCH_PAYMENT_PLANS_FOR_INSTALLMENT: {
    path: 'payment-plans/for-installment',
    httpVerb: 'GET',
  },
  SAVE_PAYMENT_PLANS: { path: 'payment-plans', httpVerb: 'POST' },
  GET_PAYMENT_PLANS_BY_ID: {
    path: 'payment-plans/:id',
    httpVerb: 'GET',
  },
  UPDATE_PAYMENT_PLANS: {
    path: 'payment-plans/:id',
    httpVerb: 'PUT',
  },
  DELETE_PAYMENT_PLANS: {
    path: 'payment-plans/:id',
    httpVerb: 'DELETE',
  },
  RESTORE_PAYMENT_PLANS: {
    path: 'payment-plans/:id',
    httpVerb: 'PATCH',
  },
} satisfies Record<string, ApiEndpoint>;
