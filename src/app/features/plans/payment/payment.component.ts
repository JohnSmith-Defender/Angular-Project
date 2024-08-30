import { CommonModule } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { PageTitleComponent } from "@share/components";
import { environment } from "@env/environment";
import {
  LocalService,
  CompanyService,
  UserService,
  PaymentService,
} from "src/app/share/services";
import { ModalComponent } from "@share/components";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { NgxStripeModule, StripeCardNumberComponent } from "ngx-stripe";
import { StripeService, StripeCardComponent } from "ngx-stripe";
import {
  StripeCardElement,
  StripeCardElementOptions,
  StripeElement,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { PlansService } from "@features/services";
import get from "lodash/get";

@Component({
  selector: "app-plans-payment",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    RouterModule,
    NgxStripeModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ModalComponent,
    PageTitleComponent,
  ],
  templateUrl: "./payment.component.html",
})
export class PlanPaymentComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;
  @Input() typeId!: number;
  @Input() userId!: number;

  type: any;
  user: any;
  language: any;
  companyId: any;
  membershipFee: any = "";
  otherSettings: any = [];
  dashboardDetails: any;
  memberTypes: any;
  paymentType: any;
  submitted: boolean = false;
  hasError: boolean = false;
  requireApproval: any;

  stripeData: any;
  stripeKey = "";
  error: any;
  complete = false;
  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: "#276fd3",
        color: "#31325F",
        lineHeight: "40px",
        fontWeight: 300,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: "18px",
        "::placeholder": {
          color: "#CFD7E0",
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: "es",
  };

  stripeForm: FormGroup = new FormGroup({
    founder_name: new FormControl(""),
    nombredelasociedad: new FormControl(""),
    direccion: new FormControl(""),
    cif: new FormControl(""),
    coupon: new FormControl(""),
    name: new FormControl(""),
    email: new FormControl(""),
    amount: new FormControl(""),
    country: new FormControl(""),
    phone: new FormControl(""),
    personal_address: new FormControl(""),
    city: new FormControl(""),
    zip_code: new FormControl(""),
    nif: new FormControl(""),
    company_name: new FormControl(""),
    province: new FormControl(""),
    company_zip_code: new FormControl(""),
    company_city: new FormControl(""),
    company_country: new FormControl(""),
    company_province: new FormControl(""),
    password: new FormControl(""),
    confirm_password: new FormControl(""),
  });
  companies: any;
  showLogo: boolean = false;
  logoSource: string = "";
  allRegistrationFields: any = [];
  registrationFields: any = [];
  allRegistrationFieldMapping: any = [];
  selectedFields: any = [];
  hasStepFields: boolean = false;
  sectionFields: any = [];
  showDefaultRegistrationFields: boolean = false;
  formTemplate: any;
  cardElementLoaded: boolean = false;
  agreeTerms: boolean = false;
  termsAndConditions: any = "";
  privacyPolicy: any = "";
  mode;
  invalidEmail: boolean = false;
  primaryColor: any = "";
  buttonColor: any = "";
  showCompleteDataForm: boolean = false;
  allSelectedFields: any = [];
  logoFile: any;
  completeDataSubmitted: boolean = false;
  selectedLogoFilename: any = "";
  planFrequency: any = "";
  confirm_email: any = 0;
  showCompleteDataFields: boolean = false;
  membershipPlanId: any;
  invalidCouponMessage: any = "";
  validCoupon: boolean = false;
  validCouponCode: any;
  validCouponInfo: any;

  allRegistrationText: any = [];
  registrationText: any = [];
  countries: any = [];
  isInvalidForm: boolean = false;
  missingCompanyName: boolean = false;
  missingCIF: boolean = false;
  missingAddress: boolean = false;
  missingCountry: boolean = false;
  missingProvince: boolean = false;
  missingCity: boolean = false;
  missingZipcode: boolean = false;
  missingPassword: boolean = false;
  missingConfirmPassword: boolean = false;
  passwordMismatch: boolean = false;
  trialPeriod: boolean = false;
  trialFee: boolean = false;
  trialDays: any;
  nextPayment: any;
  memberType: any;
  planMode: any;
  refreshAmount: boolean = false;
  showAccept: boolean = false;
  showContinue: boolean = false;
  confirmEmailMessage: any;
  newUserId: any;
  courseCategoryMapping: any = [];
  hasExistingMemberType: boolean = false;
  existingMemberTypeId: any;
  existingSubscriptionId: any;
  existingCreated: any;
  isUserExists: boolean = false;
  showCoupon: boolean = false;
  subscriptionId: any;
  subscription: any;
  changedKey: boolean = false;
  popupMessage: any;
  popupButtonText: any;
  popupTitle: any;
  fieldTextType: boolean = false;
  fieldConfirmTextType: boolean = false;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  checkCircleIcon = faCheckCircle;
  timesCircleIcon = faTimesCircle;
  pageTitle: any;
  @ViewChild(StripeCardComponent) card: StripeCardComponent | undefined;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  package: any;
  showConfirmed: boolean = false;
  event: any;
  showMultipleOptions: boolean = false;
  loadedPaymentMethods: boolean = false;
  selectedPaymentMethod: any = '';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _paymentService: PaymentService,
    private _stripeService: StripeService,
    private _plansService: PlansService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || 'es');

    if(this.userId > 0) {
      this.stripeForm = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required]],
        coupon: [''],
        country: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        personal_address: ['', [Validators.required]],
        city: ['', [Validators.required]],
        zip_code: ['', [Validators.required]],
        nif: [''],
        cif: [''],
        direccion: [''],
        province: ['', [Validators.required]],
      })
    } else {
      this.stripeForm = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required]],
        coupon: [''],
        country: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        personal_address: ['', [Validators.required]],
        city: ['', [Validators.required]],
        zip_code: ['', [Validators.required]],
        nif: [''],
        cif: [''],
        direccion: [''],
        province: ['', [Validators.required]],
        password: ["", [Validators.required]],
        confirm_password: ["", [Validators.required]],
      })
    }

    this.companies = get(
      await this._companyService.getCompanies().toPromise(),
      "companies"
    );

    if (this.companies) {
      let company = this._companyService.getCompany(this.companies);
      if (company && company[0]) {
        this.companyId = company[0].id;
        this.showLogo =
          company[0].show_logo_on_member_select == 1 ? true : false;
        this.primaryColor = company[0].primary_color;
        this.buttonColor = company[0].button_color
          ? company[0].button_color
          : company[0].primary_color;
        this.termsAndConditions = company[0].terms_and_conditions;
        this.privacyPolicy = company[0].policy;
        this.showCoupon = company[0].show_coupon == 1 ? true : false;
      }
    }

    this.initializeForm();
    this.getPaymentOptions();
    this.getUserDetails();
  }

  async initializeForm() {
    this.popupTitle = this._translateService.instant(
      "create-content.confirmation"
    );
    this._plansService.getPlan(this.id, this.typeId).subscribe(
      async response => {
        this.event = response.CompanyPlan || response.CompanyGroupPlan;
        this.pageTitle = this.event?.title;
      }
    )
  }

  getPaymentOptions() {
    this._plansService
      .getActivityPaymentOptions(this.id, this.typeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let payment_options = response.payment_options;
          this.showMultipleOptions = payment_options?.stripe_pay == 1 && payment_options?.bizum_pay == 1 ? true : false;
          this.loadedPaymentMethods = true;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getUserDetails() {
    this._userService
      .getUserById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.user = response.CompanyUser;
          if (this.userId > 0 && this.user) {
            if (this.stripeForm.controls["name"]) {
              this.stripeForm.controls["name"].setValue(
                this.user.name
                  ? this.user.name
                  : this.user.first_name + " " + this.user.last_name
              );
            }
            if (this.stripeForm.controls["email"]) {
              this.stripeForm.controls["email"].setValue(this.user.email);
            }
            if (this.stripeForm.controls["founder_name"]) {
              this.stripeForm.controls["founder_name"].setValue(
                this.user.name
                  ? this.user.name
                  : this.user.first_name + " " + this.user.last_name
              );
            }
            if (this.stripeForm.controls["phone"]) {
              this.stripeForm.controls["phone"].setValue(
                this.user.phone || ""
              );
            }
            if (this.stripeForm.controls["personal_address"]) {
              this.stripeForm.controls["personal_address"].setValue(
                this.user.personal_address || ""
              );
            }
            if (this.stripeForm.controls["city"]) {
              this.stripeForm.controls["city"].setValue(this.user.city || "");
            }
            if (this.stripeForm.controls["zip_code"]) {
              this.stripeForm.controls["zip_code"].setValue(
                this.user.zip_code || ""
              );
            }
            if (this.stripeForm.controls["country"]) {
              this.stripeForm.controls["country"].setValue(
                this.user.country || "Spain" || ""
              );
            }
            if (this.stripeForm.controls["nif"]) {
              this.stripeForm.controls["nif"].setValue(this.user.nif || "");
            }
            if (this.stripeForm.controls["cif"]) {
              this.stripeForm.controls["cif"].setValue(this.user.cif || "");
            }
            if (this.stripeForm.controls["direccion"]) {
              this.stripeForm.controls["direccion"].setValue(
                this.user.direccion || ""
              );
            }
            if (this.stripeForm.controls["province"]) {
              this.stripeForm.controls["province"].setValue(
                this.user.province || ""
              );
            }
          }
          if (this.stripeForm.controls["amount"]) {
            this.stripeForm.controls["amount"].setValue(this.event?.price);
          }
          this.initData();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initData() {
    this.getCountries();
    this.getStripe();
  }

  getStripe() {
    this._companyService
      .getStripePublishableKey(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.stripeKey = response.key;
          this._stripeService.changeKey(this.stripeKey);
          this.changedKey = true;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getCountries() {
    this._companyService
      .getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.countries = response.countries;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getEventTitle(event) {
    if(event) {
      return this.language == 'en' ? (event.title_en ? (event.title_en || event.title) : event.title) :
        (this.language == 'fr' ? (event.title_fr ? (event.title_fr || event.title) : event.title) : 
            (this.language == 'eu' ? (event.title_eu ? (event.title_eu || event.title) : event.title) : 
                (this.language == 'ca' ? (event.title_ca ? (event.title_ca || event.title) : event.title) : 
                    (this.language == 'de' ? (event.title_de ? (event.title_de || event.title) : event.title) : event.title)
                )
            )
        )
    } else {
      return ''
    }
  }

  getPrice(type, display) {
    let price = this.event?.price;
    return price && price > 0 ? (price.toString().replace(".", ",") + ' €') : '';
  }

  getDiscountAmount(display, mode = "") {
    let discount = "";
    if (this.validCouponInfo) {
      if (this.validCouponInfo.amount_off) {
        discount = parseFloat((this.validCouponInfo.amount_off / 100).toString()).toFixed(2);
      } else if (this.validCouponInfo.percent_off) {
        let price = this.event?.price;
        if (price > 0) {
          let price_discount = parseFloat(price) * (this.validCouponInfo.percent_off / 100);
          discount = parseFloat(price_discount.toString()).toFixed(2);
        }
      }
    }

    return discount;
  }

  getDiscountedPrice(display, mode = '') {
    let price = this.event.price;

    if(this.validCouponInfo) {
      let discount
      if(this.validCouponCode) {
        if(this.validCouponInfo.amount_off) {
          discount = parseFloat((this.validCouponInfo.amount_off / 100).toString()).toFixed(2)
        } else if (this.validCouponInfo.percent_off) {
          
          if(price > 0) {
            let price_discount = parseFloat(price) * (this.validCouponInfo.percent_off / 100)
            discount = parseFloat(price_discount.toString()).toFixed(2)
          }
        }
        if(discount > 0) {
          price = parseFloat(price) - parseFloat(discount)
          price = parseFloat(price).toFixed(2)
        }
      }
    }

    return price && price > 0 ? (price?.replace(".", ",") + ' €') : this._translateService.instant('category.free');
  }

  async applyCoupon() {
    this.refreshAmount = false;
    this.validCouponCode = "";

    // Check if coupon has value and is valid
    let coupon = "";
    if (this.stripeForm.controls["coupon"]) {
      coupon = this.stripeForm.get("coupon")?.value;
    }

    if (coupon) {
      this.validateProductCoupon(
        coupon,
        this.companyId,
        this.event?.plan_id,
        null,
        true,
      );
    }
  }

  validateProductCoupon(coupon, companyId, planId, content, manual_apply: boolean = false) {
    this._paymentService
      .validateProductCoupon(coupon, companyId, planId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let coupon_info = response.coupon_info;
          if (!coupon_info || (coupon_info && !coupon_info.valid)) {
            this.invalidCouponMessage = this._translateService.instant(
              "dialog.invalidcoupon"
            );
            this.submitted = false;
            this.hasError = true;
            this.open(this.invalidCouponMessage, "");
            return false;
          } else if (coupon_info && coupon_info.valid) {
            this.validCouponInfo = coupon_info;
            this.validCoupon = true;
            this.validCouponCode = coupon_info.name;
            this.refreshAmount = true;
            this.getPrice('', '');
          }
          if(manual_apply) {
          } else {
            this.continuePaymentProcess(null);
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  cardUpdated(result) {
    console.log(result);
  }

  keyUpdated() {
    console.log("keyUpdated");
  }

  async pay() {
    this.showAccept = false;
    this.showConfirmed = false;
    this.showContinue = false;

    this.hasError = false;
    this.submitted = true;
    this.isInvalidForm = false;
    this.missingAddress = false
    this.missingCIF = false
    this.missingCompanyName = false
    this.missingCountry = false
    this.missingProvince = false
    this.missingCity = false
    this.missingZipcode = false

    setTimeout(() => {
      if (this.isValidForm()) {
        this.continuePaymentProcess(null);
      } else {
        this.scrollToTop();
        this.submitted = false;
        this.isInvalidForm = true;
        this.open(this._translateService.instant("wall.requiredfields"), "");
      }
    }, 500)
  }

  continuePaymentProcess(content) {
    this.stripeData = this.stripeForm.value;
    if(this.showMultipleOptions && this.selectedPaymentMethod == 'Bizum') {
      this.processPaymentByBizum();
    } else {
      this.processPayment(content);
    }
  }

  processPaymentByBizum() {
    if(this.userId > 0) {
      this.proceedConfirmBizum();
    } else {
      this.signupUser();
    }
  }

  proceedConfirmBizum() {
    this._plansService.subscribeEventBizum(this.id, this.typeId, this.userId, this.companyId, this.stripeData)
    .subscribe(
      (res) => {
        this.showModal();
      },
      error => {
        this.showError();
      })
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

  processPayment(content = null) {
    const name = this.user ? this.user.email : this.stripeForm.get('email')?.value
    if (this.card?.element) {
      this._stripeService
        .createToken(this.card?.element, { name })
        .subscribe((result) => {
          if (result.token) {
            this.stripeData["token"] = result.token;
            if(this.userId > 0) {
              if(this.showMultipleOptions && this.selectedPaymentMethod == 'Bizum') {
                this.proceedConfirmBizum();
              } else {
                this.proceedPay();
              }
            } else {
              this.signupUser();
            }
          } else if (result.error) {
            this.submitted = false;
            this.hasError = true;
            this.open(result.error.message!, "");
          }
        });
    } else {
      this.submitted = false;
      this.open(this._translateService.instant("dialog.entercardinfo"), "");
    }
  }

  signupUser() {
    let first_name = "";
    let last_name = "";
    if (this.stripeData.name) {
      let name_array = this.stripeData.name.split(" ");
      if (name_array && name_array.length > 0) {
        first_name = name_array[0];
        last_name = name_array[1];
      } else {
        first_name = this.stripeData.name;
      }
    }

    let params = {
      email: this.stripeData.email,
      company_id: this.companyId,
      cif: this.stripeData.cif,
      city: this.stripeData.city,
      company_city: this.stripeData.company_city,
      company_country: this.stripeData.company_country,
      company_name: this.stripeData.company_name,
      company_province: this.stripeData.company_province,
      company_zip_code: this.stripeData.company_zip_code,
      country: this.stripeData.country,
      direccion: this.stripeData.direccion,
      name: this.stripeData.name,
      first_name: first_name,
      last_name: last_name,
      nif: this.stripeData.nif,
      personal_address: this.stripeData.personal_address,
      phone: this.stripeData.phone,
      province: this.stripeData.province,
      zip_code: this.stripeData.zip_code,
      custom_member_type_id: this.companyId == 35 ? 218 : 0,
      password: this.stripeData.password,
    };
    this._paymentService
      .cartUserSignup(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (rspns) => {
          if (rspns.user) {
            this.newUserId = rspns.user.id;
            if (rspns.code == "existing") {
              this.isUserExists = true;
            }
            this.userId = this.newUserId;
            if(this.showMultipleOptions && this.selectedPaymentMethod == 'Bizum') {
              this.proceedConfirmBizum();
            } else {
              this.proceedPay();
            }
          } else {
            this.showError();
          }
        },
        (error) => {
          this.submitted = false;
          this.hasError = true;
          console.log(error);
        }
      );
  }

  proceedPay() {
    this._plansService.subscribeEventStripe(this.id, this.typeId, this.userId, this.companyId, this.stripeData)
      .subscribe(
        (res) => {
          this.showModal();
        },
        error => {
          this.showError();
        })
  }

  showModal() {
    this.showAccept = true;
    this.popupMessage = this.getPopupMessage();
    this.popupButtonText = this.getPopupButtonText();
    this.modalbutton?.nativeElement.click();
  }

  getPopupMessage() {
    let message = ''
    if(this.showAccept) {
      message = this.showMultipleOptions && this.selectedPaymentMethod == 'Bizum' ?
        this._translateService.instant('credit-package.bizumconfirmed') : 
        this._translateService.instant('credit-package.paymentconfirmed');
    }
    if(this.showContinue) {
      message = this._translateService.instant('plan-details.pleasewait')
    }
    return message
  }

  getPopupButtonText() {
    let text = ''
    if(this.showAccept) {
      text = this._translateService.instant('buddy.accept')
    }
    if(this.showConfirmed) {
      text = this._translateService.instant('create-content.continue')
    }
    return text
  }

  showError() {
    this.hasError = true;
    this.submitted = false;
    this.open(this._translateService.instant("dialog.error"), "");
  }

  isValidForm() {
    let valid = true;
    Object.keys(this.stripeForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.stripeForm.controls[key].errors!;
      // if (controlErrors == null) {
      //   valid = true;
      // } else {
        if (controlErrors != null) {
          valid = false;
        } else {
          if (controlErrors != null && key == "email") {
            valid = false;
            this.invalidEmail = true;
          }
        }
      // }
    });
    
    return valid;
  }

  continue() {
    this.showConfirmed = true;
    this.showContinue = true;
    this.redirect();
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldConfirmTextType() {
    this.fieldConfirmTextType = !this.fieldConfirmTextType;
  }

  redirect() {
    setTimeout(() => {
      this._router.navigate([`/plans/details/${this.id}/${this.typeId}`])
    }, 1000)
  }

  handleChangePaymentMethod(event) {
    this.selectedPaymentMethod = event?.target?.value;
  }

  bizumSignup() {

  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}