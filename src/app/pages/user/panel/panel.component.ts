import { CommonModule, Location } from "@angular/common";
import { Component, HostListener, Input } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService, UserService } from "@share/services";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject } from "rxjs";
import { BreadcrumbComponent, PageTitleComponent } from "@share/components";
import { PanelMenuComponent } from "@share/components/astro-ideal/panel/menu/menu.component";
import { environment } from "@env/environment";
import get from "lodash/get";
import { AuthService } from "@lib/services";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    PageTitleComponent,
    BreadcrumbComponent,
    PanelMenuComponent,
  ],
  templateUrl: "./panel.component.html"
})
export class UserPanelComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  language: any;
  email: any;
  userId: any;
  companyId: any;
  domain: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  pageTitle: any;
  company: any;
  isMobile: boolean = false;

  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";

  menuItems: any = [];
  isAdmin: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _authService: AuthService,
    private _userService: UserService,
    private _companyService: CompanyService,
    private _location: Location,
    ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }
    
  async ngOnInit() {
    this.onResize();
    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
      );
    this.domain = this._localService.getLocalStorage(environment.lsdomain);
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
      this.company = company[0];
      this.domain = company[0].domain;
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
      ? company[0].button_color
      : company[0].primary_color;
      this.hoverColor = company[0].hover_color
      ? company[0].hover_color
      : company[0].primary_color;
    }
    
    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
        );
        this.initializePage();
  }

  async initializePage() {
    this.pageTitle = this._translateService.instant("user-panel.userpanel");
    this.initializeBreadcrumb();
    this.checkAdminPermissions();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant("company-settings.home");
    this.level2Title = this.pageTitle;
    this.level3Title = "";
    this.level4Title = "";
  }

  checkAdminPermissions() {
    this._userService.isAdminById(this.userId).subscribe((res: any) => {
      this.isAdmin = res.isAdmin ? true : false;
      this.initializeMenu();
    })
  }

  initializeMenu() {
    this.menuItems = [
      {
        text: this._translateService.instant('user-panel.personalinformation'),
        action: 'personal-info'
      },
      {
        text: this._translateService.instant('professionals.mytransactions'),
        action: 'my-transactions'
      },
    ]

    if(this.isAdmin) {
      this.menuItems.push({
        text: this._translateService.instant('company-settings.settings'),
        action: 'settings'
      });
    }

    this.menuItems.push({
      text: this._translateService.instant('user-popup.logout'),
      action: 'logout'
    });
    this.menuItems.push({
      text: this._translateService.instant('user-panel.deleteaccount'),
      action: 'delete-account'
    });
  }

  handleMenuClick(event) {
    switch(event) {
      case 'settings':
        this.navigateToPage('/settings');
        break;
      case 'my-transactions':
        this.navigateToPage('/users/my-transactions');
        break;
      case 'logout':
        this.logout();
        break;
    }
  }

  navigateToPage(link) {
    this._router.navigate([link]);
  }

  logout(): void {
    this._authService.logout();
    this._router.navigate(["/auth/login"]);
  }

  handleGoBack() {
    this._location.back();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}