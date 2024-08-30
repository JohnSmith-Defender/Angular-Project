import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  SecurityContext,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { environment } from "@env/environment";
import { PlansService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, NoAccessComponent, PageTitleComponent, ToastComponent } from "@share/components";
import {
  LocalService,
  ExcelService,
  CompanyService,
  UserService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SafeContentHtmlPipe } from "@lib/pipes";
import { FormsModule } from "@angular/forms";
import { initFlowbite } from "flowbite";
import { EditorModule } from "@tinymce/tinymce-angular";
import get from "lodash/get";
import momenttz from "moment-timezone";
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";

declare const addeventatc: any;

@Component({
  selector: "app-plans-detail",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatSnackBarModule,
    RouterModule,
    EditorModule,
    BreadcrumbComponent,
    PageTitleComponent,
    NgOptimizedImage,
    SafeContentHtmlPipe,
    ToastComponent,
    NoAccessComponent,
  ],
  templateUrl: "./detail.component.html",
})
export class PlanDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;
  @Input() planTypeId!: number;

  languageChangeSubscription;
  apiPath: string = environment.api;
  language: any;
  emailDomain;
  joinedParticipant;
  pendingRequest: any;
  planParticipants: any;
  planComments: any = [];
  superCategories = [];
  plan: any = [];
  planParticipantCount = 0;
  tabTexts;
  url: string = "";
  group_id = null;
  user;
  seats = 0;
  comment: any;
  createdBy: string = "";
  emailTo: string = "";
  imageSrc: any = "";
  videoSrc: any = "";
  location: any = "";
  isloading: boolean = true;
  showOption: boolean = false;
  speedMember: boolean = false;
  showAction: boolean = false;
  isCompanyPlanType: boolean = true;
  openSuccessModal: boolean = false;
  onSubmit: boolean = false;
  terms: boolean = false;
  today: any;
  currentPlanType: any;
  facebook: any;
  mode: any;
  activateWaitingList: boolean = false;
  isInWaitingList: boolean = false;
  userId: any;
  companyId: any;
  types: any;
  categories: any;
  subcategories: any;
  eventType: any;
  eventCategory: any;
  eventSubcategory: any;
  invitationLink: any;
  zoomLink: any;
  planDate: any;
  limitDate: any;
  endDate: any;
  memberParticipants: any = [];
  guestParticipants: any = [];
  calendarStartDate: any;
  calendarEndDate: any;
  speedEvents: any;

  isAddNewLink: boolean = false;
  newLink: any;
  editLink: any;
  aliasId: any;
  additionalInvitationLinks: any = [];
  roles: any;
  superAdmin: any;
  admin1: any;
  admin2: any;
  hostUrl: any;
  isAS: boolean = false;
  isHRKlub: boolean = false;

  groupOwner: boolean = false;
  groupMember: boolean = false;

  eventDates: any;
  eventDate: any;
  guestsPerEmployee: any;
  planGuests: any;
  employeeGuests: any;
  allPlanParticipants: any;
  issaving: boolean = false;
  showError: boolean = false;
  isPlanOpen: boolean = true;
  errorMessage: any;
  lottery: boolean = false;
  waitingListPosition: any;
  planDateValue: any;
  waitingList: any = [];

  pageName: any;
  features: any;
  subfeatures: any;
  invitationLinkActive: boolean = false;
  clubTitle: any;
  guestMemberSeatActive: boolean = false;
  waitingListActive: boolean = false;
  waitingListButtonTextEn: any;
  waitingListButtonTextEs: any;
  waitingListCancelButtonTextEn: any;
  waitingListCancelButtonTextEs: any;
  waitingListNotification: boolean = false;

  companies: any;
  primaryColor: any;
  buttonColor: any;

  activityFeeEnabled: boolean = false;
  showManageBilling: boolean = false;
  planDateCanary: any;
  showCanaryTime: boolean = false;
  customEventRegistrationLanding: boolean = false;
  garThematicMember: any;
  garMember: boolean = false;
  thematicMember: boolean = false;
  showJoinButton: boolean = false;
  eventDescription: any = "";

  hasTypeOfActivity: boolean = false;
  activityDays: any;
  prolongedActivities: any = [];
  typeOfActivity: any;
  typeOfActivityDisplay: any;
  typeOfActivities: any = [];

  commentError: any = "";
  CompanyGroupPlanComments: any;
  CompanyPlanComments: any;
  showChildComment: boolean = false;
  selectedCommentId: any;
  childComment: any;
  heartComment: boolean = false;
  locale: any;
  showPastEvents: boolean = false;
  additionalContent: any;
  organizerComments: any;
  participantsComments: any;
  isPastEvent: boolean = false;
  companyName: any = "";
  planTitle: any = "";
  planDescription: any = "";
  plansFeature: any;
  createdByImage: any;
  otherSettings: any;
  featureId: any;
  hasCustomMemberTypeSettings: boolean = false;
  planCategory: any;
  planSubcategory: any;
  repeatEvent: any;
  showEditRepeatingEventConfirmationModal: boolean = false;
  editRepeatEventQuestions: any = [];
  editRepeatEventFormSubmitted: boolean = false;
  editRepeatEventType: any;

  canAssignMultipleCities: boolean = false;
  activityCities: any = [];
  canShowAddress: boolean = false;
  emailInviteModal: boolean = false;
  emailInviteQuestions: any = [];
  emailInviteFormSubmitted: boolean = false;
  hasEmailInvite: boolean = true;
  hasFeatured: boolean = false;
  featuredTextValue: any;
  featuredTextValueEn: any;
  featuredTextValueFr: any;
  featuredTextValueEu: any;
  featuredTextValueCa: any;
  featuredTextValueDe: any;
  blockResponseToComments: boolean = false;
  showSeats: boolean = false;
  isExternalRegistration: boolean = false;
  parentEventId: any;
  hasSpeaker: boolean = false;
  hasGuestSpeaker: boolean = false;
  members: any = [];
  selectedSpeaker: any = "";
  guestSpeaker: any = "";
  membersSettings: any = {};
  speaker: any;
  hasClubAccess: boolean = false;
  hasMemberAccess: boolean = false;
  createdById: any;
  hasRequestDNI: boolean = false;
  requestDNI: boolean = false;
  showUpdateDNIModal: boolean = false;
  updateDNIFormSubmitted: boolean = false;
  userDNI: any;
  currentUser: any;
  membersTitle: any;
  hasAliasInvitationLink: boolean = false;
  aliasInvLink: any = 0;
  userRoles: any = [];
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  plansData: any;
  planCreator: any;
  joinStatusChecked: boolean = false;
  userAliases: any;
  planReactions: any;

  showConfirmationModal: boolean = false;
  selectedItem: any;
  company: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  allPlanComments: any = [];
  confirmMode: string = "";

  @ViewChild("iframeEventDescription", { static: false })
  iframeEventDescription: ElementRef | undefined;
  @ViewChild("editor", { static: false }) editor: ElementRef | undefined;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  pageDescription: any;
  title: any;
  subtitle: any;
  featuredTitle: any;
  planTruncatedDescription: any;
  planExpandedDescription: boolean = false;
  truncate: number = 200;
  planDay: string = "";
  planTime: string = "";
  limitPlanParticipants: any;
  duplicateHover: boolean = false;
  editHover: boolean = false;
  deleteHover: boolean = false;
  joinHover: boolean = false;
  leaveHover: boolean = false;
  addCommentHover: boolean = false;
  addCalendarHover: boolean = false;
  isUESchoolOfLife: boolean = false;
  planCategoryMapping: any = [];
  allPlanData: any = [];
  hasMembers: boolean = false;
  whatsAppTemplate: string = '';
  telegramTemplate: string = '';
  canRegisterAllEvents: boolean = false;
  canRegisterNetculturaEvents: boolean = false;
  canRegisterGuestsOnly: boolean = false;
  canInviteEvents: boolean = false;
  pendingBizumConfirmation: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _plansService: PlansService,
    private _companyService: CompanyService,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _excelService: ExcelService,
    private _location: Location,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.url = this._router.url.substring(
      this._router.url.lastIndexOf("/") + 1
    );
    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
    this._translateService.use(this.language || "es");

    moment.locale(this.language);
    this.locale = {
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek(),
      format: "DD-MM-YYYY",
    };

    this.emailDomain = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    if(this.companyId != 12) { this.showJoinButton = true; }
    this.today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
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
      this.emailDomain = company[0].domain;
      this.companyId = company[0].id;
      this.companyName = company[0].entity_name;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.featuredTextValue =
        company[0].featured_text ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueEn =
        company[0].featured_text_en ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueFr =
        company[0].featured_text_fr ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueEu =
        company[0].featured_text_eu ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueCa =
        company[0].featured_text_ca ||
        this._translateService.instant("courses.featured");
      this.featuredTextValueDe =
        company[0].featured_text_de ||
        this._translateService.instant("courses.featured");
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    let features = this._localService.getLocalStorage(environment.lsfeatures)
    ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
    : "";
    let membersFeature = features?.find(f => f.feature_name == "Members")
    this.hasMembers = membersFeature ? true : false;

    setTimeout(() => {
      initFlowbite();
    }, 100);

    this.getPlan();
  }

  getPlan() {
    this._plansService
      .fetchPlanDetailsCombined(
        this.id,
        this.planTypeId,
        this.companyId,
        this.userId
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.plansData = data;
          this.allPlanData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.plansData;
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data);
    this.mapUserPermissions(data?.user_permissions);
    this.user = data?.user_permissions?.user;
    this.types = data?.types;
    this.categories = data?.plan_categories;
    this.subcategories = data?.plan_subcategories;
    this.planCategoryMapping = data?.plan_category_mapping;
    this.getPlanWaitingList(data?.plan);
    this.formatPlan(
      data?.plan,
      data?.user_permissions?.user,
      data?.user_permissions?.created_by_ue
    );
    this.getTitles();
    this.initializeBreadcrumb();
    if(this.companyId == 12) {
      this.getNetculturaUsers();
    } else {
      this.checkLimitSeats();
    }
  }

  getPlanWaitingList(plan) {
    let waitingList = plan.waiting_list
    if(waitingList && waitingList.length > 0) {
      this.isInWaitingList = true;
      this.waitingListPosition = waitingList[0].position;
    }
  }

  getNetculturaUsers() {
    this._userService.netculturaUsersList()
      .subscribe(
        response => {
          this.showJoinButton = true;
          let netculturaUsers = response['people']
          let match = netculturaUsers?.some(a => a.id == this.userId)
          if(match && this.plan?.event_category_id != 4) {
              if(this.planCategoryMapping?.length > 0) {
                  let plan_category_mapping = this.planCategoryMapping.filter(plan => {
                      return plan.group_plan_id == this.id
                  })
                  if(plan_category_mapping?.length > 0) {
                      let categories = this.categories?.filter(category => {
                          return plan_category_mapping?.some(a => a.plan_category_id === category.id && a.plan_category_id == 4)
                      })
                      if(categories?.length > 0) {
                      } else {
                          this.showJoinButton = false
                      }
                  } else {
                      this.showJoinButton = false
                  }
              } else {
                  this.showJoinButton = false
              }
          }
          this.checkLimitSeats();
        },
        error => {
            console.log(error)
        }
      )
  }

  checkLimitSeats() {
    if(this.plansData?.plan?.details?.member_seats > 0 && this.userId > 0) {
      if(!(this.memberParticipants?.length < this.plansData?.plan?.details?.member_seats)) {
        this.showJoinButton = false
      }
    }
  }

  mapFeatures(features) {
    this.plansFeature = features?.find((f) => f.feature_id == 1);
    this.featureId = this.plansFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.plansFeature);
    this.pageDescription = this.getFeatureDescription(this.plansFeature);
    this.mapPageTitle();

    let clubFeature = features?.find((f) => f.feature_id == 5 && f.status == 1);
    this.clubTitle = clubFeature ? this.getFeatureTitle(clubFeature) : "";

    let membersFeature = features?.find(
      (f) => f.feature_id == 15 && f.status == 1
    );
    this.hasMemberAccess = membersFeature ? true : false;
    this.membersTitle = membersFeature
      ? this.getFeatureTitle(membersFeature)
      : "";
  }

  mapPageTitle() {
    if(this.isUESchoolOfLife && this.companyId == 32) {
      this.pageName = this.pageName?.replace('de Vida Universitaria', 'de School of Life')
      this.pageName = this.pageName?.replace('University Life', 'School of Life')
    }
    this.title = this.pageName;
    this.subtitle = this.pageDescription;
  }

  mapSubfeatures(data) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.invitationLinkActive = subfeatures.some(
        (a) => a.name_en == "Invitation link" && a.active == 1
      );
      this.guestMemberSeatActive = subfeatures.some(
        (a) => a.name_en == "Guest/Member seats" && a.active == 1
      );
      this.waitingListActive = subfeatures.some(
        (a) => a.name_en == "Waiting list" && a.active == 1
      );
      this.activityFeeEnabled = subfeatures.some(
        (a) => a.name_en == "Fee" && a.active == 1
      );
      this.showCanaryTime = subfeatures.some(
        (a) => a.name_en == "Show Canary time" && a.active == 1
      );
      this.customEventRegistrationLanding = subfeatures.some(
        (a) =>
          a.name_en == "Custom landing page for event registration" &&
          a.active == 1
      );
      this.hasTypeOfActivity = subfeatures.some(
        (a) => a.name_en == "Type of activity" && a.active == 1
      );
      this.showPastEvents = subfeatures.some(
        (a) => a.name_en == "Past" && a.active == 1
      );
      this.canAssignMultipleCities = subfeatures.some(
        (a) => a.name_en == "Assign multiple cities" && a.active == 1
      );
      this.hasEmailInvite = subfeatures.some(
        (a) => a.name_en == "Email invite" && a.active == 1
      );
      this.hasFeatured = subfeatures.some(
        (a) => a.name_en == "Featured" && a.active == 1
      );
      this.blockResponseToComments = subfeatures.some(
        (a) => a.name_en == "Block response to comments" && a.active == 1
      );
      this.hasSpeaker = subfeatures.some(
        (a) => a.name_en == "Speaker" && a.active == 1
      );
      this.hasGuestSpeaker = subfeatures.some(
        (a) => a.name_en == "Guest Speaker" && a.active == 1
      );
      this.hasRequestDNI = subfeatures.some(
        (a) => a.name_en == "Request DNI" && a.active == 1
      );
      this.hasAliasInvitationLink = subfeatures.some(
        (a) =>
          a.name_en == "Add the alias in the event invitation link" &&
          a.active == 1
      );
    }

    if (this.waitingListActive) {
      let subf = subfeatures.filter((sf) => {
        return sf.name_en == "Waiting list";
      });
      if (subf?.length > 0) {
        let waiting_list_details = data?.subfeature_options;
        if (waiting_list_details) {
          waiting_list_details.forEach((d) => {
            if (d.option_id == 1) {
              this.waitingListButtonTextEs = d.value;
            }
            if (d.option_id == 2) {
              this.waitingListButtonTextEn = d.value;
            }
            if (d.option_id == 3) {
              this.waitingListCancelButtonTextEs = d.value;
            }
            if (d.option_id == 4) {
              this.waitingListCancelButtonTextEn = d.value;
            }
            if (d.option_id == 5) {
              this.waitingListNotification = d.value ? true : false;
            }
          });
        }
      }
    }
    if (this.hasTypeOfActivity) {
      this.typeOfActivities = data?.activity_types;
    }
    if (this.canAssignMultipleCities) {
      this.activityCities = data?.plan?.activity_cities;
      this.canShowAddress = true;
    } else {
      this.canShowAddress = true;
    }
    if (this.hasEmailInvite) {
      this.emailInviteQuestions = data?.settings?.email_invite_questions;
      this._localService.setLocalStorage(
        environment.lsemailinvitequestions,
        this.emailInviteQuestions && this.emailInviteQuestions.length > 0
          ? JSON.stringify(this.emailInviteQuestions)
          : ""
      );
    }
    if (this.hasAliasInvitationLink) {
      this.aliasInvLink = 1;
    }
    if (this.userId > 0) {
      this.getUserAliases(data?.user_permissions?.user_alias);
      if (data?.settings?.club_presidents_mapping?.length > 0) {
        this.getClubPresidents(data?.settings?.club_presidents_mapping);
      }
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.showOption =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 1);

    this.canRegisterAllEvents = user_permissions?.member_type_permissions?.find((f) => f.register_events_all == 1 && f.feature_id == 1) ? true : false;
    this.canRegisterNetculturaEvents = user_permissions?.member_type_permissions?.find((f) => f.register_events_netcultura == 1 && f.feature_id == 1) ? true : false;
    this.canRegisterGuestsOnly = user_permissions?.member_type_permissions?.find((f) => f.register_events_guests == 1 && f.feature_id == 1) ? true : false;

    this.canInviteEvents = user_permissions?.member_type?.invite_all_events == 1 ? true : false;
  }

  getJoinStatus() {
    let result = false;

    let canJoin = this.showJoinButton && ((!this.joinedParticipant
      && !this.plan?.private
      && (this.plan?.plan_date >= this.today || this.plan?.end_date >= this.today || !this.isPastEvent)
      && !this.activateWaitingList) || (this.plan?.private && !this.joinedParticipant && this.speedMember)
      || (this.plan?.private && this.showOption && !this.joinedParticipant && (this.plan?.plan_date >= this.today || !this.isPastEvent)));

    let canRegisterNetcultura = false;
    if(!this.canRegisterAllEvents && this.canRegisterNetculturaEvents) {
      if(this.getCategoryLabel()?.indexOf('Netcultura') >= 0) {
        canRegisterNetcultura = true;
      }
    }

    let canRegisterGuestsOnly = false;
    if(!this.canRegisterAllEvents && this.canRegisterGuestsOnly) {
      if(this.limitPlanParticipants?.length > 0) {
        let invited_guests = this.limitPlanParticipants?.filter(participant => {
          return participant.invited_by == this.userId
        })
        if(invited_guests?.length > 0) {
          canRegisterGuestsOnly = true;
        }
      }
    }

    result = canJoin && (
      (this.userId && (this.canRegisterAllEvents || canRegisterNetcultura || canRegisterGuestsOnly)) ||
      !this.userId
    );

    return result;
  }

  getRequestJoinStatus() {
    return !this.joinedParticipant
      && this.plan?.private
      && this.pendingRequest
      && !this.showOption
      && this.plan?.plan_date >= this.today;
  }

  getShareStatus() {
    let result = false;

    let canShare = this.userId && this.invitationLinkActive && (this.superAdmin || this.showOption || !this.plan?.private || (this.plan?.private && this.joinedParticipant));

    result = canShare && this.canInviteEvents;

    return result;
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
        : feature.description_es
      : "";
  }

  initializeBreadcrumb() {
    this.level1Title = this.pageName;
    this.level2Title = "";
    this.level3Title = this.planTitle;
    this.level4Title = "";
  }

  getTitles() {
    if (this.plan && this.plan.id) {
      this.planTitle =
        this.language == "en"
          ? this.plan.title_en
          : this.language == "fr"
          ? this.plan.title_fr || this.plan.title
          : this.language == "eu"
          ? this.plan.title_eu || this.plan.title
          : this.language == "ca"
          ? this.plan.title_ca || this.plan.title
          : this.language == "de"
          ? this.plan.title_de || this.plan.title
          : this.plan.title;
      this.planDescription =
        this.language == "en"
          ? this.plan.description_en || this.plan.description
          : this.language == "fr"
          ? this.plan.description_fr
          : this.language == "eu"
          ? this.plan.description_eu || this.plan.description
          : this.language == "ca"
          ? this.plan.description_ca || this.plan.description
          : this.language == "de"
          ? this.plan.description_de || this.plan.description
          : this.plan.description;

      if (
        this.planDescription &&
        this.planDescription.indexOf("[canva]") >= 0
      ) {
        var index = this.planDescription.indexOf("[canva]");
        var endIndex = this.planDescription.indexOf("[/canva]");
        var linkLength = endIndex - index;
        var link = this.planDescription.substr(index + 7, linkLength - 7);
        if (
          link &&
          link.indexOf("canva.com") >= 0 &&
          link.indexOf("/watch?embed") < 0
        ) {
          link = link.replace("/watch", "/watch?embed");
        }

        let iframeHtml = `<iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;" src="${link}" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe>`;
        let desc = this.planDescription.replace(link, "");
        desc = desc.replace(
          /\[canva\]/g,
          '<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;border-radius: 8px; will-change: transform;">' +
            iframeHtml
        );
        desc = desc.replace(/\[\/canva\]/g, "</div>");
        this.planDescription = desc;
      }

      if (
        this.planDescription &&
        this.planDescription.indexOf("[vidalytics]") >= 0
      ) {
        var index = this.planDescription.indexOf("[vidalytics]");
        var endIndex = this.planDescription.indexOf("[/vidalytics]");
        var linkLength = endIndex - index;
        var link = this.planDescription.substr(index + 12, linkLength - 12);

        let iframeHtml = `<iframe style="border:none;" width="100%" height="400" id="video-container" src="https://preview.vidalytics.com/embed/${link}"></iframe>`;
        let desc = this.planDescription.replace(link, "");
        desc = desc.replace(/\[vidalytics\]/g, iframeHtml);
        desc = desc.replace(/\[\/vidalytics\]/g, "");
        this.planDescription = desc;
      }

      if (
        this.planDescription &&
        this.planDescription.indexOf("</script>") >= 0
      ) {
        this.eventDescription = this.sanitizer.sanitize(
          SecurityContext.SCRIPT,
          this.sanitizer.bypassSecurityTrustScript(this.planDescription)
        );
      } else {
        this.eventDescription = this.sanitizer.sanitize(
          SecurityContext.HTML,
          this.sanitizer.bypassSecurityTrustHtml(this.planDescription)
        );
      }

      // Get excerpt
      if(this.planDescription && this.planDescription.length > this.truncate) {
        this.planTruncatedDescription = this.getExcerpt(this.planDescription);
      } else {
        this.planTruncatedDescription = this.planDescription;
      }
    }
  }

  getExcerpt(description) {
    let charlimit = this.truncate;
    if (!description || description.length <= charlimit) {
      return description;
    }

    let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  getEventTitle(event) {
    return this.language == "en"
      ? event.title_en
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

  getCategoryLabel() {
    let category = "";

    if(this.eventCategory) {
      category = this.eventCategory;
      if(this.planCategoryMapping?.length > 0) {
        category = this.planCategoryMapping?.map((data) => { return data.name_es }).join(', ');
      }
    } else {
      if(this.superCategories?.length > 0) {
        this.superCategories?.forEach((cat: any) => {
          let prefix = category ? ', ' : ''
          category += `${prefix}${this.language == 'en' ? (cat.name_EN || cat.name_ES) : (this.language == 'fr' ? (cat.name_FR || cat.name_ES) : (this.language == 'eu' ? (cat.name_EU || cat.name_ES) : (this.language == 'ca' ? (cat.name_CA || cat.name_ES) : (this.language == 'de' ? (cat.name_DE || cat.name_ES) : cat.name_ES))))}`
        })
      }

      let categories_mapping = this.allPlanData?.plan?.categories_mapping;
      if(categories_mapping?.length > 0) {
        let plan_category_mapping = categories_mapping?.filter(plan => {
          return plan.fk_group_plan_id == this.id || plan.fk_plan_id == this.id
        })
        if(plan_category_mapping?.length > 0) {
          let categories = this.categories?.filter(category => {
            return plan_category_mapping?.some(a => a.fk_supercategory_id === category.fk_supercategory_id)
          })
          if(categories?.length > 0) {
            category = categories?.map((data) => { return data?.name_ES || data?.name_es }).join(', ')
          }
        }
      }
    }

    return category;
  }

  getUserAliases(aliases) {
    if (aliases?.length > 0) {
      aliases.forEach((data) => {
        const { alias, id } = data;
        let match = this.additionalInvitationLinks.some(
          (a) => a.link === alias
        );
        if (!match) {
          this.additionalInvitationLinks.push({
            link: alias,
            aliasId: id,
            isEditLink: false,
          });
        }
      });
    }
  }

  getClubPresidents(club_presidents_mapping) {
    let club =
      club_presidents_mapping &&
      club_presidents_mapping.filter((club) => {
        return (
          club.user_id == this.userId && club.club_id == this.plan.fk_group_id
        );
      });
    if (club && club[0]) {
      this.showOption = true;
    }
  }

  formatPlan(plan, user, ue_user) {
    this.user = user;
    this.plan = plan?.details;
    this.pendingBizumConfirmation = plan?.pending_bizum_confirmation;
    this.featuredTitle = this.getFeaturedTitle();
    this.planCreator = plan?.created_by_user;
    if (this.userId) {
      this.userAliases = user?.user_alias;
    }
    this.imageSrc = `${this.apiPath}${this.plan.path}${this.plan.image}`;
    if(this.planDescription && this.planDescription.indexOf('</script>') >= 0) {
      this.eventDescription = this.sanitizer.sanitize(
        SecurityContext.SCRIPT, this.sanitizer.bypassSecurityTrustScript(this.planDescription));
    } else {
      this.eventDescription = this.sanitizer.sanitize(
        SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(this.plan.description)
      );
    }
    this.group_id = this.plan.fk_group_id || null;
    this.seats = parseInt(this.plan.seats) || 0;
    this.showSeats = this.plan.show_seats == 1 ? true : false;
    this.isExternalRegistration =
      this.plan.external_registration == 1 ? true : false;
    this.requestDNI = this.plan.request_dni == 1 ? true : false;
    this.parentEventId = this.plan.parent_event_id;
    this.speaker = this.plan.speaker_id;
    if (this.speaker) {
      this.selectedSpeaker = plan?.speaker;
    }
    this.guestSpeaker = this.plan?.guest_speaker || '';
    this.formatComments(plan?.comments);
    this.planReactions = plan?.reactions;
    let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    if (this.plan?.plan_date) {
      this.planDate = moment
        .utc(this.plan.plan_date)
        .locale(this.language)
        .format("dddd, MMM D YYYY, HH:mm");
      this.planDateCanary = moment
        .utc(this.plan.plan_date)
        .subtract(1, "hours")
        .locale(this.language)
        .format("HH:mm");

      if(this.plan?.limit_date) {
        this.planDay = moment
          .utc(this.plan.plan_date)
          .locale(this.language)
          .format("dddd, D MMMM");
      } else {
        this.planDay = moment
        .utc(this.plan.plan_date)
        .locale(this.language)
        .format("dddd, D MMMM YYYY");
      }

      if(this.plan?.limit_date) {
        let end = moment
        .utc(this.plan.limit_date)
        .locale(this.language)
        .format("D MMMM YYYY")
        let end_display = moment
        .utc(this.plan.limit_date)
        .locale(this.language)
        .format("dddd, D MMMM");
        if(this.planDay != end_display) {
          this.planDay += ' - ' + end;
        }
      }

      this.planTime = moment
        .utc(this.plan.plan_date)
        .locale(this.language)
        .format("HH:mm A");
      if(this.plan?.limit_date) {
        let startHour = moment
        .utc(this.plan.plan_date)
        .hour();
        let endHour = moment
        .utc(this.plan.limit_date)
        .hour();
        if(endHour > startHour) {
          let endTime = moment
          .utc(this.plan.limit_date)
          .locale(this.language)
          .format("HH:mm A");
          if(this.planTime != endTime) {
            this.planTime += ' - ' + endTime;
          }
        }
      }

      var date = moment(
        this.plan.plan_date.replace("T", " ").replace(".000Z", "")
      );
      this.planDateValue = this.plan.plan_date.replace("T", " ").replace(".000Z", "");
      var zone = "Europe/Madrid";
      this.calendarStartDate = momenttz.tz(date, zone).format();

      if (this.plan.plan_date < today || moment(this.plan.plan_date).isBefore(moment(new Date()))) {
        this.isPastEvent = true;
      }
    }

    if (this.plan?.end_date) {
      this.endDate = moment
        .utc(this.plan.end_date)
        .locale(this.language)
        .format("dddd, MMM D YYYY, HH:mm");
    }

    this.getEmailTo();

    if (this.userId) {
      this.showOption = this.plan.fk_user_id === this.userId;
    }
    this.zoomLink = this.plan.zoom_link;

    this.planParticipants = plan?.plan_participants;
    // this.limitPlanParticipants = this.planParticipants?.length > 9 ? this.planParticipants?.slice(0, 9) : this.planParticipants;
    this.limitPlanParticipants = this.planParticipants;
    if (this.plan?.event_category_id > 0) {
      if(this.categories?.length > 0) {
        this.categories.forEach(category => {
          if(category.id == this.plan.event_category_id) {
            this.eventCategory = this.language == 'en' ? category.name_en : (this.language == 'fr' ? category.name_fr : category.name_es);
          }
        })
      }
      this.getCategoryLabel()
    } else {
      let categories1 = plan?.categories_mapping;
      if (categories1) {
        let cats = [];
        if (categories1) {
          cats = this.categories.filter((sc) => {
            let match = categories1.some((a) => a.fk_supercategory_id === sc.fk_supercategory_id);
            return match;
          });
        }

        if (cats?.length > 0) {
          this.planCategory = cats ? cats?.map( (data: any) => { return data?.name_ES }).join() : '';
          this.level2Title = this.planCategory
        }
      }
    }
    if (this.plan?.event_subcategory_id > 0) {
      let subcat =
        this.subcategories &&
        this.subcategories.filter((sc) => {
          return (
            sc.id == this.plan.event_subcategory_id &&
            sc.category_id == this.plan.event_category_id
          );
        });
      if (subcat && subcat[0]) {
        this.planSubcategory =
          this.language == "en"
            ? subcat[0].name_en || subcat[0].name_es
            : this.language == "fr"
            ? subcat[0].name_fr || subcat[0].name_en
            : subcat[0].name_es;
      }
    } else {
      let subcategories1 = plan?.subcategories_mapping;
      if (subcategories1) {
        let subcats = [];
        if (subcategories1) {
          subcats = this.subcategories.filter((sc) => {
            let match = subcategories1.some((a) => a.subcategory_id === sc.id);
            return match;
          });
        }

        if (subcats && subcats.length > 0) {
          let planSubcategory = "";
          subcats.forEach((s: any) => {
            let text =
              this.language == "en"
                ? s.name_EN
                : this.language == "fr"
                ? s.name_FR
                : this.language == "eu"
                ? s.name_EU
                : this.language == "ca"
                ? s.name_CA
                : this.language == "de"
                ? s.name_DE
                : s.name_ES;
            if (planSubcategory == "") {
              planSubcategory = text;
            } else {
              planSubcategory += ", " + text;
            }
          });
          
          this.planSubcategory = subcats ? subcats?.map( (data: any) => { return data?.name_ES }).join() : '';
        }
      }
    }
    this.planParticipantCount = this.planParticipants.length;
    this.joinedParticipant = this.isUserJoined(this.planParticipants);
    this.pendingRequest = this.checkPendingJoinRequest(plan?.requests, 0);
    this.joinStatusChecked = true;

    setTimeout(() => {
      initFlowbite();
    }, 500);

    this.getInviteLink();

    if (this.companyId == 32 && this.planTypeId != 4) {
      this.getUECreatedBy(ue_user);
    }

    if (this.guestMemberSeatActive) {
      if (this.planParticipants) {
        this.planParticipants.forEach((participant: any) => {
          if (participant) {
            if (this.hasCustomMemberTypeSettings || this.companyId != 12) {
              if (participant.custom_member_type_id > 0) {
                let match = this.memberParticipants.some(
                  (a) => a.user_id === participant.user_id
                );
                if (!match) {
                  this.memberParticipants.push(participant);
                }
              } else {
                let match = this.guestParticipants.some(
                  (a) => a.user_id === participant.user_id
                );
                if (!match) {
                  this.guestParticipants.push(participant);
                }
              }
            } else {
              if (participant.password) {
                let match = this.memberParticipants.some(
                  (a) => a.user_id === participant.user_id
                );
                if (!match) {
                  this.memberParticipants.push(participant);
                }
              } else {
                let match = this.guestParticipants.some(
                  (a) => a.user_id === participant.user_id
                );
                if (!match) {
                  this.guestParticipants.push(participant);
                }
              }
            }
          }
        });
      }
    }

    let available_seats = this.seats - this.planParticipantCount;
    if (this.seats > 0 && available_seats <= 0) {
      this.activateWaitingList = true;
      this.waitingList = plan?.waiting_list;
    }

    if (
      this.joinedParticipant &&
      this.activityFeeEnabled &&
      this.plan.price > 0
    ) {
      if (plan?.user_subscription?.subscription_id) {
        this.showManageBilling = true;
      }
    }

    if (this.hasTypeOfActivity) {
      this.typeOfActivity = this.plan.activity_type_id;

      if (this.typeOfActivity && this.typeOfActivities) {
        let activity = this.typeOfActivities.filter((a) => {
          return a.id == this.typeOfActivity;
        });
        if (activity && activity[0]) {
          this.typeOfActivityDisplay =
            this.language == "en" ? activity[0].name_en : activity[0].name_es;
        }
      }

      this.activityDays = this.plan.activity_days;
      if (this.activityDays && this.activityDays > 0) {
        this.prolongedActivities = plan?.activities;
      }
    }

    if (this.repeatEvent) {
      if (this.parentEventId) {
        this.editRepeatEventQuestions = [
          {
            id: 1,
            question: this._translateService.instant(
              "edit-plan.whatdoyouwanttoupdate"
            ),
            options: [
              {
                id: 1,
                option: this._translateService.instant("edit-plan.justthisone"),
              },
              {
                id: 2,
                option: this._translateService.instant(
                  "edit-plan.theentireseries"
                ),
              },
            ],
          },
        ];
      } else {
        this.editRepeatEventQuestions = [
          {
            id: 1,
            question: this._translateService.instant(
              "edit-plan.whatdoyouwanttoupdate"
            ),
            options: [
              {
                id: 2,
                option: this._translateService.instant(
                  "edit-plan.theentireseries"
                ),
              },
            ],
          },
        ];
      }
    }

    this.repeatEvent =
      this.plan?.repeat_event == 1 || this.plan?.parent_event_id > 0
        ? true
        : false;

    setTimeout(function () {
      addeventatc.refresh();
    }, 200);
    this.isloading = false;
  }

  getFeaturedTitle() {
    return this.language == "en"
      ? this.featuredTextValueEn
        ? this.featuredTextValueEn || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "fr"
      ? this.featuredTextValueFr
        ? this.featuredTextValueFr || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "eu"
      ? this.featuredTextValueEu
        ? this.featuredTextValueEu || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "ca"
      ? this.featuredTextValueCa
        ? this.featuredTextValueCa || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "de"
      ? this.featuredTextValueDe
        ? this.featuredTextValueDe || this.featuredTextValue
        : this.featuredTextValue
      : this.featuredTextValue;
  }

  formatComments(comments) {
    this.allPlanComments = comments;

    let comment_rows: any[] = [];
    if (comments?.length > 0) {
      comments?.forEach((comment) => {
        if (comment.parent_plan_comment_id == 0) {
          let comment_children = this.allPlanComments?.filter((children) => {
            return children.parent_plan_comment_id == comment.id;
          });

          if(this.companyId != 32 || 
            (this.companyId == 32 && (this.superAdmin || (!this.superAdmin && comment.approved == 1)))
          ) {
            comment_rows.push({
              id: comment.id,
              plan_id: comment.plan_id,
              user_id: comment.user_id,
              comment: comment.comment,
              parent_plan_comment_id: comment.parent_plan_comment_id,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
              deletedAt: comment.deletedAt,
              image: comment.image,
              first_name: comment.first_name,
              last_name: comment.last_name,
              name: comment.name,
              CommentChild: comment_children,
              approved: comment.approved,
            });
          }
        }
      });
    }

    this.planComments = comment_rows;
    this.planComments?.sort((a: any, b: any) => {
      const oldDate: any = new Date(a.createdAt);
      const newDate: any = new Date(b.createdAt);
      return newDate - oldDate;
    });
  }

  getUECreatedBy(created_by) {
    this.createdById = created_by ? created_by.id : "";
    this.createdBy = created_by
      ? `${created_by.first_name} ${created_by.last_name}`
      : "";
    this.createdByImage = `${this.apiPath}/${
      created_by ? created_by.image : "empty_avatar.png"
    }`;
  }

  getEmailTo(invlink: any = "") {
    this._plansService
      .emailTemplate(
        this.companyId,
        this.id,
        this.planTypeId,
        this.userId,
        this.aliasInvLink
      )
      .subscribe(
        (response) => {
          let template = response.template;
          if (template) {
            let txt = document.createElement("div");
            let new_body = decodeURIComponent(template.body);
            txt.innerHTML = new_body;
            let email_body =
              txt && txt?.textContent
                ? encodeURIComponent(txt?.textContent)
                : "";
            this.emailTo = `mailto:recipient@email.com?Subject=${template.subject}&ISO-8859-1&Body=${email_body}`;
            this.whatsAppTemplate = `https://wa.me?text=${email_body}` // `whatsapp://send?text=${email_body}`;
            this.telegramTemplate = `https://telegram.me/share/url?url=${window.location.href}&text=${email_body}`;
          } else {
            if (this.planTypeId == 4) {
              let body = (!this.invitationLinkActive
                ? window.location.href
                : this.user.name +
                  this._translateService.instant(
                    "dialog.hasinvitedyoutooursession"
                  ) +
                  this.plan.title +
                  "! " +
                  this._translateService.instant(
                    "dialog.interestedandwanttocome"
                  ) +
                  invlink +
                  this._translateService.instant("lookingforward"));
              this.emailTo = `mailto:?Subject=Shared Event&Body=${body}`
              this.whatsAppTemplate = `whatsapp://send?text=${body}`
              this.telegramTemplate = `https://telegram.me/share/url?url=${window.location.href}&text=${body}`
            } else {
              this.emailTo = `mailto:?Subject=Inquiries&body=` + window.location.href;
              this.whatsAppTemplate = `whatsapp://send?text=` + window.location.href;
              this.telegramTemplate = `https://telegram.me/share/url?url=${window.location.href}&text=` + window.location.href;
            }
          }
          setTimeout(() => {
            initFlowbite();
          }, 500);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getInviteLink() {
    if (this.invitationLinkActive && this.userId) {
      if (this.customEventRegistrationLanding || this.companyId == 20) {
        this._plansService
          .getInviteLink(
            this.userId,
            this.id,
            this.planTypeId,
            this.aliasInvLink
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (response) => {
              this.invitationLink = response;
            },
            (error) => {
              console.log(error);
            }
          );
      } else {
        this.invitationLink = this.plan.invitation_link;
        let alias = this.user ? this.user.alias : "";
        if (alias) {
          if (this.plan.slug) {
            this.invitationLink =
              "https://" +
              window.location.host +
              "/share/event/" +
              this.plan.slug +
              "/" +
              alias;
          } else {
            this._plansService
              .updatePlanSlug(this.plan.id, this.plan.plan_type_id)
              .pipe(takeUntil(this.destroy$))
              .subscribe(
                (response) => {
                  this.invitationLink =
                    "https://" +
                    window.location.host +
                    "/share/event/" +
                    response.plan.slug +
                    "/" +
                    alias;
                },
                (error) => {
                  console.log(error);
                }
              );
          }
        } else {
          if (this.user) {
            this._plansService
              .updateUserAlias(this.user.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe(
                (response) => {
                  if (this.plan.slug) {
                    this.invitationLink =
                      "https://" +
                      window.location.host +
                      "/share/event/" +
                      this.plan.slug +
                      "/" +
                      response.alias;
                  } else {
                    this._plansService
                      .updatePlanSlug(this.plan.id, this.plan.plan_type_id)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe(
                        (res) => {
                          this.invitationLink =
                            "https://" +
                            window.location.host +
                            "/share/event/" +
                            res.plan.slug +
                            "/" +
                            alias;
                        },
                        (error) => {
                          console.log(error);
                        }
                      );
                  }
                },
                (error) => {
                  console.log(error);
                }
              );
          }
        }
      }
    }
  }

  isUserJoined(planParticipants, eventIndex = 0) {
    if (this.userId) {
      return planParticipants.filter(
        (CompanyPlanParticipants) =>
          CompanyPlanParticipants.user_id == this.userId
      ).length;
    } else {
      return 0;
    }
  }

  checkPendingJoinRequest(pendingRequests, eventIndex = 0) {
    if (pendingRequests) {
      return pendingRequests?.filter(
        (request) => request.fk_user_id == this.userId
      ).length;
    }
  }

  getAddress(plan) {
    let address = plan.address;

    if (this.canAssignMultipleCities && this.activityCities) {
      address = this.activityCities
        .map((data) => {
          return data.city;
        })
        .join(", ");
    }

    return address;
  }

  getEventDescription() {
    let description = this.eventDescription;
    if (this.plan?.zoom_link) {
      description +=
        '<br/> <a href="' +
        this.plan.zoom_link +
        '">' +
        this.plan.zoom_link +
        "</a>";
    }
    if (this.plan?.teams_link) {
      description +=
        '<br/> <a href="' +
        this.plan.teams_link +
        '">' +
        this.plan.teams_link +
        "</a>";
    }
    if (this.plan?.youtube_link) {
      description +=
        '<br/> <a href="' +
        this.plan.youtube_link +
        '">' +
        this.plan.youtube_link +
        "</a>";
    }
    return description;
  }

  async handleRequestJoin() {
    const { id: user_id } = this.user;
    let plan_type = this.planTypeId == 5 ? "company" : "employee";

    if (this.planTypeId == 4) {
      plan_type = "club";
    }

    let payload = {
      plan_id: this.id,
      plan_type,
      user_id,
      company_id: this.user.fk_company_id,
      invited_by: 0,
    };

    if (this.invitationLinkActive) {
      let invitedby = this._localService.getLocalStorage(
        environment.lsinvitedby
      );
      let invited_by = 0;
      let event_id = this._localService.getLocalStorage(
        environment.lseventinvite
      );

      if (event_id == this.id) {
        let user = get(
          await this._userService.getUserById(invitedby).toPromise(),
          "CompanyUser"
        );
        invited_by = user.id;
      }

      if (event_id == this.id && invited_by) {
        payload = {
          plan_id: this.id,
          plan_type,
          user_id,
          company_id: this.user.fk_company_id,
          invited_by: invited_by,
        };
      }
    }

    this.onSubmit = true;
    this._plansService.addJoinRequest(payload).subscribe(
      (response) => {
        if (response) {
          this.pendingRequest = true;
          this.onSubmit = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  async handleJoin() {
    // if (this.requestDNI) {
    //   let user = this.currentUser;
    //   if (!user) {
    //     user = this.user;
    //   }
    //   if (user && !user.dni) {
    //     this.showUpdateDNIModal = true;
    //   } else {
    //     this.proceedJoin();
    //   }
    // } else {
      this.proceedJoin();
    // }
  }

  proceedJoin() {
    if (this.planTypeId == 4) {
      this.joinGroupPlan();
    } else {
      this.joinPlan();
    }
  }

  joinPlan() {
    if(this.userId > 0) {
      if (
        this.activityFeeEnabled &&
        this.plan.stripe_pay == 1 &&
        this.plan.price > 0
      ) {
        let userId = this.userId || 0;
        this._router.navigate([
          `/plans/payment/${this.id}/${this.planTypeId}/${userId}`,
        ]);
      } else {
        this.onSubmit = true;
        this._plansService.addPlanParticipant(this.id, this.user.id).subscribe(
          (response) => {
            this.plan = response.CompanyPlan;
            this.planParticipants = this.plan.CompanyPlanParticipants;
            // this.limitPlanParticipants = this.planParticipants?.length > 9 ? this.planParticipants?.slice(0, 9) : this.planParticipants;
            this.limitPlanParticipants = this.planParticipants;
            this.planParticipantCount = this.plan.CompanyPlanParticipants.length;
            this.joinedParticipant = this.isUserJoined(
              this.plan.CompanyPlanParticipants
            );
            this.onSubmit = false;
          },
          (error) => {
            console.log(error);
          }
        );
      }
    } else {
      this._router.navigate(["/auth/login"]);
    }
  }

  async joinGroupPlan() {
    if(this.userId > 0) {
      if (
        this.activityFeeEnabled &&
        this.plan.stripe_pay == 1 &&
        this.plan.price > 0
      ) {
        let userId = this.userId || 0;
        this._router.navigate([
          `/plans/payment/${this.id}/${this.planTypeId}/${userId}`,
        ]);
      } else {
        const { id: user_id } = this.user;

        const { id: group_plan_id, fk_company_id } = this.plan;

        let payload = {
          group_plan_id,
          fk_company_id: this.companyId,
          user_id,
          invited_by: 0,
        };

        if (this.invitationLinkActive) {
          let invitedby = this._localService.getLocalStorage(
            environment.lsinvitedby
          );
          let invited_by = 0;
          let event_id = this._localService.getLocalStorage(
            environment.lseventinvite
          );

          if (event_id == group_plan_id) {
            let user = get(
              await this._userService.getUserById(invitedby).toPromise(),
              "CompanyUser"
            );
            invited_by = user.id;
          }

          if (event_id == group_plan_id && invited_by > 0) {
            payload = {
              group_plan_id,
              fk_company_id,
              user_id,
              invited_by: invited_by,
            };
          }
        }

        this.onSubmit = true;
        this._plansService.addGroupPlanParticipant(payload).subscribe(
          (response) => {
            this.plan = response.CompanyGroupPlan;
            this.planParticipants = this.plan.Company_Group_Plan_Participants;
            // this.limitPlanParticipants = this.planParticipants?.length > 9 ? this.planParticipants?.slice(0, 9) : this.planParticipants;
            this.limitPlanParticipants = this.planParticipants;
            this.planParticipantCount = this.plan.Company_Group_Plan_Participants.length;
            this.joinedParticipant = this.isUserJoined(this.plan.Company_Group_Plan_Participants);
            this.onSubmit = false;
          },
          (error) => {
            console.log(error);
          }
        );
      }
    } else {
      this._router.navigate(["/auth/login"]);
    }
  }

  handleLeave() {
    if (this.planTypeId == 4) {
      this.leaveGroupPlan();
    } else {
      this.leavePlan();
    }
  }

  leavePlan() {
    this.onSubmit = true;
    this._plansService.removePlanParticipant(this.id, this.user.id).subscribe(
      (response) => {
        let plan_participants = this.planParticipants;
        if (plan_participants?.length > 0) {
          plan_participants.forEach((participant, index) => {
            if (participant.user_id == this.userId) {
              plan_participants.splice(index, 1);
            }
          });
        }
        this.planParticipants = plan_participants;
        // this.limitPlanParticipants = this.planParticipants?.length > 9 ? this.planParticipants?.slice(0, 9) : this.planParticipants;
        this.limitPlanParticipants = this.planParticipants;
        this.planParticipantCount = this.planParticipants?.length;
        this.joinedParticipant = this.isUserJoined(this.planParticipants);
        this.onSubmit = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  leaveGroupPlan() {
    const { id: user_id } = this.user;

    const { id: group_plan_id, fk_company_id } = this.plan;

    const payload = {
      group_plan_id,
      fk_company_id,
      user_id,
    };

    this.onSubmit = true;
    this._plansService.removeGroupPlanParticipant(payload).subscribe(
      (response) => {
        let plan_participants = this.planParticipants;
        if (plan_participants?.length > 0) {
          plan_participants.forEach((participant, index) => {
            if (participant.user_id == this.userId) {
              plan_participants.splice(index, 1);
            }
          });
        }
        this.planParticipants = plan_participants;
        // this.limitPlanParticipants = this.planParticipants?.length > 9 ? this.planParticipants?.slice(0, 9) : this.planParticipants;
        this.limitPlanParticipants = this.planParticipants;
        this.planParticipantCount = this.planParticipants?.length;
        this.joinedParticipant = this.isUserJoined(this.planParticipants);
        this.onSubmit = false;
        this.pendingRequest = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  yourBilling() {
    this._companyService
      .createOtherCustomerPortal(
        this.userId,
        this.companyId,
        this.id,
        "event",
        this.planTypeId,
        {}
      )
      .subscribe(
        (res) => {
          if (res["redirect_url"]) {
            window.open(res["redirect_url"], "_blank");
          }
        },
        (error) => {}
      );
  }

  handleWaitingList() {
    let payload = {
      plan_id: this.id,
      plan_type_id: this.planTypeId,
      user_id: this.user.id,
      company_id: this.user.fk_company_id,
    };

    if (!this.isInWaitingList) {
      this._plansService.addToWaitingList(payload).subscribe(
        (response) => {
          this.isInWaitingList = true;
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this._plansService.removeFromWaitingList(payload).subscribe(
        (response) => {
          this.isInWaitingList = false;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  downloadWaitingList() {
    this._excelService.exportAsExcelFile(this.waitingList, "event-" + this.id);
  }

  getSeatsLabel() {
    let seats;
    if (
      !this.guestMemberSeatActive ||
      (this.guestMemberSeatActive && this.plan.guest_member_seats != 1)
    ) {
      seats = `${this.planParticipantCount} ${
        this.planParticipantCount <= 1
          ? this._translateService.instant("plan-details.attendee")
          : this._translateService.instant("plan-details.attendees")
      }`;
      if (this.seats < 0 && !this.eventDates) {
        seats = this._translateService.instant("plan-details.unlimitedseats");
      }
      return seats;
    } else if (
      this.guestMemberSeatActive &&
      this.plan.guest_member_seats == 1
    ) {
      let memberText = this.membersTitle;

      seats = `${this.planParticipantCount} ${
        this.planParticipantCount <= 1
          ? this._translateService.instant("plan-details.attendee")
          : this._translateService.instant("plan-details.attendees")
      }: ${this.memberParticipants.length} ${memberText}`;
      seats +=
        ", " +
        this.guestParticipants.length +
        " " +
        (this.guestParticipants.length <= 1
          ? this._translateService.instant("plan-details.guest")
          : this._translateService.instant("plan-details.guests"));
    }

    return seats;
  }

  showAddNewLink() {
    this.isAddNewLink = true;
  }

  sendEmailInvite() {
    this.modalbutton?.nativeElement.click();
  }

  goToLink(link) {
    window.open(link, "_blank");
  }

  shareByWhatsApp(link) {
    window.open(link, "_blank");
  }

  shareByTelegram(link) {
    window.open(link, "_blank");
  }

  async copyText() {
    this.getInvitationLink();
  }

  async getInvitationLink() {
    if (this.planTypeId == 4) {
      if ((this.companyId == 12 || this.invitationLinkActive) && this.userId) {
        if (this.customEventRegistrationLanding || this.companyId == 20) {
          let invite_link = get(
            await this._plansService
              .getInviteLink(
                this.userId,
                this.id,
                this.planTypeId,
                this.aliasInvLink
              )
              .toPromise(),
            "invite_link"
          );
          this.invitationLink = invite_link;
          this.copyToClipboard();
        } else {
          this.invitationLink = this.plan.invitation_link;
          let alias = this.user ? this.user.alias : "";
          if (this.companyId == 12) {
            this.user = this.user;
            alias = this.user.alias;
          }
          if (alias) {
            if (this.plan.slug) {
              if (this.companyId == 12) {
                this.invitationLink =
                  "https://" +
                  window.location.host +
                  "/event/" +
                  this.plan.slug +
                  "/" +
                  alias;
              } else {
                this.invitationLink =
                  "https://" +
                  window.location.host +
                  "/share/event/" +
                  this.plan.slug +
                  "/" +
                  alias;
              }
              this.copyToClipboard();
            } else {
              this._plansService
                .updatePlanSlug(this.plan.id, this.plan.plan_type_id)
                .subscribe(
                  (response) => {
                    if (this.companyId == 12) {
                      this.invitationLink =
                        "https://" +
                        window.location.host +
                        "/share/event/" +
                        response.plan.slug +
                        "/" +
                        alias;
                    } else {
                      this.invitationLink =
                        "https://" +
                        window.location.host +
                        "/" +
                        response.plan.slug +
                        "/" +
                        alias;
                    }
                    this.copyToClipboard();
                  },
                  (error) => {
                    console.log(error);
                  }
                );
            }
            if (this.companyId == 12) {
              this.getUserAliases(this.userAliases);
              this.copyToClipboard();
            }
          } else {
            if (this.user) {
              this._plansService.updateUserAlias(this.user.id).subscribe(
                (response) => {
                  if (this.plan.slug) {
                    if (this.companyId == 12) {
                      this.invitationLink =
                        "https://" +
                        window.location.host +
                        "/" +
                        this.plan.slug +
                        "/" +
                        response.alias;
                    } else {
                      this.invitationLink =
                        "https://" +
                        window.location.host +
                        "/share/event/" +
                        this.plan.slug +
                        "/" +
                        response.alias;
                    }
                    this.copyToClipboard();
                  } else {
                    this._plansService
                      .updatePlanSlug(this.plan.id, this.plan.plan_type_id)
                      .subscribe(
                        (res) => {
                          if (this.companyId == 12) {
                            this.invitationLink =
                              "https://" +
                              window.location.host +
                              "/" +
                              res.plan.slug +
                              "/" +
                              alias;
                          } else {
                            this.invitationLink =
                              "https://" +
                              window.location.host +
                              "/share/event/" +
                              res.plan.slug +
                              "/" +
                              alias;
                          }
                          this.copyToClipboard();
                        },
                        (error) => {
                          console.log(error);
                        }
                      );
                  }
                  if (this.companyId == 12) {
                    this.getUserAliases(this.userAliases);
                    this.copyToClipboard();
                  }
                },
                (error) => {
                  console.log(error);
                }
              );
            }
          }
        }
      }
    } else {
      if (this.invitationLinkActive && this.userId) {
        if (this.customEventRegistrationLanding || this.companyId == 20) {
          let invite_link = get(
            await this._plansService
              .getInviteLink(
                this.userId,
                this.id,
                this.planTypeId,
                this.aliasInvLink
              )
              .toPromise(),
            "invite_link"
          );
          this.invitationLink = invite_link;
          this.copyToClipboard();
        } else {
          this.invitationLink = this.plan.invitation_link;
          let alias = this.user ? this.user.alias : "";
          if (alias) {
            if (this.plan.slug) {
              this.invitationLink =
                "https://" +
                window.location.host +
                "/share/event/" +
                this.plan.slug +
                "/" +
                alias;
              this.copyToClipboard();
            } else {
              this._plansService
                .updatePlanSlug(this.plan.id, this.plan.plan_type_id)
                .subscribe(
                  (response) => {
                    this.invitationLink =
                      "https://" +
                      window.location.host +
                      "/share/event/" +
                      response.plan.slug +
                      "/" +
                      alias;
                    this.copyToClipboard();
                  },
                  (error) => {
                    console.log(error);
                  }
                );
            }
          } else {
            if (this.user) {
              this._plansService.updateUserAlias(this.user.id).subscribe(
                (response) => {
                  if (this.plan.slug) {
                    this.invitationLink =
                      "https://" +
                      window.location.host +
                      "/share/event/" +
                      this.plan.slug +
                      "/" +
                      response.alias;
                    this.copyToClipboard();
                  } else {
                    this._plansService
                      .updatePlanSlug(this.plan.id, this.plan.plan_type_id)
                      .subscribe(
                        (res) => {
                          this.invitationLink =
                            "https://" +
                            window.location.host +
                            "/share/event/" +
                            res.plan.slug +
                            "/" +
                            alias;
                          this.copyToClipboard();
                        },
                        (error) => {
                          console.log(error);
                        }
                      );
                  }
                },
                (error) => {
                  console.log(error);
                }
              );
            }
          }
        }
      }
    }
  }

  copyToClipboard() {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";

    let link = !this.invitationLinkActive
      ? window.location.href
      : this.invitationLink;
    selBox.value = link;

    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);

    this.open(this._translateService.instant("dialog.copiedlink"), "");
  }

  copyLink(link) {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = link;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);

    this.open(this._translateService.instant("dialog.copiedlink"), "");
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  getReactions(child) {
    return this.planReactions?.filter((pr) => {
      return pr.fk_plan_comment_id == child.id;
    });
  }

  addComment() {
    if (this.planTypeId == 4) {
      this.addGroupPlanComment();
    } else {
      this.addPlanComment();
    }
  }

  addPlanComment() {
    const value = this.comment;
    this.commentError = "";
    if (!this.comment) {
      this.commentError = this._translateService.instant(
        "plan-details.pleaseenteravalue"
      );
    } else {
      this.onSubmit = true;
      let approved = this.companyId == 32 ? (this.superAdmin ? 1 : 0) : 1;
      this._plansService
        .addPlanComment(this.plan.id, this.user.id, this.comment, approved, this.companyId)
        .subscribe(
          (response) => {
            this.comment = "";
            this.onSubmit = false;
            this.refreshComments();
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  addGroupPlanComment() {
    const value = this.comment;
    this.commentError = "";
    if (!this.comment) {
      this.commentError = this._translateService.instant(
        "plan-details.pleaseenteravalue"
      );
    } else {
      this.onSubmit = true;
      let approved = this.companyId == 32 ? (this.superAdmin ? 1 : 0) : 1;
      this._plansService
        .addGroupPlanComment(this.plan.id, this.user.id, this.comment, approved, this.companyId)
        .subscribe(
          (response) => {
            this.comment = "";
            this.onSubmit = false;
            this.refreshComments();
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  refreshComments() {
    this._plansService
      .getGroupPlanComments(this.id, this.planTypeId)
      .subscribe(async (response) => {
        if (this.planTypeId == 4) {
          this.planComments = response.CompanyGroupPlanComments.filter(
            (data) => {
              data.comment = data.comment.replaceAll("\n", "<br/>");
              if (data.CommentChild && data.CommentChild.length > 0) {
                data.CommentChild.filter((data) => {
                  data.comment = data.comment.replaceAll("\n", "<br/>");
                });
              }

              let visible = false;
              if(this.companyId == 32) {
                if(this.superAdmin) {
                  visible = true;
                } else {
                  visible = data?.approved == 1 ? true : false
                }
              } else {
                visible = true;
              }

              return data;
            }
          );
        } else {
          this.planComments = response.CompanyPlanComments.filter((data) => {
            data.comment = data.comment.replaceAll("\n", "<br/>");
            if (data.CommentChild && data.CommentChild.length > 0) {
              data.CommentChild.filter((data) => {
                data.comment = data.comment.replaceAll("\n", "<br/>");
              });
            }

            let visible = false;
            if(this.companyId == 32) {
              if(this.superAdmin) {
                visible = true;
              } else {
                visible = data?.approved == 1 ? true : false
              }
            } else {
              visible = true;
            }
            
            return data && visible;
          });
        }

        if(this.companyId == 32 && !this.superAdmin) {
          this.showDoneForApprovalModal();
        }
      });
  }

  showDoneForApprovalModal(id: number = 0) {
    this.confirmMode = 'add-comment';
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "create-content.done"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "create-content.desc"
    );
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  checkHeartReaction(comment) {
    let reactions = this.planReactions?.filter((pr) => {
      return pr.fk_plan_comment_id == comment.id;
    });
    let hasReacted = false;
    if (reactions) {
      reactions.forEach((react) => {
        if (react.fk_user_id == this.userId) {
          hasReacted = true;
        }
      });
    }

    return hasReacted;
  }

  toggleChildComment(id) {
    this.showChildComment = true;
    this.selectedCommentId = id;
  }

  toggleHeart(comment, state) {
    this.selectedCommentId = comment.id;
    this.heartComment = state;

    if (state == false) {
      let param = {
        userId: this.userId,
      };
      this._plansService
        .deleteGroupPlanCommentHeart(comment.id, this.planTypeId, param)
        .subscribe(
          (data) => {
            let plan_reactions = this.planReactions;
            if (plan_reactions?.length > 0) {
              plan_reactions.forEach((reaction, index) => {
                if (
                  reaction.fk_plan_comment_id == comment.id &&
                  reaction.fk_user_id == this.userId
                ) {
                  plan_reactions.splice(index, 1);
                }
              });
            }
            this.planReactions = plan_reactions;
          },
          async (err) => {
            console.log(err);
          }
        );
    } else {
      let param = {
        userId: this.userId,
        heart: 1,
      };
      this._plansService
        .heartGroupPlanComment(comment.id, this.planTypeId, param)
        .subscribe(
          (data) => {
            let plan_reactions = this.planReactions;
            plan_reactions.push({
              id:
                this.planTypeId == 4
                  ? data.group_plan_comment_reaction.id
                  : data.plan_comment_reaction.id,
              fk_user_id:
                this.planTypeId == 4
                  ? data.group_plan_comment_reaction.fk_user_id
                  : data.plan_comment_reaction.fk_user_id,
              fk_plan_comment_id:
                this.planTypeId == 4
                  ? data.group_plan_comment_reaction.fk_group_plan_comment_id
                  : data.plan_comment_reaction.fk_plan_comment_id,
              heart:
                this.planTypeId == 4
                  ? data.group_plan_comment_reaction.heart
                  : data.plan_comment_reaction.heart,
              created:
                this.planTypeId == 4
                  ? data.group_plan_comment_reaction.created
                  : data.plan_comment_reaction.created,
            });
            this.planReactions = plan_reactions;
          },
          async (err) => {
            console.log(err);
          }
        );
    }
  }

  formatDate(value) {
    if (value) {
      const date = new Date(value);
      if (typeof date == "object") {
        const formatted = moment(date).format("MMM DD, YYYY, hh:mm A");
        return formatted;
      }
    }
    return value;
  }

  confirmDeleteComment(comment) {
    this.showConfirmationModal = false;
    this.selectedItem = comment;
    this.confirmMode = "comment";
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteitem"
    );
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  deleteComment(id, planTypeId, confirmed) {
    if (confirmed) {
      this._plansService.deleteActivityComment(id, planTypeId).subscribe(
        (response) => {
          this.selectedItem = "";
          this.confirmMode = "";
          this.refreshComments();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  addChildComment(comment) {
    const value = this.childComment;
    if (this.childComment) {
      let param = {
        userId: this.userId,
        groupPlanId: this.id,
        comment: this.childComment,
        companyId: this.companyId,
      };
      this._plansService
        .addGroupPlanCommentReply(comment.id, this.planTypeId, param)
        .subscribe(
          (data) => {
            this.childComment = "";
            this.showChildComment = false;
            this.refreshComments();
          },
          async (err) => {
            console.log(err);
          }
        );
    }
  }

  confirm() {
    if(this.confirmMode == 'comment') {
      this.deleteComment(this.selectedItem.id, this.planTypeId, true);
      this.showConfirmationModal = false;
    } else if(this.confirmMode == 'plan') {
      this.deletePlan(this.id, this.planTypeId, true, 0)
    } else if(this.confirmMode == 'add-comment') {
      this.showConfirmationModal = false;
    }
  }

  deletePlan(id, planTypeId, confirmed, editRepeatEventType: any = 0) {
    if(confirmed) {
      this._plansService.deletePlan(id, planTypeId)
        .subscribe(
          response => {
            this.confirmMode = "";
            this.onSubmit = false
            if(editRepeatEventType == 2) {
              this.deleteRecurringSeries(id, planTypeId)
            } else {
              this.goToPreviousScreen()
            }
          },
          error => {
            console.log(error)
          }
        )
    } else {
      this.onSubmit = false
    }
  }

  deleteRecurringSeries(id, planTypeId) {
    let params = {
      plan_id: id,
      plan_type_id: planTypeId,
      repeat_event: this.plan.repeat_event,
      parent_event_id: this.plan.parent_event_id,
    }
    this._plansService.deleteRecurringPlan(params)
      .subscribe(
        response => {
          this.onSubmit = false
          this.goToPreviousScreen('delete')
        },
        error => {
          console.log(error)
        }
      )
  }

  goToPreviousScreen(mode: string = '') {
    if(mode == 'delete') {
      location.href = '/plans'
    } else {
      this._router.navigate(['/plans'])
    }  
  }

  handleCloseInvite() {
    this.emailInviteFormSubmitted = true;
    let answers = this.emailInviteQuestions;
    let incomplete = false;
    let hasYes = false;
    for (const question of answers) {
      let answer = question.answer;

      if (answer === undefined) {
        answer = null;
      }

      if (!answer) {
        incomplete = true;
      } else {
        let q = question.options.filter((o) => {
          return o.id == question.answer;
        });
        if (q && q[0]) {
          if (q[0].option == "Sí") {
            hasYes = true;
          }
        }
      }
    }

    if (incomplete) {
      return false;
    }

    if (hasYes) {
      let params = {
        company_id: this.companyId,
        event_id: this.id,
        event_type_id: this.planTypeId,
        user_id: this.userId || 0,
        answers: answers,
        aliasInvLink: this.aliasInvLink,
      };

      this._plansService.answerEmailInviteQuestion(params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.sentsuccessfully"),
            ""
          );
        },
        (error) => {
          console.log(error);
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    }
  }

  async duplicate() {
    this.plan.category_id = this.plan.event_category_id || this.plan.Company_Supercategories
    this.plan.subcategory_id = this.plan.event_subcategory_id || null
    this.plan.company_id = this.companyId
    this.plan.medical = 0
    this.plan.title = this.plan.title
    this.plan.link = this.plan.link || ''
    this.plan.time_slot = null
    this.plan.privacy = this.plan.private
    this.plan.require_approval = 0
    if(this.canAssignMultipleCities) {
        let activity_cities = get(await this._plansService.getActivityCities(this.id, this.planTypeId).toPromise(), 'activity_cities')
        if(activity_cities && activity_cities.length > 0) {
            let cities: any[] = []
            activity_cities.forEach(ct => {
                cities.push({
                    id: ct.city_id
                })
            })
            this.plan['city_id'] = cities
        }
        this.plan['multiple_cities'] = this.canAssignMultipleCities && activity_cities.length > 1 ? 1 : 0
    }

    if(this.plan.plan_date) { 
      this.plan.plan_datetime = this.plan.plan_date;
      this.plan.plan_date = moment(this.plan.plan_date).format('YYYY-MM-DD HH:mm');
    } 
    if(this.plan.end_date) { 
      this.plan.end_datetime = this.plan.end_date;
      this.plan.end_date = moment(this.plan.end_date).format('YYYY-MM-DD HH:mm'); 
    } 
    this.plan.slug = `${this.plan.slug}-${this.getTimestamp()}`;
    this.plan.school_of_life = this.isUESchoolOfLife || 0;
    
    this._plansService.createPlan(
        this.companyId,
        this.userId,
        this.planTypeId,
        this.plan,
        null,
        this.plan.image,
        '',
        '',
        '',
        '',
        '',
        '',
        0,
        0,
        0,
        this.plan.show_attendee,
        this.plan.show_comments,
        this.plan.show_description,
        this.plan.show_price,
        0,
        ''
    ).subscribe(
        response => {
            if(response) {
                this._router.navigate([`/plans/edit/${response.id}/${this.planTypeId}`])
            } else {
                this.showError = true
                this.issaving = false
            }
        },
        error => {
            console.log(error)
        }
    )
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  handleEditRoute() {
    this._router.navigate([`/plans/edit/${this.id}/${this.planTypeId}`]);
  }

  handleDelete() {
    if(this.id) {
      this.showConfirmationModal = false;
      this.selectedItem = this.id;
      this.confirmMode = "plan";
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmdelete"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmdeleteitem"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  readMore() {
    this.planExpandedDescription = true;
    this.planTruncatedDescription = this.planDescription;
  }

  showLess() {
    this.planExpandedDescription = false;
    if(this.planDescription?.length > this.truncate) {
      this.planTruncatedDescription = this.getExcerpt(this.planDescription);
    } else {
      this.planTruncatedDescription = this.planDescription;
    }
  }

  handleGoBack() {
    this._location.back();
  }

  toggleDuplicateHover(event) {
    this.duplicateHover = event;
  }

  toggleEditHover(event) {
    this.editHover = event;
  }

  toggleDeleteHover(event) {
    this.deleteHover = event;
  }

  toggleJoinHover(event) {
    this.joinHover = event;
  }

  toggleLeaveHover(event) {
    this.leaveHover = event;
  }

  toggleAddCommentHover(event) {
    this.addCommentHover = event;
  }

  toggleAddCalendarHover(event) {
    this.addCalendarHover = event;
  }

  goToMemberProfilePage(member) {
    if(this.hasMembers && member?.password) {
      this._router.navigate([`/members/details/${member?.fk_user_id}`])
    }
  }

  linkAction(action, id = null) {
    this.aliasId = id
    
    if (
      this.newLink
      && action === 'add'
    ) {
      let match = this.additionalInvitationLinks.some(a => a.link === this.newLink);

      if (!match) {
        let payload = {
          user_id: this.userId,
          alias: this.newLink,
        }

        this._plansService.addAdditionalAlias(payload)
        .subscribe(
          (data: any) => {
            let aliases = data.alias;
            if (aliases) {
              this.additionalInvitationLinks = [];
              aliases.forEach(data => {
                const { alias, id } = data
                this.additionalInvitationLinks.push({
                  link: alias,
                  aliasId: id,
                  isEditLink: false
                })
              });
            }
            this.newLink = '';
            this.isAddNewLink = false;
          },
          error => {
        });
      }
    }

    if (
      this.editLink
      && action === 'edit'
    ) {
      let match = this.additionalInvitationLinks.some(a => a.link === this.editLink);

      if (!match) {
        let payload = {
          user_id: this.userId,
          alias: this.editLink,
        }

        this._plansService.editAlias(payload, this.aliasId)
        .subscribe(
            (data: any) => {
              let aliases = data.alias;
              if (aliases) {
                this.additionalInvitationLinks = [];

                aliases.forEach(data => {
                  const { alias, id } = data
                  this.additionalInvitationLinks.push({
                    link: alias,
                    aliasId: id,
                    isEditLink: false
                  })
                });
              }
              this.editLink = '';
            },
            error => {

            });
      }
    }

    if (action === 'delete') {
      let payload = {
        user_id: this.userId
      }

      this._plansService.deleteAlias(payload, this.aliasId)
        .subscribe(
          (data: any) => {
            let aliases = data.alias;
            if (aliases) {
              this.additionalInvitationLinks = [];

              aliases.forEach(data => {
                const { alias, id } = data

                this.additionalInvitationLinks.push({
                  link: alias,
                  aliasId: id,
                  isEditLink: false
                })
              });
            }
          },
          error => {

          });

    }
  }

  showEditLink(action, id = null) {
    this.additionalInvitationLinks.map(data => {
      if ( action === 'show' ) {
        if(data.aliasId == id) {
          this.editLink = data.link
        }
        return data.isEditLink = data.aliasId === id
      }
          
      return data.isEditLink = false
    })
    
    

    if ( action === 'hide' ) {
      this.editLink = '';
    }
  }

  hideAdd() {
    this.isAddNewLink = false;
  } 

  approveComment(comment) {
    if(this.planTypeId == 4) {
      this._plansService.approveGroupPlanComment(comment.id)
      .subscribe(
        (data: any) => {
          this.open(this._translateService.instant('company-settings.approved'), '');
          this.refreshComments();
        },
        error => {
      });
    } else {
      this._plansService.approvePlanComment(comment.id)
      .subscribe(
        (data: any) => {
          this.open(this._translateService.instant('company-settings.approved'), '');
          this.refreshComments();
        },
        error => {
      });
    }
  }
  
  handleEditorInit(e) {
    setTimeout(() => {
      if (this.editor && this.iframeEventDescription && this.eventDescription) {
        this.editor.nativeElement.style.display = 'block'
        e.editor.setContent(this.eventDescription)
        this.iframeEventDescription.nativeElement.style.height = `${e.editor.container.clientHeight + 200}px`
        this.editor.nativeElement.style.display = 'none'
        this.iframeEventDescription.nativeElement.src =
            'data:text/html;charset=utf-8,' +
            '<html>' +
            '<head>' + e.editor.getDoc().head.innerHTML + '<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins" /><style>* {font-family: "Poppins", sans-serif;}</style></head>' +
            '<body>' + e.editor.getDoc().body.innerHTML + '</body>' +
            '</html>';
        this.iframeEventDescription.nativeElement.style.display = 'block'
      }
    }, 500)
  }

  openInstructionReference() {
    window.open("https://www.indeed.com/career-advice/career-development/how-to-get-email-links-to-open-in-chrome", "_blank");
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}