import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
} from "@angular/core";

@Component({
  selector: "app-breadcrumb",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./breadcrumb.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
    @Input() level1Title: any;
    @Input() level2Title: any;
    @Input() level3Title: any;
    @Input() level4Title: any;
    @Input() level5Title: any;
    @Input() level6Title: any;
    @Input() buttonColor;
    @Output() goBack = new EventEmitter();

    handleGoBack() {
      this.goBack.emit();
    }
}