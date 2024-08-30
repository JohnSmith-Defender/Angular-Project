import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "@env/environment";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent } from "@share/components";
import { CompanyService, LocalService, UserService } from "@share/services";
import { MenuService } from "@lib/services";
import { SearchComponent } from "@share/components/search/search.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatOptionModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { initFlowbite } from "flowbite";
import { Subject, takeUntil } from "rxjs";
import { ClubsService, PlansService, TutorsService, BuddyService, JobOffersService, ProfessionalsService } from "@features/services";
import get from "lodash/get";
@Component({
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    SearchComponent,
  ],
  templateUrl: "./feature.component.html",
})
export class FeatureComponent {
  private destroy$ = new Subject<void>();

  @Input() id?: any;

  level1Title: any;
  level2Title: any;
  level3Title: any;
  level4Title: any;
  buttonColor: any;
  companyId: any;
  companyDomain: any;
  primaryColor: any;
  companies: any;
  userId: any;
  language: any;
  featureTitle: any;
  isInitialLoad: boolean = false;
  languageChangeSubscription;
  termsAndConditions: any;
  featuredTextValue: any;
  featuredTextValueEn: any;
  featuredTextValueFr: any;
  featuredTextValueEu: any;
  featuredTextValueCa: any;
  featuredTextValueDe: any;
  types: any = [];
  dropdownSettings: any;
  languages: any = [];
  isSpanishEnabled: boolean = false;
  isFrenchEnabled: boolean = false;
  isEnglishEnabled: boolean = false;
  isBasqueEnabled: boolean = false;
  isCatalanEnabled: boolean = false;
  isGermanEnabled: boolean = false;
  isItalianEnabled: boolean = false;
  featureNameEn: any;
  featureNameEs: any;
  featureNameFr: any;
  featureNameEu: any;
  featureNameCa: any;
  featureNameDe: any;
  featureNameIt: any;
  isEmploymentChannelFeature: boolean = false;
  jobOffersLists: any[] = [];
  allProfileFields: any[] = [];
  allProfileFieldMapping: any = [];
  hasSectorField: boolean = false;
  profileFields: any = [];
  selectedFields: any = [];
  memberLists: any = [];
  allCompanySubfeatures: any = [];
  companySubfeatures: any = [];
  subfeatureOptions: any = [];
  featureSubfeatures: any = [];
  searchText: any = "";
  placeholderText: any = "";
  search: string = "";
  isloading: boolean = false;
  actionButtons: any = [];
  dataSource: any;
  displayedColumns = ["image", "name", "description", "action"];
  pageSize: number = 25;
  pageIndex: number = 0;
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  @ViewChild("settingmodalbutton", { static: false }) settingmodalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closesettingmodalbutton", { static: false }) closesettingmodalbutton:
    | ElementRef
    | undefined;
  popupTitle: any;
  selectedFeatureId: any;
  selectedSetting: any;
  selectedSettingTitle: any;

  bookingcommissionperhour: any;
  showTutorBookingsCommissionPerHourModal: boolean = false;
  bookingcommissionpercentage: any;
  showTutorBookingsCommissionModal: boolean = false;
  showFeaturedTextModal: boolean = false;
  showGuestRegistrationFieldsModal: boolean = false;
  allRegistrationFields: any;
  filteredProfileFields: any;
  fieldMode: any;
  fieldFormSubmitted: boolean = false;
  showFieldDetails: boolean = false;
  selectedField: any = '';
  fieldDesc: any;
  requiredField: any;
  selectedFieldId: any;
  userRoles: any;
  memberTypes: any;
  showApproveClubActivitiesModal: boolean = false;
  selectedUserRoles: any = [];
  showFilterModal: boolean = false;
  selectedFilter: any = '';
  featuredTextValueIt: any;

  filterSettings: any = [];
  categoryStatus: boolean = false;
  ageGroupFilterActive: boolean = false;
  groupFilterActive: boolean = false;
  hasClubsFeature: boolean = false;
  clubTitle: any = '';
  offerHideDays: any;
  hideOffersDays: any;
  showHideOffersModal: boolean = false;

