import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { STARTUPS_URL, STARTUP_DETAILS_URL } from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class StartupsService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchStartups(id: number = 0, userId: number = 0, mode: string = 'active'): Observable<any> {
    return this._http.get(`${STARTUPS_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchStartup(id: number = 0, companyId: number = 0, userId: number = 0, mode: string = 'active'): Observable<any> {
    return this._http.get(`${STARTUP_DETAILS_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }
}