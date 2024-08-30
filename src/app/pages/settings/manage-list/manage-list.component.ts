import { CommonModule, Location } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ManageUsersComponent } from "../users/users.component";
import { ManageMemberTypesComponent } from "../member-types/member-types.component";
import { PlansAdminListComponent } from "@features/plans/admin-list/admin-list.component";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { Subject, takeUntil } from "rxjs";
import { CompanyService, LocalService } from "@share/services";
import { BreadcrumbComponent, ButtonGroupComponent, PageTitleComponent } from "@share/components";
import { JobOffersAdminListComponent } from "@features/job-offers/admin-list/admin-list.component";
import { ClubsAdminListComponent } from "@features/clubs/admin-list/admin-list.component";
import { ManageCitiesComponent } from "../cities/cities.component";
import { CityGuideAdminListComponent } from "@features/city-guide/admin-list/admin-list.component";
import { CommissionsAdminListComponent } from "@features/tutors/commissions-admin-list/commissions-admin-list.component";
import { TestimonialsAdminListComponent } from "@features/testimonials/admin-list/admin-list.component";
import { TutorsAdminListComponent } from "@features/tutors/admin-list/admin-list.component";
import { CoursesAdminListComponent } from "@features/courses/admin-list/admin-list.component";
import { DiscountsAdminListComponent } from "@features/offers/admin-list/admin-list.component";
import { ServicesAdminListComponent } from "@features/servicios/admin-list/admin-list.component";
import { BlogsAdminListComponent } from "@features/blogs/admin-list/admin-list.component";
import { CreditsAdminListComponent } from "@features/plans/credits-admin-list/credits-admin-list.component";
import { ReferencesAdminListComponent } from "@features/members/references-admin-list/references-admin-list.component";
import { BuddyAdminListComponent } from "@features/buddy/admin-list/admin-list.component";
import { environment } from "@env/environment";
import get from "lodash/get";

