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
import {
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import { LocalService } from "@share/services";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { StarRatingComponent } from "@lib/components";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-tutor-small-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FontAwesomeModule,
    NgOptimizedImage,
    StarRatingComponent,
  ],
  templateUrl: "./tutor-small.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorSmallCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() path: any;
  @Input() image: any;
  @Input() name: any;
  @Input() first_name: any;
  @Input() last_name: any;
  @Input() rating: any;
  @Input() city: any;
  @Input() languages: any;
  @Input() types: any;
  @Input() page: any;
  @Input() buttonColor: any;
  @Input() showSettings: any;
  @Output() onSettingsClick = new EventEmitter();
  @Output() onQuestionClick = new EventEmitter();

  languageChangeSubscription;
  language: any;

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

  handleSettingsClick() {
    this.onSettingsClick.emit();
  }

  handleQuestionClick() {
    this.onQuestionClick.emit();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}