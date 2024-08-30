import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalService } from "@share/services";
import { ACCEPT_CLUB_NOTIFICATION_URL, ACCEPT_CLUB_PLAN_NOTIFICATION_URL, ACCEPT_CLUB_REQUEST_URL, ACCEPT_PLAN_NOTIFICATION_URL, ACCEPT_PLAN_REQUEST_NOTIFICATION_URL, APPROVE_BLOG_URL, APPROVE_CLUB_ACTIVITY_URL, APPROVE_WAITING_LIST_URL, BLOG_REQUEST_DETAILS_URL, COMMENT_DETAILS_URL, DECLINE_NOTIFICATION_URL, DELETE_NOTIFICATION_URL, READ_NOTIFICATION_URL, REJECT_BLOG_URL, REJECT_WAITING_LIST_URL } from "@lib/api-constants";
import { environment } from "@env/environment";

@Injectable({
  providedIn: "root",
})
export class NotificationsService {
  private headers: HttpHeaders;

  constructor(
    private _http: HttpClient,
    private _localService: LocalService
  ) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  acceptGroupNotification(id, payload): Observable<any> {
    return this._http.post(`${ACCEPT_CLUB_NOTIFICATION_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  acceptPlanNotification(id, payload): Observable<any> {
    return this._http.post(`${ACCEPT_PLAN_NOTIFICATION_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  acceptGroupPlanNotification(id, payload): Observable<any> {
    return this._http.post(`${ACCEPT_CLUB_PLAN_NOTIFICATION_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  acceptPlanRequestNotification(id, payload): Observable<any> {
    return this._http.post(`${ACCEPT_PLAN_REQUEST_NOTIFICATION_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteNotification(payload): Observable<any> {
    return this._http.post(
        DELETE_NOTIFICATION_URL,
        payload
    ).pipe(map(res => res));
  }

  readNotification(id, payload): Observable<any> {
    return this._http.post(`${READ_NOTIFICATION_URL}/${id}` + id,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  declineNotification(id, payload): Observable<any> {
    return this._http.post(`${DECLINE_NOTIFICATION_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  approveWaitingList(id, userId) {
    return this._http.post(`${APPROVE_WAITING_LIST_URL}/${id}/${userId}`, 
      {},
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  rejectWaitingList(id) {
    return this._http.post(`${REJECT_WAITING_LIST_URL}/${id}`, 
      {},
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  acceptJoinGroupRequestNotification(id, payload): Observable<any> {
    return this._http.post(`${ACCEPT_CLUB_REQUEST_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getCommentDetails(id, type): Observable<any> {
    return this._http.get(`${COMMENT_DETAILS_URL}/${id}/${type}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  approveClubActivityNotification(id, payload): Observable<any> {
    return this._http.post(`${APPROVE_CLUB_ACTIVITY_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  approveBlog(id, param) {
    return this._http.post(APPROVE_BLOG_URL, param);
  }

  rejectBlog(id, param) {
    return this._http.post(REJECT_BLOG_URL, param);
  }

  getContentRequest(id) {
    return this._http.get(environment.api + `${BLOG_REQUEST_DETAILS_URL}/${id}`);
  }
}