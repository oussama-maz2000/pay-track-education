import { ApiEndpoint } from './api.config';

export const API_USERS_ENDPOINTS = {
  FETCH_USERS: { path: 'users', httpVerb: 'GET' },
  SAVE_USER: { path: 'users', httpVerb: 'POST' },
} satisfies Record<string, ApiEndpoint>;
