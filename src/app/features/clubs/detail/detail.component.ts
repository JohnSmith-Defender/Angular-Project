import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  SecurityContext,
  ChangeDetectorRef,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { ClubsService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import {
  BreadcrumbComponent,
  CommentsComponent,
  ListShowcaseComponent,
  PageTitleComponent,
  ToastComponent,
} from "@share/components";
import { LocalService, CompanyService, ExcelService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SafeContentHtmlPipe } from "@lib/pipes";
import { FormsModule } from "@angular/forms";
import { GroupFeedComponent } from "@share/components/group/feed/feed.component";
import { initFlowbite } from "flowbite";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-clubs-detail",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    SafeContentHtmlPipe,
    ToastComponent,
    ListShowcaseComponent,
    PageTitleComponent,
    CommentsComponent,
    GroupFeedComponent,
  ],
  templateUrl: "./detail.component.html",
})
export class ClubDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  apiPath: string = environment.api;
  comment;
  emailDomain;
  group: any = [];
  groupPlans: any = [];
  showGroupPlans: any = [];
  isLoading: boolean = true;
  isPageLoading: boolean = true;
  showViewToggle: boolean = false;
  showPaginate: boolean = false;
  groupMemberCount;
  imgSrc: string = environment.api + "/get-image-group/";
  planImgSrc: string = environment.api + "/get-image-group-plan/";
  url;
  user;
  createdBy: any = "";
  emailTo: any;
  p: any;
  joinedMember;
  groupOwner: boolean = false;
  canCreate: boolean = false;
  language: any;
  userEmailDomain: any;
  whatsAppLink: any;
  facebook: any;
  showOption: boolean = false;
  showAction: boolean = false;
  showChildComment: boolean = false;
  selectedCommentId: any;
  heartComment: boolean = false;
  childComment: any;
  modal: any;
  userId: any;
  companyId: any;
  errorMessage: any;
  mode: any;

  activities: any;
  subcategories: any;
  isNotGroupArea: boolean = false;
  members: any;
  pendingRequest: any;
  pendingRejected: boolean = false;
  showAll: boolean = false;

  features: any;
  pageName: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  groupSubcategory: any;

  commentError: any = "";
  CompanyGroupComments: any;
  locale: any;

  hasActivityFeed: boolean = false;
  otherSettings: any;

  subfeatures: any;
  hasSubgroups: boolean = false;
  parentGroup: any = "";
  groups: any = [];
  subgroups: any = [];
  parentGroupName: any;

  groupTitle: any = "";
  groupDescription: any = "";
  planTitle: any = "";
  subgroupsTitle: any = "";
  showTermsAndConditionsModal: boolean = false;
  termsAndConditions: any = "";
  termsAndConditionsEn: any = "";
  termsAndConditionsFr: any = "";
  joinType: any = "";
  shouldAcceptTerms: boolean = false;
  admin1: boolean = false;
  admin2: boolean = false;
  superAdmin: boolean = false;
  roles: any = [];
  featureDescription: any;
  groupFeatureDescription: any;
  telegramLink: any;
  privacyPolicy: any;
  privacyPolicyEn: any;
  privacyPolicyFr: any;
  cookiePolicy: any;
  cookiePolicyEn: any;
  cookiePolicyFr: any;
  canShowTermsAndConditions: boolean = false;
  canShowPrivacyPolicy: boolean = false;
  canShowCookiePolicy: boolean = false;
  termsAndConditionsURL: any;
  termsAndConditionsURLEn: any;
  termsAndConditionsURLFr: any;
  privacyPolicyURL: any;
  privacyPolicyURLEn: any;
  privacyPolicyURLFr: any;
  cookiePolicyURL: any;
  cookiePolicyURLEn: any;
  cookiePolicyURLFr: any;
  acceptTermsAndConditions: boolean = false;
  acceptPrivacyPolicy: boolean = false;
  acceptCookiePolicy: boolean = false;
  clubFeature: any;
  createdByImage: any;
  hasContactDetails: boolean = true;
  allContactFields: any = [];
  allContactFieldsMapping: any = [];
  contactDetailsFields: any = [];
  featureId: any;
  hasCustomMemberTypeSettings: boolean = false;
  allGroupPlans: any = [];
  activeGroupPlans: any = [];
  isGuest: boolean = false;
  membersTitle: any;
  blockResponseToComments: boolean = false;
  hasMemberAccess: boolean = false;
  showPastEvents: boolean = false;
  isRecurringActive: boolean = false;
  isOrderActive: boolean = false;
  recurringDisplayDays: any;
  orderSetting: any;
  meGroupIds: any = [];
  courses: any = [];
  groupShow: any = false;
  courseCategoriesAccessRoles: any = [];
  courseCategoryMapping: any = [];
  planFeatureId: any;
  hasPlans: boolean = false;
  userRoles: any;
  groupSubcategories: any;
  company: any;
  companyName: any;
  clubsData: any = [];
  categories: any = [];
  showcaseList: any = [];
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  title: any;
  clubTruncatedDescription: any;
  clubExpandedDescription: boolean = false;
  truncate: number = 500;
  categoryLabel: string = "";
  clubCategoryMapping: any;
  limitMembers: any;
  editHover: boolean = false;
  deleteHover: boolean = false;
  joinHover: boolean = false;
  leaveHover: boolean = false;
  clubMembers: any[] = [];
  hasMembers: boolean = false;

  hasGroupChat: boolean = false;
  showChat: boolean = false;
  commentsList: any = [];
  newComment: any = '';
  showComments: boolean = false;
  
  isGroupWallActive: boolean = false;
  tabTitleText: any;
  activeMenu: any = 'General';
  imageSrc: string = environment.api +  '/';
  childNotifier: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _clubsService: ClubsService,
    private _companyService: CompanyService,
    private _excelService: ExcelService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.url = this._router.url.substring(
      this._router.url.lastIndexOf("/") + 1
    );
    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
    this._translateService.use(this.language || "es");

    this.emailDomain = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
      this.emailDomain = company[0].domain;
      this.companyId = company[0].id;
      this.companyName = company[0].entity_name;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.hoverColor = company[0].hover_color
        ? company[0].hover_color
        : company[0].primary_color;
      this.termsAndConditions = company[0].job_terms_and_conditions;
      this.termsAndConditionsEn = company[0].job_terms_and_conditions_en;
      this.termsAndConditionsFr = company[0].job_terms_and_conditions_fr;
      this.privacyPolicy = company[0].policy;
      this.privacyPolicyEn = company[0].policy_en;
      this.privacyPolicyFr = company[0].policy_fr;
      this.cookiePolicy = company[0].cookie_policy;
      this.cookiePolicyEn = company[0].cookie_policy_en;
      this.cookiePolicyFr = company[0].cookie_policy_fr;
      this.canShowTermsAndConditions =
        company[0].show_terms == 1 ? true : false;
      this.canShowPrivacyPolicy =
        company[0].show_privacy_policy == 1 ? true : false;
      this.canShowCookiePolicy =
        company[0].show_cookie_policy == 1 ? true : false;
      this.termsAndConditionsURL = company[0].terms_and_conditions_url;
      this.privacyPolicyURL = company[0].privacy_policy_url;
      this.privacyPolicyURLEn = company[0].privacy_policy_url_en;
      this.privacyPolicyURLFr = company[0].privacy_policy_url_fr;
      this.cookiePolicyURL = company[0].cookie_policy_url;
      this.cookiePolicyURLEn = company[0].cookie_policy_url_en;
      this.cookiePolicyURLFr = company[0].cookie_policy_url_fr;
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

    this.getClub();
  }

  getClub() {
    this._clubsService
      .fetchClub(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.clubsData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.clubsData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data);
    this.mapUserPermissions(
      data?.user_permissions,
      data?.club_presidents_mapping
    );
    this.categories = data?.club_categories;
    this.subcategories = this.companyId == 12 ? data?.kcn_club_subcategories : data?.club_subcategories;
    this.clubCategoryMapping =  this.mapCategories(data?.club_category_mapping);
    this.formatClub(
      data?.club,
      data?.club_comments,
      data?.club_members,
      data?.pending_requests,
      data?.user_permissions?.user,
      data?.user_permissions?.created_by_ue
    );
    this.getTitles();
    this.initializeBreadcrumb();
    this.getAllClubMembers();
  }

  mapFeatures(features) {
    this.clubFeature = features?.find((f) => f.feature_id == 5);
    this.featureId = this.clubFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.clubFeature);

    let plansFeature = features?.find(
      (f) => f.feature_id == 1 && f.status == 1
    );
    this.planTitle = plansFeature ? this.getFeatureTitle(plansFeature) : "";

    let membersFeature = features?.find(
      (f) => f.feature_id == 15 && f.status == 1
    );
    this.hasMemberAccess = membersFeature ? true : false;
    this.membersTitle = membersFeature
      ? this.getFeatureTitle(membersFeature)
      : "";
  }

  mapSubfeatures(data) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.showPastEvents = subfeatures.some(
        (a) => a.name_en == "Past" && a.active == 1
      );
      this.isRecurringActive = subfeatures.some(
        (a) => a.name_en == "Recurring" && a.active == 1
      );
      this.isOrderActive = subfeatures.some(
        (a) => a.name_en == "Order" && a.active == 1
      );
      this.hasSubgroups = subfeatures.some(
        (a) => a.name_en == "Subgroups" && a.active == 1
      );
      this.shouldAcceptTerms = subfeatures.some(
        (a) => a.name_en == "Accept terms" && a.active == 1
      );
      this.hasContactDetails = subfeatures.some(
        (a) => a.name_en == "Contact details" && a.active == 1
      );
      this.blockResponseToComments = subfeatures.some(
        (a) => a.name_en == "Block response to comments" && a.active == 1
      );
      this.hasGroupChat = subfeatures.some(
        (a) => a.name_en == 'Group chat' && a.active == 1
      );
      this.isGroupWallActive = subfeatures.some(
        (a) => a.name_en == 'Group wall' && a.active == 1
      );

      if(this.hasGroupChat) {
        this.initializeCommentsList();
      }
    }

    localStorage.setItem("show_past_events", this.showPastEvents ? "1" : "0");
    localStorage.setItem("recurring", this.isRecurringActive ? "1" : "0");
    if (this.hasContactDetails) {
      this.contactDetailsFields = data?.contact_details;
    }
    if (this.hasSubgroups) {
      this.mapSubgroupTitles(data?.subgroup_titles);
      this.groups = data?.clubs;
      this.subgroups = data?.subgroups;
    }
  }

  mapUserPermissions(user_permissions, club_presidents_mapping) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 5
      );

    if (this.companyId == 32 && this.user?.custom_member_type_id == 60) {
      this.groupOwner =
        this.group.fk_user_id != this.userId ? false : this.groupOwner;
      if (!this.groupOwner) {
        this.mapClubPresidents(club_presidents_mapping);
      }
    }
  }

  mapClubPresidents(club_presidents_mapping) {
    let club = club_presidents_mapping?.filter((club) => {
      return club.user_id == this.userId && club.club_id == this.group.id;
    });
    if (club && club[0]) {
      this.groupOwner = true;
    }
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

  mapSubgroupTitles(subgroup_titles) {
    if (subgroup_titles) {
      this.subgroupsTitle =
        this.language == "en"
          ? subgroup_titles.title_en || subgroup_titles.title_es
          : this.language == "fr"
          ? subgroup_titles.title_fr || subgroup_titles.title_es
          : subgroup_titles.title_es;
    }
  }

  getTitles() {
    this.pageName = this.clubFeature
      ? this.language == "en"
        ? this.clubFeature.name_en ||
          this.clubFeature.feature_name ||
          this.clubFeature.name_es ||
          this.clubFeature.feature_name_ES
        : this.language == "fr"
        ? this.clubFeature.name_fr ||
          this.clubFeature.feature_name_FR ||
          this.clubFeature.name_es ||
          this.clubFeature.feature_name_ES
        : this.language == "eu"
        ? this.clubFeature.name_eu ||
          this.clubFeature.feature_name_EU ||
          this.clubFeature.name_es ||
          this.clubFeature.feature_name_ES
        : this.language == "ca"
        ? this.clubFeature.name_ca ||
          this.clubFeature.feature_name_CA ||
          this.clubFeature.name_es ||
          this.clubFeature.feature_name_ES
        : this.language == "de"
        ? this.clubFeature.name_de ||
          this.clubFeature.feature_name_DE ||
          this.clubFeature.name_es ||
          this.clubFeature.feature_name_ES
        : this.clubFeature.name_es || this.clubFeature.feature_name_ES
      : "";

    if (this.group) {
      this.groupTitle =
        this.language == "en"
          ? this.group.title_en || this.group.title
          : this.language == "fr"
          ? this.group.title_fr || this.group.title
          : this.language == "eu"
          ? this.group.title_eu || this.group.title
          : this.language == "ca"
          ? this.group.title_ca || this.group.title
          : this.language == "de"
          ? this.group.title_de || this.group.title
          : this.group.title;
      this.groupDescription =
        this.language == "en"
          ? this.group.description_en || this.group.description
          : this.language == "fr"
          ? this.group.description_fr || this.group.description
          : this.language == "eu"
          ? this.group.description_eu || this.group.description
          : this.language == "ca"
          ? this.group.description_ca || this.group.description
          : this.language == "de"
          ? this.group.description_de || this.group.description
          : this.group.description;
      this.title = this.groupTitle;

      // Get excerpt
      if(this.groupDescription && this.groupDescription.length > this.truncate) {
        this.clubTruncatedDescription = this.getExcerpt(this.groupDescription);
      } else {
        this.clubTruncatedDescription = this.groupDescription;
      }

      if (
        this.groupDescription &&
        this.groupDescription.indexOf("[canva]") >= 0
      ) {
        var index = this.groupDescription.indexOf("[canva]");
        var endIndex = this.groupDescription.indexOf("[/canva]");
        var linkLength = endIndex - index;
        var link = this.groupDescription.substr(index + 7, linkLength - 7);
        if (
          link &&
          link.indexOf("canva.com") >= 0 &&
          link.indexOf("/watch?embed") < 0
        ) {
          link = link.replace("/watch", "/watch?embed");
        }

        let iframeHtml = `<iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;" src="${link}" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe>`;
        let desc = this.groupDescription.replace(link, "");
        desc = desc.replace(
          /\[canva\]/g,
          '<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;border-radius: 8px; will-change: transform;">' +
            iframeHtml
        );
        desc = desc.replace(/\[\/canva\]/g, "</div>");
        this.groupDescription = desc;
      }

      if (
        this.groupDescription &&
        this.groupDescription.indexOf("[vidalytics]") >= 0
      ) {
        var index = this.groupDescription.indexOf("[vidalytics]");
        var endIndex = this.groupDescription.indexOf("[/vidalytics]");
        var linkLength = endIndex - index;
        var link = this.groupDescription.substr(index + 12, linkLength - 12);

        let iframeHtml = `<iframe style="border:none;" width="100%" height="400" id="video-container" src="https://preview.vidalytics.com/embed/${link}"></iframe>`;
        let desc = this.groupDescription.replace(link, "");
        desc = desc.replace(/\[vidalytics\]/g, iframeHtml);
        desc = desc.replace(/\[\/vidalytics\]/g, "");
        this.groupDescription = desc;
      }

      if (
        this.groupDescription &&
        this.groupDescription.indexOf("</script>") >= 0
      ) {
        this.groupDescription = this.sanitizer.sanitize(
          SecurityContext.SCRIPT,
          this.sanitizer.bypassSecurityTrustScript(this.groupDescription)
        );
      } else {
        this.groupDescription = this.sanitizer.sanitize(
          SecurityContext.HTML,
          this.sanitizer.bypassSecurityTrustHtml(this.groupDescription)
        );
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

  readMore() {
    this.clubExpandedDescription = true;
    this.clubTruncatedDescription = this.groupDescription;
  }

  showLess() {
    this.clubExpandedDescription = false;
    if(this.groupDescription?.length > this.truncate) {
      this.clubTruncatedDescription = this.getExcerpt(this.groupDescription);
    } else {
      this.clubTruncatedDescription = this.groupDescription;
    }
  }

  mapCategories(club_category_mapping) {
    let categories = club_category_mapping?.map((cat) => {
      let cat_row = this.categories?.filter((c) => {
        return c.id == cat.fk_supercategory_id;
      });
      let categ = cat_row?.length > 0 ? cat_row[0] : {};
      return {
        ...cat,
        name: this.getCategoryText(categ),
        name_EN: categ?.name_EN,
        name_ES: categ?.name_ES,
        name_FR: categ?.name_FR,
        name_EU: categ?.name_EU,
        name_CA: categ?.name_CA,
        name_DE: categ?.name_DE,
      };
    });

    return categories;
  }

  getCategory() {
    return this.clubCategoryMapping?.map( (data) => { return data.name }).join(', ') 
  }

  getCategoryText(cat) {
    return  this.language == "en"
    ? cat.name_EN || cat.name_ES
    : this.language == "fr"
    ? cat.name_FR
    : this.language == "eu"
    ? cat.name_EU || cat.name_ES
    : this.language == "ca"
    ? cat.name_CA || cat.name_ES
    : this.language == "de"
    ? cat.name_DE || cat.name_ES
    : cat.name_ES
  }

  getCategoryLabel() {
    let category = "";

    if (this.categories) {
      this.categories.forEach((cat) => {
        let prefix = category ? ", " : "";
        category += `${prefix}${
          this.language == "en"
            ? cat.name_EN || cat.name_ES
            : this.language == "fr"
            ? cat.name_FR
            : this.language == "eu"
            ? cat.name_EU || cat.name_ES
            : this.language == "ca"
            ? cat.name_CA || cat.name_ES
            : this.language == "de"
            ? cat.name_DE || cat.name_ES
            : cat.name_ES
        }`;
      });
    }

    return category;
  }

  initializeBreadcrumb() {
    this.level1Title = this.pageName;
    this.level2Title = this.planTitle;
    this.level3Title = "";
    this.level4Title = "";
  }

  createNewTitle(page) {
    let plan = "plans.plan";
    if (this.planTitle?.toLowerCase().indexOf("activ") >= 0) {
      plan = "plans.activity";
    } else if (this.planTitle?.toLowerCase().indexOf("event") >= 0) {
      plan = "plans.event";
    }
    return `${this._translateService.instant(
      "dashboard.new"
    )} ${this._translateService.instant(plan)}`;
  }

  formatClub(
    club,
    comments,
    club_members,
    pending_requests,
    user,
    created_by_ue
  ) {
    let subcategories = this.subcategories;
    if (subcategories) {
      subcategories.forEach((sc) => {
        if (!this.groupSubcategory) {
          this.groupSubcategory =
            this.language == "en"
              ? sc.name_EN || sc.name_ES
              : this.language == "fr"
              ? sc.name_FR || sc.name_ES
              : sc.name_ES;
        } else {
          this.groupSubcategory +=
            ", " + this.language == "en"
              ? sc.name_EN || sc.name_ES
              : this.language == "fr"
              ? sc.name_FR || sc.name_ES
              : sc.name_ES;
        }
      });
    }

    this.group = club;
    this.categoryLabel = this.getCategory();
    this.CompanyGroupComments = comments.filter((data) => {
      data.comment = data.comment.replaceAll("\n", "<br/>");
      if (data.CommentChild && data.CommentChild.length > 0) {
        data.CommentChild.filter((data) => {
          data.comment = data.comment.replaceAll("\n", "<br/>");
        });
      }
      return data;
    });

    if (
      this.companyId == 12 ||
      this.companyId == 15
    ) {
      if (this.subcategories) {
        let match = this.subcategories.some(
          (a) => a.group_id === this.group.id
        );
        if (match) {
          this.isNotGroupArea = true;
        }
      }
    }

    if (this.user) {
      this.groupOwner = this.user.id == this.group.fk_user_id;
      this.mapPendingRequests(pending_requests);
    }
    this.members = club_members;
    this.limitMembers = club_members?.length > 9 ? club_members?.slice(0, 9) : club_members;
    this.groupMemberCount = this.members.length;
    this.joinedMember = this.isUserJoined(this.members);
    this.emailTo = `mailto:?Subject=Inquiries&body=` + window.location.href;
    this.showChat = this.group?.show_chat == 1 ? true : false;

    setTimeout(() => {
      initFlowbite();
    }, 500);

    if (this.groups && this.group.parent_group_id > 0) {
      let parent_group_row = this.groups.filter((grp) => {
        return grp.id == this.group.parent_group_id;
      });
      if (parent_group_row && parent_group_row[0]) {
        this.parentGroupName = parent_group_row[0].title;
      }
    }

    this.getTitles();

    if (this.companyId == 32) {
      this.getUECreatedBy(created_by_ue);
    } else {
      this.createdBy = `${this.group.first_name} ${this.group.last_name}`;
      if (this.createdBy == "null null" || this.createdBy == "null") {
        this.createdBy = "";
      }
      this.createdByImage = `${this.apiPath}/${
        this.group.user_image || "empty_avater.png"
      }`;
    }
  }

  getUECreatedBy(created_by) {
    this.createdBy = created_by
      ? `${created_by.first_name} ${created_by.last_name}`
      : "";
    this.createdByImage = `${this.apiPath}/${
      created_by ? created_by.image : "empty_avater.png"
    }`;
  }

  getPlans() {
    this.showViewToggle = false;
    this._clubsService.getPlans(this.id).subscribe(
      (response) => {
        this.showPaginate = true;
        this.groupPlans = response;

        this.activities = [];
        if (this.groupPlans) {
          let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

          this.groupPlans.forEach((gp) => {
            let proceed = false;

            if (!this.showPastEvents && gp.plan_date && gp.plan_date >= today) {
              proceed = true;
            }

            if (this.showPastEvents) {
              proceed = true;
            }

            if (proceed) {
              this.activities.push({
                id: gp.id,
                type: "group_plan",
                title: gp.title,
                image: this.planImgSrc + gp.image,
                plan_date: gp.plan_date,
                points: null,
                repeat_event: gp.repeat_event,
                parent_event_id: gp.parent_event_id,
              });
            }
          });
        }

        let display_days = localStorage.getItem("display_days")
          ? parseInt(localStorage.getItem("display_days") || "")
          : 0;
        if (
          (this.isRecurringActive ||
            localStorage.getItem("recurring") == "1") &&
          (this.recurringDisplayDays > 0 || display_days > 0) &&
          this.activities &&
          this.activities.length > 0
        ) {
          let filtered: any[] = [];
          let display_days =
            this.recurringDisplayDays || localStorage.getItem("display_days");
          let parent_repeat;
          this.activities = this.activities.sort((a, b) => {
            return a.id - b.id;
          });
          this.activities.forEach((plan) => {
            if (plan.repeat_event == 1 || plan.parent_event_id > 0) {
              let plandate = moment(plan.plan_date).format("YYYY-MM-DD");
              if (plan.repeat_event == 1) {
                parent_repeat = moment(plandate).format("YYYY-MM-DD");
              }
              let untildate = moment(parent_repeat)
                .add("days", parseInt(display_days))
                .format("YYYY-MM-DD");
              if (moment(plandate).isSameOrBefore(moment(untildate))) {
                filtered.push(plan);
              }
            } else {
              filtered.push(plan);
            }
          });
          this.activities = filtered;
        }

        this.allGroupPlans = this.handleSort(this.activities);
        this.showGroupPlans =
          this.allGroupPlans && this.allGroupPlans.length > 4
            ? this.allGroupPlans.slice(0, 4)
            : this.allGroupPlans;
        if (this.showGroupPlans?.length > 0) {
          this.showcaseList = this.formatShowcaseList(this.showGroupPlans);
        }
      },
      (error) => {
        this.isLoading = false;
        console.log(error);
      }
    );
  }

  handleSort(plans) {
    let sorted_plans = [];
    if (plans) {
      sorted_plans = plans.sort((a, b) => {
        const oldDate: any = new Date(a.plan_date);
        const newDate: any = new Date(b.plan_date);

        let order = "chronological";
        if (this.isOrderActive || localStorage.getItem("order")) {
          order = this.orderSetting || localStorage.getItem("order_setting");
        }
        return order == "chronological" ? oldDate - newDate : newDate - oldDate;
      });
    }

    return sorted_plans;
  }

  formatShowcaseList(array) {
    return array?.map((item) => {
      return {
        title: this.getPlanTitle(item),
        path: `/plans/details/${item.id}4`,
        image: item.image,
        date: this.getPlanDate(item),
        private: item.private,
        private_type: item?.private_type,
      };
    });
  }

  getPlanTitle(event) {
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

  getPlanDate(plan) {
    let date = moment
      .utc(plan.plan_date)
      .locale(this.language)
      .format("D MMMM");
    if (plan.limit_date) {
      let start_month = moment
        .utc(plan.plan_date)
        .locale(this.language)
        .format("M");
      let end_month = moment
        .utc(plan.limit_date)
        .locale(this.language)
        .format("M");
      let plan_start_date = moment
        .utc(plan.plan_date)
        .locale(this.language)
        .format("YYYY-MM-DD");
      let plan_end_date = moment
        .utc(plan.limit_date)
        .locale(this.language)
        .format("YYYY-MM-DD");

      if (plan_start_date == plan_end_date) {
        date = `${moment
          .utc(plan.limit_date)
          .locale(this.language)
          .format("D MMMM")}`;
      } else {
        if (start_month == end_month) {
          date = `${moment
            .utc(plan.plan_date)
            .locale(this.language)
            .format("D")}-${moment(plan.limit_date)
            .locale(this.language)
            .format("D MMMM")}`;
        } else {
          date = `${moment
            .utc(plan.plan_date)
            .locale(this.language)
            .format("D MMMM")}-${moment(plan.limit_date)
            .locale(this.language)
            .format("D MMMM")}`;
        }
      }
    }
    return date;
  }

  mapPendingRequests(pending) {
    if (pending.length > 0) {
      if (pending[0].status == 0 && pending[0].updated) {
        this.pendingRejected = true;
      } else {
        this.pendingRequest = true;
      }
    }
  }

  isUserJoined(groupMembers) {
    let member = groupMembers?.filter((gm) => {
      return gm.user_id == this.userId;
    });
    let match = member?.length > 0 ? true : false;
    return match;
  }

  handleNavigate() {
    this._router.navigate([`/plans/create/0/4`]);
  }

  handleLeave() {
    this._clubsService.removeGroupMember(this.id, this.user.id).subscribe(
      (response) => {
        let members = this.members;
        if (members?.length > 0) {
          members.forEach((member, index) => {
            if (member.user_id == this.userId) {
              members.splice(index, 1);
            }
          });
        }
        this.members = members;
        this.groupMemberCount = this.members.length;
        this.joinedMember = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  showTerms(type) {
    if(this.user?.id > 0) {
      this.joinType = type;
      if (this.shouldAcceptTerms) {
        setTimeout(() => {
          initFlowbite();
          this.modalbutton?.nativeElement.click();
        }, 100);
      } else {
        if (this.joinType == "request") {
          this.handleRequestJoin();
        } else {
          this.joinPlan();
        }
      }
    } else {
      this._router.navigate(["/auth/login"]);
    }
  }

  continueJoin() {
    if (this.joinType == "request") {
      this.handleRequestJoin();
    } else {
      this.joinPlan();
    }
    this.showTermsAndConditionsModal = false;
  }

  handleRequestJoin() {
    if(this.user?.id > 0) {
      let payload = {
        user_id: this.user.id,
        group_id: this.id,
        company_id: this.user.fk_company_id,
      };

      this._clubsService.addJoinRequest(payload).subscribe(
        (response) => {
          if (response) {
            this.pendingRequest = true;
            location.reload();
          }
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this._router.navigate(["/auth/login"]);
    }
  }

  joinPlan() {
    if(this.user?.id > 0) {
      this._clubsService.addGroupMember(this.id, this.user.id).subscribe(
        (response) => {
          this.members.push({
            first_name: this.user?.first_name,
            last_name: this.user?.last_name,
            id: this.user?.id,
            image: this.user?.image,
            name: this.user?.name,
            user_id: this.user?.id,
          });
          this.acceptTermsAndConditions = false;
          this.acceptCookiePolicy = false;
          this.acceptPrivacyPolicy = false;
          this.groupMemberCount = this.members.length;
          this.joinedMember = true;
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this._router.navigate(["/auth/login"]);
    }
  }

  handleDelete() {
    if (this.id) {
      this.showConfirmationModal = false;
      this.selectedItem = this.id;
      this.confirmMode = "club";
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

  deleteGroup(id, confirmed) {
    if (confirmed) {
      this._clubsService.deleteGroup(id).subscribe(
        (response) => {
          this.selectedItem = "";
          this.confirmMode = "";
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this._location.back();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  handleEditRoute() {
    this._router.navigate([`/clubs/edit/${this.id}`]);
  }

  handleGoBack() {
    this._location.back();
  }

  getContactDetailValue(field) {
    return this.group ? this.group[field.field] : "";
  }

  addComment() {
    const value = this.comment;
    this.commentError = "";
    if (!this.comment) {
      this.commentError = this._translateService.instant(
        "club-details.pleaseenteravalue"
      );
    } else {
      this._clubsService
        .addGroupComment(
          this.id,
          this.user.id,
          this.comment,
          this.user.fk_company_id
        )
        .subscribe(
          (response) => {
            this.comment = "";
            this.refreshComments();
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  toggleChildComment(id) {
    if (this.user) {
      this.showChildComment = true;
      this.selectedCommentId = id;
    }
  }

  addChildComment(comment) {
    const value = this.childComment;
    if (this.childComment) {
      let param = {
        userId: this.user.id,
        groupId: this.group.id,
        comment: this.childComment,
        companyId: this.user.fk_company_id,
      };
      this._clubsService.addGroupCommentReply(comment.id, param).subscribe(
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

  toggleHeart(comment, state) {
    this.selectedCommentId = comment.id;
    this.heartComment = state;

    if (state == false && this.user) {
      let param = {
        userId: this.user.id,
      };
      this._clubsService.deleteGroupCommentHeart(comment.id, param).subscribe(
        (data) => {
          comment.Company_Group_Comment_Reactions.forEach((react, index) => {
            if (react.fk_user_id == this.user.id) {
              comment.Company_Group_Comment_Reactions.splice(index, 1);
            }
          });
        },
        async (err) => {
          console.log(err);
        }
      );
    } else {
      let param = {
        userId: this.user.id,
        heart: 1,
      };
      this._clubsService.heartGroupComment(comment.id, param).subscribe(
        (data) => {
          comment.Company_Group_Comment_Reactions.push({
            id: data.group_comment_reaction.id,
            fk_user_id: data.group_comment_reaction.fk_user_id,
            fk_group_comment_id:
              data.group_comment_reaction.fk_group_comment_id,
            heart: data.group_comment_reaction.heart,
            created: data.group_comment_reaction.created,
          });
        },
        async (err) => {
          console.log(err);
        }
      );
    }
  }

  checkHeartReaction(comment) {
    let reactions = comment.Company_Group_Comment_Reactions;
    let hasReacted = false;
    if (reactions) {
      reactions.forEach((react) => {
        if (this.user && react.fk_user_id == this.user.id) {
          hasReacted = true;
        }
      });
    }

    return hasReacted;
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

  confirm() {
    if (this.confirmMode == "comment") {
      this.deleteComment(this.selectedItem.id, true);
      this.showConfirmationModal = false;
    } else if (this.confirmMode == "club") {
      this.deleteGroup(this.selectedItem, true);
    } else if(this.confirmMode == 'deletecomment') {
      this.deleteChat(this.selectedItem, true);
    } else if(this.confirmMode == 'deletechildcomment') {
      this.deleteChildChat(this.selectedItem, true);
    } 
  }

  deleteComment(id, confirmed) {
    if (confirmed) {
      this._clubsService.deleteGroupComment(id).subscribe(
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

  refreshComments() {
    this._clubsService.getGroupComments(this.id).subscribe(async (response) => {
      this.CompanyGroupComments = response.CompanyGroupComments.filter(
        (data) => {
          data.comment = data.comment.replaceAll("\n", "<br/>");
          if (data.CommentChild && data.CommentChild.length > 0) {
            data.CommentChild.filter((data) => {
              data.comment = data.comment.replaceAll("\n", "<br/>");
            });
          }
          return data;
        }
      );

      if(this.isGroupWallActive) {
        this.commentsList = this.CompanyGroupComments;
        this.cd.detectChanges();
      }
    });
  }

  async copyText() {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";

    let link = `https://${window.location.host}/share/club/${this.id}`;
    selBox.value = link;

    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);

    this.open(this._translateService.instant("dialog.copiedlink"), "");
  }

  goToLink(link) {
    window.open(link, "_blank");
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

  getDisabledStatus() {
    let status = false;
    if (
      this.termsAndConditionsURL &&
      this.privacyPolicyURL &&
      this.cookiePolicyURL
    ) {
      if (
        !this.acceptTermsAndConditions ||
        !this.acceptPrivacyPolicy ||
        !this.acceptCookiePolicy
      ) {
        status = true;
      }
    }

    return status;
  }

  getAllClubMembers() {
    this._clubsService.getAllClubMembers(this.id)
    .subscribe(
      response => {
        this.clubMembers = response.all_club_members
      },
      error => {
        console.log(error)
      }
    )
  }

  downloadMembers() {
    this._excelService.exportAsExcelFile(this.clubMembers, 'clubes-miembros-' + this.id);
    this.open(this._translateService.instant('club-details.downloadedsuccessfully'), '');
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
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

  goToMemberProfilePage(member) {
    if(this.hasMembers) {
      this._router.navigate([`/members/details/${member?.user_id}`])
    }
  }

  initializeCommentsList() {
    this._companyService
      .fetchComments(this.companyId, this.userId, 'club', this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.commentsList = this.formatComments(data.comments, data.user);
          this.cd.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatComments(comments, user) {
    let data;
    data = comments.map((comment, index) => {
      return {
        mode: 'club',
        private: this.group?.private,
        author_name: comment.name,
        display_date: moment(comment.created_at).locale(this.language).format('DD MMMM, YYYY HH:mm A'),
        date: moment(comment.created_at).format('YYYY-MM-DD'),
        author_image: `${this.apiPath}/${comment.image}`,
        likes: comment?.reactions?.length,
        show_reply: false,
        current_user_image: `${this.apiPath}/${user.image}`,
        current_user_name: user.first_name ? `${user.first_name} ${user.last_name}` : user.name,
        ...comment
      }
    })

    return data;
  }

  handleAddComment(event) {
    this.newComment = event;
    this._companyService.addModuleComment({ 
      company_id: this.companyId, 
      user_id: this.userId, 
      object: 'club', 
      object_id: this.id,
      parent_comment_id: null,
      comment: this.newComment,
    }).subscribe(
      (response) => {
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
        this.newComment = '';
        this.initializeCommentsList();
      }
    )
  } 

  handleDeleteComment(event) {
    if(event) {
      this.showConfirmationModal = false;
      this.selectedItem = event;
      this.confirmMode = 'deletecomment';
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

  deleteChat(id, confirmed) {
    if(confirmed) {
      this._companyService.deleteModuleComment(id).subscribe(
        response => {
          this.showConfirmationModal = false;
          let all_comments = this.commentsList;
            if (all_comments?.length > 0) {
              all_comments.forEach((comment, index) => {
                if (comment.id == this.selectedItem) {
                  all_comments.splice(index, 1);
                }
            });
          }
          
          this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
          this.commentsList = [];
          setTimeout(() => {
            this.commentsList = all_comments;
            this.cd.detectChanges();
          }, 100)
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  handleReactToComment(event) {
    let current_user_reaction = event?.reactions?.filter(react => {
      return react.user_id == this.userId
    })

    let mode = current_user_reaction?.length > 0 ? 'unlike' : 'like'
    let params = {
      company_id: this.companyId, 
      user_id: this.userId, 
      comment_id: event.id,
      heart: current_user_reaction?.length > 0 ? null : 1,
      mode,
    }
    this._companyService.reactToModuleComment(params).subscribe(
      response => {
        this.showConfirmationModal = false;
        let all_comments = this.commentsList;
          if (all_comments?.length > 0) {
            all_comments.forEach((comment, index) => {
              if (comment.id == event.id) {
                if(mode == 'like') {
                  let reactions = comment.reactions || [];
                  reactions.push({
                    comment_id: comment.id,
                    company_id: comment.company_id,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    heart: 1,
                    id: 100,
                    updated_at: null,
                    user_id: this.userId,
                  })
                  comment.reactions = reactions;
                  comment.likes = reactions?.length;
                } else if(mode == 'unlike') {
                  if(comment.reactions?.length > 0) {
                    comment.reactions.forEach((rxn, idx) => {
                      if(rxn.user_id == this.userId && rxn.comment_id == comment.id) {
                        comment.reactions.splice(idx, 1);
                      }
                    })
                  }
                  comment.likes = comment.reactions?.length
                }
              }
          });
        }
        
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        this.commentsList = [];
        setTimeout(() => {
          this.commentsList = all_comments;
          this.cd.detectChanges();
        }, 100)
      },
      error => {
        console.log(error);
      }
    )
  }

  handleAddChildComment(event) {
    this.newComment = event?.child_comment;
    this._companyService.addModuleComment({ 
      company_id: this.companyId, 
      user_id: this.userId, 
      object: 'club', 
      object_id: this.id,
      parent_comment_id: event.item.id,
      comment: this.newComment,
    }).subscribe(
      (response) => {
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
        this.newComment = '';
        this.initializeCommentsList();
      }
    )
  } 

  handleDeleteChildComment(event) {
    if(event) {
      this.showConfirmationModal = false;
      this.selectedItem = event;
      this.confirmMode = 'deletechildcomment';
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

  deleteChildChat(id, confirmed) {
    if(confirmed) {
      this._companyService.deleteModuleComment(id.child_comment_id).subscribe(
        response => {
          this.showConfirmationModal = false;
          let all_comments = this.commentsList;
            if (all_comments?.length > 0) {
              all_comments.forEach((comment, index) => {
                if (comment.replies?.length > 0) {
                  comment?.replies?.forEach((reply, idx) => {
                    if(reply.id == id.child_comment_id) {
                      comment?.replies.splice(idx, 1);
                    }
                  })
                }
            });
          }
          
          this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
          this.commentsList = [];
          setTimeout(() => {
            this.commentsList = all_comments;
            this.cd.detectChanges();
          }, 100)
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  setActiveMenu(menu) {
    this.activeMenu = menu
    this.notifyChild(menu)
  }

  notifyChild(menu) {
    this.childNotifier.next(menu)
  }

  getMemberImage(member) {
    let image = ''
    let memberImage = member.image
    if(!memberImage && member.CompanyUser) {
      memberImage = member.CompanyUser.image
    } 
    if(memberImage == 'default-avatar.jpg' || memberImage == 'empty_avatar.png') {
      image = './assets/images/default-profile.png'
    } else {
      image = this.imageSrc + memberImage
    }

    return image
  }

  getMemberName(member) {
    let memberName = `${member.first_name} ${member.last_name}`
    if(member.CompanyUser && (!memberName || (memberName && memberName.indexOf('undefined') >= 0))) {
      memberName = `${member.CompanyUser.first_name} ${member.CompanyUser.last_name}`
    }

    return memberName
  }

  checkCurrent(member) {
    if(member.id == this.userId || member.user_id == this.userId) {
      return `(${this._translateService.instant('wall.you')})`
    }
  }

  handleMenuChanged(event: any) {
    this.activeMenu = event || 'General'
  }

  deletePost(post) {
    if (post) {
      this.showConfirmationModal = false;
      this.selectedItem = post;
      this.confirmMode = 'comment';

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

  isDescriptionLong() {
    return this.groupDescription?.length > this.truncate ? true : false;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}