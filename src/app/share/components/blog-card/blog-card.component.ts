import { Component, Input } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { StarRatingComponent } from "@lib/components";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { IdealButtonComponent } from "../ideal-button/ideal-button.component";

interface IBlogCardData {
  title: string;
  description: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FontAwesomeModule,
    StarRatingComponent,
    IdealButtonComponent,
  ],
  selector: "app-blog-card",
  templateUrl: "./blog-card.component.html",
})
export class BlogCardComponent {
  @Input() cardData!: IBlogCardData;
  @Input() direction: "flex-row" | "flex-col" = "flex-col";
}
