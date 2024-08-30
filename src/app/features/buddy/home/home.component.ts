import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from 'rxjs';
import { environment } from '@env/environment';
import { BuddyService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormsModule } from '@angular/forms';
import { NoAccessComponent } from '@share/components';
import get from 'lodash/get';

@Component({
    selector: 'app-buddy-home',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        NgOptimizedImage,
        FormsModule,
        NoAccessComponent,
    ],
    templateUrl: './home.component.html'
})
export class BuddyHomeComponent {
    private destroy$ = new Subject<void>();

    languageChangeSubscription;
    user: any;
    email: any;
    language: any;
    companyId: any = 0;
    companies: any;
    domain: any;
    pageTitle: any;
    features: any;

    primaryColor: any;
    buttonColor: any;
    hoverColor: any;
    userId: any;
    subfeatures: any;
    superAdmin: boolean = false;
    pageName: any;
    pageDescription: any;
    showSectionTitleDivider: boolean = false;
    isMobile: boolean = false;
    buddyFeature: any;
    featureId: any;
    searchText: any;
    placeholderText: any;
    search: any;
    p: any;
    buddies: any = [];
    allBuddies: any = [];
    list: any[] = [];
    buttonList: any;
    cities: any = [];
    selectedCity: any = '';
    defaultActiveFilter: boolean = false;
    filterActive: boolean = false;
    filterSettings: any = [];
    showFilters: boolean = false;
    buddyRole: any;
    proceedHover: boolean = false;
    mentorHover: boolean = false;
    isMentor: boolean = false;
    currentUser: any;
    isLoading: boolean = true;
    hasAccess: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _buddyService: BuddyService
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        initFlowbite();

        this.email = this._localService.getLocalStorage(environment.lsemail);
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(
            environment.lscompanyId
        );
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");
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
            this.domain = company[0].domain;
            this.companyId = company[0].id;
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color
                ? company[0].button_color
                : company[0].primary_color;
            this.hoverColor = company[0].hover_color
                ? company[0].hover_color
                : company[0].primary_color;
            this.showSectionTitleDivider = company[0].show_section_title_divider;
            this._localService.setLocalStorage(
                environment.lscompanyId,
                this.companyId
            );
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
        this.fetchBuddiesData();
    }

    fetchBuddiesData() {
        if(this.userId > 0) {
            this._buddyService
                .fetchBuddiesData(this.companyId, this.userId)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    (data) => {
                        this.currentUser = data?.user;
                        this.mapFeatures(data?.features_mapping);
                        this.mapUserPermissions(data?.user_permissions);
                        this.isMentor = data?.mentor?.id > 0 ? true : false;
                        this.isLoading = false;
                    },
                    (error) => {
                        console.log(error);
                    }
                );
        } else {
            this.isLoading = false;
            this.hasAccess = false;
        }
    }

    mapFeatures(features) {
        this.buddyFeature = features?.find((f) => f.feature_id == 19);
        this.featureId = this.buddyFeature?.id;
        this.pageName = this.getFeatureTitle(this.buddyFeature);
        this.pageDescription = this.getFeatureDescription(this.buddyFeature);
    }

    mapUserPermissions(user_permissions) {
        this.superAdmin = user_permissions?.super_admin_user ? true : false;
        if(this.superAdmin) { 
            this.hasAccess = true; 
        } else {
            if(this.currentUser?.bussines_unit &&
                !(this.currentUser?.bussines_unit?.toLowerCase()?.indexOf('online') >= 0) &&
                this.currentUser?.segment?.toLowerCase()?.indexOf('grado') >= 0) {
                this.hasAccess = true;
            }
        }
    }

    getFeatureTitle(feature) {
        return feature
            ? this.language == "en"
                ? feature.name_en ||
                feature.feature_name ||
                feature.name_es ||
                feature.feature_name_ES
                : this.language == "fr"
                    ? feature.name_fr ||
                    feature.feature_name_FR ||
                    feature.name_es ||
                    feature.feature_name_ES
                    : this.language == "eu"
                        ? feature.name_eu ||
                        feature.feature_name_EU ||
                        feature.name_es ||
                        feature.feature_name_ES
                        : this.language == "ca"
                            ? feature.name_ca ||
                            feature.feature_name_CA ||
                            feature.name_es ||
                            feature.feature_name_ES
                            : this.language == "de"
                                ? feature.name_de ||
                                feature.feature_name_DE ||
                                feature.name_es ||
                                feature.feature_name_ES
                                : this.language == "it"
                                    ? feature.name_it ||
                                    feature.feature_name_IT ||
                                    feature.name_es ||
                                    feature.feature_name_ES
                                    : feature.name_es || feature.feature_name_ES
            : "";
    }

    getFeatureDescription(feature) {
        return feature
            ? this.language == "en"
                ? feature.description_en || feature.description_es
                : this.language == "fr"
                    ? feature.description_fr || feature.description_es
                    : this.language == "eu"
                        ? feature.description_eu || feature.description_es
                        : this.language == "ca"
                            ? feature.description_ca || feature.description_es
                            : this.language == "de"
                                ? feature.description_de || feature.description_es
                                : this.language == "it"
                                    ? feature.description_it || feature.description_es
                                    : feature.description_es
            : "";
    }

    toggleProceedHover(event) {
        this.proceedHover = event;
    }

    toggleMentorHover(event) {
        this.mentorHover = event;
    }

    requestToBeMentor() {
        if(this.userId > 0) {
            this._router.navigate([`/buddy/mentor/request`]);
        } else {
            this._router.navigate(['/auth/login']);
        }
    }

    continue() {
        if(this.userId > 0) {
           if (this.buddyRole == 'mentee') {
                this._router.navigate([`/buddy/list`])
            } else if (this.buddyRole == 'mentor') {
                this._router.navigate([`/buddy/profile/mentor/${this.userId}`]);
            } 
        } else {
            this._router.navigate(['/auth/login']);
        }
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}