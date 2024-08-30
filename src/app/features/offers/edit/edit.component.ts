import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, Input, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { OffersService } from "@features/services/offers/offers.service";
import { Subject, takeUntil } from "rxjs";
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
import {
  ImageCropperModule,
  ImageCroppedEvent,
  ImageTransform,
  base64ToFile,
} from "ngx-image-cropper";
import { QuillModule } from 'ngx-quill';
import { faRotateLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";
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

@Component({
  selector: "app-offers-edit",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    QuillModule,
    ImageCropperModule,
    FontAwesomeModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    ButtonGroupComponent,
    PageTitleComponent,
    NoAccessComponent,
  ],
  templateUrl: "./edit.component.html",
})
export class OfferEditComponent {
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
  offersFeature: any;
  featureId: any;
  pageName: any;
  superAdmin: boolean = false;
  canCreateOffer: any;
  languages: any = [];
  isLoading: boolean = true;
  selectedLanguage: string = "es";
  selectedLanguageChanged: boolean = false;
  showLanguageNote: boolean = true;
  buttonList: any = [];
  issaving: boolean = false;
  dropdownSettings: any;
  errorMessage: string = "";
  formSubmitted: boolean = false;
  offer: any;
  status: boolean = false;
  pageTitle: string = "";
  offerForm: FormGroup = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'title_en': new FormControl(''),
    'title_fr': new FormControl(''),
    'title_eu': new FormControl(''),
    'title_ca': new FormControl(''),
    'title_de': new FormControl(''),
    'discount_code': new FormControl('', [Validators.required]),
    'company_name': new FormControl(''),
    'address': new FormControl(''),
    'phone': new FormControl(''),
    'price': new FormControl(null),
    'percent': new FormControl(null),
    'website': new FormControl(''),
    'email': new FormControl(''),
    'valid_since': new FormControl(new Date().toISOString().split('T')[0], [Validators.required]),
    'valid_until': new FormControl(new Date().toISOString().split('T')[0], [Validators.required]),
    'description': new FormControl('', [Validators.required]),
    'description_en': new FormControl(''),
    'description_fr': new FormControl(''),
    'description_eu': new FormControl(''),
    'description_ca': new FormControl(''),
    'description_de': new FormControl(''),
  });
  searchByKeyword: boolean = false;
  hasMembersOnly: boolean = false;
  tagsMapping: any;
  tags: any = [];
  imgSrc: any;
  course: any;
  tag: any;
  courses: any;
  data: any = [];
  file: { name: string; image: any; } | undefined
  showImageCropper: boolean = false;
  imageChangedEvent: any = "";
  croppedImage: any = "";
  rotateLeftIcon = faRotateLeft;
  rotateRightIcon = faRotateRight;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  transform: ImageTransform = {};
  defaultLanguage: any = "es";
  @ViewChild("modalbutton", { static: false }) modalbutton: ElementRef<HTMLInputElement> = {} as ElementRef;
  discountTypes: any;
  discountCategories: any;
  discountType: string = '';
  discountCategory: string = '';
  noImage: boolean = false;
  showError: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _offersService: OffersService
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
    this.fetchOffer();
  }

  fetchOffer() {
    this._offersService
      .fetchOffer(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures, data?.categories, data?.hotmart_settings);
          this.mapUserPermissions(data?.user_permissions);
          this.mapLanguages(data?.languages);
          this.discountTypes = data?.discount_types;
          this.discountCategories = data?.discount_categories;
          if(this.id > 0) {
            this.formatOffer(data);
          }
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.offersFeature = features?.find((f) => f.feature_id == 4);
    this.featureId = this.offersFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.offersFeature);
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
    this.canCreateOffer =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 4
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

  formatOffer(data) {
    let single_offer = data?.offer
    let offer = {
      id: single_offer.id,
      fk_company_id: single_offer.fk_company_id,
      fk_supercategory_id: single_offer.fk_supercategory_id,
      status: single_offer.status,
      display_title: this.getOfferTitle(single_offer),
      title: single_offer.title,
      title_EN: single_offer.title_EN,
      title_FR: single_offer.title_FR,
      title_eu: single_offer.title_EU,
      title_ca: single_offer.title_CA,
      title_de: single_offer.title_DE,
      company: single_offer.company,
      address: single_offer.address,
      latitude: single_offer.latitude,
      longitude: single_offer.longitude,
      image: `${environment.api}/get-ie-image-disc/${single_offer.image}`,
      validSince: single_offer.validSince,
      validUntil: single_offer.validUntil,
      price: single_offer.price,
      percent: single_offer.percent,
      display_description: this.getOfferDescription(single_offer),
      description: single_offer.description,
      description_en: single_offer.description_EN,
      description_fr: single_offer.description_FR,
      description_eu: single_offer.description_EU,
      description_ca: single_offer.description_CA,
      description_de: single_offer.description_DE,
      notes: single_offer.notes,
      discountCode: single_offer.discountCode,
      openingHours: single_offer.openingHours,
      directions: single_offer.directions,
      website: single_offer.website,
      facebook: single_offer.facebook,
      instagram: single_offer.instagram,
      email: single_offer.email,
      phone: single_offer.phone,
      terms_and_conditions: single_offer.terms_and_conditions,
      fk_discount_supercategory_id: single_offer.fk_discount_supercategory_id,
      discount_type_id: single_offer.discount_type_id,
      created_by: single_offer.created_by,
      created: single_offer.created,
      discount_category: this.getCategoryTitle(single_offer.discount_category),
      discount_type: this.getTypeTitle(single_offer.discount_type),
      creator: single_offer?.creator
    }
    this.offer = offer;

    this.offerForm.controls["title"].setValue(this.offer?.title);
    this.offerForm.controls["title_en"].setValue(this.offer?.title_en);
    this.offerForm.controls["title_fr"].setValue(this.offer?.title_fr);
    this.offerForm.controls["title_eu"].setValue(this.offer?.title_eu);
    this.offerForm.controls["title_ca"].setValue(this.offer?.title_ca);
    this.offerForm.controls["title_de"].setValue(this.offer?.title_de);
    this.offerForm.controls["description"].setValue(this.offer?.description);
    this.offerForm.controls["description_en"].setValue(this.offer?.description_en);
    this.offerForm.controls["description_fr"].setValue(this.offer?.description_fr);
    this.offerForm.controls["description_eu"].setValue(this.offer?.description_eu);
    this.offerForm.controls["description_ca"].setValue(this.offer?.description_ca);
    this.offerForm.controls["description_de"].setValue(this.offer?.description_de);
    this.offerForm.controls["discount_code"].setValue(this.offer?.discountCode);
    this.offerForm.controls["company_name"].setValue(this.offer?.company);
    this.offerForm.controls["address"].setValue(this.offer?.address);
    this.offerForm.controls["phone"].setValue(this.offer?.phone);
    this.offerForm.controls["price"].setValue(this.offer?.price);
    this.offerForm.controls["percent"].setValue(this.offer?.percent);
    this.offerForm.controls["website"].setValue(this.offer?.website);
    this.offerForm.controls["email"].setValue(this.offer?.email);
    this.discountType = this.offer?.discount_type_id;

    let timezoneOffset = new Date().getTimezoneOffset();
    if(this.offer.validSince) {
      let pd = (
        moment(this.offer.validSince)
          .utc()
          .utcOffset(timezoneOffset)
          .format("YYYY-MM-DD HH:mm")
          .toString() + ":00Z"
      ).replace(" ", "T");
      this.offerForm.controls["valid_since"].setValue(pd);
    }
    if(this.offer.validUntil) {
      let pd = (
        moment(this.offer.validUntil)
          .utc()
          .utcOffset(timezoneOffset)
          .format("YYYY-MM-DD HH:mm")
          .toString() + ":00Z"
      ).replace(" ", "T");
      this.offerForm.controls["valid_until"].setValue(pd);
    }
    this.discountCategory = this.offer.fk_supercategory_id;
    this.imgSrc = this.offer?.image;
  };

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

  getOfferTitle(offer) {
    return offer
      ? this.language == "en"
        ? offer.title_EN || offer.title
        : this.language == "fr"
        ? offer.title_FR || offer.title
        : this.language == "eu"
        ? offer.title_EU || offer.title
        : this.language == "ca"
        ? offer.title_CA || offer.title
        : this.language == "de"
        ? offer.title_DE || offer.title
        : offer.title
      : "";
  }

  getOfferDescription(offer) {
    return offer
      ? this.language == "en"
        ? offer.description_EN || offer.description
        : this.language == "fr"
        ? offer.description_FR || offer.description
        : this.language == "eu"
        ? offer.description_EU || offer.description
        : this.language == "ca"
        ? offer.description_CA || offer.description
        : this.language == "de"
        ? offer.description_DE || offer.description
        : offer.description
      : "";
  }

  getCategoryTitle(category) {
    return category
      ? this.language == "en"
        ? category.name_EN || category.name_ES
        : this.language == "fr"
        ? category.name_FR || category.name_ES
        : this.language == "eu"
        ? category.name_EU || category.name_ES
        : this.language == "ca"
        ? category.name_CA || category.name_ES
        : this.language == "de"
        ? category.name_DE || category.name_ES
        : category.name_ES
      : "";
  }

  getTypeTitle(type) {
    return type
      ? this.language == "en"
        ? type.name_EN || type.name_ES
        : this.language == "fr"
        ? type.name_FR || type.name_ES
        : type.name_ES
      : "";
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

  getCourseTitle(course) {
    return course ? (this.language == 'en' ? (course.title_en || course.title) : (this.language == 'fr' ? (course.title_fr || course.title) : 
      (this.language == 'eu' ? (course.title_eu || course.title) : (this.language == 'ca' ? (course.title_ca || course.title) : 
      (this.language == 'de' ? (course.title_de || course.title) : course.title)
      ))
    )) : ''
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
    const file = event?.target?.files[0];
    if (file?.size > 2000000) {
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

  saveOffer() {
    this.errorMessage = "";
    this.formSubmitted = true;

    if(
      this.offerForm.get('title')?.errors
    || this.offerForm.get('discount_code')?.errors
    || this.offerForm.get('valid_since')?.errors
    || this.offerForm.get('valid_until')?.errors
    || this.offerForm.get('description')?.errors) {
      this.scrollToTop()
      return false;
    }

    if (!this.imgSrc) {
      this.noImage = true;
      this.showError = true;
      this.open(
        this._translateService.instant("dialog.pleaseuploadanimage"),
        ""
      );
      this.issaving = false;
      this.scrollToTop();
      return false;
    } else {
      this.noImage = false;
      this.showError = false;
      this.errorMessage = "";
    }

    this.issaving = true;
    this.showError = false;

    let formData = new FormData();
    formData.append('title', this.offerForm?.value?.title );
    formData.append('title_en', this.offerForm?.value?.title_en ? this.offerForm?.value?.title_en : this.offerForm?.value?.title);
    formData.append('title_fr', this.offerForm?.value?.title_fr ? this.offerForm?.value?.title_fr : this.offerForm?.value?.title);
    formData.append('title_eu', this.offerForm?.value?.title_eu ? this.offerForm?.value?.title_eu : this.offerForm?.value?.title);
    formData.append('title_ca', this.offerForm?.value?.title_ca ? this.offerForm?.value?.title_ca : this.offerForm?.value?.title);
    formData.append('title_de', this.offerForm?.value?.title_de ? this.offerForm?.value?.title_de : this.offerForm?.value?.title);
    formData.append('company', this.offerForm?.value?.company_name ? this.offerForm?.value?.company_name : '' );
    formData.append('phone', this.offerForm?.value?.phone ? this.offerForm?.value?.phone : '' );
    formData.append('email', this.offerForm?.value?.email ? this.offerForm?.value?.email : '' );
    formData.append('website', this.offerForm?.value?.website ? this.offerForm?.value?.website : '' );
    formData.append('address', this.offerForm?.value?.address ? this.offerForm?.value?.address : '' );
    formData.append('discountCode', this.offerForm?.value?.discount_code ? this.offerForm?.value?.discount_code : '' );
    formData.append('fk_company_id', this.companyId.toString());

    if(this.offerForm?.value?.valid_since) {
      formData.append('validSince', moment(this.offerForm?.value?.valid_since).format("YYYY-MM-DD"));
    }
    
    if(this.offerForm?.value?.valid_until) {
      formData.append('validUntil', moment(this.offerForm?.value?.valid_until).format("YYYY-MM-DD"));
    }

    formData.append('price', this.offerForm?.value?.price ? this.offerForm?.value?.price : 0 );
    formData.append('percent', this.offerForm?.value?.percent ? this.offerForm?.value?.percent : 0 );
    
    formData.append('description', this.offerForm?.value?.description );
    formData.append('description_en', this.offerForm?.value?.description_en ? this.offerForm?.value?.description_en : this.offerForm?.value?.description);
    formData.append('description_fr', this.offerForm?.value?.description_fr ? this.offerForm?.value?.description_fr : this.offerForm?.value?.description);
    formData.append('description_eu', this.offerForm?.value?.description_eu ? this.offerForm?.value?.description_eu : this.offerForm?.value?.description);
    formData.append('description_ca', this.offerForm?.value?.description_ca ? this.offerForm?.value?.description_ca : this.offerForm?.value?.description);
    formData.append('description_de', this.offerForm?.value?.description_de ? this.offerForm?.value?.description_de : this.offerForm?.value?.description);

    if(this.discountType) {
      formData.append('discount_type_id', this.discountType);
    } else {
      if(this.discountCategory) {
        formData.append('fk_supercategory_id', this.discountCategory);
      }
    }

    if (this.file) {
      const filename = 'offer_' + this.userId + '_' + this.getTimestamp();
      formData.append('image', this.file.image, filename + '.jpg');
    }

    if (this.id == 0) {
      formData.append("created_by", this.userId.toString());
    }

    if (this.id > 0) {
      // Edit
      this._offersService.editDiscount(this.id, formData).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this._router.navigate([`/discounts/details/${this.id}`]);
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      // Create
      this._offersService.addDiscount(formData).subscribe(
        (response) => {
          if (response?.discount?.id > 0) {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this._router.navigate([
              `/discounts/details/${response?.discount?.id}`,
            ]);
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

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}