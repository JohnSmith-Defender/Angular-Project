import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LocalService } from "@share/services";
import { Subject } from "rxjs";
import { Gallery, GalleryItem, ImageItem, GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';

@Component({
    selector: "app-image-gallery",
    standalone: true,
    imports: [
        CommonModule,
        GalleryModule,
        LightboxModule,
    ],
    templateUrl: "./image-gallery.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGalleryComponent {
    private destroy$ = new Subject<void>();

    @Input() items: any;

    languageChangeSubscription;
    language: any;
    data: any = [];
    images: GalleryItem[] = [];

    constructor(
        private _translateService: TranslateService,
        private _localService: LocalService,
        private gallery: Gallery,
      ) {}
    
    async ngOnInit() {
        this.formatImages();
    }

    formatImages() {
        let images_list = this.items?.map((image) => {
            return {
              srcUrl: image?.image,
              previewUrl: image?.image,
              type: 'image'
            }
        })
        if(images_list?.length > 0) {
            images_list?.forEach(image => {
                this.data.push(image)
            })
        }
        if(this.data?.length > 0) {
            this.images = this.data.map(
                (item) => new ImageItem({ 
                    src: item.srcUrl, 
                    thumb: item.previewUrl
                })
            );
        }
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
