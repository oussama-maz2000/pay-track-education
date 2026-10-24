import { environment } from "../../../environments/environments";


export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export interface ApiEndpoint {
    path: string;
    httpVerb?: HttpVerb;
    versionOverride?: string | number;
};
export interface ApiPayloadParams {
    body?: unknown;
    queryParams?: Record<string, string | number | boolean>;
    pathParams?: Record<string, string | number>;
}
export const DEFAULT_API_CONFIG = {
    baseApiUrl: environment.apiUrl,
    authApiUrl: environment.apiAuthUrl,
    defaultVersion: 1,
    defaultHttpVerb: 'POST' as HttpVerb,
};
