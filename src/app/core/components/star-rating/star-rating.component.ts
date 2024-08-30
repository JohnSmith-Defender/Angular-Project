import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-star-rating",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./star-rating.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRatingComponent {
  @Input() rating: any;
  @Input() align: any;
  @Input() mode: any;
}