@Component({
  selector: "app-manage-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BreadcrumbComponent,
    ButtonGroupComponent,
    ManageUsersComponent,
    ManageMemberTypesComponent,
    ManageCitiesComponent,
    PlansAdminListComponent,
    ClubsAdminListComponent,
    JobOffersAdminListComponent,
    CityGuideAdminListComponent,
    CommissionsAdminListComponent,
    TestimonialsAdminListComponent,
    TutorsAdminListComponent,
    CoursesAdminListComponent,
    DiscountsAdminListComponent,
    ServicesAdminListComponent,
    BlogsAdminListComponent,
    CreditsAdminListComponent,
    ReferencesAdminListComponent,
    BuddyAdminListComponent,
    PageTitleComponent,
  ],
  templateUrl: "./manage-list.component.html",
})
export class ManageListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;

  language: any;
  email: any;
  userId: any;
  companyId: any;
  domain: any;
  userRole: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  languageChangeSubscription: any;
  cities: any;
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
  testimonialsFeature: any;
  testimonialsFeatureId: any;
  testimonialsTitle: any;
  tutorsFeature: any;
  tutorsFeatureId: any;
  tutorsTitle: any;
  coursesFeature: any;
  coursesFeatureId: any;
  coursesTitle: any;
  discountsFeature: any;
  discountsFeatureId: any;
  discountsTitle: any;
  servicesFeature: any;
  servicesFeatureId: any;
  servicesTitle: any;
  blogsFeature: any;
  blogsFeatureId: any;
  blogsTitle: any;
  buddyFeature: any;
  buddyFeatureId: any;
  buddyTitle: any;
  superAdmin: boolean = false;
  canCreatePlan: boolean = false;
  canCreateClub: boolean = false;
  canCreateJobOffer: boolean = false;
  canCreateCityGuide: boolean = false;
  canCreateTestimonial: boolean = false;
  canCreateCourse: boolean = false;
  canCreateDiscount: boolean = false;
  canCreateService: boolean = false;
  canCreateBlog: boolean = false;
  canCreateBuddy: boolean = false;
  buttonList: any[] = [];
  filter: any;
  company: any;
  status: any = "";
  subButtonList: any[] = [];
  citiesList: any = [];
  isLoading: boolean = true;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  listTitle: string = "";
  isUESchoolOfLife: boolean = false;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _location: Location
  ) {}

  async ngOnInit() {
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
    if (
      this.list == "plans" ||
      this.list == "clubs" ||
      this.list == "canalempleo" ||
      this.list == "cityguide" ||
      this.list == "commissions" ||
      this.list == "testimonials" ||
      this.list == "tutors" ||
      this.list == "courses" ||
      this.list == "discounts" ||
      this.list == "services" ||
      this.list == "blogs" ||
      this.list == "credits" ||
      this.list == "references" ||
      this.list == "buddy"
    ) {
      if(this.list == 'commissions') {
        this.buttonList = [
          {
            id: 1,
            value: "Pending",
            text: this._translateService.instant('tutors.pendingtransfer'),
            selected: true,
            fk_company_id: this.companyId,
            filter: "Pending",
          },
          {
            id: 2,
            value: "Completed",
            text: this._translateService.instant('tutors.transfercompleted'),
            selected: false,
            fk_company_id: this.companyId,
            filter: "Completed",
          }
        ];
      } else if(this.list == 'buddy') {
        this.buttonList = [
          {
            id: 1,
            value: "Mentors",
            text: this._translateService.instant('ambassadors.mentors'),
            selected: true,
            fk_company_id: this.companyId,
            filter: "Mentors",
          },
          {
            id: 2,
            value: "MentorRequests",
            text: this._translateService.instant('notification-popup.mentorrequests'),
            selected: false,
            fk_company_id: this.companyId,
            filter: "MentorRequests",
          }
        ];
      } else if(this.list == 'testimonials' || this.list == 'tutors' || this.list == 'courses' || this.list == 'discounts' || this.list == 'services' || this.list == 'credits' || this.list == 'references') {
        this.buttonList = [];
      }
      let filter = this.buttonList?.find((f) => f.selected);
      if (filter) {
        this.filter = filter.filter;
      }
      this.subButtonList = [];
      this.fetchAdministrarData();
    }
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.managementsection"
    );
    this.level3Title = this.listTitle;
    this.level4Title = "";
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
          this.getListTitle();
          this.initializeBreadcrumb();
          this.initializeIconFilterList(this.cities);

          if(this.list != 'commissions' && this.list != 'testimonials' && this.list != 'tutors' && this.list != 'courses' && this.list != 'discounts' && this.list != 'services' && this.list != 'buddy') {
            this.initializeButtonGroup();
          }
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getListTitle() {
    switch (this.list) {
      case "plans":
        let title = this.plansTitle;
        if(this.isUESchoolOfLife) {
          if(this.language == 'en') {
            title = title?.replace('University Life', 'School of Life')
          } else {
            title = title?.replace('de Vida Universitaria', 'de School of Life')
          }
        }
        this.listTitle = title;
        break;
      case "clubs":
        this.listTitle = this.clubsTitle;
        break;
      case "canalempleo":
        this.listTitle = this.jobOffersTitle;
        break;
      case "cityguide":
        this.listTitle = this.cityGuideTitle;
        break;
      case "commissions":
        this.listTitle = this._translateService.instant('tutors.commissions');
        break;
      case "testimonials":
        this.listTitle = this.testimonialsTitle;
        break;
      case "tutors":
        this.listTitle = this.tutorsTitle;
        break;
      case "courses":
        this.listTitle = this.coursesTitle;
        break;
      case "discounts":
        this.listTitle = this.discountsTitle;
        break;
      case "services":
        this.listTitle = this.servicesTitle;
        break;
      case "blogs":
        this.listTitle = this.blogsTitle;
        break;
      case "credits":
        this.listTitle = this._translateService.instant('course-create.credits');
        break;
      case "references":
        this.listTitle = this._translateService.instant('members.references');
        break;
      case "buddy":
        this.listTitle = this.buddyTitle;
        break;
    }
  }

  mapFeatures(features) {
    this.plansFeature = features?.find((f) => f.feature_id == 1 && f.status == 1);
    this.plansFeatureId = this.plansFeature?.feature_id;
    this.plansTitle = this.plansFeature
      ? this.getFeatureTitle(this.plansFeature)
      : "";

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
    // Check if city agenda is activated, otherwise just add here for testing
    if(!this.cityGuideFeature && this.companyId == 32) {
      this.cityGuideFeature = {
        feature_id: 3,
        name_ca: "City Agenda",
        name_de: "City Agenda",
        name_en: "City Guide",
        name_es: "City Guide",
        name_eu: "City Agenda",
        name_fr: "Calendrier de la Ville",
        status: 1
      }
    }
    this.cityGuideFeatureId = this.cityGuideFeature?.feature_id;
    this.cityGuideTitle = this.cityGuideFeature
      ? this.getFeatureTitle(this.cityGuideFeature)
      : "";

    this.testimonialsFeature = features?.find(
      (f) => f.feature_id == 23 && f.status == 1
    );
    this.testimonialsFeatureId = this.testimonialsFeature?.feature_id;
    this.testimonialsTitle = this.testimonialsFeature
      ? this.getFeatureTitle(this.testimonialsFeature)
      : "";

    this.tutorsFeature = features?.find(
      (f) => f.feature_id == 20 && f.status == 1
    );
    this.tutorsFeatureId = this.tutorsFeature?.feature_id;
    this.tutorsTitle = this.tutorsFeature
      ? this.getFeatureTitle(this.tutorsFeature)
      : "";

    this.coursesFeature = features?.find(
      (f) => f.feature_id == 11 && f.status == 1
    );
    this.coursesFeatureId = this.coursesFeature?.feature_id;
    this.coursesTitle = this.coursesFeature
      ? this.getFeatureTitle(this.coursesFeature)
      : "";

    this.discountsFeature = features?.find(
      (f) => f.feature_id == 4 && f.status == 1
    );
    this.discountsFeatureId = this.discountsFeature?.feature_id;
    this.discountsTitle = this.discountsFeature
      ? this.getFeatureTitle(this.discountsFeature)
      : "";

    this.servicesFeature = features?.find(
      (f) => f.feature_id == 14 && f.status == 1
    );
    this.servicesFeatureId = this.servicesFeature?.feature_id;
    this.servicesTitle = this.servicesFeature
      ? this.getFeatureTitle(this.servicesFeature)
      : "";

    this.blogsFeature = features?.find(
      (f) => f.feature_id == 21 && f.status == 1
    );
    this.blogsFeatureId = this.blogsFeature?.feature_id;
    this.blogsTitle = this.blogsFeature
      ? this.getFeatureTitle(this.blogsFeature)
      : "";

    this.buddyFeature = features?.find(
      (f) => f.feature_id == 19 && f.status == 1
    );
    this.buddyFeatureId = this.buddyFeature?.feature_id;
    this.buddyTitle = this.buddyFeature
      ? this.getFeatureTitle(this.buddyFeature)
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
    this.canCreateTestimonial =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 23
      );
    this.canCreateCourse =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 11
      );
    this.canCreateDiscount =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 4
      );

    this.canCreateService =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 14
      );

    this.canCreateBlog =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 21
      );

    this.canCreateBuddy =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 19
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
        : this.language == "it"
        ? feature.name_it ||
          feature.feature_name_IT ||
          feature.name_es ||
          feature.feature_name_ES
        : feature.name_es || feature.feature_name_ES
      : "";
  }

  initializeIconFilterList(list) {
    this.citiesList = [
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
      this.citiesList.push({
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

  initializeButtonGroup() {
    let list: any[] = [];

    if (this.plansFeatureId > 0) {
      list.push({
        id: this.plansFeatureId,
        value: this.plansFeatureId,
        text: this.plansTitle,
        selected: this.list == "plans" ? true : false,
        fk_company_id: this.companyId,
        filter: "plans",
      });
    }

    if (this.clubsFeatureId > 0) {
      list.push({
        id: this.clubsFeatureId,
        value: this.clubsFeatureId,
        text: this.clubsTitle,
        selected: this.list == "clubs" ? true : false,
        fk_company_id: this.companyId,
        filter: "clubs",
      });
    }

    if (this.jobOffersFeatureId > 0) {
      list.push({
        id: this.jobOffersFeatureId,
        value: this.jobOffersFeatureId,
        text: this.jobOffersTitle,
        selected: this.list == "joboffers" ? true : false,
        fk_company_id: this.companyId,
        filter: "canalempleo",
      });
    }

    if(this.list == 'commissions') {
      list.push({
        id: 1,
        value: "Pending",
        text: this._translateService.instant('tutors.pendingtransfer'),
        selected: true,
        fk_company_id: this.companyId,
        filter: "Pending",
      });
      list.push({
        id: 2,
        value: "Completed",
        text: this._translateService.instant('tutors.transfercompleted'),
        selected: false,
        fk_company_id: this.companyId,
        filter: "Completed",
      });
    }

    if(this.list == 'buddy') {
      list.push({
        id: 1,
        value: "Mentors",
        text: this._translateService.instant('ambassadors.mentors'),
        selected: true,
        fk_company_id: this.companyId,
        filter: "Mentors",
      });
      list.push({
        id: 2,
        value: "MentorRequests",
        text: this._translateService.instant('notification-popup.mentorrequests'),
        selected: false,
        fk_company_id: this.companyId,
        filter: "MentorRequests",
      });
    }

    this.buttonList = list;
    
    let filter = this.buttonList?.find((f) => f.selected);
    if (filter) {
      this.filter = filter.filter;
    }

    if(this.list != 'commissions' && this.list != 'credits' && this.list != 'references' && this.list != 'buddy') {
      this.initializeSubButtonGroup();
    }
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
        id: 4,
        value: "past",
        text: this._translateService.instant("your-admin-area.past"),
        selected: false,
        fk_company_id: this.companyId,
        filter: "past",
      });
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
    if(this.list != 'commissions' && this.list != 'testimonials' && this.list != 'courses' && this.list != 'buddy') {
      this.initializeSubButtonGroup();
    } else {
      this.status = event;
    }
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

  handleGoBack() {
    this._location.back();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}