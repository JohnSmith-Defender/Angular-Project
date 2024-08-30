import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, SimpleChange, ViewChild } from '@angular/core'
import { ProfessionalsService, VideoCallService } from "@features/services";
import { LocalStreamComponent } from '../local-stream/local-stream.component';
import { Subscription } from "rxjs";
import { timer } from "@lib/utils/timer/timer.utils";
import { initFlowbite } from 'flowbite';
import moment from "moment";

@Component({
  selector: 'app-media-controls',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './media-controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaControlsComponent {
  @Input() mode: any;
  @Input() companyId: any;
  @Input() existingVideoCallLog: any;

  micMuted: boolean = false;
  videoStopped: boolean = false;
  screenShared: boolean = false;

  pusherSubscription: Subscription | undefined;
  callEnded: boolean = false;

  time: number = 0;
  interval;
  videoCallTime: number = 0;
  videoCallTrackingInterval;
  timerText: string = '';

  constructor(
    private localStream: LocalStreamComponent,
    private _professionalsService: ProfessionalsService,
    private _videoCallService: VideoCallService,
    private cd: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    initFlowbite();
    this.subscribeVideoCall();
  }

  subscribeVideoCall() {
    this.pusherSubscription = this._videoCallService
    .getFeedItems()
    .subscribe(async(response) => {
      if(response?.id == this.existingVideoCallLog?.professional_user_id || response?.channel == this.existingVideoCallLog?.professional_user_id) {
        if(response.mode == 'end-video-call') {
          this.handleLeaveChannel();
        }

        if(response.mode == 'recipient-joined-video-call') {
          this.startTimer();
          this.startTrackingCallDuration();
        }
      }
    })
  }

  handleMicToggle(e: Event): void {
    const isActive = this.localStream.getTrackState('audio') ?? false // get active state
    this.localStream?.muteTrack('audio', !isActive)
    this.micMuted = isActive;
  }

  handleVideoToggle(e: Event): void {
    const isActive = this.localStream?.getTrackState('video') ?? false// get active state
    this.localStream?.muteTrack('video', !isActive)
    this.videoStopped = isActive;
  }

  handleLeaveChannel(): void {
    this.pauseTimer();
    this.pusherSubscription?.unsubscribe();

    let timezoneOffset = new Date().getTimezoneOffset();
    let offset = moment().format('Z');
    let params = {
        id: this.existingVideoCallLog.professional_user_id,
        user_id: this.existingVideoCallLog.caller_user_id,
        company_id: this.companyId,
        mode: 'end-video-call',
        channel: this.existingVideoCallLog.caller_user_id,
        room: this.existingVideoCallLog.room,
        recipient_uid: this.existingVideoCallLog.recipient_uid,
        video_call_guid: this.existingVideoCallLog.video_call_guid,
        duration: this._videoCallService.getClientStats()?.Duration || 0,
        timezone: timezoneOffset,
        offset,
    }
    this.notifyVideoCallProfessional(params);

    this.localStream.handleLeaveChannel();
  }

  notifyVideoCallProfessional(params) {
    this._professionalsService.notifyVideoCallProfessional(params).subscribe(
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
      this.timerText = timer.transform(this.time);
      this.cd.detectChanges();
    }, 1000);
  }

  startTrackingCallDuration() {
    this.videoCallTrackingInterval = setInterval(() => {
      if (this.videoCallTime === 0) {
        this.videoCallTime++;
      } else {
        this.videoCallTime++;
      }

      let stats = this._videoCallService.getClientStats()?.Duration || 0;
      if(stats > 0) {
        let params = {
          video_call_guid: this.existingVideoCallLog?.video_call_guid,
          stats,
          professional_user_id: this.existingVideoCallLog.professional_user_id,
          caller_user_id: this.existingVideoCallLog.caller_user_id,
          room: this.existingVideoCallLog.room,
        }
        
        this._professionalsService.editVideoCallerBalance(params).subscribe(
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
    clearInterval(this.videoCallTrackingInterval);
  }

  ngOnDestroy() {
    this.pauseTimer();
  }
}