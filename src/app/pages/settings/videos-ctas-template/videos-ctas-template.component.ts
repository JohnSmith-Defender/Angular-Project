import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { ColorPickerModule } from 'ngx-color-picker';
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
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
import { DomSanitizer } from '@angular/platform-browser';
import { EditorModule } from "@tinymce/tinymce-angular";
import { initFlowbite } from "flowbite";
import get from "lodash/get";

import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { SafeContentHtmlPipe } from "@lib/pipes";
registerPlugin(FilepondPluginImagePreview, FilepondPluginImageEdit, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

@Component({
  selector: "app-settings-lead-videos-ctas-template",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    ColorPickerModule,
    EditorModule,
    SafeContentHtmlPipe,
    SearchComponent,
    BreadcrumbComponent,
    PageTitleComponent,
    ToastComponent,
    FilePondModule
  ],
  templateUrl: "./videos-ctas-template.component.html",
})
export class VideosCTAsTemplateComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;

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
  mode: any;
  formSubmitted: boolean = false;
  landingPagesForm = new FormGroup({
    title: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ["title", "location", "action"];
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  @ViewChild("modalbutton0", { static: false }) modalbutton0:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton0", { static: false }) closemodalbutton0:
    | ElementRef
    | undefined;
  searchKeyword: any;
  title: any;
  description: any;
  selectedLocation: any = '';
  questionLocations: any = [];
  selectedId: any;
  selectedItemId: any;
  selectedLayout: any = 'boxed';
  layouts: any = [];
  descriptionText: any;
  descriptionTextColor: any = '#000000';
  expandedOption: any = 'general';
  activateVideo: boolean = true;
  activateCTA: boolean = true;
  activateDescription: boolean = true;
  videoEmbed: any;
  videoEmbedFileName: any;
  vimeoID: any;
  CTATextColor: any;
  CTAButtonColor: any;
  videosCTAs: any;
  CTAText: any;
  CTALink: any;
  safeLessonURL: any;
  updatedVideo: any;
  updatedCode: any;
  landingPageTemplateFileName: any;
  bannerImage: any;
  activateBanner: boolean = true;
  activatePageTitle: boolean = true;
  pageTitleText:string ='';
  activateQuesAnsSection: boolean = true;
  quesAnsText:string ='';
  activateFooter: boolean = true;
  footerText:string =''


  pondFiles = [];
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
    acceptedFileTypes: 'image/jpg, image/jpeg, image/png',
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.landingPageTemplateFileName = 'lp_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('image', file, this.landingPageTemplateFileName);
        localStorage.setItem('landing_page_template_file', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/v2/landing-page/temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('landing_page_template_file', 'complete');
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

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private _location: Location,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
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
    this.layouts = [
      {
        value: 'boxed',
        text: this._translateService.instant('leads.boxed')
      },
      {
        value: 'fullwidth',
        text: this._translateService.instant('leads.fullwidth')
      },
    ]
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.getVideosCTAs();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.channels"
    );
    this.level3Title = "TikTok";
    this.level4Title = this._translateService.instant("leads.landingpages");
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  async getVideosCTAs() {
    this._companyService
      .getVideosCTAsDetails(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.videosCTAs = response.videos_ctas;
          this.formatDetails();
          this.isloading = false;
        },
        (error) => {
          
        }
      );
  }

  public onCTATextEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.CTATextColor = data
    }
  }

  public onCTAButtonEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.CTAButtonColor = data
    }
  }

  public onDescriptionTextEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.descriptionTextColor = data
    }
  }

  formatDetails() {
    this.bannerImage = this.videosCTAs?.details?.banner_image 
    this.pageTitleText = this.videosCTAs?.details?.page_title_text 
    this.quesAnsText = this.videosCTAs?.details?.ques_ans_text
    this.footerText = this.videosCTAs?.details?.footer_text


    this.activateDescription = this.videosCTAs?.details?.id > 0 ? (this.videosCTAs?.details?.description == 1 ? true : false) : true;
    this.descriptionTextColor = this.videosCTAs?.details?.description_text_color || '#000000';
    this.descriptionText = this.videosCTAs?.details?.description_text;
    this.activateVideo = this.videosCTAs?.details?.id > 0 ? (this.videosCTAs?.details?.video == 1 ? true : false) : true;
    this.videoEmbed = this.videosCTAs?.details?.video_embed;
    this.activateCTA = this.videosCTAs?.details?.id > 0 ? (this.videosCTAs?.details?.cta == 1 ? true : false) : true;
    this.CTAText = this.videosCTAs?.details?.cta_text || '';
    this.CTAButtonColor = this.videosCTAs?.details?.cta_button_color || '';
    this.CTATextColor = this.videosCTAs?.details?.cta_button_text_color || '';
    this.CTALink = this.videosCTAs?.details?.cta_link || '';
    this.vimeoID = this.videosCTAs?.details?.vimeo_id || '';
  }

  getSafeLessonUrl() {
    let url = this.videoEmbed?.replace('watch?v=', 'embed/');
    if(url && url.indexOf("&") > 0) {
      url = url.substring(0, url.indexOf("&"));
    }
    if(this.videoEmbed?.indexOf('vimeo') >= 0 && this.videoEmbed?.indexOf('iframe') < 0) {
      url = this.videoEmbed?.replace('vimeo.com/', 'player.vimeo.com/video/');
    } else if(this.videoEmbed?.indexOf('canva.com') >= 0 && this.videoEmbed?.indexOf('/watch?embed') < 0) {
      url = this.videoEmbed?.replace('/watch', '/watch?embed');
    } else {
      url = this.videoEmbed;
    }

    let updated_url = url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : '';
    this.updatedVideo = updated_url;
    this.updatedCode = url;
    return updated_url;
  }

  redirectToCTALink() {
    if(this.CTALink) {
      window.open(this.CTALink, "_blank");
    }
  }

  expandOption(option) {
    let expandedOption = this.expandedOption == option ? '' : option;
    setTimeout(() => {  
      this.expandedOption = expandedOption;
    }, 500);
  }

  save() {
    let params = {
      company_id: this.companyId,
      video_cta_id: this.id,
      video: this.activateVideo ? 1 : 0,
      video_embed: this.videoEmbed || '',
      vimeo_id: this.vimeoID || '',
      description: this.activateDescription ? 1 : 0,
      description_text_color: this.descriptionTextColor,
      description_text: this.descriptionText,
      cta: this.activateCTA ? 1 : 0,
      cta_text: this.CTAText,
      cta_button_color: this.CTAButtonColor,
      cta_button_text_color: this.CTATextColor,
      cta_link: this.CTALink,
      created_by: this.userId,
      banner_image: this.bannerImage ? this.bannerImage : '',
      page_title_text: this.pageTitleText ? this.pageTitleText : '',
      ques_ans_text: this.quesAnsText ? this.quesAnsText : '',
      footer_text: this.footerText ? this.footerText : '',
    };

    this._companyService.editVideosCTAsDetails(this.id, params).subscribe(
      (response) => {
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }
  
  public getTimestamp() {
    const date = new Date()
    const timestamp = date.getTime()
    return timestamp
  }


  pondHandleInit() {
    console.log('FilePond has initialised', this.myPond);
  }

  pondHandleAddFile(event: any) {
    console.log('A file was added', event);
    if(localStorage.getItem('landing_page_template_file') == 'complete' && this.landingPageTemplateFileName) {
      this.bannerImage = `${environment.api}/get-landing-page-image/${this.landingPageTemplateFileName}`;
    }
  }

  podHandleUpdateFiles(event: any) {
    console.log('A file was updated', event);
    if(localStorage.getItem('landing_page_template_file') == 'complete' && this.landingPageTemplateFileName) {
      this.bannerImage = `${environment.api}/get-landing-page-image/${this.landingPageTemplateFileName}`;
    }
  }

  podHandleProcessFile(event: any) {
    console.log('A file was updated', event);
    if(localStorage.getItem('landing_page_template_file') == 'complete' && this.landingPageTemplateFileName) {
      this.bannerImage = `${environment.api}/get-landing-page-image/${this.landingPageTemplateFileName}`;
    }
  }


  handleGoBack() {
    // this._location.back();
    this._router.navigate([`/settings/tiktok/videos-ctas`]);
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