import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { FilterComponent, PageTitleComponent } from '@share/components';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { SearchComponent } from "@share/components/search/search.component";
import { NgxPaginationModule } from "ngx-pagination";
import { CompanyService, LocalService } from '@share/services';
import { environment } from '@env/environment';
import { MemberCardComponent } from '@share/components/card/member/member.component';
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { ServiciosService } from '@features/services';
import { ServiceCardComponent } from '@share/components/card/servicio/servicio.component';
import get from 'lodash/get';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgxPaginationModule,
    MatSnackBarModule,
    NgOptimizedImage,
    PageTitleComponent,
    SearchComponent,
    MemberCardComponent,
    FilterComponent,
    ServiceCardComponent,
  ],
  templateUrl: './list.component.html'
})
export class ServicesListComponent {
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
  servicesFeature: any;
  featureId: any;
  canViewService: boolean = false;
  canCreateService: boolean = false;
  canManageOffer: boolean = false;
  createHover: boolean = false;
  searchText: any;
  placeholderText: any;
  search: any;
  p: any;
  services: any = [];
  allServices: any = [];
  apiPath: string = environment.api + '/';
  sendReferenceForm: any;
  sendReferenceFormSubmitted: boolean = false;
  processingSendReference: boolean = false;
  member: any;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  dialogMode: string = "";
  dialogTitle: any;
  cities: any;
  list: any;
  sectors: any;
  buttonList: any;
  selectedCity: any;
  selectedSector: any;

  constructor(
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _servicesService: ServiciosService,
    private _snackBar: MatSnackBar
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

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
    this.initializeSearch();
    this.fetchOffers();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchOffers() {
    this._servicesService
      .fetchServices(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures );
          this.mapUserPermissions(data?.user_permissions);
          this.allServices = data?.services;
          this.formatServices(data?.services);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.servicesFeature = features?.find((f) => f.feature_id == 14);
    this.featureId = this.servicesFeature?.id;
    this.pageName = this.getFeatureTitle(this.servicesFeature);
    this.pageDescription = this.getFeatureDescription(this.servicesFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canViewService = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 4
    )
      ? true
      : false;
    this.canCreateService =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 14);
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

  formatServices(services) {
    services = services?.map((item) => {
      return {
        ...item,
        id: item?.id,
        path: `/services/details/${item.id}`,
        image: `${environment.api}/get-image/${item.image}`,
      };
    });

    if(services?.length > 0) {
      this.services = services?.sort((a, b) => {
        const oldDate: any = new Date(a.created_at);
        const newDate: any = new Date(b.created_at);

        return  newDate - oldDate;
      });
    }
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.filterServices();
  }

  filterServices() {
    let services = this.allServices
    if (this.search) {
      services = services.filter(service => {
        let include = false;

        if (
          (service?.name && ((service?.name).normalize("NFD").replace(/\p{Diacritic}/gu, "")).toLowerCase().indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (service?.description && ((service?.description.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          ) {
          include = true
        }

        return include;
      })
    }

    this.formatServices(services);
  }

  handleCreateRoute() {
    this._router.navigate([`/services/create/0`]);
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
