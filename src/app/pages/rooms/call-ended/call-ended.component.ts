import { CommonModule } from '@angular/common';
import { 
    ChangeDetectionStrategy,
    Component, 
    HostListener,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
  } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { CompanyService, LocalService } from '@share/services';
import { Subject } from 'rxjs';
import { environment } from '@env/environment';
import get from "lodash/get";

@Component({
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule, 
        RouterModule,
    ],
    templateUrl: './call-ended.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallEndedComponent {
    private destroy$ = new Subject<void>();
    
    languageChangeSubscription;
    language: any;
    companyId: any;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    isMobile: boolean = false;

    constructor(
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
    ) {
        
    }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");

        this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
        this.companies = this._localService.getLocalStorage(environment.lscompanies)
            ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
            : "";
        if (!this.companies) {
            this.companies = get(
                await this._companyService.getCompanies().toPromise(),
                "companies"
            );
        }
        let company = this._companyService.getCompany(this.companies);
        if (company && company[0]) {
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color
                ? company[0].button_color
                : company[0].primary_color;
        }

        this.languageChangeSubscription =
        this._translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
                this.language = event.lang;
                this.initializePage();
            }
        );

        this.initializePage();
    }

    initializePage() {
        
    }

    goHome() {
        setTimeout(() => {
            this._router.navigate([`/`])
            .then(() => {
                window.location.reload();
            });
        }, 500)
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}