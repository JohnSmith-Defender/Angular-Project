import { Injectable } from "@angular/core";
import { Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  ACTIVITY_CITIES_URL,
  ACTIVITY_CODE_DATA_URL,
  ACTIVITY_CREDITS_URL,
  ACTIVITY_PAYMENT_OPTIONS_URL,
  ACTIVITY_TEACHERS_URL,
  ADD_ACTIVITY_TEACHER_URL,
  ADD_AGE_GROUP_URL,
  ADD_ALIAS_URL,
  ADD_EVENT_CATEGORY_URL,
  ADD_EVENT_SUBCATEGORY_URL,
  ADD_GROUP_PLAN_COMMENT_REACTION_URL,
  ADD_GROUP_PLAN_COMMENT_REPLY_URL,
  ADD_GROUP_PLAN_COMMENT_URL,
  ADD_GUEST_REGISTRATION_FIELDS_URL,
  ADD_PLAN_COMMENT_URL,
  ADD_TO_WAITING_LIST_URL,
  AGE_GROUPS_URL,
  ALL_GUEST_REGISTRATION_FIELDS_URL,
  ANSWER_EMAIL_INVITE_QUESTIONS_URL,
  APPROVE_GROUP_PLAN_COMMENT_URL,
  APPROVE_PLAN_COMMENT_URL,
  ASSIGN_SALES_PERSON_EVENT_URL,
  ASSIGN_SALES_PERSON_URL,
  CATEGORY_EVENTS_URL,
  CHECKOUT_PLAN_DETAILS_URL,
  CHECK_PLAN_REGISTRATION_URL,
  CLEAR_CONFIRMATION_URL,
  CLEAR_PARTICIPANT_ATTENDANCE_URL,
  CLEAR_PLAN_CONFIRMATION_URL,
  CLEAR_PLAN_PARTICIPANT_ATTENDANCE_URL,
  CLUB_PLAN_DELETE_URL,
  CONFIRM_ATTENDANCE_URL,
  CONFIRM_BIZUM_GROUP_PLAN_PARTICIPANT_URL,
  CONFIRM_BIZUM_PLAN_PARTICIPANT_URL,
  CONFIRM_PARTICIPANT_ATTENDANCE_URL,
  CONFIRM_PARTICIPANT_URL,
  CONFIRM_PLAN_PARTICIPANT_ATTENDANCE_URL,
  CONFIRM_PLAN_PARTICIPANT_URL,
  COURSE_CATEGORIES_URL,
  COURSE_CATEGORY_ACCESS_URL,
  COURSE_CATEGORY_MAPPING_URL,
  CREATE_CLUB_PLAN_URL,
  CREATE_PLAN_FOR_APPROVAL_URL,
  CREATE_PLAN_ROLES_URL,
  CREATE_PLAN_URL,
  DASHBOARD_DETAILS_URL,
  DELETE_ACTIVITY_TEACHER_URL,
  DELETE_AGE_GROUP_URL,
  DELETE_ALIAS_URL,
  DELETE_COMMENT_URL,
  DELETE_EVENT_CATEGORY_URL,
  DELETE_EVENT_SUBCATEGORY_URL,
  DELETE_GROUP_PLAN_COMMENT_REACTION_URL,
  DELETE_GUEST_REGISTRATION_FIELDS_URL,
  DELETE_RECURRING_SERIES_URL,
  EDIT_ACTIVITY_TEACHER_URL,
  EDIT_AGE_GROUP_URL,
  EDIT_ALIAS_URL,
  EDIT_CLUB_PLAN_URL,
  EDIT_EVENT_CATEGORY_URL,
  EDIT_EVENT_SUBCATEGORY_URL,
  EDIT_FEATURED_TEXT_URL,
  EDIT_GUEST_REGISTRATION_FIELDS_URL,
  EDIT_PLAN_STATUS_URL,
  EDIT_PLAN_URL,
  EVENT_CATEGORIES_LIST_URL,
  EVENT_CATEGORIES_URL,
  EVENT_CUSTOM_SUBCATEGORIES_URL,
  EVENT_SETTINGS_URL,
  EVENT_SUBCATEGORIES_LIST_URL,
  EVENT_SUBCATEGORIES_URL,
  EVENT_TEMPLATE_URL,
  EVENT_TYPES_URL,
  FEATURES_MAPPING_URL,
  GROUP_PLAN_COMMENTS_URL,
  GUEST_HISTORY_LIST_URL,
  GUEST_REGISTRATION_FIELDS_URL,
  INVOICE_DETAILS_URL,
  JOIN_GROUP_PLAN_URL,
  JOIN_PLAN_URL,
  JOIN_REQUEST_URL,
  LEAVE_GROUP_PLAN_URL,
  LEAVE_PLAN_URL,
  OTHER_SETTINGS_URL,
  PAST_PLANS_LIST_URL,
  PAST_PLANS_URL,
  PLANS_CALENDAR_URL,
  PLANS_LIST_URL,
  PLANS_MANAGEMENT_DATA_URL,
  PLANS_OTHER_DATA_URL,
  PLANS_URL,
  PLAN_CATEGORIES_URL, PLAN_CATEGORY_ADD_URL, PLAN_CATEGORY_DELETE_URL, PLAN_CATEGORY_EDIT_URL, PLAN_DETAILS_UPDATED_EMAIL_URL, PLAN_DETAILS_URL, PLAN_EMAIL_TO_URL, PLAN_GUEST_REGISTRATION_URL, PLAN_INVITE_LINK_URL, PLAN_PAYMENT_BIZUM_URL, PLAN_PAYMENT_URL, PLAN_REGISTRATION_DATA_URL, PLAN_REGISTRATION_URL, PLAN_SUBCATEGORIES_ADD_URL, PLAN_SUBCATEGORIES_EDIT_URL, PLAN_SUBCATEGORIES_MAPPING_URL, PLAN_SUBCATEGORIES_URL, PLAN_SUBCATEGORY_DELETE_URL, PLAN_SUPERCATEGORIES_URL, PLAN_UPDATE_ALIAS_URL, PLAN_UPDATE_SLUG_URL, PLAN_VIDEO_UPLOAD_URL, REMOVE_FROM_WAITING_LIST_URL, SALES_PEOPLE_URL, SEND_CONFIRM_ATTENDANCE_EMAIL_URL, SEND_CREDITS_DATA_URL, SUBMIT_ACTIVITY_RATING_URL, UPLOAD_PLAN_IMAGE_URL, USER_COURSES_URL, USER_ROLE_URL, USER_URL,
} from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";
import { environment } from "@env/environment";

