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
import { QuillModule } from 'ngx-quill';
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
  selector: "app-settings-lead-landing-page-template",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    ColorPickerModule,
    FilePondModule,
    QuillModule,
    SafeContentHtmlPipe,
    SearchComponent,
    BreadcrumbComponent,
    PageTitleComponent,
    ToastComponent,
  ],
  templateUrl: "./landing-page-template.component.html",
})
export class LandingPageTemplateComponent {
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
  selectedBackgroundColor: any = '#ffffff';
  selectedTextColor: any = '#000000';
  expandedOption: any = 'theme';
  activateBanner: boolean = true;
  activateSection1: boolean = true;
  activateSection2: boolean = true;
  activateSection3: boolean = true;
  section1Text: any;
  section2Text: any;
  section3Text: any;
  bannerImage: any;
  landingPageTemplateFileName: any;
  activateSection1QuestionCTA: boolean = false;
  section1QuestionCTAText: any;
  section1QuestionCTAColor: any;
  section1QuestionCTATextColor: any;
  activateSection2QuestionCTA: boolean = false;
  section2QuestionCTAText: any;
  section2QuestionCTAColor: any;
  section2QuestionCTATextColor: any;
  activateSection3QuestionCTA: boolean = false;
  section3QuestionCTAText: any;
  section3QuestionCTAColor: any;
  section3QuestionCTATextColor: any;
  landingPage: any;
  bannerImageName: any;
  activateSection1RedirectionLink: boolean = false;
  section1CTALink:any;
  activateSection2RedirectionLink: boolean = false;
  section2CTALink:any;
  activateSection3RedirectionLink: boolean = false;
  section3CTALink:any;

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
    private cd: ChangeDetectorRef
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
    this.getLandingPage();
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

