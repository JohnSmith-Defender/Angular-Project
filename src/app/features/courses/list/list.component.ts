import { CommonModule, NgOptimizedImage } from "@angular/common";
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
import { CoursesService, TutorsService } from "@features/services";
import { ButtonGroupComponent, PageTitleComponent } from "@share/components";
import { COURSE_IMAGE_URL } from "@lib/api-constants";
import { CourseCardComponent } from "@share/components/card/course/course.component";
import { SearchComponent } from "@share/components/search/search.component";
import { NgxPaginationModule } from "ngx-pagination";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-courses-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonGroupComponent,
    NgOptimizedImage,
    PageTitleComponent,
    CourseCardComponent,
    SearchComponent,
    NgxPaginationModule,
  ],
  templateUrl: "./list.component.html",
})
export class CoursesListComponent {
  private destroy$ = new Subject<void>();

  @Input() parentComponent: any;
  @Input() limit: any;
  @Input() category: any;

  languageChangeSubscription;
  user: any;
  email: any;
  filter: any;
  language: any;
  courseSrc: string = COURSE_IMAGE_URL;
  courses: any;
  filteredcourses: any;
  courseExceptionUser: any;
  companyId: any = 0;
  companies: any;
  pageTitle: any;
  features: any;

  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  userId: any;
  courseSubscriptions: any;
  subfeatures: any;
  hasCoursePayment: boolean = false;
  superAdmin: boolean = false;

  hasCourseCategories: boolean = false;
  courseCategories: any;
  allCourseCategories: any = [];
  filterType: any = "All";
  isloading: boolean = true;
  courseCategoryMapping: any = [];

  isAdvancedCourse: boolean = false;
  skeletonItems: any = [];
  canLockUnlockModules: boolean = false;
  hasCategoryAccess: boolean = false;
  courseCategoriesAccessRoles: any = [];

  company_subfeatures = [];
  subfeature_id_global: number = 0;
  feature_global: string = "";
  hasHotmartIntegration: boolean = false;
  modal: any;
  ipAddress: any;
  showHotmartRibbon: boolean = false;
  domain: any;
  courseTutors: any = [];
  hasCoursePreview: boolean = false;
  hasMembersOnly: boolean = false;
  newLogin: boolean = false;
  hotmartSettings: any;

