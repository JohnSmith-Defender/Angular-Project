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
  selector: "app-astro-ideal-filter-drawer",
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
  ],
  templateUrl: "./filter-drawer.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDrawerComponent {
    @Input() title: any;
    @Input() list: any;
    @Input() selectedFilters: any;
    @Output() onFilterClick = new EventEmitter();
    @Output() onExitClick = new EventEmitter();

    async ngOnInit() {
      
    }

    handleFilterClick(type, id) {
        let params = {
            type,
            id,
        }

        this.onFilterClick.emit(params);
    }

    handleExit() {
        this.onExitClick.emit();
    }

    getSelected(item) {
        let selected = false;
        if(this.selectedFilters?.length > 0) {
            let match = this.selectedFilters?.some(
                (a) => a.type == item.type && a.id == item.id
            );
            if(match) {
                selected = true;
            }
        }

        return selected;
    }
}