import { Injectable } from "@angular/core";
import { Observable, forkJoin, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalService } from "@share/services/storage/local.service";
import { ADD_CALENDLY_SESSION_URL, ADD_MENTOR_URL, APPLY_MENTOR_URL, APPROVE_MENTOR_REQUEST_URL, ASK_AS_MENTOR_URL, BUDDIES_DATA_URL, BUDDIES_URL, BUDDY_LIMIT_SETTINGS_URL, CANCEL_SESSION_URL, COLLEAGUE_ASKED_URL, CONTACT_LOG_URL, CONTACT_MENTOR_REPLY_URL, CONTACT_MENTOR_URL, DELETE_MENTOR_MESSAGE_URL, DELETE_MENTOR_URL, DELETE_SESSION_URL, EDIT_BUDDY_LIMIT_SETTINGS_URL, EDIT_MENTOR_PHOTO_URL, EDIT_MENTOR_URL, EDIT_SESSION_STATUS_URL, MENTEE_ACCEPT_URL, MENTEE_REJECT_URL, MENTOR_MENTEE_MESSAGES_URL, MENTOR_MENTEE_REQUESTS_URL, MENTOR_PROFILE_MESSAGES_URL, MENTOR_PROFILE_REQUESTS_URL, MENTOR_REQUESTS_URL, MENTOR_REQUEST_DATA_URL, MENTOR_URL, REJECT_MENTOR_REQUEST_URL, SEARCH_MENTOR_URL, UPDATE_MENTOR_CALENDLY_URL } from "@lib/api-constants";

@Injectable({
  providedIn: "root",
})
export class BuddyService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchBuddiesData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${BUDDIES_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchBuddies(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${BUDDIES_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchMentor(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${MENTOR_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  updateMentorProfile(payload) {
    return this._http.post<any>(EDIT_MENTOR_URL, 
      payload)
    ;
  }

  uploadMentorPhoto(payload) {
    return this._http.post<any>(EDIT_MENTOR_PHOTO_URL, 
      payload)
    ;
  }

  fetchMentorRequestData(id: number = 0): Observable<any> {
    return this._http.get(`${MENTOR_REQUEST_DATA_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  applyMentor(payload) {
    return this._http.post<any>(APPLY_MENTOR_URL, 
      payload)
    ;
  }

  fetchMentorRequests(id: number = 0): Observable<any> {
    return this._http.get(`${MENTOR_REQUESTS_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  approveMentorRequest(payload) {
    return this._http.post<any>(APPROVE_MENTOR_REQUEST_URL, 
      payload)
    ;
  }

  rejectMentorRequest(payload) {
    return this._http.post<any>(REJECT_MENTOR_REQUEST_URL, 
      payload)
    ;
  }

  updateMentorCalendly(payload): Observable<any> {
    return this._http.post(
        `${UPDATE_MENTOR_CALENDLY_URL}`,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  askToBeMentor(payload): Observable<any> {
    return this._http.post(ASK_AS_MENTOR_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  contactMentor(payload): Observable<any> {
    return this._http.post(CONTACT_MENTOR_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getColleagueAsked(id, userId): Observable<any> {
    return this._http.get(`${COLLEAGUE_ASKED_URL}/${id}/${userId}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getBuddyContactLog(id): Observable<any> {
    return this._http.get(`${CONTACT_LOG_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  acceptBuddy(payload): Observable<any> {
    return this._http.post(MENTEE_ACCEPT_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  rejectBuddy(payload): Observable<any> {
    return this._http.post(MENTEE_REJECT_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getMentorMenteeMessages(id, userId, superAdmin): Observable<any> {
    let url = `${MENTOR_MENTEE_MESSAGES_URL}/${id}/${userId}`;
    if(superAdmin) {
      url += `?role=admin`;
    }

    return this._http.get(url,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  contactMentorReply(payload): Observable<any> {
    return this._http.post(CONTACT_MENTOR_REPLY_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }
  
  deleteMentorMessage(id): Observable<any> {
    return this._http.delete(
      `${DELETE_MENTOR_MESSAGE_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  addCalendlySession(payload): Observable<any> {
    return this._http.post(
      `${ADD_CALENDLY_SESSION_URL}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editSessionStatus(params): Observable<any> {
    return this._http.put(EDIT_SESSION_STATUS_URL,
      params
    ).pipe(map(res => res));
  }

  deleteSession(id): Observable<any> {
    return this._http.delete(`${DELETE_SESSION_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  cancelSession(payload): Observable<any> {
    return this._http.post(CANCEL_SESSION_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  searchUser(id, keyword): Observable<any> {
    let url = `${SEARCH_MENTOR_URL}/${id}?keyword=${keyword}`;

    return this._http.get(url,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addMentor(payload): Observable<any> {
    return this._http.post(
      `${ADD_MENTOR_URL}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteMentor(id): Observable<any> {
    return this._http.delete(
      `${DELETE_MENTOR_URL}/${id}`,
      {},
    ).pipe(map(res => res));
  }

  getMenteeLimitSettings(id): Observable<any> {
    return this._http.get(`${BUDDY_LIMIT_SETTINGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  updateMenteeLimitSettings(params): Observable<any> {
    return this._http.post(EDIT_BUDDY_LIMIT_SETTINGS_URL,
        params,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getMentorProfileRequests(userId, companyId): Observable<any> {
    return this._http.get(`${MENTOR_PROFILE_REQUESTS_URL}/${userId}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  fetchMentorProfile(id, userId, companyId) {
    let mentor = this._http.get(`${MENTOR_URL}/${id}/${userId}`);
    let requests = this._http.get(`${MENTOR_PROFILE_REQUESTS_URL}/${userId}/${companyId}`);
    let messages = this._http.get(`${MENTOR_PROFILE_MESSAGES_URL}/${userId}/${companyId}`);

    return forkJoin([
      mentor,
      requests,
      messages,
    ]);
  }

  getMentorProfileMessages(userId, companyId): Observable<any> {
    return this._http.get(`${MENTOR_PROFILE_MESSAGES_URL}/${userId}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  fetchMentorMenteeRequests(companyId): Observable<any> {
    return this._http.get(`${MENTOR_MENTEE_REQUESTS_URL}/${companyId}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }
}