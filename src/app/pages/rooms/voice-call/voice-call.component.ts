import { CommonModule } from '@angular/common';
import { 
    ChangeDetectorRef, 
    Component, 
    HostListener,
    Input
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
  } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { VoiceCallRoomComponent } from '@share/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompanyService, LocalService } from '@share/services';
import { ProfessionalsService, VoiceCallService } from '@features/services';
import { Subject } from 'rxjs';
import { timer } from "@lib/utils/timer/timer.utils";
import { Subscription } from 'rxjs';
import { environment } from '@env/environment';
import moment from "moment";
import get from "lodash/get";

@Component({
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule,
        ReactiveFormsModule,
        TranslateModule, 
        RouterModule,
        VoiceCallRoomComponent,
    ],
    templateUrl: './voice-call.component.html',
})
export class VoiceCallComponent {
    private destroy$ = new Subject<void>();

    @Input() guid: any;
    @Input() code: any;
    
    languageChangeSubscription;
    language: any;
    companyId: any;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    isMobile: boolean = false;

    statusText: any;
    name: any;
    image: any;
    micMuted: boolean = true;
    showActions: boolean = false;
    requirePasscode: boolean = true;
    invalidPasscode: boolean = false;
    personalData: any = [];

    time: number = 0;
    interval;
    existingCallLog: any;
    room: any;
    recipientUid: any;
    caller: any;
    callTime: number = 0;
    callTrackingInterval;
    pusherSubscription: Subscription | undefined;
    pusherData: any = {};
    isLoading; boolean = true;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _voiceCallService: VoiceCallService,
        private _professionalsService: ProfessionalsService,
        private cd: ChangeDetectorRef
    ) {
        
    }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");

        this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
        this.companies = this._localService.getLocalStorage(environment.lscompanies)
            ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
            : "";
        if (!this.companies) {
            this.companies = get(
                await this._companyService.getCompanies().toPromise(),
                "companies"
            );
        }
        let company = this._companyService.getCompany(this.companies);
        if (company && company[0]) {
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color
                ? company[0].button_color
                : company[0].primary_color;
        }

        this.languageChangeSubscription =
        this._translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
                this.language = event.lang;
                this.handleValidatePasscode(this.code);
            }
        );

        this.subscribeVoiceCall();
        this.handleValidatePasscode(this.code);

        this._voiceCallService.participantEndsCall$.subscribe(status =>{
            if(status) {
                this.handleEndCall();
            }
        })
    }

    subscribeVoiceCall() {
        this.pusherSubscription = this._voiceCallService
          .getFeedItems()
          .subscribe(async(response) => {
            if(response?.id == this.existingCallLog?.caller_user_id || response?.channel == this.existingCallLog?.caller_user_id) {
              this.pusherData = response;
    
              if(response.mode == 'end-call') {
                this.pauseTimer();

                this.statusText = `${this._translateService.instant('professionals.callended')} ${timer.transform(this.time)}`;
                this.showActions = false;
                this.cd.detectChanges;
                
                this._voiceCallService.leaveCall();
              }
            }
          })
      }

    initializeData(response: any) {
        if(!this.requirePasscode && response) {
            this.statusText =  this._translateService.instant('professionals.connecting');
            this.existingCallLog = response.existing_call_log;
            let user = response.user;
            this.name = user.name;
            this.image = user.image;
            let caller = {
                birthday: user.birthday,
                gender: user.gender,
                civil_status: user.civil_status,
                position: user.position,
                city: user.city,
                country: user.country,
                phone: user.phone,
            }
            this.caller = caller;
            this.personalData = [
                {
                    label: this._translateService.instant('profile-settings.birthday'),
                    value: caller.birthday ? moment(caller.birthday).format('DD/MM/YYYY') : '-'
                },
                {
                    label: this._translateService.instant('professionals.gender'),
                    value: caller?.gender || '-'
                },
                {
                    label: this._translateService.instant('professionals.civilstatus'),
                    value: caller?.civil_status || '-'
                },
                {
                    label: this._translateService.instant('profile-settings.position'),
                    value: caller?.position || ''
                },
                {
                    label: this._translateService.instant('profile-settings.city'),
                    value: caller?.city || ''
                },
                {
                    label: this._translateService.instant('profile-settings.country'),
                    value: caller?.country || ''
                },
            ]
            this.initiateCall();
        }
    }

    async initiateCall() {
        this.micMuted = this._voiceCallService.rtc.micMuted;
        const channel =  this.existingCallLog.room;
        this.room = channel;
        this.recipientUid = Math.floor(Math.random() * 2032);
        const token = get(await this._voiceCallService.generateRTCToken(channel, 'publisher', 'uid', this.existingCallLog.caller_user_id).toPromise(), 'rtcToken')
        this._voiceCallService.createRTCClient();
        this._voiceCallService.agoraServerEvents(this._voiceCallService.rtc);
        await this._voiceCallService.localUser(channel, token, this.recipientUid);
        this.showActions = true;
        this.acceptCall(token, this.recipientUid);
    }

    acceptCall(token, recipient_uid) {
        this.handleOutboundPSTN(this.existingCallLog.caller_user_id, this.caller?.phone, this.room, token, recipient_uid);
    }

    handleOutboundPSTN(uid, phone_number, channel, token, recipient_uid) {
        let params = {
          company_id: this.companyId,
          uid,
          channel,
          to: phone_number,
          token,
          professional_user_id: this.existingCallLog.professional_user_id,
          caller_user_id: this.existingCallLog.caller_user_id,
          recipient_uid: recipient_uid,
        }
    
        this._professionalsService.voiceCall(params).subscribe(
          (response) => {
            let params = {
              id: this.existingCallLog.professional_user_id,
              user_id: this.existingCallLog.caller_user_id,
              company_id: this.companyId,
              mode: 'ongoing-call',
              message: `${this._translateService.instant('professionals.ongoingcall')}...`,
              channel: this.existingCallLog.caller_user_id
            }
            this.notifyProfessional(params);
            this.startTimer();
            this.startTrackingCallDuration();
          },
          (error) => {
            console.log(error);
          })
    }

    notifyProfessional(params) {
        this._professionalsService.notifyProfessional(params).subscribe(
            (response) => {

            },
            (error) => {
                console.log(error);
            })
    }

    startTimer() {
        this.interval = setInterval(() => {
            if (this.time === 0) {
                this.time++;
            } else {
                this.time++;
            }
            this.statusText = timer.transform(this.time);
            this.cd.detectChanges;
        }, 1000);
    }

    startTrackingCallDuration() {
        this.callTrackingInterval = setInterval(() => {
            if (this.callTime === 0) {
                this.callTime++;
            } else {
                this.callTime++;
            }

            this._voiceCallService.getStats();
            let stats = this._voiceCallService.rtcStats?.Duration || 0;

            if(stats > 0) {
                let params = {
                    call_guid: this.guid,
                    stats,
                    professional_user_id: this.existingCallLog.professional_user_id,
                    caller_user_id: this.existingCallLog.caller_user_id,
                    room: this.room,
                }
                
                this._professionalsService.editCallerBalance(params).subscribe(
                (response) => {
                    
                },
                (error) => {
                    console.log(error);
                })
            }
        }, 5000);
    }

    pauseTimer() {
        clearInterval(this.interval);
        clearInterval(this.callTrackingInterval);
    }

    handleToggleMic() {
        // this.micMuted = !this.micMuted;
        this._voiceCallService.rtc.micMuted = !this._voiceCallService.rtc.micMuted;
        this.micMuted = this._voiceCallService.rtc.micMuted;
        this._voiceCallService.toggleMic();
        this.cd.detectChanges();
    }

    async handleEndCall() {
        this.pauseTimer();

        await this._voiceCallService.leaveCall();

        let stats = this._voiceCallService.rtcStats;

        let timezoneOffset = new Date().getTimezoneOffset();
        let offset = moment().format('Z');
        let params = {
            id: this.existingCallLog.professional_user_id,
            user_id: this.existingCallLog.caller_user_id,
            company_id: this.companyId,
            mode: 'end-call',
            channel: this.existingCallLog.caller_user_id,
            room: this.room,
            recipient_uid: this.recipientUid,
            guid: this.guid,
            duration: stats?.Duration || 0,
            timezone: timezoneOffset,
            offset,
        }
        this.notifyProfessional(params);
        this._voiceCallService.leaveCall();

        this.statusText = `Call has ended ${timer.transform(this.time)}`;
        this.showActions = false;
        this.cd.detectChanges();
    }

    handleValidatePasscode(event) {
        let params = {
            company_id: this.companyId,
            guid: this.guid,
            passcode: event,
        }

        this._professionalsService.validateVoiceCallPasscode(params).subscribe(
            (response) => {
                this.isLoading = false;
                if(response?.existing_call_log?.id > 0) {
                    this.requirePasscode = false;
                    this.initializeData(response);
                } else {
                    this.invalidPasscode = true;
                }
                this.cd.detectChanges();
            },
            (error) => {
              console.log(error);
            })
    }

    ngOnDestroy() {
        this.pauseTimer();
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}