import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, Input, SimpleChange } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
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
import { SafeContentHtmlPipe } from "@lib/pipes";
import { NoAccessComponent } from "@share/components";
import get from "lodash/get";

@Component({
  selector: "app-landing-full-width",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    SafeContentHtmlPipe,
    NoAccessComponent,
  ],
  templateUrl: "./landing-full-width.component.html",
  styleUrls: ["./landing-full-width.component.scss"],
})
export class TikTokLandingFullWidthComponent {
  private destroy$ = new Subject<void>();

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
  
  @Input() selectedLayout: any;
  @Input() selectedBackgroundColor: any;
  @Input() selectedTextColor: any;
  @Input() activateBanner: any;
  @Input() activateSection1: any;
  @Input() activateSection2: any;
  @Input() activateSection3: any;
  @Input() section1Text: any;
  @Input() section2Text: any;
  @Input() section3Text: any;
  @Input() bannerImage: any;
  @Input() activateSection1QuestionCTA: any;
  @Input() section1QuestionCTAText: any;
  @Input() section1QuestionCTAColor: any;
  @Input() section1QuestionCTATextColor: any;
  @Input() activateSection2QuestionCTA: any;
  @Input() section2QuestionCTAText: any;
  @Input() section2QuestionCTAColor: any;
  @Input() section2QuestionCTATextColor: any;
  @Input() activateSection3QuestionCTA: any;
  @Input() section3QuestionCTAText: any;
  @Input() section3QuestionCTAColor: any;
  @Input() section3QuestionCTATextColor: any;
  @Input() slug: any;
  @Input() defaultQuestionId: any;
  @Input() spainQuestionId: any;
  @Input() outsideSpainQuestionId: any;
  @Input() latamQuestionId: any;
  @Input() country: any;
  @Input() city: any;
  @Input() ipAddress: any;
  @Input() section1_cta_redirect: any;
  @Input() section1_cta_redirect_value: any;
  @Input() section2_cta_redirect: any;
  @Input() section2_cta_redirect_value:any;
  @Input() section3_cta_redirect: any;
  @Input() section3_cta_redirect_value:any 

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
  ) {}

  ngOnChanges(changes: SimpleChange) {
    let countryChange = changes["country"];
    if (countryChange?.previousValue != countryChange?.currentValue) {
      this.country = countryChange.currentValue;
    }

    let cityChange = changes["city"];
    if (cityChange?.previousValue != cityChange?.currentValue) {
      this.city = cityChange.currentValue;
    }

    let ipAddressChange = changes["ipAddress"];
    if (ipAddressChange?.previousValue != ipAddressChange?.currentValue) {
      this.ipAddress = ipAddressChange.currentValue;
    }
  }

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
        this.domain = company[0].domain
        this.companyId = company[0].id
        this.domain = company[0].domain
        this.primaryColor = company[0].primary_color
        this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
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
    
  }

  redirectToCTALink(mode) {
    switch(mode) {
      case 'section1':
        if(this.section1_cta_redirect){
          window.location.href = this.section1_cta_redirect_value;
        }else{
          this.redirectToDefaultCTALink();
        }
        break
      case 'section2':
        if(this.section2_cta_redirect){
          window.location.href = this.section2_cta_redirect_value;
        }else{
          this.redirectToDefaultCTALink();
        }
        break;
      case 'section3':
        if(this.section3_cta_redirect){
          window.location.href = this.section3_cta_redirect_value;
        }else{
          this.redirectToDefaultCTALink();
        }
        break;
      default:
        this.redirectToDefaultCTALink();
        break;
    }
  }

  redirectToDefaultCTALink(){
    // this._router.navigate([`/tiktok/questions/${this.slug}`]);
    let question_id = this.defaultQuestionId;
    if(this.country) {
      if(this.spainQuestionId > 0 && this.country == 'Spain') {
        question_id = this.spainQuestionId;
      } else if(this.latamQuestionId > 0 && this.isLatamCountry()) {
        question_id = this.latamQuestionId;
      } else {
        if(this.outsideSpainQuestionId > 0) {
          question_id = this.outsideSpainQuestionId;
        }
      }
    }

    this._router.navigate([`/tiktok/landing-questions/${question_id}`]);
  }

  isLatamCountry() {
    let is_latam = false;
    
    if(this.country == 'Brazil' ||
      this.country == 'Argentina' ||
      this.country == 'Chile' ||
      this.country == 'Venezuela' ||
      this.country == 'Panama' ||
      this.country == 'Guatemala' ||
      this.country == 'Cuba' ||
      this.country == 'French Guiana' ||
      this.country == 'Saint Lucia' ||
      this.country == 'Saint Martin' ||
      this.country == 'Colombia' ||
      this.country == 'Uruguay' ||
      this.country == 'Peru' ||
      this.country == 'Paraguay' ||
      this.country == 'Honduras' ||
      this.country == 'Nicaragua' ||
      this.country == 'Haiti' ||
      this.country == 'Martinique' ||
      this.country == 'Antigua and Barbuda' ||
      this.country == 'Saint Barthelemy' ||
      this.country == 'Mexico' ||
      this.country == 'Bolivia' ||
      this.country == 'Ecuador' ||
      this.country == 'Costa Rica' ||
      this.country == 'El Salvador' ||
      this.country == 'Dominican Republic' ||
      this.country == 'Puerto Rico' ||
      this.country == 'Guadeloupe' ||
      this.country == 'Belize'
    ) {
      is_latam = true;
    }

    return is_latam;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}