import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, HostListener } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CityGuidesService } from "@features/services";
import { SearchComponent } from "@share/components/search/search.component";
import { FilterComponent, PageTitleComponent } from "@share/components";
import { NgxPaginationModule } from "ngx-pagination";
import get from "lodash/get";

@Component({
  selector: "app-city-guide-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SearchComponent,
    FilterComponent,
    NgOptimizedImage,
    RouterModule,
    NgxPaginationModule,
    PageTitleComponent
  ],
  templateUrl: "./list.component.html",
})
export class CityGuideListComponent {
  private destroy$ = new Subject<void>();

  languageChangeSubscription;
  isMobile: boolean = false;
  language: any;
  email: any;
  userId: any;
  companyId: any;
  domain: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  searchText: any;
  placeholderText: any;
  search: any;
  cityGuidesFeature: any;
  featureId: any;
  pageName: any;
  cities: any;
  superAdmin: boolean = false;
  filterActive: any;
  searchByKeyword: any;
  hasMobileLimit: any;
  canViewCityGuide: boolean = false;
  canCreateCityGuide: boolean = false;
  canManageCityGuide: boolean = false;
  list: any[] = [];
  cityGuides: any;
  allCityGuides: any[] = [];
  selectedCity: any;
  pageDescription: any;
  p: any;
  createHover: boolean = false;
  readHover: boolean = false;
  selectedGuideId: any;
  user: any;
  campus: any = '';
  defaultActiveFilter: boolean = false;
  filterSettings: any = [];
  showFilters: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _cityGuidesService: CityGuidesService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    this.user = this._localService.getLocalStorage(environment.lsuser);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.domain = this._localService.getLocalStorage(environment.lsdomain);
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
    this.fetchCityGuides();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchCityGuides() {
    this._cityGuidesService
      .fetchCityGuides(this.companyId, this.userId, "active", this.campus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapCities(data?.cities);
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures);

          this.initializeFilterSettings(data?.module_filter_settings);

          this.mapUserPermissions(data?.user_permissions);

          this.cities = data?.cities;
          this.initializeIconFilterList(this.cities);

          this.formatCityGuides(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializeFilterSettings(filter_settings) {
    let filter_settings_active = filter_settings?.filter(fs => {
      return fs.active == 1
    })
    if(filter_settings_active?.length > 0 && this.filterActive) {
      this.showFilters = true;
      this.filterSettings = filter_settings;
    }
  }

  mapCities(cities) {
    this.cities = cities;
    if(this.cities?.length > 0 && this.companyId == 32) {
      let campus = this.cities?.find((f) => f.campus?.indexOf(this.user?.campus?.replace(/ /g,"_")) >= 0);
      if(campus?.city) {
        localStorage.setItem('city-guide-filter-city', campus?.city);
      }
    }
  }

  mapFeatures(features) {
    this.cityGuidesFeature = features?.find((f) => f.feature_id == 3);
    this.featureId = this.cityGuidesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.cityGuidesFeature);
    this.pageDescription = this.getFeatureDescription(this.cityGuidesFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.filterActive = subfeatures.some(
        (a) => a.name_en == "Filter" && a.active == 1
      );
      this.searchByKeyword = subfeatures.some(
        (a) => a.name_en == "Search content by keyword" && a.active == 1
      );
      this.hasMobileLimit = subfeatures.some(
        (a) => a.name_en == "View more" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canViewCityGuide = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 3
    )
      ? true
      : false;
    this.canCreateCityGuide =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 3
      );
    this.canManageCityGuide = user_permissions?.member_type_permissions?.find(
      (f) => f.manage == 1 && f.feature_id == 3
    )
      ? true
      : false;
  }

  initializeIconFilterList(list) {
    let text = this._translateService.instant("plans.all");
    if(this.filterSettings?.length > 0) {
      let city_filter = this.filterSettings?.filter(fs => {
        return fs.field == 'city'
      })
      if(city_filter?.length > 0) {
        text = city_filter[0].select_text;
      }
    }
    this.list = [
      {
        id: "All",
        value: "",
        text,
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

  async formatCityGuides(data) {
    let city_guides = data?.city_guides;

    city_guides = city_guides?.map((guide) => {
      let description = this.getCityGuideDescription(guide);
      let likes = data?.city_guide_likes?.filter((g) => {
        return g.object_id == guide.id;
      });
      let limit_likes = likes
      if(likes?.length > 3) {
        limit_likes = likes.slice(0, 3)
      }

      return {
        ...guide,
        name: this.getCityGuideName(guide),
        description,
        image: `${environment.api}/get-image/${guide.image}`,
        truncated_description: this.getExcerpt(description),
        excerpt: this.getCityGuideExcerpt(guide),
        likes: this.formatLikes(limit_likes, guide),
        likes_text:
          likes?.length > 0
            ? `${likes?.length}+ ${this._translateService.instant(
                "wall.likes"
              )}`
            : "",
      };
    });

    this.cityGuides = city_guides;
    this.allCityGuides = city_guides;

    let selected = localStorage.getItem('city-guide-filter-city');
    if(selected && this.list?.length > 0) {
      this.list.forEach(item => {
        if(item.city == selected) {
          item.selected = true;
          this.selectedCity = selected;
        } else {
          item.selected = false;
        }
      })
      this.filteredCity(selected);
    }
  }

  getCityGuideName(guide) {
    return guide
      ? this.language == "en"
        ? guide.name_EN || guide.name_ES
        : this.language == "fr"
        ? guide.name_FR || guide.name_ES
        : this.language == "eu"
        ? guide.name_EU || guide.name_ES
        : this.language == "ca"
        ? guide.name_CA || guide.name_ES
        : this.language == "de"
        ? guide.name_DE || guide.name_ES
        : guide.name_ES
      : "";
  }

  getCityGuideDescription(guide) {
    return guide
      ? this.language == "en"
        ? guide.description_EN || guide.description_ES
        : this.language == "fr"
        ? guide.description_FR || guide.description_ES
        : this.language == "eu"
        ? guide.description_EU || guide.description_ES
        : this.language == "ca"
        ? guide.description_CA || guide.description_ES
        : this.language == "de"
        ? guide.description_DE || guide.description_ES
        : guide.description_ES
      : "";
  }

  getCityGuideExcerpt(guide) {
    return guide
      ? this.language == "en"
        ? guide.leadin_EN || guide.leadin_ES
        : this.language == "fr"
        ? guide.leadin_FR || guide.leadin_ES
        : this.language == "eu"
        ? guide.leadin_EU || guide.leadin_ES
        : this.language == "ca"
        ? guide.leadin_CA || guide.leadin_ES
        : this.language == "de"
        ? guide.leadin_DE || guide.leadin_ES
        : guide.leadin_ES
      : "";
  }

  getExcerpt(description) {
    let charlimit = 100;
    if (!description || description.length <= charlimit) {
      return description;
    }

    let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  formatLikes(likes, guide) {
    return likes?.map((like) => {
      return {
        ...like,
        image: `${environment.api}/${like.image}`,
      };
    });
  }

  handleCreateRoute() {
    this._router.navigate([`/cityguide/create/0`]);
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.filterCityGuides();
  }

  filteredCity(event) {
    this.list?.forEach((item) => {
      if (item.city === event) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedCity = event || "";
    localStorage.setItem('city-guide-filter-city', this.selectedCity);
    this.filterCityGuides();
  }

  async filterCityGuides() {
    this.cityGuides = this.allCityGuides;

    if (this.search) {
      this.cityGuides = this.cityGuides.filter((guide) => {
        let include = false;

        if (
          guide.name.toLowerCase().indexOf(this.search.toLowerCase()) >= 0 ||
          (guide.name_EN &&
            guide.name_EN.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (guide.name_FR &&
            guide.name_FR.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (guide.name_EU &&
            guide.name_EU.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (guide.name_CA &&
            guide.name_CA.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (guide.name_DE &&
            guide.name_DE.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
        ) {
          include = true;
        }

        return include;
      });
    }

    if (this.selectedCity) {
      let city = this.cities?.find((f) => f.city == this.selectedCity);
      this.cityGuides = this.cityGuides.filter((guide) => {
        return guide.city_id == city?.id;
      });
    }
  }

  goToDetails(guide) {
    this._router.navigate([`/cityguide/details/${guide?.id}`]);
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  toggleReadHover(event, guide) {
    this.readHover = event;
    this.selectedGuideId = event ? guide.id : ''
  }

  filterViewChanged(event) {
    this.defaultActiveFilter = event;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}