import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { environment } from "@env/environment";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AuthService } from "src/app/core/services";
import { LocalService, CompanyService } from "src/app/share/services";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { CompanyLogoComponent } from "@share/components";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Subject, takeUntil } from "rxjs";
import Validation from "@lib/utils/validation/validation.utils";
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
  templateUrl: "./change-password.component.html",
})
export class ChangePasswordComponent {
  private destroy$ = new Subject<void>();

  changePasswordForm: FormGroup = new FormGroup({
    password: new FormControl(""),
    confirmPassword: new FormControl(""),
  });
  guid: any;
  language: any;
  logoSource: any;
  companies: any;
  companyId: any;
  domain: any;
  initialPage: any;
  primaryColor: any;
  buttonColor: any;
  fieldTextType: boolean = false;
  fieldConfirmTextType: boolean = false;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  checkCircleIcon = faCheckCircle;
  timesCircleIcon = faTimesCircle;
  submitted: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
    this.changePasswordForm = this.formBuilder.group(
      {
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(40),
            Validation.patternValidator(new RegExp("(?=.*[0-9])"), {
              requiresDigit: true,
            }),
            Validation.patternValidator(new RegExp("(?=.*[A-Z])"), {
              requiresUppercase: true,
            }),
            Validation.patternValidator(new RegExp("(?=.*[a-z])"), {
              requiresLowercase: true,
            }),
            Validation.patternValidator(new RegExp("(?=.*[$@^!%*?&])"), {
              requiresSpecialChars: true,
            }),
          ],
        ],
        confirmPassword: ["", Validators.required],
      },
      {
        validators: [Validation.match("password", "confirmPassword")],
      }
    );
    this._route.paramMap.subscribe((params) => {
      this.guid = params.get("guid");
    });

    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    this.companies = get(
      await this._companyService.getCompanies().toPromise(),
      "companies"
    );

    if (this.companies) {
      let company = this._companyService.getCompany(this.companies);
      if (company && company[0]) {
        this.companyId = company[0].id;
        this.primaryColor = company[0].primary_color
          ? company[0].primary_color
          : company[0].button_color;
        this.buttonColor = company[0].button_color
          ? company[0].button_color
          : company[0].primary_color;
        this.logoSource = `${COMPANY_IMAGE_URL}/${
          company[0].photo || company[0].image
        }`;
        this._localService.setLocalStorage(
          environment.lscompanyId,
          company[0].id
        );
        this._localService.setLocalStorage(
          environment.lsdomain,
          company[0].domain
        );
      }
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.changePasswordForm.controls;
  }

  get passwordValid() {
    return this.changePasswordForm.controls["password"].errors === null;
  }

  get requiredValid() {
    return !this.changePasswordForm.controls["password"].hasError("required");
  }

  get minLengthValid() {
    return !this.changePasswordForm.controls["password"].hasError("minlength");
  }

  get requiresDigitValid() {
    return !this.changePasswordForm.controls["password"].hasError(
      "requiresDigit"
    );
  }

  get requiresUppercaseValid() {
    return !this.changePasswordForm.controls["password"].hasError(
      "requiresUppercase"
    );
  }

  get requiresLowercaseValid() {
    return !this.changePasswordForm.controls["password"].hasError(
      "requiresLowercase"
    );
  }

  get requiresSpecialCharsValid() {
    return !this.changePasswordForm.controls["password"].hasError(
      "requiresSpecialChars"
    );
  }

  changePassword(): void {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      return;
    }

    const password = this.changePasswordForm.value.password;
    const confirmPassword = this.changePasswordForm.value.confirmPassword;

    if (
      this.guid &&
      password &&
      confirmPassword &&
      password == confirmPassword
    ) {
      this._authService
        .changePasswordVistingo(password, this.guid)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data: any) => {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            setTimeout(() => {
              this._router.navigate(["/auth/login"]);
            }, 2000);
          },
          (error) => {
            this.open(this._translateService.instant("dialog.error"), "");
          }
        );
    } else {
      if (password != confirmPassword) {
        this.open(
          this._translateService.instant("changepassword.passwordnotmatch"),
          ""
        );
      } else {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  login() {
    this._router.navigate(["/auth/login"]);
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldConfirmTextType() {
    this.fieldConfirmTextType = !this.fieldConfirmTextType;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
