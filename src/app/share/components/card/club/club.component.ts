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
  selector: "app-club-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: "./club.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClubCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() title: any;
  @Input() image: any;
  @Input() buttonColor: any;
  @Input() companyId: any;
  @Input() parentComponent: any;
  @Input() isMember: any;
  @Input() category: any;
  @Input() city: any;
  @Input() contactEmail: any;
  @Input() mailto: any;
  @Input() contactInstagram: any;
  @Input() group: any;
  @Input() selectedClubId: any;
  @Output() handleDetailsClick = new EventEmitter()

  languageChangeSubscription;
  language: any;
  apiPath: string = environment.api;
  hover: boolean = false;

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

  goToClubDetails(event) {
    this.handleDetailsClick.emit(event);
  }

  toggleHover(state, club) {
    this.hover = state
    this.selectedClubId = state ? club.id : ''
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}