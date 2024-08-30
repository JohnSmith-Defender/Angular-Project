import { CommonModule, NgOptimizedImage, Location } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { IconFilterComponent, PageTitleComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PlansService } from '@features/services';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { PlanCardComponent } from '@share/components/card/plan/plan.component';
import { environment } from '@env/environment';
import moment from "moment";
import get from "lodash/get";

@Component({
    selector: 'app-plans-category',
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        FormsModule,
        MatSnackBarModule,
        SearchComponent,
        IconFilterComponent,
        PageTitleComponent,
        PlanCardComponent,
        NgOptimizedImage,
        NgxPaginationModule,
    ],
    templateUrl: './category.component.html',
})
export class PlanCategoryComponent {
    private destroy$ = new Subject<void>();

    @Input() invite: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    language: any;
    userId: any;
    companyId: any;
    searchText: any;
    placeholderText: any;
    search: any;
    allEvents: any = [];
    events: any = [];
    route: string = '';
    eventTypeId: number = 0;
    companies: any = [];
    company: any;
    companyName: any;
    domain: any;
    primaryColor: any;
    buttonColor: any;
    p: any;
    apiPath: string = environment.api;
    pageTitle: string = '';
    invitationLink: string = '';
    isLoading: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _plansService: PlansService,
        private _location: Location, 
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        this.language = this._localService.getLocalStorage(environment.lslanguage) || "es";
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
        this._translateService.use(this.language || "es");

        if(this._router.url?.indexOf("speed-networking-3") >= 0) {
            this.eventTypeId = 1;
            this.pageTitle = 'SPEED NETWORKING';
        } else if(this._router.url?.indexOf("gar-grupos-de-alto-rendimiento") >= 0) {
            this.eventTypeId = 3;
            this.pageTitle = 'GAR - GRUPO DE ALTO RENDIMIENTO';
        } else if(this._router.url?.indexOf("eat-meet") >= 0 && this._router.url?.indexOf("networking-eat-meet") < 0) {
            this.eventTypeId = 2;
            this.pageTitle = 'EAT AND MEET';
        } else if(this._router.url?.indexOf("talleres-de-herramientas-digitales") >= 0) {
            this.eventTypeId = 4;
            this.pageTitle = 'TALLERES DE HERRAMIENTAS DIGITALES';
        } else if(this._router.url?.indexOf("internos") >= 0) {
            this.eventTypeId = 21;
            this.pageTitle = 'INTERNOS';
        } else if(this._router.url?.indexOf("networking-eat-meet") >= 0) {
            this.eventTypeId = 23;
            this.pageTitle = 'NETWORKING + EAT AND MEET';
        }

        this.initializePage();

