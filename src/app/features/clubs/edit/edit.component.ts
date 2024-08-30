import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { ClubsService } from "@features/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ButtonGroupComponent, NoAccessComponent, PageTitleComponent } from "@share/components";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { QuillModule } from 'ngx-quill';
import {
  ImageCropperModule,
  ImageCroppedEvent,
  ImageTransform,
  base64ToFile,
} from "ngx-image-cropper";
import { DomSanitizer } from "@angular/platform-browser";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { faRotateLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import get from "lodash/get";

@Component({
  selector: "app-clubs-edit",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgMultiSelectDropDownModule,
    QuillModule,
    ImageCropperModule,
    FontAwesomeModule,
    ButtonGroupComponent,
    NoAccessComponent,
    PageTitleComponent,
  ],
  templateUrl: "./edit.component.html",
})
export class ClubEditComponent {
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
  clubsFeature: any;
  featureId: any;
  pageName: any;
  superAdmin: boolean = false;
  canCreateClub: any;
  languages: any = [];
  isLoading: boolean = true;
  selectedLanguage: string = "es";
  selectedLanguageChanged: boolean = false;
  showLanguageNote: boolean = true;
  buttonList: any = [];
  issaving: boolean = false;
  errorMessage: string = "";
  formSubmitted: boolean = false;
  club: any;
  status: boolean = true;
  showImageCropper: boolean = false;
  imageChangedEvent: any = "";
  imgSrc: any;
  croppedImage: any = "";
  file: any = [];
  @ViewChild("modalbutton", { static: false })
  modalbutton: ElementRef<HTMLInputElement> = {} as ElementRef;
  clubType: any = 0;
  cities: any = [];
  selectedCity: any = "";
  parentGroup: any = "";
  groups: any = [];
  rotateLeftIcon = faRotateLeft;
  rotateRightIcon = faRotateRight;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  transform: ImageTransform = {};

  clubForm: FormGroup = new FormGroup({
    title_es: new FormControl("", [
      Validators.required,
      Validators.maxLength(65),
    ]),
    title_en: new FormControl("", [
      Validators.required,
      Validators.maxLength(65),
    ]),
    title_fr: new FormControl("", [
      Validators.required,
      Validators.maxLength(65),
    ]),
    title_eu: new FormControl("", [
      Validators.required,
      Validators.maxLength(65),
    ]),
    title_ca: new FormControl("", [
      Validators.required,
      Validators.maxLength(65),
    ]),
    title_de: new FormControl("", [
      Validators.required,
      Validators.maxLength(65),
    ]),
    description_es: new FormControl("", [Validators.required]),
    description_en: new FormControl("", [Validators.required]),
    description_fr: new FormControl("", [Validators.required]),
    description_eu: new FormControl("", [Validators.required]),
    description_ca: new FormControl("", [Validators.required]),
    description_de: new FormControl("", [Validators.required]),
  });

  groupTypeTitle: any;
  dropdownSettings = {};
  CompanySupercategories: any = [];
  category_id: any;
  subcategories: any = [];
  subcategory_id: any;
  subcategoryDropdownSettings = {};
  groupsSettings: any;
  setting: any = "";
  groupAdminTitle: any;
  dropdownSettingsAdmin = {};
  CompanyUserData: any = [];
  selectedAdmin: any;
  planName: string = "";
  hasContactDetails: boolean = true;
  allContactFields: any = [];
  allContactFieldsMapping: any = [];
  contactDetailsFields: any = [];
  hasSubgroups: boolean = false;
  isAreaGroup: boolean = false;
  isShowAttendee: boolean = true;
  isShowComments: boolean = true;
  isShowDescription: boolean = true;
  show_attendee_field: boolean = false;
  show_description_field: boolean = false;
  show_comments_field: boolean = false;
  CompanyUser: any;
  title: any;
  defaultLanguage: any = "es";
  description: any;
  editorToUse: string = "tinymce";
  editor: any;
  hasSetting: any;
  apiPath: string = environment.api;
  selectedAdminId: any;
  clubPresidentsMapping: any;
  pageTitle: string = "";
  