  isAdmin: boolean = false;
  hasAccessToPreview: boolean = false;
  accessCourses: any = [];
  nonAccessCourses: any = [];
  newSection: any = false;
  filterActive: boolean = false;
  onlyAssignedTutorAccess: boolean = false;
  showSectionTitleDivider: boolean = false;
  showCoursesByAccess: boolean = false;
  sectionOptions: any = [];
  profileHomeContentSetting: any = [];
  showMemberCoursesOnly: boolean = false;
  featureId: any;
  tutorFeatureId: any;
  showBuyCreditsModal: boolean = false;
  selectedCreditpackage: any = 0;
  creditPackages: any = [];
  hasCreditPackageSetting: boolean = false;
  courseCreditSetting: boolean = false;
  hasTutors: boolean = false;
  isMobile: boolean = false;
  coursesFeature: any;
  tutorsFeature: any;
  pageName: any;
  coursesProgress: any;
  pageDescription: any;
  p: any;
  canViewCourse: boolean = false;
  canCreateCourse: boolean = false;
  canManageCourse: boolean = false;
  createHover: boolean = false;
  searchText: any;
  placeholderText: any;
  search: any;
  allCoursesList: any = [];
  userAdditionalProperties: any = [];
  isUESchoolOfLife: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _coursesService: CoursesService,
    private _tutorsService: TutorsService
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
    this.skeletonItems = ["a", "b", "c"];
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
    this.fetchCourses();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchCourses() {
    this._coursesService
      .fetchCoursesCombined(this.companyId, this.userId, this.isUESchoolOfLife, this.category)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(
            data?.settings?.subfeatures,
            data?.categories,
            data?.hotmart_settings
          );
          this.mapUserPermissions(data?.user_permissions);
          this.userAdditionalProperties = data?.users_additional_properties;
          this.coursesProgress = data?.courses_progress || [];
          this.allCoursesList = data?.courses;
          
          if(data?.courses?.length > 0) {
            this.getCoursesData(data?.courses);
          } else {
            this.formatCourses(data?.courses);
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.coursesFeature = features?.find((f) => f.feature_id == 11);
    this.featureId = this.coursesFeature?.id;
    this.pageName = this.isUESchoolOfLife && this.category == 'nivelacion' ? this._translateService.instant('landing.solcourses') : 
      (this.getFeatureTitle(this.coursesFeature) + (this.isUESchoolOfLife ? ' de School of Life' : ''));
    this.pageDescription = this.getFeatureDescription(this.coursesFeature);

    let tutorsFeature = features?.find(
      (f) => f.feature_id == 20 && f.status == 1
    );
    this.tutorFeatureId = tutorsFeature
      ? this.getFeatureTitle(tutorsFeature)
      : "";
    this.hasTutors = tutorsFeature ? true : false;
    if (this.hasTutors) {
      this.getCreditPackages();
    }
  }

  mapSubfeatures(subfeatures, categories, hotmart_settings) {
    if (subfeatures?.length > 0) {
      this.hasCoursePayment = subfeatures.some(
        (a) => a.name_en == "Course fee" && a.active == 1
      );
      this.hasCategoryAccess = subfeatures.some(
        (a) => a.name_en == "Category access" && a.active == 1
      );
      this.hasCourseCategories = subfeatures.some(
        (a) => a.name_en == "Categories" && a.active == 1
      );
      this.isAdvancedCourse = subfeatures.some(
        (a) => a.name_en == "Advanced course" && a.active == 1
      );
      this.hasHotmartIntegration = subfeatures.some(
        (a) => a.name_en == "Hotmart integration" && a.active == 1
      );
      this.showHotmartRibbon = subfeatures.some(
        (a) => a.name_en == "Hotmart ribbon" && a.active == 1
      );
      this.hasCoursePreview = subfeatures.some(
        (a) => a.name_en == "Course preview page" && a.active == 1
      );
      this.hasMembersOnly = subfeatures.some(
        (a) => a.name_en == "Members only" && a.active == 1
      );
      this.filterActive = subfeatures.some(
        (a) => a.name_en == "Filter" && a.active == 1
      );
      this.onlyAssignedTutorAccess = subfeatures.some(
        (a) => a.name_en == "Tutors assigned to courses" && a.active == 1
      );
      this.showCoursesByAccess = subfeatures.some(
        (a) => a.name_en == "Show Courses" && a.active == 1
      );
      this.newSection = subfeatures.some(
        (a) => a.name_en == "More Training" && a.active == 1
      );
      this.courseCreditSetting = subfeatures.some(
        (a) => a.name_en == "Credits" && a.active == 1
      );
      this.hasCreditPackageSetting = subfeatures.some(
        (a) => a.name_en == "Credit Packages" && a.active == 1
      );
    }

    if (this.hasCourseCategories) {
      this.courseCategories = categories;
    }
    if (this.hasHotmartIntegration) {
      this.hotmartSettings = hotmart_settings;
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canViewCourse = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 11
    )
      ? true
      : false;
    this.canCreateCourse =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 11
      );
    this.canManageCourse = user_permissions?.member_type_permissions?.find(
      (f) => f.manage == 1 && f.feature_id == 11
    )
      ? true
      : false;
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
        : this.language == "it"
        ? feature.description_it || feature.description_es
        : feature.description_es
      : "";
  }

  getCourseTitle(course) {
    let title = this.language == "en"
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

    if(!title) {
      title = course?.title || course?.title_en || course?.title_fr || course?.title_eu || course?.title_ca || course?.title_de
    }
    return title
  }

