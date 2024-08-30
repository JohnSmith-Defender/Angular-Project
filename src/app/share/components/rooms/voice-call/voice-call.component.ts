import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import { CompanyService, LocalService } from "@share/services";
import { environment } from "@env/environment";

@Component({
  selector: "app-voice-call-room",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: "./voice-call.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceCallRoomComponent {
  private destroy$ = new Subject<void>();

  @Input() isLoading: any;
  @Input() buttonColor: any;
  @Input() statusText: any;
  @Input() name: any;
  @Input() image: any;
  @Input() showActions: any;
  @Input() micMuted: any;
  @Input() personalData: any;
  @Input() invalidPasscode: any;
  @Input() requirePasscode: any;
  @Output() toggleMic = new EventEmitter();
  @Output() endCall = new EventEmitter();
  @Output() validatePasscode = new EventEmitter();

  languageChangeSubscription;
  language: any;
  validPasscode: boolean = false;
  passcode: any;
  submitted: boolean = false;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private cd: ChangeDetectorRef
  ) {

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

  }

  handleToggleMic() {
    this.toggleMic.emit();
  }

  handleEndCall() {
    this.endCall.emit();
  }

  enterPasscode() {
    this.validatePasscode.emit(this.passcode);
  }

  goHome() {
    location.href = '/';
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}