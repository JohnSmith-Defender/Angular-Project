import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { CoursesService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { initFlowbite } from "flowbite";
import { CourseUnitCardComponent } from "@share/components/card/course-unit/course-unit.component";
import { NgxPaginationModule } from "ngx-pagination";
import { COURSE_IMAGE_URL } from "@lib/api-constants";
import { SafeContentHtmlPipe } from "@lib/pipes";
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';
import get from "lodash/get";

@Component({
  selector: 'app-courses-unit',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
    CourseUnitCardComponent,
    NgxPaginationModule,
    SafeContentHtmlPipe,
  ],
  templateUrl: './unit.component.html'
})
export class CourseUnitComponent {
  private destroy$ = new Subject<void>();

  @Input() courseId!: number;
  @Input() unitId!: number;

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
  courseUnitData: any;
  courseUnit: any;
  coursesFeature: any;
  featureId: any;
  courseTitle: any;
  courseUnitTitle: any;
  courseUnitType: any;
  courseUnitProgress: any;
  courseUnitVideoCoverSrc: any;
  courseVideoCoverSrc: any;
  playCurrentVideo: boolean = false;
  selectedLesson: any;
  showTitle: boolean = false;
  course: any;
  isModuleLocked: boolean = false;
  courseModules: any;
  blockedModuleText: any;
  availableOn: any;
  availableAfterCompletion: boolean = false;
  courseTutors: any = [];
  hasCoursePayment: boolean = false;
  hasCourseCategories: boolean = false;
  isAdvancedCourse: boolean = false;
  canLockUnlockModules: boolean = false;
  hasMarkAsComplete: boolean = false;
  onlyAssignedTutorAccess: boolean = false;
  selfHostedVideoSrc = '';
  courseUnitTypeSrc: string = environment.api +  '/get-course-unit-type-image/';
  courseUnitSrc: string = environment.api +  '/get-course-unit-file/';
  videoSrc = '';
  safeLessonURL: any = '';
  @ViewChild('selfHostedVideo', { static: false }) selfHostedVideo: ElementRef | undefined;
  selectedUnitSafeFileUrl: any;
  selectedAudio: any;
  courseUnitDownloads: any;

  constructor(
    private _router: Router,
    private _coursesService: CoursesService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar,
    private _sanitizer: DomSanitizer,
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

    this.getCourseUnit();
  }

