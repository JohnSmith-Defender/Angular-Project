import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatTabsModule } from "@angular/material/tabs";
import {
  BreadcrumbComponent,
  PageTitleComponent,
  ToastComponent,
} from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { PlansStatisticsListComponent } from "@features/plans/statistics-list/statistics-list.component";
import { CoursesStatisticsListComponent } from "@features/courses/statistics-list/statistics-list.component";
import get from "lodash/get";
import { BuddyStatisticsListComponent } from "@features/buddy/statistics-list/statistics-list.component";

@Component({
  selector: "app-statistics",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTabsModule,
    SearchComponent,
    BreadcrumbComponent,
    ToastComponent,
    PageTitleComponent,
    PlansStatisticsListComponent,
    CoursesStatisticsListComponent,
    BuddyStatisticsListComponent,
  ],
  templateUrl: "./statistics.component.html",
})
export class StatisticsComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;

  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  searchText: any;
  placeholderText: any;
  userId: any;
  companyId: any;
  language: any;
  isloading: boolean = true;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  plansFeature: any;
  plansFeatureId: any;
  plansTitle: any;
  clubsFeature: any;
  clubsFeatureId: any;
  clubsTitle: any;
  jobOffersFeature: any;
  jobOffersFeatureId: any;
  jobOffersTitle: any;
  cityGuideFeature: any;
  cityGuideFeatureId: any;
  cityGuideTitle: any;
  coursesFeature: any;
  coursesFeatureId: any;
  coursesTitle: any;
  superAdmin: boolean = false;
  company: any;
  isUESchoolOfLife: boolean = false;
  buddyFeature: any;
  buddyFeatureId: any;
  buddyTitle: any;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslanguage) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
      this.company = company[0];
      this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(company[0]);
      this.companyId = company[0].id;
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
    initFlowbite();
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.fetchAdministrarData();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.tools"
    );
    this.level3Title = this._translateService.instant(
      "company-settings.statistics"
    );
    this.level4Title = "";
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchAdministrarData() {
    this._companyService
      .fetchAdministrarData(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapUserPermissions(data?.user_permissions);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.plansFeature = features?.find((f) => f.feature_id == 1 && f.status == 1);
    this.plansFeatureId = this.plansFeature?.feature_id;
    this.plansTitle = this.plansFeature
      ? this.getFeatureTitle(this.plansFeature)
      : "";

    this.coursesFeature = features?.find(
      (f) => f.feature_id == 11 && f.status == 1
    );
    this.coursesFeatureId = this.coursesFeature?.feature_id;
    this.coursesTitle = this.coursesFeature
      ? this.getFeatureTitle(this.coursesFeature)
      : "";

    this.buddyFeature = features?.find((f) => f.feature_id == 19 && f.status == 1);
    this.buddyFeatureId = this.buddyFeature?.feature_id;
    this.buddyTitle = this.buddyFeature
      ? this.getFeatureTitle(this.buddyFeature)
      : "";
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
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

  handleGoBack() {
    this._location.back();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}