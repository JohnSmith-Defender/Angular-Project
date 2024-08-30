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
import { LocalService } from "@share/services";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-mentor-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: "./mentor.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() name: any;
  @Input() path: any;
  @Input() image: any;
  @Input() photo: any;
  @Input() location: any;
  @Input() languages: any;
  @Input() major: any;
  @Input() buttonColor: any;
  @Input() companyId: any;
  @Output() handleDetailsClick = new EventEmitter()

  languageChangeSubscription;
  language: any;

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

  handleDetailsRoute(event) {
    this.handleDetailsClick.emit(event);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}