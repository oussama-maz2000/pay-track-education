import { ApiEndpoint } from './api.config';

export const API_ENROLLMENT_INSTALLMENT_ENDPOINTS = {
  FETCH_ENROLLMENT_INSTALLMENT_BY_ENROLLMENT_ID: {
    path: 'enrollment-installments/enrollment/:enrollmentId',
    httpVerb: 'GET',
  },
  GENERATE_ENROLLMENT_INSTALLMENT_BY_ENROLLMENT_ID: {
    path: 'enrollment-installments/enrollment/:enrollmentId/generate',
    httpVerb: 'POST',
  },
  GET_ENROLLMENT_INSTALLMENT_BY_ID: {
    path: 'enrollment-installments/:id',
    httpVerb: 'GET',
  },
  UPDATE_DUE_DATE_ENROLLMENT_INSTALLMENT_BY_ID: {
    path: 'enrollment-installments/:id/due-date',
    httpVerb: 'PATCH',
  },

  CANCEL_ENROLLMENT_INSTALLMENT_BY_ID: {
    path: 'enrollment-installments/:id/cancel',
    httpVerb: 'PATCH',
  },
} satisfies Record<string, ApiEndpoint>;
