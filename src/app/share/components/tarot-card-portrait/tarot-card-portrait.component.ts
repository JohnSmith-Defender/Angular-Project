import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { StarRatingComponent } from "@lib/components";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { IdealButtonComponent } from "../ideal-button/ideal-button.component";
import {
  StarRatingModule,
} from 'angular-star-rating';
import {
  faComment,
  faPhoneFlip,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";

interface ITarotCardData {
  id?: number;
  image: string;
  title: string;
  description: string;
  specialties: any[];
  rating: number;
  salary: string;
  rate: number;
  rate_currency: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FontAwesomeModule,
    StarRatingComponent,
    StarRatingModule,
    IdealButtonComponent,
  ],
  selector: "app-tarot-card-portrait",
  templateUrl: "./tarot-card-portrait.component.html",
})
export class TarotCardPortraitComponent {
  @Input() cardData: ITarotCardData = {image: "", title: "" , description: "", specialties: [], rating: 0, salary: "", rate: 0, rate_currency: "$"};
  @Input() direction: "flex-row" | "flex-col" = "flex-col";
  @Input() language: any;
  @Input() buttonColor: any;
  @Output() onClick = new EventEmitter();

  commentIcon = faComment;
  phoneIcon = faPhoneFlip;
  videoIcon = faVideo;

  
  translateSpecialty(item): string {
    switch (this.language) {
      case "en":
        return item.subcategory_es;
      case "es":
        return item.subcategory_es;
      case "fr":
        return item.subcategory_fr;
      case "eu":
        return item.subcategory_eu;
      case "ca":
        return item.subcategory_ca;
      case "de":
        return item.subcategory_de;
      case "it":
        return item.subcategory_it;
      default:
        return "dummy";
    }
  }

  translateContactUs(): string {
    switch (this.language) {
      case "en":
        return "Contact us";
      case "es":
        return "Contáctate";
      case "fr":
        return "Entrer en contact";
      case "eu":
        return "Jarri harremanetan";
      case "ca":
        return "Contacta't";
      case "de":
        return "In Kontakt kommen";
      case "it":
        return "Mettiti in contatto";
      default:
        return "dummy";
    }
  }

  translateCalls(): string {
    switch (this.language) {
      case "en":
        return "Calls";
      case "es":
        return "Llama";
      case "fr":
        return "Appelle";
      case "eu":
        return "Deiak";
      case "ca":
        return "Truca";
      case "de":
        return "Anrufe";
      case "it":
        return "Chiamate";
      default:
        return "dummy";
    }
  }

  translateVideoCall(): string {
    switch (this.language) {
      case "en":
        return "Video call";
      case "es":
        return "Videollama";
      case "fr":
        return "Appel vidéo";
      case "eu":
        return "Bideo deia";
      case "ca":
        return "Videotruca";
      case "de":
        return "Videoanruf";
      case "it":
        return "Video chiamata";
      default:
        return "dummy";
    }
  }

  handleClick(event) {
    this.onClick.emit(event);
  }
}
