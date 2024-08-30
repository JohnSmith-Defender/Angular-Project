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
  selector: "app-astro-ideal-sort-drawer",
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
  ],
  templateUrl: "./sort-drawer.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortDrawerComponent {
    @Input() title: any;
    @Input() list: any;
    @Input() selectedSort: any;
    @Output() onSortClick = new EventEmitter();
    @Output() onExitClick = new EventEmitter();

    async ngOnInit() {
      
    }

    handleSortClick(event) {
        this.onSortClick.emit(event);
    }

    handleExit() {
        this.onExitClick.emit();
    }
}