import { CommonModule, Location } from "@angular/common";
import { 
  ChangeDetectionStrategy,
  Component,
  ChangeDetectorRef, 
} from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { Router } from "@angular/router";
import { LocalService, CompanyService } from "src/app/share/services";
import { BreadcrumbComponent, ButtonGroupComponent, PageTitleComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import { HorizontalCardComponent } from "@share/components/horizontal-card/horizontal-card.component";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { MenuService } from "@lib/services";
import { environment } from "@env/environment";
import { Subject, takeUntil } from "rxjs";
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BreadcrumbComponent,
    SearchComponent,
    ButtonGroupComponent,
    HorizontalCardComponent,
    PageTitleComponent,
  ],
  templateUrl: "./features-list.component.html",
})
export class FeaturesListComponent {
  private destroy$ = new Subject<void>();

  level1Title: any;
  level2Title: any;
  level3Title: any;
  level4Title: any;
  buttonColor: any;
  userId: any;
  companyId: any;
  language: any;
  companies: any;
  primaryColor: any;
  features: any = [];
  companyFeatures: any = [];
  allCompanyFeatures: any = [];
  companyDomain: any;
  isPlanEnabled: boolean = false;
  planTitle: any;
  isClubEnabled: boolean = false;
  clubTitle: any;
  isDiscountEnabled: boolean = false;
  discountTitle: any;
  blogTitle: any;
  isBlogEnabled: boolean = false;
  isServiceEnabled: boolean = false;
  isCourseEnabled: boolean = false;
  courseTitle: any;
  isServicesEnabled: boolean = false;
  servicesTitle: any;
  hasJobOffers: boolean = false;
  jobOffersTitle: any;
  hasBuddies: boolean = false;
  isBuddyEnabled: boolean = false;
  buddiesTitle: any;
  isTutorsEnabled: boolean = false;
  tutorsTitle: any;
  imageSrc: string = `${COMPANY_IMAGE_URL}/`;
  searchText: any = "";
  placeholderText: any = "";
  search: string = "";
  buttonList: any = [];
  selectedFilter: any;
  isInitialLoad = true;
  isLoading: boolean = false;
  languageChangeSubscription;
  isUESchoolOfLife: boolean = false;

