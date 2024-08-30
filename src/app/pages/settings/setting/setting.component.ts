import { CommonModule, Location, NgOptimizedImage } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import {
  BreadcrumbComponent,
  ToastComponent,
} from "@share/components";
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
import { MenuService } from "@lib/services";
import { QuillModule } from "ngx-quill";
import { ColorPickerModule } from 'ngx-color-picker';
import { initFlowbite } from "flowbite";
import {
  ImageCropperModule,
  ImageCroppedEvent,
  ImageTransform,
  base64ToFile,
} from "ngx-image-cropper";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faRotateLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import leftImagesData from 'src/assets/data/left-images.json';
import get from "lodash/get";
import { LeftImage } from "@lib/interfaces";

@Component({
  selector: "app-setting",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
    ImageCropperModule,
    MatSnackBarModule,
    ColorPickerModule,
    FontAwesomeModule,
    SearchComponent,
    BreadcrumbComponent,
    ToastComponent,
    NgOptimizedImage
  ],
  templateUrl: "./setting.component.html",
})
export class SettingComponent {
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
  searchKeyword: any;

  leftImages: LeftImage[] = leftImagesData;
  setting: any
  settings: any
  settings2: any

  companyImage: any
  companyDomain: any
  banner: any
  logoImageSrc: string = environment.api +  '/get-image-company/'
  logoImgSrc: any
  logoImageFile: any
  companyLogoFile: any
  bannerImgSrc: any
  bannerImageFile: any
  bannerFile: any
  showLogoImageCropper: boolean = false
  logoImageChangedEvent: any
  logoCroppedImage: any
  uploadedLogoSrc: any
  logoCanvasRotation = 0
  logoRotation = 0
  logoScale = 1
  logoTransform: ImageTransform = {};
  showBannerImageCropper: boolean = false
  bannerImageChangedEvent: any
  bannerCroppedImage: any
  uploadedBannerSrc: any
  bannerCanvasRotation = 0
  bannerRotation = 0
  bannerScale = 1
  bannerTransform: ImageTransform = {};
  logoFile: any

  companyBannerImage: any
  companyPageImage: any
  logoPageImgSrc: any
  logoPageImageFile: any
  companyLogoPageFile: any
  showLogoPageImageCropper: boolean = false
  logoPageImageChangedEvent: any
  uploadedLogoPageSrc: any
  logoPageCroppedImage: any
  logoPageCanvasRotation = 0
  logoPageRotation = 0
  logoPageScale = 1
  logoPageTransform: ImageTransform = {};

  showValueModal: boolean = false
  selectedSettingId: any
  selectedSettingValue: any
  newValue: any

  hasGuestAccess: boolean = false
  hasDashboard: boolean = false
  dashboardDetails: any = []
  dashboardTitleEs: any
  dashboardTitleEn: any
  dashboardTitleFr: any
  dashboardTitleEu: any
  dashboardTitleCa: any
  dashboardTitleDe: any
  dashboardActive: boolean = false
  homeActive: boolean = false
  dashboardSections: any = []
  membersOnly: boolean = false
  showSloganFields: boolean = false
  photoSrc: any = 'https://dummyimage.com/360x320/ffffff/000000.jpg'
  apiPath: string = environment.api +  '/get-image-company/'
  dashboardSectionOptions: any = []
  allDashboardSectionOptions: any = []
  addSection: boolean = false
  newSectionTitleEs: any
  newSectionTitleEn: any
  newSectionTitleFr: any
  newSectionTitleEu: any
  newSectionTitleCa: any
  newSectionTitleDe: any
  newSectionSloganText: any
  newSectionSloganURL: any
  showPhotoImageCropper: boolean = false
  photoImageChangedEvent: any
  photoCroppedImage: any;
  photoFile: any;
  slogan: boolean = false

  showUserRolesModal: boolean = false
  dropdownSettings = {}
  userRolesTitle: any
  userRoles: any = []
  selectedUserRoles: any

  showManageGroupModal: boolean = false
  manageGroupTitle: any
  selectedGroup: any
  selectedAdmin: any
  groups: any = []
  members: any = []

  isTermsAndConditions: boolean = false
  isPrivacyPolicy: boolean = false
  isCookiePolicy: boolean = false
  canShowTermsAndConditions: boolean = false
  canShowPrivacyPolicy: boolean = false
  canShowCookiePolicy: boolean = false
  termsAndConditions: any
  termsAndConditionsEn: any
  termsAndConditionsFr: any
  privacyPolicy: any
  privacyPolicyEn: any
  privacyPolicyFr: any
  cookiePolicy: any
  cookiePolicyEn: any
  cookiePolicyFr: any
  cookiePolicyEu: any
  cookiePolicyCa: any
  cookiePolicyDe: any
  termsAndConditionsURL: any
  termsAndConditionsURLEn: any
  termsAndConditionsURLFr: any
  termsAndConditionsURLEu: any
  termsAndConditionsURLCa: any
  termsAndConditionsURLDe: any
  privacyPolicyURL: any
  privacyPolicyURLEn: any
  privacyPolicyURLFr: any
  privacyPolicyURLEu: any
  privacyPolicyURLCa: any
  privacyPolicyURLDe: any
  cookiePolicyURL: any
  cookiePolicyURLEn: any
  cookiePolicyURLFr: any
  cookiePolicyURLEu: any
  cookiePolicyURLCa: any
  cookiePolicyURLDe: any
  showPolicyURLModal: boolean = false
  policyURLMode: any
  urlValue: any
  urlValueEn: any
  urlValueFr: any
  urlValueEu: any
  urlValueCa: any
  urlValueDe: any
  hasCustomMemberTypeSettings: boolean = false
  fieldType: any = ''
  selectedReferralRateType: any = ''

  showManageLinkAccess: boolean = false
  linkAccessText: any
  subfooter: any
  guestHome: boolean = false
  signupMemberSelection: boolean = false
  canShowLinkAccess: boolean = false
  plansTitle: any
  clubsTitle: any
  hasLandingTemplate: boolean = false
  landingTemplateEnabled: boolean = false
  hasPredefinedTemplate: boolean = false
  predefinedTemplateEnabled: boolean = false
  languages: any = []
  selectedLanguage: any = ''
  isFrenchEnabled: boolean = false
  isEnglishEnabled: boolean = false
  isBasqueEnabled: boolean = false
  isCatalanEnabled: boolean = false
  isGermanEnabled: boolean = false
  webhooks: any = []
  hasCustomInvoice: boolean = false
  showEditHomeTextModal: boolean = false
  selectedSetting: any
  selectedSettingTitle: any = ''
  homeTextValue: any
  homeTextValueEn: any
  homeTextValueFr: any
  homeTextValueEu: any
  homeTextValueCa: any
  homeTextValueDe: any
  showEditNewMenuButtonModal: boolean = false
  newMenuButtonTextValue: any
  newMenuButtonTextValueEn: any
  newMenuButtonTextValueFr: any
  newMenuButtonTextValueEu: any
  newMenuButtonTextValueCa: any
  newMenuButtonTextValueDe: any
  newMenuButtonUrl: any

  headerLogoWidth: number = 180
  headerLogoHeight: number = 50
  footerLogoWidth: number = 180
  footerLogoHeight: number = 50

