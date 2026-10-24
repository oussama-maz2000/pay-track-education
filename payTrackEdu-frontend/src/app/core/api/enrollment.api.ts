import { ApiEndpoint } from './api.config';

export const API_ENROLLMENT_ENDPOINTS = {
  FETCH_ENROLLMENTS: { path: 'enrollments', httpVerb: 'GET' },
  SAVE_ENROLLMENT: { path: 'enrollments', httpVerb: 'POST' },
  GET_ENROLLMENT_BY_ID: { path: 'enrollments/:id', httpVerb: 'GET' },
  UPDATE_ENROLLMENT: { path: 'enrollments/:id', httpVerb: 'PUT' },
  FIND_BY_STUDENT_ID: {
    path: 'enrollments/student/:studentId',
    httpVerb: 'GET',
  },
  FIND_BY_PROMOTION_SESSION_ID: {
    path: 'enrollments/promotion-session/:promotionSessionId',
    httpVerb: 'GET',
  },
  ACTIVATE_ENROLLMENT: { path: 'enrollments/:id/activate', httpVerb: 'PATCH' },
  SUSPEND_ENROLLMENT: { path: 'enrollments/:id/suspend', httpVerb: 'PATCH' },
  CANCEL_ENROLLMENT: { path: 'enrollments/:id/cancel', httpVerb: 'PATCH' },
  CALCULATE_TUITION_AMOUNT_BY_ID: {
    path: 'enrollments/:id/tuition-amount',
    httpVerb: 'GET',
  },
  CALCULATE_TOTAL_AMOUNT_BY_ID: {
    path: 'enrollments/:id/total-amount',
    httpVerb: 'GET',
  },
  CALCULATE_FINAL_AMOUNT_BY_ID: {
    path: 'enrollments/:id/final-amount',
    httpVerb: 'GET',
  },
  CALCULATE_REMAINING_AMOUNT_BY_ID: {
    path: 'enrollments/:id/remaining-amount',
    httpVerb: 'GET',
  },
  CALCULATE_PAID_AMOUNT_BY_ID: {
    path: 'enrollments/:id/paid-amount',
    httpVerb: 'GET',
  },
} satisfies Record<string, ApiEndpoint>;
