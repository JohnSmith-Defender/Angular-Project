import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { VgApiService, VgCoreModule } from "@videogular/ngx-videogular/core";
import { VgControlsModule } from "@videogular/ngx-videogular/controls";
import { VgOverlayPlayModule } from "@videogular/ngx-videogular/overlay-play";
import { VgBufferingModule } from "@videogular/ngx-videogular/buffering";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Media } from "@lib/interfaces";
import { environment } from "@env/environment";

@Component({
  selector: "app-video-player",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
  ],
  templateUrl: "./video-player.component.html",
})
export class VideoPlayerComponent {
  private destroy$ = new Subject<void>();

  @Input() playlist: any;

  preload: string = 'auto';
  api: VgApiService = new VgApiService;

  languageChangeSubscription;
  language: any;
  isMobile: boolean = false;
  
  source: SafeUrl | undefined;

  currentIndex: any;
  currentItem: Media | undefined;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private sanitizer: DomSanitizer,
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

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
    this.currentIndex = 0;
    this.currentItem = this.playlist[ this.currentIndex ];
  }

  onPlayerReady(api: VgApiService) {
    this.api = api;

    this.api
      .getDefaultMedia()
      .subscriptions.loadedMetadata.subscribe(this.playVideo.bind(this));
    this.api
      .getDefaultMedia()
      .subscriptions.ended.subscribe(this.nextVideo.bind(this));
  }

  playVideo() {
    // this.api.play();
  }

  nextVideo() {
    if (this.currentIndex < this.playlist?.length - 1) {
      this.currentIndex++;
    }

    this.currentItem = this.playlist[this.currentIndex];
  }

  onClickPlaylistItem(item: Media, index: number) {
    this.currentIndex = index;
    this.currentItem = item;
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}