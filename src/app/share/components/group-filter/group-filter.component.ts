import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  ViewChild
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { initFlowbite } from "flowbite";

@Component({
  selector: "app-group-filter",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./group-filter.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupFilterComponent {
    @Input() mode: any;
    @Input() groupList: any;
    @Input() icon: any;
    @Output() filterList = new EventEmitter();

    @ViewChild("button", { static: false }) button:
    | ElementRef
    | undefined;

    ngOnChanges(changes: SimpleChange) {
      initFlowbite();
      
      let listChange = changes["groupList"];
      if (listChange?.currentValue?.length > 0) {
        let list = listChange.currentValue;
        this.groupList = list;
      }
    }

    handleFilter(event) {
        this.filterList.emit(event);
        this.button?.nativeElement.click();
    }

    async ngOnInit() {
      initFlowbite();
    }

    getSelectedItem() {
      let text = ''
      if(this.groupList?.length > 0) {
        let selected = this.groupList?.find((f) => f.selected);
        text = selected?.text;
      }

      return text;
    }
}