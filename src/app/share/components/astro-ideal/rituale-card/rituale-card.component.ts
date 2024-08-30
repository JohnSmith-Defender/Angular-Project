import { Component, Input } from "@angular/core";
import { StarRatingComponent } from "@lib/components";
import {
  StarRatingModule,
} from 'angular-star-rating';
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

interface ICategoryCardData {
  title: string;
  description: string;
  image: string;
  amount: string;
  currency: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, TranslateModule, StarRatingComponent, StarRatingModule],
  selector: "app-rituale-card",
  templateUrl: "./rituale-card.component.html",
})
export class RitualeCardComponent {
  @Input() cardData!: ICategoryCardData;
}
