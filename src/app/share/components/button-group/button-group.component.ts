import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
} from "@angular/core";
import { initFlowbite } from "flowbite";

@Component({
  selector: "app-button-group",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./button-group.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupComponent {
  @Input() buttonColor: any;
  @Input() buttonList: any;
  @Input() subcategoryList: any;
  @Input() subsubcategoryList: any;
  @Input() hiddenMainList: any;
  @Output() onButtonClick = new EventEmitter();
  @Output() onSubButtonClick = new EventEmitter();
  @Output() onSubSubButtonClick = new EventEmitter();

  refreshed: boolean = false;

  async ngOnInit() {
    initFlowbite();
  }

  ngOnChanges(changes: SimpleChange) {
    let buttonListChange = changes["buttonList"];
    this.refreshed = false;
    if (buttonListChange?.currentValue?.length > 0) {
      this.buttonList = buttonListChange.currentValue;
      this.refreshed = true
    }
  }

  handleActionClick(event) {
      this.onButtonClick.emit(event);
  }

  handleSubActionClick(event) {
    this.onSubButtonClick.emit(event);
  }

  handleSubSubActionClick(event) {
    this.onSubSubButtonClick.emit(event);
  }
}