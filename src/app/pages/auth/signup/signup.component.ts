import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { environment } from "@env/environment";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AuthService } from "src/app/core/services";
import {
  LocalService,
  CompanyService,
  UserService,
} from "src/app/share/services";
import { CompanyLogoComponent } from "@share/components";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faRotateLeft,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  ImageCropperModule,
  ImageCroppedEvent,
  ImageTransform,
  base64ToFile,
} from "ngx-image-cropper";
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { DateAdapter } from '@angular/material/core';
import { initFlowbite } from "flowbite";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { Subject, takeUntil } from "rxjs";
import { param } from "@lib/utils/param/param.utils";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import Validation from "@lib/utils/validation/validation.utils";
import get from "lodash/get";
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
registerPlugin(FilepondPluginImagePreview, FilepondPluginImageEdit, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    FontAwesomeModule,
    RouterModule,
    NgMultiSelectDropDownModule,
    FilePondModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    NgxMaterialTimepickerModule,
    ImageCropperModule,
    CompanyLogoComponent,
  ],
  templateUrl: "./signup.component.html",
})
export class SignupComponent {
  private destroy$ = new Subject<void>();

  getStartedForm: FormGroup = new FormGroup({
    email: new FormControl(""),
    password: new FormControl(""),
  });
  language: any;
  companyId: any;
  otherSettings: any = [];
  hasPaidRegistration: boolean = false;
  membershipFee: any = "";
  dashboardDetails: any;
  companies: any;

  dropdownSettings = {};
  allRegistrationFields: any = [];
  registrationFields: any = [];
  allRegistrationFieldMapping: any = [];
  selectedFields: any = [];
  formTemplate: any;
  showDefaultRegistrationFields: boolean = false;
  selectedBusinessCategories: any;
  logoFile: any;
  businessCategories: any;
  hasRegistrationFields: boolean = false;
  hasCustomMemberTypeSettings: boolean = false;
  memberTypes: any;
  primaryColor: any;
  buttonColor: any;

  features: any;
  subfeatures: any;
  countryDropdown: any;
  countries: any;
  userEmailDomain: any;

  hasCustomMemberTypeExpiration: boolean = false;

  sectionFields: any = [];
  isloading: boolean = true;
  hasCompanyInvoiceSettings: boolean = false;
  useCompanyInvoice: boolean = false;
  formSubmitted: boolean = false;
  invalidEmail: boolean = false;
  errors: any = {};

  showLogo: boolean = false;
  agreeTerms: boolean = false;
  termsAndConditions: any = "";
  privacyPolicy: any = "";
  mode;
  modal;
  confirm_email: any = 0;

  signupMode: any = "";
  companyName: any = "";
  registrationUserId: any;
  planTypeChoice: any = "monthly";

  allRegistrationText: any = [];
  registrationText: any = [];
  canEditRegistrationTexts: boolean = false;
  hasConfirmPassword: boolean = false;

  hasError: boolean = false;
  privacyPolicyURL: any;
  privacyPolicyURLEn: any;
  privacyPolicyURLFr: any;
  privacyPolicyURLEu: any;
  privacyPolicyURLCa: any;
  privacyPolicyURLDe: any;
  canShowPrivacyPolicy: boolean = false;
  logoSource: any;
  fieldTextType: boolean = false;
  fieldConfirmTextType: boolean = false;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  checkCircleIcon = faCheckCircle;
  timesCircleIcon = faTimesCircle;
  
  startupDropdownSettings = {};
  hasSelectExistingOrCreateNewStartup: boolean = false;
  signupData: any;
  currentStep: number = 1;
  startups: any = []
  selectedStartup: any;
  showCreateNewStartupModal: boolean = false;
  hasSaveStartupError: boolean = false;
  startupDataSubmitted: boolean = false;
  startupDataForm: FormGroup = new FormGroup({
    startup_name: new FormControl(""),
    city: new FormControl(""),
    business_category: new FormControl(""),
    project_start_year: new FormControl(""),
    team_members: new FormControl(""),
    estimated_annual_turnover: new FormControl(""),
    estimated_startup_value: new FormControl(""),
    financing: new FormControl(""),
    logo: new FormControl(""),
    startup_description: new FormControl(""),
  });
  startupDataFields: any = [];
  selectedLogoFilename: any = '';
  startupSectionFields: any = [];
  startupSelectedFields: any = [];
  startupFormTemplate: any;
  startupError: any = '';
  missingStartup: boolean = false;
  missingStartupSector: boolean = false;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

