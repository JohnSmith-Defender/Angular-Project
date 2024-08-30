import { Component, Input } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { TranslateModule } from "@ngx-translate/core";

interface ITestimonialCard {
  description: string;
  author: string;
  short_description: string;
  image: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, FontAwesomeModule, TranslateModule ],
  selector: "app-testimonial-card",
  templateUrl: "./testimonial-card.component.html",
})
export class TestimonialCardComponent {
  @Input() cardData!: ITestimonialCard;
  arrowRightIcon = faArrowRight;
}
