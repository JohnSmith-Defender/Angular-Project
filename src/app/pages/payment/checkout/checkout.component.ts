import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { environment } from "@env/environment";
import { AuthService } from "src/app/core/services";
import {
  LocalService,
  CompanyService,
  UserService,
  PaymentService,
} from "src/app/share/services";
import { CoursesService } from "@features/services/courses/courses.service";
import { CompanyLogoComponent, ModalComponent } from "@share/components";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
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
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-checkout",
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
    CompanyLogoComponent,
    ModalComponent,
  ],
  templateUrl: "./checkout.component.html",
})
export class CheckoutComponent {
  private destroy$ = new Subject<void>();

  @ViewChild(StripeCardComponent) card: StripeCardComponent | undefined;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;

  id: any;
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
  invoiceSpain: boolean = false;
  customInvoice: boolean = false;
  hasSelectExistingOrCreateNewStartup: boolean = false;
  useCompanyInvoice: boolean = false;
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
  showConfirmEmail: boolean = false;
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
  samePrice: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _paymentService: PaymentService,
    private _stripeService: StripeService,
    private _coursesService: CoursesService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.id = params.get("id");
      this.type = params.get("type");
    });

    this.stripeForm = this.fb.group({
      founder_name: [""],
      nombredelasociedad: [""],
      direccion: [""],
      cif: [""],
      coupon: [""],
      name: [""],
      email: [""],
      amount: [""],
      country: [""],
      phone: [""],
      personal_address: [""],
      city: [""],
      zip_code: [""],
      nif: [""],
      company_name: [""],
      province: [""],
      company_zip_code: [""],
      company_city: [""],
      company_country: [""],
      company_province: [""],
      password: [""],
      confirm_password: [""],
    });

    this._route.queryParams.subscribe((params) => {
      this.planMode = params ? params["mode "] : "";
      this.subscriptionId = params ? params["sub"] : 0;
      if (this.subscriptionId > 0) {
        this.getSubscription(this.subscriptionId);
      }
    });

    this.companies = get(
      await this._companyService.getCompanies().toPromise(),
      "companies"
    );
    this.planFrequency = this._localService.getLocalStorage(
      environment.lsplanFrequency
    );

    this.language = this._localService.getLocalStorage(environment.lslang);
    
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
        this.logoSource = `${COMPANY_IMAGE_URL}/${company[0].image}`;
        this.termsAndConditions = company[0].terms_and_conditions;
        this.privacyPolicy = company[0].policy;
        this.customInvoice = company[0].custom_invoice == 1 ? true : false;
        this.showCoupon = company[0].show_coupon == 1 ? true : false;
        if(this.companyId == 65 && this.language == 'es') {
          this.language = 'it';
        }
      }
    }

    this._translateService.use(this.language || "es");

    this.initializeForm();
    this.getUserDetails();
  }

  initData() {
    this.getCountries();
    this.getCustomMemberTypes();
    this.getStripe();
    this.checkConfirmEmail();
  }

  getUserDetails() {
    this._userService
      .getUserById(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.user = response.CompanyUser;
          if (this.id > 0 && this.user) {
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
            if (this.customInvoice) {
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
              if (this.stripeForm.controls["company_name"]) {
                this.stripeForm.controls["company_name"].setValue(
                  this.user.company_name || ""
                );
              }
              if (this.stripeForm.controls["cif"]) {
                this.stripeForm.controls["cif"].setValue(this.user.cif || "");
              }
              if (this.stripeForm.controls["direccion"]) {
                this.stripeForm.controls["direccion"].setValue(
                  this.user.direccion || ""
                );
              }
              if (this.stripeForm.controls["company_zip_code"]) {
                this.stripeForm.controls["company_zip_code"].setValue(
                  this.user.company_zip_code || ""
                );
              }
              if (this.stripeForm.controls["company_city"]) {
                this.stripeForm.controls["company_city"].setValue(
                  this.user.company_city || ""
                );
              }
              if (this.stripeForm.controls["company_country"]) {
                this.stripeForm.controls["company_country"].setValue(
                  this.user.company_country || ""
                );
              }
              if (this.stripeForm.controls["province"]) {
                this.stripeForm.controls["province"].setValue(
                  this.user.province || ""
                );
              }
              if (this.stripeForm.controls["company_province"]) {
                this.stripeForm.controls["company_province"].setValue(
                  this.user.company_province || ""
                );
              }

              if (
                this.user.company_name &&
                this.user.company_country == "Spain"
              ) {
                this.invoiceSpain = true;
              }
              if (!this.user.company_name && this.user.country == "Spain") {
                this.invoiceSpain = true;
              }
              if (!this.user.country && !this.user.company_country) {
                this.invoiceSpain = true;
              }
              if (this.id == 0) {
                this.invoiceSpain = true;
                if (this.stripeForm.controls["country"]) {
                  this.stripeForm.controls["country"].setValue("Spain");
                }
              }
            }
          }
          if (this.id == 0) {
            if (this.stripeForm.controls["name"]) {
              this.stripeForm.controls["name"].setValue("");
            }
            if (this.stripeForm.controls["email"]) {
              this.stripeForm.controls["email"].setValue("");
            }
            if (this.stripeForm.controls["phone"]) {
              this.stripeForm.controls["phone"].setValue("");
            }
            if (this.stripeForm.controls["country"]) {
              this.stripeForm.controls["country"].setValue("Spain");
            }
          }
          if (this.stripeForm.controls["amount"]) {
            this.stripeForm.controls["amount"].setValue(this.membershipFee);
          }
          this.setPrice(this.memberType);
          this.initData();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializeForm() {
    this.popupTitle = this._translateService.instant(
      "create-content.confirmation"
    );
    if (this.id == 0) {
      this.stripeForm = this.fb.group({
        name: ["", [Validators.required]],
        email: ["", [Validators.required]],
        amount: ["", [Validators.required]],
        coupon: [""],
        country: ["", [Validators.required]],
        phone: ["", [Validators.required]],
        personal_address: ["", [Validators.required]],
        city: ["", [Validators.required]],
        zip_code: ["", [Validators.required]],
        nif: ["", [Validators.required]],
        company_name: [""],
        cif: [""],
        direccion: [""],
        province: ["", [Validators.required]],
        company_zip_code: [""],
        company_city: [""],
        company_country: [""],
        company_province: [""],
        password: ["", [Validators.required]],
        confirm_password: ["", [Validators.required]],
      });
    } else {
      this.stripeForm = this.fb.group({
        name: ["", [Validators.required]],
        email: ["", [Validators.required]],
        amount: ["", [Validators.required]],
        coupon: [""],
        country: ["", [Validators.required]],
        phone: ["", [Validators.required]],
        personal_address: ["", [Validators.required]],
        city: ["", [Validators.required]],
        zip_code: ["", [Validators.required]],
        nif: ["", [Validators.required]],
        company_name: [""],
        cif: [""],
        direccion: [""],
        province: ["", [Validators.required]],
        company_zip_code: [""],
        company_city: [""],
        company_country: [""],
        company_province: [""],
      });
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

  getCustomMemberTypes() {
    this._userService
      .getCustomMemberTypes(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.memberTypes = response.member_types;
          if (this.memberTypes?.length > 0) {
            let member_type = this.memberTypes.filter((t) => {
              return t.id == this.type;
            });
            if (member_type && member_type[0]) {
              this.memberType = member_type[0];
              this.membershipFee = this.setPrice(this.memberType);
              this.membershipPlanId = member_type[0].plan_id;
              this.paymentType = member_type[0].payment_type;
              this.requireApproval = member_type[0].require_approval;
              this.trialPeriod = member_type[0].trial_period;
              this.trialDays = member_type[0].trial_days;
              this.samePrice = member_type[0].same_price == 1 ? true : false;
              this.setNextPaymentDate();
              if (this.stripeForm.controls["amount"]) {
                this.stripeForm.controls["amount"].setValue(this.membershipFee);
              }
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  setNextPaymentDate() {
    let memberType =
      this.subscription?.id > 0 ? this.subscription : this.memberType;
    if (this.trialDays > 0 && this.planMode == "trial") {
      this.nextPayment = moment()
        .add(this.trialDays, "days")
        .format("DD/MM/YYYY");
    } else {
      if (memberType.payment_type == 3) {
        this.nextPayment = moment().add(1, "years").format("DD/MM/YYYY");
      } else if (memberType.payment_type == 4) {
        this.nextPayment = moment().add(3, "months").format("DD/MM/YYYY");
      } else if (memberType.payment_type == 5) {
        this.nextPayment = moment().add(6, "months").format("DD/MM/YYYY");
      } else {
        this.nextPayment = moment().add(1, "months").format("DD/MM/YYYY");
      }
    }
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

  checkConfirmEmail() {
    this._companyService
      .checkConfirmEmail({ companyId: this.companyId })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.confirm_email = response.active;
          if (this.confirm_email) {
            this.getConfirmEmailMessage();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getConfirmEmailMessage() {
    this._companyService
      .getOtherSettings(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.otherSettings = response["other_settings"];

          if (this.otherSettings) {
            this.otherSettings.forEach((m) => {
              if (m.title_es == "Registro / Servicios") {
                if (m.content) {
                  const showMessageSettings2 = m.content.filter((c) => {
                    return (
                      c.title_en.indexOf(
                        "Message after registration (needs confirmation)"
                      ) >= 0
                    );
                  });

                  this.confirmEmailMessage =
                    showMessageSettings2 && showMessageSettings2[0]
                      ? showMessageSettings2[0].value
                      : "";
                }
              }
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  setPrice(member_type) {
    let price = 0;
    if (this.customInvoice) {
      if (this.invoiceSpain) {
        price =
          this.planMode == "trial"
            ? member_type?.trial_price
            : member_type?.price;
      } else {
        price =
          this.planMode == "trial"
            ? member_type?.trial_base_price
            : member_type?.base_price;
      }
    } else {
      price =
        this.planMode == "trial"
          ? member_type?.trial_price
          : member_type?.price;
    }
    return price;
  }

  getPrice(display, mode = "") {
    if (this.subscription) {
      let price = this.subscription.price;
      if (this.customInvoice) {
        if (this.invoiceSpain) {
          price =
            this.planMode == "trial" && display != "next"
              ? display == "cart"
                ? this.subscription.trial_base_price
                : this.subscription.trial_price
              : display == "cart" || (display == "next" && mode != "total")
              ? this.subscription.base_price
              : this.subscription.price;
        } else {
          price =
            this.planMode == "trial" && display != "next"
              ? this.subscription.trial_base_price
              : this.subscription.base_price;
        }
      } else {
        price =
          this.planMode == "trial" && display != "next"
            ? this.subscription.trial_price
            : this.subscription.price;
      }

      return price && price > 0
        ? price?.replace(".", ",") +
            " €" +
            (this.subscription.payment_type == 2 && this.planMode != "trial"
              ? display == "cart" || display == "next" || mode == "total"
                ? ""
                : "/mes"
              : "")
        : this._translateService.instant("member-type.free");
    } else {
      if (this.memberType) {
        let price = this.memberType.price;
        if (this.customInvoice) {
          if (this.invoiceSpain) {
            price = this.planMode == "trial" && display != "next"
                ? display == "cart"
                  ? this.memberType.trial_base_price
                  : this.memberType.trial_price
                : display == "cart" || (display == "next" && mode != "total")
                ? this.memberType.base_price
                : this.memberType.price;
          } else {
            if(!this.samePrice) {
              price = this.planMode == "trial" && display != "next"
                ? this.memberType.trial_base_price
                : this.memberType.base_price;
            }
          }
        } else {
          price =
            this.planMode == "trial" && display != "next"
              ? this.memberType.trial_price
              : this.memberType.price;
        }

        return price && price > 0
          ? price?.replace(".", ",") +
              " €" +
              (this.memberType.payment_type == 2 && this.planMode != "trial"
                ? display == "cart" || display == "next" || mode == "total"
                  ? ""
                  : "/mes"
                : "")
          : this._translateService.instant("member-type.free");
      }
    }
  }

  getDiscountedPrice(display, mode = "") {
    if (this.memberType) {
      let price = this.memberType.price;
      if (this.customInvoice) {
        if (this.invoiceSpain) {
          price =
            this.planMode == "trial" && display != "next"
              ? display == "cart"
                ? this.memberType.trial_base_price
                : this.memberType.trial_price
              : display == "cart" || (display == "next" && mode != "total")
              ? this.memberType.base_price
              : this.memberType.price;
        } else {
          price =
            this.planMode == "trial" && display != "next"
              ? this.memberType.trial_base_price
              : this.memberType.base_price;
        }
      } else {
        price =
          this.planMode == "trial" && display != "next"
            ? this.memberType.trial_price
            : this.memberType.price;
      }

      if (this.validCouponInfo) {
        let discount;
        if (this.validCouponCode) {
          if (this.validCouponInfo.amount_off) {
            discount = parseFloat(
              (this.validCouponInfo.amount_off / 100).toString()
            ).toFixed(2);
          } else if (this.validCouponInfo.percent_off) {
            if (price > 0) {
              let price_discount =
                parseFloat(price) * (this.validCouponInfo.percent_off / 100);
              discount = parseFloat(price_discount.toString()).toFixed(2);
            }
          }
          if (discount > 0) {
            price = parseFloat(price) - parseFloat(discount);
            price = parseFloat(price).toFixed(2);
          }
        }
      }

      return price && price > 0
        ? price?.replace(".", ",") +
            " €" +
            (this.memberType.payment_type == 2 && this.planMode != "trial"
              ? display == "cart" || display == "next" || mode == "total"
                ? ""
                : "/mes"
              : "")
        : this._translateService.instant("member-type.free");
    }
  }

  getIVA(display: string = "") {
    if (this.subscription) {
      let iva;
      if (this.customInvoice) {
        if (this.invoiceSpain) {
          let price =
            this.planMode == "trial" && display != "next"
              ? parseFloat(this.subscription.trial_price)
              : parseFloat(this.subscription.price);
          let base_price =
            this.planMode == "trial" && display != "next"
              ? parseFloat(this.subscription.trial_base_price)
              : parseFloat(this.subscription.base_price);
          iva = parseFloat((price - base_price).toString()).toFixed(2);
        } else {
          iva = 0;
        }
      } else {
        iva = 0;
      }

      return iva ? iva.toString().replace(".", ",") + " €" : "-";
    } else {
      if (this.memberType) {
        let iva;
        if (this.customInvoice) {
          if (this.invoiceSpain) {
            let price =
              this.planMode == "trial" && display != "next"
                ? parseFloat(this.memberType.trial_price)
                : parseFloat(this.memberType.price);
            let base_price =
              this.planMode == "trial" && display != "next"
                ? parseFloat(this.memberType.trial_base_price)
                : parseFloat(this.memberType.base_price);
            iva = parseFloat((price - base_price).toString()).toFixed(2);
          } else {
            iva = 0;
          }
        } else {
          iva = 0;
        }

        return iva ? iva.toString().replace(".", ",") + " €" : "-";
      }
    }
  }

  getDiscountAmount(display, mode = "") {
    let discount = "";
    if (this.validCouponInfo) {
      if (this.validCouponInfo.amount_off) {
        discount = parseFloat(
          (this.validCouponInfo.amount_off / 100).toString()
        ).toFixed(2);
      } else if (this.validCouponInfo.percent_off) {
        let price = this.memberType.price;
        if (this.customInvoice) {
          if (this.invoiceSpain) {
            price =
              this.planMode == "trial" && display != "next"
                ? display == "cart"
                  ? this.memberType.trial_base_price
                  : this.memberType.trial_price
                : display == "cart" || (display == "next" && mode != "total")
                ? this.memberType.base_price
                : this.memberType.price;
          } else {
            price =
              this.planMode == "trial" && display != "next"
                ? this.memberType.trial_base_price
                : this.memberType.base_price;
          }
        } else {
          price =
            this.planMode == "trial" && display != "next"
              ? this.memberType.trial_price
              : this.memberType.price;
        }
        if (price > 0) {
          let price_discount =
            parseFloat(price) * (this.validCouponInfo.percent_off / 100);
          discount = parseFloat(price_discount.toString()).toFixed(2);
        }
      }
    }

    return discount;
  }

  getRecurringFrequency() {
    let recurring = this._translateService.instant("signup.monthlypayment");
    if (this.subscription) {
      if (this.subscription.payment_type == 1) {
        recurring = this._translateService.instant("signup.onetime");
      }
      if (this.subscription.payment_type == 3) {
        recurring = this._translateService.instant("signup.yearlypayment");
      }
      if (this.subscription.payment_type == 4) {
        recurring = this._translateService.instant("signup.quarterlypayment");
      }
      if (this.subscription.payment_type == 5) {
        recurring = this._translateService.instant("signup.semiannualpayment");
      }
    } else {
      if (this.memberType) {
        if (this.memberType.payment_type == 1) {
          recurring = this._translateService.instant("signup.onetime");
        }
        if (this.memberType.payment_type == 3) {
          recurring = this._translateService.instant("signup.yearlypayment");
        }
        if (this.memberType.payment_type == 4) {
          recurring = this._translateService.instant("signup.quarterlypayment");
        }
        if (this.memberType.payment_type == 5) {
          recurring = this._translateService.instant(
            "signup.semiannualpayment"
          );
        }
      }
    }

    if (this.planMode == "trial") {
      if (this.subscription) {
        recurring += ` (${this._translateService.instant(
          "signup.foratrialperiodof"
        )} ${this.subscription.trial_days} ${this._translateService.instant(
          "plan-create.days"
        )} ${this.nextPayment})`;
      } else {
        recurring += ` (${this._translateService.instant(
          "signup.foratrialperiodof"
        )} ${this.memberType.trial_days} ${this._translateService.instant(
          "plan-create.days"
        )} ${this.nextPayment})`;
      }
    } else {
      recurring += ` (${this.nextPayment})`;
    }

    return recurring;
  }

  cardUpdated(result) {
    console.log(result);
  }

  keyUpdated() {
    console.log("keyUpdated");
  }

  getPopupMessage() {
    let message = this._translateService.instant("signup.paymentconfirmed");

    if (this.showConfirmEmail) {
      message = this.confirmEmailMessage;
    }
    if (this.showContinue) {
      let acknowledgement_page_url =
        this.subscription?.id > 0
          ? this.subscription.acknowledgement_page_url
          : this.memberType.acknowledgement_page_url;
      if (acknowledgement_page_url) {
        message = this._translateService.instant(
          "signup.redirectacknowledgmentpage"
        );
      } else {
        message = this._translateService.instant("signup.continuelogin");
      }
    }

    return message;
  }

  getPopupButtonText() {
    let text = this._translateService.instant("buddy.accept");
    if (this.showConfirmEmail) {
      text = this._translateService.instant("create-content.continue");
    }

    return text;
  }

  async pay() {
    // this.showAccept = true;
    // this.showModal();

    this.showAccept = false;
    this.showConfirmEmail = false;
    this.showContinue = false;

    this.hasError = false;
    this.submitted = true;
    this.invalidCouponMessage = "";
    this.validCouponCode = "";
    this.validCoupon = false;
    this.isInvalidForm = false;
    this.missingAddress = false;
    this.missingCIF = false;
    this.missingCompanyName = false;
    this.missingCountry = false;
    this.missingProvince = false;
    this.missingCity = false;
    this.missingZipcode = false;
    this.missingPassword = false;
    this.missingConfirmPassword = false;
    this.passwordMismatch = false;

    if (this.isValidForm()) {
      if (this.membershipFee > 0) {
        let coupon;
        if (this.stripeForm.controls["coupon"]) {
          coupon = this.stripeForm.get("coupon")?.value;
        }

        if (coupon) {
          this.validateProductCoupon(
            coupon,
            this.companyId,
            this.membershipPlanId,
            null,
            false,
          );
        } else {
          this.continuePaymentProcess(null);
        }
      }
    } else {
      this.scrollToTop();
      this.submitted = false;
      this.isInvalidForm = true;
      this.open(this._translateService.instant("wall.requiredfields"), "");
    }
  }

  validateProductCoupon(coupon, companyId, membershipPlanId, content, manual_apply: boolean = false) {
    this._paymentService
      .validateProductCoupon(coupon, companyId, membershipPlanId)
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
          }
          if(manual_apply) {
          } else {
            this.continuePaymentProcess(content);
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  continuePaymentProcess(content) {
    if (
      this.id == 0 &&
      this.stripeForm.controls["password"] &&
      this.stripeForm.controls["confirm_password"] &&
      this.stripeForm.controls["password"].value !=
        this.stripeForm.controls["confirm_password"].value
    ) {
      this.passwordMismatch = true;
      this.scrollToTop();
      this.submitted = false;
      return false;
    }

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

  continue() {
    if (this.confirm_email) {
      if (this.showConfirmEmail) {
        this.showContinue = true;
        this.redirectUserToLogin();
      } else {
        this.showConfirmEmail = true;
        setTimeout(() => {
          this.showModal();
        }, 500);
      }
    } else {
      this.showContinue = true;
      this.redirectUserToLogin();
    }
  }

  redirectUserToLogin() {
    setTimeout(() => {
      this.continueProcess();
    }, 1000);
  }

  processPayment(content = null) {
    const name = this.user.email;
    if (this.card?.element) {
      this._stripeService
        .createToken(this.card?.element, { name })
        .subscribe((result) => {
          if (result.token) {
            this.stripeData["token"] = result.token;
            if (this.planFrequency) {
              this.stripeData["plan"] = this.planFrequency;
            }
            if (this.subscription?.id > 0) {
              this.stripeData["subscription_id"] = this.subscription?.id || 0;
            }
            this.stripeData['invoice_to_company'] = this.useCompanyInvoice == true ? 1 : 0,
            this.stripeData["same_price"] = this.samePrice == true ? 1 : 0;

            if (this.id == 0) {
              this.signupUser(content);
            } else {
              this.proceedSignup(this.id, content);
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

  signupUser(content) {
    // Sign up first to use existing methods for member type payment
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
      custom_member_type_id: this.type,
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
            if (rspns.user.custom_member_type_id != this.type) {
              this.hasExistingMemberType = true;
              this.existingMemberTypeId = rspns.user.custom_member_type_id;
              this.existingSubscriptionId = rspns.user.subscription_id;
              this.existingCreated = rspns.user.created;
              if (this.isUserExists) {
                this.stripeData["existing_custom_member_type_id"] =
                  rspns.user.custom_member_type_id;
              }
            }
            this.proceedSignup(rspns.user.id, content);
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

  proceedSignup(id, content) {
    if (this.planMode == "trial") {
      let plan_id = this.memberType.plan_id;
      let reg_plan_id = this.memberType.plan_id;
      if (this.customInvoice) {
        if (this.invoiceSpain) {
          plan_id = this.memberType.trial_plan_id;
          reg_plan_id = this.memberType.plan_id;
        } else {
          plan_id = this.memberType.trial_base_plan_id;
          reg_plan_id = this.memberType.novat_plan_id;
        }
      }
      this._paymentService
        .subscribeTrialPeriod(
          id,
          this.type,
          plan_id,
          reg_plan_id,
          this.stripeData
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res) => {
            this.showAccept = true;
            this.showModal();
          },
          (error) => {
            this.showError();
          }
        );
    } else {
      this._paymentService
        .updateCustomMemberTypeSubscription(id, this.type, this.stripeData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res) => {
            if (res && res.actionRequired) {
              this._stripeService
                .handleCardPayment(res.clientSecret)
                .subscribe((result) => {
                  if (result.error) {
                    console.error("got stripe error", result.error);
                    this.submitted = false;
                    this.hasError = true;
                    this.updateGuidIdempotency(res);
                  } else {
                    console.log("payment succeeded");
                    this.updateCustomerSubscription(res, content);
                  }
                });
            } else {
              this.showAccept = true;
              this.showModal();
            }
          },
          (error) => {
            this.showError();
          }
        );
    }
  }

  showModal() {
    this.popupMessage = this.getPopupMessage();
    this.popupButtonText = this.getPopupButtonText();
    this.modalbutton?.nativeElement.click();
  }

  updateGuidIdempotency(response) {
    let params = {
      user_id: response.userId,
    };

    this._paymentService
      .updateGuidIdempotency(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.open(
            this._translateService.instant("dialog.verificationfailed"),
            ""
          );
        },
        (error) => {
          this.showError();
        }
      );
  }

  updateCustomerSubscription(response, content = null) {
    let params = {
      customer_id: response.customerId,
      subscription_id: response.subscriptionId,
      existing_user_status: response.existingUserStatus,
      require_approval: response.requireApproval,
      confirm_email: response.confirmEmail,
      type_id: response.typeId,
      type_es: response.typeEs,
      user_id: response.userId,
    };

    this._paymentService
      .updateCustomerSubscription(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.showAccept = true;
          this.showModal();
        },
        (error) => {
          this.showError();
        }
      );
  }

  continueProcess() {
    this.automaticLogin();
    this.submitted = false;
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

          if (
            this.id == 0 &&
            key == "password" &&
            !this.stripeForm.get(key)?.value
          ) {
            this.missingPassword = true;
            valid = false;
          }
          if (
            this.id == 0 &&
            key == "confirm_password" &&
            !this.stripeForm.get(key)?.value
          ) {
            this.missingConfirmPassword = true;
            valid = false;
          }

          if (this.useCompanyInvoice) {
            if (key == "company_name" && !this.stripeForm.get(key)?.value) {
              this.missingCompanyName = true;
              valid = false;
            }
            if (key == "cif" && !this.stripeForm.get(key)?.value) {
              this.missingCIF = true;
              valid = false;
            }
            if (key == "direccion" && !this.stripeForm.get(key)?.value) {
              this.missingAddress = true;
              valid = false;
            }
            if (key == "company_zip_code" && !this.stripeForm.get(key)?.value) {
              this.missingZipcode = true;
              valid = false;
            }
            if (key == "company_city" && !this.stripeForm.get(key)?.value) {
              this.missingCity = true;
              valid = false;
            }
            if (key == "company_province" && !this.stripeForm.get(key)?.value) {
              this.missingProvince = true;
              valid = false;
            }
            if (key == "company_country" && !this.stripeForm.get(key)?.value) {
              this.missingCountry = true;
              valid = false;
            }
          }
        }
      }
    });

    return valid;
  }

  async automaticLogin() {
    this._coursesService
      .getCourseCategoryMapping(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (rsp) => {
          this.courseCategoryMapping = rsp.CompanyCourseCategoryMapping;
          if (
            this.courseCategoryMapping &&
            this.courseCategoryMapping.length > 0
          ) {
            let params = {
              company_id: this.companyId,
              user_id: this.id == 0 ? this.newUserId : this.id,
              custom_member_type_id: this.type,
              existing_member_type_id: this.hasExistingMemberType
                ? this.existingMemberTypeId
                : 0,
              subscription_id: this.hasExistingMemberType
                ? this.existingSubscriptionId
                : 0,
              created: this.hasExistingMemberType ? this.existingCreated : 0,
            };
            this._paymentService
              .assignCoursesFromCart(params)
              .pipe(takeUntil(this.destroy$))
              .subscribe(
                (response) => {
                  this.confirmAndRedirect();
                },
                (error1) => {
                  console.log(error1);
                }
              );
          } else {
            this.confirmAndRedirect();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async confirmAndRedirect() {
    if (!this.isUserExists && this.confirm_email) {
      await this._authService
        .sendConfirmationEmail({
          companyId: this.companyId,
          userId: this.id == 0 ? this.newUserId : this.id,
        })
        .toPromise();
    }

    let acknowledgement_page_url =
      this.subscription?.id > 0
        ? this.subscription.acknowledgement_page_url
        : this.memberType.acknowledgement_page_url;
    if (acknowledgement_page_url) {
      location.href = acknowledgement_page_url;
    } else {
      let url = "";
      if (this.requireApproval == 1 && !this.isUserExists) {
        url = `/auth/login?type=%{this.type}`;
      } else {
        url = "/auth/login";
      }

      this._router.navigate([url]).then(() => {
        window.location.reload();
      });
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  handleInvoiceSettingsChange(event) {
    if (event.target.checked) {
      this.useCompanyInvoice = true;
    } else {
      this.useCompanyInvoice = false;
    }
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
        this.membershipPlanId,
        null,
        true,
      );
    }
  }

  handleChangeCountry(event) {
    if (event.target.value) {
      if (event.target.value == "Spain") {
        this.invoiceSpain = true;
      } else {
        this.invoiceSpain = false;
      }
    }
  }

  getSubscription(id) {
    this._companyService
      .getMemberPlanSubscription(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.subscription = response.subscription;
          if (this.subscription?.id > 0) {
            this.setNextPaymentDate();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldConfirmTextType() {
    this.fieldConfirmTextType = !this.fieldConfirmTextType;
  }
}
