import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService, UserService } from "@share/services";
import { Subject, Subscription, takeUntil } from "rxjs";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  StarRatingModule,
  ClickEvent,
  HoverRatingChangeEvent,
  RatingChangeEvent
} from 'angular-star-rating';
import { NgImageSliderModule } from 'ng-image-slider';
import { ChatService, ProfessionalsService, VoiceCallService } from "@features/services";
import { FormsModule } from "@angular/forms";
import { ChatComponent, ToastComponent } from "@share/components";
import { initFlowbite } from "flowbite";
import { timer } from "@lib/utils/timer/timer.utils";
import { environment } from "@env/environment";
import moment from 'moment';
import get from "lodash/get";

@Component({
  selector: "app-professionals-detail",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    StarRatingModule,
    NgImageSliderModule,
    FormsModule,
    ToastComponent,
    ChatComponent,
  ],
  templateUrl: "./detail.component.html",
})
export class ProfessionalDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;

  languageChangeSubscription;
  language: any;
  isMobile: boolean = false;
  userId: any;
  user: any;
  companies: any = [];
  company: any;
  companyId: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  categories: any = [];
  subcategories: any = [];
  subcategoryMapping: any = [];
  professional: any;
  isLoading: boolean = true;
  image: any;
  specialties: any = [];
  experience: any;
  specialtyCategories: any = [];
  reviews: any = [];
  professionalReviews: any = [];
  images: any = [];
  defaultAvatarPath: string = `${environment.api}/empty_avatar.png`;
  currentUserAvatarPath: string = `${environment.api}/empty_avatar.png`;
  rating: number = 0;
  feedback: any;
  addReviewFormSubmitted: boolean = false;
  onClickResult: ClickEvent | undefined;
  onHoverRatingChangeResult: HoverRatingChangeEvent | undefined;
  onRatingChangeResult: RatingChangeEvent | undefined;
  userName: any;
  follower: any;

  pusherSubscription: Subscription | undefined;
  pusherData: any = {};
  intervalId: any;
  showToast: boolean = false;
  toastMessage: string = '';
  toastMode: string = '';
  firstName: any;
  userImage: any;
  currentUserImage: any;
  userPhone: any;
  userData: any = [];
  actionMode: string = "";
  senderBalance: any;
  reloadData: boolean = false;
  canChat: boolean = false;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  selectedId: any;
  toastTitle: string = "";
  toastDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  showRequiredMinimumBalanceModal: boolean = false;
  hasMinimumBalance: any;
  minimumBalance: any;
  callTime: number = 0;
  callTrackingInterval;
  callGuid: any;
  callPasscode: any;
  chatRole: any;
  chatGuid: any;
  chatPasscode: any;
  chatTimer: any;
  chatEnded: boolean = false;
  chatTime: number = 0;
  chatInterval;
  chatTrackingTime: number = 0;
  chatTrackingInterval;
  insufficientBalanceTitle: string = '';
  insufficientBalanceDescription: string = '';
  time: number = 0;
  display;
  interval;
  room: any;
  @ViewChild("modalbutton2", { static: false }) modalbutton2:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton2", { static: false }) closemodalbutton2:
    | ElementRef
    | undefined;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _userService: UserService,
    private _companyService: CompanyService,
    private _professionalsService: ProfessionalsService,
    private _chatService: ChatService,
    private _voiceCallService: VoiceCallService,
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    initFlowbite();
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
    this.initializeCurrentUserData();
    this.getProfessional();
    this.subscribeVoiceCall();
    this.subscribeChat();
  }

  initializeCurrentUserData() {
    if(this.user) {
      this.currentUserAvatarPath = `${environment.api}/${this.user.image}`;
      this.userImage = this.currentUserAvatarPath;
      this.currentUserImage = this.currentUserAvatarPath;
      this.userName = this.user.first_name ? `${this.user.first_name} ${this.user.last_name}` : this.user.name;
    }
  }

  getProfessional() {
    this._professionalsService
      .getProfessionalData(this.id, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          if(data.user && this.userId) { this.user = data?.user; }
          this.categories = this.formatCategories(data?.categories);
          this.subcategories = data?.subcategories;
          this.subcategoryMapping = data?.subcategory_mapping;
          this.reviews = data?.reviews;
          this.follower = data?.follower;

          if(data?.setting?.id > 0) {
            this.hasMinimumBalance = true;
            this.minimumBalance = data?.setting?.minimum_balance;
          }

          this.professional = data?.professional;
          this.image = `${environment.api}/${this.professional?.image}`;
          this.specialties = this.getSpecialties(this.professional);
          this.experience = `${this.professional?.experience} ${this._translateService.instant(`timeunits.${this.professional?.experience_period}`)}`;
          this.professionalReviews = this.formatReviews(this.reviews);
          this.images = this.formatImages(data?.images);

          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatCategories(categories) {
    return categories?.map((item) => {
      return {
        ...item,
        image: `${environment.api}/v3/image/professionals/category/${item.image}`
      };
    });
  }

  getSpecialties(item) {
    let list: any[] = [];

    list = this.subcategoryMapping?.filter(subcategory => {
      return subcategory.professional_id == item.id
    })?.map((row) => {
      return {
        id: row.id,
        text: this.getSubcategoryText(row),
        category_image: row.category_image,
      }
    })

    let specialtyCategories: any[] = [];
    if(list?.length > 0) {
      list?.forEach(i => {
        let match = specialtyCategories.some(
          (a) => a.category_image == i.category_image
        );

        if(i.category_image && !match) {
          specialtyCategories.push({
            image: `${environment.api}/v3/image/professionals/category/${i.category_image}`,
          })
        }
      })
    }
    this.specialtyCategories = specialtyCategories;

    return list;
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

  formatReviews(reviews) {
    let result: any[] = [];

    let startNum = 5;
    for(var i = 0; i < startNum; i++) {
      let rating = startNum - i;
      let cnt = reviews?.filter(review => {
        return review.rating == rating
      })
      let percentage = cnt?.length > 0 ? ((cnt?.length / reviews?.length) * 100) : 0;
      result.push({
        rating,
        percentage,
      })
    }

    return result;
  }

  formatImages(images) {
    images = images?.map((item) => {
      return {
        image: `${environment.api}/v3/image/professionals/gallery/${item.image}`
      };
    });

    let imagesObject: any[] = [];
    if(images?.length > 0) {
      images?.forEach(image => {
        imagesObject.push({
          image: image?.image,
          thumbImage: image?.image,
        })
      });
    }

    return imagesObject;
  }

  onRatingClick = ($event: ClickEvent) => {
    this.onClickResult = $event;
  };

  onRatingChange = ($event: RatingChangeEvent) => {
    this.onRatingChangeResult = $event;
    this.rating = $event?.rating;
  };

  onHoverRatingChange = ($event: HoverRatingChangeEvent) => {
    this.onHoverRatingChangeResult = $event;
  };

  addReview() {
    this.addReviewFormSubmitted = true

    let params = {
      company_id: this.companyId,
      professional_id: this.id,
      user_name: this.userName,
      rating: this.rating,
      feedback: this.feedback,
      created_by: this.userId
    }

    this._professionalsService.addReview(
      params,
    ).subscribe(
      response => {
        this.refreshReviews(response?.reviews);
        this.resetReviewForm();
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
  }

  refreshReviews(reviews) {
    this.reviews = reviews;
    this.professionalReviews = this.formatReviews(this.reviews);
  }

  resetReviewForm() {
    this.addReviewFormSubmitted = false;
    this.feedback = '';
    this.rating = 0;
  }

  followProfessional() {
    let params = {
      company_id: this.companyId,
      professional_id: this.id,
      user_id: this.userId,
    }

    this._professionalsService.followProfessional(
      params,
    ).subscribe(
      response => {
        this.follower = response?.follower;
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        this.open(this._translateService.instant("dialog.error"), "");
      }
    )
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

  async handleStartChat(id) {
    if(this.userId > 0) {
      this.actionMode = 'chat';
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

  async handleStartVideoCall(id) {
    localStorage.removeItem('joined-video-channel');
    this.selectedId = id;
    if(this.userId > 0) {
      this.actionMode = 'videocall';
      
      if(this.hasRequiredMinimumBalance()) {
        this.display = '';

        const channel = `agora-vcp-video-${this.selectedId}-${this.userId}`;
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

        const channel = `agora-vcp-${id}`;
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

  notifyProfessional(params) {
    this._professionalsService.notifyProfessional(params).subscribe(
      (response) => {
      },
      (error) => {
        console.log(error);
      })
  }

  notifyVideoCallProfessional(params) {
    this._professionalsService.notifyVideoCallProfessional(params).subscribe(
      (response) => {
      },
      (error) => {
        console.log(error);
      })
  }

  hasRequiredMinimumBalance(mode: string = '') {
    let valid = true;

    let requiredMinimumBalance = this.minimumBalance > 0 ? (this.professional?.rate * this.minimumBalance) : 0;
    if(!(this.minimumBalance > 0 && this.user?.available_balance >= (requiredMinimumBalance))) {
      valid = false;
      this.showRequiredMinimumBalanceMessage(mode);
    }

    return valid;
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

  initializeUserDetails() {
    this.firstName = this.professional?.first_name;
    this.chatRole = 'sender';
    this.currentUserImage = this.userImage;

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

  confirm() {
    this.showRequiredMinimumBalanceModal = false;
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