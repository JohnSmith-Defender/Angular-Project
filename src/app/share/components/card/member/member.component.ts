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
  selector: "app-member-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: "./member.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() path: any;
  @Input() name: any;
  @Input() city: any;
  @Input() sector: any;
  @Input() phone: any;
  @Input() linkedin: any;
  @Input() email: any;
  @Input() references: any;
  @Input() image: any;
  @Input() logo: any;
  @Input() buttonColor: any;
  @Input() page: any;
  @Output() sendReference = new EventEmitter();

  languageChangeSubscription;
  language: any;
  selectedMemberId: any;
  readHover: boolean = false;

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
    this.selectedMemberId = event ? id : ''
  }

  handleSendReference() {
    this.sendReference.emit(this.id);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}