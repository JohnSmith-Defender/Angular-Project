import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input
} from "@angular/core";

@Component({
  selector: "app-company-logo",
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: "./company-logo.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyLogoComponent {
    @Input() logoSource: any;
    @Input() size: any;
}
