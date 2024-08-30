import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
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
  selector: "app-testimonial-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: "./testimonial.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialCardComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() path: any;
  @Input() date: any;
  @Input() tag: any;
  @Input() shortdescription: any;
  @Input() image: any;
  @Input() buttonColor: any;
  @Input() author: any;
  @Input() socialMediaUrl: any;
  @Input() page: any;
  @Input() companyId: any;
  @Input() video: any;
  @Input() isCoverImage: any;

  
  languageChangeSubscription;
  language: any;
  selectedTestimonialId: any;
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
    this.formatAuthorName();

  }
  formatData(){
    
  }
  formatAuthorName(){
    const parser = new DOMParser();
    const parsedHTML = parser.parseFromString(this.author, 'text/html');
    this.author = parsedHTML.body.textContent;
  }

  toggleReadHover(event, id) {
    this.readHover = event;
    this.selectedTestimonialId = event ? id : ''
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}