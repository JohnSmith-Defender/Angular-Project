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
import { CityGuidesService } from "@features/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { ButtonGroupComponent, NoAccessComponent, PageTitleComponent, ToastComponent } from "@share/components";
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
  selector: "app-city-guide-edit",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatTabsModule,
    QuillModule,
    ImageCropperModule,
    FontAwesomeModule,
    ButtonGroupComponent,
    NoAccessComponent,
    PageTitleComponent,
    ToastComponent,
  ],
  templateUrl: "./edit.component.html",
})
export class CityGuideEditComponent {
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
  cityGuideFeature: any;
  featureId: any;
  pageName: any;
  superAdmin: boolean = false;
  canCreateCityGuide: any;
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
  cities: any = [];
  selectedCity: any = "";
  rotateLeftIcon = faRotateLeft;
  rotateRightIcon = faRotateRight;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  transform: ImageTransform = {};

  cityGuideForm: FormGroup = new FormGroup({
    name_ES: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    name_EN: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    name_FR: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    name_EU: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    name_CA: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    name_DE: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    leadin_ES: new FormControl(""),
    leadin_EN: new FormControl(""),
    leadin_FR: new FormControl(""),
    leadin_EU: new FormControl(""),
    leadin_CA: new FormControl(""),
    leadin_DE: new FormControl(""),
    description_ES: new FormControl("", [Validators.required]),
    description_EN: new FormControl("", [Validators.required]),
    description_FR: new FormControl("", [Validators.required]),
    description_EU: new FormControl("", [Validators.required]),
    description_CA: new FormControl("", [Validators.required]),
    description_DE: new FormControl("", [Validators.required]),
  });

  CompanyUser: any;
  name: any;
  leadin: any;
  defaultLanguage: any = "es";
  description: any;
  editorToUse: string = "tinymce";
  editor: any;
  hasSetting: any;
  apiPath: string = environment.api;
  pageTitle: string = "";

  cityGuide: any;
  cityGuideTitle: any;
  cityGuideExcerpt: any;
  cityGuideLikes: any = [];
  cityGuideLikeText: string = "";
  cityGuideImage: any;
  cityGuideDescription: any;
  cityGuideOwner: boolean = false;
  cityGuideItems: any = [];
  tabIndex = 0;
  tabSelected: boolean = false;
  itemMode: string = '';
  createHover: boolean = false;
  cancelHover: boolean = false;
  selectedItem: any;
  showConfirmationModal: boolean = false;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";

