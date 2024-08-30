import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { environment } from '@env/environment';
import { CompanyService, LocalService, TokenStorageService } from '@share/services';
import { AuthService } from 'src/app/core/services';
import { GuestAccess } from "@lib/interfaces";
import guestAccessData from "src/assets/data/guest-access.json";

type AuthGuardOptions = {
    requiresAuthentication: boolean;
};

const defaultAuthGuardOptions = (): AuthGuardOptions => ({
    requiresAuthentication: true,
});

/**
 * Guard that allows or blocks the navigation based on the user's authentication status.
 *
 * @param options An optional object that configures the behavior of the guard.
 * @param options.requiresAuthentication An optional boolean that specifies whether the guard should allow or block navigation based on the user's authentication status.
 *
 * @returns A function that acts as an Angular route guard.
 *
 * @example
 * import { authGuard } from '@lib/guards';
 *
 * const routes: Routes = [
 *   {
 *     path: 'my-protected-component-path',
 *     loadComponent: async () => (await import('./path/to/my-protected-component')).MyProtectedComponent,
 *     canMatch: [authGuard()],
 *   },
 * ];
 *
 * @example
 * import { authGuard } from '@lib/guards';
 *
 * const routes: Routes = [
 *   {
 *     path: 'my-path-component',
 *     loadComponent: async () => (await import('./path/to/my-auth-component')).MyAuthComponent,
 *     canMatch: [authGuard({ requiresAuthentication: false })],
 *   },
 * ];
 */
export const authGuard = (options: AuthGuardOptions = defaultAuthGuardOptions()): CanMatchFn => {
    return (_: Route, segments: UrlSegment[]) => {
        const router = inject(Router);
        const authService = inject(AuthService);
        const guestAccess: GuestAccess[] = guestAccessData;

        const _localService = inject(LocalService);
        const _companyService = inject(CompanyService);
        const localToken = _localService.getLocalStorage(environment.lstoken);
        const localUser = _localService.getLocalStorage(environment.lsuser);
        let companyId = _localService.getLocalStorage(environment.lscompanyId);
        const userId = _localService.getLocalStorage(environment.lsuserId);
        const localAppSession = localStorage.getItem('appSession');
        if(localToken && localUser && !localAppSession) {
            localStorage.setItem('appSession', JSON.stringify({
                user: environment.lsuserId,
                token: environment.lstoken,
            }))
        }

        let setGuestAccessToken = false;
        let hasGuestAccess = false;
        if(!userId) {
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
                let host = window.location.host;
                let company = guestAccess && guestAccess.find(
                  (c) => c.url == host || c.url == environment.company && c.guest_access == 1
                );
                if (company) {
                    hasGuestAccess = true;
                }

                if(companyId == 32 || 
                    environment.company == 'vidauniversitaria.universidadeuropea.com' ||
                    environment.company == 'schooloflife.vistingo.com' ||
                    window.location.host?.indexOf('vidauniversitaria.') >= 0 ||
                    window.location.host?.indexOf('uestaging.') >= 0 ||
                    window.location.host?.indexOf('schooloflife.') >= 0 ||
                    hasGuestAccess
                ) {
                    setGuestAccessToken = true;
                }
            }

            if(setGuestAccessToken) {
                _localService.setLocalStorage(environment.lsuserId, 0);
                localStorage.setItem('appSession', JSON.stringify({
                    user: environment.lsuserId,
                    token: environment.lsguestaccesstoken,
                }))
            }
        }

        if (options.requiresAuthentication === authService.isAuthenticated) {
            return true;
        }

        if (!options.requiresAuthentication) {
            return true;
        }

        if(setGuestAccessToken) {
            return true;
        }

        return options.requiresAuthentication
            ? router.createUrlTree(['/auth/login'], {
                  queryParams: {
                      returnUrl: segments.map((s) => s.path).join('/'),
                  },
              })
            : router.createUrlTree(['/']);
    };
};