  @ViewChild('myPond', {static: false}) myPond: any;
  logoUploadComplete: boolean = false
  logoFileName: any
  pondOptions = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: 'Arrastra y suelta tu archivo o <span class="filepond--label-action" style="color:#00f;text-decoration:underline;"> Navegar </span><div><small style="color:#006999;font-size:12px;">*Subir archivos de no más de 2 MB</small></div>',
    acceptedFileTypes: 'image/jpeg, image/png',
    maxFileSize: 2000000,
    labelMaxFileSizeExceeded: "El archivo es demasiado grande",
    labelMaxFileSize: "El tamaño máximo de archivo es {filesize}",
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
        this.logoFileName = 'startupLogo_' + this.companyId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.logoFileName);

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/startup/temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
              load(request.responseText);
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
  passwordRequirementsNotSatisfied: boolean = true;

  isKlubOkio: boolean = false;
  isStep1: boolean = false;
  isStep2: boolean = false;
  createdUserId: any;
  modalMode: string = '';
  showImageCropper: boolean = false;
  imageChangedEvent: any;
  rotateLeftIcon = faRotateLeft;
  rotateRightIcon = faRotateRight;
  croppedImage: any;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  transform: ImageTransform = {};
  file: any;
  imageSrc: string = environment.api + "/";
  myImage: any;
  hasImage: boolean = false;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _userService: UserService,
    private dateAdapter: DateAdapter<Date>,
  ) {}

  async ngOnInit() {
    this.signupMode = param.getParam("mode") ? param.getParam("mode") : "";
    this.language = this._localService.getLocalStorage(environment.lslang);

    this.companies = get(
      await this._companyService.getCompanies().toPromise(),
      "companies"
    );
    if (this.companies) {
      let company = this._companyService.getCompany(this.companies);
      if (company && company[0]) {
        this.companyId = company[0].id;
        this.companyName = company[0].entity_name;
        this.userEmailDomain = company[0].domain;
        this.primaryColor = company[0].primary_color;
        this.buttonColor = company[0].button_color
          ? company[0].button_color
          : company[0].primary_color;
        this.showLogo =
          company[0].show_logo_on_member_select == 1 ? true : false;
        this.termsAndConditions = company[0].terms_and_conditions;
        this.privacyPolicy = company[0].policy;
        this.logoSource = `${COMPANY_IMAGE_URL}/${
          company[0].photo || company[0].image
        }`;
        this.privacyPolicyURL = company[0].privacy_policy_url;
        this.privacyPolicyURLEn = company[0].privacy_policy_url_en;
        this.privacyPolicyURLFr = company[0].privacy_policy_url_fr;
        this.privacyPolicyURLEu = company[0].privacy_policy_url_eu;
        this.privacyPolicyURLCa = company[0].privacy_policy_url_ca;
        this.privacyPolicyURLDe = company[0].privacy_policy_url_de;
        this.canShowPrivacyPolicy = company[0].show_privacy_policy == 1 ? true : false;
        if(this.companyId == 65 && this.language == 'es') {
          this.language = 'it';
        }
      }
    }

    this._translateService.use(this.language);
    this.dateAdapter.setLocale('es-ES');
    this.initData();
  }

  initData() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.startupDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'startup_name',
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    }
    
    this.initiateKlubOkio();
    this.fetchSignupData();
  }

  initiateKlubOkio() {
    if(this.companyId == 66) {
      this.isKlubOkio = true;
      this.isStep1 = true;
    }
  }

  fetchSignupData() {
    this._companyService
      .fetchSignupData(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (data) => {
          this.signupData = data;
          this.confirm_email = data?.confirm_email;
          this.mapSubfeatures(data);
          this.getOtherSettings();
          this.businessCategories = data?.business_categories;
          if(this.companyId == 15) {
            this.formatStartups(data?.startups);
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapSubfeatures(data) {
    let subfeatures = data?.subfeatures;
    if (subfeatures?.length > 0) {
      this.countryDropdown = subfeatures.some(
          (a) => a.name_en == "Country" && a.active == 1 && a.feature_id == 15
      );
      this.hasSelectExistingOrCreateNewStartup = subfeatures.some(
          (a) => a.name_en == "Select existing startup or create new upon registration" && a.active == 1 && a.feature_id == 17
      );
    }

    if(this.countryDropdown) { 
      this.countries = data?.countries;
    }
  }

  getOtherSettings() {
    let other_settings = this.signupData?.other_settings;
    if (other_settings?.length > 0) {
      this.hasRegistrationFields = other_settings?.some(
        (a) => a.title_en == "Registration fields" && a.active == 1
      );
      this.hasCompanyInvoiceSettings = other_settings?.some(
        (a) => a.title_en == "Company details for invoicing" && a.active == 1
      );
      this.hasCustomMemberTypeSettings = other_settings?.some(
        (a) => a.title_en == "Require Stripe payment on specific member types" && a.active == 1
      );
      this.hasCustomMemberTypeExpiration = other_settings?.some(
        (a) => a.title_en == "Custom member type expiration" && a.active == 1
      );
      let hasPaidRegistration = other_settings?.some(
        (a) => a.title_en == "Stripe payment" && a.active == 1
      );

      let membershipFeeSettings = other_settings?.find(
        (a) => a.title_en == "Monthly Subscription Fee"
      );
      if(membershipFeeSettings) {
        this.membershipFee = membershipFeeSettings?.value;
      }

      if (this.hasRegistrationFields) {
        this.getRegistrationFields();
      } else {
        this.showDefaultRegistrationFields = true;
        this.initializeDefaultForm();
      }
  
      this.getCustomMemberTypes();
      if(!this.hasCustomMemberTypeSettings) {
        this.hasPaidRegistration = hasPaidRegistration ? true : false;
      }
    }
  }

  formatStartups(startups) {
    this.startups = startups;
    let selected_startup_id = this._localService.getLocalStorage(environment.lsselectedStartupId)
    let selected_startup_name = this._localService.getLocalStorage(environment.lsselectedStartupName)
    let selected_startup = this._localService.getLocalStorage(environment.lsselectedStartup) ? JSON.parse(this._localService.getLocalStorage(environment.lsselectedStartup)) : ''
    if(selected_startup && selected_startup_id && selected_startup_name) {
      this.selectedStartup = [{
        id: selected_startup_id,
        startup_name: selected_startup_name,
        company_id: this.companyId,
        city: selected_startup.city,
        project_start_year: selected_startup.project_start_year,
        team_members: selected_startup.team_members,
        estimated_annual_turnover: selected_startup.estimated_annual_turnover,
        estimated_startup_value: selected_startup.estimated_startup_value,
        financing: selected_startup.financing,
        logo: selected_startup.logo,
        startup_description: selected_startup.startup_description,
      }]
      this._localService.removeLocalStorage(environment.lsselectedStartupId)
      this._localService.removeLocalStorage(environment.lsselectedStartupName)
    }
  }

  getRegistrationFields() {
    this.allRegistrationFields = this.signupData?.registration_fields;
    this.getRegistrationFieldMapping();
  }

  getRegistrationFieldMapping() {
    this.allRegistrationFieldMapping = this.signupData?.registration_field_mapping;

    let registration_fields: any[] = [];
    let selected_fields: any[] = [];
    let current_step_fields: any[] = [];
    if (this.allRegistrationFields) {
      this.allRegistrationFields.forEach((field) => {
        let match = this.allRegistrationFieldMapping.some(
          (a) => a.field_id === field.id
        );
        if (!match) {
          registration_fields.push(field);

          if (field.field == "password") {
            // Push another confirm_password field
            let confirm_password_field = {
              active: 1,
              created_at: "",
              field: "confirm_password",
              field_desc_en: null,
              field_desc_es: null,
              field_display_en: "Confirm password",
              field_display_es: "Confirmar contraseña",
              field_display_it: "Conferma password",
              field_group_en: null,
              field_group_es: null,
              field_type: "password",
              id: 5,
              max_length: 30,
              min_length: 8,
              required: 1,
            };
            registration_fields.push(confirm_password_field);
          }
        }
      });
    }

    if (this.allRegistrationFieldMapping) {
      this.allRegistrationFieldMapping.forEach((field) => {
        let reg_field = this.allRegistrationFields.filter((f) => {
          return f.id == field.field_id;
        });

        let fld = {};
        if (reg_field && reg_field[0]) {
          let field_display_en = reg_field[0].field_display_en;
          if (field.field_display_en && field.field_display_en != null) {
            field_display_en = field.field_display_en;
          }
          let field_display_es = reg_field[0].field_display_es;
          if (field.field_display_es && field.field_display_es != null) {
            field_display_es = field.field_display_es;
          }
          let field_display_it = reg_field[0].field_display_it;
          if (field.field_display_it && field.field_display_it != null) {
            field_display_it = field.field_display_it;
          }
          let field_desc_en = reg_field[0].field_desc_en;
          if (field.field_desc_en && field.field_desc_en != null) {
            field_desc_en = field.field_desc_en;
          }
          let field_desc_es = reg_field[0].field_desc_es;
          if (field.field_desc_es && field.field_desc_es != null) {
            field_desc_es = field.field_desc_es;
          }
          let field_group_en = reg_field[0].field_group_en;
          if (field.field_group_en && field.field_group_en != null) {
            field_group_en = field.field_group_en;
          }
          let field_group_es = reg_field[0].field_group_es;
          if (field.field_group_es && field.field_group_es != null) {
            field_group_es = field.field_group_es;
          }

          fld = {
            id: reg_field[0].id,
            field: reg_field[0].field,
            field_type: reg_field[0].field_type,
            field_display_en: field_display_en,
            field_display_es: field_display_es,
            field_display_it: field_display_it,
            field_group_en: field_group_en,
            field_group_es: field_group_es,
            field_desc_en: field_desc_en,
            field_desc_es: field_desc_es,
            min_length: reg_field[0].min_length,
            max_length: reg_field[0].max_length,
            active: reg_field[0].active,
            required:
              field.required != null
                ? field.required
                : reg_field[0].required,
            created_at: reg_field[0].created_at,
            step_1: field.step_1,
            step_3: field.step_3,
            step_4: field.step_4,
          };

          selected_fields.push(fld);

          if (reg_field[0].field == "password") {
            let confirm_password_field = {
              id: 5,
              field: "confirm_password",
              field_type: "password",
              field_display_en: "Confirm password",
              field_display_es: "Confirmar contraseña",
              field_display_it: "Conferma password",
              field_group_en: null,
              field_group_es: null,
              field_desc_en: "",
              field_desc_es: "",
              min_length: 8,
              max_length: 30,
              active: 1,
              required: 1,
              created_at: "",
              step_1: this.companyId == 15 ? 1 : 0,
              step_3: 0,
              step_4: 0,
            };
            selected_fields.push(confirm_password_field);
            this.hasConfirmPassword = true;
          }
        }
      });
    }

    let sections: any[] = [];
    let section_fields: any[] = [];
    let selected_startup_fields: any[] = [];
    let startup_sections: any[] = [];
    let startup_section_fields: any[] = [];
    if (selected_fields && !this.showLogo) {
      selected_fields.forEach((f) => {
        let match = sections.some(
          (a) => a.field_group_es === f.field_group_es
        );
        if (!match) {
          sections.push({
            field_group_en: f.field_group_en,
            field_group_es: f.field_group_es,
          });
        }
      });

      if (sections) {
        sections.forEach((s) => {
          let fields: any[] = [];
          if (selected_fields) {
            fields = selected_fields.filter((sf) => {
              return sf.field_group_es == s.field_group_es;
            });
          }

          section_fields.push({
            field_group_en: s.field_group_en,
            field_group_es: s.field_group_es,
            fields: fields,
          });
        });
      }
    } else if(selected_fields && this.showLogo) {
      if(this.hasSelectExistingOrCreateNewStartup) {
        // get startup name field
        let startup_name_field = selected_fields.filter(sff => {
          return sff.field == 'startup_name'
        })

        let step_4_fields = selected_fields.filter(sff => {
          return sff.step_4 == 1
        })

        if(startup_name_field) {
          startup_name_field.forEach(sn => {
            selected_startup_fields.push(sn)
          })
        }

        if(step_4_fields) {
          step_4_fields.forEach(sf => {
            selected_startup_fields.push(sf)
          })
        }

        startup_sections.push({
          "field_group_en": "",
          "field_group_es": ""
        })
      }


      selected_fields = selected_fields.filter(sff => {
        return sff.step_1 == this.currentStep
      })
      
      sections.push({
        "field_group_en": "",
        "field_group_es": ""
      })
      if(sections) {
        sections.forEach(s => {
          let fields: any[] = []
          let startup_fields: any[] = []

          if(selected_fields) {
            fields = selected_fields.filter(sf => {
              return "" == s.field_group_es
            })
          }

          section_fields.push({
            "field_group_en": s.field_group_en,
            "field_group_es": s.field_group_es,
            "fields": fields
          })

          if(this.hasSelectExistingOrCreateNewStartup) {
            if(selected_startup_fields) {
              startup_fields = selected_startup_fields.filter(sf => {
                return "" == s.field_group_es
              })
            }

            startup_section_fields.push({
              "field_group_en": s.field_group_en,
              "field_group_es": s.field_group_es,
              "fields": startup_fields
            })
          }
        })
      }
    }

    this.registrationFields = registration_fields;
    this.sectionFields = section_fields;
    this.selectedFields = selected_fields;

    if(this.hasSelectExistingOrCreateNewStartup) {
      this.startupSectionFields = startup_section_fields
      this.startupSelectedFields = selected_startup_fields
      this.startupDataFields = this.startupSelectedFields

      // Get fields from AS
      if(!this.startupDataFields || (this.startupDataFields && this.startupDataFields.length == 0)) {
        this.getStartupDataFields()
      }
    }

    if (this.selectedFields && this.selectedFields.length > 0) {
      this.initializeFormGroup();
    } else {
      this.showDefaultRegistrationFields = true;
      this.initializeDefaultForm();
    }
  }

  getFieldDisplay(field) {
    return field
    ? this.language == "en"
      ? field.field_display_en ||
        field.field_display_es
      : this.language == "fr"
      ? field.field_display_fr ||
        field.field_display_es
      : this.language == "eu"
      ? field.field_display_eu ||
        field.field_display_es
      : this.language == "ca"
      ? field.field_display_ca ||
        field.field_display_es
      : this.language == "de"
      ? field.field_display_de ||
        field.field_display_es
      : this.language == "it"
      ? field.field_display_it ||
        field.field_display_es
      : field.field_display_es
    : "";
  }

  getStartupDataFields() {
    let allRegistrationFieldMapping = this.signupData?.registration_field_mapping

    let registration_fields: any[] = []
    let selected_fields: any[] = []
    if(this.allRegistrationFields) {
      this.allRegistrationFields.forEach(field => {
        let match = allRegistrationFieldMapping.some(a => a.field_id === field.id)
        if(!match) {
          registration_fields.push(field)

          if(field.field == 'password') {
            // Push another confirm_password field
            let confirm_password_field = {
              active: 1,
              created_at: "",
              field: "confirm_password",
              field_desc_en: null,
              field_desc_es: null,
              field_display_en: "Confirm password",
              field_display_es: "Confirmar contraseña",
              field_group_en: this.hasCompanyInvoiceSettings ? 'Personal' : null,
              field_group_es: this.hasCompanyInvoiceSettings ? 'Datos personales' : null,
              field_type: "password",
              id: 5,
              max_length: 30,
              min_length: 8,
              required: 1,
            }
            registration_fields.push(confirm_password_field)
          }
        }
      });
    }

    if(allRegistrationFieldMapping) {
      allRegistrationFieldMapping.forEach(field => {
        let reg_field = this.allRegistrationFields.filter(f => {
          return f.id == field.field_id
        })

        let fld = {}
        if(reg_field && reg_field[0]) {
          let field_display_en = reg_field[0].field_display_en
          if(field.field_display_en && field.field_display_en != null) {
            field_display_en = field.field_display_en
          }
          let field_display_es = reg_field[0].field_display_es
          if(field.field_display_es && field.field_display_es != null) {
            field_display_es = field.field_display_es
          }
          let field_desc_en = reg_field[0].field_desc_en
          if(field.field_desc_en && field.field_desc_en != null) {
            field_desc_en = field.field_desc_en
          }
          let field_desc_es = reg_field[0].field_desc_es
          if(field.field_desc_es && field.field_desc_es != null) {
            field_desc_es = field.field_desc_es
          }
          let field_group_en = reg_field[0].field_group_en
          if(field.field_group_en && field.field_group_en != null) {
            field_group_en = field.field_group_en
          }
          let field_group_es = reg_field[0].field_group_es
          if(field.field_group_es && field.field_group_es != null) {
            field_group_es = field.field_group_es
          }

          fld = {
            "id": reg_field[0].id,
            "field": reg_field[0].field,
            "field_type": reg_field[0].field_type,
            "field_display_en": field_display_en,
            "field_display_es": field_display_es,
            "field_group_en": field_group_en,
            "field_group_es": field_group_es,
            "field_desc_en": field_desc_en,
            "field_desc_es": field_desc_es,
            "min_length": reg_field[0].min_length,
            "max_length": reg_field[0].max_length,
            "active": reg_field[0].active,
            "required": field.required != null ? field.required : reg_field[0].required,
            "created_at": reg_field[0].created_at,
            "step_1": field.step_1,
            "step_3": field.step_3,
            "step_4": field.step_4,
          }

          selected_fields.push(fld)

          if(reg_field[0].field == 'password') {
            let confirm_password_field = {
              "id": 5,
              "field": 'confirm_password',
              "field_type": 'password',
              "field_display_en": 'Confirm password',
              "field_display_es": 'Confirmar contraseña',
              "field_group_en": null,
              "field_group_es": null,
              "field_desc_en": '',
              "field_desc_es": '',
              "min_length": 8,
              "max_length": 30,
              "active": 1,
              "required": 1,
              "created_at": '',
              "step_1": this.companyId == 15 ? 1 : 0,
              "step_3": 0,
              "step_4": 0,
            }
            selected_fields.push(confirm_password_field)
          }
        }
      })
    }

    let sections: any[] = []
    let section_fields: any[] = []
    let selected_startup_fields: any[] = []
    let startup_sections: any[] = []
    let startup_section_fields: any[] = []
    if(selected_fields && this.hasSelectExistingOrCreateNewStartup) {
      // get startup name field
      let startup_name_field = selected_fields.filter(sff => {
        return sff.field == 'startup_name'
      })

      let step_4_fields = selected_fields.filter(sff => {
        return sff.step_4 == 1
      })

      if(startup_name_field) {
        startup_name_field.forEach(sn => {
          selected_startup_fields.push(sn)
        })
      }

      if(step_4_fields) {
        step_4_fields.forEach(sf => {
          selected_startup_fields.push(sf)
        })
      }

      startup_sections.push({
        "field_group_en": "",
        "field_group_es": ""
      })

      selected_fields = selected_fields.filter(sff => {
        return sff.step_1 == 4
      })
      
      sections.push({
        "field_group_en": "",
        "field_group_es": ""
      })
      if(sections) {
        sections.forEach(s => {
          let fields: any[] = []
          let startup_fields: any[] = []

          if(selected_fields) {
            fields = selected_fields.filter(sf => {
              return "" == s.field_group_es
            })
          }

          section_fields.push({
            "field_group_en": s.field_group_en,
            "field_group_es": s.field_group_es,
            "fields": fields
          })

          if(this.hasSelectExistingOrCreateNewStartup) {
            if(selected_startup_fields) {
              startup_fields = selected_startup_fields.filter(sf => {
                return "" == s.field_group_es
              })
            }

            startup_section_fields.push({
              "field_group_en": s.field_group_en,
              "field_group_es": s.field_group_es,
              "fields": startup_fields
            })
          }
        })
      }
    }

    if(this.hasSelectExistingOrCreateNewStartup) {
      this.startupSectionFields = startup_section_fields
      this.startupSelectedFields = selected_startup_fields
      this.startupDataFields = this.startupSelectedFields
    }
  }

  initializeFormGroup() {
    this.formTemplate = [];

    this.selectedFields.forEach((field) => {
      if (field.field_type) {
        this.formTemplate.push({
          label: field.field,
          required: field.required,
          min_length: field.min_length,
          max_length: field.max_length,
        });
      }
    });

    let group = {};
    this.formTemplate.forEach((input_template) => {
      const validators: any[] = [];
      if (input_template.label == "password") {
        validators.push(
          Validation.patternValidator(new RegExp("(?=.*[0-9])"), {
            requiresDigit: true,
          })
        );
        validators.push(
          Validation.patternValidator(new RegExp("(?=.*[A-Z])"), {
            requiresUppercase: true,
          })
        );
        validators.push(
          Validation.patternValidator(new RegExp("(?=.*[a-z])"), {
            requiresLowercase: true,
          })
        );
        validators.push(
          Validation.patternValidator(new RegExp("(?=.*[$@^!%*?&])"), {
            requiresSpecialChars: true,
          })
        );
      }
      if (input_template.label == "email") validators.push(Validators.email);
      if (input_template.required) validators.push(Validators.required);
      if (input_template.min_length > 0)
        validators.push(Validators.minLength(input_template.min_length));
      if (input_template.max_length > 0)
        validators.push(Validators.maxLength(input_template.max_length));
      group[input_template.label] = new FormControl("", validators);
    });

    this.getStartedForm = new FormGroup(group);

    if (this.getStartedForm) {
      // Set default to Spain
      if (this.getStartedForm.controls["country"]) {
        let country = this.companyId == 65 ? "Italy" : "Spain";
        this.getStartedForm.controls["country"].setValue(country);
      }
      if (this.getStartedForm.controls["company_country"]) {
        this.getStartedForm.controls["company_country"].setValue("Spain");
      }
    }

    this.isloading = false;
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  initializeDefaultForm() {
    this.getStartedForm = new FormGroup({
      email: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
    });
    this.isloading = false;
  }

  getCustomMemberTypes() {
    this.memberTypes = this.signupData?.member_types;
  }

  trimWhitespace() {
    const keys = Object.keys(this.getStartedForm.value);
    keys.forEach((key) => {
      const value = this.getStartedForm.value[key];
      if (typeof value == "string") {
        const value2 = value.replace(/^\s+|\s+$/gm, "");
        if (value != value2) {
          this.getStartedForm.controls[key].setValue(value2);
        }
      }
    });
  }

  async signUp() {
    this.trimWhitespace();

    this.hasError = false;
    this.formSubmitted = true;
    this.passwordRequirementsNotSatisfied = true;

    if (
      this.hasConfirmPassword &&
      this.getStartedForm.value["password"] &&
      this.getStartedForm.value["confirm_password"] &&
      this.getStartedForm.value["password"] !=
        this.getStartedForm.value["confirm_password"]
    ) {
      this.errors["password"] = this._translateService.instant(
        "signup.passwordmatch"
      );
      this.errors["confirm_password"] = this._translateService.instant(
        "signup.passwordmatch"
      );
      this.hasError = true;
      this.formSubmitted = false;
      return false;
    }

    // Set startup values
    if(this.hasSelectExistingOrCreateNewStartup && this.getStartedForm.controls['startup_name']) {
      this.getStartedForm.controls['startup_name'].setValue('')
      if(this.selectedStartup && this.selectedStartup[0]) {
        this.getStartedForm.controls['startup_name'].setValue(this.selectedStartup[0].startup_name)
        this.missingStartup = false
      } else {
        this.missingStartup = true
        this.hasError = true
      }
    }

    if (this.isValidForm()) {
      if (
        this.hasCustomMemberTypeSettings &&
        this.hasCustomMemberTypeExpiration
      ) {
        let expired_member = get(
          await this._userService
            .getCustomMemberTypeExpiration(
              this.companyId,
              this.getStartedForm.controls["email"].value
            )
            .toPromise(),
          "expired_member"
        );
        if (expired_member && expired_member.id) {
          this.open(
            this._translateService.instant("dialog.membershipexpired"),
            ""
          );
          this.hasError = true;
          this.formSubmitted = false;
          return false;
        }
      }

      let formData = [];
      formData = this.getStartedForm.value;
      formData["company_id"] = this.companyId;
      formData["payment"] = this.hasPaidRegistration ? 1 : 0;

      let invited_by_guid = this._localService.getLocalStorage(
        environment.lsinvitedbyguid
      );
      if (invited_by_guid) {
        formData["invited_by_guid"] = invited_by_guid;
      }

      if (this.selectedBusinessCategories) {
        formData["business_category_id"] = this.selectedBusinessCategories
          .map((data) => {
            return data.id;
          })
          .join();
      }

      this._authService
        .userSignupDynamicNoPayment(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          async (response) => {
            if (response["user"]) {
              // this._localService.setLocalStorage(
              //   environment.lsuserId,
              //   response["user"]["id"]
              // );
              // this._localService.setLocalStorage(
              //   environment.lsemail,
              //   response["user"]["email"]
              // );
              // this._localService.setLocalStorage(
              //   environment.lscompanyId,
              //   response["user"]["fk_company_id"]
              // );
              // this._localService.setLocalStorage(
              //   environment.lsdomain,
              //   response["user"]["domain"]
              // );
              if (!this._localService.getLocalStorage(environment.lslang)) {
                this._localService.setLocalStorage(environment.lslang, "es");
              }

              if (
                this.hasCustomMemberTypeSettings &&
                this.memberTypes &&
                this.memberTypes.length > 0
              ) {
                if(this.isKlubOkio) {
                  this.createdUserId = response["user"]["id"];
                  this.isStep1 = false;
                  this.isStep2 = true;
                } else {
                  this._router.navigate([
                    `/payment/select-plan/${response["user"]["id"]}`,
                  ]);
                }
              } else {
                if(this.isKlubOkio) {
                  this.createdUserId = response["user"]["id"];
                  this.isStep1 = false;
                  this.isStep2 = true;
                } else {
                  if (this.confirm_email) {
                    await this._authService
                      .sendConfirmationEmail({
                        companyId: this.companyId,
                        userId: response["user"]["id"],
                      })
                      .toPromise();
                  }

                  this._router.navigate([`/auth/login`]);
                }
              }
            } else if (response["code"] == "user_exists") {
              let error = true;
              if (
                this.hasCustomMemberTypeSettings &&
                response["existing_user"]
              ) {
                if (
                  response["existing_user"]["custom_member_type_id"] == 0 ||
                  response["existing_user"]["status"] == 0
                ) {
                  error = false;
                  if(this.isKlubOkio) {
                    this.createdUserId = response["existing_user"]["id"];
                    this.isStep1 = false;
                    this.isStep2 = true;
                  } else {
                    this._router.navigate([
                      `/payment/select-plan/${response["existing_user"]["id"]}`,
                    ]);
                  }
                }
              }

              if (error) {
                this.open(
                  this._translateService.instant("dialog.emailexists"),
                  ""
                );
                this.hasError = true;
                this.formSubmitted = false;
              }
            }
          },
          (error) => {
            console.log(error);
            this.open(this._translateService.instant("dialog.error"), "");
            this.hasError = true;
            this.formSubmitted = false;
          }
        );
    } else {
      this.hasError = true;
      this.formSubmitted = false;
      if(!this.passwordRequirementsNotSatisfied) {
        this.open(this._translateService.instant('landing.checkpasswordrequirements'), '');
      } else {
        this.open(this._translateService.instant('landing.unabletovalidate'), '');
      }
    }
  }

  updateBirthdayProfileImage() {
    if(this.file && this.getStartedForm.value["birthday"]) {
      this._userService.updateProfileImage(this.createdUserId, this.file).subscribe(
        (response) => {
          if (response) {
            let params = {
              id: this.createdUserId,
              birthday: this.getStartedForm.value["birthday"],
            }
            this._userService.updateUserBirthday(params).subscribe(
              (resp) => {
                this._router.navigate([
                  `/payment/select-plan/${this.createdUserId}`,
                ]);
              },
              (err) => {
                console.log(err);
                this.open(this._translateService.instant("dialog.error"), "");
              });
          } else {
            this.open(this._translateService.instant("dialog.error"), "");
          }
        },
        (error) => {
          console.log(error);
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    }
  }

  memberTypeSelectPlan(type) {
    this._localService.setLocalStorage(
      environment.lsselectedMemberType,
      type ? type.id : ""
    );
    let params = {
      id: this.registrationUserId,
      company_id: this.companyId,
      custom_member_type_id: type.id,
      expire_days: type.expire_days,
    };

    this._userService
      .updateUserCustomMemberType(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          let redirect_url = `/payment/checkout/${this.registrationUserId}/${type.id}`;
          if ((type.require_payment == 1 && type.price > 0) || this.showLogo) {
            this._localService.setLocalStorage(
              environment.lsplanFrequency,
              this.planTypeChoice == "yearly" ? this.planTypeChoice : ""
            );
            if (type.price == 0) {
              if (this.confirm_email) {
                await this._authService
                  .sendConfirmationEmail({
                    companyId: this.companyId,
                    userId: this.registrationUserId,
                  })
                  .toPromise();
              }
              this.beforeExitCheck(redirect_url);
            } else {
              this._router.navigate([redirect_url]);
            }
          } else {
            if (this.confirm_email) {
              await this._authService
                .sendConfirmationEmail({
                  companyId: this.companyId,
                  userId: this.registrationUserId,
                })
                .toPromise();
            }
            this.redirectToLogin(type);
          }
        },
        (error) => {
          console.log(error);
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
  }

  redirectToLogin(type) {
    if (type.require_approval == 1) {
      this._router.navigate([`/auth/login?type=${type.id}`]);
    } else {
      this._router.navigate([`/auth/login`]);
    }
  }

  async beforeExitCheck(redirect_url = "") {
    const selectedMemberType = this._localService.getLocalStorage(
      environment.lsselectedMemberType
    );
    let sendEmail = false;
    if (selectedMemberType && parseInt(selectedMemberType) > 0) {
      if (this.memberTypes) {
        let selected_plan_row = this.memberTypes.filter((mt) => {
          return mt.id == selectedMemberType;
        });

        if (selected_plan_row && selected_plan_row[0].require_payment != 1) {
          sendEmail = true;
        }
      }
    } else {
      sendEmail = true;
    }
    if (sendEmail) {
      await this.sendSelectPlanEmail(redirect_url);
    }
  }

  async sendSelectPlanEmail(redirect_url) {
    await this._authService
      .selectPlanEmail(this.registrationUserId, this.companyId)
      .toPromise();

    this._localService.removeLocalStorage(environment.lsselectedMemberType);
    if (redirect_url) {
      location.href = redirect_url;
    }
  }

  isValidForm() {
    let valid = true;
    this.errors = {};

    Object.keys(this.getStartedForm.controls).forEach((key) => {
      let proceed = true;

      if (this.hasCompanyInvoiceSettings && !this.useCompanyInvoice) {
        // Check if field belongs to Company section
        if (this.selectedFields) {
          let field_row = this.selectedFields.filter((f) => {
            return f.field == key && f.field_group_en == "Company";
          });
          if (field_row && field_row[0]) {
            proceed = false;
          }
        }
      }

      if (proceed) {
        const controlErrors: ValidationErrors =
          this.getStartedForm.controls[key].errors! || null;
        if (controlErrors != null) {
          if(this.isKlubOkio && this.isStep1 && key == 'birthday') {
          } else {
            valid = false;
          }

          if (controlErrors["email"]) {
            this.errors[key] = this._translateService.instant(
              "company-settings.invalidemailaddress"
            );
          } else if (controlErrors["alphabet"]) {
            this.errors[key] = this._translateService.instant(
              "company-settings.lettersonly"
            );
          } else if (controlErrors["number"]) {
            this.errors[key] = this._translateService.instant(
              "company-settings.numbersonly"
            );
          } else if (controlErrors["minlength"]) {
            this.errors[key] = `${this._translateService.instant(
              "dialog.atleast"
            )} ${
              controlErrors["minlength"].requiredLength
            } ${this._translateService.instant("dialog.characters")}`;
          } else if (controlErrors["maxlength"]) {
            this.errors[key] = `${this._translateService.instant(
              "dialog.maximumof"
            )} ${
              controlErrors["maxlength"].requiredLength
            } ${this._translateService.instant("dialog.characters")}`;
          }

          if(key == 'password') {
            this.passwordRequirementsNotSatisfied = false;
          }
        }
      }
    });

    return valid;
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  login() {
    this._router.navigate(["/auth/login"]);
  }

  openPrivacyPolicy() {
    if (!this.canShowPrivacyPolicy && this.privacyPolicyURL) {
      let link =
        this.language == "en"
          ? this.privacyPolicyURLEn
          : this.language == "fr"
          ? this.privacyPolicyURLFr || this.privacyPolicyURL
          : this.language == "eu"
          ? this.privacyPolicyURLEu || this.privacyPolicyURL
          : this.language == "ca"
          ? this.privacyPolicyURLCa || this.privacyPolicyURL
          : this.language == "de"
          ? this.privacyPolicyURLDe || this.privacyPolicyURL
          : this.privacyPolicyURL;

      window.open(link, "_blank");
    } else {
      this._router.navigate(["/privacy-policy"]);
    }
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldConfirmTextType() {
    this.fieldConfirmTextType = !this.fieldConfirmTextType;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.getStartedForm.controls;
  }

  get passwordValid() {
    return this.getStartedForm.controls["password"].errors === null;
  }

  get requiredValid() {
    return !this.getStartedForm.controls["password"].hasError("required");
  }

  get minLengthValid() {
    return !this.getStartedForm.controls["password"].hasError("minlength");
  }

  get requiresDigitValid() {
    return !this.getStartedForm.controls["password"].hasError("requiresDigit");
  }

  get requiresUppercaseValid() {
    return !this.getStartedForm.controls["password"].hasError(
      "requiresUppercase"
    );
  }

  get requiresLowercaseValid() {
    return !this.getStartedForm.controls["password"].hasError(
      "requiresLowercase"
    );
  }

  get requiresSpecialCharsValid() {
    return !this.getStartedForm.controls["password"].hasError(
      "requiresSpecialChars"
    );
  }

  openCreateNewStartup() {
    this.startupDataSubmitted = false;
    this.startupError = '';
    this.modalMode = 'startup';
    if(this.startupSelectedFields) {
      this.initializeStartupDataForm();
    }
    this.modalbutton?.nativeElement.click();
  }

  initializeStartupDataForm() {
    this.startupFormTemplate = []
    this.startupSelectedFields.forEach(field => {
      if(field.field_type) {
        this.startupFormTemplate.push({
          'label': field.field,
          'required': field.required
        })
      }
    })

    let group = {};    
    this.startupFormTemplate.forEach(input_template => {
      if(input_template.label == 'email') { 
        group[input_template.label] = new FormControl('', [Validators.required]);  
      } else {
        if(input_template.required || input_template.required == 1) {
          group[input_template.label] = new FormControl('', [Validators.required]);  
        } else {
          group[input_template.label] = new FormControl('');  
        }
      }
    })
    this.startupDataForm = new FormGroup(group)
  }

  saveStartupData() {
    this.startupError = ''
    this.startupDataSubmitted = true

    let formData = []
    formData = this.startupDataForm.value
    formData['company_id'] = this.companyId
    formData['logo'] = this.logoFileName ? this.logoFileName : ''

    if(this.selectedBusinessCategories) {
      formData['business_category_id'] = this.selectedBusinessCategories.map( (data) => { return data.id }).join()
    }

    // Set startup values
    if(this.hasSelectExistingOrCreateNewStartup && this.startupDataForm.controls['business_category']) {
      if(this.selectedBusinessCategories) {
        this.missingStartupSector = false
      } else {
        this.missingStartupSector = true
      }
    }

    if(!this.isValidStartupForm()) {
      return false;
    }

    if(this.isValidStartupForm()) {
      this._companyService.addStartup(
        formData
      ).subscribe(
        response => {
          if(response['startup']) {
            this._localService.setLocalStorage(environment.lsselectedStartupId, response['startup']['id'])
            this._localService.setLocalStorage(environment.lsselectedStartupName, response['startup']['startup_name'])
            this._localService.setLocalStorage(environment.lsselectedStartup, JSON.stringify(response['startup']))
            this.getStartups();
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
            this.closemodalbutton?.nativeElement.click();
          } else if(response['code'] == 'existing_startup') {
            this.hasSaveStartupError = true
            this.startupDataSubmitted = false
            this.startupError = 'El startup ya existe'
            this.open(this.startupError, '');
          }
        },
        error => {
          this.hasSaveStartupError = true
          this.startupDataSubmitted = false
          this.startupError = 'Algo salió mal';
          if(error && error.error) {
            this.open(error.error.message, '');
          } else {
            this.open(this.startupError, '');
          }
        }) 
    }
  }

  isValidStartupForm() {
    let valid = true
    this.errors = {}

    Object.keys(this.startupDataForm.controls).forEach(key => {
      const controlErrors: ValidationErrors = 
        this.startupDataForm.controls[key].errors! || null;
      if (controlErrors != null) {
        if(key == 'business_category') {
          if(this.selectedBusinessCategories) {

          } else {
            valid = false
          }
        } else {
          valid = false
        }

        if (controlErrors['email']) {
          this.errors[key] = this._translateService.instant('company-settings.invalidemailaddress')
        } else if (controlErrors['alphabet']) {
          this.errors[key] = this._translateService.instant('company-settings.lettersonly')
        } else if (controlErrors['number']) {
          this.errors[key] = this._translateService.instant('company-settings.numbersonly')
        } else if (controlErrors['minlength']) {
          this.errors[key] = `${this._translateService.instant('dialog.atleast')} ${controlErrors['minlength'].requiredLength} ${this._translateService.instant('dialog.characters')}`
        } else if (controlErrors['maxlength']) {
          this.errors[key] = `${this._translateService.instant('dialog.maximumof')} ${controlErrors['maxlength'].requiredLength} ${this._translateService.instant('dialog.characters')}`
        }
      }
    })

    return valid
  }

  pondHandleInit() {
    console.log('FilePond has initialised', this.myPond);
  }

  pondHandleAddFile(event: any) {
    console.log('A file was added', event);
    if(!event.error) {

    }
  }

  getStartups() {
    this._companyService.getStartups(this.companyId)
      .subscribe(
        async (response) => {
          this.formatStartups(response?.startups);
        },
        error => {
          console.log(error)
        }
      )
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  async uploadPhoto(event: any) {
    this.modalMode = 'profile';
    this.imageChangedEvent = event;
    const file = event.target.files[0];
    if (file.size > 2000000) {
    } else {
      initFlowbite();
      setTimeout(() => {
        this.modalbutton?.nativeElement.click();
      }, 500);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      this.imageSrc = this.croppedImage = event.base64;
      this.file = {
        name: "image",
        image: base64ToFile(event.base64), //event.file
      };
      this.hasImage = true;
      this.myImage = this.imageSrc;
    }
  }

  imageLoaded() {}

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {}

  imageCropperModalSave() {
    this.modalMode = '';
    this.showImageCropper = false;
    this.closemodalbutton?.nativeElement?.click();
  }

  imageCropperModalClose() {
    this.showImageCropper = false;
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}