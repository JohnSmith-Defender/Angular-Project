import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  ADD_CLUB_COMMENT_URL,
  ADD_CLUB_URL,
  ADD_COMMENT_REACTION_URL,
  ADD_COMMENT_REPLY_URL,
  ALL_CLUBS_URL,
  APPROVE_CLUB_ACTIVITY_URL,
  CLUBS_DATA_URL,
  CLUBS_URL,
  CLUB_ACTIVITY_APPROVE_ROLES_URL,
  CLUB_COMMENTS_URL,
  CLUB_MEMBERS_URL,
  CLUB_PLANS_URL,
  CLUB_PRESIDENTS_URL,
  CLUB_URL,
  CONTACT_FIELDS_ADD_URL,
  CONTACT_FIELDS_EDIT_URL,
  CONTACT_FIELDS_URL,
  DELETE_CLUB_COMMENT_URL,
  DELETE_CLUB_URL,
  EDIT_APPROVE_CLUB_ACTIVITIES_URL,
  EDIT_CLUB_URL,
  GROUP_CATEGORIES_URL,
  GROUP_CATEGORY_ADD_URL,
  GROUP_CATEGORY_DELETE_URL,
  GROUP_CATEGORY_EDIT_URL,
  GROUP_SUBCATEGORIES_URL, 
  GROUP_SUBCATEGORY_ADD_URL, 
  GROUP_SUBCATEGORY_DELETE_URL, 
  GROUP_SUBCATEGORY_EDIT_URL, 
  JOIN_CLUB_URL, 
  LEAVE_CLUB_URL, 
  REMOVE_COMMENT_REACTION_URL, 
  REQUEST_JOIN_URL, 
  SUBGROUP_TITLE_URL,
} from "@lib/api-constants";
import { LocalService } from "@share/services/storage/local.service";

@Injectable({
  providedIn: "root",
})
export class ClubsService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  getSubgroupTitles(id): Observable<any> {
    return this._http.get(`${SUBGROUP_TITLE_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res))
  }

  getGroupCategories(id): Observable<any> {
    return this._http.get( `${GROUP_CATEGORIES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getGroupSubcategories(id): Observable<any> {
    return this._http.get(`${GROUP_SUBCATEGORIES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addGroupSubcategory(payload): Observable<any> {
    return this._http.post(GROUP_SUBCATEGORY_ADD_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editGroupSubcategory(id, payload): Observable<any> {
    return this._http.post(`${GROUP_SUBCATEGORY_EDIT_URL}/${id}`, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteGroupSubcategory(id, companyId): Observable<any> {
    return this._http.post(`${GROUP_SUBCATEGORY_DELETE_URL}/${id}/${companyId}`, {}, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addGroupCategory(payload): Observable<any> {
    return this._http.post(GROUP_CATEGORY_ADD_URL, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editGroupCategory(id, payload): Observable<any> {
    return this._http.post(`${GROUP_CATEGORY_EDIT_URL}/${id}`, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteGroupCategory(id, companyId): Observable<any> {
    return this._http.post(`${GROUP_CATEGORY_DELETE_URL}/${id}/${companyId}`, {}, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getContactFields(id): Observable<any> {
    return this._http.get(`${CONTACT_FIELDS_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addContactField(companyId: number, payload): Observable<any> {
    return this._http.post(`${CONTACT_FIELDS_ADD_URL}/${companyId}`, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  editContactField(id: number, companyId: number, payload): Observable<any> {
    return this._http.post(`${CONTACT_FIELDS_EDIT_URL}/${id}/${companyId}`, payload, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchClubs(id: number = 0, userId: number = 0, mode: string = 'active', campus: string = ''): Observable<any> {
    let url = `${CLUBS_URL}/${id}/${userId}/${mode}`
    if(campus) {
      url += `?campus=${campus}`
    }
    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchClubsData(id: number = 0, userId: number = 0, mode: string = 'active'): Observable<any> {
    return this._http.get(`${CLUBS_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchClub(id: number = 0, companyId: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${CLUB_URL}/${id}/${companyId}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  removeGroupMember( group_id: number, user_id: number ): Observable<any> {
    return this._http.post(`${LEAVE_CLUB_URL}/${group_id}/${user_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteGroupComment(id) {
    return this._http.delete(`${DELETE_CLUB_COMMENT_URL}/${id}`);
  }

  getGroupComments(id: number): Observable<any> {
    return this._http.get(`${CLUB_COMMENTS_URL}/${id}`, {
        headers: this.headers 
      }).pipe(map(res => res));
  }

  deleteGroupCommentHeart(id, param) {
    return this._http.post(`${REMOVE_COMMENT_REACTION_URL}/${id}`, param);
  }

  heartGroupComment(id, param): Observable<any> {
    return this._http.post(`${ADD_COMMENT_REACTION_URL}/${id}`, param, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  addGroupComment( group_id: number, user_id: number, comment: string, company_id: number ): Observable<any> {
    return this._http.post(`${ADD_CLUB_COMMENT_URL}/${group_id}/${user_id}?comment=${comment}&companyId=${company_id}`,
      {'comment' : comment},
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addGroupCommentReply(id, param): Observable<any> {
    return this._http.post(`${ADD_COMMENT_REPLY_URL}/${id}`, param, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  deleteGroup(group_id): Observable<any> {
    return this._http.delete(`${DELETE_CLUB_URL}/${group_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }
  
  addJoinRequest( payload ): Observable<any> {
    return this._http.post(REQUEST_JOIN_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  addGroupMember( group_id: number, user_id: number ): Observable<any> {
    return this._http.post(`${JOIN_CLUB_URL}/${group_id}/${user_id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getPlans(groupId): Observable<any> {
    return this._http.get(`${CLUB_PLANS_URL}/${groupId}`, {
      headers: this.headers 
    }).pipe(map(res => res))
  }

  addClub(payload): Observable<any> {
    return this._http.post(
      ADD_CLUB_URL,
      payload,
    ).pipe(map(res => res));
  }

  editClub(id, payload): Observable<any> {
    return this._http.put(
      `${EDIT_CLUB_URL}/${id}`,
      payload,
    ).pipe(map(res => res));
  }

  getAllClubMembers(id: number): Observable<any> {
    return this._http.get(`${CLUB_MEMBERS_URL}/${id}`, {
      headers: this.headers 
    }).pipe(map(res => res));
  }

  getGroups(domain: string, page = 1, limit = 20): Observable<any> {
    const params = `domain=${domain}&page=${page}&limit=${limit}`
    return this._http.get(`${ALL_CLUBS_URL}?${params}`,
        { headers: this.headers }
    ).pipe(map(res => res));
  }

  getClubPresidents(id): Observable<any> {
    return this._http.get(`${CLUB_PRESIDENTS_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res))
  }

  updateClubActivitiesApproveUserRoles(payload): Observable<any> {
    return this._http.post(EDIT_APPROVE_CLUB_ACTIVITIES_URL,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  getClubActivityApproveRoles(id): Observable<any> {
    return this._http.get(`${CLUB_ACTIVITY_APPROVE_ROLES_URL}/${id}`,
      { headers: this.headers }
    ).pipe(map(res => res));
  }

  approveClubActivityNotification(id, payload): Observable<any> {
    return this._http.post(`${APPROVE_CLUB_ACTIVITY_URL}/${id}`,
      payload,
      { headers: this.headers }
    ).pipe(map(res => res));
  }
}