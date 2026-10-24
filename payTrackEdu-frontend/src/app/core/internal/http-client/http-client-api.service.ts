import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import {
  ApiEndpoint,
  ApiPayloadParams,
  DEFAULT_API_CONFIG,
} from '../../api/api.config';

@Injectable({
  providedIn: 'root',
})
export class HttpClientApi {
  private readonly http = inject(HttpClient);

  private config = DEFAULT_API_CONFIG;

  buildUrl(endpoint: ApiEndpoint): string {
    const version = endpoint.versionOverride || this.config.defaultVersion;
    return `${this.config.baseApiUrl}/${endpoint.path}`;
  }

  buildQueryParams(
    queryParams?: Record<string, string | number | boolean>,
  ): HttpParams | undefined {
    if (!queryParams) return undefined;

    return Object.entries(queryParams)
      .filter(([, value]) => value != null)
      .reduce(
        (httpParams, [key, value]) => httpParams.set(key, value),
        new HttpParams(),
      );
  }

  processRequest$<T>(
    endpoint: ApiEndpoint,
    options?: ApiPayloadParams,
  ): Observable<T> {
    let url = this.buildUrl(endpoint);
    const { pathParams, queryParams, body } = options || {};

    // Process path parameters
    if (pathParams) {
      Object.entries(pathParams).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(String(value)));
      });
    }

    let request$: Observable<T>;

    switch (endpoint.httpVerb) {
      case 'GET':
        request$ = this.get$<T>(url, queryParams);
        break;

      case 'POST':
        request$ = this.post$<T>(url, body, queryParams);
        break;

      case 'PATCH':
        request$ = this.patch$<T>(url, body);
        break;

      case 'PUT':
        request$ = this.put$<T>(url, body);
        break;

      case 'DELETE':
        request$ = this.delete$<T>(url, body);
        break;

      default:
        request$ = this.post$<T>(url, body, queryParams);
        break;
    }

    // Error handling now happens in the interceptor, not here
    return request$;
  }

  get$<T>(
    url: string,
    queryParams?: Record<string, string | number | boolean>,
  ): Observable<T> {
    const params = this.buildQueryParams(queryParams);
    return this.http.get<T>(url, params ? { params } : undefined);
  }

  post$<T>(
    url: string,
    body: unknown,
    queryParams?: Record<string, string | number | boolean>,
  ): Observable<T> {
    const params = this.buildQueryParams(queryParams);
    //withCredentials: instructs the browser to include credentials (used for cookies here)
    const options: { params?: HttpParams; withCredentials: boolean } = {
      withCredentials: false,
    };
    if (params) options.params = params;

    return this.http.post<T>(url, body, options);
  }

  patch$<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(url, body, { withCredentials: true });
  }

  put$<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(url, body);
  }

  delete$<T>(url: string, body?: unknown): Observable<T> {
    const options = {
      body: body,
    };

    return this.http.delete<T>(url, options);
  }
}