  getCreditPackages() {
    this._tutorsService
      .getCreditPackages(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          if (response?.credit_packages) {
            this.creditPackages = response.credit_packages?.filter((cp) => {
              return cp.status == 1;
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getUserProgress(course) {
    let progress = 0;
    let user_course = this.coursesProgress?.find(
      (cp) => cp.user_id == this.userId && cp.course_id == course.id
    );
    if (user_course) {
      progress = user_course.progress;
    }
    return progress;
  }

  getCoursesData(courses_list) {
    this._coursesService.getCombinedCoursesPrefetch(this.companyId, this.userId).subscribe(data => {
      this.courseSubscriptions = data[0] ? data[0]['course_subscriptions'] : []
      this.courseTutors = data[1] ? data[1]['course_tutors'] : []
      this.courseCategoriesAccessRoles = data[2] ? data[2]['roles'] : []
      this.courseCategoryMapping = data[3] ? data[3]['CompanyCourseCategoryMapping'] : []
      this.user = data[4] ? data[4]['CompanyUser'] : []
      this.allCourseCategories = data[5] ? data[5]['CompanySupercategory'] : []
      this.courseExceptionUser = data[6] ? data[6]['company_course_exception_user'] : []
      let roles = data[7] ? data[7]['role'] : []
      this.superAdmin = roles && roles.some(a => a.role == 'Super Admin')
      this.isAdmin = roles && roles.some(a => a.role == 'Super Admin' || a.role == 'Admin 1' || a.role == 'Admin 2')
      let subfeatures = data[8] ? data[8]['subfeatures'] : []
      let tutorSubfeatures = data[9] ? data[9]['subfeatures'] : []
      this.mapTutorSubfeatures(tutorSubfeatures)
      this.filterCourses(courses_list);
    }, error => {
      
    })
  }

  async mapTutorSubfeatures(subfeatures) {
    this.showMemberCoursesOnly = this.companyId == 52 ? true : false;
  }

  filterCourses(courses_list) {
    let courses = this.initialFilter(courses_list);

    let all_courses: any[] = []
    let courseIdArray: any[] = []
    if(courses?.length > 0) {
      let tutor = this.courseTutors?.filter(ct => {
        return ct.id == this.userId
      })
      courses?.forEach(course => {
        let show_buy_now = true
        let user_subscribed = false
        if(this.hasCoursePayment ||  course.price > 0) {
          let course_subscription = this.courseSubscriptions && this.courseSubscriptions.filter(c => {
            return c.user_id == this.userId && c.course_id == course.id
          })
          if(course_subscription && course_subscription[0]) {
            show_buy_now = false
            user_subscribed = true
            courseIdArray.push(course.id) 
          }
        } else {
          let course_subscription = this.courseSubscriptions?.find((c) => c.user_id == this.userId && c.course_id == course.id);
          if(course_subscription) {
            user_subscribed = true
          }
          show_buy_now = false
        }

        let isTutor = this.courseTutors && this.courseTutors.some(a => a.id == this.userId)
        if(isTutor && this.onlyAssignedTutorAccess && !(this.superAdmin || this.isAdmin)) {
            let course_tutors_id = course?.tutor_ids ? course.tutor_ids : []
            let course_access = false
            if(course_tutors_id?.length > 0){
              course_tutors_id.forEach((id => {
                if(id == tutor[0].tutor_id){
                  course_access = true
                }
              }))
            }
            if(course_access){
              show_buy_now = false
              course.exception_access = 1
            }else{
              course.unassigned_status = 1
            }
            this.courseExceptionUser.forEach(cex => {
              if(this.userId == cex.user_id && cex.exception_access == 1 && course.id == cex.course_id){
                show_buy_now = false
                course.exception_access = 1
                course.unassigned_status = 0
                user_subscribed = true
                user_subscribed = true
              }
            })
        }

        if(show_buy_now) {
          let isTutor = this.courseTutors && this.courseTutors.some(a => a.id == this.userId)
          if(isTutor) {
            show_buy_now = false
          }
        } else {
          if(!this.isAdmin && !this.superAdmin && !user_subscribed) {
            let include
            let is_category_exist = this.courseCategoryMapping && this.courseCategoryMapping.filter((f)=>f.course_id==course.id)
            if(is_category_exist?.length > 0) {
              this.allCourseCategories.forEach(cc => {
                let has_access = false
                if(this.courseCategoriesAccessRoles) {
                  let user_type_roles = this.courseCategoriesAccessRoles.filter(r => {
                    return r.role_id == this.user?.custom_member_type_id
                  })
                  if(user_type_roles) {
                    user_type_roles.forEach(utr => {
                      if(utr.category_id == cc.id) {
                        has_access = true
                      }
                    })
                  }
                }

                let match = this.courseCategoryMapping.some(a => a.category_id == cc.id && a.course_id == course.id)

                if(match && has_access) {
                  include = true
                }
              })
            } else{
              include = true                
            }
            show_buy_now = !include
            if(include){
              courseIdArray.push(course.id)  
            }
          }
        }

        var plainDescription = course.description ? course.description.replace(/<[^>]*>/g, '') : '';
        var plainDescriptionEn = course.description_en ? course.description_en.replace(/<[^>]*>/g, '') : '';
        var plainDescriptionFr = course.description_fr ? course.description_fr.replace(/<[^>]*>/g, '') : '';
        var plainDescriptionEu = course.description_eu ? course.description_eu.replace(/<[^>]*>/g, '') : '';
        var plainDescriptionCa = course.description_ca ? course.description_ca.replace(/<[^>]*>/g, '') : '';
        var plainDescriptionDe = course.description_de ? course.description_de.replace(/<[^>]*>/g, '') : '';
        var plainDescriptionIt = course.description_it ? course.description_it.replace(/<[^>]*>/g, '') : '';

        if(this.superAdmin || this.isAdmin){
          course.locked = 0
          course.exception_access = 1
          course.unassigned_status = 0
          if(show_buy_now){
            show_buy_now = false
          }
        }
        all_courses.push({
          "id": course.id,
          "title": course.title,
          "title_en": course.title_en,
          "title_fr": course.title_fr,
          "title_eu": course.title_eu,
          "title_ca": course.title_ca,
          "title_de": course.title_de,
          "title_it": course.title_it,
          "description": plainDescription,
          "description_en": plainDescriptionEn,
          "description_fr": plainDescriptionFr,
          "description_eu": plainDescriptionEu,
          "description_ca": plainDescriptionCa,
          "description_de": plainDescriptionDe,
          "description_it": plainDescriptionIt,
          "date": course.date,
          "month_name": course.month_name,
          "image": course.image,
          "points": course.points,
          "user_points": course.user_points,
          "created_by": course.created_by,
          "created_at": course.created_at,
          "course_users": course.course_users,
          "price": course.price,
          "product_id": course.product_id,
          "plan_id": course.plan_id,
          "payment_type": course.payment_type,
          "show_buy_now": course?.exclude ? true : show_buy_now,
          "difficulty": course.difficulty,
          "difficulty_en": course.difficulty_en,
          "difficulty_es": course.difficulty_es,
          "difficulty_fr": course.difficulty_fr,
          "difficulty_eu": course.difficulty_eu,
          "difficulty_ca": course.difficulty_ca,
          "difficulty_de": course.difficulty_de,
          "difficulty_it": course.difficulty_it,
          "duration": course.duration,
          "duration_unit": course.duration_unit,
          "duration_unit_en": course.duration_unit_en,
          "duration_unit_es": course.duration_unit_es,
          "duration_unit_fr": course.duration_unit_fr,
          "duration_unit_eu": course.duration_unit_eu,
          "duration_unit_ca": course.duration_unit_ca,
          "duration_unit_de": course.duration_unit_de,
          "duration_unit_it": course.duration_unit_it,
          "course_participants": course.course_participants,
          "course_quiz": course.course_quiz,
          "hotmart_product_id": course.hotmart_product_id,
          "hotmart_product_ucode": course.hotmart_product_ucode,
          "hotmart_product_photo": course.hotmart_product_photo,
          "hotmart_reference": course.hotmart_reference,
          "hotmart_seller_id": course.hotmart_seller_id,
          "hotmart_affiliation_id": course.hotmart_affiliation_id,
          "hotmart_show": course.hotmart_show,
          "hotmart_currency": course.hotmart_currency,
          "payment_method": course.payment_method,
          "video_cover": course.video_cover,
          "status": course.status,
          "group_id": course.group_id,
          "locked": course.locked,
          "button_color": course.button_color || this.buttonColor,
          "cta_status": course.cta_status,
          "cta_text": course.cta_text,
          "cta_link": course.cta_link,
          "buy_now_status": course.buy_now_status,
          "exception_access": course.exception_access == 1 ? 1 : 0,
          "unassigned_status": course.unassigned_status == 1 ? 1 : 0,
          "course_categories": course.course_categories,
          "buy_now_button_color": course.buy_now_button_color,
          "course_intro": course.course_intro,
        })
      });
    }

    if((this.showCoursesByAccess || this.showMemberCoursesOnly)  && !this.superAdmin){
      all_courses = all_courses.filter((ac: any) => {
        let include = courseIdArray.indexOf(ac.id) != -1
        
        if(!include && this.showMemberCoursesOnly) {
          this.courseExceptionUser?.forEach(ceu => {
            if(ceu.course_id == ac.id && ceu.exception_access == 1){
              include = true
            }
          })
        }
        return include
      })
    }

    this.courses = all_courses
    this.filteredcourses = this.courses
    this.filteredcourses = this.filteredcourses.sort((a, b) => {
      return b.id - a.id
    })
    if(this.hasCategoryAccess) {
      this.showCoursesWithAccess();
    } else {
      if(this.hasHotmartIntegration) {
        this.filteredcourses = this.filteredcourses && this.filteredcourses.filter(c => {
          return !c.hotmart_product_id || (this.hasHotmartIntegration && c.hotmart_product_id && c.hotmart_show == 1 && this.hotmartSettings.show == 1)
        })
      }

      this.formatCourses(this.filteredcourses);
    }
  }

  initialFilter(courses_list) {
    courses_list?.forEach(course => {
      let include = false

      let active = course?.status == 1 ? true : false

      if(this.companyId == 32 && !this.superAdmin) {
        if(course?.additional_properties_course_access == 1) {
          let match_campus = false
          if(course?.additional_properties_campus_ids) {
            let course_campus = course?.additional_properties_campus_ids?.split(',');
            let user_campus_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'campus' && c.value == this.user?.campus
            })
            let user_campus = user_campus_row?.length > 0 ? user_campus_row[0].id : 0
            match_campus = course_campus?.some((a) => a == user_campus);
          } else {
            match_campus = true;
          }

          let match_faculty = false;
          if(course?.additional_properties_faculty_ids) {
            let course_faculty = course?.additional_properties_faculty_ids?.split(',');
            let user_faculty_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'faculty' && c.value == this.user?.faculty
            })
            let user_faculty = user_faculty_row?.length > 0 ? user_faculty_row[0].id : 0
            match_faculty = course_faculty?.some((a) => a == user_faculty);
          } else {
            match_faculty = true;
          }

          let match_business_unit = false;
          if(course?.additional_properties_business_unit_ids) {
            let course_business_unit = course?.additional_properties_business_unit_ids?.split(',');
            let user_business_unit_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'bussines_unit' && c.value == this.user?.bussines_unit
            })
            let user_business_unit = user_business_unit_row?.length > 0 ? user_business_unit_row[0].id : 0
            match_business_unit = course_business_unit?.some((a) => a == user_business_unit);
          } else {
            match_business_unit = true;
          }

          let match_type = false;
          if(course?.additional_properties_type_ids) {
            let course_type = course?.additional_properties_type_ids?.split(',');
            let user_type_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'type' && c.value == this.user?.type
            })
            let user_type = user_type_row?.length > 0 ? user_type_row[0].id : 0
            match_type= course_type?.some((a) => a == user_type);
          } else {
            match_type = true;
          }

          let match_segment = false;
          if(course?.additional_properties_segment_ids) {
            let course_segment = course?.additional_properties_segment_ids?.split(',');
            let user_segment_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'segment' && c.value == this.user?.segment
            })
            let user_segment = user_segment_row?.length > 0 ? user_segment_row[0].id : 0
            match_segment = course_segment?.some((a) => a == user_segment);
          } else {
            match_segment = true;
          }

