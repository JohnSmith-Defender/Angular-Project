import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
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
  selector: "app-home-template-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: "./home-template.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeTemplateCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() name: any;
  @Input() image: any;
  @Input() active: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Output() onActivate = new EventEmitter();

  languageChangeSubscription;
  language: any;

  constructor(
    private _router: Router,
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

  activate() {
    this.onActivate.emit(this.id);
  }

  goToImageGallery() {
    this._router.navigate([]).then((result) => {
      window.open(`/settings/home-gallery/${this.id}/template`, '_blank');
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}