  constructor(
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _menuService: MenuService,
    private _location: Location,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
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
      this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(company[0]);
      this.companyId = company[0].id;
      this.companyDomain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializeData();
        }
      );

    this.initializeData();
  }

  initializeData() {
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.initializeButtonGroup();
    this.getCompanyFeatures();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.personalization"
    );
    this.level3Title = this._translateService.instant(
      "company-settings.modules"
    );
  }

  initializeButtonGroup() {
    this.buttonList = [
      {
        id: 1,
        value: "All",
        text: this._translateService.instant("company-settings.all"),
        selected: true,
      },
      {
        id: 2,
        value: 1,
        text: this._translateService.instant("company-settings.active"),
        selected: false,
      },
      {
        id: 3,
        value: 0,
        text: this._translateService.instant("company-settings.inactive"),
        selected: false,
      },
    ];
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getCompanyFeatures() {
    this._companyService
      .getFeaturesList(this.companyDomain)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.companyFeatures = response;
          this.companyFeatures = this.companyFeatures?.filter((f) => {
            return f.id != 22;
          });
          this.allCompanyFeatures = this.companyFeatures;
          this.isInitialLoad = false;
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  handleButtonClick(event) {
    if (event) {
      this.buttonList?.forEach((item) => {
        if (item.id === event.id) {
          item.selected = true;
        } else {
          item.selected = false;
        }
      });

      this.filterFeatures(event);
    }
  }

  filterFeatures(event) {
    this.selectedFilter = event;
    this.companyFeatures = this.allCompanyFeatures;
    this.filterByStatus();
  }

  filterByStatus() {
    if (this.selectedFilter?.value == 0) {
      this.companyFeatures = this.companyFeatures?.filter((feature) => {
        return feature.status != 1;
      });
    } else if (this.selectedFilter?.value == 1) {
      this.companyFeatures = this.companyFeatures?.filter((feature) => {
        return feature.status == 1;
      });
    }
  }

  getFeatureTitle(feature) {
    let code = this.language == 'en' ? '' : this.language;
    let column = `name_${code}` || `feature_name_${code}`;
    let text = feature[column];
    if(this.companyId == 32) {
      if(this.isUESchoolOfLife) {
        text = text?.replace('de Vida Universitaria', 'de School of Life');
        text = text?.replace('University Life', 'School of Life')
      }
    }
    return text || (feature.name_es || feature.feature_name_es);
  } 

  getFeatureDescription(feature) {
    return this.language == "en"
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
      : feature.description_es;
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.searchFeatures(event);
  }

  searchFeatures(event) {
    this.companyFeatures = this.allCompanyFeatures;
    this.filterByStatus();

    if (event && this.companyFeatures?.length > 0) {
      let company_features = this.companyFeatures?.filter((feature) => {
        let include = false;

        let title = this.getFeatureTitle(feature);
        let description = this.getFeatureDescription(feature);

        if (
          (title && title?.toLowerCase().indexOf(event?.toLowerCase()) >= 0) ||
          (description &&
            description?.toLowerCase().indexOf(event?.toLowerCase()) >= 0)
        ) {
          include = true;
        }

        return include;
      });
      this.companyFeatures = company_features;
    }
  }

  handleActionClick(event) {
    this.manageFeature(event);
  }

  manageFeature(feature) {
    let new_status = feature.status == 1 ? 0 : 1;
    let payload = {
      feature_id: feature.id,
      entity_id: this.companyId,
      status: new_status,
      domain: this.companyDomain,
      name_en: feature.feature_name,
      name_es: feature.feature_name_es,
      name_fr: feature.feature_name_fr,
      name_eu: feature.feature_name_eu,
      name_ca: feature.feature_name_ca,
      name_de: feature.feature_name_de,
      name_it: feature.feature_name_it,
    };

    this._companyService
      .manageCompanyFeature(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          if (response) {
            if (this.companyFeatures) {
              this.companyFeatures.forEach((feat) => {
                if (feat.id == feature.id) {
                  feat.status = new_status;
                }
              });
            }
            if (this.allCompanyFeatures) {
              this.allCompanyFeatures.forEach((feat) => {
                if (feat.id == feature.id) {
                  feat.status = new_status;
                }
              });
            }
            let menus = this._localService.getLocalStorage(environment.lsmenus)
              ? JSON.parse(
                  this._localService.getLocalStorage(environment.lsmenus)
                )
              : [];
            let new_menus: any[] = [];
            if (menus?.length > 0) {
              new_menus = menus;
              new_menus.forEach((menu, index) => {
                if (
                  feature.status == 0 &&
                  menu.path != "home" &&
                  menu.path != "dashboard" &&
                  menu.id == feature.id
                ) {
                  new_menus.splice(index, 1);
                }
              });
            }

            if (feature.status == 1) {
              let path = this.getFeaturePath(feature);
              let name = this.getFeatureName(feature);
              if (path) {
                new_menus.push({
                  id: feature.id,
                  name: name,
                  name_CA: feature.name_ca
                    ? feature.name_ca
                    : feature.feature_name_CA,
                  name_DE: feature.name_de
                    ? feature.name_de
                    : feature.feature_name_DE,
                  name_ES: feature.name_es
                    ? feature.name_es
                    : feature.feature_name_ES,
                  name_EU: feature.name_eu
                    ? feature.name_eu
                    : feature.feature_name_EU,
                  name_FR: feature.name_fr
                    ? feature.name_fr
                    : feature.feature_name_FR,
                  name_IT: feature.name_it
                    ? feature.name_it
                    : feature.feature_name_IT,
                  path: path,
                  sequence: feature?.sequence,
                  show: true,
                });
              }
            }

            this._menuService.updateMenu(new_menus);
            this.filterFeatures(this.selectedFilter);
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getFeaturePath(feature) {
    let tempPath = feature.feature_name.replace(/\s/g, "").toLowerCase();
    return tempPath == "cityagenda" ? "cityguide" : tempPath;
  }

  getFeatureName(feature) {
    let tempName = feature.name_en ? feature.name_en : feature.feature_name;
    return tempName == "cityagenda" ? "cityguide" : tempName;
  }

  handleViewDetails(event) {
    this.goToFeature(event);
  }

  goToFeature(feature) {
    this._router.navigate([`/settings/feature/${feature.id}`]);
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