        this.languageChangeSubscription =
        this._translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
                this.language = event.lang;
                this.initializePage();
            }
        );
    }

    async initializePage() {
        this.companies = this._localService.getLocalStorage(environment.lscompanies)
            ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
            : "";
        if (!this.companies) {
            this.companies = get(
                await this._companyService.getCompanies().toPromise(),
                "companies"
            );
        }
        let company = this._companyService.getCompany(this.companies);
        if (company && company[0]) {
            this.company = company[0];
            this.companyId = company[0].id;
            this.companyName = company[0].entity_name;
            this.domain = company[0].domain;
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color
                ? company[0].button_color
                : company[0].primary_color;
        }

        this.isLoading = true;
        this.initializeSearch();
        this.getEvents();
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant("news.searchbykeyword");
    }

    handleSearchChanged(event) {
        this.search = event || "";
        this.searchPlans();
    }

    getEvents() {
        this._plansService.getCategoryEvents(this.eventTypeId).subscribe(
            async response => {
              this.events = response.events;
              this.allEvents = this.events;
              if(this.events?.length > 0) {
                this.events = this.events.map((event, index) => {
                    let timezoneOffset = new Date().getTimezoneOffset();
                    let plan_date = (moment(event.plan_date).utc().utcOffset(timezoneOffset).format("YYYY-MM-DD HH:mm").toString() + ":00Z").replace(" ", "T");
                    let event_date = moment(plan_date).locale('es').format('dddd, D MMM HH:mm');
        
                    let selected = false;
                    let name = event.title + ' - ' + event_date;
                    let joined = this.isUserJoined(event.Company_Group_Plan_Participants) > 0 ? true : false;
        
                    let maximumGuestsReached = false;
                    let maximumMembersReached = false;
        
                    return {
                        name,
                        selected,
                        joined,
                        event_date,
                        maximum_members_reached: maximumMembersReached,
                        maximum_guests_reached: maximumGuestsReached,
                        ...event
                    }
                });
              }
              this.isLoading = false;
            },
            error => {
                console.log( error );
            }
        );
    }

    isUserJoined(planParticipants) {
        return planParticipants.filter(CompanyPlanParticipants =>
            CompanyPlanParticipants.user_id == this.userId
        ).length;
    }

    getEventTitle(event) {
        return this.language == "en"
          ? (event.title_en && event.title_en != 'undefined')
            ? event.title_en || event.title
            : event.title
          : this.language == "fr"
          ? event.title_fr
            ? event.title_fr || event.title
            : event.title
          : this.language == "eu"
          ? event.title_eu
            ? event.title_eu || event.title
            : event.title
          : this.language == "ca"
          ? event.title_ca
            ? event.title_ca || event.title
            : event.title
          : this.language == "de"
          ? event.title_de
            ? event.title_de || event.title
            : event.title
          : event.title;    
    }

    getActivityDate(activity) {
        let date = moment
          .utc(activity.plan_date)
          .locale(this.language)
          .format("D MMMM");
        if (activity.limit_date) {
          let start_month = moment
            .utc(activity.plan_date)
            .locale(this.language)
            .format("M");
          let end_month = moment
            .utc(activity.limit_date)
            .locale(this.language)
            .format("M");
          let activity_start_date = moment
            .utc(activity.plan_date)
            .locale(this.language)
            .format("YYYY-MM-DD");
          let activity_end_date = moment
            .utc(activity.limit_date)
            .locale(this.language)
            .format("YYYY-MM-DD");
    
          if (activity_start_date == activity_end_date) {
            date = `${moment
              .utc(activity.limit_date)
              .locale(this.language)
              .format("D MMMM")}`;
          } else {
            if (start_month == end_month) {
              date = `${moment
                .utc(activity.plan_date)
                .locale(this.language)
                .format("D")}-${moment(activity.limit_date)
                .locale(this.language)
                .format("D MMMM")}`;
            } else {
              date = `${moment
                .utc(activity.plan_date)
                .locale(this.language)
                .format("D MMMM")}-${moment(activity.limit_date)
                .locale(this.language)
                .format("D MMMM")}`;
            }
          }
        }
        return date;
    }

    goToEventRegistration(slug) {
        this.invitationLink =
            "https://" +
            window.location.host +
            "/event/" +
            slug +
            "/" +
            this.invite;
        location.href = this.invitationLink;
    }

    getImage(plan) {
        let path = plan?.plan_type_id > 0 ? '/get-ie-image-plan/' : '/get-image-group-plan/';
        return `${this.apiPath}${path}${plan?.image}`;
    }

    async searchPlans() {
        this.events = this.allEvents;
        if(this.search) {
            this.events = this.events?.filter((event) => {
                let include = false;
      
                if (
                  event.title.toLowerCase().indexOf(this.search.toLowerCase()) >= 0 ||
                  (event.title_en &&
                    event.title_en.toLowerCase().indexOf(this.search.toLowerCase()) >=
                      0) ||
                  (event.title_fr &&
                    event.title_fr.toLowerCase().indexOf(this.search.toLowerCase()) >=
                      0) ||
                  (event.title_eu &&
                    event.title_eu.toLowerCase().indexOf(this.search.toLowerCase()) >=
                      0) ||
                  (event.title_ca &&
                    event.title_ca.toLowerCase().indexOf(this.search.toLowerCase()) >=
                      0) ||
                  (event.title_de &&
                    event.title_de.toLowerCase().indexOf(this.search.toLowerCase()) >=
                      0)
                ) {
                  include = true;
                }
      
                if (event.address) {
                  if (
                    event.address.toLowerCase().indexOf(this.search.toLowerCase()) >=
                    0
                  ) {
                    include = true;
                  }
                }
      
                return include;
            });
        }
    }
 
    async open(message: string, action: string) {
      await this._snackBar.open(message, action, {
        duration: 3000,
        panelClass: ["info-snackbar"],
      });
    }

    ngOnDestroy() {
      this.languageChangeSubscription?.unsubscribe();
      this.destroy$.next();
      this.destroy$.complete();
    }
}