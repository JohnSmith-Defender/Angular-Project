import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subject } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import {
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import { LocalService } from "@share/services";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { StarRatingComponent } from "@lib/components";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-member-small-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FontAwesomeModule,
    NgOptimizedImage,
    StarRatingComponent,
  ],
  templateUrl: "./member-small.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberSmallCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() path: any;
  @Input() name: any;
  @Input() city: any;
  @Input() sector: any;
  @Input() phone: any;
  @Input() linkedin: any;
  @Input() email: any;
  @Input() references: any;
  @Input() image: any;
  @Input() logo: any;
  @Input() buttonColor: any;
  @Input() page: any;
  @Input() hasCallFeature: any;
  @Input() hasChatFeature: any;
  @Output() audioCall = new EventEmitter();
  @Output() chat = new EventEmitter();
  @Output() sendReference = new EventEmitter();

  languageChangeSubscription;
  language: any;
  selectedMemberId: any;
  readHover: boolean = false;

  sendIcon = faPaperPlane;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
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
    
  }

  toggleReadHover(event, id) {
    this.readHover = event;
    this.selectedMemberId = event ? id : ''
  }

  handleSendReference() {
    this.sendReference.emit(this.id);
  }

  handleAudioCall() {
    this.audioCall.emit(this.id);
  }

  handleChat() {
    this.chat.emit(this.id);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}