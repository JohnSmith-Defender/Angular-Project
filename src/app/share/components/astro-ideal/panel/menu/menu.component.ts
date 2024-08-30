import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { ProfessionalsService } from "@features/services";
import { Subject } from "rxjs";
import { environment } from "@env/environment";

@Component({
  selector: "app-astro-ideal-panel-menu",
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    TranslateModule,
  ],
  templateUrl: "./menu.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelMenuComponent {
  private destroy$ = new Subject<void>();

  @Input() companyId: any;
  @Input() userId: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() list: any;
  @Output() onMenuClick = new EventEmitter();

  languageChangeSubscription;
  language: any;

  constructor(
      private _router: Router,
      private _translateService: TranslateService,
      private _localService: LocalService,
      private _companyService: CompanyService,
      public _professionalsService: ProfessionalsService,
  ) {
      
  }
  
  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

    this.languageChangeSubscription =
    this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
    );

    this.initializePage();
  }

  initializePage() {
      
  }

  handleMenuClick(event) {
    this.onMenuClick.emit(event);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}