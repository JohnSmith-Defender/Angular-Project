import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import {
  CompanyService,
  LocalService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { SafeContentHtmlPipe } from "@lib/pipes";
import { TikTokLandingBoxedComponent } from "../landing-boxed/landing-boxed.component";
import { TikTokLandingFullWidthComponent } from "../landing-full-width/landing-full-width.component";
import { NoAccessComponent } from "@share/components";
import { DomSanitizer } from '@angular/platform-browser';
import Player from '@vimeo/player';
import get from "lodash/get";

@Component({
  selector: "app-video-cta",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    SafeContentHtmlPipe,
    TikTokLandingBoxedComponent,
    TikTokLandingFullWidthComponent,
    NoAccessComponent,
  ],
  templateUrl: "./video-cta.component.html"
})
export class TikTokVideoCTAComponent {
  private destroy$ = new Subject<void>();

  @Input() slug: any;

  languageChangeSubscription;
  userId: any;
  companyId: any;
  language: any;
  isloading: boolean = true;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  company: any;
  domain: any;
  activateVideo: boolean = false;
  activateDescription: boolean = false;
  activateCTA: boolean = false;
  descriptionTextColor: any;
  descriptionText: any;
  videoEmbed: any;
  CTAText: any;
  CTAButtonColor: any;
  CTATextColor: any;
  videoCTA: any;
  updatedVideo: any;
  updatedCode: any;
  isLoading: boolean = true;
  CTALink: any;
  bannerImage:string = '';
  pageTitleText:string = '';
  quesAnsText:string = '';
  footerText:string = '';

  @ViewChild('playerContainer') playerContainer?: ElementRef | undefined;
  @ViewChild('cta') cta?: ElementRef | undefined;
  @ViewChild('desc') desc?: ElementRef | undefined;
  activateTimedButton: boolean = false;
  activatedVideoTime: boolean = false;
  activatedTime: boolean = false;
  showCTA: boolean = false;
  url: string = '';
  timedDuration: any;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslanguage) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this._translateService.use(this.language || "es");

    this.companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";
    if (!this.companies) {
      this.companies = get(
        await this._companyService.getCompanies().toPromise(),
        "companies"
      );
    }
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
        this.domain = company[0].domain
        this.companyId = company[0].id
        this.domain = company[0].domain
        this.primaryColor = company[0].primary_color
        this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.initializePage();
  }

  ngAfterViewInit(): void {
    if(this.playerContainer) {
      this.playerListener();
    }
  }

  playerListener() {
    const player = new Player(this.playerContainer?.nativeElement, {
      url: this.url,
      width: '1100px', // Add the desired width here
      height: '619px',
    });
    
    player.on('timeupdate', function (data) {
      if(data) {
        localStorage.setItem('player', JSON.stringify(data));
        let duration = localStorage.getItem('duration');
        if(duration && parseInt(duration) > 0) {
          if(data.seconds && data.seconds > parseInt(duration)) {
            let btn = document.getElementById("cta");
            if(btn) {
              btn.style.display = 'initial';
            }
            let btn1 = document.getElementById("desc");
            if(btn1) {
              btn1.style.display = 'initial';
            }
          }
        }
      }
    });
  }

  initializePage() {
    this.fetchLandingData();
  }

  fetchLandingData() {
    this._companyService.getVideoCTABySlug(this.slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          this.videoCTA = data?.video_cta?.length > 0 ? data?.video_cta[0] : '';
          this.formatDetails();
        },
        error => {
          console.log(error)
        }
      )
  }

  formatDetails() {
    this.bannerImage = this.videoCTA?.banner_image ;
    this.pageTitleText = this.videoCTA?.page_title_text;
    this.quesAnsText = this.videoCTA?.ques_ans_text;
    this.footerText = this.videoCTA?.footer_text;


    this.activateDescription = this.videoCTA?.description == 1 ? true : false;
    this.descriptionTextColor = this.videoCTA?.description_text_color || '#000000';
    this.descriptionText = this.videoCTA?.description_text;
    this.activateVideo = this.videoCTA?.video == 1 ? true : false;
    this.activateTimedButton = this.videoCTA?.timed_cta == 1 ? true : false;
    if(!this.activateTimedButton) {
      this.showCTA = true;
    } else {
      this.activatedVideoTime = this.videoCTA?.cta_video_time == 1 ? true : false;
      this.activatedTime = this.videoCTA?.cta_time == 1 ? true : false;
      if(this.activatedVideoTime) {
        if(this.videoCTA?.vimeo_id) {
          this.url = `https://player.vimeo.com/video/${this.videoCTA?.vimeo_id}`;
          localStorage.setItem('duration', this.videoCTA?.duration);
        } else {
          this.showCTA = true;
        }
      } else if(this.activatedTime) {
        this.timedDuration = this.videoCTA?.duration;
        setTimeout(() => {
          this.showCTA = true;
        }, (this.timedDuration * 1000));
      }
    }
    this.videoEmbed = this.videoCTA?.video_embed?.replace('width="640"', 'width="100%"')?.replace('<iframe', '<iframe class="video-cta-iframe mt-0" '); 
    if(this.activateVideo && this.videoEmbed) {
      this.getSafeLessonURL();
    }
    this.activateCTA = this.videoCTA?.cta == 1 ? true : false;
    this.CTAText = this.videoCTA?.cta_text || '';
    this.CTAButtonColor = this.videoCTA?.cta_button_color || '';
    this.CTATextColor = this.videoCTA?.cta_button_text_color || '';
    this.CTALink = this.videoCTA?.cta_link || '';
    this.isLoading = false;
    this.cd.detectChanges();
    if(this.playerContainer) {
      this.playerListener();
    }
  }

  getSafeLessonURL() {
    let url = this.videoEmbed?.replace('watch?v=', 'embed/');
    if(url && url.indexOf("&") > 0) {
      url = url.substring(0, url.indexOf("&"));
    }
    if(this.videoEmbed?.indexOf('vimeo') >= 0 && this.videoEmbed?.indexOf('iframe') < 0) {
      url = this.videoEmbed?.replace('vimeo.com/', 'player.vimeo.com/video/');
    } else if(this.videoEmbed?.indexOf('canva.com') >= 0 && this.videoEmbed?.indexOf('/watch?embed') < 0) {
      url = this.videoEmbed?.replace('/watch', '/watch?embed');
    } else {
      url = this.videoEmbed;
    }

    let updated_url = url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : '';
    this.updatedVideo = updated_url;
    this.updatedCode = url;
  }

  redirectToCTALink() {
    if(this.CTALink) {
      let params = {
        video_cta_id: this.videoCTA?.id?.toString(),
        company_id: this.companyId,
      };
  
      this._companyService.logVideoCTAClick(params).subscribe(
        (response) => {
          location.href = this.CTALink;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}