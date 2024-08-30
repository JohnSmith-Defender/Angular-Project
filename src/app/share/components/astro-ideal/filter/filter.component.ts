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
  selector: "app-astro-ideal-filter",
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
  ],
  templateUrl: "./filter.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent {
    @Input() isMobile;
    @Input() buttonColor;
    @Input() list: any;
    @Input() showFilters: any;
    @Input() showChat: any;
    @Input() showVoiceCall: any;
    @Input() showVideoCall: any;
    @Input() showSort: any;
    @Output() onFilterClick = new EventEmitter();

    async ngOnInit() {
      
    }

    handleFilterClick(event) {
        this.onFilterClick.emit(event);
    }
}