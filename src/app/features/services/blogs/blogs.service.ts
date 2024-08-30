import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ADD_BLOG_URL, BLOGS_COMBINED_URL, BLOG_COMBINED_URL, DELETE_BLOG_URL, EDIT_BLOG_URL } from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class BlogsService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchBlogs(id: number = 0, userId: number = 0, mode: string = 'active'): Observable<any> {
    return this._http.get(`${BLOGS_COMBINED_URL}/${id}/${userId}/${mode}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchBlog(id: number = 0, companyId: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${BLOG_COMBINED_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addBlog(payload): Observable<any> {
    return this._http.post(ADD_BLOG_URL,
      payload,
    ).pipe(map(res => res));
  }

  editBlog(id, payload): Observable<any> {
    return this._http.post(
      `${EDIT_BLOG_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  deleteBlog(id): Observable<any> {
    return this._http.delete(`${DELETE_BLOG_URL}/${id}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }
}