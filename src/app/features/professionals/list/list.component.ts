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
import { Router, RouterModule } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService, UserService } from "@share/services";
import { ChatService, ProfessionalsService, VoiceCallService } from "@features/services";
import { Subject, takeUntil } from "rxjs";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "@env/environment";
import { ChatComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { ProfessionalCardComponent } from "@share/components/card/professional/professional.component";
import { SearchComponent } from "@share/components/astro-ideal/search/search.component";
import { FilterComponent } from "@share/components/astro-ideal/filter/filter.component";
import { FilterDrawerComponent } from "@share/components/astro-ideal/filter-drawer/filter-drawer.component";
import { SortDrawerComponent } from "@share/components/astro-ideal/sort-drawer/sort-drawer.component";
import { Subscription } from 'rxjs';
import { initFlowbite } from "flowbite";
import { timer } from "@lib/utils/timer/timer.utils";
import moment from 'moment';
import get from "lodash/get";

@Component({
  selector: "app-professionals",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PageTitleComponent,
    ProfessionalCardComponent,
    ToastComponent,
    ChatComponent,
    SearchComponent,
    FilterComponent,
    FilterDrawerComponent,
    SortDrawerComponent,
  ],
  templateUrl: "./list.component.html",
})
export class ProfessionalsListComponent {
  private destroy$ = new Subject<void>();

  languageChangeSubscription;
  language: any;
  isMobile: boolean = false;
  companyId: any;
  userId: any;
  showToast: boolean = false;

  pusherSubscription: Subscription | undefined;
  pusherData: any = {};
  intervalId: any;
  lastchecked: any;
  toastMessage: string = '';
  toastMode: string = '';
  selectedId: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  professionalImage: any;
  professionalName: any;
  professionalRate: any = 0.89;
  professional: any;
  user: any;

  time: number = 0;
  display ;
  interval;
  professionalsFeature: any;
  featureId: any;
  pageName: any;
  pageDescription: any;
  hasMinimumBalance: any;
  minimumBalance: any;
  superAdmin: boolean = false;
  canViewProfessionals: boolean = false;
  canCreateProfessional: boolean = false;
  canManageProfessional: boolean = false;
  allProfessionals: any = [];
  professionals: any = [];
  hasVoiceCall: boolean = false;
  hasVideoCall: boolean = false;
  hasChat: boolean = false;
  company: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  toastTitle: string = "";
  toastDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  showRequiredMinimumBalanceModal: boolean = false;
  actionMode: string = "";
  callTime: number = 0;
  callTrackingInterval;
  callGuid: any;
  callPasscode: any;
  room: any;
  userPhone: any;
  userData: any = [];
  chatTime: number = 0;
  chatInterval;
  chatTrackingTime: number = 0;
  chatTrackingInterval;
  canChat: boolean = false;
  id: any;
  image: any;
  firstName: any;
  userName: any;
  userImage: any;
  senderBalance: any;
  reloadData: boolean = false;
  currentUserImage: any;
  chatRole: any;
  chatGuid: any;
  chatPasscode: any;
  chatTimer: any;
  chatEnded: boolean = false;
  insufficientBalanceTitle: string = '';
  insufficientBalanceDescription: string = '';
  
  activeProfessionals: any = [];
  nonActiveProfessionals: any = [];
  placeholderText: any;
  search: any;
  searchText: any;
  filterList: any = [];
  showFilters: boolean = false;
  filterType: any;
  filtersText: any;
  drawerFilterList: any = [];
  subcategories: any = [];
  languages: any = [];
  gender: any = [];
  subcategoryMapping: any = [];
  selectedFilters: any = [];
  showChat: boolean = false;
  showVoiceCall: boolean = false;
  showVideoCall: boolean = false;
  sortText: any;
  drawerSortList: any = [];
  showSort: boolean = false;
  selectedSort: any;
  isLoading: boolean = true;

