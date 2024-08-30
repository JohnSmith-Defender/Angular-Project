import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChange,
  inject,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PACKAGE_JSON, providePackageJson } from 'src/app/core/providers';
import { LogoComponent } from '../logo/logo.component';
import { LocalService } from 'src/app/share/services';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {
  LangChangeEvent,
  TranslateService,
  TranslateModule,
} from '@ngx-translate/core';

import { environment } from '@env/environment';
import { COMPANY_IMAGE_URL } from '@lib/api-constants';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    TranslateModule,
    FontAwesomeModule,
    LogoComponent,
  ],
  providers: [providePackageJson()],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  @Input() menus: any;
  @Input() company: any;
  @Input() contactUsDetails: any;
  @Input() customLinks: any;
  @Input() languages: any;
  @Input() logoSource: any;
  @Input() isUESchoolOfLife: any;

  @Output() changeLanguage = new EventEmitter();

  readonly packageJson = inject(PACKAGE_JSON);
  readonly currentYear = new Date().getFullYear();

  envelopeIcon = faEnvelope;

  language: any;
  selectedLanguage: any;
  companyName: any;
  domain: any;
  primaryColor: any;
  buttonColor: any;
  menuColor: any;
  footerBackgroundColor: any;
  footerTextColor: any;
  footerLogowidth: any;
  footerLogoHeight: any;
  companyId: any;
  companies: any;
  termsAndConditions: any;
  termsAndConditionsEn: any;
  termsAndConditionsFr: any;
  termsAndConditionsEu: any;
  termsAndConditionsCa: any;
  termsAndConditionsDe: any;
  privacyPolicy: any;
  privacyPolicyEn: any;
  privacyPolicyFr: any;
  privacyPolicyEu: any;
  privacyPolicyCa: any;
  privacyPolicyDe: any;
  cookiePolicy: any;
  cookiePolicyEn: any;
  cookiePolicyFr: any;
  cookiePolicyEu: any;
  cookiePolicyCa: any;
  cookiePolicyDe: any;
  termsAndConditionsURL: any;
  termsAndConditionsURLEn: any;
  termsAndConditionsURLFr: any;
  termsAndConditionsURLEu: any;
  termsAndConditionsURLCa: any;
  termsAndConditionsURLDe: any;
  privacyPolicyURL: any;
  privacyPolicyURLEn: any;
  privacyPolicyURLFr: any;
  privacyPolicyURLEu: any;
  privacyPolicyURLCa: any;
  privacyPolicyURLDe: any;
  cookiePolicyURL: any;
  cookiePolicyURLEn: any;
  cookiePolicyURLFr: any;
  cookiePolicyURLEu: any;
  cookiePolicyURLCa: any;
  cookiePolicyURLDe: any;
  canShowTermsAndConditions: boolean = false;
  canShowPrivacyPolicy: boolean = false;
  canShowCookiePolicy: boolean = false;
  isLoading: boolean = true;
  languageChangeSubscription;
  additionalLinks: any = [];

  // social
  twitter: any;
  facebook: any;
  instagram: any;
  linkedin: any;
  youtube: any;
  hasSocials: boolean;

  constructor(
    private _router: Router,
    private _localService: LocalService,
    private _translateService: TranslateService
  ) {
    this.hasSocials = false;
  }

  ngOnChanges(changes: SimpleChange) {
    let customLinksChange = changes['customLinks'];
    if (customLinksChange?.currentValue?.length > 0) {
      let links = customLinksChange.currentValue;
      this.additionalLinks = links;
    }
  }

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslang) || 'es';
    this.selectedLanguage = this.language;
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this._translateService.use(this.language || 'es');
    this.isLoading = false;

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.rerenderLinks();
        }
      );

    this.companyId = this.company?.id;
    this.primaryColor = this.company.primary_color;
    this.buttonColor = this.company.button_color
      ? this.company.button_color
      : this.company.primary_color;
    this.menuColor = this.company.menu_color
      ? this.company.menu_color
      : '#ffffff';
    this.footerBackgroundColor = this.company.footer_background_color
      ? this.company.footer_background_color
      : this.company.primary_color;
    this.footerTextColor = this.company.footer_text_color
      ? this.company.footer_text_color
      : this.company.primary_color;
    this.termsAndConditions = this.company.terms_and_conditions;
    this.termsAndConditionsEn = this.company.terms_and_conditions_en;
    this.termsAndConditionsFr = this.company.terms_and_conditions_fr;
    this.termsAndConditionsEu = this.company.terms_and_conditions_eu;
    this.termsAndConditionsCa = this.company.terms_and_conditions_ca;
    this.termsAndConditionsDe = this.company.terms_and_conditions_de;
    this.privacyPolicy = this.company.policy;
    this.privacyPolicyEn = this.company.policy_en;
    this.privacyPolicyFr = this.company.policy_fr;
    this.privacyPolicyEu = this.company.policy_eu;
    this.privacyPolicyCa = this.company.policy_ca;
    this.privacyPolicyDe = this.company.policy_de;
    this.cookiePolicy = this.company.cookie_policy;
    this.cookiePolicyEn = this.company.cookie_policy_en;
    this.cookiePolicyFr = this.company.cookie_policy_fr;
    this.cookiePolicyEu = this.company.cookie_policy_eu;
    this.cookiePolicyCa = this.company.cookie_policy_ca;
    this.cookiePolicyDe = this.company.cookie_policy_de;
    this.termsAndConditionsURL = this.company.terms_and_conditions_url;
    this.termsAndConditionsURLEn = this.company.terms_and_conditions_url_en;
    this.termsAndConditionsURLFr = this.company.terms_and_conditions_url_fr;
    this.termsAndConditionsURLEu = this.company.terms_and_conditions_url_eu;
    this.termsAndConditionsURLCa = this.company.terms_and_conditions_url_ca;
    this.termsAndConditionsURLDe = this.company.terms_and_conditions_url_de;
    this.privacyPolicyURL = this.company.privacy_policy_url;
    this.privacyPolicyURLEn = this.company.privacy_policy_url_en;
    this.privacyPolicyURLFr = this.company.privacy_policy_url_fr;
    this.privacyPolicyURLEu = this.company.privacy_policy_url_eu;
    this.privacyPolicyURLCa = this.company.privacy_policy_url_ca;
    this.privacyPolicyURLDe = this.company.privacy_policy_url_de;
    this.cookiePolicyURL = this.company.cookie_policy_url;
    this.cookiePolicyURLEn = this.company.cookie_policy_url_en;
    this.cookiePolicyURLFr = this.company.cookie_policy_url_fr;
    this.cookiePolicyURLEu = this.company.cookie_policy_url_eu;
    this.cookiePolicyURLCa = this.company.cookie_policy_url_ca;
    this.cookiePolicyURLDe = this.company.cookie_policy_url_de;
    this.canShowTermsAndConditions = this.company.show_terms == 1 ? true : false;
    this.canShowPrivacyPolicy = this.company.show_privacy_policy == 1 ? true : false;
    this.canShowCookiePolicy = this.company.show_cookie_policy == 1 ? true : false;
    this.footerTextColor = this.company.footer_text_color;
    this.footerBackgroundColor = this.company.footer_background_color;
    this.footerLogoHeight = this.company.footer_logo_height || 50;
    this.footerLogowidth = this.company.footer_logo_width || 180;

    // social
    this.twitter = this.company.twitter;
    if (this.twitter && !this.twitter.startsWith('https://')) {
      this.twitter = 'https://' + this.twitter;
    }

    this.youtube = this.company.youtube;
    if (this.youtube && !this.youtube.startsWith('https://')) {
      this.youtube = 'https://' + this.youtube;
    }

    this.instagram = this.company.instagram;
    if (this.instagram && !this.instagram.startsWith('https://')) {
      this.instagram = 'https://' + this.instagram;
    }

    this.facebook = this.company.facebook;
    if (this.facebook && !this.facebook.startsWith('https://')) {
      this.facebook = 'https://' + this.facebook;
    }

    this.linkedin = this.company.linked_in;
    if (this.linkedin && !this.linkedin.startsWith('https://')) {
      this.linkedin = 'https://' + this.linkedin;
    }

    this.hasSocials =
      !!this.twitter ||
      !!this.instagram ||
      !!this.facebook ||
      !!this.linkedin ||
      !!this.youtube;
  }

  rerenderLinks() {
    this.isLoading = true;
    this.isLoading = false;
  }

  openTermsAndConditions() {
    if (!this.canShowTermsAndConditions && this.termsAndConditionsURL) {
      let link = '';
      switch (this.language) {
        case 'en':
          link = this.termsAndConditionsURLEn;
          break;
        case 'fr':
          link = this.termsAndConditionsURLFr;
          break;
        case 'eu':
          link = this.termsAndConditionsURLEu;
          break;
        case 'ca':
          link = this.termsAndConditionsURLCa;
          break;
        case 'de':
          link = this.termsAndConditionsURLDe;
          break;
      }
      if (!link) {
        link = this.termsAndConditionsURL;
      }

      window.open(link, '_blank');
    } else {
      this._router.navigate(['/general/terms-and-conditions']);
    }
  }

  openPrivacyPolicy() {
    if (!this.canShowPrivacyPolicy && this.privacyPolicyURL) {
      let link = '';
      switch (this.language) {
        case 'en':
          link = this.privacyPolicyURLEn;
          break;
        case 'fr':
          link = this.privacyPolicyURLFr;
          break;
        case 'eu':
          link = this.privacyPolicyURLEu;
          break;
        case 'ca':
          link = this.privacyPolicyURLCa;
          break;
        case 'de':
          link = this.privacyPolicyURLDe;
          break;
      }
      if (!link) {
        link = this.privacyPolicyURL;
      }

      window.open(link, '_blank');
    } else {
      this._router.navigate(['/general/privacy-policy']);
    }
  }

  openCookiePolicy() {
    if (!this.canShowCookiePolicy && this.cookiePolicyURL) {
      let link = '';
      switch (this.language) {
        case 'en':
          link = this.cookiePolicyURLEn;
          break;
        case 'fr':
          link = this.cookiePolicyURLFr;
          break;
        case 'eu':
          link = this.cookiePolicyURLEu;
          break;
        case 'ca':
          link = this.cookiePolicyURLCa;
          break;
        case 'de':
          link = this.cookiePolicyURLDe;
          break;
      }
      if (!link) {
        link = this.cookiePolicyURL;
      }
      window.open(link, '_blank');
    } else {
      this._router.navigate(['/general/cookie-policy']);
    }
  }

  getMenuTitle(menu) {
    return this.language == 'en'
      ? menu.name
      : this.language == 'fr'
      ? menu.name_FR || menu.name_ES
      : this.language == 'eu'
      ? menu.name_EU || menu.name_ES
      : this.language == 'ca'
      ? menu.name_CA || menu.name_ES
      : this.language == 'de'
      ? menu.name_DE || menu.name_ES
      : menu.name_ES;
  }

  getContactUsText(contact_us) {
    return this.language == 'en'
      ? contact_us.text
      : this.language == 'fr'
      ? contact_us.text_fr || contact_us.text
      : this.language == 'eu'
      ? contact_us.text_eu || contact_us.text
      : this.language == 'ca'
      ? contact_us.text_ca || contact_us.text
      : this.language == 'de'
      ? contact_us.text_de || contact_us.text
      : contact_us.text;
  }

  getLinkText(link) {
    return this.language == 'en' ? link.text_en : link.text_es;
  }

  getTermsAndConditionsText() {
    let str = this._translateService
      .instant('footer.terms_and_conditions')
      ?.toLowerCase();
    return str ? str[0].toUpperCase() + str.slice(1) : '';
  }

  getPrivacyPolicyText() {
    let str = this._translateService
      .instant('footer.privacy_policy')
      ?.toLowerCase();
    return str ? str[0].toUpperCase() + str.slice(1) : '';
  }

  getCookiePolicyText() {
    let str = this._translateService
      .instant('footer.cookies_policy')
      ?.toLowerCase();
    return str ? str[0].toUpperCase() + str.slice(1) : '';
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
  }

  getLanguage(language) {
    return language[`name_${this.language.toUpperCase()}`];
  }

  onLanguageChange() {
    this.language = this.selectedLanguage;
    this.changeLanguage.emit(this.language);
  }
}
