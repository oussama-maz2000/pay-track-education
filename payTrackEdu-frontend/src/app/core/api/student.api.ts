import { ApiEndpoint } from './api.config';

export const API_STUDENT_ENDPOINTS = {
  FETCH_STUDENTS: { path: 'students', httpVerb: 'GET' },
  FETCH_STUDENTS_FOR_ENROLLMENT: {
    path: 'students/for-enrollment',
    httpVerb: 'GET',
  },
  SAVE_STUDENT: { path: 'students', httpVerb: 'POST' },
  GET_STUDENT_BY_ID: { path: 'students/:id', httpVerb: 'GET' },
  UPDATE_STUDENT: { path: 'students/:id', httpVerb: 'PUT' },
  DELETE_STUDENT: { path: 'students/:id', httpVerb: 'DELETE' },
  RESTORE_STUDENT: { path: 'students/:id', httpVerb: 'PATCH' },
} satisfies Record<string, ApiEndpoint>;
