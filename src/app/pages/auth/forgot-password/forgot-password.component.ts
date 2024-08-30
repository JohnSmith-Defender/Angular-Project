import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
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
import { LocalService, CompanyService } from "src/app/share/services";

import { CompanyLogoComponent } from "@share/components";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";

import { COMPANY_IMAGE_URL } from "@lib/api-constants";
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
    RouterModule,
    CompanyLogoComponent,
  ],
  templateUrl: "./forgot-password.component.html",
})
export class ForgotPasswordComponent {
  private destroy$ = new Subject<void>();

  forgotPasswordForm: FormGroup;
  language: any;
  logoSource: any;
  companies: any;
  companyId: any;
  domain: any;
  initialPage: any;
  primaryColor: any;
  buttonColor: any;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar,
    private _localService: LocalService,
    private _companyService: CompanyService
  ) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl("", [Validators.required]),
    });
  }

  async ngOnInit() {
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

  send() {
    const email = this.forgotPasswordForm.value.email;

    this._authService
      .resetPassword(email, this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this.open(
            this._translateService.instant("login.pleasecheckyourinbox"),
            ""
          );
        },
        (error) => {
          if (error && error.error.error_code == "user_not_found") {
            this.open(
              this._translateService.instant("dialog.invalidcredentials"),
              ""
            );
          } else {
            this.open(this._translateService.instant("dialog.error"), "");
          }
        }
      );
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