  cityGuideItemForm: FormGroup = new FormGroup({
    title_ES: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    title_EN: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    title_FR: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    title_EU: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    title_CA: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    title_DE: new FormControl("", [
      Validators.required,
      Validators.maxLength(150),
    ]),
    description_ES: new FormControl("", [Validators.required]),
    description_EN: new FormControl("", [Validators.required]),
    description_FR: new FormControl("", [Validators.required]),
    description_EU: new FormControl("", [Validators.required]),
    description_CA: new FormControl("", [Validators.required]),
    description_DE: new FormControl("", [Validators.required]),
    latitude: new FormControl(""),
    longitude: new FormControl(""),
    distance_from_city: new FormControl(""),
  });
  itemImgSrc: any;
  itemCroppedImage: any = "";
  itemFile: any = [];
  itemImageChangedEvent: any = "";
  issavingitem: boolean = false;
  title: any;
  itemdescription: any;
  @ViewChild("modalbutton2", { static: false })
  modalbutton2: ElementRef<HTMLInputElement> = {} as ElementRef;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _cityGuidesService: CityGuidesService,
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
    this.fetchCityGuideData();
  }

  fetchCityGuideData() {
    this._cityGuidesService
      .fetchCityGuide(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapUserPermissions(data?.user_permissions);

          this.cities = data?.cities;
          this.mapLanguages(data?.languages);

          this.formatCityGuide(data);
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatCityGuide(data) {
    this.cityGuide = data?.city_guide;

    if(this.id > 0) {
      const {
        name_ES,
        name_EN,
        name_FR,
        name_EU,
        name_CA,
        name_DE,
        leadin_ES,
        leadin_EN,
        leadin_FR,
        leadin_EU,
        leadin_CA,
        leadin_DE,
        description_ES,
        description_EN,
        description_FR,
        description_EU,
        description_CA,
        description_DE,
        image,
        city_id,
        status,
      } = this.cityGuide;

      this.cityGuideForm.controls["name_ES"].setValue(name_ES);
      this.cityGuideForm.controls["name_EN"].setValue(name_EN);
      this.cityGuideForm.controls["name_FR"].setValue(name_FR);
      this.cityGuideForm.controls["name_EU"].setValue(name_EU);
      this.cityGuideForm.controls["name_CA"].setValue(name_CA);
      this.cityGuideForm.controls["name_DE"].setValue(name_DE);
      this.cityGuideForm.controls["leadin_ES"].setValue(leadin_ES);
      this.cityGuideForm.controls["leadin_EN"].setValue(leadin_EN);
      this.cityGuideForm.controls["leadin_FR"].setValue(leadin_FR);
      this.cityGuideForm.controls["leadin_EU"].setValue(leadin_EU);
      this.cityGuideForm.controls["leadin_CA"].setValue(leadin_CA);
      this.cityGuideForm.controls["leadin_DE"].setValue(leadin_DE);
      this.cityGuideForm.controls["description_ES"].setValue(description_ES);
      this.cityGuideForm.controls["description_EN"].setValue(description_EN);
      this.cityGuideForm.controls["description_FR"].setValue(description_FR);
      this.cityGuideForm.controls["description_EU"].setValue(description_EU);
      this.cityGuideForm.controls["description_CA"].setValue(description_CA);
      this.cityGuideForm.controls["description_DE"].setValue(description_DE);
      this.selectedCity = city_id || '';
      this.imgSrc = `${this.apiPath}/get-image/${image}`;
      this.status = status == 1 ? true : false;
    }

    this.cityGuideItems = this.formatCityGuideItems(data?.city_guide_items);
  }

  formatCityGuideItems(data) {
    let items = data?.map((item) => {
      let center;
      if (item.latitude && item?.longitude) {
        center = {
          lat: item?.latitude ? parseFloat(item?.latitude) : 0,
          lng: item?.longitude ? parseFloat(item?.longitude) : 0,
        };
      }
      return {
        ...item,
        title: this.getCityGuideItemTitle(item),
        description: this.getCityGuideDescription(item),
        truncated_description: this.getCityGuideDescriptionTruncated(item),
        image: item?.image ? `${environment.api}/get-image/${item?.image}` : '',
        distance: item?.distance_from_city
          ? item?.distance_from_city?.replace(".00", "")?.replace(".", "")
          : "",
      };
    });
    return items;
  }

  getCityGuideItemTitle(guide) {
    return this.language == "en"
      ? guide.title_EN
        ? guide.title_EN || guide.title_ES
        : guide.title_ES
      : this.language == "fr"
      ? guide.title_FR
        ? guide.title_FR || guide.title_ES
        : guide.title_ES
      : this.language == "eu"
      ? guide.title_EU
        ? guide.title_EU || guide.title_ES
        : guide.title_ES
      : this.language == "ca"
      ? guide.title_CA
        ? guide.title_CA || guide.title_ES
        : guide.title_ES
      : this.language == "de"
      ? guide.title_DE
        ? guide.title_de || guide.title_ES
        : guide.title_ES
      : guide.title_ES;
  }

  getCityGuideDescription(guide) {
    return guide
      ? this.language == "en"
        ? guide.description_EN || guide.description_ES
        : this.language == "fr"
        ? guide.description_FR || guide.description_ES
        : this.language == "eu"
        ? guide.description_EU || guide.description_ES
        : this.language == "ca"
        ? guide.description_CA || guide.description_ES
        : this.language == "de"
        ? guide.description_DE || guide.description_ES
        : guide.description_ES
      : "";
  }

  getCityGuideDescriptionTruncated(guide) {
    let description = guide
      ? this.language == "en"
        ? guide.description_EN || guide.description_ES
        : this.language == "fr"
        ? guide.description_FR || guide.description_ES
        : this.language == "eu"
        ? guide.description_EU || guide.description_ES
        : this.language == "ca"
        ? guide.description_CA || guide.description_ES
        : this.language == "de"
        ? guide.description_DE || guide.description_ES
        : guide.description_ES
      : "";

      let charlimit = 180;
      if (!description || description.length <= charlimit) {
        return description;
      }
  
      let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
      let shortened = without_html.substring(0, charlimit) + "...";
      return shortened;
  }

  mapFeatures(features) {
    this.cityGuideFeature = features?.find((f) => f.feature_id == 3);
    this.featureId = this.cityGuideFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.cityGuideFeature);
    this.pageTitle = `${this.id > 0 ? this._translateService.instant('edit-club.edityourclub') : this._translateService.instant('club-create.createyour')} ${this.pageName}`
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreateCityGuide =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 3
      );
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
        this.description = this.cityGuideForm.get("leadin_CA")?.value;
        result = !this.cityGuideForm.get("leadin_CA")?.value;
        break;
      case "de":
        this.description = this.cityGuideForm.get("leadin_DE")?.value;
        result = !this.cityGuideForm.get("leadin_DE")?.value;
        break;
      case "es":
        this.description = this.cityGuideForm.get("leadin_ES")?.value;
        result = !this.cityGuideForm.get("leadin_ES")?.value;
        break;
      case "eu":
        this.description = this.cityGuideForm.get("leadin_EU")?.value;
        result = !this.cityGuideForm.get("leadin_EU")?.value;
        break;
      case "fr":
        this.description = this.cityGuideForm.get("leadin_FR")?.value;
        result = !this.cityGuideForm.get("leadin_FR")?.value;
        break;
      default:
        this.description = this.cityGuideForm.get("leadin_ES")?.value;
        result = !this.cityGuideForm.get("leadin_ES")?.value;
        break;
    }

    return result;
  }

  validationCheck() {
    let code =
      this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    if (this.id == 0) {
      if (
        this.cityGuideForm?.value["name_" + code?.toString()?.toUpperCase()] &&
        this.cityGuideForm?.value["description_" + code?.toString()?.toUpperCase()] &&
        this.selectedCity &&
        this.file &&
        this.file.image
      ) {
        return true;
      }
    } else {
      if (
        this.cityGuideForm?.value["name_" + code?.toString()?.toUpperCase()] &&
        this.cityGuideForm?.value["description_" + code?.toString()?.toUpperCase()] &&
        this.selectedCity
      ) {
        return true;
      }
    }

    return false;
  }

  itemValidationCheck() {
    let code = this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    if (
      this.cityGuideItemForm?.value["title_" + code?.toString()?.toUpperCase()] &&
      this.cityGuideItemForm?.value["description_" + code?.toString()?.toUpperCase()]
    ) {
      return true;
    }

    return false;
  }

  setDescription() {
    if (this.editorToUse == "tinymce" && this.editor) {
      if (this.cityGuideForm.controls["description"]) {
        this.cityGuideForm.controls["description"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideForm.controls["descrition_EN"]) {
        this.cityGuideForm.controls["description_EN"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideForm.controls["description_FR"]) {
        this.cityGuideForm.controls["description_FR"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideForm.controls["description_EU"]) {
        this.cityGuideForm.controls["description_EU"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideForm.controls["description_CA"]) {
        this.cityGuideForm.controls["description_CA"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideForm.controls["description_DE"]) {
        this.cityGuideForm.controls["description_DE"].setValue(
          this.editor.getContent()
        );
      }
    }

    if (this.cityGuideForm.controls["description"]) {
      this.cityGuideForm.controls["description"].setValue(
        this.cityGuideForm
          .get("description")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideForm.controls["description_EN"]) {
      this.cityGuideForm.controls["description_EN"].setValue(
        this.cityGuideForm
          .get("description_EN")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideForm.controls["description_FR"]) {
      this.cityGuideForm.controls["description_FR"].setValue(
        this.cityGuideForm
          .get("description_FR")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideForm.controls["description_EU"]) {
      this.cityGuideForm.controls["description_EU"].setValue(
        this.cityGuideForm
          .get("description_EU")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideForm.controls["description_CA"]) {
      this.cityGuideForm.controls["description_CA"].setValue(
        this.cityGuideForm
          .get("description_CA")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideForm.controls["description_DE"]) {
      this.cityGuideForm.controls["description_DE"].setValue(
        this.cityGuideForm
          .get("description_DE")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }
  }

  setItemDescription() {
    if (this.editorToUse == "tinymce" && this.editor) {
      if (this.cityGuideItemForm.controls["description"]) {
        this.cityGuideItemForm.controls["description"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideItemForm.controls["descrition_EN"]) {
        this.cityGuideItemForm.controls["description_EN"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideItemForm.controls["description_FR"]) {
        this.cityGuideItemForm.controls["description_FR"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideItemForm.controls["description_EU"]) {
        this.cityGuideItemForm.controls["description_EU"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideItemForm.controls["description_CA"]) {
        this.cityGuideItemForm.controls["description_CA"].setValue(
          this.editor.getContent()
        );
      }
      if (this.cityGuideItemForm.controls["description_DE"]) {
        this.cityGuideItemForm.controls["description_DE"].setValue(
          this.editor.getContent()
        );
      }
    }

    if (this.cityGuideItemForm.controls["description"]) {
      this.cityGuideItemForm.controls["description"].setValue(
        this.cityGuideItemForm
          .get("description")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideItemForm.controls["description_EN"]) {
      this.cityGuideItemForm.controls["description_EN"].setValue(
        this.cityGuideItemForm
          .get("description_EN")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideItemForm.controls["description_FR"]) {
      this.cityGuideItemForm.controls["description_FR"].setValue(
        this.cityGuideItemForm
          .get("description_FR")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideItemForm.controls["description_EU"]) {
      this.cityGuideItemForm.controls["description_EU"].setValue(
        this.cityGuideItemForm
          .get("description_EU")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideItemForm.controls["description_CA"]) {
      this.cityGuideItemForm.controls["description_CA"].setValue(
        this.cityGuideItemForm
          .get("description_CA")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.cityGuideItemForm.controls["description_DE"]) {
      this.cityGuideItemForm.controls["description_DE"].setValue(
        this.cityGuideItemForm
          .get("description_DE")
          ?.value?.replace("*|MC:SUBJECT|*", "")
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

  saveCityGuide() {
    this.errorMessage = "";
    this.formSubmitted = true;
    this.issaving = true;

    let code =
      this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    this.name = this.cityGuideForm.get("name_" + code)?.value || "";
    this.leadin = this.cityGuideForm.get("leadin_" + code)?.value || "";
    this.description = this.cityGuideForm.get("description_" + code)?.value || "";

    if (
      this.cityGuideForm.get("name_" + code)?.errors ||
      this.checkDescription() ||
      !this.selectedCity
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

    this.cityGuideForm["name"] = this.name;
    this.cityGuideForm["leadin"] = this.leadin;
    this.cityGuideForm["description"] = this.description;
    this.cityGuideForm.value.name = this.name;
    this.cityGuideForm.value.leadin = this.leadin;
    this.cityGuideForm.value.description = this.description;

    let formData = new FormData();

    formData.append("company_id", this.companyId.toString());
    formData.append("user_id", this.userId.toString());
    formData.append(
      "name_ES",
      this.cityGuideForm?.value["name_ES"]
        ? this.cityGuideForm?.value["name_ES"]
        : this.cityGuideForm?.value["name"]
    );
    formData.append(
      "name_EN",
      this.cityGuideForm?.value["name_EN"]
        ? this.cityGuideForm?.value["name_EN"]
        : this.cityGuideForm?.value["name"]
    );
    formData.append(
      "name_FR",
      this.cityGuideForm?.value["name_FR"]
        ? this.cityGuideForm?.value["name_FR"]
        : this.cityGuideForm?.value["name"]
    );
    formData.append(
      "name_EU",
      this.cityGuideForm?.value["name_EU"]
        ? this.cityGuideForm?.value["name_EU"]
        : this.cityGuideForm?.value["name"]
    );
    formData.append(
      "name_CA",
      this.cityGuideForm?.value["name_CA"]
        ? this.cityGuideForm?.value["name_CA"]
        : this.cityGuideForm?.value["name"]
    );
    formData.append(
      "name_DE",
      this.cityGuideForm?.value["name_DE"]
        ? this.cityGuideForm?.value["name_DE"]
        : this.cityGuideForm?.value["name"]
    );
    formData.append(
      "leadin_ES",
      this.cityGuideForm?.value["leadin_ES"]
        ? this.cityGuideForm?.value["leadin_ES"]
        : this.cityGuideForm?.value["leadin"]
    );
    formData.append(
      "leadin_EN",
      this.cityGuideForm?.value["leadin_EN"]
        ? this.cityGuideForm?.value["leadin_EN"]
        : this.cityGuideForm?.value["leadin"]
    );
    formData.append(
      "leadin_FR",
      this.cityGuideForm?.value["leadin_FR"]
        ? this.cityGuideForm?.value["leadin_FR"]
        : this.cityGuideForm?.value["leadin"]
    );
    formData.append(
      "leadin_EU",
      this.cityGuideForm?.value["leadin_EU"]
        ? this.cityGuideForm?.value["leadin_EU"]
        : this.cityGuideForm?.value["leadin"]
    );
    formData.append(
      "leadin_CA",
      this.cityGuideForm?.value["leadin_CA"]
        ? this.cityGuideForm?.value["leadin_CA"]
        : this.cityGuideForm?.value["leadin"]
    );
    formData.append(
      "leadin_DE",
      this.cityGuideForm?.value["leadin_DE"]
        ? this.cityGuideForm?.value["leadin_DE"]
        : this.cityGuideForm?.value["leadin"]
    );
    formData.append("city_id", this.selectedCity);
    formData.append(
      "description_ES",
      this.cityGuideForm?.value["description_ES"]
        ? this.cityGuideForm?.value["description_ES"]
        : this.cityGuideForm?.value["description"]
    );
    formData.append(
      "description_EN",
      this.cityGuideForm?.value["description_EN"]
        ? this.cityGuideForm?.value["description_EN"]
        : this.cityGuideForm?.value["description"]
    );
    formData.append(
      "description_FR",
      this.cityGuideForm?.value["description_FR"]
        ? this.cityGuideForm?.value["description_FR"]
        : this.cityGuideForm?.value["description"]
    );
    formData.append(
      "description_EU",
      this.cityGuideForm?.value["description_EU"]
        ? this.cityGuideForm?.value["description_EU"]
        : this.cityGuideForm?.value["description"]
    );
    formData.append(
      "description_CA",
      this.cityGuideForm?.value["description_CA"]
        ? this.cityGuideForm?.value["description_CA"]
        : this.cityGuideForm?.value["description"]
    );
    formData.append(
      "description_DE",
      this.cityGuideForm?.value["description_DE"]
        ? this.cityGuideForm?.value["description_DE"]
        : this.cityGuideForm?.value["description"]
    );

    if(this.id > 0) {
      formData.append('id', this.id);
      formData.append('status', this.status ? '1' : '0');
    } else {
      formData.append('status', '1');
    }

    if (this.file?.image) {
      const filename = "cg_" + this.userId + "_" + this.getTimestamp();
      formData.append("destination", "./uploads/groups/");
      formData.append("filepath", "./uploads/groups/" + filename + ".jpg");
      formData.append("filenamewoextension", filename);
      formData.append("image", this.file.image, filename + ".jpg");
    }

    if (this.id > 0) {
      //   Edit
      this._cityGuidesService.editCityGuide(formData).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this._router.navigate([`/cityguide/details/${this.id}`]);
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      // Create
      this._cityGuidesService.addCityGuide(formData).subscribe(
        (response) => {
          if (response.id > 0) {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this._router.navigate([`/cityguide/edit/${response.id}`]);
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

  changeTab(event) {
    this.tabSelected = true;
  }

  handleCreateItem() {
    this.itemMode = 'add';
    this.itemImgSrc = '';
    this.cityGuideItemForm.reset();
  }

  handleEdit(item) {
    this.selectedItem = item;
    this.itemMode = 'edit';

    this.cityGuideItemForm.controls["title_ES"].setValue(item.title_ES);
    this.cityGuideItemForm.controls["title_EN"].setValue(item.title_EN);
    this.cityGuideItemForm.controls["title_FR"].setValue(item.title_FR);
    this.cityGuideItemForm.controls["title_EU"].setValue(item.title_EU);
    this.cityGuideItemForm.controls["title_CA"].setValue(item.title_CA);
    this.cityGuideItemForm.controls["title_DE"].setValue(item.title_DE);
    this.cityGuideItemForm.controls["description_ES"].setValue(item.description_ES);
    this.cityGuideItemForm.controls["description_EN"].setValue(item.description_EN);
    this.cityGuideItemForm.controls["description_FR"].setValue(item.description_FR);
    this.cityGuideItemForm.controls["description_EU"].setValue(item.description_EU);
    this.cityGuideItemForm.controls["description_CA"].setValue(item.description_CA);
    this.cityGuideItemForm.controls["description_DE"].setValue(item.description_DE);
    this.cityGuideItemForm.controls["latitude"].setValue(item.latitude);
    this.cityGuideItemForm.controls["longitude"].setValue(item.longitude);
    this.cityGuideItemForm.controls["distance_from_city"].setValue(item.distance_from_city);
    this.itemImgSrc = item.image;
  }

  handleDelete(item) {
    this.selectedItem = item;
    if (item.id) {
      this.showConfirmationModal = false;
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmdelete"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmdeleteitem"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  confirm() {
    this.deleteCityGuideItem(this.selectedItem?.id, true);
  }

  deleteCityGuideItem(id, confirmed) {
    if (confirmed) {
      this._cityGuidesService.deleteCityGuideItem(id).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this.cityGuideItems.forEach((cat, index) => {
            if (cat.id == id) {
              this.cityGuideItems.splice(index, 1);
            }
          });
          this.showConfirmationModal = false;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  handleCancel() {
    this.itemMode = '';
    this.selectedItem = '';
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  toggleCancelHover(event) {
    this.cancelHover = event;
  }

  saveCityGuideItem() {
    this.errorMessage = "";
    this.formSubmitted = true;
    this.issavingitem = true;

    let code = this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    this.title = this.cityGuideItemForm.get("title_" + code)?.value || "";
    this.itemdescription = this.cityGuideItemForm.get("description_" + code)?.value || "";

    if (
      this.cityGuideItemForm.get("title_" + code)?.errors
    ) {
      this.scrollToTop();
      this.issavingitem = false;
      return false;
    }

    if (!this.itemValidationCheck()) {
      this.scrollToTop();
      this.issavingitem = false;
      return false;
    }

    this.setItemDescription();

    this.cityGuideItemForm["title"] = this.name;
    this.cityGuideItemForm["description"] = this.description;
    this.cityGuideItemForm.value.title = this.title;
    this.cityGuideItemForm.value.description = this.itemdescription;

    let formData = new FormData();

    formData.append("company_id", this.companyId.toString());
    formData.append("user_id", this.userId.toString());
    formData.append(
      "title_ES",
      this.cityGuideItemForm?.value["title_ES"]
        ? this.cityGuideItemForm?.value["title_ES"]
        : this.cityGuideItemForm?.value["title"]
    );
    formData.append(
      "title_EN",
      this.cityGuideItemForm?.value["title_EN"]
        ? this.cityGuideItemForm?.value["title_EN"]
        : this.cityGuideItemForm?.value["title"]
    );
    formData.append(
      "title_FR",
      this.cityGuideItemForm?.value["name_FR"]
        ? this.cityGuideItemForm?.value["name_FR"]
        : this.cityGuideItemForm?.value["name"]
    );
    formData.append(
      "title_EU",
      this.cityGuideItemForm?.value["title_EU"]
        ? this.cityGuideItemForm?.value["title_EU"]
        : this.cityGuideItemForm?.value["title"]
    );
    formData.append(
      "title_CA",
      this.cityGuideItemForm?.value["title_CA"]
        ? this.cityGuideItemForm?.value["title_CA"]
        : this.cityGuideItemForm?.value["title"]
    );
    formData.append(
      "title_DE",
      this.cityGuideItemForm?.value["title_DE"]
        ? this.cityGuideItemForm?.value["title_DE"]
        : this.cityGuideItemForm?.value["title"]
    );
    formData.append("city_id", this.selectedCity);
    formData.append(
      "description_ES",
      this.cityGuideItemForm?.value["description_ES"]
        ? this.cityGuideItemForm?.value["description_ES"]
        : this.cityGuideItemForm?.value["description"]
    );
    formData.append(
      "description_EN",
      this.cityGuideItemForm?.value["description_EN"]
        ? this.cityGuideItemForm?.value["description_EN"]
        : this.cityGuideItemForm?.value["description"]
    );
    formData.append(
      "description_FR",
      this.cityGuideItemForm?.value["description_FR"]
        ? this.cityGuideItemForm?.value["description_FR"]
        : this.cityGuideItemForm?.value["description"]
    );
    formData.append(
      "description_EU",
      this.cityGuideItemForm?.value["description_EU"]
        ? this.cityGuideItemForm?.value["description_EU"]
        : this.cityGuideItemForm?.value["description"]
    );
    formData.append(
      "description_CA",
      this.cityGuideItemForm?.value["description_CA"]
        ? this.cityGuideItemForm?.value["description_CA"]
        : this.cityGuideItemForm?.value["description"]
    );
    formData.append(
      "description_DE",
      this.cityGuideItemForm?.value["description_DE"]
        ? this.cityGuideItemForm?.value["description_DE"]
        : this.cityGuideItemForm?.value["description"]
    );
    formData.append('latitude', this.cityGuideItemForm?.value["latitude"] || '');
    formData.append('longitude', this.cityGuideItemForm?.value["longitude"] || '');
    formData.append('distance_from_city', this.cityGuideItemForm?.value["distance_from_city"] || '');
    formData.append('city_guide_id', this.id);

    if(this.selectedItem?.id > 0) {
      formData.append('id', this.selectedItem?.id);
    }

    if (this.itemFile?.image) {
      const filename = "cg_" + this.userId + "_" + this.getTimestamp();
      formData.append("destination", "./uploads/groups/");
      formData.append("filepath", "./uploads/groups/" + filename + ".jpg");
      formData.append("filenamewoextension", filename);
      formData.append("image", this.itemFile.image, filename + ".jpg");
    }

    if (this.selectedItem?.id > 0) {
      //   Edit
      this._cityGuidesService.editCityGuideItem(formData).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.fetchCityGuideData();
          this.itemMode = '';
          this.issavingitem = false;
        },
        (error) => {
          this.issavingitem = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      // Create
      this._cityGuidesService.addCityGuideItem(formData).subscribe(
        (response) => {
          if (response.id > 0) {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this.fetchCityGuideData();
            this.itemMode = '';
            this.issavingitem = false;
          } else {
            this.issavingitem = false;
            this.open(this._translateService.instant("dialog.error"), "");
          }
        },
        (error) => {
          this.issavingitem = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    }
  }

  itemFileChangeEvent(event: any): void {
    this.itemImageChangedEvent = event;
    const file = event.target.files[0];
    if (file.size > 2000000) {
    } else {
      initFlowbite();
      setTimeout(() => {
        this.modalbutton2?.nativeElement.click();
      }, 500);
    }
  }

  itemImageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      this.itemImgSrc = this.itemCroppedImage = event.base64;
      this.itemFile = {
        name: "image",
        image: base64ToFile(event.base64),
      };
    }
  }

  itemImageLoaded() {
    // show cropper
  }

  itemCropperReady() {
    // cropper ready
  }

  itemLoadImageFailed() {
    // show message
  }

  itemImageCropperModalSave() {
    this.showImageCropper = false;
  }

  itemImageCropperModalClose() {
    this.showImageCropper = false;
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