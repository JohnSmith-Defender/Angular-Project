import { Injectable, VERSION } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    CART_ASSIGN_COURSES_URL,
    CART_USER_SIGNUP_URL,
    GUID_IDEMPOTENCY_URL,
    SUBSCRIBE_MEMBER_URL,
    SUBSCRIBE_TRIAL_URL,
    UPDATE_SUBSCRIPTION_URL,
    VALIDATE_COUPON_URL
} from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  validateProductCoupon(couponCode, companyId, planId): Observable<any> {
    return this._http.post(`${VALIDATE_COUPON_URL}/${couponCode}/${companyId}/${planId}`, {}).pipe(map(result => { return result; }));
  }

  cartUserSignup(formData): Observable<any> {
    return this._http.post(`${CART_USER_SIGNUP_URL}`, formData).pipe(map(result => { return result; }));
  }

  subscribeTrialPeriod(id, type, plan_id, reg_plan_id, payload): Observable<any> {
    return this._http.post(`${SUBSCRIBE_TRIAL_URL}/${id}/${type}/${plan_id}/${reg_plan_id}`, payload).pipe(map(res => res));
  }

  updateCustomMemberTypeSubscription(id, type, payload): Observable<any> {
    return this._http.post(`${SUBSCRIBE_MEMBER_URL}/${id}/${type}`,payload).pipe(map(res => res));
  }

  updateGuidIdempotency(payload): Observable<any> {
    return this._http.post(GUID_IDEMPOTENCY_URL,payload).pipe(map(res => res));
  }

  updateCustomerSubscription(payload): Observable<any> {
    return this._http.post(UPDATE_SUBSCRIPTION_URL, payload).pipe(map(res => res));
  }

  assignCoursesFromCart(payload): Observable<any> {
    return this._http.post(CART_ASSIGN_COURSES_URL, payload, { headers: this.headers }).pipe(map(res => res))
  }
}