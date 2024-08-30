import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ACCOUNT_RECHARGE_DATA_URL, ACCOUNT_RECHARGE_URL, EDIT_CALLER_BALANCE_URL, EDIT_CHAT_SENDER_BALANCE_URL, EDIT_MINIMUM_BALANCE_URL, EDIT_PAYPAL_PAYMENT_URL, EDIT_STRIPE_PAYMENT_URL, EDIT_VIDEO_CALLER_BALANCE_URL, MINIMUM_BALANCE_URL, NOTIFICATION_SUBSCRIPTION_URL, NOTIFY_CHAT_PROFESSIONAL_PUSHER_URL, NOTIFY_PROFESSIONAL_PUSHER_URL, NOTIFY_VIDEO_CALL_PROFESSIONAL_PUSHER_URL, PROFESSIONALS_DATA_URL, VALIDATE_CHAT_PASSCODE_URL, VALIDATE_VIDEO_CALL_PASSCODE_URL, VALIDATE_VOICE_CALL_PASSCODE_URL, VOICE_CALL_URL, PROFESSIONAL_CATEGORIES_URL, PROFESSIONALS_HOME_DATA_URL, PROFESSIONAL_DATA_URL, ADD_PROFESSIONAL_REVIEW_URL, FOLLOW_PROFESSIONAL_URL } from "@lib/api-constants";

@Injectable({
  providedIn: "root",
})
export class ProfessionalsService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  notifyProfessional(payload): Observable<any> {
    return this._http.post(NOTIFY_PROFESSIONAL_PUSHER_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  voiceCall(payload): Observable<any> {
    return this._http.post(VOICE_CALL_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  validateVoiceCallPasscode(payload): Observable<any> {
    return this._http.post(VALIDATE_VOICE_CALL_PASSCODE_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getMinimumBalance(id): Observable<any> {
    return this._http.get(`${MINIMUM_BALANCE_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  updateMinimumBalance(params): Observable<any> {
    return this._http.post(EDIT_MINIMUM_BALANCE_URL,
        params,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getProfessionalsData(id, userId): Observable<any> {
    return this._http.get(`${PROFESSIONALS_DATA_URL}/${id}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  editCallerBalance(params): Observable<any> {
    return this._http.post(EDIT_CALLER_BALANCE_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  accountRecharge(params): Observable<any> {
    return this._http.post(ACCOUNT_RECHARGE_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getAccountRechargeData(id): Observable<any> {
    return this._http.get(`${ACCOUNT_RECHARGE_DATA_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  editStripePayment(params): Observable<any> {
    return this._http.post(EDIT_STRIPE_PAYMENT_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editPayPalPayment(params): Observable<any> {
    return this._http.post(EDIT_PAYPAL_PAYMENT_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  notifyVideoCallProfessional(payload): Observable<any> {
    return this._http.post(NOTIFY_VIDEO_CALL_PROFESSIONAL_PUSHER_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  validateVideoCallPasscode(payload): Observable<any> {
    return this._http.post(VALIDATE_VIDEO_CALL_PASSCODE_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editVideoCallerBalance(params): Observable<any> {
    return this._http.post(EDIT_VIDEO_CALLER_BALANCE_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getProfessionalCategories(): Observable<any> {
    return this._http.get(`${PROFESSIONAL_CATEGORIES_URL}`).pipe(map(res => res));
  }
  
  notifyChatProfessional(payload): Observable<any> {
    return this._http.post(NOTIFY_CHAT_PROFESSIONAL_PUSHER_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editChatSenderBalance(params): Observable<any> {
    return this._http.post(EDIT_CHAT_SENDER_BALANCE_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  validateChatPasscode(payload): Observable<any> {
    return this._http.post(VALIDATE_CHAT_PASSCODE_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  notificationSubscription(params): Observable<any> {
    return this._http.post(NOTIFICATION_SUBSCRIPTION_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getProfessionalsHomeData(id): Observable<any> {
    return this._http.get(`${PROFESSIONALS_HOME_DATA_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getProfessionalData(id, userId): Observable<any> {
    return this._http.get(`${PROFESSIONAL_DATA_URL}/${id}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  addReview(params): Observable<any> {
    return this._http.post(ADD_PROFESSIONAL_REVIEW_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  followProfessional(params): Observable<any> {
    return this._http.post(FOLLOW_PROFESSIONAL_URL,
      params,
      { headers: this.headers }
    ).pipe(map(res => res));
  }
}