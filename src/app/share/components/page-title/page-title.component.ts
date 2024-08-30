import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input
} from "@angular/core";

@Component({
  selector: "app-page-title",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./page-title.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent {
    @Input() title: any;
    @Input() subtitle: any;
    @Input() showBack: any;
    @Input() mode: any;
}
