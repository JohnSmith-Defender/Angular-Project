import { Injectable, VERSION } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@env/environment";
import { Customer } from "@lib/interfaces";
import customersData from "src/assets/data/customers.json";
import {
  COMPANIES_URL,
  FEATURES_URL,
  SUBFEATURES_URL,
  CONFIRM_EMAIL_URL,
  OTHER_SETTINGS_URL,
  CONTACT_DETAILS_URL,
  CUSTOM_MEMBER_TYPE_PERMISSIONS_URL,
  LANGUAGES_URL,
  VERSION_URL,
  META_DESCRIPTION_URL,
  FEATURES_MAPPING_URL,
  FEATURE_MAPPING_URL,
  COUNTRIES_URL,
  MEMBER_PLANS_URL,
  MEMBER_PLANS_LIST_URL,
  STRIPE_PK_URL,
  MEMBER_PLAN_SUBSCRIPTION_URL,
  SETTINGS_CATEGORY_URL,
  FEATURE_SUBFEATURES_URL,
  OTHER_SETTINGS_CATEGORY_URL,
  EDIT_EMAIL_SETTINGS_URL,
  FEATURES_LIST_URL,
  MANAGE_COMPANY_FEATURE_URL,
  FEATURE_URL,
  SUBFEATURES_MAPPING_URL,
  SUBFEATURE_OPTIONS_URL,
  SUBFEATURE_URL,
  FEATURE_NAME_EDIT_URL,
  SUBFEATURES_LIST_URL,
  SUBFEATURE_ACTIVATE_URL,
  SUBFEATURE_DEACTIVATE_URL,
  LANDING_TEMPLATE_URL,
  HOME_TEMPLATE_URL,
  MOBILE_LIMIT_SETTINGS_URL,
  CITIES_URL,
  SETTINGS_OPTIONS_URL,
  SETTING_CATEGORY_URL,
  PLANS_URL,
  PLANS_OTHER_DATA_URL,
  SUBFEATURE_OPTIONS_MAPPING_URL,
  STRIPE_CUSTOMER_PORTAL_URL,
  LISTS_MANAGEMENT_DATA_URL,
  REPORTS_DATA_URL,
  EDIT_TEAMS_REPORTS_URL,
  MANAGE_MEMBER_TYPES_DATA_URL,
  EDIT_MEMBER_TYPE_SEQUENCE_URL,
  DELETE_MEMBER_TYPE_URL,
  GENERATE_MEMBER_TYPE_LINK_URL,
  EDIT_MEMBER_TYPE_URL,
  ADD_MEMBER_TYPE_URL,
  SAVE_MEMBER_TYPE_PERMISSIONS_URL,
  DELETE_MEMBER_TYPE_FIELD_URL,
  EDIT_MEMBER_TYPE_FIELD_URL,
  ADD_MEMBER_TYPE_FIELD_URL,
  MEMBER_TYPE_PROFILE_FIELDS_URL,
  DELETE_CITY_URL,
  EDIT_CITY_URL,
  ADD_CITY_URL,
  MANAGE_SETTINGS_DATA_URL,
  MANAGE_SETTINGS_EMAIL_DATA_URL,
  EDIT_EMAIL_URL,
  EDIT_MEMBER_EMAIL_URL,
  ACTIVATE_OTHER_SETTING_URL,
  DEACTIVATE_OTHER_SETTING_URL,
  UPLOAD_EMAIL_IMAGE_URL,
  SAVE_NEW_BUTTON_MENU_URL,
  EDIT_MENU_ORDER_URL,
  EDIT_PRIVACY_POLICY_URL,
  EDIT_COOKIE_POLICY_URL,
  EDIT_TERMS_AND_CONDITIONS_URL,
  EDIT_TERMS_URL,
  EDIT_POLICY_URL,
  EDIT_COOKIE_URL,
  ACTIVATE_POLICY_URL,
  ACTIVATE_COOKIE_URL,
  ACTIVATE_TERMS_URL,
  EDIT_OTHER_SETTING_VALUE_URL,
  EDIT_COMPANY_FAVICON_URL,
  EDIT_COMPANY_BANNER_IMAGE_URL,
  EDIT_COMPANY_HEADER_IMAGE_URL,
  EDIT_COMPANY_LOGO_URL,
  ADD_COMPANY_BANNER_URL,
  ADD_COMPANY_LOGO_URL,
  HOME_DATA_URL,
  HOME_COURSES_TUTORS_TESTIMONIALS_DATA_URL,
  SECTORS_URL,
  AS_SECTORS_URL,
  EDIT_HOME_VIDEO_SETTINGS_URL,
  EDIT_HOME_MODULE_SETTINGS_URL,
  CONTRACTS_URL,
  EDIT_CONDITIONS_URL,
  HOME_PLANS_COURSES_DATA_URL,
  STRIPE_ACCOUNTS_URL,
  UPDATE_STRIPE_ACCOUNT_STATUS_URL,
  DELETE_STRIPE_ACCOUNT_URL,
  STRIPE_WEBHOOKS_URL,
  ADD_STRIPE_WEBHOOK_URL,
  EDIT_STRIPE_ACCOUNT_URL,
  ADD_STRIPE_ACCOUNT_URL,
  LEADS_QUESTIONS_URL,
  CREATE_LEADS_QUESTION_URL,
  EDIT_LEADS_QUESTION_URL,
  DELETE_LEADS_QUESTION_URL,
  CREATE_LEADS_QUESTION_ITEM_URL,
  EDIT_LEADS_QUESTION_ITEM_URL,
  DELETE_LEADS_QUESTION_ITEM_URL,
  DELETE_LEADS_QUESTION_MULTIPLE_CHOICE_OPTION_URL,
  EDIT_LEADS_QUESTION_MULTIPLE_CHOICE_OPTION_URL,
  CREATE_LEADS_QUESTION_MULTIPLE_CHOICE_OPTION_URL,
  CREATE_LEADS_QUESTION_RULE_URL,
  EDIT_LEADS_QUESTION_RULE_URL,
  DELETE_LEADS_QUESTION_RULE_URL,
  LEADS_LANDING_PAGES_URL,
  CREATE_LEADS_LANDING_PAGE_URL,
  EDIT_LEADS_LANDING_PAGE_URL,
  DELETE_LEADS_LANDING_PAGE_URL,
  LEADS_LOCATIONS_URL,
  CREATE_LEADS_LOCATION_URL,
  EDIT_LEADS_LOCATION_URL,
  DELETE_LEADS_LOCATION_URL,
  LEADS_LANDING_PAGE_DETAILS_URL,
  EDIT_LEADS_LANDING_PAGE_DETAILS_URL,
  LEADS_LANDING_PAGE_BY_SLUG_URL,
  QUESTIONS_URL,
  SUBMIT_QUESTION_ANSWERS_URL,
  SUBMISSIONS_URL,
  EDIT_QUESTION_STYLES_URL,
  QUESTIONS_BY_ID_URL,
  DELETE_VIDEOS_CTAS_URL,
  EDIT_VIDEOS_CTAS_DETAILS_URL,
  EDIT_VIDEOS_CTAS_URL,
  ADD_VIDEOS_CTAS_URL,
  VIDEOS_CTAS_URL,
  VIDEOS_CTAS_DETAILS_URL,
  VIDEO_CTA_BY_SLUG_URL,
  EDIT_QUESTION_OTHER_IMAGES_URL,
  EDIT_CREDITS_SETTINGS_URL,
  EDIT_VIDEOS_CTAS_CTA_SETTINGS_URL,
  SAVE_URL_BUTTON_MENU_URL,
  TIKTOK_DATA_URL,
  LOG_VIDEO_CTA_CLICK_URL,
  TIKTOK_QUESTIONS_DATA_URL,
  TIKTOK_LANDING_PAGES_DATA_URL,
  TIKTOK_VIDEOS_CTAS_DATA_URL,
  ENABLE_LANDING_TEMPLATE_URL,
  ENABLE_PREDEFINED_TEMPLATE_URL,
  DISABLE_PREDEFINED_TEMPLATE_URL,
  DISABLE_LANDING_TEMPLATE_URL,
  COMPANY_LANDING_TEMPLATE_URL,
  COMPANY_LANDING_TEMPLATE_DETAILS_URL,
  EDIT_COMPANY_TEMPLATE_URL,
  INVOICES_DATA_URL,
  INVOICE_URL,
  RESEND_INVOICE_URL,
  COUPONS_URL,
  ADD_COUPON_URL,
  EDIT_COUPON_URL,
  DELETE_COUPON_URL,
  COMMUNITY_CHANNELS_URL,
  ADD_COMMUNITY_CHANNEL_URL,
  EDIT_COMMUNITY_CHANNEL_URL,
  DELETE_COMMUNITY_CHANNEL_URL,
  ADDITIONAL_PROPERTIES_DATA,
  ASSESSMENTS_URL,
  CREATE_ASSESSMENT_URL,
  EDIT_ASSESSMENT_URL,
  DELETE_ASSESSMENT_URL,
  CREATE_ASSESSMENT_DETAIL_URL,
  EDIT_ASSESSMENT_DETAIL_URL,
  DELETE_ASSESSMENT_DETAIL_URL,
  CREATE_ASSESSMENT_MULTIPLE_CHOICE_OPTION_URL,
  EDIT_ASSESSMENT_MULTIPLE_CHOICE_OPTION_URL,
  DELETE_ASSESSMENT_MULTIPLE_CHOICE_OPTION_URL,
  SIGNUP_DATA_URL,
  ADD_STARTUP_URL,
  GET_STARTUPS_URL,
  KEAP_HOOKS_URL,
  KEAP_TAGS_URL,
  KEAP_HOOK_EVENT_TYPES_URL,
  KEAP_SETTINGS_URL,
  EDIT_KEAP_SETTINGS_URL,
  HOTMART_SETTINGS_URL,
  KEAP_HOOK_LOGS_URL,
  KEAP_INTEGRATIONS_URL,
  EDIT_INTEGRATION_STATUS_URL,
  ADD_KEAP_HOOK_URL,
  EDIT_KEAP_HOOK_URL,
  DELETE_KEAP_HOOK_URL,
  EDIT_KEAP_HOOK_STATUS_URL,
  ADD_KEAP_INTEGRATION_URL,
  EDIT_KEAP_INTEGRATION_URL,
  DELETE_KEAP_INTEGRATION_URL,
  SUPPORT_TICKETS_DATA_URL,
  SUBMIT_SUPPORT_TICKET_URL,
  CREATE_TICKET_REPLY_URL,
  ALL_FEATURES_URL,
  ADD_CUSTOMER_URL,
  ADD_CUSTOMER_FEATURE_MAPPING_URL,
  ADD_CUSTOMER_SETTINGS_URL,
  DEACTIVATE_CUSTOMER_URL,
  EDIT_CUSTOMER_SITE_DETAILS_URL,
  FILTER_SETTINGS_URL,
  EDIT_FILTER_SETTINGS_URL,
  RESPONSE_URL,
  HOME_PERSONALIZE_SETTINGS_URL,
  ACTIVATE_HOME_TEMPLATE_URL,
  EDIT_HOME_TEMPLATE_SECTIONS_URL,
  HOME_SECTIONS_DATA_URL,
  EXPORT_ALL_SUBMISSIONS_URL,
  DATA_SOURCE_FIELDS_URL,
  QUERY_DATABASE_URL,
  MODULE_COMMENTS_URL,
  ADD_MODULE_COMMENT_URL,
  EDIT_MODULE_COMMENT_URL,
  REACT_MODULE_COMMENT_URL,
  DELETE_MODULE_COMMENT_URL,
  EDIT_MODULE_FILTER_SETTINGS_URL,
  MODULE_FILTER_SETTINGS_URL,
  EDIT_HOME_TEXT_URL,
  EDIT_NAVIGATION_SETTINGS_URL,
  EDIT_HOME_STATUS_URL,
  COMPANY_PROFESSIONALS_URL,
  RANDOM_TESTIMONIAL_URL,
} from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";
import { withCache } from '@ngneat/cashew';
import { NGXLogger } from "ngx-logger";
import moment from 'moment';

