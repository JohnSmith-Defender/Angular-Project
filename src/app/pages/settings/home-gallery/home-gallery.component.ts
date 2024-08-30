import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { PageTitleComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { ImageGalleryComponent } from "@share/components/image-gallery/image-gallery.component";
import get from "lodash/get";

@Component({
  selector: "app-home-gallery",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    SearchComponent,
    ToastComponent,
    PageTitleComponent,
    ImageGalleryComponent,
  ],
  templateUrl: "./home-gallery.component.html",
})
export class HomeGalleryComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() mode: any;

  languageChangeSubscription;
  userId: any;
  companyId: any;
  language: any;
  isloading: boolean = true;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  company: any;
  domain: any;
  pageName: any;
  images: any = [];

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private _location: Location,
  ) {}

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslanguage) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
      this.companyId = company[0].id;
      this.domain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
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

  initializePage() {
    if(this.mode == 'template') {
        this.pageName = `${this._translateService.instant('leads.layout')} ${this.id}`;
    }

    if(this.id == 1 || this.id == 4 || this.id == 5) {
        this.images = [
            {
                id: 1,
                image: `${environment.api}/get-image-company/home_ue.png`,
            }
        ]
    } else if(this.id == 2) {
        this.images = [
            {
                id: 1,
                image: `${environment.api}/get-image-company/home_vcp.png`,
            },
            {
                id: 2,
                image: `${environment.api}/get-image-company/home_ameib.png`,
            }
        ]
    } else if(this.id == 3) {
        this.images = [
            {
                id: 1,
                image: `${environment.api}/get-image-company/home_as.png`,
            },
            {
                id: 2,
                image: `${environment.api}/get-image-company/home_mindglobal.png`,
            },
            {
                id: 3,
                image: `${environment.api}/get-image-company/home_ccm.png`,
            },
            {
                id: 4,
                image: `${environment.api}/get-image-company/home_eliku.png`,
            }
        ]
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}