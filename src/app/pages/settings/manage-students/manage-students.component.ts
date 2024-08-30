import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { Router } from "@angular/router";
import {
  LocalService,
  CompanyService,
  UserService,
} from "src/app/share/services";
import { CoursesStudentsManagementComponent } from "@features/courses/students-management/students-management.component";
import { environment } from "@env/environment";
import { Subject, takeUntil } from "rxjs";
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule,
    CoursesStudentsManagementComponent,
  ],
  templateUrl: "./manage-students.component.html",
})
export class ManageStudentsComponent {
  private destroy$ = new Subject<void>();

  language: any;
  userId: any;
  companyId: any;
  companies: any;
  companyDomain: any;
  companyImage: any;
  primaryColor: any;
  buttonColor: any;
  isLoading: boolean = false;
  languageChangeSubscription: any;

  constructor(
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _userService: UserService
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
      this.companyDomain = company[0].domain;
      this.companyImage = company[0].image;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color
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
    
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}