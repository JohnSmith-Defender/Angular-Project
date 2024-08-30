import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  ADD_TESTIMONIAL_TAG_URL,
  ADD_TESTIMONIAL_URL,
  DELETE_TESTIMONIAL_TAG_URL,
  DELETE_TESTIMONIAL_URL,
  EDIT_TESTIMONIAL_TAG_URL,
  EDIT_TESTIMONIAL_URL,
  TESTIMONIALS_DATA_URL,
  TESTIMONIALS_URL, TESTIMONIAL_DETAILS_URL, TESTIMONIAL_TAGS_URL, TESTIMONIAL_VIDEO_UPLOAD,
} from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class TestimonialsService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchTestimonials(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${TESTIMONIALS_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchTestimonialsData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${TESTIMONIALS_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchTestimonial(id: number = 0, companyId: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${TESTIMONIAL_DETAILS_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  uploadcoverVideo(payload): Observable<any> {
    return this._http.post(`${TESTIMONIAL_VIDEO_UPLOAD}`,payload).pipe(map(res => res));
  }

  addTestimonial(payload): Observable<any> {
    return this._http.post(
      ADD_TESTIMONIAL_URL,
      payload,
    ).pipe(map(res => res));
  }

  editTestimonial(id, payload): Observable<any> {
    return this._http.post(
      `${EDIT_TESTIMONIAL_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteTestimonial(id): Observable<any> {
    return this._http.post(`${DELETE_TESTIMONIAL_URL}/${id}`,
      {},
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getTestimonialTags(id): Observable<any> {
    return this._http.get(`${TESTIMONIAL_TAGS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addTestimonialTag(payload): Observable<any> {
    return this._http.post(ADD_TESTIMONIAL_TAG_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  editTestimonialTag(id, payload): Observable<any> {
    return this._http.put(`${EDIT_TESTIMONIAL_TAG_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  deleteTestimonialTag(id, companyId): Observable<any> {
    return this._http.delete(`${DELETE_TESTIMONIAL_TAG_URL}/${id}/${companyId}`,
      {},
    ).pipe(map(res => res));
  }
}