import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class CustomTitleResolver implements Resolve<string> {
    constructor(
        private _translateService: TranslateService,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Promise<string> {
        if (!route.data['titleKey']) {
            return Promise.resolve('Default title');
        }

        return Promise.resolve(
            this._translateService.instant(route.data['titleKey'])
        );
    }
}