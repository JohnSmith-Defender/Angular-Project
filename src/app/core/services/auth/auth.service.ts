import { Injectable } from "@angular/core";
import { storage } from "src/app/core/utils/storage/storage.utils";
import { BehaviorSubject, Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalService, TokenStorageService } from "@share/services";
import { PushNotificationService } from "../notifications/push-notification.service";
import { environment } from "@env/environment";
import { User } from "@lib/interfaces";
import {
  CHECK_EXPIRED_URL,
  CHECK_MEMBER_TYPES_URL,
  CHECK_OTHER_MEMBER_TYPES_URL,
  LOGIN_URL,
  FORGOT_PASSWORD_URL,
  CHANGE_PASSWORD_URL,
  SIGNUP_FREE_URL,
  SEND_EMAIL_CONFIRMATION_URL,
  SELECT_PLAN_EMAIL_URL,
  EMAIL_VERIFICATION_URL,
  SEND_EMAIL_WELCOME_URL,
  UE_TEST_LOGIN_URL,
} from "@lib/api-constants";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  isAuthenticated$ = new BehaviorSubject<boolean>(
    !!storage.getItem("appSession")
  );

  private headers: HttpHeaders;

  constructor(
    private _http: HttpClient,
    private _localService: LocalService,
    private _tokenStorageService: TokenStorageService,
    private _pushNotificationService: PushNotificationService
  ) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticated$.getValue();
  }

  checkLoginMember(companyId, email): Observable<any[]> {
    let expired_member = this._http.get(
      `${CHECK_EXPIRED_URL}/${companyId}/${email}`
    );
    let user_member_types = this._http.get(
      `${CHECK_MEMBER_TYPES_URL}/${companyId}/${email}`
    );
    let expired = this._http.get(
      `${CHECK_OTHER_MEMBER_TYPES_URL}/${companyId}/${email}`
    );

    return forkJoin([expired_member, user_member_types, expired]);
  }

  login(email, password, companyId) {
    return this._http
      .post<any>(`${LOGIN_URL}`, { email, password, company_id: companyId })
      .pipe(
        map((result) => {
          let user: User = {
            id: result.id,
            role: result.role,
            domain: result.domain,
            email: result.email,
            fk_company_id: result.fk_company_id,
            tiny_url: result.tiny_url,
            image: result.image,
            guid: result.guid,
            token: result.token,
            refreshToken: result.refreshToken,
            custom_member_type_id: result.custom_member_type_id,
            accept_conditions: result.accept_conditions == 1 ? true : false,
            created: result.created,
            accepted_conditions: result.accepted_conditions == 1 ? true : false,
            redirect_conditions: false,
          };

          this._localService.setLocalStorage(environment.lsuser, result);
          this._localService.setLocalStorage(environment.lsuserId, result.id);
          this._localService.setLocalStorage(environment.lstoken, result.token);

          let data = result

          let proceed = false
          if(data?.accept_conditions && !data?.accepted_conditions) {
              user.redirect_conditions = true;
              this._localService.setLocalStorage(environment.lsuser, result);
              this._localService.setLocalStorage(environment.lsuserId, result.id);
              this._localService.setLocalStorage(environment.lstoken, result.token);
              this._localService.setLocalStorage(
                environment.lsrefreshtoken,
                result.refreshToken
              );
              this._localService.setLocalStorage(environment.lsemail, result.email);
              this._localService.setLocalStorage(
                environment.lsdomain,
                result.domain
              );
              this._localService.setLocalStorage(
                environment.lscompanyId,
                result.fk_company_id
              );
              this._localService.setLocalStorage(environment.lsguid, result.guid);
              this._localService.setLocalStorage(
                environment.lsuserRole,
                result.role
              );
              if (!this._localService.getLocalStorage(environment.lslang)) {
                this._localService.setLocalStorage(environment.lslang, "es");
              }

              proceed = true;
              return user;
          } else {
            proceed = true;
          }

          if(proceed) {
            storage.setItem("appSession", {
              user: environment.lsuserId,
              token: environment.lstoken,
            });
            this._tokenStorageService.saveToken(result.token);
            this._tokenStorageService.saveRefreshToken(result.refreshToken);
            this._tokenStorageService.saveUser(user);
  
            this.isAuthenticated$.next(true);
            return user;
          }
        })
      );
  }

  ueTestLogin(email, password, mode) {
    return this._http
      .post<any>(`${UE_TEST_LOGIN_URL}`, { 
        username: email, 
        password, 
        mode, 
      })
      .pipe(
        map((result) => {
          return result
        })
      );
  }

  redirectToPlatform() {
    storage.setItem("appSession", {
      user: environment.lsuserId,
      token: environment.lstoken,
    });

    let token = this._localService.getLocalStorage(environment.lstoken);
    let refreshToken = this._localService.getLocalStorage(environment.lsrefreshtoken);
    let user = this._localService.getLocalStorage(environment.lsuser);

    this._tokenStorageService.saveToken(token);
    this._tokenStorageService.saveRefreshToken(refreshToken);
    this._tokenStorageService.saveUser(user);
    this.isAuthenticated$.next(true);

    return user;
  }

  logout(): void {
    storage.removeItem("appSession");
    this._localService.removeLocalStorage(environment.lstoken);
    this._localService.removeLocalStorage(environment.lsrefreshtoken);
    this._localService.removeLocalStorage(environment.lsuser);
    this._localService.removeLocalStorage(environment.lsusercoursecredits);
    this._localService.removeLocalStorage(environment.lsuserId);
    this._localService.removeLocalStorage(environment.lsprofessional);
    this._localService.removeLocalStorage(environment.lsprofessionalsubscription);
    this._pushNotificationService.unsubscribeFromPushNotifications();
    this.isAuthenticated$.next(false);
  }

  resetPassword(email, company_id): Observable<any> {
    let payload = { email, company_id };
    return this._http.post(`${FORGOT_PASSWORD_URL}`, payload).pipe(
      map((result) => {
        return result;
      })
    );
  }

  changePasswordVistingo(password, guid): Observable<any> {
    let payload = { password, guid };
    return this._http.post(`${CHANGE_PASSWORD_URL}`, payload).pipe(
      map((result) => {
        return result;
      })
    );
  }

  userSignupDynamicNoPayment(formData): Observable<any> {
    return this._http.post(`${SIGNUP_FREE_URL}`, formData).pipe(
      map((result) => {
        return result;
      })
    );
  }

  sendConfirmationEmail(payload): Observable<any> {
    return this._http
      .post(`${SEND_EMAIL_CONFIRMATION_URL}`, payload, {
        headers: this.headers,
      })
      .pipe(map((res) => res))
  }

  sendWelcomeEmail(payload): Observable<any> {
    return this._http
      .post(`${SEND_EMAIL_WELCOME_URL}`, payload, {
        headers: this.headers,
      })
      .pipe(map((res) => res))
  }

  selectPlanEmail(id, companyId): Observable<any> {
    return this._http
      .post(
        `${SELECT_PLAN_EMAIL_URL}/${id}/${companyId}`,
        {},
        { headers: this.headers }
      )
      .pipe(map((res) => res));
  }

  emailVerification(guid): Observable<any> {
    return this._http.get(`${EMAIL_VERIFICATION_URL}/${guid}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }
}
