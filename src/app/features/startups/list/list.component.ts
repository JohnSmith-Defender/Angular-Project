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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { StartupsService } from '@features/services';
import { StartupCardComponent } from '@share/components/card/startup/startup.component';
import get from 'lodash/get';

@Component({
  selector: 'app-startups-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgOptimizedImage,
    PageTitleComponent,
    SearchComponent,
    FilterComponent,
    StartupCardComponent,
  ],
  templateUrl: './list.component.html'
})
export class StartupsListComponent {
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
  startupsFeature: any;
  featureId: any;
  canViewStartup: boolean = false;
  canCreateStartup: boolean = false;
  canManageOffer: boolean = false;
  createHover: boolean = false;
  searchText: any;
  placeholderText: any;
  search: any;
  p: any;
  startups: any = [];
  allStartups: any = [];
  apiPath: string = environment.api + '/';
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
    private _startupsService: StartupsService,
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
    this.fetchStartups();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchStartups() {
    this._startupsService
      .fetchStartups(this.companyId, this.userId, 'active')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures );
          this.mapUserPermissions(data?.user_permissions);
          this.allStartups = this.formatStartups(data?.startups);
          this.startups = this.allStartups;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.startupsFeature = features?.find((f) => f.feature_id == 17);
    this.featureId = this.startupsFeature?.id;
    this.pageName = this.getFeatureTitle(this.startupsFeature);
    this.pageDescription = this.getFeatureDescription(this.startupsFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canViewStartup = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 17
    )
      ? true
      : false;
    this.canCreateStartup =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 17);
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

  formatStartups(startups) {
    startups = startups?.map((item) => {
      return {
        ...item,
        id: item?.id,
        path: `/startups/details/${item.id}`,
        image: `${environment.api}/get-image-startup/${(item.logo || 'startupLogo.png')}`,
        name: item?.startup_name,
      };
    });

    return startups;
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.filterStartups();
  }

  filterStartups() {
    let startups = this.allStartups
    if (this.search) {
      startups = startups.filter(startup => {
        let include = false;

        if (
          (startup?.startup_name && ((startup?.startup_name).normalize("NFD").replace(/\p{Diacritic}/gu, "")).toLowerCase().indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (startup?.city && ((startup?.city.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          ) {
          include = true
        }

        let match = startup?.sectors?.some((a) => a?.category?.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0);
        if(match) {
          include = true
        }

        return include;
      })
    }

    this.startups = this.formatStartups(startups);
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
