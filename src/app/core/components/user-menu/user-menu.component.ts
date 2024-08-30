import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  ViewChild,
  inject,
  Renderer2,
  Inject,
  isDevMode,
} from "@angular/core";
import { DOCUMENT } from '@angular/common';
import { Router, RouterModule } from "@angular/router";
import { LogoComponent } from "../logo/logo.component";
import { TranslateModule } from "@ngx-translate/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule } from "@angular/forms";
import { initFlowbite } from "flowbite";
import { AuthService, MenuService } from "@lib/services";
import { DateAgoPipe } from "@lib/pipes";
import { CreditsDisplayComponent } from "../credits-display/credits-display.component";
import { UserService } from "@share/services";
import { environment } from "@env/environment";

@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    FontAwesomeModule,
    DateAgoPipe,
    LogoComponent,
    CreditsDisplayComponent,
  ],
  templateUrl: "./user-menu.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  menus$ = inject(MenuService).menus$;
  
  @Input() menus: any;
  @Input() company: any;
  @Input() otherSettings: any;
  @Input() username: any;
  @Input() isAdmin: any;
  @Input() languages: any;
  @Input() language: any;
  @Input() imageSrc: any;
  @Input() userid: any;
  @Input() notifications: any;
  @Input() popupNotifications: any;
  @Input() canManageEvents: any;
  @Input() customMemberTypeName: any;
  @Input() currentUser: any;
  @Input() myActivitiesTitle: any;
  @Input() myClubsTitle: any;
  @Input() buttonColor: any;
  @Input() isTutorMenuVisible: any;
  @Input() manageMembers: any;
  @Input() userTypeName: any;
  @Input() superTutor: any;
  @Input() cityAdmin: any;
  @Input() hasCreditSetting: any;
  @Input() hasCreditPackageSetting: any;
  @Input() isTutorUser: any;
  @Input() showProfileButton: any;
  @Input() tutorManageStudentAccess: any;
  @Input() perHourCommission: any;
  @Input() separateCourseCredits: any;
  @Input() courseSubscriptions: any;
  @Input() userCourseCredits: any;
  @Input() courses: any;
  @Input() creditPackages: any;
  @Input() hasCredits: any;
  @Input() campus: any;
  @Input() isNetculturaUser: any;
  @Input() potSuperTutor: any;
  @Input() potTutor: any;
  @Input() hasInvitations: any;
  @Input() companyId: any;
  @Input() customMemberType: any;
  @Input() customMemberTypePermissions: any;
  @Input() superAdmin: any;
  @Input() isMentor: any;
  @Input() userMentor: any;
  @Input() canAccessIntroduceU: any;

  @Output() changeLanguage = new EventEmitter();

  companyName: any;
  primaryColor: any;
  menuColor: any;

  navigationSubscription;
  hasActivityFeed: boolean = false;
  myActivities: any = [];
  isMyClubsActive: boolean = false;
  isMyActivitiesActive: boolean = false;
  myClubs: any;
  canViewCRM: boolean = false;
  canViewGuests: boolean = false;
  canViewAdministrar: boolean = false;
  @ViewChild("outsidebutton", { static: false }) outsidebutton:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router, 
    private _authService: AuthService,
    private _userService: UserService,
    private cd: ChangeDetectorRef,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
  ) {
      
  }

  async ngOnInit() {
    if(this.companyId == 52 && !isDevMode()) {
      this.enableHotjar();
    }
  }

  ngOnChanges(changes: SimpleChange) {
    let userCourseCreditsChange = changes["userCourseCredits"];
    if (userCourseCreditsChange?.currentValue?.length > 0) {
      this.userCourseCredits = userCourseCreditsChange.currentValue;
      this._userService.updateUserCourseCredits(this.userCourseCredits);
    }

    let courseSubscriptionsChange = changes["courseSubscriptions"];
    if (courseSubscriptionsChange?.currentValue?.length > 0) {
      this.courseSubscriptions = courseSubscriptionsChange.currentValue;
    }

    let customMemberTypeChange = changes["customMemberType"];
    if (customMemberTypeChange?.currentValue?.id > 0) {
      this.customMemberType = customMemberTypeChange.currentValue;
      if(this.customMemberType) {
        this.canViewGuests = this.customMemberType?.view_guests == 1 ? true : false;
      }
    }

    let customMemberTypePermissionsChange = changes["customMemberTypePermissions"];
    if (customMemberTypePermissionsChange?.currentValue?.length > 0) {
      this.customMemberTypePermissions = customMemberTypePermissionsChange.currentValue;
      if(this.customMemberTypePermissions?.length > 0) {
        this.canViewCRM = this.getCRMPermissions(this.customMemberTypePermissions);
        this.canViewAdministrar = this.getAdministrarPermissions(this.customMemberTypePermissions);
      }
    }

    let userMentorChange = changes["userMentor"];
    if (userMentorChange?.currentValue?.length > 0) {
      this.userMentor = userMentorChange.currentValue;
    }
  }

  getCRMPermissions(permissions) {
    let result = false;
    if(permissions?.length > 0) {
      let crm_permissions = permissions.find(f => f.feature_id == 22);
      if(crm_permissions?.view == 1) {
        result = true;
      }
    }

    return result;
  }

  getAdministrarPermissions(permissions) {
    let result = false;
    if(permissions?.length > 0) {
      let admin_permissions = permissions.find(f => f.feature_id == 1);
      if(admin_permissions?.admin_assign == 1 || admin_permissions?.admin_attendance == 1) {
        result = true;
      }
    }

    return result;
  }

  hasAccess(path) {
    let access = true;
    if (this.menus && this.menus.length) {
      let feature =
        this.menus &&
        this.menus.filter((m) => {
          return m.path == path;
        });
      if (feature && feature.length > 0) {
      } else {
        access = false;
      }
    }

    return access;
  }

  enableHotjar() {
    let slScript = this.renderer2.createElement('script');
    slScript.innerText = `(function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:3913753,hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`
    this.renderer2.appendChild(this._document.body, slScript);
  }

  logout(): void {
    this._authService.logout();
    this._router.navigate(["/auth/login"]);
  }

  toggleHover(event) {
    if(event) {
      setTimeout(() => {
        initFlowbite();
      }, 100)
    }
  }

  goToStatistics() {
    setTimeout(() => {
      this.outsidebutton?.nativeElement.click();
      this._router.navigate(['/tiktok/statistics'])
      this.cd.detectChanges();
    }, 500)
  }

  redirectPath(mode) {
    let mentorId = 0;
    if(mode == 'mymentor') {
      if(this.userMentor?.length > 0) {
        mentorId = this.userMentor[0].user_id;
      }
    }

    setTimeout(() => {
      this.outsidebutton?.nativeElement.click();
      let path = '';
      switch(mode) {
        case 'userprofile':
          path = `/users/profile/${this.userid}`;
          break;
        case 'myaccount':
          path = `/users/my-account/${this.userid}`;
          break;
        case 'myclubs':
          path = '/dashboard/5';
          break;
        case 'crm':
          path = `/users/crm`;
          break;
        case 'invites':
          path = `/users/invites/me`;
          break;
        case 'viewguests':
          path = `/users/invites/view`;
          break;
        case 'myactivities':
          path = '/dashboard/1';
          break;
        case 'adminlists':
          path = '/users/admin-lists';
          break;
        case 'mylessons':
          path = '/users/my-lessons';
          break;
        case 'bookingshistory':
          path = '/tutors/bookings/history';
          break;
        case 'mycreditstutors':
          path = '/users/my-credits/tutors';
          break;
        case 'mycreditsactivities':
          path = '/users/my-credits/activities';
          break;
        case 'tutorsstripeconnect':
          path = '/tutors/stripe-connect';
          break;
        case 'studentsmanagement':
          path = '/settings/students-management';
          break;
        case 'manageusers':
          path = '/settings/manage-list/users';
          break;
        case 'mysessions':
          path = '/users/my-sessions';
          break;
        case 'mentorprofile':
          path = `/buddy/profile/mentor/${this.userid}`;
          break;
        case 'mymentor':
          path = `/buddy/mentor/${mentorId}`;
          break;
      }

      this._router.navigate([path]);
    }, 500)
  }

  ngOnDestroy() {
    this.navigationSubscription?.unsubscribe();
  }
}