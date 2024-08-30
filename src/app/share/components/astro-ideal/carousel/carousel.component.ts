import { Component, Input } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { RitualeCardComponent } from "../rituale-card/rituale-card.component";
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, CarouselModule, RitualeCardComponent],
  selector: "app-carousel",
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.scss"],
})
export class CarouselComponent {
  @Input() items: any[] = [];
  @Input() language: any = "";

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    margin: 135,
    navSpeed: 700,
    navText: ['', ''],
    items: 3,
    // responsive: {
    //   0: {
    //     items: 1
    //   },
    //   400: {
    //     items: 2
    //   },
    //   740: {
    //     items: 3
    //   },
    //   940: {
    //     items: 4
    //   }
    // },
    nav: false
  }

  titleTranslator(item: any): string {
    switch (this.language) {
      case "en":
        return item.en_title;
      case "es":
        return item.es_title;
      case "fr":
        return item.fr_title;
      case "eu":
        return item.eu_title;
      case "ca":
        return item.ca_title;
      case "de":
        return item.de_title;
      case "it":
        return item.it_title;
      default:
        return "dummy";
    }
  }

  descriptionTranslator(item: any): string {
    switch (this.language) {
      case "en":
        return item.en_description;
      case "es":
        return item.es_description;
      case "fr":
        return item.fr_description;
      case "eu":
        return item.eu_description;
      case "ca":
        return item.ca_description;
      case "de":
        return item.de_description;
      case "it":
        return item.it_description;
      default:
        return "dummy";
    }
  }
}
