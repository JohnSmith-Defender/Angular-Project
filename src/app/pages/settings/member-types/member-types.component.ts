import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import {
  BreadcrumbComponent,
  ToastComponent,
} from "@share/components";
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
import { QuillModule } from 'ngx-quill';
import get from "lodash/get";

@Component({
  selector: "app-manage-membertypes",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    QuillModule,
    SearchComponent,
    BreadcrumbComponent,
    ToastComponent,
  ],
  templateUrl: "./member-types.component.html",
})
export class ManageMemberTypesComponent {
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
  @Input() fromscreen: string = "";

  memberTypes: any;
  showEditMemberTypeModal: boolean = false;
  mode: any;
  memberTypeForm: FormGroup = new FormGroup({
    type_es: new FormControl("", [Validators.required]),
    description: new FormControl("", [Validators.required]),
    details: new FormControl(""),
    price: new FormControl(""),
    base_price: new FormControl(""),
    commission_fee: new FormControl(""),
    expire_days: new FormControl(""),
    expire_reminder_days: new FormControl(""),
    trial_price: new FormControl(""),
    trial_base_price: new FormControl(""),
    trial_days: new FormControl(""),
    trial_start_date: new FormControl(""),
    trial_reminder_days: new FormControl(""),
  });
  formSubmitted: boolean = false;
  requirePayment: boolean = false;
  membersVisible: boolean = false;
  paymentTypes: any;
  selectedPaymentType: any = "";
  taxIncludesOptions: any;
  taxIncludeStatus: any = "";
  selectedId: any;
  tabSelected: any;
  features: any;
  companyFeatures: any = [];
  otherSettings: any;
  hasSurveys: boolean = false;
  hasQuizzes: boolean = false;
  permissionsData: any = [];
  profileFields: any = [];

  selectedFieldId: any;
  showFieldDetails: boolean = false;
  fieldMode: any = "";
  fieldFormSubmitted: boolean = false;
  selectedField: any = "";
  selectedFieldType: any = "";
  fieldDesc: any;
  requiredField: boolean = false;
  allProfileFields: any;
  fieldTypes: any;
  filteredProfileFields: any = [];
  questions: any;
  filteredQuestions: any;

  questionMode: any = "";
  selectedQuestionId: any;
  questionFormSubmitted: boolean = false;
  showQuestionDetails: boolean = false;
  questionDesc: any;
  yesNo: boolean = false;

  pricingDetails: any;
  pricingDetailMode: any = "";
  selectedPricingId: any;
  pricingDetailFormSubmitted: boolean = false;
  showPricingDetails: boolean = false;
  pricingDetailDesc: any;
  pricingDetailDescES: any;
  pricingDetailDescFR: any;
  pricingDetailDescEU: any;
  pricingDetailDescCA: any;
  pricingDetailDescDE: any;
  filteredPricingDetails: any;

  hasCustomMemberTypeExpiration: boolean = false;
  expire: boolean = false;
  includePlatformFee: boolean = false;
  stripeAccountId: any;
  connecting: boolean = false;

  domain: any;
  hasMemberCommissions: boolean = false;
  includeCommissionFee: boolean = false;
  showRegister: boolean = false;
  requireApproval: boolean = false;
  accessAccount: boolean = false;
  clubPresident: boolean = false;
  manageMembers: boolean = false;
  hasCustomInvoice: boolean = false;
  from_commission: boolean = false;
  connectError: boolean = false;
  activateTrialPeriod: boolean = false;
  showMemberTypePreviewModal: boolean = false;
  type: any;
  customInvoice: any;
  memberTypesPermissions: any = [];
  issaving: boolean = false;
  showMemberTypePagePreviewModal: boolean = false;
  previewPageForm: any;
  previewPageFormSubmitted: boolean = false;
  selectedTestMember: any = "";
  members: any = [];
  languages: any = [];
  selectedLanguage: any = "en";
  @ViewChild("trialbaseprice") trialBasePriceElement: ElementRef | undefined;
  @ViewChild("trialprice") trialPriceElement: ElementRef | undefined;

  tabIndex = 0;
  subscriptionDetails: any;
  subscriptionDetailMode: any = "";
  selectedSubscriptionId: any;
  subscriptionDetailFormSubmitted: boolean = false;
  showSubscriptionDetails: boolean = false;
  subscriptionBasePrice: any;
  subscriptionPrice: any;
  subscriptionPaymentType: any = "";
  filteredSubscriptionDetails: any;
  subscriptionTaxIncludesOptions: any;
  subscriptionTaxIncludeStatus: any = "";
  subscriptionAcknowledgementPageURL: any = "";
  activateSubscriptionTrialPeriod: boolean = false;
  trialSubscriptionBasePrice: any;
  trialSubscriptionPrice: any;
  trialSubscriptionDays: any;
  trialSubscriptionStartDate: any;
  trialSubscriptionReminderDays: any;
  acknowledgementPageURL: any;
  showEditTutorAccessModal: any = false;
  tutorAccessTypes: any = [];
  selectedTutorAccess: any;
  selectedPermissionId: any;
  confirmUpdateAccess: any = this._translateService.instant(
    "dialog.confirmupdateaccess"
  );
  confirmUpdateAccessText: any = this._translateService.instant(
    "dialog.confirmupdateaccesstext"
  );

