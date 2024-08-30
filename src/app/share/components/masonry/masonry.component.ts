import { CommonModule, Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChange,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { CoursesService, TutorsService } from "@features/services";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { MasonrySection1Component } from "../masonry-section1/masonry-section1.component";
import { MasonrySection2Component } from "../masonry-section2/masonry-section2.component";
import { MasonrySection3Component } from "../masonry-section3/masonry-section3.component";
import { MasonrySection21Component } from "../masonry-section2-1/masonry-section2-1.component";
import { MasonrySection11Component } from "../masonry-section1-1/masonry-section1-1.component";

@Component({
  selector: "app-masonry",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MasonrySection1Component,
    MasonrySection11Component,
    MasonrySection2Component,
    MasonrySection21Component,
    MasonrySection3Component
  ],
  templateUrl: "./masonry.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasonryComponent {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() company: any;
  @Input() section1Mode: any;
  @Input() section2Mode: any;
  @Input() section3Mode: any;
  @Input() isUESchoolOfLife: any;
  @Input() campus: any;

  languageChangeSubscription;
  language: any;
  buttonColor: any;
  section1Data: any = [];
  section2Data: any= [];
  section3Data: any = [];
  data: any = [];
  clubCategories: any;
  clubCategoryMapping: any;
  cityGuideLikes: any;
  jobTypes: any;
  jobAreas: any;
  jobOfferAreas: any;
  section21Data: any= [];
  tags: any;
  tagMapping: any;
  tutorTypes: any;
  section11Data: any= [];
  coursesData: any;
  tutorsData: any = [];
  coursesProgress: any;
  courses: any = [];
  courseSubscriptions: any;
  courseTutors: any;
  courseCategoriesAccessRoles: any;
  courseCategoryMapping: any;
  user: any;
  allCourseCategories: any;
  courseExceptionUser: any;
  isAdmin: boolean = false;
  hasCoursePayment: boolean = false;
  hasCategoryAccess: boolean = false;
  hasCourseCategories: boolean = false;
  isAdvancedCourse: boolean = false;
  hasHotmartIntegration: boolean = false;
  showHotmartRibbon: boolean = false;
  hasCoursePreview: boolean = false;
  hasMembersOnly: boolean = false;
  filterActive: boolean = false;
  onlyAssignedTutorAccess: boolean = false;
  showCoursesByAccess: boolean = false;
  newSection: boolean = false;
  showMemberCoursesOnly: boolean = false;
  filteredcourses: any;
  hotmartSettings: any;

  constructor(
    private _companyService: CompanyService,
    private _coursesService: CoursesService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    this.buttonColor = this.company.button_color
      ? this.company.button_color
      : this.company.primary_color;

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.formatData();
        }
      );

    this.fetchData();
  }

  fetchData() {
    if(this.section1Mode == 'plans' && this.section2Mode != 'courses') {
      this._companyService
      .fetchHomeData(this.company?.id, this.isUESchoolOfLife, this.campus, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.data = data;
          this.clubCategories = data?.club_categories;
          this.clubCategoryMapping = data?.club_category_mapping;
          this.jobTypes = data?.job_types;
          this.jobAreas = data?.job_areas;
          this.jobOfferAreas = data?.job_offer_areas;
          this.formatData();
        },
        (error) => {
          console.log(error);
        }
      );
    } else if(this.section1Mode == 'plans' && this.section2Mode == 'courses') {
      this._companyService
      .fetchHomePlansCoursesData(this.company?.id, this.userId, this.isUESchoolOfLife)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.data = data;
          this.clubCategories = data?.club_categories;
          this.clubCategoryMapping = data?.club_category_mapping;
          this.coursesProgress = data?.courses_progress;
          this.formatPlansCoursesData();
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this._companyService
      .fetchHomeCoursesTutorsTestimonialsData(this.company?.id, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.data = data;
          this.tags = data?.tags;
          this.tagMapping = data?.tags_mapping;
          this.tutorTypes = data?.tutor_types;
          this.coursesProgress = data?.courses_progress;
          this.formatCoursesTestimonialsData();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  formatData() {
    if(this.data) {
      this.section1Data = this?.data?.plans?.length >= 6 ? this?.data?.plans?.slice(0, 6) : this?.data?.plans
      
      if(this.company?.id == 32) {
        if(!this.isUESchoolOfLife) {
          let cityguides1 = this?.data?.city_guides?.length >= 2 ? this?.data?.city_guides?.slice(0, 2) : []
          let joboffers1 = this?.data?.job_offers?.length >= 2 ? this?.data?.job_offers?.slice(0, 4) : []
          
          this.section2Data = []
            .concat(cityguides1)
            .concat(joboffers1)

          this.section3Data = this?.data?.clubs?.length >= 4 ? this?.data?.clubs?.slice(0, 4) : this.data?.clubs
        }
      } else {
        this.section3Data = this?.data?.clubs?.length >= 4 ? this?.data?.clubs?.slice(0, 4) : this.data?.clubs
      }

      this.cd.detectChanges();
    }
  }

  formatCoursesTestimonialsData() {
    if(this.data) {
      let testimonials = this?.data?.testimonials?.length >= 2 ? this?.data?.testimonials?.slice(0, 2) : this?.data?.testimonials;
      let tutors = this?.data?.tutors?.length >= 2 ? this?.data?.tutors?.slice(0, 4) : this?.data?.tutors;
      this.user = this?.data?.user;
      this.section21Data = []
        .concat(testimonials)
        .concat(tutors)

      if(this.data?.courses?.length > 0) {
        this.getCoursesData(this.data?.courses);
      } else {
        this.setCoursesTutorsData(this.data?.courses);
      }
    }
  }

  formatPlansCoursesData() {
    if(this.data) {
      this.section1Data = this?.data?.plans?.length >= 6 ? this?.data?.plans?.slice(0, 6) : this?.data?.plans
      
      if(this.data?.courses?.length > 0) {
        this.getCoursesData(this.data?.courses);
      } else {
        this.setCoursesTutorsData(this.data?.courses);
      }

      this.section3Data = this?.data?.clubs?.length >= 4 ? this?.data?.clubs?.slice(0, 4) : this.data?.clubs

      this.cd.detectChanges();
    }
  }

  getCoursesData(courses_list) {
    this._coursesService.getCombinedCoursesPrefetch(this.company?.id, this.userId).subscribe(data => {
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
      this.mapSubfeatures(subfeatures, tutorSubfeatures)
      this.filterCourses(courses_list);
    }, error => {
      
    })
  }

  async mapSubfeatures(subfeatures, tutorSubfeatures) {
    if(subfeatures?.length > 0) {
      this.showMemberCoursesOnly = this.company?.id == 52 || 27 ? true : false;
      this.hasCoursePayment = subfeatures.some(a => a.name_en == 'Course fee' && a.active == 1)
      this.hasCategoryAccess = subfeatures.some(a => a.name_en == 'Category access' && a.active == 1)
      this.hasCourseCategories = subfeatures.some(a => a.name_en == 'Categories' && a.active == 1)
      this.isAdvancedCourse = subfeatures.some(a => a.name_en == 'Advanced course' && a.active == 1)
      this.hasHotmartIntegration = subfeatures.some(a => a.name_en == 'Hotmart integration' && a.active == 1)
      this.showHotmartRibbon = subfeatures.some(a => a.name_en == 'Hotmart ribbon' && a.active == 1)
      this.hasCoursePreview = subfeatures.some(a => a.name_en == 'Course preview page' && a.active == 1)
      this.hasMembersOnly = subfeatures.some(a => a.name_en == 'Members only' && a.active == 1)
      this.filterActive = subfeatures.some(a => a.name_en == 'Filter' && a.active == 1)
      this.onlyAssignedTutorAccess = subfeatures.some(a => a.name_en == 'Tutors assigned to courses' && a.active == 1)
      this.showCoursesByAccess = subfeatures.some(a => a.name_en == 'Show Courses' && a.active == 1)
      this.newSection = subfeatures.some(a => a.name_en == 'More Training' && a.active == 1)
    }
  }

  filterCourses(courses_list) {
    let courses = courses_list && courses_list.filter(c => {
      return c. status == 1
    })

    let all_courses: any[] = []
    let courseIdArray: any[] = []
    if(courses?.length > 0) {
      let tutor = this.courseTutors?.filter(ct => {
        return ct.id == this.userId
      })
      courses?.forEach(course => {
        let show_buy_now = true
        let user_subscribed = false
        if(this.hasCoursePayment && course.price > 0) {
          let course_subscription = this.courseSubscriptions && this.courseSubscriptions.filter(c => {
            return c.user_id == this.userId && c.course_id == course.id
          })
          if(course_subscription && course_subscription[0]) {
            show_buy_now = false
            user_subscribed = true
            courseIdArray.push(course.id)
          }
        } else {
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
              user_subscribed = true
            }else{
              course.unassigned_status = 1
            }
            this.courseExceptionUser.forEach(cex => {
              if(this.userId == cex.user_id && cex.exception_access == 1 && course.id == cex.course_id){
                show_buy_now = false
                course.exception_access = 1
                course.unassigned_status = 0
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
          "description": plainDescription,
          "description_en": plainDescriptionEn,
          "description_fr": plainDescriptionFr,
          "description_eu": plainDescriptionEu,
          "description_ca": plainDescriptionCa,
          "description_de": plainDescriptionDe,
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
          "show_buy_now": show_buy_now,
          "difficulty": course.difficulty,
          "difficulty_en": course.difficulty_en,
          "difficulty_es": course.difficulty_es,
          "difficulty_fr": course.difficulty_fr,
          "difficulty_eu": course.difficulty_eu,
          "difficulty_ca": course.difficulty_ca,
          "difficulty_de": course.difficulty_de,
          "duration": course.duration,
          "duration_unit": course.duration_unit,
          "duration_unit_en": course.duration_unit_en,
          "duration_unit_es": course.duration_unit_es,
          "duration_unit_fr": course.duration_unit_fr,
          "duration_unit_eu": course.duration_unit_eu,
          "duration_unit_ca": course.duration_unit_ca,
          "duration_unit_de": course.duration_unit_de,
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
          "button_color": course.button_color,
          "cta_status": course.cta_status,
          "cta_text": course.cta_text,
          "cta_link": course.cta_link,
          "buy_now_status": course.buy_now_status,
          "exception_access": course.exception_access == 1 ? 1 : 0,
          "unassigned_status": course.unassigned_status == 1 ? 1 : 0,
          "course_categories": course.course_categories,
          "buy_now_button_color": course.buy_now_button_color,
        })
      });
    }

    let isTutor = this.courseTutors && this.courseTutors.some(a => a.id == this.userId)
    if((this.showCoursesByAccess || this.showMemberCoursesOnly) && !isTutor && !this.superAdmin){
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

      this.setCoursesTutorsData(this.filteredcourses);
    }
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

    this.setCoursesTutorsData(this.filteredcourses);
  }

  setCoursesTutorsData(courses) {
    let user_courses = courses?.length >= 6 ? courses?.slice(0, 6) : courses;
    let tutors1 = this?.data?.tutors?.length >= 4 && this?.data?.tutors?.length <= 12 ? this?.data?.tutors?.slice(4, 12) : [];
    
    if(user_courses?.length > 0) {
      user_courses = user_courses?.sort((a, b) => {
        return a.id - b.id;
      });
    }
    
    this.coursesData = user_courses;
    this.tutorsData = tutors1;
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}