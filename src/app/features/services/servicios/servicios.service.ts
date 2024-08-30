import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ADD_SERVICE_URL, DELETE_SERVICE_URL, EDIT_SERVICE_URL, PAID_SUBSCRIBE_SERVICE_URL, SERVICES_COMBINED_URL, SERVICE_COMBINED_URL, SERVICE_DETAILS_URL, SUBSCRIBE_SERVICE_URL } from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class ServiciosService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchServices(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${SERVICES_COMBINED_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchService(id: number = 0, companyId: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${SERVICE_COMBINED_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addService(payload): Observable<any> {
    return this._http.post(ADD_SERVICE_URL,
      payload,
    ).pipe(map(res => res));
  }

  editService(id, payload): Observable<any> {
    return this._http.post(
      `${EDIT_SERVICE_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteService(id): Observable<any> {
    return this._http.post(`${DELETE_SERVICE_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  subscribeToASService(serviceId, userId, payload): Observable<any> {
    return this._http.post(
      `${SUBSCRIBE_SERVICE_URL}/${serviceId}/${userId}`,
      payload
    ).pipe(
      map(result => {
        return result;
      })
    );
  }

  getASService(id): Observable<any> {
    return this._http.get(`${SERVICE_DETAILS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  subscribeServiceStripe(serviceId, userId, companyId, payload): Observable<any> {
    return this._http.post(`${PAID_SUBSCRIBE_SERVICE_URL}/${serviceId}/${userId}/${companyId}`,
      payload
    ).pipe(
      map(result => {
        return result;
      })
    );
  }
}