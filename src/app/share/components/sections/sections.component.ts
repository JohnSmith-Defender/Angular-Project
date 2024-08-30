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
import { PlanCardComponent } from "../card/plan/plan.component";
import { PageTitleComponent } from "../page-title/page-title.component";
import moment from "moment";

@Component({
  selector: "app-sections",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    StarRatingComponent,
    PlansCalendarComponent,
    PlanCardComponent,
    PageTitleComponent,
  ],
  templateUrl: "./sections.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionsComponent {
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
  @Input() hasSectionsTemplate: any;
  @Input() plansTitle: any;
  @Input() groupsTitle: any;
  @Input() cityGuidesTitle: any;
  @Input() jobOffersTitle: any;
  @Input() coursesTitle: any;
  @Input() discountsTitle: any;
  @Input() blogsTitle: any;
  @Input() membersTitle: any;
  @Input() tutorsTitle: any;
  @Input() planCalendar: any;

  languageChangeSubscription;
  language: any;
  buttonColor: any;
  mode: any;
  hasDateSelected: boolean = false;
  calendarFilterMode: boolean = false;
  joinedPlan: boolean = false;
  courses: any = [];
  coursesNivelacion: any = [];
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
  plans: any = [];
  plansSectionTitle: boolean = false;
  clubs: any = [];
  groupsSectionTitle: boolean = false;
  cityGuides: any = [];
  cityGuidesSectionTitle: boolean = false;
  jobOffers: any = [];
  jobOffersSectionTitle: boolean = false;
  coursesSectionTitle: boolean = false;
  coursesNivelacionSectionTitle: boolean = false;
  discounts: any = [];
  discountsSectionTitle: boolean = false;
  blogs: any = [];
  blogsSectionTitle: boolean = false;
  members: any = [];
  membersSectionTitle: boolean = false;
  tutors: any = [];
  tutorsSectionTitle: boolean = false;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChange) {
    let plansTitleChange = changes["plansTitle"];
    if (plansTitleChange?.previousValue != plansTitleChange?.currentValue) {
      this.plansSectionTitle = plansTitleChange?.currentValue;
    }

    let groupsTitleChange = changes["groupsTitle"];
    if (groupsTitleChange?.previousValue != groupsTitleChange?.currentValue) {
      this.groupsSectionTitle = groupsTitleChange?.currentValue;
    }

    let cityGuidesTitleChange = changes["cityGuidesTitle"];
    if (cityGuidesTitleChange?.previousValue != cityGuidesTitleChange?.currentValue) {
      this.cityGuidesSectionTitle = cityGuidesTitleChange?.currentValue;
    }

    let jobOffersTitleChange = changes["jobOffersTitle"];
    if (jobOffersTitleChange?.previousValue != jobOffersTitleChange?.currentValue) {
      this.jobOffersSectionTitle = jobOffersTitleChange?.currentValue;
    }

    let coursesTitleChange = changes["coursesTitle"];
    if (coursesTitleChange?.previousValue != coursesTitleChange?.currentValue) {
      this.coursesSectionTitle = coursesTitleChange?.currentValue;
      this.coursesNivelacionSectionTitle = this._translateService.instant('landing.solcourses');
    }

    let discountsTitleChange = changes["discountsTitle"];
    if (discountsTitleChange?.previousValue != discountsTitleChange?.currentValue) {
      this.discountsSectionTitle = discountsTitleChange?.currentValue;
    }

    let blogsTitleChange = changes["blogsTitle"];
    if (blogsTitleChange?.previousValue != blogsTitleChange?.currentValue) {
      this.blogsSectionTitle = blogsTitleChange?.currentValue;
    }

    let membersTitleChange = changes["membersTitle"];
    if (membersTitleChange?.previousValue != membersTitleChange?.currentValue) {
      this.membersSectionTitle = membersTitleChange?.currentValue;
    }

    let tutorsTitleChange = changes["tutorsTitle"];
    if (tutorsTitleChange?.previousValue != tutorsTitleChange?.currentValue) {
      this.tutorsSectionTitle = tutorsTitleChange?.currentValue;
    }

    // let listChange = changes["list"];
    // if (listChange?.currentValue?.length > 0) {
    //   let list = listChange.currentValue;
    //   this.list = list;
    //   this.fetchData();
    // }

    let allListChange = changes["allList"];
    if (allListChange?.currentValue?.length > 0) {
      let list = allListChange.currentValue;
      this.allList = list;
      this.fetchData();
    }
  }

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
    this.separateByType(this.list);
  }

  separateByType(list) {
    this.plans = list?.filter(item => {
      return item?.object_type == 'plan'
    })

    this.clubs = list?.filter(item => {
      return item?.object_type == 'club'
    })

    this.cityGuides = list?.filter(item => {
      return item?.object_type == 'cityguide'
    })

    this.jobOffers = list?.filter(item => {
      return item?.object_type == 'joboffer'
    })

    if(this.isUESchoolOfLife) {
      this.courses = list?.filter(item => {
        return item?.object_type == 'course' && item?.sol_nivelacion != 1
      })
      this.coursesNivelacion = list?.filter(item => {
        return item?.object_type == 'course' && item?.sol_nivelacion == 1
      })
    } else {
      this.courses = list?.filter(item => {
        return item?.object_type == 'course'
      })
    }

    this.discounts = list?.filter(item => {
      return item?.object_type == 'discount' || item?.object_type == 'service'
    })

    this.blogs = list?.filter(item => {
      return item?.object_type == 'blog'
    })

    this.members = list?.filter(item => {
      return item?.object_type == 'member'
    })

    this.tutors = list?.filter(item => {
      return item?.object_type == 'tutor'
    })
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
      if(item?.button_text != `${this._translateService.instant("courses.begin")} ${this._translateService.instant("invite.here")}` && item?.button_text != this._translateService.instant("courses.continue")) {
      } else {
        if(item?.course_intro == 1) {
          this._router.navigate([`/courses/intro/${item.item_id}`]);
        } else {
          this._router.navigate([item.path]);
        }
      }
    } else {
      let returnUrl = this._router.routerState.snapshot.url;
      if(item?.course_intro == 1) {
        returnUrl = `/courses/intro/${item.item_id}`;
      } else {
        returnUrl = item.path;
      }
      this._router.navigate(["/auth/login"], {
        queryParams: {
          returnUrl,
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

    this.plans = this.allList?.filter(item => {
      return item?.object_type == 'plan'
    })
    
    if (startDate != "" && endDate != "") {
      this.filterDate = this.selected;
      this.plans = this.plans?.filter((plan) => {
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

  handleDetailsClickRoute(plan) {
    if(plan) {
      let planTypeId = plan?.plan_type_id;
      if (plan?.privacy && !plan?.private_type) {
      } else {
        this._router.navigate([`/plans/details/${plan?.item_id}/${planTypeId}`]);
      }
    }
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}