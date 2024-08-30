import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { AuthService } from 'src/app/core/services';
import { TokenStorageService } from '@share/services';
import { storage } from 'src/app/core/utils/storage/storage.utils';

/**
 * Interceptor that handles caching
 *
 * @param request The request object.
 * @param next The next interceptor in the chain.
 *
 * @returns The next Observable.
 */
export const cacheInterceptor: HttpInterceptorFn = (request, next) => {
    if(request.method !== "GET") {
        return next(request);
    }

    return next(request);
};

