import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { BreadcrumbComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  ExcelService,
  LocalService,
  UserService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { initFlowbite } from "flowbite";
import get from "lodash/get";
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
registerPlugin(FilepondPluginImagePreview, FilepondPluginImageEdit, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

@Component({
  selector: "app-setting-home-template",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    FilePondModule,
    SearchComponent,
    BreadcrumbComponent,
  ],
  templateUrl: "./home-template.component.html",
})
export class HomeTemplateSettingComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;

  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  searchText: any;
  placeholderText: any;
  userId: any;
  companyId: any;
  language: any;
  isloading: boolean = true;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  company: any;
  domain: any;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  searchKeyword: any;

  id: any
  templates: any
  imageSrc: string = environment.api +  '/get-image-company/'
  setting: any
  pageTitle: any
  template: any
  features: any = []
  planTitle: any
  isPlanEnabled: boolean = false
  courseTitle: any
  isCourseEnabled: boolean = false
  showVideo: boolean = false
  showTitle: boolean = false
  videoTitle: any
  videoDescription: any
  videoFile: any
  showCourses: boolean = false
  showEvents: boolean = false
  settingsMode: any
  showVideoSettingsModal: boolean = false
  videoFileName: any
  selectedVideoOption: any = 'Self-hosted'
  externalLink: any = ''
  videoFormSubmitted: boolean = false
  videoOptions = ['YouTube', 'Vimeo', 'External', 'Self-hosted']
  @ViewChild('myPond', {static: false}) myPond: any;
  pondOptions = {
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
      acceptedFileTypes: 'video/mp4',
      server: {
        process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
          const formData = new FormData();
          let fileExtension = file ? file.name.split('.').pop() : '';
          this.videoFileName = 'homeVideoFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
          formData.append('file', file, this.videoFileName);
          localStorage.setItem('home_video_file', 'uploading');
  
          const request = new XMLHttpRequest();
          request.open('POST', environment.api + '/company/course/temp-upload');
  
          request.upload.onprogress = (e) => {
            progress(e.lengthComputable, e.loaded, e.total);
          };
  
          request.onload = function () {
              if (request.status >= 200 && request.status < 300) {
                load(request.responseText);
                localStorage.setItem('home_video_file', 'complete');
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
  sectionOptions: any = []
  hasProfileHomeContent: boolean = false
  profileHomeContentSetting: any = []
  profileHomeContentSettingOptionId: any
  customMemberType: any = []
  selectedProfile: any = ''
  profileHomeContent: any = []
  showCourseSettingModal: boolean = false
  showEventSettingModal: boolean = false
  showNote: boolean = true
  showVideoNote: boolean = true

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _excelService: ExcelService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslanguage) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this._translateService.use(this.language || "es");

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
      this.companyId = company[0].id;
      this.domain = company[0].domain;
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
    initFlowbite();
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.initData();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.adminaccess"
    );
    this.level3Title = this._translateService.instant("company-settings.personalizehometemplate");
    this.level4Title = "";
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  async initData() {
    this.customMemberType = get(await this._userService.getCustomMemberTypes(this.companyId).toPromise(), 'member_types');
    if(this.customMemberType?.length > 0){
      this.profileHomeContent.push({
        id: 0,
        type: 'General',
        type_en: '',
        type_fr: '',
        type_de: '',
        type_eu: '',
        type_ca: '',
        video_title: this.videoTitle,
        video_description: this.videoDescription,
        video_file: this.videoFile,
        selected_video_option: this.selectedVideoOption,
        has_courses: 0,
        has_events: 0
      })
      this.customMemberType?.forEach(cmt => {
        this.profileHomeContent.push({
          id: cmt.id,
          type: cmt.type,
          type_en: cmt.type_en,
          type_fr: cmt.type_fr,
          type_de: cmt.type_de,
          type_eu: cmt.type_eu,
          type_ca: cmt.type_ca,
          video_title: '',
          video_description: '',
          video_file: '',
          selected_video_option: '',
          has_courses: 0,
          has_events: 0
        })
      })
    }
    
    this.getCompanyFeatures()
    this.getSettingsTitle()
    this.loadTemplate()
  }

  async getCompanyFeatures() {
    this.features = this._localService.getLocalStorage(environment.lsfeatures)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (!this.features || this.features?.length == 0) {
      this.features = await this._companyService
        .getFeatures(this.domain)
        .toPromise();
    }

    if (this.features && this.companyId > 0) {
      let planFeature = this.features?.filter(f => {
        return f.feature_name == "Plans"
      })
      if(planFeature && planFeature[0]) {
        this.isPlanEnabled = true
        this.planTitle = this.language == 'en' ? (planFeature[0].name_en || planFeature[0].feature_name) : (this.language == 'fr' ? (planFeature[0].name_fr || planFeature[0].feature_name_FR) : 
            (this.language == 'eu' ? (planFeature[0].name_eu || planFeature[0].feature_name_EU) : (this.language == 'ca' ? (planFeature[0].name_ca || planFeature[0].feature_name_CA) : 
            (this.language == 'de' ? (planFeature[0].name_de || planFeature[0].feature_name_DE) : (planFeature[0].name_es || planFeature[0].feature_name_ES))
          ))
        )
      }

      let courseFeature = this.features?.filter(f => {
        return f.feature_name == "Courses"
      })
      if(courseFeature && courseFeature[0]) {
        this.isCourseEnabled = true
        this.courseTitle = this.language == 'en' ? (courseFeature[0].name_en || courseFeature[0].feature_name) : (this.language == 'fr' ? (courseFeature[0].name_fr || courseFeature[0].feature_name_FR) : 
            (this.language == 'eu' ? (courseFeature[0].name_eu || courseFeature[0].feature_name_EU) : (this.language == 'ca' ? (courseFeature[0].name_ca || courseFeature[0].feature_name_CA) : 
            (this.language == 'de' ? (courseFeature[0].name_de || courseFeature[0].feature_name_DE) : (courseFeature[0].name_es || courseFeature[0].feature_name_ES))
          ))
        )
      }
    }
  }

  getSettingsTitle() {
    this._companyService
      .getCategorySetting(4)
      .subscribe(
        response => {
          this.sectionOptions = response['section_options']
          this.setting = response.setting ? response.setting[0] : {}
          this.pageTitle = this.language == 'en' ? this.setting.category_en : (
            this.language == 'fr' ? this.setting.category_fr : this.setting.category_es
          )
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

  async getOtherSettingsSectionOptionContent(option_id, section_id){
    await this._companyService.getOtherSettingsSectionOptionContent(option_id, section_id, this.companyId)
    .subscribe(
      async response => {
        let optionContent: any[] = []
        optionContent.push(response['option_content']);
        optionContent?.forEach(oc => {
          if(this.profileHomeContentSetting['id'] == oc['option_id'] && this.profileHomeContentSetting['section_id'] == oc['section_id']){
            this.hasProfileHomeContent = oc.active ? true : false
            this.profileHomeContentSettingOptionId = oc.id
          }
        })
      }
    )
  }

  loadTemplate() {
    this._companyService
    .getHomeTemplate(2, this.companyId)
    .subscribe(
      response => {
        this.template = (response.home_template_mapping)?.filter(tmp => {
          return !tmp.custom_member_type_id
        })
        this.template = this.template[0]

        let custom_member_template = (response.home_template_mapping)?.filter(tmp => {
          return tmp.custom_member_type_id
        })

        this.profileHomeContent?.forEach(phc => {
          if(custom_member_template?.title) {
            let cmt = custom_member_template
            if(phc.id == cmt.custom_member_type_id){
              phc.video_title = cmt.video_title
              phc.video_description = cmt.video_description
              phc.video_file = cmt.video_file,
              phc.has_courses = cmt.has_courses ? 1 : 0,
              phc.has_events = cmt.has_events ? 1 : 0
            }

            if(phc.video_file) {
              if(phc.video_file.indexOf('.mp4') >= 0) {
                phc.selected_video_option = 'Self-hosted'
              } else if(phc.video_file.indexOf('youtube') >= 0) {
                phc.selected_video_option = 'YouTube'
              } else if(phc.video_file.indexOf('vimeo') >= 0) {
                phc.selected_video_option = 'Vimeo'
              } else {
                phc.selected_video_option = 'External'
              }
            }
          } else {
            custom_member_template?.forEach(cmt => {
              if(phc.id == cmt.custom_member_type_id){
                phc.video_title = cmt.video_title
                phc.video_description = cmt.video_description
                phc.video_file = cmt.video_file,
                phc.has_courses = cmt.has_courses ? 1 : 0,
                phc.has_events = cmt.has_events ? 1 : 0
              }
  
              if(phc.video_file) {
                if(phc.video_file.indexOf('.mp4') >= 0) {
                  phc.selected_video_option = 'Self-hosted'
                } else if(phc.video_file.indexOf('youtube') >= 0) {
                  phc.selected_video_option = 'YouTube'
                } else if(phc.video_file.indexOf('vimeo') >= 0) {
                  phc.selected_video_option = 'Vimeo'
                } else {
                  phc.selected_video_option = 'External'
                }
              }
            })
          }
          
        })

        if(this.template) {
            this.showTitle = this.template.has_title == 1 ? true : false
            this.showVideo = this.template.has_video == 1 ? true : false
            this.showCourses = this.template.has_courses == 1 ? true : false
            this.showEvents = this.template.has_events == 1 ? true : false
            this.videoTitle = this.template.video_title
            this.videoDescription = this.template.video_description
            this.videoFile = this.template.video_file
            this.profileHomeContent[0].video_title = this.template.video_title
            this.profileHomeContent[0].video_description = this.template.video_description
            this.profileHomeContent[0].video_file = this.template.video_file
            this.profileHomeContent[0].has_title = this.template.has_title
            this.profileHomeContent[0].has_video = this.template.has_video
            this.profileHomeContent[0].has_courses = this.template.has_courses
            this.profileHomeContent[0].has_events = this.template.has_events


            if(this.template.video_file) {
                if(this.template.video_file.indexOf('.mp4') >= 0) {
                    this.selectedVideoOption = 'Self-hosted'
                } else if(this.template.video_file.indexOf('youtube') >= 0) {
                    this.selectedVideoOption = 'YouTube'
                    this.externalLink = this.template.video_file
                } else if(this.template.video_file.indexOf('vimeo') >= 0) {
                    this.selectedVideoOption = 'Vimeo'
                    this.externalLink = this.template.video_file
                } else {
                    this.selectedVideoOption = 'External'
                    this.externalLink = this.template.video_file
                }
                this.profileHomeContent[0].selected_video_option = this.selectedVideoOption
            }
        }
      },
      error => {
        console.log(error);
      }
    )
  }

  toggleHomeContentStatus(event, section_option_content_id) {
    this.hasProfileHomeContent = event
    if(this.hasProfileHomeContent){
        this._companyService.activateOtherSetting(section_option_content_id, this.companyId, {})
        .subscribe(
            async response => {
            }
        )
    } else {
        this._companyService.deactivateOtherSetting(section_option_content_id, this.companyId, {})
        .subscribe(
            async response => {
            }
        )
    }          
  }

  updateVideoSettings(mode) {
    this.showNote = true
    this.showVideoNote = true
    this.videoFormSubmitted = false
    this.settingsMode = mode
    this.showVideoSettingsModal = true
    this.modalbutton?.nativeElement.click()
  }

  updateCourseSettings(mode) {
    this.settingsMode = mode
    this.showCourseSettingModal = true
    this.modalbutton?.nativeElement.click()
  }

  updateEventSettings(mode) {
    this.settingsMode = mode
    this.showEventSettingModal = true
    this.modalbutton?.nativeElement.click()
  }

  saveVideoSettings() {
    this.videoFormSubmitted = true

    if(this.profileHomeContent[0] && this.hasProfileHomeContent){
        this.videoTitle = this.hasProfileHomeContent && this.profileHomeContent[0].video_title ? this.profileHomeContent[0].video_title : this.videoTitle
        this.videoDescription = this.hasProfileHomeContent && this.profileHomeContent[0].video_description ? this.profileHomeContent[0].video_description : this.videoDescription
    } 

    if(!this.videoTitle || !this.videoDescription) {
        return false
    }

    let video_file_status = localStorage.getItem('home_video_file')
    let video_file = video_file_status == 'complete' ? this.videoFileName : ''

    let params = {
        id: 2,
        custom_member_type_id: this.selectedProfile || 0,
        company_id: this.companyId,
        video_title: this.hasProfileHomeContent ? this.profileHomeContent[0].video_title : this.videoTitle,
        video_description: this.hasProfileHomeContent ? this.profileHomeContent[0].video_description : this.videoDescription,
        video_file: (video_file || this.externalLink) || this.videoFile,
        profile_content: this.hasProfileHomeContent ? this.profileHomeContent : '',
        has_video: this.template?.has_video,
        has_title: this.template?.has_title
    }

    this._companyService.updateHomeVideoSettings(
        params,
      ).subscribe(
        response => {
            this.loadTemplate()
            this.showVideoSettingsModal = false
            this.closemodalbutton?.nativeElement.click();
            localStorage.removeItem('home_video_file')
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
        },
        error => {
            this.open(this._translateService.instant('dialog.error'), '')
        }
    )

    this.showVideoSettingsModal = false
  }

  toggleModuleStatus(event, module, custom_member_type_id:any = '') {
    let params;
    params = {
        id: 2,
        company_id: this.companyId,
        status: event?.target?.checked ? 1 : 0,
        module: module,
        profile_content: this.hasProfileHomeContent ? this.profileHomeContent : '',
        custom_member_type_id: custom_member_type_id,
        has_title: this.template?.has_title,
        has_video: this.template?.has_video
    }
    
    this._companyService.updateHomeModuleSettings(
      params,
    ).subscribe(
      response => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
      },
      error => {
        this.open(this._translateService.instant('dialog.error'), '')
      }
    )
  }

  handleSearch(event) {
  //   this.pageIndex = 0;
  //   this.pageSize = 10;
  //   this.searchKeyword = event;
  //   this.cities = this.filterCities();
  //   this.refreshTable(this.cities);
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();
    return timestamp;
  }

  pondHandleInit() {
    console.log('FilePond has initialised', this.myPond);
}

  pondHandleAddFile(event: any) {
    console.log('A file was added', event);
  }

  handleProfileContent(event) {
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