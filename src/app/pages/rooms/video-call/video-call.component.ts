import { CommonModule } from '@angular/common';
import { 
    ChangeDetectionStrategy,
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompanyService, LocalService } from '@share/services';
import { ProfessionalsService, VideoCallService } from '@features/services';
import { VideoCallRoomComponent } from '@share/components/rooms/video-call/video-call.component';
import { Subject } from 'rxjs';
import { environment } from '@env/environment';
import get from "lodash/get";

@Component({
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule,
        ReactiveFormsModule,
        TranslateModule, 
        RouterModule,
        VideoCallRoomComponent,
    ],
    templateUrl: './video-call.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoCallComponent {
    private destroy$ = new Subject<void>();

    @Input() guid: any;
    @Input() code: any;
    @Input() role: any;
    
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
    callerData: any = [];

    existingVideoCallLog: any;
    room: any;
    recipientUid: any;
    caller: any;
    isLoading; boolean = true;
    professional: any;
    mode: string = '';
    hasJoined: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _videoCallService: VideoCallService,
        private _professionalsService: ProfessionalsService,
        private cd: ChangeDetectorRef
    ) {
        localStorage.removeItem('joined-video-channel');
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
                this.initializePage();
            }
        );

        this.initializePage();
    }

    initializePage() {
        let params = {
            company_id: this.companyId,
            video_call_guid: this.guid,
            video_call_passcode: this.code,
        }

        this._professionalsService.validateVideoCallPasscode(params).subscribe(
            (response) => {
                this.isLoading = false;
                if(response?.existing_video_call_log?.id > 0) {
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

    initializeData(response: any) {
        if(!this.requirePasscode && response) {
            this.statusText =  this._translateService.instant('professionals.connecting');
            this.existingVideoCallLog = response.existing_video_call_log;
        
            this.caller = response.user;
            this.professional = response.professional;
            this.mode = this.role;
            this.cd.detectChanges();
        }
    }

    handleToggleMic() {
    
    }

    handleEndCall() {
        this._videoCallService.leaveChannel();
    }

    async handleJoinChannel() {
        if(window.location.href?.indexOf("/call/") >= 0) {
            if(!this.hasJoined && !localStorage.getItem('joined-video-channel')) {
                this.hasJoined = true;
                
                if(!this.existingVideoCallLog) {
                    let params = {
                        company_id: this.companyId,
                        video_call_guid: this.guid,
                        video_call_passcode: this.code,
                    }
    
                    let result = get(await this._professionalsService.validateVideoCallPasscode(params).toPromise(), 'existing_video_call_log');
                    this.existingVideoCallLog = result;
                }

                let channel = this.existingVideoCallLog?.room;
                let uid = this.role == 'caller' ? this.existingVideoCallLog?.caller_uid : Math.floor(Math.random() * 2032);
                let userId = this.role == 'caller' ? this.existingVideoCallLog?.caller_user_id : this.existingVideoCallLog?.professional_user_id;
                let token = this.role == 'caller' ? this.existingVideoCallLog?.token : get(await this._videoCallService.generateRTCToken(channel, 'publisher', 'uid', userId).toPromise(), 'rtcToken');


                localStorage.setItem('joined-video-channel', channel);
                this._videoCallService.joinChannel(
                    channel, 
                    token,
                    uid,
                    this.role,
                    this.existingVideoCallLog,
                );
            }
        }
    }

    goHome() {
        this._router.navigate(['/'])
    }

    ngOnDestroy() {
        localStorage.removeItem('joined-video-channel');
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}