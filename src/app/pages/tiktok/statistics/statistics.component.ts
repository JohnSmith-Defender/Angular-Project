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
  NoAccessComponent,
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
import { QuestionnairesStatisticsListComponent } from "@pages/settings/questionnaires/statistics-list/statistics-list.component";
import { LandingPagesStatisticsListComponent } from "@pages/settings/landing-pages/statistics-list/statistics-list.component";
import { VideosCTAsStatisticsListComponent } from "@pages/settings/videos-ctas/statistics-list/statistics-list.component";
import get from "lodash/get";

@Component({
  selector: "app-tiktok-statistics",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTabsModule,
    SearchComponent,
    BreadcrumbComponent,
    ToastComponent,
    PageTitleComponent,
    NoAccessComponent,
    QuestionnairesStatisticsListComponent,
    LandingPagesStatisticsListComponent,
    VideosCTAsStatisticsListComponent
  ],
  templateUrl: "./statistics.component.html",
})
export class TiktokStatisticsComponent {
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
  questionnaires: any;
  questionnairesTitle: any;
  landingPagesFeature: any;
  landingPagesTitle: any;
  superAdmin: boolean = false;
  company: any;
  videosCTAsFeature: any;
  videosCTAsTitle: any;
  isTutorUser: boolean = false

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
    this.level2Title = "TikTok";
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
      .fetchTikTokData(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
            this.mapModules(data?.tiktok_modules);
            this.mapUserPermissions(data?.user_permissions);

          this.isloading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapModules(modules) {
    this.questionnaires = modules?.find((f) => f.id == 144 && f.active == 1);
    this.questionnairesTitle = this.questionnaires
      ? this.getModuleTitle(this.questionnaires)
      : "";

    this.landingPagesFeature = modules?.find(
      (f) => f.id == 145 && f.active == 1
    );
    this.landingPagesTitle = this.landingPagesFeature
      ? this.getModuleTitle(this.landingPagesFeature)
      : "";

    this.videosCTAsFeature = modules?.find(
        (f) => f.id == 149 && f.active == 1
    );
    this.videosCTAsTitle = this.videosCTAsFeature
    ? this.getModuleTitle(this.videosCTAsFeature)
    : "";
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.isTutorUser = user_permissions?.tutor_user ? true : false
  }

  getModuleTitle(module) {
    return module
      ? this.language == "en"
        ? module.title_en ||
          module.title_es
        : this.language == "fr"
        ? module.title_fr ||
          module.title_es
        : this.language == "eu"
        ? module.title_eu ||
          module.title_es
        : this.language == "ca"
        ? module.title_ca ||
          module.title_es
        : this.language == "de"
        ? module.title_de ||
          module.title_es
        : module.title_es
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