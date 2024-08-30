import { CommonModule } from '@angular/common';
import { 
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, 
  EventEmitter, 
  Input, 
  Output 
} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { PlansService } from '@features/services';
import { FormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService, UserService } from '@share/services';
import { initFlowbite } from 'flowbite';
import { Subject } from 'rxjs';
import moment from 'moment';
import get from 'lodash/get';

@Component({
    selector: 'app-plans-calendar',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class PlansCalendarComponent {
    @Input() hasDateSelected: any
    @Input() showPastEvents: any
    @Input() joinedPlan: any
    @Input() courses: any
    @Input() groups: any
    @Input() courseCategoriesAccessRoles: any
    @Input() allCourseCategories: any
    @Input() courseCategoryMapping: any
    @Input() admin1: any
    @Input() admin2: any
    @Input() superAdmin: any
    @Input() canCreatePlan: any
    @Input() calendarFilterMode: any
    @Input() isUESchoolOfLife: any;
    @Input() campus: any;
    @Input() mode: any;
    @Input() plansList: any;
    @Input() notifier: Subject<boolean> | undefined
    @Output() handleCalendarDateChange = new EventEmitter()
    @Output() handleJoinChange = new EventEmitter()
    @Output() handleExitCalendarFilter = new EventEmitter()
    
    apiPath: string = environment.api;
    user: any;
    email: any;
    language: any;
    emailDomain: any;
    monthNames: any;
    monthNamesES: any;
    monthNamesFR: any;
    weekdays = ["S", "M", "T", "W", "T", "F", "S"];

    // Calendar 1
    date: Date = new Date();
    daysInThisMonth: any;
    daysInLastMonth: any;
    daysInNextMonth: any;
    currentMonth: any;
    currMonth: any;
    calendar1CurrentMonth: boolean = true;
    currentYear: any;
    currentDate: any;
    selectedDay: any = -1;
    cachedSelectedDay = null;
    initialDay1: any = false;

    // Data
    allPlans: any = [];
    companyPlans: any = [];
    employeePlans: any = [];
    clubPlans: any = [];
    companyPlan: any = true;
    employeePlan: any = true;
    clubPlan: any = true;
    joinedPlans: any = [];
    url: any = environment.api;

    contest: any = true;
    contests : any = [];
    calendar1: boolean = false;
    userId: any;

    companyId: any
    otherSettings: any
    isMondayStart: boolean = false
    
    types: any = []
    features: any
    planTitle: any = ''
    clubTitle: any = ''
    hover: boolean = false
    selectedPlanId: any
    companies: any
    primaryColor: any
    buttonColor: any
    hoverColor: any
    calendarColor: any
    plansFeature: any
    selectedDate: any
    joinedCheck: boolean = false

    constructor(
        private _router: Router,
        private _plansService: PlansService,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private cd: ChangeDetectorRef,
    ) { }

    async ngOnInit() {
        initFlowbite();
        this.email = this._localService.getLocalStorage(environment.lsemail)
        this.userId = this._localService.getLocalStorage(environment.lsuserId)
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId)
        this.monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];
        this.monthNamesES = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre"
        ];
        this.monthNamesFR = [
          "Janvier",
          "Février",
          "Mars",
          "Avril",
          "Peut",
          "Juin",
          "Juillet",
          "Août",
          "Septembre",
          "Octobre",
          "Novembre",
          "Décembre"
        ];
    
        // Load Calendar 1
        this.language = this._localService.getLocalStorage(environment.lslang)
        this._translateService.use(this.language || 'es')
    
        this.email = this._localService.getLocalStorage(environment.lsemail)
        this.userId = this._localService.getLocalStorage(environment.lsuserId)
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId)
    
        this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies)) : ''
        if(!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
        let company = this._companyService.getCompany(this.companies)
        if(company && company[0]) {
          this.companyId = company[0].id
          this.primaryColor = company[0].primary_color
          this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
          this.hoverColor = company[0].hover_color ? company[0].hover_color : company[0].primary_color
          this.calendarColor = company[0].calendar_entry_color ? company[0].calendar_entry_color : company[0].button_color
        }
    
        this.currentDate = new Date().getDate();
        this.currMonth = this.language == 'en' ? this.monthNames[new Date().getMonth()] : (this.language == 'fr' ? this.monthNamesFR[new Date().getMonth()] : this.monthNamesES[new Date().getMonth()]);
    
        this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
          this.language = event.lang
          this.initializePage()
        })  
    
        this.initializePage()
    
        if(this.notifier) {
          this.notifier.subscribe((data) => {
            if(data) {
              this.joinedPlan = data ? data['joinedPlan'] : false
              this.hasDateSelected = data ? data['hasDateSelected'] : false
              this.initializePage()
            }
          });
        }
      }
    
      initializePage() {
        this.getOtherSettings()
      }
    
      getOtherSettings() {
        this.weekdays = ["L", "M", "X", "J", "V", "S", "D"];
        this.getUser()
      }
    
      getUser() {
        this._userService.getUserById(this.userId)
          .subscribe(
            response => {
              this.user = response['CompanyUser']
              this.emailDomain = this.user?.Company_Entity.domain
              let filter = this.showPastEvents || localStorage.getItem('show_past_events') == '1' ? '' : 'active'
              this._plansService.getCalendarPlans(
                this.companyId, 
                0, 
                1, 
                20, 
                filter, 
                this.isUESchoolOfLife,
                this.campus,
                this.mode,
              ).subscribe(
                async response => {
                  this.allPlans = response['Plans'];
                  if(this.mode == 'home') {
                    // Filter dates based on loaded plans
                    if(this.plansList?.length > 0 && this.allPlans?.length > 0) {
                      this.allPlans?.filter(plan => {
                        return this.plansList?.some((a) => a.item_id == plan.id);
                      })
                    }
                  }
                  this.loadPlans();
                }
              );
            },
            error => {
                console.log(error)
            }
          )
      }
    
      loadPlans(object = null, type:number = 0, event:any = null, joined = false) {
        this.joinedPlan = event ? event?.target.checked : false
        let allPlans
        if(event && !event?.target?.checked) {
          this.initializePage()
        } else {
          switch(type) {
            case 0:
              this.contest = object;
              break;
            case 1:
              this.companyPlan = object;
              break;
            case 2: 
              this.employeePlan = object;
              break;
            case 3: 
              this.clubPlan = object;
              break;
            case 4:
              if(event?.target?.checked) {
                this.joinedPlan = object;
              }
              break;
            default:
              break;
          }
      
          allPlans = this.allPlans
          this.joinedPlans = allPlans.filter(plan => {
            return (plan.plan_type_id == 1 || plan.plan_type_id == 5) ?
              (plan.CompanyPlanParticipants.length > 0 && plan.CompanyPlanParticipants.some(user => user.user_id == this.userId)) :
              (plan.Company_Group_Plan_Participants.length > 0 && plan.Company_Group_Plan_Participants.some(user => user.user_id == this.userId))
          })
      
          this.companyPlans = allPlans.filter(plan => {
            return plan.plan_type_id == 5;
          });
      
          this.employeePlans = allPlans.filter(plan => {
            return plan.plan_type_id == 1;
          });
      
          this.clubPlans = allPlans.filter(plan => {
            return plan.imgPath == 'get-image-group-plan';
          });
        
          this.getDaysOfMonth();
        }
    
        if(joined) {
          let params = {
            selectedDate: this.hasDateSelected ? this.selectedDate : false,
            joined: event?.target?.checked,
            joinedPlans: event?.target?.checked ? this.joinedPlans : []
          }
          this.handleJoinChange.emit(params)
        }
      }
    
      getDaysOfMonth() {
        this.daysInThisMonth = new Array();
        this.daysInLastMonth = new Array();
        this.daysInNextMonth = new Array();
        this.currentMonth = this.language == 'en' ? this.monthNames[this.date.getMonth()] : this.monthNamesES[this.date.getMonth()];
        this.currentYear = this.date.getFullYear();
    
        var firstDayThisMonth = new Date(
          this.date.getFullYear(),
          this.date.getMonth(),
          1
        ).getDay();
    
        var prevNumOfDays = new Date(
          this.date.getFullYear(),
          this.date.getMonth(),
          0
        ).getDate();
    
        for (
          var i = prevNumOfDays - (firstDayThisMonth - 0);
          i < prevNumOfDays;
          i++
        ) {
          this.daysInLastMonth.push(i);
        }
    
        var thisNumOfDays = new Date(
          this.date.getFullYear(),
          this.date.getMonth() + 1,
          0
        ).getDate();
    
        for (i = 0; i < thisNumOfDays; i++) {
          var obj = this.checkGroups(i + 1);
          this.daysInThisMonth.push(obj);
          if (i + 1 == this.currentDate || i + 1 == this.currentDate.day) {
            this.currentDate = obj;
          }
        }

        this.cd.detectChanges();
      }
    
      checkGroups(day?) {
        var day_number = (day < 10 ? '0' : '') + day;
        var month_number = ((this.date.getMonth() + 1) < 10 ? '0' : '') + (this.date.getMonth() + 1);
    
        let date1 = this.date.getFullYear() + "-" + month_number + "-" + day_number;
    
        let dayOfWeek = new Date(date1).getDay();
        if(dayOfWeek == 0) {
          dayOfWeek = 6
        } else {
          dayOfWeek = dayOfWeek - 1
        }
        let weekday = this.weekdays[dayOfWeek];
    
        let fillDays: any[] = [];
        if(day == 1 && dayOfWeek > 0) {
          for(var i=0;i<dayOfWeek;i++) {
            fillDays.push(i);
          }
        }
    
        var companyplans: any[] = [];
        var employeeplans: any[] = [];
        var clubplans: any[] = [];
        var joinedplans: any[] = [];
        var joinedexistingcompanyplan = false;
        var joinedexistingemployeeplan = false;
        var joinedexistingclubplan = false;
    
        if (this.companyPlan && !this.joinedPlan) {
          this.companyPlans.forEach(element => {
            let plan_date = element.plan_date.replace('T', ' ').replace('Z', '')
            if (
              element.plan_date && date1 &&
              moment(plan_date).format("YYYY-MM-DD") ==
              moment(date1).format("YYYY-MM-DD")
            ) {
              element.plan_date = moment(plan_date).format('ddd, D MMM YYYY hh:mm a');
              companyplans.push(element);
            }
          });
        }
        if (this.employeePlan && !this.joinedPlan) {
          this.employeePlans.forEach(element => {
            let plan_date = element.plan_date.replace('T', ' ').replace('Z', '')
            if (
              element.plan_date && date1 &&
              moment(plan_date).format("YYYY-MM-DD") ==
              moment(date1).format("YYYY-MM-DD")
            ) {
              element.plan_date = moment(plan_date).format('ddd, D MMM YYYY hh:mm a');
              employeeplans.push(element);
            }
          });
        }
        if (this.clubPlan && !this.joinedPlan) {
          this.clubPlans.forEach(element => {
            let plan_date = element.plan_date.replace('T', ' ').replace('Z', '')
            if (
              plan_date && date1 &&
              moment(plan_date).format("MM/DD/YYYY") ==
              moment(date1).format("MM/DD/YYYY")
            ) {
              element.plan_date = moment(plan_date).format('ddd, D MMM YYYY hh:mm a');
              clubplans.push(element);
            }
          });
        }
    
        if (this.joinedPlan == true) {
          this.joinedPlans && this.joinedPlans.forEach(element => {
            if (
              element.plan_date && date1 &&
              moment(element.plan_date).format("MM/DD/YYYY") ==
              moment(date1).format("MM/DD/YYYY")
            ) {
              element.joined = true;
              element.plan_date = moment(element.plan_date).format('ddd, D MMM YYYY hh:mm a');
              if(!joinedexistingcompanyplan && element.plan_type_id == 5) {
                joinedexistingcompanyplan = true;
              }
              if(!joinedexistingemployeeplan && element.plan_type_id == 1) {
                joinedexistingemployeeplan = true;
              }
              if(!joinedexistingclubplan && element.fk_group_id > 0) {
                joinedexistingclubplan = true;
              }
              joinedplans.push(element);
            }
          });
        }
    
        return {
          day: day,
          dayOfWeek: dayOfWeek,
          weekDay: weekday,
          fillDays: fillDays,
          companyPlans: companyplans,
          employeePlans: employeeplans,
          clubPlans: clubplans,
          joinedPlans: joinedplans,
          joinedExistingCompanyPlan: joinedexistingcompanyplan,
          joinedExistingEmployeePlan: joinedexistingemployeeplan,
          joinedExistingClubPlan: joinedexistingclubplan
        };
      }
    
      goToLastMonth() {
        let current = new Date();
        this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
        this.getDaysOfMonth();
        if(this.monthNames[current.getMonth()] != this.currentMonth) {
          this.calendar1CurrentMonth = false;
        } else {
          this.calendar1CurrentMonth = true;
        }
      }
    
      goToNextMonth() {
        let current = new Date();
        this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0);
        this.getDaysOfMonth();
        if(this.monthNames[current.getMonth()] != this.currentMonth) {
          this.calendar1CurrentMonth = false;
        } else {
          this.calendar1CurrentMonth = true;
        }
      }
    
      selectCalendar1(day, currentDate) {
        this.hasDateSelected = true
        this.calendar1 = false;
        this.initialDay1 = false;
        this.currentDate = day;
    
        if(day.day) {
          var day_number = day.day;
          var month_number = ((this.date.getMonth() + 1) < 10 ? '0' : '') + (this.date.getMonth() + 1);
          let date1 = this.date.getFullYear() + "-" + month_number + "-" + day_number;
          let converted_date = moment(new Date(date1))
    
          let selectedDate = {
            start:converted_date,
            end: converted_date
          }
          
          this.selectedDate = selectedDate
    
          let params = {
            selectedDate,
            joined: this.joinedPlan,
            joinedPlans: this.joinedPlan ? this.joinedPlans : []
          }
          this.handleCalendarDateChange.emit(params)
        }
      }
    
      goToPlan(type, id, plan_type_id) {
        let plan_type = 0;
        if(type == 'club') {
          plan_type = 4;
        } else {
          plan_type = plan_type_id;
        }
        this._router.navigate([`/plans/details/${id}/${plan_type}`])
      }
    
      ngOnDestroy() {
        
      }
    
      toggleHover(state, plan) {
        this.hover = state
        this.selectedPlanId = state ? plan.id : ''
      }
    
      getEventTitle(event) {
        return this.language == 'en' ? (event.title_en ? (event.title_en || event.title) : event.title) :
            (this.language == 'fr' ? (event.title_fr ? (event.title_fr || event.title) : event.title) : 
                event.title)
      }

      handleExit() {
        this.handleExitCalendarFilter.emit();
      }
}