import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalService } from "@share/services/storage/local.service";
import { environment } from "@env/environment";
import { GENERATE_RTC_TOKEN_URL } from "@lib/api-constants";
import { ProfessionalsService } from "@features/services";
import { RTC, RTCUser } from "@lib/interfaces";
import moment from "moment";
import AgoraRTC from 'agora-rtc-sdk-ng';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: "root",
})
export class VoiceCallService {
  private headers: HttpHeaders;
  participantEndsCall$ = new BehaviorSubject<boolean>(false);

  rtc: RTC = {
    client: null,
    localAudioTrack: null,
    remoteAudioTracks: {},
    micMuted: true,
  };

  token = '007eJxTYAhoi77dpbj7jsqGqSuFHlVaXPjMmBi14fKC11NnPlPa03lDgcHI0Cw5ydLIwizNPMkkxdgiMc3IKM3IJCnRNMk01SDFJL+tNa0hkJEhUHQbAyMUgvgsDLmJmXkMDADw2iFf'
  rtcUid = Math.floor(Math.random() * 2032)
  rtmUid = String(Math.floor(Math.random() * 2032))

  options = {
    appId: environment.agoraAppId,
  };

  remoteUsers: RTCUser[] = [];
  updateUserInfo = new BehaviorSubject<any>(null);

  subject: Subject<any> = new Subject<any>();
  userId: any;
  companyId: any;

  rtcClient;
  rtmClient;
  channel;
  rtcStats;

  constructor(
    private _http: HttpClient,
    private _localService: LocalService,
    private _professionalsService: ProfessionalsService
  ) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);

    const client = new Pusher(environment.pusherAppKey, { cluster: environment.pusherCluster });

    let sub = 'pusher-vcp-astroideal';
    const pusherChannel = client.subscribe(sub);
    console.log('sub channel: ' + sub);
    pusherChannel.bind('professional-voice-call', (data) => this.subject.next(data));
  }

  toggleMic() {
    this.rtc?.localAudioTrack?.setMuted(this.rtc.micMuted);
  }

  createRTCClient() {
    this.rtc.client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp9"
    });

    // Enable log upload
    AgoraRTC.enableLogUpload();
    // Set the log output level as INFO
    AgoraRTC.setLogLevel(1);

    AgoraRTC.onAudioAutoplayFailed = () => {
    };

    AgoraRTC.onMicrophoneChanged = async changedDevice => {
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === "ACTIVE") {
        this.rtc?.localAudioTrack?.setDevice(changedDevice.device.deviceId);
        // Switch to an existing device when the current device is unplugged.
      } else if (changedDevice.device.label === this.rtc?.localAudioTrack?.getTrackLabel()) {
        const oldMicrophones = await AgoraRTC.getMicrophones();
        oldMicrophones[0] && this.rtc?.localAudioTrack?.setDevice(oldMicrophones[0].deviceId);
      }
    };
  }

  async localUser(channel, token, uuid, mode: string = '') {
    const uid = await this.rtc?.client?.join(this.options.appId, channel, token, uuid);
    this.getEquipment(mode);
  }

  async getEquipment(mode) {
    let skipPermissionsCheck = mode ? true : false;
    const dev = await AgoraRTC.getMicrophones(skipPermissionsCheck);
    const hasMicrophone = dev.some(device => device.kind === 'audioinput');
    if (hasMicrophone && !mode) {
      // Create an audio track from the audio sampled by a microphone.
      this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "music_standard"
      });

      // Publish the local audio and video tracks to the
      // channel for other users to subscribe to it.
      this.rtc.localAudioTrack.setMuted(this.rtc.micMuted);

      await this.rtc?.client?.publish([this.rtc.localAudioTrack]);
    }
  }

  agoraServerEvents(rtc) {
    rtc.client.on("user-published", async (user, mediaType) => {
      console.log(user, mediaType, 'user-published');

      await rtc.client.subscribe(user, mediaType);
      console.log("subscribe success");

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
    });

    rtc.client.on("user-unpublished", async (user, mediaType) => {
      console.log(user, 'user-unpublished');
      this.leaveCall();
      this.triggerNotification(user);
    });

    rtc.client.on("user-joined", (user) => {
      let id = user.uid;
      this.remoteUsers.push({ 'uid': + id });
      this.updateUserInfo.next(id);
      console.log("user-joined", user, this.remoteUsers, 'event1');
    });

    rtc.client.on("user-left", (user) => {
      console.log("user-left", user, this.remoteUsers, 'event1');
      this.leaveCall();
      this.triggerNotification(user);
    })
  }

  async triggerNotification(user) {
    let timezoneOffset = new Date().getTimezoneOffset();
    let offset = moment().format('Z');
    let params = {
      id: user.uid,
      user_id: this.userId,
      company_id: this.companyId,
      mode: 'end-call',
      channel: this.userId,
      room: `agora-vcp-${user.uid}`,
      duration: this.rtcStats?.Duration || 0,
      timezone: timezoneOffset,
      offset,
    }

    await this._professionalsService.notifyProfessional(params);
    this.participantEndsCall$.next(true);
  }

  async leaveCall() {
    this.getStats();

    // Destroy the local audio track.
    this.rtc?.localAudioTrack?.close();

    // Leave the channel.
    await this.rtc?.client?.leave();
  }

  async getStats() {
    const stats = await this.rtc?.client?.getRTCStats();
    this.rtcStats = stats;
  }

  generateRTCToken(channel, role, tokentype, uid): Observable<any> {
    return this._http.get(`${GENERATE_RTC_TOKEN_URL}/${channel}/${role}/${tokentype}/${uid}`, {
      headers: this.headers
    }).pipe(map(res => res));
  }

  getFeedItems(): Observable<any> {
    return this.subject.asObservable();
  }
}