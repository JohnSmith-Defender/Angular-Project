import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, Input, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { ServiciosService } from "@features/services";
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
  selector: "app-services-edit",
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
export class ServiceEditComponent {
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
  servicesFeature: any;
  featureId: any;
  pageName: any;
  superAdmin: boolean = false;
  canCreateService: any;
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
  service: any;
  status: boolean = false;
  pageTitle: string = "";
  serviceForm: FormGroup = new FormGroup({
    'name': new FormControl('', [Validators.required]),
    'price': new FormControl(''),
    'description': new FormControl('', [Validators.required]),
    'link': new FormControl(''),
    'text': new FormControl(''),
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
  requirePayment: boolean = false;
  serviceTypes: any;
  selectedServiceType: any = 2;
  serviceImgSrc: any;
  selectedContactPerson: any = '';
  serviceAdmins: any = [];
  selectedContactPersonPhone: any = '';
  selectedContactPersonEmail: any = '';
  phoneReadOnly: boolean = true;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _serviciosService: ServiciosService
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
    this.serviceTypes = [
      {
        id: 1,
        type_en: 'One time',
        type_es: 'Una vez'
      },
      {
        id: 2,
        type_en: 'Monthly recurring',
        type_es: 'Mensual recurrente'
      }
    ]
    this.fetchService();
  }

  fetchService() {
    this._serviciosService
      .fetchService(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures, data?.categories, data?.hotmart_settings);
          this.mapUserPermissions(data?.user_permissions);
          this.serviceAdmins = data?.service_admins;
          if(this.id > 0) {
            this.formatService(data);
          }
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.servicesFeature = features?.find((f) => f.feature_id == 14);
    this.featureId = this.servicesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.servicesFeature);
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
    this.canCreateService =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 4
      );
  }

  formatService(data) {
    let single_service = data?.service

    let service = {
      id: single_service.id,
      name: single_service.name,
      description: single_service.description,
      contact_person_id: single_service.contact_person_id,
      phone_number: single_service.phone_number,
      image: `${environment.api}/get-image/${single_service.image}`,
      subscription_fee: single_service.subscription_fee,
      product_id: single_service.product_id,
      plan_id: single_service.plan_id,
      service_type: single_service.service_type,
      link: single_service.link,
      text: single_service.text,
      created_by: single_service.created_by,
      created_at: single_service.created_at,
      creator: single_service?.creator,
      contact_person: single_service?.contact_person,
    }
    this.service = service;

    this.serviceForm.controls["name"].setValue(this.service?.name);
    this.serviceForm.controls["price"].setValue(this.service?.subscription_fee);
    this.serviceForm.controls["description"].setValue(this.service?.description);
    this.serviceForm.controls["link"].setValue(this.service?.link);
    this.serviceForm.controls["text"].setValue(this.service?.text);
    this.selectedContactPerson = this.service?.contact_person_id;
    this.selectedContactPersonEmail = this.service?.contact_person?.email;
    this.selectedContactPersonPhone = this.service?.phone_number;
    this.selectedServiceType = this.service?.service_type;

    this.imgSrc = this.service?.image;
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

  changeContactPerson(event) {
    let id = event.target.value
    if(id > 0) {
      if(this.serviceAdmins) {
        let service_admin = this.serviceAdmins.filter(s => {
          return s.id == parseInt(id)
        })
        if(service_admin?.length > 0) {
          this.selectedContactPersonEmail = service_admin[0].email
          this.selectedContactPersonPhone = service_admin[0].phone
        }
      }
    }
  }

  saveService() {
    this.errorMessage = "";
    this.formSubmitted = true;

    if(
      this.serviceForm.get('name')?.errors
      || this.serviceForm.get('description')?.errors
      || !this.selectedContactPerson
    ) {
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
    formData.append('name', this.serviceForm?.value?.name );
    formData.append('description', this.serviceForm?.value?.description );
    formData.append('contact_person_id', this.selectedContactPerson);
    formData.append('company_id', this.companyId.toString());
    formData.append('service_type', this.selectedServiceType && this.requirePayment ? this.selectedServiceType : null);
    formData.append('phone_number', this.selectedContactPersonPhone || '');
    formData.append('link', this.serviceForm?.value?.link);
    formData.append('text', this.serviceForm?.value?.text);

    let price
    if(this.requirePayment) {
      price = this.serviceForm?.value?.price
      let subscription_fee
      if(price) {
        if(price.indexOf("€")) {
          subscription_fee = price.replace("€", "");
          subscription_fee = price.trim();
        }
      }

      if(subscription_fee > 0) {
        formData.append('subscription_fee', subscription_fee);
      }
    }

    if(this.file) {
      const filename = 'serviceImage_' + Math.random()*100000000000000000;
      formData.append('destination', './uploads/');
      formData.append('filepath', './uploads/');
      formData.append('filenamewoextension', filename);
      formData.append('image', this.file.image, filename + '.jpg');
    }

    if (this.id == 0) {
      formData.append("created_by", this.userId.toString());
    }

    if (this.id > 0) {
      // Edit
      this._serviciosService.editService(this.id, formData).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this._router.navigate([`/services/details/${this.id}`]);
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      // Create
      this._serviciosService.addService(formData).subscribe(
        (response) => {
          if (response?.id > 0) {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this._router.navigate([
              `/services/details/${response?.id}`,
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