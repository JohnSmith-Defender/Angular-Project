import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StarRatingComponent } from "@lib/components";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faComment,
  faPhoneFlip,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";

interface ICategoryData {
  image: string;
  title: string;
  description: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, StarRatingComponent],
  selector: "app-tarot-card",
  templateUrl: "./category-chip.component.html",
})
export class CategoryCardComponent {
  @Input() categoryData!: ICategoryData;
}