  async getLandingPage() {
    this._companyService
      .getLeadsLandingPageDetails(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.landingPage = response.landing_page;
          this.formatDetails();
          this.isloading = false;
        },
        (error) => {
          
        }
      );
  }

  public onEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.selectedBackgroundColor = data
    }
  }

  public onTextEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.selectedTextColor = data
    }
  }

  public onSection1CTAEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.section1QuestionCTAColor = data
    }
  }

  public onSection1CTATextEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.section1QuestionCTATextColor = data
    }
  }

  public onSection2CTAEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.section1QuestionCTAColor = data
    }
  }

  public onSection2CTATextEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.section1QuestionCTATextColor = data
    }
  }

  public onSection3CTAEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.section1QuestionCTAColor = data
    }
  }

  public onSection3CTATextEventLog(event: string, data: any): void {
    if(data && event == 'colorPickerClose') {
      this.section1QuestionCTATextColor = data
    }
  }

  formatDetails() {
    this.selectedLayout = this.landingPage?.details?.layout || 'boxed';
    this.selectedBackgroundColor = this.landingPage?.details?.background_color || '#ffffff';
    this.selectedTextColor = this.landingPage?.details?.text_color || '#000000';
    this.activateBanner = this.landingPage?.details?.banner;
    this.activateSection1 = this.landingPage?.details?.section1 == 1 || (this.landingPage?.details?.id > 0 ? this.landingPage?.details?.section1 : true);
    this.activateSection2 = this.landingPage?.details?.section2 == 1 || (this.landingPage?.details?.id > 0 ? this.landingPage?.details?.section2 : true);
    this.activateSection3 = this.landingPage?.details?.section3 == 1 || (this.landingPage?.details?.id > 0 ? this.landingPage?.details?.section3 : true);
    this.section1Text = this.landingPage?.details?.section1_text || '';
    this.section2Text = this.landingPage?.details?.section2_text || '';
    this.section3Text = this.landingPage?.details?.section3_text || '';
    if(this.landingPage?.details?.banner_image) {
      this.bannerImageName = this.landingPage?.details?.banner_image;
      this.bannerImage = `${environment.api}/get-landing-page-image/${this.landingPage?.details?.banner_image}`;
    }
    this.activateSection1QuestionCTA = this.landingPage?.details?.section1_cta == 1 ? true : false;
    this.section1QuestionCTAText = this.landingPage?.details?.section1_cta_text || '';
    this.section1QuestionCTAColor = this.landingPage?.details?.section1_cta_color || '';
    this.section1QuestionCTATextColor = this.landingPage?.details?.section1_cta_text_color || '';
    this.activateSection2QuestionCTA = this.landingPage?.details?.section2_cta == 1 ? true : false;
    this.section2QuestionCTAText = this.landingPage?.details?.section2_cta_text || '';
    this.section2QuestionCTAColor = this.landingPage?.details?.section2_cta_color || '';
    this.section2QuestionCTATextColor = this.landingPage?.details?.section2_cta_text_color || '';
    this.activateSection3QuestionCTA = this.landingPage?.details?.section3_cta == 1 ? true : false;
    this.section3QuestionCTAText = this.landingPage?.details?.section3_cta_text || '';
    this.section3QuestionCTAColor = this.landingPage?.details?.section3_cta_color || '';
    this.section3QuestionCTATextColor = this.landingPage?.details?.section3_cta_text_color || '';
    this.activateSection1RedirectionLink = this.landingPage?.details?.section1_cta_redirect == 1 ? true: false;
    this.section1CTALink = this.landingPage?.details?.section1_cta_redirect_value || ''
    this.activateSection2RedirectionLink = this.landingPage?.details?.section2_cta_redirect == 1 ? true: false;
    this.section2CTALink = this.landingPage?.details?.section2_cta_redirect_value || ''
    this.activateSection3RedirectionLink = this.landingPage?.details?.section3_cta_redirect == 1 ? true: false;
    this.section3CTALink = this.landingPage?.details?.section3_cta_redirect_value || ''
  }

  redirectToCTALink(mode) {

  }

  handleChangeLayout(event) {
    this.selectedLayout = event.target.value;
  }

  expandOption(option) {
    let expandedOption = this.expandedOption == option ? '' : option;
    setTimeout(() => {  
      this.expandedOption = expandedOption;
    }, 500);
  }

  save() {

    if((this.activateSection1RedirectionLink && !this.section1CTALink)
    || (this.activateSection2RedirectionLink && !this.section2CTALink) 
    || (this.activateSection3RedirectionLink && !this.section3CTALink)){
      return false;
    }

    let params = {
      company_id: this.companyId,
      landing_page_template_id: this.id,
      layout: this.selectedLayout,
      background_color: this.selectedBackgroundColor,
      text_color: this.selectedTextColor,
      banner: this.activateBanner ? 1 : 0,
      section1: this.activateSection1 ? 1 : 0,
      section2: this.activateSection2 ? 1 : 0,
      section3: this.activateSection3 ? 1 : 0,
      banner_image: (this.landingPageTemplateFileName || this.bannerImageName) || '',
      section1_text: this.section1Text,
      section2_text: this.section2Text,
      section3_text: this.section3Text,
      section1_cta: this.activateSection1QuestionCTA ? 1 : 0,
      section1_cta_text: this.section1QuestionCTAText,
      section1_cta_color: this.section1QuestionCTAColor,
      section1_cta_text_color: this.section1QuestionCTATextColor,
      section2_cta: this.activateSection2QuestionCTA ? 1 : 0,
      section2_cta_text: this.section2QuestionCTAText,
      section2_cta_color: this.section2QuestionCTAColor,
      section2_cta_text_color: this.section2QuestionCTATextColor,
      section3_cta: this.activateSection3QuestionCTA ? 1 : 0,
      section3_cta_text: this.section3QuestionCTAText,
      section3_cta_color: this.section3QuestionCTAColor,
      section3_cta_text_color: this.section3QuestionCTATextColor,
      created_by: this.userId,
      section1_cta_redirect: this.activateSection1RedirectionLink ? 1 : 0,
      section1_cta_redirect_value: this.section1CTALink,
      section2_cta_redirect: this.activateSection2RedirectionLink ? 1 : 0,
      section2_cta_redirect_value: this.section2CTALink,
      section3_cta_redirect: this.activateSection3RedirectionLink ? 1 : 0,
      section3_cta_redirect_value: this.section3CTALink 
    };

    this._companyService.editLeadsLandingPageDetails(this.id, params).subscribe(
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