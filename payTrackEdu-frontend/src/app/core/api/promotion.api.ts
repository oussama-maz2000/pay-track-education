import { ApiEndpoint } from './api.config';

export const API_PROMOTION_ENDPOINTS = {
  FETCH_PROMOTIONS: { path: 'promotions', httpVerb: 'GET' },
  SAVE_PROMOTION: { path: 'promotions', httpVerb: 'POST' },
  GET_PROMOTION_BY_ID: { path: 'promotions/:id', httpVerb: 'GET' },
  UPDATE_PROMOTION: { path: 'promotions/:id', httpVerb: 'PUT' },
  DELETE_PROMOTION: { path: 'promotions/:id', httpVerb: 'DELETE' },
  RESTORE_PROMOTION: { path: 'promotions/:id', httpVerb: 'PATCH' },
} satisfies Record<string, ApiEndpoint>;