  uploadedFaviconSrc: any
  faviconImage: any
  faviconImgSrc: any
  cancelledFaviconUpload: boolean = false
  showFaviconImageCropper: boolean = false
  faviconImageChangedEvent: any
  faviconCroppedImage: any
  faviconCanvasRotation = 0
  faviconRotation = 0
  faviconScale = 1
  faviconTransform: ImageTransform = {};
  @ViewChild('faviconFileInput') faviconFileInput: any

  connecting: boolean = false
  stripeAccountId: any
  connectError: any = ''
  isVisibleConnectDetails: boolean = false
  memberTypes: any = []
  cancelledLogoUpload: boolean = false
  cancelledLogoPageUpload: boolean = false
  companyFaviconFile: any;
  @ViewChild('logoFileInput') logoFileInput: any
  @ViewChild('logoPageFileInput') logoPageFileInput: any

  qaAccessSettingActive: boolean = false
  generalMemberReplySettingActive: boolean = false
  wallSettings: any
  modalTextNumber: any = 1
  modalTextValues: any = []

  showEditCourseWallPrefixModal: boolean = false
  courseWallPrefixTextValue: any
  courseWallPrefixTextValueEn: any
  courseWallPrefixTextValueFr: any
  courseWallPrefixTextValueEu: any
  courseWallPrefixTextValueCa: any
  courseWallPrefixTextValueDe: any
  hasActivityFeed: boolean = false

  showContactUsModal: boolean = false
  contactUsDetails: any
  contactUsText: any
  contactUsTextEn: any
  contactUsTextFr: any
  contactUsTextEu: any
  contactUsTextCa: any
  contactUsTextDe: any
  contactUsEmailAddress: any
  plansFeature: any;
  plansFeatureId: any;
  clubsFeature: any;
  clubsFeatureId: any;
  rotateLeftIcon = faRotateLeft;
  rotateRightIcon = faRotateRight;
  dialogMode: string = "";
  dialogTitle: any;
  selectedSettingItem: any;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

  newURLButtonTextValue: any;
  newURLButtonTextValueEn: any;
  newURLButtonTextValueFr: any;
  newURLButtonTextValueEu: any;
  newURLButtonTextValueCa: any;
  newURLButtonTextValueDe: any;
  newURLButtonUrl: any;
  selectedPrivacySettingOption: any = '';
  termsAndConditionsOption: any;
  cookiePolicyOption: any;
  privacyPolicyOption: any;

  selectedNavigation: any = 'side-menu';

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _menuService: MenuService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
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
        this.domain = company[0].domain
        this.companyId = company[0].id
        this.companyDomain = company[0].domain
        this.companyImage = company[0].image
        this.faviconImage = company[0].favicon_image || company[0].image
        this.companyPageImage = company[0].photo || company[0].image
        this.companyBannerImage = company[0].video
        this.primaryColor = company[0].primary_color
        this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
        this.termsAndConditions = company[0].terms_and_conditions
        this.termsAndConditionsEn = company[0].terms_and_conditions_en
        this.termsAndConditionsFr = company[0].terms_and_conditions_fr
        this.privacyPolicy = company[0].policy
        this.privacyPolicyEn = company[0].policy_en
        this.privacyPolicyFr = company[0].policy_fr
        this.cookiePolicy = company[0].cookie_policy
        this.cookiePolicyEn = company[0].cookie_policy_en
        this.cookiePolicyFr = company[0].cookie_policy_fr
        this.canShowTermsAndConditions = company[0].show_terms == 1 ? true : false
        this.canShowPrivacyPolicy = company[0].show_privacy_policy == 1 ? true : false
        this.canShowCookiePolicy = company[0].show_cookie_policy == 1 ? true : false
        this.termsAndConditionsURL = company[0].terms_and_conditions_url
        this.termsAndConditionsURLEn = company[0].terms_and_conditions_url_en
        this.termsAndConditionsURLFr = company[0].terms_and_conditions_url_fr
        this.termsAndConditionsURLEu = company[0].terms_and_conditions_url_eu
        this.termsAndConditionsURLCa = company[0].terms_and_conditions_url_ca
        this.termsAndConditionsURLDe = company[0].terms_and_conditions_url_de
        this.termsAndConditionsOption = company[0].terms_and_conditions_option
        this.privacyPolicyURL = company[0].privacy_policy_url
        this.privacyPolicyURLEn = company[0].privacy_policy_url_en
        this.privacyPolicyURLFr = company[0].privacy_policy_url_fr
        this.privacyPolicyURLEu = company[0].privacy_policy_url_eu
        this.privacyPolicyURLCa = company[0].privacy_policy_url_ca
        this.privacyPolicyURLDe = company[0].privacy_policy_url_de
        this.privacyPolicyOption = company[0].privacy_policy_option
        this.cookiePolicyURL = company[0].cookie_policy_url
        this.cookiePolicyURLEn = company[0].cookie_policy_url_en
        this.cookiePolicyURLFr = company[0].cookie_policy_url_fr
        this.cookiePolicyURLEu = company[0].cookie_policy_url_eu
        this.cookiePolicyURLCa = company[0].cookie_policy_url_ca
        this.cookiePolicyURLDe = company[0].cookie_policy_url_de
        this.cookiePolicyOption = company[0].cookie_policy_option
        this.homeTextValue = company[0].home_text || 'Inicio'
        this.homeTextValueEn = company[0].home_text_en || 'Home'
        this.homeTextValueFr = company[0].home_text_fr || 'Maison'
        this.homeTextValueEu = company[0].home_text_eu || 'Hasi'
        this.homeTextValueCa = company[0].home_text_ca || 'Inici'
        this.homeTextValueDe = company[0].home_text_de || 'Anfang'
        this.newMenuButtonUrl= company[0].new_menu_button_url
        this.newMenuButtonTextValue = company[0].new_menu_button_text
        this.newMenuButtonTextValueEn = company[0].new_menu_button_text_en
        this.newMenuButtonTextValueFr = company[0].new_menu_button_text_fr
        this.newMenuButtonTextValueEu = company[0].new_menu_button_text_eu
        this.newMenuButtonTextValueCa = company[0].new_menu_button_text_ca
        this.newMenuButtonTextValueDe = company[0].new_menu_button_text_de
        this.courseWallPrefixTextValue = company[0].course_wall_prefix_text
        this.courseWallPrefixTextValueEn = company[0].course_wall_prefix_text_en
        this.courseWallPrefixTextValueFr = company[0].course_wall_prefix_text_fr
        this.courseWallPrefixTextValueEu = company[0].course_wall_prefix_text_eu
        this.courseWallPrefixTextValueCa = company[0].course_wall_prefix_text_ca
        this.courseWallPrefixTextValueDe = company[0].course_wall_prefix_text_de
        this.headerLogoWidth = company[0].header_logo_width
        this.headerLogoHeight = company[0].header_logo_height
        this.footerLogoWidth = company[0].footer_logo_width
        this.footerLogoHeight = company[0].footer_logo_height
        this.homeActive = company[0].show_home_menu == 1 ? true : false
        this.newURLButtonUrl= company[0].new_url_button_url
        this.newURLButtonTextValue = company[0].new_url_button_text
        this.newURLButtonTextValueEn = company[0].new_url_button_text_en
        this.newURLButtonTextValueFr = company[0].new_url_button_text_fr
        this.newURLButtonTextValueEu = company[0].new_url_button_text_eu
        this.newURLButtonTextValueCa = company[0].new_url_button_text_ca
        this.newURLButtonTextValueDe = company[0].new_url_button_text_de
  
