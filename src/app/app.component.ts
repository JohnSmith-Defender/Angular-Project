import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterModule, RoutesRecognized } from "@angular/router";
import { AuthService, PushNotificationService } from "src/app/core/services";
import { ThemeService } from "src/app/core/services/theme";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { LocalService, CompanyService } from "src/app/share/services";
import { LayoutLeftComponent } from "./core/components/layouts/layout-left/layout-left.component";
import { LayoutMainComponent } from "./core/components/layouts/layout-main/layout-main.component";
import { PageLayout } from "@lib/enums/page-layout.enum";
import { LayoutBlankComponent } from "@lib/components";
import { environment } from "@env/environment";
import { Customer } from "@lib/interfaces";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { initFlowbite } from 'flowbite';
import customersData from "src/assets/data/customers.json";
import get from "lodash/get";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    LayoutLeftComponent,
    LayoutMainComponent,
    LayoutBlankComponent,
  ],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  isAuthenticated$ = inject(AuthService).isAuthenticated$;

  private readonly _themeService = inject(ThemeService);

  PageLayout = PageLayout;
  layout: PageLayout | undefined;

  customers: Customer[] = customersData;
  title = "vistingo";
  language: any;
  favIcon: HTMLLinkElement = document.querySelector("#appIcon")!;
  version: any;
  userId: any;
  companies: any = [];
  languages: any = [];
  logoImageSrc: string = COMPANY_IMAGE_URL;
  newUpdatesAvailable: boolean = false;

  constructor(
    private router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService
  ) {
    this.setFavIcon(window.location.host);
  }

  async ngOnInit() {
    this._themeService.init();

    this.router.events.subscribe((data: any) => {
      if (data instanceof RoutesRecognized) {
        this.layout = data?.state?.root?.firstChild?.data["layout"];
      }
    });

    let localVersion = localStorage.getItem('version') || ''
    this.version = get(await this._companyService.getVersion().toPromise(), 'version')
    this.userId = this._localService.getLocalStorage(environment.lsuserId)
    if(this.version && this.version.version_hash != localVersion) {
      localStorage.setItem('new-version', this.version.version_hash)
      localStorage.setItem('require-relogin', this.version.require_relogin)
      if(this.router.url == '/' || this.router.url == '/auth/login' || this.userId > 0) {
        this.showNewUpdates()
      }
    }
  }

  showNewUpdates() {
    this.newUpdatesAvailable = true;
    setTimeout(() => {
      initFlowbite();
    }, 100)
  }

  async setFavIcon(host) {
    let favIcon = "vistingo.com_favicon.ico";
    let company =
      this.customers &&
      this.customers.find((c) => c.url == host || c.url == environment.company);
    if (company) {
      this.companies = this._localService.getLocalStorage(
        environment.lscompanies
      )
        ? JSON.parse(
            this._localService.getLocalStorage(environment.lscompanies)
          )
        : "";
      if (!this.companies) {
        this.companies = get(
          await this._companyService.getCompanies().toPromise(),
          "companies"
        );
      }
      let comp = this._companyService.getCompany(this.companies);

      if (comp && comp[0] && comp[0].id) {
        this.language = this._localService.getLocalStorage(environment.lslang);
        if (this.language) {
          this._translateService.setDefaultLang(this.language);
          this._translateService.use(this.language);
        } else {
          this.languages = get(
            await this._companyService.getLanguages(comp[0].id).toPromise(),
            "languages"
          );
          let default_language =
            this.languages &&
            this.languages.filter((l) => {
              return l.default == 1;
            });
          if (default_language && default_language[0]) {
            this._translateService.setDefaultLang(default_language[0].code);
            this._translateService.use(default_language[0].code);
            this._localService.setLocalStorage(
              environment.lslang,
              default_language[0].code
            );
          } else {
            this.setDefaultLanguage();
          }
        }
      } else {
        this.setDefaultLanguage();
      }

      if (comp && comp[0] && comp[0].favicon_image) {
        this.favIcon.href = `${this.logoImageSrc}/${
          comp[0].favicon_image || comp[0].image
        }`;
      } else {
        this.favIcon.href = `./assets/favicon/${company.domain}_favicon.ico`;
      }
    } else {
      this.setDefaultLanguage();
      this.favIcon.href = `./assets/favicon/${favIcon}`;
    }
  }

  setDefaultLanguage() {
    this._translateService.setDefaultLang("es");
    this._translateService.use("es");
  }
}
