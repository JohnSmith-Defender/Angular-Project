import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalService, TokenStorageService } from "@share/services";
import {
  OTHER_SETTINGS_URL,
  USER_URL,
  USER_ROLE_URL,
  DASHBOARD_DETAILS_URL,
  LANGUAGES_URL,
  MEMBER_TYPES_URL,
  FEATURES_MAPPING_URL,
  MENU_ORDERING_URL,
  FEATURES_URL,
  CUSTOM_MEMBER_TYPE_PERMISSIONS_URL,
  SUBFEATURES_URL,
  SUBFEATURES_MAPPING_URL,
  MEMBERS_ONLY_SETTINGS_URL,
  COURSE_SUBSCRIPTIONS_URL,
  COURSE_TUTORS_URL,
  COURSE_EXCEPION_USERS_URL,
  COURSES_URL,
} from "@lib/api-constants";
import { environment } from "@env/environment";

@Injectable({
  providedIn: "root",
})
export class MenuService {
  menus$ = new BehaviorSubject<any[]>(
    (this._localService.getLocalStorage(environment.lsmenus)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsmenus))
      : [])
  );

  private headers: HttpHeaders;

  constructor(
    private _http: HttpClient,
    private _localService: LocalService,
    private _tokenStorageService: TokenStorageService
  ) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  get menus(): any[] {
    return this.menus$.getValue();
  }

  getMenuOrder(id): Observable<any> {
    return this._http
      .get(`${MENU_ORDERING_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  getMinCombinedMenuPrefetch(companyId, userId, featureId) {
    let other_settings = this._http.get(`${OTHER_SETTINGS_URL}/${companyId}`);
    let CompanyUser = this._http.get(`${USER_URL}/${userId}`);
    let role = this._http.get(`${USER_ROLE_URL}/${userId}`);
    let dashboard_details = this._http.get(
      `${DASHBOARD_DETAILS_URL}/${companyId}`
    );
    let languages = this._http.get(`${LANGUAGES_URL}/${companyId}`);
    let member_types = this._http.get(`${MEMBER_TYPES_URL}/${companyId}`);
    let subfeatures = this._http.get(
      `${FEATURES_MAPPING_URL}/${companyId}/${featureId}`
    );

    return forkJoin([
      other_settings,
      CompanyUser,
      role,
      dashboard_details,
      languages,
      member_types,
      subfeatures,
    ]);
  }

  getCombinedCoursesTutorsMenuPrefetch(
    companyId,
    userId,
    coursesFeatureId,
    tutorsFeatureId
  ) {
    let other_settings = this._http.get(`${OTHER_SETTINGS_URL}/${companyId}`);
    let CompanyUser = this._http.get(`${USER_URL}/${userId}`);
    let role = this._http.get(`${USER_ROLE_URL}/${userId}`);
    let dashboard_details = this._http.get(
      `${DASHBOARD_DETAILS_URL}/${companyId}`
    );
    let languages = this._http.get(`${LANGUAGES_URL}/${companyId}`);
    let member_types = this._http.get(`${MEMBER_TYPES_URL}/${companyId}`);
    let courses_subfeatures = this._http.get(
      `${FEATURES_MAPPING_URL}/${companyId}/${coursesFeatureId}`
    );
    let tutors_subfeatures = this._http.get(
      `${FEATURES_MAPPING_URL}/${companyId}/${tutorsFeatureId}`
    );

    return forkJoin([
      other_settings,
      CompanyUser,
      role,
      dashboard_details,
      languages,
      member_types,
      courses_subfeatures,
      tutors_subfeatures,
    ]);
  }

  getMinCombinedMenuItemsPrefetch(
    domain,
    companyId,
    memberTypeId,
    tutorsFeatureId,
    hideTutorsMenuOptionId
  ) {
    let payload = {
      companyId: companyId,
      featureId: tutorsFeatureId,
      subfeatureId: hideTutorsMenuOptionId,
    };

    let features = this._http.get(`${FEATURES_URL}/${domain}`);
    let subfeatures = this._http.get(
      `${MEMBERS_ONLY_SETTINGS_URL}/${companyId}`
    );
    let permissions = this._http.get(
      `${CUSTOM_MEMBER_TYPE_PERMISSIONS_URL}/${memberTypeId}/${companyId}`
    );
    let active = this._http.post(`${SUBFEATURES_MAPPING_URL}`, payload);

    return forkJoin([features, subfeatures, permissions, active]);
  }

  getCombinedCourseMenuItemsPrefetch(
    domain,
    companyId,
    memberTypeId,
    tutorsFeatureId,
    hideTutorsMenuOptionId,
    coursesFeatureId,
    userId
  ) {
    let payload = {
      companyId: companyId,
      featureId: tutorsFeatureId,
      subfeatureId: hideTutorsMenuOptionId,
    };
    let features = this._http.get(`${FEATURES_URL}/${domain}`);
    let subfeatures = this._http.get(
      `${MEMBERS_ONLY_SETTINGS_URL}/${companyId}`
    );
    let plan_subfeatures = this._http.get(
      `${SUBFEATURES_URL}/1/${companyId}`
    );
    let permissions = this._http.get(
      `${CUSTOM_MEMBER_TYPE_PERMISSIONS_URL}/${memberTypeId}/${companyId}`
    );
    let active = this._http.post(`${SUBFEATURES_MAPPING_URL}`, payload);
    let course_subfeatures = this._http.get(
      `${SUBFEATURES_URL}/${coursesFeatureId}/${companyId}`
    );
    let course_subscriptions = this._http.get(
      `${COURSE_SUBSCRIPTIONS_URL}/${userId}`
    );
    let course_tutors = this._http.get(`${COURSE_TUTORS_URL}/${userId}`);
    let company_course_exception_user = this._http.get(
      `${COURSE_EXCEPION_USERS_URL}/${userId}`
    );
    let courses = this._http.get(`${COURSES_URL}/${companyId}`);

    return forkJoin([
      features,
      subfeatures,
      permissions,
      active,
      course_subfeatures,
      course_subscriptions,
      course_tutors,
      company_course_exception_user,
      courses,
      plan_subfeatures,
    ]);
  }

  updateMenu(menus: any[] = []) {
    this._localService.setLocalStorage(
      environment.lsmenus,
      JSON.stringify(menus)
    );
    this.menus$.next(menus);
  }
}
