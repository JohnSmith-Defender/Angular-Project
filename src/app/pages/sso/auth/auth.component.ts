import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { environment } from "@env/environment";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import {
  LocalService,
  CompanyService,
  UserService,
  TokenStorageService,
} from "src/app/share/services";
import { storage } from "src/app/core/utils/storage/storage.utils";
import { CompanyLogoComponent } from "@share/components";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { Subject, takeUntil } from "rxjs";
import { initFlowbite } from "flowbite";
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyLogoComponent,
  ],
  templateUrl: "./auth.component.html",
})
export class AuthComponent {
  private destroy$ = new Subject<void>();

  @Input() token!: string;
  @Input() returnUrl!: string;

  language: any;
  logoSource: any;
  companies: any;
  companyId: any;
  domain: any;
  primaryColor: any;
  buttonColor: any;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _userService: UserService,
    private _tokenStorageService: TokenStorageService
  ) {}

  async ngOnInit() {
    initFlowbite();
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

      if (this.token) {
        this.getUserGuid();
      }
    }
  }

  getUserGuid() {
    this._userService
      .getUserByGuid(this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (data) => {
        this._tokenStorageService.saveToken(data["token"]);
        this._tokenStorageService.saveRefreshToken(data["refreshToken"]);
        this._tokenStorageService.saveUser(data);
        this._localService.setLocalStorage(environment.lstoken, data["token"]);
        this._localService.setLocalStorage(
          environment.lsrefreshtoken,
          data["refreshToken"]
        );
        this._localService.setLocalStorage(environment.lsuser, data);
        this._localService.setLocalStorage(environment.lsuserId, data["id"]);
        this._localService.setLocalStorage(
          environment.lscompanyId,
          data["fk_company_id"]
        );
        this._localService.setLocalStorage(environment.lsdomain, this.domain);
        this._localService.setLocalStorage(environment.lsguid, data["guid"]);
        storage.setItem("appSession", {
          user: environment.lsuserId,
          token: environment.lstoken,
        });

        if(this.returnUrl == 'undefined') { this.returnUrl = ''; }
        location.href = `/?returnUrl=${this.returnUrl}` || '/';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}