  getCourseUnit() {
    this._coursesService
      .fetchCourseUnit(this.courseId, this.unitId, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.courseUnitData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.courseUnitData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data);
    this.mapUserPermissions(data?.user_permissions);
    this.formatCourseUnit(data);
    this.initializeBreadcrumb(data);
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
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 3
      );
  }

  formatCourseUnit(data) {
    this.course = data?.course;
    this.courseUnit = data?.unit;
    this.courseModules = data?.course_modules;
    this.courseTutors = data?.course_tutors;
    this.courseTitle = this.getCourseTitle(data?.course);
    this.courseUnitTitle =this.getCourseUnitTitle(this.courseUnit);
    this.courseUnitType = data?.unit?.Company_Course_Unit_Type;
    this.courseUnitProgress = data?.unit?.Company_Course_Unit_Users?.length > 0 ? data?.unit?.Company_Course_Unit_Users[0] : '';
    this.courseUnitVideoCoverSrc = data?.unit?.video_cover ? `${COURSE_IMAGE_URL}/${data?.unit?.video_cover}` : '';
    this.courseVideoCoverSrc = data?.course?.video_cover ? `${COURSE_IMAGE_URL}/${data?.course?.video_cover}` : '';
    this.courseUnitDownloads = data?.downloads; 
    this.isModuleLocked = this.checkLockAccess(this.courseUnit?.module_id);
    if(!this.isModuleLocked || this.superAdmin) {
      this.selectedLesson = this.courseUnit?.url;
      this.getSafeFileUrl();
    }
  }

  async getSafeFileUrl() {
    if(this.courseUnit?.file) {
      if(this.courseUnit?.file.changingThisBreaksApplicationSecurity) {
        if(this.courseUnit?.option == 'Self-hosted') {
          this.selfHostedVideoSrc = this.courseUnit?.file.changingThisBreaksApplicationSecurity
          if(this.selfHostedVideo) {
            this.selfHostedVideo.nativeElement.src = this.courseUnit?.file.changingThisBreaksApplicationSecurity;
            this.selfHostedVideo.nativeElement.load();
          }
        }
      } else {
        if(this.courseUnit?.option == 'Self-hosted' || this.courseUnit?.Company_Course_Unit_Type.type == 'podcast') {
          this.courseUnit['file'] = this._sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + this.courseUnit?.file + '?controls=0');
          if(this.courseUnit?.option == 'Self-hosted') {
            this.selfHostedVideoSrc = this.courseUnit?.file
            if(this.selfHostedVideo) {
              this.selfHostedVideo.nativeElement.src = this.courseUnit?.file.changingThisBreaksApplicationSecurity ? this.courseUnit?.file.changingThisBreaksApplicationSecurity : this.courseUnit?.file;
              this.selfHostedVideo.nativeElement.load();
            } else {
              setTimeout(() => {
                if(this.selfHostedVideo) {
                  this.selfHostedVideo.nativeElement.src = this.courseUnit?.file.changingThisBreaksApplicationSecurity ? this.courseUnit?.file.changingThisBreaksApplicationSecurity : this.courseUnit?.file;
                  this.selfHostedVideo.nativeElement.load();
                }
              }, 500)
            }
          }
        } else if(this.courseUnit?.option == 'YouTube' || this.courseUnit?.option == 'Vimeo') {
          this.selectedLesson = this.courseUnit?.url
        } else {
          if(this.courseUnit?.Company_Course_Unit_Type.type == 'pdf') {
            this.selectedUnitSafeFileUrl = this._sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + this.courseUnit?.file)
          } else if(this.courseUnit?.Company_Course_Unit_Type.type == 'others') {
            this.selectedUnitSafeFileUrl = this._sanitizer.bypassSecurityTrustResourceUrl('https://docs.google.com/viewer?url=' + this.courseUnitSrc + this.courseUnit?.file)
          }
          this.courseUnit['file'] = this.courseUnit?.file
        }
      }
    }
    if(this.courseUnit?.url) {
      this.selectedLesson = this.courseUnit?.url
    }
    if(this.courseUnit?.option == 'Vimeo' && this.course.vimeo_token && this.courseUnit?.vimeo_id > 0) {
      let result = get(await this._coursesService.getVimeoEmbed(this.courseUnit?.vimeo_id, this.course.vimeo_token).toPromise(), 'result')
      if(result) {
        let player_embed_url = result.player_embed_url ? result.player_embed_url.replace(`https://player.vimeo.com/video/${this.courseUnit?.vimeo_id}`, '') : ''
        let iframe = result.iframe ? result.iframe.replace(`${this.courseUnit?.vimeo_id}?badge=0`, `${this.courseUnit?.vimeo_id}${player_embed_url}&amp;badge=0`) : ''
        if(iframe) {
          this.selectedLesson =  iframe
        }
      }
    }
    let selected_unit = this.courseUnit && this.course.course_units && this.course.course_units.filter(u => {
      return u.id == this.courseUnit?.id
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
          this.courseUnit['audio_file'] = selected_unit[0].audio_file
        } else {
          this.courseUnit['audio_file'] = this._sanitizer.bypassSecurityTrustResourceUrl(this.courseUnitSrc + selected_unit[0].audio_file + '?controls=0')
        }
      }
    }

    this.setSafeLessonURL()
  }

  checkLockAccess(moduleId) {
    var locked = false
    if(moduleId > 0) {
      if(this.courseModules?.length > 0) {
        let index
        let module
        this.courseModules.forEach((mod, i) => {
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
          this.courseModules.forEach((mod, idx) => {
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

              if(module && module.id == this.course?.module_id) {
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

  setSafeLessonURL() {
    if(this.courseUnit?.url?.indexOf('iframe') < 0) {
      this.safeLessonURL = this.playCurrentVideo ? this.getSafeLessonUrl(this.selectedLesson + '?autoplay=1') : this.getSafeLessonUrl(this.selectedLesson)
    } else if((!this.course?.video_cover && !this.courseUnit?.video_cover) && !this.courseUnit?.vimeo_id) {
      this.safeLessonURL = this.getSafeLessonUrl(this.selectedLesson, this.courseUnit?.option)
    }
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

    return this._sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  getVideoDescription(selectedUnit) : String {
    return this.language == 'en' ? selectedUnit.description_en : (this.language == 'fr' ? selectedUnit.description_fr : 
      (this.language == 'eu' ? selectedUnit.description_eu: (this.language == 'ca' ? selectedUnit.description_ca : 
      (this.language == 'de' ? selectedUnit.description_de : selectedUnit.description)
      ))
    )
  }

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = this.getCourseTitle(data?.course);
    this.level3Title = this.getCourseUnitTitle(data?.unit);
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
      : course.title;
  }

  getCourseUnitTitle(unit) {
    return this.language == "en"
      ? unit.title_en
        ? unit.title_en || unit.title
        : unit.title
      : this.language == "fr"
      ? unit.title_fr
        ? unit.title_fr || unit.title
        : unit.title
      : this.language == "eu"
      ? unit.title_eu
        ? unit.title_eu || unit.title
        : unit.title
      : this.language == "ca"
      ? unit.title_ca
        ? unit.title_ca || unit.title
        : unit.title
      : this.language == "de"
      ? unit.title_de
        ? unit.title_de || unit.title
        : unit.title
      : unit.title;
  }

  playVideo() {

  }

  addAutoPlay(selectedLesson) {

  }

  downloadFileResource(download) {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `${this.courseUnitSrc}${download.file}`);
    link.setAttribute('download', download.filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  markComplete(id, refresh = false) {
    const payload = {
      user_id: this.user.id
    }
    this._coursesService.markComplete(id, payload).subscribe(
      response => {
        if(this.courseUnit?.Company_Course_Unit_Users?.length > 0) {
          this.courseUnit.Company_Course_Unit_Users[0].progress = 100;
        }
        
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
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
        if(this.courseUnit?.Company_Course_Unit_Users?.length > 0) {
          this.courseUnit.Company_Course_Unit_Users[0].progress = 0;
        }
        
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
          console.log(error);
      }
    );
  }

  canAccessLesson() {
    let result = true
    if(!this.courseUnit?.video_always_available && this.hasMarkAsComplete && !this.isModuleLocked) {
      if(this.courseUnit.id > 0) {
        // Check progress
        if(this.courseUnit?.Company_Course_Unit_Users[0] && this.courseUnit?.Company_Course_Unit_Users[0].progress == 100) {
        } else {
          result = false
        }
      }
    }

    return result
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
