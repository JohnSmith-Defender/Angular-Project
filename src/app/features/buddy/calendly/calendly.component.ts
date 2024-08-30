import { CommonModule, Location, NgOptimizedImage } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { BuddyService } from "@features/services";
import {
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { LocalService, CompanyService, UserService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "@env/environment";
import { ToastComponent } from "@share/components";
import { initFlowbite } from "flowbite";
import moment from 'moment';

declare var Calendly: any;

@Component({
  selector: 'app-mentor-calendly',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    NgOptimizedImage,
    ToastComponent,
  ],
  templateUrl: './calendly.component.html'
})
export class MentorCalendlyComponent {
  private destroy$ = new Subject<void>();

  @Input() buttonColor: any;
  @Input() link: any;
  @Input() mentorUserId: any;
  @Input() mentorId: any;
  @Input() companyId: any;
  @Input() name: any;
  @Input() first_name: any;
  @Input() last_name: any;
  @Input() email: any;
  @Input() company: any;

  userId: any;
  tutorTypes: any;
  calendlyEvent: any
  packageId: number = 0;
  courseId: number = 0;
  language: any;
  showConfirmationModal: boolean = false;
  @ViewChild('container', {static: false}) container: ElementRef | undefined;
  params: any;
  confirmItemTitle: any;
  confirmItemDescription: any;
  acceptText: string = '';
  bookingSuccessful: boolean = false;
  hasError: boolean = false;

  processingProgress: number = 0;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router,
    private _buddyService: BuddyService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _userService: UserService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.initializeCalendar();
  }

  initializeCalendar() {
    let url = this.link
    let name = this.name ? this.name : (this.first_name + ' ' + this.last_name);
    if(name && this.email) {
        url = this.link + '?hide_event_type_details=1&name=' + name.replace(' ', '%20') + '&email=' + this.email;
    } else if(name && !this.email) {
        url = this.link + '?hide_event_type_details=1&' + name.replace(' ', '%20');
    } else if(!name && this.email) {
        url = this.link + '?hide_event_type_details=1&' + this.email;
    }
    if(this.link) {
      setTimeout(() => {
        Calendly.initInlineWidget({
          url: url,
          parentElement: this.container?.nativeElement
        })
      }, 500)
    }
  }

  @HostListener('window:message', ['$event']) isCalendlyEvent(evt) {
    console.log(evt.data)

    if(evt.data.event && evt.data.event.indexOf('calendly.event_scheduled') === 0) {
      console.log('calendly.event_scheduled')
      console.log(evt)
      this.processingProgress = 15;
      this.modalbutton?.nativeElement.click();
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
      this.addCalendlySession(event_guid, invitee_guid)
    }

    if(evt.data.event && evt.data.event.indexOf('calendly.date_and_time_selected') === 0) {
      this.courseId = this._localService.getLocalStorage("selectedWorkingCourse") ? this._localService.getLocalStorage("selectedWorkingCourse") : 0
      console.log('calendly.date_and_time_selected: ' + this.courseId)
    }
  }

  addCalendlySession(event_guid, invitee_guid) {
    this.processingProgress = 65;

    let timezoneOffset = new Date().getTimezoneOffset()
    let offset = moment().format('Z')
    let params = {
      company_id: this.companyId,
      user_id: this.userId,
      mentor_id: this.mentorId,
      mentor_user_id: this.mentorUserId,
      event_guid, 
      invitee_guid,
      timezone: timezoneOffset,
      offset,
    }

    this._buddyService.addCalendlySession(params).subscribe(data => {
      this.processingProgress = 75;
      let sessionId = data?.session?.id
      this.processingProgress = 100;
        
      setTimeout(() => {
        this.closemodalbutton?.nativeElement.click();
      }, 500)
    }, err => {
      this.hasError = true;
      console.log('err: ', err);
    })
  }

  confirm() {

  }

  closeProcessingModal() {
    this.closemodalbutton?.nativeElement.click();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