  @ViewChild("modalbutton2", { static: false }) modalbutton2:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton2", { static: false }) closemodalbutton2:
    | ElementRef
    | undefined;
  
  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _userService: UserService,
    public _professionalsService: ProfessionalsService,
    public _voiceCallService: VoiceCallService,
    public _chatService: ChatService,
  ) {
    
  }

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
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
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.hoverColor = company[0].hover_color
        ? company[0].hover_color
        : company[0].primary_color;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.initializePage();
  }

  initializePage() {
    this.initializeSearch();
    this.initializeFilter();
    this.initializeSortDrawer();
    this.getProfessionals();
    this.subscribeVoiceCall();
    this.subscribeChat();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "guests.search"
    );
  }

  initializeFilter() {
    this.filterList = [
      {
        id: 1,
        icon: './src/assets/professional-icons/filter-gray.png',
        type: 'filter',
        text: this._translateService.instant('professionals.filters'),
        show: true,
      },
      {
        id: 2,
        icon: './src/assets/professional-icons/comment-gray.png',
        type: 'chat',
        text: this._translateService.instant('professionals.contact'),
        show: true,
      },
      {
        id: 3,
        icon: './src/assets/professional-icons/phone-gray.png',
        type: 'voice_call',
        text: this._translateService.instant('professionals.voicecall'),
        show: true,
      },
      {
        id: 4,
        icon: './src/assets/professional-icons/video-gray.png',
        type: 'video_call',
        text: this._translateService.instant('professionals.videocall'),
        show: true,
      },
      {
        id: 5,
        icon: './src/assets/professional-icons/sort-gray.png',
        type: 'sort',
        text: this._translateService.instant('pricing.order'),
        show: true,
      }
    ]
  }

  initializeSortDrawer() {
    this.sortText = this._translateService.instant('pricing.order');
    this.drawerSortList = [
      {
        id: 1,
        title: this._translateService.instant('professionals.experience'),
        items: [
          {
            id: 1,
            text: this._translateService.instant('professionals.hightolow'),
            type: 'xp-high-low'
          },
          {
            id: 2,
            text: this._translateService.instant('professionals.lowtohigh'),
            type: 'xp-low-high'
          }
        ],
      },
      {
        id: 2,
        title: this._translateService.instant('professionals.rate'),
        items: [
          {
            id: 1,
            text: this._translateService.instant('professionals.hightolow'),
            type: 'rate-high-low'
          },
          {
            id: 2,
            text: this._translateService.instant('professionals.lowtohigh'),
            type: 'rate-low-high'
          }
        ],
      },
      {
        id: 3,
        title: this._translateService.instant('professionals.reviews'),
        items: [
          {
            id: 1,
            text: this._translateService.instant('professionals.hightolow'),
            type: 'review-high-low'
          },
          {
            id: 2,
            text: this._translateService.instant('professionals.lowtohigh'),
            type: 'review-low-high'
          }
        ],
      }
    ]
  }

  getProfessionals() {
    this._professionalsService
      .getProfessionalsData(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.user = data?.user || this.user;
          if(this.user) { this.user['available_balance'] = this.userId > 0 ? data?.user?.available_balance : 0; }
          
          this.subcategories = data?.subcategories;
          this.languages = data?.languages;
          this.gender = data?.gender;
          this.subcategoryMapping = data?.subcategory_mapping;
          this.initializeFilterDrawer();

          let payment_methods = data?.payment_methods || '';
          this._localService.setLocalStorage(environment.lspaymentmethods, payment_methods);

          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings);
          this.mapUserPermissions(data?.user_permissions);

          let professionals = data?.professionals;
          this.allProfessionals = this.formatProfessionals(professionals);
          this.professionals = this.allProfessionals;
          this.groupProfessionals(this.professionals);

          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.professionalsFeature = features?.find((f) => f.feature_id == 23);
    this.featureId = this.professionalsFeature?.id;
    this.pageName = this.getFeatureTitle(this.professionalsFeature);
    this.pageDescription = this.getFeatureDescription(this.professionalsFeature);
  }

  mapSubfeatures(settings) {
    let subfeatures = settings?.subfeatures;
    if(subfeatures?.length > 0) {
      this.hasVoiceCall = this.userId && subfeatures.some(a => a.name_en == 'Call feature' && a.active == 1);
      this.hasVideoCall = this.userId && subfeatures.some(a => a.name_en == 'Video call feature' && a.active == 1);
      this.hasChat = this.userId && subfeatures.some(a => a.name_en == 'Chat feature' && a.active == 1);
      this.hasMinimumBalance = subfeatures?.some((a) => a.name_en == "Minimum balance" && a.active == 1);
    }

    if(this.hasMinimumBalance) {
      this.minimumBalance = settings?.professional_settings?.minimum_balance;
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canViewProfessionals = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 23
    )
      ? true
      : false;
    this.canCreateProfessional =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 25);
    this.canManageProfessional = user_permissions?.member_type_permissions?.find(
      (f) => f.manage == 1 && f.feature_id == 23
      )
      ? true
      : false;
  }

  formatProfessionals(professionals) {
    professionals = professionals?.map((item) => {
      return {
        ...item,
        id: item?.id,
        path: `/professionals/details/${item.id}`,
        image: `${environment.api}/${item.image}`,
        name: item?.first_name ? `${item.first_name} ${item.last_name}` : item.name,
        first_name: item?.first_name || item?.name,
        user_name: this.user?.first_name || this.user.name,
        user_image: `${environment.api}/${this.user?.image}`,
        voice_call: this.hasVoiceCall && item.voice_call == 1 ? true : false,
        video_call: this.hasVideoCall && item.video_call == 1 ? true : false,
        chat: this.hasChat && item.chat == 1 ? true : false,
        specialties: this.getSpecialties(item),
      };
    });

    return professionals;
  }

  getFeatureTitle(feature) {
    return feature
      ? this.language == "en"
        ? feature.name_en ||
          feature.feature_name ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "fr"
        ? feature.name_fr ||
          feature.feature_name_FR ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "eu"
        ? feature.name_eu ||
          feature.feature_name_EU ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "ca"
        ? feature.name_ca ||
          feature.feature_name_CA ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "de"
        ? feature.name_de ||
          feature.feature_name_DE ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "it"
        ? feature.name_it ||
          feature.feature_name_IT ||
          feature.name_es ||
          feature.feature_name_ES
        : feature.name_es || feature.feature_name_ES
      : "";
  }

  getFeatureDescription(feature) {
    return feature
      ? this.language == "en"
        ? feature.description_en || feature.description_es
        : this.language == "fr"
        ? feature.description_fr || feature.description_es
        : this.language == "eu"
        ? feature.description_eu || feature.description_es
        : this.language == "ca"
        ? feature.description_ca || feature.description_es
        : this.language == "de"
        ? feature.description_de || feature.description_es
        : this.language == "it"
        ? feature.description_it || feature.description_es
        : feature.description_es
      : "";
  }

  subscribeVoiceCall() {
    this.pusherSubscription = this._voiceCallService
      .getFeedItems()
      .subscribe(async(response) => {
        if(response?.id == this.userId || response?.channel == this.userId) {
          this.pusherData = response;
          if(this.pusherData.call_guid) {
            this.callGuid = this.pusherData.call_guid;
            this.callPasscode = this.pusherData.passcode;
          }

          this.toastMessage = response.message || `${this._translateService.instant('professionals.incomingcall')}...`;
          this.toastMode = response.mode;

          if(this.toastMode == 'end-call') {
            await this._voiceCallService.leaveCall();
            this.showToast = false;
          } else if(this.toastMode == 'ongoing-call') {
            this.startTimer();
            this.startTrackingCallDuration();
          }
        }
      })
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.time === 0) {
        this.time++;
      } else {
        this.time++;
      }
      this.display = timer.transform(this.time);
    }, 1000);
  }

  startTrackingCallDuration() {
    this.callTrackingInterval = setInterval(() => {
        if (this.callTime === 0) {
            this.callTime++;
        } else {
            this.callTime++;
        }

        this._voiceCallService.getStats();
        let stats = this._voiceCallService.rtcStats?.Duration || 0;

        if(stats > 0) {
          let params = {
            call_guid: this.callGuid,
            stats,
            professional_user_id: this.professional?.user_id,
            caller_user_id: this.userId,
            room: this.room,
          }
          
          this._professionalsService.editCallerBalance(params).subscribe(
          (response) => {
            let user = response?.user;
            if(user?.id == this.userId) {
              if(this.user) {
                this.user['available_balance'] = user?.available_balance;
              }
            }
          },
          (error) => {
            console.log(error);
          })
        }
    }, 5000);
  }

  pauseTimer() {
    clearInterval(this.interval);
    clearInterval(this.callTrackingInterval);
  }

  subscribeChat() {
    this.pusherSubscription = this._chatService
      .getFeedItems()
      .subscribe(async(response) => {
        if(response?.professional_id == this.userId || response?.sender?.id == this.userId) {
          if(response.mode == 'recipient-joined-chat') {
            this.startChatTimer();
            this.startTrackingChatDuration();
          } else if(response.mode == 'end-chat') {
            this.canChat = false;
            this.chatEnded = true;
            setTimeout(() => {
              location.reload();
            }, 1000)
          }
        }
      })
  }

  startChatTimer() {
    this.chatInterval = setInterval(() => {
      if (this.chatTime === 0) {
        this.chatTime++;
      } else {
        this.chatTime++;
      }
      this.chatTimer = timer.transform(this.chatTime);
    }, 1000);
  }

  startTrackingChatDuration() {
    this.chatTrackingInterval = setInterval(() => {
      if (this.chatTrackingTime === 0) {
        this.chatTrackingTime++;
      } else {
        this.chatTrackingTime++;
      }
    }, 5000);
  }

  async handleStartCall(id) {
    if(this.userId > 0) {
      this.actionMode = 'voicecall';
      this.userPhone = this.user?.phone;
      if(!this.userPhone) {
        let user = get(
          await this._userService.getUserById(this.user?.id).toPromise(),
          "CompanyUser"
        );
        this.user['phone'] = user?.phone;
        this.userPhone = user?.phone;
      }
      this.professional = this.professionals.find((c) => c.user_id == id);
      this.modalbutton2?.nativeElement?.click();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  async proceedToCall() {
    this.closemodalbutton2?.nativeElement?.click();

    setTimeout(async () => {
      let id = this.professional.user_id;
      if(this.hasRequiredMinimumBalance()) {
        this.display = '';
        this.selectedId = id;

        const channel =  `agora-vcp-${id}`;
        this.room = channel;
        let caller_uid = Math.floor(Math.random() * 2032);

        let caller_balance_before_call = 0;
        if(this.userId > 0) {
          caller_balance_before_call = this.user?.available_balance;
        }

        let call_guid = Math.random().toString(36).substring(6);
        let passcode = Math.random().toString(36).substring(6);

        setTimeout(() => {
          initFlowbite();
          this.toastMessage = `${this._translateService.instant('professionals.dialling')}...`;
          this.toastMode = 'initiate-call';
          this.showToast = true;
          let params = {
            id,
            user_id: this.userId,
            company_id: this.companyId,
            mode: 'accept-call',
            message: this._translateService.instant('professionals.incomingcall'),
            caller_name: this.user?.first_name ? `${this.user.first_name} ${this.user.last_name}` : this.user.name,
            caller_image: `${environment.api}/${this.user?.image}`,
            phone: this.userPhone,
            room: channel,
            caller_uid,
            caller_balance_before_call,
            call_guid,
            passcode,
          }
          this.notifyProfessional(params);
        }, 100);

        const token = get(await this._voiceCallService.generateRTCToken(channel, 'publisher', 'uid', this.userId).toPromise(), 'rtcToken');
        this._voiceCallService.createRTCClient();
        this._voiceCallService.agoraServerEvents(this._voiceCallService.rtc);
        await this._voiceCallService.localUser(channel, token, caller_uid, 'initiate-call');
      }
    }, 500)
  }

  validatePhoneForE164() {
    const phoneNumber = this.userPhone || this.user?.phone;
    const regEx = /^\+[1-9]\d{10,14}$/;
    return regEx.test(phoneNumber);
  };

  hasRequiredMinimumBalance(mode: string = '') {
    let valid = true;

    let requiredMinimumBalance = this.minimumBalance > 0 ? (this.professional?.rate * this.minimumBalance) : 0;
    if(!(this.minimumBalance > 0 && this.user?.available_balance >= (requiredMinimumBalance))) {
      valid = false;
      this.showRequiredMinimumBalanceMessage(mode);
    }

    return valid;
  }

  notifyProfessional(params) {
    this._professionalsService.notifyProfessional(params).subscribe(
      (response) => {
      },
      (error) => {
        console.log(error);
      })
  }

  async cancelCall() {
    await this._voiceCallService.leaveCall();
    
    let stats = this._voiceCallService.rtcStats;

    let timezoneOffset = new Date().getTimezoneOffset();
    let offset = moment().format('Z');
    let params = {
      id: this.professional?.user_id,
      user_id: this.userId,
      company_id: this.companyId,
      mode: 'end-call',
      channel: this.userId,
      room: `agora-vcp-${this.professional?.user_id}`,
      duration: stats?.Duration || 0,
      timezone: timezoneOffset,
      offset,
      user_mode: 'caller',
    }
    this.notifyProfessional(params);

    this.showToast = false;
  }

  async handleStartChat(id) {
    if(this.userId > 0) {
      this.actionMode = 'chat';
      this.professional = this.professionals.find((c) => c.user_id == id);
      this.chatTimer = '';
      this.reloadData = false;
      this.initializeUserDetails();
      if(this.hasRequiredMinimumBalance('chat')) {
        this.canChat = true;
      } else {
        this.insufficientBalanceTitle = this.toastTitle;
        this.insufficientBalanceDescription = this.toastDescription;
        this.canChat = false;
      }
      this.reloadData = true;
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  initializeUserDetails() {
    this.id = this.professional?.user_id;
    this.image = this.professional?.image;
    this.firstName = this.professional?.first_name;
    this.userName = this.professional?.user_name;
    this.userImage = this.professional?.user_image;
    this.chatRole = 'sender';
    this.currentUserImage = this.professional?.user_image;

    let caller_balance_before_call = 0;
    if(this.userId > 0) {
      caller_balance_before_call = this.user?.available_balance;
    }
    this.senderBalance = caller_balance_before_call;

    let name = this.user?.first_name ? `${this.user?.first_name} ${this.user?.last_name}` : this.user?.name;
    this.userData = [
      {
        label: this._translateService.instant('company-settings.name'),
        value: name,
      },
      {
        label: this._translateService.instant('profile-settings.birthday'),
        value: this.user.birthday ? moment(this.user.birthday).format('DD/MM/YYYY') : '-'
      },
      {
        label: this._translateService.instant('professionals.gender'),
        value: this.user?.gender || '-'
      },
      {
        label: this._translateService.instant('professionals.civilstatus'),
        value: this.user?.civil_status || '-'
      },
      {
        label: this._translateService.instant('profile-settings.position'),
        value: this.user?.position || ''
      },
      {
        label: this._translateService.instant('profile-settings.city'),
        value: this.user?.city || ''
      },
      {
        label: this._translateService.instant('profile-settings.country'),
        value: this.user?.country || ''
      },
    ]
  }

  async handleStartVideoCall(id) {
    localStorage.removeItem('joined-video-channel');
    this.selectedId = id;
    if(this.userId > 0) {
      this.actionMode = 'videocall';
      this.professional = this.professionals?.find((c) => c.user_id == this.selectedId);

      if(this.hasRequiredMinimumBalance()) {
        this.display = '';

        const channel =  `agora-vcp-video-${this.selectedId}-${this.userId}`;
        this.room = channel;
        let caller_uid = Math.floor(Math.random() * 2032);

        let caller_balance_before_call = 0;
        if(this.userId > 0) {
          caller_balance_before_call = this.user?.available_balance;
        }

        let video_call_guid = Math.random().toString(36).substring(6);
        let video_call_passcode = Math.random().toString(36).substring(6);
        const token = get(await this._voiceCallService.generateRTCToken(channel, 'publisher', 'uid', this.userId).toPromise(), 'rtcToken');

        let params = {
          id,
          user_id: this.userId,
          company_id: this.companyId,
          mode: 'accept-video-call',
          message: this._translateService.instant('professionals.incomingvideocall'),
          caller_name: this.user?.first_name ? `${this.user.first_name} ${this.user.last_name}` : this.user.name,
          caller_image: `${environment.api}/${this.user?.image}`,
          room: channel,
          caller_uid,
          caller_balance_before_call,
          video_call_guid,
          video_call_passcode,
          token,
        }
        this.notifyVideoCallProfessional(params);

        setTimeout(() => {
          let url = `/call/video/${video_call_guid}/${video_call_passcode}/caller`;
          this._router.navigate([url])
          .then(() => {
            window.location.reload();
          });
        }, 500)
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  showRequiredMinimumBalanceMessage(mode: string = '') {
    let minimumAmount = parseFloat((this.professional?.rate * this.minimumBalance)?.toString()).toFixed(2);
    let amountInText =  `(${this.professional?.rate_currency} ${minimumAmount})`;
    let actionModeText = this._translateService.instant(`professionals.${this.actionMode}`);
    this.showRequiredMinimumBalanceModal = false;
    this.toastTitle = this._translateService.instant('professionals.insufficientbalance');
    this.toastDescription = `${this._translateService.instant("professionals.minimumbalanceof")} ${this.minimumBalance?.toString()?.replace('.00', '')} ${this._translateService.instant('timeunits.minutes')} ${amountInText} ${this._translateService.instant('professionals.requiredtostart')} ${actionModeText} ${this._translateService.instant('professionals.with')} ${this.professional?.name}`;
    
    if(!mode) {
      this.acceptText = "OK";
      setTimeout(() => (this.showRequiredMinimumBalanceModal = true));
    }
  }

  confirm() {
    this.showRequiredMinimumBalanceModal = false;
  }

  notifyVideoCallProfessional(params) {
    this._professionalsService.notifyVideoCallProfessional(params).subscribe(
      (response) => {
      },
      (error) => {
        console.log(error);
      })
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

  initializeFilterDrawer() {
    this.filtersText = this._translateService.instant('professionals.filters');
    let subcategories = this.subcategories?.map((item) => {
      return {
        id: item?.id,
        text: this.getSubcategoryText(item),
        type: 'specialties',
      };
    });
    let languages = this.languages?.map((item) => {
      return {
        id: item?.id,
        text: this.getItemText(item),
        type: 'languages',
      };
    });
    let gender = this.gender?.map((item) => {
      return {
        id: item?.id,
        text: this.getItemText(item),
        type: 'gender',
      };
    });
    this.drawerFilterList = [
      {
        id: 1,
        title: this._translateService.instant('professionals.specialties'),
        items: subcategories,
      },
      {
        id: 2,
        title: this._translateService.instant('job-offers.language'),
        items: languages,
      },
      {
        id: 3,
        title: this._translateService.instant('professionals.gender'),
        items: gender,
      }
    ]
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

  getItemText(item) {
    return item
      ? this.language == "en"
        ? item.name_EN ||
          item.name_ES
        : this.language == "fr"
        ? item.name_FR ||
          item.name_ES
        : this.language == "eu"
        ? item.name_EU ||
          item.name_ES
        : this.language == "ca"
        ? item.name_CA ||
          item.name_ES
        : this.language == "de"
        ? item.name_DE ||
          item.name_ES
        : this.language == "it"
        ? item.name_IT ||
          item.name_ES
        : item.name_ES
      : "";
  }

  groupProfessionals(professionals) {
    this.activeProfessionals = professionals?.filter(professional => {
      return professional.online_status == 1
    })
    this.nonActiveProfessionals = professionals?.filter(professional => {
      return professional.online_status != 1
    })
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.searchProfessionals();
  }

  searchProfessionals() {
    let professionals = this.allProfessionals
    if (this.search) {
      professionals = this.filterSearchKeyword(professionals);
    }

    if(this.selectedFilters?.length > 0) {
      professionals = this.filterGender(professionals, 'gender');
      professionals = this.filterLanguages(professionals, 'languages');
      professionals = this.filterSpecialties(professionals, 'specialties');
    }

    if(this.showChat) {
      professionals = professionals?.filter(professional => {
        return professional.chat == 1 && professional?.online_status == 1
      })
    }

    if(this.showVideoCall) {
      professionals = professionals?.filter(professional => {
        return professional.video_call == 1 && professional?.online_status == 1
      })
    }

    if(this.showVoiceCall) {
      professionals = professionals?.filter(professional => {
        return professional.voice_call == 1 && professional?.online_status == 1
      })
    }

    if(this.selectedSort) {
      switch(this.selectedSort) {
        case 'xp-high-low':
          professionals = professionals.sort((a, b) => {
            return b.experience - a.experience;
          });
          break;
        case 'xp-low-high':
          professionals = professionals.sort((a, b) => {
            return a.experience - b.experience;
          });
          break;
        case 'rate-high-low':
          professionals = professionals.sort((a, b) => {
            return b.rate - a.rate;
          });
          break;
        case 'rate-low-high':
          professionals = professionals.sort((a, b) => {
            return a.rate - b.rate;
          });
          break;
        case 'review-high-low':
          professionals = professionals.sort((a, b) => {
            return b.rating - a.rating;
          });
          break;
        case 'review-low-high':
          professionals = professionals.sort((a, b) => {
            return a.rating - b.rating;
          });
          break;
      }
    }

    this.professionals = professionals;
    this.groupProfessionals(this.professionals);
  }

  filterGender(professionals, mode) {
    let gender_filters = this.selectedFilters?.filter(filter => {
      return filter.type == mode
    })
    let genders: any[] = [];
    if(gender_filters?.length > 0) {
      gender_filters?.forEach(filter => {
        let gender = this.gender?.find((g) => g.id == filter.id)
        if(gender) {
          genders?.push(gender);
        }
      })
    }
    if(genders?.length > 0) {
      professionals = professionals?.filter(professional => {
        let match = this.isItemFound(professional.gender, genders, mode);
        return match
      })
    }

    return professionals;
  }

  filterLanguages(professionals, mode) {
    let languages_filters = this.selectedFilters?.filter(filter => {
      return filter.type == mode
    })
    let languages: any[] = [];
    if(languages_filters?.length > 0) {
      languages_filters?.forEach(filter => {
        let language = this.languages?.find((g) => g.id == filter.id)
        if(language) {
          languages?.push(language);
        }
      })
    }
    if(languages?.length > 0) {
      professionals = professionals?.filter(professional => {
        let match = this.isItemFound(professional.language, languages, mode);
        return match
      })
    }

    return professionals;
  }

  filterSpecialties(professionals, mode) {
    let specialties_filters = this.selectedFilters?.filter(filter => {
      return filter.type == mode
    })
    let subcategories: any[] = [];
    if(specialties_filters?.length > 0) {
      specialties_filters?.forEach(filter => {
        let subcategory = this.subcategories?.find((g) => g.id == filter.id)
        if(subcategory) {
          subcategories?.push(subcategory);
        }
      })
    }
    if(subcategories?.length > 0) {
      professionals = professionals?.filter(professional => {
        let match = this.isItemFound(professional.specialties, subcategories, mode);
        return match
      })
    }

    return professionals;
  }

  isItemFound(search, list, mode) {
    let new_list = [];
    
    if(mode == 'specialties') {
      let found = false;

      list?.forEach(item => {
        let items = search?.filter((a) => {
          return a.text == item.subcategory_es || a.text == item.subcategory_en
        });
        if(items?.length > 0) {
          found = true;
        }
      })

      return found;
    } else {
      new_list = list?.filter(item => {
        let match = false;
        
        if(mode == 'gender') {
          match = (search?.toLowerCase() == item.name_ES?.toLowerCase() ||
            search?.toLowerCase() == item.name_EN?.toLowerCase()) ? true : false;
        } else if(mode == 'languages') {
          match = (search?.toLowerCase()?.indexOf(item.name_ES?.toLowerCase()) >= 0 ||
            search?.toLowerCase()?.indexOf(item.name_EN?.toLowerCase()) >= 0) ? true : false;
        }

        return match;
      })

      return new_list?.length > 0 ? true : false;
    }
  }

  filterSearchKeyword(professionals) {
    if(professionals?.length > 0) {
      return professionals.filter(professional => {
        return (
          (professional.first_name && 
            (professional.first_name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0)
          ) ||
          (professional.last_name && professional.last_name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0)
        )
      })
    }
  }

  handleFilterClick(event) {
    this.filterType = event || "";
    switch(this.filterType) {
      case 'filter':
        this.showSort = false;
        this.showFilters = !this.showFilters;
        break;
      case 'chat':
        this.showChat = !this.showChat;
        break;
      case 'voice_call':
        this.showVoiceCall = !this.showVoiceCall;
        break;
      case 'video_call':
        this.showVideoCall = !this.showVideoCall;
        break;
      case 'sort':
        this.showFilters = false;
        this.showSort = !this.showSort;
        break;
    }

    this.searchProfessionals();
  }

  handleFiltersExitClick() {
    this.showFilters = false;
  }

  handleFilterDrawerClick(event) {
    let match = this.selectedFilters?.some(
      (a) => a.type == event.type && a.id == event.id
    );
    if(match) {
      let selected_filters = this.selectedFilters;
      if (selected_filters?.length > 0) {
        selected_filters.forEach((filter, index) => {
          if (filter.type == event.type && filter.id == event.id) {
            selected_filters.splice(index, 1);
          }
        });
      }
      this.selectedFilters = selected_filters;
    } else {
      this.selectedFilters?.push(event);
    }
    this.searchProfessionals();
  }

  handleSortDrawerClick(event) {
    this.selectedSort = event;
    this.searchProfessionals();
  }

  handleSortExitClick() {
    this.showSort = false;
  }

  handleDetailClick(event) {
    this._router.navigate([event])
    .then(() => {
      window.location.reload();
    });
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.pauseTimer();
    this.languageChangeSubscription?.unsubscribe();
    this.pusherSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}