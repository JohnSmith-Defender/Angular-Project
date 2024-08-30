import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService, UserService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MembersService } from "@features/services/members/members.service";
import { initFlowbite } from "flowbite";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: 'app-members-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: './detail.component.html'
})
export class MemberDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  emailDomain;
  user;
  canCreate: boolean = false;
  language: any;
  userId: any;
  companyId: any;
  pageName: any;
  pageDescription: any;
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
  memberData: any;
  member: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  featureId: any;
  membersFeature: any;
  editHover: boolean = false;
  deleteHover: boolean = false;
  createQuestionHover: boolean = false;
  createReferenceHover: boolean = false;
  questionForm: any;
  questionFormSubmitted: boolean = false;
  message: any = '';
  dialogMode: string = "";
  dialogTitle: any;
  errorMessage: string = '';
  processing: boolean = false;
  apiPath: string = environment.api + '/';
  sendReferenceForm: any;
  sendReferenceFormSubmitted: boolean = false;
  processingSendReference: boolean = false;
  showDescription: boolean = true;
  showEmail: boolean = true;
  showPhone: boolean = true;
  showCompanyName: boolean = true;
  showSector: boolean = true;
  showWebsite: boolean = true;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  otherSettings: any;
  hasRegistrationFields: boolean = false;
  hasCustomMemberTypeSettings: boolean = false;
  hasProfileFields: boolean = false;
  hasActivityFeed: boolean = false;
  showDefaultRegistrationFields: boolean = false;
  memberTypes: any;
  memberTypeId: any;
  allProfileFields: any;
  allProfileFieldMapping: any;
  profileFields: any;
  selectedFields: any = [];
  showProfileFieldsInMembers: boolean = false;
  moreFieldValues: any = [];
  allRegistrationFields: any;
  allRegistrationFieldMapping: any;
  registrationFields: any = [];
  alternativeCardDesign: boolean = false;

  constructor(
    private _router: Router,
    private _userService: UserService,
    private _membersService: MembersService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
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

    this.getMember();

    setTimeout(() => {
      initFlowbite();
    }, 2000);
  }

  getMember() {
    this._membersService
      .fetchMember(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.memberData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    this.sendReferenceForm = new FormGroup({
      'name': new FormControl('', [Validators.required]),
      'email': new FormControl('', [Validators.required]),
      'phone': new FormControl('', [Validators.required]),
      'description': new FormControl(''),
    })
    let data = this.memberData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data?.settings?.subfeatures);
    this.mapUserPermissions(data?.user_permissions);
    this.formatMember(data?.member);
    this.mapSettings(data);
    this.initializeBreadcrumb(data);
  }

  mapFeatures(features) {
    this.membersFeature = features?.find((f) => f.feature_id == 15);
    this.featureId = this.membersFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.membersFeature);
    this.pageDescription = this.getFeatureDescription(this.membersFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.showProfileFieldsInMembers = subfeatures.some(
        (a) => a.name_en == "Show/hide fields in Member details" && a.active == 1
      );
      this.alternativeCardDesign = subfeatures.some(
        (a) => a.name_en == "Alternative card design" && a.active == 1 && a.feature_id == 15
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 15
      );
  }

  mapSettings(data) {
    let other_settings = data?.settings?.other_settings;
    if(other_settings?.length > 0) {
      this.hasRegistrationFields = other_settings.some(
        (a) => a.title_en == "Registration fields" && a.active == 1
      );
      this.hasCustomMemberTypeSettings = other_settings.some(
        (a) => a.title_en == "Require Stripe payment on specific member types" && a.active == 1
      );
      this.hasRegistrationFields = other_settings.some(
        (a) => a.title_en == "Registration fields" && a.active == 1
      );
      this.hasProfileFields = other_settings.some(
        (a) => a.title_en == "Profile fields" && a.active == 1
      );
      if(!this.hasProfileFields) {
        this.showDefaultRegistrationFields = true;
      }
    }

    if(this.hasCustomMemberTypeSettings) {
      this.getCustomMemberTypes()
    } else {
      if(this.hasProfileFields && this.hasRegistrationFields && this.companyId != 12 && this.companyId != 15) {
        this.getCombinedFieldMappingPrefetch()
      } else {
        if(this.hasRegistrationFields) {
          this.getRegistrationFields()
        } else {
          if(this.hasProfileFields) {
            this.getProfileFields()
          } else {
            this.showDefaultRegistrationFields = true
          }
        }
      }
    }
  }

  getCombinedFieldMappingPrefetch() {
    this._userService.getCombinedFieldMappingPrefetch(this.companyId).subscribe(data => {
      let registration_fields = data[0] ? data[0]['registration_field_mapping'] : []
      let profile_fields = data[1] ? data[1]['profile_field_mapping'] : []
      
      if(registration_fields.length > profile_fields.length) {
        if(this.hasRegistrationFields) {
          this.getRegistrationFields()
        } else {
          if(this.hasProfileFields) {
            this.getProfileFields()
          } else {
            this.showDefaultRegistrationFields = true
          }
        }
      } else {
        if(this.hasProfileFields) {
          this.getProfileFields()
        } else {
          this.showDefaultRegistrationFields = true
        }
      }
    })    
  }

  getRegistrationFields() {
    this._userService.getRegistrationFields()
      .subscribe(
          async (response) => {
              this.allRegistrationFields = response.registration_fields
              this.getRegistrationFieldMapping()
          },
          error => {
              console.log(error)
          }
      )
  }

  getRegistrationFieldMapping() {
    this._userService.getRegistrationFieldMapping(this.companyId)
      .subscribe(
          async (response) => {
              this.allRegistrationFieldMapping = response.registration_field_mapping

              let registration_fields: any[] = []
              let selected_fields: any[] = []
              if(this.allRegistrationFields) {
                this.allRegistrationFields.forEach(field => {
                  let match = this.allRegistrationFieldMapping.some(a => a.field_id === field.id)
                  if(!match) {
                    registration_fields.push(field)
                  }
                });
              }

              if(this.allRegistrationFieldMapping) {
                this.allRegistrationFieldMapping.forEach(field => {
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

                    fld = {
                      "id": reg_field[0].id,
                      "field": reg_field[0].field,
                      "field_type": reg_field[0].field_type,
                      "field_display_en": field_display_en,
                      "field_display_es": field_display_es,
                      "field_group_en": reg_field[0].field_group_en,
                      "field_group_es": reg_field[0].field_group_es,
                      "field_desc_en": field_desc_en,
                      "field_desc_es": field_desc_es,
                      "active": reg_field[0].active,
                      "required": reg_field[0].required,
                      "created_at": reg_field[0].created_at,
                      "show": true
                    }

                    selected_fields.push(fld)
                  }
                })
              }

              this.registrationFields = registration_fields
              this.selectedFields = selected_fields

              if(this.showProfileFieldsInMembers) {
                this.getShowRegistrationFieldMapping()
              } else {
                if(this.selectedFields && this.selectedFields.length > 0) {
                  this.initializeMoreFields()
                } else {
                  this.showDefaultRegistrationFields = true
                }
              }
          },
          error => {
              console.log(error)
          }
      )
  }

  getShowRegistrationFieldMapping() {
    this._userService.memberProfileFieldSettings(this.userId)
      .subscribe(
        async (response) => {
          let allRegistrationFieldMapping = response.profile_fields
          let registrationFields = this.registrationFields
          let selectedFields = this.selectedFields
          
          if(allRegistrationFieldMapping && allRegistrationFieldMapping.length > 0) {
            allRegistrationFieldMapping.forEach(field => {
              if(selectedFields) {
                selectedFields.forEach(sf => {
                  if(sf.field == field.field) {
                    sf.show = field.show == 1 ? true : false
                  }
                })
              }

              if(registrationFields) {
                registrationFields.forEach(pf => {
                  if(pf.field == field.field) {
                    pf.show = field.show == 1 ? true : false
                  }
                })
              }
            })
          }

          this.registrationFields = registrationFields
          this.selectedFields = selectedFields

          if(this.selectedFields && this.selectedFields.length > 0) {
            this.initializeMoreFields()
          } else {
            this.showDefaultRegistrationFields = true
          }
        },
        error => {
            console.log(error)
        }
      )
  }

  getProfileFields() {
    this._userService.getProfileFields()
      .subscribe(
          async (response) => {
              this.allProfileFields = response.profile_fields
              this.getProfileFieldMapping()
          },
          error => {
              console.log(error)
          }
      )
  }

  getProfileFieldMapping() {
    this._userService.getProfileFieldMapping(this.companyId)
      .subscribe(
          async (response) => {
              this.allProfileFieldMapping = []
              let profile_fields: any[] = []
              let selected_fields: any[] = []

              if(this.allProfileFieldMapping && this.allProfileFieldMapping.length > 0) {
                this.allProfileFieldMapping.forEach(field => {
                  let reg_field = this.allProfileFields.filter(f => {
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

                    fld = {
                      "id": reg_field[0].id,
                      "field": reg_field[0].field,
                      "field_type": reg_field[0].field_type,
                      "field_display_en": field_display_en,
                      "field_display_es": field_display_es,
                      "field_group_en": reg_field[0].field_group_en,
                      "field_group_es": reg_field[0].field_group_es,
                      "field_desc_en": field_desc_en,
                      "field_desc_es": field_desc_es,
                      "active": reg_field[0].active,
                      "required": reg_field[0].required,
                      "show": field.show == 1 ? true : false,
                      "created_at": reg_field[0].created_at
                    }
                    selected_fields.push(fld)
                  }
                })
              } else {
                this.allProfileFields.forEach(f => {
                  selected_fields.push({
                    "id": f.id,
                    "field": f.field,
                    "field_type": f.field_type,
                    "field_display_en": f.field_display_en,
                    "field_display_es": f.field_display_es,
                    "field_group_en": f.field_group_en,
                    "field_group_es": f.field_group_es,
                    "field_desc_en": f.field_desc_en,
                    "field_desc_es": f.field_desc_es,
                    "active": f.active,
                    "required": f.required,
                    "show": true,
                    "created_at": f.created_at
                  })
                });
              }

              this.profileFields = profile_fields
              this.selectedFields = selected_fields

              if(this.showProfileFieldsInMembers) {
                this.getShowProfileFieldMapping()
              } else {
                if(this.selectedFields && this.selectedFields.length > 0) {
                  this.initializeMoreFields()
                } else {
                  this.showDefaultRegistrationFields = true
                }
              }
          },
          error => {
              console.log(error)
          }
      )
  }

  getShowProfileFieldMapping() {
    this._userService.memberProfileFieldSettings(this.userId)
      .subscribe(
        async (response) => {
          let allProfileFieldMapping = response.profile_fields
          let profileFields = this.profileFields
          let selectedFields = this.selectedFields
          
          if(allProfileFieldMapping && allProfileFieldMapping.length > 0) {
            allProfileFieldMapping.forEach(field => {
              if(selectedFields) {
                selectedFields.forEach(sf => {
                  if(sf.field == field.field) {
                    sf.show = field.show == 1 ? true : false
                  }
                })
              }

              if(profileFields) {
                profileFields.forEach(pf => {
                  if(pf.field == field.field) {
                    pf.show = field.show == 1 ? true : false
                  }
                })
              }
            })
          }

          this.profileFields = profileFields
          this.selectedFields = selectedFields

          if(this.selectedFields && this.selectedFields.length > 0) {
            this.initializeMoreFields()
          } else {
            this.showDefaultRegistrationFields = true
          }
        },
        error => {
            console.log(error)
        }
      )
  }

  getCustomMemberTypes() {
    this._userService.getCustomMemberTypes(this.companyId).subscribe(
      response => {
        this.memberTypes = response.member_types
        this.getCustomProfileFields()
      },
      error => {
        console.log(error);
      }
    );
  }

  async getCustomProfileFields() {
    this.memberTypeId = this.user.custom_member_type_id
    let member_type_id = this.hasCustomMemberTypeSettings ? this.member.custom_member_type_id : this.user.custom_member_type_id
    this._userService.getMemberTypeCustomProfileFields(this.companyId, member_type_id).subscribe(
      (response: any) => {
        this.allProfileFields = response.profile_fields
        this.getCustomProfileFieldMapping()
      },
      error => {
        console.log(error)
      }
    )
  }

  async getCustomProfileFieldMapping() {
    this._userService.memberProfileFieldSettings(this.hasCustomMemberTypeSettings ? this.member.id : this.userId)
      .subscribe(
        async (response) => {
          this.allProfileFieldMapping = response.profile_fields

          let profile_fields = this.allProfileFields
          let selected_fields: any[] = []
          
          if(this.allProfileFieldMapping && this.allProfileFieldMapping.length > 0) {
            this.allProfileFieldMapping.forEach(field => {
              let reg_field = this.allProfileFields.filter(f => {
                return f.profile_field_id == field.profile_field_id
              })

              let fld = {}
              if(reg_field && reg_field[0]) {
                fld = {
                  "id": reg_field[0].profile_field_id,
                  "user_id": this.userId,
                  "company_id": this.companyId,
                  "field": reg_field[0].field,
                  "field_type": reg_field[0].field_type,
                  "field_display_en": reg_field[0].field_display_en,
                  "field_display_es": reg_field[0].field_display_es,
                  "field_group_en": reg_field[0].field_group_en,
                  "field_group_es": reg_field[0].field_group_es,
                  "field_desc_en": reg_field[0].field_desc_en,
                  "field_desc_es": reg_field[0].field_desc_es,
                  "show": field.show == 1 ? true : false,
                  "required": reg_field[0].required,
                  "created_at": reg_field[0].created_at
                }

                if(field.field == 'email' && field.show != 1) {
                  this.showEmail = false
                }
                if(field.field == 'company_description' && field.show != 1) {
                  this.showDescription = false
                }
                if(field.field == 'phone' && field.show != 1) {
                  this.showPhone = false
                }
                if(field.field == 'company_name' && field.show != 1) {
                  this.showCompanyName = false
                }
                if(field.field == 'sector' && field.show != 1) {
                  this.showSector = false
                }
                if(field.field == 'website' && field.show != 1) {
                  this.showWebsite = false
                }

                selected_fields.push(fld)
              }
            })
          } else {
            this.allProfileFields.forEach(f => {
              selected_fields.push({
                "id": f.profile_field_id,
                "user_id": this.userId,
                "company_id": this.companyId,
                "field": f.field,
                "field_type": f.field_type,
                "field_display_en": f.field_display_en,
                "field_display_es": f.field_display_es,
                "field_group_en": f.field_group_en,
                "field_group_es": f.field_group_es,
                "field_desc_en": f.field_desc_en,
                "field_desc_es": f.field_desc_es,
                "show": true,
                "required": f.required,
                "created_at": f.created_at
              })
            });
          }

          this.profileFields = profile_fields
          this.selectedFields = selected_fields

          if(this.selectedFields && this.selectedFields.length > 0) {
            this.initializeMoreFields()
          } else {
            this.showDefaultRegistrationFields = true
          }
        },
        error => {
            console.log(error)
        }
    )
  }

  async initializeMoreFields() {
    if(this.selectedFields && this.selectedFields.length > 0) {
      if(this.showProfileFieldsInMembers) {
        this.selectedFields.forEach(f => {
          if(f.field == 'email'
            // || f.field == 'company_description'
            || f.field == 'phone'
            // || f.field == 'company_name'
            || f.field == 'sector'
            || f.field == 'website'
            || f.field == 'webpage') {
              if(f.field == 'email' && !f.show) {
                this.showEmail = false
              }
              // if(f.field == 'company_description' && !f.show) {
              //   this.showDescription = false
              // }
              if(f.field == 'phone' && !f.show) {
                this.showPhone = false
              }
              // if(f.field == 'company_name' && !f.show) {
              //   this.showCompanyName = false
              // }
              if(f.field == 'sector' && !f.show) {
                this.showSector = false
              }
              if((f.field == 'website' || f.field == 'webpage') && !f.show) {
                this.showWebsite = false
              }
          }
        })
      }

      this.selectedFields.forEach(f => {
        if(f.field != 'image'
          && f.field != 'company_logo'
          && f.field != 'first_name'
          && f.field != 'founder_name'
          && f.field != 'last_name'
          && f.field != 'phone'
          && f.field != 'email'
          && f.field != 'website'
          && f.field != 'webpage'
          && f.field != 'sector'
          && f.field != 'password'
          && f.field_type != 'file'
          && f.field_type != 'image'
        ) {
          let value
          if(this.member[f.field] && this.member[f.field] != 'null') {
            if(f.field == 'birthday') {
              value = this.member[f.field] ? moment(this.member[f.field]).format('DD/M/YYYY') : this.member[f.field]
            } else {
              value = this.member[f.field]
            }
          }
          if(this.hasCustomMemberTypeSettings || this.showProfileFieldsInMembers) {
            if(value && f.show == true) {
              this.moreFieldValues.push({
                'field': f.field,
                'label': this.language == 'en' ? f.field_display_en : f.field_display_es,
                'value': value
              })
            }
          } else {
            if(value) {
              this.moreFieldValues.push({
                'label': this.language == 'en' ? f.field_display_en : f.field_display_es,
                'value': value
              })
            }
          }
        }
      })
    }
  }

  formatMember(member) {
    let members: any = [];
    members?.push(member);

    members = members?.map((member) => {
      return {
        ...member,
        image: `${environment.api}/${member.image}`,
        display_name: member?.first_name ? `${member?.first_name} ${member?.last_name}` : member?.name,
        email: `mailto:${member?.email}`,
        email_display: member?.email,
        phone: `tel:${member?.phone}`,
        phone_display: member?.phone,
      }
    })

    this.member = members?.length > 0 ? members[0] : {};
  }

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = "";
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
        : feature.name_es || feature.feature_name_ES
      : "";
  }

  getFeatureDescription(feature) {
    return feature
      ? this.language == "en"
        ? feature.description_en || feature.description_es
        : this.language == "fr"
        ? feature.description_fr || feature.description_es
        : this.language == "eu"
        ? feature.description_eu || feature.description_es
        : this.language == "ca"
        ? feature.description_ca || feature.description_es
        : this.language == "de"
        ? feature.description_de || feature.description_es
        : feature.description_es
      : "";
  }

  handleCreateQuestion() {
    this.questionFormSubmitted = false;
    this.dialogMode = "question";
    this.dialogTitle =  this.companyId == 66 ? this._translateService.instant('landing.sendmeamessage') : this._translateService.instant('members.askaquestion');
    this.modalbutton?.nativeElement.click();
  }

  toggleCreateQuestionHover(event) {
    this.createQuestionHover = event;
  }

  handleCreateReference() {
    this.sendReferenceFormSubmitted = false;
    this.dialogMode = "reference";
    this.dialogTitle =  this._translateService.instant('members.sendreference');
    this.modalbutton?.nativeElement.click();
  }

  toggleCreateReferenceHover(event) {
    this.createReferenceHover = event;
  }

  sendNewQuestion() {
    this.questionFormSubmitted = true

    if(!this.message) {
      return false
    }

    let params = {
      'company_id': this.companyId,
      'user_id': this.id,
      'message': this.message,
      'question_id': 0,
      'created_by': this.userId,
    }
    this._membersService.askQuestion(params).subscribe(data => {
      this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
      this.getMember();
      this.closemodalbutton?.nativeElement.click();
    }, err => {
      console.log('err: ', err);
    })
  }

  sendReference() {
    this.sendReferenceFormSubmitted = true

    if(!this.isValidReferenceForm()) {
      return false
    }

    this.processingSendReference = true

    let params = {
      'company_id': this.companyId,
      'user_id': this.id,
      'name': this.sendReferenceForm.get('name').value,
      'email': this.sendReferenceForm.get('email').value,
      'phone': this.sendReferenceForm.get('phone').value,
      'description': this.sendReferenceForm.get('description').value,
      'created_by': this.userId,
    }
    this._membersService.sendReference(params).subscribe(data => {
      this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
      this.processingSendReference = false
      this.closemodalbutton?.nativeElement.click();
      this.getMember();
    }, err => {
      console.log('err: ', err);
      this.open(this._translateService.instant('dialog.error'), '');
    })
  }

  isValidReferenceForm() {
    let valid = true;
    Object.keys(this.sendReferenceForm.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.sendReferenceForm.get(key).errors;
      if(controlErrors != null) {
        valid = false;
      }
    });
    return valid;
  }

  hasBasicInfo() {
    if(
      (this.member?.email_display && this.showEmail) ||
      (this.member?.phone_display && this.showPhone) ||
      (this.member?.website && this.showWebsite) ||
      (this.member?.sector && this.showSector)
    ) {
      return true;
    } else {
      return false;
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  handleGoBack() {
    this._location.back();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
