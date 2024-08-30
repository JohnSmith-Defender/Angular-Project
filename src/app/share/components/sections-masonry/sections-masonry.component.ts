import { CommonModule, Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChange,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { StarRatingComponent } from "@lib/components";
import { PlansCalendarComponent } from "@features/plans/calendar/calendar.component";
import moment from "moment";

@Component({
  selector: "app-sections-masonry",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    StarRatingComponent,
    PlansCalendarComponent,
  ],
  templateUrl: "./sections-masonry.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionsMasonryComponent {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() company: any;
  @Input() list: any;
  @Input() isUESchoolOfLife: any;
  @Input() campus: any;
  @Input() bottomEventTitles: any;
  @Input() homeCalendar: any;
  @Input() allList: any;

  languageChangeSubscription;
  language: any;
  buttonColor: any;
  mode: any;
  hasDateSelected: boolean = false;
  calendarFilterMode: boolean = false;
  joinedPlan: boolean = false;
  courses: any = [];
  groups: any = [];
  courseCategoriesAccessRoles: any = [];
  allCourseCategories: any = [];
  courseCategoryMapping: any = [];
  admin1: boolean = false;
  admin2: boolean = false;
  canCreatePlan: boolean = false;
  selected: any;
  filterDate: any;
  plansList: any = [];
  childNotifier: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    this.buttonColor = this.company.button_color
      ? this.company.button_color
      : this.company.primary_color;

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.fetchData();
        }
      );

    this.fetchData();
  }

  fetchData() {
    this.mode = this.homeCalendar ? 'home' : '';
    this.list = this.allList;
    this.plansList = this.allList;
  }

  goToClubDetails(item) {
    if(this.userId > 0) {
      this._router.navigate([item.path]);
    } else {
      this._router.navigate(["/auth/login"]);
    }
  }

  goToCourseDetails(item) {
    if(this.userId > 0) {
      this._router.navigate([item.path]);
    } else {
      this._router.navigate(["/auth/login"], {
        queryParams: {
          returnUrl: this._router.routerState.snapshot.url
        }
      });
    }
  }

  handleCalendarDateChanged(params) {
    this.calendarFilterMode = true;
    this.selected = params.selectedDate || "";
    this.hasDateSelected = true;
    this.handleDateChange("", params.joined, params.joinedPlans);
  }

  handleDateChanged(date) {
    this.selected = date || "";
    this.handleDateChange();
  }

  async handleDateChange(
    mode: string = "",
    join: boolean = false,
    joinedPlans = []
  ) {
    const startDate = this.selected && this.selected.start ? this.selected.start.format() : "";
    const endDate = this.selected && this.selected.end ? this.selected.end.format() : "";

    if (startDate != "" && endDate != "") {
      this.filterDate = this.selected;
      this.list = this.list?.filter((plan) => {
        let include = false

        const start = startDate.split("T")[0];
        const end = endDate.split("T")[0];

        if(plan?.plan_date) {
          if (
            this.company?.id == 12 ||
            this.company?.id == 14 ||
            this.company?.id == 15
          ) {
            let plan_date = moment(plan.plan_date).format("YYYY-MM-DD");
            include = plan_date >= start && plan_date <= end;
          } else {
            
            include =  (
              plan.plan_date.split("T")[0] >= start &&
              plan.plan_date.split("T")[0] <= end
            );
          }
        } else {
          include = true;
        }

        return include;
      });
    }
  }

  handleJoinChanged(params) {
    this.joinedPlan = params.joined;
    this.calendarFilterMode = true;
    this.selected = params.selectedDate || "";
    this.handleDateChange("joined", params.joined, params.joinedPlans);
  }

  exitCalendarEventMode() {
    this.selected = ''
    this.calendarFilterMode = false
    this.hasDateSelected = false
    this.filterDate = ''
    this.joinedPlan = false
    this.fetchData()
    this.notifyChild({
        hasDateSelected: this.hasDateSelected,
        joinedPlan: this.joinedPlan
    })
  }

  notifyChild(params) {
    this.childNotifier.next(params)
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}