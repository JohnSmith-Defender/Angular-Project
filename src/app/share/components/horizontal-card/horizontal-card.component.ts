import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { initFlowbite } from "flowbite";

@Component({
  selector: "app-horizontal-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./horizontal-card.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HorizontalCardComponent {
  @Input() item: any;
  @Input() title: any;
  @Input() description: any;
  @Input() buttonText: any;
  @Input() buttonColor: any;
  @Input() imageSrc: any;
  @Output() onViewDetails = new EventEmitter();
  @Output() onActionClick = new EventEmitter();

  async ngOnInit() {
    initFlowbite();
  }

  handleViewDetails() {
      this.onViewDetails.emit(this.item);
  }

  handleActionClick() {
      this.onActionClick.emit(this.item);
  }
}