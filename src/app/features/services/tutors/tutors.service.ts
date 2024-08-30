import { Injectable } from "@angular/core";
import { Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  ADD_CREDIT_PACKAGE_URL,
  ADD_FEEDBACK_URL,
  ADD_NOTES_URL,
  ADD_STRIPE_CONNECT_URL,
  ADD_TUTOR_BOOKING_URL,
  ADD_TUTOR_PACKAGE_URL,
  ADD_TUTOR_RATING_URL,
  ADD_TUTOR_TYPE_URL,
  ASK_TUTOR_QUESTION_URL,
  ASSIGN_TUTOR_COURSES_URL,
  ASSIGN_TUTOR_COURSE_URL,
  BOOKINGS_HISTORY_URL,
  BOOKING_CONFIRMATION_EMAIL_URL,
  BOOKING_HISTORY_URL,
  BOOKING_NOTES_URL,
  BULK_TRANSFER_COMMISSION_IMPROVED_URL,
  BULK_TRANSFER_COMMISSION_URL,
  CALENDLY_EVENT_URL,
  CANCEL_BOOKING_URL,
  COMMISSION_PERCENTAGE_URL,
  COMMISSION_PER_HOUR_URL,
  COURSES_URL,
  COURSE_CATEGORIES_URL,
  COURSE_CATEGORY_ACCESS_URL,
  COURSE_CATEGORY_MAPPING_URL,
  COURSE_EXCEPION_USERS_URL,
  COURSE_SUBSCRIPTIONS_URL,
  COURSE_TUTOR_TYPES_URL,
  CREDIT_PACKAGES_URL,
  DELETE_BOOKING_URL,
  DELETE_COMMISSION_URL,
  DELETE_CREDIT_PACKAGE_URL,
  DELETE_TUTOR_PACKAGE_URL,
  DELETE_TUTOR_TYPE_URL,
  DURATION_UNITS_URL,
  EDIT_ASSIGNED_TUTOR_URL,
  EDIT_BOOKING_STATUS_URL,
  EDIT_CREDIT_PACKAGE_STATUS_URL,
  EDIT_CREDIT_PACKAGE_URL,
  EDIT_TUTOR_PACKAGE_STATUS_URL,
  EDIT_TUTOR_PACKAGE_URL,
  EDIT_TUTOR_TYPE_URL,
  EDIT_TUTOR_URL,
  FEATURES_MAPPING_URL,
  GET_CALENDLY_ACCOUNT_EVENTS_LIST,
  GET_CALENDLY_ACCOUNT_ORGANIZATION_URI,
  MEMBER_TYPES_URL,
  OTHER_SETTINGS_URL,
  SAVE_COMMISSION_PERCENTAGE_URL,
  SAVE_COMMISSION_PER_HOUR_URL,
  STRIPE_ACCOUNT_IDS_URL,
  STRIPE_CONNECT_ACCOUNT_STATUS_URL,
  STRIPE_LOGIN_URL,
  STRIPE_TRANSFERS_URL,
  SYNC_CALENDLY_EVENT_PLATFORM_URL,
  TRANSFER_COMMISSION_URL,
  TUTORS_COMBINED_URL,
  TUTORS_URL,
  TUTOR_ACCOUNT_IDS_URL,
  TUTOR_COMMISSIONS_URL,
  TUTOR_COURSES_ACCESS_URL,
  TUTOR_COURSES_URL,
  TUTOR_DETAILS_URL,
  TUTOR_PACKAGES_URL,
  TUTOR_PER_HOUR_RATE,
  TUTOR_TYPES_URL,
  TUTOR_URL,
  UPDATE_CALENDLY_URL,
  UPDATE_TRANSFER_QUEUE_URL,
  USER_COURSES_URL,
  USER_COURSE_CREDITS_URL,
  USER_ROLE_URL,
  USER_URL,
} from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class TutorsService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }



  getTutors(id): Observable<any> {
    return this._http.get(`${TUTORS_URL}/${id}`, { headers: this.headers }).pipe(map(res => res))
  }

  getCreditPackages(id): Observable<any> {
    return this._http.get(`${CREDIT_PACKAGES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchTutorsCombined(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${TUTORS_COMBINED_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchTutor(id: number = 0, companyId: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${TUTOR_DETAILS_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  gettutorPerHourRate(companyId: number = 0): Observable<any> {
    return this._http.get(`${TUTOR_PER_HOUR_RATE}/${companyId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  updateMemberCalendly(payload): Observable<any> {
    return this._http.post(
        `${UPDATE_CALENDLY_URL}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  newQuestion(payload) {
    return this._http.post<any>(
      `${ASK_TUTOR_QUESTION_URL}`, 
      payload)
  }

  getCalendlyEvent(guid, userId): Observable<any> {
    return this._http.get(
        `${CALENDLY_EVENT_URL}/${guid}/${userId}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addTutorBooking(payload): Observable<any> {
    return this._http.post(
        `${ADD_TUTOR_BOOKING_URL}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCoursesFromTutorTypes(userId, companyId, payload): Observable<any> {
    return this._http.post(`${COURSE_TUTOR_TYPES_URL}/${userId}/${companyId}`,
        payload,
        { headers: this.headers }
    )
    .pipe(map(res => res));
  }

  sendBookingConfirmationEmail(payload): Observable<any> {
    return this._http.post(
        `${BOOKING_CONFIRMATION_EMAIL_URL}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getTutorMinPrefetch(companyId, userId, featureId) {
    let subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${featureId}`);
    let other_settings = this._http.get(`${OTHER_SETTINGS_URL}/${companyId}`);
    let CompanyUser = this._http.get(`${USER_URL}/${userId}`);
    let role = this._http.get(`${USER_ROLE_URL}/${userId}`);
    let courses = this._http.get(`${USER_COURSES_URL}/${userId}/${companyId}`);
    let types = this._http.get(`${TUTOR_TYPES_URL}/${companyId}`);
    let packages = this._http.get(`${TUTOR_PACKAGES_URL}/${companyId}`);

    return forkJoin([
      subfeatures,
      other_settings,
      CompanyUser,
      role,
      courses,
      types,
      packages
    ])
  }

  getTutorPrefetch(companyId, userId, featureId, courseFeatureId) {
    let subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${featureId}`);
    let other_settings = this._http.get(`${OTHER_SETTINGS_URL}/${companyId}`);
    let CompanyUser = this._http.get(`${USER_URL}/${userId}`);
    let role = this._http.get(`${USER_ROLE_URL}/${userId}`);
    let courses = this._http.get(`${USER_COURSES_URL}/${userId}/${companyId}`);
    let types = this._http.get(`${TUTOR_TYPES_URL}/${companyId}`);
    let packages = this._http.get(`${TUTOR_PACKAGES_URL}/${companyId}`);
    let courseSubfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${courseFeatureId}`);
    let tutors = this._http.get(`${TUTORS_URL}/${companyId}`);
    let member_types = this._http.get(`${MEMBER_TYPES_URL}/${companyId}`);
    let course_subscriptions = this._http.get(`${COURSE_SUBSCRIPTIONS_URL}/${userId}`);
    let courseCategoriesAccessRoles = this._http.get(`${COURSE_CATEGORY_ACCESS_URL}/${companyId}`);
    let courseCategoryMapping = this._http.get(`${COURSE_CATEGORY_MAPPING_URL}/${companyId}`);
    let courseExceptionUser = this._http.get(`${COURSE_EXCEPION_USERS_URL}/${userId}`);
    let allCourseCategories = this._http.get(`${COURSE_CATEGORIES_URL}/${companyId}`);
    let userCourseCredits = this._http.get(`${USER_COURSE_CREDITS_URL}/${userId}`);

    return forkJoin([
      subfeatures,  
      other_settings,
      CompanyUser,
      role,
      courses,
      types,
      packages,
      courseSubfeatures,
      tutors,
      member_types,
      course_subscriptions,
      courseCategoriesAccessRoles,
      courseCategoryMapping,
      courseExceptionUser,
      allCourseCategories,
      userCourseCredits
    ])
  }

  getTutor(id): Observable<any> {
    return this._http.get(`${TUTOR_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getTutorAccountIds(id, companyId): Observable<any> {
    return this._http.get(`${TUTOR_ACCOUNT_IDS_URL}/${id}/${companyId}`,
      {headers: this.headers}
    ).pipe(map(res => res))
  }

  getStripeAccountsId(companyId){
    return this._http.get(
      `${STRIPE_ACCOUNT_IDS_URL}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  configureStripeConnect(id, tutorId, companyId, payload): Observable<any> {
    return this._http.post(`${ADD_STRIPE_CONNECT_URL}/${id}/${tutorId}/${companyId}`,
      payload,
      {headers: this.headers}
    ).pipe(map(res => res))
  }

  getStripeLoginLink(payload): Observable<any> {
    return this._http.post(STRIPE_LOGIN_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  cancelBooking(payload): Observable<any> {
    return this._http.post(CANCEL_BOOKING_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addTutorRating(userId, companyId, tutorId, payload): Observable<any> {
    return this._http.post(
      `${ADD_TUTOR_RATING_URL}/${userId}/${companyId}/${tutorId}`,
        payload,
        { headers: this.headers }
    )
    .pipe(map(res => res));
  }

  editBookingStatus(params): Observable<any> {
    return this._http.put(EDIT_BOOKING_STATUS_URL,
        params
    ).pipe(map(res => res));
  }

  handleTutorTransfer(id, payload): Observable<any> {
    return this._http.post(`${TRANSFER_COMMISSION_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  giveFeedback(payload): Observable<any> {
    return this._http.post(ADD_FEEDBACK_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addNotes(payload): Observable<any> {
    return this._http.post(ADD_NOTES_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getTutorBookingNotes(id): Observable<any>{
    return this._http.get(`${BOOKING_NOTES_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getTutorBookingHistory(id): Observable<any>{
    return this._http.get(`${BOOKING_HISTORY_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getCombinedCommissionsPrefetch(id) {
    let commissions = this._http.get(`${TUTOR_COMMISSIONS_URL}/${id}`);
    let stripe_transfers = this._http.get(`${STRIPE_TRANSFERS_URL}/${id}`);

    return forkJoin([
      commissions,
      stripe_transfers,
    ])
  }

  getCommissions(id): Observable<any> {
    return this._http.get(`${TUTOR_COMMISSIONS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  bulkTransferCommission(payload): Observable<any> {
    return this._http.post(`${BULK_TRANSFER_COMMISSION_URL}`,
      payload
    ).pipe(map(res => res));
  }

  getBookingsHistory(userId, companyId, role, courseId): Observable<any> {
    return this._http.get(`${BOOKINGS_HISTORY_URL}/${companyId}/${userId}/${role}/${courseId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  assignTutorCourses(payload): Observable<any> {
    return this._http.post(ASSIGN_TUTOR_COURSES_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getTutorCourses(id) {
    return this._http.get(`${TUTOR_COURSES_URL}/${id}`,
      { headers: this.headers }
    );
  }

  getTutorCoursesAccess(companyId, userId, tutorId): Observable<any> {
    return this._http.get(`${TUTOR_COURSES_ACCESS_URL}/${companyId}/${userId}/${tutorId}`,
      { headers: this.headers}
    ).pipe(map(res => res))
  }

  assignCourseToTutors(companyId, userId, payload): Observable<any> {
    return this._http.post(`${ASSIGN_TUTOR_COURSE_URL}/${companyId}/${userId}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editTutor(payload): Observable<any> {
    return this._http.put(EDIT_TUTOR_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCourseTutorTypes(id): Observable<any> {
    return this._http.get(
      `${COURSE_TUTOR_TYPES_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getTutorPackages(id): Observable<any> {
    return this._http.get(
      `${TUTOR_PACKAGES_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getStripeConnectAccountStatus(payload): Observable<any> {
    return this._http.post(`${STRIPE_CONNECT_ACCOUNT_STATUS_URL}`,
      payload,
      {headers: this.headers}
    ).pipe(map(res => res))
  }

  deleteCommission(id): Observable<any> {
    return this._http.delete(
      `${DELETE_COMMISSION_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  getTutorTypes(id): Observable<any> {
    return this._http.get(`${TUTOR_TYPES_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addTutorType(payload): Observable<any> {
    return this._http.post(ADD_TUTOR_TYPE_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editTutorType(id, payload): Observable<any> {
    return this._http.put(
        `${EDIT_TUTOR_TYPE_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteTutorType(id, companyId): Observable<any> {
    return this._http.delete(
      `${DELETE_TUTOR_TYPE_URL}/${id}/${companyId}`,
      {},
    ).pipe(map(res => res));
  }

  getTutorBookingCommissionPerHour(companyId): Observable<any> {
    return this._http.get(`${COMMISSION_PER_HOUR_URL}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getTutorBookingCommissionPercentage(companyId): Observable<any> {
    return this._http.get(`${COMMISSION_PERCENTAGE_URL}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  saveTutorBookingCommissionPerHour(payload): Observable<any> {
    return this._http.post(SAVE_COMMISSION_PER_HOUR_URL,
      payload
    ).pipe(map(res => res))
  }

  saveTutorBookingCommissionPercentage(payload): Observable<any> {
    return this._http.post(SAVE_COMMISSION_PERCENTAGE_URL,
      payload
    ).pipe(map(res => res))
  }

  addTutorPackage(payload): Observable<any> {
    return this._http.post(ADD_TUTOR_PACKAGE_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editTutorPackage(id, payload): Observable<any> {
    return this._http.put(`${EDIT_TUTOR_PACKAGE_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteTutorPackage(id, companyId): Observable<any> {
    return this._http.delete(`${DELETE_TUTOR_PACKAGE_URL}/${id}/${companyId}`,
      {},
    ).pipe(map(res => res));
  }

  getDurationUnits(): Observable<any> {
    return this._http.get(DURATION_UNITS_URL,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editTutorPackageStatus(params): Observable<any> {
    return this._http.put(EDIT_TUTOR_PACKAGE_STATUS_URL,
        params
    ).pipe(map(res => res));
  }

  getCombinedCreditPackagesPrefetch(companyId, featureId, courseFeatureId) {
    let subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${featureId}`);
    let courseSubfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${courseFeatureId}`);
    let creditPackages = this._http.get(`${CREDIT_PACKAGES_URL}/${companyId}`);
    let courses = this._http.get(`${COURSES_URL}/${companyId}`);
    
    return forkJoin([
      subfeatures,
      courseSubfeatures,
      creditPackages,
      courses,
    ])
  }

  addCreditPackage(payload): Observable<any> {
    return this._http.post(ADD_CREDIT_PACKAGE_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCreditPackage(id, payload): Observable<any> {
    return this._http.put(`${EDIT_CREDIT_PACKAGE_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCreditPackageStatus(params): Observable<any> {
    return this._http.put(EDIT_CREDIT_PACKAGE_STATUS_URL,
        params
    ).pipe(map(res => res));
  }

  deleteCreditPackage(id, companyId): Observable<any> {
    return this._http.delete(`${DELETE_CREDIT_PACKAGE_URL}/${id}/${companyId}`,
        {},
    ).pipe(map(res => res));
  }

  getOraganzationURI(token): Observable<any> {
    return this._http.get(`${GET_CALENDLY_ACCOUNT_ORGANIZATION_URI}`, { 
      headers: this.headers.set("Authorization", `Bearer ${token}`)
    }).pipe(map(res => res));
  }


  checkIfCalendlyUrlExsist(token,organizationUrl): Observable<any> {
    return this._http.get(`${GET_CALENDLY_ACCOUNT_EVENTS_LIST}?organization=${organizationUrl}`, { 
      headers: this.headers.set("Authorization", `Bearer ${token}`)
    }).pipe(map(res => res));
  }

  syncCalendlyBookingWithPlatform(payload): Observable<any> {
    return this._http.post(
        `${SYNC_CALENDLY_EVENT_PLATFORM_URL}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  bulkTransferCommissionImproved(payload): Observable<any> {
    return this._http.post(`${BULK_TRANSFER_COMMISSION_IMPROVED_URL}`,
      payload,
      { 
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          "x-idempotency-key": payload.idempotency_key,
        }) 
      }
    ).pipe(map(res => res));
  }

  updateTransferProcessingStatus(payload): Observable<any> {
    return this._http.post(`${UPDATE_TRANSFER_QUEUE_URL}`,
      payload
    ).pipe(map(res => res));
  }

  deleteBooking(id): Observable<any> {
    return this._http.delete(`${DELETE_BOOKING_URL}/${id}`,
        {},
    ).pipe(map(res => res));
  }

  editAssignedTutor(params): Observable<any> {
    return this._http.post(EDIT_ASSIGNED_TUTOR_URL,
        params
    ).pipe(map(res => res));
  }
}