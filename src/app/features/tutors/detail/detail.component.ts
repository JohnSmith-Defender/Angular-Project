import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { TutorsService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { TutorCardComponent } from "@share/components/card/tutor/tutor.component";
import { CalendlyComponent } from "../calendly/calendly.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { initFlowbite } from 'flowbite';
import get from "lodash/get";
import { checkIfValidCalendlyAccount } from "src/app/utils/calendly/helper";

@Component({
  selector: 'app-tutors-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
    TutorCardComponent,
    CalendlyComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './detail.component.html'
})
export class TutorDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  emailDomain;
  user;
  canCreate: boolean = false;
  language: any;
  userId: any;
  companyId: any;
  pageName: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  superAdmin: boolean = false;
  company: any;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  tutorData: any;
  tutor: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  featureId: any;
  courseFeatureId: any;
  tutorsFeature: any;
  coursesFeature: any;
  editHover: boolean = false;
  deactivateHover: boolean = false;
  courseUnits: any = [];
  tutorImage: any;
  tutorRating: any;
  tutorTypes: any;
  types: any;
  showCalendarSection: boolean = false;
  tutorTypeTags: any = [];
  hasDifferentStripeAccount: boolean = false;
  hasMultipleStripeAccountSetting: boolean = false;
  accountIds: any = [];
  showCalendly: boolean = false;
  showTutorTypes: boolean = false;
  hasStudentHours: boolean = false;
  showTutorCategories: boolean = false;
  hideCoursePackage: boolean = false;
  hasFreeBooking: boolean = false;
  courseCreditSetting: boolean = false;
  hasCreditPackageSetting: boolean = false;
  separateCourseCredits: number = 0;
  hasCategoryAccess: boolean = false;
  showCoursesByAccess: boolean = false;
  hasCoursePayment: boolean = false;
  selectedTutorCategory: any = [];
  companyCourseTutor: any = [];
  tutorCalendlySettings: any = [];
  tutorCalendlyUrl: any = [];
  tutorCalendlyUrlFixed: any = [];
  allCoursePackages: any = [];
  courses: any = [];
  courseSubscriptions: any = [];
  userCourseCredits: any = [];
  courseCategoryMapping: any = [];
  allCourseCategories: any = [];
  courseCategoriesAccessRoles: any = [];
  userCourses: any = [];
  courseExceptionUser: any = [];
  workingCourses: any = [];
  selectedTutorType: any;
  selectedTutorTypes: any = [];
  selectedWorkingCourse: any;
  selectedWorkingCourses: any = [];
  separateRemainingCourseCredits: number = 0;
  selectedWorkingPackages: any = [];
  packages: any = [];
  workingPackages: any = [];
  firstReload: boolean = true;
  selectedWorkingPackage: any;
  me: any;
  remainingCourseCredits: any = 0;
  creditsPercentage: any;
  selectedCalendlyPackage: any = '';
  calendlyEventLinkRoute: any = '';
  apiPath: string = environment.api + "/";
  setupCalendlyForm: FormGroup = new FormGroup({
    'link': new FormControl("", [Validators.required]),
    'personal_access_token': new FormControl('', [Validators.required])
  });
  setupCalendlyFormSubmitted: boolean = false;
  questionForm: any;
  questionFormSubmitted: boolean = false;
  message: any = '';
  dialogMode: string = "";
  dialogTitle: any;
  errorMessage: string = '';
  processing: boolean = false;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  isTutorUser: boolean = false;
  superTutor: boolean = false;
  customMemberTypes: any = [];
  isAdminRole: boolean = false;
  tutorPersonalAccessToken: any;
  allTutorTypes: any = [];
  isValidCalenldyAccount : boolean = true;
  tutorAccountIds:any=[];
  tutorStripeConnect : any = true;
  hasCheckedCalendly: boolean = false;
  tutorCardSmallImage: boolean = false;
  showImageLoadingAnimation: boolean = false;
  tutorTypesDisplay: any;

  constructor(
    private _router: Router,
    private _tutorsService: TutorsService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
    this._translateService.use(this.language || "es");

    this.emailDomain = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
      this.emailDomain = company[0].domain;
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

    this.getTutor();
  }

  getTutor() {
    this._tutorsService
      .fetchTutor(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.tutorData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.tutorData;
    this.user = data?.user_permissions?.user;
    this.tutorTypes = data?.tutor_types;
    this.checkTutorRole(data?.tutors || []);
    this.getMemberType(data?.member_types || []);
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data);
    this.mapUserPermissions(data?.user_permissions);
    this.tutorAccountIds = data?.tutor_account_ids
    this.formatTutor(data);
    this.initializeBreadcrumb(data);
  }

  checkTutorRole(tutors) {
    if(tutors?.length > 0) {
        this.isTutorUser = tutors?.some(a => a.user_id == this.userId)
        let super_tutor = tutors?.filter(tutor => {
            return tutor?.user_id == this.userId && tutor?.super_tutor == 1
        })
        this.superTutor = super_tutor?.length > 0 ? true : false
    }
  }

  getMemberType(member_types) {
    this.customMemberTypes = member_types;
    let admin = this.customMemberTypes.find((f) => f.type?.indexOf('Admin') >= 0 && this.user.custom_member_type_id == f.id)
    this.isAdminRole = admin?.id > 0 ? true : false
  }

  mapFeatures(features) {
    this.tutorsFeature = features?.find((f) => f.feature_id == 20);
    this.coursesFeature = features?.find((f) => f.feature_id == 11);
    this.featureId = this.tutorsFeature?.feature_id;
    this.courseFeatureId = this.coursesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.tutorsFeature);
  }

  mapSubfeatures(data) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.showCalendly = subfeatures.some(a => a.name_en == 'Calendly' && a.active == 1 && a.feature_id == 20)
      this.showTutorTypes = subfeatures.some(a => a.name_en == 'Tutor types' && a.active == 1 && a.feature_id == 20)
      this.hasStudentHours = subfeatures.some(a => a.name_en == 'Student hours' && a.active == 1 && a.feature_id == 20)
      this.showTutorCategories = subfeatures.some(a => a.name_en == 'Show Tutor Category' && a.active == 1 && a.feature_id == 20)
      this.hideCoursePackage = subfeatures.some(a => a.name_en == 'Hide course and package' && a.active == 1 && a.feature_id == 20)
      this.hasFreeBooking = subfeatures.some(a => a.name_en == 'Free Calendly Scheduling' && a.active == 1 && a.feature_id == 20)
      this.courseCreditSetting = subfeatures.some(a => a.name_en == 'Credits' && a.active == 1 && a.feature_id == 20)
      this.hasCreditPackageSetting = subfeatures.some(a => a.name_en == 'Credit Packages' && a.active == 1 && a.feature_id == 20)
      this.separateCourseCredits = subfeatures.some(a => a.name_en == 'Separate credits by course' && a.active == 1 && a.feature_id == 20)
      this.tutorCardSmallImage = subfeatures.some(a => a.name_en == 'Tutor card (small image)' && a.active == 1 && a.feature_id == 20)
      if(!this.tutorCardSmallImage) { this.showImageLoadingAnimation = true; }

      this.hasCategoryAccess = subfeatures.some(a => a.name_en == 'Category access' && a.active == 1 && a.feature_id == 11)
      this.showCoursesByAccess = subfeatures.some(a => a.name_en == 'Show Courses' && a.active == 1 && a.feature_id == 11)
      this.hasCoursePayment = subfeatures.some(a => a.name_en == 'Course fee' && a.active == 1 && a.feature_id == 11)
      this.hasDifferentStripeAccount = subfeatures.some(a => a.name_en == 'Different Stripe accounts' && a.active == 1 && a.feature_id == 11)
      if(!this.hasMultipleStripeAccountSetting) { this.hasDifferentStripeAccount = false }
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 20
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

 async formatTutor(data) {
    this.tutor = data?.tutor;
    if(!data?.tutor?.id) {
      let tutor_row = data?.tutors?.filter(t => {
        return t.id == this.id
      })
      if(tutor_row?.length > 0) {
        this.tutor = tutor_row[0];
      }
    }
    this.tutorImage = `${environment.api}/${this.tutor?.image}`;
    this.tutorRating = this.getTutorRating(this.tutor);
    this.allTutorTypes = data?.all_tutor_types;
    this.types = this.getTutorTypes(this.tutor);
    this.tutorTypesDisplay = this.getTutorTypesDisplay(this.tutor);
    this.accountIds = data?.tutor_account_ids;
    this.me = data?.user;

    this.companyCourseTutor = data?.course_tutor;
    this.tutorCalendlySettings = data?.tutor_calendly_setting;
    this.allCoursePackages = data?.company_course_packages;
    this.tutorCalendlyUrl = this.tutor?.calendly_url;
    this.tutorCalendlyUrlFixed = this.tutor?.calendly_url;
    this.tutorPersonalAccessToken = this.tutor?.personal_access_token;

    this.packages = data?.packages;
    let tutorCategory = data?.tutor_types;
    this.tutorTypeTags = data?.tutor_type_tags?.length > 0 ? data?.tutor_type_tags : [];
    if(tutorCategory?.length > 0 && !this.showTutorCategories){
      let tc_type_id: any[] = []
      tutorCategory.forEach(tc => {
        let tc_type = tc['tutorTypes']
        if(tc_type_id.indexOf(tc_type['id']) == -1){
          this.selectedTutorCategory.push(tc_type)
          tc_type_id.push(tc_type['id'])
        }
      })
    }
    if(this.tutorTypeTags?.length > 0 && this.showTutorCategories){
      this.tutorTypes?.forEach(tt => {
          this.tutorTypeTags?.forEach(ttt => {
            if(ttt.type_id == tt.id){
                this.selectedTutorCategory.push(tt)
              }
          })
      })
    }

    if(this.courseCreditSetting) {
      let courseCredits = this.me?.course_credits ? this.me.course_credits : 0
      if(courseCredits) {
        this.remainingCourseCredits = this.me?.remaining_course_credits ? this.me.remaining_course_credits : 0                    
        this.creditsPercentage = (this.remainingCourseCredits/courseCredits)*100
      }
    }

    this.courses = data?.courses;

    this.courseSubscriptions = data?.course_subscriptions;
    this.userCourseCredits = data?.user_course_credits;
    this.courseCategoryMapping = data?.course_category_mapping;
    this.allCourseCategories = data?.course_categories;
    this.courseCategoriesAccessRoles = data?.course_category_access_roles;
    this.courseExceptionUser = data?.company_course_exception_user;

    const eventObj = await checkIfValidCalendlyAccount(this.tutorPersonalAccessToken,this.tutorCalendlyUrl)
    
    if(eventObj?.isValidToken && eventObj?.isValidURL){
      this.isValidCalenldyAccount = true
    }else{
      this.isValidCalenldyAccount = false
    }
    this.hasCheckedCalendly = true;
    this.getCompanyCourses();
  }

  getCompanyCourses() {
    this.courses = this.courses?.filter(cu => {
        let include = false;
        let tutor_ids = cu.course_tutors?.filter(ct => {
          return ct.course_id == cu.id
        })
        tutor_ids?.forEach(tid => {
          let tutor_id = this.tutor?.id ? this.tutor.id : 0;
          if(tid?.tutor_id == tutor_id){
            include = true
          }
        })
        if(cu.unassigned_status == 0){
          include = true
        }
        if(include){
          return cu
        }
    })

    this.getUserCourses();

    if(this.showTutorCategories || this.hideCoursePackage) {
        this.preLoadCalendly();
    }

    setTimeout(() => {
      this.learnMore();
    }, 1000)
  }

  getUserCourses() {
    let courses = this.courses;

    let all_courses: any[] = []
    let courseIdArray: any[] = []
    if(courses) {
      courses.forEach(course => {
        let show_buy_now = true
        if(this.hasCoursePayment && course.price > 0) {
            let course_subscription
            if(this.courseSubscriptions?.length > 0) {
                course_subscription = this.courseSubscriptions && this.courseSubscriptions.filter(c => {
                    return c.user_id == this.userId && c.course_id == course.id
                })
                
            } else {
                if(this.userCourseCredits?.length > 0) {
                    course_subscription = this.userCourseCredits?.filter(ucc => {
                        return ucc.course_id == course.id
                    })
                }
            }
            if(course_subscription?.length > 0) {
                show_buy_now = false
            }
        } else {
            show_buy_now = false
        }

        if(!show_buy_now) {
            let include
            let is_category_exist = this.courseCategoryMapping && this.courseCategoryMapping.filter((f)=>f.course_id==course.id)
            if(is_category_exist.length > 0) {
                this.allCourseCategories.forEach(cc => {
                    let has_access = false
                    if(this.courseCategoriesAccessRoles) {
                        let user_type_roles = this.courseCategoriesAccessRoles.filter(r => {
                            return r.role_id == this.me?.custom_member_type_id
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
                courseIdArray.push(course?.id)  
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
          "date": course.date,
          "image": course.image,
          "created_by": course.created_by,
          "created_at": course.created_at,
          "course_users": course.course_users,
          "price": course.price,
          "product_id": course.product_id,
          "plan_id": course.plan_id,
          "payment_type": course.payment_type,
          "show_buy_now": show_buy_now,
          "payment_method": course.payment_method,
          "video_cover": course.video_cover,
          "status": course.status,
          "group_id": course.group_id,
          "locked": course.locked,
          "button_color": course.button_color,
          "cta_status": course.cta_status,
          "cta_text": course.cta_text,
          "cta_link": course.cta_link,
          "buy_now_status": course.buy_now_status,
          "exception_access": course.exception_access == 1 ? 1 : 0,
          "unassigned_status": course.unassigned_status == 1 ? 1 : 0
        })
      });
    }

    if(this.showCoursesByAccess){
      all_courses = all_courses.filter((ac) => {
        let include = courseIdArray.indexOf(ac.id) != -1
        
        if(!include) {
          this.courseExceptionUser?.forEach(ceu => {
            if(ceu.course_id == ac.id && ceu.exception_access == 1){
              include = true
            }
          })
        }
        return include
      })
    }

    this.userCourses = all_courses
    this.userCourses = this.userCourses.sort((a, b) => {
      return b.id - a.id
    })

    if(this.hasCategoryAccess) {
      this.showCoursesWithAccess()
    }
  }

  async showCoursesWithAccess() {
    this.userCourses = this.userCourses && this.userCourses.map(c => {
        if(this.allCourseCategories){
            let is_category_exist = this.courseCategoryMapping.filter((f)=>f.course_id==c.id)
            if(is_category_exist.length > 0) {
            let include = false;
            this.allCourseCategories.forEach(cc => {
                let has_access = false
                if(this.courseCategoriesAccessRoles) {
                let user_type_roles = this.courseCategoriesAccessRoles.filter(r => {
                    return r.role_id == this.me.custom_member_type_id
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

  selectTutorType(type) {
    this.selectedTutorType = type || ''
    if(!this.hideCoursePackage){
    if(this.hasSelectedTutorType(type)) {
        this.selectedTutorTypes && this.selectedTutorTypes.forEach((typ , index)=> {
            if(typ.id == type.id) {
              this.selectedTutorTypes.splice(index, 1)
            }
        });
        
        this.selectedWorkingCourses?.length > 0 && this.selectedWorkingCourses.forEach((typ , index)=> {
            this.workingCourses.forEach(wc => {
                if(typ.id == wc.id) {
                    this.selectedWorkingCourses.splice(index, 1)
                }
            })
        });

        this.selectedWorkingPackages?.length > 0 && this.selectedWorkingPackages.forEach((typ , index)=> {
            this.workingPackages.forEach(wp => {
                if(typ.id == wp.id) {
                    this.tutorCalendlyUrl = this.tutorCalendlyUrlFixed
                    this.selectedWorkingPackages.splice(index, 1)
                }
            })
        });
    } else {
        let match = this.selectedTutorTypes.some(a => a.id === type.id)
        if(!match) {
            this.selectedTutorTypes.push(type)
        }
    }
    var typesArr: any[] = []
    this.selectedTutorTypes.forEach(element => {
      typesArr.push(element.id);
    });
    
    this._tutorsService.getCoursesFromTutorTypes(this.userId ? this.userId : 0, this.companyId, typesArr).subscribe(
        async response => {
            var arr = response.courses
            var stemp = this.courses;
            let type_row = stemp && stemp.filter(att => {
                return arr.includes(att.id)
            })
            this.workingCourses = type_row;
    });
    
    this._localService.setLocalStorage(environment.lstutortypes, this.selectedTutorTypes && this.selectedTutorTypes.length > 0 ? JSON.stringify(this.selectedTutorTypes) : '')
    }
  }

  hasSelectedTutorType(type) {
    let match = false

    if(this.selectedTutorTypes && this.selectedTutorTypes.length > 0) {
        match = this.selectedTutorTypes.some(a => a.id === type.id)
    }
    
    return match
  }

  async preLoadCalendly() {
    let courseIdArray: any[] = []
    this.companyCourseTutor?.forEach(cct => {
        courseIdArray.push(cct.course_id)
    })

    this.workingCourses = this.courses?.filter(c => {
        return courseIdArray.includes(c.id)
    })

    if(this.hideCoursePackage && this.showTutorCategories && this.workingCourses?.length == 0 && this.courses?.length > 0) {
        this.workingCourses.push(this.courses[0])
    }

    let selectedcourse = this.courses[0]
    if(this.workingCourses?.length > 1 && this.userCourses?.length > 0) {
        let course_select = this.courses?.filter(c => {
            return c.id == this.userCourses[0].id
        })
        if(course_select?.length > 0) {
            selectedcourse = course_select[0]
        }
    }
    if(this.courses?.length > 0) {
        // Check if current user is a tutor of course
        let tutorid = this.tutor?.id
        if(tutorid > 0) {
            let courses = this.courses
            let new_courses: any[] = []
            courses.forEach(cu => {
                let include = false;
                cu.tutor_ids?.forEach(tid => {
                    let tutor_id = this.tutor?.id ? this.tutor.id : 0;
                    if(tid == tutor_id){
                        include = true
                    }
                })

                if(include) {
                    new_courses.push(cu)
                }
            })
            if(new_courses?.length > 0) {
                selectedcourse = new_courses[0]
            }
        }
    }
    await this.selectTutorCourse(selectedcourse)
    this._localService.setLocalStorage(environment.lstutortypes, this.selectedTutorTypes && this.selectedTutorTypes.length > 0 ? JSON.stringify(this.selectedTutorTypes) : '')
  }

  selectTutorCourse(course) {
    this.selectedWorkingCourse = course || ''
    this._localService.setLocalStorage("selectedWorkingCourse", this.selectedWorkingCourse ? this.selectedWorkingCourse.id : 0);

    this.getRemainingCourseCredits();

    if(this.hasSelectedCourse(course)) {
        this.selectedWorkingCourses && this.selectedWorkingCourses.forEach((typ , index)=> {
            if(typ.id == course.id) {
                this.selectedWorkingCourses.splice(index, 1)
            }
        });

    } else {
        let match = this.selectedWorkingCourses.some(a => a.id === course.id)
        if(!match) {
            this.selectedWorkingCourses = []
            this.selectedWorkingCourses.push(course)
        }
    }

    this.selectedWorkingPackages?.length > 0 && this.selectedWorkingPackages.forEach((typ , index)=> {
        this.workingPackages.forEach(wp => {
            if(typ.id == wp.id) {
                this.tutorCalendlyUrl = this.tutorCalendlyUrlFixed
                this.selectedWorkingPackages.splice(index, 1)
            }
        })
    });

    var coursesArr: any[] = []
    this.selectedWorkingCourses.forEach(element => {
        coursesArr.push(element?.id);
    });

    let arr: any[] = []
    if(this.allCoursePackages?.length > 0 && coursesArr?.length > 0) {
        this.allCoursePackages.forEach(acp => {
            let include = coursesArr.some(a => a == acp.course_id)
            if(include) {
                let match = arr.some(a => a == acp.package_id)
                if(!match) {
                    arr.push(acp.package_id) 
                }
            }
        })
    }

    var stemp = this.packages;
    let type_row = stemp && stemp.filter(att => {
        return arr.includes(att.id)
    })
    this.workingPackages = type_row;

    if(this.workingPackages?.length > 0 && this.firstReload && (this.showTutorCategories || this.hideCoursePackage)){
        this.firstReload = false
        this.tutorCalendlyUrl = this.tutorCalendlyUrlFixed
        this.selectTutorPackage(this.workingPackages[0])
    }
  }

  selectTutorPackage(pack) {
    this.selectedWorkingPackage = pack || ''
    this._localService.setLocalStorage("selectedWorkingPackage", this.selectedWorkingPackage ? this.selectedWorkingPackage.id : 0);
    this._localService.setLocalStorage("selectedWorkingCourse", this.selectedWorkingCourse ? this.selectedWorkingCourse.id : 0);

    if(this.hasSelectedPackage(pack)) {
        this.tutorCalendlyUrl = this.tutorCalendlyUrlFixed
        this.selectedWorkingPackages && this.selectedWorkingPackages.forEach((typ , index)=> {
            if(typ.id == pack.id) {
                this.selectedWorkingPackages.splice(index, 1)
            }
        });
    } else {
        let tutor_calendly_setting = this.tutorCalendlySettings.filter(tcs => {
            return tcs.pack_id == pack.id
        })
        let event_link_route = tutor_calendly_setting[0]?.event_link_route
        event_link_route = event_link_route?.replace(' ','-')

        if(event_link_route) {
            this.tutorCalendlyUrl = this.tutorCalendlyUrl + '/' + event_link_route
        }
        
        let match = this.selectedWorkingPackages.some(a => a.id === pack.id)
        if(!match) {
            this.selectedWorkingPackages = []
            this.selectedWorkingPackages.push(pack)
        }
    }

    var packagesArr: any[] = []
    this.selectedWorkingPackages.forEach(element => {
        packagesArr.push(element.id);
    });
  }

  hasSelectedPackage(pack) {
    let match = false

    if(this.selectedWorkingPackages && this.selectedWorkingPackages.length > 0) {
        match = this.selectedWorkingPackages.some(a => a.id === pack.id)
    }
    
    return match
  }

  hasSelectedCourse(course) {
    let match = false

    if(this.selectedWorkingCourses && this.selectedWorkingCourses.length > 0) {
        match = this.selectedWorkingCourses.some(a => a.id === course.id)
    }
    
    return match
  }

  getRemainingCourseCredits() {
    if(this.selectedWorkingCourse?.id > 0 && this.userCourseCredits?.length > 0) {
        let selected_user_course = this.userCourseCredits?.filter(uc => {
            return uc.course_id == this.selectedWorkingCourse?.id
        })
        if(selected_user_course?.length > 0) {
            let course = selected_user_course[0];
            if(course) {
                this.separateRemainingCourseCredits = course.remaining_credits || 0;
            }
        }
    }
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
      rating = Math.round((tut_rating/no_of_rating)).toFixed(1);
    }

    return rating
  }

  getTutorTypes(item) {
    let types: any = []
    if(this.tutorTypes?.length > 0){
      types = []
      this.tutorTypes.forEach(tt => {
          let typeTutor = tt.tutorTypes.name_ES
          if(tt.tutor_id == item.id && !(types).includes(typeTutor)){
              (types)?.push(typeTutor)
          }
      })
    }

    if(item?.tutor_type_tags?.length > 0) {
      item?.tutor_type_tags?.forEach(ttt => {
        let typeTutor = ''
        let tt = this.allTutorTypes?.filter(t => {
          return t.id == ttt.type_id
        })
        if(tt?.length > 0) {
          typeTutor = tt[0].name_ES
        }
        if(typeTutor) {
          let match = types?.some(
            (a) => a == typeTutor
          );
          if(!match) {
            (types)?.push(typeTutor)
          }
        }
      })
    }

    return types;
  }

  getTutorTypesDisplay(item) {
    let types: any = []
    if(this.tutorTypesDisplay?.length > 0){
      types = []
      this.tutorTypesDisplay.forEach(tt => {
        let typeTutor = tt.tutorTypes.name_ES
        if(tt.tutor_id == item.id && !(types).includes(typeTutor) && typeTutor != 'Curso Genius' && typeTutor != '30 días 1 idioma') {
          (types)?.push(typeTutor)
        }
      })
    }

    if(item?.tutor_type_tags?.length > 0) {
      item?.tutor_type_tags?.forEach(ttt => {
        let typeTutor = ''
        let tt = this.allTutorTypes?.filter(t => {
          return t.id == ttt.type_id
        })
        if(tt?.length > 0) {
          typeTutor = tt[0].name_ES
        }
        if(typeTutor) {
          let match = types?.some(
            (a) => a == typeTutor
          );
          if(!match && typeTutor != 'Curso Genius' && typeTutor != '30 días 1 idioma') {
            (types)?.push(typeTutor)
          }
        }
      })
    }

    return types;
  }

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = this.tutor?.name;
    this.level3Title = "";
    this.level4Title = "";
  }

  handleEditRoute() {
    this._router.navigate([`/tutors/edit/${this.id}`]);
  }

  toggleEditHover(event) {
    this.editHover = event;
  }

  handleDeactivate() {
    if (this.id) {
      this.showConfirmationModal = false;
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmupdate"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmupdateitem"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  confirm() {
    this.deactivateTutor(this.id, true);
  }

  deactivateTutor(id, confirmed) {
    if (confirmed) {
      // this._cityGuidesService.deleteCityGuide(id, this.userId).subscribe(
      //   (response) => {
      //     this.open(
      //       this._translateService.instant("dialog.deletedsuccessfully"),
      //       ""
      //     );
      //     this._location.back();
      //   },
      //   (error) => {
      //     console.log(error);
      //   }
      // );
    }
  }

  toggleDeactivateHover(event) {
    this.deactivateHover = event;
  }

  handleGoBack() {
    this._location.back();
  }

  learnMore() {
    this.showCalendarSection = !this.showCalendarSection;
  }

  close() {
    this.showCalendarSection = false;
  }

  handleSettingsClick() {
    this.setupCalendlyFormSubmitted = false;
    this.setupCalendlyForm.controls['link'].setValue(this.tutor?.calendly_url || '');
    this.setupCalendlyForm.controls['personal_access_token'].setValue(this.tutor?.personal_access_token);
    this.dialogMode = "settings";
    this.dialogTitle =  this._translateService.instant('members.setupcalendly');
    this.modalbutton?.nativeElement.click();
  }

  handleQuestionClick() {
    this.dialogMode = "question";
    this.dialogTitle =  this._translateService.instant('members.askmeaquestion');
    this.modalbutton?.nativeElement.click();
  }


  canStudentBookTutor(custom_member_id){

    const isPotSuperTutor = this.tutor?.potsuper_tutor
    const isPotTutor = this.tutor?.pot_tutor

    let can_student_book = true

    if(!isPotSuperTutor && !isPotTutor){
      if(this.isValidCalenldyAccount && this.tutorAccountIds?.length > 0){
       can_student_book =  this.tutorAccountIds?.some(tutor=> tutor?.role_id == custom_member_id && tutor.stripe_connect == true)
      }else{
       can_student_book = false
      }
    }
    this.tutorStripeConnect = can_student_book
    return can_student_book
  }

  canBook() {
    const custom_member_id =  this.user?.custom_member_type_id
    if(
      this.courseCreditSetting && (
        (
            (!this.separateCourseCredits && this.remainingCourseCredits > 0) || 
            (this.separateCourseCredits && this.separateRemainingCourseCredits > 0) ||
            (this.isTutorUser || this.superTutor || this.superAdmin || this.isAdminRole)
        )
      )
    ) {
      if((custom_member_id  == 282 || custom_member_id  == 143)){
        return this.canStudentBookTutor(custom_member_id)
      }else{
        return true;
      } 
    } else {
      return false;
    }
  }

  async saveCalendlySettings() {

    const personal_access_token = this.setupCalendlyForm.value?.personal_access_token;
    const link = this.setupCalendlyForm.value?.link;

    let isValidCalendlyToken = true
    let isValidCalendlyUrl = true
    if (link) {
      const eventObj = await checkIfValidCalendlyAccount(personal_access_token, link);
      isValidCalendlyToken = eventObj?.isValidToken;
      isValidCalendlyUrl = eventObj?.isValidURL
    }

    if(isValidCalendlyToken){
        this.setupCalendlyFormSubmitted = true

        if(!this.isValidCalendlyForm()) {
          return false
        }

        let params = {
          company_id: this.companyId,
          user_id: this.tutor?.user_id,
          link,
          tutor_id: this.tutor?.id,
          personal_access_token,
        }
        this._tutorsService.updateMemberCalendly(params).subscribe(data => {
          this.tutor.calendly_url = link;
          this.tutor.personal_access_token = personal_access_token;
          this.closemodalbutton?.nativeElement.click();
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        }, err => {
          console.log('err: ', err);
        })
    }else if(!isValidCalendlyUrl || !isValidCalendlyToken){
      this.open(this._translateService.instant('tutors.correctcalendlycredntials'), '');
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  isValidCalendlyForm() {
    let valid = true;
    Object.keys(this.setupCalendlyForm?.controls).forEach(key => {
        const controlErrors: ValidationErrors = this.setupCalendlyForm?.get(key)?.errors!;
        if(controlErrors != null) {
            valid = false;
        }
    });
    return valid;
  }

  sendNewQuestion() {
    this.errorMessage = ''
    this.questionFormSubmitted = true
    this.processing = true

    let params = {
      'company_id': this.companyId,
      'user_id': this.userId,
      'tutor_id': this.tutor?.user_id,
      'message': this.message,
    }

    this._tutorsService.newQuestion(params).subscribe(data => {
      this.processing = false;
      this.closemodalbutton?.nativeElement.click();
      this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
    }, err => {
        console.log('err: ', err);
        this.errorMessage = this._translateService.instant('dialog.error');
    })
  }

  selectCourse(course) {
    this.selectedWorkingCourse = course;
    this._localService.setLocalStorage("selectedWorkingCourse", this.selectedWorkingCourse ? this.selectedWorkingCourse.id : 0);
    this.getRemainingCourseCredits();
  }

  getCourseTitle(course) {
    return course ? this.language == 'en' ? (course.title_en ? (course.title_en || course.title) : course.title) :
      (this.language == 'fr' ? (course.title_fr ? (course.title_fr || course.title) : course.title) : 
        (this.language == 'eu' ? (course.title_eu ? (course.title_eu || course.title) : course.title) : 
          (this.language == 'ca' ? (course.title_ca ? (course.title_ca || course.title) : course.title) : 
            (this.language == 'de' ? (course.title_de ? (course.title_de || course.title) : course.title) : course.title)
          )
        )
      ) : '';
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
