import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input
} from "@angular/core";

@Component({
  selector: "app-section-title",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./section-title.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionTitleComponent {
    @Input() title: any;
    @Input() align: any;
    @Input() border: any;
}