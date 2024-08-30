import { CommonModule } from "@angular/common";
import { Component, HostListener, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";
import { ButtonGroupComponent, IconFilterComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import { environment } from "@env/environment";
import { PlansAdminListComponent } from "@features/plans/admin-list/admin-list.component";
import { ClubsAdminListComponent } from "@features/clubs/admin-list/admin-list.component";
import { JobOffersAdminListComponent } from "@features/job-offers/admin-list/admin-list.component";
import { CityGuideAdminListComponent } from "@features/city-guide/admin-list/admin-list.component";
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    SearchComponent,
    ButtonGroupComponent,
    IconFilterComponent,
    PlansAdminListComponent,
    ClubsAdminListComponent,
    JobOffersAdminListComponent,
    CityGuideAdminListComponent,
  ],
  templateUrl: "./admin-lists.component.html",
})
export class AdminListsComponent {
  private destroy$ = new Subject<void>();

  @Input() individual: any;

  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  language: any;
  email: any;
  userId: any;
  companyId: any;
  domain: any;
  userRole: any;
  companies: any;
  company: any;
  primaryColor: any;
  buttonColor: any;
  list: any = [];
  buttonList: any = [];
  subButtonList: any = [];
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
  superAdmin: boolean = false;
  canCreatePlan: boolean = false;
  canCreateClub: boolean = false;
  canCreateJobOffer: boolean = false;
  canCreateCityGuide: boolean = false;
  cities: any = [];
  hasSalesProcess: any;
  admin1: boolean = false;
  admin2: boolean = false;
  isSalesPerson: boolean = false;
  filter: string = "";
  status: any = "";
  isUESchoolOfLife: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.domain = this._localService.getLocalStorage(environment.lsdomain);
    this.userRole = this._localService.getLocalStorage(environment.lsuserRole);
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
      this.domain = company[0].domain;
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
    this.initializeSearch();
    this.fetchAdministrarData();
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

          this.cities = data?.cities;
          this.initializeIconFilterList(this.cities);

          this.initializeButtonGroup();
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
    if(this.isUESchoolOfLife) {
      this.plansTitle = this.plansTitle?.replace('de Vida Universitaria', 'de School of Life');
    }

    this.clubsFeature = features?.find(
      (f) => f.feature_id == 5 && f.status == 1
    );
    this.clubsFeatureId = this.clubsFeature?.feature_id;
    this.clubsTitle = this.clubsFeature
      ? this.getFeatureTitle(this.clubsFeature)
      : "";

    this.jobOffersFeature = features?.find(
      (f) => f.feature_id == 18 && f.status == 1
    );
    this.jobOffersFeatureId = this.jobOffersFeature?.feature_id;
    this.jobOffersTitle = this.jobOffersFeature
      ? this.getFeatureTitle(this.jobOffersFeature)
      : "";

