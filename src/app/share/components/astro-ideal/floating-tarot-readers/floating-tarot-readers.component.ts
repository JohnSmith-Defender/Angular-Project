import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import { StarRatingModule } from 'angular-star-rating';
import { CompanyService, LocalService } from "@share/services";
import { ProfessionalsService } from "@features/services";
import { Subject } from "rxjs";
import { environment } from "@env/environment";

@Component({
  selector: "app-astro-ideal-floating-tarot-readers",
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    TranslateModule,
    FormsModule,
    StarRatingModule,
  ],
  templateUrl: "./floating-tarot-readers.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingTarotReadersComponent {
  private destroy$ = new Subject<void>();

  @Input() companyId: any;
  @Input() userId: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() professionals: any;
  @Input() categories: any;

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

  goToProfessionals() {
    this._router.navigate(['/professionals'])
      .then(() => {
        window.location.reload();
      });
  }

  goToProfessionalPage(item) {
    this._router.navigate([item.path])
    .then(() => {
      window.location.reload();
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}