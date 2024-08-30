import { Component, Input } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

interface ICategoryCardData {
  title: string;
  image: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, TranslateModule],
  selector: "app-category-card",
  templateUrl: "./category-card.component.html",
})
export class CategoryCardComponent {
  @Input() cardData!: ICategoryCardData;
}
