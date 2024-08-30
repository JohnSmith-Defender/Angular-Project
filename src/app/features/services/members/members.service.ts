import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ASK_QUESTION_URL, DELETE_REFERENCE_URL, GUESTS_LIST_URL, GUESTS_REPORT_URL, MEMBERS_COMBINED_URL, MEMBERS_REFERENCES_URL, MEMBERS_REPORT_URL, MEMBER_COMBINED_URL, SEND_REFERENCE_URL } from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class MembersService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchMembers(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${MEMBERS_COMBINED_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchMember(id: number = 0, companyId: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${MEMBER_COMBINED_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  askQuestion(payload): Observable<any> {
    return this._http.post(ASK_QUESTION_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  sendReference(payload) {
    return this._http.post(SEND_REFERENCE_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchReferencesData(id: number = 0): Observable<any> {
    return this._http.get(`${MEMBERS_REFERENCES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteReference(id): Observable<any> {
    return this._http.delete(`${DELETE_REFERENCE_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  fetchGuests(id: number = 0): Observable<any> {
    return this._http.get(`${GUESTS_LIST_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchGuestsReport(id: number = 0, startDate: any = '', endDate: any = ''): Observable<any> {
    let url = `${GUESTS_REPORT_URL}/${id}`

    if(startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchMembersReport(id: number = 0): Observable<any> {
    return this._http.get(`${MEMBERS_REPORT_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }
}