  showMenteeLimitModal: boolean = false;
  limitMessage: any
  createMenteeLimit: any;
  menteeLimitSettings: any = [];
  professionalSettings: any;
  minimumBalance: any;
  showMinimumBalanceModal: boolean = false;
  paymentMethods: any;
  showPaymentMethodsModal: boolean = false;
  tabIndex = 0;
  tabSelected: boolean= false;
  activeStripe: boolean = false;
  activePayPal: boolean = false;
  paypalClientID: any;
  paypalSecret: any;
  stripePublicKey: any;
  stripeSecretKey: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService,
    private _plansService: PlansService,
    private _clubsService: ClubsService,
    private _buddyService: BuddyService,
    private _userService: UserService,
    private _menuService: MenuService,
    private _jobOfferService: JobOffersService,
    private _professionalsService: ProfessionalsService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.language = this._localService.getLocalStorage(environment.lslang);
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
      this.companyId = company[0].id;
      this.companyDomain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.termsAndConditions = company[0].job_terms_and_conditions;
      this.featuredTextValue = company[0].featured_text;
      this.featuredTextValueEn = company[0].featured_text_en;
      this.featuredTextValueFr = company[0].featured_text_fr;
      this.featuredTextValueEu = company[0].featured_text_eu;
      this.featuredTextValueCa = company[0].featured_text_ca;
      this.featuredTextValueDe = company[0].featured_text_de;
      this.featuredTextValueIt = company[0].featured_text_it;
    }

    this.initializeFeature();

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.rerenderList();
        }
      );
  }

  rerenderList() {
    if (!this.isInitialLoad) {
      this.initializeFeature();
    }
  }

  initializeFeature() {
    let companyFeatures = this._localService.getLocalStorage(environment.lsfeatures)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (companyFeatures?.length > 0) {
      this.mapFeatures(companyFeatures);
      let feature_row = companyFeatures.filter((f) => {
        return f.id == this.id;
      });

      let feature = feature_row?.length > 0 ? feature_row[0] : {};
      this.featureTitle = feature
        ? this.language == "en"
          ? feature.name_en
            ? feature.name_en
            : feature.feature_name
          : this.language == "fr"
          ? feature.name_fr
            ? feature.name_fr
            : feature.feature_name
          : feature.name_es
          ? feature.name_es
          : feature.feature_name_ES
        : "";
      this.featureNameEn = feature ? feature.name_en : "";
      this.featureNameEs = feature ? feature.name_es : "";
      this.featureNameFr = feature ? feature.name_fr : "";
      this.featureNameEu = feature ? feature.name_eu || feature.name_es : "";
      this.featureNameCa = feature ? feature.name_ca || feature.name_es : "";
      this.featureNameDe = feature ? feature.name_de || feature.name_es : "";
      this.featureNameIt = feature ? feature.name_it || feature.name_es : "";
      this.isEmploymentChannelFeature = this.featureNameEn == "Employment Channel" || feature.feature_id == 18 ? true : false;
      if (this.isEmploymentChannelFeature) {
        this.loadLists();
      }

      if (feature.feature_id == 15) {
        this.checkHasSector();
      }
      this.getSubfeatures();
    }
    this.initializeFilterSettings(this.id);
    this.initializeLanguage();
    this.initializeActionButtons();
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.initializePage();
  }

  initializeFilterSettings(id) {
    this._companyService
      .getModuleFilterSettings(this.companyId, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.filterSettings = response.filter_settings;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializeLanguage() {
    this._companyService
      .getLanguages(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let languages = response.languages;
          this.languages = languages
            ? languages.filter((lang) => {
                return lang.status == 1;
              })
            : [];

          if (this.languages) {
            let spanish = this.languages.filter((lang) => {
              return lang.code == "es" && lang.status == 1;
            });
            this.isSpanishEnabled = spanish && spanish[0] ? true : false;

            let french = this.languages.filter((lang) => {
              return lang.code == "fr" && lang.status == 1;
            });
            this.isFrenchEnabled = french && french[0] ? true : false;

            let english = this.languages.filter((lang) => {
              return lang.code == "en" && lang.status == 1;
            });
            this.isEnglishEnabled = english && english[0] ? true : false;

            let basque = this.languages.filter((lang) => {
              return lang.code == "eu" && lang.status == 1;
            });
            this.isBasqueEnabled = basque && basque[0] ? true : false;

            let catalan = this.languages.filter((lang) => {
              return lang.code == "ca" && lang.status == 1;
            });
            this.isCatalanEnabled = catalan && catalan[0] ? true : false;

            let german = this.languages.filter((lang) => {
              return lang.code == "de" && lang.status == 1;
            });
            this.isGermanEnabled = german && german[0] ? true : false;

            let italian = this.languages.filter((lang) => {
              return lang.code == "it" && lang.status == 1;
            });
            this.isItalianEnabled = italian && italian[0] ? true : false;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializeActionButtons() {
    this.actionButtons = [
      { id: 1, name_en: "Categories" },
      { id: 2, name_en: "Hide offers" },
      { id: 3, name_en: "Category access" },
      { id: 4, name_en: "Service subscription via Stripe" },
      { id: 5, name_en: "Contact details" },
      { id: 6, name_en: "Custom landing page for event registration" },
      { id: 7, name_en: "Email invite" },
      { id: 8, name_en: "Type of activity" },
      { id: 9, name_en: "Keap integration" },
      { id: 10, name_en: "Commissions" },
      { id: 11, name_en: "View more" },
      { id: 12, name_en: "Leads/References list" },
      { id: 14, name_en: "Subgroups" },
      { id: 15, name_en: "Created activities authorization" },
      { id: 16, name_en: "Featured" },
      { id: 17, name_en: "Hotmart integration" },
      { id: 18, name_en: "Course-specific wall access" },
      { id: 19, name_en: "Recurring" },
      { id: 20, name_en: "Order" },
      { id: 21, name_en: "Guest registration fields" },
      { id: 22, name_en: "Tutor types" },
      { id: 23, name_en: "Tutor percentage for bookings" },
      { id: 24, name_en: "Per hour commission" },
      { id: 25, name_en: "Student hours" },
      { id: 26, name_en: "Credit Packages" },
      { id: 27, name_en: "Tutor profile" },
      { id: 28, name_en: "Blog layout" },
      { id: 29, name_en: "Vimeo" },
      { id: 30, name_en: "Candidates display" },
      { id: 31, name_en: "Tags" },
      { id: 32, name_en: "Filter" },
      { id: 33, name_en: "Categories filter" },
      { id: 34, name_en: "Age group filter" },
      { id: 35, name_en: "Members filter" },
      { id: 36, name_en: "Tutors filter" },
      { id: 37, name_en: "Testimonials filter" },
      { id: 38, name_en: "Buddies filter" },
      { id: 39, name_en: "Mentee Limit" },
      { id: 40, name_en: "Minimum balance" },
      { id: 41, name_en: "Payment methods" },
    ];
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.personalization"
    );
    this.level3Title = this._translateService.instant(
      "company-settings.modules"
    );
    this.level4Title = this.featureTitle;
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  initializePage() {
    this.types = [
      {
        id: 1,
        type_en: "Open",
        type_es: "Abierto",
        type_fr: "Ouvert",
        type: "Open",
      },
      {
        id: 2,
        type_en: "Yes/No",
        type_es: "Sí/No",
        type_fr: "Oui Non",
        type: "Yes/No",
      },
    ];

    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: this.language == "en" ? "name_EN" : "name_ES",
      limitSelection: 4,
      itemsShowLimit: 4,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };

    this.isInitialLoad = false;
  }

  getSubfeatureName(row) {
    return this.language == "en"
      ? row.name_en
      : this.language == "fr"
      ? row.name_fr
      : this.language == "eu"
      ? row.name_eu
      : this.language == "ca"
      ? row.name_ca
      : this.language == "de"
      ? row.name_de
      : this.language == "it"
      ? row.name_it
      : row.name_es;
  }

  getSubfeatureDescription(row) {
    return this.language == "en"
      ? row.description_en
      : this.language == "fr"
      ? row.description_fr
      : this.language == "eu"
      ? row.description_eu
      : this.language == "ca"
      ? row.description_ca
      : this.language == "de"
      ? row.description_de
      : this.language == "it"
      ? row.description_it
      : row.description_es;
  }

  performAction(row) {
    switch (row.name_en) {
      case "Categories":
      case "Category access":
      case "Contact details":
        this.goToAdminList(row);
        break;
      case "Hide offers":
      case "View more":
      case "Subgroups":
      case "Created activities authorization":
      case "Featured":
      case "Hotmart integration":
      case "Course-specific wall access":
      case "Recurring":
      case "Order":
      case "Guest registration fields":
      case "Tutor percentage for bookings":
      case "Per hour commission":
      case "Tutor profile":
      case "Vimeo":
      case "Filter":
      case "Categories filter":
      case "Members filter":
      case "Tutors filter":
      case "Testimonials filter":
      case "Buddies filter":
      case "Mentee Limit":
      case "Minimum balance":
      case "Payment methods":
      case "Candidates display":
        this.openSettingModal(row);
        break;
      case "Custom landing page for event registration":
        this.managePlanRegistrationLanding();
        break;
      case "Email invite":
        this.manageInviteQuestions();
        break;
      case "Type of activity":
        this.manageTypeOfActivities();
        break;
      case "Keap integration":
        this.manageKeap();
        break;
      case "Commissions":
        this.showCommissionsSettings();
        break;
      case "Tutor types":
        this.goToTutorTypes(row);
        break;
      case "Student hours":
        this.openStudentHours(row);
        break;
      case "Credit Packages":
        this.openCreditPackages(row);
        break;
      case "Tags":
        this.goToTestimonialTags(row);
        break;
      case "Age group filter":
        this.goToAgeGroups(row);
        break;
    }
  }

  goToAgeGroups(row) {
    this._router.navigate(["/settings/age-groups"]);
  }

  openSettingModal(row) {
    this.resetModals();

    this.popupTitle =
      this.language == "en"
        ? row.description_en
        : this.language == "fr"
        ? row.description_fr
        : row.description_es;
    this.selectedFeatureId = row.feature_id;

    switch (row?.name_en) {
      case "Hide offers":
        this.getOfferHideDays();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Created activities authorization":
        this.resetModals();
        this.manageApproveClubActivities();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Featured":
        this.resetModals();
        this.getSettingTitle(row);
        this.openFeaturedTextModal(row);
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Hotmart integration":
        this.getSettingTitle(row);
        this.getHotmartSettings();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Course-specific wall access":
        this.getSettingTitle(row);
        this.manageApproveClubActivities("course");
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Guest registration fields":
        this.resetModals();
        this.getGuestRegistrationFields();
        this.getAllRegistrationFields();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Tutor percentage for bookings":
        this.resetModals();
        this.getSettingTitle(row);
        this.getTutorBookingCommissionPercentage();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Per hour commission":
        this.resetModals();
        this.getSettingTitle(row);
        this.getTutorBookingCommissionPerHour();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Tutor profile":
        this.getSettingTitle(row);
        this.manageApproveClubActivities("tutor");
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Vimeo":
        this.getSettingTitle(row);
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Candidates display":
        this.getCandidatesDisplay();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Mentee Limit":
        this.getMenteeLimitSettings();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Minimum balance":
        this.getMinimumBalance();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Payment methods":
        this.getPaymentMethods();
        this.settingmodalbutton?.nativeElement.click();
        break;
      case "Filter":
      case "Members filter":
      case "Tutors filter":
      case "Testimonials filter":
      case "Buddies filter":
      case "Categories filter":
        this.getSettingTitle(row);
        this.updateFilter();
        this.settingmodalbutton?.nativeElement.click();
        break;
    }
  }

  resetModals() {
    this.showTutorBookingsCommissionModal = false;
    this.showTutorBookingsCommissionPerHourModal = false;
    this.showFeaturedTextModal = false;
    this.showGuestRegistrationFieldsModal = false;
    this.showApproveClubActivitiesModal = false;
    this.showTutorBookingsCommissionPerHourModal = false;
    this.showTutorBookingsCommissionModal = false;
    this.showFeaturedTextModal = false;
    this.showGuestRegistrationFieldsModal = false;
    this.showApproveClubActivitiesModal = false;
    this.showFilterModal = false;
    this.showHideOffersModal = false;
    this.menteeLimitSettings = false;
    this.showMinimumBalanceModal = false;
    this.showPaymentMethodsModal = false;
  }

  goToAdminList(row) {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
    let row_name = row?.name_en;
    if(row?.name_en == "Category access") {
      row_name = 'categories';
    }
    this._router.navigate([
      `/settings/list/${row.feature_id}/${row_name
        ?.toLowerCase()
        .replace(" ", "")}`,
    ]);
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.searchSettings(event);
  }

  searchSettings(event) {
    this.companySubfeatures = this.allCompanySubfeatures;
    if (event && this.companySubfeatures?.length > 0) {
      let company_subfeatures = this.companySubfeatures?.filter((feature) => {
        let include = false;

        let name = this.getSubfeatureName(feature);
        let description = this.getSubfeatureDescription(feature);

        if (
          (name && name?.toLowerCase().indexOf(event?.toLowerCase()) >= 0) ||
          (description &&
            description?.toLowerCase().indexOf(event?.toLowerCase()) >= 0)
        ) {
          include = true;
        }

        return include;
      });
      this.companySubfeatures = company_subfeatures;
    }
    setTimeout(() => {
      this.refreshDataSource(this.companySubfeatures);
    }, 500);
  }

  loadLists() {
    this.jobOffersLists = [
      {
        id: 1,
        display_es: "Ofertas de trabajo",
        display_en: "Job Offers",
        display_fr: "Offres d'emplois",
        display_eu: "Lan eskaintzak",
        display_ca: "Ofertes de treball",
        display_de: "Arbeitsangebote",
        description_es: "Agregar, editar o eliminar ofertas de trabajo",
        description_en: "Add, edit or delete job offers",
        description_fr: "Ajouter, modifier ou supprimer des offres d'emploi",
        description_eu: "Gehitu, editatu edo ezabatu lan-eskaintzak",
        description_ca: "Afegir, editar o eliminar ofertes de feina",
        description_de: "Stellenangebote hinzufügen, bearbeiten oder löschen",
        value: "joboffers",
      },
      {
        id: 5,
        display_es: "Tipos de trabajo",
        display_en: "Work Types",
        display_fr: "Types de travail",
        display_eu: "Types de travail",
        display_ca: "Tipus de treball",
        display_de: "Arten von Arbeit",
        description_es: "Agregar, editar o eliminar tipos de trabajo",
        description_en: "Add, edit or delete work types",
        description_fr: "Ajouter, modifier ou supprimer des types de travail",
        description_eu: "Gehitu, editatu edo ezabatu lan motak",
        description_ca: "Afegir, editar o eliminar tipus de treball",
        description_de: "Jobtypen hinzufügen, bearbeiten oder löschen",
        value: "types",
      },
      {
        id: 7,
        display_es: "Áreas",
        display_en: "Areas",
        display_fr: "Zones",
        display_eu: "Eremuak",
        display_ca: "Àrees",
        display_de: "Bereiche",
        description_es: "Agregar, editar o eliminar áreas",
        description_en: "Add, edit or delete areas",
        description_fr: "Ajouter, modifier ou supprimer des zones",
        description_eu: "Gehitu, editatu edo ezabatu eremuak",
        description_ca: "Afegir, editar o eliminar àrees",
        description_de: "Bereiche hinzufügen, bearbeiten oder löschen",
        value: "areas",
      },
    ];
  }

  goToList(item) {
    if (item.value == "joboffers") {
      this._localService.setLocalStorage(environment.lssettings, "JobOffers");
      this._router.navigate([`/settings/job-offers`]);
    } else if (item.value == "sectors") {
      this._localService.setLocalStorage(environment.lssettings, "Members");
      this._router.navigate([`/members/list/${item.value}`]);
    } else {
      this._router.navigate([`/employmentchannel/list/${item.value}`]);
    }
  }

  checkHasSector() {
    this.getProfileFields();
  }

  getProfileFields() {
    this._userService
      .getProfileFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          let allProfileFields = response.profile_fields;
          this.allProfileFields =
            allProfileFields &&
            allProfileFields.filter((f) => {
              return f.field_type != "image";
            });

          this.getProfileFieldMapping();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getProfileFieldMapping() {
    this._userService
      .getProfileFieldMapping(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
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
                let field_desc_en = reg_field[0].field_desc_en;
                if (field.field_desc_en && field.field_desc_en != null) {
                  field_desc_en = field.field_desc_en;
                }
                let field_desc_es = reg_field[0].field_desc_es;
                if (field.field_desc_es && field.field_desc_es != null) {
                  field_desc_es = field.field_desc_es;
                }

                fld = {
                  id: reg_field[0].id,
                  field: reg_field[0].field,
                  field_type: reg_field[0].field_type,
                  field_display_en: field_display_en,
                  field_display_es: field_display_es,
                  field_group_en: reg_field[0].field_group_en,
                  field_group_es: reg_field[0].field_group_es,
                  field_desc_en: field_desc_en,
                  field_desc_es: field_desc_es,
                  active: reg_field[0].active,
                  required: reg_field[0].required,
                  created_at: reg_field[0].created_at,
                };
                if (reg_field[0].field == "sector") {
                  this.hasSectorField = true;
                }
                selected_fields.push(fld);
              }
            });
          }

          this.profileFields = profile_fields;
          this.selectedFields = selected_fields;

          if (this.hasSectorField) {
            this.loadMemberLists();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  loadMemberLists() {
    this.memberLists = [
      {
        id: 1,
        display_es: "Sectors",
        display_en: "Sectors",
        display_fr: "Sectors",
        display_eu: "Sectors",
        display_ca: "Sectors",
        display_de: "Sectors",
        description_es: "Agregar, editar o eliminar sector",
        description_en: "Add, edit or delete sector",
        description_fr: "Ajouter, modifier ou supprimer des sector",
        description_eu: "Gehitu, editatu edo ezabatu sector",
        description_ca: "Afegir, editar o eliminar sector",
        description_de: "Stellenangebote hinzufügen, bearbeiten sector",
        value: "sectors",
      },
    ];
  }

  excludeOtherSubfeatures(subfeatures) {
    if(this.companyId != 27) {
      subfeatures = subfeatures?.filter(subfeature => {
        return subfeature?.name_en != "Tutor profile"
      })
    }

    subfeatures = subfeatures?.filter(subfeature => {
      let include = false

      if(
        (this.companyId != 27 && subfeature?.name_en == 'Tutor profile') ||
        (subfeature?.name_en == "Custom landing page for event registration") ||
        (subfeature?.name_en == "Email invite") ||
        (subfeature?.name_en == "Recurring") ||
        (subfeature?.name_en == "Order") ||
        (subfeature?.name_en == "Subgroups") ||
        (subfeature?.name_en == "View more") ||
        (subfeature?.feature_id == 3 && subfeature?.name_en == 'Categories')
      ) {
      } else {
        include = true
      }

      return include
    })

    return subfeatures
  }

  mapFeatures(features) {
    let clubFeature = features?.find((f) => f.id == 5);
    this.clubTitle = clubFeature ? this.getOtherFeatureTitle(clubFeature) : "";
  }

  getSubfeatures() {
    this._companyService
      .getSubFeaturesCombined(this.id, this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          let subfeatures: any = [];
          subfeatures = response;
          subfeatures = this.excludeOtherSubfeatures(subfeatures);
          subfeatures?.map((data) => {
            data.name = this.getSubfeatureName(data);
            data.description = this.getSubfeatureDescription(data);

            let action_button = this.actionButtons.find(
              (c) => data.name_en == c.name_en && data.active == 1
            );
            let show_button = action_button?.id > 0 ? true : false
            if(this.companyId != 27 && action_button?.id == 18) {
              show_button = false;
            }
            data.show_action_button = show_button;
          });
          this.companySubfeatures = subfeatures;
          this.allCompanySubfeatures = subfeatures;
          this.mapSubfeatures(subfeatures);
          setTimeout(() => {
            this.refreshDataSource(this.companySubfeatures);
          }, 500);
          this.isloading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.ageGroupFilterActive = subfeatures.some(
        (a) => a.name_en == "Age group filter" && a.active == 1
      );
      this.groupFilterActive = subfeatures.some(
        (a) => a.name_en == "Group filter" && a.active == 1
      );
    }
  }

  refreshDataSource(list) {
    this.dataSource = new MatTableDataSource(
      list.slice(
        this.pageIndex * this.pageSize,
        this.pageIndex + 1 * this.pageSize
      )
    );
    setTimeout(() => {
      if (this.paginator) {
        new MatTableDataSource(list).paginator = this.paginator;
        this.paginator.firstPage();
      }
    });
    setTimeout(() => (this.dataSource.sort = this.sort));
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.companySubfeatures.slice(
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

  saveFeatureName() {
    if (!this.featureNameEs) {
      return false;
    } else {
      let payload = {
        name_en: this.featureNameEn,
        name_es: this.featureNameEs,
        name_fr: this.featureNameFr,
        name_eu: this.featureNameEu,
        name_ca: this.featureNameCa,
        name_de: this.featureNameDe,
        name_it: this.featureNameIt,
      };
      this._companyService
        .editCompanyFeature(this.id, this.companyId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            if (response) {
              this.open(
                this._translateService.instant("dialog.savedsuccessfully"),
                ""
              );
              let menus = this._localService.getLocalStorage(
                environment.lsmenus
              )
                ? JSON.parse(
                    this._localService.getLocalStorage(environment.lsmenus)
                  )
                : [];
              if (menus?.length > 0) {
                menus.forEach((menu, index) => {
                  if (
                    menu.path != "home" &&
                    menu.path != "dashboard" &&
                    menu.id == this.id
                  ) {
                    menu.name = this.featureNameEs;
                    menu.name_CA = this.featureNameCa;
                    menu.name_DE = this.featureNameDe;
                    menu.name_ES = this.featureNameEs;
                    menu.name_EU = this.featureNameEu;
                    menu.name_FR = this.featureNameFr;
                    menu.name_IT = this.featureNameIt;
                  }
                });
              }
              this._menuService.updateMenu(menus);
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
    });
  }

  activate(id) {
    this._companyService
      .activateSubfeature(this.id, this.companyId, id, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          if (response) {
            if (this.companySubfeatures) {
              this.companySubfeatures.forEach((feat) => {
                if (feat.id == id) {
                  feat.active = 1;
                  feat.show_action_button = this.showActionButton(feat);
                }
              });
              this.allCompanySubfeatures.forEach((feat) => {
                if (feat.id == id) {
                  feat.active = 1;
                  feat.show_action_button = this.showActionButton(feat);
                }
              });
            }
            if (id == 89 || id == 122 || id == 153) {
              location.reload();
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  showActionButton(feat) {
    let action_button = this.actionButtons.find(
      (c) => feat.name_en == c.name_en
    );
    let show_button = action_button?.id > 0 ? true : false;
    return show_button;

  } 

  deactivate(id) {
    this._companyService
      .deactivateSubfeature(this.id, this.companyId, id, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          if (response) {
            if (this.companySubfeatures) {
              this.companySubfeatures.forEach((feat) => {
                if (feat.id == id) {
                  feat.active = 0;
                  feat.show_action_button = false;
                }
              });
              this.allCompanySubfeatures.forEach((feat) => {
                if (feat.id == id) {
                  feat.active = 0;
                  feat.show_action_button = false;
                }
              });
              if (id == 89 || id == 122 || id == 153) {
                location.reload();
              }
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  goBackToFeatures() {
    this._router.navigate([`/settings`]);
  }

  goToSubfeature(id) {
    this._router.navigate([`/settings/subfeature/${this.id}/${id}`]);
  }

  managePlanRegistrationLanding() {
    this._router.navigate([
      `/settings/company/edit-event-registration-landing`,
    ]);
  }

  manageInviteQuestions() {
    // this._router.navigate([`/new-settings/email-invite/questions`]);
  }

  manageTypeOfActivities() {
    // this._router.navigate([`/new-settings/activity/types`]);
  }

  showCommissionsSettings() {
    // this._router.navigate([`/landing/company/registration/member-type/part`]);
  }

  manageClubContactDetails() {
    // this._router.navigate([`/settings/contact-details`]);
  }

  showTermsAndConditions() {
    // this.showTermsAndConditionsModal = true
  }

  closeTermsAndConditionsModal() {
    // this.showTermsAndConditionsModal = false
  }

  saveTermsAndConditions() {
    // let params = {
    //   terms_and_conditions: this.termsAndConditions,
    // }
    // this.mainService.updateJobTermsAndConditions(this.companyId, params)
    //   .subscribe(
    //     async response => {
    //       this.mainService.removeCompaniesCache()
    //       this.showTermsAndConditionsModal = false
    //       this.open(this._translateService.instant('dialog.savedsuccessfully'), null);
    //       this.companies = this.getLocalStorage(environment.lscompanies) ? JSON.parse(this.getLocalStorage(environment.lscompanies)) : ''
    //       if(!this.companies) { this.companies = get(await this.mainService.getCompanies().toPromise(), 'companies') }
    //       this.mainService.getCompany(this.companies)
    //     },
    //     error => {
    //       console.log(error)
    //     }
    // )
  }

  getCommissionSettings() {
    // this.mainService.getCommissionSettings(this.companyId)
    //   .subscribe(
    //       async (response) => {
    //         this.commissionSettings = response.commission_settings
    //         if(this.commissionSettings && this.commissionSettings.id) {
    //           this.commissionFee = this.commissionSettings.fee ? this.commissionSettings.fee.replace('.00', '') : '4'
    //           this.commissionMonths = this.commissionSettings.payout_month
    //         }
    //         this.showCommissionModal = true
    //       },
    //       error => {
    //           console.log(error)
    //       }
    //   )
  }

  closeCommissionModal() {
    // this.showCommissionModal = false
  }

  saveCommissionSettings() {
    // if(this.commissionFee && this.commissionMonths) {
    //   let params = {
    //     company_id: this.companyId,
    //     fee: this.commissionFee,
    //     payout_month: this.commissionMonths
    //   }
    //   this.mainService.updateCommissionSettings(params)
    //   .subscribe(
    //     response => {
    //       this.showCommissionModal = false
    //     },
    //     error => {
    //       console.log(error)
    //     }
    //   )
    // }
  }

  goBack() {
    this._location.back();
  }

  openHideOffersModal(row) {
    // this.popupTitle = this.language == 'en' ? row.description_en : (this.language == 'fr' ? row.description_fr : row.description_es)
    // this.getOfferHideDays()
  }

  closeHideOffersModal() {
    this.showHideOffersModal = false
  }

  getOfferHideDays() {
    this._jobOfferService.getOfferHideDaysSettings(this.companyId)
      .subscribe(
        response => {
          this.offerHideDays = response.offer_hide_days_settings
          if(this.offerHideDays && this.offerHideDays.id) {
            this.hideOffersDays = this.offerHideDays.hide_days ? this.offerHideDays.hide_days : '';
          }
          this.showHideOffersModal = true;
        },
        error => {
          console.log(error)
        }
      )
  }

  saveHideOffersDays() {
    if(this.hideOffersDays) {
      let params = {
        company_id: this.companyId,
        hide_days: this.hideOffersDays
      }
      this._jobOfferService.updateOfferHideDaysSettings(params)
      .subscribe(
        response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          this.showHideOffersModal = false;
          this.closesettingmodalbutton?.nativeElement.click();
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  async manageApproveClubActivities(type: any = "club") {
    this.userRoles = [
      {
        id: 1,
        name_EN: 'Member',
        name_ES: 'Miembro',
        name_FR: 'Membre',
        name_EU: 'Kide',
        name_CA: 'Membre',
        name_DE: 'Mitglied',
      },
      {
        id: 2,
        name_EN: 'Admin 1',
        name_ES: 'Admin 1',
        name_FR: 'Admin 1',
        name_EU: 'Admin 1',
        name_CA: 'Admin 1',
        name_DE: 'Admin 1',
      },
      {
        id: 3,
        name_EN: 'Admin 2',
        name_ES: 'Admin 2',
        name_FR: 'Admin 2',
        name_EU: 'Admin 2',
        name_CA: 'Admin 2',
        name_DE: 'Admin 2',
      },
      {
        id: 4,
        name_EN: 'Super Admin',
        name_ES: 'Super Admin',
        name_FR: 'Super Admin',
        name_EU: 'Super Admin',
        name_CA: 'Super Admin',
        name_DE: 'Super Admin',
      }
    ]
    this.getCustomMemberTypes(type);
  }

  getCustomMemberTypes(type: any = "club") {
    this._userService.getCustomMemberTypes(this.companyId)
      .subscribe(
        response => {
          this.memberTypes = response.member_types
          if(this.memberTypes && this.memberTypes.length > 0) {
            this.memberTypes.forEach(mt => {
              this.userRoles.push({
                id: mt.id,
                name_EN: mt.type_en,
                name_ES: mt.type_es,
                name_FR: mt.type_fr || mt.type_es,
                name_EU: mt.type_eu || mt.type_es,
                name_CA: mt.type_ca || mt.type_es,
                name_DE: mt.type_de || mt.type_es,
              })
            })
            this.userRoles = this.userRoles && this.userRoles.filter(ur => {
              return ur.name_EN != 'Member' && ur.name_EN != 'Admin 1' && ur.name_EN != 'Admin 2'
            })
          }
          if(type == 'course' || type == 'tutor') {
          //   this.getCourseWallTutorRoles()
          //   this.getCourseWallSettings()
          //   this.showCourseWallSettingsModal = true
          //   if(type == 'tutor') {
          //     this.tutorProfileMode = true
          //   }
          } else {
            this.getClubActivityApproveRoles();
            this.showApproveClubActivitiesModal = true;
          }
        },
        error => {
          console.log(error)
        }
      )
  }

  closeUserRolesModal() {
    this.showApproveClubActivitiesModal = false;
    this.closesettingmodalbutton?.nativeElement.click();
  }

  saveUserRoles() {
    let params = {
      company_id: this.companyId,
      user_role_id: this.selectedUserRoles ? this.selectedUserRoles.map( (data) => { return data.id }).join() : ''
    }
    this._clubsService.updateClubActivitiesApproveUserRoles(params)
      .subscribe(
        response => {
          this.showApproveClubActivitiesModal = false;
          this.closesettingmodalbutton?.nativeElement.click();
        },
        error => {
          console.log(error)
        }
      )
  }

  getClubActivityApproveRoles() {
    this._clubsService.getClubActivityApproveRoles(this.companyId)
        .subscribe(
            async (response) => {
                let user_roles = response.create_plan_roles;
                let selected_user_roles: any[] = [];
                if(user_roles) {
                  user_roles.forEach(r => {
                    let userRole = this.userRoles && this.userRoles.filter(ur => {
                      return ur.id == r.role_id
                    })
                    if(userRole && userRole[0]) {
                      selected_user_roles.push(userRole[0])
                    }
                  });
                }

                setTimeout(() => {
                  this.selectedUserRoles = selected_user_roles;
                }, 1000);
            },
            error => {
                console.log(error)
            }
        )
  }

  getSettingTitle(setting) {
    this.selectedSetting = setting;
    if (this.selectedSetting) {
      if(this.showTutorBookingsCommissionPerHourModal == true) {
        this.selectedSettingTitle = this._translateService.instant('company-settings.bookingcommissionperhour');
      } else if(this.showTutorBookingsCommissionModal == true) {
        this.selectedSettingTitle = this._translateService.instant('company-settings.bookingcommissionpercentage');
      } else {
        this.selectedSettingTitle =
          this.language == "en"
            ? this.selectedSetting.name_en
              ? this.selectedSetting.name_en || this.selectedSetting.name_es
              : this.selectedSetting.name_es
            : this.language == "fr"
            ? this.selectedSetting.name_fr
              ? this.selectedSetting.name_fr || this.selectedSetting.name_es
              : this.selectedSetting.name_es
            : this.language == "eu"
            ? this.selectedSetting.name_eu
              ? this.selectedSetting.name_eu || this.selectedSetting.name_es
              : this.selectedSetting.name_es
            : this.language == "ca"
            ? this.selectedSetting.name_ca
              ? this.selectedSetting.name_ca || this.selectedSetting.name_es
              : this.selectedSetting.name_es
            : this.language == "de"
            ? this.selectedSetting.name_de
              ? this.selectedSetting.name_de || this.selectedSetting.name_es
              : this.selectedSetting.name_es
            : this.language == "it"
            ? this.selectedSetting.name_it
              ? this.selectedSetting.name_it || this.selectedSetting.name_es
              : this.selectedSetting.name_it
            : this.selectedSetting.name_es;
      }
    }
  }

  openFeaturedTextModal(row) {
    this.showFeaturedTextModal = true;
  }

  closeFeaturedTextModal() {
    this.showFeaturedTextModal = false;
    this.closesettingmodalbutton?.nativeElement.click();
  }

  saveFeaturedTextValue() {
    if(!this.featuredTextValue) {
      return false
    }
    let params = {
      company_id: this.companyId,
      featured_text: this.featuredTextValue,
      featured_text_en: this.featuredTextValueEn || this.featuredTextValue,
      featured_text_fr: this.featuredTextValueFr || this.featuredTextValue,
      featured_text_eu: this.featuredTextValueEu || this.featuredTextValue,
      featured_text_ca: this.featuredTextValueCa || this.featuredTextValue,
      featured_text_de: this.featuredTextValueDe || this.featuredTextValue,
      featured_text_it: this.featuredTextValueIt || this.featuredTextValue,
    }
    this._plansService.saveFeaturedText(params)
      .subscribe(
        async (response) => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          this.showFeaturedTextModal = false;
          this.closesettingmodalbutton?.nativeElement.click();
          this.refreshCompanies();
        },
        error => {
          console.log(error)
        }
      )
  }

  async refreshCompanies() {
    this.companies = get(
      await this._companyService.getCompanies().toPromise(),
      "companies"
    );
    this._companyService.getCompany(this.companies);
  }

  openHotmartSettingsModal(row) {
    this.getSettingTitle(row);
    this.getHotmartSettings();
    // this.showHotmartSettingsModal = true
  }

  closeHotmartSettingsModal() {
    // this.showHotmartSettingsModal = false
  }

  getHotmartSettings() {
    // this.mainService.getHotmartSettings(this.companyId)
    //   .subscribe(
    //     response => {
    //       let hotmart_settings = response.hotmart_settings
    //       if(hotmart_settings) {
    //         this.hotmartClientId = hotmart_settings.client_id
    //         this.hotmartClientSecret = hotmart_settings.client_secret
    //         this.hotmartBasic = hotmart_settings.basic
    //         this.hotmartWebhookVerificationhottok = hotmart_settings.webhook_verification_hottok
    //         this.hotConnectClientId = hotmart_settings.hotconnect_client_id
    //         this.hotConnectClientSecret = hotmart_settings.hotconnect_client_secret
    //         this.hotConnectBasic = hotmart_settings.hotconnect_basic
    //         this.showHotmartCourses = hotmart_settings.show == 1 ? true : false
    //       }
    //     },
    //     error => {
    //       console.log(error)
    //     }
    //   )
  }

  saveHotmartSettings() {
    // if(!this.hotmartClientId || !this.hotmartClientSecret || !this.hotmartBasic || !this.hotmartWebhookVerificationhottok) {
    //   return false
    // }
    // let params = {
    //   company_id: this.companyId,
    //   client_id: this.hotmartClientId,
    //   client_secret: this.hotmartClientSecret,
    //   basic: this.hotmartBasic,
    //   webhook_verification_hottok: this.hotmartWebhookVerificationhottok,
    //   hotconnect_client_id: this.hotConnectClientId,
    //   hotconnect_client_secret: this.hotConnectClientSecret,
    //   hotconnect_basic: this.hotConnectBasic,
    //   show: this.showHotmartCourses ? 1 : 0
    // }
    // this.mainService.saveHotmartSettings(this.companyId, params)
    //   .subscribe(
    //     async (response) => {
    //       this.open(this._translateService.instant('dialog.savedsuccessfully'), null)
    //       this.showHotmartSettingsModal = false
    //     },
    //     error => {
    //       console.log(error)
    //     }
    //   )
  }

  getCourseWallTutorRoles() {
    // this.mainService.getCourseTutorRoles(this.companyId)
    //     .subscribe(
    //         async (response) => {
    //             let user_roles = response.course_tutor_roles;
    //             let selected_user_roles = []
    //             if(user_roles) {
    //               user_roles.forEach(r => {
    //                 let userRole = this.userRoles && this.userRoles.filter(ur => {
    //                   return ur.id == r.role_id
    //                 })
    //                 if(userRole && userRole[0]) {
    //                   selected_user_roles.push(userRole[0])
    //                 }
    //               });
    //             }
    //             this.selectedCourseUserRoles = selected_user_roles
    //         },
    //         error => {
    //             console.log(error)
    //         }
    //     )
  }

  getCourseWallSettings() {
    // this.mainService.getCourseWallSettings(this.companyId)
    //     .subscribe(
    //         async (response) => {
    //           let wall_settings = response.wall_settings
    //           this.questionBackgroundColor = wall_settings && wall_settings.question_background ? wall_settings.question_background : '#fff'
    //           this.adminBadge = wall_settings && wall_settings.admin_badge ? wall_settings.admin_badge : ''
    //           this.tutorBadge = wall_settings && wall_settings.tutor_badge ? wall_settings.tutor_badge : ''
    //         },
    //         error => {
    //             console.log(error)
    //         }
    //     )
  }

  openCourseWallSettingsModal(row, mode: string = "") {
    this.getSettingTitle(row);
    this.manageApproveClubActivities(mode);
  }

  closeCourseWallSettingsModal() {
    // this.showCourseWallSettingsModal = false
  }

  saveCourseWallSettings() {
    // let admin_badge_file_status = localStorage.getItem('admin_badge_file')
    // let admin_badge_file = admin_badge_file_status == 'complete' ? this.adminBadgeFileName : ''
    // let tutor_badge_file_status = localStorage.getItem('tutor_badge_file')
    // let tutor_badge_file = tutor_badge_file_status == 'complete' ? this.tutorBadgeFileName : ''
    // let params = {
    //   company_id: this.companyId,
    //   user_role_id: this.selectedCourseUserRoles ? this.selectedCourseUserRoles.map( (data) => { return data.id }).join() : '',
    //   question_background: this.questionBackgroundColor,
    //   admin_badge: admin_badge_file,
    //   tutor_badge: tutor_badge_file
    // }
    // this.mainService.updateCourseTutorRoles(params)
    //   .subscribe(
    //       response => {
    //         this.mainService.removeFeaturesCache()
    //         this.mainService.removeFeatureCache()
    //         this.mainService.removeFeatureMappingCache()
    //         this.mainService.removeSubfeatureCache()
    //         this.mainService.removeSubfeaturesCache()
    //         this.mainService.removeCompanyFeatureCache()
    //         this.mainService.removeCompanySubfeatureCache()
    //         this.open(this._translateService.instant('dialog.savedsuccessfully'), null)
    //         this.showCourseWallSettingsModal = false
    //       },
    //       error => {
    //           console.log(error)
    //       }
    //   )
  }

  public onEventLog(event: string, data: any): void {
    if (data && event == "colorPickerClose") {
      // this.questionBackgroundColor = data
    }
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();
    return timestamp;
  }

  openGuestRegistrationFieldsModal(row) {
    this.getGuestRegistrationFields();
    this.getAllRegistrationFields();
  }

  getAllRegistrationFields() {
    this._plansService.getAllRegistrationFields(this.companyId)
      .subscribe(
          response => {
            this.allRegistrationFields = response.registration_fields
          },
          error => {
              console.log(error)
          }
      )
  }

  getGuestRegistrationFields() {
    this._plansService.getGuestRegistrationFields(this.companyId)
      .subscribe(
          response => {
            this.filteredProfileFields = response.registration_fields
            this.showGuestRegistrationFieldsModal = true
          },
          error => {
              console.log(error)
          }
      )
  }

  closeGuestRegistrationFieldsModal() {
    this.showGuestRegistrationFieldsModal = false;
    this.closesettingmodalbutton?.nativeElement.click();
  }

  moveUp(type, array, index, item) {
    if (index >= 1) {
      this.swap(array, index, index - 1);
      this.updateRegistrationFieldsSequence(type, array, item);
    }
  }

  moveDown(type, array, index, item) {
    if (index < array.length - 1) {
      this.swap(array, index, index + 1);
      this.updateRegistrationFieldsSequence(type, array, item);
    }
  }

  swap(array: any[], x: any, y: any) {
    var b = array[x];
    array[x] = array[y];
    array[y] = b;
  }

  updateRegistrationFieldsSequence(type, array, item) {
    let params = {
      id: item.id,
      list_type: type,
      list: array
    }
    this._companyService.editProfileFieldSequence(params).subscribe(
      response => {
        this.getGuestRegistrationFields()
      },
      error => {
        console.log(error);
      }
    )
  }

  addExistingField() {
    this.fieldMode = 'add';
    this.fieldFormSubmitted = false;
    this.showFieldDetails = true;
  }

  saveField() {
    if(this.fieldMode == 'add') {
      this.addField();
    } else if(this.fieldMode == 'edit') {
      this.updateField();
    }
  }

  addField() {
    this.fieldFormSubmitted = true
    if(!this.selectedField
      || !this.fieldDesc) {
        return false
      }
    let registration_field_id
    if(this.selectedField) {
      if(this.allRegistrationFields) {
        let registration_field = this.allRegistrationFields.filter(p => {
          return p.id == this.selectedField
        })
        if(registration_field && registration_field[0]) {
          registration_field_id = registration_field[0].id
        }
      }
    }
    let params = {
      company_id: this.companyId,
      field_id: registration_field_id,
      display_text_es: this.fieldDesc,
      display_text_en: this.fieldDesc,
      required: this.requiredField ? 1 : 0
    }
    this._plansService.addGuestRegistrationField(params)
      .subscribe(
          response => {
            if (response) {
              this.getGuestRegistrationFields()
              this.selectedFieldId = ''
              this.selectedField = ''
              this.fieldDesc = ''
              this.requiredField = false
              this.fieldMode = ''
              this.showFieldDetails = false
              this.fieldFormSubmitted = false
            }
          },
          error => {
              console.log(error)
          }
      )
  }

  editField(item) {
    this.fieldMode = 'edit';
    this.selectedFieldId = item.id;
    this.selectedField = item.field_id;
    this.fieldDesc = this.language == 'en' ? item.field_display_en : item.field_display_es;
    this.requiredField = item.required;
    this.showFieldDetails = true;
    this.fieldFormSubmitted = false;
  }

  updateField() {
    this.fieldFormSubmitted = true;
    if(!this.selectedField
      || !this.fieldDesc) {
        return false
      }
    let registration_field_id
    if(this.selectedField) {
      if(this.allRegistrationFields) {
        let registration_field = this.allRegistrationFields.filter(p => {
          return p.id == this.selectedField
        })
        if(registration_field && registration_field[0]) {
          registration_field_id = registration_field[0].id
        }
      }
    }
    let params = {
      id: this.selectedFieldId,
      field_id: registration_field_id,
      field_display_es: this.fieldDesc,
      field_display_en: this.fieldDesc,
      required: this.requiredField ? 1 : 0
    }
    this._plansService.editGuestRegistrationField(params)
      .subscribe(
          response => {
            if (response) {
              this.getGuestRegistrationFields();
              this.selectedFieldId = '';
              this.selectedField = '';
              this.fieldDesc = '';
              this.requiredField = false;
              this.fieldMode = '';
              this.showFieldDetails = false;
              this.fieldFormSubmitted = false;
            }
          },
          error => {
              console.log(error)
          }
      )
  }

  deleteField(item) {
    if(item.id) {
      this._plansService.deleteGuestRegistrationField(item.id)
        .subscribe(
            response => {
              if (response) {
                this.getGuestRegistrationFields();
              }
            },
            error => {
                console.log(error)
            }
        )
    }
  }

  handleFieldChange(event) {
    if(event.target.value) {
      if(this.allRegistrationFields) {
        let registration_field = this.allRegistrationFields.filter(p => {
          return p.id == event.target.value
        })
        if(registration_field && registration_field[0]) {
          this.fieldDesc = this.language == 'en' ? registration_field[0].field_display_en : registration_field[0].field_display_es
        }
      }
    }
  }

  cancelShowField() {
    this.fieldMode = '';
    this.fieldFormSubmitted = false;
    this.showFieldDetails = false;
  }

  goToTutorTypes(row) {
    this._router.navigate(["/settings/tutor-types"]);
  }

  async openStudentHours(row) {
    this._router.navigate(["/settings/tutor-packages"]);
  }

  openCreditPackages(row) {
    this._router.navigate(['/settings/credit-packages'])
  }

  goToTestimonialTags(row) {
    this._router.navigate(["/settings/testimonial-tags"]);
  }

  getDurationUnitTitle(duration) {
    return this.language == "en"
      ? duration.unit
      : this.language == "fr"
      ? duration.unit_fr
      : this.language == "eu"
      ? duration.unit_eu
      : this.language == "ca"
      ? duration.unit_ca
      : this.language == "de"
      ? duration.unit_de
      : duration.unit_es;
  }

  getTutorSettings(mode: string = "") {
    // this.mainService.getTutorSettings(this.companyId)
    //   .subscribe(
    //       response => {
    //         this.tutorSettings = response.settings
    //         this.studentAllotted = this.tutorSettings.student_allotted || ''
    //         this.studentAllottedUnit = this.tutorSettings.student_allotted_unit || ''
    //         this.studentAllottedDuration = this.tutorSettings.student_allotted_duration || ''
    //         this.studentAllottedDurationUnit = this.tutorSettings.student_allotted_duration_unit || ''
    //         this.showTutorSettingsModal = mode ? true : false
    //       },
    //       error => {
    //           console.log(error)
    //       }
    //   )
  }

  closeTutorSettingsModal() {
    // this.showTutorSettingsModal = false
  }

  handleChangeStudentAllottedUnit(event) {
    // this.studentAllottedUnit = event.target.value
  }

  handleChangeStudentAllottedDurationUnit(event) {
    // this.studentAllottedDurationUnit = event.target.value
  }

  saveTutorSettings() {
    // this.tutorSettingsSubmitted = true
    // if(this.studentAllotted && this.studentAllottedUnit && this.studentAllottedDuration && this.studentAllottedDurationUnit) {
    //   let params = {
    //     company_id: this.companyId,
    //     student_allotted: this.studentAllotted,
    //     student_allotted_unit: this.studentAllottedUnit,
    //     student_allotted_duration: this.studentAllottedDuration,
    //     student_allotted_duration_unit: this.studentAllottedDurationUnit,
    //   }
    //   this.mainService.editTutorSettings(params)
    //   .subscribe(
    //     response => {
    //       this.open(this._translateService.instant('dialog.savedsuccessfully'), null)
    //       this.showTutorSettingsModal = false
    //     },
    //     error => {
    //       console.log(error)
    //     }
    //   )
    // }
  }

  goToTutorsList() {
    // this._router.navigate(['/new-settings/tutors'])
  }

  openBlogSettingsModal(row) {
    // this.popupTitle = this.language == 'en' ? row.name_en : (this.language == 'fr' ? row.name_fr : row.name_es)
    // this.getBlogSettings()
  }

  getBlogSettings() {
    // this.mainService.getBlogSettings(this.companyId)
    //   .subscribe(
    //     response => {
    //       this.blogSettings = response.settings
    //       this.blogLayoutSetting = this.blogSettings ? this.blogSettings.layout : ''
    //       this.showBlogSettingsModal = true
    //     },
    //     error => {
    //         console.log(error)
    //     }
    //   )
  }

  handleChangeBlogLayout(event) {
    // this.blogLayoutSetting = event.target.value
  }

  saveBlogSettings() {
    // if(this.blogLayoutSetting) {
    //   let params = {
    //     company_id: this.companyId,
    //     layout: this.blogLayoutSetting,
    //   }
    //   this.mainService.updateBlogLayoutSettings(params)
    //   .subscribe(
    //     response => {
    //       this.showBlogSettingsModal = false
    //     },
    //     error => {
    //       console.log(error)
    //     }
    //   )
    // }
  }

  closeBlogSettingsModal() {
    // this.showBlogSettingsModal = false
  }

  manageKeap() {
    this._router.navigate([`/settings/keap`]);
  }

  goToTutorCommissionPercentage(row) {
    this.getTutorBookingCommissionPercentage();
    this.showTutorBookingsCommissionModal = true
  }

  goToTutorCommissionPerHour(row) {
    this.getTutorBookingCommissionPerHour();
    this.showTutorBookingsCommissionPerHourModal = true;
  }

  closeTutorBookingCommisionModal() {
    this.showTutorBookingsCommissionModal = false;
    this.closesettingmodalbutton?.nativeElement.click();
  }

  closeTutorBookingCommisionPerHourModal() {
    this.showTutorBookingsCommissionPerHourModal = false
    this.closesettingmodalbutton?.nativeElement.click();
  }

  saveTutorBookingCommissionPercentage() {
    let params = {
      company_id : this.companyId,
      commission_percentage : this.bookingcommissionpercentage
    }
    this._tutorsService.saveTutorBookingCommissionPercentage(params)
    .subscribe(
      response => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        this.showTutorBookingsCommissionModal = false;
        this.closesettingmodalbutton?.nativeElement.click();
      },
      error => {
        console.log(error)
      }
    )
  }

  async getTutorBookingCommissionPercentage() {
    let commissionPercentage = get(await this._tutorsService.getTutorBookingCommissionPercentage(this.companyId).toPromise(), 'commission_percentage');
    this.bookingcommissionpercentage = commissionPercentage?.commission_percentage ? parseFloat(commissionPercentage.commission_percentage) : '';
    this.showTutorBookingsCommissionModal = true;
  }

  saveTutorBookingCommissionPerHour() {
    let params = {
      company_id : this.companyId,
      commission_per_hour : this.bookingcommissionperhour
    }
    this._tutorsService.saveTutorBookingCommissionPerHour(params)
    .subscribe(
      response => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        this.showTutorBookingsCommissionPerHourModal = false;
        this.closesettingmodalbutton?.nativeElement.click();
      },
      error => {
        console.log(error)
      }
    )
  }

  async getTutorBookingCommissionPerHour() {
    let commissionPerHour = get(await this._tutorsService.getTutorBookingCommissionPerHour(this.companyId).toPromise(), 'commission_per_hour');
    this.bookingcommissionperhour = commissionPerHour?.commission_per_hour ? parseFloat(commissionPerHour.commission_per_hour) : '';
    this.showTutorBookingsCommissionPerHourModal = true;
  }

  getVimeoSettings() {
    // this.mainService.getVimeoSettings(this.companyId)
    //   .subscribe(
    //       async (response) => {
    //         this.vimeoToken = response['vimeo_settings'] ? response['vimeo_settings']['token'] : '';
    //       },
    //       error => {
    //           console.log(error)
    //       }
    //   )
  }

  openVimeoModal(row) {
    // this.getSettingTitle(row)
    // this.showVimeoModal = true
  }

  closeVimeoModal(row) {
    // this.showVimeoModal = false
  }

  saveVimeoToken() {
    // let params = {
    //   company_id : this.companyId,
    //   token : this.vimeoToken
    // }
    // this.mainService.editVimeoSettings(params)
    // .subscribe(
    //   response => {
    //     this.showVimeoModal = false
    //   },
    //   error => {
    //     console.log(error)
    //   }
    // )
  }

  openCandidatesDisplayModal(row) {
    // this.popupTitle = this.language == 'en' ? row.description_en : (this.language == 'fr' ? row.description_fr : row.description_es)
    // this.getCandidatesDisplay()
  }

  closeCandidatesDisplayModal() {
    // this.showCandidatesDisplayModal = false
  }

  getCandidatesDisplay() {
    // this.mainService.getCandidatesDisplay(this.companyId)
    //   .subscribe(
    //       response => {
    //         this.offerCandidatesDisplay = response.offer_candidates_display_settings
    //         if(this.offerCandidatesDisplay && this.offerCandidatesDisplay.id) {
    //           this.candidatesDisplay = this.offerCandidatesDisplay.candidates_display ? this.offerCandidatesDisplay.candidates_display : ''
    //         }
    //         this.showCandidatesDisplayModal = true
    //       },
    //       error => {
    //           console.log(error)
    //       }
    //   )
  }

  getMenteeLimitSettings() {
    this._buddyService.getMenteeLimitSettings(this.companyId)
      .subscribe(
        async (response) => {
          this.menteeLimitSettings = response.buddy_limit_settings
          if(this.menteeLimitSettings && this.menteeLimitSettings.id) {
            this.createMenteeLimit = this.menteeLimitSettings.limit ? this.menteeLimitSettings.limit : ''
            this.limitMessage = this.menteeLimitSettings.limit_message || ''
          }
          this.showMenteeLimitModal = true
        },
        error => {
          console.log(error)
        }
      )
  }

  saveMenteeLimitSettings() {
    if(this.createMenteeLimit) {
      let params = {
        company_id: this.companyId,
        limit: this.createMenteeLimit,
        limit_message: this.limitMessage
      }
      this._buddyService.updateMenteeLimitSettings(params)
      .subscribe(
        response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          this.showMenteeLimitModal = false;
          this.closesettingmodalbutton?.nativeElement.click();
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  saveCandidatesDisplay() {
    // if(this.candidatesDisplay) {
    //   let params = {
    //     company_id: this.companyId,
    //     candidates_display: this.candidatesDisplay
    //   }
    //   this.mainService.updateCandidatesDisplay(params)
    //   .subscribe(
    //     response => {
    //       this.open(this._translateService.instant('dialog.savedsuccessfully'), null)
    //       location.reload()
    //     },
    //     error => {
    //       console.log(error)
    //     }
    //   )
    // }
  }

  manageLimitMessage() {}

  updateFilter() {
    this.getFilterSettings();
  }

  getFilterSettings() {
    this._companyService.getFilterSettings(this.companyId, this.id)
      .subscribe(
        response => {
          let filter_settings = response.filter_settings 
          if(filter_settings?.id) {
            this.selectedFilter = filter_settings?.filter_type;
          }
          this.showFilterModal = true;
          this.loadFilterSettings();
        },
        error => {
          console.log(error)
        }
      )
  }

  loadFilterSettings() {
    if(this.filterSettings?.length == 0) {
      if(this.id != 3) {
        this.filterSettings.push({
          id: 1,
          company_id: this.companyId,
          feature_id: this.id,
          field: 'category',
          text: this._translateService.instant('plan-details.category'),
          display: this.selectedFilter || 'dropdown',
          status: true,
          select_text: '',
        })
      }
      if(
        (this.companyId != 12 && (this.id == 1 || this.id == 3 || this.id == 5 || this.id == 15 || this.id == 18 || this.id == 20)) ||
        (this.companyId == 12 && this.id == 15)
      ) {
        this.filterSettings.push({
          id: 2,
          company_id: this.companyId,
          feature_id: this.id,
          field: 'city',
          text: this.id == 15 && this.companyId == 12 ? this._translateService.instant('company-settings.postalcode') : this._translateService.instant('profile-settings.city'),
          display: 'dropdown',
          status: true,
          select_text: '',
        })
      }

      if(this.id == 1 || this.id == 15) {
        if(this.ageGroupFilterActive) {
          this.filterSettings.push({
            id: 3,
            company_id: this.companyId,
            feature_id: this.id,
            field: 'age_group',
            text: this._translateService.instant('landing.agegroup'),
            display: 'dropdown',
            status: true,
            select_text: '',
          })
        }
        if(this.id == 1) {
          if(this.groupFilterActive) {
            this.filterSettings.push({
              id: 4,
              company_id: this.companyId,
              feature_id: this.id,
              field: 'group',
              text: this.clubTitle,
              display: 'dropdown',
              status: true,
              select_text: '',
            })
          }
        }
      }
    } else {
      let filterSettings = this.filterSettings;
      this.filterSettings = [];
      filterSettings?.forEach(fs => {
        let text = ''
        switch(fs.field) {
          case 'category':
            text = this._translateService.instant('plan-details.category');
            break;
          case 'city':
            text = this._translateService.instant('profile-settings.city');
            break;
          case 'age_group':
            text = this._translateService.instant('landing.agegroup');
            break;
          case 'group':
            text = this.clubTitle;
            break;
          case 'language':
            text = this._translateService.instant('job-offers.language');
            break;
        }
        let filter = {
          id: fs.id,
          company_id: fs.company_id,
          feature_id: fs.feature_id,
          field: fs.field,
          text,
          display: fs.feature_id == 1 ? fs.filter_type : 'dropdown',
          status: fs.status == 1 || fs.active == 1 ? true : false,
          select_text: fs.select_text,
        }

        if(fs.field == 'category') {
          this.selectedFilter = fs.filter_type;
        }
        
        this.filterSettings.push(filter)
      })
    }
  }

  saveFilter() {
    this._companyService.editModuleFilterSettings({
      company_id: this.companyId,
      feature_id: this.id,
      filter_settings: this.filterSettings
    })
    .subscribe(
      response => {
        this.initializeFilterSettings(this.id);
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
        this.closesettingmodalbutton?.nativeElement?.click();
      },
      error => {
        console.log(error)
      }
    )
  }

  handleFilterChange(event) {
    if(event.target.value) {
      this.selectedFilter = event?.target?.value;
      if(this.filterSettings?.length > 0) {
        this.filterSettings?.forEach(setting => {
          if(setting.field == 'category') {
            setting.display = this.selectedFilter;
            setting.filter_type = this.selectedFilter;
          }
        })
      }
    }
  }

  getFeatureTitle() {
    return this.language == 'en' ? this.featureNameEn : 
      (this.language == 'fr' ? this.featureNameFr : 
      (this.language == 'eu' ? (this.featureNameEu || this.featureNameEs) : 
      (this.language == 'ca' ? (this.featureNameCa || this.featureNameEs) : 
      (this.language == 'de' ? (this.featureNameDe || this.featureNameEs) : 
      (this.language == 'it' ? (this.featureNameIt || this.featureNameEs) : 
      this.featureNameEs
    )))))
  }

  getOtherFeatureTitle(feature) {
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

  getMinimumBalance() {
    this._professionalsService.getMinimumBalance(this.companyId)
      .subscribe(
        async (response) => {
          this.professionalSettings = response.settings;
          if(this.professionalSettings) {
            this.minimumBalance = this.professionalSettings.minimum_balance || '';
          }
          this.showMinimumBalanceModal = true;
        },
        error => {
          console.log(error)
        }
      )
  }

  saveMinimumBalance() {
    if(this.minimumBalance) {
      let params = {
        company_id: this.companyId,
        minimum_balance: this.minimumBalance
      }
      this._professionalsService.updateMinimumBalance(params)
      .subscribe(
        response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          this.showMinimumBalanceModal = false;
          this.closesettingmodalbutton?.nativeElement.click();
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  changeTab(event) {
    this.tabSelected = true;
  }

  getPaymentMethods() {
    this._professionalsService.getAccountRechargeData(this.companyId)
      .subscribe(
        async (response) => {
          this.paymentMethods = response.payment_methods;
          if(this.paymentMethods) {
            this.activeStripe = this.paymentMethods?.stripe == 1 ? true : false;
            this.activePayPal = this.paymentMethods?.paypal == 1 ? true : false;
            this.paypalClientID = this.paymentMethods?.paypal_client_id;
            this.paypalSecret = this.paymentMethods?.paypal_secret;
            this.stripePublicKey = this.paymentMethods?.stripe_public_key;
            this.stripeSecretKey = this.paymentMethods?.stripe_secret_key;
          }
          this.showPaymentMethodsModal = true;
        },
        error => {
          console.log(error)
        }
      )
  }

  saveStripeSettings() {
    let params = {
      company_id: this.companyId,
      stripe: this.activeStripe ? 1 : 0,
      stripe_public_key: this.stripePublicKey,
      stripe_secret_key: this.stripeSecretKey,
    }
    this._professionalsService.editStripePayment(params)
    .subscribe(
      response => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
      },
      error => {
        console.log(error)
      }
    )
  }

  savePayPalSettings() {
    let params = {
      company_id: this.companyId,
      paypal: this.activePayPal ? 1 : 0,
      paypal_client_id: this.paypalClientID,
      paypal_secret: this.paypalSecret,
    }
    this._professionalsService.editPayPalPayment(params)
    .subscribe(
      response => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
      },
      error => {
        console.log(error)
      }
    )
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