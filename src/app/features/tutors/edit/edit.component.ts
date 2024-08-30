import { CommonModule, DatePipe } from "@angular/common";
import { Component, ElementRef, HostListener, Input, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { TutorsService } from "@features/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NoAccessComponent, PageTitleComponent } from "@share/components";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { QuillModule } from 'ngx-quill';
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
import moment from "moment";
import get from "lodash/get";
import { checkIfValidCalendlyAccount } from "src/app/utils/calendly/helper";

@Component({
  selector: "app-tutors-edit",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgMultiSelectDropDownModule,
    QuillModule,
    FontAwesomeModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    PageTitleComponent,
    NoAccessComponent,
  ],
  templateUrl: "./edit.component.html",
})
export class TutorEditComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;

  languageChangeSubscription: any;
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
  tutorsFeature: any;
  featureId: any;
  pageName: any;
  superAdmin: boolean = false;
  canCreateTutor: any;
  languages: any = [];
  isLoading: boolean = true;
  
  issaving: boolean = false;
  errorMessage: string = "";
  pageTitle: string = "";
  searchByKeyword: boolean = false;
  hasMembersOnly: boolean = false;

  tutor: any = {}
  submitted: boolean = false
  tutorUserId: any = ''
  tutorUserFirstName: any = ''
  tutorUserLastName: any = ''
  tutorUserCity: any = ''
  tutorUserCalendlyURL: any = ''
  tutorPersonalAccessToken: any = '';
  tutorUserSinceDate: any = ''
  datePipe = new DatePipe('en-US')
  who_am_i: any
  who_am_i_en: any
  who_am_i_fr: any
  cities: any = []
  tutors: any = []
  showError: boolean = false
  features: any = []
  imageSrc: string = environment.api +  '/'
  showLanguages: boolean = false
  showCalendly: boolean = false
  created: any
  tutorlanguages: any = ''
  tutorTypes: any = []
  tutorTypeDropdownSettings: any
  selectedCourseTutorType:any = []
  tutorTypeTags:any = [];
  @ViewChild("modalbutton", { static: false }) modalbutton:
  | ElementRef
  | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
  | ElementRef
  | undefined;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService
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
    this.tutorTypeDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: this.language == 'en' ? 'name_EN' :
      (this.language == 'fr' ? 'name_FR' : 
        (this.language == 'eu' ? 'name_EU' : 
        (this.language == 'ca' ? 'name_CA' : 
        (this.language == 'de' ? 'name_DE' : 
        (this.language == 'it' ? 'name_IT' : 'name_ES')
      )))),
      selectAllText: this._translateService.instant('dialog.selectall'),
      unSelectAllText: this._translateService.instant('dialog.clearall'),
      itemsShowLimit: 6,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    }
    this.getCities();
    this.fetchTutorsData();
  }

  getCities() {
    this._companyService
      .getCompanyCities(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.cities = this.sortBySequence(response.cities);
        },
        (error) => {
          let errorMessage = <any>error;
          if (errorMessage != null) {
            let body = JSON.parse(error._body);
          }
        }
      );
  }

  sortBySequence(cities) {
    let sorted_cities;
    if (cities) {
      sorted_cities = cities.sort((a, b) => {
        return a.sequence - b.sequence;
      });
    }

    return sorted_cities;
  }

  fetchTutorsData() {
    this._tutorsService
      .fetchTutor(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures, data?.categories, data?.hotmart_settings);
          this.mapUserPermissions(data?.user_permissions);
          this.tutorTypeTags = data?.tutor_type_tags;
          this.tutorTypes = data?.all_tutor_types;
          this.tutorTypes= this.tutorTypes?.sort((a, b) => a?.name_EN.localeCompare(b.name_EN));
          this.formatTutor(data?.tutor);
          this.isLoading = false;
          setTimeout(() => {
            initFlowbite();
          }, 100);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.tutorsFeature = features?.find((f) => f.feature_id == 20);
    this.featureId = this.tutorsFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.tutorsFeature);
    this.pageTitle = this.id > 0 ? `${this._translateService.instant('landing.edit')} ${this.pageName}` : `${this._translateService.instant('landing-pages.createnew')} ${this.pageName}`;
  }

  mapSubfeatures(subfeatures, categories, hotmart_settings) {
    if (subfeatures?.length > 0) {
      this.searchByKeyword = subfeatures.some(a => a.name_en == 'Search by keyword' && a.active == 1)
      this.hasMembersOnly = subfeatures.some(a => a.name_en == 'Members only' && a.active == 1)
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreateTutor =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 20
      );
  }

  formatTutor(tutor) {
    this.tutor = tutor;
    this.tutorUserId = this.tutor?.user_id;
    this.tutorUserFirstName = this.tutor?.first_name;
    this.tutorUserLastName = this.tutor?.last_name;
    
    this.tutorUserCity = this.tutor.city || '';
    this.who_am_i = this.tutor.description || '';
    this.tutorUserCalendlyURL = this.tutor.calendly_url || '';
    this.tutorPersonalAccessToken = this.tutor.personal_access_token || '';
    this.tutorlanguages = this.tutor?.languages || '';  
    
    this.created = this.tutor.created;
    let timezoneOffset = new Date().getTimezoneOffset();
    let pd = (
      moment(this.created)
        .utc()
        .utcOffset(timezoneOffset)
        .format("YYYY-MM-DD HH:mm")
        .toString() + ":00Z"
    ).replace(" ", "T");
    this.tutorUserSinceDate = pd;

    if(this.tutorTypes?.length > 0) {
      this.tutorTypes?.forEach(tt => {
        this.tutorTypeTags?.forEach(ttt => {
          if(ttt.type_id == tt.id){
            this.selectedCourseTutorType.push(tt)
          }
        })
      })
    }
  };

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


  isFormValidated(){
    const tutorFormData = {
      first_name: this.tutorUserFirstName,
      last_name: this.tutorUserLastName,
      who_am_i: this.who_am_i,
      who_am_i_en: this.who_am_i_en || this.who_am_i,
      who_am_i_fr: this.who_am_i_fr || this.who_am_i,
      city: this.tutorUserCity,
      languages: this.tutorlanguages,
      }
    if(this.tutorUserCalendlyURL){
      tutorFormData['calendly_url'] =  this.tutorUserCalendlyURL
      tutorFormData['calendly_personal_access_token'] =  this.tutorPersonalAccessToken
    }
    return Object.keys(tutorFormData).every(key=>tutorFormData[key] !== "")
  }



  async saveTutor() {

    this.submitted = true;
    const isFromValid = this.isFormValidated()

    let isValidCalendlyToken = true
    let isValidCalendlyUrl = true
    
    if(this.tutorUserCalendlyURL){
      
      const eventObj = await checkIfValidCalendlyAccount(this.tutorPersonalAccessToken,this.tutorUserCalendlyURL)
      
      isValidCalendlyToken = eventObj?.isValidToken
      isValidCalendlyUrl = eventObj?.isValidURL

    }
   
  
    if(isValidCalendlyToken && isFromValid){
      this.errorMessage = "";
      
      if(
        !this.tutorUserId
        || !this.tutorUserCity
      ) {
        this.scrollToTop()
        return false
      }
  
      this.issaving = true;
  
      let created
      if(this.tutorUserSinceDate) {
        created = moment(this.tutorUserSinceDate).format('YYYY-MM-DD')
      }
  
      let typeIdArray: any[] = [];
      this.selectedCourseTutorType?.forEach(sctt => {
        typeIdArray.push(sctt?.id);
      })
      let param = {
        company_id: this.companyId,
        user_id: this.tutorUserId,
        first_name: this.tutorUserFirstName,
        last_name: this.tutorUserLastName,
        who_am_i: this.who_am_i,
        who_am_i_en: this.who_am_i_en || this.who_am_i,
        who_am_i_fr: this.who_am_i_fr || this.who_am_i,
        city: this.tutorUserCity,
        calendly_url: this.tutorUserCalendlyURL,
        calendly_personal_access_token: this.tutorPersonalAccessToken,
        created: created || this.created,
        languages: this.tutorlanguages,
        type_ids : typeIdArray,
        tutor_id : this.tutor?.id
      }
  
      if (this.id > 0) {
        // Edit
        this._tutorsService.editTutor(param).subscribe(
          (response) => {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this.issaving = false;
          },
          (error) => {
            this.issaving = false;
            this.open(this._translateService.instant("dialog.error"), "");
          }
        );
      }

    }else if(!isValidCalendlyToken || !isValidCalendlyUrl){
      this.open(this._translateService.instant('tutors.correctcalendlycredntials'), '');
    }
  }

  public getTimestamp() {
    const date = new Date()
    const timestamp = date.getTime()
    return timestamp
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
    
  }

  openTokenDialog(){
    this.modalbutton?.nativeElement.click();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}