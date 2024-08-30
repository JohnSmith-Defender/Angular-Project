import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DELETE_JOB_OFFER_URL, JOB_OFFERS_URL, JOB_OFFER_MIN_URL, JOB_OFFER_URL, REGISTER_JOB_OFFER_URL, JOB_OFFERS_DATA_URL, CREATE_JOB_OFFER_URL, EDIT_JOB_OFFER_URL, JOB_OFFER_SETTINGS_URL, JOB_OFFER_SETTINGS_EDIT_URL } from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class JobOffersService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchJobOffers(id: number = 0, userId: number = 0, mode: string = 'active', campus: string = ''): Observable<any> {
    let url = `${JOB_OFFERS_URL}/${id}/${userId}/${mode}`
    if(campus) {
      url += `?campus=${campus}`
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchJobOffersData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${JOB_OFFERS_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchJobOffer(id: number = 0, companyId: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${JOB_OFFER_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchJobOfferMin(id: number = 0): Observable<any> {
    return this._http.get(`${JOB_OFFER_MIN_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteJobOffer(id): Observable<any> {
    return this._http.post(`${DELETE_JOB_OFFER_URL}/${id}`,
        {},
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  registerToJob(payload): Observable<any> {
    return this._http.post(
        REGISTER_JOB_OFFER_URL,
        payload,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  addJobOffer(payload): Observable<any> {
    return this._http.post(
      CREATE_JOB_OFFER_URL,
      payload,
    ).pipe(map(res => res));
  }

  editJobOffer(id, payload): Observable<any> {
    return this._http.post(
      `${EDIT_JOB_OFFER_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  getOfferHideDaysSettings(id): Observable<any> {
    return this._http.get(`${JOB_OFFER_SETTINGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  updateOfferHideDaysSettings(params): Observable<any> {
    return this._http.post(JOB_OFFER_SETTINGS_EDIT_URL,
        params,
        { headers: this.headers }
    ).pipe(map(res => res));
  }
}