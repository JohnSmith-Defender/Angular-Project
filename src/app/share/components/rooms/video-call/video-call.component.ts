import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  ViewChild,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject, Subscription, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import { CompanyService, LocalService } from "@share/services";
import { RemoteStreamComponent } from "@share/components/video-call/remote-stream/remote-stream.component";
import { LocalStreamComponent } from "@share/components/video-call/local-stream/local-stream.component";
import { MediaControlsComponent } from "@share/components/video-call/media-controls/media-controls.component";
import { environment } from "@env/environment";
import { VideoCallService } from "@features/services";

@Component({
  selector: "app-video-call-room",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    RemoteStreamComponent,
    LocalStreamComponent,
    MediaControlsComponent,
  ],
  templateUrl: "./video-call.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoCallRoomComponent {
  private destroy$ = new Subject<void>();

  @Input() isLoading: any;
  @Input() buttonColor: any;
  @Input() statusText: any;
  @Input() name: any;
  @Input() image: any;
  @Input() showActions: any;
  @Input() micMuted: any;
  @Input() mode: any;
  @Input() caller: any;
  @Input() professional: any;
  @Input() existingVideoCallLog: any;
  @Output() toggleMic = new EventEmitter();
  @Output() endCall = new EventEmitter();
  @Output() joinChannel = new EventEmitter();

  languageChangeSubscription;
  language: any;

  isLocalStreamVisible = false;
  participantInfo: any;
  recipientInfo: any;
  currentUserInfo: any;
  @ViewChild('remoteStreamsContainer') remoteStreamsComponent!: RemoteStreamComponent;
  
  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _videoCallService: VideoCallService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnChanges(changes: SimpleChange) {
    let callerChange = changes["caller"];
    if (callerChange?.currentValue?.id > 0) {
      let caller = callerChange.currentValue;
      this.caller = caller;
      this.reloadInfo();
    }

    let professionalChange = changes["professional"];
    if (professionalChange?.currentValue?.id > 0) {
      let professional = professionalChange.currentValue;
      this.professional = professional;
      this.reloadInfo();
    }

    let modeChange = changes["mode"];
    if (modeChange && 
      (modeChange?.previousValue != modeChange?.currentValue)
    ) {
      this.mode = modeChange.currentValue;
      this.reloadInfo();
    }
  }

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializeData();
        }
      );

    this.initializeData();
  }

  initializeData() {
    this.isLocalStreamVisible = true;
    if(window.location.href?.indexOf("/call/") >= 0) {
      this.joinChannel.emit();
    }
  }

  reloadInfo() {
    this.participantInfo = this.mode == 'caller' ? this.professional : (this.mode == 'recipient' ? this.caller : {});
    this.currentUserInfo = this.mode == 'caller' ? this.caller : (this.mode == 'recipient' ? this.professional : {});
    if(this.mode && this.caller && this.professional) {
      this.joinChannel.emit();
    }
    this.cd.detectChanges();
  }

  handleToggleMic() {
    this.toggleMic.emit();
  }

  handleEndCall() {
    this.handleLeaveChannel();
    this.endCall.emit();
  }

  handleLeaveChannel() {
    this.isLocalStreamVisible = false;
    this.remoteStreamsComponent.clearRemoteUsers();
    this.showActions = false;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}