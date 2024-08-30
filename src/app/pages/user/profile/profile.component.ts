import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, Input, ViewChild } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService, UserService } from "@share/services";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { PageTitleComponent, ToastComponent } from "@share/components";
import { TutorsService } from "@features/services";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import {
  ImageCropperModule,
  ImageCroppedEvent,
  ImageTransform,
  base64ToFile,
} from "ngx-image-cropper";
import {
  faRotateLeft,
  faRotateRight,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
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
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { QuillModule } from 'ngx-quill';
import get from "lodash/get";
import each from "lodash/each";
import keys from "lodash/keys";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { TutorHourlyateBanner } from "@pages/general/banner/tutor-hourly-rate.component";
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";
import "moment/locale/it";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperModule,
    FontAwesomeModule,
    MatSnackBarModule,
    QuillModule,
    PageTitleComponent,
    ToastComponent,
    NgMultiSelectDropDownModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    NgxMaterialTimepickerModule,
    TutorHourlyateBanner
  ],
  templateUrl: "./profile.component.html"
})
export class ProfileComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  language: any;
  email: any;
  userId: any;
  companyId: any;
  domain: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  pageTitle: any;
  userMemberTypes: any;
  otherUserMemberTypes: any;
  categoryDropdownSettings: any;
  customMemberTypes: any;
  features: any;
  membersFeatureId: any;
  membersTitle: any;
  hasMemberAccess: boolean = false;
  tutorFeatureId: any;
  hasTutors: boolean = false;
  otherSettings: any;
  me: any;
  showProfileFieldsInMembers: boolean = false;
  countryDropdown: any;
  hasMemberCommissions: boolean = false;
  hasTutorBookingCommission: boolean = false;
  countries: any;
  tutorUsers: any;
  isTutorUser: boolean = false;
  hasCustomMemberTypeSettings: boolean = false;
  cancelSubscriptionMessage: any;
  hasProfileFields: boolean = false;
  hasCustomInvoice: boolean = false;
  showDefaultProfileFields: boolean = false;
  memberTypeId: any;
  customMemberType: any;
  canUpgradeMembership: boolean = false;
  allProfileFields: any;
  allProfileFieldMapping: any;
  hasProfileImageField: boolean = false;
  hasCompanyImageField: boolean = false;
  profileFields: any;
  selectedFields: any;
  sectionFields: any;
  form: any;
  loading: boolean = false;
  profileForm: any;
  formTemplate: any;
  asUser: any;
  sectors: any;
  civilStatus: any;
  wellbeingActivities: any;
  areaGroups: any;
  userAreaGroups: any;
  myImage: any;
  hasImage: boolean = false;
  myCompanyLogoImage: any;
  hasCompanyLogoImage: boolean = false;
  companyLogoImageSrc: string = environment.api + "/";
  accountId: any;
  invoiceSettingCompany: boolean = false;
  imageSrc: string = environment.api + "/";
  userLogoSrc: any;
  selectedBusinessCategories: any;
  memberTypeVisible: boolean = false;
  showProfileInMembersArea: any;
  tutor: any;
  isSsoUser: boolean = false;
  businessCategories: any;
  datePipe: any;
  rotateLeftIcon = faRotateLeft;
  rotateRightIcon = faRotateRight;
  @ViewChild("modalbutton", { static: false })
  modalbutton: ElementRef<HTMLInputElement> = {} as ElementRef;
  // Cropper
  showImageCropper: boolean = false;
  imageChangedEvent: any;
  croppedImage: any;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  transform: ImageTransform = {};
  file: any;
  fieldTextType: boolean = false;
  fieldConfirmTextType: boolean = false;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  passwordMismatch: boolean = false;
  invalidPassword: boolean = false;
  invalidPasswordMessage: any;
  errors: any;
  hasError: boolean = false;
  logoFile: any;
  passwordChanged: boolean = false;
  passwordChangedMessage: string = "";
  companylogofile: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: string = "";
  confirmDeleteItemDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  company: any;
  tutorTypes: any = [];
  tutorTypeDropdownSettings: any
  selectedCourseTutorType:any = []
  tutorTypeTags:any = [];
  tutorInfo:any
  uploadImageMode: string = '';
  isTermsAccepted:boolean = false;
  isOpenContact:boolean= false;
  contracts: any;
  contract: any;
  userFullName:string = '';
  dateOfAcceptance:string = '';
  isMobile: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _userService: UserService,
    private _tutorsService: TutorsService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }
    
  async ngOnInit() {
    this.onResize();
    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
      );
    this.domain = this._localService.getLocalStorage(environment.lsdomain);
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
      this.domain = company[0].domain;
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
        this.initializePage();
  }

  async initializePage() {
    this.dateAdapter.setLocale('es-ES');
    this.pageTitle = this._translateService.instant("sidebar.profilesettings");
    this.getUserMemberTypes();
    
    this.categoryDropdownSettings = {
      singleSelection: this.companyId == 15 ? false : true,
      idField: "id",
      textField: "name",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant("guests.search"),
    };
    
    this.customMemberTypes = get(
      await this._userService.getCustomMemberTypes(this.companyId).toPromise(),
      "member_types"
      );
      
      this.features = this._localService.getLocalStorage(environment.lsfeatures)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (!this.features) {
      this.features = await this._companyService
      .getFeatures(this.domain)
      .toPromise();
    }
    if (this.features) {
      let memberFeature = this.features.filter((f) => {
        return f.feature_name == "Members";
      });
      
      let tutorFeature = this.features.filter((f) => {
        return f.feature_name == "Tutors";
      });
      
      if (memberFeature && memberFeature[0]) {
        this.membersFeatureId = memberFeature[0].id;
        this.membersTitle =
        this.language == "en"
        ? memberFeature[0].name_en ||
        memberFeature[0].feature_name ||
        memberFeature[0].name_es ||
        memberFeature[0].feature_name_ES
        : this.language == "fr"
        ? memberFeature[0].name_fr ||
        memberFeature[0].feature_name_FR ||
        memberFeature[0].name_es ||
        memberFeature[0].feature_name_ES
        : this.language == "eu"
        ? memberFeature[0].name_eu ||
        memberFeature[0].feature_name_EU ||
        memberFeature[0].name_es ||
        memberFeature[0].feature_name_ES
        : this.language == "ca"
            ? memberFeature[0].name_ca ||
              memberFeature[0].feature_name_CA ||
              memberFeature[0].name_es ||
              memberFeature[0].feature_name_ES
              : this.language == "de"
              ? memberFeature[0].name_de ||
              memberFeature[0].feature_name_DE ||
              memberFeature[0].name_es ||
              memberFeature[0].feature_name_ES
            : memberFeature[0].name_es || memberFeature[0].feature_name_ES;
        this.hasMemberAccess = true;
      }

      if (tutorFeature && tutorFeature[0]) {
        this.tutorFeatureId = tutorFeature[0].id;
        this.hasTutors = true;
        this.membersTitle =
          this.language == "en"
            ? tutorFeature[0].name_en ||
            tutorFeature[0].feature_name ||
            tutorFeature[0].name_es ||
            tutorFeature[0].feature_name_ES
            : this.language == "fr"
            ? tutorFeature[0].name_fr ||
              tutorFeature[0].feature_name_FR ||
              tutorFeature[0].name_es ||
              tutorFeature[0].feature_name_ES
            : this.language == "eu"
            ? tutorFeature[0].name_eu ||
            tutorFeature[0].feature_name_EU ||
            tutorFeature[0].name_es ||
            tutorFeature[0].feature_name_ES
            : this.language == "ca"
            ? tutorFeature[0].name_ca ||
              tutorFeature[0].feature_name_CA ||
              tutorFeature[0].name_es ||
              tutorFeature[0].feature_name_ES
              : this.language == "de"
              ? tutorFeature[0].name_de ||
              tutorFeature[0].feature_name_DE ||
              tutorFeature[0].name_es ||
              tutorFeature[0].feature_name_ES
              : tutorFeature[0].name_es || tutorFeature[0].feature_name_ES;
            }
    }

    this.getContract()
    this.getSettings();
    if (this.hasTutors) {
      this.getTutors();
    }

    this.tutorTypeDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: this.language == 'en' ? 'name_EN' :
      (this.language == 'fr' ? 'name_FR' : 
      (this.language == 'eu' ? 'name_EU' : 
      (this.language == 'ca' ? 'name_CA' : 
      (this.language == 'de' ? 'name_DE' : 'name_ES')
      )
      )
        ),
        selectAllText: this._translateService.instant('dialog.selectall'),
        unSelectAllText: this._translateService.instant('dialog.clearall'),
      itemsShowLimit: 5,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search')
    }
  }

  getContract() {
    this._companyService
    .getCompanyContracts(this.companyId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (data) => {
        this.contracts = data.contracts
      },
      (error) => {
          console.log(error);
        }
      );
  }

  getUserMemberTypes() {
    this._userService.getUserMemberType(this.userId).subscribe(
      (response) => {
        this.userMemberTypes = response["user_member_type"];

        this._userService.getUserMemberTypes(this.userId).subscribe(
          (resp) => {
            this.userMemberTypes = [
              ...this.userMemberTypes,
              ...resp["user_member_types"],
            ];
            this.otherUserMemberTypes = resp["user_member_types"];
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getSettings() {
    this._userService
      .getCombinedProfilePrefetch(
        this.companyId,
        this.userId,
        this.membersFeatureId,
        this.tutorFeatureId
      )
      .subscribe((data) => {
        this.otherSettings = data[0] ? data[0]["other_settings"] : [];
        this.me = data[1] ? data[1]["CompanyUser"] : [];
        let members_subfeatures = data[2] ? data[2]["subfeatures"] : [];
        let tutors_subfeatures = data[3] ? data[3]["subfeatures"] : [];

        if(this.me?.accepted_conditions == 1){
            this.isTermsAccepted = true
        }

        if(this.me?.custom_member_type_id) {
          let contract = this.contracts?.filter(contract => {
            return contract.custom_member_type_id == this.me?.custom_member_type_id
          })
          this.contract = contract?.length > 0 ? contract[0].contract : '';
        }

        this.userFullName = this.me?.name ? this.me?.name :  this.me?.first_name + ' ' + this.me?.last_name  
        this.dateOfAcceptance = this.me?.date_of_acceptance ? moment(this.me.date_of_acceptance).format('DD/MM/YYYY') : ''

        this.mapSubfeatures(members_subfeatures, tutors_subfeatures);
        this.getOtherSettings();
      });
  }

  async mapSubfeatures(members_subfeatures, tutors_subfeatures) {
    if (members_subfeatures?.length > 0) {
      this.showProfileFieldsInMembers = members_subfeatures.some(
        (a) =>
          a.name_en == "Show/hide fields in Member details" && a.active == 1
      );
      this.countryDropdown = members_subfeatures.some(
        (a) => a.name_en == "Country" && a.active == 1
      );
      this.hasMemberCommissions = members_subfeatures.some(
        (a) => a.name_en == "Commissions" && a.active == 1
      );
    }

    if (tutors_subfeatures?.length > 0) {
      this.hasTutorBookingCommission = tutors_subfeatures.some(
        (a) => a.name_en == "Tutor percentage for bookings" && a.active == 1
      );
    }

    if (this.countryDropdown) {
      this.getCountries();
    }
  }

  getCountries() {
    this._companyService.getCountries().subscribe(
      async (response) => {
        this.countries = response.countries;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getTutors() {
    this._tutorsService.getTutors(this.companyId).subscribe(
      async (response) => {
        this.tutorUsers = response["tutors"];
        if (this.tutorUsers) {
          this.isTutorUser = this.tutorUsers.some(
            (a) => a.user_id == this.userId
          );
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getOtherSettings() {
    if (this.otherSettings) {
      this.otherSettings.forEach((m) => {
        if (m.title_es == "Stripe") {
          if (m.content) {
            let customMemberTypeSettings = m.content.filter((c) => {
              return (
                c.title_en.indexOf(
                  "Require Stripe payment on specific member types"
                ) >= 0
              );
            });
            if (customMemberTypeSettings && customMemberTypeSettings[0]) {
              this.hasCustomMemberTypeSettings =
                customMemberTypeSettings[0].active == 1 ? true : false;
            }

            let cancelSubscriptionSettings = m.content.filter((c) => {
              return c.title_en.indexOf("Cancel subscription text") >= 0;
            });
            if (cancelSubscriptionSettings && cancelSubscriptionSettings[0]) {
              this.cancelSubscriptionMessage =
                cancelSubscriptionSettings[0].value;
            }
          }
        }

        if (m.title_es == "General") {
          if (m.content) {
            let profileFieldsSettings = m.content.filter((c) => {
              return c.title_en.indexOf("Profile fields") >= 0;
            });
            if (profileFieldsSettings && profileFieldsSettings[0]) {
              this.hasProfileFields =
                profileFieldsSettings[0].active == 1 ? true : false;
            }
          }
        }

        if (m.title_es == "Registro / Servicios") {
          let customInvoiceSettings = m.content.filter((c) => {
            return c.title_en.indexOf("Custom invoice") >= 0;
          });
          if (customInvoiceSettings && customInvoiceSettings[0]) {
            this.hasCustomInvoice =
              customInvoiceSettings[0].active == 1 ? true : false;
          }
        }
      });
    }

    if (this.hasCustomMemberTypeSettings) {
      this.getCustomProfileFields();
    } else {
      if (this.hasProfileFields) {
        this.getProfileFields();
      } else {
        this.showDefaultProfileFields = true;
        this.initializeDefaultForm();
      }
    }
  }

  async getCustomProfileFields() {
    this.memberTypeId = this.me.custom_member_type_id;
    if (this.memberTypeId && this.memberTypeId > 0) {
      if (this.customMemberTypes) {
        let user_custom_member_type = this.customMemberTypes.filter((mt) => {
          return mt.id == this.memberTypeId;
        });
        if (user_custom_member_type && user_custom_member_type[0]) {
          this.customMemberType = user_custom_member_type[0];
          if (this.customMemberType) {
            this.canUpgradeMembership =
              this.customMemberType.upgrade_membership &&
              this.customMemberType.upgrade_membership > 0
                ? true
                : false;
          }
        }
      }
    }
    this._userService
      .getMemberTypeCustomProfileFields(this.companyId, this.memberTypeId)
      .subscribe(
        (response: any) => {
          let allProfileFields = response.profile_fields;
          let profile_fields: any[] = [];
          if (allProfileFields) {
            let cnt = 1;
            allProfileFields.forEach((p) => {
              profile_fields.push({
                id: p.id,
                company_id: p.company_id,
                custom_member_type_id: p.custom_member_type_id,
                profile_field_id: p.profile_field_id,
                field_type: p.field_type,
                field_display_en: p.field_display_en,
                field_display_es: p.field_display_es,
                field_display_fr: p.field_display_fr,
                field_group_en: p.field_group_en,
                field_group_es: p.field_group_es,
                field_desc_en: p.field_desc_en,
                field_desc_es: p.field_desc_es,
                field: p.field,
                required: p.required,
                created_at: p.created_at,
                sequence: cnt,
              });
              cnt++;
            });
          }
          this.allProfileFields = profile_fields;
          this.getCustomProfileFieldMapping();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getCustomProfileFieldMapping() {
    this._userService.memberProfileFieldSettings(this.userId).subscribe(
      async (response) => {
        this.allProfileFieldMapping = [];
        let profile_fields = this.allProfileFields;
        let selected_fields: any[] = [];

        if (
          this.allProfileFieldMapping &&
          this.allProfileFieldMapping.length > 0
        ) {
          this.allProfileFieldMapping.forEach((field) => {
            let reg_field = this.allProfileFields.filter((f) => {
              return f.profile_field_id == field.profile_field_id;
            });

            let fld = {};
            if (reg_field && reg_field[0]) {
              fld = {
                id: reg_field[0].profile_field_id,
                user_id: this.userId,
                company_id: this.companyId,
                field: reg_field[0].field,
                field_type: reg_field[0].field_type,
                field_display_en: reg_field[0].field_display_en,
                field_display_fr: reg_field[0].field_display_fr,
                field_group_en: reg_field[0].field_group_en,
                field_group_es: reg_field[0].field_group_es,
                field_group_fr: reg_field[0].field_group_fr,
                field_desc_en: reg_field[0].field_desc_en,
                field_desc_es: reg_field[0].field_desc_es,
                field_desc_fr: reg_field[0].field_desc_fr,
                show: field.show == 1 ? true : false,
                required: reg_field[0].required,
                created_at: reg_field[0].created_at,
                sequence: reg_field[0].sequence,
              };

              if (field.field == "image") {
                this.hasProfileImageField = true;
              }
              if (field.field == "company_logo") {
                this.hasCompanyImageField = true;
              }

              selected_fields.push(fld);
            }
          });
        } else {
          this.allProfileFields.forEach((f) => {
            if (f.field == "image") {
              this.hasProfileImageField = true;
            }
            if (f.field == "company_logo") {
              this.hasCompanyImageField = true;
            }

            selected_fields.push({
              id: f.profile_field_id,
              user_id: this.userId,
              company_id: this.companyId,
              field: f.field,
              field_type: f.field_type,
              field_display_en: f.field_display_en,
              field_display_es: f.field_display_es,
              field_display_fr: f.field_display_fr,
              field_group_en: f.field_group_en,
              field_group_es: f.field_group_es,
              field_group_fr: f.field_group_fr,
              field_desc_en: f.field_desc_en,
              field_desc_es: f.field_desc_es,
              field_desc_fr: f.field_desc_fr,
              show: true,
              required: f.required,
              created_at: f.created_at,
              sequence: f.sequence,
            });
          });
        }
        if (selected_fields) {
          selected_fields = selected_fields.sort((a, b) => {
            return a.sequence - b.sequence;
          });
        }

        let section_fields = [
          {
            field_group_en: "",
            field_group_es: "",
            field_group_fr: "",
            fields: selected_fields,
          },
        ];

        this.profileFields = profile_fields;
        this.selectedFields = selected_fields;
        this.sectionFields = section_fields;

        if (this.showProfileFieldsInMembers) {
          this.getShowProfileFieldMapping();
        } else {
          if (this.selectedFields && this.selectedFields.length > 0) {
            this.initializeFormGroup();
          } else {
            this.showDefaultProfileFields = true;
            this.initializeDefaultForm();
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getProfileFields() {
    this._userService.getProfileFields().subscribe(
      async (response) => {
        this.allProfileFields = response.profile_fields;
        this.getProfileFieldMapping();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getProfileFieldMapping() {
    this._userService.getProfileFieldMapping(this.companyId).subscribe(
      async (response) => {
        this.allProfileFieldMapping = response.profile_field_mapping;

        let profile_fields: any[] = [];
        let selected_fields: any[] = [];
        if (this.allProfileFields) {
          this.allProfileFields.forEach((field) => {
            let match = this.allProfileFieldMapping.some(
              (a) => a.field_id === field.id
            );
            if (!match) {
              profile_fields.push(field);
            }
          });
        }

        if (this.allProfileFieldMapping) {
          this.allProfileFieldMapping.forEach((field) => {
            let reg_field = this.allProfileFields.filter((f) => {
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
              let field_display_fr = reg_field[0].field_display_fr;
              if (field.field_display_fr && field.field_display_fr != null) {
                field_display_fr = field.field_display_fr;
              }
              let field_desc_en = reg_field[0].field_desc_en;
              if (field.field_desc_en && field.field_desc_en != null) {
                field_desc_en = field.field_desc_en;
              }
              let field_desc_es = reg_field[0].field_desc_es;
              if (field.field_desc_es && field.field_desc_es != null) {
                field_desc_es = field.field_desc_es;
              }
              let field_desc_fr = reg_field[0].field_desc_fr;
              if (field.field_desc_fr && field.field_desc_fr != null) {
                field_desc_fr = field.field_desc_fr;
              }
              let field_group_en = reg_field[0].field_group_en;
              if (field.field_group_en && field.field_group_en != null) {
                field_group_en = field.field_group_en;
              }
              let field_group_es = reg_field[0].field_group_es;
              if (field.field_group_es && field.field_group_es != null) {
                field_group_es = field.field_group_es;
              }
              let field_group_fr = reg_field[0].field_group_fr;
              if (field.field_group_fr && field.field_group_fr != null) {
                field_group_fr = field.field_group_fr;
              }

              fld = {
                id: reg_field[0].id,
                field: reg_field[0].field,
                field_type: reg_field[0].field_type,
                field_display_en: field_display_en,
                field_display_es: field_display_es,
                field_display_fr: field_display_fr,
                field_group_en: field_group_en,
                field_group_es: field_group_es,
                field_group_fr: field_group_fr,
                field_desc_en: field_desc_en,
                field_desc_es: field_desc_es,
                field_desc_fr: field_desc_fr,
                active: reg_field[0].active,
                required: reg_field[0].required,
                created_at: reg_field[0].created_at,
                show: true,
              };

              if (reg_field[0].field == "image") {
                this.hasProfileImageField = true;
              }
              if (reg_field[0].field == "company_logo") {
                this.hasCompanyImageField = true;
              }

              selected_fields.push(fld);
            }
          });
        }

        let sections: any[] = [];
        let section_fields: any[] = [];
        if (selected_fields) {
          selected_fields.forEach((f) => {
            let match = sections.some(
              (a) => a.field_group_es === f.field_group_es
            );
            if (!match) {
              sections.push({
                field_group_en: f.field_group_en,
                field_group_es: f.field_group_es,
                field_group_fr: f.field_group_fr,
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
                field_group_fr: s.field_group_fr,
                fields: fields,
              });
            });
          }
        }

        this.profileFields = profile_fields;
        this.selectedFields = selected_fields;
        this.sectionFields = section_fields;

        if (this.showProfileFieldsInMembers) {
          this.getShowProfileFieldMapping();
        } else {
          if (this.selectedFields && this.selectedFields.length > 0) {
            this.initializeFormGroup();
          } else {
            this.showDefaultProfileFields = true;
            this.initializeDefaultForm();
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getShowProfileFieldMapping() {
    this._userService.memberProfileFieldSettings(this.userId).subscribe(
      async (response) => {
        let allProfileFieldMapping = response.profile_fields;
        let profileFields = this.profileFields;
        let selectedFields = this.selectedFields;
        let sectionFields = this.sectionFields;

        if (allProfileFieldMapping && allProfileFieldMapping.length > 0) {
          allProfileFieldMapping.forEach((field) => {
            if (selectedFields) {
              selectedFields.forEach((sf) => {
                if (sf.id == field.profile_field_id) {
                  sf.show = field.show == 1 ? true : false;
                }
              });
            }

            if (profileFields) {
              profileFields.forEach((pf) => {
                if (pf.id == field.profile_field_id) {
                  pf.show = field.show == 1 ? true : false;
                }
              });
            }

            if (sectionFields) {
              sectionFields.forEach((ssf) => {
                if (ssf.fields) {
                  ssf.fields.forEach((sssf) => {
                    if (sssf.id == field.profile_field_id) {
                      sssf.show = field.show == 1 ? true : false;
                    }
                  });
                }
              });
            }
          });
        }

        this.profileFields = profileFields;
        this.selectedFields = selectedFields;
        this.sectionFields = sectionFields;
        if (this.selectedFields && this.selectedFields.length > 0) {
          this.initializeFormGroup();
        } else {
          this.showDefaultProfileFields = true;
          this.initializeDefaultForm();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  initializeDefaultForm() {
    this.form = this.fb.group({
      image: [null],
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      city: [""],
      website: [""],
      position: [""],
      profession: [""],
      company_description: [""],
      password: [""],
      confirmPassword: [""],
      calendly_url: new FormControl(""),
      who_am_i: new FormControl("", [Validators.required]),
    });
    this.loadProfileData();
  }

  initializeFormGroup() {
    this.formTemplate = [];

    this.selectedFields.forEach((field) => {
      if (field.field_type) {
        this.formTemplate.push({
          label: field.field,
          required: field.required,
        });
      }
    });

    let group = {};
    this.formTemplate.forEach((input_template) => {
      if (input_template.label == "who_am_i") {
        group[input_template.label] = new FormControl("", Validators.required);
      } else {
        if (input_template.required || input_template.required == 1) {
          group[input_template.label] = new FormControl("", [
            Validators.required,
          ]);
        } else {
          group[input_template.label] = new FormControl("");
        }
      }
    });

    group["password"] = new FormControl("");
    group["confirmPassword"] = new FormControl("");

    this.profileForm = new FormGroup(group);
    this.loadProfileData();
  }

  async loadProfileData() {
    this.loading = true;
    this._userService
      .getCombinedProfileDetailsPrefetch(this.companyId, this.userId)
      .subscribe(
        (response) => {
          this.tutor = response[0] ? response[0]["tutor"] : [];
          this.tutorInfo = response[6] ? response[6]["tutor"]:[];
          this.tutorTypeTags = response[6] ? response[6]["tutor_type_tags"]:[];
          this.tutorTypes = response[6] ? response[6]["all_tutor_types"] : [];
          this.tutorTypes= this.tutorTypes?.sort((a, b) => a?.name_EN.localeCompare(b.name_EN));
          const temp:any = []
          if(this.tutorTypes?.length > 0) {
            this.tutorTypes?.forEach(tt => {
              this.tutorTypeTags?.forEach(ttt => {
                if(ttt.type_id == tt.id){
                  temp.push(tt)
                }
              })
            })
          }
          this.selectedCourseTutorType  = temp.map( category => {
            return {
              id: category?.id,
              name_EN: category?.name_EN,
              name_ES: category?.name_ES,
              name_CA: category?.name_CA,
              name_DE: category?.name_DE,
              name_EU: category?.name_EU,
              name_FR: category?.name_FR
            }
          })
          if (this.me) {
            if (
              this.me.fk_company_id == 32 &&
              (this.me.id_token ||
                (this.me.custom_member_type_id == 59 && !this.me.created_by))
            ) {
              this.isSsoUser = true;
            }
          }
          if (this.companyId == 15) {
            this.asUser = response[1] ? response[1]["user"] : [];
            this.getBusinessCategories();
          } else {
            this.getCompanyBusinessCategories(this.companyId);
          }

          this.sectors = response[2] ? response[2]["categories"] : [];
          this.civilStatus = response[3] ? response[3]["civil_status"] : [];
          this.wellbeingActivities = response[4]
            ? response[4]["wellbeing_activities"]
            : [];

          let user_area_groups = response[5] ? response[5]["result"] : [];
          if (user_area_groups) {
            this.areaGroups = user_area_groups.area_groups;
            this.userAreaGroups = user_area_groups.user_area_groups;
            if (this.areaGroups) {
              this.areaGroups = this.areaGroups.sort((a, b) => {
                if (a.title < b.title) {
                  return -1;
                }

                if (a.title > b.title) {
                  return 1;
                }

                return 0;
              });
            }
          }

          if (this.me.image) {
            this.myImage = this.imageSrc + this.me.image;
            this.hasImage = true;
          }

          if (this.me?.company_logo) {
            this.myCompanyLogoImage =
              this.companyLogoImageSrc + this.me.company_logo;
            this.hasCompanyLogoImage = true;
          }

          this.accountId = this.me.account_id ? this.me.account_id : "";
          this.invoiceSettingCompany =
            this.me.invoice_to_company == 1 ? true : false;

          each(keys(this.me), (key) => {
            if (this.form) {
              if (this.form.get(key) && key != "password") {
                this.form.get(key).setValue(get(this.me, key));
              }

              if (this.tutor) {
                if (key == "who_am_i") {
                  this.form.get("who_am_i").setValue(this.tutor.description);
                }
                if (key == "calendly_url") {
                  this.form
                    .get("calendly_url")
                    .setValue(this.tutor.calendly_url);
                }
              }
            } else {
              if (this.profileForm.get(key) && key != "password") {
                let val = get(this.me, key);
                if (key == "area_group") {
                  if (!val && this.userAreaGroups) {
                    val = this.userAreaGroups[0].title;
                  }
                }
                if (
                  key == "civil_status" ||
                  key == "wellbeing_activity" ||
                  key == "country"
                ) {
                  if (!val) {
                    val = "";
                  }
                }
                // if (key == "birthday") {
                //   let timezoneOffset = new Date().getTimezoneOffset();
                //   let pd = (
                //     moment(val)
                //       .utc()
                //       .utcOffset(timezoneOffset)
                //       .format("YYYY-MM-DD HH:mm")
                //       .toString() + ":00Z"
                //   ).replace(" ", "T");
                //   if (pd) {
                //     let year = parseInt(
                //       this.datePipe?.transform(pd, "yyyy")?.toString()
                //     );
                //     let month = parseInt(
                //       this.datePipe.transform(pd, "MM").toString()
                //     );
                //     let day = parseInt(
                //       this.datePipe.transform(pd, "dd").toString()
                //     );
                //     // val = new NgbDate(year,month,day);
                //   }
                // }
                this.profileForm.get(key).setValue(val ? val : "");
              }
            }
          });

          if (this.companyId == 15 && this.asUser) {
            each(keys(this.asUser), (key) => {
              if (this.form) {
                if (this.form.get(key) && key != "password") {
                  this.form.get(key).setValue(get(this.me, key));
                }
              } else {
                if (this.profileForm.get(key) && key != "password") {
                  let val = get(this.asUser, key);
                  this.profileForm.get(key).setValue(val);
                }
              }
            });

            if (this.asUser) {
              if (this.asUser.logo) {
                this.userLogoSrc = environment.api + "/" + this.asUser.logo;
              }

              if (this.asUser?.business_categories) {
                this.selectedBusinessCategories =
                  this.asUser.business_categories;
              }
            }
          }

          if (
            this.me?.custom_member_type_id > 0 &&
            this.customMemberTypes &&
            this.customMemberTypes.length > 0 &&
            this.hasMemberAccess
          ) {
            this.checkMemberAreaVisibility(this.me.custom_member_type_id);
          }
          this.loading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  checkMemberAreaVisibility(member_type_id) {
    const item =
      this.customMemberTypes &&
      this.customMemberTypes.find((i) => i.id == member_type_id);
    if (item && item.members_visible == 1) {
      this.memberTypeVisible = true;
      this.showProfileInMembersArea =
        this.me.show_in_members == null
          ? this.memberTypeVisible
          : this.me.show_in_members;
    }
  }

  getBusinessCategories() {
    this._companyService.getBusinessCategories().subscribe(
      (data: any) => {
        this.businessCategories = data.categories;
      },
      (error) => {}
    );
  }

  getCompanyBusinessCategories(companyId) {
    this._companyService.getCompanyBusinessCategories(companyId).subscribe(
      (data: any) => {
        this.businessCategories = data.categories;
      },
      (error) => {}
    );
  }

  hasCompanyLogo() {
    let result = false;

    if (this.selectedFields?.length > 0) {
      let company_logo_field = this.selectedFields?.filter((field) => {
        return field.field == "company_logo";
      });
      if (company_logo_field?.length > 0) {
        result = true;
      }
    }

    return result;
  }

  async uploadPhoto(event: any) {
    this.uploadImageMode = 'profile';
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

  async uploadCompanyLogo(event: any) {
    this.uploadImageMode = 'companylogo';
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
      if(this.uploadImageMode == 'companylogo') {
        this.companyLogoImageSrc = this.croppedImage = event.base64;
        this.logoFile = {
          name: "image",
          image: base64ToFile(event.base64), //event.file
        };
        this.hasCompanyLogoImage = true;
        this.myCompanyLogoImage = this.companyLogoImageSrc;
      } else {
        this.imageSrc = this.croppedImage = event.base64;
        this.file = {
          name: "image",
          image: base64ToFile(event.base64), //event.file
        };
        this.hasImage = true;
        this.myImage = this.imageSrc;
      }
    }
  }

  imageLoaded() {}

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {}

  imageCropperModalSave() {
    this.showImageCropper = false;
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

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldConfirmTextType() {
    this.fieldConfirmTextType = !this.fieldConfirmTextType;
  }

  save() {
    this.invalidPassword = false;
    this.invalidPasswordMessage = "";
    this.errors = [];
    if (
      this.profileForm.get("password").value &&
      this.profileForm.get("confirmPassword").value
    ) {
      // Password validations
      if (
        this.profileForm.get("password").value !=
        this.profileForm.get("confirmPassword").value
      ) {
        this.invalidPassword = true;
        this.invalidPasswordMessage = "Las contraseñas no coinciden";
        this.open(this._translateService.instant("dialog.passwordnotmatch"), "");
        return false;
      } else {
        if (this.profileForm.get("password").value.length < 8) {
          this.invalidPassword = true;
          this.invalidPasswordMessage =
            "La contraseña debe tener al menos 8 caracteres";
            this.open(this._translateService.instant("dialog.passwordlength"), "");
          return false;
        }
      }
    }
    let typeIdArray: any[] = [];
    this.selectedCourseTutorType?.forEach(sctt => {
      typeIdArray.push(sctt?.id);
    })

    if (this.isValidForm()) {
      let formData = [];
      formData = this.profileForm.value;
      formData["id"] = this.me.id;

      if (this.memberTypeVisible) {
        formData["show_in_members"] = this.showProfileInMembersArea;
      }

      if (!this.hasImage) {
        formData["image"] = "empty_avatar.png";
      }

      if (!this.hasCompanyLogoImage) {
        formData["company_logo"] = "empty_avatar.png";
      }
      if(this.tutorInfo?.user_id == this.userId){
        formData['type_ids'] = typeIdArray
  
        if(this.companyId){
          formData['company_id'] = this.companyId
        }
  
        if(this.tutorInfo?.user_id !== null){
          formData['tutor_id'] = this.tutorInfo.id
        }
      }

      if (this.showProfileFieldsInMembers) {
        let params = {
          company_id: this.companyId,
          custom_member_type_id: this.memberTypeId,
          settings: this.selectedFields
        };
        this._userService
          .manageProfileFieldSettings(this.userId, params)
          .subscribe(
            (res) => {
              this.updateLogoFile(formData);
            },
            (error) => {
              console.log(error);
              this.open(this._translateService.instant("dialog.error"), "");
            }
          );
      } else {
        this.updateLogoFile(formData);
      }
    } else {
      this.hasError = true;
    }
  }

  isValidForm() {
    let valid = true;
    Object.keys(this.profileForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.profileForm.get(key).errors;
      if (controlErrors != null && key != "birthday") {
        let field_valid = false;
        let display_name = "";
        if (this.selectedFields) {
          let field_key = this.selectedFields.filter((f) => {
            return f.field == key;
          });
          if (field_key && field_key[0]) {
            display_name =
              this.language == "en"
                ? field_key[0].field_display_en
                : field_key[0].field_display_es;
          }
        }
        if (display_name) {
          if (controlErrors["maxlength"]) {
            display_name += `${this._translateService.instant(
              "dialog.exceeds"
            )} ${
              controlErrors["maxlength"].requiredLength
            } ${this._translateService.instant("dialog.characters")}`;
          } else {
            if (key == "who_am_i" && !this.profileForm.get(key).value) {
              display_name = "";
              field_valid = true;
            } else {
              display_name += this._translateService.instant(
                "dialog.isarequiredfield"
              );
            }
          }

          if (display_name) {
            this.errors.push({
              message: display_name,
            });
          }
        }

        valid = field_valid;
      }
    });
    return valid;
  }

  updateLogoFile(formData) {
    if (this.logoFile?.image && this.companyId == 15) {
      this._userService.updateASLogo(this.asUser?.id || this.userId, this.logoFile).subscribe(
        (res) => {
          this.updateDynamicForm(formData);
        },
        (error) => {
          console.log(error);
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      this.updateDynamicForm(formData);
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  updateDynamicForm(formData) {
    this._userService.updateProfileDynamic(this.me.id, formData).subscribe(
      (response) => {
        if (this.file) {
          this._userService.updateProfileImage(this.me.id, this.file).subscribe(
            (res) => {
              if (res) {
                if (this.logoFile) {
                  this._userService
                    .updateCompanyLogoImage(this.me.id, this.logoFile)
                    .subscribe(
                      (res) => {
                        if (res) {
                          this.open(
                            this._translateService.instant(
                              "dialog.savedsuccessfully"
                            ),
                            ""
                          );
                          if (this.profileForm.get("password").value) {
                            this.passwordChanged = true;
                            this.passwordChangedMessage =
                              "Contraseña cambiada correctamente";
                          }
                          location.reload();
                        } else {
                          this.open(
                            this._translateService.instant("dialog.error"),
                            ""
                          );
                        }
                      },
                      (error) => {
                        console.log(error);
                        this.open(
                          this._translateService.instant("dialog.error"),
                          ""
                        );
                      }
                    );
                } else {
                  this.open(
                    this._translateService.instant("dialog.savedsuccessfully"),
                    ""
                  );
                  if (this.profileForm.get("password").value) {
                    this.passwordChanged = true;
                    this.passwordChangedMessage =
                      "Contraseña cambiada correctamente";
                  }
                  location.reload();
                }
              } else {
                this.open(this._translateService.instant("dialog.error"), "");
              }
            },
            (error) => {
              console.log(error);
              this.open(this._translateService.instant("dialog.error"), "");
            }
          );
        } else {
          if (this.logoFile) {
            this._userService
              .updateCompanyLogoImage(this.me.id, this.logoFile)
              .subscribe(
                (res) => {
                  if (res) {
                    this.open(
                      this._translateService.instant(
                        "dialog.savedsuccessfully"
                      ),
                      ""
                    );
                    if (this.profileForm.get("password").value) {
                      this.passwordChanged = true;
                      this.passwordChangedMessage =
                        "Contraseña cambiada correctamente";
                    }
                    location.reload();
                  } else {
                    this.open(
                      this._translateService.instant("dialog.error"),
                      ""
                    );
                  }
                },
                (error) => {
                  console.log(error);
                  this.open(this._translateService.instant("dialog.error"), "");
                }
              );
          } else {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            if (this.profileForm.get("password").value) {
              this.passwordChanged = true;
              this.passwordChangedMessage = "Contraseña cambiada correctamente";
            }
            location.reload();
          }
        }
      },
      (error) => {
        console.log(error);
        if (error && error.error) {
          this.open(error.error, "");
        } else {
          this.open(this._translateService.instant("dialog.error"), "");
        }
      }
    );
  }

  getMemberTypeTitle(type) {
    return this.language == "en"
      ? type.type
        ? type.type || type.type_es
        : type.type_es
      : this.language == "fr"
      ? type.type_fr
        ? type.type_fr || type.type_es
        : type.type_es
      : this.language == "eu"
      ? type.type_eu
        ? type.type_eu || type.type_es
        : type.type_es
      : this.language == "ca"
      ? type.type_ca
        ? type.type_ca || type.type_es
        : type.type_es
      : this.language == "de"
      ? type.type_de
        ? type.type_de || type.type_es
        : type.type_es
      : type.type_es;
  }

  getMemberTypeDate(type) {
    return  moment.utc(type.created_at).locale(this.language).format('D MMMM YYYY');
  }

  manageBilling() {
    if(this.companyId == 15) {
      this._userService.createCustomerPortal(this.me.id, 0, {})
      .subscribe(
          (res) => {
              if(res['redirect_url']) {
                  window.open(
                      res['redirect_url'],
                      '_blank'
                    );
              } else {
                  this.open(this.language == "en" ? 'Something went wrong' : 'Algo salió mal', '');
              }
          },
          error => {
              this.open(this.language == "en" ? 'Something went wrong' : 'Algo salió mal', '');
          });
    } else {
       // Check if custom invoice is enabled for the company
       if(this.hasCustomInvoice) {
        this._router.navigate([`/users/invoices-list`])
      } else {
        this._userService.createOtherCustomerPortal(this.me.id, this.companyId, 0, 'event', 0, {})
        .subscribe(
          (res) => {
              if(res['redirect_url']) {
                  window.open(
                      res['redirect_url'],
                      '_blank'
                    );
              } else {
                  this.open(this.language == "en" ? 'Something went wrong' : 'Algo salió mal', '');
              }
          },
          error => {
              this.open(this.language == "en" ? 'Something went wrong' : 'Algo salió mal', '');
          });
      }
    }
  }

  confirmCancelMembership(item) {
    this.showConfirmationModal = false;
    this.selectedItem = item;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmcancel"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmcancelitem"
    );
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    this.cancelMembership(this.selectedItem, true);
    this.showConfirmationModal = false;
  }

  cancelMembership(item, confirmed) {
    if(confirmed) {
      let params = {
        company_id: this.companyId,
        subscription_id: item.subscription_id,
        user_id: this.userId
      }
      this._userService.cancelMembership(params).subscribe(
        res => {
          this.open(this._translateService.instant('dialog.subscriptioncancelled'), '')
          setTimeout(() => {
            this.getUserMemberTypes()
            location.reload()
        }, 1000)
        },
        error => {
          console.log(error)
          this.open(this._translateService.instant('dialog.error'), '')
        })
    } else {
      console.log('Canceled')
    }
  }

  showCancelSubscription(item) {
    let show = true

    let active_membership = 0
    
    let active_other_memberships = this.userMemberTypes && this.userMemberTypes.filter(umt => {
      return umt.cancelled != 1
    })

    active_membership += active_other_memberships.length

    if(active_membership <= 1 && this.me?.cancelled) {
      show = false
    }

    return show
  }

  updateFieldShow(event, field) {
    if(this.selectedFields) {
      this.selectedFields.forEach((f, index) => {
        if(f.field == field.field) {
          this.selectedFields[index].show = event.target.checked
        }
      })
    }

    if(this.sectionFields) {
      this.sectionFields.forEach(s => {
        if(s.fields) {
          s.fields.forEach((f, index) => {
            if(f.field == field.field) {
              s.fields[index].show = event.target.checked
            }
          });
        }
      });
    }
  }

  openTermDialog(){
    this.isOpenContact = true
  }

  closeTermDialog(){
    this.isOpenContact = false
    
  }

  goToStatistics(){
    this._router.navigate(['/tiktok/statistics'], { queryParams: { access: encodeURIComponent('true') } });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}