@Injectable({
  providedIn: "root",
})
export class PlansService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  getEventCategories(id): Observable<any> {
    return this._http.get(
      `${EVENT_CATEGORIES_LIST_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getEventSubcategories(id): Observable<any> {
    return this._http.get(
      `${EVENT_SUBCATEGORIES_LIST_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addEventOtherCategory(payload): Observable<any> {
    return this._http.post(ADD_EVENT_CATEGORY_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editEventOtherCategory(id, payload): Observable<any> {
    return this._http.post(`${EDIT_EVENT_CATEGORY_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteEventOtherCategory(id): Observable<any> {
    return this._http.post(
      `${DELETE_EVENT_CATEGORY_URL}/${id}`,
      {},
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addEventSubcategory(payload): Observable<any> {
    return this._http.post(ADD_EVENT_SUBCATEGORY_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editEventSubcategory(id, payload): Observable<any> {
    return this._http.post(`${EDIT_EVENT_SUBCATEGORY_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteEventSubcategory(id): Observable<any> {
    return this._http.post(
      `${DELETE_EVENT_SUBCATEGORY_URL}/${id}`,
      {},
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getPlanCategories(id): Observable<any> {
    return this._http.get(`${PLAN_CATEGORIES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getPlanSubcategories(id): Observable<any> {
    return this._http.get(`${PLAN_SUBCATEGORIES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addPlanEventCategory(payload): Observable<any> {
    return this._http.post(PLAN_CATEGORY_ADD_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editPlanEventCategory(id, payload): Observable<any> {
    return this._http.post(`${PLAN_CATEGORY_EDIT_URL}/${id}`, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addPlanSubcategory(payload): Observable<any> {
    return this._http.post(PLAN_SUBCATEGORIES_ADD_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editPlanSubcategory(id, payload): Observable<any> {
    return this._http.post(`${PLAN_SUBCATEGORIES_EDIT_URL}/${id}`, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deletePlanEventCategory(id): Observable<any> {
    return this._http.post( `${PLAN_CATEGORY_DELETE_URL}/${id}`, {}, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deletePlanSubcategory(id): Observable<any> {
    return this._http.post(`${PLAN_SUBCATEGORY_DELETE_URL}/${id}`, {}, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getEventTypes(id): Observable<any> {
    return this._http.get(`${EVENT_TYPES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getAllPlansList(domain: string, plan_type_id: number,page=1,limit=20, company_id: number): Observable<any> {
    const params = `plan_type_id=${plan_type_id}&page=${page}&limit=${limit}&company_id=${company_id}`
    return this._http.get(`${PLANS_LIST_URL}?${params}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getAllPastPlans(plan_type_id: number, company_id: number): Observable<any> {
    return this._http.get(`${PAST_PLANS_URL}/${plan_type_id}/${company_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getEventSettings(id): Observable<any> {
    return this._http.get(`${EVENT_SETTINGS_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res))
  }

  getCombinedPlansPrefetch(companyId, userId, featureId): Observable<any[]> {
    let other_settings = this._http.get(`${OTHER_SETTINGS_URL}/${companyId}`);
    let CompanyUser = this._http.get(`${USER_URL}/${userId}`);
    let role = this._http.get(`${USER_ROLE_URL}/${userId}`);
    let create_plan_roles = this._http.get(`${CREATE_PLAN_ROLES_URL}/${companyId}`);
    let dashboard_details = this._http.get(`${DASHBOARD_DETAILS_URL}/${companyId}`);
    let categories = this._http.get(`${EVENT_CATEGORIES_URL}/${companyId}`);
    let subcategories = this._http.get(`${EVENT_SUBCATEGORIES_URL}/${companyId}`);
    let customsubcategories = this._http.get(`${EVENT_CUSTOM_SUBCATEGORIES_URL}/${companyId}`);
    let subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${featureId}`);
    let CompanySuperCategory = this._http.get(`${PLAN_SUPERCATEGORIES_URL}/${companyId}`);
    let plansubcategories = this._http.get(`${PLAN_SUBCATEGORIES_URL}/${companyId}`);
    let plansubcategorymapping = this._http.get(`${PLAN_SUBCATEGORIES_MAPPING_URL}/${companyId}`);

    return forkJoin([
        other_settings,
        CompanyUser,
        role,
        create_plan_roles,
        dashboard_details,
        categories,
        subcategories,
        customsubcategories,
        subfeatures,
        CompanySuperCategory,
        plansubcategories,
        plansubcategorymapping
    ]);
}

getCombinedCoursePlansPrefetch(companyId, userId, featureId): Observable<any[]> {
    let other_settings = this._http.get(`${OTHER_SETTINGS_URL}/${companyId}`);
    let CompanyUser = this._http.get(`${USER_URL}/${userId}`);
    let role = this._http.get(`${USER_ROLE_URL}/${userId}`);
    let create_plan_roles = this._http.get(`${CREATE_PLAN_ROLES_URL}/${companyId}`);
    let dashboard_details = this._http.get(`${DASHBOARD_DETAILS_URL}/${companyId}`);
    let categories = this._http.get(`${EVENT_CATEGORIES_URL}/${companyId}`);
    let subcategories = this._http.get(`${EVENT_SUBCATEGORIES_URL}/${companyId}`);
    let customsubcategories = this._http.get(`${EVENT_CUSTOM_SUBCATEGORIES_URL}/${companyId}`);
    let subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${featureId}`);
    let CompanySuperCategory = this._http.get(`${PLAN_SUPERCATEGORIES_URL}/${companyId}`);
    let plansubcategories = this._http.get(`${PLAN_SUBCATEGORIES_URL}/${companyId}`);
    let plansubcategorymapping = this._http.get(`${PLAN_SUBCATEGORIES_MAPPING_URL}/${companyId}`);
    let roles = this._http.get(`${COURSE_CATEGORY_ACCESS_URL}/${companyId}`);
    let CompanySupercategory = this._http.get(`${COURSE_CATEGORIES_URL}/${companyId}`);
    let CompanyCourseCategoryMapping = this._http.get(`${COURSE_CATEGORY_MAPPING_URL}/${companyId}`);
    let courses = this._http.get(`${USER_COURSES_URL}/${userId}/${companyId}`);

    return forkJoin([
      other_settings,
      CompanyUser,
      role,
      create_plan_roles,
      dashboard_details,
      categories,
      subcategories,
      customsubcategories,
      subfeatures,
      CompanySuperCategory,
      plansubcategories,
      plansubcategorymapping,
      roles,
      CompanySupercategory,
      CompanyCourseCategoryMapping,
      courses
    ]);
  }

  getCombinedActivePastPlans(domain, planType, page, limit, companyId) {
    const params = `plan_type_id=${planType}&page=${page}&limit=${limit}&company_id=${companyId}`
    let Plans = this._http.get(`${PLANS_LIST_URL}/guest/all-plans-list?${params}`);
    let PastPlans = this._http.get(`${PAST_PLANS_URL}/company/all-past-plans/0/${companyId}`);

    return forkJoin([
        Plans,
        PastPlans
    ])
  }

  getCalendarPlans(id: number, plan_type_id: number, page=1, limit=20, status = 'all', isUESchoolOfLife: boolean = false, campus: string = '', mode: string = ''): Observable<any> {
    let params = `plan_type_id=${plan_type_id}&page=${page}&limit=${limit}&status=${status}`;
    if(isUESchoolOfLife) {
      params += `&schooloflife=1&campus=${campus}`
    } else {
      if(campus) {
        params += `&campus=${campus}`
      }
    }
    if(mode == 'history') {
      params += `&history=1`
    }
    return this._http.get(`${PLANS_CALENDAR_URL}/${id}?${params}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getCalendarPastPlans(id: number, plan_type_id: number, page=1, limit=20, status = 'all', isUESchoolOfLife: boolean = false, campus: string = ''): Observable<any> {
    let params = `plan_type_id=${plan_type_id}&page=${page}&limit=${limit}&status=${status}`;
    if(isUESchoolOfLife) {
      params += `&schooloflife=1&campus=${campus}`
    } else {
      if(campus) {
        params += `&campus=${campus}`
      }
    }
    return this._http.get(`${PLANS_CALENDAR_URL}/${id}?${params}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchPlans(id: number = 0, mode: string = 'active'): Observable<any> {
    return this._http.get(`${PLANS_CALENDAR_URL}/${id}?${mode}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchPlansOtherDataCombined(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${PLANS_OTHER_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchPlansCombined(id: number = 0, mode: string = 'active', isUESchoolOfLife: boolean = false, campus: string = ''): Observable<any> {
    let url = `${PLANS_URL}/${id}/${mode}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1&campus=${campus}`
    } else {
      if(campus) {
        url += `?campus=${campus}`
      }
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchPastPlansCombined(id: number = 0, isUESchoolOfLife: boolean = false, campus: string = ''): Observable<any> {
    let url = `${PAST_PLANS_LIST_URL}/${id}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1&campus=${campus}`
    } else {
      if(campus) {
        url += `?campus=${campus}`
      }
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchPlanDetailsCombined(id: number = 0, planTypeId: number = 0, companyId: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${PLAN_DETAILS_URL}/${id}/${planTypeId}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchRegistrationData(slug: string = '', inviteGuid: string = ''): Observable<any> {
    return this._http.get(`${PLAN_REGISTRATION_DATA_URL}/${slug}/${inviteGuid}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  emailTemplate(id, event_id, type_id, user_id, aliasInLink): Observable<any> {
    return this._http.get(`${PLAN_EMAIL_TO_URL}/${id}/${event_id}/${type_id}/${user_id}/${aliasInLink}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getInviteLink(userId, eventId, eventTypeId, aliasInvLink): Observable<any> {
    return this._http.get(`${PLAN_INVITE_LINK_URL}/${userId}/${eventId}/${eventTypeId}/${aliasInvLink}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  updatePlanSlug(user_id, plan_type_id): Observable<any> {
    return this._http.post(`${PLAN_UPDATE_SLUG_URL}/${user_id}/${plan_type_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  updateUserAlias(user_id): Observable<any> {
    return this._http.post(`${PLAN_UPDATE_ALIAS_URL}/${user_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addJoinRequest( payload ): Observable<any> {
    return this._http.post(JOIN_REQUEST_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addPlanParticipant( plan_id: number, user_id: number ): Observable<any> {
    return this._http.post(`${JOIN_PLAN_URL}/${plan_id}/${user_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addGroupPlanParticipant(payload): Observable<any> {
    return this._http.post(JOIN_GROUP_PLAN_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  removeGroupPlanParticipant(payload): Observable<any> {
    return this._http.post(LEAVE_GROUP_PLAN_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  removePlanParticipant( plan_id: number, user_id: number ): Observable<any> {
    return this._http.post(`${LEAVE_PLAN_URL}/${plan_id}/${user_id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addToWaitingList(payload) {
    return this._http.post(ADD_TO_WAITING_LIST_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  removeFromWaitingList(payload): Observable<any> {
    return this._http.post(REMOVE_FROM_WAITING_LIST_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addPlanComment( plan_id: number, user_id: number, comment: string, approved: number = 1, company_id): Observable<any> {
    return this._http.post(`${ADD_PLAN_COMMENT_URL}/${plan_id}/${user_id}?comment=${comment}&approved=${approved}`,
        {
          'comment': comment,
          'approved': approved,
          'company_id': company_id
        },
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addGroupPlanComment( group_plan_id: number, user_id: number, comment: string, approved: number = 1, company_id: number): Observable<any> {
      const url = `${ADD_GROUP_PLAN_COMMENT_URL}/${group_plan_id}/${user_id}?comment=${comment}&approved=${approved}`
      const headers = {
        headers: this.headers
      }
      return this._http.post(url,{
        'comment' : comment,
        'approved': approved,
        'company_id': company_id
      }, headers).pipe(map(res => res));
  }

  deleteGroupPlanCommentHeart(id, planTypeId, param) {
      return this._http.post(`${DELETE_GROUP_PLAN_COMMENT_REACTION_URL}/${id}/${planTypeId}`,
        param
      )
  }

  heartGroupPlanComment(id, planTypeId, param): Observable<any> {
      return this._http.post(`${ADD_GROUP_PLAN_COMMENT_REACTION_URL}/${id}/${planTypeId}`,
        param,
        { headers: this.headers }
      ).pipe(map(res => res))
  }

  addGroupPlanCommentReply(id, planTypeId, param): Observable<any> {
      return this._http.post(`${ADD_GROUP_PLAN_COMMENT_REPLY_URL}/${id}/${planTypeId}`,
        param,
        { headers: this.headers }
      ).pipe(map(res => res))
  }

  getGroupPlanComments(id, planTypeId): Observable<any> {
      return this._http.get(`${GROUP_PLAN_COMMENTS_URL}/${id}/${planTypeId}`,
          { headers: this.headers }
      ).pipe(map(res => res));
  }

  deleteActivityComment(id, plan_type_id): Observable<any> {
    return this._http.post(`${DELETE_COMMENT_URL}/${id}/${plan_type_id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  answerEmailInviteQuestion(payload): Observable<any> {
    return this._http.post(ANSWER_EMAIL_INVITE_QUESTIONS_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deletePlan(plan_id, plan_type_id): Observable<any> {
    return this._http.delete(`${CLUB_PLAN_DELETE_URL}/${plan_id}/${plan_type_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteRecurringPlan(params): Observable<any> {
    return this._http.post(DELETE_RECURRING_SERIES_URL, params, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchPlansManagementData(id: number = 0, userId: number = 0, role: string = '', isUESchoolOfLife: boolean = false, startDate: any = '', endDate: any = ''): Observable<any> {
    let url = `${PLANS_MANAGEMENT_DATA_URL}/${id}/${userId}/${role}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1`
      if(startDate && endDate) {
        url += `&start=${startDate}&end=${endDate}`
      }
    } else {
      if(startDate && endDate) {
        url += `?start=${startDate}&end=${endDate}`
      }
    }

    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  confirmPlanParticipantAttendance(id, param): Observable<any> {
    return this._http.post(
      `${CONFIRM_PLAN_PARTICIPANT_ATTENDANCE_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  clearPlanParticipantAttendance(id, param): Observable<any> {
    return this._http.post(
      `${CLEAR_PLAN_PARTICIPANT_ATTENDANCE_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  confirmParticipantAttendance(id, param): Observable<any> {
    return this._http.post(
      `${CONFIRM_PARTICIPANT_ATTENDANCE_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  clearParticipantAttendance(id, param): Observable<any> {
    return this._http.post(
      `${CLEAR_PARTICIPANT_ATTENDANCE_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  confirmParticipant(id, param): Observable<any> {
    return this._http.post(
      `${CONFIRM_PARTICIPANT_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  clearConfirmation(id, param): Observable<any> {
    return this._http.post(
      `${CLEAR_CONFIRMATION_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  confirmPlanParticipant(id, param): Observable<any> {
    return this._http.post(
      `${CONFIRM_PLAN_PARTICIPANT_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  clearPlanConfirmation(id, param): Observable<any> {
    return this._http.post(
      `${CLEAR_PLAN_CONFIRMATION_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  createPlan( entityId, userId, id, planForm, file, imageFile, zoomApiKey, zoomApiSecret, zoomStartUrl, zoomJoinUrl, zoomMeetingId, zoomPassword, typeOfActivity, prolongedDaysNumber, prolongedActivities,isShowAttendee:any=false,isShowComments:any=false,isShowDescription:any=false,isShowPrice:any=false, draft: any = 0, activityCodeActive, allowCourseAccess:any=false): Observable<any> {
    let formData = new FormData();
    if(planForm.group_id) {
        formData.append( 'group_id', planForm.group_id );
    }
    
    formData.append( 'plan_type_id', id );
    formData.append( 'entity_id', entityId );
    formData.append( 'user_id', userId );
    formData.append( 'title', planForm.title_es ? planForm.title_es : planForm.title );
    formData.append( 'title_en', planForm.title_en ? planForm.title_en : planForm.title );
    formData.append( 'title_fr', planForm.title_fr ? planForm.title_fr : planForm.title );
    formData.append( 'title_eu', planForm.title_eu ? planForm.title_eu : planForm.title );
    formData.append( 'title_ca', planForm.title_ca ? planForm.title_ca : planForm.title );
    formData.append( 'title_de', planForm.title_de ? planForm.title_de : planForm.title );
    formData.append( 'address', planForm.address );
    formData.append( 'meeting_point', planForm.meeting_point );
    formData.append( 'show_attendee', isShowAttendee );
    formData.append( 'show_comments', isShowComments );
    formData.append( 'show_description', isShowDescription );
    formData.append( 'show_price', isShowPrice );
    formData.append( 'school_of_life', planForm.school_of_life );
    formData.append( 'age_group_id', planForm.age_group_id );
    formData.append( 'default_cover', planForm.default_cover );
    formData.append( 'video', planForm.video );
    formData.append( 'assign_teacher', planForm.assign_teacher );

    if(entityId == 32) {
      formData.append( 'additional_properties_course_access', allowCourseAccess == true ? '1' : '0' );
      formData.append( 'additional_properties_campus_ids', planForm.additional_properties_campus_ids );
      formData.append( 'additional_properties_business_unit_ids', planForm.additional_properties_business_unit_ids );
      formData.append( 'additional_properties_faculty_ids', planForm.additional_properties_faculty_ids );
      formData.append( 'additional_properties_type_ids', planForm.additional_properties_type_ids );
      formData.append( 'additional_properties_segment_ids', planForm.additional_properties_segment_ids );
      formData.append( 'additional_properties_branding_ids', planForm.additional_properties_branding_ids );
    }

    if(activityCodeActive) {
      formData.append( 'activity_code', planForm.activity_code );
      if(entityId == 32) {
        formData.append( 'activity_code_sigeca', planForm.activity_code_sigeca );
      }
    }

    if(planForm.plan_date) {
        formData.append( 'plan_date', planForm.plan_date );
    }

    if(planForm.end_date) {
        formData.append( 'end_date', planForm.end_date );
    }

    if(planForm.time_slot) {
        formData.append( 'time_slot', planForm.time_slot );
    }

    let seats = 0;
    if(planForm.seats) {
        if(parseInt(planForm.seats) > 0) {
            seats = planForm.seats;
        }
    }
    if(planForm.seats) {
        formData.append( 'seats', seats.toString() );
    }
    formData.append( 'member_seats', planForm.member_seats?.toString() || '');
    formData.append( 'guest_seats', planForm.guest_seats?.toString() || '');

    formData.append( 'link', planForm.link );

    let price = 0;
    if(planForm.price) {
        if(parseInt(planForm.price) > 0) {
            price = planForm.price;
            if(planForm.payment_type) {
                formData.append( 'payment_type', planForm.payment_type );
            }
        }
    }

    formData.append( 'price', price.toString() );
    formData.append( 'privacy', planForm.privacy );
    formData.append( 'private_type', planForm.private_type );
    formData.append( 'fk_group_id', planForm.fk_group_id );
    formData.append( 'description', planForm.descriptionEs && planForm.descriptionEs != 'undefined' ? planForm.descriptionEs : (planForm.description || '') );
    formData.append( 'description_en', planForm.descriptionEn && planForm.descriptionEn != 'undefined' ? planForm.descriptionEn : (planForm.description || '') );
    formData.append( 'description_fr', planForm.description_fr && planForm.descriptionFr != 'undefined' ? planForm.descriptionFr : (planForm.description || '') );
    formData.append( 'description_eu', planForm.description_eu && planForm.descriptionEu != 'undefined' ? planForm.descriptionEu : (planForm.description || '') );
    formData.append( 'description_ca', planForm.description_ca && planForm.descriptionCa != 'undefined' ? planForm.descriptionCa : (planForm.description || '') );
    formData.append( 'description_de', planForm.description_de && planForm.descriptionDe != 'undefined' ? planForm.descriptionDe : (planForm.description || '') );

    if(planForm.latitude) {
        formData.append( 'latitude', planForm.latitude );
    }

    if(planForm.longitude) {
        formData.append( 'longitude', planForm.longitude );
    }
    
    formData.append( 'medical', planForm.medical );
    formData.append( 'company_id', planForm.company_id);
    formData.append( 'image_file', imageFile);
    if(planForm?.category_id) {
      formData.append( 'category_id', planForm.category_id.map( (data) => { return data.fk_supercategory_id }).join());
    }

    formData.append( 'multiple_cities', planForm.multiple_cities );
    if(planForm.multiple_cities == 1 && planForm.city_id) {
        formData.append( 'city_id', planForm.city_id.map( (data) => { return data.id }).join());
    }
    formData.append( 'draft', draft );

    if(planForm.repeat_event == 1) {
        formData.append( 'repeat_event', planForm.repeat_event )
        formData.append( 'repeat_event_unit', planForm.repeat_event_unit )
        formData.append( 'repeat_event_on_order', planForm.repeat_event_on_order )
        formData.append( 'repeat_event_on_day', planForm.repeat_event_on_day )
        formData.append("repeat_event_every_number", planForm.repeat_event_every_number)
        formData.append("repeat_event_every_duration", planForm.repeat_event_every_duration)
        formData.append("repeat_event_every_on_for_weeks", planForm.repeat_event_every_on_for_weeks) 
        formData.append("repeat_event_every_on_for_months", planForm.repeat_event_every_on_for_months)
        formData.append("repeat_event_recurring_end", planForm.repeat_event_recurring_end)
        formData.append("repeat_event_until_occurences", planForm.repeat_event_until_occurences)

        if(planForm.repeat_event_until) {
            formData.append( 'repeat_event_until', planForm.repeat_event_until )
        }
    }
    
    if(planForm.subcategory_id) {
        formData.append( 'subcategory_id', planForm.subcategory_id.map( (data) => { return data.id }).join());
    }

    if(planForm.event_type_id) {
        formData.append( 'event_type_id', planForm.event_type_id );
    }
    if(planForm.event_category_id) {
        formData.append( 'event_category_id', planForm.event_category_id );
    }
    if(planForm.event_subcategory_id) {
        formData.append( 'event_subcategory_id', planForm.event_subcategory_id );
    }
    if(planForm.invitation_link) {
        formData.append( 'invitation_link', planForm.invitation_link );
    }
    if(planForm.zoom_link) {
        formData.append( 'zoom_link', planForm.zoom_link );
    }
    if(planForm.zoom_link_text) {
        formData.append( 'zoom_link_text', planForm.zoom_link_text );
    }
    if(planForm.teams_link) {
        formData.append( 'teams_link', planForm.teams_link );
    }
    if(planForm.teams_link_text) {
        formData.append( 'teams_link_text', planForm.teams_link_text );
    }
    if(planForm.youtube_link) {
        formData.append( 'youtube_link', planForm.youtube_link );
    }
    if(planForm.youtube_link_text) {
        formData.append( 'youtube_link_text', planForm.youtube_link_text );
    }
    if(planForm.slug) {
        formData.append( 'slug', planForm.slug );
    }

    if(entityId == 12) {
        formData.append( 'netcultura', planForm.netcultura );
    }

    if(zoomApiKey && zoomApiSecret && zoomStartUrl && zoomJoinUrl) {
        formData.append( 'zoom_api_key', zoomApiKey );
        formData.append( 'zoom_api_secret', zoomApiSecret );
        formData.append( 'zoom_start_url', zoomStartUrl );
        formData.append( 'zoom_join_url', zoomJoinUrl );
        formData.append( 'zoom_meeting_id', zoomMeetingId );
        formData.append( 'zoom_password', zoomPassword );
    }

    if(typeOfActivity) {
        formData.append( 'activity_type_id', typeOfActivity );
    }
    if(prolongedDaysNumber) {
        formData.append( 'activity_days', prolongedDaysNumber );
    }
    if(prolongedActivities) {
        formData.append( 'event_prolonged_activities', JSON.stringify(prolongedActivities) );
    }

    formData.append( 'hour_canary', planForm.hour_canary );
    formData.append( 'guest_member_seats', planForm.guest_member_seats );
    formData.append( 'show_seats', planForm.show_seats );
    formData.append( 'invite_link', planForm.invite_link );
    formData.append( 'waiting_list', planForm.waiting_list );
    formData.append( 'stripe_pay', planForm.stripe_pay ? planForm.stripe_pay : 0 );
    formData.append( 'bizum_pay', planForm.bizum_pay ? planForm.bizum_pay : 0 );
    formData.append( 'credits', planForm.credits );
    formData.append( 'credits_value', planForm.credits_value );
    formData.append( 'featured', planForm.featured );
    formData.append( 'require_approval', planForm.require_approval );
    formData.append( 'external_registration', planForm.external_registration );
    formData.append( 'request_dni', planForm.request_dni );
    if(planForm.speaker_id) {
        formData.append( 'speaker_id', planForm.speaker_id );
    }

    // adding guest speaker if exists
    formData.append( 'guest_speaker', planForm.guest_speaker );
    if (file) {
        const filename = 'p_' + userId + '_' + this.getTimestamp();
        formData.append('destination', id == 4 ? './uploads/group_plans/' : './uploads/ie_plans/');
        formData.append('filepath', id == 4 ? ('./uploads/group_plans/' + filename + '.jpg') : ('./uploads/ie_plans/' + filename + '.jpg'));
        formData.append('filenamewoextension', filename);
        formData.append('image', file.image, filename + '.jpg');
    }

    const url = id == 4
        ? CREATE_CLUB_PLAN_URL
        : CREATE_PLAN_URL

    return this._http.post(
        `${url}`,
        formData
    ).pipe(map(res => res));
  }

  createApprovalNotification(payload): Observable<any> {
    return this._http.post(
      CREATE_PLAN_FOR_APPROVAL_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  getActivityCities(id, typeId): Observable<any> {
    return this._http.get(`${ACTIVITY_CITIES_URL}/${id}/${typeId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  updatePlan( entityId, userId, id, planTypeId, planForm, file, imageFile, typeOfActivity, prolongedDaysNumber, prolongedActivities, publish: any = 1, activityCodeActive): Observable<any> {
    let formData = new FormData();

    if(planForm.fk_group_id) {
        formData.append( 'group_id', planForm.group_id );
    }
    formData.append( 'plan_id', id );
    formData.append( 'entity_id', entityId );
    formData.append( 'user_id', userId );
    formData.append( 'title', planForm.title_es ? planForm.title_es : planForm.title );
    formData.append( 'title_en', planForm.title_en ? planForm.title_en : planForm.title );
    formData.append( 'title_fr', planForm.title_fr ? planForm.title_fr : planForm.title );
    formData.append( 'title_eu', planForm.title_eu ? planForm.title_eu : planForm.title );
    formData.append( 'title_ca', planForm.title_ca ? planForm.title_ca : planForm.title );
    formData.append( 'title_de', planForm.title_de ? planForm.title_de : planForm.title );
    formData.append( 'address', planForm.address );
    formData.append( 'meeting_point', planForm.meeting_point );
    formData.append( 'show_attendee', planForm.isShowAttendee );
    formData.append( 'show_comments', planForm.isShowComments );
    formData.append( 'show_description', planForm.isShowDescription );
    formData.append( 'show_price', planForm.isShowPrice );
    formData.append( 'school_of_life', planForm.school_of_life );
    formData.append( 'show', planForm.show );
    formData.append( 'orig_image', planForm.orig_image );
    formData.append( 'age_group_id', planForm.age_group_id );
    formData.append( 'default_cover', planForm.default_cover );
    formData.append( 'video', planForm.video );
    formData.append( 'assign_teacher', planForm.assign_teacher );

    if(entityId == 32) {
      formData.append( 'additional_properties_course_access', planForm.additional_properties_course_access );
      formData.append( 'additional_properties_campus_ids', planForm.additional_properties_campus_ids );
      formData.append( 'additional_properties_business_unit_ids', planForm.additional_properties_business_unit_ids );
      formData.append( 'additional_properties_faculty_ids', planForm.additional_properties_faculty_ids );
      formData.append( 'additional_properties_type_ids', planForm.additional_properties_type_ids );
      formData.append( 'additional_properties_segment_ids', planForm.additional_properties_segment_ids );
      formData.append( 'additional_properties_branding_ids', planForm.additional_properties_branding_ids );
    }

    if(activityCodeActive) {
      formData.append( 'activity_code', planForm.activity_code );
      if(entityId == 32) {
        formData.append( 'activity_code_sigeca', planForm.activity_code_sigeca );
      }
    }

    if(planForm.plan_date) {
        formData.append( 'plan_date', planForm.plan_date );
    }

    if(planForm.end_date) {
        formData.append( 'end_date', planForm.end_date );
    }

    formData.append( 'time_slot', planForm.time_slot );
    formData.append( 'plan_type_id', planForm.plan_type_id );

    let seats = 0;
    if(planForm.seats) {
        if(parseInt(planForm.seats) > 0) {
            seats = planForm.seats;
        }
    }
    formData.append( 'seats', seats.toString() );

    formData.append( 'member_seats', planForm.member_seats?.toString() || '');
    formData.append( 'guest_seats', planForm.guest_seats?.toString() || '');
  
    formData.append( 'link', planForm.link );

    let price = 0;
    if(planForm.price) {
        if(parseInt(planForm.price) > 0) {
            price = planForm.price;
            if (planForm.payment_type) {
                formData.append( 'payment_type', planForm.payment_type );
            }
        }
    }

    formData.append( 'price', price.toString() );
    formData.append( 'medical', planForm.medical );
    formData.append( 'privacy', planForm.privacy );
    formData.append( 'private_type', planForm.private_type );

    if(planForm.fk_group_id) {
        formData.append( 'fk_group_id', planForm.fk_group_id );
    }
    formData.append( 'description', planForm.descriptionEs && planForm.descriptionEs != 'undefined' ? planForm.descriptionEs : (planForm.description || '') );
    formData.append( 'description_en', planForm.descriptionEn && planForm.descriptionEn != 'undefined' ? planForm.descriptionEn : (planForm.description || '') );
    formData.append( 'description_fr', planForm.descriptionFr && planForm.descriptionFr != 'undefined' ? planForm.descriptionFr : (planForm.description || '') );
    formData.append( 'description_eu', planForm.descriptionEu && planForm.descriptionEu != 'undefined' ? planForm.descriptionEu : (planForm.description || '') );
    formData.append( 'description_ca', planForm.descriptionCa && planForm.descriptionCa != 'undefined' ? planForm.descriptionCa : (planForm.description || '') );
    formData.append( 'description_de', planForm.descriptionDe && planForm.descriptionDe != 'undefined' ? planForm.descriptionDe : (planForm.description || '') );

    if(planForm.latitude) {
        formData.append( 'latitude', planForm.latitude );
    }

    if(planForm.longitude) {
        formData.append( 'longitude', planForm.longitude );
    }
    
    formData.append( 'company_id', planForm.company_id);
    formData.append( 'image_file', imageFile);

    if(entityId == 12) {
      if(planForm?.kcn_event_category_id) {
          formData.append( 'category_id', planForm?.kcn_event_category_id?.map( (data) => { return data.id }).join());
      }
  } else {
      if(planForm?.category_id) {
          formData.append( 'category_id', planForm?.category_id?.map( (data) => { return data.fk_supercategory_id }).join());
      }
  }

    formData.append( 'multiple_cities', planForm.multiple_cities );
    if(planForm.multiple_cities == 1 && planForm.city_id) {
        formData.append( 'city_id', planForm.city_id.map( (data) => { return data.id }).join());
    }
    formData.append( 'publish', publish );

    if(planForm.subcategory_id) {
        formData.append( 'subcategory_id', planForm.subcategory_id.map( (data) => { return data.id }).join());
    }

    if(planForm.event_type_id) {
        formData.append( 'event_type_id', planForm.event_type_id );
    }
    if(planForm.event_category_id) {
        formData.append( 'event_category_id', planForm.event_category_id );
    }
    if(planForm.event_subcategory_id) {
        formData.append( 'event_subcategory_id', planForm.event_subcategory_id );
    }
    if(planForm.invitation_link) {
        formData.append( 'invitation_link', planForm.invitation_link );
    }
    formData.append( 'zoom_link', planForm.zoom_link || '' );
    formData.append( 'zoom_link_text', planForm.zoom_link_text || '' );
    formData.append( 'teams_link', planForm.teams_link || '' );
    formData.append( 'teams_link_text', planForm.teams_link_text || '' );
    formData.append( 'youtube_link', planForm.youtube_link || '' );
    formData.append( 'youtube_link_text', planForm.youtube_link_text || '' );

    if(entityId == 12) {
        formData.append( 'netcultura', planForm.netcultura );
    }

    if(typeOfActivity) {
        formData.append( 'activity_type_id', typeOfActivity );
    }
    if(prolongedDaysNumber) {
        formData.append( 'activity_days', prolongedDaysNumber );
    }
    if(prolongedActivities) {
        formData.append( 'event_prolonged_activities', JSON.stringify(prolongedActivities) );
    }

    formData.append( 'hour_canary', planForm.hour_canary );
    formData.append( 'guest_member_seats', planForm.guest_member_seats );
    formData.append( 'show_seats', planForm.show_seats );
    formData.append( 'invite_link', planForm.invite_link );
    formData.append( 'waiting_list', planForm.waiting_list );
    formData.append( 'stripe_pay', planForm.stripe_pay ? planForm.stripe_pay : 0 );
    formData.append( 'bizum_pay', planForm.bizum_pay ? planForm.bizum_pay : 0 );
    formData.append( 'credits', planForm.credits );
    formData.append( 'credits_value', planForm.credits_value );
    formData.append( 'featured', planForm.featured );
    formData.append( 'external_registration', planForm.external_registration );
    formData.append( 'request_dni', planForm.request_dni );
    if(planForm.speaker_id) {
        formData.append( 'speaker_id', planForm.speaker_id );
    }

    // adding guest speaker if exists
    formData.append( 'guest_speaker', planForm.guest_speaker );
    if (file) {
        const filename = 'p_' + userId + '_' + this.getTimestamp();
        formData.append('image', file.image, filename + '.jpg');
    }

    if(planForm.additional_content) {
        formData.append( 'additional_content', planForm.additional_content );
    }
    if(planForm.organizer_comments) {
        formData.append( 'organizer_comments', planForm.organizer_comments );
    }
    if(planForm.participants_comments) {
        formData.append( 'participants_comments', planForm.participants_comments );
    }

    if(id > 0) {
      formData.append( 'slug', planForm.slug );
    }

    const url = planTypeId == 4
        ? EDIT_CLUB_PLAN_URL
        : EDIT_PLAN_URL

    return this._http.put(
        `${url}`,
        formData
    ).pipe(map(res => res));
  }

  checkExistingRegistration(payload): Observable<any> {
    return this._http.post(CHECK_PLAN_REGISTRATION_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  eventRegister(payload): Observable<any> {
    return this._http.post(PLAN_REGISTRATION_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  companyRegisterInvite(payload): Observable<any> {
    return this._http.post(PLAN_GUEST_REGISTRATION_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getActivityCodeData(eventId, eventTypeId, userGuid): Observable<any> {
    return this._http.get(`${ACTIVITY_CODE_DATA_URL}/${eventId}/${eventTypeId}/${userGuid}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  confirmAttendance(payload): Observable<any> {
    return this._http.post(CONFIRM_ATTENDANCE_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }
  
  saveFeaturedText(payload): Observable<any> {
    return this._http.post(EDIT_FEATURED_TEXT_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  submitActivityRating(payload): Observable<any> {
    return this._http.post(SUBMIT_ACTIVITY_RATING_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }
  
  getAllRegistrationFields(id): Observable<any> {
    return this._http.get(`${ALL_GUEST_REGISTRATION_FIELDS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getGuestRegistrationFields(id): Observable<any> {
    return this._http.get(`${GUEST_REGISTRATION_FIELDS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  addGuestRegistrationField(payload): Observable<any> {
    return this._http.post(ADD_GUEST_REGISTRATION_FIELDS_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchCreditsData(id, isUESchoolOfLife): Observable<any> {
    let url = `${ACTIVITY_CREDITS_URL}/${id}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1`
    }
    return this._http.get(url,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editGuestRegistrationField(payload): Observable<any> {
    return this._http.put(EDIT_GUEST_REGISTRATION_FIELDS_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteGuestRegistrationField(id): Observable<any> {
    return this._http.delete(
        `${DELETE_GUEST_REGISTRATION_FIELDS_URL}/${id}`,
        {},
    ).pipe(map(res => res));
  }

  getPlan(id: number, planTypeId: number): Observable<any> {
    return this._http.get(`${CHECKOUT_PLAN_DETAILS_URL}/${id}/${planTypeId}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  subscribeEventStripe(eventId, typeId, userId, companyId, payload): Observable<any> {
    return this._http.post(
      `${PLAN_PAYMENT_URL}/${eventId}/${typeId}/${userId}/${companyId}`,
      payload
    ).pipe(
      map(res => {
        const result = res
        return result;
      })
    );
  }

  salesPeople(id): Observable<any> {
    return this._http.get(`${SALES_PEOPLE_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  assignGuestToSalesPerson(payload): Observable<any> {
    return this._http.post(ASSIGN_SALES_PERSON_URL, 
      payload
    ).pipe(map(res => res));
  }

  assignSalesPersonToEvent(payload): Observable<any> {
    return this._http.post(ASSIGN_SALES_PERSON_EVENT_URL, 
      payload
    ).pipe(map(res => res));
  }

  getCategoryEvents(categoryId): Observable<any> {
    return this._http.get(`${CATEGORY_EVENTS_URL}/${categoryId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getInvoiceDetails(invoiceId, companyId): Observable<any> {
    return this._http.get(`${INVOICE_DETAILS_URL}/${invoiceId}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getEventRegistrationTemplateByGuid(slug, invite_guid): Observable<any> {
    return this._http.get(`${EVENT_TEMPLATE_URL}/${slug}/${invite_guid}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  sendCreditsData(payload): Observable<any> {
    return this._http.post(SEND_CREDITS_DATA_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  sendConfirmAttendanceEmail(payload): Observable<any> {
    return this._http.post(SEND_CONFIRM_ATTENDANCE_EMAIL_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }
  
  uploadPlanImage(blob, filename): Observable<any> {
    const formData = new FormData()
    const file_name = 'p_' + this.getTimestamp()
    formData.append('filename', file_name + '.jpg')
    formData.append('image', blob, file_name + '.jpg')
    return this._http.post(UPLOAD_PLAN_IMAGE_URL, formData)
  }

  sendPlanDetailsUpdatedEmail(payload): Observable<any> {
    return this._http.post(
      `${PLAN_DETAILS_UPDATED_EMAIL_URL}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addAdditionalAlias(payload): Observable<any> {
    return this._http.post(ADD_ALIAS_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editAlias(payload, id): Observable<any> {
    return this._http.post(
      `${EDIT_ALIAS_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteAlias(payload, id): Observable<any> {
    return this._http.post(
      `${DELETE_ALIAS_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getGuestHistory(companyId, startDate, endDate): Observable<any> {
    let url = `${GUEST_HISTORY_LIST_URL}/${companyId}`
    if(startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`
    }
    return this._http.get(url, 
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  approvePlanComment(id): Observable<any> {
    return this._http.post(`${APPROVE_PLAN_COMMENT_URL}/${id}`,
      {},
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  approveGroupPlanComment(id): Observable<any> {
    return this._http.post(`${APPROVE_GROUP_PLAN_COMMENT_URL}/${id}`,
      {},
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editPlanStatus(params): Observable<any> {
    return this._http.post(EDIT_PLAN_STATUS_URL,
        params
    ).pipe(map(res => res));
  }

  getAgeGroups(id): Observable<any> {
    return this._http.get(`${AGE_GROUPS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addAgeGroup(payload): Observable<any> {
    return this._http.post(ADD_AGE_GROUP_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editAgeGroup(id, payload): Observable<any> {
    return this._http.put(`${EDIT_AGE_GROUP_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteAgeGroup(id, companyId): Observable<any> {
    return this._http.delete(`${DELETE_AGE_GROUP_URL}/${id}/${companyId}`,
      {},
    ).pipe(map(res => res));
  }

  uploadPlanCoverVideo(payload): Observable<any> {
    return this._http.post(`${PLAN_VIDEO_UPLOAD_URL}`, payload).pipe(map(res => res));
  }
  
  getActivityPaymentOptions(id, typeId): Observable<any> {
    return this._http.get(`${ACTIVITY_PAYMENT_OPTIONS_URL}/${id}/${typeId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  subscribeEventBizum(eventId, typeId, userId, companyId, payload): Observable<any> {
    return this._http.post(
      `${PLAN_PAYMENT_BIZUM_URL}/${eventId}/${typeId}/${userId}/${companyId}`,
      payload
    ).pipe(
      map(res => {
        const result = res
        return result;
      })
    );
  }

  confirmBizumPlanParticipant(id, param): Observable<any> {
    return this._http.post(
      `${CONFIRM_BIZUM_PLAN_PARTICIPANT_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  confirmBizumGroupPlanParticipant(id, param): Observable<any> {
    return this._http.post(
      `${CONFIRM_BIZUM_GROUP_PLAN_PARTICIPANT_URL}/${id}`, 
      param
    ).pipe(map(res => res));
  }

  getActivityTeachers(id, typeId): Observable<any> {
    return this._http.get(`${ACTIVITY_TEACHERS_URL}/${id}/${typeId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addActivityTeacher(payload): Observable<any> {
    return this._http.post(ADD_ACTIVITY_TEACHER_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editActivityTeacher(payload): Observable<any> {
    return this._http.put(EDIT_ACTIVITY_TEACHER_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteActivityTeacher(payload): Observable<any> {
    return this._http.post(`${DELETE_ACTIVITY_TEACHER_URL}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }
}