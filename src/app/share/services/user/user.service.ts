import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { 
    MEMBER_TYPES_URL,
    USER_MEMBER_TYPES_URL,
    USER_NOTIFICATIONS_URL,
    USER_ALL_NOTIFICATIONS_URL,
    USER_CHECK_ADMIN_URL,
    REGISTRATION_FIELDS_URL,
    REGISTRATION_FIELDS_MAPPING_URL,
    CHECK_EXPIRED_URL,
    EDIT_CUSTOM_MEMBER_TYPE_URL,
    USER_URL,
    USER_ROLE_URL,
    PROFILE_FIELDS_URL,
    PROFILE_FIELDS_MAPPING_URL,
    USER_GUID_URL,
    MANAGE_USERS_DATA_URL,
    ACTIVE_MEMBERS_URL,
    FOR_CONFIRMATION_MEMBERS_URL,
    DELETED_MEMBERS_URL,
    NOT_APPROVED_MEMBERS_URL,
    INCOMPLETE_MEMBERS_URL,
    FOR_APPROVAL_MEMBERS_URL,
    SALES_PERSON_LIST_URL,
    BULK_DELETE_USERS_URL,
    BULK_PERMANENT_DELETE_USERS_URL,
    BULK_RECOVER_DELETED_USERS_URL,
    PERMANENT_DELETE_USER_URL,
    DELETE_USER_URL,
    RECOVER_DELETED_USER_URL,
    ADD_USER_URL,
    ADD_DYNAMIC_USER_URL,
    EDIT_DYNAMIC_USER_URL,
    UPDATE_CONFIRM_USER_STATUS_URL,
    BULK_UPDATE_USER_STATUS_URL,
    UPDATE_USER_STATUS_URL,
    MEMBERS_LIST_URL,
    USER_COURSE_CREDITS_URL,
    CREDIT_PACKAGES_URL,
    COURSES_URL,
    CREDIT_PACKAGE_URL,
    PAY_CREDIT_PACKAGE_URL,
    FEATURES_MAPPING_URL,
    USER_CREDITS_URL,
    TUTOR_ACCOUNT_IDS_URL,
    TUTOR_USER_PACKAGES_URL,
    TUTORS_URL,
    OTHER_SETTINGS_URL,
    USER_BOOKINGS_URL,
    USER_MEMBER_TYPE_URL,
    USER_TYPE_PROFILE_FIELDS_URL,
    PROFILE_FIELD_SETTINGS_URL,
    TUTOR_SETTINGS_URL,
    AS_USER_DETAILS_URL,
    SECTORS_URL,
    CIVIL_STATUS_URL,
    WELLBEING_ACTIVITIES_URL,
    AREA_GROUPS_URL,
    EDIT_USER_PROFILE_URL,
    EDIT_USER_PHOTO_URL,
    EDIT_USER_COMPANY_LOGO_URL,
    EDIT_USER_AS_LOGO_URL,
    EDIT_USER_PROFILE_FIELDS_SETTINGS_URL,
    COURSE_SUBSCRIPTIONS_URL,
    COURSE_EXCEPION_USERS_URL,
    ASSIGNED_TUTORS_URL,
    GUARDIAN_STUDENTS_URL,
    DENY_USER_URL,
    ACCEPT_CONDITIONS_URL,
    API_GELOCATION_URL,
    USER_CREDIT_LOGS_URL,
    CUSTOMER_PORTAL_URL,
    AS_CUSTOMER_PORTAL_URL,
    CANCEL_MEMBERSHIP_URL,
    NETCULTURA_USERS_URL,
    INVITATIONS_DATA_URL,
    CRM_DATA_URL,
    CRM_ASSIGNED_GUESTS_DATA_URL,
    USER_GUID_INFO_URL,
    TUTOR_DETAILS_URL,
    USER_CREDIT_LOGS_HISTORY_URL,
    STRIPE_TRANSFERS_URL,
    DELETE_GUEST_URL,
    EDIT_CONTACT_INFO_URL,
    EDIT_CRM_USER_COMMENT_URL,
    CRM_ALARMS_URL,
    CRM_COMMUNICATIONS_URL,
    ADD_CRM_STATUS_URL,
    CRM_SIGN_GUEST_URL,
    CRM_UNSIGN_GUEST_URL,
    CRM_EDIT_COMMUNICATION_URL,
    UPDATE_REGISTRATION_FIELDS_URL,
    REGISTRATION_FIELD_URL,
    UPDATE_REGISTRATION_FIELD_DETAILS_URL,
    SUPER_TUTOR_STUDENTS_URL,
    POT_SUPER_TUTOR_STUDENTS_URL,
    EDIT_USER_BIRTHDAY_URL,
    MENTOR_SESSIONS_URL,
    USER_TRANSACTIONS_URL,
} from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";
import { environment } from "@env/environment";

