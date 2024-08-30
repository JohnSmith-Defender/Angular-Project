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
import get from "lodash/get";

@Component({
  selector: "app-credits",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    RouterModule,
    NgxStripeModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    PageTitleComponent,
  ],
  templateUrl: "./credits.component.html",
})
export class CreditsComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;
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
  pageTitle: any;
  @ViewChild(StripeCardComponent) card: StripeCardComponent | undefined;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  package: any;
  showConfirmed: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _paymentService: PaymentService,
    private _stripeService: StripeService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || 'es');
    this.pageTitle = this._translateService.instant('credit-package.creditpackage');

    this.stripeForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      coupon: [''],
      country: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      personal_address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      zip_code: ['', [Validators.required]],
      nif: ['', [Validators.required]],
      cif: [''],
      direccion: [''],
      province: ['', [Validators.required]],
    })

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
      }
    }

    this.initializeForm();
    this.getCountries();
  }

  initData(publishable_key) {
    this.getStripe(publishable_key);
  }

  getUserDetails(publishable_key) {
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
            this.stripeForm.controls["amount"].setValue(this.membershipFee);
          }
          this.initData(publishable_key || '');
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async initializeForm() {
    this.popupTitle = this._translateService.instant(
      "create-content.confirmation"
    );
    if(this.id){
      this._userService.getCreditPackage(this.id, this.companyId).subscribe(
        async response => {
          if(response?.credit_package){
            this.package = response.credit_package
            this.getUserDetails(response?.publishable_key);
          } else {
            this.initData('');
          }
        }
      )
    } else {
      this.initData('');
    }
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

  getStripe(publishable_key) {
    if(publishable_key) {
      this.stripeKey = publishable_key;
      this._stripeService.changeKey(this.stripeKey);
      this.changedKey = true;
    } else {
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
  }

  getPrice(type, display) {
    let price = this.package?.price
    return price && price > 0 ? (price.toString().replace(".", ",") + ' €') : ''
  }

  cardUpdated(result) {
    console.log(result);
  }

  keyUpdated() {
    console.log("keyUpdated");
  }

  // getPopupMessage() {
  //   let message = this._translateService.instant("signup.paymentconfirmed");

  //   if (this.showConfirmEmail) {
  //     message = this.confirmEmailMessage;
  //   }
  //   if (this.showContinue) {
  //     let acknowledgement_page_url =
  //       this.subscription?.id > 0
  //         ? this.subscription.acknowledgement_page_url
  //         : this.memberType.acknowledgement_page_url;
  //     if (acknowledgement_page_url) {
  //       message = this._translateService.instant(
  //         "signup.redirectacknowledgmentpage"
  //       );
  //     } else {
  //       message = this._translateService.instant("signup.continuelogin");
  //     }
  //   }

  //   return message;
  // }

  // getPopupButtonText() {
  //   let text = this._translateService.instant("buddy.accept");
  //   if (this.showConfirmEmail) {
  //     text = this._translateService.instant("create-content.continue");
  //   }

  //   return text;
  // }

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

    if (this.isValidForm()) {
      this.continuePaymentProcess(null);
    } else {
      this.scrollToTop();
      this.submitted = false;
      this.isInvalidForm = true;
      this.open(this._translateService.instant("wall.requiredfields"), "");
    }
  }

  continuePaymentProcess(content) {
    this.stripeData = this.stripeForm.value;
    this.processPayment(content);
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
            this._userService.subscribeCreditPackage(this.id, this.userId, this.companyId, this.stripeData)
            .subscribe(
              (res) => {
                this.showModal();
              },
              error => {
                this.showError();
              })
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

  showModal() {
    this.showAccept = true;
    this.popupMessage = this.getPopupMessage();
    this.popupButtonText = this.getPopupButtonText();
    this.modalbutton?.nativeElement.click();
  }

  getPopupMessage() {
    let message = ''
    if(this.showAccept) {
      message = this._translateService.instant('credit-package.paymentconfirmed')
    }
    if(this.showContinue) {
      if(this.userId > 0) {
        message = this._translateService.instant('credit-package.continuecredits')
      } else {
        message = this._translateService.instant('signup.continuelogin')
      }
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
      const controlErrors: ValidationErrors =
        this.stripeForm.controls[key].errors!;
      if (controlErrors == null) {
        valid = true;
      } else {
        if (controlErrors != null) {
          valid = false;
        } else {
          if (key == "email") {
            valid = false;
            this.invalidEmail = true;
          }
        }
      }
    });

    return valid;
  }

  continue() {
    this.showConfirmed = true;
    this.showContinue = true;
    this.redirect();
  }

  redirect() {
    setTimeout(() => {
      if(this.userId > 0) {
          this._router.navigate([`/users/my-credits/tutors`])
          .then(() => {
            window.location.reload()
          })
      } else {
        this._router.navigate([`/auth/login`])
        .then(() => {
          window.location.reload()
        })
      }
    }, 1000)
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
