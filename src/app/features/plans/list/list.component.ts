import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, HostListener, Input, ChangeDetectorRef } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { ActivatedRoute, Router } from "@angular/router";
import { PlansService } from "@features/services";
import { PlansCalendarComponent } from "../calendar/calendar.component";
import { SearchComponent } from "@share/components/search/search.component";
import { 
  ButtonGroupComponent, 
  FilterComponent, 
  IconFilterComponent, 
  PageTitleComponent, 
  AgeGroupFilterComponent, 
  GroupFilterComponent 
} from "@share/components";
import { NgxPaginationModule } from "ngx-pagination";
import { PlanCardComponent } from "@share/components/card/plan/plan.component";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-plans-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PlansCalendarComponent,
    SearchComponent,
    IconFilterComponent,
    FilterComponent,
    PageTitleComponent,
    PlanCardComponent,
    ButtonGroupComponent,
    NgOptimizedImage,
    NgxPaginationModule,
    AgeGroupFilterComponent,
    GroupFilterComponent,
  ],
  templateUrl: "./list.component.html",
})
export class PlansListComponent {
  private destroy$ = new Subject<void>();

  @Input() parentComponent: any;
  @Input() limit: any;
  @Input() view: any;
  @Input() mode: any;

  languageChangeSubscription;
  language: any;
  apiPath: string = environment.api;
  email = "";
  userId: any = 0;
  companyId: any = 0;
  plans: any = [];
  url: string = "";
  plan_type;
  user: any = {};
  showFilter: boolean = false;
  filteredPlan: any = [];
  categoryList: any = [];
  isloading: boolean = true;
  filterType: string = "All";
  category_type: string = "todas las categorías";
  selected: any;
  userEmailDomain: any;
  type: any;
  fType: string = "All";
  ieEvents: any;
  filteredIEEvents: any;
  planCreateType: any;
  modal: any;
  selectedPlanType: any;
  selectedClub: any;
  clubList: any = [];
  locale: any;
  categories: any;
  subcategories: any;
  subcats: any = [];
  types: any;
  userRole: any;
  me: any;
  roles: any;
  admin1: boolean = false;
  admin2: boolean = false;
  superAdmin: boolean = false;
  pageName: any;
  features: any;
  categoriesFilterActive: any;
  subfeatures: any;
  canCreatePlan: boolean = false;
  canViewPlan: boolean = false;
  canManagePlan: boolean = false;
  companies: any;
  classificationsFilterActive: any;
  dateFilterActive: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  otherSettings: any;
  hasCustomMemberTypeSettings: boolean = false;
  memberTypes: any = [];
  featureId: any;
  hasGuestAccess: boolean = false;
  customsubcategories: any = [];
  customsubcats: any = [];
  searchByCityOrKeyword: boolean = false;
  search: any;
  filterStartDate: any;
  filterDate: any;
  showPastEvents: boolean = false;
  selectedPlanId: any;
  cities: any;
  selectedCity: any;
  plansFeature: any;
  permissions = [];
  member_type_id_global: number = 0;
  planSubcategories: any = [];
  selectedFilterCategory: any;
  selectedFilterSubcategory: any;
  allPlans: any = [];
  isMobile: boolean = false;
  endOfListReached: boolean = false;
  hasMobileLimit: boolean = false;
  mobileLimit: any;
  dashboardDetails: any;
  isDashboardActive: boolean = false;
  isMyClubsActive: boolean = false;
  myClubs: any;
  isMyActivitiesActive: boolean = false;
  myActivities: any;
  canAssignMultipleCities: boolean = false;
  hasFeatured: boolean = false;
  featuredTextValue: any;
  featuredTextValueEn: any;
  featuredTextValueFr: any;
  featuredTextValueEu: any;
  featuredTextValueCa: any;
  featuredTextValueDe: any;
  hasDateSelected: boolean = false;
  calendarFilterMode: boolean = false;
  joinedPlan: boolean = false;
  loadedCategories: boolean = false;
  isRecurringActive: boolean = false;
  isOrderActive: boolean = false;
  recurringDisplayDays: any;
  orderSetting: any;
  clubTitle: any;
  childNotifier: Subject<boolean> = new Subject<boolean>();
  CompanyGroups: any = [];
  courses: any = [];
  groups: any = [];
  courseCategoriesAccessRoles: any = [];
  allCourseCategories: any = [];
  courseCategoryMapping: any = [];
  showSectionTitleDivider: boolean = false;
  sectionOptions: any = [];
  profileHomeContentSetting: any = [];
  showMemberEventsOnly: boolean = true;
  hasCourses: boolean = false;
  userRoles: any;
  planSubcats: any = [];
  planSubcatsMapping: any = [];
  hasCourseRestrictions: boolean = false;
  coursesSubFeatures: any;
  pastPlans: any = [];
  showEventsCalendar: boolean = false;
  searchText: any;
  placeholderText: any;
  buttonList: any;
  subButtonList: any;
  list: any;
  planCategoriesMapping: any = [];
  planSubcategoriesMapping: any = [];
  pageDescription: any;
  title: any;
  subtitle: any;
  p: number = 1;
  createHover: boolean = false;
  myActivitiesHover: boolean = false;

  newURLButton: any;
  newURLButtonTextValue: any;
  newURLButtonTextValueEn: any;
  newURLButtonTextValueFr: any;
  newURLButtonTextValueEu: any;
  newURLButtonTextValueCa: any;
  newURLButtonTextValueDe: any;
  newURLButtonUrl: any;
  isUESchoolOfLife: boolean = false;
  schoolOfLifeTitle: any;
  userInfo: any;
  campus: any = '';
  kcnPlanCategoryMapping: any = [];
  selectedType: any = '';
  userAdditionalProperties: any = [];
  filterTypeControl: any = '';
  bottomEventTitles: boolean = false;
  activityCities: any = [];
  ageGroupFilterActive: boolean = false;
  groupFilterActive: boolean = false;
  allAgeGroups: any = [];
  ageGroupList: any = [];
  allGroups: any = [];
  groupList: any = [];
  selectedAgeGroup: any = '';
  selectedGroup: any = '';
  defaultActiveFilter: boolean = false;
  filterSettings: any = [];
  showFilters: boolean = false;
  noCategoryFilter: boolean = false;

