import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { environment } from "@env/environment";
import { AuthService } from "src/app/core/services";
import {
  LocalService,
  CompanyService,
  UserService,
} from "src/app/share/services";
import { CompanyLogoComponent } from "@share/components";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { Subject, takeUntil } from "rxjs";
import { SafeContentHtmlPipe } from "@lib/pipes";
import get from "lodash/get";

@Component({
  selector: "app-select-plan",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    RouterModule,
    CompanyLogoComponent,
    SafeContentHtmlPipe,
  ],
  templateUrl: "./select-plan.component.html",
})
export class SelectPlanComponent {
  private destroy$ = new Subject<void>();

  id: any;
  companyId: any;
  language: any;
  memberTypes: any;
  companies: any;
  companyName: any;
  primaryColor: any;
  buttonColor: any;
  dashboardDetails: any;
  logoSource: string = "";
  isLoading: boolean = true;
  planTypeChoice: any = "monthly";
  confirm_email: any = 0;
  otherSettings: any;
  canShowLinkAccess: boolean = false;
  subfooter: any;
  linkAccessText: any;
  guestHome: boolean = false;
  signupMemberSelection: boolean = false;
  user: any;
  customInvoice: boolean = false;
  invoiceSpain: boolean = false;
  pricingDetails: any = [];
  mode: string = "";

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang);

    this._route.params.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      this.id = param["id"];
    });

    this.companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";
    this._localService.removeLocalStorage(environment.lsselectedMemberType);
    if (!this.companies) {
      this.companies = get(
        await this._companyService.getCompanies().toPromise(),
        "companies"
      );
    }

    if (this.companies) {
      let company = this._companyService.getCompany(this.companies);
      if (company && company[0]) {
        this.companyId = company[0].id;
        this.primaryColor = company[0].primary_color;
        this.buttonColor = company[0].button_color
          ? company[0].button_color
          : company[0].primary_color;
        this.logoSource = `${COMPANY_IMAGE_URL}/${company[0].image}`;
        this.customInvoice = company[0].custom_invoice == 1 ? true : false;
        this._localService.setLocalStorage(
          environment.lscompanyId,
          this.companyId
        );
        if(this.companyId == 65 && this.language == 'es') {
          this.language = 'it';
        }
      }
    }

    this._translateService.use(this.language || "es");
    this.getUserDetails();
    this.checkConfirmEmail();
    this.getPricingDetails();
  }

  getUserDetails() {
    this._userService
      .getUserById({ companyId: this.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.user = response.CompanyUser;
          if (this.user) {
            if (
              this.user.company_name &&
              this.user.company_country == "Spain"
            ) {
              this.invoiceSpain = true;
            }
            if (!this.user.company_name && this.user.country == "Spain") {
              this.invoiceSpain = true;
            }
          }
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
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getPricingDetails() {
    this._companyService
      .getPricingDetails(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          this.pricingDetails = response.pricing_details;
          if (this.pricingDetails > 0) {
          } else {
            this.getCustomMemberTypePermissionsList();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  hasPricingDetails(id) {
    return (
      this.pricingDetails &&
      this.pricingDetails.filter((p) => {
        return p.custom_member_type_id == id;
      })
    );
  }

  getPrice(type, mode: string = "") {
    let price = type.price;

    if (type.tax_include == 1) {
      price = mode == "trial" ? type.trial_base_price : type.base_price;
    } else if (type.tax_include == 2) {
      price = mode == "trial" ? type.trial_price : type.price;
    } else {
      if (this.customInvoice) {
        if (this.invoiceSpain) {
          price = mode == "trial" ? type.trial_price : type.price;
        } else {
          price = mode == "trial" ? type.trial_base_price : type.base_price;
        }
      } else {
        price = mode == "trial" ? type.trial_price : type.price;
      }
    }
    return price && price > 0
      ? price?.replace(".", ",")
      : this._translateService.instant("member-type.free");
  }

  getTrialText(type) {
    return `${this._translateService.instant("member-type.try")} ${
      type.trial_days
    } ${this._translateService.instant(
      "plan-create.days"
    )} ${this._translateService.instant("member-type.for")} ${this.getPrice(
      type,
      "trial"
    )}`;
  }

  getCustomMemberTypePermissionsList() {
    this._companyService
      .getCustomMemberTypePermissionsList(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.memberTypes = response.member_types;
          if (this.memberTypes) {
            this.memberTypes = this.memberTypes.filter((mt) => {
              return mt.show_register == 1;
            });
            this.memberTypes = this.memberTypes.map((type) => {
              return {
                original_price: type.price,
                ...type,
              };
            });
          }
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async selectPlan(type, mode: string = "") {
    this._localService.setLocalStorage(
      environment.lsselectedMemberType,
      type ? type.id : ""
    );
    let params = {
      id: this.id,
      company_id: this.companyId,
      custom_member_type_id: type.id,
      expire_days: type.expire_days,
    };

    this._userService
      .updateUserCustomMemberType(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          let append = mode == "trial" ? `?mode=${mode}` : "";
          let redirect_url = `/payment/checkout/${this.id}/${type.id}${append}`;
          if (type.require_payment == 1 && type.price > 0) {
            this._localService.setLocalStorage(
              environment.lsplanFrequency,
              this.planTypeChoice == "yearly" ? this.planTypeChoice : ""
            );
            if (type.price == 0) {
              if (this.confirm_email) {
                await this._authService
                  .sendConfirmationEmail({
                    companyId: this.companyId,
                    userId: this.id,
                  })
                  .toPromise();
              }
              this.beforeExitCheck(redirect_url);
            } else {
              window.location.href = redirect_url;
            }
          } else {
            if (this.confirm_email) {
              await this._authService
                .sendConfirmationEmail({
                  companyId: this.companyId,
                  userId: this.id,
                })
                .toPromise();
            } else {
              await this._authService
                .sendWelcomeEmail({
                  companyId: this.companyId,
                  userId: this.id,
                })
                .toPromise();
            }
            this.redirectToLogin(type);
          }
        },
        (error) => {
          console.log(error);
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
  }

  redirectToLogin(type) {
    if (type.require_approval == 1) {
      // this._router.navigate([`/auth/login?type=${type.id}`]);
      this._router.navigate([`/auth/login`]);
    } else {
      if (this.confirm_email) {
        // this._router.navigate([`/auth/login?type=${type.id}`]);
        this._router.navigate([`/auth/login`]);
      } else {
        this._router.navigate([`/auth/login`]);
      }
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  choosePlanType(event) {
    this.planTypeChoice = event;
    if (this.memberTypes) {
      this.memberTypes.forEach((type) => {
        type.price =
          this.planTypeChoice == "yearly"
            ? type.annual_price
            : type.original_price;
      });
    }
  }

  ngOnDestroy() {
    this.beforeExitCheck("");
    this.destroy$.next();
    this.destroy$.complete();
  }

  async beforeExitCheck(redirect_url = "") {
    const selectedMemberType = this._localService.getLocalStorage(
      environment.lsselectedMemberType
    );
    let sendEmail = false;
    if (selectedMemberType && parseInt(selectedMemberType) > 0) {
      if (this.memberTypes) {
        let selected_plan_row = this.memberTypes.filter((mt) => {
          return mt.id == selectedMemberType;
        });

        if (selected_plan_row && selected_plan_row[0].require_payment != 1) {
          sendEmail = true;
        }
      }
    } else {
      sendEmail = true;
    }
    if (sendEmail) {
      await this.sendSelectPlanEmail(redirect_url);
    }
  }

  async sendSelectPlanEmail(redirect_url) {
    await this._authService
      .selectPlanEmail(this.id, this.companyId)
      .toPromise();

    this._localService.removeLocalStorage(environment.lsselectedMemberType);
    if (redirect_url) {
      this._router.navigate([redirect_url]);
    }
  }

  getPricingDetailText(detail) {
    return this.language == "en"
      ? detail.details_en
      : this.language == "fr"
      ? detail.details_fr || detail.details
      : this.language == "eu"
      ? detail.details_eu || detail.details
      : this.language == "ca"
      ? detail.details_ca || detail.details
      : this.language == "de"
      ? detail.details_de || detail.details
      : detail.details;
  }

  getPermissionText(permission) {
    return this.language == "en"
        ? permission.permission_en ||
          permission.permission_es
        : this.language == "fr"
        ? permission.permission_fr ||
          permission.permission_es
        : this.language == "eu"
        ? permission.permission_eu ||
          permission.permission_es
        : this.language == "ca"
        ? permission.permission_ca ||
          permission.permission_es
        : this.language == "de"
        ? permission.permission_de ||
          permission.permission_es
        : this.language == "it"
        ? permission.permission_it ||
          permission.permission_es : permission.permission_es;
  }
}
