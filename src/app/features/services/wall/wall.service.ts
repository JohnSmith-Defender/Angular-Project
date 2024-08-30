import { Injectable } from "@angular/core";
import { Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ADD_COURSE_RESOURCE_URL, ADD_POST_URL, ANSWER_TUTOR_QUESTION_URL, ASK_COURSE_TUTOR_QUESTION_URL, COURSE_QUESTIONS_URL, COURSE_RESOURCES_URL, DELETE_POST_URL, DELETE_TUTOR_QUESTION_URL, EDIT_TUTOR_SECTION_VISIBILITY_URL, EDIT_TUTOR_VISIBILITY_URL, HEART_POST_URL, MEMBERS_RESTRICTED_LIST_URL, POSTS_URL, SEND_MEMBER_EMAIL_URL, UNHEART_POST_URL, UPDATE_PIN_STATUS_URL, UPDATE_POST_URL, UPDATE_QUESTION_PIN_STATUS_URL, UPLOAD_RESOURCE_AVAILABILITY_URL, WALL_COMBINED_URL } from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class WallService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchWall(id: number = 0, groupId: number = 0,userId: number = 0): Observable<any> {
    return this._http.get(`${WALL_COMBINED_URL}/${id}/${groupId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  public getPosts(payload): Observable<any> {
    return this._http.post(POSTS_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  public createPost(payload): Observable<any> {
    return this._http.post(ADD_POST_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  public updatePost(payload): Observable<any> {
    return this._http.post(UPDATE_POST_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  public createPostReaction(payload): Observable<any> {
    return this._http.post(HEART_POST_URL, payload, { 
      headers: this.headers }
    ).pipe(map(res => res));
  }

  public removePostReaction(payload): Observable<any> {
    return this._http.post(UNHEART_POST_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  updatePinStatus(payload): Observable<any> {
    return this._http.put(UPDATE_PIN_STATUS_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deletePost(id): Observable<any> {
    return this._http.post(
        `${DELETE_POST_URL}/${id}`,
        {},
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editWallTutorSectionVisibility(payload): Observable<any> {
    return this._http.post(EDIT_TUTOR_SECTION_VISIBILITY_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  editWallTutorVisibility(payload): Observable<any> {
    return this._http.post(EDIT_TUTOR_VISIBILITY_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  sendEmail(payload): Observable<any> {
    return this._http.post(SEND_MEMBER_EMAIL_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  askTutorQuestion(payload): Observable<any> {
    return this._http.post(ASK_COURSE_TUTOR_QUESTION_URL, 
      payload, 
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getCourseQuestions(id, companyId) {
    return this._http.get(`${COURSE_QUESTIONS_URL}/${id}?company_id=${companyId}`,
      { headers: this.headers }
    );
  }

  updateQuestionPinStatus(payload): Observable<any> {
    return this._http.put(UPDATE_QUESTION_PIN_STATUS_URL,
      payload,
      { headers: this.headers }
  ).pipe(map(res => res));
  }
  
  deleteQuestion(id): Observable<any> {
    return this._http.delete(`${DELETE_TUTOR_QUESTION_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  answerTutorQuestion(payload): Observable<any> {
    return this._http.post(ANSWER_TUTOR_QUESTION_URL, 
      payload, 
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  getCourseResources(id, companyId) {
    return this._http.get(`${COURSE_RESOURCES_URL}/${id}?company_id=${companyId}`,
      { headers: this.headers }
    );
  }

  getCourseUploadResourceAvailability(id) {
    return this._http.get(`${UPLOAD_RESOURCE_AVAILABILITY_URL}/${id}`,
      { headers: this.headers }
    );
  }

  addCourseResource(params): Observable<any> {
    return this._http.post(ADD_COURSE_RESOURCE_URL,
        params,
    ).pipe(map(res => res));
  }

  getMembers(companyId): Observable<any> {
    return this._http.get(`${MEMBERS_RESTRICTED_LIST_URL}/${companyId}`, 
      { headers: this.headers }
    ).pipe(map(res => res))
  }
}