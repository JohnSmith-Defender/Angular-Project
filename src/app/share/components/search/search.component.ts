import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-search",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./search.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
    @Input() searchText: any;
    @Input() placeholderText: any;
    @Input() buttonColor;
    @Output() doSearch = new EventEmitter();
    @Output() onEnterPressed = new EventEmitter();

    search: any;

    handleSearch() {
      this.doSearch.emit(this.search);
    }

    handleKeyPressed() {
      this.onEnterPressed.emit(this.search);
    }

    handleSearchChanged(event) {
      this.search = event?.target?.value || '';
      this.doSearch.emit(this.search);
    }
}