import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@env/environment';
import { AuthService } from 'src/app/core/services';
import { CompanyService, LocalService, TokenStorageService } from '@share/services';
import { storage } from 'src/app/core/utils/storage/storage.utils';

/**
 * Interceptor that adds an Authorization header to requests that are authenticated and target the API URL.
 *
 * @param request The request object.
 * @param next The next interceptor in the chain.
 *
 * @returns The next Observable.
 */
export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthService);

    let isRequestAuthorized = authService.isAuthenticated && request.url.startsWith(environment.api);

    const tokenService = inject(TokenStorageService);
    const _localService = inject(LocalService);
    const _companyService = inject(CompanyService);
    const companyId = _localService.getLocalStorage(environment.lscompanyId);
    const userId = _localService.getLocalStorage(environment.lsuserId);
    let token = tokenService.getToken() || _localService.getLocalStorage(environment.lstoken);
    let setGuestAccessToken = false;
    if(!token && !userId) {
        let companies = _localService.getLocalStorage(environment.lscompanies)
            ? JSON.parse(_localService.getLocalStorage(environment.lscompanies))
            : "";
        if(companies?.length > 0) {
            let comp = _companyService.getCompany(companies);
            if (comp?.length > 0) {
                let company = comp[0];
                if(company.guest_access == 1) {
                    setGuestAccessToken = true;
                }
            }
        } else {
            if(companyId == 32 || 
                environment.company == 'vidauniversitaria.universidadeuropea.com' ||
                environment.company == 'schooloflife.vistingo.com' ||
                window.location.host?.indexOf('vidauniversitaria.') >= 0 ||
                window.location.host?.indexOf('uestaging.') >= 0 ||
                window.location.host?.indexOf('schooloflife.') >= 0
            ) {
                setGuestAccessToken = true;
            }
        }
        if(setGuestAccessToken) {
            token = environment.lsguestaccesstoken;
        }
    }

    if(!isRequestAuthorized && setGuestAccessToken) {
        authService.isAuthenticated$.next(true);
        isRequestAuthorized = authService.isAuthenticated && request.url.startsWith(environment.api);
    }

    if (isRequestAuthorized) {
        if (token) {
            const payload = parseJwt(token); // decode JWT payload part.

            if (payload && payload.exp && Date.now() >= payload.exp * 1000) { // Check token exp.
                storage.removeItem('appSession');
                _localService.removeLocalStorage(environment.lstoken);
                _localService.removeLocalStorage(environment.lsrefreshtoken);
                _localService.removeLocalStorage(environment.lsuser);
                location.href =  `/`
            }
      
            // If we have a token, we set it to the header
            request = request.clone({
              setHeaders: {Authorization: `Bearer ${token}`}
            });
        } else {
            storage.removeItem('appSession');
            _localService.removeLocalStorage(environment.lstoken);
            _localService.removeLocalStorage(environment.lsrefreshtoken);
            _localService.removeLocalStorage(environment.lsuser);
            location.href =  `/`
        } 

        const clonedRequest = request.clone({
            setHeaders: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Authorization: `Bearer ${token}`,
            },
        });

        return next(clonedRequest);
    }

    return next(request);
};

export function parseJwt(token): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url?.replace(/-/g, '+')?.replace(/_/g, '/');

    let jsonPayload
    if(base64) {
       jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
    }
  
    return jsonPayload ? JSON.parse(jsonPayload) : null;
}
