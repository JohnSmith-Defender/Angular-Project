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
  selector: "app-plan-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: "./plan.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() title: any;
  @Input() date: any;
  @Input() image: any;
  @Input() planTypeId: any;
  @Input() privacy: any;
  @Input() privateType: any;
  @Input() featuredTitle: any;
  @Input() excerpt: any;
  @Input() address: any;
  @Input() credits: any;
  @Input() buttonColor: any;
  @Input() price: any;
  @Input() page: any;
  @Input() size: any;
  @Input() position: any;
  @Input() companyId: any;
  @Input() bottomEventTitles: any;
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