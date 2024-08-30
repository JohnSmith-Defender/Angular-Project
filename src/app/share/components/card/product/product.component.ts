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
  selector: "app-product-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: "./product.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() title: any;
  @Input() image: any;
  @Input() price: any;
  @Input() ratings: any;
  @Input() primaryColor: any;
  @Input() buttonColor: any;
  @Input() companyId: any;
  @Output() handleDetailsClick = new EventEmitter();
  @Output() handleAddToCartClick = new EventEmitter()

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

  handleAddToCart(event) {
    this.handleAddToCartClick.emit(event);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}