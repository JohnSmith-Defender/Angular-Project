import { Injectable } from "@angular/core";
import { map, Observable, Subject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GENERATE_RTM_TOKEN_URL } from "@lib/api-constants";
import { ProfessionalsService } from "@features/services";
import { environment } from "@env/environment";
import Pusher from 'pusher-js';

@Injectable({
    providedIn: "root",
})
export class ChatService {
    private headers: HttpHeaders;

    subject: Subject<any> = new Subject<any>();

    constructor(
        private _http: HttpClient,
        private _professionalsService: ProfessionalsService,
    ) {
        this.headers = new HttpHeaders({
            "Content-Type": "application/json",
        });

        const pusherClient = new Pusher(environment.pusherAppKey, { cluster: environment.pusherCluster });
        let sub = 'pusher-vcp-astroideal-chat';
        const pusherChannel = pusherClient.subscribe(sub);
        pusherChannel.bind('professional-chat', (data) => this.subject.next(data));
    }

    generateRTMToken(uid): Observable<any> {
        return this._http.get(`${GENERATE_RTM_TOKEN_URL}/${uid}`, {
          headers: this.headers
        }).pipe(map(res => res));
    }

    getFeedItems(): Observable<any> {
        return this.subject.asObservable();
    }
}