import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import {
  CompanyService,
  LocalService,
  UserService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import get from "lodash/get";
import { TutorsService } from "@features/services";
import { ToastComponent } from "@share/components";
import moment from 'moment';

declare var Calendly: any;

@Component({
  selector: "app-video-cta",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    ToastComponent,
  ],
  templateUrl: "./external-calendly.component.html"
})
export class ExternalCalendlyComponent {
    private destroy$ = new Subject<void>();

    @ViewChild('container', {static: false}) container: ElementRef | undefined
    @Input() hasFreeBooking
    @Input() courseCreditSetting
    @Input() remainingCredits
    @Input() separateCourseCredits
    @Input() separateRemainingCourseCredits
    @Output() handleBooking = new EventEmitter()
    user: any
    companies: any = []
    tutorTypes: any
    calendlyEvent: any
    packageId: any
    courseId: any
    language: any
    userId: any
    hasNotBooked: boolean = false
    link: any
    tutorUserId: any
    tutorId: any
    companyId: any
    bookingSuccessful: boolean = false;
    params: any;
    showConfirmationModal: boolean = false;
    confirmItemTitle: any;
    confirmItemDescription: any;
    acceptText: string = '';
    company: any;

    constructor(
        private _router: Router,
        private _companyService: CompanyService,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _tutorsService: TutorsService,
        private _userService: UserService,
    ) {
        this.tutorTypes = this._localService.getLocalStorage(environment.lstutortypes) ? JSON.parse(this._localService.getLocalStorage(environment.lstutortypes)) : []
    }

    @HostListener('window:message', ['$event']) isCalendlyEvent(evt) {
        console.log(evt.data)

        if(evt.data.event && evt.data.event.indexOf('calendly.event_scheduled') === 0) {
            console.log('calendly.event_scheduled')
            let event_guid = evt.data && evt.data.payload && evt.data.payload.event ? evt.data.payload.event.uri : ''
            if(event_guid) {
                event_guid = event_guid.replace('https://api.calendly.com/scheduled_events/', '')
            }

            let invitee_guid = evt.data && evt.data.payload && evt.data.payload.invitee ? evt.data.payload.invitee.uri : ''
            if(invitee_guid) {
                invitee_guid = invitee_guid.replace('https://api.calendly.com/scheduled_events/', '')
                invitee_guid = invitee_guid.replace(event_guid + '/', '')
                invitee_guid = invitee_guid.replace('invitees/', '')
            }
            this.getCalendlyEventDetails(event_guid, invitee_guid)
        }

        if(evt.data.event && evt.data.event.indexOf('calendly.date_and_time_selected') === 0) {
            console.log('calendly.date_and_time_selected: ' + this.courseId)
        }
    }

    getCalendlyEventDetails(event_guid, invitee_guid) {
        this._tutorsService.getCalendlyEvent(event_guid, this.tutorUserId).subscribe(response => {
            this.calendlyEvent = response?.data?.resource ? response.data.resource : null
            if(!this.calendlyEvent){
                this.bookingSuccessful = false;
                this.confirmModal(null);
            } else {
                this.bookLesson(event_guid, invitee_guid)
            }
            return false
        }, err => {
            console.log('err: ', err);
        })
    }

