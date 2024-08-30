import { CommonModule, Location } from "@angular/common";
import { Component, HostListener, Input } from "@angular/core";
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { ActivatedRoute, Router } from "@angular/router";
import { SearchComponent } from "@share/components/search/search.component";
import { BreadcrumbComponent, PageTitleComponent } from "@share/components";
import { ShopService } from "@features/services/shop/shop.service";
import { ProductCardComponent } from "@share/components/card/product/product.component";
import get from "lodash/get";

@Component({
    selector: "app-shop-checkout",
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        SearchComponent,
        PageTitleComponent,
        ProductCardComponent,
        BreadcrumbComponent,
    ],
    templateUrl: "./checkout.component.html",
})
export class ShopCheckoutComponent {
    private destroy$ = new Subject<void>();

    @Input() id: any;

    languageChangeSubscription;
    searchText: any;
    placeholderText: any;
    language: any
    isloading: boolean = true
    apiPath: string = environment.api
    email = ''
    userId: any = 0
    userEmailDomain: any
    userRole: any
    companyId: any = 0
    companies: any
    primaryColor: any
    buttonColor: any
    isMobile: boolean = false
    user: any
    shopFeature: any;
    featureId: any;
    pageName: any;
    pageDescription: any;
    showFilters: boolean = false;
    filterSettings: any;
    superAdmin: boolean = false;
    canViewShop: boolean = false;
    canCreateShop: any;
    canManageShop: boolean = false;
    filterTypeControl: any;
    products: any = [];
    title: any;
    level1Title: string = "";
    level2Title: string = "";
    level3Title: string = "";
    level4Title: string = "";

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _shopService: ShopService,
        private _location: Location,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();

        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || 'es');
        this.user = this._localService.getLocalStorage(environment.lsuser);
        this.email = this._localService.getLocalStorage(environment.lsemail);
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
        this.userEmailDomain = this._localService.getLocalStorage(environment.lsdomain);
        this.userRole = this._localService.getLocalStorage(environment.lsuserRole);
        this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies)) : '';
        if (!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
        let company = this._companyService.getCompany(this.companies);
        if (company && company[0]) {
            this.userEmailDomain = company[0].domain;
            this.companyId = company[0].id;
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color;
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
        this.fetchShopsData();
    }

    fetchShopsData() {
        this._shopService
            .fetchShopsData(this.companyId, this.userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (data) => {
                    this.mapFeatures(data?.features_mapping);
                    this.mapSubfeatures(data?.settings?.subfeatures);
                    this.user = data?.user;
                    this.mapUserPermissions(data?.user_permissions);
                    if (this.id > 0) {
                        this.fetchProduct();
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    mapFeatures(features) {
        this.shopFeature = features?.find((f) => f.feature_id == 24);
        this.featureId = this.shopFeature?.feature_id;
        this.pageName = this.getFeatureTitle(this.shopFeature);
        this.pageDescription = this.getFeatureDescription(this.shopFeature);
    }

    mapSubfeatures(subfeatures) {
        if (subfeatures?.length > 0) {
            // this.categoriesFilterActive = subfeatures.some(
            //   (a) => a.name_en == "Filter" && a.active == 1
            // );
        }
    }

    mapUserPermissions(user_permissions) {
        this.superAdmin = user_permissions?.super_admin_user ? true : false;
        this.canViewShop = user_permissions?.member_type_permissions?.find(
            (f) => f.view == 1 && f.feature_id == 1
        )
            ? true
            : false;
        this.canCreateShop =
            user_permissions?.create_plan_roles?.length > 0 ||
            user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 1);
        this.canManageShop = user_permissions?.member_type_permissions?.find(
            (f) => f.manage == 1 && f.feature_id == 1
        )
            ? true
            : false;
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
                                : feature.description_es
            : "";
    }

    fetchProduct() {
        this.title = this._translateService.instant('shop.product');
        this.initializeBreadcrumb();
    }

    initializeBreadcrumb() {
        this.level1Title = this.pageName;
        this.level2Title = this.title;
        this.level3Title = "";
        this.level4Title = "";
    }

    proceedToPayment() {
        this._router.navigate([`/shop/order-summary`]);
    }

    handleGoBack() {
        this._location.back();
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}