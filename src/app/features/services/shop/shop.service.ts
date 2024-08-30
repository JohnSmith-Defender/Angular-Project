import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalService } from "@share/services/storage/local.service";
import { PRODUCTS_URL, SHOPS_DATA_URL, SHOP_CATEGORIES_URL } from "@lib/api-constants";

@Injectable({
  providedIn: "root",
})
export class ShopService {
  private headers: HttpHeaders;

  constructor(private _http: HttpClient, private _localService: LocalService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  fetchShopsData(id: number = 0, userId: number = 0): Observable<any> {
    return this._http.get(`${SHOPS_DATA_URL}/${id}/${userId}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchShopCategories(id: number = 0): Observable<any> {
    return this._http.get(`${SHOP_CATEGORIES_URL}/${id}`, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }

  fetchProducts(id: number = 0, categoryId: number = 0, status: number = 1): Observable<any> {
    let url = `${PRODUCTS_URL}/${id}?status=${status}`;
    if(categoryId) {
      url += `&categoryId=${categoryId}`
    }

    return this._http.get(url, { 
      headers: this.headers 
    }).pipe(map(res => res));
  }
}