          let match_branding = false;
          if(course?.additional_properties_branding_ids) {
            let course_branding = course?.additional_properties_branding_ids?.split(',');
            let user_branding_row = this.userAdditionalProperties?.filter(c => {
              return c.type == 'branding' && c.value == this.user?.branding
            })
            let user_branding = user_branding_row?.length > 0 ? user_branding_row[0].id : 0
            match_branding = course_branding?.some((a) => a == user_branding);
          } else {
            match_branding = true;
          }

          include = (match_campus && match_faculty && match_business_unit && match_type && match_segment && match_branding) ? true : false;
        } else {
          include = true;
        }
      } else {
        include = true;
      }
      
      let exclude = active && include ? false : true;
      course['exclude'] = exclude;
    })

    return courses_list;
  }

  async showCoursesWithAccess() {
    if(!this.isAdmin && !this.superAdmin){
      this.filteredcourses = this.filteredcourses && this.filteredcourses.map(c => {
        if(this.allCourseCategories){
          let is_category_exist = this.courseCategoryMapping.filter((f)=>f.course_id==c.id)
          if(is_category_exist.length > 0) {
            let include = false;
            this.allCourseCategories.forEach(cc => {
              let has_access = false
              if(this.courseCategoriesAccessRoles) {
                let user_type_roles = this.courseCategoriesAccessRoles.filter(r => {
                  return r.role_id == this.user.custom_member_type_id
                })
                if(user_type_roles) {
                  user_type_roles.forEach(utr => {
                    if(utr.category_id == cc.id) {
                      has_access = true
                    }
                  })
                }
              }
  
              let match = this.courseCategoryMapping.some(a => a.category_id == cc.id && a.course_id == c.id)
              if(match && has_access) {
                include = true
              }
            })
            this.courseExceptionUser?.forEach(ceu => {
              if(ceu.course_id == c.id && ceu.exception_access == 1){
                include = true
              }
            })
            if(include){
              return c;
            } else {
              if(c.price == 0) {
                return {...c, locked: 1}
              }else {
                return c
              }
            }
          } else {
            return c
          }
        } else {
          return c
        }
      })
    }

    if(this.hasHotmartIntegration) {
      this.filteredcourses = this.filteredcourses && this.filteredcourses.filter(c => {
        return !c.hotmart_product_id || (this.hasHotmartIntegration && c.hotmart_product_id && c.hotmart_show == 1 && this.hotmartSettings?.show == 1)
      })
    }

    this.formatCourses(this.filteredcourses);
  }

  formatCourses(courses) {
    this.courses = courses?.map((course) => {
      let progress = this.getUserProgress(course);
      let category_texts = this.getCategoriesDisplay(course);
      let button_text = this.getButtonText(course, progress);
      let show_details = true
      if(button_text == `${this._translateService.instant("courses.begin")} ${this._translateService.instant("invite.here")}` ||
        button_text == this._translateService.instant("courses.continue")) {
      } else {
        show_details = false
      }
      let buy_now_shown = false
      if(button_text == this._translateService.instant("courses.buynow")) {
        buy_now_shown = true
      }
      return {
        ...course,
        path: `/courses/details/${course.id}`,
        title_language: this.getCourseTitle(course),
        progress: progress,
        button_text,
        show_details,
        buy_now_shown,
        assigned_button_color: (buy_now_shown ? course?.buy_now_button_color : course?.button_color) || this.buttonColor,
        image: `${COURSE_IMAGE_URL}/${course.image}`,
        category: category_texts?.map((data) => { return data.label }).join(', '),
        cta_path: course.cta_status == 1 && course.cta_link ? course.cta_link : '',
      };
    });

    if(this.newSection) {
      this.accessCourses = this.courses?.filter(c => {
        return (!c?.locked || c?.locked != 1) && this.hasCourseStarted(c) && (!c?.show_buy_now || c.exception_access == 1)
      })
  
      if(this.accessCourses?.length > 0) {
        this.accessCourses.sort((a, b) => {
          a = new Date(a.created_at);
          b = new Date(b.created_at);
    
          return a - b;
        })
    
        this.accessCourses.sort((a, b) => {
          a = new Date(a.date);
          b = new Date(b.date);
    
          return a - b;
        })
      }
      
      this.nonAccessCourses = this.courses?.filter(c => {
        return !this.accessCourses.some(a => a.id == c.id)
      })
  
      if(this.nonAccessCourses?.length > 0) {
        this.nonAccessCourses.sort((a, b) => {
          a = new Date(a.created_at);
          b = new Date(b.created_at);
    
          return a - b;
        })
        this.nonAccessCourses.sort((a, b) => {
          a = new Date(a.date);
          b = new Date(b.date);
    
          return a - b;
        })
      }
    }
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

  getButtonText(course, progress: number = 0) {
    let text = "";

    if (
      (((course?.locked == 1 && this.hasCourseStarted(course)) ||
        (course?.buy_now_status == 0 && this.hasCourseStarted(course)) ||
        (!this.hasCourseStarted(course) && course?.show_buy_now)) &&
        course?.show_buy_now &&
        course?.cta_status != 1) ||
      course.unassigned_status == 1
    ) {
      text = this._translateService.instant("courses.blocked");
    }

    if (
      (!course?.locked || course?.locked != 1) &&
      this.hasCourseStarted(course) &&
      course?.show_buy_now &&
      course?.buy_now_status == 1
    ) {
      text =
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
      text = `${this._translateService.instant("courses.startson")} ${moment(
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
      text = course.cta_text;
    }

    if (
      ((!course?.locked || course?.locked != 1) &&
        this.hasCourseStarted(course) &&
        !course?.show_buy_now) ||
      ((course.exception_access == 1 || this.superAdmin) &&
        this.hasCourseStarted(course))
    ) {
      text = this.userId
        ? progress == 0
          ? `${this._translateService.instant(
              "courses.begin"
            )} ${this._translateService.instant("invite.here")}`
          : this._translateService.instant("courses.continue")
        : this._translateService.instant("courses.logintoaccess");
    }

    if(!text && course?.locked == 1) {
      text = this._translateService.instant("courses.blocked");
    }

    return text;
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

  handleCreateRoute() {
    let url = `/courses/create/0`;
    url += this.isUESchoolOfLife && this.category == 'nivelacion' ? `/nivelacion` : '';
    this._router.navigate([url]);
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  handleSearchChanged(event) {
    this.search = event || "";
    
    if(this.search) {
      let courses_list = this.allCoursesList?.filter(course => {
        let include = false;

        if (
          (course?.title && ((course?.title).normalize("NFD").replace(/\p{Diacritic}/gu, "")).toLowerCase().indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (course?.title_en && ((course?.title_en.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (course?.title_fr && ((course?.title_fr.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (course?.title_eu && ((course?.title_eu.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (course?.title_ca && ((course?.title_ca.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (course?.title_de && ((course?.title_de.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (course?.title_it && ((course?.title_it.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          ) {
          include = true
        }

        return include;
      })
      this.filterCourses(courses_list)
    } else {
      this.filterCourses(this.allCoursesList)
    }
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}