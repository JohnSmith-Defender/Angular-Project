import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit, SimpleChange } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AppTheme, ThemeService } from "src/app/core/services/theme";
import { Subject, takeUntil } from "rxjs";
import { COURSE_UNIT_IMAGE_URL } from "@lib/api-constants";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService, UserService } from "@share/services";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "@env/environment";
import { PlansListComponent } from "@features/plans/list/list.component";
import { SafeContentHtmlPipe } from "@lib/pipes";
import { ClubsListComponent } from "@features/clubs/list/list.component";
import { CoursesListComponent } from "@features/courses/list/list.component";
import { JobOffersListComponent } from "@features/job-offers/list/list.component";
import { 
  MasonryComponent, 
  VideoSectionComponent, 
  SectionsMasonryComponent,
  SectionsComponent,
  SectionsMiddleComponent,
  TarotCardComponent
} from "@share/components";
import moment from "moment";
import get from 'lodash/get';
import { AstroIdealHomeComponent } from "@lib/components/ideal-home/astroideal-home.component";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SafeContentHtmlPipe,
    PlansListComponent,
    ClubsListComponent,
    CoursesListComponent,
    JobOffersListComponent,
    MasonryComponent,
    VideoSectionComponent,
    SectionsMasonryComponent,
    SectionsComponent,
    SectionsMiddleComponent,
    TarotCardComponent,
    AstroIdealHomeComponent,
  ],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit, OnDestroy {
  currentTheme!: AppTheme | null;

  private readonly _themeService = inject(ThemeService);
  private readonly _destroy$ = new Subject();

  @Input() returnUrl!: string;

  userId: any;
  language: any;
  blogTitle: any;
  offerTitle: any;
  features: any;
  companies: any;
  companyId: any;
  domain: any;
  buttonColor: any;
  primaryColor: any;
  isClubsActivated: boolean = false;
  isDiscountsActivated: boolean = false;
  isCityAgendaActivated: boolean = false;
  isServicesActivated: boolean = false;
  isloading: boolean = true;
  groupsTitle: any = "";
  clubsFeature: any;
  companySlug: any;
  hasLandingTemplate: boolean = false;
  hasPredefinedTemplate: boolean = false;
  hasDefaultPredefinedTemplate: boolean = false;
  predefinedTemplate: any;
  template: any;
  html: any;
  css: any;
  companyTemplate: any;
  hasMobileLimit: boolean = false;
  mobileLimitActivities: number = 4;
  mobileLimitCityAgenda: number = 3;
  mobileLimitClubs: number = 8;
  mobileLimitJobOffers: number = 3;
  mobileLimitDiscounts: number = 4;
  mobileLimitCourses: number = 4;
  mobileLimitStartups: number = 4;
  mobileLimitMembers: number = 4;
  disableActivities: boolean = false;
  disableCityAgenda: boolean = false;
  disableClubs: boolean = false;
  disableJobOffers: boolean = false;
  disableDiscounts: boolean = false;
  disableCourses: boolean = false;
  disableStartups: boolean = false;
  disableMembers: boolean = false;
  menus: any = [];
  menuOrdering: any;
  tempData: any;
  otherSettings: any;
  canShareRegistrationLink: boolean = false;
  showShareRegistrationModal: boolean = false;
  shareLink: any = "";
  currentUser: any;
  registrationLinkCopied: boolean = false;
  registrationLinkPreviewed: boolean = false;
  hover: boolean = false;
  hasCustomMemberTypeSettings: boolean = false;
  superAdmin: boolean = false;
  admin1: boolean = false;
  admin2: boolean = false;
  hasMenuOrdering: boolean = false;
  dashboardDetails: any;
  homeTextValue: any;
  homeTextValueEn: any;
  homeTextValueFr: any;
  homeTextValueEu: any;
  homeTextValueCa: any;
  homeTextValueDe: any;
  newMenuButton: any;
  newMenuButtonTextValue: any;
  newMenuButtonTextValueEn: any;
  newMenuButtonTextValueFr: any;
  newMenuButtonTextValueEu: any;
  newMenuButtonTextValueCa: any;
  newMenuButtonTextValueDe: any;
  newMenuButtonUrl: any;
  hasBuddy: boolean = false;
  hasBuddyMajorRestrictions: boolean = false;
  majorRestriction: any;
  hasBuddyYearRestrictions: boolean = false;
  yearRestriction: any;
  courseSubscriptions: any = [];
  homeActive: boolean = false;
  imageSrc: string = `${COURSE_UNIT_IMAGE_URL}/`;
  customMemberTypeId: any = 0;
  hasProfileHomeContent: boolean = false;
  profileHomeContentSetting: any = [];
  sectionOptions: any = [];
  showEventsCalendar: boolean = false;
  companyName: any;
  company: any;
  coursesFeature: any;
  hasClubs: boolean = false;
  hasCourses: boolean = false;
  plansFeature: any;
  hasPlans: boolean = false;
  showModuleSections: boolean = false;
  welcomeTitle: any;
  welcomeSubtitle: any;
  loadedSettings: boolean = false;

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
  user: any;
  campus: any = '';
  sectionsList: any = [];
  clubCategories: any = [];
  clubCategoryMapping: any = [];
  coursesProgress: any = [];
  hasCategoryAccess: boolean = false;
  types: any = [];
  areas: any = [];
  jobOfferAreasMapping: any = [];
  bottomEventTitles: boolean = false;
  homeCalendar: boolean = false;
  hasSectionsTemplate: boolean = false;
  plansTitle: any = "";
  cityGuideFeature: any;
  hasCityGuide: boolean = false;
  cityGuidesTitle: any = "";
  jobOffersFeature: any;
  hasJobOffers: boolean = false;
  jobOffersTitle: any = "";
  coursesTitle: any = "";
  discountsFeature: any;
  hasDiscounts: boolean = false;
  discountsTitle: any = "";
  blogsFeature: any;
  hasBlogs: boolean = false;
  blogsTitle: any = "";
  membersFeature: any;
  hasMembers: boolean = false;
  membersTitle: any = "";
  tutorsFeature: any;
  hasTutors: boolean = false;
  tutorsTitle: any = "";
  isMiddleSectionTemplate: boolean = false;
  planCalendar: boolean = false;
  isCursoGeniusTestimonials: boolean = false;
  hasProfessionals: boolean = false;
  professionalsFeature: any;

  mockCategoryData = {
    image: '1.png',
    title: 'adfafsafsad',
    description: 'adfadsfadsfd'
  };

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _userService: UserService,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._themeService.currentTheme$
      .pipe(takeUntil(this._destroy$))
      .subscribe((theme) => (this.currentTheme = theme));

    this.initializePage();
  }

  async initializePage() {
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this._translateService.use(this.language || "es");
    this.user = this._localService.getLocalStorage(environment.lsuser);

    this.companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";
    if(!this.companies) { 
      this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') 
    }
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
      this.company = company[0];
      this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(company[0]);
      this.companyId = company[0].id;
      this.companyName = company[0].entity_name;
      this.domain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this._localService.setLocalStorage(
        environment.lscompanyId,
        this.companyId
      );
      this._localService.setLocalStorage(environment.lsdomain, this.domain);
      this.homeTextValue = company[0].home_text || "Inicio";
      this.homeTextValueEn = company[0].home_text_en || "Home";
      this.homeTextValueFr = company[0].home_text_fr || "Maison";
      this.homeTextValueEu = company[0].home_text_eu || "Hasi";
      this.homeTextValueCa = company[0].home_text_ca || "Inici";
      this.homeTextValueDe = company[0].home_text_de || "Anfang";
      this.homeActive = company[0].show_home_menu == 1 ? true : false;
      this.newMenuButton = company[0].new_menu_button;
      if (this.newMenuButton == 1) {
        this.newMenuButtonTextValue = company[0].new_menu_button_text;
        this.newMenuButtonTextValueEn = company[0].new_menu_button_text_en;
        this.newMenuButtonTextValueFr = company[0].new_menu_button_text_fr;
        this.newMenuButtonTextValueEu = company[0].new_menu_button_text_eu;
        this.newMenuButtonTextValueCa = company[0].new_menu_button_text_ca;
        this.newMenuButtonTextValueDe = company[0].new_menu_button_text_de;
        this.newMenuButtonUrl = company[0].new_menu_button_url;
      }
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
      this.homeActive = company[0].show_home_menu == 1 ? true : false;

      if(!this.homeActive) {
        let menus = this._localService.getLocalStorage(environment.lsmenus) ? JSON.parse(this._localService.getLocalStorage(environment.lsmenus)) : '';
        if(menus?.length > 0) {
          location.href = menus[0].path;
        }
      }

      if(this.returnUrl && this.returnUrl != 'undefined') {
        location.href = `/${this.returnUrl}` || '/';
      }

      this.isCursoGeniusTestimonials = this._companyService.isCursoGeniusTestimonials(company[0]);
      if(this.isCursoGeniusTestimonials) {
        location.href = '/testimonials'
      }

      if (company[0].landing_template == 1) {
        this.companySlug = company[0].slug;
        this.hasLandingTemplate = true;
        this.companyTemplate = company[0].template ? company[0].template : "";
        this.getLandingTemplateBySlug(this.companySlug);
      }
      this.getSettingsTitle();
      if(this.userId) {
        this.getUserDetails();
      }

      if (company[0].predefined_template == 1) {
        this.hasPredefinedTemplate = true;
        if (
          (this.company?.id != 32 && company[0].predefined_template_id == 1) ||
          (this.companyId == 32 && 
            (
              (!this.isUESchoolOfLife && company[0].predefined_vida_template_id == 1) ||
              (this.isUESchoolOfLife && company[0].predefined_sol_template_id == 1)
            )
          )
        ) {
          this.hasDefaultPredefinedTemplate = true;
        } else  if (
          (this.company?.id != 32 && company[0].predefined_template_id == 4) ||
          (this.companyId == 32 && 
            (
              (!this.isUESchoolOfLife && company[0].predefined_vida_template_id == 4) ||
              (this.isUESchoolOfLife && company[0].predefined_sol_template_id == 4)
            )
          )
        ) { 
          this.hasSectionsTemplate = true;
        } else  if (
          (this.company?.id != 32 && company[0].predefined_template_id == 5) ||
          (this.companyId == 32 && 
            (
              (!this.isUESchoolOfLife && company[0].predefined_vida_template_id == 5) ||
              (this.isUESchoolOfLife && company[0].predefined_sol_template_id == 5)
            )
          )
        ) { 
          this.isMiddleSectionTemplate = true;
        } else {
          this._userService.getUserById(this.userId).subscribe(
            (response: any) => {
              let user = response ? response.CompanyUser : "";
              this.currentUser = user;
              this.customMemberTypeId = user?.custom_member_type_id;
              this.getPredefinedTemplate(company[0].predefined_template_id);
            },
            (error) => {
              console.log(error);
            }
          );
        }
      }
    }

    this.getAllActivatedFeatures();
    this.getTitles();
    this.isloading = false;

    this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.language = event.lang;
      this.getTitles();
      this.showLandingTemplate();
      if(this.showModuleSections) {
        this.loadSectionsList(1);
      }
    });

    this.getOtherSettings();
    this.getMenus();
  }

  async getAllActivatedFeatures() {
    this.features = await this._companyService
      .getFeatures(this.domain)
      .toPromise();

    let plansFeature = this.features.filter((f) => {
      return f.feature_name == "Plans";
    });
    if (plansFeature?.length > 0) {
      this.hasPlans = true;
      this.plansFeature = plansFeature[0];
    }

    let clubsFeature = this.features.filter((f) => {
      return f.feature_name == "Clubs";
    });
    if (clubsFeature?.length > 0) {
      this.hasClubs = true;
      this.clubsFeature = clubsFeature[0];
    }

    let coursesFeature = this.features.filter((f) => {
      return f.feature_name == "Courses";
    });
    if (coursesFeature?.length > 0) {
      this.hasCourses = true;
      this.coursesFeature = coursesFeature[0];
    }

    let cityGuideFeature = this.features.filter((f) => {
      return f.feature_name == "City Agenda";
    });
    if (cityGuideFeature?.length > 0) {
      this.hasCityGuide = true;
      this.cityGuideFeature = cityGuideFeature[0];
    }

    let jobOffersFeature = this.features.filter((f) => {
      return f.feature_name == "Employment Channel";
    });
    if (jobOffersFeature?.length > 0) {
      this.hasJobOffers = true;
      this.jobOffersFeature = jobOffersFeature[0];
    }

    let discountsFeature = this.features.filter((f) => {
      return f.feature_name == "Discounts";
    });
    if (discountsFeature?.length > 0) {
      this.hasDiscounts = true;
      this.discountsFeature = discountsFeature[0];
    }

    let blogsFeature = this.features.filter((f) => {
      return f.feature_name == "Blog";
    });
    if (blogsFeature?.length > 0) {
      this.hasBlogs = true;
      this.blogsFeature = blogsFeature[0];
    }

    let membersFeature = this.features.filter((f) => {
      return f.feature_name == "Members";
    });
    if (membersFeature?.length > 0) {
      this.hasMembers = true;
      this.membersFeature = membersFeature[0];
    }

    let tutorsFeature = this.features.filter((f) => {
      return f.feature_name == "Tutors";
    });
    if (tutorsFeature?.length > 0) {
      this.hasTutors = true;
      this.tutorsFeature = tutorsFeature[0];
    }

    let professionalsFeature = this.features.filter((f) => {
      return f.feature_name == "Professionals";
    });
    if (professionalsFeature?.length > 0) {
      this.hasProfessionals = true;
      this.professionalsFeature = professionalsFeature[0];
    }
  }

  async getMenus() {
    this.menus = this._localService.getLocalStorage(environment.lsmenus)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsmenus))
      : [];
    if (this.menus?.length > 0) {
      this.menus = this.menus.sort((a, b) => {
        return a.sequence - b.sequence;
      });
      this.updateDisabledFeatures(this.menus);
    }
  }

  getPredefinedTemplate(id) {
    this._companyService.getHomeTemplate(id, this.companyId).subscribe(
      (response) => {
        if (
          this.hasProfileHomeContent &&
          response.home_template_mapping &&
          response.home_template_mapping?.length > 1
        ) {
          let preDefinedTemplate = response.home_template_mapping;
          this.predefinedTemplate = response.home_template_mapping?.filter(
            (tmp) => {
              if (tmp.custom_member_type_id == this.customMemberTypeId) {
                if (tmp.has_title && !tmp.video_title) {
                  tmp.video_title =
                    preDefinedTemplate?.length > 0
                      ? preDefinedTemplate[0].video_title
                      : "";
                }
                if (!tmp.video_description) {
                  tmp.video_description =
                    preDefinedTemplate?.length > 0
                      ? preDefinedTemplate[0].video_description
                      : "";
                }
                if (tmp.has_video && !tmp.video_file) {
                  tmp.video_file =
                    preDefinedTemplate?.length > 0
                      ? preDefinedTemplate[0].video_file
                      : "";
                }
              }
              return tmp.custom_member_type_id == this.customMemberTypeId;
            }
          );
        } else {
          this.predefinedTemplate = response.home_template_mapping?.filter(
            (tmp) => {
              return !tmp.custom_member_type_id;
            }
          );
        }
        this.predefinedTemplate = this.predefinedTemplate?.length > 0 ? this.predefinedTemplate[0] : "";
      },
      (error) => {
        console.log(error);
      }
    );
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

  getTitles() {
    this.plansTitle = this.plansFeature ? this.getFeatureTitle(this.plansFeature) : '';
    if(this.isUESchoolOfLife && this.companyId == 32) {
      this.plansTitle = this.plansTitle?.replace('de Vida Universitaria', 'de School of Life');
      this.plansTitle = this.plansTitle?.replace('University Life', 'School of Life');
    }
    this.groupsTitle = this.clubsFeature ? this.getFeatureTitle(this.clubsFeature) : '';
    this.cityGuidesTitle = this.cityGuideFeature ? this.getFeatureTitle(this.cityGuideFeature) : '';
    this.jobOffersTitle = this.jobOffersFeature ? this.getFeatureTitle(this.jobOffersFeature) : '';
    this.coursesTitle = this.coursesFeature ? this.getFeatureTitle(this.coursesFeature) : '';
    this.discountsTitle = this.discountsFeature ? this.getFeatureTitle(this.discountsFeature) : '';
    this.blogsTitle = this.blogsFeature ? this.getFeatureTitle(this.blogsFeature) : '';
    this.membersTitle = this.membersFeature ? this.getFeatureTitle(this.membersFeature) : '';
    this.tutorsTitle = this.tutorsFeature ? this.getFeatureTitle(this.tutorsFeature) : '';
  }

  getSafeVideoUrl(video) {
    let url;
    if (video.indexOf("youtube") >= 0) {
      url = video?.replace("watch?v=", "embed/");

      if (url && url.indexOf("&") > 0) {
        url = url.substring(0, url.indexOf("&"));
      }
    } else if (video.indexOf("vimeo") >= 0) {
      url = video?.replace("vimeo.com/", "player.vimeo.com/video/");
    } else if (video.indexOf("http") >= 0) {
      url = video;
    } else {
      url = this.imageSrc + video;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getOtherSettings() {
    this._companyService.getOtherSettings(this.companyId).subscribe(
      async (response) => {
        this.otherSettings = response["other_settings"];
        if (this.otherSettings) {
          this.otherSettings.forEach((m) => {
            if (m.title_es == "General") {
              if (m.content) {
                let menuOrderSettings = m.content.filter((c) => {
                  return c.title_en.indexOf("Menu items order") >= 0;
                });
                if (menuOrderSettings && menuOrderSettings[0]) {
                  this.hasMenuOrdering =
                    menuOrderSettings[0].active == 1 ? true : false;
                }
                
                let showModuleSectionSettings = m.content.filter((c) => {
                  return c.title_en.indexOf("Show module sections") >= 0;
                });
                if (showModuleSectionSettings && showModuleSectionSettings[0]) {
                  this.showModuleSections =
                  showModuleSectionSettings[0].active == 1 ? true : false;
                }

                let welcomeTitleSettings = m.content.filter((c) => {
                  return c.title_en.indexOf("Welcome title") >= 0;
                });
                if (welcomeTitleSettings && welcomeTitleSettings[0]) {
                  this.welcomeTitle =  welcomeTitleSettings[0].value;
                }

                let welcomeSubtitleSettings = m.content.filter((c) => {
                  return c.title_en.indexOf("Welcome subtitle") >= 0;
                });
                if (welcomeSubtitleSettings && welcomeSubtitleSettings[0]) {
                  this.welcomeSubtitle =  welcomeSubtitleSettings[0].value;
                }
              }
            }
            if (m.title_es == "Registro / Servicios") {
              if (m.content) {
                let shareRegistrationLinkSettings = m.content.filter((c) => {
                  return c.title_en.indexOf("Share registration link") >= 0;
                });
                if (
                  shareRegistrationLinkSettings &&
                  shareRegistrationLinkSettings[0]
                ) {
                  this.canShareRegistrationLink =
                    shareRegistrationLinkSettings[0].active == 1 ? true : false;
                  if (this.canShareRegistrationLink && this.userId) {
                    this.getUserDetails();
                  }
                }
              }
            }

            if (m.title_es == "Stripe") {
              if (m.content) {
                let customMemberTypeSettings = m.content.filter((c) => {
                  return (
                    c.title_en.indexOf(
                      "Require Stripe payment on specific member types"
                    ) >= 0
                  );
                });
                if (customMemberTypeSettings && customMemberTypeSettings[0]) {
                  this.hasCustomMemberTypeSettings =
                    customMemberTypeSettings[0].active == 1 ? true : false;
                }
              }
            }
          });
        }
        if(this.showModuleSections) {
          this.loadSectionsList(1);
        }
        this.loadedSettings = true;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadSectionsList(pageNo) {
    this._companyService
    .getHomeSectionsData(this.companyId, this.userId, pageNo, this.isUESchoolOfLife)
    .subscribe(
      response => {
        this.mapSubfeatures(response?.subfeatures);
        this.clubCategories = response.club_categories;
        this.clubCategoryMapping = response.club_category_mapping;
        this.coursesProgress = response.courses_progress;
        this.types = response?.job_types;
        this.areas = response?.job_areas;
        this.jobOfferAreasMapping = response?.job_offer_areas;
        this.planCalendar = response?.plan_calendar == 1 ? true : false;
        this.formatSectionsData(response?.results);
      },
      error => {
        console.log(error);
      }
    )
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.hasCategoryAccess = subfeatures.some(
        (a) => a.name_en == "Category access" && a.active == 1
      );
      this.bottomEventTitles = subfeatures.some(
        (a) => a.name_en == "Event titles (Bottom)" && a.active == 1
      );
      this.homeCalendar = subfeatures.some(
        (a) => a.name_en == "Event calendar in Home" && a.active == 1
      );
    }
  }

  formatSectionsData(data) {
    let temp_sections_list: any[] = [];
    if(data?.length > 0) {
      data?.forEach(item => {
        temp_sections_list?.push({
          id: 1,
          item_id: item?.id,
          path: this.getPath(item),
          image: this.getImage(item),
          title: this.getTitle(item),
          date: this.getDate(item),
          plan_date: item?.plan_date,
          plan_type_id: item?.plan_type_id,
          address: item?.address,
          privacy: item?.private,
          credits: item?.credits,
          price: item?.price,
          object_type: item?.object_type,
          category: this.getCategory(item),
          button_text: this.getButtonText(item),
          languages: this.getLanguages(item),
          city: this.getCity(item),
          types: this.getTypes(item),
          rating: this.getRating(item),
          sector: this.getSector(item),
          type: this.getType(item),
          area: this.getArea(item),
          created_by_name: this.getCreatedByName(item),
          created_by_image: this.getCreatedByImage(item),
          description: this.getDescription(item),
          sol_nivelacion: item?.sol_nivelacion,
          course_intro: item?.course_intro,
        })
      })
    }
    this.sectionsList = temp_sections_list;
    this.cd.detectChanges();
  }

  getPath(item) {
    let object_type = item?.object_type;
    let path = '';

    switch(object_type) {
      case 'plan':
        path = `/plans/details/${item.id}/${item?.plan_type_id}`
        break;
      case 'club':
        path = `/clubs/details/${item.id}`
        break;
      case 'course':
        path = `/courses/details/${item.id}`
        break;
      case 'cityguide':
        path = `/cityguide/details/${item.id}`
        break;
      case 'discount':
        path = `/discounts/details/${item.id}`
        break;
      case 'blog':
        path = `/blog/details/${item.id}`
        break;
      case 'tutor':
        path = `/tutors/details/${item.id}`
        break;
      case 'service':
        path = `/services/details/${item.id}`
        break;
      case 'member':
        path = `/members/details/${item.id}`
        break;
      case 'joboffer':
        path = `/employmentchannel/details/${item.id}`
        break;
    }

    return path;
  }

  getImage(item) {
    let object_type = item?.object_type;
    let image = '';
    let path = '';

    switch(object_type) {
      case 'plan':
        path = item?.plan_type_id == 4 ? 'get-image-group-plan' : 'get-ie-image-plan';
        image = `${environment.api}/${path}/${item.image}`;
        break;
      case 'club':
        image = `${environment.api}/get-image-group/${item.image}`;
        break;
      case 'course':
        image = `${environment.api}/get-course-image/${item.image}`;
        break;
      case 'cityguide':
        image = `${environment.api}/get-image/${item.image}`;
        break;
      case 'discount':
        image = `${environment.api}/get-ie-image-disc/${item.image}`;
        break;
      case 'blog':
        image = `${environment.api}/get-blog-image/${item.image}`;
        break;
      case 'tutor':
        image = `${environment.api}/${item.image}`;
        break;
      case 'service':
        image = `${environment.api}/get-image/${item.image}`;
        break;
      case 'member':
        image = `${environment.api}/${item.image}`;
        break;
    }

    return image;
  }

  getTitle(item) {
    let object_type = item?.object_type;
    let title = '';

    switch(object_type) {
      case 'plan':
        title = this.getEventTitle(item);
        break;
      case 'club':
        title = this.getGroupTitle(item);
        break;
      case 'course':
        title = this.getCourseTitle(item);
        break;
      case 'cityguide':
        title = this.getCityGuideTitle(item);
        break;
      case 'discount':
        title = this.getOfferTitle(item);
        break;
      case 'blog':
        title = this.getBlogTitle(item);
        break;
      case 'tutor':
        title = this.getTutorTitle(item);
        break;
      case 'service':
        title = item?.name;
        break;
      case 'member':
        title = item?.first_name ? `${item?.first_name} ${item?.last_name}` : item?.name;
        break;
      case 'joboffer':
        title = this.getJobOfferTitle(item);
        break;
    }

    return title;
  }

  getDescription(item) {
    let object_type = item?.object_type;
    let description = '';

    switch(object_type) {
      case 'cityguide':
        description = this.getExcerpt(this.getCityGuideDescription(item));
        break;
      case 'joboffer':
        description = this.getExcerpt(this.getJobOfferDescription(item));
        break;
    }

    return description;
  }

  getDate(item) {
    let object_type = item?.object_type;
    let date = '';

    switch(object_type) {
      case 'plan':
        date = this.getActivityDate(item);
        break;
      case 'blog':
        date = item?.created_at;
        break;
    }

    return date;
  }

  getCreatedByName(item) {
    let object_type = item?.object_type;
    let created_by = '';

    switch(object_type) {
      case 'blog':
        created_by = item?.created_by_name;
        break;
    }

    return created_by;
  }

  getCreatedByImage(item) {
    let object_type = item?.object_type;
    let created_by_image = '';

    switch(object_type) {
      case 'blog':
        created_by_image = `${environment.api}/${item?.created_by_image}`;
        break;
    }

    return created_by_image;
  }

  getLanguages(item) {
    let object_type = item?.object_type;
    let languages = '';

    switch(object_type) {
      case 'tutor':
        languages = item?.languages || this._translateService.instant('tutors.spanish');
        break;
    }

    return languages;
  }

  getCity(item) {
    let object_type = item?.object_type;
    let city = '';

    switch(object_type) {
      case 'tutor':
        city = item?.city;
        break;
      case 'member':
        city = item?.city;
        break;
    }

    return city;
  }

  getRating(item) {
    let object_type = item?.object_type;
    let rating = '';

    switch(object_type) {
      case 'tutor':
        rating = this.getTutorRating(item);
        break;
    }

    return rating;
  }

  getTutorRating(item) {
    let rating

    if(item?.tutor_ratings?.length > 0){
      let rating_array = item['tutor_ratings']
      let tut_rating = 0.0
      let no_of_rating = 0
      rating_array.forEach((tr) => {
          tut_rating += tr.tutor_rating ? parseFloat(tr.tutor_rating) : 0
          no_of_rating++
      })
      rating = (tut_rating/no_of_rating).toFixed(1);
    }

    return rating
  }

  getTypes(item) {
    let object_type = item?.object_type;
    let types = '';

    switch(object_type) {
      case 'tutor':
        types = item?.types;
        break;
    }

    return types;
  }

  getCategory(item) {
    let object_type = item?.object_type;
    let category = '';

    switch(object_type) {
      case 'club':
        category = this.getClubCategory(item);
        break;
      case 'course':
        category = this.getCourseCategory(item);
        break;
    }

    return category;
  }

  getClubCategory(club) {
    let category = ''
    let club_category = this.clubCategoryMapping?.filter(cc => {
      return cc.fk_group_id == club.id
    })

    if(club_category?.length > 0) {
      let mapped = club_category?.map(cc => {
        let category = this.clubCategories?.filter(c => {
          return cc.fk_supercategory_id == c.id
        })
        let title = category?.length > 0 ? this.getCategoryTitle(category[0]) : ''
        
        return {
          ...cc,
          title,
        }
      })

      if(mapped?.length > 0) {
        category = mapped.map( (data) => { return data.title }).join(',')
      }
    }

    return category
  }

  getCourseCategory(course) {
    let category = '';
    let category_texts = this.getCategoriesDisplay(course);

    if(category_texts?.length > 0) {
      category = category_texts?.map((data) => { return data.label }).join(', ');
    }

    return category;
  }

  getCategoriesDisplay(course) {
    let list_categories: any[] = []
    if(course?.course_categories?.length > 0) {
      course?.course_categories?.forEach(category => {
        list_categories.push({
          label: this.getCategoryLabel(category)
        })
      })
    }
    return list_categories
  }

  getCategoryLabel(category) {
    return category
      ? this.language == "en"
        ? category.name_EN ||
          category.name_ES
        : this.language == "fr"
        ? category.name_FR ||
          category.name_ES
        : this.language == "eu"
        ? category.name_EU ||
          category.name_ES
        : this.language == "ca"
        ? category.name_CA ||
          category.name_ES
        : this.language == "de"
        ? category.name_DE ||
          category.name_ES
        : this.language == "it"
        ? category.name_IT ||
          category.name_ES
        : category.name_ES
      : "";
  }

  getCategoryTitle(category) {
    return category ? (this.language == 'en' ? (category.name_EN || category.name_ES) : (this.language == 'fr' ? (category.name_fr || category.name_ES) : 
        (this.language == 'eu' ? (category.name_eu || category.name_ES) : (this.language == 'ca' ? (category.name_ca || category.name_ES) : 
        (this.language == 'de' ? (category.name_de || category.name_ES) : category.name_ES)
      ))
    )) : ''
  }

  getSector(item) {
    let object_type = item?.object_type;
    let sector = '';

    switch(object_type) {
      case 'member':
        sector = item?.sector;
        break;
    }

    return sector;
  }

  getJobOfferTitle(offer) {
    return this.language == 'en' ? (offer.title_en || offer.title) : (this.language == 'fr' ? (offer.title_fr || offer.title) :
      (this.language == 'eu' ? (offer.title_eu || offer.title) : (this.language == 'ca' ? (offer.title_ca || offer.title) :
        (this.language == 'de' ? (offer.title_de || offer.title) : offer.title)
      ))
    )
  }

  getJobOfferDescription(offer) {
    return this.language == 'en' ? (offer.description_en || offer.description) : (this.language == 'fr' ? (offer.description_fr || offer.description) :
      (this.language == 'eu' ? (offer.description_eu || offer.description) : (this.language == 'ca' ? (offer.description_ca || offer.description) :
        (this.language == 'de' ? (offer.description_de || offer.description) : offer.description)
      ))
    )
  }

  getCityGuideDescription(offer) {
    return this.language == 'en' ? (offer.description_EN || offer.description_ES) : (this.language == 'fr' ? (offer.description_FR || offer.description_ES) :
      (this.language == 'eu' ? (offer.description_EU || offer.description_ES) : (this.language == 'ca' ? (offer.description_CA || offer.description_ES) :
        (this.language == 'de' ? (offer.description_DE || offer.description_ES) : offer.description_ES)
      ))
    )
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

  getType(item) {
    let object_type = item?.object_type;
    let type = '';

    switch(object_type) {
      case 'joboffer':
        type = this.getJobOfferType(item);
        break;
    }

    return type;
  }

  getJobOfferType(item) {
    let type = '';

    let type_row = this.types?.filter(jt => {
      return jt.id == item.type_id
    })

    if(type_row?.length > 0) {
      type = this.getTypeTitle(type_row[0])
    }

    return type;
  }

  getTypeTitle(type) {
    return this.language == 'en' ? (type.title_en || type.title) : (this.language == 'fr' ? (type.title_fr || type.title) :
      (this.language == 'eu' ? (type.title_eu || type.title) : (this.language == 'ca' ? (type.title_ca || type.title) :
        (this.language == 'de' ? (type.title_de || type.title) : type.title)
      ))
    )
  }

  getArea(item) {
    let object_type = item?.object_type;
    let area = '';

    switch(object_type) {
      case 'joboffer':
        area = this.getAreaDisplay(item);
        break;
    }

    return area;
  }

  getAreaDisplay(offer) {
    let area_display = ''

    let job_areas = this.areas?.filter(ja => {
      return this.jobOfferAreasMapping?.some((a) => a.job_offer_id === offer.id && a.area_id == ja.id);
    })

    area_display = job_areas?.length > 1 ? job_areas?.map( (data) => { return data.title }).join(', ') : (job_areas?.length == 1 ? job_areas[0].title : '')

    return area_display
  }

  getButtonText(item) {
    let object_type = item?.object_type;
    let button_text = '';
    
    switch(object_type) {
      case 'course':
        button_text = this.getCourseButtonText(item);
        break;
    }

    return button_text;
  }

  getCourseButtonText(course) {
    let button_text = '';

    let progress = this.getUserProgress(course);

    if (
      (((course?.locked == 1 && this.hasCourseStarted(course)) ||
        (course?.buy_now_status == 0 && this.hasCourseStarted(course)) ||
        (!this.hasCourseStarted(course) && course?.show_buy_now)) &&
        course?.show_buy_now &&
        course?.cta_status != 1) ||
      course.unassigned_status == 1
    ) {
      button_text = this._translateService.instant("courses.blocked");
    }

    if (
      (!course?.locked || course?.locked != 1) &&
      this.hasCourseStarted(course) &&
      course?.show_buy_now &&
      course?.buy_now_status == 1
    ) {
      button_text =
        course.buy_now_status == 1 &&
        (this.hasCategoryAccess
          ? this.userId
            ? this._translateService.instant("courses.buynow")
            : this._translateService.instant("courses.logintoaccess")
          : this._translateService.instant("courses.buynow"));
    }

    if (
      ((!course?.locked || course?.locked != 1) &&
        !this.hasCourseStarted(course) &&
        !course?.show_buy_now) ||
      (course.exception_access == 1 && !this.hasCourseStarted(course))
    ) {
      button_text = `${this._translateService.instant("courses.startson")} ${moment(
        course.date
      )
        .locale(this.language)
        .format("D MMM")}`;
    }

    if (
      course?.cta_status == 1 &&
      !(
        (!course?.locked || course?.locked != 1) &&
        this.hasCourseStarted(course) &&
        !course?.show_buy_now
      ) &&
      !(
        (!course?.locked || course?.locked != 1) &&
        !this.hasCourseStarted(course) &&
        !course?.show_buy_now
      )
    ) {
      button_text = course.cta_text;
    }

    if (
      ((!course?.locked || course?.locked != 1) &&
        this.hasCourseStarted(course) &&
        !course?.show_buy_now) ||
      ((course.exception_access == 1 || this.superAdmin) &&
        this.hasCourseStarted(course))
    ) {
      button_text = this.userId
        ? progress == 0
          ? `${this._translateService.instant(
              "courses.begin"
            )} ${this._translateService.instant("invite.here")}`
          : this._translateService.instant("courses.continue")
        : this._translateService.instant("courses.logintoaccess");
    }

    return button_text;
  }

  hasCourseStarted(course) {
    let show = true;
    let start_date = course.date;
    let today = moment().format("YYYY-MM-DD");

    if (start_date) {
      start_date = moment(course.date).format("YYYY-MM-DD");
      if (moment(today).isBefore(course.date)) {
        show = false;
      }
    }

    return show;
  }

  getUserProgress(course) {
    let progress = 0;
    let user_course = this.coursesProgress?.find(
      (cp) => cp?.user_id == this.userId && cp?.course_id == course?.id
    );
    if (user_course) {
      progress = user_course?.progress;
    }
    return progress;
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
            .format("D")}-${moment(activity.limit_date)
            .locale(this.language)
            .format("D MMMM")}`;
        } else {
          date = `${moment
            .utc(activity.plan_date)
            .locale(this.language)
            .format("D MMMM")}-${moment(activity.limit_date)
            .locale(this.language)
            .format("D MMMM")}`;
        }
      }
    }
    return date;
  }

  getGroupTitle(group) {
    return this.language == "en"
      ? group.title_en
        ? group.title_en || group.title_es
        : group.title
      : this.language == "fr"
      ? group.title_fr
        ? group.title_fr || group.title
        : group.title
      : this.language == "eu"
      ? group.title_eu
        ? group.title_eu || group.title
        : group.title
      : this.language == "ca"
      ? group.title_ca
        ? group.title_ca || group.title
        : group.title
      : this.language == "de"
      ? group.title_de
        ? group.title_de || group.title
        : group.title
      : group.title;
  }

  getCityGuideTitle(guide) {
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

  getOfferTitle(offer) {
    return offer ? (this.language == 'en' ? (offer.title_en || offer.title) : (this.language == 'fr' ? (offer.title_fr || offer.title) : 
        (this.language == 'eu' ? (offer.title_eu || offer.title) : (this.language == 'ca' ? (offer.title_ca || offer.title) : 
        (this.language == 'de' ? (offer.title_de || offer.title) : offer.title)
      ))
    )) : ''
  }

  getBlogTitle(blog) {
    return blog
      ? this.language == "en"
        ? blog.name_EN || blog.name_ES
        : this.language == "fr"
        ? blog.name_FR || blog.name_ES
        : this.language == "eu"
        ? blog.name_EU || blog.name_ES
        : this.language == "ca"
        ? blog.name_CA || blog.name_ES
        : this.language == "de"
        ? blog.name_DE || blog.name_ES
        : blog.name_ES
      : "";
  }

  getTutorTitle(tutor) {
    return tutor?.name || `${tutor?.first_name} ${tutor?.last_name}`;
  }

  getSettingsTitle() {
    this._companyService
    .getCategorySetting(4)
    .subscribe(
        response => {
            this.sectionOptions = response['section_options']
            if(this.sectionOptions && this.sectionOptions?.length > 0){
                this.getSetttingSectionOptions()
            }
        },
        error => {
            console.log(error);
        }
    )
  }

  getSetttingSectionOptions() {
    if(this.sectionOptions){
     let option = this.sectionOptions.filter(f => {
         return f.title_en == 'Allow different content based on profile'
     })
     if(option && option?.length > 0){
         this.profileHomeContentSetting = option[0]
         this.getOtherSettingsSectionOptionContent(this.profileHomeContentSetting.id, this.profileHomeContentSetting.section_id)
     }
    }
  }

  async getOtherSettingsSectionOptionContent(option_id, section_id) {
    await this._companyService.getOtherSettingsSectionOptionContent(option_id, section_id, this.companyId)
    .subscribe(
        async response => {
            let optionContent: any[] = []
            optionContent.push(response['option_content']);
            optionContent?.forEach(oc => {
                if(this.profileHomeContentSetting['id'] == oc['option_id'] && this.profileHomeContentSetting['section_id'] == oc['section_id']){
                    this.hasProfileHomeContent = oc.active ? true : false
                }
            })
        }
    )
  }

  getUserDetails() {
    if (!this.currentUser) {
      this._userService.getUserById(this.userId).subscribe(
        (response: any) => {
          this.currentUser = response ? response.CompanyUser : "";
          this.shareLink = this.currentUser ? this.currentUser.tiny_url : "";
          this.getUserRole();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  getUserRole() {
    this._userService.getUserRole(this.userId).subscribe(
      (response: any) => {
        let roles = response.role;
        if (roles && roles.length > 0) {
          roles.forEach((role) => {
            if (role.role == "Super Admin") {
              this.superAdmin = true;
            }
            if (role.role == "Admin 1") {
              this.admin1 = true;
            }
            if (role.role == "Admin 2") {
              this.admin2 = true;
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getCourseTitle(course) {
    return this.language == "en"
      ? course.title_en
        ? course.title_en || course.title
        : course.title
      : this.language == "fr"
      ? course.title_fr
        ? course.title_fr || course.title
        : course.title
      : this.language == "eu"
      ? course.title_eu
        ? course.title_eu || course.title
        : course.title
      : this.language == "ca"
      ? course.title_ca
        ? course.title_ca || course.title
        : course.title
      : this.language == "de"
      ? course.title_de
        ? course.title_de || course.title
        : course.title
      : this.language == "it"
      ? course.title_it
        ? course.title_it || course.title
        : course.title
      : course.title;
  }

  updateDisabledFeatures(menus) {
    let activity =
      menus &&
      menus.filter((menu) => {
        return menu.id == 1 && menu.path == "plans";
      });
    if (!activity || (activity && activity.length == 0)) {
      this.disableActivities = true;
    }

    let club =
      menus &&
      menus.filter((menu) => {
        return menu.id == 5;
      });
    if (!club || (club && club.length == 0)) {
      this.disableClubs = true;
    }

    let joboffers =
      menus &&
      menus.filter((menu) => {
        return menu.id == 18;
      });
    if (!joboffers || (joboffers && joboffers.length == 0)) {
      this.disableJobOffers = true;
    }

    let courses =
      menus &&
      menus.filter((menu) => {
        return menu.id == 11;
      });
    if (!courses || (courses && courses.length == 0)) {
      this.disableCourses = true;
    }

    let members =
      menus &&
      menus.filter((menu) => {
        return menu.id == 15;
      });
    if (!members || (members && members.length == 0)) {
      this.disableMembers = true;
    }
  }

  getLandingTemplateBySlug(slug) {
    this._companyService
      .getLandingTemplateBySlug(slug)
      .pipe(takeUntil(this._destroy$))
      .subscribe((data) => {
        let template = data.template;
        this.companyTemplate = template;
        if (this.companyTemplate) {
          this.showLandingTemplate();
        }
      });
  }

  showLandingTemplate() {
    if (this.companyTemplate) {
      let style = ` <style>
                table{background-color:transparent !important;}  
                .v-row-background-image--outer{background-size:100%;}
                @media (max-width: 767px) { .u-col.u-col-50, .u-col.u-col-100, .u-row.v-row-columns-background-color-background-color{display:block !important;max-width:100% !important;min-width:100% !important;} }
            </style> `;
      const regex = /max-width: 600px;/gi;

      let html_body = "";
      let html_css = "";

      if (this.language == "en") {
        html_body = this.companyTemplate.body;
        html_css = this.companyTemplate.css;
      } else if (this.language == "es") {
        html_body = this.companyTemplate.body_es;
        html_css = this.companyTemplate.css_es;
      } else if (this.language == "eu") {
        html_body = this.companyTemplate.body_eu;
        html_css = this.companyTemplate.css_eu;
      } else if (this.language == "de") {
        html_body = this.companyTemplate.body_de;
        html_css = this.companyTemplate.css_de;
      } else if (this.language == "fr") {
        html_body = this.companyTemplate.body_fr;
        html_css = this.companyTemplate.css_fr;
      } else if (this.language == "de") {
        html_body = this.companyTemplate.body_de;
        html_css = this.companyTemplate.css_de;
      }

      let body = html_body ? html_body.replace(regex, "max-width: 100%;") : "";

      const regex1 = /min-width: 900px;/gi;
      body = body ? body.replace(regex1, "min-width: 100%;") : "";

      this.html = this.sanitizer.bypassSecurityTrustHtml(style + body);
      this.css = this.sanitizer.bypassSecurityTrustStyle(html_css);

      setTimeout(() => {
        const table: any = document.getElementsByTagName("TABLE")[1];
        if (table) {
          var sheet = document.createElement("style");
          sheet.innerHTML =
            ".guest-home.html-container strong, .guest-home.html-container p, .guest-home.html-container h1, .guest-home.html-container h2, .guest-home.html-container h3, .guest-home.html-container h4, .guest-home.html-container h5, .guest-home.html-container span {font-family: " +
            table.style.fontFamily +
            ";} ";
          document.head.appendChild(sheet);
        }
      }, 100);
    }
  }

  shareRegistrationLink() {
    this.registrationLink(true);
  }

  closeShareRegistrationModal() {
    this.registrationLink();
  }

  copyRegistrationLink() {
    this.registrationLinkPreviewed = false;
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = this.shareLink;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    this.registrationLinkCopied = true;
  }

  registrationLink(showModal: boolean = false) {
    this.registrationLinkCopied = false;
    this.registrationLinkPreviewed = false;
    this.showShareRegistrationModal = showModal;
  }

  previewRegistrationLink() {
    this.registrationLinkCopied = false;
    this.registrationLinkPreviewed = true;
    window.open(this.shareLink, "_blank");
  }

  hasAccess(path) {
    let access = false;
    let no_menu = false;
    if (!this.menus || this.menus?.length == 0) {
      no_menu = true;
      this.menus = this._localService.getLocalStorage(environment.lsmenus)
        ? JSON.parse(this._localService.getLocalStorage(environment.lsmenus))
        : [];
    }
    if (this.menus?.length > 0) {
      let feature =
        this.menus &&
        this.menus.filter((m) => {
          return m.path == path;
        });
      if (feature && feature.length > 0) {
        access = true;
      }
    }

    if (no_menu && this.menus?.length > 0) {
      this.updateDisabledFeatures(this.menus);
    }

    return access;
  }

  checkSection(menus, index, order) {
    let result = false;

    if (menus && menus.length > 0) {
      let match = menus.some((a) => a.path === "dashboard");
      if (match) {
        if (index > 2 && order == "second") {
          result = true;
        }
      } else {
        if (index > 1 && order == "second") {
          result = true;
        }
      }
    }

    return result;
  }

  hasMenus() {
    let access = false;
    if (!this.menus || this.menus?.length == 0) {
      this.menus = this._localService.getLocalStorage(environment.lsmenus)
        ? JSON.parse(this._localService.getLocalStorage(environment.lsmenus))
        : [];
    }
    if (this.menus?.length > 0) {
      access = true;
    }

    return access;
  }

  handleThemeChange(theme: AppTheme): void {
    this._themeService.setTheme(theme);
  }

  ngOnDestroy(): void {
    this._destroy$.complete();
    this._destroy$.unsubscribe();
  }
}