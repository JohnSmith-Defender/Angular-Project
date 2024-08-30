import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { DomSanitizer } from '@angular/platform-browser';
import { SafeContentHtmlPipe } from "@lib/pipes";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { COURSE_UNIT_IMAGE_URL } from "@lib/api-constants";

@Component({
  selector: "app-video-section",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SafeContentHtmlPipe,
  ],
  templateUrl: "./video-section.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSectionComponent {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() company: any;
  @Input() templateData: any;

  languageChangeSubscription;
  language: any;
  buttonColor: any;
  data: any = [];

  constructor(
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    this.buttonColor = this.company.button_color
      ? this.company.button_color
      : this.company.primary_color;

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
    if(this.data) {
      this.data = this.templateData
      this.cd.detectChanges();
    }
  }

  getSafeVideoUrl(video) {
    let url
    if(video.indexOf('youtube') >= 0) {
      url = video?.replace('watch?v=', 'embed/')

      if(url && url.indexOf("&") > 0) {
        url = url.substring(0, url.indexOf("&"))
      }
    } else if(video.indexOf('vimeo') >= 0) {
      url = video?.replace('vimeo.com/', 'player.vimeo.com/video/')
    } else if(video.indexOf('http') >= 0) {
      url = video
    } else {
      url = `${COURSE_UNIT_IMAGE_URL}/${video}`
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}