        if(company[0].landing_template == 1) {
          this.hasLandingTemplate = true
          this.landingTemplateEnabled = true
        } else {
          this.landingTemplateEnabled = false
        }
  
        if(company[0].predefined_template == 1) {
          this.hasPredefinedTemplate = true
          this.predefinedTemplateEnabled = true
        } else {
          this.predefinedTemplateEnabled = false
        }
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
    this.initializeSearch();
    this.fetchSettingsData();
  }

  initData() {
    this.dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: this.language == 'en' ? 'name_EN' : 'name_ES',
        limitSelection: 4,
        itemsShowLimit: 4,
        allowSearchFilter: true,
        searchPlaceholderText: this._translateService.instant('guests.search'),
      }
  
      this.userRoles = [
        {
          id: 1,
          name_EN: 'Member',
          name_ES: 'Miembro',
        },
        {
          id: 2,
          name_EN: 'Admin 1',
          name_ES: 'Admin 1',
        },
        {
          id: 3,
          name_EN: 'Admin 2',
          name_ES: 'Admin 2',
        },
        {
          id: 4,
          name_EN: 'Super Admin',
          name_ES: 'Super Admin',
        }
      ]
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchSettingsData() {
    this._companyService.fetchManageSettingsData(this.id, this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
            this.mapFeatures(data?.features_mapping);
            this.mapSettings(data);
            this.mapCategorySettings(data);
            this.initializeLanguages(data?.languages);
            this.initializeBreadcrumb();
        },
        error => {
          console.log(error)
        }
      )
  }

  initializeLanguages(languages) {
    this.languages = languages ? languages.filter(lang => { return lang.status == 1 }) : []

    if(this.languages) {
        let french = this.languages.filter(lang => { return lang.code == 'fr' && lang.status == 1 })
        this.isFrenchEnabled = french && french[0] ? true : false

        let english = this.languages.filter(lang => { return lang.code == 'en' && lang.status == 1 })
        this.isEnglishEnabled = english && english[0] ? true : false

        let basque = this.languages.filter(lang => { return lang.code == 'eu' && lang.status == 1 })
        this.isBasqueEnabled = basque && basque[0] ? true : false

        let catalan = this.languages.filter(lang => { return lang.code == 'ca' && lang.status == 1 })
        this.isCatalanEnabled = catalan && catalan[0] ? true : false

        let german = this.languages.filter(lang => { return lang.code == 'de' && lang.status == 1 })
        this.isGermanEnabled = german && german[0] ? true : false
    }
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this.getCategoryLabel();
    this.level3Title = this.getSettingsTitle();
    this.level4Title = "";
  }

  mapFeatures(features) {
    this.plansFeature = features?.find((f) => f.feature_id == 1);
    this.plansFeatureId = this.plansFeature?.feature_id;
    this.plansTitle = this.plansFeature
      ? this.getFeatureTitle(this.plansFeature)
      : "";

    this.clubsFeature = features?.find(
      (f) => f.feature_id == 5 && f.status == 1
    );
    this.clubsFeatureId = this.clubsFeature?.feature_id;
    this.clubsTitle = this.clubsFeature
      ? this.getFeatureTitle(this.clubsFeature)
      : "";
  }

  mapSettings(data) {
    let other_settings = data?.all_other_settings;
    if (other_settings?.length) {
      this.hasActivityFeed = other_settings.some(
        (a) => a.title_en == "Activity feed" && a.active == 1
      );
      this.hasGuestAccess = other_settings.some(
        (a) => a.title_en == "Guest access" && a.active == 1
      );
      this.canShowLinkAccess = other_settings.some(
        (a) => a.title_en == "Links access to terms and policies" && a.active == 1
      );
      this.hasCustomMemberTypeSettings = other_settings.some(
        (a) => a.title_en == "Require Stripe payment on specific member types" && a.active == 1
      );
      this.hasCustomInvoice = other_settings.some(
        (a) => a.title_en == "Custom invoice" && a.active == 1
      );

    
      if(this.canShowLinkAccess) {
        this.subfooter = data?.subfooter
        this.linkAccessText = this.subfooter?.subfooter_text ? this.subfooter?.subfooter_text : ''
        this.guestHome = this.subfooter?.guest_home ? this.subfooter?.guest_home : 0
        this.signupMemberSelection = this.subfooter?.signup_member_selection ? this.subfooter?.signup_member_selection : 0
      }
    }
  }

  mapCategorySettings(data) {
    this.setting = data?.setting ? (data?.setting?.setting?.length > 0 ? data?.setting?.setting[0] : '') : {}
    if(this.setting && this.setting.category_en == 'Branding') {
        this.banner = data?.banner?.data;
    }

    let other_settings = data?.other_settings
    if(other_settings) {
        other_settings.content = other_settings?.content.filter(ots => {
            return ots.title_en != 'Different welcome email template for members'
        })
        this.settings = other_settings.content
        this.settings = this.removeUnusedSettings(this.settings);
        this.settings2 = other_settings.content

        let multipleStripeAccountSeeting = this.settings.some(a => a.title_en == 'Multiple Stripe Accounts' && a.active == 1)
        if(multipleStripeAccountSeeting){
            this.settings = this.settings.filter((setting) => {
                return setting.title_en == 'Multiple Stripe Accounts'
            })
        }
    }
  }

  removeUnusedSettings(settings) {
    return settings?.filter(setting => {
      return setting.title_en != 'Quizzes' && 
      setting.title_en != 'Banner image link' &&
      setting.title_en != 'Monday as calendar start day' &&
      setting.title_en != 'Links access to terms and policies' && 
      setting.title_en != 'Contact Us' &&
      setting.title_en != 'Supported languages' &&
      setting.title_en != 'Section title and dividing line'
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

  getCategoryLabel() {
    let categoryLabel
    if(this.setting) {
      if(this.setting.category_en == 'Others' || 
        this.setting.category_en == 'Customize design' ||
        this.setting.category_en == 'Personal settings' || 
        this.setting.category_en == 'Company details'
      ) {
        categoryLabel = this._translateService.instant('company-settings.general')
      } else if(this.setting.category_en == 'User profiles' ||
        this.setting.category_en == 'Profile'
      ) {
        categoryLabel = this._translateService.instant('company-settings.users')
      } else if(this.setting.category_en == 'Registration' ||
        this.setting.category_en == 'MemberTypes' || 
        this.setting.category_en == 'Offers'
      ) {
        categoryLabel = this._translateService.instant('company-settings.adminaccess')
      } else if(this.setting.category_en == 'Customize home screen') {
        categoryLabel = this._translateService.instant('company-settings.adminaccess')
      } else if(this.setting.category_en == 'Dashboard') {
        categoryLabel = this._translateService.instant('company-settings.personalization')
      } else if(this.setting.category_en == 'Notifications' ||
        this.setting.category_en == 'Wall' ||
        this.setting.category_en == 'Domain'
      ) {
        categoryLabel = this._translateService.instant('company-settings.channels')
      } else if(this.setting.category_en == 'Events' ||
        this.setting.category_en == 'Groups'
      ) {
        categoryLabel = this._translateService.instant('company-settings.personalization')
      } else if(this.setting.category_en == 'Stripe' ||
        this.setting.category_en == 'Invoices' || 
        this.setting.category_en == 'Affiliate Commissions' ||
        this.setting.category_en == 'MLM' ||
        this.setting.category_en == 'Member Commissions'
      ) {
        categoryLabel = this._translateService.instant('company-settings.invoice')
      } else if(this.setting.category_en == 'Gamification' ||
        this.setting.category_en == 'Surveys Home' || 
        this.setting.category_en == 'Landings'
      ) {
        categoryLabel = this._translateService.instant('company-settings.tools')
      } else if(this.setting.category_en == 'Affiliates' ||
        this.setting.category_en == 'RRSS Templates'
      ) {
        categoryLabel = this._translateService.instant('company-settings.affiliation')
      } else if(this.setting.category_en == 'Notifications List' ||
        this.setting.category_en == 'Automated Emails'
      ) {
        categoryLabel = this._translateService.instant('company-settings.communication')
      } else if(this.setting.category_en == 'Import' ||
      this.setting.category_en == 'Export' ||
      this.setting.category_en == 'Data Backup' ||
      this.setting.category_en == 'Storage' ||
      this.setting.category_en == 'Recycle Bin'
    ) {
      categoryLabel = this._translateService.instant('company-settings.dataadministration')
    }

      if(this.id == 9) {
        categoryLabel = this._translateService.instant('company-settings.communication')
      }
    }

    if(this.id == 10) {
      categoryLabel = this._translateService.instant('company-settings.others')
    }
    return categoryLabel
  }

  getSettingsTitle() {
    let title = ''

    if(this.setting) {
      title = this.language == 'en' ? this.setting.category_en : (this.language == 'fr' ? this.setting.category_fr : 
        (this.language == 'eu' ? this.setting.category_eu : (this.language == 'ca' ? this.setting.category_ca : 
        (this.language == 'de' ? this.setting.category_de : this.setting.category_es)))
      )
      if(this.setting.category_en == 'Events' ||
        this.setting.category_en == 'Groups'
      ) {
        title = `${this._translateService.instant('company-settings.parameterize')} ${this.setting.category_en == 'Events' ? this.plansTitle : (this.setting.category_en == 'Groups' ? this.clubsTitle : title)}`
      }
      if(this.setting.category_en == 'Others') {
        title = this._translateService.instant('company-settings.companydetails')
      } else if(this.setting.category_en == 'Notifications') {
        title = this._translateService.instant('company-settings.email')
      } else if(this.setting.category_en == 'Dashboard') {
        title = this._translateService.instant('company-settings.agenda')
      }
    }

    if(this.id == 9) {
      title = this._translateService.instant('company-settings.automaticemails')
    }

    if(this.id == 10) {
      title = ''
      title = this._translateService.instant('company-settings.others')
    }
    
    return title
  }

  getSettingItemTitle(item) {
    return this.language == 'en' ? item.title_en : (this.language == 'fr' ? item.title_fr : 
      (this.language == 'eu' ? item.title_eu : (this.language == 'ca' ? item.title_ca : 
      (this.language == 'de' ? item.title_de : (this.language == 'it' ? item.title_it : item.title_es)
      )))
    )
  }

  getSettingItemDescription(item) {
    return this.language == 'en' ? item.description_en : (this.language == 'fr' ? item.description_fr : 
      (this.language == 'eu' ? item.description_eu : (this.language == 'ca' ? item.description_ca : 
      (this.language == 'de' ? item.description_de : (this.language == 'it' ? item.description_it : item.description_es)
      )))
    )
  }

  getSettingTitle(setting) {
    this.selectedSetting = setting
    if(this.selectedSetting) {
      this.selectedSettingTitle = this.language == 'en' ? (this.selectedSetting.title_en ? (this.selectedSetting.title_en || this.selectedSetting.title_es) : this.selectedSetting.title_es) :
        (this.language == 'fr' ? (this.selectedSetting.title_fr ? (this.selectedSetting.title_fr || this.selectedSetting.title_es) : this.selectedSetting.title_es) : 
          (this.language == 'eu' ? (this.selectedSetting.title_eu ? (this.selectedSetting.title_eu || this.selectedSetting.title_es) : this.selectedSetting.title_es) : 
              (this.language == 'ca' ? (this.selectedSetting.title_ca ? (this.selectedSetting.title_ca || this.selectedSetting.title_es) : this.selectedSetting.title_es) : 
                  (this.language == 'de' ? (this.selectedSetting.title_de ? (this.selectedSetting.title_de || this.selectedSetting.title_es) : this.selectedSetting.title_es) : 
                    (this.language == 'it' ? (this.selectedSetting.title_it ? (this.selectedSetting.title_it || this.selectedSetting.title_es) : this.selectedSetting.title_es) : this.selectedSetting.title_es)
              ))
          )
        )
    }
  }

  goToEmailTemplate(type) {
    let id = this.id
    if(type == 'register' || type == 'confirm_email') {
      id = 9;
    }
    this._router.navigate([`/settings/email/${id}/${type}`])
  }

  manageLinkAccessSettings() {
    // this.showManageLinkAccess = true
  }

  closeManageLinkAccess() {
    // this.showManageLinkAccess = false
  }

  manageOrder() {
    this._router.navigate([`/settings/menu-order`])
  }

  public onEventLog(event: string, data: any, item: any): void {
    if(data && event == 'colorPickerClose') {
      let params = {
        value: data,
        company_id: this.companyId
      }
      this._companyService.updateOtherSettingValue(item.id, params)
      .subscribe(
        async response => {
          await this.setMainService()
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  async setMainService(reload: boolean = true) {
    this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies')
    this._companyService.getCompany(this.companies)
    if(reload) { location.reload() }
  }

  changeValue(id, value, type = '') {
    if(type.indexOf('text') >= 0 && type.length > 4){
      this.modalTextNumber = type.substring(4);
      this.modalTextValues = value.split(',');
    }else {
      this.modalTextNumber = 1
      this.modalTextValues = []
    }
    this.showValueModal = true
    this.selectedSettingId = id
    this.selectedSettingValue = value
    this.newValue = value
    this.fieldType = type
    this.selectedReferralRateType = type == 'select' ? value : ''

    this.dialogMode = "update-value";
    let setting_row = this.settings?.filter(setting => {
      return setting.id == this.selectedSettingId
    })
    this.selectedSettingItem = {};
    if(setting_row?.length > 0) {
      this.selectedSettingItem = setting_row[0];
      this.getSettingTitle(setting_row[0]); 
    }
    this.dialogTitle =  this.selectedSettingTitle
    this.dialogTitle = this.selectedSettingTitle || this._translateService.instant('company-settings.updatevalue');
    this.modalbutton?.nativeElement.click();
  }

  toggleChange(event, item) {
    if(event?.target?.checked) {
      if(this.settings) {
        this.settings.forEach(setting => {
          if(setting.id == item.id) {
            setting.active = 1
          }
        })
      }
      this._companyService.activateOtherSetting(item.id, this.companyId, {})
      .subscribe(
          async response => {
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '')

            switch(item.title_en) {
              case 'New menu button':
                this.reloadMenu('add-new-menu');
                break;
              case 'New URL button':
                this.reloadMenu('add-new-url');
                break;
              case 'Footer':
                location.reload();
                break;
            }
          },
          error => {
              console.log(error)
          }
      )
    } else {
      if(this.settings) {
        this.settings.forEach(setting => {
          if(setting.id == item.id) {
            setting.active = 0
          }
        })
      }
      this._companyService.deactivateOtherSetting(item.id, this.companyId, {})
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')

          switch(item.title_en) {
            case 'New menu button':
              this.reloadMenu('remove-new-menu');
              break;
            case 'New URL button':
              this.reloadMenu('remove-new-url');
              break;
            case 'Footer':
              location.reload();
              break;
          }
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  openEditHomeTextModal(setting) {
    this.getSettingTitle(setting)
    // this.showEditHomeTextModal = true
  }

  openEditNewMenuButtonModal(setting) {
    this.dialogMode = "new-menu";
    this.getSettingTitle(setting);
    this.dialogTitle =  this.selectedSettingTitle
    this.modalbutton?.nativeElement.click();
  }

  openEditNewURLButtonModal(setting) {
    this.dialogMode = "new-url";
    this.getSettingTitle(setting);
    this.dialogTitle =  this.selectedSettingTitle
    this.modalbutton?.nativeElement.click();
  }

  saveNewURLButton() {
    if(!this.newURLButtonTextValue) {
      return false
    }

    let params = {
      company_id: this.companyId,
      new_url_button_text: this.newURLButtonTextValue,
      new_url_button_text_en: this.newURLButtonTextValueEn || this.newURLButtonTextValue,
      new_url_button_text_fr: this.newURLButtonTextValueFr || this.newURLButtonTextValue,
      new_url_button_text_eu: this.newURLButtonTextValueEu || this.newURLButtonTextValue,
      new_url_button_text_ca: this.newURLButtonTextValueCa || this.newURLButtonTextValue,
      new_url_button_text_de: this.newURLButtonTextValueDe || this.newURLButtonTextValue,
      new_url_button_url: this.newURLButtonUrl,
    }
    this._companyService.saveNewURLButton(params)
      .subscribe(
        async (response) => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          this.dialogMode = '';
          this.closemodalbutton?.nativeElement.click();
          this.reloadMenu();
        },
        error => {
          console.log(error)
        }
      )
  }

  saveNewMenuButton() {
    if(!this.newMenuButtonTextValue) {
      return false
    }

    let params = {
      company_id: this.companyId,
      new_menu_button_text: this.newMenuButtonTextValue,
      new_menu_button_text_en: this.newMenuButtonTextValueEn || this.newMenuButtonTextValue,
      new_menu_button_text_fr: this.newMenuButtonTextValueFr || this.newMenuButtonTextValue,
      new_menu_button_text_eu: this.newMenuButtonTextValueEu || this.newMenuButtonTextValue,
      new_menu_button_text_ca: this.newMenuButtonTextValueCa || this.newMenuButtonTextValue,
      new_menu_button_text_de: this.newMenuButtonTextValueDe || this.newMenuButtonTextValue,
      new_menu_button_url: this.newMenuButtonUrl,
    }
    this._companyService.saveNewMenuButton(params)
      .subscribe(
        async (response) => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          this.dialogMode = '';
          this.closemodalbutton?.nativeElement.click();
          this.reloadMenu();
        },
        error => {
          console.log(error)
        }
      )
  }

  reloadMenu(mode: string = '') {
    let menus = this._localService.getLocalStorage(
      environment.lsmenus
    )
      ? JSON.parse(
          this._localService.getLocalStorage(environment.lsmenus)
        )
      : [];
    if (menus?.length > 0) {
      let new_menus: any[] = [];

      switch(mode) {
        case 'remove-new-menu':
          if (menus?.length > 0) {
            new_menus = menus;
            new_menus.forEach((menu, index) => {
              if (menu.new_button == 1) {
                new_menus.splice(index, 1);
              }
            });
          } 
          menus = new_menus;
          break;
        case 'remove-new-url':
          if (menus?.length > 0) {
            new_menus = menus;
            new_menus.forEach((menu, index) => {
              if (menu.new_url == 1) {
                new_menus.splice(index, 1);
              }
            });
          } 
          menus = new_menus;
          break;
        case 'add-new-menu':
          menus.push({
            id: menus?.length + 100,
            path: this.newMenuButtonUrl,
            new_button: 1,
            name: this.newMenuButtonTextValueEn || this.newMenuButtonTextValue,
            name_ES: this.newMenuButtonTextValue,
            name_FR: this.newMenuButtonTextValueFr || this.newMenuButtonTextValue,
            name_EU: this.newMenuButtonTextValueEu || this.newMenuButtonTextValue,
            name_CA: this.newMenuButtonTextValueCa || this.newMenuButtonTextValue,
            name_DE: this.newMenuButtonTextValueDe || this.newMenuButtonTextValue,
            show: true,
            sequence: menus?.length + 1,
          });
          break;
        case 'add-new-url':
          menus.push({
            id: menus?.length + 100,
            path: this.newURLButtonUrl,
            new_url: 1,
            name: this.newURLButtonTextValueEn || this.newURLButtonTextValue,
            name_ES: this.newURLButtonTextValue,
            name_FR: this.newURLButtonTextValueFr || this.newURLButtonTextValue,
            name_EU: this.newURLButtonTextValueEu || this.newURLButtonTextValue,
            name_CA: this.newURLButtonTextValueCa || this.newURLButtonTextValue,
            name_DE: this.newURLButtonTextValueDe || this.newURLButtonTextValue,
            show: true,
            sequence: menus?.length + 1,
          });
          break;
        default:
          menus.forEach((menu, index) => {
            if (
              menu.new_button == 1
            ) {
              menu.name = this.newMenuButtonTextValueEn || this.newMenuButtonTextValue
              menu.name_CA = this.newMenuButtonTextValueCa || this.newMenuButtonTextValue
              menu.name_DE = this.newMenuButtonTextValueDe || this.newMenuButtonTextValue
              menu.name_ES = this.newMenuButtonTextValue
              menu.name_EU = this.newMenuButtonTextValueEu || this.newMenuButtonTextValue
              menu.name_FR = this.newMenuButtonTextValueFr || this.newMenuButtonTextValue
              menu.path = this.newMenuButtonUrl
            }

            if (
              menu.new_url == 1
            ) {
              menu.name = this.newURLButtonTextValueEn || this.newURLButtonTextValue,
              menu.name_ES = this.newURLButtonTextValue,
              menu.name_FR = this.newURLButtonTextValueFr || this.newURLButtonTextValue,
              menu.name_EU = this.newURLButtonTextValueEu || this.newURLButtonTextValue,
              menu.name_CA = this.newURLButtonTextValueCa || this.newURLButtonTextValue,
              menu.name_DE = this.newURLButtonTextValueDe || this.newURLButtonTextValue,
              menu.path = this.newURLButtonUrl
            }
          });
          break;
      }
    }

    this.setMainService(false)
    this._menuService.updateMenu(menus);
  }

  saveDialog() {
    if(this.dialogMode == 'new-menu') {
      this.saveNewMenuButton();
    } else if(this.dialogMode == 'policy-url') {
      this.saveURLValue();
    } else if(this.dialogMode == 'update-value') {
      this.saveValue();
    } if(this.dialogMode == 'new-url') {
      this.saveNewURLButton();
    } 
  }

  saveValue() {
    let updatedStripeKeys = false
    if(this.selectedSettingValue && this.newValue && this.newValue != this.selectedSettingValue && this.selectedSettingValue.indexOf('sk_') >= 0) {
      updatedStripeKeys = true
    }

    let params;
    if(this.modalTextNumber > 1){
      params = {
        value: this.modalTextValues.toString(),
        company_id: this.companyId,
        updated_stripe_keys: updatedStripeKeys ? 1 : 0
      }
    } else {
      params = {
        value: this.newValue,
        company_id: this.companyId,
        updated_stripe_keys: updatedStripeKeys ? 1 : 0
      }
    }
    this._companyService.updateOtherSettingValue(this.selectedSettingId, params)
      .subscribe(
        response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          const item = this.settings.find((i) => i.id == this.selectedSettingId);
          
          if (item){
            if(this.modalTextNumber > 1){
              item.value = this.modalTextValues.toString();
            }else {
              item.value = this.newValue;
            }
          }

          if(updatedStripeKeys) {
            this._translateService.instant('dialog.stripekeyupdated')
          }

          this.closemodalbutton?.nativeElement.click();
          this.dialogMode = '';

          if(this.selectedSettingId == 291) {
            location.reload()
          }
        },
        error => {
          console.log(error)
        }
      )
  }

  goToLanguages() {
    this._router.navigate([`/new-settings/languages`])
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.settings = this.filterSettings();
  }

  filterSettings() {
    let settings = this.settings2;
    if (settings?.length > 0 && this.searchKeyword) {
      return settings.filter((m) => {
        let include = false;
        if (
          (m.title_es &&
            m.title_es
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.title_fr &&
            m.title_fr
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.title_eu &&
            m.title_eu
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.title_ca &&
            m.title_ca
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.title_de &&
            m.title_de
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
      return settings;
    }
  }

  showTermsAndConditions() {
    this.setParameters(true, false, false);
  }

  closeTermsAndConditions() {
    this.setParameters(false, false, false);
  }

  showPrivacyPolicy() {
    this.setParameters(false, true, false);
  }

  closePrivacyPolicy() {
    this.setParameters(false, false, false);
  }

  showCookiePolicy() {
    this.setParameters(false, false, true);
  }

  closeCookiePolicy() {
    this.setParameters(false, false, false);
  }

  saveTermsAndConditions() {
    let params = {
      terms_and_conditions_option: this.selectedPrivacySettingOption,
      terms_and_conditions: this.termsAndConditions,
      terms_and_conditions_en: this.termsAndConditionsEn || '',
      terms_and_conditions_fr: this.termsAndConditionsFr || '',
    }
    this._companyService.updateTermsAndConditions(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          await this.setCompanyInit();
          this.closemodalbutton?.nativeElement.click();
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  }

  savePrivacyPolicy() {
    let params = {
      policy_option: this.selectedPrivacySettingOption,
      policy: this.privacyPolicy,
      policy_en: this.privacyPolicyEn || '',
      policy_fr: this.privacyPolicyFr || '',
    }
    this._companyService.updatePrivatePolicy(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          await this.setCompanyInit();
          this.closemodalbutton?.nativeElement.click();
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  }

  saveCookiePolicy() {
    let params = {
      cookie_policy_option: this.selectedPrivacySettingOption,
      cookie_policy: this.cookiePolicy,
      cookie_policy_en: this.cookiePolicyEn || '',
      cookie_policy_fr: this.cookiePolicyFr || '',
      cookie_policy_eu: this.cookiePolicyEu || '',
      cookie_policy_ca: this.cookiePolicyCa || '',
      cookie_policy_de: this.cookiePolicyDe || '',
    }
    this._companyService.updateCookiePolicy(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          await this.setCompanyInit();
          this.closemodalbutton?.nativeElement.click();
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  }

  setParameters(isTermsAndConditions, isPrivacyPolicy, isCookiePolicy){
    this.isTermsAndConditions = isTermsAndConditions
    this.isPrivacyPolicy = isPrivacyPolicy
    this.isCookiePolicy = isCookiePolicy
  }

  showURLModal(type) {
    this.policyURLMode = type;
    this.dialogTitle =  this._translateService.instant('company-settings.updatevalue');
    if(this.policyURLMode == 'terms-and-conditions') {
      this.urlValue = this.termsAndConditionsURL;
      this.urlValueEn = this.termsAndConditionsURLEn || '';
      this.urlValueFr = this.termsAndConditionsURLFr || '';
      this.urlValueEu = this.termsAndConditionsURLEu || '';
      this.urlValueCa = this.termsAndConditionsURLCa || '';
      this.urlValueDe = this.termsAndConditionsURLDe || '';
      this.selectedPrivacySettingOption = this.termsAndConditionsOption || (this.termsAndConditionsURL ? 'url' : 'custom');
      this.dialogTitle = this._translateService.instant('sidebar.termsandconditions');
    } else if(this.policyURLMode == 'privacy-policy') {
      this.urlValue = this.privacyPolicyURL;
      this.urlValueEn = this.privacyPolicyURLEn || '';
      this.urlValueFr = this.privacyPolicyURLFr || '';
      this.urlValueEu = this.privacyPolicyURLEu || '';
      this.urlValueCa = this.privacyPolicyURLCa || '';
      this.urlValueDe = this.privacyPolicyURLDe || '';
      this.selectedPrivacySettingOption = this.privacyPolicyOption || (this.privacyPolicyURL ? 'url' : 'custom');
      this.dialogTitle = this._translateService.instant('sidebar.privacypolicy');
    } else if(this.policyURLMode == 'cookie-policy') {
      this.urlValue = this.cookiePolicyURL;
      this.urlValueEn = this.cookiePolicyURLEn || '';
      this.urlValueFr = this.cookiePolicyURLFr || '';
      this.urlValueEu = this.cookiePolicyURLEu || '';
      this.urlValueCa = this.cookiePolicyURLCa || '';
      this.urlValueDe = this.cookiePolicyURLDe || '';
      this.selectedPrivacySettingOption = this.cookiePolicyOption || (this.cookiePolicyURL ? 'url' : 'custom');
      this.dialogTitle = this._translateService.instant('sidebar.cookiespolicy');
    }
    this.dialogMode = 'policy-url';
    this.modalbutton?.nativeElement.click();
  }

  saveURLValue() {
    if(this.urlValue) {
      if(this.policyURLMode == 'terms-and-conditions') {
        this.termsAndConditionsURL = this.urlValue
        this.termsAndConditionsURLEn = this.urlValueEn
        this.termsAndConditionsURLFr = this.urlValueFr
        this.termsAndConditionsURLEu = this.urlValueEu
        this.termsAndConditionsURLCa = this.urlValueCa
        this.termsAndConditionsURLDe = this.urlValueDe
        this.editTermsAndConditionsURL()
      } else if(this.policyURLMode == 'privacy-policy') {
        this.privacyPolicyURL = this.urlValue
        this.privacyPolicyURLEn = this.urlValueEn
        this.privacyPolicyURLFr = this.urlValueFr
        this.privacyPolicyURLEu = this.urlValueEu
        this.privacyPolicyURLCa = this.urlValueCa
        this.privacyPolicyURLDe = this.urlValueDe
        this.editPrivacyPolicyURL()
      } else if(this.policyURLMode == 'cookie-policy') {
        this.cookiePolicyURL = this.urlValue
        this.cookiePolicyURLEn = this.urlValueEn
        this.cookiePolicyURLFr = this.urlValueFr
        this.cookiePolicyURLEu = this.urlValueEu
        this.cookiePolicyURLCa = this.urlValueCa
        this.cookiePolicyURLDe = this.urlValueDe
        this.editCookiePolicyURL()
      }
    }
  }

  editTermsAndConditionsURL() {
    let params = {
      terms_and_conditions_option: this.selectedPrivacySettingOption,
      terms_and_conditions_url: this.termsAndConditionsURL,
      terms_and_conditions_url_en: this.termsAndConditionsURLEn,
      terms_and_conditions_url_fr: this.termsAndConditionsURLFr,
      terms_and_conditions_url_eu: this.termsAndConditionsURLEu,
      terms_and_conditions_url_ca: this.termsAndConditionsURLCa,
      terms_and_conditions_url_de: this.termsAndConditionsURLDe,
    }
    this._companyService.editTermsAndConditionsURL(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          await this.setCompanyInit();
          this.closemodalbutton?.nativeElement.click();
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  }

  editPrivacyPolicyURL() {
    let params = {
      privacy_policy_option: this.selectedPrivacySettingOption,
      privacy_policy_url: this.privacyPolicyURL,
      privacy_policy_url_en: this.privacyPolicyURLEn,
      privacy_policy_url_fr: this.privacyPolicyURLFr,
      privacy_policy_url_eu: this.privacyPolicyURLEu,
      privacy_policy_url_ca: this.privacyPolicyURLCa,
      privacy_policy_url_de: this.privacyPolicyURLDe,
    }
    this._companyService.editPrivacyPolicyURL(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          await this.setCompanyInit();
          this.closemodalbutton?.nativeElement.click();
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  }

  editCookiePolicyURL() {
    let params = {
      cookie_policy_option: this.selectedPrivacySettingOption,
      cookie_policy_url: this.cookiePolicyURL,
      cookie_policy_url_en: this.cookiePolicyURLEn,
      cookie_policy_url_fr: this.cookiePolicyURLFr,
    }
    this._companyService.editCookiePolicyURL(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          await this.setCompanyInit();
          this.closemodalbutton?.nativeElement.click();
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  }

  async setCompanyInit(){
    this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies')
    this._companyService.getCompany(this.companies)
  }

  togglePrivacyPolicyChange(event) {
    let params = {
      show_privacy_policy: event?.target?.checked ? 1 : 0,
    }
    this._companyService.activatePrivacyPolicy(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          if(!event) {
            this.canShowPrivacyPolicy = false
          }
        
          await this.setCompanyInit();
          location.reload()
        },
        error => {
          console.log(error)
        }
      )
  }

  toggleTermsAndConditionsChange(event) {
    let params = {
      show_terms: event?.target?.checked ? 1 : 0,
    }
    this._companyService.activateTermsAndConditions(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          if(!event) {
            this.canShowTermsAndConditions = false
          }
          await this.setCompanyInit();
          location.reload()
        },
        error => {
          console.log(error)
        }
      )
  }

  toggleCookiePolicyChange(event) {
    let params = {
      show_cookie_policy: event?.target?.checked ? 1 : 0,
    }
    this._companyService.activateCookiePolicy(this.companyId, params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          if(!event) {
            this.canShowCookiePolicy = false
          }
          await this.setCompanyInit();
          location.reload()
        },
        error => {
          console.log(error)
        }
      )
  }

  faviconFileChangeEvent(event: any): void {
    this.cancelledFaviconUpload = false
    this.faviconImageChangedEvent = event
    if(event && event.target.files && event.target.files.length > 0) {
      this.showFaviconImageCropper = true
      this.dialogTitle = this._translateService.instant('club-create.uploadimage');
      setTimeout(() => {
        this.modalbutton?.nativeElement.click();
      }, 500);
    }
  }

  multiInputEvent(event: any, i: number): void {
    if(event && event.target.value){
      this.modalTextValues[i] = event.target.value
    }
  }

  faviconImageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      this.cancelledFaviconUpload = false
      this.faviconImgSrc = this.faviconCroppedImage = event.base64
      this.uploadedFaviconSrc = this.faviconCroppedImage
      this.companyFaviconFile = {
          name: 'image',
          image: base64ToFile(event.base64) 
      }
      this.faviconFileInput.nativeElement.value = ''
    }
  }

  faviconImageLoaded() {
    // show cropper
  }

  faviconCropperReady() {
    // cropper ready
  }

  faviconLoadImageFailed() {
    // show message
  }

  faviconImageCropperModalSave() {
    this.saveLogoBanner('favicon')
    this.showFaviconImageCropper = false;
    this.closemodalbutton?.nativeElement.click();
  }

  faviconImageCropperModalClose() {
    this.cancelledFaviconUpload = true
    this.showFaviconImageCropper = false;
  }

  clearFaviconPhoto() {
    this.uploadedFaviconSrc = null;
  }

  faviconRotateLeft() {
    this.faviconCanvasRotation--;
    this.faviconFlipAfterRotate();
  }

  faviconRotateRight() {
    this.faviconCanvasRotation++;
    this.faviconFlipAfterRotate();
  }

  private faviconFlipAfterRotate() {
    const flippedH = this.faviconTransform.flipH;
    const flippedV = this.faviconTransform.flipV;
    this.faviconTransform = {
        ...this.faviconTransform,
        flipH: flippedV,
        flipV: flippedH
    };
  }

  saveLogoBanner(mode: string = '') {
    if(mode == 'logo_page' && this.companyLogoPageFile) {
      this._companyService.editCompanyPhoto(
          this.companyId,
          this.companyLogoPageFile
        ).subscribe(
          async resImage => {
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
            this.setMainService();
          },
          error => {
              console.log(error);
          } 
        )
    } else if(mode == 'logo_header' && this.companyLogoFile) {
      this._companyService.editCompanyLogo(
          this.companyId,
          this.companyLogoFile
        ).subscribe(
          async resImage => {
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
            this.setMainService();
          },
          error => {
              console.log(error);
          } 
        )
    } else if(mode == 'left_banner' && this.bannerFile) {
      this._companyService.editCompanyVideo(
          this.companyId,
          this.bannerFile
        ).subscribe(
          async resImage => {
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
            this.setMainService();
          },
          error => {
              console.log(error);
          } 
        )
    } else if(mode == 'favicon' && this.companyFaviconFile) {
      this._companyService.editCompanyFavicon(
          this.companyId,
          this.companyFaviconFile
        ).subscribe(
          async resImage => {
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
            this.setMainService();
          },
          error => {
              console.log(error);
          } 
        )
    }
  }

  logoFileChangeEvent(event: any): void {
    this.cancelledLogoUpload = false
    this.logoImageChangedEvent = event
    if(event && event.target.files && event.target.files.length > 0) {
      this.showLogoImageCropper = true
      this.dialogTitle = this._translateService.instant('club-create.uploadimage');
      setTimeout(() => {
        this.modalbutton?.nativeElement.click();
      }, 500);
    }
  }

  logoImageCropped(event: ImageCroppedEvent) {
    this.cancelledLogoUpload = false
    if(event.base64) {
      this.logoImgSrc = this.logoCroppedImage = event.base64
      this.uploadedLogoSrc = this.logoCroppedImage
      this.companyLogoFile = {
          name: 'image',
          image: base64ToFile(event.base64) 
      }
    }
    this.logoFileInput.nativeElement.value = ''
  }

  logoImageLoaded() {
    // show cropper
  }

  logoCropperReady() {
    // cropper ready
  }

  logoLoadImageFailed() {
    // show message
  }

  logoImageCropperModalSave() {
    this.saveLogoBanner('logo_header')
    this.showLogoImageCropper = false;
    this.closemodalbutton?.nativeElement.click();
  }

  logoImageCropperModalClose() {
    this.cancelledLogoUpload = true
    this.showLogoImageCropper = false;
  }

  logoRotateLeft() {
    this.logoCanvasRotation--;
    this.logoFlipAfterRotate();
  }

  logoRotateRight() {
    this.logoCanvasRotation++;
    this.logoFlipAfterRotate();
  }

  private logoFlipAfterRotate() {
    const flippedH = this.logoTransform.flipH;
    const flippedV = this.logoTransform.flipV;
    this.logoTransform = {
        ...this.logoTransform,
        flipH: flippedV,
        flipV: flippedH
    };
  }

  getLocalBannerImage() {
    let imageItem = this.leftImages.filter(lft => {
      return lft.companyid == this.companyId
    })

    return imageItem && imageItem[0] ? imageItem[0].image : './assets/images/new-design/company.jpg'
  }

  logoPageFileChangeEvent(event: any): void {
    this.cancelledLogoPageUpload = false
    this.logoPageImageChangedEvent = event
    if(event && event.target.files && event.target.files.length > 0) {
      this.showLogoPageImageCropper = true
      this.dialogTitle = this._translateService.instant('club-create.uploadimage');
      setTimeout(() => {
        this.modalbutton?.nativeElement.click();
      }, 500);
    }
  }

  logoPageImageCropped(event: ImageCroppedEvent) {
    this.cancelledLogoPageUpload = false
    if(event.base64) {
      this.logoPageImgSrc = this.logoPageCroppedImage = event.base64
      this.uploadedLogoPageSrc = this.logoPageCroppedImage
      this.companyLogoPageFile = {
          name: 'image',
          image: base64ToFile(event.base64)
      }
    }
    this.logoPageFileInput.nativeElement.value = ''
  }

  logoPageImageLoaded() {
    // show cropper
  }

  logoPageCropperReady() {
    // cropper ready
  }

  logoPageLoadImageFailed() {
    // show message
  }

  logoPageImageCropperModalSave() {
    this.saveLogoBanner('logo_page')
    this.showLogoImageCropper = false;
    this.closemodalbutton?.nativeElement.click();
  }

  logoPageImageCropperModalClose() {
    this.cancelledLogoPageUpload = true
    this.showLogoPageImageCropper = false;
  }

  clearLogoPagePhoto() {
    this.uploadedLogoPageSrc = null;
  }

  logoPageRotateLeft() {
    this.logoPageCanvasRotation--;
    this.logoFlipAfterRotate();
  }

  logoPageRotateRight() {
    this.logoPageCanvasRotation++;
    this.logoFlipAfterRotate();
  }

  private logoPageFlipAfterRotate() {
    const flippedH = this.logoTransform.flipH;
    const flippedV = this.logoTransform.flipV;
    this.logoTransform = {
        ...this.logoTransform,
        flipH: flippedV,
        flipV: flippedH
    };
  }

  bannerFileChangeEvent(event: any): void {
    this.bannerImageChangedEvent = event;
    this.showBannerImageCropper = true;
    this.dialogTitle = this._translateService.instant('club-create.uploadimage');
    setTimeout(() => {
      this.modalbutton?.nativeElement.click();
    }, 500);
  }

  bannerImageCropped(event: ImageCroppedEvent) {
    if(event.base64) {
      this.bannerImgSrc = this.bannerCroppedImage = event.base64;
      this.uploadedBannerSrc = this.bannerCroppedImage;
      this.bannerFile = {
          name: 'image',
          image: base64ToFile(event.base64) //event.file
      };
    }
    this.saveLogoBanner('left_banner')
  }

  bannerImageLoaded() {
    // show cropper
  }

  bannerCropperReady() {
    // cropper ready
  }

  bannerLoadImageFailed() {
    // show message
  }

  bannerImageCropperModalSave() {
    this.showBannerImageCropper = false;
    this.closemodalbutton?.nativeElement.click();
  }

  bannerImageCropperModalClose() {
    this.showBannerImageCropper = false;
  }

  clearBannerPhoto() {
    this.uploadedBannerSrc = null;
  }

  bannerRotateLeft() {
    this.bannerCanvasRotation--;
    this.bannerFlipAfterRotate();
  }

  bannerRotateRight() {
    this.bannerCanvasRotation++;
    this.bannerFlipAfterRotate();
  }

  private bannerFlipAfterRotate() {
    const flippedH = this.bannerTransform.flipH;
    const flippedV = this.bannerTransform.flipV;
    this.bannerTransform = {
        ...this.bannerTransform,
        flipH: flippedV,
        flipV: flippedH
    };
  }

  goToHomeSettings() {
    // this._router.navigate([`/settings/home-template`])
    location.href = `/settings/home-template`
  }

  gotoManageStripeAccounts() {
    this._router.navigate(['/settings/stripe-accounts'])
  }

  goToTikTokSettings(item) {
    if(item == 'statistics') {
      this._router.navigate([`/tiktok/${item}`]);
    } else {
      this._router.navigate([`/settings/tiktok/${item?.replace(' & ', '-')?.replace(' ', '-')?.toLowerCase()}`]);
    }
  }

  toggleLandingTemplateChange(event) {
    if(event?.target?.checked) {
      this._companyService.enableLandingTemplate(this.companyId, {})
        .subscribe(
          async response => {
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
            if(!event) {
              this.landingTemplateEnabled = false
            }
            await this.setCompanyInit();
            location.reload()
          },
          error => {
            console.log(error)
          }
        )
    } else {
      this._companyService.disableLandingTemplate(this.companyId, {})
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          this.landingTemplateEnabled = false
          await this.setCompanyInit();
          location.reload()
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  updateHomeTemplate() {
    this._router.navigate([`/settings/template-editor`])
  }

  togglePredefinedTemplateChange(event) {
    if(event?.target?.checked) {
      this._companyService.enablePredefinedHomeTemplate(this.companyId, {})
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          this.predefinedTemplateEnabled = true
          await this.setCompanyInit();
          location.reload()
        },
        error => {
          console.log(error)
        }
      )
    } else {
      this._companyService.disableLandingTemplate(this.companyId, {})
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          this.predefinedTemplateEnabled = false
          await this.setCompanyInit();
          location.reload()
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  updatePredefinedHomeTemplate() {
    this._router.navigate([`/settings/templates`])
  }

  goToCoupons() {
    location.href = `/settings/coupons`
  }

  manageRegistrationFields() {
    this._router.navigate([`/settings/registration-fields`])
  }

  showNavigationModal() {
    this.dialogTitle =  this._translateService.instant('landing.navigation');
    this.dialogMode = 'navigation';
    this.modalbutton?.nativeElement.click();
  }

  saveNavigation() {
    let params = {
      id: this.companyId,
      navigation: this.selectedNavigation,
    }
    this._companyService.editNavigationSettings(params)
      .subscribe(
        async response => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
          await this.setCompanyInit();
          this.closemodalbutton?.nativeElement.click();
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
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