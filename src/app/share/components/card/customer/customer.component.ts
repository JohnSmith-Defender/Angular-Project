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
  selector: "app-customer-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: "./customer.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() path: any;
  @Input() name: any;
  @Input() image: any;
  @Input() buttonColor: any;
  @Output() onEdit = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  languageChangeSubscription;
  language: any;
  selectedCustomerId: any;
  readHover: boolean = false;
  showDropdown: boolean = false;

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
    this.selectedCustomerId = event ? id : ''
  }

  handleEdit() {
    this.onEdit.emit(this.id);
    this.showDropdown = !this.showDropdown;
  }

  handleDelete() {
    this.onDelete.emit(this.id);
    this.showDropdown = !this.showDropdown;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}