@Injectable({
  providedIn: "root",
})
export class UserService {
  userCourseCredits$ = new BehaviorSubject<any[]>(
    (this._localService.getLocalStorage(environment.lsusercoursecredits)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsusercoursecredits))
      : [])
  );

  private headers: HttpHeaders;

  private refreshNotifications = new BehaviorSubject(false);
  public currentRefreshNotification = this.refreshNotifications.asObservable();
  public triggerRefreshNotification(newRefreshNotifications: boolean) {
    this.refreshNotifications.next(newRefreshNotifications);
  }

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  get userCourseCredits(): any[] {
    return this.userCourseCredits$.getValue();
  }

  getUserMemberTypes(id): Observable<any> {
    return this._http
      .get(`${USER_MEMBER_TYPES_URL}/${id}`, { headers: this.headers })
      .pipe(map((res) => res));
  }

  userNotifications(userId, companyId) {
    return this._http.get(`${USER_NOTIFICATIONS_URL}/${userId}/${companyId}`);
  }

  allUserNotifications(userId, companyId) {
    return this._http.get(`${USER_ALL_NOTIFICATIONS_URL}/${userId}/${companyId}`);
  }

  isAdminById(userId) {
    return this._http.get(`${USER_CHECK_ADMIN_URL}/${userId}`);
  }

  getRegistrationFields(): Observable<any> {
    return this._http.get(REGISTRATION_FIELDS_URL, { headers: this.headers }).pipe(map(res => res))
  }

  getRegistrationFieldMapping(id): Observable<any> {
    return this._http.get(`${REGISTRATION_FIELDS_MAPPING_URL}/${id}`, { headers: this.headers }).pipe(map(res => res))
  }

  getProfileFields(): Observable<any> {
    return this._http.get(PROFILE_FIELDS_URL, { 
      headers: this.headers 
    }).pipe(map(res => res))
  }

  getProfileFieldMapping(id): Observable<any> {
    return this._http.get(`${PROFILE_FIELDS_MAPPING_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res))
  }

  getCustomMemberTypes(id): Observable<any> {
    return this._http.get(`${MEMBER_TYPES_URL}/${id}`, { headers: this.headers }).pipe(map(res => res))
  }

  getCustomMemberTypeExpiration(id, email): Observable<any> {
    return this._http.get(`${CHECK_EXPIRED_URL}/${id}/${email}`, { headers: this.headers }).pipe(map(res => res))
  }

  updateUserCustomMemberType(payload): Observable<any> {
    return this._http.post(EDIT_CUSTOM_MEMBER_TYPE_URL, payload).pipe(map(res => res));
  }

  getUserById(id): Observable<any> {
    return this._http.get(`${USER_URL}/${id}`, { headers: this.headers }).pipe(map(res => res))
  }

  getUserRole(id): Observable<any> {
    return this._http.get(`${USER_ROLE_URL}/${id}`, { headers: this.headers }).pipe(map(res => res))
  }

  getUserByGuid(guid) {
    return this._http.get(`${USER_GUID_INFO_URL}/${guid}`, { headers: this.headers });
  }

  fetchManageUsersData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${MANAGE_USERS_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getCombinedMiembrosListPrefetch(companyId) {
    let members = this._http.get(`${ACTIVE_MEMBERS_URL}/${companyId}`);
    let members_for_confirm = this._http.get(`${FOR_CONFIRMATION_MEMBERS_URL}/${companyId}`);
    let members_deleted = this._http.get(`${DELETED_MEMBERS_URL}/${companyId}`);
    let members_not_approved = this._http.get(`${NOT_APPROVED_MEMBERS_URL}/${companyId}`);
    let members_incomplete = this._http.get(`${INCOMPLETE_MEMBERS_URL}/${companyId}`);
    let members_for_approval = this._http.get(`${FOR_APPROVAL_MEMBERS_URL}/${companyId}`);

    return forkJoin([
      members,
      members_for_confirm,
      members_deleted,
      members_not_approved,
      members_incomplete,
      members_for_approval
    ])
  }

  guestSalesPersonList(): Observable<any> {
    return this._http.get(SALES_PERSON_LIST_URL,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  bulkDeleteUser(formData, userId): Observable<any> {
    formData.userId = userId
    return this._http.post(BULK_DELETE_USERS_URL,
      formData
    ).pipe(map(res => res));
  }

  bulkDeleteDeletedUser(formData): Observable<any> {
    return this._http.post(
      BULK_PERMANENT_DELETE_USERS_URL,
      formData
    ).pipe(map(res => res));
  }

  bulkRecoverDeletedUser(formData): Observable<any> {
    return this._http.post(
      BULK_RECOVER_DELETED_USERS_URL,
      formData
    ).pipe(map(res => res));
  }

  deleteCompanyUser(id, userId): Observable<any> {
    return this._http.post(
        `${DELETE_USER_URL}/${id}`,
        { userId: userId },
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteCompanyDeletedUser(id): Observable<any> {
    return this._http.post(
        `${PERMANENT_DELETE_USER_URL}/${id}`,
        {},
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  recoverCompanyDeletedUser(id): Observable<any> {
    return this._http.post(
        `${RECOVER_DELETED_USER_URL}/${id}`,
        {},
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addCompanyUser(payload): Observable<any> {
    return this._http.post(
      ADD_USER_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addVCPUserDynamicCustom(companyId, formData): Observable<any> {
    return this._http.post(
      `${ADD_DYNAMIC_USER_URL}/${companyId}`,
      formData
    ).pipe(
      map(result => {
        return result;
      })
    );
  }

  updateUserDynamicCustom(id, companyId, formData): Observable<any> {
    return this._http.post(
      `${EDIT_DYNAMIC_USER_URL}/${id}/${companyId}`,
      formData
    ).pipe(
      map(result => {
        return result;
      })
    );
  }

  updateUserStatus(id, payload): Observable<any> {
    return this._http.post(
      `${UPDATE_USER_STATUS_URL}/${id}`, 
      payload
    ).pipe(map(res => res));
  }

  updateBulkUserStatus(payload): Observable<any> {
    return this._http.post(BULK_UPDATE_USER_STATUS_URL, 
      payload
    ).pipe(map(res => res));
  }

  updateUserConfirmStatus(id, custom_member_type_id): Observable<any> {
    return this._http.post(
      `${UPDATE_CONFIRM_USER_STATUS_URL}/${id}/${custom_member_type_id}`, 
      {}
    ).pipe(map(res => res));
  }

  getMembersCustomRoles(companyId): Observable<any> {
    return this._http.get(`${MEMBERS_LIST_URL}/${companyId}`, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getUserCourseCredits(id): Observable<any> {
    return this._http.get(`${USER_COURSE_CREDITS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getCombinedMenuCreditsPrefetch(companyId) {
    let creditPackages = this._http.get(`${CREDIT_PACKAGES_URL}/${companyId}`);
    let courses = this._http.get(`${COURSES_URL}/${companyId}`);
    
    return forkJoin([
      creditPackages,
      courses
    ])
  }

  getCreditPackages(id): Observable<any> {
    return this._http.get(`${CREDIT_PACKAGES_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCreditPackage(id, companyId): Observable<any> {
    return this._http.get(
      `${CREDIT_PACKAGE_URL}/${id}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  subscribeCreditPackage(packageId, userId, companyId, payload): Observable<any> {
    return this._http.post(
      `${PAY_CREDIT_PACKAGE_URL}/${packageId}/${userId}/${companyId}`,
      payload
    ).pipe(
      map(res => {
        const result = res
        return result;
      })
    );
  }

  getCombinedCreditsPrefetch(companyId, featureId, courseFeatureId, userId) {
    let subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${featureId}`);
    let courseSubfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${courseFeatureId}`);
    let creditPackages = this._http.get(`${CREDIT_PACKAGES_URL}/${companyId}`);
    let courses = this._http.get(`${COURSES_URL}/${companyId}`);
    let userCredits = this._http.get(`${USER_CREDITS_URL}/${userId}/${companyId}`);
    let userCourseCredits = this._http.get(`${USER_COURSE_CREDITS_URL}/${userId}`);
    
    return forkJoin([
      subfeatures,
      courseSubfeatures,
      creditPackages,
      courses,
      userCredits,
      userCourseCredits
    ])
  }

  getCombinedBookingsPrefetch(companyId, tutorsFeatureId, coursesFeatureId, userId) {
    let subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/20`);
    let courses_subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/11`);
    let other_settings = this._http.get(`${OTHER_SETTINGS_URL}/${companyId}`);
    let CompanyUser = this._http.get(`${USER_URL}/${userId}`);
    let role = this._http.get(`${USER_ROLE_URL}/${userId}`);
    let tutors = this._http.get(`${TUTORS_URL}/${companyId}`);
    let account_ids = this._http.get(`${TUTOR_ACCOUNT_IDS_URL}/${userId}/${companyId}`);
    let packages = this._http.get(`${TUTOR_USER_PACKAGES_URL}/${userId}/${companyId}`);
    let member_types = this._http.get(`${MEMBER_TYPES_URL}/${companyId}`);
    let stripe_transfers = this._http.get(`${STRIPE_TRANSFERS_URL}/${companyId}`);

    return forkJoin([
      subfeatures,
      courses_subfeatures,
      other_settings,
      CompanyUser,
      role,
      tutors,
      account_ids,
      packages,
      member_types,
      stripe_transfers,
    ])
  }

  getUserBookings(userId, companyId, role): Observable<any> {
    return this._http.get(`${USER_BOOKINGS_URL}/${companyId}/${userId}/${role}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getUserMemberType(id): Observable<any> {
    return this._http.get(`${USER_MEMBER_TYPE_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getCombinedProfilePrefetch(companyId, userId, membersFeatureId, tutorFeatureId) {
    let other_settings = this._http.get(`${OTHER_SETTINGS_URL}/${companyId}`);
    let CompanyUser = this._http.get(`${USER_URL}/${userId}`);
    let members_subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${membersFeatureId}`);
    let tutors_subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${tutorFeatureId}`);

    return forkJoin([
      other_settings,
      CompanyUser,
      members_subfeatures,
      tutors_subfeatures
    ])
  }

  getCombinedProfileDetailsPrefetch(companyId, userId) {
    let tutor = this._http.get(`${TUTOR_SETTINGS_URL}/${userId}`);
    let user = this._http.get(`${AS_USER_DETAILS_URL}/${userId}`);
    let categories = this._http.get(`${SECTORS_URL}/${companyId}`);
    let civil_status = this._http.get(CIVIL_STATUS_URL);
    let wellbeing_activities = this._http.get(WELLBEING_ACTIVITIES_URL);
    let result = this._http.get(`${AREA_GROUPS_URL}/${userId}/${companyId}`);
    let tutorInfo = this._http.get(`${TUTOR_DETAILS_URL}/${userId}/${companyId}/${userId}`);
    
    return forkJoin([
      tutor,
      user,
      categories,
      civil_status,
      wellbeing_activities,
      result,
      tutorInfo
    ])
  }

  getMemberTypeCustomProfileFields(companyId, memberTypeId): Observable<any> {
    return this._http.get(`${USER_TYPE_PROFILE_FIELDS_URL}/${companyId}/${memberTypeId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  memberProfileFieldSettings(id): Observable<any> {
    return this._http.get(`${PROFILE_FIELD_SETTINGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateProfileDynamic(id, formData): Observable<any> {
    return this._http.post(
      `${EDIT_USER_PROFILE_URL}/${id}`,
      formData
    ).pipe(map(res => res))
  }

  updateProfileImage(id, file) {
    let formData = new FormData();

    if (file) {
      const filename = 'profile_' + this.getTimestamp();
      formData.append('destination', './uploads/profile_images/');
      formData.append('filepath', ('./uploads/profile_images/' + filename + '.jpg'));
      formData.append('filenamewoextension', filename);
      formData.append('image', file.image, filename + '.jpg');
      formData.append('image_file', filename + '.jpg');
    }

    return this._http.post(`${EDIT_USER_PHOTO_URL}/${id}`, formData);
  }

  updateCompanyLogoImage(id, file) {
    let formData = new FormData();

    if (file) {
      const filename = 'profile_' + this.getTimestamp();
      formData.append('destination', './uploads/profile_images/');
      formData.append('filepath', ('./uploads/profile_images/' + filename + '.jpg'));
      formData.append('filenamewoextension', filename);
      formData.append('image', file.image, filename + '.jpg');
      formData.append('image_file', filename + '.jpg');
    }

    return this._http.post(`${EDIT_USER_COMPANY_LOGO_URL}/${id}`, formData);
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  updateASLogo(id, logoFile): Observable<any> {
    let formData = new FormData();

    if (logoFile) {
      const filename = 'as_logo_' + this.getTimestamp();
      formData.append('image', logoFile.image[0], filename + '.jpg');
    }

    return this._http.post(`${EDIT_USER_AS_LOGO_URL}/${id}`,
      formData
    ).pipe(
      map(res => {
        const result = res
        return result;
      })
    );
  }

  manageProfileFieldSettings(id, payload): Observable<any> {
    return this._http.post(`${EDIT_USER_PROFILE_FIELDS_SETTINGS_URL}/${id}`, 
        payload
    ).pipe(map(res => res))
  }

  getCombinedUserCoursesPrefetch(userId) {
    let courseSubscriptions = this._http.get(`${COURSE_SUBSCRIPTIONS_URL}/${userId}`);
    let courseExceptionUser = this._http.get(`${COURSE_EXCEPION_USERS_URL}/${userId}`);
    let userCourseCredits = this._http.get(`${USER_COURSE_CREDITS_URL}/${userId}`);

    return forkJoin([
        courseSubscriptions,
        courseExceptionUser,
        userCourseCredits
    ])
  }

  getUserAsignedTutors(id): Observable<any> {
    return this._http.get(`${ASSIGNED_TUTORS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getGuardianStudents(id, companyId): Observable<any> {
    return this._http.get(`${GUARDIAN_STUDENTS_URL}/${id}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  denyMember(id): Observable<any> {
    return this._http.post(
      `${DENY_USER_URL}/${id}`,
      {}
    ).pipe(
      map(result => {
        return result;
      })
    );
  }

  getMembersNotApproved(companyId): Observable<any> {
    return this._http.get(`${NOT_APPROVED_MEMBERS_URL}/${companyId}`, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  acceptConditions(id,payload): Observable<any> {
    return this._http.post(`${ACCEPT_CONDITIONS_URL}/${id}`, payload).pipe(
      map((result) => {
        return result;
      })
    );
  }

  getUserGeolocation(key): Observable<any> {
    return this._http.get(`${API_GELOCATION_URL}/?api_key=${key}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getUserCreditLogs(id): Observable<any> {
    return this._http.get(`${USER_CREDIT_LOGS_URL}/${id}`, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }
  getUserCreditLogsHistory(userId): Observable<any> {
    return this._http.get(`${USER_CREDIT_LOGS_HISTORY_URL}/${userId}`, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  createCustomerPortal(userId, serviceId, payload): Observable<any> {
    return this._http.post(
      `${AS_CUSTOMER_PORTAL_URL}/${userId}/${serviceId}`,
      payload
    ).pipe(
      map(res => {
        const result = res
        return result;
      })
    );
  }

  createOtherCustomerPortal(userId, companyId, objectId, object, type, payload): Observable<any> {
    return this._http.post(
      `${CUSTOMER_PORTAL_URL}/${userId}/${companyId}/${objectId}/${object}/${type}`,
      payload
    ).pipe(
      map(res => {
        const result = res
        return result;
      })
    );
  }

  cancelMembership(payload): Observable<any> {
    return this._http.post(CANCEL_MEMBERSHIP_URL, 
        payload
    ).pipe(map(res => res))
  }

  getCombinedFieldMappingPrefetch(companyId): Observable<any[]> {
    let registration_field_mapping = this._http.get(`${REGISTRATION_FIELDS_MAPPING_URL}/${companyId}`);
    let profile_field_mapping = this._http.get(`${PROFILE_FIELDS_MAPPING_URL}/${companyId}`);

    return forkJoin([
      registration_field_mapping,
      profile_field_mapping
    ]);
  }

  netculturaUsersList(): Observable<any> {
    return this._http.get(NETCULTURA_USERS_URL,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchInvitationsData(id, userId): Observable<any> {
    return this._http.get(`${INVITATIONS_DATA_URL}/${id}/${userId}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchCRMData(id, userId): Observable<any> {
    return this._http.get(`${CRM_DATA_URL}/${id}/${userId}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchCRMAssignedGuestsData(id, userId): Observable<any> {
    return this._http.get(`${CRM_ASSIGNED_GUESTS_DATA_URL}/${id}/${userId}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  updateUserCourseCredits(userCourseCredits: any[] = []) {
    this._localService.setLocalStorage(
      environment.lsusercoursecredits,
      JSON.stringify(userCourseCredits)
    );
    this.userCourseCredits$.next(userCourseCredits);
  }

  getAlarms(id): Observable<any> {
    return this._http.get(`${CRM_ALARMS_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCommunications(id): Observable<any> {
    return this._http.get(`${CRM_COMMUNICATIONS_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editContactInfo(id, payload): Observable<any> {
    return this._http.post(
      `${EDIT_CONTACT_INFO_URL}/${id}`, 
      payload
    ).pipe(map(res => res));
  }

  editCrmUserComment(id, payload): Observable<any> {
    return this._http.post(
      `${EDIT_CRM_USER_COMMENT_URL}/${id}`, 
      payload
    ).pipe(map(res => res));
  }

  addCRMStatus(id, payload): Observable<any> {
    return this._http.post(`${ADD_CRM_STATUS_URL}/${id}`, 
      payload
    ).pipe(map(res => res));
  }

  signGuest(userId, eventId, params): Observable<any> {
    return this._http.post(
      `${CRM_SIGN_GUEST_URL}/${userId}/${eventId}`, 
      params
    ).pipe(map(res => res));
  }

  unsignGuest(userId, eventId): Observable<any> {
    return this._http.post(
      `${CRM_UNSIGN_GUEST_URL}/${userId}/${eventId}`, 
      {}
    ).pipe(map(res => res));
  }

  editCRMCommunication(id, payload): Observable<any> {
    return this._http.post(`${CRM_EDIT_COMMUNICATION_URL}/${id}`, 
      payload
    ).pipe(map(res => res));
  }

  deleteGuest(id, guestId) {
    return this._http.post(`${DELETE_GUEST_URL}/${id}/${guestId}`, {});
  }

  updateRegistrationFields(payload): Observable<any> {
    return this._http.post(UPDATE_REGISTRATION_FIELDS_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getFieldDetails(id, companyId): Observable<any> {
    return this._http.get(`${REGISTRATION_FIELD_URL}/${id}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  updateFieldDetails(id, payload): Observable<any> {
    return this._http.post(`${UPDATE_REGISTRATION_FIELD_DETAILS_URL}/${id}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getSuperTutorStudents(id): Observable<any> {
    return this._http.get(`${SUPER_TUTOR_STUDENTS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getPotSuperTutorStudents(id): Observable<any> {
    return this._http.get(`${POT_SUPER_TUTOR_STUDENTS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  updateUserBirthday(payload): Observable<any> {
    return this._http.put(EDIT_USER_BIRTHDAY_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getUserMentorSessions(companyId, userId): Observable<any> {
    return this._http.get(`${MENTOR_SESSIONS_URL}/${companyId}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getUserTransactions(companyId, userId): Observable<any> {
    return this._http.get(`${USER_TRANSACTIONS_URL}/${companyId}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }
}