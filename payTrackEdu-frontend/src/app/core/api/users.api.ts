import { ApiEndpoint } from './api.config';

export const API_USERS_ENDPOINTS = {
  FETCH_USERS: { path: 'user', httpVerb: 'GET' },
  SAVE_USER: { path: 'user', httpVerb: 'POST' },
  UPDATE_USER: { path: 'user/:id', httpVerb: 'PUT' },
  DEACTIVATE_USER: { path: 'user/:id', httpVerb: 'PATCH' },
  RESET_USER_PASSWORD: {
    path: 'user/:id/password-by-admin',
    httpVerb: 'PATCH',
  },
  CHANGE_PASSWORD: { path: 'user/change-password', httpVerb: 'PUT' },
} satisfies Record<string, ApiEndpoint>;