@Injectable({
  providedIn: "root",
})
export class CompanyService {
  customers: Customer[] = customersData;
  language = "es";
  languageValue = new BehaviorSubject<string>(this.language);
  currentLanguage = this.languageValue.asObservable();

  private headers: HttpHeaders;

  constructor(
    private _http: HttpClient, 
    private _localService: LocalService,
    private _logger: NGXLogger
  ) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  changeLanguage(lang: string) {
    this.languageValue.next(lang);
  }

  getCompanies(): Observable<any> {
    return this._http
      .get(COMPANIES_URL, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCompany(companies): any {
    let company = [];
    let host = window.location.host;

    let customer =
      this.customers &&
      this.customers.find(
        (c) => c.url == host || c.url == environment.company
      );
    if (customer) {
      company =
        companies &&
        companies.filter((c) => {
          return c.url == customer?.url || c.alternative_url == customer?.url || c.school_of_life_url == customer?.url || c.testimonials_url == customer?.url;
        });
      if (company && company.length > 0) {
        this._localService.setLocalStorage(
          environment.lscompanies,
          company ? JSON.stringify(company) : ""
        );
      }
    } else {
      let comp = companies.find(
        (c) => c.url == host || c.url == environment.company
      )
      if(comp) {
        company = companies && companies.filter((c) => {
          return c.url == host || c.url == environment.company
        });
        this._localService.setLocalStorage(
          environment.lscompanies,
          company ? JSON.stringify(company) : ""
        );
      }
    }

    return company;
  }

  isUESchoolOfLife(customer): boolean {
    let result = false;

    if(customer.id == 32 && (customer.school_of_life_url == window.location.host || customer.school_of_life_url == environment.company)) {
      result = true;
    }

    return result;
  }

  getFeatures(domain) {
    return this._http.get(`${FEATURES_URL}/${domain}`, {
      headers: this.headers,
    });
  }

  getFeaturesList(domain) {
    return this._http.get(`${FEATURES_LIST_URL}/${domain}`, {
      ...withCache(),
      headers: this.headers,
    });
  }

  getCompanyFeature(id, companyId) {
    return this._http.get(`${FEATURE_URL}/${id}/${companyId}`, { 
      headers: this.headers 
    });
  }

  getCompanyFeatureMapping(companyId) {
    return this._http.get(`${FEATURE_MAPPING_URL}/${companyId}`, {
      headers: this.headers,
    });
  }

  getSubFeatures(id) {
    return this._http.get(`${FEATURE_SUBFEATURES_URL}/${id}`, {
      headers: this.headers,
    });
  }

  getSubFeaturesCombined(id, companyId) {
    return this._http.get(`${SUBFEATURES_LIST_URL}/${id}/${companyId}`, {
      headers: this.headers,
    });
  }

  getSubfeature(id) {
    return this._http.get(`${SUBFEATURE_URL}//${id}`, { 
      headers: this.headers 
    });
  }

  getAllSubfeatureOptions() {
    return this._http.get(SUBFEATURE_OPTIONS_URL, { 
      headers: this.headers 
    });
  }

  getCompanySubFeatures(id, companyId) {
    return this._http.get(`${SUBFEATURES_URL}/${id}/${companyId}`, {
      headers: this.headers,
    });
  }

  getCompanySubfeatureMapping(payload) {
    return this._http.post(SUBFEATURES_MAPPING_URL, payload, { 
      headers: this.headers 
    });
  }

  checkConfirmEmail(payload): Observable<any> {
    return this._http
      .post(CONFIRM_EMAIL_URL, payload, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getOtherSettings(id) {
    return this._http
      .get(`${OTHER_SETTINGS_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getOtherSettingsCategories() {
    return this._http.get(OTHER_SETTINGS_CATEGORY_URL, {
      headers: this.headers,
    });
  }

  getContactUsDetails(id) {
    return this._http.get(`${CONTACT_DETAILS_URL}/${id}`, {
      headers: this.headers,
    });
  }

  getCustomMemberTypePermissionsNew(id, companyId): Observable<any> {
    return this._http
      .get(`${CUSTOM_MEMBER_TYPE_PERMISSIONS_URL}/${id}/${companyId}`, {
        headers: this.headers,
      })
      .pipe(map((res) => res));
  }

  getLanguages(id): Observable<any> {
    return this._http
      .get(`${LANGUAGES_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getVersion(): Observable<any> {
    return this._http
      .get(VERSION_URL, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getMetaDescription(id): Observable<any> {
    return this._http
      .get(`${META_DESCRIPTION_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getSubfeaturesCombined(companyId, featureId) {
    return this._http
      .get(`${FEATURES_MAPPING_URL}/${companyId}/${featureId}`, {
        headers: this.headers,
      })
      .pipe(map((res) => res));
  }

  getCountries(): Observable<any> {
    return this._http
      .get(COUNTRIES_URL, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getPricingDetails(id): Observable<any> {
    return this._http
      .get(`${MEMBER_PLANS_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCustomMemberTypePermissionsList(id): Observable<any> {
    return this._http
      .get(`${MEMBER_PLANS_LIST_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getStripePublishableKey(companyId): Observable<any> {
    return this._http
      .get(`${STRIPE_PK_URL}/${companyId}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getMemberPlanSubscription(id): Observable<any> {
    return this._http
      .get(`${MEMBER_PLAN_SUBSCRIPTION_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getAllCategorySettingsList() {
    return this._http.get(SETTINGS_CATEGORY_URL, { headers: this.headers });
  }

  editEmailSettings(id, payload): Observable<any> {
    return this._http
      .post(`${EDIT_EMAIL_SETTINGS_URL}/${id}`, payload, {
        headers: this.headers,
      })
      .pipe(map((res) => res));
  }

  manageCompanyFeature(payload): Observable<any> {
    return this._http
      .post(MANAGE_COMPANY_FEATURE_URL, payload, {
        headers: this.headers,
      })
      .pipe(map((res) => res));
  }

  editCompanyFeature(id, companyId, payload): Observable<any> {
    return this._http
      .post(`${FEATURE_NAME_EDIT_URL}/${id}/${companyId}`, payload, { 
        headers: this.headers 
      })
      .pipe(map(res => res));
  }

  activateSubfeature(id, companyId, subfeatureId, payload): Observable<any> {
    return this._http
      .post(`${SUBFEATURE_ACTIVATE_URL}/${id}/${companyId}/${subfeatureId}`, payload, { 
        headers: this.headers 
      }).pipe(map(res => res));
  }

  deactivateSubfeature(id, companyId, subfeatureId, payload): Observable<any> {
    return this._http.post(`${SUBFEATURE_DEACTIVATE_URL}/${id}/${companyId}/${subfeatureId}`, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getLandingTemplateBySlug(slug): Observable<any> {
    return this._http.get(`${LANDING_TEMPLATE_URL}/${slug}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getHomeTemplate(id, companyId): Observable<any> {
    return this._http.get(`${HOME_TEMPLATE_URL}/${id}/${companyId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getMobileLimitSettingsAll(id): Observable<any> {
    return this._http.get(`${MOBILE_LIMIT_SETTINGS_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getCompanyCities(id): Observable<any> {
    return this._http.get(`${CITIES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getOtherSettingsSectionOptionContent(option_id, section_id, company_id): Observable<any> {
    return this._http.get(`${SETTINGS_OPTIONS_URL}/${company_id}/${option_id}/${section_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getCategorySetting(id): Observable<any> {
    return this._http.get(`${SETTING_CATEGORY_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getSubfeatureOptionMapping(id, featureId, companyId): Observable<any> {
    return this._http.get(`${SUBFEATURE_OPTIONS_MAPPING_URL}/${id}/${featureId}/${companyId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  createOtherCustomerPortal(userId, companyId, objectId, object, type, payload): Observable<any> {
    return this._http.post(`${STRIPE_CUSTOMER_PORTAL_URL}/${userId}/${companyId}/${objectId}/${object}/${type}`,
      payload
    ).pipe(
      map(res => {
        const result = res
        return result;
      })
    );
  }

  fetchAdministrarData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${LISTS_MANAGEMENT_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchReportsData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${REPORTS_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getReportData(id, type, start_date, end_date, period, year, campus, title) {
    let params = `start_date=${moment(start_date).format('YYYY-MM-DD')}&end_date=${moment(end_date).format('YYYY-MM-DD')}&period=${period}&year=${year}&campus=${campus}&title=${title}`
  
    let url
    switch(type) {
      case 'joined':
        url = `/company/reports/activities/joined/donut/${id}?${params}`
        break
      case 'clicks': 
        url = `/company/reports/activities/clicked/${id}?${params}`
        break
      case 'attended': 
        url = `/company/reports/activities/teams/${id}`
        break
      case 'clubs-joined': 
        url = `/company/reports/clubs/joined/donut/${id}?${params}`
        break
      case 'clubs-generated':
        url = `/company/reports/clubs/activities/generated/donut/${id}?${params}`
        break
      case 'joined-generated':
        url = `/company/reports/clubs/activities/generated/joined/donut/${id}?${params}`
        break
      case 'offers-joined':
        url = `/company/reports/canal-empleo/joined/${id}?${params}`
        break
      case 'offer-clicks':
        url = `/company/reports/canal-empleo/clicked/${id}?${params}`
        break
      case 'teams-attended':
        url = `/company/reports/activities/teams-msgraph/${id}/attended?${params}`
        break
      case 'teams-audio-time':
        url = `/company/reports/activities/teams-msgraph/${id}/audio-time?${params}`
        break
      case 'teams-video-time':
        url = `/company/reports/activities/teams-msgraph/${id}/video-time?${params}`
        break
      case 'teams-clicks':
        url = `/company/reports/activities/teams/${id}?${params}`
        break
    }

    return this._http.get(
      environment.api + url,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getExportData(url) {
    return this._http.get(
      environment.api + url,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  updateTeamsGraphSettings(id, payload): Observable<any> {
    return this._http.post(`${EDIT_TEAMS_REPORTS_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getReportDetailsData(id, type, datapoint, date: any = '', area: any = '') {
    let url
    switch(type) {
      case 'joined':
        url = `/company/reports/activities/joined/details/${id}/${datapoint}`
        break
      case 'clicks': 
        url = `/company/reports/activities/clicked/details/${id}/${date}/${datapoint}`
        break
      case 'attended': 
        url = `/company/reports/activities/teams/${id}`
        break
      case 'clubs-joined': 
        url = `/company/reports/clubs/joined/details/${id}/${datapoint}`
        break
      case 'clubs-generated':
        url = `/company/reports/clubs/activities/generated/details/${id}/${datapoint}`
        break
      case 'joined-generated':
        url = `/company/reports/clubs/activities/generated/joined/details/${id}/${datapoint}`
        break
      case 'offers-joined':
        url = `/company/reports/canal-empleo/joined/details/${id}/${area}/${datapoint}`
        break
      case 'offer-clicks':
        url = `/company/reports/canal-empleo/clicked/details/${id}/${area}/${datapoint}`
        break
      case 'cityagenda-clicks':
        url = `/company/reports/city-agenda/clicked/details/${id}/${date}/${datapoint}`
        break
      case 'teams-attended':
        let period = localStorage.getItem('period')
        if(period) {
          url = `/company/reports/activities/teams-msgraph/details/${id}/attended/${date}/${datapoint}?period_selected=${period}`
        } else {
          url = `/company/reports/activities/teams-msgraph/details/${id}/attended/${date}/${datapoint}`
        }
        break
      case 'teams-audio-time':
        url = `/company/reports/activities/teams-msgraph/details/${id}/audio-time/${date}/${datapoint}`
        break
      case 'teams-video-time':
        url = `/company/reports/activities/teams-msgraph/details/${id}/video-time/${date}/${datapoint}`
        break
      case 'teams-clicks':
        url = `/company/reports/activities/teams/details/${id}/${date}/${datapoint}`
        break
      case 'mentor-mentee-associations':
        url = `/company/reports/mentors/associations/details/${id}/${datapoint}`
        break
      case 'mentor-active-conversations':
        url = `/company/reports/mentors/conversations/details/${id}/${datapoint}`
        break
      case 'mentee-mentor-associations':
        url = `/company/reports/mentees/associations/details/${id}/${datapoint}`
        break
      case 'mentee-active-conversations':
        url = `/company/reports/mentees/conversations/details/${id}/${datapoint}`
        break
    }

    return this._http.get(
      environment.api + url,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  fetchManageMemberTypesData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${MANAGE_MEMBER_TYPES_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editProfileFieldSequence(params): Observable<any> {
    return this._http.post(EDIT_MEMBER_TYPE_SEQUENCE_URL,
        params
    ).pipe(map(res => res));
  }

  deleteCustomMemberType(id): Observable<any> {
    return this._http.post(`${DELETE_MEMBER_TYPE_URL}/${id}`, 
        {}
    ).pipe(map(res => res))
  }

  generateCartLink(payload): Observable<any> {
    return this._http.post(GENERATE_MEMBER_TYPE_LINK_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addCustomMemberType(fd): Observable<any> {
    return this._http.post(ADD_MEMBER_TYPE_URL, 
        fd
    ).pipe(map(res => res))
  }

  editCustomMemberType(id, payload): Observable<any> {
    return this._http.post(`${EDIT_MEMBER_TYPE_URL}/${id}`, 
        payload
    ).pipe(map(res => res))
  }

  manageCustomMemberTypePermissions(payload): Observable<any> {
    return this._http.post(SAVE_MEMBER_TYPE_PERMISSIONS_URL, 
        payload
    ).pipe(map(res => res))
  }

  addMemberTypeCustomProfileFields(payload): Observable<any> {
    return this._http.post(ADD_MEMBER_TYPE_FIELD_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateMemberTypeCustomProfileFields(payload): Observable<any> {
    return this._http.post(EDIT_MEMBER_TYPE_FIELD_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteMemberTypeCustomProfileFields(payload): Observable<any> {
    return this._http.post(DELETE_MEMBER_TYPE_FIELD_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCustomProfileFields(id): Observable<any> {
    return this._http.get(`${MEMBER_TYPE_PROFILE_FIELDS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addCompanyCity(payload): Observable<any> {
    return this._http.post(ADD_CITY_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCompanyCity(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_CITY_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteCompanyCity(id): Observable<any> {
    return this._http.post(`${DELETE_CITY_URL}/${id}`,
        {},
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchManageSettingsData(id: number = 0, companyId: number = 0): Observable<any> {
    return this._http.get(`${MANAGE_SETTINGS_DATA_URL}/${id}/${companyId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchSettingsEmailData(id: number = 0, companyId: number = 0, type: string = ''): Observable<any> {
    return this._http.get(`${MANAGE_SETTINGS_EMAIL_DATA_URL}/${id}/${companyId}/${type}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  updateEmail(id, type, payload): Observable<any> {
    return this._http.post(`${EDIT_EMAIL_URL}/${id}/${type}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateMemberEmail(id, type, payload): Observable<any> {
    return this._http.post(`${EDIT_MEMBER_EMAIL_URL}/${id}/${type}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  activateOtherSetting(id, companyId, payload): Observable<any> {
    return this._http.post(
        `${ACTIVATE_OTHER_SETTING_URL}/${id}/${companyId}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  deactivateOtherSetting(id, companyId, payload): Observable<any> {
    return this._http.post(
        `${DEACTIVATE_OTHER_SETTING_URL}/${id}/${companyId}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  uploadNotificationImage(blob, filename): Observable<any> {
    const formData = new FormData();
    const file_name = 'email_' + this.getTimestamp();
    formData.append('filename', file_name + '.jpg')
    formData.append('image', blob, file_name + '.jpg');
    return this._http.post(UPLOAD_EMAIL_IMAGE_URL, formData);
  }

  getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  saveNewMenuButton(payload): Observable<any> {
    return this._http.post(SAVE_NEW_BUTTON_MENU_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  saveNewURLButton(payload): Observable<any> {
    return this._http.post(SAVE_URL_BUTTON_MENU_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateMenuOrder(payload): Observable<any> {
    return this._http.post(EDIT_MENU_ORDER_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editPrivacyPolicyURL(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_PRIVACY_POLICY_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCookiePolicyURL(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_COOKIE_POLICY_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editTermsAndConditionsURL(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_TERMS_AND_CONDITIONS_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateTermsAndConditions(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_TERMS_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  updatePrivatePolicy(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_POLICY_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateCookiePolicy(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_COOKIE_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  activatePrivacyPolicy(id, payload): Observable<any> {
    return this._http.post(
        `${ACTIVATE_POLICY_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  activateCookiePolicy(id, payload): Observable<any> {
    return this._http.post(
        `${ACTIVATE_COOKIE_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  activateTermsAndConditions(id, payload): Observable<any> {
    return this._http.post(
        `${ACTIVATE_TERMS_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateOtherSettingValue(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_OTHER_SETTING_VALUE_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addCompanyLogo(fd) {
    return this._http.post(ADD_COMPANY_LOGO_URL, fd);
  }

  addCompanyBanner(fd) {
    return this._http.post(ADD_COMPANY_BANNER_URL, fd);
  }

  editCompanyLogo( id, logo): Observable<any> {
    let formData = new FormData()

    if (logo) {
        const filename = 'cl_' + this.getTimestamp();
        formData.append('image', logo.image, filename + '.jpg');
    }

    return this._http.post(`${EDIT_COMPANY_LOGO_URL}/${id}`,
        formData
    ).pipe(map(res => res))
  }

  editCompanyPhoto( id, logo): Observable<any> {
    let formData = new FormData()

    if (logo) {
        const filename = 'cl_' + this.getTimestamp();
        formData.append('image', logo.image, filename + '.jpg');
    }

    return this._http.post(`${EDIT_COMPANY_HEADER_IMAGE_URL}/${id}`,
        formData
    ).pipe(map(res => res))
  }

  editCompanyVideo( id, logo): Observable<any> {
    let formData = new FormData()

    if (logo) {
        const filename = 'cl_' + this.getTimestamp();
        formData.append('image', logo.image, filename + '.jpg');
    }

    return this._http.post(`${EDIT_COMPANY_BANNER_IMAGE_URL}/${id}`,
        formData
    ).pipe(map(res => res))
  }

  editCompanyFavicon( id, logo): Observable<any> {
    let formData = new FormData()

    if (logo) {
        const filename = 'cl_' + this.getTimestamp();
        formData.append('image', logo.image, filename + '.jpg');
    }

    return this._http.post(`${EDIT_COMPANY_FAVICON_URL}/${id}`,
        formData
    ).pipe(map(res => res))
  }

  fetchHomeData(id: number = 0, isUESchoolOfLife: boolean = false, campus: string = '', userId: number = 0): Observable<any> {
    let url = `${HOME_DATA_URL}/${id}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1&campus=${campus}`
    } else {
      if(campus) {
        url += `?campus=${campus}`
      }
    }
    if(userId > 0) {
      url += url?.indexOf('?') >= 0 ? `&userid=${userId}` : `?userid=${userId}`;
    }
    
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchHomeCoursesTutorsTestimonialsData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${HOME_COURSES_TUTORS_TESTIMONIALS_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers
    }).pipe(map(res => res));
  }

  fetchHomePlansCoursesData(id: number = 0, userId: number = 0, isUESchoolOfLife: boolean = false): Observable<any> {
    let url = `${HOME_PLANS_COURSES_DATA_URL}/${id}/${userId}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1`
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getBusinessCategories(): Observable<any> {
    return this._http.get(AS_SECTORS_URL,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCompanyBusinessCategories(id): Observable<any> {
    return this._http.get(`${SECTORS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateHomeVideoSettings(params): Observable<any> {
    return this._http.put(EDIT_HOME_VIDEO_SETTINGS_URL,
        params,
    ).pipe(map(res => res));
  }

  updateHomeModuleSettings(params): Observable<any> {
    return this._http.put(EDIT_HOME_MODULE_SETTINGS_URL,
        params,
    ).pipe(map(res => res));
  }

  getCompanyContracts(id): Observable<any> {
    return this._http.get(`${CONTRACTS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateConditions(params): Observable<any> {
    return this._http.post(EDIT_CONDITIONS_URL,
        params,
    ).pipe(map(res => res));
  }

  getStripeAccounts(companyId){
    return this._http.get(`${STRIPE_ACCOUNTS_URL}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  toggleStripeAccountStatus(companyId, payload){
    return this._http.post(`${UPDATE_STRIPE_ACCOUNT_STATUS_URL}/${companyId}`,
      payload,
      { headers : this.headers }
    ).pipe(map(res => res));
  }

  getOtherStripeWebhooks(id, stripeId): Observable<any> {
    return this._http.get(`${STRIPE_WEBHOOKS_URL}/${id}/${stripeId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  createOtherStripeWebhook(id, stripeId): Observable<any> {
    return this._http.get(`${ADD_STRIPE_WEBHOOK_URL}/${id}/${stripeId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addStripeAccount(companyId, payload){
    return this._http.post(
      `${ADD_STRIPE_ACCOUNT_URL}/${companyId}`,
      payload,
      { headers : this.headers }
    ).pipe(map(res => res));
  }

  editStripeAccount(companyId, payload){
    return this._http.post(`${EDIT_STRIPE_ACCOUNT_URL}/${companyId}`,
      payload,
      { headers : this.headers }
    ).pipe(map(res => res));
  }

  deleteStripeAccount(companyId, payload){
    return this._http.post(`${DELETE_STRIPE_ACCOUNT_URL}/${companyId}`,
      payload,
      { headers : this.headers }
    ).pipe(map(res => res));
  }

  getLeadsQuestions(companyId, userId): Observable<any> {
    return this._http.get(`${LEADS_QUESTIONS_URL}/${companyId}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addLeadsQuestion(payload): Observable<any> {
    return this._http.post(
      CREATE_LEADS_QUESTION_URL,
      payload,
    ).pipe(map(res => res));
  }

  editLeadsQuestion(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_LEADS_QUESTION_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteLeadsQuestion(id): Observable<any> {
    return this._http.delete(
      `${DELETE_LEADS_QUESTION_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  addLeadsQuestionItem(payload): Observable<any> {
    return this._http.post(
      CREATE_LEADS_QUESTION_ITEM_URL,
      payload,
    ).pipe(map(res => res));
  }

  editLeadsQuestionItem(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_LEADS_QUESTION_ITEM_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteLeadsQuestionItem(id): Observable<any> {
    return this._http.delete(
      `${DELETE_LEADS_QUESTION_ITEM_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  addLeadsQuestionMultipleChoice(payload): Observable<any> {
    return this._http.post(
      CREATE_LEADS_QUESTION_MULTIPLE_CHOICE_OPTION_URL,
      payload,
    ).pipe(map(res => res));
  }

  editLeadsQuestionMultipleChoice(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_LEADS_QUESTION_MULTIPLE_CHOICE_OPTION_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteLeadsQuestionMultipleChoice(id): Observable<any> {
    return this._http.delete(
      `${DELETE_LEADS_QUESTION_MULTIPLE_CHOICE_OPTION_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  addLeadsQuestionRule(payload): Observable<any> {
    return this._http.post(
      CREATE_LEADS_QUESTION_RULE_URL,
      payload,
    ).pipe(map(res => res));
  }

  editLeadsQuestionRule(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_LEADS_QUESTION_RULE_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteLeadsQuestionRule(id): Observable<any> {
    return this._http.delete(
      `${DELETE_LEADS_QUESTION_RULE_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  getLeadsLandingPages(companyId, userId): Observable<any> {
    return this._http.get(`${LEADS_LANDING_PAGES_URL}/${companyId}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addLeadsLandingPage(payload): Observable<any> {
    return this._http.post(
      CREATE_LEADS_LANDING_PAGE_URL,
      payload,
    ).pipe(map(res => res));
  }

  editLeadsLandingPage(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_LEADS_LANDING_PAGE_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteLeadsLandingPage(id): Observable<any> {
    return this._http.delete(
      `${DELETE_LEADS_LANDING_PAGE_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  getLeadsLocations(companyId, userId): Observable<any> {
    return this._http.get(`${LEADS_LOCATIONS_URL}/${companyId}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addLeadsLocation(payload): Observable<any> {
    return this._http.post(
      CREATE_LEADS_LOCATION_URL,
      payload,
    ).pipe(map(res => res));
  }

  editLeadsLocation(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_LEADS_LOCATION_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteLeadsLocation(id): Observable<any> {
    return this._http.delete(
      `${DELETE_LEADS_LOCATION_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  getLeadsLandingPageDetails(id, companyId, userId): Observable<any> {
    return this._http.get(`${LEADS_LANDING_PAGE_DETAILS_URL}/${id}/${userId}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editLeadsLandingPageDetails(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_LEADS_LANDING_PAGE_DETAILS_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  getLandingPageBySlug(slug): Observable<any> {
    return this._http.get(`${LEADS_LANDING_PAGE_BY_SLUG_URL}/${slug}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getLandingQuestions(country): Observable<any> {
    return this._http.get(`${QUESTIONS_URL}/${country}`, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getLandingQuestionsById(id): Observable<any> {
    return this._http.get(`${QUESTIONS_BY_ID_URL}/${id}`, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  submitAnswerToQuestions(payload) {
    return this._http.post(
      SUBMIT_QUESTION_ANSWERS_URL,
      payload,
    ).pipe(map(res => res));
  }

  getSubmissions(id, userId, startDate: any = '', endDate: any = ''): Observable<any> {
    let url = `${SUBMISSIONS_URL}/${id}/${userId}`

    if(startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`
    }
    return this._http.get(url,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getAllSubmissions(id): Observable<any> { 
    return this._http.get(`${EXPORT_ALL_SUBMISSIONS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getResponse(id, userId, questionId, questionAnswerId): Observable<any> {
    return this._http.get(`${RESPONSE_URL}/${id}/${userId}/${questionId}/${questionAnswerId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editQuestionStyles(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_QUESTION_STYLES_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  getVideosCTAs(companyId, userId): Observable<any> {
    return this._http.get(`${VIDEOS_CTAS_URL}/${companyId}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getVideosCTAsDetails(id, companyId, userId): Observable<any> {
    return this._http.get(`${VIDEOS_CTAS_DETAILS_URL}/${id}/${companyId}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addVideosCTAs(payload): Observable<any> {
    return this._http.post(
      ADD_VIDEOS_CTAS_URL,
      payload,
    ).pipe(map(res => res));
  }

  editVideosCTAs(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_VIDEOS_CTAS_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  editVideosCTAsDetails(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_VIDEOS_CTAS_DETAILS_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteVideosCTAs(id): Observable<any> {
    return this._http.delete(
      `${DELETE_VIDEOS_CTAS_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  getVideoCTABySlug(slug): Observable<any> {
    return this._http.get(`${VIDEO_CTA_BY_SLUG_URL}/${slug}`, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editQuestionOtherImages(id, payload): Observable<any> {
    return this._http.post(
      `${EDIT_QUESTION_OTHER_IMAGES_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  getCreditsSettings(id): Observable<any> {
    return this._http.get(`${EDIT_CREDITS_SETTINGS_URL}/${id}`, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCreditsSettings(payload): Observable<any> {
    return this._http.post(EDIT_CREDITS_SETTINGS_URL,
      payload,
    ).pipe(map(res => res));
  }
  
  editVideosCTAsCTASettings(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_VIDEOS_CTAS_CTA_SETTINGS_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  fetchTikTokData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${TIKTOK_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  logVideoCTAClick(payload): Observable<any> {
    return this._http.post(LOG_VIDEO_CTA_CLICK_URL,
      payload,
    ).pipe(map(res => res));
  }

  fetchQuestionnairesTrackingData(id: number = 0): Observable<any> {
    return this._http.get(`${TIKTOK_QUESTIONS_DATA_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchLandingPagesTrackingData(id: number = 0): Observable<any> {
    return this._http.get(`${TIKTOK_LANDING_PAGES_DATA_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchVideosCTAsTrackingData(id: number = 0): Observable<any> {
    return this._http.get(`${TIKTOK_VIDEOS_CTAS_DATA_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  enableLandingTemplate(id, payload): Observable<any> {
    return this._http.post(`${ENABLE_LANDING_TEMPLATE_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  disableLandingTemplate(id, payload): Observable<any> {
    return this._http.post(`${DISABLE_LANDING_TEMPLATE_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  enablePredefinedHomeTemplate(id, payload): Observable<any> {
    return this._http.post(`${ENABLE_PREDEFINED_TEMPLATE_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  disablePredefinedHomeTemplate(id, payload): Observable<any> {
    return this._http.post(`${DISABLE_PREDEFINED_TEMPLATE_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getLandingTemplates(id): Observable<any> {
    return this._http.get(`${COMPANY_LANDING_TEMPLATE_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getLandingTemplate(id, companyId): Observable<any> {
    return this._http.get(`${COMPANY_LANDING_TEMPLATE_DETAILS_URL}/${id}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCompanyTemplate(templateId, companyId, payload): Observable<any> {
    let url = `${EDIT_COMPANY_TEMPLATE_URL}/${companyId}/${templateId}`

    return this._http.post(
        url,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchInvoicesData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${INVOICES_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  viewInvoice(id): Observable<any> {
    return this._http.post(`${INVOICE_URL}/${id}`, 
        {}
    ).pipe(map(res => res))
  }

  resendInvoice(id): Observable<any> {
    return this._http.post(`${RESEND_INVOICE_URL}/${id}`, 
        {}
    ).pipe(map(res => res))
  }

  getCoupons(id): Observable<any> {
    return this._http.get(`${COUPONS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addCoupon(payload): Observable<any> {
    return this._http.post(ADD_COUPON_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCoupon(id, payload): Observable<any> {
    return this._http.post(
        `${EDIT_COUPON_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteCoupon(code, id): Observable<any> {
    return this._http.post(
        `${DELETE_COUPON_URL}/${code}/${id}`,
        {},
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getChannels(id, userId): Observable<any> {
    return this._http.get(`${COMMUNITY_CHANNELS_URL}/${id}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addChannel(payload): Observable<any> {
    return this._http.post(ADD_COMMUNITY_CHANNEL_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editChannel(id, payload): Observable<any> {
    return this._http.put(
        `${EDIT_COMMUNITY_CHANNEL_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteChannel(id): Observable<any> {
    return this._http.delete(
        `${DELETE_COMMUNITY_CHANNEL_URL}/${id}`,
        {}
    ).pipe(map(res => res));
  }

  fetchAdditionalPropertiesAdmin(companyId): Observable<any> {
    return this._http.get(`${ADDITIONAL_PROPERTIES_DATA}/${companyId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getAssessments(companyId, userId): Observable<any> {
    return this._http.get(`${ASSESSMENTS_URL}/${companyId}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addAssessment(payload): Observable<any> {
    return this._http.post(
      CREATE_ASSESSMENT_URL,
      payload,
    ).pipe(map(res => res));
  }

  editAssessment(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_ASSESSMENT_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteAssessment(id): Observable<any> {
    return this._http.delete(
      `${DELETE_ASSESSMENT_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  addAssessmentItem(payload): Observable<any> {
    return this._http.post(
      CREATE_ASSESSMENT_DETAIL_URL,
      payload,
    ).pipe(map(res => res));
  }

  editAssessmentItem(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_ASSESSMENT_DETAIL_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteAssessmentItem(id): Observable<any> {
    return this._http.delete(
      `${DELETE_ASSESSMENT_DETAIL_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  addAssessmentMultipleChoice(payload): Observable<any> {
    return this._http.post(
      CREATE_ASSESSMENT_MULTIPLE_CHOICE_OPTION_URL,
      payload,
    ).pipe(map(res => res));
  }

  editAssessmentMultipleChoice(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_ASSESSMENT_MULTIPLE_CHOICE_OPTION_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteAssessmentMultipleChoice(id): Observable<any> {
    return this._http.delete(
      `${DELETE_ASSESSMENT_MULTIPLE_CHOICE_OPTION_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  fetchSignupData(id): Observable<any> {
    return this._http.get(`${SIGNUP_DATA_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addStartup(formData): Observable<any> {
    return this._http.post(ADD_STARTUP_URL,
      formData
    ).pipe(map(res => res))
  }

  getStartups(id): Observable<any> {
    return this._http.get(
      `${GET_STARTUPS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getKeapHooks(id: any): Observable<any> {
    return this._http.get(`${KEAP_HOOKS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editHookStatus(id: any, params): Observable<any> {
    return this._http.put(
        `${EDIT_KEAP_HOOK_STATUS_URL}/${id}`,
        params
    ).pipe(map(res => res));
  }

  addHook(params): Observable<any> {
    return this._http.post(ADD_KEAP_HOOK_URL,
        params
    ).pipe(map(res => res));
  }

  editHook(params): Observable<any> {
    return this._http.put(EDIT_KEAP_HOOK_URL,
        params
    ).pipe(map(res => res));
  }

  deleteHook(id: any): Observable<any> {
    return this._http.delete(`${DELETE_KEAP_HOOK_URL}/${id}`,
        {}
    ).pipe(map(res => res));
  }

  getKeapTags(id): Observable<any> {
    return this._http.get(`${KEAP_TAGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getKeapHookEventTypes(): Observable<any> {
    return this._http.get(KEAP_HOOK_EVENT_TYPES_URL,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getKeapSettings(id: any): Observable<any> {
    return this._http.get(`${KEAP_SETTINGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editKeapSettings(payload): Observable<any> {
    return this._http.post(EDIT_KEAP_SETTINGS_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getHotmartSettings(id): Observable<any> {
    return this._http.get(`${HOTMART_SETTINGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getKeapHookLogs(id: any): Observable<any> {
    return this._http.get(`${KEAP_HOOK_LOGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getKeapIntegrations(id: any): Observable<any> {
    return this._http.get(`${KEAP_INTEGRATIONS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addIntegration(params): Observable<any> {
    return this._http.post(ADD_KEAP_INTEGRATION_URL,
        params
    ).pipe(map(res => res));
  }

  editIntegration(params): Observable<any> {
    return this._http.put(EDIT_KEAP_INTEGRATION_URL,
        params
    ).pipe(map(res => res));
  }

  deleteIntegration(id: any): Observable<any> {
    return this._http.delete(
        `${DELETE_KEAP_INTEGRATION_URL}/${id}`,
        {}
    ).pipe(map(res => res));
  }

  editIntegrationStatus(id: any, params): Observable<any> {
    return this._http.put(`${EDIT_INTEGRATION_STATUS_URL}/${id}`,
        params
    ).pipe(map(res => res));
  }

  fetchSupportTicketsData(id: any, userId: any): Observable<any> {
    return this._http.get(`${SUPPORT_TICKETS_DATA_URL}/${id}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  createTicket( subject, description, categoryId, priorityId, companyId, userId, file): Observable<any> {
    let formData = new FormData();

    formData.append( 'subject', subject );
    formData.append( 'description', description );
    formData.append( 'category_id', categoryId );
    formData.append( 'priority_id', priorityId );
    formData.append( 'company_id', companyId );
    formData.append( 'created_by', userId );

    if (file) {
        const filename = 't_' + userId + '_' + this.getTimestamp();
        let fileExtension = file.name.split('.').pop();
        formData.append('file', file, filename + "." + fileExtension);
        formData.append( 'filename', filename + "." + fileExtension );
    }

    return this._http.post(SUBMIT_SUPPORT_TICKET_URL,
        formData
    ).pipe(map(res => res));
  }

  createReply( ticketId, status, companyId, userId, message, file): Observable<any> {
    let formData = new FormData();

    formData.append( 'ticket_id', ticketId );
    formData.append( 'status', status );
    formData.append( 'company_id', companyId );
    formData.append( 'admin', '1' );
    formData.append( 'created_by', userId );
    formData.append( 'message', message );

    if (file) {
        const filename = 't_' + userId + '_' + this.getTimestamp();
        let fileExtension = file.name.split('.').pop();
        formData.append('file', file, filename + "." + fileExtension);
        formData.append( 'filename', filename + "." + fileExtension );
    }

    return this._http.post(CREATE_TICKET_REPLY_URL,
        formData
    ).pipe(map(res => res));
  }

  allFeaturesList() {
    return this._http.get(`${ALL_FEATURES_URL}`, {
      ...withCache(),
      headers: this.headers,
    });
  }

  addCustomer(params): Observable<any> {
    return this._http.post(ADD_CUSTOMER_URL,
        params
    ).pipe(map(res => res));
  }

  addCustomerFeatureMapping(params): Observable<any> {
    return this._http.post(ADD_CUSTOMER_FEATURE_MAPPING_URL,
        params
    ).pipe(map(res => res));
  }

  addCustomerLogo( id, logo, filename): Observable<any> {
    let formData = new FormData()

    if (logo) {
        formData.append('image', logo.image, filename);
    }

    return this._http.post(`${EDIT_COMPANY_LOGO_URL}/${id}`,
        formData
    ).pipe(map(res => res))
  }

  addCustomerHeaderLogo( id, logo, filename): Observable<any> {
    let formData = new FormData()

    if (logo) {
        formData.append('image', logo.image, filename);
    }

    return this._http.post(`${EDIT_COMPANY_HEADER_IMAGE_URL}/${id}`,
        formData
    ).pipe(map(res => res))
  }

  addCustomerBannerImage( id, logo, filename): Observable<any> {
    let formData = new FormData()

    if (logo) {
        formData.append('image', logo.image, filename);
    }

    return this._http.post(`${EDIT_COMPANY_BANNER_IMAGE_URL}/${id}`,
        formData
    ).pipe(map(res => res))
  }

  addCustomerSettings(params): Observable<any> {
    return this._http.post(ADD_CUSTOMER_SETTINGS_URL,
        params
    ).pipe(map(res => res));
  }

  deactivateCustomer(id: any): Observable<any> {
    return this._http.put(`${DEACTIVATE_CUSTOMER_URL}/${id}`,
      {}
    ).pipe(map(res => res));
  }

  editCustomerSiteDetails(id: any, params): Observable<any> {
    return this._http.put(`${EDIT_CUSTOMER_SITE_DETAILS_URL}/${id}`,
      params
    ).pipe(map(res => res));
  }
  
  getFilterSettings(id: any, featureId: any): Observable<any> {
    return this._http.get(`${FILTER_SETTINGS_URL}/${id}/${featureId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editFilterSettings(params): Observable<any> {
    return this._http.post(`${EDIT_FILTER_SETTINGS_URL}`,
        params
    ).pipe(map(res => res));
  }

  getHomePersonalizeSettings(id) {
    return this._http.get(`${HOME_PERSONALIZE_SETTINGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  activateHomeTemplate(params): Observable<any> {
    return this._http.put(`${ACTIVATE_HOME_TEMPLATE_URL}`,
        params
    ).pipe(map(res => res));
  }

  editHomeTemplateSections(params): Observable<any> {
    return this._http.post(`${EDIT_HOME_TEMPLATE_SECTIONS_URL}`,
        params
    ).pipe(map(res => res));
  }

  getHomeSectionsData(id, userId, pageNo, isUESchoolOfLife: boolean = false): Observable<any> {
    let url = `${HOME_SECTIONS_DATA_URL}/${id}/${userId}/${pageNo}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1`
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  logMessage(companyId, userId, message, mode: string = 'log') {
    if(mode == 'log') {
      this._logger.log(message, {
        company_id: companyId,
        user_id: userId,
      });
    } else if(mode == 'error') {
      this._logger.error(message, {
        company_id: companyId,
        user_id: userId,
      });
    } else if(mode == 'warn') {
      this._logger.warn(message, {
        company_id: companyId,
        user_id: userId,
      });
    }
  }

  getDataSourceFields(id): Observable<any> {
    return this._http.get(`${DATA_SOURCE_FIELDS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  queryDatabase(payload): Observable<any> {
    return this._http.post(QUERY_DATABASE_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchComments(id, userId, mode, objectId): Observable<any> {
    return this._http.get(
      `${MODULE_COMMENTS_URL}/${id}/${userId}/${mode}/${objectId}`,
      { headers: this.headers }
    )
    .pipe(map(res => res));
  }

  addModuleComment(payload): Observable<any> {
    return this._http.post(ADD_MODULE_COMMENT_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editModuleComment(payload): Observable<any> {
    return this._http.put(EDIT_MODULE_COMMENT_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteModuleComment(id): Observable<any> {
    return this._http.delete(
        `${DELETE_MODULE_COMMENT_URL}/${id}`,
        {},
    ).pipe(map(res => res));
  }

  reactToModuleComment(payload): Observable<any> {
    return this._http.post(REACT_MODULE_COMMENT_URL, payload, { 
      headers: this.headers }
    ).pipe(map(res => res));
  }

  editModuleFilterSettings(params): Observable<any> {
    return this._http.post(`${EDIT_MODULE_FILTER_SETTINGS_URL}`,
        params
    ).pipe(map(res => res));
  }

  getModuleFilterSettings(id, featureId): Observable<any> {
    return this._http
      .get(`${MODULE_FILTER_SETTINGS_URL}/${id}/${featureId}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCompanyByHost(): any {
    let companyId = 0;
    let host = window.location.host;

    let customer =
      this.customers &&
      this.customers.find(
        (c) => c.url == host || c.url == environment.company
      );
    if (customer) {
      companyId = customer.id
    }

    return companyId;
  }

  saveHomeText(payload): Observable<any> {
    return this._http.post(EDIT_HOME_TEXT_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  isCursoGeniusTestimonials(customer): boolean {
    let result = false;

    if(customer.id == 52 && (customer.testimonials_url == window.location.host || customer.testimonials_url == environment.company)) {
      result = true;
    }

    return result;
  }

  editNavigationSettings(params): Observable<any> {
    return this._http.put(EDIT_NAVIGATION_SETTINGS_URL,
      params,
    ).pipe(map(res => res));
  }

  editHomeStatus(payload): Observable<any> {
    return this._http.put(EDIT_HOME_STATUS_URL,
      payload
    ).pipe(map(res => res));
  }


  getCompanyProfessionals(id): Observable<any> {
    return this._http
      .get(`${COMPANY_PROFESSIONALS_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCompanyProfessionalCategories(id): Observable<any> {
    return this._http
      .get(`${COMPANY_PROFESSIONALS_URL}/categories/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCompanyProfessionalSubCategories(id): Observable<any> {
    return this._http
      .get(`${COMPANY_PROFESSIONALS_URL}/subcategories/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }
  
  getCompanyTestimonial(id): Observable<any> {
    return this._http
      .get(`${RANDOM_TESTIMONIAL_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCompanyProfessionalFreeServices(id): Observable<any> {
    return this._http
      .get(`${COMPANY_PROFESSIONALS_URL}/free_services/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCompanyInstagramFeed(id): Observable<any> {
    return this._http
      .get(`${COMPANY_PROFESSIONALS_URL}/instagram_feed/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCompanyBannerTitle(id): Observable<any> {
    return this._http
      .get(`${COMPANY_PROFESSIONALS_URL}/banner_title/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getCompanyProducts(id): Observable<any> {
    return this._http
      .get(`${COMPANY_PROFESSIONALS_URL}/products/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }
}
