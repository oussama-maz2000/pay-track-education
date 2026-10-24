import {ApiEndpoint} from "./api.config";

export const API_AUTH_ENDPOINTS = {
   LOGIN: { path: 'auth/login' },
   ME: { path: 'auth/me', httpVerb: 'GET' },

} satisfies Record<string, ApiEndpoint>;
