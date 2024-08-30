import { CommonModule, NgOptimizedImage } from "@angular/common";
import { 
  ChangeDetectionStrategy, 
  Component, 
  ChangeDetectorRef, 
} from "@angular/core";
import { Router } from "@angular/router";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { LeftImage } from "@lib/interfaces";
import { environment } from "@env/environment";
import { CompanyService, LocalService } from "@share/services";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import leftImagesData from "src/assets/data/left-images.json";
import get from "lodash/get";

@Component({
  selector: "app-layout-left-banner",
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    NgOptimizedImage,
  ],
  templateUrl: "./layout-left.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutLeftComponent {
  logoImageSrc: string = COMPANY_IMAGE_URL;
  companies: any;
  primaryColor: any = "#fff";
  buttonColor: any;
  userId: any;
  companyId: any;
  language: any;
  domain: any;
  companyName: any;
  email: any;
  loggedIn: boolean = false;
  loading: boolean = true;
  leftImage: any;
  leftImages: LeftImage[] = leftImagesData;
  isVCPAdminRoute: boolean = false;
  hideLeftImage: boolean = false;
  customLogin: boolean = false;
  memberTypePage: boolean = false;
  memberTypePaymentPage: boolean = false;
  signupPage: boolean = false;

  constructor(
    private _localService: LocalService,
    private _translateService: TranslateService,
    private _companyService: CompanyService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.language = this._localService.getLocalStorage(environment.lslanguage);
    this._translateService.setDefaultLang(this.language || "es");
    this._translateService.use(this.language || "es");
  }

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.language =
      this._localService.getLocalStorage(environment.lslang) ||
      this._localService.getLocalStorage(environment.lslanguage);

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
      this.companyName = company[0].entity_name;
      this.domain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.customLogin =
        company[0].show_logo_on_member_select == 1 ? true : false;
      this.leftImage = this.getLeftImage(company[0].video);
      this.cd.detectChanges()
      if (
        this.customLogin &&
        this.router.url &&
        this.router.url.indexOf("/signup") >= 0
      ) {
        this.hideLeftImage = true;
      }
    }

    this.loading = false;
  }

  getLeftImage(image) {
    let leftImage;
    if (image) {
      leftImage = `${this.logoImageSrc}/${image}`;
    } else {
      let imageItem = this.leftImages.filter((lft) => {
        return lft.companyid == this.companyId;
      });

      leftImage =
        imageItem && imageItem[0]
          ? imageItem[0].image
          : "./assets/images/new-design/company.jpg";
    }

    return leftImage;
  }
}
