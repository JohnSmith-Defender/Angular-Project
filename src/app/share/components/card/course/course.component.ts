import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChange,
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

@Component({
  selector: "app-course-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NgOptimizedImage
  ],
  templateUrl: "./course.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() path: any;
  @Input() title: any;
  @Input() category: any;
  @Input() price: any;
  @Input() image: any;
  @Input() progress: any;
  @Input() buttonText: any;
  @Input() page: any;
  @Input() buttonColor: any;
  @Input() mode: any;
  @Input() showDetails: any;
  @Input() buyNow: any;
  @Input() companyId: any;
  @Input() userId: any;
  @Input() courseButtonColor: any;
  @Input() section: any;
  @Input() ctaPath: any;
  @Input() courseIntro: any;

  languageChangeSubscription;
  language: any;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _router: Router,
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

  goToDetails() {
    if(this.showDetails) {
      if(this.courseIntro == 1) {
        this._router.navigate([`/courses/intro/${this.id}`]);
      } else {
        this._router.navigate([this.path]);
      }
    } else if (this.buyNow) {
      this._router.navigate([`/course-subscription/payment/${this.id}/${this.userId}`]);
    } else {
      if(this.ctaPath) {
        window.open(this.ctaPath, '_blank');
      } 
    }
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}