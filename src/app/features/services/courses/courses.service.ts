import { Injectable } from "@angular/core";
import { Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  ADD_COURSE_DOWNLOAD_URL,
  ADD_COURSE_MODULE__URL,
  ADD_COURSE_UNIT_URL,
  ADD_COURSE_URL,
  ADD_CTA_URL,
  ADMIN_COURSE_UNITS_URL,
  ASSIGN_USER_COURSES_URL,
  COURSES_ADMIN_LIST_URL,
  COURSES_COMBINED_URL,
  COURSES_MANAGEMENT_DATA_URL,
  COURSES_URL,
  COURSE_ASSESSMENT_ITEMS_URL,
  COURSE_CATEGORIES_URL,
  COURSE_CATEGORY_ACCESS_EDIT_URL,
  COURSE_CATEGORY_ACCESS_ROLES_URL,
  COURSE_CATEGORY_ACCESS_URL,
  COURSE_CATEGORY_ADD_URL,
  COURSE_CATEGORY_DELETE_URL,
  COURSE_CATEGORY_EDIT_URL,
  COURSE_CATEGORY_MAPPING_URL,
  COURSE_CITIES_URL,
  COURSE_COMPLETE_EVALUATE_URL,
  COURSE_CTA_URL,
  COURSE_DETAILS_ADMIN_URL,
  COURSE_DETAILS_URL,
  COURSE_DETAIL_URL,
  COURSE_DOWNLOADS_URL,
  COURSE_EXCEPION_USERS_URL,
  COURSE_SECTIONS_URL,
  COURSE_STUDENTS_URL,
  COURSE_SUBSCRIPTIONS_URL,
  COURSE_TUTORS_URL,
  COURSE_UNITS_URL,
  COURSE_UNIT_DETAILS_URL,
  COURSE_WALL_URL,
  CREATE_COURSE_ASSESSMENT_ITEM_URL,
  DELETE_COURSE_ASSESSMENT_ITEM_URL,
  DELETE_COURSE_DOWNLOAD_URL,
  DELETE_COURSE_MODULE_URL,
  DELETE_COURSE_UNIT_URL,
  DELETE_COURSE_URL,
  DELETE_CTA_URL,
  DUPLICATE_COURSE_URL,
  EDIT_COURSE_ASSESSMENT_ITEM_URL,
  EDIT_COURSE_DOWNLOAD_URL,
  EDIT_COURSE_LOCK_URL,
  EDIT_COURSE_MODULE_URL,
  EDIT_COURSE_STATUS_URL,
  EDIT_COURSE_UNIT_PHOTO_URL,
  EDIT_COURSE_UNIT_URL,
  EDIT_COURSE_URL,
  EDIT_CTA_URL,
  EDIT_SEQUENCE_URL,
  EDIT_STUDENT_CREDIT_URL,
  EDIT_VIDEO_PHOTO_URL,
  FEATURES_MAPPING_URL,
  MARK_COMPLETE_URL,
  NO_COURSE_STUDENTS_URL,
  PAYMENT_COURSE_DETAILS_URL,
  PAYMENT_COURSE_URL,
  RESEND_ACCESS_URL,
  RESET_COURSE_ASSESSMENT_URL,
  RESET_STATUS_URL,
  SAVE_COURSE_SESSION_URL,
  STUDENT_COURSE_ASSESSMENT_URL,
  SUBMIT_COURSE_ASSESSMENT_URL,
  UNASSIGN_USER_COURSE_URL,
  UNIT_TYPES_URL,
  USER_ROLE_URL,
  USER_URL,
  VIMEO_EMBED_URL,
  VISIT_COURSE_UNIT_URL,
} from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class CoursesService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  getCourseCategoryMapping(id): Observable<any> {
    return this._http.get(`${COURSE_CATEGORY_MAPPING_URL}/${id}`, { headers: this.headers }).pipe(map(res => res));
  }

  getCourseCategories(id): Observable<any> {
    return this._http.get(`${COURSE_CATEGORIES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addCourseCategory(payload): Observable<any> {
    return this._http.post(COURSE_CATEGORY_ADD_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editCourseCategory(id, payload): Observable<any> {
    return this._http.post(`${COURSE_CATEGORY_EDIT_URL}/${id}`, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteCourseCategory(id, companyId): Observable<any> {
    return this._http.post(`${COURSE_CATEGORY_DELETE_URL}/${id}/${companyId}`, {}, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getCourseCategoryAccessRoles(id) {
    return this._http.get(`${COURSE_CATEGORY_ACCESS_ROLES_URL}/${id}`, { 
      headers: this.headers 
    });
  }

  editCourseCategoryAccess(payload) {
    return this._http.post(COURSE_CATEGORY_ACCESS_EDIT_URL, payload);
  }

  fetchCoursesCombined(id: number = 0, userId: number = 0, isUESchoolOfLife: boolean = false, category: string = ''): Observable<any> {
    let url = `${COURSES_COMBINED_URL}/${id}/${userId}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1`
      if(category) {
        url += `&category=${category}`
      }
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getCombinedCoursesPrefetch(companyId, userId): Observable<any[]> {
    let featureId = 11;
    let tutorFeatureId = 20;
    let courseSubscriptions = this._http.get(`${COURSE_SUBSCRIPTIONS_URL}/${userId}`);
    let courseTutors = this._http.get(`${COURSE_TUTORS_URL}/${companyId}`);
    let courseCategoriesAccessRoles = this._http.get(`${COURSE_CATEGORY_ACCESS_URL}/${companyId}`);
    let courseCategoryMapping = this._http.get(`${COURSE_CATEGORY_MAPPING_URL}/${companyId}`);
    let user = this._http.get(`${USER_URL}/${userId}`);
    let allCourseCategories = this._http.get(`${COURSE_CATEGORIES_URL}/${companyId}`);
    let courseExceptionUser = this._http.get(`${COURSE_EXCEPION_USERS_URL}/${userId}`);
    let roles = this._http.get(`${USER_ROLE_URL}/${userId}`);
    let subfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${featureId}`);
    let tutorSubfeatures = this._http.get(`${FEATURES_MAPPING_URL}/${companyId}/${tutorFeatureId}`);

    return forkJoin([
      courseSubscriptions, 
      courseTutors, 
      courseCategoriesAccessRoles, 
      courseCategoryMapping, 
      user, 
      allCourseCategories, 
      courseExceptionUser, 
      roles,
      subfeatures,
      tutorSubfeatures
    ]);
  }

  fetchCourse(id, companyId, userId): Observable<any> {
    return this._http.get(`${COURSE_DETAILS_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchCourseAdmin(id, companyId, userId): Observable<any> {
    return this._http.get(`${COURSE_DETAILS_ADMIN_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchCourseUnit(courseid, unitId, companyId, userId): Observable<any> {
    return this._http.get(`${COURSE_UNIT_DETAILS_URL}/${courseid}/${unitId}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getVimeoEmbed(id, token): Observable<any> {
    return this._http.get(`${VIMEO_EMBED_URL}/${id}/${token}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  markComplete(id, payload) {
    return this._http.post(`${MARK_COMPLETE_URL}/${id}`, payload);
  }

  resetStatus(id, payload) {
    return this._http.post(`${RESET_STATUS_URL}/${id}`, payload);
  }

  getCourseSections(id): Observable<any> {
    return this._http.get(`${COURSE_SECTIONS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCTAs(id): Observable<any> {
    return this._http.get(`${COURSE_CTA_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCourseDownloads(id): Observable<any> {
    return this._http.get(`${COURSE_DOWNLOADS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  setUnitVisited(id): Observable<any> {
    return this._http.put(`${VISIT_COURSE_UNIT_URL}/${id}`,
      { headers: this.headers }
    )
    .pipe(map(res => res));
  }

  saveCourseSession(payload): Observable<any> {
    return this._http.post(SAVE_COURSE_SESSION_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getAllCourses(id): Observable<any> {
    return this._http.get(`${COURSES_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCourseStudentsReport(id): Observable<any> {
    return this._http.get(`${COURSE_STUDENTS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getNoCourseStudentsReport(id): Observable<any> {
    return this._http.get(`${NO_COURSE_STUDENTS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  assignUserToCourses(payload, courseId): Observable<any> {
    return this._http.post(`${ASSIGN_USER_COURSES_URL}/${courseId}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res))
  } 

  unassignUserFromCourse(payload): Observable<any> {
    return this._http.post(`${UNASSIGN_USER_COURSE_URL}/${payload?.courseId}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res))
  }  

  resendCourseAccess(params): Observable<any> {
    return this._http.post(RESEND_ACCESS_URL,
        params,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCourseUnitDetails(userId, companyId, courseId): Observable<any> {
    return this._http.get(`${COURSE_UNITS_URL}/${userId}/${companyId}/${courseId}`,
      {headers : this.headers}
    ).pipe(map(res => res));
  }

  updateStudentCredits(payload): Observable<any> {
    return this._http.post(EDIT_STUDENT_CREDIT_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  fetchAdminCourses(id, userId, isUESchoolOfLife: boolean = false): Observable<any> {
    let url = `${COURSES_ADMIN_LIST_URL}/${id}/${userId}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1`
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editCourseStatus(params): Observable<any> {
    return this._http.post(EDIT_COURSE_STATUS_URL,
        params
    ).pipe(map(res => res));
  }

  editCourseLocked(params): Observable<any> {
    return this._http.post(EDIT_COURSE_LOCK_URL,
        params
    ).pipe(map(res => res));
  }

  deleteCourse(id): Observable<any> {
    return this._http.post(`${DELETE_COURSE_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  duplicateCourse(id): Observable<any> {
    return this._http.post(`${DUPLICATE_COURSE_URL}/${id}`,
      {}
    ).pipe(map(res => res));
  }

  addCourse(params, file): Observable<any> {
    const url = ADD_COURSE_URL;
    let formData = new FormData();

    formData.append( 'title', params.title );
    formData.append( 'title_en', params.title_en ? params.title_en : params.title );
    formData.append( 'title_fr', params.title_fr ? params.title_fr : params.title );
    formData.append( 'title_eu', params.title_eu ? params.title_eu : params.title );
    formData.append( 'title_ca', params.title_ca ? params.title_ca : params.title );
    formData.append( 'title_de', params.title_de ? params.title_de : params.title );
    formData.append( 'title_it', params.title_it ? params.title_it : params.title );
    formData.append( 'description', params.description );
    formData.append( 'description_en', params.description_en ? params.description_en : params.description );
    formData.append( 'description_fr', params.description_fr ? params.description_fr : params.description );
    formData.append( 'description_eu', params.description_eu ? params.description_eu : params.description );
    formData.append( 'description_ca', params.description_ca ? params.description_ca : params.description );
    formData.append( 'description_de', params.description_de ? params.description_de : params.description );
    formData.append( 'description_it', params.description_it ? params.description_it : params.description );
    formData.append( 'date', params.date );
    formData.append( 'points', params.points );
    formData.append( 'created_by', params.created_by );
    formData.append( 'company_id', params.company_id );
    formData.append( 'category', params.category );
    formData.append( 'difficulty', params.difficulty ? params.difficulty : 0 );
    formData.append( 'duration', params.duration ? params.duration : 0 );
    formData.append( 'duration_unit', params.duration_unit ? params.duration_unit : 0 );
    formData.append( 'instructor', params.instructor ? params.instructor : 0 );
    formData.append( 'school_of_life', params.school_of_life );
    formData.append( 'sol_nivelacion', params.sol_nivelacion );

    formData.append( 'course_intro', params.course_intro );
    formData.append( 'intro_pdf', params.course_intro && params.intro_pdf_removed == 1 && !params['intro_pdf'] ? '' : params.intro_pdf );
    formData.append( 'intro_en_pdf', params.course_intro && params.intro_en_pdf_removed == 1 && !params['intro_en_pdf'] ? '' : params.intro_en_pdf );
    formData.append( 'intro_fr_pdf', params.course_intro && params.intro_fr_pdf_removed == 1 && !params['intro_fr_pdf'] ? '' : params.intro_fr_pdf );
    formData.append( 'intro_eu_pdf', params.course_intro && params.intro_eu_pdf_removed == 1 && !params['intro_eu_pdf'] ? '' : params.intro_eu_pdf );
    formData.append( 'intro_ca_pdf', params.course_intro && params.intro_ca_pdf_removed == 1 && !params['intro_ca_pdf'] ? '' : params.intro_ca_pdf );
    formData.append( 'intro_de_pdf', params.course_intro && params.intro_de_pdf_removed == 1 && !params['intro_de_pdf'] ? '' : params.intro_de_pdf );
    formData.append( 'intro_it_pdf', params.course_intro && params.intro_it_pdf_removed == 1 && !params['intro_it_pdf'] ? '' : params.intro_it_pdf );

    if(params.company_id == 32) {
      formData.append( 'additional_properties_course_access', params.additional_properties_course_access );
      formData.append( 'additional_properties_campus_ids', params.additional_properties_campus_ids );
      formData.append( 'additional_properties_business_unit_ids', params.additional_properties_business_unit_ids );
      formData.append( 'additional_properties_faculty_ids', params.additional_properties_faculty_ids );
      formData.append( 'additional_properties_type_ids', params.additional_properties_type_ids );
      formData.append( 'additional_properties_segment_ids', params.additional_properties_segment_ids );
      formData.append( 'additional_properties_branding_ids', params.additional_properties_branding_ids );
      formData.append( 'city_id', params.city_id);
      formData.append( 'default_cover', params?.default_cover || 'photo' );
      formData.append( 'video', params?.video || '' );
    }

    if(params.activity_code) {
      formData.append( 'activity_code', params.activity_code );
      if(params.company_id == 32) {
        formData.append( 'activity_code_sigeca', params.activity_code_sigeca );
      }
    }

    if(params.price) {
      formData.append( 'price', params.price );
    }

    if(params.payment_type) {
      formData.append( 'payment_type', params.payment_type );
    }

    if(params.require_payment) {
      formData.append( 'require_payment', params.require_payment );
    }

    if(params.has_diff_stripe_account){
      formData.append('has_diff_stripe_account', params.has_diff_stripe_account)
      formData.append('stripe_id', params.selected_stripe_account_id)
    }

    if (file) {
      const filename = 'courseImage_' + params.created_by + '_' + this.getTimestamp();
      formData.append('destination', './uploads/courses/');
      formData.append('filepath', ('./uploads/courses/' + filename + '.jpg'));
      formData.append('filenamewoextension', filename);
      formData.append('image', file.image, filename + '.jpg');
    }

    return this._http.post(url,
        formData
    ).pipe(map(res => res));
  }

  editCourse(id, params, file): Observable<any> {
    const url = `${EDIT_COURSE_URL}/${id}`;
    
    let formData = new FormData();

    formData.append( 'title', params.title );
    formData.append( 'title_en', params.title_en ? params.title_en : params.title );
    formData.append( 'title_fr', params.title_fr ? params.title_fr : params.title );
    formData.append( 'title_eu', params.title_eu ? params.title_eu : params.title );
    formData.append( 'title_ca', params.title_ca ? params.title_ca : params.title );
    formData.append( 'title_de', params.title_de ? params.title_de : params.title );
    formData.append( 'title_it', params.title_it ? params.title_it : params.title );
    formData.append( 'description', params.description );
    formData.append( 'description_en', params.description_en ? params.description_en : params.description );
    formData.append( 'description_fr', params.description_fr ? params.description_fr : params.description );
    formData.append( 'description_eu', params.description_eu ? params.description_eu : params.description );
    formData.append( 'description_ca', params.description_ca ? params.description_ca : params.description );
    formData.append( 'description_de', params.description_de ? params.description_de : params.description );
    formData.append( 'description_it', params.description_it ? params.description_it : params.description );
    formData.append( 'date', params.date );
    formData.append( 'points', params.points );
    formData.append( 'created_by', params.created_by );
    formData.append( 'company_id', params.company_id );
    formData.append( 'category', params.category );
    formData.append( 'difficulty', params.difficulty ? params.difficulty : 0 );
    formData.append( 'duration', params.duration ? params.duration : 0 );
    formData.append( 'duration_unit', params.duration_unit ? params.duration_unit : 0 );
    formData.append( 'instructor', params.instructor ? params.instructor : 0 );
    formData.append( 'text_size_unit', params.text_size_unit ? params.text_size_unit : 12 );
    formData.append( 'tutor_id', params.tutor_id ? params.tutor_id : '' );
    formData.append( 'package_id', params.package_id ? params.package_id : 0 );
    formData.append( 'package_activation', params.package_activation ? params.package_activation : 0 );
    formData.append( 'allow_upload_resources', params.allow_upload_resources ? params.allow_upload_resources : 0 );
    formData.append( 'button_color', params.button_color || '' );
    formData.append( 'tutor_types', params.tutor_types );
    formData.append( 'wall_status', params.wall_status);
    formData.append( 'buy_now_button_color', params.buy_now_button_color || '' );
    formData.append( 'school_of_life', params.school_of_life );
    formData.append( 'show_comments', params.show_comments );
    formData.append( 'sol_nivelacion', params.sol_nivelacion );

    formData.append( 'course_intro', params.course_intro );
    formData.append( 'intro_pdf', params.course_intro && params.intro_pdf_removed == 1 ? '' : params.intro_pdf );
    formData.append( 'intro_en_pdf', params.course_intro && params.intro_en_pdf_removed == 1 ? '' : params.intro_en_pdf );
    formData.append( 'intro_fr_pdf', params.course_intro && params.intro_fr_pdf_removed == 1 ? '' : params.intro_fr_pdf );
    formData.append( 'intro_eu_pdf', params.course_intro && params.intro_eu_pdf_removed == 1 ? '' : params.intro_eu_pdf );
    formData.append( 'intro_ca_pdf', params.course_intro && params.intro_ca_pdf_removed == 1 ? '' : params.intro_ca_pdf );
    formData.append( 'intro_de_pdf', params.course_intro && params.intro_de_pdf_removed == 1 ? '' : params.intro_de_pdf );
    formData.append( 'intro_it_pdf', params.course_intro && params.intro_it_pdf_removed == 1 ? '' : params.intro_it_pdf );

    if(params.group_id > 0) {
      formData.append( 'group_id', params.group_id);
    }

    formData.append('cta_status', params.cta_status);
    formData.append('buy_now_status', params.buy_now_status);
    formData.append('cta_text', params.cta_text);
    formData.append('cta_link', params.cta_link);
    formData.append('hotmart_course_id', params.hotmart_course_id);
    
    if(params.video_cover) {
      formData.append( 'video_cover', params.video_cover );
    }

    if(params.price) {
      formData.append( 'price', params.price );
    }

    if(params.payment_type) {
      formData.append( 'payment_type', params.payment_type );
    }

    if(params.has_diff_stripe_account){
      formData.append('has_diff_stripe_account', params.has_diff_stripe_account)
      formData.append('stripe_id', params.selected_stripe_account_id)
    }
    if(params.has_course_credit){
      formData.append('course_credits', params.course_credits)
    }
    formData.append( 'require_payment', params.require_payment ? params.require_payment : 0 );
    
    if(params.company_id == 32) {
      formData.append( 'additional_properties_course_access', params.additional_properties_course_access );
      formData.append( 'additional_properties_campus_ids', params.additional_properties_campus_ids );
      formData.append( 'additional_properties_business_unit_ids', params.additional_properties_business_unit_ids );
      formData.append( 'additional_properties_faculty_ids', params.additional_properties_faculty_ids );
      formData.append( 'additional_properties_type_ids', params.additional_properties_type_ids );
      formData.append( 'additional_properties_segment_ids', params.additional_properties_segment_ids );
      formData.append( 'additional_properties_branding_ids', params.additional_properties_branding_ids );
      formData.append( 'city_id', params.city_id );
      formData.append( 'default_cover', params?.default_cover || 'photo' );
      formData.append( 'video', params?.video || '' );
    }

    if(params.activity_code) {
      formData.append( 'activity_code', params.activity_code );
      if(params.company_id == 32) {
        formData.append( 'activity_code_sigeca', params.activity_code_sigeca );
      }
    }

    if (file) {
      const filename = 'courseImage_' + params.created_by + '_' + this.getTimestamp();
      formData.append('destination', './uploads/courses/');
      let fileExtension = '.jpg'
      if(file.image.type == 'image/png') {
        fileExtension = '.png'
      }
      formData.append('filepath', ('./uploads/courses/' + filename + fileExtension));
      formData.append('filenamewoextension', filename);
      formData.append('image', file.image, filename + fileExtension);
      formData.append('extension', fileExtension);
    }

    return this._http.post(url,
        formData
    ).pipe(map(res => res));
  }

  editVideoBackground(id, userId, file): Observable<any> {
    const url = EDIT_VIDEO_PHOTO_URL;
    
    let formData = new FormData();
    formData.append( 'id', id );

    if (file) {
      const filename = 'videoBackgroundImage_' + userId + '_' + this.getTimestamp();
      formData.append('destination', './uploads/courses/');
      formData.append('filepath', ('./uploads/courses/' + filename + '.jpg'));
      formData.append('filenamewoextension', filename);
      formData.append('image', file.image, filename + '.jpg');
    }

    return this._http.post(
        url,
        formData
    ).pipe(map(res => res));
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  addCourseModule(params): Observable<any> {
    return this._http.post(ADD_COURSE_MODULE__URL,
        params
    ).pipe(map(res => res));
  }

  editCourseModule(id, params): Observable<any> {
    return this._http.post(
      `${EDIT_COURSE_MODULE_URL}/${id}`,
        params
    ).pipe(map(res => res));
  }

  deleteCourseModule(id): Observable<any> {
    return this._http.post(`${DELETE_COURSE_MODULE_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCourseListSequence(params): Observable<any> {
    return this._http.post(EDIT_SEQUENCE_URL,
        params
    ).pipe(map(res => res));
  }

  addCourseUnitDownload(params): Observable<any> {
    return this._http.post(ADD_COURSE_DOWNLOAD_URL,
        params,
    ).pipe(map(res => res));
  }

  updateCourseUnitDownload(params): Observable<any> {
    return this._http.post(EDIT_COURSE_DOWNLOAD_URL,
        params,
    ).pipe(map(res => res));
  }

  deleteCourseDownload(id): Observable<any> {
    return this._http.post(`${DELETE_COURSE_DOWNLOAD_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addCourseUnitNew(params): Observable<any> {
    return this._http.post(ADD_COURSE_UNIT_URL,
        params,
    ).pipe(map(res => res));
  }

  editUnitVideoBackground(id, courseId, file): Observable<any> {
    const url = `/course-unit-video-photo/edit`;
    
    let formData = new FormData();
    formData.append( 'id', id );

    if (file) {
      const filename = 'videoCourseUnitBackgroundImage_' + courseId + '_' + this.getTimestamp();
      formData.append('destination', './uploads/courses/');
      formData.append('filepath', ('./uploads/courses/' + filename + '.jpg'));
      formData.append('filenamewoextension', filename);
      formData.append('image', file.image, filename + '.jpg');
    }
    return this._http.post(EDIT_COURSE_UNIT_PHOTO_URL,
        formData
    ).pipe(map(res => res));
  }

  getCourseUnits(id): Observable<any> {
    return this._http.get(`${ADMIN_COURSE_UNITS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editCourseUnitNew(id, params): Observable<any> {
    return this._http.post(`${EDIT_COURSE_UNIT_URL}/${id}`,
        params,
    ).pipe(map(res => res));
  }

  deleteCourseUnit(id): Observable<any> {
    return this._http.post(`${DELETE_COURSE_UNIT_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCourseUnitTypes(): Observable<any> {
    return this._http.get(UNIT_TYPES_URL,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addCTA(params): Observable<any> {
    return this._http.post(ADD_CTA_URL,
        params,
    ).pipe(map(res => res));
  }

  editCTA(params): Observable<any> {
    return this._http.put(EDIT_CTA_URL,
        params,
    ).pipe(map(res => res));
  }

  deleteCTA(id): Observable<any> {
    return this._http.delete(`${DELETE_CTA_URL}/${id}`,
        {},
    ).pipe(map(res => res));
  }

  fetchCourseCombined(id, companyId, userId): Observable<any> {
    let course = this._http.get(`${COURSE_DETAILS_URL}/${id}/${companyId}/${userId}`);
    let courseSubscriptions = this._http.get(`${COURSE_SUBSCRIPTIONS_URL}/${userId}`);
    let courseTutors = this._http.get(`${COURSE_TUTORS_URL}/${companyId}`);

    return forkJoin([
      course,
      courseSubscriptions,
      courseTutors,
    ]);
  }

  getCourseWalls(id): Observable<any> {
    return this._http.get(`${COURSE_WALL_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  courseCompleteEvaluate(params): Observable<any> {
    return this._http.post(COURSE_COMPLETE_EVALUATE_URL,
        params,
    ).pipe(map(res => res));
  }

  fetchCoursesManagementData(id: number = 0, isUESchoolOfLife: boolean = false): Observable<any> {
    let url = `${COURSES_MANAGEMENT_DATA_URL}/${id}`
    if(isUESchoolOfLife) {
      url += `?schooloflife=1`
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getUserCourse(courseId, userId, companyId): Observable<any> {
    return this._http.get(
      `${PAYMENT_COURSE_DETAILS_URL}/${courseId}/${userId}/${companyId}`,
      { headers: this.headers }
    )
    .pipe(map(res => res));
  }

  subscribeCourse(courseId, userId, companyId, payload): Observable<any> {
    return this._http.post(
      `${PAYMENT_COURSE_URL}/${courseId}/${userId}/${companyId}`,
      payload
    ).pipe(
      map(res => {
        const result = res
        return result;
      })
    );
  }

  getCourseAssessmentItems(courseId): Observable<any> {
    return this._http.get(
      `${COURSE_ASSESSMENT_ITEMS_URL}/${courseId}`,
      { headers: this.headers }
    )
    .pipe(map(res => res));
  }

  addCourseAssessmentItem(payload): Observable<any> {
    return this._http.post(
      CREATE_COURSE_ASSESSMENT_ITEM_URL,
      payload,
    ).pipe(map(res => res));
  }

  editCourseAssessmentItem(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_COURSE_ASSESSMENT_ITEM_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteCourseAssessmentItem(id): Observable<any> {
    return this._http.delete(
      `${DELETE_COURSE_ASSESSMENT_ITEM_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  submitCourseAssessment(payload): Observable<any> {
    return this._http.post(
      SUBMIT_COURSE_ASSESSMENT_URL,
      payload,
    ).pipe(map(res => res));
  }

  fetchCourseDetail(id): Observable<any> {
    return this._http.get(
      `${COURSE_DETAIL_URL}/${id}`,
      { headers: this.headers }
    )
    .pipe(map(res => res));
  }

  fetchStudentCourseAssessment(userId, courseId, courseAssessmentItemId): Observable<any> {
    return this._http.get(
      `${STUDENT_COURSE_ASSESSMENT_URL}/${userId}/${courseId}/${courseAssessmentItemId}`,
      { headers: this.headers }
    )
    .pipe(map(res => res));
  }

  resetCourseAssessment(payload): Observable<any> {
    return this._http.post(
      RESET_COURSE_ASSESSMENT_URL,
      payload,
    ).pipe(map(res => res));
  }

  getCourseCities(id): Observable<any> {
    return this._http.get(
      `${COURSE_CITIES_URL}/${id}`,
      { headers: this.headers }
    )
    .pipe(map(res => res));
  }
}