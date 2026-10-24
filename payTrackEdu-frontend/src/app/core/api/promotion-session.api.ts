import { ApiEndpoint } from './api.config';

export const API_PROMOTION_SESSION_ENDPOINTS = {
  FETCH_PROMOTION_SESSIONS: { path: 'promotion-sessions', httpVerb: 'GET' },
  FETCH_PROMOTION_SESSIONS_FOR_PAYMENT_PLAN: {
    path: 'promotion-sessions/payment-plan-options',
    httpVerb: 'GET',
  },
  SAVE_PROMOTION_SESSIONS: { path: 'promotion-sessions', httpVerb: 'POST' },
  GET_PROMOTION_SESSIONS_BY_ID: {
    path: 'promotion-sessions/:id',
    httpVerb: 'GET',
  },
  UPDATE_PROMOTION_SESSIONS: {
    path: 'promotion-sessions/:id',
    httpVerb: 'PUT',
  },
  DELETE_PROMOTION_SESSIONS: {
    path: 'promotion-sessions/:id',
    httpVerb: 'DELETE',
  },
  RESTORE_PROMOTION_SESSIONS: {
    path: 'promotion-sessions/:id',
    httpVerb: 'PATCH',
  },
} satisfies Record<string, ApiEndpoint>;
