import {HttpInterceptorFn} from "@angular/common/http";
import {STORAGE_KEYS} from "../internal/storage/storage-keys";
import { JwtHelperService } from "@auth0/angular-jwt";
import {inject} from "@angular/core";
import {StorageCoreService} from "../internal/storage/storage-core.service";

export const authorizationInterceptor: HttpInterceptorFn = (req, next) => {
    const storageCoreService:StorageCoreService=inject(StorageCoreService);
    let headers = req.headers;
    const helper = new JwtHelperService();
    const isPublicEndpoint = ['signin','signup', 'forgot-password', 'reset-password'].some(urlPart => req.url.includes(urlPart));
    const accessToken=storageCoreService.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);

    if (isPublicEndpoint) {
        headers = headers.set('Content-Type', 'application/json; charset=utf-8');
        const publicRequest = req.clone({headers});
        return next(publicRequest);
    }


   if (accessToken && !helper.isTokenExpired(accessToken)) {
        let headers = req.headers.set('Authorization', 'Bearer ' + accessToken);
        const authenticatedRequest = req.clone({headers});
        return next(authenticatedRequest);
    }

    const request = req.clone({headers});
    return next(request);
}
