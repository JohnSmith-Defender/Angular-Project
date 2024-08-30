import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { environment } from "@env/environment";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AuthService } from "src/app/core/services";
import { LocalService, CompanyService, UserService } from "src/app/share/services";
import { CompanyLogoComponent } from "@share/components";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Subject, takeUntil } from "rxjs";
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    FontAwesomeModule,
    RouterModule,
    CompanyLogoComponent,
  ],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  private destroy$ = new Subject<void>();

  @Input() returnUrl!: string;

  email: any;
  guid: any;
  loginForm!: FormGroup;
  emailDomain;
  entities: any;
  language: any = "es";
  logoSource: any;
  showContactPopup: boolean = true;
  companies: any;
  dashboardDetails: any;
  userId: any;
  showLogin: boolean = false;
  hasLandingTemplate: boolean = false;
  hasGuestAccess: boolean = false;
  companyId: any;
  domain: any;
  otherSettings: any;
  hasInvitations: boolean = false;
  initialPage: any;
  canRegister: boolean = false;
  hasCustomMemberTypeSettings: boolean = false;
  hasCustomMemberTypeExpiration: boolean = false;
  buttonColor: any;
  showLoginMessage: boolean = false;
  loginMessage: any;
  confirm_email: any = 0;
  confirmEmailMessage: any = "";
  forApprovalMessage: any = "";
  features: any;
  showSSOLogin: boolean = false;
  primaryColor: any;
  loginAsAdmin: boolean = false;
  homeActive: boolean = false;
  startPage: any;
  fieldTextType: boolean = false;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  isLoading: boolean = false;
  menuColor: any;
  alreadyLoggedIn: boolean = false;
  ueLoginMode: string = '';
  isUESchoolOfLife: boolean = false;
  formSubmitted: boolean = false;
  isCursoGeniusTestimonials: boolean = false;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _userService: UserService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
    });
  }

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._localService.removeLocalStorage(environment.lsmenus);

    this.companies = get(
      await this._companyService.getCompanies().toPromise(),
      "companies"
    );
    console.log("companies", this.companies);
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
      this.companyId = company[0].id;
      this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(company[0]);
      this.domain = company[0].domain;
      this.initialPage = company[0].start_page;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.primaryColor = company[0].primary_color
        ? company[0].primary_color
        : company[0].button_color;
      this.menuColor = company[0].menu_color
        ? company[0].menu_color
        : "#ffffff";
      this._localService.setLocalStorage(
        environment.lscompanyId,
        company[0].id
      );
      this._localService.setLocalStorage(
        environment.lsdomain,
        company[0].domain
      );
      this.showSSOLogin = company[0].sso_login == 1 ? true : false;
      this.logoSource =
        environment.api +
        "/get-image-company/" +
        (company[0].photo || company[0].image);
      this.homeActive = company[0].show_home_menu == 1 ? true : false;
      this.startPage = company[0].start_page;
      if(this.companyId == 65 && this.language == 'es') {
        this.language = 'it';
      }
      this.isCursoGeniusTestimonials = this._companyService.isCursoGeniusTestimonials(company[0]);
    }

    this._translateService.use(this.language || "es");
    this.getOtherSettings();
  }

  getOtherSettings() {
    this._companyService
      .getOtherSettings(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.otherSettings = response["other_settings"];

          if (this.otherSettings) {
            this.otherSettings.forEach((m) => {
              if (m.title_es == "General") {
                if (m.content) {
                  let canRegisterSettings = m.content.filter((c) => {
                    return c.title_en.indexOf("Allow member registration") >= 0;
                  });
                  if (canRegisterSettings && canRegisterSettings[0]) {
                    this.canRegister =
                      canRegisterSettings[0].active == 1 ? true : false;
                  }
                }
              }

              if (m.title_es == "Registro / Servicios") {
                if (m.content) {
                  const showMessageSettings2 = m.content.filter((c) => {
                    return (
                      c.title_en.indexOf(
                        "Message after registration (needs confirmation)"
                      ) >= 0
                    );
                  });
                  const showMessageSettings1 = m.content.filter((c) => {
                    return (
                      c.title_en.indexOf(
                        "Message after registration (needs approval)"
                      ) >= 0
                    );
                  });

                  this.forApprovalMessage =
                    showMessageSettings1 && showMessageSettings1[0]
                      ? showMessageSettings1[0].value
                      : "";
                  this.confirmEmailMessage =
                    showMessageSettings2 && showMessageSettings2[0]
                      ? showMessageSettings2[0].value
                      : "";

                  this.checkConfirmEmail(
                    showMessageSettings1,
                    showMessageSettings2
                  );
                }
              }

              if (m.title_es == "Módulos") {
                if (m.content) {
                  let invitationsSettings = m.content.filter((c) => {
                    return c.title_en.indexOf("Invitations") >= 0;
                  });
                  if (invitationsSettings && invitationsSettings[0]) {
                    this.hasInvitations =
                      invitationsSettings[0].active == 1 ? true : false;
                  }
                }
              }

              if (m.title_es == "Stripe") {
                let customMemberTypeSettings = m.content.filter((c) => {
                  return (
                    c.title_en.indexOf(
                      "Require Stripe payment on specific member types"
                    ) >= 0
                  );
                });
                if (customMemberTypeSettings && customMemberTypeSettings[0]) {
                  this.hasCustomMemberTypeSettings =
                    customMemberTypeSettings[0].active == 1 ? true : false;
                }

                let customMemberTypeExpirationSettings = m.content.filter(
                  (c) => {
                    return (
                      c.title_en.indexOf("Custom member type expiration") >= 0
                    );
                  }
                );
                if (
                  customMemberTypeExpirationSettings &&
                  customMemberTypeExpirationSettings[0]
                ) {
                  this.hasCustomMemberTypeExpiration =
                    customMemberTypeExpirationSettings[0].active == 1
                      ? true
                      : false;
                }
              }
            });
          }

          this.isLoading = true;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onInputChange(){
    const inputValue = this.loginForm?.controls["email"].value;
    this.loginForm.controls["email"].setValue(inputValue.trim())
  }

  checkConfirmEmail(showMessageSettings1, showMessageSettings2) {
    this._companyService
      .checkConfirmEmail({ companyId: this.companyId })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.confirm_email = response.active;
          if (this.confirm_email && showMessageSettings2?.length > 0) {
            let login_message_settings = showMessageSettings2[0] ? true : false;
            if (login_message_settings) {
              this.loginMessage = showMessageSettings2[0].value;

              let type = this.getParam("type");
              if (type && parseInt(type.toString()) > 0) {
                this.showLoginMessage = true;
              }
            }
          } else if (showMessageSettings1?.length > 0) {
            let login_message_settings = showMessageSettings1[0] ? true : false;
            if (login_message_settings) {
              this.loginMessage = showMessageSettings1[0].value;

              let type = this.getParam("type");
              if (type && parseInt(type.toString()) > 0) {
                this.showLoginMessage = true;
              }
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getParam(name) {
    const results = new RegExp("[\\?&]" + name + "=([^&#]*)").exec(
      window.location.href
    );
    if (!results) {
      return 0;
    }
    return results[1] || 0;
  }

  async login() {
    this.formSubmitted = true;
    this._localService.removeLocalStorage(environment.lsmenus);
    this._localService.removeLocalStorage(environment.lsusercoursecredits);
    this._userService.updateUserCourseCredits([]);

    const email = this.loginForm?.controls["email"].value;
    const password = this.loginForm?.controls["password"].value;

    if(this.companyId == 32 && this.ueLoginMode == 'Estudiante' || this.ueLoginMode == 'Empleado') {
      this.testLoginUEStudentEmployee(email, password);
    } else {
      if (email && password) {
        // Check if custom member type has expiration
        if (
          this.hasCustomMemberTypeSettings &&
          this.hasCustomMemberTypeExpiration
        ) {
          this._authService
            .checkLoginMember(this.companyId, email)
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (data: any) => {
              let expired_member = data[0] ? data[0]["expired_member"] : [];
              let user_member_types = data[1] ? data[1]["user_member_types"] : [];
              let expired_others = data[2] ? data[2]["expired"] : [];

              if (expired_member && expired_member.id) {
                // Check if there are other user memberships
                if (user_member_types && user_member_types.length > 0) {
                  if (expired_others) {
                    this.open(
                      this._translateService.instant("dialog.unabletorenew"),
                      ""
                    );
                    setTimeout(() => {
                      location.href = `/payment/checkout/${expired_member.id}/${expired_member.type_id}`;
                    }, 2000);
                    return false;
                  }
                } else {
                  this.open(
                    this._translateService.instant("dialog.unabletorenew"),
                    ""
                  );
                  setTimeout(() => {
                    location.href = `/payment/checkout/${expired_member.id}/${expired_member.type_id}`;
                  }, 2000);
                  return false;
                }
              }

              this.validateLogin(email, password);
            });
        } else {
          this.validateLogin(email, password);
        }
      } else {
        this.open(
          this._translateService.instant("login.emailpasswordrequired"),
          ""
        );
      }
    }
  }

  async validateLogin(email, password) {
    if(this.companyId > 0) {
    } else {
      this.companyId = this._companyService.getCompanyByHost();
    }
    
    await this._authService
      .login(email, password, this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          if (data) {
            if(data?.redirect_conditions) {
              this._router.navigate([`/general/contract/${data?.fk_company_id}/${data?.custom_member_type_id}`]);
            } else {
              this._router.navigate([this.returnUrl ?? `/`]);
            }
          }
        },
        (error) => {
          if (error.error) {
            this.loginMessage =
              error.error.code == "for_approval"
                ? this.forApprovalMessage
                : error.error.code == "for_email_confirmation"
                ? this.confirmEmailMessage
                : "";
            this.showLoginMessage =
              error.error.code == "for_approval" ||
              error.error.code == "for_email_confirmation"
                ? true
                : false;
          }

          if (error.error && error.error.code == "cancelled") {
            this.open(
              this._translateService.instant("dialog.membershipcancelled"),
              ""
            );
            setTimeout(() => {
              location.href = `/payment/checkout/${error.error.id}/${error.error.type_id}`;
            }, 2000);
          } else if (error.error && error.error.code == "failed_payment") {
            this.open(
              this._translateService.instant("dialog.unabletorenew"),
              ""
            );
            setTimeout(() => {
              location.href = `/payment/checkout/${error.error.id}/${error.error.type_id}`;
            }, 2000);
          } else {
            this.open(
              this._translateService.instant("dialog.invalidcredentials"),
              ""
            );
          }
        }
      );
  }

  async testLoginUEStudentEmployee(email, password) {
    await this._authService
      .ueTestLogin(email, password, this.ueLoginMode)
      .subscribe(
        (data: any) => {
          if (data?.guid) {
            this._router.navigate([`/sso/${data?.guid}`]);
          }
        },
        (error) => {
          this.open(
            this._translateService.instant("dialog.invalidcredentials"),
            ""
          );
        }
      );
  }

  redirectToLandingPage() {
    const input = this.loginForm?.value.email;
    this._router.navigate(["/auth/login", input]);
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  redirecToSignup() {
    this._router.navigate(["/auth/signup"]);
  }

  loginUEStudent() {
    // this.ueLoginMode == '';
    // this.ueLoginMode = 'Estudiante';
    location.href = this.isUESchoolOfLife ? `https://sso.vistingo.com/api/login/oauth-sol-student` : `https://sso.vistingo.com/api/login/student`;
  }

  loginUEEmployee() {
    // this.ueLoginMode == '';
    // this.ueLoginMode = 'Empleado';
    location.href = this.isUESchoolOfLife ? `https://sso.vistingo.com/api/login/oauth-sol-employee` : `https://sso.vistingo.com/api/login/employee`;
  }

  toggleAdminLogin(event): void {
    const checked = event.target.checked;
    this.loginAsAdmin = checked ? true : false;
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