  currentPage: number = 1;
  pageSize: number = 8;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _plansService: PlansService,
    private cd: ChangeDetectorRef
  ) {
    this.selectedPlanType = 1;
    this.selected = undefined;
  }

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  // @HostListener('window:scroll', ['$event'])
  // onScroll(event: Event) {
  //   if(this.companyId == 32 && !this.isMobile) {
  //     const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  //     const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
  //     const documentHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;

  //     if (scrollPosition + windowHeight >= documentHeight) {
  //       this.onScrollDown();
  //     }
  //   }
  // }

  // onScrollDown() {
  //   if(this.companyId == 32 && !this.isMobile) {
  //     this.currentPage++;
  //     this.fetchPlans();
  //   }
  // }

  async ngOnInit() {
    this.onResize();
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    this.userInfo = this._localService.getLocalStorage(environment.lsuser);

    moment.locale(this.language);
    this.locale = {
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek(),
      format: "DD-MM-YYYY",
      applyLabel: "Aplicar",
      clearLabel: "Limpiar",
      showClearButton: true,
      showCancel: true,
    };

    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.userEmailDomain = this._localService.getLocalStorage(environment.lsdomain);
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
      this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(company[0]);
      this.userEmailDomain = company[0].domain;
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.hoverColor = company[0].hover_color
        ? company[0].hover_color
        : company[0].primary_color;
      this.featuredTextValue =
        company[0].featured_text ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueEn =
        company[0].featured_text_en ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueFr =
        company[0].featured_text_fr ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueEu =
        company[0].featured_text_eu ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueCa =
        company[0].featured_text_ca ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueDe =
        company[0].featured_text_de ||
        this._translateService.instant("courses.featured");
      this.showSectionTitleDivider = company[0].show_section_title_divider;

      this.newURLButton = company[0].new_url_button;
      if (this.newURLButton == 1) {
        this.newURLButtonTextValue = company[0].new_url_button_text;
        this.newURLButtonTextValueEn = company[0].new_url_button_text_en;
        this.newURLButtonTextValueFr = company[0].new_url_button_text_fr;
        this.newURLButtonTextValueEu = company[0].new_url_button_text_eu;
        this.newURLButtonTextValueCa = company[0].new_url_button_text_ca;
        this.newURLButtonTextValueDe = company[0].new_url_button_text_de;
        this.newURLButtonUrl = company[0].new_url_button_url;
        this.getSchoolOfLifeTitle();
      }
    }

    if(this.companyId == 12) {
      let selected_type = localStorage.getItem('plan-filter-type');
      if(!selected_type) {
        localStorage.setItem('plan-filter-type', '1');
      }
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

  getSchoolOfLifeTitle() {
    this.schoolOfLifeTitle = this.language == "en"
    ? this.newURLButtonTextValueEn ||
      this.newURLButtonTextValue
    : this.language == "fr"
    ? this.newURLButtonTextValueFr ||
      this.newURLButtonTextValue
    : this.language == "eu"
    ? this.newURLButtonTextValueEu ||
      this.newURLButtonTextValue
    : this.language == "ca"
    ? this.newURLButtonTextValueCa ||
      this.newURLButtonTextValue
    : this.language == "de"
    ? this.newURLButtonTextValueDe ||
      this.newURLButtonTextValue
    : this.newURLButtonTextValue;
  }

  initializePage() {
    this.initializeSearch();
    this.fetchPlansOtherData();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  initializeButtonGroup() {
    let categories =
      this.types?.length > 0 ? this.categories : this.categoryList;

    if(this.companyId == 12) {
      this.buttonList = [];
    } else {
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
    }

    categories?.forEach((category, index) => {
      this.buttonList.push({
        id: category?.fk_supercategory_id || category?.id,
        value: category.fk_supercategory_id || category?.id,
        text: this.getCategoryTitle(category),
        selected: this.companyId == 12 && index == 0 ? true : false,
        fk_company_id: category.fk_company_id,
        fk_supercategory_id: category?.fk_supercategory_id || category?.id,
        name_CA: category.name_CA || category?.name_ca,
        name_DE: category.name_DE || category?.name_de,
        name_EN: category.name_EN || category.name_en,
        name_ES: category.name_ES || category.name_es,
        name_EU: category.name_EU || category.name_eu,
        name_FR: category.name_FR || category.name_fr,
        sequence: category.sequence,
        status: category.status,
      });
    });
  }

  initializeSubButtonGroup(subcats) {
    this.subButtonList = [
      {
        id: "All",
        value: "All",
        text: this._translateService.instant("plans.all"),
        selected: true,
        fk_company_id: this.companyId,
        category_id: "All",
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

    subcats?.forEach((category) => {
      this.subButtonList.push({
        id: category.id,
        value: category.id,
        text: this.getSubcategoryTitle(category),
        selected: false,
        fk_company_id: category.fk_company_id,
        category_id: category.category_id,
        name_CA: category.name_EN,
        name_DE: category.name_DE,
        name_EN: category.name_EN,
        name_ES: category.name_ES,
        name_EU: category.name_EU,
        name_FR: category.name_FR,
        sequence: category.sequence,
        status: category.status,
      });
    });
  }

  initializeIconFilterList(list) {
    if(list?.length > 0) {
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

  getSubcategoryTitle(category) {
    return this.language == "en"
      ? category.name_EN || category.name_en
      : this.language == "fr"
      ? category.name_FR
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

  fetchPlansOtherData() {
    this._plansService
      .fetchPlansOtherDataCombined(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.allGroups = data?.clubs;
          this.allAgeGroups = data?.age_groups;

          this.mapCities(data?.cities);
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures);

          this.initializeFilterSettings(data?.module_filter_settings);

          this.user = data?.user;
          this.mapUserPermissions(data?.user_permissions);

          this.mapDashboard(data?.settings?.dashboard);
          this.initializeIconFilterList(this.cities);

          if(this.companyId == 12) { this.kcnPlanCategoryMapping = data?.kcn_plan_category_mapping; }

          this.mapPageTitle();
          this.types = data?.types;
          this.mapCategories(data?.plan_categories);
          this.subcategories = data?.plan_subcategories;

          this.filterTypeControl = data?.filter_settings?.filter_type || 'dropdown';

          this.initializeButtonGroup();

          if(this.companyId == 27) {
            this.mapCourseGroups(data);
          }

          this.fetchPlans();
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
    
    if(filter_settings_active?.length > 0 && this.categoriesFilterActive) {
      this.showFilters = true;
      this.filterSettings = filter_settings;
      if(this.ageGroupFilterActive) { this.initializeAgeGroupList(); }
      if(this.groupFilterActive) { this.initializeGroupList(); }
    }
  }

  mapCities(cities) {
    this.cities = cities;
    // if(this.cities?.length > 0 && this.companyId == 32) {
    //   let campus = this.cities?.find((f) => f.campus?.indexOf(this.userInfo?.campus?.replace(/ /g,"_")) >= 0);
    //   if(campus?.city) {
    //     localStorage.setItem('plan-filter-city', campus?.city);
    //   }
    // }
  }

  mapFeatures(features) {
    this.plansFeature = features?.find((f) => f.feature_id == 1);
    this.featureId = this.plansFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.plansFeature);
    this.pageDescription = this.getFeatureDescription(this.plansFeature);

    let clubFeature = features?.find((f) => f.feature_id == 5 && f.status == 1);
    this.clubTitle = clubFeature ? this.getFeatureTitle(clubFeature) : "";

    let coursesFeature = features?.find(
      (f) => f.feature_id == 11 && f.status == 1
    );
    this.hasCourses = coursesFeature ? true : false;
  }

  mapPageTitle() {
    if(this.isUESchoolOfLife && this.companyId == 32) {
      this.pageName = this.pageName?.replace('de Vida Universitaria', 'de School of Life')
      this.pageName = this.pageName?.replace('University Life', 'School of Life')
    }
    this.title = this.view == 'joined' ? this.getMyActivitiesTitle() : (this.mode == 'history' ? this._translateService.instant('sidebar.historyofactivities') : this.pageName);
    this.subtitle = this.mode == 'history' ? '' : this.pageDescription;
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.categoriesFilterActive = subfeatures.some(
        (a) => a.name_en == "Filter" && a.active == 1
      );
      this.classificationsFilterActive = subfeatures.some(
        (a) => a.name_en == "Classification filter" && a.active == 1
      );
      this.dateFilterActive = subfeatures.some(
        (a) => a.name_en == "Date filter" && a.active == 1
      );
      this.searchByCityOrKeyword = subfeatures.some(
        (a) => a.name_en == "Search events by city or keyword" && a.active == 1
      );
      this.showPastEvents = subfeatures.some(
        (a) => a.name_en == "Past" && a.active == 1
      );
      this.hasMobileLimit = subfeatures.some(
        (a) => a.name_en == "View more" && a.active == 1
      );
      this.canAssignMultipleCities = subfeatures.some(
        (a) => a.name_en == "Assign multiple cities" && a.active == 1
      );
      this.hasFeatured = subfeatures.some(
        (a) => a.name_en == "Featured" && a.active == 1
      );
      this.showEventsCalendar = subfeatures.some(
        (a) => a.name_en == "Show calendar in events" && a.active == 1
      );
      this.isRecurringActive = subfeatures.some(
        (a) => a.name_en == "Recurring" && a.active == 1
      );
      this.isOrderActive = subfeatures.some(
        (a) => a.name_en == "Order" && a.active == 1
      );
      this.hasCourseRestrictions = subfeatures.some(
        (a) => a.name_en == "Course Restrictions" && a.active == 1
      );
      this.bottomEventTitles = subfeatures.some(
        (a) => a.name_en == "Event titles (Bottom)" && a.active == 1
      );
      this.ageGroupFilterActive = subfeatures.some(
        (a) => a.name_en == "Age group filter" && a.active == 1
      );
      this.groupFilterActive = subfeatures.some(
        (a) => a.name_en == "Group filter" && a.active == 1
      );
    }

    localStorage.setItem("show_past_events", this.showPastEvents ? "1" : "0");
    localStorage.setItem("recurring", this.isRecurringActive ? "1" : "0");
    localStorage.setItem("order", this.isOrderActive ? "1" : "0");
    if (!this.isRecurringActive) {
      localStorage.removeItem("display_days");
    }
    if (!this.isOrderActive) {
      localStorage.removeItem("order");
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canViewPlan = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 1
    )
      ? true
      : false;
    this.canCreatePlan =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 1);
    this.canManagePlan = user_permissions?.member_type_permissions?.find(
      (f) => f.manage == 1 && f.feature_id == 1
    )
      ? true
      : false;
  }

  mapDashboard(dashboard) {
    this.isMyActivitiesActive =
      dashboard?.length > 1 ? (dashboard[1].active == 1 ? true : false) : false;
    if (this.isMyActivitiesActive) {
      this.myActivities = dashboard[1];
    }
  }

  mapCourseGroups(data) {
    this.courses = data?.courses;
    this.courseCategoriesAccessRoles = data?.course_category_access_roles;
    this.courseCategoryMapping = data?.course_category_mapping;

    if(this.courses?.length > 0) {
      let user_type_roles = this.courseCategoriesAccessRoles?.filter(r => {
        return r.role_id == this.user.custom_member_type_id
      })

      if(user_type_roles?.length > 0) {
        for(let course of this.courses) {
          if((course.active_group_id || course.group_id) && this.courseCategoryMapping.some(a => user_type_roles.some(r => r.category_id == a.category_id) && a.course_id == course.id) ){
            this.groups.push({
                id: course.active_group_id || course.group_id,
            })
          }
        }
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

  mapCategories(plan_categories) {
    this.categories = this.types?.length > 0 ? plan_categories : [];
    this.categoryList = this.types?.length > 0 ? [] : plan_categories;

    this.fType =
      this.categories?.length > 0 && this.companyId == 16
        ? "All"
        : this.companyId == 12
        ? "Networking"
        : "All";
  }

  initializeAgeGroupList() {
    let text = this._translateService.instant("plans.all");
    if(this.filterSettings?.length > 0) {
      let age_group_filter = this.filterSettings?.filter(fs => {
        return fs.field == 'age_group'
      })
      if(age_group_filter?.length > 0) {
        text = age_group_filter[0].select_text;
      }
    }
    this.ageGroupList = [
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
    if(this.allAgeGroups?.length > 0) {
      this.allAgeGroups?.forEach((ag, index) => {
        this.ageGroupList?.push({
          id: ag.id,
          value: ag.id,
          text: ag.age_group,
          selected: false,
          fk_company_id: this.companyId,
          fk_supercategory_id: ag.id,
          name_CA: ag.age_group,
          name_DE: ag.age_group,
          name_EN: ag.age_group,
          name_ES: ag.age_group,
          name_EU: ag.age_group,
          name_FR: ag.age_group,
          sequence: index + 2,
          status: index + 2,
        })
      })
    }
  }

  initializeGroupList() {
    let text = this._translateService.instant("plans.all");
    if(this.filterSettings?.length > 0) {
      let group_filter = this.filterSettings?.filter(fs => {
        return fs.field == 'group'
      })
      if(group_filter?.length > 0) {
        text = group_filter[0].select_text;
      }
    }
    this.groupList = [
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
    if(this.allGroups?.length > 0) {
      this.allGroups?.forEach((ag, index) => {
        this.groupList?.push({
          id: ag.id,
          value: ag.id,
          text: ag.title,
          selected: false,
          fk_company_id: this.companyId,
          fk_supercategory_id: ag.id,
          name_CA: ag.title_ca,
          name_DE: ag.title_de,
          name_EN: ag.title_en,
          name_ES: ag.title,
          name_EU: ag.title_eu,
          name_FR: ag.title_fr,
          sequence: index + 2,
          status: index + 2,
        })
      })
    }
  }

  fetchPlans() {
    if(this.mode == 'history') {
      this._plansService
        .fetchPastPlansCombined(this.companyId, this.isUESchoolOfLife, this.campus)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.userAdditionalProperties = data?.users_additional_properties;
            this.activityCities = data?.activity_cities;
            this.plans = this.initialFilter(data);
            this.planCategoriesMapping = data?.category_mappings?.plan_categories_mapping || [];
            this.planSubcategoriesMapping = data?.category_mappings?.plan_subcategories_mapping || [];
            this.formatPlans(data?.plan_participants);
            this.isloading = false;
          },
          (error) => {
            console.log(error);
          }
        );
    } else {
      this._plansService
        .fetchPlansCombined(this.companyId, "active", this.isUESchoolOfLife, this.campus)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.userAdditionalProperties = data?.users_additional_properties;
            this.activityCities = data?.activity_cities;
            this.plans = this.initialFilter(data);
            this.planCategoriesMapping = data?.category_mappings?.plan_categories_mapping || [];
            this.planSubcategoriesMapping = data?.category_mappings?.plan_subcategories_mapping || [];
            this.formatPlans(data?.plan_participants);
            this.isloading = false;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  initialFilter(data) {
    let plans = data?.plans;

    if(this.companyId == 32 && this.userId && !this.superAdmin) {
      plans = plans?.filter(plan => {
        let include = false

        if(plan?.additional_properties_course_access == 1) {
          let match_campus = false
          if(plan?.additional_properties_campus_ids) {
            let plan_campus = plan?.additional_properties_campus_ids?.split(',');
            let user_campus_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'campus' && c.value == this.user?.campus
            })
            let user_campus = user_campus_row?.length > 0 ? user_campus_row[0].id : 0
            match_campus = plan_campus?.some((a) => a == user_campus);
          } else {
            match_campus = true;
          }

          let match_faculty = false;
          if(plan?.additional_properties_faculty_ids) {
            let plan_faculty = plan?.additional_properties_faculty_ids?.split(',');
            let user_faculty_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'faculty' && c.value == this.user?.faculty
            })
            let user_faculty = user_faculty_row?.length > 0 ? user_faculty_row[0].id : 0
            match_faculty = plan_faculty?.some((a) => a == user_faculty);
          } else {
            match_faculty = true;
          }

          let match_business_unit = false;
          if(plan?.additional_properties_business_unit_ids) {
            let plan_business_unit = plan?.additional_properties_business_unit_ids?.split(',');
            let user_business_unit_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'bussines_unit' && c.value == this.user?.bussines_unit
            })
            let user_business_unit = user_business_unit_row?.length > 0 ? user_business_unit_row[0].id : 0
            match_business_unit = plan_business_unit?.some((a) => a == user_business_unit);
          } else {
            match_business_unit = true;
          }

          let match_type = false;
          if(plan?.additional_properties_type_ids) {
            let plan_type = plan?.additional_properties_type_ids?.split(',');
            let user_type_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'type' && c.value == this.user?.type
            })
            let user_type = user_type_row?.length > 0 ? user_type_row[0].id : 0
            match_type = plan_type?.some((a) => a == user_type);
          } else {
            match_type = true;
          }

          let match_segment = false;
          if(plan?.additional_properties_segment_ids) {
            let plan_segment = plan?.additional_properties_segment_ids?.split(',');
            let user_segment_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'segment' && c.value == this.user?.segment
            })
            let user_segment = user_segment_row?.length > 0 ? user_segment_row[0].id : 0
            match_segment = plan_segment?.some((a) => a == user_segment);
          } else {
            match_segment = true;
          }

          let match_branding = false;
          if(plan?.additional_properties_branding_ids) {
            let plan_branding = plan?.additional_properties_branding_ids?.split(',');
            let user_branding_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'branding' && c.value == this.user?.branding
            })
            let user_branding = user_branding_row?.length > 0 ? user_branding_row[0].id : 0
            match_branding = plan_branding?.some((a) => a == user_branding);
          } else {
            match_branding = true;
          }

          include = (match_campus && match_faculty && match_business_unit && match_type && match_segment && match_branding) ? true : false;
        } else {
          include = true;
        }

        return include;
      })
    }

    if(this.companyId == 27 && !this.superAdmin && !this.canCreatePlan && this.courseCategoryMapping?.length > 0 && (this.hasCourseRestrictions || this.showMemberEventsOnly)) {   
      plans = plans?.filter((event) => {
        if(this.groups.length > 0 && this.groups.some((group) => group.id == event?.fk_group_id )) {
          return true
        }

        if(!event.private && !event?.fk_group_id) {
          return true
        }
      })
    }

    return plans;
  }

  formatPlans(plan_participants) {
    let plans = this.plans?.map(plan => {
      return {
        ...plan,
        excerpt: this.getPlanExcerpt(this.getPlanDescription(plan)),
      }
    })

    this.plans = plans;
    if(this.view == 'joined') {
      this.plans = this.filterCreatedJoined(this.plans, plan_participants);
    }

    let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    let filteredPlan = this.plans.filter((plan) => {
      let endDateReached = false;
      if (plan?.limit_date && plan?.limit_date < today) {
        endDateReached = true;
      }

      let include = false;
      if (plan.id == 0) {
        include = true;
      } else if (!endDateReached) {
        include = true;
      } else if (!plan.limit_date && plan.plan_date >= today) {
        include = true;
      } else if (endDateReached && this.showPastEvents) {
        include = true;
      }

      return include;
    });

    if(this.companyId == 12) {
      let selected = localStorage.getItem('plan-filter-city');
      let selected_type = localStorage.getItem('plan-filter-type');
  
      if(!selected && !selected_type) {
        this.filteredPlan = filteredPlan;
      } else {
        setTimeout(() => {      
          if(selected && this.list?.length > 0) {
            this.list.forEach(item => {
              if(item.city == selected) {
                item.selected = true;
                this.selectedCity = selected;
              } else {
                item.selected = false;
              }
            })
          }
    
          if(selected_type) {
            if(this.buttonList?.length > 0) {
              this.buttonList.forEach(item => {
                if(item.id == selected_type) {
                  item.selected = true;
                  this.fType = item.name_ES;
                  this.selectedType = item.name_ES;
                  this.selectedFilterCategory = item;
                } else {
                  item.selected = false;
                }
              })
              if(this.selectedFilterCategory) {
                this.filteredCategory(this.selectedFilterCategory)
              }
            } else {
              let categories = this.types?.length > 0 ? this.categories : this.categoryList;
              if(categories?.length > 0) {
                let item = categories?.filter(row => {
                  return row.id == selected_type
                })
                if(item?.length > 0) {
                  this.fType = item[0].name_ES || item[0].name_es;
                  this.selectedType = item[0].name_ES || item[0].name_es;
                  this.selectedFilterCategory = item;
                }
              }
            }
          }
    
          if(!this.selectedCity && !this.selectedFilterCategory) {
          } else {
            if(this.selectedCity && !this.selectedFilterCategory) {
              this.searchPlans("new");
            } else {
              if(this.selectedFilterCategory) {
                this.filterPlans(
                  this.selectedFilterCategory?.fk_supercategory_id,
                  this.selectedFilterCategory?.name_EN,
                  this.selectedFilterCategory?.name_ES
                );
              }
            }
          }
        }, 200)
      }
    } else {
      // if(this.companyId == 32) {
      //   this.filteredPlan = this.getSlicedPlans(filteredPlan);
      // } else {
        this.filteredPlan = filteredPlan;
      // }

      let selected = localStorage.getItem('plan-filter-city');
      if(selected && this.list?.length > 0) {
        this.list.forEach(item => {
          if(item.city == selected) {
            item.selected = true;
            this.selectedCity = selected;
          } else {
            item.selected = false;
          }
        })
        this.searchPlans('new');
      }
    }
  }

  // getSlicedPlans(filteredPlan) {
  //   let plans: any[] = [];
  //   this.pageSize = this.currentPage == 1 && this.showEventsCalendar ? 7 : 8;

  //   if(!this.search && !this.isMobile && this.companyId == 32) {
  //     const prev = filteredPlan
  //     if(prev?.length != filteredPlan?.length && filteredPlan?.length > 0) {
  //       plans = filteredPlan?.splice((this.currentPage - 1),this.pageSize);
  //       plans = [...prev, ...this.filteredPlan];
  //     } else {
  //       plans = filteredPlan?.splice(0,this.pageSize * this.currentPage);
  //     }
  //   } else {
  //     plans = filteredPlan;
  //   }

  //   return plans;
  // }

  getPlanDescription(plan) {
    return plan
      ? this.language == "en"
        ? plan.description_en || plan.description
        : this.language == "fr"
        ? plan.description_fr || plan.description
        : this.language == "eu"
        ? plan.description_eu || plan.description
        : this.language == "ca"
        ? plan.description_ca || plan.description
        : this.language == "de"
        ? plan.ldescription_de || plan.description
        : plan.description
      : "";
  }

  getPlanExcerpt(description) {
    let charlimit = 100;
    if (!description || description.length <= charlimit) {
      return description;
    }

    let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  filterCreatedJoined(plans, plan_participants) {
    let filtered_plans = plans

    if(filtered_plans?.length > 0) {
      filtered_plans = filtered_plans?.filter(plan => {
        return plan.fk_user_id == this.userId || this.isJoinedMember(plan, plan_participants)
      })
    }

    return filtered_plans;
  }

  isJoinedMember(plan, plan_participants) {
    let joined_plans = plan_participants?.filter(p => {
      return p.id == this.userId && plan.id == p.plan_id && p.plan_type_id == plan.plan_type_id
    })

    return joined_plans?.length > 0 ? true : false
  }

  getEventTitle(event) {
    return this.language == "en"
      ? (event.title_en && event.title_en != 'undefined')
        ? event.title_en || event.title
        : event.title
      : this.language == "fr"
      ? event.title_fr
        ? event.title_fr || event.title
        : event.title
      : this.language == "eu"
      ? event.title_eu
        ? event.title_eu || event.title
        : event.title
      : this.language == "ca"
      ? event.title_ca
        ? event.title_ca || event.title
        : event.title
      : this.language == "de"
      ? event.title_de
        ? event.title_de || event.title
        : event.title
      : event.title;
  }

  getActivityDate(activity) {
    let date = moment
      .utc(activity.plan_date)
      .locale(this.language)
      .format("D MMMM");
    if (activity.limit_date) {
      let start_month = moment
        .utc(activity.plan_date)
        .locale(this.language)
        .format("M");
      let end_month = moment
        .utc(activity.limit_date)
        .locale(this.language)
        .format("M");
      let activity_start_date = moment
        .utc(activity.plan_date)
        .locale(this.language)
        .format("YYYY-MM-DD");
      let activity_end_date = moment
        .utc(activity.limit_date)
        .locale(this.language)
        .format("YYYY-MM-DD");

      if (activity_start_date == activity_end_date) {
        date = `${moment
          .utc(activity.limit_date)
          .locale(this.language)
          .format("D MMMM")}`;
      } else {
        if (start_month == end_month) {
          date = `${moment
            .utc(activity.plan_date)
            .locale(this.language)
            .format("D")} - ${moment(activity.limit_date)
            .locale(this.language)
            .format("D MMMM")}`;
        } else {
          date = `${moment
            .utc(activity.plan_date)
            .locale(this.language)
            .format("D MMMM")} - ${moment(activity.limit_date)
            .locale(this.language)
            .format("D MMMM")}`;
        }
      }
    }
    return date;
  }

  handleJoinChanged(params) {
    this.joinedPlan = params.joined;
    this.calendarFilterMode = true;
    this.selected = params.selectedDate || "";
    this.handleDateChange("joined", params.joined, params.joinedPlans);
  }

  handleDateChanged(date) {
    this.selected = date || "";
    this.handleDateChange();
  }

  async handleDateChange(
    mode: string = "",
    join: boolean = false,
    joinedPlans = []
  ) {
    const startDate =
      this.selected && this.selected.start ? this.selected.start.format() : "";

    const endDate =
      this.selected && this.selected.end ? this.selected.end.format() : "";

    if (startDate != "" && endDate != "") {
      this.filterDate = this.selected;
      if (this.fType == "IE Events") {
        this.filteredIEEvents = this.ieEvents.filter((plan) => {
          const start = startDate.split("T")[0];
          const end = endDate.split("T")[0];

          let plan_date = moment(plan.plan_date).format("YYYY-MM-DD");

          return plan_date >= start && plan_date <= end;
        });
      } else {
        if (this.fType == "Coworking" && this.filterType == "Gar") {
          this.filteredPlan = await this.plans.filter((plan) => {
            return (
              plan.event_subcategory_id == 5 ||
              plan.event_subcategory_id == 14 ||
              plan.event_subcategory_id == 15 ||
              plan.event_subcategory_id == 16 ||
              plan.event_subcategory_id == 17 ||
              plan.event_subcategory_id == 18 ||
              plan.event_subcategory_id == 39 ||
              plan.event_subcategory_id == 104 ||
              plan.event_subcategory_id == 105 ||
              plan.event_subcategory_id == 110 ||
              plan.event_subcategory_id == 111 ||
              (plan.event_subcategory_id >= 113 &&
                plan.event_subcategory_id <= 126)
            );
          });
          if (this.filteredPlan) {
            this.filteredPlan = this.filteredPlan.filter((plan) => {
              const start = startDate.split("T")[0];
              const end = endDate.split("T")[0];

              if (
                this.companyId == 12 ||
                this.companyId == 14 ||
                this.companyId == 15
              ) {
                let plan_date = moment(plan.plan_date).format("YYYY-MM-DD");
                return plan_date >= start && plan_date <= end;
              } else {
                return (
                  plan.plan_date.split("T")[0] >= start &&
                  plan.plan_date.split("T")[0] <= end
                );
              }
            });
          }
        } else if (
          this.fType == "Coworking" &&
          this.filterType == "Grupos temáticos"
        ) {
          this.filteredPlan = await this.plans.filter((plan) => {
            return (
              plan.event_subcategory_id == 8 ||
              plan.event_subcategory_id == 9 ||
              plan.event_subcategory_id == 10 ||
              plan.event_subcategory_id == 11 ||
              plan.event_subcategory_id == 41 ||
              plan.event_subcategory_id == 62 ||
              plan.event_subcategory_id == 63 ||
              plan.event_subcategory_id == 108 ||
              plan.event_subcategory_id == 109 ||
              plan.event_subcategory_id == 112
            );
          });
          if (this.filteredPlan) {
            this.filteredPlan = this.filteredPlan.filter((plan) => {
              const start = startDate.split("T")[0];
              const end = endDate.split("T")[0];

              if (
                this.companyId == 12 ||
                this.companyId == 14 ||
                this.companyId == 15
              ) {
                let plan_date = moment(plan.plan_date).format("YYYY-MM-DD");
                return plan_date >= start && plan_date <= end;
              } else {
                return (
                  plan.plan_date.split("T")[0] >= start &&
                  plan.plan_date.split("T")[0] <= end
                );
              }
            });
          }
        } else {
          let filter = this.categoryList.filter((cat) => {
            return (
              cat.name_ES == this.filterType ||
              cat.name_EN == this.filterType ||
              cat.name_es == this.filterType ||
              cat.name_en == this.filterType
            );
          });

          let filterType =
            filter && filter[0] ? filter[0].fk_supercategory_id : 0;
          this.filteredPlan = this.plans;
          if (filterType > 0) {
            this.filteredPlan = await this.plans.filter((plan) => {
              let hasCategory;
              const {
                Company_Group_Plan_Supercategories,
                Company_Plans_Supercategories,
              } = plan;

              if (Company_Group_Plan_Supercategories) {
                hasCategory = Company_Group_Plan_Supercategories.filter(
                  (category) => {
                    return category.fk_supercategory_id === filterType;
                  }
                );

                return hasCategory && hasCategory.length > 0;
              } else {
                hasCategory = Company_Plans_Supercategories.filter(
                  (category) => {
                    return category.fk_supercategory_id === filterType;
                  }
                );

                return (hasCategory && hasCategory.length > 0) || plan.id == 0;
              }
            });
          }

          this.filteredPlan = this.filteredPlan.filter((plan) => {
            const start = startDate.split("T")[0];
            const end = endDate.split("T")[0];

            if (
              this.companyId == 12 ||
              this.companyId == 14 ||
              this.companyId == 15
            ) {
              let plan_date = moment(plan.plan_date).format("YYYY-MM-DD");
              return plan_date >= start && plan_date <= end;
            } else {
              return (
                plan.plan_date.split("T")[0] >= start &&
                plan.plan_date.split("T")[0] <= end
              );
            }
          });

          let categoryId = 0;
          if (this.fType != "" && this.categories) {
            let category_selected = this.categories.filter((cat) => {
              return cat.name_es == this.fType || cat.name_en == this.fType;
            });
            if (category_selected && category_selected[0]) {
              categoryId = category_selected[0].id;
            }

            if (categoryId > 0) {
              let filtered_plans = this.filteredPlan.filter((plan) => {
                return plan.event_category_id == categoryId;
              });
              this.filteredPlan = filtered_plans;
            }
          }

          if (
            this.categories &&
            this.categories.length > 0 &&
            this.filteredPlan
          ) {
            if (
              this.filterType !== "All" &&
              this.subcategories &&
              this.subcategories.length > 0
            ) {
              let subcategory_row = this.subcategories.filter((sc) => {
                return (
                  sc.name_es == this.filterType || sc.name_en == this.filterType
                );
              });
              let subcategory_id = 0;
              if (subcategory_row && subcategory_row[0]) {
                subcategory_id = subcategory_row[0].id;
              }
              this.filteredPlan = await this.filteredPlan.filter((plan) => {
                return plan.event_subcategory_id == subcategory_id;
              });
            }
          }
        }
      }
    }

    if (mode == "joined" && !join && !this.selected) {
      this.initializePage();
    } else {
      this.filterActivities(mode, join, joinedPlans);
    }
  }

  handleCalendarDateChanged(params) {
    this.calendarFilterMode = true;
    this.selected = params.selectedDate || "";
    this.hasDateSelected = true;
    if(this.companyId == 12) { this.refreshButtonList(); }
    this.handleDateChange("", params.joined, params.joinedPlans);
  }

  refreshButtonList() {
    this.fType = '';
    let buttonList = this.buttonList;
    buttonList?.forEach(item => {
      return item.selected = false;
    })
    this.buttonList = [];
    setTimeout(() => { 
      this.buttonList = buttonList;
      this.cd.detectChanges()
    }, 100)
  }

  filterPlans = async (filter, categoryName, categoryNameEs) => {
    // Reset paging and array that populates the paging
    this.p = 1;
    this.filteredPlan = [];
    this.subcats = [];

    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
    this.category_type = this.language == "en" ? categoryName : categoryNameEs;
    this.selected = undefined;
    this.filteredPlan = this.plans;
    this.filterType = "All";

    if (filter !== "All") {
      this.filterType = categoryName;
      if (
        this.showPastEvents &&
        (categoryName == "Past Events" || categoryName == "Past")
      ) {
        this.getPastEvents();
      } else {
        let category_id = 0;
        let category_row;

        if (this.types && this.types.length > 0) {
          category_row =
            this.categories &&
            this.categories.filter((cat) => {
              return cat.name_es == categoryNameEs;
            });
          if (category_row && category_row.length > 0) {
            category_id = category_row[0].id;
          }
        }

        if (this.subcategories && this.subcategories.length > 0) {
          if (this.types && this.types.length > 0) {
            this.subcats = this.subcategories.filter((sc) => {
              return sc.category_id == category_id;
            });
          } else {
            this.subcats = this.subcategories.filter((sc) => {
              return sc.category_id == filter;
            });
          }
          this.initializeSubButtonGroup(this.subcats);
          this.filterType = "All";
        }

        if (this.types && this.types.length > 0) {
          this.filterCategories(category_row[0]);
        } else {
          this.filteredPlan = await this.plans.filter((plan) => {
            let hasCategory;
            const {
              Company_Group_Plan_Supercategories,
              Company_Plans_Supercategories,
            } = plan;

            if (
              Company_Group_Plan_Supercategories?.length > 0 ||
              Company_Group_Plan_Supercategories?.length > 0
            ) {
              if (Company_Group_Plan_Supercategories) {
                hasCategory = Company_Group_Plan_Supercategories.filter(
                  (category) => {
                    return category.fk_supercategory_id === filter;
                  }
                );

                return hasCategory && hasCategory.length > 0;
              } else {
                hasCategory = Company_Plans_Supercategories.filter(
                  (category) => {
                    return category.fk_supercategory_id === filter;
                  }
                );

                return (hasCategory && hasCategory.length > 0) || plan.id == 0;
              }
            } else {
              return this.planCategoriesMapping.some(
                (a) => a.fk_supercategory_id == filter && a.plan_id == plan.id
              );
            }
          });
        }
      }
    }

    if (this.types && this.types.length > 0) {
    } else {
      if (this.fType !== "" && this.fType != "All") {
        this.filteredPlan = await this.filteredPlan.filter((plan) => {
          let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

          let endDateReached = true;
          if (plan.limit_date) {
            if (plan.limit_date > plan.plan_date) {
              if (plan.limit_date >= today) {
                endDateReached = false;
              }
            }
          }

          let include = false;
          if (plan.id == 0) {
            include = true;
          } else if (!endDateReached) {
            include = true;
          } else if (!plan.limit_date && plan.plan_date >= today) {
            include = true;
          }

          if (this.fType == "Company" || this.fType == "University") {
            return (
              plan.fk_company_id == this.companyId &&
              plan.plan_type_id == 5 &&
              include
            );
          } else if (this.fType == "Employee" || this.fType == "Student") {
            return (
              plan.fk_company_id == this.companyId &&
              plan.plan_type_id == 1 &&
              include
            );
          } else if (this.fType == "Club" || this.fType == "Group") {
            return (
              plan.fk_company_id == this.companyId &&
              plan.fk_group_id > 0 &&
              include
            );
          } else if (this.fType == "Past") {
            return (
              plan.fk_company_id == this.companyId &&
              plan.plan_date < today &&
              !include
            );
          } else if (this.fType == "IE Events") {
            return plan.id == 0;
          }
        });
      }

      this.filterActivities();
    }
  };

  filterActivities(
    mode: string = "",
    join: boolean = false,
    joinedPlans: any = []
  ) {
    if (this.filteredPlan && this.filteredPlan.length > 0) {
      if (this.filterDate) {
        const startDate =
          this.filterDate && this.filterDate.start
            ? this.filterDate.start.format()
            : "";

        const endDate =
          this.filterDate && this.filterDate.end
            ? this.filterDate.end.format()
            : "";

        if (startDate != "" && endDate != "") {
          this.filteredPlan = this.filteredPlan.filter((plan) => {
            const start = startDate.split("T")[0];
            const end = endDate.split("T")[0];

            if (
              this.companyId == 12 ||
              this.companyId == 14 ||
              this.companyId == 15
            ) {
              let plan_date = moment(plan.plan_date).format("YYYY-MM-DD");
              return plan_date >= start && plan_date <= end;
            } else {
              return (
                plan.plan_date.split("T")[0] >= start &&
                plan.plan_date.split("T")[0] <= end
              );
            }
          });

          let categoryId = 0;
          if (this.fType != "" && this.categories) {
            let category_selected = this.categories.filter((cat) => {
              return cat.name_es == this.fType || cat.name_en == this.fType;
            });
            if (category_selected && category_selected[0]) {
              categoryId = category_selected[0].id;
            }

            if (categoryId > 0) {
              let filtered_plans = this.filteredPlan.filter((plan) => {
                return plan.event_category_id == categoryId;
              });
              this.filteredPlan = filtered_plans;
            }
          }
        }
      }

      if (this.search) {
        this.filteredPlan = this.filteredPlan.filter((event) => {
          let include = false;

          if (
            event.title.toLowerCase().indexOf(this.search.toLowerCase()) >= 0 ||
            (event.title_en &&
              event.title_en.toLowerCase().indexOf(this.search.toLowerCase()) >=
                0) ||
            (event.title_fr &&
              event.title_fr.toLowerCase().indexOf(this.search.toLowerCase()) >=
                0) ||
            (event.title_eu &&
              event.title_eu.toLowerCase().indexOf(this.search.toLowerCase()) >=
                0) ||
            (event.title_ca &&
              event.title_ca.toLowerCase().indexOf(this.search.toLowerCase()) >=
                0) ||
            (event.title_de &&
              event.title_de.toLowerCase().indexOf(this.search.toLowerCase()) >=
                0)
          ) {
            include = true;
          }

          if (event.address) {
            if (
              event.address.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0
            ) {
              include = true;
            }
          }

          if (!include && event.company_value && this.canAssignMultipleCities) {
            let event_cities =
              event.company_value &&
              event.company_value.filter((cv) => {
                return cv.plan_id == event.id;
              });
            if (event_cities && event_cities.length > 0) {
              include = event.company_value.some(
                (a) =>
                  a.city.toLowerCase().indexOf(this.search.toLowerCase()) >= 0
              );
            }
          }

          return include;
        });
      }

      if (this.selectedCity) {
        let city =
          this.cities &&
          this.cities.filter((ct) => {
            return ct.city == this.selectedCity;
          });
        if (city && city[0]) {
          this.filteredPlan = this.filteredPlan.filter((event) => {
            let include = false;

            include =
              (event.address &&
                event.address
                  .toLowerCase()
                  .indexOf(city[0].city.toLowerCase()) >= 0) ||
              (event.meeting_point &&
                event.meeting_point
                  .toLowerCase()
                  .indexOf(city[0].city.toLowerCase()) >= 0);

            if (
              !include &&
              this.canAssignMultipleCities
            ) {
              let event_cities =
                this.activityCities &&
                this.activityCities?.filter((cv) => {
                  return cv.plan_id == event.id;
                });
              if (event_cities && event_cities.length > 0) {
                include = event_cities.some(
                  (a) =>
                    a.city.toLowerCase().indexOf(city[0].city.toLowerCase()) >=
                    0
                );
              }
            }

            return include;
          });
        }
      }

      if(this.selectedAgeGroup && this.selectedAgeGroup != 'All') {
        this.filteredPlan = this.filteredPlan.filter((event) => {
          return event.age_group_id == this.selectedAgeGroup;
        });
      }

      if(this.selectedGroup && this.selectedGroup != 'All') {
        this.filteredPlan = this.filteredPlan.filter((event) => {
          return event.fk_group_id == this.selectedGroup;
        });
      }

      if (mode == "joined" || this.joinedPlan) {
        if (join || this.joinedPlan) {
          this.filteredPlan =
            this.filteredPlan &&
            this.filteredPlan.filter((plan) => {
              let joined_row =
                joinedPlans &&
                joinedPlans.filter((p) => {
                  return p.id == plan.id;
                });

              let include = false;

              if (joined_row && joined_row.length > 0) {
                if (
                  joined_row[0].CompanyPlanParticipants &&
                  joined_row[0].CompanyPlanParticipants.length > 0
                ) {
                  let match = joined_row[0].CompanyPlanParticipants.some(
                    (a) => a.user_id === this.userId
                  );
                  if (match) {
                    include = true;
                  }
                }

                if (
                  joined_row[0].Company_Group_Plan_Participants &&
                  joined_row[0].Company_Group_Plan_Participants.length > 0
                ) {
                  let match =
                    joined_row[0].Company_Group_Plan_Participants.some(
                      (a) => a.user_id === this.userId
                    );
                  if (match) {
                    include = true;
                  }
                }
              }

              return include;
            });
        }
      }
    }
  }

  getPastEvents() {
    let past_plans = [];
    this.plan_type = 0;
    this._plansService
      .getAllPastPlans(this.plan_type, this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          let plans = response.Plans;
          past_plans = [];
          if (plans) {
            past_plans = plans.filter((plan) => {
              if (this.companyId == 16) {
                return (
                  plan.fk_company_id == this.companyId ||
                  plan.fk_company_id == 12
                );
              } else {
                return plan.fk_company_id == this.companyId;
              }
            });
          }

          if (past_plans) {
            if (!this.userId) {
              past_plans = past_plans.filter((plan: any) => {
                return !plan.private;
              });
            }

            past_plans.forEach((plan: any) => {
              if (plan.plan_date) {
                let plan_date = (
                  moment
                    .utc(plan.plan_date)
                    .format("YYYY-MM-DD HH:mm")
                    .toString() + ":00Z"
                ).replace(" ", "T");
                plan.plan_date = plan_date;
              }

              if (plan.limit_date) {
                let limit_date = (
                  moment
                    .utc(plan.limit_date)
                    .format("YYYY-MM-DD HH:mm")
                    .toString() + ":00Z"
                ).replace(" ", "T");
                plan.limit_date = limit_date;
              }
            });

            if (
              !this.admin1 &&
              !this.admin2 &&
              !this.superAdmin &&
              !this.canCreatePlan &&
              this.courseCategoryMapping?.length > 0 &&
              (this.hasCourseRestrictions || this.showMemberEventsOnly)
            ) {
              past_plans = past_plans.filter((event: any) => {
                if (
                  this.groups.length > 0 &&
                  this.groups.some((group) => group.id == event.group_id)
                ) {
                  return true;
                }

                if (!event.private && !event.group_id) {
                  return true;
                }
              });
            }

            this.filteredPlan = past_plans;
            this.handleSortPastEvents();
            this.isloading = false;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  handleSortPastEvents() {
    this.filteredPlan = this.filteredPlan.sort((a, b) => {
      const oldDate: any = new Date(a.plan_date);
      const newDate: any = new Date(b.plan_date);

      return newDate - oldDate;
    });
  }

  async handleCreateRoute(suggest = false) {
    if (this.fType != "" && this.fType != "Past") {
      switch (this.fType) {
        case "Company":
        case "University":
          this.plan_type = 5;
          break;
        case "Club":
        case "Group":
          this.plan_type = 4;
          break;
        default:
          this.plan_type = this.clubTitle ? 4 : 1;
          break;
      }
    }

    if (this.user.custom_member_type_id == 60) {
      this.plan_type = 4;
    }

    if(this.isUESchoolOfLife) {
      this.plan_type = 1;
    }
    this._router.navigate([`/plans/create/0/${this.plan_type}`]);
  }

  createNewTitle(page) {
    let plan = "plans.plan";
    if (page && page.toLowerCase().indexOf("activ") >= 0) {
      plan = "plans.activity";
    } else if (page && page.toLowerCase().indexOf("event") >= 0) {
      plan = "plans.event";
    }
    return `${this._translateService.instant(
      "dashboard.new"
    )} ${this._translateService.instant(plan)}`;
  }

  filteredCategory(category) {
    let buttonList = this.buttonList;
    buttonList?.forEach((item) => {
      if (item.id === category.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    if (category.id == "All") {
      this.subButtonList = [];
    }

    if (category) {
      this.selectedFilterCategory = category;
      if(this.companyId == 12) { localStorage.setItem('plan-filter-type', category?.id); }
      this.filterPlans(
        category.fk_supercategory_id,
        category.name_EN,
        category.name_ES
      );
    }

    this.buttonList = [];
    setTimeout(() => { 
      this.buttonList = buttonList;
      this.cd.detectChanges()
    }, 100)
  }

  filteredSubcategory(category) {
    this.subButtonList?.forEach((item) => {
      if (item.id === category.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    if (category) {
      this.selectedFilterSubcategory = category;
      this.filterSubcategories(
        category && category.fk_supercategory_id == "All" ? "All" : category,
        "new"
      );
    }
  }

  filterCategories = async (category) => {
    this.filterType = "All";
    let catId;
    if (category && this.categoriesFilterActive) {
      this.fType = this.language == "en" ? category.name_en : category.name_es;
      catId = category.id;
      this.subcats =
        this.subcategories &&
        this.subcategories.filter((sc) => {
          if (this.companyId == 12 && category.name_en == "Coworking") {
            return (
              sc.category_id == catId &&
              (sc.name_es == "Grupos temáticos" || sc.name_es == "Gar")
            );
          } else {
            return sc.category_id == catId;
          }
        });
    }
    if (this.fType !== "" && category && this.categoriesFilterActive) {
      this.filteredPlan = await this.plans.filter((plan) => {
        let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        let endDateReached = true;
        if (plan.limit_date) {
          if (plan.limit_date > plan.plan_date) {
            if (plan.limit_date >= today) {
              endDateReached = false;
            }
          }
        }

        let include = false;
        if (plan.id == 0) {
          include = true;
        } else if (!endDateReached) {
          include = true;
        } else if (!plan.limit_date && plan.plan_date >= today) {
          include = true;
        }

        let include_category
        if(plan.event_category_id == category.id) {
          include_category = true
        }

        if(this.companyId == 12) {
          if(this.planCategoriesMapping?.length > 0) {
            let match = this.planCategoriesMapping.some(a => a.group_plan_id == plan.id && a.plan_category_id == category.id)
            if(match) {
              include_category = true
            }
          }

          if(!include_category && this.companyId == 12 && this.kcnPlanCategoryMapping?.length > 0) {
            let match = this.kcnPlanCategoryMapping.some(a => a.group_plan_id == plan.id && a.plan_category_id == category.id)
            if(match) {
              include_category = true
            }
          }

          if(!include_category && this.companyId == 12 && category?.name_es == 'Networking + Eat and Meet') {
            let kcnCategories = this.kcnPlanCategoryMapping?.filter(cm => {
              return cm.group_plan_id == plan.id && (cm.name_es == 'Eat and Meet' || cm.name_es == 'Networking')
            })

            if(kcnCategories?.length > 0 || plan.event_category_id == 1 || plan.event_category_id == 2) {
              include_category = true
            }
          }
        }

        return include_category && include;
      });
    }

    this.filterActivities();
  };

  filterSubcategories = async (category, mode: string = "") => {
    if (
      this.companyId == 12 &&
      category != "All" &&
      (category.name_es.indexOf("Gar") >= 0 ||
        category.name_es.indexOf("GAR") >= 0)
    ) {
      this.filterKCNGar(category);
    } else if (
      this.companyId == 12 &&
      category != "All" &&
      category.name_es.indexOf("temáticos") >= 0
    ) {
      this.filterKCNThematicGroups(category);
    } else {
      if (category != "All") {
        if (mode == "new") {
          this.filterType =
            this.language == "en"
              ? category.name_EN || category.name_en
              : category.name_ES || category.name_es;
        } else {
          this.filterType =
            this.language == "en"
              ? category.name_EN || category.name_en
              : category.name_ES || category.name_es;
        }

        this.filteredPlan = [];
        this.category_type = this.filterType;
      } else {
        this.filterType = "All";
      }

      if (mode == "new") {
        if (this.filterType !== "All") {
          this.filteredPlan = await this.plans.filter((plan) => {
            let include = false;

            if (plan.event_category_id > 0) {
              include = plan.event_subcategory_id == category.id;
            } else {
              include =
                this.planSubcategories?.find(
                  (f) =>
                    f.plan_id === plan.id && f.subcategory_id == category.id
                ) ||
                this.planSubcategoriesMapping?.find(
                  (f) =>
                    f.plan_id === plan.id && f.subcategory_id == category.id
                );
            }

            return include;
          });
        } else {
          if (this.types && this.types.length > 0) {
            this.filterPlans(
              this.selectedFilterCategory.id,
              this.selectedFilterCategory.name_es,
              this.selectedFilterCategory.name_en
            );
          } else {
            this.filterPlans(
              this.selectedFilterCategory.fk_supercategory_id,
              this.selectedFilterCategory.name_ES,
              this.selectedFilterCategory.name_EN
            );
          }
        }
      } else {
        if (this.filterType !== "All") {
          this.filteredPlan = await this.plans.filter((plan) => {
            return plan.event_subcategory_id == category.id;
          });
        } else {
          this.filteredPlan = await this.plans;
        }

        if (this.fType !== "") {
          this.filteredPlan = await this.filteredPlan.filter((plan) => {
            let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

            let endDateReached = true;
            if (plan.limit_date) {
              if (plan.limit_date > plan.plan_date) {
                if (plan.limit_date >= today) {
                  endDateReached = false;
                }
              }
            }

            let include = false;
            if (plan.id == 0) {
              include = true;
            } else if (!endDateReached) {
              include = true;
            } else if (!plan.limit_date && plan.plan_date >= today) {
              include = true;
            }

            if (this.categories && this.categories.length > 0) {
              let cat = this.categories.filter((c) => {
                return c.name_es == this.fType || c.name_en == this.fType;
              });
              if (cat && cat[0]) {
                return plan.event_category_id == cat[0].id && include;
              }
            } else if (this.companyId == 14) {
              if (this.fType == "IPP Events") {
                return plan.event_category_id == 5 && include;
              } else if (this.fType == "Student Events") {
                return plan.event_category_id == 6 && include;
              } else if (this.fType == "Club Events") {
                return plan.event_category_id == 7 && include;
              } else if (this.fType == "Talleres") {
                return plan.event_category_id == 8 && include;
              }
            }
          });
        }
      }
    }

    this.filterActivities();
  };

  async filterKCNGar(category) {
    this.filterType = category.name_es; //'Gar';
    this.filteredPlan = [];
    this.filteredPlan = await this.plans.filter((plan) => {
      return (
        plan.event_subcategory_id == 5 ||
        plan.event_subcategory_id == 14 ||
        plan.event_subcategory_id == 15 ||
        plan.event_subcategory_id == 16 ||
        plan.event_subcategory_id == 17 ||
        plan.event_subcategory_id == 18 ||
        plan.event_subcategory_id == 39 ||
        plan.event_subcategory_id == 104 ||
        plan.event_subcategory_id == 105 ||
        plan.event_subcategory_id == 110 ||
        plan.event_subcategory_id == 111 ||
        (plan.event_subcategory_id >= 113 && plan.event_subcategory_id <= 126)
      );
    });

    if (this.fType !== "") {
      this.filteredPlan = await this.filteredPlan.filter((plan) => {
        let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        let endDateReached = true;
        if (plan.limit_date) {
          if (plan.limit_date > plan.plan_date) {
            if (plan.limit_date >= today) {
              endDateReached = false;
            }
          }
        }

        let include = false;
        if (plan.id == 0) {
          include = true;
        } else if (!endDateReached) {
          include = true;
        } else if (!plan.limit_date && plan.plan_date >= today) {
          include = true;
        }

        if (this.fType == "Networking") {
          return plan.event_category_id == 1 && include;
        } else if (
          this.fType == "Eat and Meat" ||
          this.fType == "Eat and Meet"
        ) {
          return plan.event_category_id == 2 && include;
        } else if (this.fType == "Coworking") {
          return plan.event_category_id == 3 && include;
        } else if (this.fType == "Talleres") {
          return plan.event_category_id == 4 && include;
        }
      });
    }

    this.filterActivities();
  }

  async filterKCNThematicGroups(category) {
    this.filterType = category.name_es; //'Thematic';
    this.filteredPlan = [];
    this.filteredPlan = await this.plans.filter((plan) => {
      return (
        plan.event_subcategory_id == 8 ||
        plan.event_subcategory_id == 9 ||
        plan.event_subcategory_id == 10 ||
        plan.event_subcategory_id == 11 ||
        plan.event_subcategory_id == 41 ||
        plan.event_subcategory_id == 62 ||
        plan.event_subcategory_id == 63 ||
        plan.event_subcategory_id == 108 ||
        plan.event_subcategory_id == 109 ||
        plan.event_subcategory_id == 112
      );
    });

    if (this.fType !== "") {
      this.filteredPlan = await this.filteredPlan.filter((plan) => {
        let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        let endDateReached = true;
        if (plan.limit_date) {
          if (plan.limit_date > plan.plan_date) {
            if (plan.limit_date >= today) {
              endDateReached = false;
            }
          }
        }

        let include = false;
        if (plan.id == 0) {
          include = true;
        } else if (!endDateReached) {
          include = true;
        } else if (!plan.limit_date && plan.plan_date >= today) {
          include = true;
        }

        if (this.fType == "Networking") {
          return plan.event_category_id == 1 && include;
        } else if (
          this.fType == "Eat and Meat" ||
          this.fType == "Eat and Meet"
        ) {
          return plan.event_category_id == 2 && include;
        } else if (this.fType == "Coworking") {
          return plan.event_category_id == 3 && include;
        } else if (this.fType == "Talleres") {
          return plan.event_category_id == 4 && include;
        }
      });
    }

    this.filterActivities();
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
    localStorage.setItem('plan-filter-city', this.selectedCity);
    this.searchPlans("new");
  }

  filterViewChanged(event) {
    this.defaultActiveFilter = event;
  }

  filteredAgeGroupList(event) {
    this.ageGroupList?.forEach((item) => {
      if (item.id === event) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedAgeGroup = event || "";
    this.searchPlans("new");
  }

  filteredGroupList(event) {
    this.groupList?.forEach((item) => {
      if (item.id === event) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedGroup = event || "";
    this.searchPlans("new");
  }

  async searchPlans(mode: string = "") {
    if (
      (mode =
        "new" && this.selectedFilterCategory && this.selectedFilterSubcategory)
    ) {
      this.filterSubcategories(this.selectedFilterSubcategory, "new");
    } else {
      if (this.types && this.types.length > 0) {
        let category;
        let catId;

        if (this.fType) {
          catId = 0;
          category = this.categories.filter((cat) => {
            return cat.name_en == this.fType || cat.name_es == this.fType;
          });
          if (category && category[0]) {
            category = category[0];
            catId = category.id;
          }
          this.subcats = this.subcategories.filter((sc) => {
            return sc.category_id == catId;
          });

          if (this.fType !== "" && category) {
            this.filteredPlan = await this.plans.filter((plan) => {
              let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

              let endDateReached = true;
              if (plan.limit_date) {
                if (plan.limit_date > plan.plan_date) {
                  if (plan.limit_date >= today) {
                    endDateReached = false;
                  }
                }
              }

              let include = false;
              if (plan.id == 0) {
                include = true;
              } else if (!endDateReached) {
                include = true;
              } else if (!plan.limit_date && plan.plan_date >= today) {
                include = true;
              }

              return plan.event_category_id == category.id && include;
            });
          }
        }

        if (this.filterType) {
          category = this.subcats.filter((cat) => {
            return (
              cat.name_en == this.filterType || cat.name_es == this.filterType
            );
          });
          if (category && category[0]) {
            category = category[0];
            catId = category.id;
          }

          if (
            this.companyId == 12 &&
            category &&
            category.length > 0 &&
            category != "All" &&
            (category.name_es.indexOf("Gar") >= 0 ||
              category.name_es.indexOf("GAR") >= 0)
          ) {
            this.filterKCNGar(category);
          } else if (
            this.companyId == 12 &&
            category &&
            category.length > 0 &&
            category != "All" &&
            category.name_es.indexOf("temáticos") >= 0
          ) {
            this.filterKCNThematicGroups(category);
          } else {
            if (category && category.length > 0) {
              if (category != "All") {
                this.filterType =
                  this.language == "en" ? category.name_en : category.name_es;
                this.category_type = this.filterType;
              } else {
                this.filterType = "All";
              }

              if (this.filterType !== "All") {
                this.filteredPlan = await this.filteredPlan.filter((plan) => {
                  return plan.event_subcategory_id == category.id;
                });
              } else {
                this.filteredPlan = await this.plans;
              }

              if (this.fType !== "") {
                this.filteredPlan = await this.filteredPlan.filter((plan) => {
                  let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

                  let endDateReached = true;
                  if (plan.limit_date) {
                    if (plan.limit_date > plan.plan_date) {
                      if (plan.limit_date >= today) {
                        endDateReached = false;
                      }
                    }
                  }

                  let include = false;
                  if (plan.id == 0) {
                    include = true;
                  } else if (!endDateReached) {
                    include = true;
                  } else if (!plan.limit_date && plan.plan_date >= today) {
                    include = true;
                  }

                  if (this.categories && this.categories.length > 0) {
                    let cat = this.categories.filter((c) => {
                      return c.name_es == this.fType || c.name_en == this.fType;
                    });
                    if (cat && cat[0]) {
                      return plan.event_category_id == cat[0].id && include;
                    }
                  } else if (this.companyId == 14) {
                    if (this.fType == "IPP Events") {
                      return plan.event_category_id == 5 && include;
                    } else if (this.fType == "Student Events") {
                      return plan.event_category_id == 6 && include;
                    } else if (this.fType == "Club Events") {
                      return plan.event_category_id == 7 && include;
                    } else if (this.fType == "Talleres") {
                      return plan.event_category_id == 8 && include;
                    }
                  }
                });
              }
            }
          }
        }
      } else {
        this.filteredPlan = [];

        this.language = this._localService.getLocalStorage(environment.lslang);
        if (!this.language) {
          this.language = "en";
        }
        this.selected = {};
        this.filteredPlan = this.plans;
        let filter_category_id = 0;
        let filter_category = this.categoryList.filter((cat) => {
          return (
            cat.name_EN == this.filterType || cat.name_ES == this.filterType
          );
        });
        if (filter_category && filter_category[0]) {
          filter_category_id = filter_category[0].fk_supercategory_id;
        }

        if (this.filterType != "All") {
          this.filteredPlan = await this.plans.filter((plan) => {
            let hasCategory;
            const {
              Company_Group_Plan_Supercategories,
              Company_Plans_Supercategories,
            } = plan;

            if (Company_Group_Plan_Supercategories) {
              hasCategory = Company_Group_Plan_Supercategories.filter(
                (category) => {
                  return category.fk_supercategory_id === filter_category_id;
                }
              );

              return hasCategory && hasCategory.length > 0;
            } else {
              hasCategory = Company_Plans_Supercategories.filter((category) => {
                return category.fk_supercategory_id === filter_category_id;
              });

              return (hasCategory && hasCategory.length > 0) || plan.id == 0;
            }
          });
        }

        if (this.fType !== "" && this.fType != "All") {
          this.filteredPlan = await this.filteredPlan.filter((plan) => {
            let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

            let endDateReached = true;
            if (plan.limit_date) {
              if (plan.limit_date > plan.plan_date) {
                if (plan.limit_date >= today) {
                  endDateReached = false;
                }
              }
            }

            let include = false;
            if (plan.id == 0) {
              include = true;
            } else if (!endDateReached) {
              include = true;
            } else if (!plan.limit_date && plan.plan_date >= today) {
              include = true;
            }

            if (this.fType == "Company" || this.fType == "University") {
              return (
                plan.fk_company_id == this.companyId &&
                plan.plan_type_id == 5 &&
                include
              );
            } else if (this.fType == "Employee" || this.fType == "Student") {
              return (
                plan.fk_company_id == this.companyId &&
                plan.plan_type_id == 1 &&
                include
              );
            } else if (this.fType == "Club" || this.fType == "Group") {
              return (
                plan.fk_company_id == this.companyId &&
                plan.fk_group_id > 0 &&
                include
              );
            } else if (this.fType == "Past") {
              return (
                plan.fk_company_id == this.companyId &&
                plan.plan_date < today &&
                !include
              );
            } else if (this.fType == "IE Events") {
              return plan.id == 0;
            }
          });
        }
      }

      this.filterActivities();
    }
  }

  handleSearchChanged(event) {
    this.search = event || "";
    if (this.selectedFilterCategory) {
      let category = this.selectedFilterCategory;
      this.filterPlans(
        category.fk_supercategory_id,
        category.name_EN,
        category.name_ES
      );

      if (this.selectedFilterSubcategory) {
        let subcategory = this.selectedFilterSubcategory;
        this.filterSubcategories(
          subcategory && subcategory.fk_supercategory_id == "All"
            ? "All"
            : subcategory,
          "new"
        );
      }
    } else {
      this.searchPlans();
    }
  }

  goToDashboard() {
    this._router.navigate(["/dashboard/1"]);
  }

  getMyActivitiesTitle() {
    return this.myActivities ? (this.language == "en"
      ? this.myActivities.title_en
        ? this.myActivities.title_en || this.myActivities.title_es
        : this.myActivities.title_es
      : this.language == "fr"
      ? this.myActivities.title_fr
        ? this.myActivities.title_fr || this.myActivities.title_es
        : this.myActivities.title_es
      : this.language == "eu"
      ? this.myActivities.title_eu
        ? this.myActivities.title_eu || this.myActivities.title_es
        : this.myActivities.title_es
      : this.language == "ca"
      ? this.myActivities.title_ca
        ? this.myActivities.title_ca || this.myActivities.title_es
        : this.myActivities.title_es
      : this.language == "de"
      ? this.myActivities.title_de
        ? this.myActivities.title_de || this.myActivities.title_es
        : this.myActivities.title_es
      : this.myActivities.title_es) : '';
  }

  handleDetailsRoute(plan) {
    let planTypeId = plan?.plan_type_id;
    if (plan?.privacy && !plan?.private_type) {
    } else {
      if (this.fType == "Internos" || this.fType == "Internal") {
        planTypeId = 4;
      }
      this._router.navigate([`/plans/details/${plan?.id}/${planTypeId}`]);
    }
  }

  handleDetailsClickRoute(id) {
    let plan_row = this.filteredPlan?.filter(plan => {
      return plan.id == id
    })
    let plan
    if(plan_row?.length > 0) {
      plan = plan_row[0];
    }
    if(plan) {
      let planTypeId = plan?.plan_type_id;
      if (plan?.privacy && !plan?.private_type) {
      } else {
        if (this.fType == "Internos" || this.fType == "Internal") {
          planTypeId = 4;
        }
        this._router.navigate([`/plans/details/${plan?.id}/${planTypeId}`]);
      }
    }
  }

  getFeaturedTitle() {
    return this.language == "en"
      ? this.featuredTextValueEn
        ? this.featuredTextValueEn || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "fr"
      ? this.featuredTextValueFr
        ? this.featuredTextValueFr || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "eu"
      ? this.featuredTextValueEu
        ? this.featuredTextValueEu || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "ca"
      ? this.featuredTextValueCa
        ? this.featuredTextValueCa || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "de"
      ? this.featuredTextValueDe
        ? this.featuredTextValueDe || this.featuredTextValue
        : this.featuredTextValue
      : this.featuredTextValue;
  }

  exitCalendarEventMode() {
    this.selected = ''
    this.calendarFilterMode = false
    this.hasDateSelected = false
    this.filterDate = ''
    this.joinedPlan = false
    this.initializePage()
    this.notifyChild({
        hasDateSelected: this.hasDateSelected,
        joinedPlan: this.joinedPlan
    })
  }

  notifyChild(params) {
    this.childNotifier.next(params)
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  toggleMyActivitiesHover(event) {
    this.myActivitiesHover = event;
  }

  showAdditionalFilter() {
    this.defaultActiveFilter = !this.defaultActiveFilter;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}