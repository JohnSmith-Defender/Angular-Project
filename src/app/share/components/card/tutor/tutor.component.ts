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
  selector: "app-tutor-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FontAwesomeModule,
    NgOptimizedImage,
    StarRatingComponent,
  ],
  templateUrl: "./tutor.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorCardComponent {
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
  @Input() tutorCardSmallImage: any;
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

  getTutorCity() {
    let city = this.city;

    let tutor_name = this.name || (this.first_name + ' ' + this.last_name);
    if(tutor_name) {
      city = city?.replace(`(${tutor_name})`, '')
    }

    if(city?.indexOf('(') >= 0) {
      let start_index = city?.indexOf('(');
      let suffix = city?.substr(start_index, city?.length - start_index);
      city = city?.replace(suffix, '');
    }

    return city?.trim();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}