  hasGroupChat: boolean = false;
  showChat: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _clubsService: ClubsService,
    private sanitizer: DomSanitizer
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
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField:
        this.language == "en"
          ? "name_EN"
          : this.language == "fr"
          ? "name_FR"
          : this.language == "eu"
          ? "name_EU"
          : this.language == "ca"
          ? "name_CA"
          : this.language == "de"
          ? "name_DE"
          : "name_ES",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      limitSelection: 3,
      itemsShowLimit: 2,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.subcategoryDropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField:
        this.language == "en"
          ? "name_EN"
          : this.language == "fr"
          ? "name_FR"
          : this.language == "eu"
          ? "name_EU"
          : this.language == "ca"
          ? "name_CA"
          : this.language == "de"
          ? "name_DE"
          : "name_ES",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      limitSelection: 3,
      itemsShowLimit: 2,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.dropdownSettingsAdmin = {
      singleSelection: this.companyId == 32 ? false : true,
      idField: "id",
      textField: "name",
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.fetchClubsData();
  }

  fetchClubsData() {
    this._clubsService
      .fetchClubsData(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(
            data?.settings?.subfeatures,
            data?.clubs,
            data?.contact_details
          );
          this.mapUserPermissions(data?.user_permissions);

          this.CompanySupercategories = data?.club_categories;
          this.subcategories = data?.club_subcategories;
          this.cities = data?.cities;
          this.groupsSettings = data?.club_settings;
          this.mapLanguages(data?.languages);
          this.mapUsers(data?.users);

          this.isLoading = false;

          if (this.id > 0) {
            this.fetchClub();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.clubsFeature = features?.find((f) => f.feature_id == 5);
    this.featureId = this.clubsFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.clubsFeature);
    this.groupAdminTitle = this._translateService.instant(
      "club-create.groupadmin"
    );
    this.groupTypeTitle =
      this.clubsFeature.name_en.indexOf("Club") >= 0
        ? this._translateService.instant("club-create.clubtype")
        : this._translateService.instant("club-create.grouptype") +
          " " +
          this.pageName;
    this.pageTitle = `${this.id > 0 ? this._translateService.instant('edit-club.edityourclub') : this._translateService.instant('club-create.createyour')} ${this.pageName}`
  }

  mapSubfeatures(subfeatures, clubs, contact_details) {
    if (subfeatures?.length > 0) {
      this.hasSubgroups = subfeatures.some(
        (a) => a.name_en == "Subgroups" && a.active == 1
      );
      this.hasContactDetails = subfeatures.some(
        (a) => a.name_en == "Contact details" && a.active == 1
      );
      this.show_attendee_field = subfeatures.some(
        (a) => a.name_en == "Attendee" && a.active == 1
      );
      this.show_description_field = subfeatures.some(
        (a) => a.name_en == "Description" && a.active == 1
      );
      this.show_comments_field = subfeatures.some(
        (a) => a.name_en == "Comments" && a.active == 1
      );
      this.hasGroupChat = subfeatures.some(
        (a) => a.name_en == "Group chat" && a.active == 1
      );
    }

    if (this.hasSubgroups) {
      this.groups = clubs;
    }
    if (this.hasContactDetails) {
      this.contactDetailsFields = contact_details;
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreateClub =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 5
      );
  }

  mapUsers(users) {
    this.CompanyUser = users;
    this.CompanyUserData = this.CompanyUser?.map((i) => ({
      id: i.id,
      name: i.name ? i.name : i.first_name + " " + i.last_name,
    }));
    this.CompanyUserData?.sort((a, b) => a.name.localeCompare(b.name));
  }

  mapLanguages(languages) {
    languages = languages?.map((language) => {
      return {
        ...language,
        name: this.getLanguageName(language),
      };
    });

    this.languages = languages?.filter((lang) => {
      return lang.status == 1;
    });
    this.defaultLanguage = languages
      ? languages.filter((lang) => {
          return lang.default == true;
        })
      : [];
    this.selectedLanguage = this.language || "es";
    this.initializeButtonGroup();
  }

  fetchClub() {
    this._clubsService
      .fetchClub(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          let categories = this.mapCategories(data?.club_category_mapping);
          this.clubPresidentsMapping = data?.club_presidents_mapping;
          this.formatClub(data?.club, categories, data?.club_settings);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapCategories(club_category_mapping) {
    let categories = club_category_mapping?.map((cat) => {
      let cat_row = this.CompanySupercategories?.filter((c) => {
        return c.id == cat.fk_supercategory_id;
      });
      let categ = cat_row?.length > 0 ? cat_row[0] : {};
      return {
        ...cat,
        name_EN: categ?.name_EN,
        name_ES: categ?.name_ES,
        name_FR: categ?.name_FR,
        name_EU: categ?.name_EU,
        name_CA: categ?.name_CA,
        name_DE: categ?.name_DE,
      };
    });

    return categories;
  }

  formatClub(club, categories, club_settings) {
    this.club = club;
    const {
      title,
      title_en,
      title_fr,
      title_eu,
      title_ca,
      title_de,
      description,
      description_en,
      description_fr,
      description_eu,
      description_ca,
      description_de,
      image,
      parent_group_id,
      city,
      show_attendee,
      show_comments,
      show_description,
      show_chat,
    } = this.club;

    this.isShowAttendee = show_attendee == 1 ? true : false;
    this.isShowComments = show_comments == 1 ? true : false;
    this.isShowDescription = show_description == 1 ? true : false;
    this.showChat = show_chat == 1 ? true : false;
    this.parentGroup = parent_group_id > 0 ? parent_group_id : "";
    this.category_id = categories.map((category) => {
      const { id, name_EN, name_ES, name_FR, name_EU, name_CA, name_DE } =
        category;

      if (this.language == "en") {
        return {
          id,
          name_EN,
        };
      } else if (this.language == "fr") {
        return {
          id,
          name_FR,
        };
      } else if (this.language == "eu") {
        return {
          id,
          name_EU,
        };
      } else if (this.language == "ca") {
        return {
          id,
          name_CA,
        };
      } else if (this.language == "de") {
        return {
          id,
          name_DE,
        };
      } else {
        return {
          id,
          name_ES,
        };
      }
    });
    this.clubForm.controls["title_es"].setValue(title);
    this.clubForm.controls["title_en"].setValue(title_en);
    this.clubForm.controls["title_fr"].setValue(title_fr);
    this.clubForm.controls["title_eu"].setValue(title_eu);
    this.clubForm.controls["title_ca"].setValue(title_ca);
    this.clubForm.controls["title_de"].setValue(title_de);
    this.clubForm.controls["description_es"].setValue(description);
    this.clubForm.controls["description_en"].setValue(description_en);
    this.clubForm.controls["description_fr"].setValue(description_fr);
    this.clubForm.controls["description_eu"].setValue(description_eu);
    this.clubForm.controls["description_ca"].setValue(description_ca);
    this.clubForm.controls["description_de"].setValue(description_de);
    this.selectedCity = city || "";
    this.clubType = this.club.private ? this.club.private : 0;
    this.imgSrc = `${this.apiPath}/get-image-group/${image}`;
    this.setting = 1;
    if (club_settings?.length > 0) {
      let groupsettings = club_settings[0];
      if (groupsettings) {
        this.setting = groupsettings.fk_groups_setting_id;
      }
    }
    this.status = this.club.status == 1 ? true : false;
    this.loadAdminDetails();
    this.loadContactDetails();
  }

  loadAdminDetails() {
    if (this.club) {
      this.selectedAdminId = this.club ? this.club.user_id : "";
      if (this.companyId == 32) {
        let company_user_data =
          this.CompanyUserData &&
          this.CompanyUserData.filter((user) => {
            let include = false;
            if (this.clubPresidentsMapping?.length > 0) {
              this.clubPresidentsMapping.forEach((cm) => {
                if (user.id == cm.user_id && cm.club_id == this.id) {
                  include = true;
                }
              });
            }

            return include;
          });

        if (company_user_data && company_user_data.length > 0) {
          this.selectedAdmin = company_user_data;
        } else {
          this.selectedAdmin = [this.selectedAdminId];
        }
      } else {
        const item = this.CompanyUserData.find((i) => i.id == this.selectedAdminId);
        if (item) {
          this.selectedAdmin = [item];
        }
      }
    }
  }

  loadContactDetails() {
    if (this.hasContactDetails && this.club) {
      this.contactDetailsFields.forEach((f) => {
        f.field_value = this.club[f.field] || "";
      });
    }
  }

  initializeButtonGroup() {
    let list: any[] = [];

    this.languages?.forEach((language) => {
      list.push({
        id: language.id,
        value: language.code,
        text: this.getLanguageName(language),
        selected: language.default ? true : false,
        code: language.code,
      });
    });

    this.buttonList = list;
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

  getLanguageName(language) {
    return this.language == "en"
      ? language.name_EN
      : this.language == "fr"
      ? language.name_FR
      : this.language == "eu"
      ? language.name_EU
      : this.language == "ca"
      ? language.name_CA
      : this.language == "de"
      ? language.name_DE
      : language.name_ES;
  }

  getGroupTitle(group) {
    return this.language == "en"
      ? group.title_en
        ? group.title_en || group.title
        : group.title
      : this.language == "fr"
      ? group.title_fr
        ? group.title_fr || group.title
        : group.title
      : this.language == "eu"
      ? group.title_eu
        ? group.title_eu || group.title
        : group.title
      : this.language == "ca"
      ? group.title_ca
        ? group.title_ca || group.title
        : group.title
      : this.language == "de"
      ? group.title_de
        ? group.title_de || group.title
        : group.title
      : group.title;
  }

  onDeSelectCategory() {}

  subcategoryData() {
    return this.subcategories?.filter((subcat) =>
      this.category_id?.find((cat) => cat.id == subcat.category_id)
    );
  }

  hasSubcategories() {
    return this.subcategories?.length > 0;
  }

  getGroupSettingsName(setting) {
    return this.language == "en"
      ? (setting.name_en ? setting.name_en || setting.name : setting.name) +
          " " +
          (this.planName || this._translateService.instant('plans.plan'))
      : this.language == "fr"
      ? (setting.name_fr ? setting.name_fr || setting.name : setting.name) +
        " " +
        (this.planName || this._translateService.instant('plans.plan'))
      : this.language == "eu"
      ? (setting.name_eu ? setting.name_eu || setting.name : setting.name) +
        " " +
        (this.planName || this._translateService.instant('plans.plan'))
      : this.language == "ca"
      ? (setting.name_ca ? setting.name_ca || setting.name : setting.name) +
        " " +
        (this.planName || this._translateService.instant('plans.plan'))
      : (this.language == "de"
          ? setting.name_de
            ? setting.name_de || setting.name
            : setting.name
          : setting.name) +
        " " +
        (this.planName || this._translateService.instant('plans.plan'));
  }

  closeLanguageNote() {
    this._localService.setLocalStorage("showLanguageNote", new Date());
    this.showLanguageNote = false;
  }

  handleChangeLanguageFilter(event) {
    this.buttonList?.forEach((item) => {
      if (item.code == event.code) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedLanguage = event.code;
    this.selectedLanguageChanged = true;
  }

  fileChangeEvent(event: any): void {
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
      this.imgSrc = this.croppedImage = event.base64;
      this.file = {
        name: "image",
        image: base64ToFile(event.base64),
      };
    }
  }

  imageLoaded() {
    // show cropper
  }

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {
    // show message
  }

  imageCropperModalSave() {
    this.showImageCropper = false;
  }

  imageCropperModalClose() {
    this.showImageCropper = false;
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

  checkDescription() {
    let result = false;
    let code =
      this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    switch (code) {
      case "ca":
        this.description = this.clubForm.get("description_ca")?.value;
        result = !this.clubForm.get("description_ca")?.value;
        break;
      case "de":
        this.description = this.clubForm.get("description_de")?.value;
        result = !this.clubForm.get("description_de")?.value;
        break;
      case "es":
        this.description = this.clubForm.get("description_es")?.value;
        result = !this.clubForm.get("description_es")?.value;
        break;
      case "eu":
        this.description = this.clubForm.get("description_eu")?.value;
        result = !this.clubForm.get("description_eu")?.value;
        break;
      case "fr":
        this.description = this.clubForm.get("description_fr")?.value;
        result = !this.clubForm.get("description_fr")?.value;
        break;
      default:
        this.description = this.clubForm.get("description_es")?.value;
        result = !this.clubForm.get("description_es")?.value;
        break;
    }

    return result;
  }

  validationCheck() {
    let code =
      this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    if (this.id == 0) {
      if (
        this.clubForm.get("title_" + code)?.value &&
        this.clubForm.get("description_" + code)?.value &&
        this.category_id.length > 0 &&
        this.setting > 0 &&
        this.file &&
        this.file.image
      ) {
        return true;
      }
    } else {
      if (
        this.clubForm.get("title_" + code)?.value &&
        this.clubForm.get("description_" + code)?.value &&
        this.category_id.length > 0 &&
        this.setting > 0
      ) {
        return true;
      }
    }

    return false;
  }

  setDescription() {
    if (this.editorToUse == "tinymce" && this.editor) {
      if (this.clubForm.controls["description"]) {
        this.clubForm.controls["description"].setValue(
          this.editor.getContent()
        );
      }
      if (this.clubForm.controls["description_en"]) {
        this.clubForm.controls["description_en"].setValue(
          this.editor.getContent()
        );
      }
      if (this.clubForm.controls["description_fr"]) {
        this.clubForm.controls["description_fr"].setValue(
          this.editor.getContent()
        );
      }
      if (this.clubForm.controls["description_eu"]) {
        this.clubForm.controls["description_eu"].setValue(
          this.editor.getContent()
        );
      }
      if (this.clubForm.controls["description_ca"]) {
        this.clubForm.controls["description_ca"].setValue(
          this.editor.getContent()
        );
      }
      if (this.clubForm.controls["description_de"]) {
        this.clubForm.controls["description_de"].setValue(
          this.editor.getContent()
        );
      }
    }

    if (this.clubForm.controls["description"]) {
      this.clubForm.controls["description"].setValue(
        this.clubForm
          .get("description")
          ?.value.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.clubForm.controls["description_en"]) {
      this.clubForm.controls["description_en"].setValue(
        this.clubForm
          .get("description_en")
          ?.value.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.clubForm.controls["description_fr"]) {
      this.clubForm.controls["description_fr"].setValue(
        this.clubForm
          .get("description_fr")
          ?.value.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.clubForm.controls["description_eu"]) {
      this.clubForm.controls["description_eu"].setValue(
        this.clubForm
          .get("description_eu")
          ?.value.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.clubForm.controls["description_ca"]) {
      this.clubForm.controls["description_ca"].setValue(
        this.clubForm
          .get("description_ca")
          ?.value.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.clubForm.controls["description_de"]) {
      this.clubForm.controls["description_de"].setValue(
        this.clubForm
          .get("description_de")
          ?.value.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  saveClub() {
    this.errorMessage = "";
    this.formSubmitted = true;
    this.issaving = true;

    let hasSetting = false;
    if (this.setting && this.setting > 0) {
      hasSetting = true;
    }

    let code = this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    this.title = this.clubForm.get("title_" + code)?.value || "";
    this.description = this.clubForm.get("description_" + code)?.value || "";

    if (
      this.clubForm.get("title_" + code)?.errors ||
      this.checkDescription() ||
      !hasSetting
    ) {
      this.scrollToTop();
      this.issaving = false;
      return false;
    }

    if (!this.validationCheck()) {
      this.scrollToTop();
      this.issaving = false;
      return false;
    }

    this.setDescription();

    this.clubForm["title"] = this.title;
    this.clubForm["description"] = this.description;
    this.clubForm.value.title = this.title;
    this.clubForm.value.description = this.description;

    let formData = new FormData();
    formData.append("entity_id", this.companyId.toString());
    formData.append("user_id", this.userId.toString());
    formData.append(
      "title",
      this.clubForm?.value?.title_es
        ? this.clubForm?.value?.title_es
        : this.clubForm?.value?.title
    );
    formData.append(
      "title_en",
      this.clubForm?.value?.title_en
        ? this.clubForm?.value?.title_en
        : this.clubForm?.value?.title
    );
    formData.append(
      "title_fr",
      this.clubForm?.value?.title_fr
        ? this.clubForm?.value?.title_fr
        : this.clubForm?.value?.title
    );
    formData.append(
      "title_eu",
      this.clubForm?.value?.title_eu
        ? this.clubForm?.value?.title_eu
        : this.clubForm?.value?.title
    );
    formData.append(
      "title_ca",
      this.clubForm?.value?.title_ca
        ? this.clubForm?.value?.title_ca
        : this.clubForm?.value?.title
    );
    formData.append(
      "title_de",
      this.clubForm?.value?.title_de
        ? this.clubForm?.value?.title_de
        : this.clubForm?.value?.title
    );
    formData.append(
      "category_id",
      this.category_id
        ?.map((data) => {
          return data.id;
        })
        .join()
    );
    formData.append("city", this.selectedCity);
    formData.append("isShowDescription", this.isShowAttendee ? "1" : "0");
    formData.append("isShowComments", this.isShowComments ? "1" : "0");
    formData.append("isShowAttendee", this.isShowDescription ? "1" : "0");
    formData.append("show_chat", this.showChat ? "1" : "0");

    let group_admins = this.companyId == 32 ? this.selectedAdmin : "";
    if (group_admins && group_admins.length > 0) {
      formData.append(
        "group_admins",
        group_admins
          .map((data) => {
            return data.id;
          })
          .join()
      );
    }

    if (this.companyId == 12) {
      formData.append("area_group", this.isAreaGroup ? "yes" : "no");
    }

    if (this.subcategory_id) {
      formData.append(
        "subcategory_id",
        this.subcategory_id
          ?.map((data) => {
            return data.id;
          })
          .join()
      );
    }

    let parent_group_id = this.parentGroup ? this.parentGroup : 0;
    if (parent_group_id && parent_group_id > 0) {
      formData.append("parent_group_id", parent_group_id);
    }

    let private_club = this.clubType == 1 ? "1" : "0";
    formData.append("private_club", private_club);

    let admin = this.selectedAdmin?.length > 0 ? this.selectedAdmin[0].id : "";
    formData.append("user_admin", admin);
    formData.append(
      "description",
      this.clubForm?.value?.description_es
        ? this.clubForm?.value?.description_es
        : this.clubForm?.value?.description
    );
    formData.append(
      "description_en",
      this.clubForm?.value?.description_en
        ? this.clubForm?.value?.description_en
        : this.clubForm?.value?.description
    );
    formData.append(
      "description_fr",
      this.clubForm?.value?.description_fr
        ? this.clubForm?.value?.description_fr
        : this.clubForm?.value?.description
    );
    formData.append(
      "description_eu",
      this.clubForm?.value?.description_eu
        ? this.clubForm?.value?.description_eu
        : this.clubForm?.value?.description
    );
    formData.append(
      "description_ca",
      this.clubForm?.value?.description_ca
        ? this.clubForm?.value?.description_ca
        : this.clubForm?.value?.description
    );
    formData.append(
      "description_de",
      this.clubForm?.value?.description_de
        ? this.clubForm?.value?.description_de
        : this.clubForm?.value?.description
    );
    formData.append("setting", this.setting);
    formData.append("fk_company_id", this.companyId.toString());
    formData.append("fk_user_id", this.userId.toString());

    if(this.id > 0) {
      formData.append('status', this.status ? '1' : '0');
    }

    if (this.file?.image) {
      const filename = "g_" + this.userId + "_" + this.getTimestamp();
      formData.append("destination", "./uploads/groups/");
      formData.append("filepath", "./uploads/groups/" + filename + ".jpg");
      formData.append("filenamewoextension", filename);
      formData.append("image", this.file.image, filename + ".jpg");
    }

    if (this.contactDetailsFields?.length) {
      this.contactDetailsFields.forEach((cf) => {
        formData.append(cf.field, cf.field_value || "");
      });
    }

    if (this.id > 0) {
      //   Edit
      this._clubsService.editClub(this.id, formData).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this._router.navigate([`/clubs/details/${this.id}`]);
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      // Create
      this._clubsService.addClub(formData).subscribe(
        (response) => {
          if (response.id > 0) {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this._router.navigate([`/clubs/details/${response.id}`]);
          } else {
            this.issaving = false;
            this.open(this._translateService.instant("dialog.error"), "");
          }
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    }
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