  @ViewChild("trialsubscriptionbaseprice") trialSubscriptionBasePriceElement:
    | ElementRef
    | undefined;
  @ViewChild("trialsubscriptionprice") trialSubscriptionPriceElement:
    | ElementRef
    | undefined;
  membersFeature: any;
  membersFeatureId: any;
  hasMembers: boolean = false;
  isSuperAdmin: boolean = false;

  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = [
    "move",
    "sequence",
    "title",
    "show_register",
    "require_payment",
    "members_visible",
    "action",
  ];
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  customMemberTypePermissions: any;
  allMemberTypes: any;
  searchKeyword: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  selectedConfirmItem: any;
  selectedConfirmMode: string = "";
  company: any;
  dialogMode: string = "";
  dialogTitle: any;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  hasContract: boolean = false;
  activeContract: boolean = false;
  contractDescription: any;
  samePrice: boolean = false;
  plansFeature: any;
  plansFeatureId: any;
  hasPlans: boolean = false;
  plansTitle: any;
  accessPlatformSettings: boolean = false;
  accessProfile: boolean = false;
  accessMyInvitations: boolean = false;
  inviteAllEvents: boolean = false;
  viewGuests: boolean = false;

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
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
    this.from_commission = this._router.url.endsWith("/member-type/part");
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this._translateService.use(this.language || "es");
    this.selectedLanguage = this.language;

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
      this.customInvoice = company[0].custom_invoice == 1 ? true : false;
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
    this.initData();
    if (this.companyId != 32) {
      this.getMembers();
    }
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.fetchManageMemberTypesData();
  }

  initData() {
    this.displayedColumns = [
      "move",
      "sequence",
      "title",
      "show_register",
      "require_payment",
      "members_visible",
      "action",
    ];
    this.paymentTypes = [
      {
        id: 1,
        type_en: "One time",
        type_es: "Una vez",
        type_fr: "Une fois",
        type_eu: "Behin",
        type_ca: "Una vegada",
        type_de: "Einmal",
        type_it: "Una volta",
      },
      {
        id: 2,
        type_en: "Monthly recurring",
        type_es: "Mensual recurrente",
        type_fr: "Récurrent mensuel",
        type_eu: "Hileroko errepikakorra",
        type_ca: "Mensual recurrent",
        type_de: "Monatlich wiederkehrend",
        type_it: "Ricorrente mensile",
      },
      {
        id: 4,
        type_en: "Every 3 months",
        type_es: "Cada 3 meses",
        type_fr: "Tous les 3 mois",
        type_eu: "3 hilabetero",
        type_ca: "Cada 3 mesos",
        type_de: "Alle 3 Monate",
        type_it: "Ogni 3 mesi",
      },
      {
        id: 5,
        type_en: "Every 6 months",
        type_es: "Cada 6 meses",
        type_fr: "Tous les 6 mois",
        type_eu: "6 hilabetero",
        type_ca: "Cada 6 mesos",
        type_de: "Alle 6 Monate",
        type_it: "Ogni 6 mesi",
      },
      {
        id: 3,
        type_en: "Yearly recurring",
        type_es: "Anual recurrente",
        type_fr: "Récurrent annuel",
        type_eu: "Urteko errepikakorra",
        type_ca: "Anual recurrent",
        type_de: "Jährlich wiederkehrend",
        type_it: "Ricorrente annuale",
      },
    ];
    this.taxIncludesOptions = [
      {
        id: 1,
        type_en: "Taxes not included",
        type_es: "Impuestos no incluidos",
        type_fr: "Taxes en sus",
        type_eu: "Zergak ez daude barne",
        type_ca: "Impostos no inclosos",
        type_de: "Steuern nicht inbegriffen",
        type_it: "Tasse non incluse",
      },
      {
        id: 2,
        type_en: "Taxes included",
        type_es: "Impuestos incluidos",
        type_fr: "Taxes incluses",
        type_eu: "Zergak barne",
        type_ca: "Impostos inclosos",
        type_de: "Steuern inbegriffen",
        type_it: "Tasse incluse",
      },
    ];
    this.fieldTypes = [
      {
        type: "text",
        type_en: "texto",
        type_es: "text",
        type_fr: "texte",
        type_eu: "testua",
        type_ca: "text",
        type_de: "text",
        type_it: "testo",
      },
      {
        type: "number",
        type_en: "number",
        type_es: "número",
        type_fr: "le numéro",
        type_eu: "zenbakia",
        type_ca: "número",
        type_de: "nummer",
        type_it: "numero",
      },
      {
        type: "password",
        type_en: "password",
        type_es: "contraseña",
        type_fr: "mot de passe",
        type_eu: "pasahitza",
        type_ca: "password",
        type_de: "passwort",
        type_it: "parola d'ordine",
      },
      {
        type: "date",
        type_en: "date",
        type_es: "fecha",
        type_fr: "date",
        type_eu: "data",
        type_ca: "date",
        type_de: "datum",
        type_it: "data",
      },
      {
        type: "textarea",
        type_en: "textarea",
        type_es: "texto largo",
        type_fr: "zone de texte",
        type_eu: "testu eremua",
        type_ca: "textarea",
        type_de: "textbereich",
        type_it: "textarea",
      },
      {
        type: "select",
        type_en: "select",
        type_es: "desplegable",
        type_fr: "select",
        type_eu: "select",
        type_ca: "select",
        type_de: "wählen",
        type_it: "selezionare",
      },
      {
        type: "image",
        type_en: "image",
        type_es: "imagen",
        type_fr: "image",
        type_eu: "irudia",
        type_ca: "imatge",
        type_de: "bild",
        type_it: "immagine",
      },
      {
        type: "file",
        type_en: "file",
        type_es: "archivar",
        type_fr: "des dossiers",
        type_eu: "fitxategiak",
        type_ca: "file",
        type_de: "dateien",
        type_it: "file",
      },
    ];
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.adminaccess"
    );
    this.level3Title = this._translateService.instant(
      "member-type-registration.membertypes"
    );
    this.level4Title = "";
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchManageMemberTypesData() {
    this._companyService
      .fetchManageMemberTypesData(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data);
          this.mapUserPermissions(data?.user_permissions);
          this.mapSettings(data);
          this.allProfileFields = data?.profile_fields;
          this.mapCustomProfileFields(data?.custom_profile_fields);
          this.questions = data?.questions;
          this.customMemberTypePermissions = data?.member_type_permissions;
          this.mapPricingDetails(data?.pricing_details);
          this.allMemberTypes = data?.member_types;
          this.formatMemberTypes(data?.member_types);
          this.refreshTable(this.memberTypes);
          this.isloading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.companyFeatures = [];
    this.membersFeature = features?.find(
      (f) => f.feature_id == 15 && f.status == 1
    );
    this.membersFeatureId = this.membersFeature?.feature_id;
    this.hasMembers = this.membersFeatureId > 0 ? true : false;

    this.plansFeature = features?.find(
      (f) => f.feature_id == 1 && f.status == 1
    );
    this.plansFeatureId = this.plansFeature?.feature_id;
    this.hasPlans = this.plansFeatureId > 0 ? true : false;
    if(this.hasPlans) {
      this.plansTitle = this.getFeatureTitle(this.plansFeature);
    }

    features.forEach((feature) => {
      if (feature.status == 1) {
        this.companyFeatures.push({
          id: feature.feature_id,
          status: feature.status,
          feature_name: feature.name_en,
          feature_name_es: feature.name_es,
          feature_name_fr: feature.name_fr,
          feature_name_eu: feature.name_eu,
          feature_name_ca: feature.name_ca,
          feature_name_de: feature.name_de,
          feature_name_it: feature.name_it,
          description_en: "",
          description_es: "",
          description_fr: "",
          description_eu: "",
          description_ca: "",
          description_de: "",
          description_it: "",
          image: "",
        });
      }
    });
  }

  mapSubfeatures(data: any) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.hasMemberCommissions = subfeatures.some(
        (a) => a.name_en == "Commissions" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions: any) {
    this.isSuperAdmin = user_permissions?.super_admin_user ? true : false;
  }

  mapSettings(data) {
    let other_settings = data?.settings?.other_settings;
    if (other_settings?.length) {
      this.hasCustomMemberTypeExpiration = other_settings.some(
        (a) => a.title_en == "Custom member type expiration" && a.active == 1
      );
      this.hasCustomInvoice = other_settings.some(
        (a) => a.title_en == "Custom invoice" && a.active == 1
      );
      this.hasContract = other_settings.some(
        (a) => a.title_en == "Contract" && a.active == 1
      );
    }
  }

  mapPricingDetails(pricing_details) {
    this.pricingDetails = pricing_details;
    if (this.selectedId) {
      this.filteredPricingDetails = this.pricingDetails.filter((p) => {
        return p.custom_member_type_id == this.selectedId;
      });
    }
  }

  mapCustomProfileFields(custom_profile_fields) {
    this.profileFields = custom_profile_fields;
    if (this.selectedId) {
      this.filteredProfileFields = this.profileFields.filter((p) => {
        return p.custom_member_type_id == this.selectedId;
      });
    }
  }

  formatMemberTypes(member_types) {
    this.memberTypes = member_types?.map((type) => {
      if (type.require_payment == 1) {
        this.requirePayment = true;
      }
      return {
        ...type,
        title: this.getTypeTitle(type),
      };
    });
  }

  refreshTable(array) {
    this.dataSource = new MatTableDataSource(
      array.slice(
        this.pageIndex * this.pageSize,
        (this.pageIndex + 1) * this.pageSize
      )
    );
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort));
    }
    if (this.paginator) {
      new MatTableDataSource(array).paginator = this.paginator;
      if (this.pageIndex > 0) {
      } else {
        this.paginator.firstPage();
      }
    } else {
      setTimeout(() => {
        if (this.paginator) {
          new MatTableDataSource(array).paginator = this.paginator;
          if (this.pageIndex > 0) {
            this.paginator.firstPage();
          }
        }
      });
    }
  }

  getMembers() {
    this._userService.getMembersCustomRoles(this.companyId).subscribe(
      async (response) => {
        let members = response.all_members;
        if (members) {
          members.forEach((m) => {
            let match = this.members.some((a) => a.id === m.id);
            if (!match) {
              this.members.push(m);
            }
          });
        }
        this.members = this.members.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        });
      },
      (error) => {
        console.log(error);
        this.isloading = false;
      }
    );
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.memberTypes.slice(
        event.pageIndex * event.pageSize,
        (event.pageIndex + 1) * event.pageSize
      )
    );
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort));
    }
  }

  getTypeTitle(type) {
    let type_text =  this.language == "en"
      ? type.type || type.type_es
      : this.language == "fr"
      ? type.type_fr || type.type_es
      : this.language == "eu"
      ? type.type_eu || type.type_es
      : this.language == "ca"
      ? type.type_ca || type.type_es
      : this.language == "de"
      ? type.type_de || type.type_es
      : this.language == "it"
      ? type.type_it || type.type_es
      : type.type_es;

    if(type_text == 'Member' && this.companyId == 12) {
      type_text = this._translateService.instant('guests.member');
    }

    return type_text;
  }

  generateCartLink(row) {
    let params = {
      custom_member_type_id: row.id,
      company_id: this.companyId,
    };
    this._companyService.generateCartLink(params).subscribe(
      async (response) => {
        this.copyLink(response.cart_link);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  copyLink(cartLink) {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = cartLink;

    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);

    this.open(this._translateService.instant("checkout.linkgenerated"), "");
  }

  async previewMemberType(member) {
    this.type = member;
  }

  async editMemberType(item) {
    this.mode = "edit";
    this.samePrice = false;
    this.permissionsData = [];
    this.issaving = false;

    this.selectedId = item.id;
    this.memberTypeForm.controls["type_es"].setValue(item.type_es);
    this.memberTypeForm.controls["description"].setValue(item.description);
    this.showRegister = item.show_register ? true : false;
    this.requireApproval = item.require_approval ? true : false;
    this.accessAccount = item.access_account ? true : false;
    this.clubPresident = item.club_president ? true : false;
    this.manageMembers = item.manage_members ? true : false;
    this.requirePayment = item.require_payment == 1 ? true : false;
    this.activateTrialPeriod = item.trial_period == 1 ? true : false;
    this.contractDescription = item?.contract ? item?.contract?.contract : '';
    this.activeContract = item?.contract?.contract ? true : false;
    this.accessPlatformSettings = item.access_platform_settings ? true : false;
    this.accessProfile = item.access_profile ? true : false;
    this.accessMyInvitations = item.my_invitations ? true : false;
    this.inviteAllEvents = item.invite_all_events ? true : false;
    this.viewGuests = item.view_guests ? true : false;
    if (this.requirePayment) {
      if (this.memberTypeForm.controls["price"]) {
        this.memberTypeForm.controls["price"].setValue(item.price);
      }
      if (this.memberTypeForm.controls["trial_price"]) {
        this.memberTypeForm.controls["trial_price"].setValue(item.trial_price);
      }
      if (this.hasCustomInvoice) {
        if (this.memberTypeForm.controls["base_price"]) {
          this.memberTypeForm.controls["base_price"].setValue(item.base_price);
        }
        if (this.memberTypeForm.controls["trial_base_price"]) {
          this.memberTypeForm.controls["trial_base_price"].setValue(
            item.trial_base_price
          );
        }
        if (this.memberTypeForm.controls["trial_days"]) {
          this.memberTypeForm.controls["trial_days"].setValue(item.trial_days);
        }
        if (this.memberTypeForm.controls["trial_reminder_days"]) {
          this.memberTypeForm.controls["trial_reminder_days"].setValue(
            item.trial_reminder_days
          );
        }
      }
    }
    this.expire = item.expire_days > 0 ? true : false;
    if (this.memberTypeForm.controls["expire_days"]) {
      this.memberTypeForm.controls["expire_days"].setValue(
        this.expire ? item.expire_days : ""
      );
    }
    if (this.memberTypeForm.controls["expire_reminder_days"]) {
      this.memberTypeForm.controls["expire_reminder_days"].setValue(
        item.expire_reminder_days || ""
      );
    }
    this.selectedPaymentType = item.payment_type ? item.payment_type : "";

    this.taxIncludeStatus = item.tax_include ? item.tax_include : "";
    this.membersVisible = item.members_visible == 1 ? true : false;
    this.accessAccount = item.access_account ? true : false;
    this.includePlatformFee = item.platform_account ? true : false;
    if (this.includePlatformFee) {
      this.stripeAccountId = item.platform_account;
    }

    if (
      this.hasMemberCommissions &&
      item.commission_fee &&
      item.commission_fee > 0
    ) {
      this.includeCommissionFee = item.commission_fee ? true : false;
      if (this.memberTypeForm.controls["commission_fee"]) {
        this.memberTypeForm.controls["commission_fee"].setValue(
          item.commission_fee.replace(".00", "")
        );
      }
    }
    if (this.companyFeatures) {
      let permissions = this.customMemberTypePermissions?.filter((cmtp) => {
        return cmtp.custom_member_type_id == this.selectedId;
      });
      this.companyFeatures.forEach((feature) => {
        let perm = permissions.filter((p) => {
          return p.feature_id == feature.id;
        });

        this.permissionsData.push({
          id: feature.id,
          status: feature.status,
          feature_name: feature.feature_name,
          feature_name_es: feature.feature_name_es,
          feature_name_fr: feature.feature_name_fr,
          feature_name_eu: feature.feature_name_eu,
          feature_name_ca: feature.feature_name_ca,
          feature_name_de: feature.feature_name_de,
          feature_name_it: feature.feature_name_it,
          description_en: feature.description_en,
          description_es: feature.description_es,
          description_fr: feature.description_fr,
          description_eu: feature.description_eu,
          description_ca: feature.description_ca,
          description_de: feature.description_de,
          description_it: feature.description_it,
          image: feature.image,
          create: perm && perm[0] ? perm[0].create : 0,
          view: perm && perm[0] ? perm[0].view : 0,
          manage: perm && perm[0] ? perm[0].manage : 0,
          admin_attendance: perm && perm[0] ? perm[0].admin_attendance : 0,
          admin_assign: perm && perm[0] ? perm[0].admin_assign : 0,
          register_events_all: perm && perm[0] ? perm[0].register_events_all : 0,
          register_events_netcultura: perm && perm[0] ? perm[0].register_events_netcultura : 0,
          register_events_guests: perm && perm[0] ? perm[0].register_events_guests : 0,
          calendy: perm && perm[0] ? perm[0].calendy : 0,
        });
      });
    }

    if (this.profileFields) {
      this.filteredProfileFields = this.profileFields.filter((p) => {
        return p.custom_member_type_id == this.selectedId;
      });
    }

    if (this.questions) {
      this.filteredQuestions = this.questions.filter((p) => {
        return p.custom_member_type_id == this.selectedId;
      });
    }

    if (this.pricingDetails) {
      this.filteredPricingDetails = this.pricingDetails.filter((p) => {
        return p.custom_member_type_id == this.selectedId;
      });
    }

    if (this.subscriptionDetails) {
      this.filteredSubscriptionDetails = this.subscriptionDetails.filter(
        (p) => {
          return p.custom_member_type_id == this.selectedId;
        }
      );
    }

    this.acknowledgementPageURL = item.acknowledgement_page_url || "";
    this.samePrice = item?.same_price == 1 ? true : false;

    this.dialogMode = "edit";
    this.dialogTitle = this.getDialogTitle();
    this.modalbutton?.nativeElement.click();
  }

  deleteMemberType(item) {
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteMember"
    );
    this.acceptText = "OK";
    this.selectedConfirmItem = item.id;
    this.selectedConfirmMode = "delete";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    if (this.selectedConfirmItem && this.selectedConfirmMode == "delete") {
      this.open(
        this._translateService.instant("dialog.deletedsuccessfully"),
        ""
      );
      this.showConfirmationModal = false;
      this._companyService
        .deleteCustomMemberType(this.selectedConfirmItem)
        .subscribe(
          (data) => {
            this.getUpdatedCustomMemberTypes();
          },
          (err) => {
            console.log("err: ", err);
          }
        );
    }
  }

  moveUp(type, index, item) {
    let array =
      type == "member-type"
        ? this.memberTypes
        : type == "profile-fields"
        ? this.filteredProfileFields
        : [];
    if (index >= 1) {
      this.swap(array, index, index - 1);
      this.updateProfileFieldsSequence(type, array, item);
    }
  }

  moveDown(type, index, item) {
    let array = this.memberTypes;
    if (index < array.length - 1) {
      this.swap(array, index, index + 1);
      this.updateProfileFieldsSequence(type, array, item);
    }
  }

  swap(array: any[], x: any, y: any) {
    var b = array[x];
    array[x] = array[y];
    array[y] = b;
  }

  updateProfileFieldsSequence(type, array, item) {
    let params = {
      id: item.id,
      list_type: type,
      list: array,
    };
    this._companyService.editProfileFieldSequence(params).subscribe(
      (response) => {
        if (type == "member-type") {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getUpdatedCustomMemberTypes();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getUpdatedCustomMemberTypes() {
    this._userService.getCustomMemberTypes(this.companyId).subscribe(
      (response: any) => {
        this.memberTypes = response.member_types;
        if (this.memberTypes && this.memberTypes.length > 0) {
          this.memberTypes = this.memberTypes.sort((a, b) => {
            return a.sequence - b.sequence;
          });
        }
        this.allMemberTypes = this.memberTypes;
        this.formatMemberTypes(this.memberTypes);
        this.refreshTable(this.memberTypes);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  create() {
    this.resetDetailsForm();

    this.mode = "add";
    this.issaving = false;
    this.activateTrialPeriod = false;

    this.memberTypeForm.controls["type_es"].setValue("");
    this.requireApproval = false;
    this.accessAccount = false;
    this.clubPresident = false;
    this.manageMembers = false;
    this.requirePayment = false;
    this.accessPlatformSettings = false;
    this.accessProfile = false;
    this.accessMyInvitations = false;
    this.inviteAllEvents = false;
    this.viewGuests = false;
    this.selectedPaymentType = "";
    this.taxIncludeStatus = "";
    if (this.memberTypeForm.controls["price"]) {
      this.memberTypeForm.controls["price"].setValue("");
    }
    if (this.memberTypeForm.controls["base_price"]) {
      this.memberTypeForm.controls["base_price"].setValue("");
    }
    if (this.memberTypeForm.controls["commission_fee"]) {
      this.memberTypeForm.controls["commission_fee"].setValue("");
    }
    if (this.memberTypeForm.controls["trial_price"]) {
      this.memberTypeForm.controls["trial_price"].setValue("");
    }
    if (this.memberTypeForm.controls["trial_base_price"]) {
      this.memberTypeForm.controls["trial_base_price"].setValue("");
    }
    if (this.memberTypeForm.controls["trial_days"]) {
      this.memberTypeForm.controls["trial_days"].setValue("");
    }
    if (this.memberTypeForm.controls["trial_start_date"]) {
      this.memberTypeForm.controls["trial_start_date"].setValue("");
    }
    this.membersVisible = false;
    this.includePlatformFee = false;
    this.stripeAccountId = "";
    this.includeCommissionFee = false;
    this.showRegister = true;
    this.acknowledgementPageURL = "";
    this.samePrice = false;

    this.dialogMode = "add";
    this.dialogTitle = this.getDialogTitle();
    this.modalbutton?.nativeElement.click();
  }

  resetDetailsForm() {
    this.memberTypeForm.reset();
    this.membersVisible = false;
    this.requirePayment = false;
    this.expire = false;
    this.showRegister = false;
    this.requireApproval = false;
    this.manageMembers = false;
    this.acknowledgementPageURL = "";
    this.selectedPaymentType = "";
    this.selectedId = "";
    this.samePrice = false;
    this.accessPlatformSettings = false;
    this.accessProfile = false;
    this.accessMyInvitations = false;
    this.inviteAllEvents = false;
    this.viewGuests = false;
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.memberTypes = this.filterMemberTypes();
    this.formatMemberTypes(this.memberTypes);
    this.refreshTable(this.memberTypes);
  }

  filterMemberTypes() {
    let member_types = this.allMemberTypes;
    if (member_types?.length > 0 && this.searchKeyword) {
      return member_types.filter((m) => {
        let include = false;
        if (
          (m.type &&
            m.type.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >=
              0) ||
          (m.type_es &&
            m.type_es
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.type_fr &&
            m.type_fr
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.type_eu &&
            m.type_eu
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.type_ca &&
            m.type_ca
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.type_de &&
            m.type_de
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0)
        ) {
          include = true;
        }

        return include;
      });
    } else {
      return member_types;
    }
  }

  saveDialog() {
    if (this.dialogMode == "preview") {
      this.previewPage();
    }
  }

  previewPage() {
    if (this.selectedTestMember) {
      this._router.navigate([]).then((result) => {
        window.open(
          `/payment/select-plan/${this.selectedTestMember}`,
          "_blank"
        );
      });
    }
  }

  preview() {
    this.dialogMode = "preview";
    this.dialogTitle = this.getDialogTitle();
    this.modalbutton?.nativeElement.click();
  }

  getDialogTitle() {
    let title;
    if (this.dialogMode == "preview") {
      title = this._translateService.instant("dashboard.preview");
    } else if (this.dialogMode == "edit") {
      title = this._translateService.instant(
        "member-type-registration.editmembertype"
      );
    } else if (this.dialogMode == "add") {
      title = this._translateService.instant(
        "member-type-registration.createmembertype"
      );
    }
    return title;
  }

  saveDetails() {
    this.formSubmitted = true;

    if (this.memberTypeForm.get("type_es")?.errors) {
      return false;
    }

    if (this.requirePayment) {
      if (
        this.memberTypeForm.get("price")?.errors ||
        !this.memberTypeForm.get("price")?.value ||
        !this.selectedPaymentType ||
        !this.taxIncludeStatus
      ) {
        return false;
      }

      if (this.activateTrialPeriod) {
        if (
          this.memberTypeForm.get("trial_price")?.errors ||
          !this.memberTypeForm.get("trial_price")?.value ||
          this.memberTypeForm.get("trial_days")?.errors ||
          !this.memberTypeForm.get("trial_days")?.value
        ) {
          return false;
        }
      }
    }

    if (this.hasMemberCommissions && this.includeCommissionFee) {
      if (
        this.memberTypeForm.get("commission_fee")?.errors ||
        !this.memberTypeForm.get("commission_fee")?.value
      ) {
        return false;
      }
    }

    if (this.expire) {
      if (
        this.memberTypeForm.get("expire_days")?.errors ||
        !this.memberTypeForm.get("expire_days")?.value
      ) {
        return false;
      }
    }

    if (this.includePlatformFee) {
      if (!this.stripeAccountId) {
        return false;
      }
    }

    this.issaving = true;
    let price = this.memberTypeForm.get("price")?.value
      ? this.memberTypeForm.get("price")?.value
      : 0;
    if (this.requirePayment) {
      if (price.indexOf("€")) {
        price = price.replace("€", "");
        price = price.trim();
      }
    }

    let base_price;
    if (this.hasCustomInvoice) {
      base_price = this.memberTypeForm.get("base_price")?.value
        ? this.memberTypeForm.get("base_price")?.value
        : 0;
      if (this.requirePayment) {
        if (base_price.indexOf("€")) {
          base_price = base_price.replace("€", "");
          base_price = base_price.trim();
        }
      }
    }

    let trial_price;
    let trial_base_price;
    if (this.activateTrialPeriod) {
      trial_price = this.memberTypeForm.get("trial_price")?.value
        ? this.memberTypeForm.get("trial_price")?.value
        : 0;
      if (this.requirePayment) {
        if (trial_price.indexOf("€")) {
          trial_price = trial_price.replace("€", "");
          trial_price = trial_price.trim();
        }
      }

      if (this.hasCustomInvoice) {
        trial_base_price = this.memberTypeForm.get("trial_base_price")?.value
          ? this.memberTypeForm.get("trial_base_price")?.value
          : 0;
        if (this.requirePayment) {
          if (trial_base_price.indexOf("€")) {
            trial_base_price = trial_base_price.replace("€", "");
            trial_base_price = trial_base_price.trim();
          }
        }
      }
    }

    let commission_fee;
    if (this.includeCommissionFee) {
      commission_fee = this.memberTypeForm.get("commission_fee")?.value
        ? this.memberTypeForm.get("commission_fee")?.value
        : 0;
      if (commission_fee && commission_fee.indexOf("€")) {
        commission_fee = commission_fee.replace("€", "");
        commission_fee = commission_fee.trim();
      }
    }

    let trial_start_date = "";
    if (this.memberTypeForm.get("trial_start_date")?.value) {
      trial_start_date =
        this.memberTypeForm.get("trial_start_date")?.value.year +
        "-" +
        (this.memberTypeForm.get("trial_start_date")?.value.month > 10
          ? ""
          : "0") +
        this.memberTypeForm.get("trial_start_date")?.value.month +
        "-" +
        (this.memberTypeForm.get("trial_start_date")?.value.day > 10
          ? ""
          : "0") +
        this.memberTypeForm.get("trial_start_date")?.value.day;
    }

    if (this.mode == "add") {
      let params = {
        type: this.memberTypeForm.get("type_es")?.value,
        type_es: this.memberTypeForm.get("type_es")?.value,
        price: this.requirePayment ? price : null,
        base_price:
          this.requirePayment && this.hasCustomInvoice ? base_price : null,
        payment_type: this.requirePayment ? this.selectedPaymentType : null,
        tax_include: this.requirePayment ? this.taxIncludeStatus : null,
        require_payment: this.requirePayment ? this.requirePayment : 0,
        members_visible: this.membersVisible ? this.membersVisible : 0,
        company_id: this.companyId,
        created_by: this.userId,
        expire_days: this.expire
          ? this.memberTypeForm.get("expire_days")?.value
          : 0,
        expire_reminder_days: this.memberTypeForm.controls[
          "expire_reminder_days"
        ]
          ? this.memberTypeForm.get("expire_reminder_days")?.value
          : 0,
        platform_account:
          this.includePlatformFee && this.stripeAccountId
            ? this.stripeAccountId
            : "",
        commission_fee: this.includeCommissionFee ? commission_fee : 0,
        show_register: this.showRegister ? this.showRegister : 0,
        require_approval: this.requireApproval ? this.requireApproval : 0,
        access_account: this.accessAccount ? this.accessAccount : 0,
        club_president: this.clubPresident ? this.clubPresident : 0,
        manage_members: this.manageMembers ? this.manageMembers : 0,
        description: this.memberTypeForm.get("description")?.value,
        trial_period: this.activateTrialPeriod ? this.activateTrialPeriod : 0,
        trial_price: this.activateTrialPeriod ? trial_price : null,
        trial_base_price:
          this.activateTrialPeriod && this.hasCustomInvoice
            ? trial_base_price
            : null,
        trial_days: this.activateTrialPeriod
          ? this.memberTypeForm.get("trial_days")?.value
          : 0,
        trial_start_date: this.activateTrialPeriod ? trial_start_date : null,
        acknowledgement_page_url: this.acknowledgementPageURL || "",
        same_price: this.samePrice || 0,
        access_platform_settings: this.accessPlatformSettings || 0,
        access_profile: this.accessProfile || 0,
        my_invitations: this.accessMyInvitations || 0,
        invite_all_events: this.inviteAllEvents || 0,
        view_guests: this.viewGuests || 0,
      };
      this._companyService.addCustomMemberType(params).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.issaving = false;
          this.getUpdatedCustomMemberTypes();
          this.closemodalbutton?.nativeElement.click();
        },
        (err) => {
          this.issaving = false;
          console.log("err: ", err);
        }
      );
    } else if (this.mode == "edit") {
      let params = {
        type: this.memberTypeForm.get("type_es")?.value,
        type_es: this.memberTypeForm.get("type_es")?.value,
        price: this.requirePayment ? price : null,
        base_price:
          this.requirePayment && this.hasCustomInvoice ? base_price : null,
        payment_type: this.requirePayment ? this.selectedPaymentType : null,
        tax_include: this.requirePayment ? this.taxIncludeStatus : null,
        require_payment: this.requirePayment ? this.requirePayment : 0,
        members_visible: this.membersVisible ? this.membersVisible : 0,
        company_id: this.companyId,
        expire_days: this.expire
          ? this.memberTypeForm.get("expire_days")?.value
          : 0,
        expire_reminder_days: this.memberTypeForm.controls[
          "expire_reminder_days"
        ]
          ? this.memberTypeForm.get("expire_reminder_days")?.value
          : 0,
        platform_account:
          this.includePlatformFee && this.stripeAccountId
            ? this.stripeAccountId
            : "",
        commission_fee: this.includeCommissionFee ? commission_fee : 0,
        show_register: this.showRegister ? this.showRegister : 0,
        require_approval: this.requireApproval ? this.requireApproval : 0,
        access_account: this.accessAccount ? this.accessAccount : 0,
        club_president: this.clubPresident ? this.clubPresident : 0,
        manage_members: this.manageMembers ? this.manageMembers : 0,
        description: this.memberTypeForm.get("description")?.value,
        trial_period: this.activateTrialPeriod ? this.activateTrialPeriod : 0,
        trial_price: this.activateTrialPeriod ? trial_price : null,
        trial_base_price: this.activateTrialPeriod ? trial_base_price : null,
        trial_days: this.activateTrialPeriod
          ? this.memberTypeForm.get("trial_days")?.value
          : 0,
        trial_start_date: this.activateTrialPeriod ? trial_start_date : null,
        trial_reminder_days: this.activateTrialPeriod
          ? this.memberTypeForm.get("trial_reminder_days")?.value
          : null,
        acknowledgement_page_url: this.acknowledgementPageURL || "",
        same_price: this.samePrice || 0,
        access_platform_settings: this.accessPlatformSettings || 0,
        access_profile: this.accessProfile || 0,
        my_invitations: this.accessMyInvitations || 0,
        invite_all_events: this.inviteAllEvents || 0,
        view_guests: this.viewGuests || 0,
      };
      this._companyService
        .editCustomMemberType(this.selectedId, params)
        .subscribe(
          (data) => {
            this.formSubmitted = false;
            this.issaving = false;
            this.getUpdatedCustomMemberTypes();
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
          },
          (err) => {
            this.issaving = false;
            console.log("err: ", err);
          }
        );
    }
  }

  changeTab(event) {
    this.tabSelected = true;
  }

  savePermissions() {
    let params = {
      custom_member_type_id: this.selectedId ? this.selectedId : 0,
      permissions: this.permissionsData,
      company_id: this.companyId,
      created_by: this.userId,
      tutor_access_level: this.selectedTutorAccess
        ? this.selectedTutorAccess
        : 0,
    };

    this._companyService.manageCustomMemberTypePermissions(params).subscribe(
      (data) => {
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
        this.fetchManageMemberTypesData();
      },
      (err) => {
        console.log("err: ", err);
      }
    );
  }

  handleChangeLanguageFilter(event) {
    this.selectedLanguage = "";
    this.selectedLanguage = event;
    // this.selectedLanguageChanged = true;
  }

  calculatePriceWithTax() {
    if (
      this.memberTypeForm.controls["base_price"] &&
      this.memberTypeForm.controls["price"] &&
      this.hasCustomInvoice
    ) {
      let base_price;
      base_price = this.memberTypeForm.get("base_price")?.value
        ? this.memberTypeForm.get("base_price")?.value
        : 0;
      if (base_price && base_price.indexOf("€")) {
        base_price = base_price.replace("€", "");
        base_price = base_price.trim();
      }

      if (parseFloat(base_price)) {
        let price_with_vat = parseFloat(
          (
            (parseFloat(base_price) || 0) +
            (parseFloat(base_price) || 0) * 0.21
          ).toString()
        ).toFixed(2);
        this.memberTypeForm.controls["price"].setValue(price_with_vat);
      } else {
        this.memberTypeForm.controls["price"].setValue("");
      }
    }
  }

  calculateTrialPriceWithTax() {
    if (
      this.memberTypeForm.controls["trial_base_price"] &&
      this.memberTypeForm.controls["trial_price"] &&
      this.hasCustomInvoice
    ) {
      let base_price;
      base_price = this.memberTypeForm.get("trial_base_price")?.value
        ? this.memberTypeForm.get("trial_base_price")?.value
        : 0;
      if (base_price && base_price.indexOf("€")) {
        base_price = base_price.replace("€", "");
        base_price = base_price.trim();
      }

      if (parseFloat(base_price)) {
        let price_with_vat = parseFloat(
          (
            (parseFloat(base_price) || 0) +
            (parseFloat(base_price) || 0) * 0.21
          ).toString()
        ).toFixed(2);
        this.memberTypeForm.controls["trial_price"].setValue(price_with_vat);
      } else {
        this.memberTypeForm.controls["trial_price"].setValue("");
      }
    }
  }

  handleFieldChange(event) {
    if (event.target.value) {
      if (this.allProfileFields) {
        let profile_field = this.allProfileFields.filter((p) => {
          return p.field == event.target.value;
        });
        if (profile_field && profile_field[0]) {
          this.selectedFieldType = profile_field[0].field_type;
          let field = profile_field[0]
          this.fieldDesc = profile_field[0]
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
      }
    } else {
      this.selectedFieldType = "";
    }
  }

  addExistingField() {
    this.fieldMode = "add";
    this.fieldFormSubmitted = false;
    this.showFieldDetails = true;
  }

  addField() {
    this.fieldFormSubmitted = true;

    if (!this.selectedField || !this.selectedFieldType || !this.fieldDesc) {
      return false;
    }

    let profile_field_id;
    if (this.selectedField) {
      if (this.allProfileFields) {
        let profile_field = this.allProfileFields.filter((p) => {
          return p.field == this.selectedField;
        });
        if (profile_field && profile_field[0]) {
          profile_field_id = profile_field[0].id;
        }
      }
    }

    let params = {
      custom_member_type_id: this.selectedId,
      company_id: this.companyId,
      field: this.selectedField,
      profile_field_id: profile_field_id,
      field_type: this.selectedFieldType,
      field_display_es: this.fieldDesc,
      field_display_en: this.fieldDesc,
      required: this.requiredField ? 1 : 0,
    };
    this._companyService.addMemberTypeCustomProfileFields(params).subscribe(
      (response) => {
        if (response) {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getUpdatedCustomProfileFields();
          this.selectedFieldId = "";
          this.selectedField = "";
          this.fieldDesc = "";
          this.requiredField = false;
          this.fieldMode = "";
          this.showFieldDetails = false;
          this.fieldFormSubmitted = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  editProfileField(item) {
    this.fieldMode = "edit";
    this.selectedFieldId = item.id;
    this.selectedField = item.field;
    this.selectedFieldType = item.field_type;
    this.fieldDesc =
      this.language == "en" ? item.field_display_en : item.field_display_es;
    this.requiredField = item.required;
    this.showFieldDetails = true;
    this.fieldFormSubmitted = false;
  }

  updateField() {
    this.fieldFormSubmitted = true;

    if (!this.selectedField || !this.selectedFieldType || !this.fieldDesc) {
      return false;
    }

    let profile_field_id;
    if (this.selectedField) {
      if (this.allProfileFields) {
        let profile_field = this.allProfileFields.filter((p) => {
          return p.field == this.selectedField;
        });
        if (profile_field && profile_field[0]) {
          profile_field_id = profile_field[0].id;
        }
      }
    }

    let params = {
      custom_member_type_id: this.selectedId,
      id: this.selectedFieldId,
      field: this.selectedField,
      profile_field_id: profile_field_id,
      field_type: this.selectedFieldType,
      field_display_es: this.fieldDesc,
      field_display_en: this.fieldDesc,
      required: this.requiredField ? 1 : 0,
    };
    this._companyService.updateMemberTypeCustomProfileFields(params).subscribe(
      (response) => {
        if (response) {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getUpdatedCustomProfileFields();
          this.selectedFieldId = "";
          this.selectedField = "";
          this.fieldDesc = "";
          this.requiredField = false;
          this.fieldMode = "";
          this.showFieldDetails = false;
          this.fieldFormSubmitted = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getUpdatedCustomProfileFields() {
    this._companyService.getCustomProfileFields(this.companyId).subscribe(
      (response: any) => {
        this.profileFields = response.profile_fields;
        if (this.selectedId) {
          this.filteredProfileFields = this.profileFields.filter((p) => {
            return p.custom_member_type_id == this.selectedId;
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  deleteProfileField(item) {
    if (item.id) {
      let params = {
        id: item.id,
      };
      this._companyService
        .deleteMemberTypeCustomProfileFields(params)
        .subscribe(
          (response) => {
            if (response) {
              this.open(
                this._translateService.instant("dialog.deletedsuccessfully"),
                ""
              );
              this.getUpdatedCustomProfileFields();
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  cancelShowField() {
    this.fieldMode = "";
    this.fieldFormSubmitted = false;
    this.showFieldDetails = false;
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

  saveContract() {
    let params = {
      company_id: this.companyId,
      custom_member_type_id: this.selectedId,
      contract: this.contractDescription,
      accept_conditions: this.activeContract ? 1 : 0,
    };
    this._companyService
      .updateConditions(params)
      .subscribe(
        (response) => {
          if (response) {
            this.fetchManageMemberTypesData();
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getFeatureTitle(feature) {
    return feature
      ? this.language == "en"
        ? (feature.feature_name || feature.name_en) ||
          (feature.feature_name_es || feature.name_es)
        : this.language == "fr"
        ? (feature.feature_name_fr || feature.name_fr) ||
          (feature.feature_name_es || feature.name_es)
        : this.language == "eu"
        ? (feature.feature_name_eu || feature.name_eu) ||
          (feature.feature_name_es || feature.name_es)
        : this.language == "ca"
        ? (feature.feature_name_ca || feature.name_ca) ||
          (feature.feature_name_es || feature.name_es)
        : this.language == "de"
        ? (feature.feature_name_de || feature.name_de) ||
          (feature.feature_name_es || feature.name_es)
        : this.language == "it"
        ? (feature.feature_name_it || feature.name_it) ||
          (feature.feature_name_es || feature.name_es)
        : (feature.feature_name_es || feature.name_es)
      : "";
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

  getFieldTypeText(type) {
    return type
    ? this.language == "en"
      ? type.type_en ||
        type.type_es
      : this.language == "fr"
      ? type.type_fr ||
        type.type_es
      : this.language == "eu"
      ? type.type_eu ||
        type.type_es
      : this.language == "ca"
      ? type.type_ca ||
        type.type_es
      : this.language == "de"
      ? type.type_de ||
        type.type_es
      : this.language == "it"
      ? type.type_it ||
        type.type_es
      : type.type_es
    : "";
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}