    bookLesson(event_guid, invitee_guid) {
        let params = {
        company_id: this.companyId,
        user_id: this.userId,
        tutor_id: this.tutorId,
        package_id: this.packageId,
        course_id: this.courseId,
        booking_date: moment(this.calendlyEvent.start_time).format('YYYY-MM-DD'),
        booking_start_time: moment(this.calendlyEvent.start_time).format('HH:mm'),
        booking_end_time: moment(this.calendlyEvent.end_time).format('HH:mm'),
        tutor_types: this.tutorTypes && this.tutorTypes.map( (data) => { return data.id }).join(),
        calendly_event_id: event_guid, 
        calendly_invitee_id: invitee_guid,
        }
        
        if(this.courseCreditSetting) {
            if(!this.separateCourseCredits && this.remainingCredits > 0) {
                params['remaining_course_credits'] = this.remainingCredits - 1
            }
            if(this.separateCourseCredits && this.separateRemainingCourseCredits > 0) {
                params['separate_course_credits'] = this.separateCourseCredits ? 1 : 0
                params['remaining_credits'] = this.separateRemainingCourseCredits - 1
            }
        }
        this._tutorsService.addTutorBooking(params).subscribe(data => {
            let bookingId = data.id
            let bookingPaid = data.paid
            if(this.hasFreeBooking && !this.courseCreditSetting){
                    bookingPaid = 1
            }
            if(this.courseCreditSetting && this.remainingCredits > 0){
                bookingPaid = 1
            }
            if (bookingPaid == 1) {
                    this.confirmBooked(params);
            }
            else if(this.userId > 0) {
                //   location.href = `/signup/tutor/pay/${bookingId}/${this.userId}`
            } else {
                //   location.href = `/new-login?redirect=signup/tutor/pay/${bookingId}/`
            }
        }, err => {
        console.log('err: ', err);
        })
    }

    confirmBooked(params) {
        this.language = this._localService.getLocalStorage(environment.lslang)
        this._translateService.use(this.language || 'es')
        this.bookingSuccessful = true;
        this.confirmModal(params);
    }

    confirmModal(params) {
        this.showConfirmationModal = false;
        if(this.bookingSuccessful) {
            this.params = params;
            this.confirmItemTitle = this._translateService.instant(
                "campaign-details.confirmation"
            );
            this.confirmItemDescription = this._translateService.instant(
                "tutors.bookingconfirmed"
            ) + '                                                                                  ';
            } else {
            this.confirmItemTitle = this._translateService.instant(
                "calendly-course.bookingheadertext"
            );
            this.confirmItemDescription = this._translateService.instant(
                "calendly-course.bookingbodytext"
            )  + '                                                                                  ';
        }
        this.acceptText = "OK";
        setTimeout(() => (this.showConfirmationModal = true));
    }

    async confirm() {
        if(this.bookingSuccessful) {
            let params = this.params;
            this._tutorsService.sendBookingConfirmationEmail(params).subscribe(data => {
                // location.reload()
            }, err => {
                console.log('err: ', err);
            })
        }
    }

    async ngOnInit() {
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
        }
        this.language = this._localService.getLocalStorage(environment.lslanguage) || "es";
        this.userId = this.getParam('user_id');
        this.companyId = this.getParam('company_id');
        this.link = this.getParam('calendly_url') ? decodeURIComponent(this.getParam('calendly_url').toString()) : '';
        this.tutorUserId = this.getParam('tutor_user_id');
        this.tutorId = this.getParam('tutor_id');
        this.courseId = this.getParam('course_id');
        this.packageId = this.getParam('package_id');
        this.getUser();
    }

    getUser() {
        this._userService.getUserById(this.userId)
          .subscribe(
              async (response) => {
                  this.user = response['CompanyUser']
                  let url = this.link
                  let name = this.user && this.user.name ? this.user.name : (this.user.first_name + ' ' + this.user.last_name)
                  if(name && this.user.email) {
                      url = this.link + '?hide_event_type_details=1&name=' + name.replace(' ', '%20') + '&email=' + this.user.email
                  } else if(name && !this.user.email) {
                      url = this.link + '?hide_event_type_details=1&' + name.replace(' ', '%20')
                  } else if(!name && this.user.email) {
                      url = this.link + '?hide_event_type_details=1&' + this.user.email
                  }
                  setTimeout(() => {
                      Calendly.initInlineWidget({
                          url: url,
                          parentElement: this.container?.nativeElement
                      })
                  }, 500)
              },
              error => {
                  console.log(error)
              }
          )
    }

    getParam(name){
        const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if(!results){
            return 0;
        }
        return results[1] || 0;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}