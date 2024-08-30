import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { environment } from "@env/environment";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { LocalService, CompanyService, UserService } from "@share/services";
import { MenuService, PushNotificationService } from "@lib/services";
import { PlansService, TutorsService, BuddyService, VideoCallService, VoiceCallService, ChatService, ProfessionalsService } from "@features/services";
import { FooterComponent, MobileNavbarComponent } from "src/app/core/components";
import { Subject, takeUntil } from "rxjs";
import { ChatComponent, ToastComponent } from "@share/components";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "@lib/components/sidebar/sidebar.component";
import { UserMenuComponent } from "@lib/components/user-menu/user-menu.component";
import { GuestMenuComponent } from "@lib/components/guest-menu/guest-menu.component";
import { TopMenuComponent } from "@lib/components/top-menu/top-menu.component";
import { CallNotificationPopupComponent } from "@share/components/call-notification-popup/call-notification-popup.component";
import { Subscription } from 'rxjs';
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-layout-main",
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule,
    FormsModule,
    SidebarComponent,
    FooterComponent, 
    ToastComponent,
    UserMenuComponent,
    MobileNavbarComponent,
    GuestMenuComponent,
    TopMenuComponent,
    CallNotificationPopupComponent,
    ChatComponent,
  ],
  templateUrl: "./layout-main.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutMainComponent {
  private destroy$ = new Subject<void>();

  @Input() newUpdatesAvailable: any;

  companies: any;
  userId: any;
  companyId: any;
  language: any;
  domain: any;
  companyName: any;
  imageSrc: any;
  currentUser: any;
  username: string = "";
  notifications: any = [];
  menus: any = [];
  otherSettings: any;
  hasMenuOrdering: boolean = false;
  menuOrdering: any;
  features: any;
  tempData: any;
  dashboardDetails: any;
  superAdmin: boolean = false;
  admin1: boolean = false;
  admin2: boolean = false;
  hasCustomMemberTypeSettings: boolean = false;
  hasTutors: boolean = false;
  isTutorUser: boolean = false;
  tutorUsers: any = [];
  apiPath: string = environment.api;
  popupNotifications: any = [];
  isVCPAdminRoute: boolean = false;
  languages: any = [];
  customMemberTypes: any = [];
  mentors: any = [];
  canCreatePlan: boolean = false;
  canCreateClub: boolean = false;
  canCreateCanalEmpleo: boolean = false;
  canCreateCourse: boolean = false;
  canManageEvents: boolean = false;
  refreshMenu: boolean = false;
  showSideMenu: boolean = false;
  notificationsLength: number = 0;
  expireDays: any;
  cancelDays: any;
  expireDaysDiff: any;
  homeTextValue: any;
  homeTextValueEn: any;
  homeTextValueFr: any;
  homeTextValueEu: any;
  homeTextValueCa: any;
  homeTextValueDe: any;
  newMenuButton: any;
  newMenuButtonTextValue: any;
  newMenuButtonTextValueEn: any;
  newMenuButtonTextValueFr: any;
  newMenuButtonTextValueEu: any;
  newMenuButtonTextValueCa: any;
  newMenuButtonTextValueDe: any;
  newMenuButtonUrl: any;
  courseSubscriptions: any = [];
  homeActive: boolean = false;
  courseTutors: any = [];
  isTutor: boolean = false;
  courses: any = [];
  hasEventCalendar: boolean = false;
  coursesTitle: any;
  customMemberTypeName: any;
  userMemberTypes: any = [];
  memberTypeExpirations: any = [];
  courseWallPrefix: any;
  courseWallPrefixTextValue: any;
  courseWallPrefixTextValueEn: any;
  courseWallPrefixTextValueFr: any;
  courseWallPrefixTextValueEu: any;
  courseWallPrefixTextValueCa: any;
  courseWallPrefixTextValueDe: any;
  courseWallMenu: any;
  tutorId: any = 0;
  onlyAssignedTutorAccess: boolean = false;
  showContactUs: boolean = false;
  contactUsDetails: any;
  pageInit: boolean = false;
  tutorManageStudentAccess: boolean = false;
  courseExceptionUser: any = [];
  hasCreditSetting: boolean = false;
  hasCreditPackageSetting: boolean = false;
  tutorsFeatureId: any;
  coursesFeatureId: any;
  hasCourses: boolean = false;
  hasCategoryAccess: boolean = false;
  roles: any;
  company: any;
  isAdmin: boolean = false;
  title: string = '';
  description: string = '';
  acceptText: string = '';
  cancelText: string = '';
  isDashboardActive: boolean = false;
  isMyClubsActive: boolean = false;
  isMyActivitiesActive: boolean = false;
  myClubs: any;
  myActivities: any;
  myClubsTitle: string = '';
  myActivitiesTitle: string = '';
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  logoSource: any;
  isTutorMenuVisible: boolean = false;
  userTypeName: any;
  manageMembers: boolean = false;
  superTutor: boolean = false;
  potSuperTutor: boolean = false;
  potTutor: boolean = false;
  cityAdmin:  boolean = false;
  showProfileButton: boolean = false;
  perHourCommission: boolean = false;
  separateCourseCredits: boolean = false;
  userCourseCredits: any;
  creditPackages: any;
  navigationSubscription: any;
  isWall: boolean = false;
  hasCredits: any;
  newURLButton: any;
  newURLButtonTextValue: any;
  newURLButtonTextValueEn: any;
  newURLButtonTextValueFr: any;
  newURLButtonTextValueEu: any;
  newURLButtonTextValueCa: any;
  newURLButtonTextValueDe: any;
  newURLButtonUrl: any;
  isUESchoolOfLife: boolean = false;
  user: any;
  campus: any = '';
  refreshedMenu: boolean = false;
  isNetculturaUser: boolean = false;
  homeTextValueIt: any;
  newMenuButtonTextValueIt: any;
  newURLButtonTextValueIt: any;
  courseWallPrefixTextValueIt: any;
  hasInvitations: boolean = false;
  salesPeople: any = [];
  isSalesPerson: boolean = false;
  hasHistoryOfActivities: any;
  canRegister: boolean = false;
  customMemberType: any;
  customMemberTypePermissions: any;
  showFooter: boolean = false;
  customLinks: any = [];
  isCursoGeniusTestimonials: boolean = false;
  hasBuddy: boolean = false;
  isMentor: boolean = false;
  userMentor: any;
  canAccessIntroduceU: boolean = false;
  navigation: any = 'side-menu';
  shopFeatureId: any;
  hasShop: boolean = false;
  cart: any = [];

  pusherSubscription: Subscription | undefined;
  pusherData: any = {};
  showToast: boolean = false;
  toastMessage: string = '';
  toastMode: string = '';
  audio: any;
  toastImage: any;
  toastName: any;
  professionalsFeatureId: any;
  hasProfessionals: boolean = false;
  callPage: boolean = false;
  callGuid: any;
  callPasscode: any;
  videoCallGuid: any;
  videoCallPasscode: any;
  communicationMode: any;
  chatGuid: any;
  chatPasscode: any;
  canChat: boolean = false;
  id: any;
  image: any;
  firstName: any;
  senderId: any;
  userName: any;
  userImage: any;
  senderBalance: any;
  userData: any;
  sender: any;
  reloadData: boolean = false;
  currentUserImage: any;
  chatRole: any;
  chatTimer: string = '';
  chatEnded: boolean = false;
  existingChatGuid: any;
  professional: any;
  professionalsListPage: boolean = false;
  isMobile: boolean = false;

  homePage: boolean = false;
  categories: any = [];
  professionals: any = [];
  subcategories: any = [];
  subcategoryMapping: any = [];

  @ViewChild("outsidebutton", { static: false }) outsidebutton:
    | ElementRef
    | undefined;
  @ViewChild("chatbutton", { static: false }) chatbutton:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _menuService: MenuService,
    private _userService: UserService,
    private _tutorsService: TutorsService,
    private _plansService: PlansService,
    private _voiceCallService: VoiceCallService,
    private _videoCallService: VideoCallService,
    private _buddyService: BuddyService,
    private _professionalsService: ProfessionalsService,
    private _chatService: ChatService,
    private _pushNotificationService: PushNotificationService,
    private cd: ChangeDetectorRef
  ) {
    this.language = this._localService.getLocalStorage(environment.lslanguage);
    this._translateService.setDefaultLang(this.language || "es");
    this._translateService.use(this.language || "es");

    this.navigationSubscription = this._router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.isWall = false;
        if(this._router.url?.indexOf("activity-feed/wall") >= 0) {
          this.isWall = true;
        }
      }
    });
  }

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();
    this.pageInit = true;
    this.callPage = window.location.href?.indexOf("/call/") >= 0 ? true : false;
    this.professionalsListPage = window.location.href?.indexOf("/professionals") >= 0 && window.location.href?.indexOf("/professionals/details") < 0 ? true : false;
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    if (!this._localService.getLocalStorage(environment.lslang)) { this._localService.setLocalStorage(environment.lslang, "es"); }
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
    this.user = this._localService.getLocalStorage(environment.lsuser);

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
      this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(company[0]);
      this.companyId = company[0].id;
      this.domain = company[0].domain;
      this.logoSource = environment.api +  "/get-image-company/" +  (company[0].photo || company[0].image);
      this.primaryColor = company[0].primary_color ? company[0].primary_color : company[0].button_color;
      this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color;
      this.hoverColor = company[0].hover_color ? company[0].hover_color : company[0].primary_color;
      this.homeTextValue = company[0].home_text || "Inicio";
      this.homeTextValueEn = company[0].home_text_en || "Home";
      this.homeTextValueFr = company[0].home_text_fr || "Maison";
      this.homeTextValueEu = company[0].home_text_eu || "Hasi";
      this.homeTextValueCa = company[0].home_text_ca || "Inici";
      this.homeTextValueDe = company[0].home_text_de || "Anfang";
      this.homeTextValueIt = company[0].home_text_it || "Casa";
      this.newMenuButton = company[0].new_menu_button;
      this.newMenuButtonTextValue = company[0].new_menu_button_text;
      this.newMenuButtonTextValueEn = company[0].new_menu_button_text_en;
      this.newMenuButtonTextValueFr = company[0].new_menu_button_text_fr;
      this.newMenuButtonTextValueEu = company[0].new_menu_button_text_eu;
      this.newMenuButtonTextValueCa = company[0].new_menu_button_text_ca;
      this.newMenuButtonTextValueDe = company[0].new_menu_button_text_de;
      this.newMenuButtonTextValueIt = company[0].new_menu_button_text_it;
      this.newMenuButtonUrl = company[0].new_menu_button_url;
      this.newURLButton = company[0].new_url_button;
      this.newURLButtonTextValue = company[0].new_url_button_text;
      this.newURLButtonTextValueEn = company[0].new_url_button_text_en;
      this.newURLButtonTextValueFr = company[0].new_url_button_text_fr;
      this.newURLButtonTextValueEu = company[0].new_url_button_text_eu;
      this.newURLButtonTextValueCa = company[0].new_url_button_text_ca;
      this.newURLButtonTextValueDe = company[0].new_url_button_text_de;
      this.newURLButtonTextValueIt = company[0].new_url_button_text_it;
      this.newURLButtonUrl = company[0].new_url_button_url;
      this.homeActive = company[0].show_home_menu == 1 ? true : false;
      this.courseWallPrefix = company[0].course_wall_prefix;
      this.courseWallPrefixTextValue = company[0].course_wall_prefix_text;
      this.courseWallPrefixTextValueEn = company[0].course_wall_prefix_text_en;
      this.courseWallPrefixTextValueFr = company[0].course_wall_prefix_text_fr;
      this.courseWallPrefixTextValueEu = company[0].course_wall_prefix_text_eu;
      this.courseWallPrefixTextValueCa = company[0].course_wall_prefix_text_ca;
      this.courseWallPrefixTextValueDe = company[0].course_wall_prefix_text_de;
      this.courseWallPrefixTextValueIt = company[0].course_wall_prefix_text_it;
      this.courseWallMenu = company[0].course_wall_menu;
      this.navigation = company[0].navigation || 'side-menu';
      this.isCursoGeniusTestimonials = this._companyService.isCursoGeniusTestimonials(company[0]);
      this.homePage = this.companyId == 67 && (window.location.href == `https://${this.company.url}/` || window.location.href == 'http://localhost:4200/') ? true : false;
    }

    this.features = this._localService.getLocalStorage(environment.lsfeatures)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (!this.features || this.features?.length == 0) {
      this.features = await this._companyService
        .getFeatures(this.domain)
        .toPromise();
    }

    if (this.features && this.companyId > 0) {
      let plansFeature = this.features.filter((f) => {
        return f.feature_name == "Plans";
      });
      if (plansFeature?.length > 0) {
        this.getPlanFeature();
      }

      let tutorsFeature = this.features.filter((f) => {
        return f.feature_name == "Tutors";
      });
      if (tutorsFeature && tutorsFeature[0]) {
        this.tutorsFeatureId = tutorsFeature[0].id;
        this.hasTutors = tutorsFeature && tutorsFeature[0] ? true : false;
        if (this.hasTutors) {
          this.getTutors();
        }
      }

      let coursesFeature = this.features.filter((f) => {
        return f.feature_name == "Courses";
      });
      if (coursesFeature && coursesFeature[0]) {
        this.coursesFeatureId = coursesFeature[0].id;
        this.hasCourses = true;
        this.getCourseFeature(coursesFeature[0]);
      }

      let buddyFeature = this.features.filter((f) => {
        return f.feature_name == "Buddy";
      });
      if (buddyFeature && buddyFeature[0] && this.userId > 0) {
        this.hasBuddy = true;
        this.getMentors();
      }
      
      let shopFeature = this.features.filter((f) => {
        return f.feature_name == "Shop";
      });
      if (shopFeature && shopFeature[0]) {
        this.shopFeatureId = shopFeature[0].id;
        this.hasShop = true;
      }

      let professionalsFeature = this.features.filter((f) => {
        return f.feature_name == "Professionals";
      });
      if (professionalsFeature && professionalsFeature[0]) {
        this.professionalsFeatureId = professionalsFeature[0].id;
        this.hasProfessionals = true;
        this.subscribeVoiceCall();
        this.subscribeVideoCall();
        this.subscribeChat();
        if(this.hasProfessionals && this.navigation == 'top-menu') { this.initializeTopMenu(); }
      }
    }

    this._userService.currentRefreshNotification
      .pipe(takeUntil(this.destroy$))
      .subscribe((refreshNotification) => {
        if (refreshNotification) {
          this.getCurrentUserNotifications();
        }
      });

    this.title = this._translateService.instant('landing.newupdates');
    this.description = `${this._translateService.instant('landing.newversion')}. ${this._translateService.instant('landing.stronglyrecommended')}`;
    this.acceptText = this._translateService.instant('profile-settings.update');
    this.getSettings();
    if (this.userId) {
      this.checkAdmin();
    }

    if(this.companyId == 12) {
      this.getSalesPersonList();
      this.getNetculturaUsers();
    }
    
    if(this.newUpdatesAvailable && (this.companyId == 52 || this.companyId == 65)) {
      let newVersion = localStorage.getItem('new-version')?.toString();
      if(newVersion) {
          localStorage.setItem('version', newVersion);
      }
    }
  }

  subscribeVoiceCall() {
    this.pusherSubscription = this._voiceCallService
      .getFeedItems()
      .subscribe(async(response) => {
        if(response?.id == this.userId || response?.channel == this.userId) {
          this.communicationMode = response.mode?.indexOf('video') >= 0 ? 'video' : 'call';
          this.pusherData = response;
          
          if(this.pusherData.call_guid) {
            this.callGuid = this.pusherData.call_guid;
            this.callPasscode = this.pusherData.passcode;
          }
          
          this.toastMessage = response.message || `${this._translateService.instant('professionals.incomingcall')}...`;
          this.toastMode = response.mode;
          this.toastName = response.caller_name;
          this.toastImage = response.caller_image;
      
          if(this.toastMode == 'end-call') {
            await this._voiceCallService.leaveCall();
            this.showToast = false;
            this.handleAudio('stop');
          } else if(this.toastMode == 'accept-call') {
            this.showToast = true;
            this.handleAudio('play');
          }
          this.cd.detectChanges();
        }
      })
  }

  subscribeVideoCall() {
    this.pusherSubscription = this._videoCallService
      .getFeedItems()
      .subscribe(async(response) => {
        if(response?.id == this.userId || response?.channel == this.userId) {
          this.communicationMode = response.mode?.indexOf('video') >= 0 ? 'video' : 'call';
          this.pusherData = response;
          
          if(this.pusherData.video_call_guid) {
            this.videoCallGuid = this.pusherData.video_call_guid;
            this.videoCallPasscode = this.pusherData.video_call_passcode;
          }
          
          this.toastMessage = response.message || `${this._translateService.instant('professionals.incomingvideocall')}...`;
          this.toastMode = response.mode;
          this.toastName = response.caller_name;
          this.toastImage = response.caller_image;
      
          if(this.toastMode == 'end-video-call') {
            await this._videoCallService.leaveChannel();
            this.showToast = false;
            this.handleAudio('stop');
          } else if(this.toastMode == 'accept-video-call') {
            this.showToast = true;
            this.handleAudio('play');
          }
          this.cd.detectChanges();
        }
      })
  }

  subscribeChat() {
    this.pusherSubscription = this._chatService
      .getFeedItems()
      .subscribe(async(response) => {
        if(
          (!localStorage.getItem('chat-session') || response.mode == 'end-chat') && 
          (response?.id == this.userId || response?.channel == this.userId)
        ) {
          this.communicationMode = response.mode?.indexOf('video') >= 0 ? 'video' : (response.mode?.indexOf('chat') >= 0 ? 'chat' : 'call');
          this.pusherData = response;
          
          if(this.pusherData.chat_guid) {
            this.chatGuid = this.pusherData.chat_guid;
            this.chatPasscode = this.pusherData.chat_passcode;
          }
          
          this.toastMessage = response.message || `${this._translateService.instant('professionals.incomingchat')}...`;
          this.toastMode = response.mode;
          this.toastName = response.sender_name;
          this.toastImage = response.sender_image;
      
          if(this.toastMode == 'end-chat') {
            this.showToast = false;
            this.canChat = false;
            this.chatEnded = true;
            this.cd.detectChanges();
          } else if(this.toastMode == 'accept-chat') {
            this.existingChatGuid = this.chatGuid;
            this.chatRole = 'recipient';
            this.showToast = true;
            this.handleAudio('play');
          }
          this.cd.detectChanges();
        }
      })
  }

  handleAudio(mode) {
    setTimeout(() => {
      this.outsidebutton?.nativeElement.click();
      let audioPlayer = <HTMLAudioElement> document.getElementById('audio-ring');
      if(audioPlayer) {
        if(mode == 'play') {
          audioPlayer.loop = true;
          audioPlayer.play();
        } else if(mode == 'stop') {
          audioPlayer.pause();
        }
      }
    }, 100);
  }

  handleAccept() {
    setTimeout(() => {
      this.outsidebutton?.nativeElement.click();
      let audioPlayer = <HTMLAudioElement> document.getElementById('audio-ring');
      if(audioPlayer) {
        audioPlayer.pause();
      }
    }, 500);
    
    this.showToast = false;
    
    let url = this.communicationMode == 'video' ? `/call/video/${this.videoCallGuid}/${this.videoCallPasscode}/recipient` : (this.communicationMode == 'chat' ? '' : `/call/voice/${this.callGuid}/${this.callPasscode}`);
    if(url) {
      this._router.navigate([url])
      .then(() => {
        window.location.reload();
      });
    } else {
      setTimeout(() => {
        this.chatTimer = '';
        this.canChat = false;
        this.reloadData = false;
        this.initializeUserDetails();
        localStorage.setItem('chat-session', this.pusherData?.chat_guid);
        this.chatbutton?.nativeElement.click();
        setTimeout(() => {
          this.canChat = true;
          this.reloadData = true;
          this.cd.detectChanges();
        })
      }, 500);
    }
  }

  initializeUserDetails() {
    this.id = this.pusherData?.professional_id;
    this.senderId = this.pusherData?.user_id;
    this.image = this.pusherData?.professional_image;
    this.firstName = this.pusherData?.professional_first_name;
    this.userName = this.pusherData?.sender_first_name;
    this.userImage = this.pusherData?.sender?.image;
    this.sender = this.pusherData?.sender;
    this.senderBalance = this.sender?.available_balance;
    this.chatRole = 'recipient';
    this.currentUserImage = this.pusherData.professional_image;

    this.userData = [
      {
        label: this._translateService.instant('company-settings.name'),
        value: this.pusherData?.sender_full_name,
      },
      {
        label: this._translateService.instant('profile-settings.birthday'),
        value: this.sender?.birthday ? moment(this.sender?.birthday).format('DD/MM/YYYY') : '-'
      },
      {
        label: this._translateService.instant('professionals.gender'),
        value: this.sender?.gender || '-'
      },
      {
        label: this._translateService.instant('professionals.civilstatus'),
        value: this.sender?.civil_status || '-'
      },
      {
        label: this._translateService.instant('profile-settings.position'),
        value: this.sender?.position || ''
      },
      {
        label: this._translateService.instant('profile-settings.city'),
        value: this.sender?.city || ''
      },
      {
        label: this._translateService.instant('profile-settings.country'),
        value: this.sender?.country || ''
      },
    ]
  }

  handleCancel() {
    setTimeout(() => {
      this.outsidebutton?.nativeElement.click();
      let audioPlayer = <HTMLAudioElement> document.getElementById('audio-ring');
      if(audioPlayer) {
        audioPlayer.pause();
      }
    }, 100);
    this.showToast = false;
  }

  getNetculturaUsers() {
    this._userService.netculturaUsersList()
      .subscribe(
        response => {
          let netculturaUsers = response['people']
          this.isNetculturaUser = netculturaUsers?.some(a => a.id == this.userId)
        },
        error => {
            console.log(error)
        }
      )
  }

  getSalesPersonList() {
    this._plansService.salesPeople(this.company?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.salesPeople = data.people;
        if(this.salesPeople) {
          this.salesPeople.forEach(sp => {
            if(sp.id == this.userId) {
              this.isSalesPerson = true
            }
          });
        }

        if(this.isSalesPerson) { this.canManageEvents = true; }
      }, err => {
        console.log(err);
      });
  }

  getSettings() {
    if (!this.hasCourses || !this.hasTutors) {
      let featureId = this.hasCourses
        ? this.coursesFeatureId
        : this.hasTutors
        ? this.tutorsFeatureId
        : 0;
      this._menuService
        .getMinCombinedMenuPrefetch(this.companyId, this.userId, featureId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.otherSettings = data[0] ? data[0]["other_settings"] : [];
          this.currentUser = data[1] ? data[1]["CompanyUser"] : [];
          this.professional = data[1] ? data[1]["professional"] : [];
          if(this.professional) {
            this._localService.setLocalStorage(environment.lsprofessional, this.professional);
            this._pushNotificationService.subscribeToNotifications(this.professional);
            this._pushNotificationService.subscribeMessage();
          }
          this.roles = data[2] ? data[2]["role"] : [];
          this.dashboardDetails = data[3] ? data[3]["dashboard_details"] : [];
          this.mapDashboard(this.dashboardDetails);
          let languages = data[4] ? data[4]["languages"] : [];
          this.customMemberTypes = data[5] ? data[5]["member_types"] : [];
          this.getUserTypeInformation();
          this.getRoleName();
          let subfeatures = data[6] ? data[6]["subfeatures"] : [];
          let courses_subfeatures = [];
          let tutors_subfeatures = [];
          if (this.hasCourses) {
            courses_subfeatures = subfeatures;
          }
          if (this.hasTutors) {
            tutors_subfeatures = subfeatures;
          }
          this.proceedFetchMenus(
            languages,
            courses_subfeatures,
            tutors_subfeatures
          );
        });
    } else {
      this._menuService
        .getCombinedCoursesTutorsMenuPrefetch(
          this.companyId,
          this.userId,
          this.coursesFeatureId,
          this.tutorsFeatureId
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.otherSettings = data[0] ? data[0]["other_settings"] : [];
          this.currentUser = data[1] ? data[1]["CompanyUser"] : [];
          this.roles = data[2] ? data[2]["role"] : [];
          this.dashboardDetails = data[3] ? data[3]["dashboard_details"] : [];
          let languages = data[4] ? data[4]["languages"] : [];
          this.customMemberTypes = data[5] ? data[5]["member_types"] : [];
          this.getUserTypeInformation();
          let courses_subfeatures = data[6] ? data[6]["subfeatures"] : [];
          let tutors_subfeatures = data[7] ? data[7]["subfeatures"] : [];
          this.proceedFetchMenus(
            languages,
            courses_subfeatures,
            tutors_subfeatures
          );
        });
    }
  }

  getRoleName() {
    if(this.customMemberTypes && this.customMemberTypes.length > 0) {
      let member_type = this.customMemberTypes && this.customMemberTypes.filter(mt => {
        return mt.id == this.currentUser?.custom_member_type_id
      })

      if(member_type && member_type.length > 0) {
        this.customMemberTypeName = this.language == 'en' ? (member_type[0].type) : (this.language == 'fr' ? (member_type[0].type_fr || member_type[0].type_es) : 
            (this.language == 'eu' ? (member_type[0].type_eu || member_type[0].type_es) : (this.language == 'ca' ? (member_type[0].type_ca || member_type[0].type_es) : 
            (this.language == 'de' ? (member_type[0].type_de || member_type[0].type_es) : (member_type[0].type_es))
          ))
        )
      }
    }
  }

  mapDashboard(dashboard) {
    if(this.dashboardDetails && this.dashboardDetails.active) {
      this.isDashboardActive = true
    }

    if(this.isDashboardActive && this.dashboardDetails && 
        this.dashboardDetails.sections && this.dashboardDetails.sections.length > 0
    ) {
      let myclubs = this.dashboardDetails.sections && this.dashboardDetails.sections.filter(section => { 
        return section.content && section.content.length > 0 &&  section.content[0].option_en == 'Joined Clubs'
      })
      if(myclubs && myclubs.length > 0) {
        this.isMyClubsActive = true
        this.myClubs = myclubs[0]
        this.myClubsTitle = this.getMyClubsTitle()
      }

      let myactivities = this.dashboardDetails.sections && this.dashboardDetails.sections.filter(section => { 
        return section.content && section.content.length > 0 &&  section.content[0].option_en == 'Joined Activities'
      })
      if(myactivities && myactivities.length > 0) {
        this.isMyActivitiesActive = true
        this.myActivities = myactivities[0]
        this.myActivitiesTitle = this.getMyActivitiesTitle()
      }
    }
  }

  getMyClubsTitle() {
    return this.myClubs ? (this.language == "en"
      ? this.myClubs.title_en
        ? this.myClubs.title_en || this.myClubs.title_es
        : this.myClubs.title_es
      : this.language == "fr"
      ? this.myClubs.title_fr
        ? this.myClubs.title_fr || this.myClubs.title_es
        : this.myClubs.title_es
      : this.language == "eu"
      ? this.myClubs.title_eu
        ? this.myClubs.title_eu || this.myClubs.title_es
        : this.myClubs.title_es
      : this.language == "ca"
      ? this.myClubs.title_ca
        ? this.myClubs.title_ca || this.myClubs.title_es
        : this.myClubs.title_es
      : this.language == "de"
      ? this.myClubs.title_de
        ? this.myClubs.title_de || this.myClubs.title_es
        : this.myClubs.title_es
      : this.myClubs.title_es) : '';
  }

  getMyActivitiesTitle() {
    return this.myActivities ? (this.language == "en"
      ? this.myActivities.title_en
        ? this.myActivities.title_en || this.myActivities.title_es
        : this.myActivities.title_es
      : this.language == "fr"
      ? this.myActivities.title_fr
        ? this.myActivities.title_fr || this.myActivities.title_es
        : this.myActivities.title_es
      : this.language == "eu"
      ? this.myActivities.title_eu
        ? this.myActivities.title_eu || this.myActivities.title_es
        : this.myActivities.title_es
      : this.language == "ca"
      ? this.myActivities.title_ca
        ? this.myActivities.title_ca || this.myActivities.title_es
        : this.myActivities.title_es
      : this.language == "de"
      ? this.myActivities.title_de
        ? this.myActivities.title_de || this.myActivities.title_es
        : this.myActivities.title_es
      : this.myActivities.title_es) : '';
  }

  checkAdmin() {
    this._userService
      .isAdminById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.isAdmin || this.userTypeName?.indexOf("Admin") >= 0) {
          this.isAdmin = true;
        }
      });
  }

  proceedFetchMenus(languages, courses_subfeatures, tutors_subfeatures) {
    this.mapSubfeatures(courses_subfeatures, tutors_subfeatures);
    this.getOtherSettings();

    this.languages = languages
      ? languages.filter((lang) => {
          return lang.status == 1;
        })
      : [];
    if (this.languages && this.languages.length > 0) {
      this.languages = this.languages.sort((a, b) => {
        return b.default - a.default;
      });
    }

    if (this.userId) {
      this.imageSrc = this.currentUser
        ? `${this.apiPath}/${this.currentUser.image}`
        : "";
      if(this.currentUser?.photo) {
        this.imageSrc = `data:image/png;base64,${this.currentUser?.photo}`
      }
      this.username =
        this.currentUser && this.currentUser.first_name
          ? `${this.currentUser.first_name} ${this.currentUser.last_name}`
          : this.currentUser?.name || "";
      let roles = this.roles;
      if (roles && roles.length > 0) {
        roles.forEach((role) => {
          if (role.role == "Super Admin") {
            this.superAdmin = true;
          }
          if (role.role == "Admin 1") {
            this.admin1 = true;
          }
          if (role.role == "Admin 2") {
            this.admin2 = true;
          }
          if (
            this.companyId == 12 &&
            (this.superAdmin || this.admin1 || this.admin2)
          ) {
            this.canManageEvents = true;
          }
        });
      }

      if(this.isSalesPerson) { this.canManageEvents = true; }

      this.getUserTypeInformation();
      this.getExpireInformation();
      this.getUserMemberTypes();
      this.getCurrentUserNotifications();
    }
  }

  getUserTypeInformation() {
    if(this.customMemberTypes?.length > 0 && this.currentUser?.custom_member_type_id > 0) {
      let custom_member_type = this.customMemberTypes.find(f => f.id == this.currentUser.custom_member_type_id);
      this.customMemberType = custom_member_type;
      this.manageMembers = custom_member_type?.manage_members ? true : false;
      this.getUserType()
    }
  }

  getUserType() {
    let member_type = this.customMemberTypes && this.customMemberTypes.filter(mt => {
      return mt.id == this.currentUser?.custom_member_type_id
    })

    if(member_type && member_type.length > 0) {
      this.userTypeName = this.language == 'en' ? (member_type[0].type) : (this.language == 'fr' ? (member_type[0].type_fr || member_type[0].type_es) : 
      (this.language == 'eu' ? (member_type[0].type_eu || member_type[0].type_es) : (this.language == 'ca' ? (member_type[0].type_ca || member_type[0].type_es) : 
      (this.language == 'de' ? (member_type[0].type_de || member_type[0].type_es) : (member_type[0].type_es))
      ))
      )
    }
  }

  async mapSubfeatures(courses_subfeatures, tutors_subfeatures) {
    if (courses_subfeatures?.length > 0) {
      this.onlyAssignedTutorAccess = courses_subfeatures.some(
        (a) => a.name_en == "Tutors assigned to courses" && a.active == 1
      );
      this.hasCategoryAccess = courses_subfeatures.some(
        (a) => a.name_en == "Category access" && a.active == 1
      );
    }

    if (tutors_subfeatures?.length > 0) {
      this.hasCreditSetting = tutors_subfeatures.some(
        (a) => a.name_en == "Credits" && a.active == 1
      );
      this.hasCreditPackageSetting = tutors_subfeatures.some(
        (a) => a.name_en == "Credit Packages" && a.active == 1
      );
      this.tutorManageStudentAccess = tutors_subfeatures.some(
        (a) => a.name_en == "Allow Tutors to Manage Students" && a.active == 1
      );
      this.perHourCommission = tutors_subfeatures.some(
        (a) => a.name_en == "Per hour commission" && a.active == 1
      );
      this.separateCourseCredits = tutors_subfeatures.some(
        (a) => a.name_en == "Separate credits by course" && a.active == 1
      );

      if(this.hasCreditPackageSetting) {
        this.getCreditPackages();
      }

      if(this.separateCourseCredits && this.userId > 0) {
        this.getUserCourseCredits();
      }
    }
  }

  async mapPlanSubfeatures(plan_subfeatures) {
    if (plan_subfeatures?.length > 0) {
      this.hasCredits = plan_subfeatures.some(
        (a) => (a.name_en == "Credits" || a.subfeature_id == 149) && a.active == 1
      );
      this.hasHistoryOfActivities = plan_subfeatures.some(
        (a) => (a.name_en == "History of Activities" || a.subfeature_id == 153) && a.active == 1
      );
    }
  }

  getUserCourseCredits() {
    this._userService.getUserCourseCredits(this.userId)
      .subscribe(
        async (response) => {
          this._localService.removeLocalStorage(environment.lsusercoursecredits)
          this.userCourseCredits = response['user_course_credits'];
          this._localService.setLocalStorage(
            environment.lsusercoursecredits,
            JSON.stringify(this.userCourseCredits)
          );
        },
        error => {
          console.log(error)
        }
      )
  }

  getCreditPackages() {
    this._userService.getCreditPackages(this.companyId)
      .subscribe(
        response => {
          if(response?.credit_packages){
            this.creditPackages = response.credit_packages?.filter(cp => {
              return cp.status == 1
            })
          }
        },
        error => {
          console.log(error)
        }
      )
  }

  getUserMemberTypes() {
    this._userService
      .getUserMemberTypes(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.userMemberTypes = response["user_member_types"];
          if (this.userMemberTypes && this.userMemberTypes.length > 0) {
            let member_types_expirations: any[] = [];
            this.userMemberTypes.forEach((umt) => {
              let expireDays;
              let expireDaysDiff;
              let cancelDays;
              let customMemberTypeName;
              let customMemberTypeId;

              if (umt.user_id && umt.expire_days && umt.expire_days > 0) {
                var a = moment(umt.created_at).add(umt.expire_days, "days");
                var b = moment(new Date());
                let diff = a.diff(b, "days");

                let difference = "";
                if (diff > 0) {
                  difference = `${this._translateService.instant(
                    "dialog.expiresin"
                  )} ${diff} ${this._translateService.instant(
                    "dialog.expiresindays"
                  )}`;
                } else if (diff <= 0) {
                  difference = this._translateService.instant(
                    "dialog.expiredupgrade"
                  );
                }

                expireDaysDiff = diff;
                expireDays = difference;
              } else if (
                umt &&
                umt.user_id &&
                umt.cancelled == 1 &&
                umt.cancelled_at
              ) {
                var subscription_date = umt.created_at;
                var sub_date = moment(subscription_date);

                var last_subscription_date;
                if (
                  this.customMemberTypes &&
                  this.customMemberTypes.length > 0
                ) {
                  let member_type =
                    this.customMemberTypes &&
                    this.customMemberTypes.filter((mt) => {
                      return mt.id == umt.custom_member_type_id;
                    });

                  if (member_type && member_type.length > 0) {
                    if (member_type[0].trial_period == 1) {
                      if (
                        moment().isAfter(
                          moment(sub_date).add(member_type[0].trial_days)
                        )
                      ) {
                        last_subscription_date = moment(sub_date)
                          .add(member_type[0].trial_days, "days")
                          .format("YYYY-MM-DD");
                      } else {
                        last_subscription_date = moment(sub_date)
                          .add(1, "months")
                          .format("YYYY-MM-DD");
                      }
                    } else {
                      last_subscription_date = moment(sub_date)
                        .add(1, "months")
                        .format("YYYY-MM-DD");
                    }
                  }
                } else {
                  for (
                    let m = sub_date;
                    m.diff(subscription_date, "months") <= 1;
                    m.add(1, "months")
                  ) {
                    last_subscription_date = m.format("YYYY-MM-DD");
                  }
                }

                var a = moment(last_subscription_date);
                var b = moment(new Date());
                let diff = a.diff(b, "days");

                let difference = "";
                if (diff > 0) {
                  difference = `${this._translateService.instant(
                    "dialog.cancelledin"
                  )} ${diff} ${this._translateService.instant(
                    "dialog.cancelledindays"
                  )}`;
                } else if (diff <= 0) {
                  difference = this._translateService.instant(
                    "dialog.cancelledrenew"
                  );
                }

                cancelDays = difference;
              } else if (umt.user_id && umt.custom_member_type_id > 0) {
                let member_type =
                  this.customMemberTypes &&
                  this.customMemberTypes.filter((mt) => {
                    return mt.id == umt.custom_member_type_id;
                  });

                if (member_type && member_type.length > 0) {
                  let proceed = true;
                  if (
                    member_type[0].require_payment == 1 &&
                    umt.subscription_id
                  ) {
                    proceed = false;
                  }
                  if (member_type[0].expire_days > 0 && proceed) {
                    var a = moment(umt.created).add(
                      member_type[0].expire_days,
                      "days"
                    );
                    var b = moment(new Date());
                    let diff = a.diff(b, "days");

                    let difference = "";
                    if (diff > 0) {
                      difference = `${this._translateService.instant(
                        "dialog.expiresin"
                      )} ${diff} ${this._translateService.instant(
                        "dialog.expiresindays"
                      )}`;
                    } else if (diff <= 0) {
                      difference = this._translateService.instant(
                        "dialog.expiredupgrade"
                      );
                    }

                    expireDaysDiff = diff;
                    expireDays = difference;
                  }
                }
              }

              if (expireDays) {
                if (
                  this.customMemberTypes &&
                  this.customMemberTypes.length > 0
                ) {
                  let member_type =
                    this.customMemberTypes &&
                    this.customMemberTypes.filter((mt) => {
                      return mt.id == umt.custom_member_type_id;
                    });

                  if (member_type && member_type.length > 0) {
                    customMemberTypeName =
                      this.language == "en"
                        ? member_type[0].type
                        : this.language == "fr"
                        ? member_type[0].type_fr || member_type[0].type_es
                        : this.language == "eu"
                        ? member_type[0].type_eu || member_type[0].type_es
                        : this.language == "ca"
                        ? member_type[0].type_ca || member_type[0].type_es
                        : this.language == "de"
                        ? member_type[0].type_de || member_type[0].type_es
                        : member_type[0].type_es;
                    customMemberTypeId = member_type[0].id;
                  }
                }

                member_types_expirations.push({
                  expireDaysDiff,
                  expireDays,
                  cancelDays,
                  customMemberTypeName,
                  customMemberTypeId,
                });
              }
            });
            this.memberTypeExpirations = member_types_expirations;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getCourseFeature(coursesFeature) {
    this.coursesTitle =
      this.language == "en"
        ? coursesFeature.name_en ||
          coursesFeature.feature_name ||
          coursesFeature.name_es ||
          coursesFeature.feature_name_ES
        : this.language == "fr"
        ? coursesFeature.name_fr ||
          coursesFeature.feature_name_FR ||
          coursesFeature.name_es ||
          coursesFeature.feature_name_ES
        : this.language == "eu"
        ? coursesFeature.name_eu ||
          coursesFeature.feature_name_EU ||
          coursesFeature.name_es ||
          coursesFeature.feature_name_ES
        : this.language == "ca"
        ? coursesFeature.name_ca ||
          coursesFeature.feature_name_CA ||
          coursesFeature.name_es ||
          coursesFeature.feature_name_ES
        : this.language == "de"
        ? coursesFeature.name_de ||
          coursesFeature.feature_name_DE ||
          coursesFeature.name_es ||
          coursesFeature.feature_name_ES
        : this.language == "it"
        ? coursesFeature.name_it ||
          coursesFeature.feature_name_IT ||
          coursesFeature.name_es ||
          coursesFeature.feature_name_ES
        : coursesFeature.name_es || coursesFeature.feature_name_ES;
  }

  getPlanFeature() {
    this._companyService
      .getCompanySubFeatures(1, this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let subfeatures = response["subfeatures"];
          let event_calendar_subfeature =
            subfeatures &&
            subfeatures.filter((sf) => {
              return sf.subfeature_id == 94 && sf.active == 1;
            });
          if (
            event_calendar_subfeature &&
            event_calendar_subfeature.length > 0
          ) {
            this.hasEventCalendar = true;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getTutors() {
    this._tutorsService
      .getTutors(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.tutorUsers = response["tutors"];
          if (this.tutorUsers) {
            this.isTutorUser = this.tutorUsers.some(
              (a) => a.user_id == this.userId
            );
            let super_tutor = this.tutorUsers?.filter(tutor => {
              return tutor?.user_id == this.userId && tutor?.super_tutor == 1
            })
            this.superTutor = super_tutor?.length > 0 ? true : false
            
            let potsuper_tutor = this.tutorUsers?.filter(tutor => {
              return tutor?.user_id == this.userId && tutor?.potsuper_tutor == 1
            })
            this.potSuperTutor = potsuper_tutor?.length > 0 ? true : false

            let pot_tutor = this.tutorUsers?.filter(tutor => {
              return tutor?.user_id == this.userId && tutor?.pot_tutor == 1
            })
            this.potTutor = pot_tutor?.length > 0 ? true : false
          }

          let cityAdmins = response['city_admins']
          if(cityAdmins?.length > 0) {
            this.cityAdmin = cityAdmins.some(a => a.user_id == this.userId)
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async getExpireInformation() {
    if (
      this.currentUser &&
      this.currentUser.id &&
      this.currentUser.expire_days &&
      this.currentUser.expire_days > 0
    ) {
      var a = moment(this.currentUser.created).add(
        this.currentUser.expire_days,
        "days"
      );
      var b = moment(new Date());
      let diff = a.diff(b, "days");

      let difference = "";
      if (diff > 0) {
        difference = `${this._translateService.instant(
          "dialog.expiresin"
        )} ${diff} ${this._translateService.instant("dialog.expiresindays")}`;
      } else if (diff <= 0) {
        difference = this._translateService.instant("dialog.expiredupgrade");
      }

      this.expireDaysDiff = diff;
      this.expireDays = difference;
    } else if (
      this.currentUser &&
      this.currentUser.id &&
      this.currentUser.cancelled == 1 &&
      this.currentUser.cancelled_date
    ) {
      var subscription_date = this.currentUser.created;
      var sub_date = moment(subscription_date);

      var last_subscription_date;
      if (this.customMemberTypes && this.customMemberTypes.length > 0) {
        let member_type =
          this.customMemberTypes &&
          this.customMemberTypes.filter((mt) => {
            return mt.id == this.currentUser.custom_member_type_id;
          });

        if (member_type && member_type.length > 0) {
          if (member_type[0].trial_period == 1) {
            if (
              moment().isAfter(moment(sub_date).add(member_type[0].trial_days))
            ) {
              last_subscription_date = moment(sub_date)
                .add(member_type[0].trial_days, "days")
                .format("YYYY-MM-DD");
            } else {
              last_subscription_date = moment(sub_date)
                .add(1, "months")
                .format("YYYY-MM-DD");
            }
          } else {
            last_subscription_date = moment(sub_date)
              .add(1, "months")
              .format("YYYY-MM-DD");
          }
        }
      } else {
        for (
          let m = sub_date;
          m.diff(subscription_date, "months") <= 1;
          m.add(1, "months")
        ) {
          last_subscription_date = m.format("YYYY-MM-DD");
        }
      }

      var a = moment(last_subscription_date);
      var b = moment(new Date());
      let diff = a.diff(b, "days");

      let difference = "";
      if (diff > 0) {
        difference = `${this._translateService.instant(
          "dialog.cancelledin"
        )} ${diff} ${this._translateService.instant("dialog.cancelledindays")}`;
      } else if (diff <= 0) {
        difference = this._translateService.instant("dialog.cancelledrenew");
      }

      this.cancelDays = difference;
    } else if (
      this.currentUser.id &&
      this.currentUser.custom_member_type_id > 0
    ) {
      let member_type =
        this.customMemberTypes &&
        this.customMemberTypes.filter((mt) => {
          return mt.id == this.currentUser.custom_member_type_id;
        });

      if (member_type && member_type.length > 0) {
        let proceed = true;
        if (
          member_type[0].require_payment == 1 &&
          this.currentUser.subscription_id
        ) {
          proceed = false;
        }
        if (member_type[0].expire_days > 0 && proceed) {
          var a = moment(this.currentUser.created).add(
            member_type[0].expire_days,
            "days"
          );
          var b = moment(new Date());
          let diff = a.diff(b, "days");

          let difference = "";
          if (diff > 0) {
            difference = `${this._translateService.instant(
              "dialog.expiresin"
            )} ${diff} ${this._translateService.instant(
              "dialog.expiresindays"
            )}`;
          } else if (diff <= 0) {
            difference = this._translateService.instant(
              "dialog.expiredupgrade"
            );
          }

          this.expireDaysDiff = diff;
          this.expireDays = difference;
        }
      }
    }

    if (this.expireDays) {
      if (this.customMemberTypes && this.customMemberTypes.length > 0) {
        let member_type =
          this.customMemberTypes &&
          this.customMemberTypes.filter((mt) => {
            return mt.id == this.currentUser.custom_member_type_id;
          });

        if (member_type && member_type.length > 0) {
          this.customMemberTypeName =
            this.language == "en"
              ? member_type[0].type
              : this.language == "fr"
              ? member_type[0].type_fr || member_type[0].type_es
              : this.language == "eu"
              ? member_type[0].type_eu || member_type[0].type_es
              : this.language == "ca"
              ? member_type[0].type_ca || member_type[0].type_es
              : this.language == "de"
              ? member_type[0].type_de || member_type[0].type_es
              : member_type[0].type_es;
        }
      }
    }
  }

  async getCurrentUserNotifications() {
    this._userService
      .allUserNotifications(this.userId, this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          let allNotifications = data["notifications"];
          if (allNotifications?.length > 0) {
            this.notifications = this.sortNotifications(allNotifications);
            this.popupNotifications =
              this.notifications && this.notifications.length > 1
                ? this.notifications.slice(0, 1)
                : this.notifications;
          }
          this.cd.detectChanges()
        },
        (error) => {
          console.log(error);
        }
      );
  }

  sortNotifications(allNotifications) {
    let notifications = allNotifications;
    let sorted_notifications: any = [];
    this.notificationsLength = 0;

    if (notifications && notifications.length > 0) {
      // Get requests & invites
      let invites_requests = notifications.filter((notification) => {
        return (
          notification.type == "VS_COMPANY_GROUP_INVITES" ||
          notification.type == "VS_COMPANY_PLAN_INVITES" ||
          notification.type == "VS_COMPANY_GROUP_PLAN_INVITES" ||
          notification.type == "VS_COMPANY_PLAN_REQUESTS" ||
          notification.type == "VS_COMPANY_GROUP_REQUESTS" ||
          notification.type == "VS_COMPANY_BUDDY"
        );
      });
      if (invites_requests && invites_requests.length > 0) {
        let sorted_invited_requests = invites_requests.sort((a, b) => {
          const oldDate: any = new Date(a.created);
          const newDate: any = new Date(b.created);

          return newDate - oldDate;
        });
        if (sorted_invited_requests && sorted_invited_requests.length > 0) {
          sorted_invited_requests.forEach((sir) => {
            if (sir.author_image.indexOf("/") == 0) {
            } else {
              sir.author_image = "/" + sir.author_image;
            }

            let match =
              sorted_notifications &&
              sorted_notifications.some((a) => a.object_id === sir.object_id);
            if (!match) {
              if (sir.read_status == 1 || sir.read_status == -1) {
              } else {
                this.notificationsLength += 1;
                sorted_notifications.push(sir);
              }
            }
          });
        }
      }
    }

    return sorted_notifications;
  }

  getOtherSettings() {
    if (this.otherSettings) {
      this.otherSettings.forEach((m) => {
        if (m.title_es == "General") {
          if (m.content) {
            let menuOrderSettings = m.content.filter((c) => {
              return c.title_en.indexOf("Menu items order") >= 0;
            });
            if (menuOrderSettings && menuOrderSettings[0]) {
              this.hasMenuOrdering =
                menuOrderSettings[0].active == 1 ? true : false;
              if (this.hasMenuOrdering) {
                this.getMenuOrdering();
              } else {
                this.getMenus();
              }
            }

            let profileButtonSettings = m.content.filter(c => {
              return c.title_en.indexOf('My Profile') >= 0
            })

            if(profileButtonSettings && profileButtonSettings[0]) {
              this.showProfileButton = profileButtonSettings[0].active == 1 ? true : false
            }

            let canRegisterSettings = m.content.filter((c) => {
              return c.title_en.indexOf("Allow member registration") >= 0;
            });
            if (canRegisterSettings && canRegisterSettings[0]) {
              this.canRegister =
                canRegisterSettings[0].active == 1 ? true : false;
            }

            let footerSettings = m.content.filter((c) => {
              return c.title_en == "Footer";
            });
            if(footerSettings && footerSettings[0]) {
              this.showFooter = footerSettings[0].active == 1 ? true : false;
              if(this.showFooter && this.companyId == 32 && this.isUESchoolOfLife) {
                this.getSchoolofLifeFooterLinks()
              }
            }
          }
        }

        if (m.title_es == "Módulos") {
          if (m.content) {
            let contactUsSettings = m.content.filter((c) => {
              return c.title_en.indexOf("Contact Us") >= 0;
            });
            if (contactUsSettings && contactUsSettings[0]) {
              this.showContactUs =
                contactUsSettings[0].active == 1 ? true : false;
              if (this.showContactUs) {
                this.getContactUsDetails();
              }
            }

            let inviteSettings = m.content.filter(c => {
              return c.title_en == 'Your Activity: Invitations'
            })
            if(inviteSettings && inviteSettings[0]) {
              this.hasInvitations = inviteSettings[0].active == 1 ? true : false
            }
          }
        }

        if (m.title_es == "Stripe") {
          if (m.content) {
            let customMemberTypeSettings = m.content.filter((c) => {
              return (
                c.title_en.indexOf(
                  "Require Stripe payment on specific member types"
                ) >= 0
              );
            });
            if (customMemberTypeSettings && customMemberTypeSettings[0]) {
              this.hasCustomMemberTypeSettings =
                customMemberTypeSettings[0].active == 1 ? true : false;

              if(this.companyId == 12) { this.hasCustomMemberTypeSettings = true; } 
              if (this.hasCustomMemberTypeSettings) {
                this.getCustomMemberTypes();
              }
            }
          }
        }
      });
    }
  }

  getSchoolofLifeFooterLinks() {
    this.customLinks = [
      {
        text_es: 'Biblioteca',
        text_en:  'Library',
        link: 'https://universidadeuropea.com/tu-experiencia/biblioteca/',
      },
      {
        text_es: 'Empleabilidad y Emprendimiento',
        text_en:  'Employability and Entrepreneurship',
        link: 'https://universidadeuropea.com/tu-experiencia/empleabilidad/',
      },
      {
        text_es: 'Movilidad Internacional',
        text_en:  'International Mobility',
        link: 'https://universidadeuropea.com/tu-experiencia/movilidad-internacional/',
      },
      {
        text_es: 'Orientación Educativa, Diversidad e Inclusión',
        text_en:  'Educational Guidance, Diversity and Inclusion',
        link: 'https://universidadeuropea.com/tu-experiencia/atencion-diversidad/',
      },
      {
        text_es: 'Prácticas',
        text_en:  'Practices',
        link: 'https://universidadeuropea.com/tu-experiencia/practicas/',
      },
      {
        text_es: 'Vida Universitaria',
        text_en:  'College Life',
        link: 'https://universidadeuropea.com/tu-experiencia/vida-universitaria/',
      }
    ]
  }

  getContactUsDetails() {
    this._companyService
      .getContactUsDetails(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.contactUsDetails = response["contact_us_details"];
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async getCustomMemberTypes() {
    if (this.currentUser) {
      let member_type_id = this.currentUser.custom_member_type_id;
      this._companyService
        .getCustomMemberTypePermissionsNew(member_type_id, this.companyId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          async (response) => {
            let permissions = response["permissions"];
            this.customMemberTypePermissions = permissions;
            let plan_permission = permissions.filter((p) => {
              return (
                p.custom_member_type_id == member_type_id && p.feature_id == 1
              );
            });
            if (plan_permission && plan_permission[0] && !this.superAdmin) {
              this.canCreatePlan =
                plan_permission[0].create == 1 ? true : false;
            }

            let club_permission = permissions.filter((p) => {
              return (
                p.custom_member_type_id == member_type_id && p.feature_id == 5
              );
            });
            if (club_permission && club_permission[0] && !this.superAdmin) {
              this.canCreateClub =
                club_permission[0].create == 1 ? true : false;
            }

            let canalempleo_permission = permissions.filter((p) => {
              return (
                p.custom_member_type_id == member_type_id && p.feature_id == 18
              );
            });
            if (
              canalempleo_permission &&
              canalempleo_permission[0] &&
              !this.superAdmin
            ) {
              this.canCreateCanalEmpleo =
                canalempleo_permission[0].create == 1 ? true : false;
            }

            let course_permission = permissions.filter((p) => {
              return (
                p.custom_member_type_id == member_type_id && p.feature_id == 11
              );
            });
            if (course_permission && course_permission[0] && !this.superAdmin) {
              this.canCreateCourse =
                course_permission[0].create == 1 ? true : false;
            }

            this.canManageEvents =
              this.canCreatePlan ||
              this.canCreateClub ||
              this.canCreateCanalEmpleo
                ? true
                : false;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  async getMenuOrdering() {
    this._menuService
      .getMenuOrder(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.menuOrdering = response.result;
          this.getMenus();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  public async reloadMenu() {
    this.refreshMenu = true;
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.domain = this._localService.getLocalStorage(environment.lsdomain);

    if (!this.roles || this.roles?.length == 0) {
      this.getSettings();
    } else {
      this.menus = [];
      this._localService.removeLocalStorage(environment.lsmenus);
      this.getMenuOrdering();
    }
  }

  async getMenus() {
    this.menus = this._localService.getLocalStorage(environment.lsmenus)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsmenus))
      : [];
    if (this.pageInit) {
      this._localService.removeLocalStorage(environment.lsmenus);
      this.menus = [];
    }
    if (
      this.refreshMenu ||
      !this.menus ||
      (this.menus && this.menus.length == 0)
    ) {
      let ueActivityCourses = this.companyId == 32 && this.isUESchoolOfLife ? true : false;
      if (this.hasCourses || ueActivityCourses) {
        this._menuService
          .getCombinedCourseMenuItemsPrefetch(
            this.domain,
            this.companyId,
            this.currentUser?.custom_member_type_id,
            this.tutorsFeatureId,
            122,
            this.coursesFeatureId,
            this.userId
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.features = data[0] ? data[0] : [];
            let company_subfeatures = data[1] ? data[1]["subfeatures"] : [];
            let permissions = data[2] ? data[2]["permissions"] : [];
            let subfeatureMapping = data[3] ? data[3]["active"] : [];
            let course_subfeatures = data[4] ? data[4]["subfeatures"] : [];
            this.courseSubscriptions = data[5] ? data[5]["course_subscriptions"] : [];

            if(this.companyId == 32 && this.isUESchoolOfLife) {
              this.courseSubscriptions = this.courseSubscriptions?.filter(cs => {
                return cs?.course?.school_of_life == 1
              })
            }
            
            this.courseTutors = data[6] ? data[6]["course_tutors"] : [];
            this.courseExceptionUser = data[7] ? data[7]["company_course_exception_user"] : [];
            this.courses = data[8] ? data[8]["courses"] : [];
            let plan_subfeatures = data[9] ? data[9]["subfeatures"] : [];
            let planFeature = this.features?.find((f) => f.id == 1);
            if(planFeature?.id > 0) { 
              this.mapPlanSubfeatures(plan_subfeatures);
            }
            this.proceedMenuItems(
              company_subfeatures,
              permissions,
              subfeatureMapping,
              course_subfeatures,
            );
          });
      } else {
        this._menuService
          .getMinCombinedMenuItemsPrefetch(
            this.domain,
            this.companyId,
            this.currentUser?.custom_member_type_id,
            this.tutorsFeatureId,
            122
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.features = data[0] ? data[0] : [];
            let company_subfeatures = data[1] ? data[1]["subfeatures"] : [];
            let permissions = data[2] ? data[2]["permissions"] : [];
            let subfeatureMapping = data[3] ? data[3]["active"] : [];
            this.proceedMenuItems(
              company_subfeatures,
              permissions,
              subfeatureMapping,
              []
            );
          });
      }
    }
  }

  proceedMenuItems(
    company_subfeatures,
    permissions,
    subfeatureMapping,
    course_subfeatures,
  ) {
    if (this.features?.length === 0) {
      return;
    }

    this.refreshedMenu = false;
    let has_course_wall_subfeature;
    has_course_wall_subfeature = this.updateCoursesData(
      has_course_wall_subfeature,
      course_subfeatures
    );

    this.features = this.updateFeaturesMembers(company_subfeatures);
    this.updateFeaturesPermissions(permissions);
    this._localService.setLocalStorage(
      environment.lsfeatures,
      JSON.stringify(this.features)
    );

    let home_sequence = 1;
    home_sequence = this.setHomeSequence(home_sequence);

    this.getCompanyDetails();

    let mmatch;
    mmatch = this.renderHomeMenu(mmatch, home_sequence);
    mmatch = this.renderDashboardMenu(mmatch);

    for (let i = 0; this.features?.length > i; i++) {
      let tempData;
      let tempName = this.features[i].name_en
        ? this.features[i].name_en
        : this.features[i].feature_name;
      let tempPath = this.features[i].feature_name
        .replace(/\s/g, "")
        .toLowerCase();
      let name_ES = this.features[i].name_es
        ? this.features[i].name_es
        : this.features[i].feature_name_ES;
      let name_FR = this.features[i].name_fr
        ? this.features[i].name_fr
        : this.features[i].feature_name_FR;
      let name_EU = this.features[i].name_eu
        ? this.features[i].name_eu
        : this.features[i].feature_name_EU;
      let name_CA = this.features[i].name_ca
        ? this.features[i].name_ca
        : this.features[i].feature_name_CA;
      let name_DE = this.features[i].name_de
        ? this.features[i].name_de
        : this.features[i].feature_name_DE;
      let name_IT = this.features[i].name_it
        ? this.features[i].name_it
        : this.features[i].feature_name_IT;

      tempPath = tempPath == "cityagenda" ? "cityguide" : tempPath;
      tempName = tempPath == "cityagenda" ? "City Guide" : tempName;

      tempData = {
        id: this.features[i].id,
        path: tempPath,
        name: tempName,
        name_ES: name_ES,
        name_FR: name_FR,
        name_EU: name_EU,
        name_CA: name_CA,
        name_DE: name_DE,
        name_IT: name_IT,
        show: true,
        sequence: this.features[i].sequence ? this.features[i].sequence : 3 + i,
        parent_path: '',
        school_of_life_submenu: 0,
      };

      mmatch = this.menus.some((a) => a.name === tempData.name);
      if (!mmatch) {
        if(this.companyId == 32) {
          if(this.isUESchoolOfLife) {
            if(tempData?.id == 1 || tempData?.id == 11) {
              this.menus.push(tempData);

              if(tempData?.id == 1 && this.hasHistoryOfActivities) {
                this.menus.push({
                  id: tempData?.id + 1,
                  path: 'plans/list/history',
                  new_url: 0,
                  new_button: 0,
                  return_url: '',
                  name: 'History of Activities',
                  name_ES: 'Historial de actividades',
                  name_FR: 'Historique d\'activité',
                  name_EU: 'Jardueren historia',
                  name_CA: '"Historial d\'activitats',
                  name_DE: 'Aktivitätsverlauf',
                  show: true,
                  sequence: (this.features[i].sequence ? this.features[i].sequence : 3 + i) + 1,
                  parent_path: '',
                  school_of_life_submenu: 0,
                })
              }

              if(tempData?.id == 11) {
                this.menus.push({
                  id: tempData?.id + 2,
                  path: 'courses/list/nivelacion',
                  new_url: 0,
                  new_button: 0,
                  return_url: '',
                  name: 'Leveling courses',
                  name_ES: 'Cursos de Nivelación',
                  name_FR: 'Cours de mise à niveau',
                  name_EU: 'Mailatzeko ikastaroak',
                  name_CA: 'Cursos de Nivellació',
                  name_DE: 'AktivitätsverlaufLeveling-Kurse',
                  show: true,
                  sequence: (this.features[i].sequence ? this.features[i].sequence : 3 + i) + 1,
                  parent_path: '',
                  school_of_life_submenu: 0,
                })
              }
            }
          } else {
            if(tempData?.id != 11) {
              if(tempData?.id == 19) {
                if(this.superAdmin) {
                  this.canAccessIntroduceU = true;
                  this.menus.push(tempData);
                } else {
                  if(this.currentUser?.bussines_unit &&
                    !(this.currentUser?.bussines_unit?.toLowerCase()?.indexOf('online') >= 0) &&
                    this.currentUser?.segment?.toLowerCase()?.indexOf('grado') >= 0) {
                      this.canAccessIntroduceU = true;
                      this.menus.push(tempData);
                  }
                }
              } else {
                this.menus.push(tempData);
              }
            }
          }
        } else {
          if(this.companyId == 52 && this.isCursoGeniusTestimonials) {
            if(tempData?.id == 23) {
              this.menus.push(tempData);
            }
          } else {
            this.menus.push(tempData);
          }
        }
      }
    }

    // Add specifically for ASTROIDEAL only
    if(this.companyId == 67) {
      let fsmatch = this.menus.some((a) => a.name === 'Free services');
      if (!fsmatch) {
        this.menus.push({
          id: this.menus?.length + 1,
          path: '/free-services',
          new_url: 0,
          new_button: 0,
          return_url: '',
          name: this._translateService.instant('landing.services'),
          name_ES: this._translateService.instant('landing.services'),
          name_FR: this._translateService.instant('landing.services'),
          name_EU: this._translateService.instant('landing.services'),
          name_CA: this._translateService.instant('landing.services'),
          name_DE: this._translateService.instant('landing.services'),
          show: true,
          sequence: this.menus?.length + 1,
          parent_path: '',
          school_of_life_submenu: 0,
        })
      }
    }

    this.sortMenuOrdering();
    mmatch = this.renderNewMenu(mmatch);
    if(
      (this.companyId == 32 && this.isUESchoolOfLife) ||
      this.companyId != 32
    ) {
      this.renderCourseWallMenu(has_course_wall_subfeature);
    }
    this.renderTutorsMenu(subfeatureMapping);

    this._localService.setLocalStorage(
      environment.lsmenus,
      JSON.stringify(this.menus)
    );

    this._menuService.updateMenu(this.menus);

    this.refreshedMenu = true;
    this.cd.detectChanges();
  }

  showMore = (arr, num) => {
    return arr.splice(0, num);
  };

  updateCoursesData(has_course_wall_subfeature, course_subfeatures) {
    if (this.hasCourses) {
      let course_wall_subfeature = course_subfeatures?.filter((sf) => {
        return sf.subfeature_id == 89 && sf.active == 1;
      });
      has_course_wall_subfeature =
        course_wall_subfeature?.length > 0 ? true : false;
      if (course_wall_subfeature?.length > 0 && this.userId > 0) {
        this.isTutor =
          this.courseTutors &&
          this.courseTutors.some((a) => a.id == this.userId);
        this.courseTutors.forEach((ct) => {
          if (ct.id == this.userId) {
            this.tutorId = ct.tutor_id;
          }
        });

        let roles = this.roles;
        let super_admin_role =
          roles &&
          roles.filter((r) => {
            return r.role == "Super Admin";
          });
        if (super_admin_role && super_admin_role[0]) {
          this.superAdmin = true;
        }
        if (this.isTutor || this.superAdmin) {
          this.courses =
            this.courses &&
            this.courses.filter((c) => {
              return c.status == 1 && c.wall_status == 1;
            });

          if (
            this.tutorId &&
            this.onlyAssignedTutorAccess &&
            !this.superAdmin
          ) {
            this.courseSubscriptions = [];
            this.courses = this.courses.filter((c) => {
              let include = false;
              c.course_tutors &&
                c.course_tutors.forEach((ct) => {
                  if (ct.tutor_id == this.tutorId && ct.course_id == c.id) {
                    include = true;
                  }
                  this.courseExceptionUser?.forEach((cex) => {
                    if (cex.course_id == c.id) {
                      include = true;
                    }
                  });
                });

              if (include) {
                return c;
              }
            });
            if (this.courseSubscriptions?.length > 0) {
              this.courseSubscriptions.length = 0;
            }
          }

          if (this.courses && this.courses.length > 0) {
            this.courses.forEach((course) => {
              this.courseSubscriptions.push({
                company_id: this.companyId,
                user_id: this.userId,
                course_id: course.id,
                course: course,
                subscription_id: course.hotmart_product_id ? null : "999",
                hotmart_email: course.hotmart_product_id
                  ? "tutor@email.com"
                  : null,
                hotmart_product_id: course.hotmart_product_id ? "999" : null,
                hotmart_purchase_id: course.hotmart_product_id ? "999" : null,
                hotmart_transaction: course.hotmart_product_id ? "999" : null,
                created_at: course.hotmart_product_id
                  ? moment().format("YYYY-MM-DD HH:mm:ss")
                  : null,
              });
            });
          }
        }
      }
    }

    return has_course_wall_subfeature;
  }

  updateFeaturesMembers(company_subfeatures) {
    let filteredFeatures: any[] = [];
    this.features &&
      this.features.forEach((feature) => {
        let include = false;

        if (company_subfeatures) {
          let subfeature = company_subfeatures.filter((f) => {
            return f.feature_id == feature.id;
          });

          if (subfeature && subfeature[0]) {
            if (subfeature[0].active == 1) {
              if (this.currentUser) {
                include = true;
              }
            } else {
              include = true;
            }
          }
        }

        if (include) {
          filteredFeatures.push(feature);
        }
      });

    return filteredFeatures;
  }

  updateFeaturesPermissions(permissions) {
    let localUserId = this._localService.getLocalStorage(environment.lsuserId);
    if(this.company?.guest_access == 1 && !localUserId) {
    } else {
      if (
        this.features &&
        this.hasCustomMemberTypeSettings &&
        this.currentUser &&
        !this.superAdmin
      ) {
        let member_type_id = this.currentUser.custom_member_type_id;
        let member_type_permissions = permissions.filter((p) => {
          return p.custom_member_type_id == member_type_id && p.view == 1;
        });
        if (member_type_permissions && member_type_permissions.length > 0) {
          if (!this.superAdmin) {
            this.features = this.features.filter((f) => {
              let match = member_type_permissions.some(
                (a) => a.feature_id == f.id
              );
              return match;
            });
          }
        } else {
          this.features = [];
        }
      } else {
        if (this.features && this.currentUser && !this.superAdmin) {
          let member_type_id = 1;
          if (this.admin1) {
            member_type_id = 2;
          }
          if (this.admin2) {
            member_type_id = 3;
          }
          let member_type_permissions = permissions.filter((p) => {
            return p.custom_member_type_id == member_type_id && p.view == 1;
          });
          if (
            member_type_permissions &&
            member_type_permissions.length > 0 &&
            !this.superAdmin
          ) {
            this.features = this.features.filter((f) => {
              let match = member_type_permissions.some(
                (a) => a.feature_id == f.id
              );
              return match;
            });
          }
        }
      }
    }
  }

  setHomeSequence(home_sequence) {
    if (
      (this.hasMenuOrdering || this.refreshMenu) &&
      this.menuOrdering &&
      this.menuOrdering.home_dashboard
    ) {
      let home_row = this.menuOrdering.home_dashboard.filter((hd) => {
        return hd.path == "home";
      });
      if (home_row && home_row[0]) {
        home_sequence = home_row[0].sequence;
      }
    }

    return home_sequence;
  }

  getCompanyDetails() {
    this.companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
      this.homeActive = company[0].show_home_menu == 1 ? true : false;
      this.homeTextValue = company[0].home_text || "Inicio";
      this.homeTextValueEn = company[0].home_text_en || "Home";
      this.homeTextValueFr = company[0].home_text_fr || "Maison";
      this.homeTextValueEu = company[0].home_text_eu || "Hasi";
      this.homeTextValueCa = company[0].home_text_ca || "Inici";
      this.homeTextValueDe = company[0].home_text_de || "Anfang";
      this.homeTextValueIt = company[0].home_text_it || "Casa";
      this.newMenuButton = company[0].new_menu_button;
      if (this.newMenuButton == 1) {
        this.newMenuButtonTextValue = company[0].new_menu_button_text;
        this.newMenuButtonTextValueEn = company[0].new_menu_button_text_en;
        this.newMenuButtonTextValueFr = company[0].new_menu_button_text_fr;
        this.newMenuButtonTextValueEu = company[0].new_menu_button_text_eu;
        this.newMenuButtonTextValueCa = company[0].new_menu_button_text_ca;
        this.newMenuButtonTextValueDe = company[0].new_menu_button_text_de;
        this.newMenuButtonTextValueIt = company[0].new_menu_button_text_it;
        this.newMenuButtonUrl = company[0].new_menu_button_url;
      }
      this.newURLButton = company[0].new_url_button;
      if (this.newURLButton == 1) {
        this.newURLButtonTextValue = company[0].new_url_button_text;
        this.newURLButtonTextValueEn = company[0].new_url_button_text_en;
        this.newURLButtonTextValueFr = company[0].new_url_button_text_fr;
        this.newURLButtonTextValueEu = company[0].new_url_button_text_eu;
        this.newURLButtonTextValueCa = company[0].new_url_button_text_ca;
        this.newURLButtonTextValueDe = company[0].new_url_button_text_de;
        this.newURLButtonTextValueIt = company[0].new_url_button_text_it;
        this.newURLButtonUrl = company[0].new_url_button_url;
      }
      this.courseWallPrefix = company[0].course_wall_prefix;
      if (this.courseWallPrefix == 1) {
        this.courseWallPrefixTextValue = company[0].course_wall_prefix_text;
        this.courseWallPrefixTextValueEn =
          company[0].course_wall_prefix_text_en;
        this.courseWallPrefixTextValueFr =
          company[0].course_wall_prefix_text_fr;
        this.courseWallPrefixTextValueEu =
          company[0].course_wall_prefix_text_eu;
        this.courseWallPrefixTextValueCa =
          company[0].course_wall_prefix_text_ca;
        this.courseWallPrefixTextValueDe =
          company[0].course_wall_prefix_text_de;
        this.courseWallPrefixTextValueIt =
          company[0].course_wall_prefix_text_it;
      }
      this.courseWallMenu = company[0].course_wall_menu;
    }
  }

  renderHomeMenu(mmatch, home_sequence) {
    if (this.homeActive && !this.isCursoGeniusTestimonials) {
      this.tempData = {
        id: 1,
        path: "home",
        name: this.homeTextValueEn,
        name_ES: this.homeTextValue,
        name_FR: this.homeTextValueFr,
        name_EU: this.homeTextValueEu,
        name_CA: this.homeTextValueCa,
        name_DE: this.homeTextValueDe,
        name_IT: this.homeTextValueIt,
        show: true,
        sequence: home_sequence,
        parent_path: '',
        school_of_life_submenu: 0,
      };
      mmatch = this.menus.some((a) => a.name === this.tempData.name);
      if (!mmatch) {
        this.menus.push(this.tempData);
      }
    }

    return mmatch;
  }

  renderDashboardMenu(mmatch) {
    if (this.companyId != 32 && this.features?.length > 0) {
      if (this.dashboardDetails?.active) {
        let include_dashboard = false;
        if (this.dashboardDetails.members_only == 1) {
          if (this.currentUser) {
            include_dashboard = true;
          }
        } else {
          include_dashboard = true;
        }

        if (include_dashboard) {
          let dashboard_sequence = 2;
          if (
            (this.hasMenuOrdering || this.refreshMenu) &&
            this.menuOrdering &&
            this.menuOrdering.home_dashboard
          ) {
            let dashboard_row = this.menuOrdering.home_dashboard.filter(
              (hd) => {
                return hd.path == "dashboard";
              }
            );
            if (dashboard_row && dashboard_row[0]) {
              dashboard_sequence = dashboard_row[0].sequence;
            }
          }
          this.tempData = {
            id: 2,
            path: "dashboard",
            name: this.dashboardDetails.title_en,
            name_ES: this.dashboardDetails.title_es,
            name_FR: this.dashboardDetails.title_fr,
            name_EU: this.dashboardDetails.title_eu,
            name_CA: this.dashboardDetails.title_ca,
            name_DE: this.dashboardDetails.title_de,
            name_IT: this.dashboardDetails.title_it,
            show: true,
            sequence: dashboard_sequence,
            parent_path: '',
            school_of_life_submenu: 0,
          };

          mmatch = this.menus.some((a) => a.name === this.tempData.name);
          if (!mmatch) {
            this.menus.push(this.tempData);
          }
        }
      }
    }

    return mmatch;
  }

  sortMenuOrdering() {
    if (
      (this.hasMenuOrdering || this.refreshMenu) &&
      this.menuOrdering &&
      this.menus
    ) {
      this.menus = this.menus.sort((a, b) => {
        return a.sequence - b.sequence;
      });
    }
  }

  renderNewMenu(mmatch) {
    if (this.newURLButton == 1) {
      mmatch = this.menus.some(
        (a) =>
          a.name ===
          (this.newURLButtonTextValueEn || this.newURLButtonTextValue)
      );
      if (!mmatch) {
        this.menus.push({
          id: this.menus.length + 100,
          path: this.newURLButtonUrl,
          new_url: 1,
          new_button: 0,
          return_url: '',
          name: this.newURLButtonTextValueEn || this.newURLButtonTextValue,
          name_ES: this.newURLButtonTextValue,
          name_FR: this.newURLButtonTextValueFr || this.newURLButtonTextValue,
          name_EU: this.newURLButtonTextValueEu || this.newURLButtonTextValue,
          name_CA: this.newURLButtonTextValueCa || this.newURLButtonTextValue,
          name_DE: this.newURLButtonTextValueDe || this.newURLButtonTextValue,
          name_IT: this.newURLButtonTextValueDe || this.newURLButtonTextValue,
          show: true,
          sequence: this.menus.length + 1,
          parent_path: '',
          school_of_life_submenu: 0,
        });

        if(this.newURLButtonTextValue == 'School of Life' && !this.isUESchoolOfLife && this.companyId == 32) {
          let features = this.features?.filter(f => {
            return f.id == 1 || f.id == 11
          })
          if (features?.length > 0) {
            features = features.sort((a, b) => {
              return a.id - b.id;
            });
          }
          for (let i = 0; features?.length > i; i++) {
            let tempData;
            let tempName = features[i].name_en
              ? features[i].name_en
              : features[i].feature_name;
            let tempPath = features[i].feature_name
              .replace(/\s/g, "")
              .toLowerCase();
            let name_ES = features[i].name_es
              ? features[i].name_es
              : features[i].feature_name_ES;
            let name_FR = features[i].name_fr
              ? features[i].name_fr
              : features[i].feature_name_FR;
            let name_EU = features[i].name_eu
              ? features[i].name_eu
              : features[i].feature_name_EU;
            let name_CA = features[i].name_ca
              ? features[i].name_ca
              : features[i].feature_name_CA;
            let name_DE = features[i].name_de
              ? features[i].name_de
              : features[i].feature_name_DE;
      
            tempPath = tempPath == "cityagenda" ? "cityguide" : tempPath;
            tempName = tempPath == "cityagenda" ? "City Guide" : tempName;
      
            tempData = {
              id: features[i].id,
              path: tempPath,
              name: tempName,
              name_ES: name_ES,
              name_FR: name_FR,
              name_EU: name_EU,
              name_CA: name_CA,
              name_DE: name_DE,
              show: true,
              sequence: features[i].sequence ? features[i].sequence : 3 + i,
              parent_path: '',
              school_of_life_submenu: 0,
            };
            // if(tempData?.id == 1) {
            //   if (this.newURLButton == 1) {
            //     this.menus.push({
            //       id: 5 + tempData?.id,
            //       path: `${this.newURLButtonUrl}/${tempPath}`,
            //       new_url: 0,
            //       new_button: 0,
            //       return_url: tempPath,
            //       name: `${tempName?.replace('de Vida Universitaria', '')} ${(this.newURLButtonTextValueEn || this.newURLButtonTextValue)}`,
            //       name_ES: `${name_ES?.replace('de Vida Universitaria', '')} ${(this.newURLButtonTextValue)}`,
            //       name_FR: `${name_FR?.replace('de Vida Universitaria', '')} ${(this.newURLButtonTextValueFr || this.newURLButtonTextValue)}`,
            //       name_EU: `${name_EU?.replace('de Vida Universitaria', '')} ${(this.newURLButtonTextValueEu || this.newURLButtonTextValue)}`,
            //       name_CA: `${name_CA?.replace('de Vida Universitaria', '')} ${(this.newURLButtonTextValueCa || this.newURLButtonTextValue)}`,
            //       name_DE: `${name_DE?.replace('de Vida Universitaria', '')} ${(this.newURLButtonTextValueDe || this.newURLButtonTextValue)}`,
            //       show: true,
            //       sequence: features[i].sequence ? features[i].sequence : 3 + i,
            //       parent_path: this.newURLButtonUrl,
            //       school_of_life_submenu: 1,
            //     })

            //     if(this.hasHistoryOfActivities) {
            //       this.menus.push({
            //         id: 5 + tempData?.id + 1,
            //         path: `${this.newURLButtonUrl}/${tempPath}/list/history`,
            //         new_url: 0,
            //         new_button: 0,
            //         return_url: `${tempPath}/list/history`,
            //         name: 'History of Activities',
            //         name_ES: 'Historial de actividades',
            //         name_FR: 'Historique d\'activité',
            //         name_EU: 'Jardueren historia',
            //         name_CA: '"Historial d\'activitats',
            //         name_DE: 'Aktivitätsverlauf',
            //         show: true,
            //         sequence: features[i].sequence ? features[i].sequence : 3 + i,
            //         parent_path: this.newURLButtonUrl,
            //         school_of_life_submenu: 1,
            //       })
            //     }
            //   }
            // }
            // if(tempData?.id == 11) {
            //   this.menus.push({
            //     id: 5 + tempData?.id,
            //     path: `${this.newURLButtonUrl}/${tempPath}`,
            //     new_url: 0,
            //     new_button: 0,
            //     return_url: tempPath,
            //     name: tempName,
            //     name_ES: name_ES,
            //     name_FR: name_FR,
            //     name_EU: name_EU,
            //     name_CA: name_CA,
            //     name_DE: name_DE,
            //     show: true,
            //     sequence: features[i].sequence ? features[i].sequence : 3 + i,
            //     parent_path: this.newURLButtonUrl,
            //     school_of_life_submenu: 1,
            //   })
            // }
          }
        }
      }
    }

    if (this.newMenuButton == 1 && !this.isUESchoolOfLife) {
      mmatch = this.menus.some(
        (a) =>
          a.name ===
          (this.newMenuButtonTextValueEn || this.newMenuButtonTextValue)
      );
      if (!mmatch) {
        this.menus.push({
          id: this.menus.length + 100,
          path: this.newMenuButtonUrl,
          new_url: 0,
          new_button: 1,
          return_url: '',
          name: this.newMenuButtonTextValueEn || this.newMenuButtonTextValue,
          name_ES: this.newMenuButtonTextValue,
          name_FR: this.newMenuButtonTextValueFr || this.newMenuButtonTextValue,
          name_EU: this.newMenuButtonTextValueEu || this.newMenuButtonTextValue,
          name_CA: this.newMenuButtonTextValueCa || this.newMenuButtonTextValue,
          name_DE: this.newMenuButtonTextValueDe || this.newMenuButtonTextValue,
          show: true,
          sequence: this.menus.length + 1,
          parent_path: '',
          school_of_life_submenu: 0,
        });
      }
    }

    return mmatch;
  }

  renderCourseWallMenu(has_course_wall_subfeature) {
    if (this.courseSubscriptions && this.courseSubscriptions.length > 0) {
      this.renderCourseWallsMenu();
      this.renderCourseWallDropdownMenu(has_course_wall_subfeature);
    }
    this.renderGenericWallMenu();
  }

  renderCourseWallsMenu() {
    this.courseSubscriptions.forEach((cs) => {
      if (false) {
      } else {
        let menu_name = "";
        if (cs.course) {
          menu_name = `${cs.course.title || cs.course.title_en}`;
        }
        if (this.companyId == 27) {
          menu_name = ``;
          let course_title = "";
          if (cs.course) {
            if (
              cs.course.title == "Asciende A Otro Nivel" ||
              cs.course.title == "Asciende a Otro Nivel" ||
              cs.course.title_en == "Asciende a Otro Nivel"
            ) {
              course_title = "AON";
            } else if (
              cs.course.title == "Asciende A Otro Nivel Express" ||
              cs.course.title == "Asciende a Otro Nivel Express" ||
              cs.course.title_en == "Asciende a Otro Nivel Express"
            ) {
              course_title = "AONE";
            } else {
              course_title = cs.course.title;
            }
            menu_name += `${course_title}`;
          }

          let cmatch = this.menus.some((a) => a.name === menu_name);
          let group_id = cs.course ? cs.course.group_id : 0;
          if (!cmatch && cs.course && cs.course.wall_status == 1) {
            this.menus.push({
              id: this.menus.length + 200,
              course_wall: 1,
              path: `activity-feed-${group_id}`,
              name: menu_name,
              name_ES: menu_name,
              name_FR: menu_name,
              name_EU: menu_name,
              name_CA: menu_name,
              name_DE: menu_name,
              name_IT: menu_name,
              show: true,
              sequence: this.menus.length + 1,
              parent_path: '',
              school_of_life_submenu: 0,
            });
          }
        } else {
          let cmatch = this.menus.some((a) => a.name === menu_name);
          let group_id = cs.course ? cs.course.group_id : 0;
          if (!cmatch && cs.course && cs.course.wall_status == 1) {
            this.menus.push({
              id: this.menus.length + 200,
              course_wall: 1,
              path: `activity-feed-${group_id}`,
              name: menu_name,
              name_ES: menu_name,
              name_FR: menu_name,
              name_EU: menu_name,
              name_CA: menu_name,
              name_DE: menu_name,
              name_IT: menu_name,
              show: true,
              sequence: this.menus.length + 1,
              parent_path: '',
              school_of_life_submenu: 0,
            });
          }
        }
      }
    });
  }

  renderCourseWallDropdownMenu(has_course_wall_subfeature) {
    if (has_course_wall_subfeature) {
      var result = this.menus.filter((obj) => {
        return obj.course_wall == 1;
      });

      if (result.length == 1) {
        this.menus.forEach((element) => {
          if (element.course_wall == 1) {
            element.name_ES = this.courseWallPrefix
              ? `${this.courseWallPrefixTextValue} ${element.name_ES}`
              : element.name_ES;
            element.name = this.courseWallPrefix
              ? `${this.courseWallPrefixTextValue} ${element.name}`
              : element.name;
            element.name_FR = this.courseWallPrefix
              ? `${this.courseWallPrefixTextValue} ${element.name_FR}`
              : element.name_FR;
            element.name_EU = this.courseWallPrefix
              ? `${this.courseWallPrefixTextValue} ${element.name_EU}`
              : element.name_EU;
            element.name_CA = this.courseWallPrefix
              ? `${this.courseWallPrefixTextValue} ${element.name_CA}`
              : element.name_CA;
            element.name_DE = this.courseWallPrefix
              ? `${this.courseWallPrefixTextValue} ${element.name_DE}`
              : element.name_DE;
            element.name_IT = this.courseWallPrefix
              ? `${this.courseWallPrefixTextValue} ${element.name_IT}`
              : element.name_IT;
          }
        });
      }

      if (result.length > 1) {
        const mm = this.menus.slice(0, -result.length);
        let m27 = this.menus.slice(
          this.menus.length - result.length,
          this.menus.length
        );

        m27.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });

        this.menus = mm;
        this.menus.push({
          subs: m27,
          course_wall: 11,
        });
      }
    }
  }

  renderTutorsMenu(subfeatureMapping) {
    if (subfeatureMapping) {
      let tempMenu = this.menus.filter((mn) => {
        return mn.name != "Tutors";
      });
      this.menus = tempMenu;
    } else {
      this.isTutorMenuVisible = true
    }
  }

  renderGenericWallMenu() {
    if (this.courseWallMenu) {
      this.menus.push({
        id: this.menus.length + 300,
        course_wall: 1,
        path: `/activity-feed-0`,
        name: this._translateService.instant("sidebar.activityfeed"),
        name_ES: this._translateService.instant("sidebar.activityfeed"),
        name_FR: this._translateService.instant("sidebar.activityfeed"),
        name_EU: this._translateService.instant("sidebar.activityfeed"),
        name_CA: this._translateService.instant("sidebar.activityfeed"),
        name_DE: this._translateService.instant("sidebar.activityfeed"),
        name_IT: this._translateService.instant("sidebar.activityfeed"),
        show: true,
        sequence: this.menus.length + 1,
        parent_path: '',
        school_of_life_submenu: 0,
      });
    }
  }

  getCourseTitle(course) {
    return this.language == "en"
      ? course.title_en
        ? course.title_en || course.title
        : course.title
      : this.language == "fr"
      ? course.title_fr
        ? course.title_fr || course.title
        : course.title
      : this.language == "eu"
      ? course.title_eu
        ? course.title_eu || course.title
        : course.title
      : this.language == "ca"
      ? course.title_ca
        ? course.title_ca || course.title
        : course.title
      : this.language == "de"
      ? course.title_de
        ? course.title_de || course.title
        : course.title
      : this.language == "it"
      ? course.title_it
        ? course.title_it || course.title
        : course.title
      : course.title;
  }

  changedLanguage(lang) {
    this._translateService.use(lang);
    this._localService.setLocalStorage(environment.lslang, lang);
    this._companyService.changeLanguage(lang);
  }

  getMentors() {
    this._buddyService
      .fetchBuddies(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          let mentors = response?.mentors;
          let current_user_mentor = mentors?.filter(mentor => {
            return mentor.user_id == this.userId
          })
          let user_mentor = mentors?.filter(m => {
            let include = false;
            if(m.buddies?.length > 0) {
              let match = m.buddies?.some(
                (a) => a.id == this.userId
              );

              if(match) {
                include = true;
              }
            }

            return include;
          })
          this.userMentor = user_mentor;
          this.isMentor = current_user_mentor?.length > 0 ? true : false;
          this.cd.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializeTopMenu() {
    this.getProfessionalsHomeData();
  }

  getProfessionalsHomeData() {
    this._professionalsService
      .getProfessionalsHomeData(this.company?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.subcategories = data?.subcategories;
          this.subcategoryMapping = data?.subcategory_mapping;
          this.formatProfessionalsData(data);
        },
        (error) => {
          console.log(error)
        });
  }

  async formatProfessionalsData(data) {
    this.professionals = data?.professionals?.map((item) => {
      return {
        ...item,
        id: item?.id,
        path: `/professionals/details/${item.id}`,
        image: `${environment.api}/${item.image}`,
        name: item?.first_name ? `${item.first_name} ${item.last_name}` : item.name,
        first_name: item?.first_name || item?.name,
        specialties: this.getSpecialties(item),
      };
    });

    this.categories = data?.categories?.map((category) => {
      return {
        ...category,
        name: this.getCategoryText(category),
        image: `${environment.api}/v3/image/professionals/category/${category.image}`,
      };
    });
  }

  getSpecialties(item) {
    let list = [];

    list = this.subcategoryMapping?.filter(subcategory => {
      return subcategory.professional_id == item.id
    })?.map((row) => {
      return {
        id: row.id,
        text: this.getSubcategoryText(row)
      }
    })

    return list;
  }

  getCategoryText(category) {
    return category
      ? this.language == "en"
        ? category.category_en ||
          category.category_es
        : this.language == "fr"
        ? category.category_fr ||
          category.category_es
        : this.language == "eu"
        ? category.category_eu ||
          category.category_es
        : this.language == "ca"
        ? category.category_ca ||
          category.category_es
        : this.language == "de"
        ? category.category_de ||
          category.category_es
        : this.language == "it"
        ? category.category_it ||
          category.category_es
        : category.category_es
      : "";
  }

  getSubcategoryText(subcategory) {
    return subcategory
      ? this.language == "en"
        ? subcategory.subcategory_en ||
          subcategory.subcategory_es
        : this.language == "fr"
        ? subcategory.subcategory_fr ||
          subcategory.subcategory_es
        : this.language == "eu"
        ? subcategory.subcategory_eu ||
          subcategory.subcategory_es
        : this.language == "ca"
        ? subcategory.subcategory_ca ||
          subcategory.subcategory_es
        : this.language == "de"
        ? subcategory.subcategory_de ||
          subcategory.subcategory_es
        : this.language == "it"
        ? subcategory.subcategory_it ||
          subcategory.subcategory_es
        : subcategory.subcategory_es
      : "";
  }

  ngOnDestroy() {
    localStorage.removeItem('chat-session');
    this.navigationSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}