import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-list-showcase",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgOptimizedImage],
  templateUrl: "./list-showcase.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListShowcaseComponent {
    @Input() title: any;
    @Input() list: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() hoverColor: any;

    hover: boolean = false;
    selectedId: any;
}