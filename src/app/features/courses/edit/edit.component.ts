import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, HostListener, Input, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { CoursesService, TutorsService } from "@features/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ButtonGroupComponent, NoAccessComponent, PageTitleComponent } from "@share/components";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  ImageCropperModule,
  ImageCroppedEvent,
  ImageTransform,
  base64ToFile,
} from "ngx-image-cropper";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { faRotateLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTabsModule } from "@angular/material/tabs";
import { ColorPickerModule } from 'ngx-color-picker';
import { QuillModule } from 'ngx-quill';
import moment from "moment";
import get from "lodash/get";
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
registerPlugin(FilepondPluginImagePreview, FilepondPluginImageEdit, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

@Component({
  selector: "app-courses-edit",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgMultiSelectDropDownModule,
    ImageCropperModule,
    FontAwesomeModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    ColorPickerModule,
    FilePondModule,
    QuillModule,
    ButtonGroupComponent,
    PageTitleComponent,
    NoAccessComponent,
  ],
  templateUrl: "./edit.component.html",
})
export class CourseEditComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() category: any;

  languageChangeSubscription: any;
  apiPath: string = environment.api;
  isMobile: boolean = false;
  language: any;
  companyId: number = 0;
  userId: number = 0;
  company: any;
  domain: any;
  primaryColor: any;
  buttonColor: any;
  companies: any;
  userRole: any;
  email: any;
  coursesFeature: any;
  featureId: any;
  pageName: any;
  superAdmin: boolean = false;
  canCreateCourse: any;
  languages: any = [];
  selectedLanguage: any = "es";
  defaultLanguage: any = "es";
  isLoading: boolean = true;
  issaving: boolean = false;
  errorMessage: string = "";
  formSubmitted: boolean = false;
  course: any;
  status: boolean = false;
  pageTitle: string = "";
  courseForm: any;
  searchByKeyword: boolean = false;
  hasMembersOnly: boolean = false;
  imgSrc: any;
  data: any = [];
  file: { name: string; image: any; } | undefined
  showImageCropper: boolean = false;
  imageChangedEvent: any = "";
  croppedImage: any = "";
  rotateLeftIcon = faRotateLeft;
  rotateRightIcon = faRotateRight;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  transform: ImageTransform = {};
  @ViewChild("modalbutton", { static: false }) modalbutton: ElementRef<HTMLInputElement> = {} as ElementRef;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  selectedLanguageChanged: boolean = false;
  showLanguageNote: boolean = false;
  buttonList: any = [];
  courseDifficultyLevels: any;
  courseDurationUnits: any;
  selectedCourseDifficulty: any = '';
  selectedCourseDurationUnit: any = '';
  canLinkQuizToCourse: boolean = false;
  hasCoursePayment: boolean = false;
  hasCourseCategories: boolean = false;
  isAdvancedCourse: boolean = false;
  hasCourseCustomSections: boolean = false;
  canLockUnlockModules: boolean = false;
  hasHotmartIntegration: boolean = false;
  hasCourseWallAccess: boolean = false;
  hasStripeInstalment: boolean = false;
  hasDifferentStripeAccount: boolean = false;
  tutorTypeDropdownSettings: any;
  tutorTypes: any = [];
  selectedCourseTutorType: any = '';
  courseCategoryDropdownSettings: any;
  checkedPaymentType: any;
  unitOptions: any;
  podcastOptions: any;
  courseCategories: any;
  selectedCourseCategory: any = [];
  videoBackgroundSrc: any;
  videoBackgroundImgSrc: any;
  videoBackgroundFile: { name: string; image: any; } | undefined;
  uploadImageMode: string = '';
  courseFormSubmitted: boolean = false;
  selectedPaymentType: any;
  requirePayment: boolean = false;
  description: any;
  selectedCourseInstructor: any;
  title: any;
  newCourseSaving: boolean = false;
  selectedStripeAccount: any = '';
  tutorDropDownSettings: any;
  studentDropDownSettings: any;
  startButtonColor: any;
  buyNowButtonColor: any;
  otherSettings: any;
  hasCustomMemberTypeSettings: boolean = false;
  memberTypes: any;
  memberRoles: any;
  requireApproval: boolean = false;
  hotmartCourseImgSrc: any;
  hotmartProductId: any;
  paymentTypes: any;
  tutors: any;
  selectedCourseTutor: any;
  tabIndex = 0;
  tabSelected: boolean = false;
  courseUnits: any;
  courseCategoryMapping: any;
  textSizeUnit: any = 12;
  selectedCoursePackage: any = '';
  activatePackage: boolean = false;
  allowUploadResources: boolean = false;
  courseModuleCategories: any;
  courseModules: any;
  courseFaqs: any;
  hasTutors: boolean = false;
  courseCredits: any;
  hasCourseCreditSetting: any;
  buyNowStatus: any = false
  ctaStatus: any = false

  selectedModuleId: any;
  moduleTitle: any;
  moduleTitleEn: any;
  moduleTitleFr: any;
  moduleTitleEu: any;
  moduleTitleCa: any;
  moduleTitleDe: any;
  moduleTitleIt: any;
  moduleNumber: any;
  moduleDescription: any;
  moduleDescriptionEn: any;
  moduleDescriptionFr: any;
  moduleDescriptionEu: any;
  moduleDescriptionCa: any;
  moduleDescriptionDe: any;
  moduleDescriptionIt: any;
  courseModuleMode: any;
  courseModuleFormSubmitted: boolean = false;
  showModuleDetails: boolean = false;
  unlockModuleQuestions: any = [];
  selectedUnlockQuestionId: any;
  unlockDate: any;
  unlockAfterStartDays: any;
  moduleAvailableAfter: any;
  isPackageRewardUnreward: boolean = false;
  selectedTutorPackage: any = '';
  selectedTutorPackageText: any = '';
  blockedModuleText: any = '';
  blockedModuleTextEN: any = '';
  blockedModuleTextCA: any = '';
  blockedModuleTextDE: any = '';
  blockedModuleTextEU: any = '';
  blockedModuleTextFR: any = '';
  blockedModuleTextIT: any = '';
  isModuleLockUnlock: boolean = false;
  packages: any;
  otherStripeAccounts: any = [];
  wallStatus: boolean = false;
  selectedHotmartCourse: any;
  selectedWall: any;

  courseDownloadMode: any;
  courseDownloadFormSubmitted: boolean = false;
  showDownloadDetails: boolean = false;
  selectedDownloadId: any;
  selectedDownloadUnitId: any = '';
  courseDownloadTitle: any;
  courseDownloadFileName: any;
  courseDownloads: any = [];
  courseLessonFileSrc: string = environment.api +  '/get-course-unit-file/';
  courseUnitFileName: any = '';
  courseUnitFileNameEn: any = '';
  courseUnitFileNameFr: any = '';
  courseUnitFileNameEu: any = '';
  courseUnitFileNameCa: any = '';
  courseUnitFileNameDe: any = '';
  courseUnitFileNameIt: any = '';
  allCourseDownloads: any = [];
  selectedDownloadUnit: any = '';
  downloadFileTypes: any = [];
  selectedDownloadType: any = '';
  selectedCourseDownloadId: any;
  courseDownloadFile: any;

  showUnitDetails: boolean = false;
  videoBackgroundUnitFile: any;
  videoBackgroundImgSrcUnit: any;
  courseUnitMode: any
  courseUnitFormSubmitted: boolean = false
  unitNumber: any
  unitTitle: any
  unitTitleEn: any
  unitTitleFr: any
  unitTitleEu: any
  unitTitleCa: any
  unitTitleDe: any
  unitTitleIt: any
  unitDuration: any
  selectedUnitType: any = ''
  selectedUnitId: any
  selectedCourseUnitDurationUnit: any = ''
  selectedUnitModule: any = ''
  selectedUnitModuleCategory: any = ''
  text: any = ''
  textEN: any = ''
  textCA: any = ''
  textDE: any = ''
  textEU: any = ''
  textFR: any = ''
  textIT: any = ''
  videoDescription: any = ''
  videoDescriptionEN: any = ''
  videoDescriptionCA: any = ''
  videoDescriptionDE: any = ''
  videoDescriptionEU: any = ''
  videoDescriptionFR: any = ''
  videoDescriptionIT: any = ''
  unitTypes: any
  unitPoints: any
  courseUnitFile: any
  courseUnitFileUploadComplete: boolean = false
  selectedUnitOption: any = ''
  externalLink: any = ''
  cta: boolean = false
  ctaText: any
  ctaLink: any
  ctaList: any = []
  ctaMode: any
  ctaFormSubmitted: boolean = false
  ctaItemText: any
  ctaItemLink: any
  ctaItemNumber: any
  showCtaDetails: boolean = false
  selectedCtaId: any
  isVimeoIntegrationActive: boolean = false
  vimeoToken: any
  vimeoID: any
  videoAvailability: boolean = false
  groupWalls: any = []

  @ViewChild('myPond', {static: false}) myPond: any;
  @ViewChild('myPondEn', {static: false}) myPondEn: any;
  @ViewChild('myPondIt', {static: false}) myPondIt: any;

  @ViewChild('downloadPond', {static: false}) downloadPond: any;
  @ViewChild('downloadPondEn', {static: false}) downloadPondEn: any;
  @ViewChild('downloadPondIt', {static: false}) downloadPondIt: any;

  @ViewChild('courseIntroPond', {static: false}) courseIntroPond: any;
  @ViewChild('courseIntroPondEn', {static: false}) courseIntroPondEn: any;
  @ViewChild('courseIntroPondIt', {static: false}) courseIntroPondIt: any;

  pondOptions = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: this._translateService.instant('course-details.uploaddesc'),
    labelFileProcessing: this._translateService.instant('course-details.uploadprocessing'),
    labelFileProcessingComplete: this._translateService.instant('course-details.uploadcomplete'),
    labelFileProcessingAborted: this._translateService.instant('course-details.uploadcancelled'),
    labelFileProcessingError: this._translateService.instant('course-details.uploaderror'),
    labelTapToCancel: this._translateService.instant('course-details.uploadtapcancel'),
    labelTapToRetry: this._translateService.instant('course-details.uploadtapretry'),
    labelTapToUndo: this._translateService.instant('course-details.uploadtapundo'),
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseUnitFileName = 'courseLessonFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseUnitFileName);
        localStorage.setItem('course_unit_file', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_unit_file', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
    },
  };
  pondFiles = [];
  pondOptionsEn = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: this._translateService.instant('course-details.uploaddesc'),
    labelFileProcessing: this._translateService.instant('course-details.uploadprocessing'),
    labelFileProcessingComplete: this._translateService.instant('course-details.uploadcomplete'),
    labelFileProcessingAborted: this._translateService.instant('course-details.uploadcancelled'),
    labelFileProcessingError: this._translateService.instant('course-details.uploaderror'),
    labelTapToCancel: this._translateService.instant('course-details.uploadtapcancel'),
    labelTapToRetry: this._translateService.instant('course-details.uploadtapretry'),
    labelTapToUndo: this._translateService.instant('course-details.uploadtapundo'),
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseUnitFileNameEn = 'courseLessonFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseUnitFileNameEn);
        localStorage.setItem('course_unit_file_en', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_unit_file_en', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
    },
  };
  pondFilesEn = [];
  pondOptionsIt = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: this._translateService.instant('course-details.uploaddesc'),
    labelFileProcessing: this._translateService.instant('course-details.uploadprocessing'),
    labelFileProcessingComplete: this._translateService.instant('course-details.uploadcomplete'),
    labelFileProcessingAborted: this._translateService.instant('course-details.uploadcancelled'),
    labelFileProcessingError: this._translateService.instant('course-details.uploaderror'),
    labelTapToCancel: this._translateService.instant('course-details.uploadtapcancel'),
    labelTapToRetry: this._translateService.instant('course-details.uploadtapretry'),
    labelTapToUndo: this._translateService.instant('course-details.uploadtapundo'),
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseUnitFileNameIt = 'courseLessonFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseUnitFileNameIt);
        localStorage.setItem('course_unit_file_it', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_unit_file_it', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
    },
  };
  pondFilesIt = [];

  downloadPondOptions = {
      class: 'my-filepond',
      multiple: false,
      labelIdle: 'Arrastra y suelta tu archivo o <span class="filepond--label-action" style="color:#00f;text-decoration:underline;"> Navegar </span><div><small style="color:#006999;font-size:12px;">*Subir archivo</small></div>',
      labelFileProcessing: "En curso",
      labelFileProcessingComplete: "Carga completa",
      labelFileProcessingAborted: "Carga cancelada",
      labelFileProcessingError: "Error durante la carga",
      labelTapToCancel: "toque para cancelar",
      labelTapToRetry: "toca para reintentar",
      labelTapToUndo: "toque para deshacer",
      server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
          let course_download_unit_id = localStorage.getItem('course_download_unit_id') || '';

          const formData = new FormData();
          let fileExtension = file ? file.name.split('.').pop() : '';
          this.courseDownloadFileName = 'courseLessonDownloadFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
          formData.append('file', file, this.courseDownloadFileName);
          formData.append('course_unit_id', course_download_unit_id);
          localStorage.setItem('course_download_file', 'uploading');

          const request = new XMLHttpRequest();
          request.open('POST', environment.api + '/company/course/download-temp-upload');

          request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
          };

          request.onload = function () {
              if (request.status >= 200 && request.status < 300) {
              load(request.responseText);
              localStorage.setItem('course_download_file', 'complete');
              } else {
              error('oh no');
              }
          };

          request.send(formData);

          return {
          abort: () => {
              request.abort();
              abort();
          },
          };
      },
      },
  };
  downloadPondFiles = [];
  downloadPondOptionsEn = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: this._translateService.instant('course-details.uploaddesc'),
    labelFileProcessing: this._translateService.instant('course-details.uploadprocessing'),
    labelFileProcessingComplete: this._translateService.instant('course-details.uploadcomplete'),
    labelFileProcessingAborted: this._translateService.instant('course-details.uploadcancelled'),
    labelFileProcessingError: this._translateService.instant('course-details.uploaderror'),
    labelTapToCancel: this._translateService.instant('course-details.uploadtapcancel'),
    labelTapToRetry: this._translateService.instant('course-details.uploadtapretry'),
    labelTapToUndo: this._translateService.instant('course-details.uploadtapundo'),
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        let course_download_unit_id = localStorage.getItem('course_download_unit_id') || '';

        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseDownloadFileNameEn = 'courseLessonDownloadFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseDownloadFileNameEn);
        formData.append('course_unit_id', course_download_unit_id);
        localStorage.setItem('course_download_file_en', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/download-temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_download_file_en', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
    },
  };
  downloadPondFilesEn = [];
  downloadPondOptionsIt = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: this._translateService.instant('course-details.uploaddesc'),
    labelFileProcessing: this._translateService.instant('course-details.uploadprocessing'),
    labelFileProcessingComplete: this._translateService.instant('course-details.uploadcomplete'),
    labelFileProcessingAborted: this._translateService.instant('course-details.uploadcancelled'),
    labelFileProcessingError: this._translateService.instant('course-details.uploaderror'),
    labelTapToCancel: this._translateService.instant('course-details.uploadtapcancel'),
    labelTapToRetry: this._translateService.instant('course-details.uploadtapretry'),
    labelTapToUndo: this._translateService.instant('course-details.uploadtapundo'),
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        let course_download_unit_id = localStorage.getItem('course_download_unit_id') || '';

        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseDownloadFileNameIt = 'courseLessonDownloadFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseDownloadFileNameIt);
        formData.append('course_unit_id', course_download_unit_id);
        localStorage.setItem('course_download_file_it', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/download-temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_download_file_it', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
    },
  };
  downloadPondFilesIt = [];

  courseIntroPondOptions = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: this._translateService.instant('course-details.uploaddesc'),
    labelFileProcessing: this._translateService.instant('course-details.uploadprocessing'),
    labelFileProcessingComplete: this._translateService.instant('course-details.uploadcomplete'),
    labelFileProcessingAborted: this._translateService.instant('course-details.uploadcancelled'),
    labelFileProcessingError: this._translateService.instant('course-details.uploaderror'),
    labelTapToCancel: this._translateService.instant('course-details.uploadtapcancel'),
    labelTapToRetry: this._translateService.instant('course-details.uploadtapretry'),
    labelTapToUndo: this._translateService.instant('course-details.uploadtapundo'),
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        let course_intro_unit_id = localStorage.getItem('course_intro_unit_id') || '';

        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseIntroFileName = 'courseLessonIntroFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseIntroFileName);
        formData.append('course_intro_id', course_intro_unit_id);
        localStorage.setItem('course_intro_file', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/download-temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_intro_file', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
    },
  };
  courseIntroPondFiles = [];
  courseIntroPondOptionsEn = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: this._translateService.instant('course-details.uploaddesc'),
    labelFileProcessing: this._translateService.instant('course-details.uploadprocessing'),
    labelFileProcessingComplete: this._translateService.instant('course-details.uploadcomplete'),
    labelFileProcessingAborted: this._translateService.instant('course-details.uploadcancelled'),
    labelFileProcessingError: this._translateService.instant('course-details.uploaderror'),
    labelTapToCancel: this._translateService.instant('course-details.uploadtapcancel'),
    labelTapToRetry: this._translateService.instant('course-details.uploadtapretry'),
    labelTapToUndo: this._translateService.instant('course-details.uploadtapundo'),
    acceptedFileTypes: "application/pdf",
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        let course_intro_unit_id = localStorage.getItem('course_intro_unit_id') || '';

        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseIntroFileNameEn = 'courseLessonIntroFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseIntroFileNameEn);
        formData.append('course_intro_id', course_intro_unit_id);
        localStorage.setItem('course_intro_file_en', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/download-temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_intro_file_en', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
    },
  };
  courseIntroPondFilesEn = [];
  courseIntroPondOptionsIt = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: this._translateService.instant('course-details.uploaddesc'),
    labelFileProcessing: this._translateService.instant('course-details.uploadprocessing'),
    labelFileProcessingComplete: this._translateService.instant('course-details.uploadcomplete'),
    labelFileProcessingAborted: this._translateService.instant('course-details.uploadcancelled'),
    labelFileProcessingError: this._translateService.instant('course-details.uploaderror'),
    labelTapToCancel: this._translateService.instant('course-details.uploadtapcancel'),
    labelTapToRetry: this._translateService.instant('course-details.uploadtapretry'),
    labelTapToUndo: this._translateService.instant('course-details.uploadtapundo'),
    acceptedFileTypes: "application/pdf",
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        let course_intro_unit_id = localStorage.getItem('course_intro_unit_id') || '';

        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseIntroFileNameIt = 'courseLessonIntroFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseIntroFileNameIt);
        formData.append('course_intro_id', course_intro_unit_id);
        localStorage.setItem('course_intro_file_it', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/download-temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_intro_file_it', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
    },
  };
  courseIntroPondFilesIt = [];

  allTutors: any;
  filteredTutors: any;
  unitAvailability: boolean = false;
  unitAvailabilityDate: any;
  embedScript: any = '';
  allowCourseAccess: boolean = false;
  campusList: any = [];
  selectedCampus: any = '';
  facultyList: any = [];  
  selectedFaculty: any = '';
  businessUnitList: any = [];  
  selectedBusinessUnit: any = '';
  typeList: any = [];  
  selectedType: any = '';
  segmentList: any = [];  
  selectedSegment: any = '';
  brandingList: any = [];  
  selectedBranding: any = '';
  dropdownList: any;
  selectedItems :any;
  additionalPropertiesDropdownSettings = {};

  showAssessmentDetails: boolean = false;
  courseAssessmentMode: any;
  courseAssessmentFormSubmitted: boolean = false;
  assessmentTimings: any = [];
  selectedAssessmentTiming: any = '';
  assessmentTimingsTypes: any = [];
  selectedAssessmentTimingType: any = '';
  passingRate: any = '';
  requirePass: boolean = false;
  courseAssessments: any = [];
  selectedAssessmentId: any = '';
  selectedAssessmentModule: any = '';
  assessments: any = [];
  selectedAssessment: any = '';

  isUESchoolOfLife: boolean = false;
  hasCourseVideoComments: boolean = false;
  showComments: boolean = false;
  courseIntro: boolean = false;
  existingIntroPDFFile: any;
  existingIntroPDFFileURL: any;
  existingIntroRemoved: boolean = false;
  hasActivityCodeActivated: boolean = false;
  activityCode: any;
  activityCodeSigeca: any;

  cityDropdownSettings: any;
  cities: any = [];
  selectedCity: any = '';

  isDefaultPhoto: boolean = false;
  isDefaultVideo: boolean = false;
  setDefaultPhoto: boolean = false;
  setDefaultVideo: boolean = false;
  coverVideo: string = '';
  hasExistingVideo: boolean = false;
  existingVideoURL: string = '';
  existingVideoFile: string = '';
  uploadingVideoComplete: boolean = false;
  clearedVideo: boolean = false;
  courseVideoCoverUploaded: boolean = false;
  courseCoverVideoFileName: any = '';
  @ViewChild('coursePondVideo', {static: false}) coursePondVideo: any;
  eventPondVideoOptions = {
    class: 'event-filepond-video',
    multiple: false,
    labelIdle: 'Arrastra y suelta tu archivo o <span class="filepond--label-action" style="color:#00f;text-decoration:underline;"> Navegar </span><div><small style="color:#006999;font-size:12px;">*Subir archivo</small></div>',
    labelFileProcessing: "En curso",
    labelFileProcessingComplete: "Carga completa",
    labelFileProcessingAborted: "Carga cancelada",
    labelFileProcessingError: "Error durante la carga",
    labelTapToCancel: "toque para cancelar",
    labelTapToRetry: "toca para reintentar",
    labelTapToUndo: "toque para deshacer",
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
          const formData = new FormData();
          let fileExtension = file ? file.name.split('.').pop() : '';
          this.courseCoverVideoFileName = 'p_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
          formData.append('file', file, this.courseCoverVideoFileName);
          console.log('course video: ' + this.courseCoverVideoFileName)
          localStorage.setItem('course_cover_video_file', 'uploading');

          const request = new XMLHttpRequest();
          request.open('POST', environment.api + '/company/course/temp-upload');

          request.upload.onprogress = (e) => {
            progress(e.lengthComputable, e.loaded, e.total);
          };

          request.onload = function () {
              if (request.status >= 200 && request.status < 300) {
                load(request.responseText);
                localStorage.setItem('course_cover_video_file', 'complete');
              } else {
                error('oh no');
              }
          };

          request.send(formData);

          return {
            abort: () => {
              request.abort();
              abort();
            },
          };
      },
    },
  };
  eventPondVideoFiles = [];

  embedScriptEn: string = '';
  embedScriptFr: string = '';
  embedScriptEu: string = '';
  embedScriptCa: string = '';
  embedScriptDe: string = '';
  embedScriptIt: string = '';
  
  externalLinkEn: string = '';
  externalLinkFr: string = '';
  externalLinkEu: string = '';
  externalLinkCa: string = '';
  externalLinkDe: string = '';
  externalLinkIt: string = '';

  courseIntroFileName: any;
  courseIntroFileNameEn: any;
  courseIntroFileNameFr: any;
  courseIntroFileNameEu: any;
  courseIntroFileNameCa: any;
  courseIntroFileNameDe: any;
  courseIntroFileNameIt: any;
  courseIntroEn: boolean = false;
  courseIntroFr: boolean = false;
  courseIntroEu: boolean = false;
  courseIntroCa: boolean = false;
  courseIntroDe: boolean = false;
  courseIntroIt: boolean = false;
  existingIntroPDFFileEn: any;
  existingIntroPDFFileFr: any;
  existingIntroPDFFileEu: any;
  existingIntroPDFFileCa: any;
  existingIntroPDFFileDe: any;
  existingIntroPDFFileIt: any;
  existingIntroPDFFileURLEn: any;
  existingIntroPDFFileURLFr: any;
  existingIntroPDFFileURLEu: any;
  existingIntroPDFFileURLCa: any;
  existingIntroPDFFileURLDe: any;
  existingIntroPDFFileURLIt: any;
  existingIntroRemovedEn: boolean = false;
  existingIntroRemovedFr: boolean = false;
  existingIntroRemovedEu: boolean = false;
  existingIntroRemovedCa: boolean = false;
  existingIntroRemovedDe: boolean = false;
  existingIntroRemovedIt: boolean = false;

  courseDownloadTitleEn: any;
  courseDownloadTitleFr: any;
  courseDownloadTitleEu: any;
  courseDownloadTitleCa: any;
  courseDownloadTitleDe: any;
  courseDownloadTitleIt: any;
  courseDownloadFileNameEn: any;
  courseDownloadFileNameFr: any;
  courseDownloadFileNameEu: any;
  courseDownloadFileNameCa: any;
  courseDownloadFileNameDe: any;
  courseDownloadFileNameIt: any;
  courseDownloadFileEn: any;
  courseDownloadFileFr: any;
  courseDownloadFileEu: any;
  courseDownloadFileCa: any;
  courseDownloadFileDe: any;
  courseDownloadFileIt: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _coursesService: CoursesService,
    private _tutorsService: TutorsService,
    private _location: Location,
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

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
    this.courseForm = new FormGroup({
      'title': new FormControl('', [Validators.required]),
      'title_en': new FormControl(''),
      'title_fr': new FormControl(''),
      'title_eu': new FormControl(''),
      'title_ca': new FormControl(''),
      'title_de': new FormControl(''),
      'title_it': new FormControl(''),
      'description': new FormControl('', [Validators.required]),
      'description_en': new FormControl(''),
      'description_fr': new FormControl(''),
      'description_eu': new FormControl(''),
      'description_ca': new FormControl(''),
      'description_de': new FormControl(''),
      'description_it': new FormControl(''),
      'course_date': new FormControl(''),
      'duration': new FormControl(''),
      'points': new FormControl(''),
      'price': new FormControl(''),
      'ctatext': new FormControl(''),
      'ctalink': new FormControl(''),
    })
    this.courseCategoryDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: this.language == 'en' ? 'name_EN' :
      (this.language == 'fr' ? 'name_FR' : 
        (this.language == 'eu' ? 'name_EU' : 
          (this.language == 'ca' ? 'name_CA' : 
            (this.language == 'de' ? 'name_DE' :
              (this.language == 'it' ? 'name_IT' : 'name_ES')
            )
          )
        )
      ),
      selectAllText: this._translateService.instant('dialog.selectall'),
      unSelectAllText: this._translateService.instant('dialog.clearall'),
      limitSelection: 3,
      itemsShowLimit: 2,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    }
    this.tutorDropDownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this._translateService.instant('dialog.selectall'),
      unSelectAllText: this._translateService.instant('dialog.clearall'),
      itemsShowLimit: 6,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
      limitSelection: 300,
    }
    this.studentDropDownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this._translateService.instant('dialog.selectall'),
      unSelectAllText: this._translateService.instant('dialog.clearall'),
      itemsShowLimit: 6,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    }
    this.tutorTypeDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: this.language == 'en' ? 'name_EN' :
        (this.language == 'fr' ? 'name_FR' : 
            (this.language == 'eu' ? 'name_EU' : 
              (this.language == 'ca' ? 'name_CA' : 
                (this.language == 'de' ? 'name_DE' : 
                  (this.language == 'it' ? 'name_IT' :'name_ES')
                )
              )
            )
        ),
      selectAllText: this._translateService.instant('dialog.selectall'),
      unSelectAllText: this._translateService.instant('dialog.clearall'),
      itemsShowLimit: 8,
      allowSearchFilter: true
    }
    this.additionalPropertiesDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'value',
      selectAllText: this._translateService.instant('dialog.selectall'),
      unSelectAllText: this._translateService.instant('dialog.clearall'),
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
    this.cityDropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "city",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      itemsShowLimit: 3,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.unlockModuleQuestions = [
      {
        id: 1,
        question: '',
        options: [
          {
            id: -1,
            option: `${this._translateService.instant('course-details.unlocknextmodule')}`
          },{
            id: 1,
            option: `${this._translateService.instant('course-details.unlocknextmodule')} ${this._translateService.instant('course-details.afterstartdate')}`
          },
          {
              id: 2,
              option: this._translateService.instant('course-details.unlockdate')
          }
        ]
      }
    ]
    this.unitOptions = ['YouTube', 'Vimeo', 'External', 'Self-hosted'];
    this.podcastOptions = ['Embed', 'Self-hosted'];
    this.checkedPaymentType = [
      {
        id: "1",
        checked : false,
        alias : "one_time",
        reservation_price : null,
        instalment_price : [],
        assigned_dates : "",
        selected_assigned_date : "",
        specific_date : {
          payment_due_date_1 : ''
        },
        day_after_reservation : {
          payment_day_after_1 : ''
        }
      },
      {
        id : "3",
        checked : false,
        alias : "two_time",
        reservation_price : null,
        instalment_price : [],
        assigned_dates : [
          {
            id : 1,
            type : 'specificdate'
          },
          {
            id: 2,
            type : 'day_after_reservation'
          }
        ],
        selected_assigned_date : "",
        specific_date : {
          payment_due_date_1 : ''
        },
        day_after_reservation : {
          payment_day_after_1 : ''
        }
      },
      {
        id : "4",
        checked : false,
        alias : 'three_time',
        reservation_price : null,
        instalment_price : [],
        assigned_dates : [
          {
            id : 1,
            type : 'specificdate'
          },
          {
            id: 2,
            type : 'day_after_reservation'
          }
        ],
        selected_assigned_date : "",
        specific_date : {
          payment_due_date_1 : '',
          payment_due_date_2 : ''
        },
        day_after_reservation : {
          payment_day_after_1 : '',
          payment_day_after_2 : ''
        }
      }
    ]
    this.assessmentTimings = [
      {
        value: 'beginning',
        text: this._translateService.instant('course-assessment.beginning'),
        subtypes: [
          {
            value: "course",
            text: this._translateService.instant('course-assessment.course'),
          }
        ]
      },
      {
        value: 'end',
        text: this._translateService.instant('course-assessment.end'),
        subtypes: [
          {
            value: "course",
            text: this._translateService.instant('course-assessment.course'),
          }
        ]
      },
      {
        value: 'after',
        text: this._translateService.instant('course-assessment.after'),
        subtypes: [
          {
            value: "module",
            text: this._translateService.instant('course-assessment.module'),
          }
        ]
      }
    ]
    this.startButtonColor = this.buttonColor
    this.buyNowButtonColor = this.buttonColor
    if(this.companyId == 32) { this.fetchAdditionalProperties(); }
    this.fetchCourseData();
  }

  fetchCourseData() {
    this._coursesService
      .fetchCourseAdmin(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data);
          this.mapUserPermissions(data?.user_permissions);
          this.mapLanguages(data?.languages);
          this.courseCategories = data?.categories;
          this.courseDifficultyLevels = data?.course_difficulty_levels;
          this.courseDurationUnits = data?.course_duration_units;
          this.otherStripeAccounts = data?.other_stripe_accounts;
          this.assessments = data?.assessments;
          this.cities = data?.cities;
          this.formatCourseAssessments(data?.course_assessments);
          this.getOtherSettings(data?.settings?.other_settings, data?.member_types);
          this.getCourseWalls();
          if(this.companyId == 32) { this.formatAdditionalProperties(data); }
          if(this.id > 0) { this.fetchCourse(data) } else { this.isLoading = false; }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatAdditionalProperties(data) {
    if(data?.course_additional_properties_access) {
      this.allowCourseAccess = data?.course_additional_properties_access

      if(data?.course_additional_properties?.length > 0) {
        this.selectedCampus = data?.course_additional_properties?.map(category => {
          if(category.type === "campus") {
            return {
              id: category.id,
              value: category.value
            }
          }
        }).filter(category => category !== undefined)

        this.selectedFaculty = data?.course_additional_properties?.map(category => {
          if(category.type === "faculty") {
            return {
              id: category.id,
              value: category.value
            }
          }
        }).filter(category => category !== undefined)

        this.selectedBusinessUnit = data?.course_additional_properties?.map(category => {
          if(category.type === "bussines_unit") {
            return {
              id: category.id,
              value: category.value
            }
          }
        }).filter(category => category !== undefined)

        this.selectedType = data?.course_additional_properties?.map(category => {
          if(category.type === "type") {
            return {
              id: category.id,
              value: category.value
            }
          }
        }).filter(category => category !== undefined)

        this.selectedSegment = data?.course_additional_properties?.map(category => {
          if(category.type === "segment") {
            return {
              id: category.id,
              value: category.value
            }
          }
        }).filter(category => category !== undefined)

        this.selectedBranding = data?.course_additional_properties?.map(category => {
          if(category.type === "branding") {
            return {
              id: category.id,
              value: category.value
            }
          }
        }).filter(category => category !== undefined)
      }
    }
  }

  fetchAdditionalProperties() {
    this._companyService
      .fetchAdditionalPropertiesAdmin(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          const {campus,faculty,bussines_unit,type,segment,branding} = data.data;
          this.campusList = campus;
          this.facultyList = faculty;
          this.businessUnitList = bussines_unit;
          this.typeList = type;
          this.segmentList = segment;
          this.brandingList = branding;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.coursesFeature = features?.find((f) => f.feature_id == 11);
    this.featureId = this.coursesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.coursesFeature);
    this.pageTitle = this.id > 0 ? `${this._translateService.instant('landing.edit')} ${this.pageName}` : `${this._translateService.instant('landing-pages.createnew')} ${this.pageName}`;

    let tutorsFeature = features?.find(
      (f) => f.feature_id == 20 && f.status == 1
    );
    this.hasTutors = tutorsFeature?.feature_id > 0 ? true : false;
  }

  mapSubfeatures(data) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.canLinkQuizToCourse = subfeatures.some(
        (a) => a.name_en == "Link quiz to courses" && a.active == 1
      );
      this.hasCoursePayment = subfeatures.some(
        (a) => a.name_en == "Course fee" && a.active == 1
      );
      this.hasCourseCategories = subfeatures.some(
        (a) => a.name_en == "Categories" && a.active == 1
      );
      this.isAdvancedCourse = subfeatures.some(
        (a) => a.name_en == "Advanced course" && a.active == 1
      );
      this.hasCourseCustomSections = subfeatures.some(
        (a) => a.name_en == "Custom sections for course details" && a.active == 1
      );
      this.canLockUnlockModules = subfeatures.some(
        (a) => a.name_en == "Lock/unlock upon completion" && a.active == 1
      );
      this.hasHotmartIntegration = subfeatures.some(
        (a) => a.name_en == "Hotmart integration" && a.active == 1
      );
      this.hasCourseWallAccess = subfeatures.some(
        (a) => a.name_en == "Course-specific wall access" && a.active == 1
      );
      this.hasStripeInstalment = subfeatures.some(
        (a) => a.name_en == "Stripe Instalments" && a.active == 1
      );
      this.hasDifferentStripeAccount = subfeatures.some(
        (a) => a.name_en == "Different Stripe accounts" && a.active == 1
      );
      this.hasCourseCreditSetting = subfeatures.some(
        (a) => a.name_en == "Credits" && a.active == 1
      );
      this.hasCourseVideoComments = subfeatures.some(
        (a) => a.name_en == 'Course video comments' && a.active == 1 
      );
      this.hasActivityCodeActivated = subfeatures.some(
        (a) => a.name_en == "Activity Code" && a.active == 1
      );
    }

    if(this.isAdvancedCourse) {
      this.courseForm = new FormGroup({
        'title': new FormControl('', [Validators.required]),
        'title_en': new FormControl(''),
        'title_fr': new FormControl(''),
        'title_eu': new FormControl(''),
        'title_ca': new FormControl(''),
        'title_de': new FormControl(''),
        'title_it': new FormControl(''),
        'description': new FormControl('', [Validators.required]),
        'description_en': new FormControl(''),
        'description_fr': new FormControl(''),
        'description_eu': new FormControl(''),
        'description_ca': new FormControl(''),
        'description_de': new FormControl(''),
        'description_it': new FormControl(''),
        'course_date': new FormControl(''),
        'duration': new FormControl(''),
        'points': new FormControl(''),
        'price': new FormControl(''),
        'ctatext': new FormControl(''),
        'ctalink': new FormControl(''),
      })
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreateCourse =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 23
      );
  }

  mapLanguages(languages) {
    languages = languages?.map((language) => {
      return {
        ...language,
        name: this.getLanguageName(language),
      };
    });

    this.languages = languages?.filter((lang) => {
      return lang.status == 1;
    });
    this.defaultLanguage = languages
      ? languages.filter((lang) => {
          return lang.default == true;
        })
      : [];
    this.selectedLanguage = this.language || this.defaultLanguage;
    this.initializeButtonGroup();
  }

  initializeButtonGroup() {
    let list: any[] = [];
    this.languages?.forEach((language) => {
      list.push({
        id: language.id,
        value: language.code,
        text: this.getLanguageName(language),
        selected: this.selectedLanguage == language.code ? true : false,
        code: language.code,
      });
    });

    this.buttonList = list;
  }

  getLanguageName(language) {
    return this.language == "en"
      ? language.name_EN
      : this.language == "fr"
      ? language.name_FR
      : this.language == "eu"
      ? language.name_EU
      : this.language == "ca"
      ? language.name_CA
      : this.language == "de"
      ? language.name_DE
      : this.language == "it"
      ? language.name_IT
      : language.name_ES;
  }

  handleChangeLanguageFilter(event) {
    this.buttonList?.forEach((item) => {
      if (item.code == event.code) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedLanguage = event.code;
    this.selectedLanguageChanged = true;
  }

  closeLanguageNote() {
    this._localService.setLocalStorage("showLanguageNote", new Date());
    this.showLanguageNote = false;
  }

  getOtherSettings(settings, member_types) {
    this.otherSettings = settings;

    let other_settings: any[] = []
    if(this.otherSettings) {
        this.otherSettings.forEach(setting => {
        let section_title = setting.title_en
        let cont: any[] = []
        let content = setting.content
        if(content) {
            content.forEach(c => {
                if((section_title == 'Registration/Services' && c.title_en == 'Require subscription during registration with Stripe payment') ||
                    (section_title == 'Registration/Services' && c.title_en == 'STRIPE Secret API Key') ||
                    (section_title == 'Registration/Services' && c.title_en == 'Stripe Monthly Subscription API ID') ||
                    (section_title == 'Registration/Services' && c.title_en == 'Monthly Subscription Fee') ||
                    (section_title == 'Registration/Services' && c.title_en == 'STRIPE Publishable API Key') ||
                    (section_title == 'Registration/Services' && c.title_en == 'Require Stripe payment on specific member types') || 
                    (section_title == 'Registration/Services' && c.title_en == 'Custom member type expiration')
                ) {
                    // Skip
                } else {
                    cont.push(c)
                }
                });
            }

            other_settings.push({
                active: setting.active,
                content: cont,
                created_at: setting.created_at,
                id: setting.id,
                title_en: setting.title_en,
                title_es: setting.title_es
            })
        });
    }

    this.otherSettings = other_settings
    
    if(this.otherSettings) {
        this.otherSettings.forEach(m => {
            if(m.title_es == 'Stripe') {
                if(m.content) {
                    let customMemberTypeSettings = m.content.filter(c => {
                        return c.title_en.indexOf('Require Stripe payment on specific member types') >= 0
                    })
                    if(customMemberTypeSettings && customMemberTypeSettings[0]) {
                        this.hasCustomMemberTypeSettings = customMemberTypeSettings[0].active == 1 ? true : false
                    }

                    let stripeSettings = m.content.filter(c => {
                      return c.title_en.indexOf('Multiple Stripe Accounts') >= 0
                    })

                    if(stripeSettings && stripeSettings[0]) {
                      this.hasDifferentStripeAccount = (stripeSettings[0].active == 1 && this.hasDifferentStripeAccount) ? true : false
                    }
                }
            }
        })

        if(this.hasCustomMemberTypeSettings) {
            this.getCustomMemberTypes(member_types)
        }
    }
  }

  getCustomMemberTypes(member_types) {
    this.memberTypes = member_types;
    this.memberRoles = []
    if(this.memberTypes) {
      this.memberTypes.forEach(mt => {
        this.memberRoles.push({
          id: mt.id,
          role: mt.type_es
        })
        if(mt.require_approval == 1 || this.companyId == 15) {
          this.requireApproval = true
        }
      })
  
      this.memberRoles.push({
        id: 4,
        role: 'Super Admin'
      })
    }
  }

  fetchCourse(data) {
   this.formatCourse(data);
   this.isLoading = false;
  }

  formatCourse(data) {
    this.course = data?.course;
    
    this.selectedStripeAccount = (this.course?.other_stripe_account_id > 0 || this.course?.other_stripe_account_id == 0) ? this.course?.other_stripe_account_id : '';
    if(this.hasTutors) {
      this.getTutors();
      this.getTutorPackages();
    }
    if(this.course?.payment_type == 1) {
      this.checkedPaymentType[0].checked = true;
    }
    if(data?.recurring_payments){
      data?.recurring_payments.map(data => {
        this.checkedPaymentType.filter((type, index)  => {
          if(data.payment_type == type.id){
            let specific_date_1 = data.specific_date_1
            let specific_date_2 = data.specific_date_2
            this.checkedPaymentType[index] = {
              ...this.checkedPaymentType[index], 
              checked: data.status == 1 ? true : false, 
              reservation_price: data.reservation_price,
              instalment_price : type.id == 3 ? [data.first_installment] : (type.id == 4 && [data.first_installment, data.second_installment]),
              selected_assigned_date : data.day_after_reservation_1 ? 2 : 1,
              specific_date : {
                payment_due_date_1 : data.specific_date_1 ? specific_date_1 : '',
                payment_due_date_2 : data.specific_date_2 ? specific_date_2 : ''
              },
              day_after_reservation : {
                payment_day_after_1 : data.day_after_reservation_1 ? data.day_after_reservation_1 : '',
                payment_day_after_2 : data.day_after_reservation_2 ? data.day_after_reservation_2 : ''
              }
            }
          }
        })
      })
    }
    this.ctaStatus = this.course.cta_status == 1? true : false;
    this.buyNowStatus = this.course.buy_now_status ==1? true : false;
    this.paymentTypes = data?.payment_types?.length > 0 && this.hasStripeInstalment ? data?.payment_types : data?.payment_types?.filter((data) => {return data.id  == 1});
    
    this.courseForm.controls['title']?.setValue(this.course.title)
    this.courseForm.controls['title_en']?.setValue(this.course.title_en)
    this.courseForm.controls['title_fr']?.setValue(this.course.title_fr)
    this.courseForm.controls['title_eu']?.setValue(this.course.title_eu)
    this.courseForm.controls['title_ca']?.setValue(this.course.title_ca)
    this.courseForm.controls['title_de']?.setValue(this.course.title_de)
    this.courseForm.controls['title_it']?.setValue(this.course.title_it)
    this.courseForm.controls['description']?.setValue(this.course.description)
    this.courseForm.controls['description_en']?.setValue(this.course.description_en)
    this.courseForm.controls['description_fr']?.setValue(this.course.description_fr)
    this.courseForm.controls['description_eu']?.setValue(this.course.description_eu)
    this.courseForm.controls['description_ca']?.setValue(this.course.description_ca)
    this.courseForm.controls['description_de']?.setValue(this.course.description_de)
    this.courseForm.controls['description_it']?.setValue(this.course.description_it)
    this.courseForm.controls['points']?.setValue(this.course.points);
    this.courseForm.controls['ctatext']?.setValue(this.course?.cta_text ? (this.course?.cta_text == 'undefined' ? '' : this.course?.cta_text) : '');
    this.courseForm.controls['ctalink']?.setValue(this.course?.cta_link ? (this.course?.cta_link == 'undefined' ? '' : this.course?.cta_link) : '');
    this.courseForm.controls['course_date']?.setValue(this.course?.date);
    this.imgSrc =this.course?.image ? (environment.api + '/get-course-image/' + this.course?.image) : '';
    this.videoBackgroundImgSrc = this.course?.video_cover ? (environment.api + '/get-course-image/' + this.course?.video_cover) : '';
    this.hotmartCourseImgSrc = this.course.hotmart_product_photo;
    this.hotmartProductId = this.course.hotmart_product_id;
    this.startButtonColor = this.course.button_color || this.buttonColor;
    this.buyNowButtonColor = this.course.buy_now_button_color || this.buttonColor;
    this.showComments = this.course.show_comments == 1 ? true : false;
    
    this.courseIntro = this.course.course_intro == 1 ? true : false;
    this.existingIntroPDFFile = this.course.intro_pdf;
    this.existingIntroPDFFileEn = this.course.intro_en_pdf;
    this.existingIntroPDFFileFr = this.course.intro_fr_pdf;
    this.existingIntroPDFFileEu = this.course.intro_eu_pdf;
    this.existingIntroPDFFileCa = this.course.intro_ca_pdf;
    this.existingIntroPDFFileDe = this.course.intro_de_pdf;
    this.existingIntroPDFFileIt = this.course.intro_it_pdf;
    this.existingIntroPDFFileURL = this.course.intro_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_pdf}` : '';
    this.existingIntroPDFFileURLEn = this.course.intro_en_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_en_pdf}` : '';
    this.existingIntroPDFFileURLFr = this.course.intro_fr_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_fr_pdf}` : '';
    this.existingIntroPDFFileURLEu = this.course.intro_eu_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_eu_pdf}` : '';
    this.existingIntroPDFFileURLCa = this.course.intro_ca_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_ca_pdf}` : '';
    this.existingIntroPDFFileURLDe = this.course.intro_de_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_de_pdf}` : '';
    this.existingIntroPDFFileURLIt = this.course.intro_it_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_it_pdf}` : '';

    if(this.hasActivityCodeActivated) {
      this.activityCode = this.course?.activity_code;
      if(this.companyId == 32) {
        this.activityCodeSigeca = this.course?.activity_code_sigeca;
      }
    }

    if(this.course.price > 0 
      && (this.course.payment_type > 0 || data?.recurring_payments)) {
      this.requirePayment = true
      this.courseForm.controls['price'].setValue(this.course.price)
      this.selectedPaymentType = this.course.payment_type
    } else {
      this.requirePayment = false
    }

    this.courseUnits = this.course?.course_units;

    this.courseCategoryMapping = this.mapCategories(data);
    if(this.courseCategoryMapping?.length > 0) {
      this.selectedCourseCategory = this.courseCategoryMapping
        .map(category => {
          const { id, name_EN, name_ES, name_FR, name_EU, name_CA, name_DE, name_IT } = category
          
          if(this.language == 'en') {
            return {
              id,
              name_EN
            }
          } else if(this.language == 'fr') {
            return {
              id,
              name_FR
            }
          } else if(this.language == 'eu') {
            return {
              id,
              name_EU
            }
          } else if(this.language == 'ca') {
            return {
              id,
              name_CA
            }
          } else if(this.language == 'de') {
            return {
              id,
              name_DE
            }
          } else if(this.language == 'it') {
            return {
              id,
              name_IT
            }
          } else {
            return {
              id,
              name_ES
            }
          }
        })
    }

    if(this.isAdvancedCourse) {
      this.selectedCourseDifficulty = this.course.difficulty || '';
      this.courseForm.controls['duration'].setValue(this.course.duration || '');
      this.selectedCourseDurationUnit = this.course.duration_unit || '';
      this.textSizeUnit = this.course?.text_size_unit || 12;
      if(this.course.package > 0) {
        this.selectedCoursePackage = this.course.package
      } else {
        this.selectedCoursePackage = 0
      }
      this.activatePackage = this.course.package_activation;
      this.allowUploadResources = this.course.allow_upload_resources;
      this.courseModules = this.course?.course_modules;
      this.courseModuleCategories = this.course?.course_module_categories;
      this.courseFaqs = this.course?.course_faqs;

      if(this.hasTutors) {
        this.getCourseTutorTypes()
      }

      if(this.course) {
        this.wallStatus = this.course.wall_status == 1 ? true : false
      }

      if(this.course?.course_credits && this.hasCourseCreditSetting){
        this.courseCredits = this.course.course_credits
      }
    }

    if(this.companyId == 32) {
      this.getCourseCities();
      if(this.isUESchoolOfLife) {
        this.coverVideo = this.course?.video;
        if(this.coverVideo) {
          this.hasExistingVideo = true;
          this.existingVideoFile = this.course?.video;
          this.existingVideoURL = `${this.apiPath}/get-course-unit-file/${this.course?.video}`;
        }
        if(this.course?.default_cover == 'video') {
          this.isDefaultVideo = true;
          this.setDefaultVideo = true;
          this.setDefaultPhoto = false;
        } else {
          this.setDefaultPhoto = true;
          this.isDefaultPhoto = true;
          this.setDefaultVideo = false;
          this.setDefaultPhoto = true;
        }
      }
    }
  };

  mapCategories(data) {
    let course_category_mapping = data?.course_category_mapping?.filter(ccm => {
      return ccm.course_id == this.id
    })
    let categories = course_category_mapping?.map((cat) => {
      let cat_row = data?.categories?.filter((c) => {
        return c.id == cat.category_id;
      });
      let categ = cat_row?.length > 0 ? cat_row[0] : {};
      return {
        ...cat,
        id: categ?.id,
        name_EN: categ?.name_EN,
        name_ES: categ?.name_ES,
        name_FR: categ?.name_FR,
        name_EU: categ?.name_EU,
        name_CA: categ?.name_CA,
        name_DE: categ?.name_DE,
        name_IT: categ?.name_IT,
      };
    });

    return categories;
  }

  getCourseCities() {
    this._coursesService.getCourseCities(this.id).subscribe(
      (response) => {
        let cities = response.course_cities;
        let crs_cities: any[] = [];
        if (cities && cities.length > 0) {
          cities.forEach((ct) => {
            crs_cities.push({
              id: ct.city_id,
              city: ct.city,
            });
          });
        }
        this.selectedCity = crs_cities;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getTutors() {
    this._tutorsService.getTutors(this.companyId)
    .subscribe(
      async (response) => {
        let tutors = response['tutors']
        this.tutors = tutors && tutors.filter(tutor => {
            return tutor.status == 1
        })
        if(this.tutors?.length > 0) {
          this.tutors = this.tutors.sort((a, b) => a.name.localeCompare(b.name))
        }
        this.allTutors = this.tutors;
        this.filteredTutors = this.allTutors;
        if(this.tutors?.length > 0) {
          this.getSelectedTutors()
        }
      },
      error => {
        console.log(error)
      }
    )
  }

  getTutorPackages() {
    this._tutorsService.getTutorPackages(this.companyId)
      .subscribe(
        response => {
          this.packages = response.packages
        },
        error => {
          console.log(error)
        }
      )
  }

  getSelectedTutors(){
    this.selectedCourseTutor = this.tutors.filter(tu => {
      let include = false
      this.course?.tutor?.forEach(ctu => {
        if(tu.id == ctu.tutor_id){
          include = true
        }
      })
      if(include){
        return tu
      }
    })
  }

  getCourseTutorTypes() {
    this._tutorsService.getCourseTutorTypes(this.course?.id).subscribe(data => {
      this.selectedCourseTutorType = data.tutor_types
        .map(tutor_type => {
          const { id, name_EN, name_ES, name_FR, name_EU, name_CA, name_DE } = tutor_type
          
          if(this.language == 'en') {
            return {
              id,
              name_EN
            }
          } else if(this.language == 'fr') {
            return {
              id,
              name_FR
            }
          } else if(this.language == 'eu') {
            return {
              id,
              name_EU
            }
          } else if(this.language == 'ca') {
            return {
              id,
              name_CA
            }
          } else if(this.language == 'de') {
            return {
              id,
              name_DE
            }
          } else {
            return {
              id,
              name_ES
            }
          }
        })
    }, error => {
      
    })
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
    return course ? (this.language == 'en' ? (course.title_en || course.title) : (this.language == 'fr' ? (course.title_fr || course.title) : 
      (this.language == 'eu' ? (course.title_eu || course.title) : (this.language == 'ca' ? (course.title_ca || course.title) : 
      (this.language == 'de' ? (course.title_de || course.title) : (this.language == 'it' ? (course.title_it || course.title) : course.title)
      )))
    )) : ''
  }

  getDifficultyLevelTitle(difficulty) {
    return this.language == 'en' ? difficulty.difficulty : (this.language == 'fr' ? difficulty.difficulty_fr : 
      (this.language == 'eu' ? difficulty.difficulty_eu : (this.language == 'ca' ? difficulty.difficulty_ca : 
      (this.language == 'de' ? difficulty.difficulty_de : (this.language == 'it' ? difficulty.difficulty_it : difficulty.difficulty_es)
      )))
    )
  }

  getCourseDurationUnitTitle(duration) {
    return this.language == 'en' ? duration.unit : (this.language == 'fr' ? duration.unit_fr : 
      (this.language == 'eu' ? duration.unit_eu : (this.language == 'ca' ? duration.unit_ca : 
      (this.language == 'de' ? duration.unit_de : (this.language == 'it' ? duration.unit_it : duration.unit_es)
      )))
    )
  }

  getModuleTitle(module) {
    return this.language == 'en' ? module.title_en : (this.language == 'fr' ? (module.title_fr || module.title) : 
      (this.language == 'eu' ? (module.title_eu || module.title) : (this.language == 'ca' ? (module.title_ca || module.title) : 
      (this.language == 'de' ? (module.title_de || module.title) : (this.language == 'it' ? (module.title_it || module.title) : module.title)
      )))
    )
  }

  getModuleTranslated(unit) {
    return this.language == 'en' ? unit.module_en : (this.language == 'fr' ? (unit.module_fr || unit.module) : 
      (this.language == 'eu' ? (unit.module_eu || unit.module) : (this.language == 'ca' ? (unit.module_ca || unit.module) : 
      (this.language == 'de' ? (unit.module_de || unit.module) : unit.module)
      ))
    )
  }

  getModuleDescription(module) {
    return this.language == 'en' ? module.description_en : (this.language == 'fr' ? (module.description_fr || module.description) : 
      (this.language == 'eu' ? (module.description_eu || module.description) : (this.language == 'ca' ? (module.description_ca || module.description) : 
      (this.language == 'de' ? (module.description_de || module.description) : (this.language == 'it' ? (module.description_it || module.description) : module.description)
      )))
    )
  }

  getModuleCategoryTitle(module) {
    return this.language == 'en' ? module.module_en : (this.language == 'fr' ? (module.module_fr || module.module_es) : 
      (this.language == 'eu' ? (module.module_eu || module.module) : (this.language == 'ca' ? (module.module_ca || module.module) : 
      (this.language == 'de' ? (module.module_de || module.module) : module.module)
      ))
    )
  }
  
  getModuleCategory(category) {
    return this.language == 'en' ? category.category_en : (this.language == 'fr' ? (category.category_fr || category.category) : 
      (this.language == 'eu' ? (category.category_eu || category.category) : (this.language == 'ca' ? (category.category_ca || category.category) : 
      (this.language == 'de' ? (category.category_de || category.category) : category.category)
      ))
    )
  }

  getUnitModuleCategory(unit) {
    return this.language == 'en' ? unit.module_category_en : (this.language == 'fr' ? (unit.module_category_fr || unit.module_category) : 
      (this.language == 'eu' ? (unit.module_category_eu || unit.module_category) : (this.language == 'ca' ? (unit.module_category_ca || unit.module_category) : 
      (this.language == 'de' ? (unit.module_category_de || unit.module_category) : unit.module_category)
      ))
    )
  }

  fileChangeEvent(event: any, mode: string = ''): void {
    this.imageChangedEvent = event;
    const file = event.target.files[0];
    if (file.size > 2000000) {
    } else {
      initFlowbite();
      setTimeout(() => {
        this.uploadImageMode = mode;
        this.modalbutton?.nativeElement.click();
      }, 500);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      if(this.uploadImageMode == 'coverphoto') {
        this.videoBackgroundImgSrc = this.croppedImage = event.base64;
        this.videoBackgroundFile = {
          name: "image",
          image: base64ToFile(event.base64),
        };
      } if(this.uploadImageMode == 'unitphoto') {
        this.videoBackgroundImgSrcUnit = this.croppedImage = event.base64;
        this.videoBackgroundUnitFile = {
          name: "image",
          image: base64ToFile(event.base64),
        };
      } else if(!this.uploadImageMode || this.uploadImageMode == 'photo') {
        this.imgSrc = this.croppedImage = event.base64;
        this.file = {
          name: "image",
          image: base64ToFile(event.base64),
        };
      }
    }
  }

  imageLoaded() {
    // show cropper
  }

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {
    // show message
  }

  imageCropperModalSave() {
    this.showImageCropper = false;
    this.closemodalbutton?.nativeElement.click();
  }

  imageCropperModalClose() {
    this.showImageCropper = false;
  }

  changeTab(event) {
    this.tabSelected = true;
    this.showUnitDetails = false;
    this.videoBackgroundUnitFile = null;
    this.videoBackgroundImgSrcUnit = '';
    this.courseUnitMode = '';

    if(event.index == 3) {
      this.getCourseDownloads()
    }

    if(event.index == 2) {
      this.getCourseUnitTypes();
    }
  }

  getCourseUnitTypes() {
    this._coursesService.getCourseUnitTypes().subscribe(data => {
      this.unitTypes = data['types']
    }, error => {
      
    })
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    const contentContainer =
      document.querySelector(".mat-sidenav-content") || window;
    contentContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  setDefaultTitleAndDescription(code) {
    let title = this.courseForm.get('title' + code);
    let entered_title = this.courseForm.get('title' + (this.selectedLanguage == 'es' ? '' : ('_' + this.selectedLanguage)));
    if(!title.value && code?.replace('_', '') != this.selectedLanguage && entered_title?.value) {
      this.courseForm.controls['title' + code].setValue(entered_title?.value);
    }

    let description = this.courseForm.get('description' + code);
    let entered_description = this.courseForm.get('description' + (this.selectedLanguage == 'es' ? '' : ('_' + this.selectedLanguage)));
    if(!description.value && code?.replace('_', '') != this.selectedLanguage && entered_description?.value) {
      this.courseForm.controls['description' + code].setValue(entered_description?.value);
    }
  }

  saveCourse() {
    this.courseFormSubmitted = true

    let code = this.defaultLanguage[0].code == 'es' ? '' : ('_' + this.defaultLanguage[0].code);
    let params
    let price 
    if(this.requirePayment) {
      price = this.courseForm.get('price').value ? this.courseForm.get('price').value : 0
      if(this.requirePayment) {
        if(price.indexOf("€")) {
          price = price.replace("€", "");
          price = price.trim();
        }
      }
    }

    let payment_option_array: any[] = [];
    let payment_option;
    if(this.requirePayment) {
      this.selectedPaymentType = 1
      payment_option = this.checkedPaymentType.filter((type) => {
        return type.checked;
      })
      if(this.requirePayment && payment_option?.length == 0 && price) {
        payment_option = this.checkedPaymentType?.filter((type) => {
          return type.id == 1;
        });
      }

      if(payment_option){
        payment_option.map((data) => {
          if(data.specific_date.payment_due_date_1){
            data.specific_date.payment_due_date_1 = data.specific_date.payment_due_date_1.year + '-' 
            + (data.specific_date.payment_due_date_1.month > 10 ? '' : '0') + data.specific_date.payment_due_date_1.month  + '-'
            + (data.specific_date.payment_due_date_1.day > 10 ? '' : '0') + data.specific_date.payment_due_date_1.day
          }
          if(data.specific_date.payment_due_date_2){
            data.specific_date.payment_due_date_2 = data.specific_date.payment_due_date_2.year + '-' 
            + (data.specific_date.payment_due_date_2.month > 10 ? '' : '0') + data.specific_date.payment_due_date_2.month  + '-'
            + (data.specific_date.payment_due_date_2.day > 10 ? '' : '0') + data.specific_date.payment_due_date_2.day
          }
          payment_option_array.push({
            "selected_payment_type" : data.id,
            "specific_date" : data.specific_date,
            "day_after_reservation" : data.day_after_reservation,
            "reservation_price": data.reservation_price,
            "instalment_price": data.instalment_price,
            "payment_due_type" : data.selected_assigned_date == 1 ? 'date' : 'days'
          })
        })
      }
    }

    this.setDefaultTitleAndDescription(code);

    if(this.hasCoursePayment) {
      if(this.requirePayment) {
        if(this.isAdvancedCourse) {
          if(
            this.courseForm.get('title' + code).errors
            || this.checkDescription()
            || !this.courseForm.get('price').value
            || !this.selectedPaymentType) {
            this.scrollToTop()
            this.issaving = false
            return false;
          }
        } else {
          if(
            this.courseForm.get('title' + (code)).errors
            || this.checkDescription()
            || this.courseForm.get('course_date').errors
            || !this.courseForm.get('price').value
            || !this.selectedPaymentType) {
            this.scrollToTop()
            this.issaving = false
            return false;
          }
        }
        if(payment_option.length > 0){
          payment_option.map((data) => {
            if(data.id > 2 && !(data.reservation_price && data.selected_assigned_date)) {
              this.scrollToTop()
              this.issaving = false;
              return false;
            }
            if(data.selected_assigned_date == 1 && data.id > 2){
              if(!data['specific_date']['payment_due_date_1']
                || (data.id == 4 && !data['specific_date']['payment_due_date_2'])
              ){
                this.scrollToTop()
                this.issaving = false;
                return false;
              }
            }else if(data.selected_assigned_date == 2 && data.id > 2){
              if(!data['day_after_reservation']['payment_day_after_1']
                || (data.id == 4 && !data['day_after_reservation']['payment_day_after_2'])
              ){
                this.scrollToTop()
                this.issaving = false;
                return false;
              }
            }
          })
        }else{
          this.scrollToTop()
          this.issaving = false;
          return false;
        }
      } else {
        if(this.isAdvancedCourse) {
          if(
            this.courseForm.get('title' + code)?.errors
            || this.checkDescription()
            || this.courseForm.get('course_date')?.errors) {
            this.scrollToTop()
            this.issaving = false
            return false;
          }
        } else {
          if(
            this.courseForm.get('title' + code)?.errors
          || this.checkDescription()
          || this.courseForm.get('course_date')?.errors) {
            this.scrollToTop()
            this.issaving = false
            return false;
          }
        }
      }
    } else {
      if(this.isAdvancedCourse) {
        if(
          this.courseForm.get('title' + code)?.errors
          || this.checkDescription()
          || this.courseForm.get('course_date')?.errors) {
          this.scrollToTop()
          this.issaving = false
          return false;
        }
      } else {
        if(
          this.courseForm.get('title' + code)?.errors
          || this.checkDescription()
          || this.courseForm.get('course_date')?.errors) {
          this.scrollToTop()
          this.issaving = false
          return false;
        }
      }
    }
    this.issaving = true
    if(this.id == 0) {
      this.newCourseSaving = true
    }

    let course_date
    if(this.courseForm?.get('course_date')?.value) {
      course_date = moment(this.courseForm?.get('course_date')?.value).format('YYYY-MM-DD')
    }

    this.title = this.courseForm.get('title' + code).value
    this.description = this.courseForm.get('description' + code).value

    if(this.hasCoursePayment) {
      if(this.isAdvancedCourse || this.hasCourseCustomSections) {
        params = {
          'title': this.courseForm.controls['title'] ? this.courseForm.get('title').value : this.title,
          'title_en': this.courseForm.controls['title_en'] ? this.courseForm.get('title_en').value : this.title,
          'title_fr': this.courseForm.controls['title_fr'] ? this.courseForm.get('title_fr').value : this.title,
          'title_eu': this.courseForm.controls['title_eu'] ? this.courseForm.get('title_eu').value : this.title,
          'title_ca': this.courseForm.controls['title_ca'] ? this.courseForm.get('title_ca').value : this.title,
          'title_de': this.courseForm.controls['title_de'] ? this.courseForm.get('title_de').value : this.title,
          'title_it': this.courseForm.controls['title_it'] ? this.courseForm.get('title_it').value : this.title,
          'description': this.courseForm.controls['description'] ? this.courseForm.get('description').value : this.description,
          'description_en': this.courseForm.controls['description_en'] ? this.courseForm.get('description_en').value : this.description,
          'description_fr': this.courseForm.controls['description_fr'] ? this.courseForm.get('description_fr').value : this.description,
          'description_eu': this.courseForm.controls['description_eu'] ? this.courseForm.get('description_eu').value : this.description,
          'description_ca': this.courseForm.controls['description_ca'] ? this.courseForm.get('description_ca').value : this.description,
          'description_de': this.courseForm.controls['description_de'] ? this.courseForm.get('description_de').value : this.description,
          'description_it': this.courseForm.controls['description_it'] ? this.courseForm.get('description_it').value : this.description,
          'date': course_date,
          'points': this.courseForm.get('points').value || 0,
          'category': this.selectedCourseCategory ? this.selectedCourseCategory.map((data) => { return data.id }).join() : '',
          'price': price,
          'payment_type': JSON.stringify(payment_option_array),
          'require_payment': this.requirePayment ? this.requirePayment : 0,
          'created_by': this.userId,
          'company_id': this.companyId,
          'difficulty': this.selectedCourseDifficulty ? this.selectedCourseDifficulty : 0,
          'duration': this.courseForm.get('duration') ? this.courseForm.get('duration').value : 0,
          'duration_unit': this.selectedCourseDurationUnit ? this.selectedCourseDurationUnit : 0,
          'instructor': this.selectedCourseInstructor ? this.selectedCourseInstructor : 0,
          'text_size_unit': this.textSizeUnit ? this.textSizeUnit : 12,
          'tutor_id': this.selectedCourseTutor ? this.selectedCourseTutor.map((data) => { return data.id }).join() : '',
          'package_id': this.selectedCoursePackage ? this.selectedCoursePackage : 0,
          'package_activation': this.activatePackage ? this.activatePackage : 0,
          'allow_upload_resources': this.allowUploadResources ? 1 : 0,
          'button_color': this.startButtonColor || this.buttonColor,
          'tutor_types': this.hasTutors && this.selectedCourseTutorType ? this.selectedCourseTutorType.map((data) => { return data.id }).join() : '',
          'multiple_payments' : payment_option_array.includes(3) || payment_option_array.includes(4) ? 1 : 0,
          'buy_now_button_color': this.buyNowButtonColor || this.buttonColor,
          'show_comments': this.showComments ? 1 : 0,
        }
        if(this.id > 0) {
          params.video_cover = !this.videoBackgroundImgSrc ? 'remove' : this.course.video_cover
        }
      } else {
        params = {
          'title': this.courseForm.controls['title'] ? this.courseForm.get('title').value : this.title,
          'description': this.courseForm.controls['description'] ? this.courseForm.get('description').value : this.description,
          'date': course_date,
          'points': this.courseForm.get('points').value || 0,
          'category': this.selectedCourseCategory ? this.selectedCourseCategory.map((data) => { return data.id }).join() : '',
          'price': price,
          'payment_type': JSON.stringify(payment_option_array),
          'require_payment': this.requirePayment ? this.requirePayment : 0,
          'created_by': this.userId,
          'company_id': this.companyId,
          'multiple_payments' : payment_option_array.includes(3) || payment_option_array.includes(4) ? 1 : 0
        }
      }

      params['has_diff_stripe_account'] = this.hasDifferentStripeAccount ? true : false
      if(this.hasDifferentStripeAccount){
        params['selected_stripe_account_id'] = this.selectedStripeAccount
      }
    } else {
      if(this.isAdvancedCourse) {
        params = {
          'title': this.courseForm.controls['title'] ? this.courseForm.get('title').value : this.title,
          'title_en': this.courseForm.controls['title_en'] ? this.courseForm.get('title_en').value : '',
          'title_fr': this.courseForm.controls['title_fr'] ? this.courseForm.get('title_fr').value : '',
          'title_eu': this.courseForm.controls['title_eu'] ? this.courseForm.get('title_eu').value : '',
          'title_ca': this.courseForm.controls['title_ca'] ? this.courseForm.get('title_ca').value : '',
          'title_de': this.courseForm.controls['title_de'] ? this.courseForm.get('title_de').value : '',
          'title_it': this.courseForm.controls['title_it'] ? this.courseForm.get('title_it').value : '',
          'description': this.courseForm.controls['description'] ? this.courseForm.get('description').value : this.description,
          'description_en': this.courseForm.controls['description_en'] ? this.courseForm.get('description_en').value : '',
          'description_fr': this.courseForm.controls['description_fr'] ? this.courseForm.get('description_fr').value : '',
          'description_eu': this.courseForm.controls['description_eu'] ? this.courseForm.get('description_eu').value : '',
          'description_ca': this.courseForm.controls['description_ca'] ? this.courseForm.get('description_ca').value : '',
          'description_de': this.courseForm.controls['description_de'] ? this.courseForm.get('description_de').value : '',
          'description_it': this.courseForm.controls['description_it'] ? this.courseForm.get('description_it').value : '',
          'date': course_date,
          'points': this.courseForm.get('points').value || 0,
          'category': this.selectedCourseCategory ? this.selectedCourseCategory.map((data) => { return data.id }).join() : '',
          'created_by': this.userId,
          'company_id': this.companyId,
          'difficulty': this.selectedCourseDifficulty ? this.selectedCourseDifficulty : 0,
          'duration': this.courseForm.get('duration') ? this.courseForm.get('duration').value : 0,
          'duration_unit': this.selectedCourseDurationUnit ? this.selectedCourseDurationUnit : 0,
          'instructor': this.selectedCourseInstructor ? this.selectedCourseInstructor : 0,
          'button_color': this.startButtonColor || this.buttonColor,
          'tutor_types': this.hasTutors && this.selectedCourseTutorType ? this.selectedCourseTutorType.map((data) => { return data.id }).join() : '',
          'text_size_unit': this.textSizeUnit ? this.textSizeUnit : 12,
          'tutor_id': this.selectedCourseTutor ? this.selectedCourseTutor.map((data) => { return data.id }).join() : '',
          'package_id': this.selectedCoursePackage ? this.selectedCoursePackage : 0,
          'package_activation': this.activatePackage ? this.activatePackage : 0,
          'allow_upload_resources': this.allowUploadResources ? 1 : 0,
          'buy_now_button_color': this.buyNowButtonColor || this.buttonColor,
          'show_comments': this.showComments ? 1 : 0,
        }
        if(this.id > 0) {
          params.video_cover = !this.videoBackgroundImgSrc ? 'remove' : this.course.video_cover
        }
      } else {
        params = {
          'title': this.courseForm.controls['title'] ? this.courseForm.get('title').value : this.title,
          'description': this.courseForm.controls['description_es'] ? this.courseForm.get('description_es').value : this.description,
          'date': course_date,
          'points': this.courseForm.get('points').value || 0,
          'created_by': this.userId,
          'company_id': this.companyId,
          'category': this.selectedCourseCategory ? this.selectedCourseCategory.map( (data) => { return data.id }).join() : '',
        }
      }
    }

    params.wall_status = this.wallStatus ? 1 : 0;
    params.group_id = this.wallStatus && this.selectedWall ? this.selectedWall : null
    params['cta_status'] = this.ctaStatus ? 1: 0;
    params['buy_now_status'] = this.buyNowStatus ? 1: 0;
    params['cta_text'] = this.courseForm.get('ctatext').value;
    params['cta_link'] = this.courseForm.get('ctalink').value;
    params['hotmart_course_id'] = this.selectedHotmartCourse || '';
    params['has_diff_stripe_account'] = this.hasDifferentStripeAccount ? true : false;
    params['sol_nivelacion'] = this.isUESchoolOfLife && this.category == 'nivelacion' ? 1 : 0;
    if(this.hasDifferentStripeAccount){
      params['selected_stripe_account_id'] = this.selectedStripeAccount
    }
    params['has_course_credit'] = this.hasCourseCreditSetting ? true : false
    if(this.hasCourseCreditSetting){
      if(this.courseCredits < 0){
        return false
      }
      params['course_credits'] = this.courseCredits || 0
    }
    params['school_of_life'] = this.isUESchoolOfLife ? 1 : 0;
    params['course_intro'] = this.courseIntro ? 1 : 0;

    if(this.companyId == 32) {
      params['additional_properties_course_access'] = this.allowCourseAccess ? 1 : 0,
      params['additional_properties_campus_ids'] = this.selectedCampus?.length > 0 ? this.selectedCampus?.map( (data) => { return data.id }).join() : '';
      params['additional_properties_faculty_ids'] = this.selectedFaculty?.length > 0 ? this.selectedFaculty?.map( (data) => { return data.id }).join() : '';
      params['additional_properties_business_unit_ids'] = this.selectedBusinessUnit?.length > 0 ? this.selectedBusinessUnit?.map( (data) => { return data.id }).join() : '';
      params['additional_properties_type_ids'] = this.selectedType?.length > 0 ? this.selectedType?.map( (data) => { return data.id }).join() : '';
      params['additional_properties_segment_ids'] = this.selectedSegment?.length > 0 ? this.selectedSegment?.map( (data) => { return data.id }).join() : '';
      params['additional_properties_branding_ids'] = this.selectedBranding?.length > 0 ? this.selectedBranding?.map( (data) => { return data.id }).join() : '';
      params["city_id"] = this.selectedCity?.length > 0 ? this.selectedCity?.map( (data) => { return data.id }).join() : '';
      if(this.isUESchoolOfLife) {
        params['default_cover'] = this.setDefaultVideo && ((this.courseVideoCoverUploaded && this.courseCoverVideoFileName) || this.existingVideoFile) ? 'video' : 'photo'; 
        params['video'] = this.setDefaultVideo && this.courseVideoCoverUploaded && this.courseCoverVideoFileName ? this.courseCoverVideoFileName : (this.clearedVideo ? '' : this.existingVideoFile);
      }
    }

    let course_intro_file = localStorage.getItem('course_intro_file') == 'complete' || this.existingIntroPDFFile ? (this.courseIntroFileName || this.existingIntroPDFFile) : ''
    let course_intro_file_en = localStorage.getItem('course_intro_file_en') == 'complete' || this.existingIntroPDFFileEn ? (this.courseIntroFileNameEn || this.existingIntroPDFFileEn) : ''
    let course_intro_file_fr = localStorage.getItem('course_intro_file_fr') == 'complete' || this.existingIntroPDFFileFr ? (this.courseIntroFileNameFr || this.existingIntroPDFFileFr) : ''
    let course_intro_file_eu = localStorage.getItem('course_intro_file_eu') == 'complete' || this.existingIntroPDFFileEu ? (this.courseIntroFileNameEu || this.existingIntroPDFFileEu) : ''
    let course_intro_file_ca = localStorage.getItem('course_intro_file_ca') == 'complete' || this.existingIntroPDFFileCa ? (this.courseIntroFileNameCa || this.existingIntroPDFFileCa) : ''
    let course_intro_file_de = localStorage.getItem('course_intro_file_de') == 'complete' || this.existingIntroPDFFileDe ? (this.courseIntroFileNameDe || this.existingIntroPDFFileDe) : ''
    let course_intro_file_it = localStorage.getItem('course_intro_file_it') == 'complete' || this.existingIntroPDFFileIt ? (this.courseIntroFileNameIt || this.existingIntroPDFFileIt) : ''
    params['intro_pdf'] = course_intro_file || '';
    params['intro_en_pdf'] = course_intro_file_en || '';
    params['intro_fr_pdf'] = course_intro_file_fr || '';
    params['intro_eu_pdf'] = course_intro_file_eu || '';
    params['intro_ca_pdf'] = course_intro_file_ca || '';
    params['intro_de_pdf'] = course_intro_file_de || '';
    params['intro_it_pdf'] = course_intro_file_it || '';
    if(this.courseIntro) {
      params['intro_pdf_removed'] = this.existingIntroRemoved ? 1 : 0;
      params['intro_en_pdf_removed'] = this.existingIntroRemovedEn ? 1 : 0;
      params['intro_fr_pdf_removed'] = this.existingIntroRemovedFr ? 1 : 0;
      params['intro_eu_pdf_removed'] = this.existingIntroRemovedEu ? 1 : 0;
      params['intro_ca_pdf_removed'] = this.existingIntroRemovedCa ? 1 : 0;
      params['intro_de_pdf_removed'] = this.existingIntroRemovedDe ? 1 : 0;
      params['intro_it_pdf_removed'] = this.existingIntroRemovedIt ? 1 : 0;
    }
    
    if(this.hasActivityCodeActivated) {
      params["activity_code"] = this.activityCode || "";
      if(this.companyId == 32) {
        params["activity_code_sigeca"] = this.activityCodeSigeca || "";
      }
    }

    if (this.id > 0) {
      // Edit
      this._coursesService.editCourse(this.course?.id, params, this.file).subscribe(
        (response) => {
          if(this.videoBackgroundFile) {
            this.updateVideoBackground(response, this.course?.id)
          } else {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this.scrollToTop();
            this.reset();
          }
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      // Create
      this._coursesService.addCourse(
        params,
        this.file
      ).subscribe(
        response => {
          if(response.course) {
            if(this.videoBackgroundFile) {
              this.updateVideoBackground(response, response.course.id)
            } else {
              this.reset();
            }
          }
        },
        error => {
          this.issaving = false
          console.log(error);
          this.open(this._translateService.instant("dialog.error"), "");
        }
      )
    }
  }

  updateVideoBackground(resp, id) {
    this._coursesService.editVideoBackground(id, this.userId, this.videoBackgroundFile).subscribe(
      response => {
        if (this.id > 0) {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.scrollToTop();
        }
        this.reset();
      },
      error => {
        this.issaving = false
        console.log(error);
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  reset() {
    this.newCourseSaving = false;
    this.courseFormSubmitted = false;
    this.issaving = false;
    this.existingIntroRemoved = false;
    this.existingIntroRemovedEn = false;
    this.existingIntroRemovedFr = false;
    this.existingIntroRemovedEu = false;
    this.existingIntroRemovedCa = false;
    this.existingIntroRemovedDe = false;
    this.existingIntroRemovedIt = false;
    this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    if(this.id > 0) {
      this.scrollToTop();
    } else {
      let url = `/settings/manage-list/courses`;
      if(this.isUESchoolOfLife && this.category == 'nivelacion') {
        location.href = `${url}?category=nivelacion`
      } else {
        this._location.back();
      }
    }
  }

  checkDescription() {
    let result = false;
    switch (this.defaultLanguage[0].code) {
        case "ca":
            this.description = this.courseForm.get('description_ca').value;
            result = !this.courseForm.get('description_ca').value;
            break;
        case "de":
            this.description =  this.courseForm.get('description_de').value;
            result = ! this.courseForm.get('description_de').value;
            break;
        case "es":
            this.description =  this.courseForm.get('description').value;
            result = ! this.courseForm.get('description').value;
            break;
        case "eu":
            this.description =  this.courseForm.get('description_eu').value;
            result = ! this.courseForm.get('description_eu').value;
            break;
        case "fr":
            this.description =  this.courseForm.get('description_fr').value;
            result = ! this.courseForm.get('description_fr').value;
            break;
        case "it":
          this.description =  this.courseForm.get('description_it').value;
          result = ! this.courseForm.get('description_it').value;
          break;
        default:
            this.description =  this.courseForm.get('description').value;
            result = ! this.courseForm.get('description').value;
            break;
    }

    return result;
  }

  public getTimestamp() {
    const date = new Date()
    const timestamp = date.getTime()
    return timestamp
  }

  getModuleStartDate(item, i) {
    let start_date
    if(item.unblock_date) {
      start_date = this.getUnblockDate(item.unblock_date)
    } else if(item.block_days_after_start > 0) {
      start_date = `+ ${item.block_days_after_start} ${this._translateService.instant('course-details.days')} ${this._translateService.instant('course-details.afterthis')}`
    } else if(item.block_days_after > 0 && (!item.block_days_after_start || (item.block_days_after_start && item.block_days_after_start <= 0))) {
      start_date = this.getBlockStartDate(item, i)
    }
    else { 
      start_date = this._translateService.instant('plan-create.open')
    }

    return start_date
  }

  getBlockStartDate(module, index) {
    if(!module.unblock_date && module.block_days_after) {
      let days = 0
      if(this.courseModules && this.courseModules.length > 1) {
        this.courseModules.forEach((module, idx) => {
          if(idx <= index) {
            days += module.block_days_after
          }
        })
      }

      if(days > 0) {
        return moment(this.course.date).add('days',  days).format('DD/MM/YYYY')
      }
    }
  }

  getUnblockDate(date) {
    return moment(date).format('DD/MM/YYYY')
  }

  moveUp(type, array, index) {
    if (index >= 1) {
      this.swap(array, index, index - 1);
      this.updateCourseListSequence(type, array);
    }
  }

  moveDown(type, array, index) {
    if (index < array.length - 1) {
      this.swap(array, index, index + 1);
      this.updateCourseListSequence(type, array);
    }
  }

  swap(array: any[], x: any, y: any) {
    var b = array[x];
    array[x] = array[y];
    array[y] = b;
  }

  updateCourseListSequence(type, array) {
    let params = {
      id: this.id,
      list_type: type,
      list: array
    }
    this._coursesService.editCourseListSequence(params).subscribe(
      response => {
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        console.log(error);
      }
    )
  }

  addCourseModule() {
    this.resetModule();
    this.courseModuleMode = 'add';
    this.showModuleDetails = true;
  }

  editCourseModule(item) {
    this.resetModule()
    this.courseModuleMode = 'edit'
    this.showModuleDetails = true
    this.selectedModuleId = item.id
    this.moduleTitle = item.title
    this.moduleTitleEn = item.title_en
    this.moduleTitleFr = item.title_fr
    this.moduleTitleEu = item.title_eu
    this.moduleTitleCa = item.title_ca
    this.moduleTitleDe = item.title_de
    this.moduleTitleIt = item.title_it
    this.moduleNumber = item.number
    this.moduleDescription = item.description
    this.moduleDescriptionEn = item.description_en
    this.moduleDescriptionFr = item.description_fr
    this.moduleDescriptionEu = item.description_eu
    this.moduleDescriptionCa = item.description_ca
    this.moduleDescriptionDe = item.description_de
    this.moduleDescriptionIt = item.description_it
    this.isModuleLockUnlock = item.block_other_modules == 1 ? true : false 
    this.moduleAvailableAfter = item.block_days_after > 0 ? item.block_days_after : ''
    this.unlockAfterStartDays = item.block_days_after_start > 0 ? item.block_days_after_start : ''
    this.blockedModuleText =  item.blocked_module_text ? item.blocked_module_text : ''
    this.blockedModuleTextEN =  item.blocked_module_text_en ? item.blocked_module_text_en : ''
    this.blockedModuleTextCA =  item.blocked_module_text_ca ? item.blocked_module_text_ca : ''
    this.blockedModuleTextDE =  item.blocked_module_text_de ? item.blocked_module_text_de : ''
    this.blockedModuleTextEU =  item.blocked_module_text_eu ? item.blocked_module_text_eu : ''
    this.blockedModuleTextFR =  item.blocked_module_text_fr ? item.blocked_module_text_fr : ''
    this.blockedModuleTextIT =  item.blocked_module_text_it ? item.blocked_module_text_it : ''
    if(item.unblock_date) {
      let unlock_date
      if(this.course.date) {
        unlock_date = item.unblock_date;
      }
      this.unlockDate = unlock_date
      this.selectedUnlockQuestionId = 2
    } else if(item.block_days_after_start > 0) {
      this.selectedUnlockQuestionId = -1
    } else if(item.block_days_after > 0) {
      this.selectedUnlockQuestionId = 1
    } else {
      this.selectedUnlockQuestionId = ''
      this.unlockDate = ''
    }
    this.showModuleDetails = true
    this.courseModuleFormSubmitted = false
    this.isPackageRewardUnreward = item.reward_tutor_package
    this.selectedTutorPackage = item.package_id || ''
    this.selectedTutorPackageText = item.package_text
  }

  resetModule() {
    this.selectedModuleId = ''
    this.moduleTitle = ''
    this.moduleTitleEn = ''
    this.moduleTitleFr = ''
    this.moduleTitleEu = ''
    this.moduleTitleCa = ''
    this.moduleTitleDe = ''
    this.moduleTitleIt = ''
    this.moduleNumber = ''
    this.moduleDescription = ''
    this.moduleDescriptionEn = ''
    this.moduleDescriptionFr = ''
    this.moduleDescriptionEu = ''
    this.moduleDescriptionCa = ''
    this.moduleDescriptionDe = ''
    this.moduleDescriptionIt = ''
    this.selectedUnlockQuestionId = ''
    this.unlockDate = ''
    this.moduleAvailableAfter = ''
    this.unlockAfterStartDays = ''
    this.courseModuleMode = ''
    this.courseModuleFormSubmitted = false
    this.showModuleDetails = false
    this.isPackageRewardUnreward = false
    this.selectedTutorPackage = 0;
    this.selectedTutorPackageText = ''
    this.blockedModuleText = '' 
    this.blockedModuleTextEN = ''
    this.blockedModuleTextCA = ''
    this.blockedModuleTextDE = ''
    this.blockedModuleTextEU = ''
    this.blockedModuleTextFR = ''
    this.blockedModuleTextIT = ''
  }

  cancelShowModule() {
    this.courseModuleMode = '';
    this.courseModuleFormSubmitted = false;
    this.showModuleDetails = false;
  }

  saveModule() {
    if(this.courseModuleMode == 'add') {
      this.addModule();
    } else if(this.courseModuleMode == 'edit') {
      this.updateModule();
    }
  }

  addModule() {
    this.courseModuleFormSubmitted = true

    let code = this.defaultLanguage[0].code;
    if(code == 'en') { this.moduleTitle = this.moduleTitleEn || this.moduleTitle }
    if(code == 'fr') { this.moduleTitle = this.moduleTitleFr || this.moduleTitle }
    if(code == 'eu') { this.moduleTitle = this.moduleTitleEu || this.moduleTitle }
    if(code == 'ca') { this.moduleTitle = this.moduleTitleCa || this.moduleTitle }
    if(code == 'de') { this.moduleTitle = this.moduleTitleDe || this.moduleTitle }
    if(code == 'it') { this.moduleTitle = this.moduleTitleIt || this.moduleTitle }

    if(!this.moduleTitle) {
        return false
      }

    let unlock_date
    if(this.unlockDate && this.selectedUnlockQuestionId == 2) {
      unlock_date = this.unlockDate ? (this.unlockDate.year + '-' 
      + (this.unlockDate.month >= 10 ? '' : '0') + this.unlockDate.month  + '-'
      + (this.unlockDate.day >= 10 ? '' : '0') + this.unlockDate.day) : moment().format('YYYY-MM-DD')
    }

    let params = {
      course_id: this.course.id,
      company_id: this.companyId,
      number: this.courseModules.length + 1,
      title: this.moduleTitle,
      title_en: this.moduleTitleEn ? this.moduleTitleEn : this.moduleTitle,
      title_fr: this.moduleTitleFr ? this.moduleTitleFr : this.moduleTitle,
      title_eu: this.moduleTitleEu ? this.moduleTitleEu : this.moduleTitle,
      title_ca: this.moduleTitleCa ? this.moduleTitleCa : this.moduleTitle,
      title_de: this.moduleTitleDe ? this.moduleTitleDe : this.moduleTitle,
      title_it: this.moduleTitleIt ? this.moduleTitleIt : this.moduleTitle,
      description: this.moduleDescription,
      description_en: this.moduleDescriptionEn ? this.moduleDescriptionEn : this.moduleDescription,
      description_fr: this.moduleDescriptionFr ? this.moduleDescriptionFr : this.moduleDescription,
      description_eu: this.moduleDescriptionEu ? this.moduleDescriptionEu : this.moduleDescription,
      description_ca: this.moduleDescriptionCa ? this.moduleDescriptionCa : this.moduleDescription,
      description_de: this.moduleDescriptionDe ? this.moduleDescriptionDe : this.moduleDescription,
      description_it: this.moduleDescriptionIt ? this.moduleDescriptionIt : this.moduleDescription,
      block_other_modules: this.isModuleLockUnlock ? 1 : 0,
      block_days_after: this.isModuleLockUnlock && this.moduleAvailableAfter > 0 && this.selectedUnlockQuestionId == 1 ? this.moduleAvailableAfter : 0,
      block_days_after_start: this.isModuleLockUnlock && this.unlockAfterStartDays > 0 && this.selectedUnlockQuestionId == -1 ? this.unlockAfterStartDays : 0,
      unblock_date: unlock_date || null,
      reward_tutor_package: this.isPackageRewardUnreward ? 1 : 0,
      package_id: this.selectedTutorPackage ? this.selectedTutorPackage : 0,
      package_text: this.selectedTutorPackageText ? this.selectedTutorPackageText : "",
      blocked_module_text : this.blockedModuleText, 
      blocked_module_text_en : this.blockedModuleTextEN,
      blocked_module_text_ca : this.blockedModuleTextCA,
      blocked_module_text_de : this.blockedModuleTextDE,
      blocked_module_text_eu : this.blockedModuleTextEU,
      blocked_module_text_fr : this.blockedModuleTextFR,
      blocked_module_text_it : this.blockedModuleTextIT,
    }

    this._coursesService.addCourseModule(
      params
    ).subscribe(
      response => {
        this.fetchCourseData()
        this.resetModule()
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  updateModule() {
    this.courseModuleFormSubmitted = true

    if(!this.moduleTitle) {
        return false
      }

    let unlock_date
    if(this.unlockDate && this.selectedUnlockQuestionId == 2) {
      unlock_date = this.unlockDate ? (this.unlockDate.year + '-' 
      + (this.unlockDate.month >= 10 ? '' : '0') + this.unlockDate.month  + '-'
      + (this.unlockDate.day >= 10 ? '' : '0') + this.unlockDate.day) : moment().format('YYYY-MM-DD')
    }

    let params = {
      number: this.moduleNumber,
      title: this.moduleTitle,
      title_en: this.moduleTitleEn || this.moduleTitle,
      title_fr: this.moduleTitleFr || this.moduleTitle,
      title_eu: this.moduleTitleEu || this.moduleTitle,
      title_ca: this.moduleTitleCa || this.moduleTitle,
      title_de: this.moduleTitleDe || this.moduleTitle,
      title_it: this.moduleTitleIt || this.moduleTitle,
      description: this.moduleDescription,
      description_en: this.moduleDescriptionEn || this.moduleDescription,
      description_fr: this.moduleDescriptionFr || this.moduleDescription,
      description_eu: this.moduleDescriptionEu || this.moduleDescription,
      description_ca: this.moduleDescriptionCa || this.moduleDescription,
      description_de: this.moduleDescriptionDe || this.moduleDescription,
      description_it: this.moduleDescriptionIt || this.moduleDescription,
      block_other_modules: this.isModuleLockUnlock ? 1 : 0,
      block_days_after: this.isModuleLockUnlock && this.moduleAvailableAfter > 0 && this.selectedUnlockQuestionId == 1 ? this.moduleAvailableAfter : 0,
      block_days_after_start: this.isModuleLockUnlock && this.unlockAfterStartDays > 0 && this.selectedUnlockQuestionId == -1 ? this.unlockAfterStartDays : 0,
      unblock_date: unlock_date || null,
      reward_tutor_package: this.isPackageRewardUnreward ? 1 : 0,
      package_id: this.selectedTutorPackage ? this.selectedTutorPackage : 0,
      package_text: this.selectedTutorPackageText ? this.selectedTutorPackageText : "",
      blocked_module_text : this.blockedModuleText, 
      blocked_module_text_en : this.blockedModuleTextEN,
      blocked_module_text_ca : this.blockedModuleTextCA,
      blocked_module_text_de : this.blockedModuleTextDE,
      blocked_module_text_eu : this.blockedModuleTextEU,
      blocked_module_text_fr : this.blockedModuleTextFR,
      blocked_module_text_it : this.blockedModuleTextIT,
    }

    this._coursesService.editCourseModule(
      this.selectedModuleId,
      params,
    ).subscribe(
      response => {
        this.fetchCourseData()
        this.resetModule()
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  deleteCourseModule(item) {
    this._coursesService.deleteCourseModule(item.id)
      .subscribe(
          response => {
            if (response) {
              this.fetchCourseData()
              this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
            }
          },
          error => {
            console.log(error)
            this.open(this._translateService.instant("dialog.error"), "");
          }
      )
  }

  public onEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.startButtonColor = data
    }
  }

  public onBuyEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.buyNowButtonColor = data
    }
  }

  getCourseDownloads() {
    this._coursesService.getCourseDownloads(this.course.id).subscribe(data => {
      this.courseDownloads = data['downloads']
      this.allCourseDownloads = data['downloads']
      if(this.allCourseDownloads && this.allCourseDownloads.length > 0) {
        this.allCourseDownloads && this.allCourseDownloads.forEach(dwn => {
          if(dwn.file) {
            let type = dwn.file.split('.').pop()
            let match = this.downloadFileTypes.some(a => a.type === type)
            if(!match) {
              this.downloadFileTypes.push({
                type
              })
            }
          }
        })
        if(this.downloadFileTypes && this.downloadFileTypes.length > 0) {
          this.downloadFileTypes = this.downloadFileTypes.sort((a, b) => a.type.localeCompare(b.type))
        }

        // Only show downloads with existing units from courses
        this.allCourseDownloads = this.allCourseDownloads && this.allCourseDownloads.filter(acd => {
          let match = this.courseUnits && this.courseUnits.some(a => a.id === acd.course_unit_id)
          return match
        })
      }
      this.filterDownloadResources()
    }, error => {
      console.log(error)
    })
  }

  filterDownloadResources() {
    let courseDownloads = this.allCourseDownloads

    if(this.selectedDownloadUnit) {
      courseDownloads = courseDownloads && courseDownloads.filter(cd => {
        return cd.course_unit_id == this.selectedDownloadUnit
      })
    }

    if(this.selectedDownloadType) {
      courseDownloads = courseDownloads && courseDownloads.filter(cd => {
        return cd.file.split('.').pop() == this.selectedDownloadType
      })
    }

    this.courseDownloads = courseDownloads
    if(this.courseDownloads) {
      this.courseDownloads = this.courseDownloads.sort((a, b) => {
        return a.course_unit_id - b.course_unit_id || a.number - b.number
      })
    }
  }

  addCourseDownload() {
    this.resetDownloads();
    this.selectedDownloadId = '';
    this.courseDownloadMode = 'add';
    this.showDownloadDetails = true;
  }

  addDownload() {
    this.courseDownloadFormSubmitted = true

    if(!this.courseDownloadTitle
    || !this.selectedDownloadUnitId
    || !this.courseDownloadFileName) {
      return false
    }

    let course_file = localStorage.getItem('course_download_file') == 'complete' ? this.courseDownloadFileName : ''
    let course_file_en = localStorage.getItem('course_download_file_en') == 'complete' ? this.courseDownloadFileNameEn : ''
    let course_file_fr = localStorage.getItem('course_download_file_fr') == 'complete' ? this.courseDownloadFileNameFr : ''
    let course_file_eu = localStorage.getItem('course_download_file_eu') == 'complete' ? this.courseDownloadFileNameEu : ''
    let course_file_ca = localStorage.getItem('course_download_file_ca') == 'complete' ? this.courseDownloadFileNameCa : ''
    let course_file_de = localStorage.getItem('course_download_file_de') == 'complete' ? this.courseDownloadFileNameDe : ''
    let course_file_it = localStorage.getItem('course_download_file_it') == 'complete' ? this.courseDownloadFileNameIt : ''

    let params = {
      company_id: this.companyId,
      course_id: this.course.id,
      course_unit_id: this.selectedDownloadUnitId,
      filename: this.courseDownloadTitle,
      filename_en: this.courseDownloadTitleEn,
      filename_fr: this.courseDownloadTitleFr,
      filename_eu: this.courseDownloadTitleEu,
      filename_ca: this.courseDownloadTitleCa,
      filename_de: this.courseDownloadTitleDe,
      filename_it: this.courseDownloadTitleIt,
      file: course_file || '',
      file_en: course_file_en || '',
      file_fr: course_file_fr || '',
      file_eu: course_file_eu || '',
      file_ca: course_file_ca || '',
      file_de: course_file_de || '',
      file_it: course_file_it || '',
    }

    this._coursesService.addCourseUnitDownload(
      params,
    ).subscribe(
      response => {
        this.getCourseDownloads();
        this.resetDownloads();
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  resetDownloads() {
    this.selectedDownloadUnitId = '';
    this.courseDownloadTitle = '';
    this.courseDownloadTitleEn = '';
    this.courseDownloadTitleFr = '';
    this.courseDownloadTitleEu = '';
    this.courseDownloadTitleCa = '';
    this.courseDownloadTitleDe = '';
    this.courseDownloadTitleIt = '';
    this.courseDownloadFileName = '';
    this.courseDownloadFileNameEn = '';
    this.courseDownloadFileNameFr = '';
    this.courseDownloadFileNameEu = '';
    this.courseDownloadFileNameCa = '';
    this.courseDownloadFileNameDe = '';
    this.courseDownloadFileNameIt = '';
    this.courseDownloadMode = '';
    this.showDownloadDetails = false;
    this.courseDownloadFormSubmitted = false;
    localStorage.removeItem('course_download_file');
    localStorage.removeItem('course_download_file_en');
    localStorage.removeItem('course_download_file_fr');
    localStorage.removeItem('course_download_file_eu');
    localStorage.removeItem('course_download_file_ca');
    localStorage.removeItem('course_download_file_de');
    localStorage.removeItem('course_download_file_it');
  }

  viewCourseDownload(download) {
    if(download.file) {
      window.open(
        `${this.courseLessonFileSrc}${download.file}`,
        '_blank'
      );
    }
  }

  editCourseDownload(download) {
    this.courseDownloadMode = 'edit'
    this.selectedCourseDownloadId = download.id
    this.courseDownloadTitle = download.filename
    this.courseDownloadTitleEn = download.filename_en
    this.courseDownloadTitleFr = download.filename_fr
    this.courseDownloadTitleEu = download.filename_eu
    this.courseDownloadTitleCa = download.filename_ca
    this.courseDownloadTitleDe = download.filename_de
    this.courseDownloadTitleIt = download.filename_it
    this.courseDownloadFile = download.file
    this.courseDownloadFileEn = download.file_en
    this.courseDownloadFileFr = download.file_fr
    this.courseDownloadFileEu = download.file_eu
    this.courseDownloadFileCa = download.file_ca
    this.courseDownloadFileDe = download.file_de
    this.courseDownloadFileIt = download.file_it
    this.selectedDownloadUnitId = download.course_unit_id || ''
    this.showDownloadDetails = true
    this.courseDownloadFormSubmitted = false
  }

  updateDownload() {
    this.courseDownloadFormSubmitted = true

    if(!this.courseDownloadTitle
    || !this.selectedDownloadUnitId) {
      return false
    }

    let course_file = localStorage.getItem('course_download_file') == 'complete' || this.courseDownloadFile ? this.courseDownloadFile : ''
    let course_file_en = localStorage.getItem('course_download_file_en') == 'complete' || this.courseDownloadFileEn ? this.courseDownloadFileEn : ''
    let course_file_fr = localStorage.getItem('course_download_file_fr') == 'complete' || this.courseDownloadFileFr ? this.courseDownloadFileFr : ''
    let course_file_eu = localStorage.getItem('course_download_file_eu') == 'complete' || this.courseDownloadFileEu ? this.courseDownloadFileEu : ''
    let course_file_ca = localStorage.getItem('course_download_file_ca') == 'complete' || this.courseDownloadFileCa ? this.courseDownloadFileCa : ''
    let course_file_de = localStorage.getItem('course_download_file_de') == 'complete' || this.courseDownloadFileDe ? this.courseDownloadFileDe : ''
    let course_file_it = localStorage.getItem('course_download_file_it') == 'complete' || this.courseDownloadFileIt ? this.courseDownloadFileIt : ''

    let params = {
      id: this.selectedCourseDownloadId,
      company_id: this.companyId,
      course_id: this.course.id,
      course_unit_id: this.selectedDownloadUnitId,
      filename: this.courseDownloadTitle,
      filename_en: this.courseDownloadTitleEn,
      filename_fr: this.courseDownloadTitleFr,
      filename_eu: this.courseDownloadTitleEu,
      filename_ca: this.courseDownloadTitleCa,
      filename_de: this.courseDownloadTitleDe,
      filename_it: this.courseDownloadTitleIt,
      file: course_file,
      file_en: course_file_en,
      file_fr: course_file_fr,
      file_eu: course_file_eu,
      file_ca: course_file_ca,
      file_de: course_file_de,
      file_it: course_file_it,
    }

    this._coursesService.updateCourseUnitDownload(
      params,
    ).subscribe(
      response => {
        this.getCourseDownloads();
        this.resetDownloads();
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  deleteCourseDownload(download) {
    this._coursesService.deleteCourseDownload(download.id)
    .subscribe(
        response => {
          if (response) {
            this.getCourseDownloads()
            this.open(this._translateService.instant("dialog.deletedsuccessfully"), "");
          }
        },
        error => {
          console.log(error)
          this.open(this._translateService.instant("dialog.error"), "");
        }
    )
  }

  cancelShowDownload() {
    this.courseDownloadMode = ''
    this.courseDownloadTitle = ''
    this.courseDownloadFormSubmitted = false
    this.showDownloadDetails = false
  }

  saveDownload() {
    if(this.courseDownloadMode == 'add') {
      this.addDownload();
    } else if(this.courseDownloadMode == 'edit') {
      this.updateDownload();
    }
  }

  handleChangeDownloadUnit(event) {
    localStorage.setItem('course_download_unit_id', this.selectedDownloadUnitId)
  }

  getFileType(item) {
    return item.file.split('.').pop()
  }

  pondHandleInit() {
    console.log('FilePond has initialised', this.myPond);
  }

  pondHandleAddFile(event: any) {
    console.log('A file was added', event);
  }

  pondHandleInitEn() {
    console.log('FilePond has initialised', this.myPond);
  }

  pondHandleAddFileEn(event: any) {
    console.log('A file was added', event);
  }

  pondHandleInitIt() {
    console.log('FilePond has initialised', this.myPond);
  }

  pondHandleAddFileIt(event: any) {
    console.log('A file was added', event);
  }

  downloadPondHandleInit() {
    console.log('Download FilePond has initialised', this.myPond);
  }

  downloadPondHandleAddFile(event: any) {
    console.log('A file was added (download)', event);
  }

  addCourseUnit() {
    this.resetCourseUnitFields()
    this.courseUnitMode = 'add'
    this.showUnitDetails = true
  }

  resetCourseUnitFields() {
    this.selectedUnitId = ''
    this.selectedUnitModule = ''
    this.selectedUnitModuleCategory = ''
    this.unitNumber = ''
    this.unitTitle = ''
    this.unitTitleEn = ''
    this.unitTitleFr = ''
    this.unitTitleEu = ''
    this.unitTitleCa = ''
    this.unitTitleDe = ''
    this.unitTitleIt = ''
    this.videoDescription = ''
    this.videoDescriptionEN = ''
    this.videoDescriptionCA = ''
    this.videoDescriptionDE = ''
    this.videoDescriptionEU = ''
    this.videoDescriptionFR = ''
    this.videoDescriptionIT = ''
    this.text = ''
    this.textEN = ''
    this.textCA = ''
    this.textDE = ''
    this.textEU = ''
    this.textFR = ''
    this.textIT = ''
    this.unitPoints = ''
    this.courseUnitFileName = ''
    this.courseUnitFileNameEn = ''
    this.courseUnitFileNameFr = ''
    this.courseUnitFileNameEu = ''
    this.courseUnitFileNameCa = ''
    this.courseUnitFileNameDe = ''
    this.courseUnitFileNameIt = ''
    this.selectedUnitOption = ''
    this.unitDuration = ''
    this.selectedCourseUnitDurationUnit = ''
    this.selectedUnitType = ''
    this.externalLink = ''
    this.externalLinkEn = ''
    this.externalLinkFr = ''
    this.externalLinkEu = ''
    this.externalLinkCa = ''
    this.externalLinkDe = ''
    this.externalLinkIt = ''
    this.courseUnitFormSubmitted = false
    this.textSizeUnit = ''
    this.unitAvailability = false
    this.unitAvailabilityDate = ''
    this.embedScript = ''
    this.embedScriptEn = ''
    this.embedScriptFr = ''
    this.embedScriptEu = ''
    this.embedScriptCa = ''
    this.embedScriptDe = ''
    this.embedScriptIt = ''
  }

  addUnit() {
    this.courseUnitFormSubmitted = true

    let proceed = true
    if(!(this.selectedUnitType == 1 && this.selectedUnitOption == 'Vimeo' && ((this.vimeoToken && this.vimeoID) || this.externalLink))) {
      proceed = false
    }

    if(this.selectedUnitType == 1 && this.selectedUnitOption != 'Vimeo' && this.selectedUnitOption != 'Self-hosted') {
      if(this.externalLink) {
        proceed = true
      }
    }

    if(this.selectedUnitType != 1) {
      if(this.selectedUnitType == 7 && !this.embedScript) {
        proceed = false
      } else {
        proceed = true
      }
    }

    let code = this.defaultLanguage[0].code;
    if(code == 'en') { this.unitTitle = this.unitTitleEn || this.unitTitle }
    if(code == 'fr') { this.unitTitle = this.unitTitleFr || this.unitTitle }
    if(code == 'eu') { this.unitTitle = this.unitTitleEu || this.unitTitle }
    if(code == 'ca') { this.unitTitle = this.unitTitleCa || this.unitTitle }
    if(code == 'de') { this.unitTitle = this.unitTitleDe || this.unitTitle }
    if(code == 'it') { this.unitTitle = this.unitTitleIt || this.unitTitle }

    if(this.isAdvancedCourse) {
      if(!this.unitTitle
        || !this.selectedUnitType
        || (this.selectedUnitType != 1 && this.selectedUnitType != 3 && this.selectedUnitType != 6 && this.selectedUnitType != 7 && !this.courseUnitFileName)
        || ((this.selectedUnitType == 1 || this.selectedUnitType == 3) && this.selectedUnitOption == 'Self-hosted' && !this.courseUnitFileName)
        || ((this.selectedUnitType == 1 || this.selectedUnitType == 3) && this.selectedUnitOption != 'Self-hosted' && !proceed)
        || (this.selectedUnitType == 7 && !proceed)
        || !this.selectedUnitModule
        || !this.unitDuration
        || !this.selectedCourseUnitDurationUnit
        || (this.cta && (!this.ctaText || !this.ctaLink))
      ) {
          return false
        }
    } else {
      if(!this.unitTitle
        || !!this.unitPoints
        || !this.selectedUnitType
        || !this.courseUnitFile) {
          return false
        }
    }
    
    let course_file = localStorage.getItem('course_unit_file') == 'complete' ? this.courseUnitFileName : ''
    let course_file_en = localStorage.getItem('course_unit_file_en') == 'complete' ? this.courseUnitFileNameEn : ''
    let course_file_fr = localStorage.getItem('course_unit_file_fr') == 'complete' ? this.courseUnitFileNameFr : ''
    let course_file_eu = localStorage.getItem('course_unit_file_eu') == 'complete' ? this.courseUnitFileNameEu : ''
    let course_file_ca = localStorage.getItem('course_unit_file_ca') == 'complete' ? this.courseUnitFileNameCa : ''
    let course_file_de = localStorage.getItem('course_unit_file_de') == 'complete' ? this.courseUnitFileNameDe : ''
    let course_file_it = localStorage.getItem('course_unit_file_it') == 'complete' ? this.courseUnitFileNameIt : ''

    let params = {
      course_id: this.course.id,
      number: this.courseUnits.length + 1,
      title: this.unitTitle,
      title_en: this.unitTitleEn ? this.unitTitleEn : this.unitTitle,
      title_fr: this.unitTitleFr ? this.unitTitleFr : this.unitTitle,
      title_eu: this.unitTitleEu ? this.unitTitleEu : this.unitTitle,
      title_ca: this.unitTitleCa ? this.unitTitleCa : this.unitTitle,
      title_de: this.unitTitleDe ? this.unitTitleDe : this.unitTitle,
      title_it: this.unitTitleIt ? this.unitTitleIt : this.unitTitle,
      module_id: this.selectedUnitModule ? this.selectedUnitModule : 0,
      module_category_id: this.selectedUnitModuleCategory ? this.selectedUnitModuleCategory : 0,
      course_unit_type_id: this.selectedUnitType,
      points: this.unitPoints ? this.unitPoints : 0,
      duration: this.unitDuration ? this.unitDuration : 0,
      duration_unit: this.selectedCourseUnitDurationUnit ? this.selectedCourseUnitDurationUnit : 0,
      created_by: this.userId,
      file: course_file,
      file_en: course_file_en || '',
      file_fr: course_file_fr || '',
      file_eu: course_file_eu || '',
      file_ca: course_file_ca || '',
      file_de: course_file_de || '',
      file_it: course_file_it || '',
      option: this.selectedUnitOption ? this.selectedUnitOption : '',
      url: this.externalLink || '',
      url_en: this.externalLinkEn || '',
      url_fr: this.externalLinkFr || '',
      url_eu: this.externalLinkEu || '',
      url_ca: this.externalLinkCa || '',
      url_de: this.externalLinkDe || '',
      url_it: this.externalLinkIt || '',
      cta: this.cta ? 1 : 0,
      cta_text: this.ctaText,
      cta_link: this.ctaLink,
      description: this.videoDescription,
      description_en: this.videoDescriptionEN,
      description_ca: this.videoDescriptionCA,
      description_de: this.videoDescriptionDE,
      description_eu: this.videoDescriptionEU,
      description_fr: this.videoDescriptionFR,
      description_it: this.videoDescriptionIT,
      text: this.text,
      text_en: this.textEN,
      text_ca: this.textCA,
      text_de: this.textDE,
      text_eu: this.textEU,
      text_fr: this.textFR,
      text_it: this.textIT,
      vimeo_id: this.vimeoID || null,
      video_always_available: this.videoAvailability || 0,
      unit_availability: this.unitAvailability || 0,
      unit_availability_date: this.unitAvailabilityDate || null,
      script: this.embedScript || '',
      script_en: this.embedScriptEn || '',
      script_fr: this.embedScriptFr || '',
      script_eu: this.embedScriptEu || '',
      script_ca: this.embedScriptCa || '',
      script_de: this.embedScriptDe || '',
      script_it: this.embedScriptIt || '',
    }

    this._coursesService.addCourseUnitNew(
      params,
    ).subscribe(
      response => {
        if(this.videoBackgroundUnitFile) {
          this.updateVideoUnitBackground(response, response['course_unit']['id'])
        }
        this.getCourseUnits()
        this.resetCourseUnitFields()
        this.courseUnitMode = ''
        this.showUnitDetails = false
        localStorage.removeItem('course_unit_file')
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  updateVideoUnitBackground(resp, id) {
    this._coursesService.editUnitVideoBackground(id, this.course.id, this.videoBackgroundUnitFile).subscribe(
      response => {
      },
      error => {
        this.issaving = false
        console.log(error);
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  getCourseUnits() {
    this._coursesService.getCourseUnits(this.course.id).subscribe(data => {
      this.courseUnits = data['course_units']
    }, error => {
      
    })
  }

  updateUnit() {
    this.courseUnitFormSubmitted = true

    let code = this.defaultLanguage[0].code;
    if(code == 'en') { this.unitTitle = this.unitTitleEn || this.unitTitle }
    if(code == 'fr') { this.unitTitle = this.unitTitleFr || this.unitTitle }
    if(code == 'eu') { this.unitTitle = this.unitTitleEu || this.unitTitle }
    if(code == 'ca') { this.unitTitle = this.unitTitleCa || this.unitTitle }
    if(code == 'de') { this.unitTitle = this.unitTitleDe || this.unitTitle }
    if(code == 'it') { this.unitTitle = this.unitTitleIt || this.unitTitle }

    if(this.isAdvancedCourse) {
      if(!this.unitTitle
        || !this.selectedUnitType
        || !this.selectedUnitModule
        || !this.unitDuration
        || !this.selectedCourseUnitDurationUnit) {
          return false
        }
    } else {
      if(!this.unitTitle
        || !this.unitPoints
        || !this.selectedUnitType) {
          return false
        }
    }

    let params = {
      number: this.unitNumber,
      title: this.unitTitle,
      title_en: this.unitTitleEn,
      title_fr: this.unitTitleFr,
      title_eu: this.unitTitleEu,
      title_ca: this.unitTitleCa,
      title_de: this.unitTitleDe,
      title_it: this.unitTitleIt,
      module_id: this.selectedUnitModule ? this.selectedUnitModule : 0,
      module_category_id: this.selectedUnitModuleCategory ? this.selectedUnitModuleCategory : 0,
      course_unit_type_id: this.selectedUnitType,
      points: this.unitPoints ? this.unitPoints : 0,
      duration: this.unitDuration ? this.unitDuration : 0,
      duration_unit: this.selectedCourseUnitDurationUnit ? this.selectedCourseUnitDurationUnit : 0,
      created_by: this.userId,
      file: this.courseUnitFileName,
      file_en: this.courseUnitFileNameEn,
      file_fr: this.courseUnitFileNameFr,
      file_eu: this.courseUnitFileNameEu,
      file_ca: this.courseUnitFileNameCa,
      file_de: this.courseUnitFileNameDe,
      file_it: this.courseUnitFileNameIt,
      option: this.selectedUnitOption ? this.selectedUnitOption : '',
      url: this.externalLink || '',
      url_en: this.externalLinkEn || '',
      url_fr: this.externalLinkFr || '',
      url_eu: this.externalLinkEu || '',
      url_ca: this.externalLinkCa || '',
      url_de: this.externalLinkDe || '',
      url_it: this.externalLinkIt || '',
      cta: this.cta ? 1 : 0,
      cta_text: this.ctaText,
      cta_link: this.ctaLink,
      description: this.videoDescription,
      description_en: this.videoDescriptionEN,
      description_ca: this.videoDescriptionCA,
      description_de: this.videoDescriptionDE,
      description_eu: this.videoDescriptionEU,
      description_fr: this.videoDescriptionFR,
      description_it: this.videoDescriptionIT,
      text: this.text,
      text_en: this.textEN,
      text_ca: this.textCA,
      text_de: this.textDE,
      text_eu: this.textEU,
      text_fr: this.textFR,
      text_it: this.textIT,
      vimeo_id: this.vimeoID || null,
      video_always_available: this.videoAvailability || 0,
      unit_availability: this.unitAvailability || 0,
      unit_availability_date: this.unitAvailabilityDate || null,
      script: this.embedScript || '',
      script_en: this.embedScriptEn || '',
      script_fr: this.embedScriptFr || '',
      script_eu: this.embedScriptEu || '',
      script_ca: this.embedScriptCa || '',
      script_de: this.embedScriptDe || '',
      script_it: this.embedScriptIt || '',
    }

    this._coursesService.editCourseUnitNew(
      this.selectedUnitId,
      params,
    ).subscribe(
      response => {
        if(this.videoBackgroundUnitFile) {
          this.updateVideoUnitBackground(response, this.selectedUnitId)
        }
        this.getCourseUnits()
        this.resetCourseUnitFields()
        this.courseUnitMode = ''
        this.showUnitDetails = false
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  cancelShowUnit() {
    this.resetCourseUnitFields()
    this.courseUnitMode = ''
    this.showUnitDetails = false
    this.videoBackgroundUnitFile = null
    this.videoBackgroundImgSrcUnit = ''
    this.videoAvailability = false
  }

  fileExtension: any
  courseUnitFileChanged: any
  courseModuleCategoriesFiltered: any = []
  
  openInput() {
    document.getElementById("unitFileInput")?.click()
  }

  unitFileChange(files: File[]) {
    if (files.length > 0) {
      this.courseUnitFile = files[0];
      this.fileExtension = files[0].name.split('.')[1];
      const reader = new FileReader();
        reader.onload = e => this.courseUnitFileChanged = reader.result;
        reader.readAsDataURL(this.courseUnitFile);
    }
  }

  editCourseUnit(item) {
    this.courseUnitMode = 'edit'
    this.selectedUnitId = item.id
    this.selectedUnitModule = item.module_id

    this.courseModuleCategoriesFiltered = this.courseModuleCategories && this.courseModuleCategories.filter(m => {
      return m.module_id == item.module_id
    })

    this.selectedUnitModuleCategory = item.module_category_id || ''
    this.unitNumber = item.number
    this.unitTitle = item.title
    this.unitTitleEn = item.title_en
    this.unitTitleFr = item.title_fr
    this.unitTitleEu = item.title_eu
    this.unitTitleCa = item.title_ca
    this.unitTitleDe = item.title_de
    this.unitTitleIt = item.title_it
    this.unitDuration = item.duration
    this.selectedCourseUnitDurationUnit = item.duration_unit
    this.selectedUnitType = item.course_unit_type_id || ''
    this.unitPoints = item.points
    this.courseUnitFileName = item.file
    this.courseUnitFileNameEn = item.file_en
    this.courseUnitFileNameFr = item.file_fr
    this.courseUnitFileNameEu = item.file_eu
    this.courseUnitFileNameCa = item.file_ca
    this.courseUnitFileNameDe = item.file_de
    this.courseUnitFileNameIt = item.file_it
    this.showUnitDetails = true
    this.courseUnitFormSubmitted = false
    this.selectedUnitOption = item.option
    this.externalLink = item.url
    this.externalLinkEn = item.url_en
    this.externalLinkFr = item.url_fr
    this.externalLinkEu = item.url_eu
    this.externalLinkCa = item.url_ca
    this.externalLinkDe = item.url_de
    this.externalLinkIt = item.url_it
    this.cta = item.cta == 1 ? true : false
    this.ctaText = item.cta_text || ''
    this.ctaLink = item.cta_link || ''
    this.videoDescription = item.description || ''
    this.videoDescriptionEN = item.description_en || ''
    this.videoDescriptionCA = item.description_ca || ''
    this.videoDescriptionDE = item.description_de || ''
    this.videoDescriptionEU = item.description_eu || ''
    this.videoDescriptionFR = item.description_fr || ''
    this.videoDescriptionIT = item.description_it || ''
    this.text = item.text || ''
    this.textEN = item.text_en || ''
    this.textCA = item.text_ca || ''
    this.textDE = item.text_de || ''
    this.textEU = item.text_eu || ''
    this.textFR = item.text_fr || ''
    this.textIT = item.text_it || ''
    this.vimeoID = item.vimeo_id
    this.videoBackgroundImgSrcUnit = item.video_cover ? (environment.api + '/get-course-image/' + item.video_cover) : ''
    this.videoAvailability = item.video_always_available
    this.unitAvailability = item.unit_availability == 1 ? true : false
    this.unitAvailabilityDate = item.unit_availability_date
    this.embedScript = item.script
    this.embedScriptEn = item.script_en || ''
    this.embedScriptFr = item.script_fr || ''
    this.embedScriptEu = item.script_eu || ''
    this.embedScriptCa = item.script_ca || ''
    this.embedScriptDe = item.script_de || ''
    this.embedScriptIt = item.script_it || ''

    if(this.cta) {
      this.getCTAs()
    }
  }

  getCTAs() {
    this._coursesService.getCTAs(this.selectedUnitId).subscribe(data => {
      this.ctaList = data['cta']
    }, error => {
      
    })
  }

  deleteCourseUnit(item) {
    this._coursesService.deleteCourseUnit(item.id)
      .subscribe(
          response => {
            if (response) {
              this.getCourseUnits()
              this.open(this._translateService.instant("dialog.deletedsuccessfully"), "");
            }
          },
          error => {
            console.log(error)
            this.open(this._translateService.instant("dialog.error"), "");
          }
      )
  }

  saveUnit() {
    if(this.courseUnitMode == 'add') {
      this.addUnit();
    } else if(this.courseUnitMode == 'edit') {
      this.updateUnit();
    }
  }

  handleChangeModule(event) {
    this.courseModuleCategoriesFiltered = this.courseModuleCategories && this.courseModuleCategories.filter(m => {
      return m.module_id == event.target.value
    })
  }

  toggleCtaStatus(event) {
    if(event?.target?.checked) {
      this.getCTAs()
    }
  }

  addUnitCta() {
    this.resetCtaFields()
    this.ctaMode = 'add'
    this.showCtaDetails = true
  }

  addCta() {
    this.ctaFormSubmitted = true

    if(!this.selectedUnitId
      || !this.ctaItemText
      || !this.ctaItemLink) {
        return false
      }

      let params = {
        company_id: this.companyId,
        course_id: this.course.id,
        course_unit_id: this.selectedUnitId,
        number: this.ctaList.length + 1,
        cta_text: this.ctaItemText,
        cta_link: this.ctaItemLink,
      }

      this._coursesService.addCTA(
        params,
      ).subscribe(
        response => {
          this.getCTAs()
          this.resetCtaFields()
          this.ctaMode = ''
          this.showCtaDetails = false
        },
        error => {
          this.open(this._translateService.instant("dialog.error"), "");
        }
      )
  }

  editCta(item) {
    this.ctaMode = 'edit'
    this.selectedCtaId = item.id
    this.ctaItemNumber = item.number
    this.ctaItemText = item.cta_text
    this.ctaItemLink = item.cta_link
    this.showCtaDetails = true
    this.ctaFormSubmitted = false
  }

  updateCta() {
    if(!this.selectedUnitId
      || !this.ctaItemText
      || !this.ctaItemLink) {
        return false
      }

      let params = {
        id: this.selectedCtaId,
        company_id: this.companyId,
        course_id: this.course.id,
        course_unit_id: this.selectedUnitId,
        number: this.ctaItemNumber,
        cta_text: this.ctaItemText,
        cta_link: this.ctaItemLink,
      }

      this._coursesService.editCTA(
        params,
      ).subscribe(
        response => {
          this.getCTAs()
          this.resetCtaFields()
          this.ctaMode = ''
          this.showCtaDetails = false
        },
        error => {
          this.open(this._translateService.instant("dialog.error"), "");
        }
      )
  }

  deleteCta(cta) {
    this._coursesService.deleteCTA(cta.id)
      .subscribe(
          response => {
            if (response) {
              this.getCTAs()
              this.open(this._translateService.instant("dialog.deletedsuccessfully"), "");
            }
          },
          error => {
            console.log(error)
            this.open(this._translateService.instant("dialog.error"), "");
          }
      )
  }

  cancelShowCta() {
    this.resetCtaFields()
    this.ctaMode = ''
    this.showCtaDetails = false
  }

  resetCtaFields() {
    this.selectedCtaId = ''
    this.ctaItemText = ''
    this.ctaItemLink = ''
    this.ctaItemNumber = ''
    this.ctaFormSubmitted = false
  }

  saveCta() {
    if(this.ctaMode == 'add') {
      this.addCta();
    } else if(this.ctaMode == 'edit') {
      this.updateCta();
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  onFilterTutorChange(search) {
    if(search) {
      let filteredTutors = this.allTutors?.filter(m => {
        return (
          (m.name &&
            m.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0) ||
          (m.first_name &&
            m.first_name
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                search
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.last_name &&
            m.last_name
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                search
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.email &&
            m.email.toLowerCase().indexOf(search.toLowerCase()) >=
              0)
        );
      })
      this.filteredTutors = filteredTutors;
    } else {
      this.filteredTutors = this.allTutors;
    }
  }

  getCourseWalls() {
    this._coursesService
    .getCourseWalls(this.companyId)
    .subscribe( 
      response => {
        this.groupWalls = response.course_walls
        setTimeout(() => {
          if(this.course?.group_id > 0) {
            let match = this.groupWalls && this.groupWalls.some(a => a.id === this.course?.group_id)
            if(match) {
              this.selectedWall = this.course?.group_id
            } else {
              let group_wall = this.groupWalls.filter(gw => {
                let include = gw.title.toLowerCase() == this.course?.title.toLowerCase()
                return include
              })
              if(group_wall && group_wall.length > 0) {
                this.selectedWall = group_wall[0].id
              }
            }
          }
        }, 500)
      },
      error => {
          console.log(error);
      }
    );
  }

  getWallName(wall) {
    return this.language == 'en' ? (wall.title_en || wall.title) : (this.language == 'fr' ? (wall.title_fr || wall.title) : 
        (this.language == 'eu' ? (wall.title_eu || wall.title) : (this.language == 'ca' ? (wall.titlee_ca || wall.title) : 
        (this.language == 'de' ? (wall.title_de || wall.title) : (this.language == 'it' ? (wall.title_it || wall.title) : (wall.title))
      )))
    )
  }

  getModuleText(module) {
    return this.language == 'en' ? module.module_title_en : (this.language == 'fr' ? (module.title_fr || module.module_title) : 
      (this.language == 'eu' ? (module.module_title_eu || module.module_title) : (this.language == 'ca' ? (module.module_title_ca || module.module_title) : 
      (this.language == 'de' ? (module.module_title_de || module.module_title) : module.module_title)
      ))
    )
  }

  getCourseAssessments() {
    this._coursesService
    .getCourseAssessmentItems(this.id)
    .subscribe( 
      response => {
        this.formatCourseAssessments(response.course_assessments);
      },
      error => {
        console.log(error);
      }
    );
  }

  formatCourseAssessments(course_assessments) {
    let courseAssessments = course_assessments?.map(item => {
      let timing = this.assessmentTimings?.find((f) => f.value == item?.timing);
      let type = item?.type == 'module' ? this.getModuleText(item) : this._translateService.instant('course-assessment.course')

      return {
        ...item,
        course_assessment_timing: `${timing?.text} ${this._translateService.instant('course-assessment.of')} ${type}`,
        passing_rate: item.passing_rate && item.passing_rate != 'undefined' ? `${item.passing_rate?.replace('.00', '')}%` : ''
      }
    })

    this.courseAssessments = courseAssessments;
  }

  goToAssessments() {
    this._router.navigate([`/courses/assessments`]);
  }

  addCourseAssessment() {
    this.resetCourseAssessmentFields()
    this.courseAssessmentMode = 'add'
    this.showAssessmentDetails = true
  }

  resetCourseAssessmentFields() {
    this.selectedAssessment = '';
    this.selectedAssessmentTiming = '';
    this.selectedAssessmentTimingType = '';
    this.selectedAssessmentModule = '';
    this.passingRate = '';
    this.requirePass = false;
    this.courseAssessmentMode = '';
    this.showAssessmentDetails = false;
    this.courseAssessmentFormSubmitted = false;
  }

  cancelShowAssessment() {
    this.resetCourseAssessmentFields()
    this.courseAssessmentMode = '';
    this.showAssessmentDetails = false;
  }

  handleChangeAssessmentTiming(event) {
    this.initializeTimingTypes(event?.target?.value);
  }

  initializeTimingTypes(value) {
    let assessment_timing = this.assessmentTimings.find(at => at.value == value);
    this.assessmentTimingsTypes = assessment_timing?.subtypes || [];
    this.selectedAssessmentTimingType = this.assessmentTimingsTypes?.length > 0 ? this.assessmentTimingsTypes[0].value : '';
  }

  saveAssessment() {
    if(this.courseAssessmentMode == 'add') {
      this.addAssessment();
    } else if(this.courseAssessmentMode == 'edit') {
      this.updateAssessment();
    }
  }

  addAssessment() {
    this.courseAssessmentFormSubmitted = true;

    if(!this.selectedAssessment || !this.selectedAssessmentTiming || !this.selectedAssessmentTimingType) {
      return false
    }

    let params = {
      company_id: this.companyId,
      course_id: this.id,
      assessment_id: this.selectedAssessment || null,
      timing: this.selectedAssessmentTiming,
      type: this.selectedAssessmentTimingType,
      module_id: this.selectedAssessmentModule || null,
      passing_rate: this.passingRate || null,
      required_to_pass: this.requirePass || false,
    }

    this._coursesService.addCourseAssessmentItem(
      params,
    ).subscribe(
      response => {
        this.getCourseAssessments();
        this.resetCourseAssessmentFields();
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  updateAssessment() {
    this.courseAssessmentFormSubmitted = true;

    if(!this.selectedAssessment || !this.selectedAssessmentTiming || !this.selectedAssessmentTimingType) {
      return false
    }

    let params = {
      company_id: this.companyId,
      course_id: this.id,
      assessment_id: this.selectedAssessment || null,
      timing: this.selectedAssessmentTiming,
      type: this.selectedAssessmentTimingType,
      module_id: this.selectedAssessmentModule || null,
      passing_rate: this.passingRate || null,
      required_to_pass: this.requirePass || false,
    }

    this._coursesService.editCourseAssessmentItem(
      this.selectedAssessmentId,
      params,
    ).subscribe(
      response => {
        this.getCourseAssessments();
        this.resetCourseAssessmentFields();
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  editCourseAssessment(item) {
    this.courseAssessmentMode = 'edit';
    this.selectedAssessmentId = item.id;
    this.selectedAssessment = item.assessment_id;
    this.selectedAssessmentTiming = item.timing || '';
    this.initializeTimingTypes(this.selectedAssessmentTiming);
    this.selectedAssessmentTimingType = item.type || '';
    this.selectedAssessmentModule = item.module_id || '';
    this.passingRate = item?.passing_rate?.replace('.00', '')?.replace('%', '');
    this.requirePass = item?.required_to_pass == 1 ? true : false;
    this.showAssessmentDetails = true;
    this.courseAssessmentFormSubmitted = false;
  }

  deleteCourseAssessment(item) {
    this._coursesService.deleteCourseAssessmentItem(item.id)
      .subscribe(
        response => {
          if (response) {
            this.getCourseAssessments()
            this.open(this._translateService.instant("dialog.deletedsuccessfully"), "");
          }
        },
        error => {
          console.log(error)
          this.open(this._translateService.instant("dialog.error"), "");
        }
      )
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  deleteBackground(){
    this.videoBackgroundImgSrc = ""
  }

  courseIntroPondHandleInit() {
    console.log('Course Intro FilePond has initialised', this.myPond);
  }

  courseIntroPondHandleAddFile(event: any) {
    console.log('A file was added (course Intro)', event);
  }

  removeExistingIntroPDF() {
    this.existingIntroRemoved = true;
  }

  selectCourseCover(mode) {
    if(mode == 'video') {
      this.isDefaultVideo = true;
      this.isDefaultPhoto = false;
    } else {
      this.isDefaultVideo = false;
      this.isDefaultPhoto = true;
    }
  }

  editCoverStatus(event, mode) {
    let checked = event?.target?.checked
    switch(mode) {
      case 'photo':
        this.setDefaultPhoto = checked ? true : false;
        this.setDefaultVideo = checked ? false : true;
        break;
      case 'video':
        this.setDefaultPhoto = checked ? false : true;
        this.setDefaultVideo = checked ? true : false;
        break;
    }
  }

  eventPondHandleVideoInit() {
    console.log('FilePond has initialised', this.coursePondVideo);
  }

  eventPondHandleAddVideoFile(event: any) {
    console.log('A file was added', event);
    let course_cover_video_file_status = localStorage.getItem('course_cover_video_file');
    let course_cover_video_file = course_cover_video_file_status == 'complete' ? this.courseCoverVideoFileName : '';
  }

  eventPondHandleActivateVideoFile(event: any) {
    console.log('A file was activated', event);
  }

  eventPondHandleProcessFiles() {
    console.log('FilePond has processed files', this.coursePondVideo);
    this.existingVideoURL = `${environment.api}/get-course-unit-file/${this.courseCoverVideoFileName}`;
    this.courseVideoCoverUploaded = true;
  }

  courseIntroPondHandleInitEn() {
    console.log('Course Intro FilePond has initialised', this.myPond);
  }

  courseIntroPondHandleInitIt() {
    console.log('Course Intro FilePond has initialised', this.myPond);
  }

  courseIntroPondHandleAddFileEn(event: any) {
    console.log('A file was added (course Intro)', event);
  }

  courseIntroPondHandleAddFileIt(event: any) {
    console.log('A file was added (course Intro)', event);
  }

  removeExistingIntroPDFEn() {
    this.existingIntroRemovedEn = true;
  }

  removeExistingIntroPDFIt() {
    this.existingIntroRemovedIt = true;
  }

  downloadPondHandleInitEn() {
    console.log('Download FilePond has initialised', this.myPond);
  }

  downloadPondHandleInitIt() {
    console.log('Download FilePond has initialised', this.myPond);
  }

  downloadPondHandleAddFileEn(event: any) {
    console.log('A file was added (download)', event);
  }

  downloadPondHandleAddFileIt(event: any) {
    console.log('A file was added (download)', event);
  }

  clearVideo() {
    this.clearedVideo = true;
    this.existingVideoURL = '';
    this.setDefaultPhoto = true;
    this.setDefaultVideo = false;
  }

  clearFileLocal() {
    localStorage.removeItem('course_cover_video_file');
  }
  
  ngOnDestroy() {
    this.clearFileLocal();
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}