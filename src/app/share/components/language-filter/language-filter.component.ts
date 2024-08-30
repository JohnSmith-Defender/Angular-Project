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
  selector: "app-language-filter",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./language-filter.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageFilterComponent {
    @Input() mode: any;
    @Input() languageList: any;
    @Input() icon: any;
    @Output() filterList = new EventEmitter();

    @ViewChild("button", { static: false }) button:
    | ElementRef
    | undefined;

    ngOnChanges(changes: SimpleChange) {
      initFlowbite();
      
      let listChange = changes["languageList"];
      if (listChange?.currentValue?.length > 0) {
        let list = listChange.currentValue;
        this.languageList = list;
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
      if(this.languageList?.length > 0) {
        let selected = this.languageList?.find((f) => f.selected);
        text = selected?.text;
      }

      return text;
    }
}