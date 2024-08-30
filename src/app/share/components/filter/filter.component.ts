import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IconFilterComponent } from "../icon-filter/icon-filter.component";
import { TypeFilterComponent } from "../type-filter/type-filter.component";
import { AgeGroupFilterComponent } from "../age-group-filter/age-group-filter.component";

@Component({
  selector: "app-filter",
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IconFilterComponent, 
    TypeFilterComponent,
    AgeGroupFilterComponent,
  ],
  templateUrl: "./filter.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent {
    @Input() mode;
    @Input() buttonColor;
    @Input() list: any;
    @Input() icon: any;
    @Input() buttonList: any;
    @Input() defaultActiveFilter: any;
    @Input() filterSettings: any;
    @Output() filterList = new EventEmitter();
    @Output() onButtonClick = new EventEmitter();
    @Output() onFilterClick = new EventEmitter();

    isActiveFilter: boolean = false;
    showButton: boolean = false;
    showIcon: boolean = false;

    async ngOnInit() {
      let selected = this.mode == 'clubs' ? 
        localStorage.getItem('club-filter-city') : 
        (this.mode == 'plans' ? 
          localStorage.getItem('plan-filter-city') : 
            (this.mode == 'tutors' ? 
              localStorage.getItem('tutor-filter-city') : 
              (this.mode == 'members' ? 
                localStorage.getItem('member-filter-city') : 
                (this.mode == 'job-offers' ? 
                  localStorage.getItem('job-offers-filter-city') : 
                  (this.mode == 'city-guides' ? 
                    localStorage.getItem('job-offers-filter-city') : 
                    ''
                  )
                )
              )
            )
        );
      this.isActiveFilter = selected ? true : false;

      if(selected && 
        (this.mode == 'plans' || 
          this.mode == 'clubs' || 
          this.mode == 'job-offers' ||
          this.mode == 'tutors' ||
          this.mode == 'members'
        )
      ) {
        if(this.list?.length > 0) {
          this.list.forEach(item => {
            if(item.city == selected) {
              item.selected = true;
            } else {
              item.selected = false;
            }
          })
        }
      }

      if(!this.isActiveFilter) {
        let selected_type = this.mode == 'plans' ? localStorage.getItem('plan-filter-type') : '';
        this.isActiveFilter = selected_type ? true : false;
        if(selected_type && this.mode == 'plans') {
          if(this.buttonList?.length > 0) {
            this.buttonList.forEach(item => {
              if(item.id == selected_type) {
                item.selected = true;
              } else {
                item.selected = false;
              }
            })
          }
        }
      }

      if(this.filterSettings?.length > 0) {
        this.checkFilterSettings();
      }
    }

    checkFilterSettings() {
      this.filterSettings?.forEach(filter => {
        if(filter.field == 'category' && filter.active == 1) {
          this.showButton = true;
        }
        if(filter.field == 'city' && filter.active == 1) {
          this.showIcon = true;
        }
      })
    }

    showFilter() {
      this.isActiveFilter = !this.isActiveFilter;
      this.defaultActiveFilter = !this.isActiveFilter;
      this.onFilterClick.emit(this.isActiveFilter);
    }

    filteredCity(event) {
      this.filterList.emit(event);
    }

    filteredType(event) {
      this.onButtonClick.emit(event);
    }
}