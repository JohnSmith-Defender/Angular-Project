import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, Subject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import AgoraRTC, { ILocalTrack, IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { GENERATE_RTC_TOKEN_URL } from "@lib/api-constants";
import { ProfessionalsService } from "@features/services";
import { RTCUser } from "@lib/interfaces";
import { environment } from "@env/environment";
import Pusher from 'pusher-js';
import moment from "moment";

@Injectable({
    providedIn: "root",
})
export class VideoCallService {
    private headers: HttpHeaders;

    private client: IAgoraRTCClient | undefined;
    private appId = environment.agoraAppId;

    private channelJoinedSource = new BehaviorSubject<boolean>(false);
    channelJoined$ = this.channelJoinedSource.asObservable();

    professionalJoinedCall$ = new BehaviorSubject<boolean>(false);

    subject: Subject<any> = new Subject<any>();

    remoteUsers: RTCUser[] = [];

    constructor(
        private _http: HttpClient,
        private _professionalsService: ProfessionalsService,
    ) {
        this.headers = new HttpHeaders({
            "Content-Type": "application/json",
        });

        if (this.appId == '')
            console.error('APPID REQUIRED');

        this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp9' });

        const pusherClient = new Pusher(environment.pusherAppKey, { cluster: environment.pusherCluster });
        let sub = 'pusher-vcp-astroideal-video';
        const pusherChannel = pusherClient.subscribe(sub);
        pusherChannel.bind('professional-video-call', (data) => this.subject.next(data));
    }

    generateRTCToken(channel, role, tokentype, uid): Observable<any> {
        return this._http.get(`${GENERATE_RTC_TOKEN_URL}/${channel}/${role}/${tokentype}/${uid}`, {
          headers: this.headers
        }).pipe(map(res => res));
    }

    async joinChannel(channelName: string, token: string | null, uid: string | null, role: string | null, videoCall) {
        if(role == 'recipient' && videoCall?.id > 0) {
            this.triggerNotification(channelName, token, uid, role, videoCall);
        } else {
            this.join(channelName, token, uid)
        }
    }

    async join(channelName: string, token: string | null, uid: string | null) {
        await this.client?.join(this.appId, channelName, token, uid)
        this.channelJoinedSource.next(true)
    }

    async leaveChannel() {
        await this.client?.leave()
        this.channelJoinedSource.next(false)
    }

    setupLocalTracks(): Promise<ILocalTrack[]> {
        return AgoraRTC.createMicrophoneAndCameraTracks();
    }

    getClient() {
        return this.client;
    }

    getClientStats() {
        return this.client?.getRTCStats();
    }

    getFeedItems(): Observable<any> {
        return this.subject.asObservable();
    }

    addRemoteUser(uid) {
        this.remoteUsers.push({ 'uid': + uid });
    }

    getRemoteUsers() {
        return this.remoteUsers;
    }

    triggerNotification(channelName: string, token: string | null, uid: string | null, role: string | null, videoCall) {
        let timezoneOffset = new Date().getTimezoneOffset();
        let offset = moment().format('Z');
        let params = {
            id: videoCall.professional_user_id,
            user_id: videoCall.user_id,
            company_id: videoCall.company_id,
            mode: 'recipient-joined-video-call',
            channel: videoCall.caller_user_id,
            room: videoCall.room,
            timezone: timezoneOffset,
            offset,
            recipient_uid: uid,
            video_call_guid: videoCall.video_call_guid,
        }

        this._professionalsService.notifyVideoCallProfessional(params).subscribe(
            (response) => {
                this.join(channelName, token, uid);
                setTimeout(() => {
                    this.professionalJoinedCall$.next(true);
                }, 500)
            },
            (error) => {
              console.log(error);
            })
    }
}