    this.cityGuideFeature = features?.find(
      (f) => f.feature_id == 3 && f.status == 1
    );
    this.cityGuideFeatureId = this.cityGuideFeature?.feature_id;
    this.cityGuideTitle = this.cityGuideFeature
      ? this.getFeatureTitle(this.cityGuideFeature)
      : "";
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreatePlan =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 1
      );
    this.canCreateClub =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 5
      );
    this.canCreateJobOffer =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 18
      );
    this.canCreateCityGuide =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 3
      );
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

  initializeIconFilterList(list) {
    if(list?.length > 0) {
      this.list = [
        {
          id: "All",
          value: "",
          text: this._translateService.instant("plans.all"),
          selected: true,
          company_id: this.companyId,
          city: "",
          province: "",
          region: "",
          country: "",
          sequence: "",
          campus: "",
        },
      ];

      list?.forEach((item) => {
        this.list.push({
          id: item.id,
          value: item.id,
          text: item.city,
          selected: false,
          company_id: item.company_id,
          city: item.city,
          province: item.province,
          region: item.region,
          country: item.country,
          sequence: item.sequence,
          campus: item.campus,
        });
      });
    }
  }

  initializeButtonGroup() {
    let list: any[] = [];

    if (this.plansFeatureId > 0) {
      list.push({
        id: this.plansFeatureId,
        value: this.plansFeatureId,
        text: this.plansTitle,
        selected: true,
        fk_company_id: this.companyId,
        filter: "plans",
      });
    }

    if (this.clubsFeatureId > 0 && !this.isUESchoolOfLife) {
      if(this.superAdmin) {
        list.push({
          id: this.clubsFeatureId,
          value: this.clubsFeatureId,
          text: this.clubsTitle,
          selected: !this.plansFeatureId ? true : false,
          fk_company_id: this.companyId,
          filter: "clubs",
        });
      }
    }

    if (this.jobOffersFeatureId > 0 && !this.isUESchoolOfLife) {
      list.push({
        id: this.jobOffersFeatureId,
        value: this.jobOffersFeatureId,
        text: this.jobOffersTitle,
        selected: !this.plansFeatureId && !this.clubsFeatureId ? true : false,
        fk_company_id: this.companyId,
        filter: "canalempleo",
      });
    }

    this.buttonList = list;
    let filter = this.buttonList?.find((f) => f.selected);
    if (filter) {
      this.filter = filter.filter;
    }
    this.initializeSubButtonGroup();
  }

  getCategoryTitle(category) {
    return this.language == "en"
      ? category.name_EN || category.name_en
      : this.language == "fr"
      ? category.name_FR || category.name_fr
      : this.language == "eu"
      ? category.name_EU ||
        category.name_eu ||
        category.name_ES ||
        category.name_es
      : this.language == "ca"
      ? category.name_CA ||
        category.name_ca ||
        category.name_ES ||
        category.name_es
      : this.language == "de"
      ? category.name_DE ||
        category.name_de ||
        category.name_ES ||
        category.name_es
      : category.name_ES || category.name_es;
  }

  initializeSubButtonGroup() {
    let sublist: any[] = [];

    let selected_list = this.buttonList?.find((f) => f.selected);
    let plan = false;
    let club = false;
    let canal_empleo = false;
    if (selected_list?.id == 1) {
      plan = true;
    }
    if (selected_list?.id == 5) {
      club = true;
    }
    if (selected_list?.id == 18) {
      canal_empleo = true;
    }

    sublist.push({
      id: 1,
      value: "active",
      text: this._translateService.instant("your-admin-area.active"),
      selected: true,
      fk_company_id: this.companyId,
      filter: "active",
    });

    if (plan) {
      sublist.push({
        id: 2,
        value: "inactive",
        text: this._translateService.instant("company-settings.inactive"),
        selected: false,
        fk_company_id: this.companyId,
        filter: "inactive",
      });
      sublist.push({
        id: 3,
        value: "draft",
        text: this._translateService.instant("plan-create.draft"),
        selected: false,
        fk_company_id: this.companyId,
        filter: "draft",
      });
      sublist.push({
        id: 3,
        value: "past",
        text: this._translateService.instant("your-admin-area.past"),
        selected: false,
        fk_company_id: this.companyId,
        filter: "past",
      });

      if(this.companyId == 12) {
        sublist.push({
          id: 4,
          value: "salesprocess",
          text: this._translateService.instant("your-admin-area.salesprocess"),
          selected: false,
          fk_company_id: this.companyId,
          filter: "salesprocess",
        });
      }
    }

    if (!plan) {
      sublist.push({
        id: 4,
        value: "inactive",
        text: this._translateService.instant("company-settings.inactive"),
        selected: false,
        fk_company_id: this.companyId,
        filter: "inactive",
      });
    }

    if (
      this.hasSalesProcess &&
      (this.superAdmin || this.admin1 || this.admin2 || this.isSalesPerson)
    ) {
      sublist.push({
        id: 5,
        value: "salesprocess",
        text: this._translateService.instant("your-admin-area.salesprocess"),
        selected: false,
        fk_company_id: this.companyId,
        filter: "salesprocess",
      });
    }

    this.subButtonList = sublist;
    let subfilter = this.subButtonList?.find((f) => f.selected);
    if (subfilter) {
      this.status = subfilter.filter;
    }
  }

  filterByType(event) {
    this.buttonList?.forEach((item) => {
      if (item.filter === event.filter) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.filter = event.filter;
    this.initializeSubButtonGroup();
  }

  filterByStatus(event) {
    this.subButtonList?.forEach((item) => {
      if (item.filter === event.filter) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.status = event.filter;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}