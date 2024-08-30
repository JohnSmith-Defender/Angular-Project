import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import {
  LocalService,
  CompanyService,
} from "src/app/share/services";
import { environment } from "@env/environment";
import { ReportsComponent } from "@share/components";
import get from "lodash/get";

@Component({
  selector: 'app-settings-reports',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule,
    ReportsComponent
  ],
  templateUrl: "./reports.component.html",
})
export class SettingsReportsComponent {
  companyId: any;
  userId: any;
  language: any;
  companies: any;
  domain: any;
  companyImage: any;
  primaryColor: any;
  buttonColor: any;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

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
      this.companyId = company[0].id;
      this.domain = company[0].domain;
      this.companyImage = company[0].image;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color
    }
  }

  ngOnDestroy() {

  }
}
