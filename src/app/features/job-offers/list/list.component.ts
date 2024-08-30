import { CommonModule } from "@angular/common";
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
import { JobOffersService } from "@features/services";
import { SearchComponent } from "@share/components/search/search.component";
import { DateAgoPipe } from "@lib/pipes";
import { FilterComponent, IconFilterComponent, PageTitleComponent } from "@share/components";
import { NgxPaginationModule } from "ngx-pagination";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-job-offers-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SearchComponent,
    IconFilterComponent,
    FilterComponent,
    PageTitleComponent,
    DateAgoPipe,
    NgxPaginationModule,
  ],
  templateUrl: "./list.component.html",
})
export class JobOffersListComponent {
  private destroy$ = new Subject<void>();

  @Input() parentComponent: any;
  @Input() limit: any;

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
  otherSettings: any
  me: any
  features: any
  featureId: any
  pageName: any
  skeletonItems: any = []
  types: any = []
  languages: any = []
  sectors: any = []
  allJobOffers: any = []
  jobOffers: any = []
  search: any
  searchArea: any
  selectedSectorFilter: any = ''
  canCreateJobOffer: boolean = false
  roles: any
  admin1: boolean = false
  admin2: boolean = false
  superAdmin: boolean = false
  hasCustomMemberTypeSettings: boolean = false
  showTermsAndConditionsModal: boolean = false
  termsAndConditions: any
  selectedJobId: any
  imageSrc: string = environment.api + '/get-image-joboffer/'
  selectedCategory: any
  categories: any = []
  allCategoryLabel: any
  cities: any = []
  selectedCity: any = ''
  showFilter: boolean = false
  subfeatures2: any
  jobOffersFeature: any
  company_subfeatures = []
  subfeature_id_global: number = 0
  feature_global: string = ''
  areas: any = []
  selectedArea: any = ''
  allOffers: any = []
  isMobile: boolean = false
  endOfListReached: boolean = false
  isOfferHideDaysActive: boolean = false
  hideDays: any
  hasMobileLimit: boolean = false
  mobileLimit: any
  desktopLimit: any
  offset: number = 0
  showSectionTitleDivider: boolean = false
  isOfferCandidatesDisplayActive: boolean = false
  candidatesDisplay: any
  userRoles: any
  list: any[] = [];
  jobOfferAreasMapping: any = [];
  jobOfferApplicationsMapping: any = [];
  pageDescription: any;
  title: any;
  subtitle: any;
  companyName: any;
  p: any;
  createHover: boolean = false;
  hover: boolean = false;
  selectedOfferId: any;
  locations: any = [];
  buttonList: any = [];
  selectedLocation: any = '';
  user: any;
  campus: any = '';
  defaultActiveFilter: boolean = false;
  filterSettings: any = [];
  showFilters: boolean = false;
  truncate: number = 120;
  closeDays: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _jobOffersService: JobOffersService
  ) {}

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
      this.companyName = company[0].entity_name;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color;
      this.termsAndConditions = company[0].job_terms_and_conditions;
      this.showSectionTitleDivider = company[0].show_section_title_divider;
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
    this.fetchJobOffers();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchJobOffers() {
    this._jobOffersService
      .fetchJobOffers(this.companyId, this.userId, 'active', this.campus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.closeDays = data?.settings?.offer_hide_days_settings?.hide_days || 0;
          this.mapCities(data?.cities);
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures);

          this.initializeFilterSettings(data?.module_filter_settings);

          this.mapUserPermissions(data?.user_permissions);

          this.locations = data?.job_locations;
          this.initializeIconFilterList(this.locations);

          this.categories = data?.job_areas;
          this.initializeButtonGroup();

          this.areas = data?.job_areas;
          this.types = data?.job_types;
          this.candidatesDisplay = data?.settings?.offer_candidates_display_settings?.candidates_display || '';
          this.hideDays = data?.settings?.offer_hide_days_setting?.hide_dayss || '';

          this.jobOfferAreasMapping = data?.job_offer_areas;
          this.jobOfferApplicationsMapping = data?.job_offer_applications;
          this.formatJobOffers(data?.job_offers);
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
    if(filter_settings_active?.length > 0 && this.showFilter) {
      this.showFilters = true;
      this.filterSettings = filter_settings;
    }
  }

  mapCities(cities) {
    this.cities = cities;
    if(this.cities?.length > 0 && this.companyId == 32) {
      let campus = this.cities?.find((f) => f.campus?.indexOf(this.user?.campus?.replace(/ /g,"_")) >= 0);
      if(campus?.city) {
        localStorage.setItem('job-offers-filter-city', campus?.city);
      }
    }
  }

  mapFeatures(features) {
    this.jobOffersFeature = features?.find((f) => f.feature_id == 18);
    this.featureId = this.jobOffersFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.jobOffersFeature);
    this.pageDescription = this.getFeatureDescription(this.jobOffersFeature);
    this.mapPageTitle();
  }

  mapPageTitle() {
    this.title =this.pageName;
    this.subtitle = `${this.pageDescription} ${this.companyName}.`;
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.showFilter = subfeatures.some(
        (a) => a.name_en == "Filter" && a.active == 1
      );
      this.isOfferHideDaysActive = subfeatures.some(
        (a) => a.name_en == "Hide offers" && a.active == 1
      );
      this.hasMobileLimit = subfeatures.some(
        (a) => a.name_en == "View more" && a.active == 1
      );
      this.isOfferCandidatesDisplayActive = subfeatures.some(
        (a) => a.name_en == "Candidates display" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreateJobOffer =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 18);
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
      },
    ];

    list?.forEach((item, index) => {
      this.list.push({
        id: index + 1,
        value: item.location,
        text: item.location,
        selected: false,
        company_id: this.companyId,
      });
    });
  }

  initializeButtonGroup() {
    let categories = this.categories;
    let text = this._translateService.instant("plans.all");
    if(this.filterSettings?.length > 0) {
      let category_filter = this.filterSettings?.filter(fs => {
        return fs.field == 'category'
      })
      if(category_filter?.length > 0 && category_filter[0].filter_type == 'dropdown') {
        text = category_filter[0].select_text;
      }
    }
    this.buttonList = [
      {
        id: "All",
        value: "All",
        text,
        selected: true,
        fk_company_id: this.companyId,
        fk_supercategory_id: "All",
        name_CA: "All",
        name_DE: "All",
        name_EN: "All",
        name_ES: "All",
        name_EU: "All",
        name_FR: "All",
        sequence: 1,
        status: 1,
      },
    ];

    categories?.forEach((category, index) => {
      this.buttonList.push({
        id: index + 1,
        value: category.id,
        text: category.title,
        selected: false,
        fk_company_id: this.companyId,
        fk_supercategory_id: category.id,
        sequence: index + 1,
        status: 1,
      });
    });
  }

  formatJobOffers(offers) {
    let jobOffers = this.sortOffers(offers)

    jobOffers = jobOffers?.map(offer => {
      let type_row = this.types?.filter(jt => {
        return jt.id == offer.type_id
      })

      return {
        ...offer,
        title_display: this.getOfferTitle(offer),
        type_display: type_row?.length > 0 ? this.getTypeTitle(type_row[0]) : '',
        area_display: this.getAreaDisplay(offer),
        description_display: this.getDescription(offer),
        excerpt: this.getExcerpt(this.getDescription(offer)),
        active_status: this.getStatus(offer),
      }
    })

    if(jobOffers?.length > 0) {
      jobOffers = jobOffers.sort((a, b) => {
        const oldDate: any = new Date(a.created_at);
        const newDate: any = new Date(b.created_at);
        return newDate - oldDate;
      });
    }
    
    this.allJobOffers = jobOffers;

    let selected = localStorage.getItem('job-offers-filter-city');
    if(selected && this.list?.length > 0) {
      this.list.forEach(item => {
        if(item.value == selected) {
          item.selected = true;
          this.selectedLocation = selected;
        } else {
          item.selected = false;
        }
      })
    }
    this.filterJobOffers();
  }

  getStatus(offer) {
    var a = moment(offer.created_at);
    var b = moment(new Date());
    let diff = b.diff(a, "days");

    let status = diff > this.closeDays ? 'closed' : '';
    return status;
  }

  getExcerpt(description) {
    let charlimit = this.truncate;
    if (!description || description.length <= charlimit) {
      return description;
    }

    let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
    without_html = description.replace(/[\u{0080}-\u{FFFF}]/gu, "");
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  getDescription(offer) {
    return this.language == "en"
      ? offer.description_en || offer.description
      : this.language == "fr"
      ? offer.description_fr || offer.description
      : this.language == "eu"
      ? offer.description_eu || offer.description
      : this.language == "ca"
      ? offer.description_ca || offer.description
      : this.language == "de"
      ? offer.description_de || offer.description
      : offer.description;
  }

  sortOffers(offers) {
    let jobOffers = offers?.length > this.limit && this.parentComponent
    ? offers?.slice(0, this.limit)
    : offers;

    jobOffers = jobOffers?.sort((a, b) => {
      const oldDate: any = new Date(a.created_at)
      const newDate: any = new Date(b.created_at)

      return newDate - oldDate
    })

    return jobOffers
  }

  getAreaDisplay(offer) {
    let area_display = ''

    let job_areas = this.areas?.filter(ja => {
      return this.jobOfferAreasMapping?.some((a) => a.job_offer_id === offer.id && a.area_id == ja.id);
    })

    area_display = job_areas?.length > 1 ? job_areas?.map( (data) => { return data.title }).join(', ') : (job_areas?.length == 1 ? job_areas[0].title : '')

    return area_display
  }

  getOfferTitle(offer) {
    return this.language == 'en' ? (offer.title_en || offer.title) : (this.language == 'fr' ? (offer.title_fr || offer.title) :
      (this.language == 'eu' ? (offer.title_eu || offer.title) : (this.language == 'ca' ? (offer.title_ca || offer.title) :
        (this.language == 'de' ? (offer.title_de || offer.title) : offer.title)
      ))
    )
  }

  getTypeTitle(type) {
    return this.language == 'en' ? (type.title_en || type.title) : (this.language == 'fr' ? (type.title_fr || type.title) :
      (this.language == 'eu' ? (type.title_eu || type.title) : (this.language == 'ca' ? (type.title_ca || type.title) :
        (this.language == 'de' ? (type.title_de || type.title) : type.title)
      ))
    )
  }

  handleSearchChanged(event) {
    this.search = event || ''
    this.filterJobOffers()
  }

  filteredArea(event) {
    this.buttonList?.forEach((item) => {
      if (item.id === event.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedArea = event.id || ''
    this.filterJobOffers()
  }

  filteredLocation(event) {
    this.list?.forEach((item) => {
      if (item.value === event) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedLocation = event || '';
    localStorage.setItem('job-offers-filter-city', this.selectedLocation);
    this.filterJobOffers();
  }

  filterJobOffers() {
    let jobOffers = this.allJobOffers
    if (this.search) {
      jobOffers = jobOffers.filter(m => {
        let include = false

        if (
          (m.title && m.title.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.title_en && m.title_en.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.title_fr && m.title_fr.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.title_eu && m.title_eu.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.title_ca && m.title_ca.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.title_de && m.title_de.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.description && m.description.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.description_en && m.description_en.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.description_fr && m.description_fr.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.description_eu && m.description_eu.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.description_ca && m.description_ca.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.description_de && m.description_de.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.location && m.location.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
          || (m.company && m.company.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
        ) {
          include = true
        }

        return include
      })
    }

    let type_checked = this.types.find(ty => ty.checked == true)
    if(type_checked) {
      jobOffers = jobOffers.filter(offer => {
        let include = false

        this.types.forEach(type => {
          if (type.checked && type.id == offer.type_id) {
            include = true
          }
        })
        return include
      })
    }
    if(this.selectedArea) {
      let text = this._translateService.instant("plans.all");
      if(this.filterSettings?.length > 0) {
        let category_filter = this.filterSettings?.filter(fs => {
          return fs.field == 'category'
        })
        if(category_filter?.length > 0 && category_filter[0].filter_type == 'dropdown') {
          text = category_filter[0].select_text;
        }
      }

      if(!(this.selectedArea == text || this.selectedArea == 'Todas' || this.selectedArea == 'All')) {
        jobOffers = jobOffers.filter(jo => {
          let include = false

          if(this.jobOfferAreasMapping?.length > 0) {
            include = this.jobOfferAreasMapping.some((a) => a.area_id == this.selectedArea && a.job_offer_id == jo.id);
          }

          return include
        })
      }
    }

    if(this.selectedLocation) {
      jobOffers = jobOffers.filter(jo => {
        return jo.location == this.selectedLocation
      })
    }

    if(this.search || this.selectedArea) {
      this.jobOffers = jobOffers;
    } else {
      this.jobOffers = this.sortOffers(jobOffers);
    }
  }

  handleCreateRoute() {
    this._router.navigate([`/employmentchannel/create/0`])
  }

  handleDetailsRoute(offer) {
    this._router.navigate([`/employmentchannel/details/${offer.id}`])
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  toggleHover(state, offer) {
    this.hover = state
    this.selectedOfferId = state ? offer.id : ''
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