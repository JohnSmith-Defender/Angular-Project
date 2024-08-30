import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild, Renderer2, ChangeDetectorRef, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { CoursesService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, CommentsComponent, NoAccessComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from "@angular/material/snack-bar";
import { initFlowbite } from "flowbite";
import { CourseUnitCardComponent } from "@share/components/card/course-unit/course-unit.component";
import { NgxPaginationModule } from "ngx-pagination";
import { COURSE_IMAGE_URL } from "@lib/api-constants";
import { DomSanitizer } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { EditorModule } from "@tinymce/tinymce-angular";
import { SafeContentHtmlPipe } from "@lib/pipes";
import {
  StarRatingModule,
  ClickEvent,
  HoverRatingChangeEvent,
  RatingChangeEvent
} from 'angular-star-rating';
import { AssessmentComponent } from "../assessment/assessment.component";
import { MaximizeModule } from "src/app/directives/maximize/maximize.module";
import { MaximizeDirective } from "src/app/directives/maximize/maximize.directive";
import moment from 'moment';
import get from "lodash/get";

@Component({
  selector: 'app-courses-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
    CourseUnitCardComponent,
    NoAccessComponent,
    NgxPaginationModule,
    MatExpansionModule,
    NgxDocViewerModule,
    EditorModule,
    StarRatingModule,
    MaximizeModule,
    SafeContentHtmlPipe,
    AssessmentComponent,
    CommentsComponent,
    ToastComponent,
  ],
  templateUrl: './detail.component.html'
})
export class CourseDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  isMobile: boolean = false;
  emailDomain: any;
  canCreate: boolean = false;
  pageName: any;
  company: any;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  courseData: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  coursesFeature: any;
  editHover: boolean = false;
  deleteHover: boolean = false;
  courseTitle: string = '';
  courseImage: string = '';
  courseDescription: string = '';
  p: any;

  email: any;
  language: any;
  user: any;
  course: any;
  courseUnitTypeSrc: string = environment.api +  '/get-course-unit-type-image/';
  courseUnitSrc: string = environment.api +  '/get-course-unit-file/';
  downloadCourseUnitSrc: string = environment.api +  '/guest/download-course-unit-file/';
  courseUnitScormSrc: string = environment.api +  '/';
  courseProgress: any;
  coursePoints: any;
  files: any = [];
  isloading: boolean = true;
  play: boolean = false;
  @ViewChild('videoPlayer', {static: false}) videoplayer: ElementRef | undefined;
  videoPlayStatus: any = [];
  audioPlayStatus: any = [];
  courseUnits: any = [];

  companyId: any
  companies: any
  primaryColor: any
  buttonColor: any
  userId: any

  features: any
  subfeatures: any
  canLinkQuizToCourse: boolean = false
  domain: any
  allQuizzes: any
  courseQuizzes: any
  apiPath: string = environment.api

  quiz: any
  intro: boolean = false
  continue: boolean = false
  questions: any
  takeQuiz: boolean = false
  QuestionResult: any = []
  result: any = []
  selectedQuestionIndex: any
  alphabets: string[] = ['A', 'B', 'C', 'D', 'E']
  progressbarValue = 0
  curSec: number = 0
  totalSec: number = 0
  runningSec: number = 0
  checkedResult: boolean = false
  timer: any
  resultGenerated: boolean = false
  score = null
  totalNumber = null
  completed: boolean = false
  stopTime: boolean = false
  modal: any

  courseSubscriptions: any
  hasCoursePayment: boolean = false
  showBuyNow: boolean = false
  superAdmin: boolean = false
  selectedCategories: any
  hasCourseCategories: boolean = false
  isAdvancedCourse: boolean = false
  courseSrc: string = environment.api +  '/get-course-image/';
  isFeatured: boolean = false
  tabSelected: boolean = false

  hasCourseCustomSections: boolean = false
  courseSections: any = []

  breadcrumbLink: any = ''
  dropdownSettings: any
  selectedModule: any
  selectedModuleUnits: any = []
  selectedModuleUnitsCompleted: any
  selectedModulePackageId: any
  selectedModulePackageText: any
  selectedUnit: any
  selectedLesson: any
  isLessonFirst: boolean = false
  isLessonLast: boolean = false
  selectedModuleId: any
  isModuleFirst: boolean = false
  isModuleLast: boolean = false
  selectedAudio: any
  isModuleLocked: boolean = false
  availableOn: any = ''
  availableAfterCompletion: boolean = false
  previousModuleName: any = ''
  canLockUnlockModules: boolean = false
  isSelectedUnitCompleted: boolean = false
  selectedUnitFilename: any = ''
  showDocumentViewer: boolean = false
  selectedUnitSafeFileUrl: any = ''
  expandedModuleId: any
  company_subfeatures = []
  subfeature_id_global: number = 0
  feature_global: string = ''
  courseDownloads: any = []
  playCurrentVideo: boolean = false
  hasAudio: boolean = false
  audioFile: any
  audios: any = []
  ctaList: any = []
  courseTutors: any = []
  centerHorizontalPosition: MatSnackBarHorizontalPosition = 'center'
  topVerticalPosition: MatSnackBarVerticalPosition = 'bottom'
  hasMarkAsComplete: boolean = false
  selectedModuleTitle: any = ''
  blockedModuleText: any = ''
  hoverColor: any = ""
  hovered: any = -1
  showTitle: boolean = false
  selfHostedVideoSrc = ''
  videoSrc = ''
  safeLessonURL: any = ''
  @ViewChild('selfHostedVideo', { static: false }) selfHostedVideo: ElementRef | undefined

  selectTutorFormSubmitted: boolean = false
  showSelectTutorModal: boolean = false
  selectTutorQuestions: any = []
  featureId: any
  onlyAssignedTutorAccess: boolean = false;
  courseTextSize: any;
  courseLineHeight: any;
  hasCourseCreditSetting: boolean = false;
  rating: any;
  onClickResult: ClickEvent | undefined;
  onHoverRatingChangeResult: HoverRatingChangeEvent | undefined;
  onRatingChangeResult: RatingChangeEvent | undefined;
  @ViewChild("completemodalbutton", { static: false }) completemodalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closecompletemodalbutton", { static: false }) closecompletemodalbutton:
    | ElementRef
    | undefined;
  @ViewChild('iframeText', { static: false }) iframeText: ElementRef | undefined;
  @ViewChild('editor', { static: false }) editor: ElementRef | undefined;

  courseAssessments: any = [];
  assessmentDetails: any = [];
  beginningCourseAssessment: any;
  endCourseAssessment: any;
  endModuleAssessments: any = [];
  currentAssessment: any;
  showAssessment: boolean = false;
  afterModuleAssessments: any = [];
  hasCourseVideoComments: boolean = false;

  commentsList: any = [];
  newComment: any = '';
  showComments: boolean = false;
  autoCompleteLesson: boolean = false;
  isExpanded: boolean = false;
  @ViewChild(MaximizeDirective, { static: true }) maximize!: MaximizeDirective;

  showIntroPDF: boolean = false;
  courseIntroPDFURL: any;
  courseIntroPDFURLEn: any;
  courseIntroPDFURLFr: any;
  courseIntroPDFURLEu: any;
  courseIntroPDFURLCa: any;
  courseIntroPDFURLDe: any;
  courseIntroPDFURLIt: any;
  courseIntroPDFURLSrc: any;
  courseIntroPDFURLSrcEn: any;
  courseIntroPDFURLSrcFr: any;
  courseIntroPDFURLSrcEu: any;
  courseIntroPDFURLSrcCa: any;
  courseIntroPDFURLSrcDe: any;
  courseIntroPDFURLSrcIt: any;
  
  constructor(
    private _router: Router,
    private _coursesService: CoursesService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private renderer2: Renderer2,
    private cd: ChangeDetectorRef
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    initFlowbite();
    this.onResize();
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
    this.getCourse();
  }

  getCourse() {
    this._coursesService
      .fetchCourseCombined(this.id, this.companyId, this.userId)
      .subscribe(
        (data) => {
          let course_data =  data[0] ? data[0] : [];
          this.courseSubscriptions = data[1] ? data[1]['course_subscriptions'] : [];
          this.courseTutors = data[2] ? data[2]['course_tutors'] : [];
          this.courseData = course_data;
          this.formatCourseAssessments();
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'title_desc',
      allowSearchFilter: false,
      closeDropDownOnSelection: true
    }

    let data = this.courseData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data);
    this.mapUserPermissions(data?.user_permissions);
    this.formatCourse(data?.course);
    this.initializeBreadcrumb(data);
  }

  formatCourseAssessments(updated_course_assessments: any = [], updated_assesments: any = [], updated_assessment_multiple_choice_options: any = []) {
    this.courseAssessments = updated_course_assessments?.length > 0 ? updated_course_assessments : this.courseData?.course_assessments;
    let assessments = updated_assesments?.length > 0 ? updated_assesments : this.courseData?.assessments;
    let assessmentMultipleChoiceOptions = updated_assessment_multiple_choice_options?.length > 0 ? updated_assessment_multiple_choice_options : this.courseData?.assessment_multiple_choice_options;
    if(this.courseAssessments?.length > 0) {
      let beginningCourseAssessment = this.courseAssessments?.find((f) => f.timing == 'beginning' && f.type == 'course');
      let endCourseAssessment = this.courseAssessments?.find((f) => f.timing == 'end' && f.type == 'course');
      if(beginningCourseAssessment?.assessment_id > 0) {
        let assessmentDetails = assessments?.filter(assessment => {
          return assessment?.assessment_id == beginningCourseAssessment?.assessment_id
        })

        let assessment_details: any[] = []
        if(assessmentDetails?.length > 0) {
          assessmentDetails?.forEach(detail => {
            let multiple_choice_options = assessmentMultipleChoiceOptions?.filter(mc => {
              return mc.assessment_id && detail.assessment_id && mc.assessment_detail_id == detail.id 
            })
            assessment_details.push({
              id: detail.id,
              assessment_id: detail.assessment_id,
              number: detail.number,
              title: detail.title,
              title_en: detail?.title_en || detail?.title,
              title_fr: detail?.title_fr || detail?.title,
              title_eu: detail?.title_eu || detail?.title,
              title_ca: detail?.title_ca || detail?.title,
              title_de: detail?.title_de || detail?.title,
              title_it: detail?.title_it || detail?.title,
              image: detail.image,
              image_width: detail.image_width,
              multiple_choice_options,
            });
          })
        }

        beginningCourseAssessment['assessment_details'] = assessment_details;
      }
      this.beginningCourseAssessment = beginningCourseAssessment;

      if(endCourseAssessment?.assessment_id > 0) {
        let assessmentDetails = assessments?.filter(assessment => {
          return assessment?.assessment_id == endCourseAssessment?.assessment_id
        })

        let assessment_details: any[] = []
        if(assessmentDetails?.length > 0) {
          assessmentDetails = assessmentDetails?.sort((a, b) => {
            return a.number - b.number;
          });
          assessmentDetails?.forEach(detail => {
            let multiple_choice_options = assessmentMultipleChoiceOptions?.filter(mc => {
              return mc.assessment_id && detail.assessment_id && mc.assessment_detail_id == detail.id 
            })
            if(multiple_choice_options?.length > 0) {
              multiple_choice_options = multiple_choice_options?.sort((a, b) => {
                return a.number - b.number;
              });
            }
            assessment_details.push({
              id: detail.id,
              assessment_id: detail.assessment_id,
              number: detail.number,
              title: detail.title,
              title_en: detail?.title_en || detail?.title,
              title_fr: detail?.title_fr || detail?.title,
              title_eu: detail?.title_eu || detail?.title,
              title_ca: detail?.title_ca || detail?.title,
              title_de: detail?.title_de || detail?.title,
              title_it: detail?.title_it || detail?.title,
              image: detail.image,
              image_width: detail.image_width,
              multiple_choice_options,
            });
          })
        }

        endCourseAssessment['assessment_details'] = assessment_details;
      }
      this.endCourseAssessment = endCourseAssessment;

      let afterModuleAssessments = this.courseAssessments?.filter(f => {
        return f.timing == 'after' && f.type == 'module'
      })
      let after_module_assessments: any[] = []
      if(afterModuleAssessments?.length > 0) {
        afterModuleAssessments?.forEach(afterModuleAssessment => {
          if(afterModuleAssessment?.assessment_id > 0) {
            let assessmentDetails = assessments?.filter(assessment => {
              return assessment?.assessment_id == afterModuleAssessment?.assessment_id
            })
    
            let assessment_details: any[] = []
            if(assessmentDetails?.length > 0) {
              assessmentDetails?.forEach(detail => {
                let multiple_choice_options = assessmentMultipleChoiceOptions?.filter(mc => {
                  return mc.assessment_id && detail.assessment_id && mc.assessment_detail_id == detail.id 
                })
                assessment_details.push({
                  id: detail.id,
                  assessment_id: detail.assessment_id,
                  number: detail.number,
                  title: detail.title,
                  title_en: detail?.title_en || detail?.title,
                  title_fr: detail?.title_fr || detail?.title,
                  title_eu: detail?.title_eu || detail?.title,
                  title_ca: detail?.title_ca || detail?.title,
                  title_de: detail?.title_de || detail?.title,
                  title_it: detail?.title_it || detail?.title,
                  image: detail.image,
                  image_width: detail.image_width,
                  multiple_choice_options,
                });
              })
            }
    
            afterModuleAssessment['assessment_details'] = assessment_details;
            after_module_assessments.push(afterModuleAssessment);
          }
        })
      }
      this.afterModuleAssessments = after_module_assessments;
    }
  }

  mapFeatures(features) {
    this.coursesFeature = features?.find((f) => f.feature_id == 11);
    this.featureId = this.coursesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.coursesFeature);
  }

  mapSubfeatures(data) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.hasCoursePayment = subfeatures.some(a => a.name_en == 'Course fee' && a.active == 1);
      this.hasCourseCategories = subfeatures.some(a => a.name_en == 'Categories' && a.active == 1);
      this.isAdvancedCourse = subfeatures.some(a => a.name_en == 'Advanced course' && a.active == 1);
      this.canLockUnlockModules = subfeatures.some(a => a.name_en == 'Lock/unlock upon completion' && a.active == 1);
      this.hasMarkAsComplete = subfeatures.some(a => a.name_en == 'Mark as complete' && a.active == 1);
      this.showTitle = subfeatures.some(a => a.name_en == 'Cover Title' && a.active == 1);
      this.onlyAssignedTutorAccess = subfeatures.some(a => a.name_en == 'Tutors assigned to courses' && a.active == 1);
      this.hasCourseCreditSetting = subfeatures.some(a => a.name_en == 'Credits' && a.active == 1 && a.feature_id == 11);
      this.hasCourseVideoComments = subfeatures.some(a => a.name_en == 'Course video comments' && a.active == 1 && a.feature_id == 11);
      this.autoCompleteLesson = subfeatures.some(a => a.name_en == 'Autocomplete lesson' && a.active == 1 && a.feature_id == 11);
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 11
      );
  }

  formatCourse(data) {
    this.course = data;
    this.courseTextSize = ((this.course?.text_size_unit || 12) + 'px').toString();
    this.courseLineHeight = (((this.course?.text_size_unit || 12) * (4/3)) + 'px').toString();
    this.courseTitle =this.getCourseTitle(this.course);
    this.courseDescription = this.getCourseDescription(this.course);
    this.courseImage = `${COURSE_IMAGE_URL}/${this.course?.image}`;
    this.showComments = this.course?.show_comments == 1 ? true : false;
    
    this.courseIntroPDFURL = this.course.intro_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_pdf}` : '';
    this.courseIntroPDFURLEn = this.course.intro_en_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_en_pdf}` : '';
    this.courseIntroPDFURLFr = this.course.intro_fr_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_fr_pdf}` : '';
    this.courseIntroPDFURLEu = this.course.intro_eu_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_eu_pdf}` : '';
    this.courseIntroPDFURLCa = this.course.intro_ca_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_ca_pdf}` : '';
    this.courseIntroPDFURLDe = this.course.intro_de_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_de_pdf}` : '';
    this.courseIntroPDFURLIt = this.course.intro_it_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_it_pdf}` : '';

    this.courseIntroPDFURLSrc = this.courseIntroPDFURL ? this.sanitizer.bypassSecurityTrustResourceUrl(this.courseIntroPDFURL) : '';
    this.courseIntroPDFURLSrcEn = this.courseIntroPDFURLEn ? this.sanitizer.bypassSecurityTrustResourceUrl(this.courseIntroPDFURLEn) : '';
    this.courseIntroPDFURLSrcFr = this.courseIntroPDFURLFr ? this.sanitizer.bypassSecurityTrustResourceUrl(this.courseIntroPDFURLFr) : '';
    this.courseIntroPDFURLSrcEu = this.courseIntroPDFURLEu ? this.sanitizer.bypassSecurityTrustResourceUrl(this.courseIntroPDFURLEu) : '';
    this.courseIntroPDFURLSrcCa = this.courseIntroPDFURLCa ? this.sanitizer.bypassSecurityTrustResourceUrl(this.courseIntroPDFURLCa) : '';
    this.courseIntroPDFURLSrcDe = this.courseIntroPDFURLDe ? this.sanitizer.bypassSecurityTrustResourceUrl(this.courseIntroPDFURLDe) : '';
    this.courseIntroPDFURLSrcIt = this.courseIntroPDFURLIt ? this.sanitizer.bypassSecurityTrustResourceUrl(this.courseIntroPDFURLIt) : '';

    if(this.course) {
      this.coursePoints = this.course.course_users && this.course.course_users[0] ? ((parseInt(this.course.course_users[0].progress) * parseInt(this.course.points)) / 100) : 0;
      this.courseProgress = this.course.course_users && this.course.course_users[0] ? parseInt(this.course.course_users[0].progress) : 0;
      if(this.hasCoursePayment && this.course.price > 0) {
        let course_subscription = this.courseSubscriptions && this.courseSubscriptions.filter(c => {
          return c.user_id == this.userId && c.course_id == this.course.id
        })
        if(course_subscription && course_subscription[0]) {
        } else {
          this.showBuyNow = true
        }
      }

      if(this.showBuyNow) {
        let isTutor = this.courseTutors && this.courseTutors.some(a => a.id == this.userId)
        if(isTutor) {
          this.showBuyNow = false
        }
      }

      this.course.course_units && this.course.course_units.forEach(unit => {
        if(unit.Company_Course_Unit_Type.type != 'others' && unit.Company_Course_Unit_Type.type != 'pdf') {
          unit.file = this.sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + unit.file + '?controls=0');
        }
        if(unit.audio_file) {
          unit.audio_file = this.sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + unit.audio_file + '?controls=0');
        }
      });
      this.courseUnits = this.course.course_units ? this.course.course_units : [];
    }

    if(this.isAdvancedCourse) {
      let module_number = this.course && this.course.course_modules.length > 0 ? this.course.course_modules[0].number : '' 
      this.breadcrumbLink = `${this.getCourseTitle(this.course)} / ${this._translateService.instant('course-details.module')} ${module_number} / ${this.getModuleTitle(this.course.course_modules[0])}`

      if(this.course.course_modules.length > 0) {
        this.course.course_modules = this.formatCourseModules(this.course.course_modules)

        if(this.course.course_users && this.course.course_users[0]) {
          if(this.course.course_users[0].last_accessed_module_id > 0) {
            let last_session_module = this.course.course_modules && this.course.course_modules.filter(cm => {
              return cm.id == this.course.course_users[0].last_accessed_module_id
            })
            if(last_session_module && last_session_module[0]) {
              let session_module: any[] = []
              session_module.push(last_session_module[0])
              this.selectedModule = session_module
              this.selectedModuleId = session_module[0].id
            }
          }

          if(this.course.course_users[0].last_accessed_unit_id > 0) {
            let session_unit = this.course.course_units.filter(u => {
              return u.id == this.course.course_users[0].last_accessed_unit_id
            })
            this.selectedUnit = session_unit && session_unit[0] ? session_unit[0] : ''
          }
        }

        if(!this.selectedModule) {
          let selected_module: any[] = []
          selected_module.push(this.course.course_modules[0])
          if(selected_module) {
            this.selectedModule = selected_module
            this.selectedModuleId = selected_module[0].id
          }
        }

        this.isModuleLocked = this.checkLockAccess(this.selectedModuleId)

        if(this.selectedModule && this.selectedModule[0]) {
          let units = []
          let module = this.course.course_modules.filter(cm => {
            return cm.id == this.selectedModule[0].id
          })
          if(module && module[0]) {
            units = module[0].units

            if(!units || (units?.length == 0)) {
              // Select previous module with units
              let previous_module = this.course.course_modules.filter(cm => {
                return cm.number < module[0].number && cm.units?.length > 0
              })
              if(previous_module?.length > 0) {
                let sorted_module = previous_module.sort((a, b) => {
                  return b.number - a.number
                })
                this.selectedModule = sorted_module[0]
                this.selectedModuleId = sorted_module[0].id
                units = sorted_module[0].units
              }
            }
          }

          if(!this.selectedUnit) {
            if(units?.length > 0) {
              this.selectedUnit = units && units.length > 0 ? units[0] : {}
            } else {
              let course_modules = this.course.course_modules.filter(cm => {
                return cm?.units?.length > 0
              })
              if(course_modules?.length > 0) {
                this.selectedModule = course_modules[0]
                this.selectedUnit = this.selectedModule?.units?.length > 0 ? this.selectedModule?.units[0] : {}
              }
            }
            this.isLessonFirst = true
            this.isLessonLast = false
          } else {
            if(units && units.length > 0) {
              let selected_unit = units.filter((u, index) => {
                return u['id'] == this.selectedUnit.id
              })
              if(selected_unit?.length == 0 && this.selectedModule?.length > 0 && this.selectedModule[0]?.units?.length > 0) {
                selected_unit = this.selectedModule[0]?.units
              }
              this.selectedUnit = selected_unit && selected_unit.length > 0 ? selected_unit[0] : {}

              this.refreshArrows()
            }
          }    

          if(this.selectedUnit && (!this.isModuleLocked || this.superAdmin)) {
            this.breadcrumbLink += ` / ${this.getUnitTitle(this.selectedUnit)}`
            if(this.selectedUnit.Company_Course_Unit_Type && this.selectedUnit.Company_Course_Unit_Type.type == 'video'
              && (this.selectedUnit.option == 'YouTube' || this.selectedUnit.option == 'Vimeo' || this.selectedUnit.option == 'External')
            ) {
              this.selectedLesson = this.getLessonContent(this.selectedUnit);
            } 
            this.getSafeFileUrl()
          }

          this.selectedModuleUnits = units
        }
      }
    }

    if(this.selectedUnit) {
      if(this.hasCourseVideoComments) {
        this.initializeCommentsList();
      }

      this.isSelectedUnitCompleted = this.selectedUnit && this.selectedUnit.Company_Course_Unit_Users 
        && this.selectedUnit.Company_Course_Unit_Users[0] && this.selectedUnit.Company_Course_Unit_Users[0].progress == 100 ? true : false

      if(this.selectedUnit.Company_Course_Unit_Type 
          && (this.selectedUnit.Company_Course_Unit_Type.type == 'others' || this.selectedUnit.Company_Course_Unit_Type.type == 'pdf') 
      ) {
        this.showDocumentViewer = true
        let fileExtension = this.selectedUnit.file ? this.selectedUnit.file.split('.').pop() : ''
        this.selectedUnitFilename = `${this.selectedUnit.title}.${fileExtension}`
      }

      if(this.selectedUnit && this.selectedUnit.cta == 1) {
        this.getCTAs()
      }
      this.getCourseDownloads()
    }

    let units = this.courseUnits?.filter(cm => {
      return cm.module_id == this.selectedModuleId
    })

    var countCompleted = 0;
    units.forEach(unit => {
      let unitUser = unit?.Company_Course_Unit_Users?.find(element => element.user_id == this.userId);
      if (unitUser && unitUser.progress == 100) {
        countCompleted = countCompleted + 1;
      }
    });
    if(this.selectedModule?.length > 0) {
      this.selectedModuleUnitsCompleted = (countCompleted == units.length) && (this.selectedModule[0].reward_tutor_package);
    }

    if (this.selectedModuleUnitsCompleted) {
      this.selectedModulePackageId = this.selectedModule[0].package_id;
      this.selectedModulePackageText = this.selectedModule[0].package_text;
    }
  }

  formatCourseModules(modules) {
    let units_available_on: any[] = [];
    let user_joined = this.user?.created ? moment(this.user?.created).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
    if(modules?.length > 0 && !this.superAdmin) {
      let mods = modules?.filter(mod => {
        let include = false;
        if(mod?.units?.length > 0) {
          let unit_availability = mod?.units?.filter(mu => {
            return mu.unit_availability == 1
          })
          if(unit_availability?.length > 0) {
            unit_availability?.forEach(ua => {
              let available_on_date = moment(ua.unit_availability_date).format('YYYY-MM-DD');
              if(!moment(available_on_date).isAfter(moment(user_joined))) {
                units_available_on.push(ua)
              }
            });
            include = true
          }
        }
        return include
      })
      if(mods?.length > 0 && units_available_on?.length > 0) {
        let new_modules = modules?.map(mod => {
          let filtered_units = mod?.units?.filter(unit => {
            let match = units_available_on.some((a) => a.module_id == mod.id && a.id == unit.id);
            return !match
          })
          return {
            filtered_units,
            ...mod
          }
        })
        new_modules = new_modules?.filter(mod => {
          return mod?.filtered_units?.length > 0
        })
        modules = new_modules
      }
    }
    return modules.map((module, index) => {
      let title_desc = `${this._translateService.instant('course-details.module')} ${module.number}`

      return {
        title_desc,
        ...module
      }
    })
  }

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = this.getCourseTitle(data?.course);
    this.level3Title = "";
    this.level4Title = "";
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

  getCourseDescription(course) {
    return this.language == "en"
      ? course.description_en
        ? course.title_en || course.description
        : course.description
      : this.language == "fr"
      ? course.title_fr
        ? course.title_fr || course.description
        : course.description
      : this.language == "eu"
      ? course.title_eu
        ? course.title_eu || course.description
        : course.description
      : this.language == "ca"
      ? course.title_ca
        ? course.title_ca || course.description
        : course.description
      : this.language == "de"
      ? course.title_de
        ? course.title_de || course.description
        : course.description
      : this.language == "it"
      ? course.title_it
        ? course.title_it || course.description
        : course.description
      : course.description;
  }

  getModuleTitle(module) {
    return module && this.language == 'en' ? (module.title_en ? (module.title_en || module.title) : module.title) :
      (module && this.language == 'fr' ? (module.title_fr ? (module.title_fr || module.title) : module.title) : 
      (module && this.language == 'eu' ? (module.title_eu ? (module.title_eu || module.title) : module.title) :
      (module && this.language == 'ca' ? (module.title_ca ? (module.title_ca || module.title) : module.title) :
      (module && this.language == 'de' ? (module.title_de ? (module.title_de || module.title) : module.title) :
      (module && this.language == 'it' ? (module.title_it ? (module.title_it || module.title) : module.title) :
         module && module.title)))))
  }

  getUnitTitle(unit) {
    return this.language == 'en' ? (unit.title_en ? (unit.title_en || unit.title) : unit.title) :
      (this.language == 'fr' ? (unit.title_fr ? (unit.title_fr || unit.title) : unit.title) : 
      (this.language == 'eu' ? (unit.title_eu ? (unit.title_eu || unit.title) : unit.title) : 
      (this.language == 'ca' ? (unit.title_ca ? (unit.title_ca || unit.title) : unit.title) : 
      (this.language == 'de' ? (unit.title_de ? (unit.title_de || unit.title) : unit.title) : 
      (this.language == 'it' ? (unit.title_it ? (unit.title_it || unit.title) : unit.title) : 
          unit.title)))))
  }

  getCourseSections() {
    this._coursesService.getCourseSections(this.id).subscribe(
      response => {
        this.courseSections = response.course_sections
      },
      error => {
        console.log(error);
      }
    );
  }

  checkLockAccess(moduleId) {
    var locked = false
    if(moduleId > 0) {
      if(this.course.course_modules && this.course.course_modules.length > 0) {
        let index
        let module
        this.course.course_modules.forEach((mod, i) => {
          if(mod.id == moduleId) {
            module = mod
            index = i
          }
        })

        if(module && (
            (module.block_other_modules == 1 && module.block_days_after > 0 && !module.unblock_date) ||
            (module.block_other_modules == 1 && module.block_days_after_start > 0 && !module.unblock_date) ||
            (module.unblock_date) 
        )) {
          // Get module start date
          let days = 0
          this.course.course_modules.forEach((mod, idx) => {
            if(idx <= index) {
              days += module.block_days_after_start > 0 ? mod.block_days_after_start:  mod.block_days_after
            }
          })

          let start_date
          if(module.unblock_date) {
            start_date = moment(module.unblock_date).format('YYYY-MM-DD')
          } else {
            if(days > 0) {
              if(module.block_days_after_start > 0) {
                if(this.course.course_users && this.course.course_users.length > 0) {
                  start_date = moment(this.course.course_users[0].created_at).add('days',  days).format('YYYY-MM-DD')
                }
              } else {
                start_date = moment(this.course.date).add('days',  days).format('YYYY-MM-DD')
              }
            }
          }

          if(start_date) {
            let today = moment(new Date()).format('YYYY-MM-DD')
            if(moment(today).isBefore(moment(start_date))) {
              locked = true

              if(module && module.id == this.selectedModuleId) {
                this.blockedModuleText = this.language == 'en' ? module.blocked_module_text_en : (this.language == 'fr' ? module.blocked_module_text_fr : 
                  (this.language == 'eu' ? module.blocked_module_text_eu: (this.language == 'ca' ? module.blocked_module_text_ca : 
                  (this.language == 'de' ? module.blocked_module_text_de : module.blocked_module_text))))
                this.blockedModuleText = this.blockedModuleText ? this.blockedModuleText : module.blocked_module_text
              }
    
              this.availableOn = moment(start_date).format("D MMM, YYYY")
              this.availableAfterCompletion = true
            }
          }
        }
      }
    }

    if(this.superAdmin){
      locked = false
    } else {
      // Check if user is tutor of this course
      if(this.courseTutors?.length > 0 && this.onlyAssignedTutorAccess) {
        let user_tutor_id = this.courseTutors.filter(ct => {
          return ct.id == this.userId
        })
        if(user_tutor_id?.length > 0) {
          let course_tutors_id = this.course?.tutor_id ? this.course.tutor_id : []
          locked = !course_tutors_id.some(a => a.tutor_id == user_tutor_id[0].tutor_id)
        }
      
        let course_exception_tutor = this.courseTutors.filter(ct => {
          return ct.id == this.userId && ct.exception_access == 1
        })
        if(course_exception_tutor && course_exception_tutor.length > 0 && course_exception_tutor[0].exception_access == 1){
          locked = false
        }
      }
    }
    
    return locked
  }

  async setUnitVisited(id){
    this._coursesService.setUnitVisited(id).subscribe(data => {
      for(let cm of this.course.course_modules) {
        if(cm.id == this.selectedUnit.module_id) {
          for(let cmu of cm.units) {
            if(cmu.id == this.selectedUnit.id) {
              cmu.Company_Course_Unit_Users[0].visited = 1;
            }
          }
        }
      }
    })
  }

  getCTAs() {
    this._coursesService.getCTAs(this.selectedUnit.id).subscribe(data => {
      this.ctaList = data['cta']
    }, error => {
      
    })
  }

  getCourseDownloads() {
    this._coursesService.getCourseDownloads(this.course.id).subscribe(data => {
      let downloads = data['downloads']
      this.courseDownloads = downloads && downloads.filter(download => {
        if(download.course_unit_id == this.selectedUnit.id && download.file && (download.file.indexOf('.m4a') >= 0 || download.file.indexOf('.mp3') >= 0 || download.file.indexOf('.wav') >= 0 || download.file.indexOf('.ogg') >= 0)) {
          this.hasAudio = true
          let match = this.audios.some(a => a.id == download.id)
          if(!match) {
            this.audios.push({
              id: download.id,
              audioFile: this.sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + download.file)
            })
          }
        }

        return download.course_unit_id == this.selectedUnit.id
      })

      this.courseDownloads = this.courseDownloads && this.courseDownloads.filter(download => {
        return download.file.indexOf('.m4a') < 0 && download.file.indexOf('.mp3') < 0 && download.file.indexOf('.wav') < 0 && download.file.indexOf('.ogg') < 0
      })
      if(this.courseDownloads && this.courseDownloads.length > 0) {
        this.courseDownloads = this.courseDownloads.sort((a, b) => {
          return a.number - b.number
        })
      }
    }, error => {
      console.log(error)
    })
  }

  refreshArrows() {
    let idx = 0
    this.course.course_units && this.course.course_units.forEach((u, index) => {
      if(u.id == this.selectedUnit.id) {
        idx = index
      }
    })
    this.isLessonFirst = idx == 0 ? true : false
    this.isLessonLast = idx == (this.course.course_units.length - 1) ? true : false
  }

  async selectUnit(unit) {
    this.showAssessment = false
    this.hasAudio = false
    this.audios = []
    this.playCurrentVideo = false
    this.showDocumentViewer = false
    this.selectedUnit = unit
    this.isLessonFirst = false
    this.isLessonLast = false
    this.selectedAudio = ''
    this.selectedLesson = ''
    this.availableOn = ''
    this.previousModuleName = ''
    this.availableAfterCompletion = false
    this.selfHostedVideoSrc = ''
    this.videoSrc = ''
    this.showIntroPDF = false

    if(this.course.course_modules) {
      let module = this.course.course_modules && this.course.course_modules.filter(cm => {
        return cm.id == this.selectedUnit.module_id
      })
      if(module && module[0]) {
        let session_module: any[] = []
        session_module.push(module[0])
        this.selectedModule = session_module
        this.selectedModuleId = session_module[0].id
        this.expandedModuleId = session_module[0].id
      }
    }
    this.isModuleLocked = this.checkLockAccess(this.selectedModuleId)

    if(!this.isModuleLocked || this.superAdmin) {
      this.getSafeFileUrl()

      let idx = 0
      this.course.course_units.forEach((u, index) => {
        if(u.id == this.selectedUnit.id) {
          idx = index
        }
      })

      this.isLessonFirst = idx == 0 ? true : false
      this.isLessonLast = idx == (this.course.course_units.length - 1) ? true : false

      // Save user's course
      if(this.userId) {
        const payload = {
          user_id: this.userId,
          course_id: this.course.id,
          last_accessed_module_id: this.selectedModuleId,
          last_accessed_unit_id: this.selectedUnit.id,
        }
        this._coursesService.saveCourseSession(payload).subscribe(
          response => {
            if(this.selectedUnit) {
              this.isSelectedUnitCompleted = this.selectedUnit && this.selectedUnit.Company_Course_Unit_Users 
              && this.selectedUnit.Company_Course_Unit_Users[0] && this.selectedUnit.Company_Course_Unit_Users[0].progress == 100 ? true : false
              
              if(this.selectedUnit.Company_Course_Unit_Type 
                && (this.selectedUnit.Company_Course_Unit_Type.type == 'others' || this.selectedUnit.Company_Course_Unit_Type.type == 'pdf') 
              ) {
                setTimeout(() => {
                  this.showDocumentViewer = true
                }, 1000)
                let fileExtension = this.selectedUnit.file ? this.selectedUnit.file.split('.').pop() : ''
                this.selectedUnitFilename = `${this.selectedUnit.title}.${fileExtension}`
              }
            }
          },
          error => {
            console.log(error)
          }
        )
      }
    }

    if(this.selectedUnit && this.selectedUnit.cta == 1) {
      this.getCTAs()
    }
    this.getCourseDownloads()
    if(unit.Company_Course_Unit_Users?.length > 0 && unit.Company_Course_Unit_Users[0].id) {
      this.setUnitVisited(unit.Company_Course_Unit_Users[0].id)
    }

    let units = this.courseUnits.filter(cm => {
      return cm.module_id == this.selectedModuleId
    })

    var countCompleted = 0;
    units.forEach(unit => {
      let unitUser = unit.Company_Course_Unit_Users.find(element => element.user_id == this.userId);
      if (unitUser?.progress == 100) {
        countCompleted = countCompleted + 1;
      }
    });
    this.selectedModuleUnitsCompleted = (countCompleted == units.length)  && (this.selectedModule[0].reward_tutor_package);

    if (this.selectedModuleUnitsCompleted) {
      this.selectedModulePackageId = this.selectedModule[0].package_id;
      this.selectedModulePackageText = this.selectedModule[0].package_text;
    }

    if(this.hasCourseVideoComments) {
      this.initializeCommentsList();
    }
  }

  selectBlockModule(module){
    this.selectedModuleId = module.id
    this.isModuleLocked = this.checkLockAccess(module.id)
    this.selectedModuleTitle = this.isModuleLocked ? this.getCourseModuleTitle(module) : ''
  }

  goToPreviousLesson() {
    let current_unit_index = 0
    if(this.course.course_units) {
      this.course.course_units.forEach((cu, index) => {
        if(cu.id == this.selectedUnit.id) {
          current_unit_index = index
        }
      })
    }

    if(current_unit_index != 0) {
      let previous_unit = this.course.course_units[current_unit_index - 1]
      this.selectUnit(previous_unit)
    }
  }

  goToNextLesson() {
    if(this.autoCompleteLesson) {
      this.markComplete(this.selectedUnit?.id, true);
    } else {
      this.selectNextUnit();
    }
  }

  selectNextUnit() {
    let current_unit_index = 0
    if(this.course.course_units) {
      this.course.course_units.forEach((cu, index) => {
        if(cu.id == this.selectedUnit.id) {
          current_unit_index = index
        }
      })
    }

    if(current_unit_index >= 0) {
      let next_unit = this.course.course_units[current_unit_index + 1]
      this.selectUnit(next_unit)
    }
  }

  async getSafeFileUrl() {
    if(this.selectedUnit.file) {
      if(this.selectedUnit.file.changingThisBreaksApplicationSecurity) {
        if(this.selectedUnit.option == 'Self-hosted') {
          this.selfHostedVideoSrc = this.selectedUnit.file.changingThisBreaksApplicationSecurity
          if(this.selfHostedVideo) {
            this.selfHostedVideo.nativeElement.src = this.selectedUnit.file.changingThisBreaksApplicationSecurity;
            this.selfHostedVideo.nativeElement.load();
          }
        }
      } else {
        if(this.selectedUnit.option == 'Self-hosted' || this.selectedUnit.Company_Course_Unit_Type.type == 'podcast') {
          this.selectedUnit.file = this.sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + this.selectedUnit.file + '?controls=0');
          if(this.selectedUnit.option == 'Self-hosted') {
            this.selfHostedVideoSrc = this.selectedUnit.file
            if(this.selfHostedVideo) {
              this.selfHostedVideo.nativeElement.src = this.selectedUnit.file.changingThisBreaksApplicationSecurity ? this.selectedUnit.file.changingThisBreaksApplicationSecurity : this.selectedUnit.file;
              this.selfHostedVideo.nativeElement.load();
            } else {
              setTimeout(() => {
                if(this.selfHostedVideo) {
                  this.selfHostedVideo.nativeElement.src = this.selectedUnit.file.changingThisBreaksApplicationSecurity ? this.selectedUnit.file.changingThisBreaksApplicationSecurity : this.selectedUnit.file;
                  this.selfHostedVideo.nativeElement.load();
                }
              }, 500)
            }
          }
        } else if(this.selectedUnit.option == 'YouTube' || this.selectedUnit.option == 'Vimeo') {
          this.selectedLesson = this.getLessonContent(this.selectedUnit);
        } else {
          if(this.selectedUnit.Company_Course_Unit_Type.type == 'pdf') {
            this.selectedUnitSafeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + this.getFileContent(this.selectedUnit))
          } else if(this.selectedUnit.Company_Course_Unit_Type.type == 'others') {
            this.selectedUnitSafeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://docs.google.com/viewer?url=' + this.courseUnitSrc + this.selectedUnit.file)
          }
          this.selectedUnit.file = this.selectedUnit.file
        }
      }
    }
    if(this.selectedUnit.url) {
      this.selectedLesson = this.getLessonContent(this.selectedUnit)
    }
    if(this.selectedUnit.option == 'Vimeo' && this.course.vimeo_token && this.selectedUnit.vimeo_id > 0) {
      let result = get(await this._coursesService.getVimeoEmbed(this.selectedUnit.vimeo_id, this.course.vimeo_token).toPromise(), 'result')
      if(result) {
        let player_embed_url = result.player_embed_url ? result.player_embed_url.replace(`https://player.vimeo.com/video/${this.selectedUnit.vimeo_id}`, '') : ''
        let iframe = result.iframe ? result.iframe.replace(`${this.selectedUnit.vimeo_id}?badge=0`, `${this.selectedUnit.vimeo_id}${player_embed_url}&amp;badge=0`) : ''
        if(iframe) {
          this.selectedLesson =  iframe
        }
      }
    }
    let selected_unit = this.selectedUnit && this.course.course_units && this.course.course_units.filter(u => {
      return u.id == this.selectedUnit.id
    })
    if(selected_unit && selected_unit[0]) {
      if(selected_unit[0].audio_embed) {
        if(selected_unit[0].audio_embed.changingThisBreaksApplicationSecurity) { 
        } else {
          this.selectedAudio = selected_unit[0].audio_embed
        }
      }
      if(selected_unit[0].audio_file) {
        if(selected_unit[0].audio_file.changingThisBreaksApplicationSecurity) { 
          this.selectedUnit.audio_file = selected_unit[0].audio_file
        } else {
          this.selectedUnit.audio_file = this.sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + selected_unit[0].audio_file + '?controls=0')
        }
      }
    }

    this.setSafeLessonURL()
    this.refreshArrows()
  }

  lessonCompleted() {
    if(this.selectedUnit) {
      const payload = {
        user_id: this.userId
      }
      this._coursesService.markComplete(this.selectedUnit.id, payload).subscribe(
        response => {
          this.getCourse()
          this.isSelectedUnitCompleted = true
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  downloadFile() {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `${this.courseUnitSrc}${this.selectedUnit.file}`);
    link.setAttribute('download', this.selectedUnitFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  downloadFileResource(download) {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `${this.courseUnitSrc}${this.getDownloadFile(download)}`);
    link.setAttribute('download', this.getDownloadFilename(download));
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  getModuleCategoryTitle(units, unit, i) {
    let module_category = this.getCourseUnitModuleCategoryTitle(unit)
    if(i == 0) {
        return module_category
    } else {

    }
    if(i - 1 >= 0 && unit.module_category) {
      // Check if previous category title is same with current
      if((units[i - 1].module_category && units[i - 1].module_category != unit.module_category) || !units[i - 1].module_category) {
        return module_category
      }
    }
  }

  getCourseUnitModuleCategoryTitle(unit) {
    return this.language == 'en' ? unit.module_category_en : (this.language == 'fr' ? (unit.module_category_fr || unit.module_category) : 
      (this.language == 'eu' ? (unit.module_category_eu || unit.module_category) : (this.language == 'ca' ? (unit.module_category_ca || unit.module_category) : 
      (this.language == 'de' ? (unit.module_category_de || unit.module_category) : unit.module_category)
      ))
    )
  }

  getCourseModuleTitle(module) {
    return this.language == 'en' ? module.title_en : (this.language == 'fr' ? (module.title_fr || module.title) : 
      (this.language == 'eu' ? (module.title_eu || module.title) : (this.language == 'ca' ? (module.title_ca || module.title) : 
      (this.language == 'de' ? (module.title_de || module.title) : module.title)
      ))
    )
  }

  getCourseModuleDescription(module) {
    return this.language == 'en' ? module.description_en : (this.language == 'fr' ? (module.description_fr || module.description) : 
      (this.language == 'eu' ? (module.description_eu || module.description) : (this.language == 'ca' ? (module.description_ca || module.description) : 
      (this.language == 'de' ? (module.description_de || module.description) : module.description)
      ))
    )
  }

  getCourseUnitTitle(unit) {
    return this.language == 'en' ? unit.title_en : (this.language == 'fr' ? (unit.title_fr || unit.title) : 
      (this.language == 'eu' ? (unit.title_eu || unit.title) : (this.language == 'ca' ? (unit.title_ca || unit.title) : 
      (this.language == 'de' ? (unit.title_de || unit.title) : unit.title)
      ))
    )
  }

  playVideo() {
    this.playCurrentVideo = true
    this.setSafeLessonURL()
  }

  setSafeLessonURL() {
    if(this.selectedUnit?.url?.indexOf('iframe') < 0) {
      this.safeLessonURL = this.playCurrentVideo ? this.getSafeLessonUrl(this.selectedLesson + '?autoplay=1') : this.getSafeLessonUrl(this.selectedLesson)
    } else if((!this.course?.video_cover && !this.selectedUnit?.video_cover) && !this.selectedUnit?.vimeo_id) {
      this.safeLessonURL = this.getSafeLessonUrl(this.selectedLesson, this.selectedUnit?.option)
    }
  }

  addAutoPlay(url) {
    let is_safari = false
    if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
      is_safari = true      
    }
    let append_safari_muted = '&muted=1'
    let replace_string = 'autopause=0&autoplay=1'
    if(url) {
      if(url.indexOf('autopause=0') > 0) {
        if(is_safari) {
          replace_string += append_safari_muted
        }
        url = url.replace('autopause=0', replace_string)
      } else {
        if(is_safari) {
          replace_string += append_safari_muted
        }
        replace_string += '" width="'
        url =url.replace('" width="', '&autopause=0&autoplay=1" width="')
      }
    }
    return url
  }

  getModuleStatus(module) {
    let completed = true

    if(module.units) {
      module.units.forEach(unit => {
        if(unit.Company_Course_Unit_Users && unit.Company_Course_Unit_Users.length > 0 && unit.Company_Course_Unit_Users[0].progress != 100) {
          completed = false
        }
      })
    } else {
      completed = false
    }

    return completed
  }

  expandModule(module) {
    this.expandedModuleId = this.expandedModuleId == module.id ? '' : module.id
  }

  getSafeLessonUrl(selectedLesson, mode: string = '') {
    let url
    if(mode == 'Vidalytics') {
      url = `https://preview.vidalytics.com/embed/${selectedLesson}`
    } else {
      if(selectedLesson?.indexOf('youtube') >= 0) {
        url = selectedLesson?.replace('watch?v=', 'embed/')
        if(url && url.indexOf("&") > 0) {
          url = url.substring(0, url.indexOf("&"))
        }
      } else if(selectedLesson?.indexOf('vimeo') >= 0) {
        url = selectedLesson?.replace('vimeo.com/', 'player.vimeo.com/video/')
      } else if(selectedLesson?.indexOf('canva.com') >= 0 && selectedLesson?.indexOf('/watch?embed') < 0) {
        url = selectedLesson?.replace('/watch', '/watch?embed')
      } else {
        url = selectedLesson
      }
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  hasCourseStarted(course) {
    let show = true
    let start_date = course ? course.date : ''
    let today = moment().format('YYYY-MM-DD')

    if(start_date) {
      start_date = moment(course.date).format('YYYY-MM-DD')
      if(moment(today).isBefore(course.date)) {
        show = false
      }
    }

    return show
  }

  getCourseNotStartedText(course) {
    return `${this._translateService.instant('courses.startson')} ${moment(course.date).locale(this.language).format('D MMM')}`
  }

  canAccessLesson() {
    let result = true
    if(!this.selectedUnit?.video_always_available && this.hasMarkAsComplete && !this.isModuleLocked) {
      let currentUnitIndex
      let previousIndex
      let unit
      this.courseUnits && this.courseUnits.forEach((unit, index) => {
        if(unit.id == this.selectedUnit.id) {
          currentUnitIndex = index
        }
      })

      if(currentUnitIndex && currentUnitIndex > 0) {
        previousIndex = currentUnitIndex - 1
        unit = this.courseUnits[previousIndex]
      }

      if(unit && unit.id > 0) {
        // Check progress
        if(unit && unit.Company_Course_Unit_Users[0] && unit.Company_Course_Unit_Users[0].progress == 100) {
        } else {
          result = false
        }
      }
    }

    return result
  }

  getVideoDescription(selectedUnit) : String {
    return this.language == 'en' ? selectedUnit.description_en : (this.language == 'fr' ? selectedUnit.description_fr : 
      (this.language == 'eu' ? selectedUnit.description_eu: (this.language == 'ca' ? selectedUnit.description_ca : 
      (this.language == 'de' ? selectedUnit.description_de : selectedUnit.description)
      ))
    )
  }

  getBlockedModuleText(selectedUnit) : String {
    return this.language == 'en' ? selectedUnit.blocked_module_text_en : (this.language == 'fr' ? selectedUnit.blocked_module_text_fr : 
      (this.language == 'eu' ? selectedUnit.blocked_module_text_eu: (this.language == 'ca' ? selectedUnit.blocked_module_text_ca : 
      (this.language == 'de' ? selectedUnit.blocked_module_text_de : selectedUnit.blocked_module_text)
      ))
    )
  }

  getTextContent(unit) {
    return unit ? (this.language == 'en' ? (unit.text_en ? (unit.text_en || unit.text) : unit.text) :
      (this.language == 'fr' ? (unit.text_fr ? (unit.text_fr || unit.text) : unit.text) : 
          (this.language == 'eu' ? (unit.text_eu ? (unit.text_eu || unit.text) : unit.text) : 
              (this.language == 'ca' ? (unit.text_ca ? (unit.text_ca || unit.text) : unit.text) : 
                  (this.language == 'de' ? (unit.text_de ? (unit.text_de || unit.text) : unit.text) : unit.text)
              )
          )
      )) : ''
  }

  getCourseTextContent() {
    let unit = this.selectedUnit;
    return unit ? (this.language == 'en' ? (unit.text_en ? (unit.text_en || unit.text) : unit.text) :
    (this.language == 'fr' ? (unit.text_fr ? (unit.text_fr || unit.text) : unit.text) : 
        (this.language == 'eu' ? (unit.text_eu ? (unit.text_eu || unit.text) : unit.text) : 
            (this.language == 'ca' ? (unit.text_ca ? (unit.text_ca || unit.text) : unit.text) : 
                (this.language == 'de' ? (unit.text_de ? (unit.text_de || unit.text) : unit.text) : unit.text)
            )
        )
    )) : ''
  }

  handleEditorInit(e) {
    let unit = this.selectedUnit;
    let text = unit ? (this.language == 'en' ? (unit.text_en ? (unit.text_en || unit.text) : unit.text) :
    (this.language == 'fr' ? (unit.text_fr ? (unit.text_fr || unit.text) : unit.text) : 
        (this.language == 'eu' ? (unit.text_eu ? (unit.text_eu || unit.text) : unit.text) : 
            (this.language == 'ca' ? (unit.text_ca ? (unit.text_ca || unit.text) : unit.text) : 
                (this.language == 'de' ? (unit.text_de ? (unit.text_de || unit.text) : unit.text) : unit.text)
            )
        )
    )) : ''
    setTimeout(() => {
        if (this.editor && this.iframeText && text && text) {
            this.editor.nativeElement.style.display = 'block'

            e.editor.setContent(text)
            this.iframeText.nativeElement.style.height = `${e.editor.container.clientHeight + 200}px`

            this.editor.nativeElement.style.display = 'none'

            this.iframeText.nativeElement.src =
                'data:text/html;charset=utf-8,' +
                '<html>' +
                '<head>' + e.editor.getDoc().head.innerHTML + '<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins" /><style>* {font-family: "Poppins", sans-serif;}</style></head>' +
                '<body>' + e.editor.getDoc().body.innerHTML + '</body>' +
                '</html>';
            this.iframeText.nativeElement.style.display = 'block'
        }
    }, 500)
  }

  markComplete(id, refresh = false) {
    const payload = {
      user_id: this.user.id
    }
    this._coursesService.markComplete(id, payload).subscribe(
      response => {
          if(refresh) {
            this.getCourse()
          }
          
          // Button text for Reward Package when all units are completed
          let units = this.courseUnits.filter(cm => {
            return cm.module_id == this.selectedModuleId
          })

          var countCompleted = 0;
          units.forEach(unit => {
            let unitUser = unit.Company_Course_Unit_Users.find(element => element.user_id == this.userId);
            if (unitUser && unitUser.progress == 100) {
              countCompleted = countCompleted + 1;
            }
          });
          this.selectedModuleUnitsCompleted = (countCompleted + 1 == units.length)  && (this.selectedModule[0].reward_tutor_package);

          if (this.selectedModuleUnitsCompleted) {
            this.selectedModulePackageId = this.selectedModule[0].package_id;
            this.selectedModulePackageText = this.selectedModule[0].package_text;
          }
          if(response['total_progress'] == 100 && this.hasCourseCreditSetting) {
            this.completemodalbutton?.nativeElement.click();
          } else {
            if(this.autoCompleteLesson) {
              this.selectNextUnit();
            } else {
              this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
              if(response['total_progress'] != 100) {
                this.goToNextLesson()
              }
            }
          }
      },
      error => {
          console.log(error);
      }
    );
  }

  onClick = ($event: ClickEvent) => {
    this.onClickResult = $event;
  };

  onRatingChange = ($event: RatingChangeEvent) => {
    this.onRatingChangeResult = $event;
    this.rating = $event?.rating;
  };

  onHoverRatingChange = ($event: HoverRatingChangeEvent) => {
    this.onHoverRatingChangeResult = $event;
  };

  submitEvaluation() {
    const payload = {
      course_id: this.course?.id,
      user_id: this.userId,
      company_id: this.companyId,
      rating: this.rating,
    }
    this._coursesService.courseCompleteEvaluate(payload).subscribe(
      response => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        this.closecompletemodalbutton?.nativeElement.click();
      },
      error => {
        console.log(error);
      }
    );
  }

  resetStatus(id, refresh = false) {
    const payload = {
      user_id: this.user.id
    }
    this._coursesService.resetStatus(id, payload).subscribe(
      response => {
        if(refresh) {
          this.getCourse();
        }
        this.selectedModuleUnitsCompleted = 0
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
      },
      error => {
        console.log(error);
      }
    );
  }

  toggleVideo(id, progress) {
    let videoPlayer= <HTMLVideoElement> document.getElementById('video-' + id);
    let status = this.videoPlayStatus.some(video => video.id === id);
    if(videoPlayer) {
      if(!status) {
        this.videoPlayStatus.push({
          id: id,
          status: 'playing',
          duration: 0,
          progress: progress
        });
        videoPlayer.play();
      } else {
        this.videoPlayStatus.forEach(video => {
          if(video.id == id) {
            if(video.status == 'playing') {
              video.status = 'paused';
              videoPlayer.pause();
            }  else {
              if(video.status == 'paused') {
                video.status = 'playing';
                videoPlayer.play();
              }
            }
          }
        })
      }
    }
  }

  toggleFullScreen(id) {
    let videoPlayer= <HTMLVideoElement> document.getElementById('video-' + id);

    if (videoPlayer.requestFullscreen) {
      videoPlayer.requestFullscreen();
    }
  }

  checkVideoDuration(id) {
    this.videoPlayStatus.forEach(video => {
      if(video.id == id && video.duration < 45) {
        video.duration = 45;
        this.markComplete(id);
        video.progress = 100;

        const index = this.courseUnits.findIndex((item) => item.id == id);
        this.courseUnits[index]['course_unit_users'][0] = {
          progress: 100
        }
      }
    });
  }

  toggleAudio(id) {
    let audioPlayer = <HTMLAudioElement> document.getElementById('audio-' + id);
    let status = this.audioPlayStatus.some(audio => audio.id === id);
    if(audioPlayer) {
      if(!status) {
        this.audioPlayStatus.push({
          id: id,
          status: 'playing',
          duration: 0
        });
        audioPlayer.play();
      } else {
        this.audioPlayStatus.forEach(audio => {
          if(audio.id == id) {
            if(audio.status == 'playing') {
              audio.status = 'paused';
              audioPlayer.pause();
            }  else {
              if(audio.status == 'paused') {
                audio.status = 'playing';
                audioPlayer.play();
              }
            }
          }
        })
      }
    }
  }

  toggleAudioFullScreen(id) {
    let audioPlayer= <HTMLVideoElement> document.getElementById('audio-' + id);

    if (audioPlayer.requestFullscreen) {
      audioPlayer.requestFullscreen();
    }
  }

  toggleiFrameFullScreen(id) {
    let iframe= <HTMLVideoElement> document.getElementById('iframe-' + id);

    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    }
  }

  buyNow(course) {
    this._router.navigate([`/courses/subscribe/${course.id}/${this.userId ? this.userId : 0}`])
  }

  changeTab(event) {
    this.tabSelected = true;
  }
  
  handleEditRoute() {
    this._router.navigate([`/courses/edit/${this.id}`]);
  }

  toggleEditHover(event) {
    this.editHover = event;
  }

  handleDelete() {
    if (this.id) {
      this.showConfirmationModal = false;
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmdelete"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmdeleteitem"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  confirm() {
    if(this.confirmMode == 'deletecomment') {
      this.deleteComment(this.selectedItem, true);
    } else if(this.confirmMode == 'deletechildcomment') {
      this.deleteChildComment(this.selectedItem, true);
    } else {
      this.deleteCourse(this.id, true);
    }
  }

  deleteCourse(id, confirmed) {
  }

  toggleDeleteHover(event) {
    this.deleteHover = event;
  }

  getScript() {
    let html = '';
    if(this.selectedUnit?.script) {
      let script_index = this.selectedUnit?.script?.indexOf('<script>');
      html = this.selectedUnit?.script?.substring(0, script_index);
      const re = /<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/g;
      const results = this.selectedUnit?.script?.match(re);
      if(results?.length > 0) {
        if(results[0]?.indexOf('<script>') >= 0 && results[0]?.indexOf('</script>') >= 0) {
          let myScript = this.renderer2.createElement('script');
          myScript.type = `text/javascript`;
          myScript.text = results[0].replace('<script>', '').replace('</script>', '')
          this.renderer2.appendChild(document.body, myScript);
        } else {
          if(results[0]?.indexOf('</script>') >= 0) {
            var regex = /<script.*?src="(.*?)"/gmi;
            var url = regex.exec(results[0]);
            if(url) {
              if(url[1]) {
                let myScript = this.renderer2.createElement('script');
                myScript.type = `text/javascript`;
                myScript.src = url[1];
                this.renderer2.appendChild(document.body, myScript);
                html = this.selectedUnit?.script?.replace('<script src="' + url[1] + '"></script>', ''); 
              }
            }
          }
        }
      }
    }

    return html;
  }

  displayAssessment(assessment) {
    this.showAssessment = false;
    this.currentAssessment = assessment;
    this.showAssessment = true;
    this.cd.detectChanges();
  }

  handleFinishAssessment(event) {
    if(event?.assessment_id > 0) {
      this.updateAssessment(event);
    }
  }

  handleResetAssessment(event) {
    if(event?.assessment_id > 0) {
      this.getUpdatedCourseAssessment(this.userId, this.id, event?.assessment?.id)
    }
  }

  getUpdatedCourseAssessment(user_id, course_id, course_assessment_item_id) {
    this._coursesService
      .fetchStudentCourseAssessment(user_id, course_id, course_assessment_item_id)
      .subscribe(
        (data) => {
          this.formatCourseAssessments(data.course_assessments, data.assessments, data.assessment_multiple_choice_options);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  updateAssessment(assessment) {
    if(assessment?.type == 'module') {
      if(this.afterModuleAssessments?.length > 0) {
        this.afterModuleAssessments?.forEach(ama => {
          if(ama.assessment_id == assessment.assessment_id) {
            ama.ratings = assessment?.ratings
          }
        })
      }
    } else if(assessment?.type == 'course') {
      if(assessment?.timing == 'beginning') {
        if(this.beginningCourseAssessment?.assessment_id > 0 && 
            this.beginningCourseAssessment?.assessment_id == assessment?.assessment_id) {
          this.beginningCourseAssessment.ratings = assessment?.ratings;
        }
      } else if(assessment?.timing == 'end') {
        if(this.endCourseAssessment?.assessment_id > 0 && 
            this.endCourseAssessment?.assessment_id == assessment?.assessment_id) {
          this.endCourseAssessment.ratings = assessment?.ratings;
        }
      }
    }
  }

  isiFrameHeight100Percent() {
    let result = false;

    if(this.selectedUnit?.script?.indexOf('height="100%"') >= 0) {
      result = true;
    }

    return result;
  }

  initializeCommentsList() {
    this._companyService
      .fetchComments(this.companyId, this.userId, 'course', this.selectedUnit?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.commentsList = this.formatComments(data.comments, data.user);
          this.cd.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatComments(comments, user) {
    let data;
    data = comments.map((comment, index) => {
      return {
        author_name: comment.name,
        display_date: moment(comment.created_at).locale(this.language).format('DD MMMM, YYYY HH:mm A'),
        date: moment(comment.created_at).format('YYYY-MM-DD'),
        author_image: `${this.apiPath}/${comment.image}`,
        likes: comment?.reactions?.length,
        show_reply: false,
        current_user_image: `${this.apiPath}/${user.image}`,
        current_user_name: user.first_name ? `${user.first_name} ${user.last_name}` : user.name,
        ...comment
      }
    })

    return data;
  }

  handleAddComment(event) {
    this.newComment = event;
    this._companyService.addModuleComment({ 
      company_id: this.companyId, 
      user_id: this.userId, 
      object: 'course', 
      object_id: this.selectedUnit?.id,
      parent_comment_id: null,
      comment: this.newComment,
    }).subscribe(
      (response) => {
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
        this.newComment = '';
        this.initializeCommentsList();
      }
    )
  } 

  handleDeleteComment(event) {
    if(event) {
      this.showConfirmationModal = false;
      this.selectedItem = event;
      this.confirmMode = 'deletecomment';
      this.confirmDeleteItemTitle = this._translateService.instant(
          "dialog.confirmdelete"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
          "dialog.confirmdeleteitem"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  deleteComment(id, confirmed) {
    if(confirmed) {
      this._companyService.deleteModuleComment(id).subscribe(
        response => {
          this.showConfirmationModal = false;
          let all_comments = this.commentsList;
            if (all_comments?.length > 0) {
              all_comments.forEach((comment, index) => {
                if (comment.id == this.selectedItem) {
                  all_comments.splice(index, 1);
                }
            });
          }
          
          this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
          this.commentsList = [];
          setTimeout(() => {
            this.commentsList = all_comments;
            this.cd.detectChanges();
          }, 100)
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  handleReactToComment(event) {
    let current_user_reaction = event?.reactions?.filter(react => {
      return react.user_id == this.userId
    })

    let mode = current_user_reaction?.length > 0 ? 'unlike' : 'like'
    let params = {
      company_id: this.companyId, 
      user_id: this.userId, 
      comment_id: event.id,
      heart: current_user_reaction?.length > 0 ? null : 1,
      mode,
    }
    this._companyService.reactToModuleComment(params).subscribe(
      response => {
        this.showConfirmationModal = false;
        let all_comments = this.commentsList;
          if (all_comments?.length > 0) {
            all_comments.forEach((comment, index) => {
              if (comment.id == event.id) {
                if(mode == 'like') {
                  let reactions = comment.reactions || [];
                  reactions.push({
                    comment_id: comment.id,
                    company_id: comment.company_id,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    heart: 1,
                    id: 100,
                    updated_at: null,
                    user_id: this.userId,
                  })
                  comment.reactions = reactions;
                  comment.likes = reactions?.length;
                } else if(mode == 'unlike') {
                  if(comment.reactions?.length > 0) {
                    comment.reactions.forEach((rxn, idx) => {
                      if(rxn.user_id == this.userId && rxn.comment_id == comment.id) {
                        comment.reactions.splice(idx, 1);
                      }
                    })
                  }
                  comment.likes = comment.reactions?.length
                }
              }
          });
        }
        
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        this.commentsList = [];
        setTimeout(() => {
          this.commentsList = all_comments;
          this.cd.detectChanges();
        }, 100)
      },
      error => {
        console.log(error);
      }
    )
  }

  handleAddChildComment(event) {
    this.newComment = event?.child_comment;
    this._companyService.addModuleComment({ 
      company_id: this.companyId, 
      user_id: this.userId, 
      object: 'course', 
      object_id: this.id,
      parent_comment_id: event.item.id,
      comment: this.newComment,
    }).subscribe(
      (response) => {
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
        this.newComment = '';
        this.initializeCommentsList();
      }
    )
  } 

  handleDeleteChildComment(event) {
    if(event) {
      this.showConfirmationModal = false;
      this.selectedItem = event;
      this.confirmMode = 'deletechildcomment';
      this.confirmDeleteItemTitle = this._translateService.instant(
          "dialog.confirmdelete"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
          "dialog.confirmdeleteitem"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  deleteChildComment(id, confirmed) {
    if(confirmed) {
      this._companyService.deleteModuleComment(id.child_comment_id).subscribe(
        response => {
          this.showConfirmationModal = false;
          let all_comments = this.commentsList;
            if (all_comments?.length > 0) {
              all_comments.forEach((comment, index) => {
                if (comment.replies?.length > 0) {
                  comment?.replies?.forEach((reply, idx) => {
                    if(reply.id == id.child_comment_id) {
                      comment?.replies.splice(idx, 1);
                    }
                  })
                }
            });
          }
          
          this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
          this.commentsList = [];
          setTimeout(() => {
            this.commentsList = all_comments;
            this.cd.detectChanges();
          }, 100)
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  maximizeWindow() {
    this.isExpanded = true;
  }

  minimizeWindow() {
    this.isExpanded = false;
  }

  openIntroPDF() {
    this.showAssessment = false;
    this.showIntroPDF = false;
    setTimeout(() => {
      this.showIntroPDF = true;
    }, 100)
  }

  getAssessmentTitle(assessment) {
    return assessment ? this.language == 'en' ? (assessment.assessment_title_en || assessment.assessment_title) : (this.language == 'fr' ? (assessment.title_fr || assessment.assessment_title) : 
      (this.language == 'eu' ? (assessment.assessment_title_eu || assessment.assessment_title) : (this.language == 'ca' ? (assessment.assessment_title_ca || assessment.assessment_title) : 
      (this.language == 'de' ? (assessment.assessment_title_de || assessment.assessment_title) : (this.language == 'it' ? (assessment.assessment_title_it || assessment.assessment_title) : assessment.assessment_title)
      )))
    ) : ''
  }

  getScriptContent(content) {
    return this.language == 'en' ? (content.script_en || content.script) : (this.language == 'fr' ? (content.script_fr || content.script) : 
      (this.language == 'eu' ? (content.script_eu || content.script) : (this.language == 'ca' ? (content.script_ca || content.script) : 
      (this.language == 'de' ? (content.script_de || content.script) : (this.language == 'it' ? (content.script_it || content.script) : content.script)
      )))
    )
  }

  getFileContent(content) {
    return this.language == 'en' ? (content.file_en || content.file) : (this.language == 'fr' ? (content.file_fr || content.file) : 
      (this.language == 'eu' ? (content.file_eu || content.file) : (this.language == 'ca' ? (content.file_ca || content.file) : 
      (this.language == 'de' ? (content.file_de || content.file) : (this.language == 'it' ? (content.file_it || content.file) : content.file)
      )))
    )
  }

  getLessonContent(lesson) {
    return this.language == 'en' ? (lesson.url_en || lesson.url) : (this.language == 'fr' ? (lesson.url_fr || lesson.url) : 
      (this.language == 'eu' ? (lesson.url_eu || lesson.url) : (this.language == 'ca' ? (lesson.url_ca || lesson.url) : 
      (this.language == 'de' ? (lesson.url_de || lesson.url) : (this.language == 'it' ? (lesson.url_it || lesson.url) : lesson.url)
      )))
    )
  }

  getDownloadFilename(download) {
    return this.language == 'en' ? (download.filename_en || download.filename) : (this.language == 'fr' ? (download.filename_fr || download.filename) : 
      (this.language == 'eu' ? (download.filename_eu || download.filename) : (this.language == 'ca' ? (download.filename_ca || download.filename) : 
      (this.language == 'de' ? (download.filename_de || download.filename) : (this.language == 'it' ? (download.filename_it || download.filename) : download.filename)
      )))
    )
  }

  getDownloadFile(download) {
    return this.language == 'en' ? (download.file_en || download.file) : (this.language == 'fr' ? (download.file_fr || download.file) : 
      (this.language == 'eu' ? (download.file_eu || download.file) : (this.language == 'ca' ? (download.file_ca || download.file) : 
      (this.language == 'de' ? (download.file_de || download.file) : (this.language == 'it' ? (download.file_it || download.file) : download.file)
      )))
    )
  }

  getDownloadType(download) {
    let file = this.language == 'en' ? (download.file_en || download.file) : (this.language == 'fr' ? (download.file_fr || download.file) : 
      (this.language == 'eu' ? (download.file_eu || download.file) : (this.language == 'ca' ? (download.file_ca || download.file) : 
      (this.language == 'de' ? (download.file_de || download.file) : (this.language == 'it' ? (download.file_it || download.file) : download.file)
      )))
    )

    let type = '';
    if(file?.indexOf('pdf') >= 0) { type = 'pdf' }
    else if(file?.indexOf('mp4') >= 0) { type = 'mp4' }
    else if(file?.indexOf('mp3') >= 0) { type = 'mp3' };

    return type;
  }

  getCourseIntroPDFURLSrc() {
    return this.language == "en"
      ? this.courseIntroPDFURLSrcEn
        ? this.courseIntroPDFURLSrcEn || this.courseIntroPDFURLSrc
        : this.courseIntroPDFURLSrc
      : this.language == "fr"
      ? this.courseIntroPDFURLSrcFr
        ? this.courseIntroPDFURLSrcFr || this.courseIntroPDFURLSrc
        : this.courseIntroPDFURLSrc
      : this.language == "eu"
      ? this.courseIntroPDFURLSrcEu
        ? this.courseIntroPDFURLSrcEu || this.courseIntroPDFURLSrc
        : this.courseIntroPDFURLSrc
      : this.language == "ca"
      ? this.courseIntroPDFURLSrcCa
        ? this.courseIntroPDFURLSrcCa || this.courseIntroPDFURLSrc
        : this.courseIntroPDFURLSrc
      : this.language == "de"
      ? this.courseIntroPDFURLSrcDe
        ? this.courseIntroPDFURLSrcDe || this.courseIntroPDFURLSrc
        : this.courseIntroPDFURLSrc
      : this.language == "it"
      ? this.courseIntroPDFURLSrcIt
        ? this.courseIntroPDFURLSrcIt || this.courseIntroPDFURLSrc
        : this.courseIntroPDFURLSrc
      : this.courseIntroPDFURLSrc;
  }

  handleGoBack() {
    this._location.back();
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}