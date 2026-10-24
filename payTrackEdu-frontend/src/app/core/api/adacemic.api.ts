import { ApiEndpoint } from './api.config';

export const API_ACADEMIC_YEAR_ENDPOINTS = {
  FETCH_ACADEMIC_YEARS: { path: 'academic-years', httpVerb: 'GET' },
  SAVE_ACADEMIC_YEAR: { path: 'academic-years', httpVerb: 'POST' },
  GET_ACADEMIC_YEAR_BY_ID: { path: 'academic-years/:id', httpVerb: 'GET' },
  UPDATE_ACADEMIC_YEAR: { path: 'academic-years/:id', httpVerb: 'PUT' },
  DELETE_ACADEMIC_YEAR: { path: 'academic-years/:id', httpVerb: 'DELETE' },
  RESTORE_ACADEMIC_YEAR: { path: 'academic-years/:id', httpVerb: 'PATCH' },
} satisfies Record<string, ApiEndpoint>;
