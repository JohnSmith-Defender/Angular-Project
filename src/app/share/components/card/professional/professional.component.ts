import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subject } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { StarRatingModule } from 'angular-star-rating';
import { LocalService } from "@share/services";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";

@Component({
  selector: "app-professional-card",
  standalone: true,
  imports: [
      CommonModule,
      RouterModule,
      TranslateModule,
      NgOptimizedImage,
      StarRatingModule
  ],
  templateUrl: "./professional.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() image: any;
  @Input() path: any;
  @Input() name: any;
  @Input() firstName: any;
  @Input() userId: any;
  @Input() userName: any;
  @Input() userImage: any;
  @Input() label: any;
  @Input() languages: any;
  @Input() experience: any;
  @Input() experiencePeriod: any;
  @Input() rate: any;
  @Input() rateCurrency: any;
  @Input() rating: any;
  @Input() onlineStatus: any;
  @Input() buttonColor: any;
  @Input() hasVoiceCall: any;
  @Input() hasVideoCall: any;
  @Input() hasChat: any;
  @Input() canChat: any;
  @Input() userData: any;
  @Input() specialties: any[] = [];
  @Output() onStartCall = new EventEmitter();
  @Output() onStartChat = new EventEmitter();
  @Output() onStartVideoCall = new EventEmitter();
  @Output() onDetailClick = new EventEmitter();

  languageChangeSubscription;
  language: any;
  experienceText: any;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.formatData();
        }
      );

    this.formatData();
  }

  formatData() {
    const key = `timeunits.${this.experiencePeriod}`;
    this.experienceText = `${this.experience} ${this._translateService.instant(
      key
    )}`;
  }

  handleStartCall() {
    this.onStartCall.emit(this.id);
  }

  handleStartChat() {
    this.onStartChat.emit(this.id);
  }

  handleStartVideoCall() {
    this.onStartVideoCall.emit(this.id);
  }

  handleDetailClick(event) {
      this.onDetailClick.emit(event);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}