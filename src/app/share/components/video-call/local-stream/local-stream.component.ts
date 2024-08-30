import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, SimpleChange, ViewChild } from '@angular/core'
import { ILocalTrack, IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { MediaControlsComponent } from '../media-controls/media-controls.component';
import { VideoCallService } from '@features/services';
import { Subscription } from 'rxjs';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
  } from "@ngx-translate/core";
import { LocalService } from "@share/services";
import { environment } from "@env/environment";

@Component({
    selector: 'app-local-stream',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        MediaControlsComponent
    ],
    templateUrl: './local-stream.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalStreamComponent implements AfterViewInit {
    @Input() mode: any;
    @Input() micMuted: any;
    @Input() currentUserInfo: any;
    @Input() existingVideoCallLog: any;

    language: any;

    @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLDivElement>;
    @Output() leaveChannel = new EventEmitter<void>();

    private client: IAgoraRTCClient | undefined;

    private localMicTrack!: ILocalTrack;
    private localVideoTrack!: ILocalTrack;
    private localScreenTracks?: ILocalTrack[];

    private channelJoined: boolean = false;
    private subscription: Subscription = new Subscription();

    private localTracksActive = {
        audio: false,
        video: false,
        screen: false,
    }

    // Mapping to simplify getting/setting track-state
    private trackNameMapping: { [key: string]: 'audio' | 'video' | 'screen' } = {
        audio: 'audio',
        video: 'video',
        screen: 'screen',
    }
    callEnded: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _videoCallService: VideoCallService,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private cd: ChangeDetectorRef
    ) {
        this.client = this._videoCallService.getClient();
    }

    async ngOnInit() {
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");
    }

    async ngAfterViewInit(): Promise<void> {
        [this.localMicTrack, this.localVideoTrack] = await this._videoCallService.setupLocalTracks();
        this.localTracksActive.audio = this.localMicTrack ? true : false
        this.localTracksActive.video = this.localVideoTrack ? true : false
        
        this.localVideoTrack.play(this.localVideo.nativeElement);
        this.subscription.add(this._videoCallService.channelJoined$.subscribe(status => {
            this.channelJoined = status
            if (status) {
                this.publishTracks()
            }
        }))
    }

    async ngOnDestroy() {
        this.handleLeaveChannel()
    }

    async publishTracks() {
        await this.client?.publish([this.localMicTrack, this.localVideoTrack])
    }

    async unpublishTracks() {
        await this.client?.publish([this.localMicTrack, this.localVideoTrack])
    }

    async handleLeaveChannel(): Promise<void> {
        if (this.channelJoined) {
            const tracks = [this.localMicTrack, this.localVideoTrack]
            tracks.forEach(track => {
                track.close();
            })

            try {
                await this.client?.unpublish(tracks);
                await this._videoCallService.leaveChannel();
                this.redirectToCallEndedPage();
            } catch (error) {
                this.redirectToCallEndedPage();
                console.error('Error unpublishing:', error);
            }
        }
    }

    leave() {
        this.leaveChannel.emit();
        this.redirectToCallEndedPage();
    }

    redirectToCallEndedPage() {
        setTimeout(() => {
            this._router.navigate([`/call/ended`])
            .then(() => {
                window.location.reload();
            });
        }, 500)
    }

    async muteTrack(trackName: string, enabled: boolean): Promise<boolean> {
        const track = trackName === 'audio' ? this.localMicTrack : this.localVideoTrack;
        await track?.setEnabled(enabled);
        this.setTrackState(trackName, enabled)
        return enabled;
    }

    getTrackState(trackName: string): boolean | undefined {
        const key = this.trackNameMapping[trackName]
        if (key) {
            return this.localTracksActive[key]
        }
        return
    }

    setTrackState(trackName: string, state: boolean): void {
        const key = this.trackNameMapping[trackName]
        if (key) {
            this.localTracksActive[key] = state
        }
        return
    }

    getClientStats() {
        this._videoCallService.getClientStats();
    }

    goHome() {
        location.href = '/';
    }
}