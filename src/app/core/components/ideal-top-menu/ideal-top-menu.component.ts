import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  ViewChild,
  inject,
} from "@angular/core";
import { Router, RouterModule, NavigationEnd } from "@angular/router";
import { AuthService, MenuService } from "src/app/core/services";
import { LocalService } from "@share/services";
import { LogoComponent } from "../logo/logo.component";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MatSnackBarModule  } from '@angular/material/snack-bar';
import { initFlowbite } from "flowbite";
import { MenuIcon } from "@lib/interfaces";
import {
  faGear,
  faSearch,
  faGlobe,
  faBell,
  faHome,
  faCalendarAlt,
  faUsers,
  faUserFriends,
  faSitemap,
  faCity,
  faChalkboardTeacher,
  faEdit,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { FormsModule } from "@angular/forms";
import menuIconsData from "src/assets/data/menu-icons.json";
import { GuestMenuComponent } from "../guest-menu/guest-menu.component";
import { DateAgoPipe } from "@lib/pipes";
import { environment } from "@env/environment";
import { CartService } from "@features/services/shop/cart.service";
import { CartItem } from "@features/models/shop/cart.model";

@Component({
  selector: "app-ideal-top-menu",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    FontAwesomeModule,
    MatSnackBarModule,
    DateAgoPipe,
    LogoComponent,
    GuestMenuComponent,
  ],
  templateUrl: "./ideal-top-menu.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdealTopMenuComponent {
  menus$ = inject(MenuService).menus$;
  menuIcons: MenuIcon[] = menuIconsData;

  cart$ = inject(CartService).cart$;

  @Input() cart: any;
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
  @Input() expireDays: any;
  @Input() expireDaysDiff: any;
  @Input() cancelDays: any;
  @Input() memberTypeExpirations: any;
  @Input() currentUser: any;
  @Input() isTutorUser: any;
  @Input() hasEventCalendar: any;
  @Input() hasTutors: any;
  @Input() canCreateCourse: any;
  @Input() coursesTitle: any;
  @Input() tutorManageStudentAccess: any;
  @Input() hasCreditSetting: any;
  @Input() hasCreditPackageSetting: any;
  @Input() myActivitiesTitle: any;
  @Input() myClubsTitle: any;
  @Input() primaryColor: any;
  @Input() buttonColor: any;
  @Input() hoverColor: any;
  @Input() logoSource: any;
  @Input() isUESchoolOfLife: any;
  @Input() refreshedMenu: any;
  @Input() superAdmin: any;
  @Input() hasHistoryOfActivities: any;
  @Input() customMemberType: any;
  @Input() isCursoGeniusTestimonials: any;
  @Input() canRegister: any;
  @Input() navigation: any;
  @Input() manageMembers: any;
  @Input() userTypeName: any;
  @Input() potSuperTutor: any;
  @Input() potTutor: any;
  @Input() superTutor: any;
  @Input() isTutorMenuVisible: any;
  @Input() hasCredits: any;
  @Input() customMemberTypePermissions: any;
  @Input() campus: any;
  @Input() hasShop: any;
  @Output() changeLanguage = new EventEmitter();

  logoSrc: string = COMPANY_IMAGE_URL;
  companyName: any;
  menuColor: any;
  courseWallButton: any;
  navMenus: any = [];
  gearIcon = faGear;
  searchIcon = faSearch;
  globeIcon = faGlobe;
  bellIcon = faBell;
  homeIcon = faHome;
  planIcon = faCalendarAlt;
  clubIcon = faUsers;
  memberIcon = faUserFriends;
  employmentIcon = faSitemap;
  serviceIcon = faCity;
  courseIcon = faChalkboardTeacher;
  blogIcon = faEdit;
  graduationCapIcon = faGraduationCap;

  navigationSubscription;
  hasActivityFeed: boolean = false;
  showProfileButton: boolean = false;
  insertSmartlookScript: any;
  insertFacebookPixelScript: any;
  insertLinkedInScript: any;
  hasCRM: boolean = false;
  hasInvitations: boolean = false;
  myActivities: any = [];
  courseWallPrefix: any;
  courseWallPrefixTextValue: string = "";
  courseWallPrefixTextValueEn: string = "";
  courseWallPrefixTextValueFr: string = "";
  courseWallPrefixTextValueEu: string = "";
  courseWallPrefixTextValueCa: string = "";
  courseWallPrefixTextValueDe: string = "";
  hasCourseWallDropdown: boolean = false;
  courseWallDropdownMenu: any = {};
  selectedTab: any = "home";
  isMyClubsActive: boolean = false;
  isMyActivitiesActive: boolean = false;
  myClubs: any;
  hasCRMFeature: boolean = false;
  currentWallId: any;
  wallSelected: boolean = false;
  collapsed: boolean = true;
  search: any;
  menuOpened: boolean = false;
  menuHover: boolean = false;
  hoveredMenuPath: any;
  searchHover: boolean = false;
  settingsHover: boolean = false;
  wallMenuOpened: boolean = false;
  wallMenuHover: boolean = false;
  languageHover: boolean = false;
  hoveredCourseWallPath: any;
  courseWallHover: any;
  hasGenericWallDropdown: boolean = false;
  genericWallDropdownMenu: any;
  termsHover: boolean = false;
  privacyPolicyHover: boolean = false;
  cookiePolicyHover: boolean = false;
  languageItemHover: boolean = false;
  showLanguageOptions: boolean = false;
  showCourseWallOptions: boolean = false;
  courseWallItemHover: boolean = false;
  supportTicketsHover: boolean = false;
  customerOnboardingHover: boolean = false;
  hoveredLanguage: any;
  courseWallPrefixTextValueIt: any;
  canAccessPlatformSettings: boolean = false;
  canViewCRM: boolean = false;
  canViewGuests: boolean = false;
  canViewAdministrar: boolean = false;
  companyId: any;
  hideMenu: boolean = false;
  @ViewChild("outsidebutton", { static: false }) outsidebutton:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router, 
    private _authService: AuthService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _cartService: CartService
  ) {
    this.navigationSubscription = this._router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.wallSelected = false;
        this.currentWallId = null;
        var splitRowObject = this._router.url?.split("/");
        if (this._router.url?.indexOf("activity-feed/wall") >= 0) {
          if (this._router.url == "/activity-feed/wall/0") {
          } else {
            this.wallSelected = true;
          }
          this.currentWallId = this._router.url?.replace(
            "/activity-feed/wall/",
            ""
          );
        }
        let route = "home";
        if (splitRowObject.length > 1) {
          route = splitRowObject[1];
        } else {
        }
        
        if(splitRowObject?.length == 4) {
          if(splitRowObject[1] == 'plans' && splitRowObject[2] == 'list' && splitRowObject[3] == 'history') {
            route = 'plans/list/history';
          }
          if(splitRowObject[1] == 'courses' && splitRowObject[2] == 'list' && splitRowObject[3] == 'nivelacion') {
            route = 'courses/list/nivelacion';
          }
        } 
        this.selectedTab = route || "home";
      }
    });
  }

  async ngOnInit() {
    this.initializePage();
    this.getCourseWallMenuText();

    setTimeout(() => {
      initFlowbite();
      this.companyId = this.company.id;
    }, 1000)
  }

  initializePage() {
    this.companyName = this.company?.entity_name;
    this.menuColor = this.company?.menu_color || "#ffffff";
    this.primaryColor = this.company?.primary_color || this.company?.button_color;
    this.buttonColor = this.company?.button_color || this.company?.primary_color;
    this.logoSrc = `${COMPANY_IMAGE_URL}/${this.company?.image}`;
    this.courseWallButton = this.company?.course_wall_button;
    this.courseWallPrefix = this.company?.course_wall_prefix;
    this.courseWallPrefixTextValue = this.company?.course_wall_prefix_text;
    this.courseWallPrefixTextValueEn = this.company?.course_wall_prefix_text_en;
    this.courseWallPrefixTextValueFr = this.company?.course_wall_prefix_text_fr;
    this.courseWallPrefixTextValueEu = this.company?.course_wall_prefix_text_eu;
    this.courseWallPrefixTextValueCa = this.company?.course_wall_prefix_text_ca;
    this.courseWallPrefixTextValueDe = this.company?.course_wall_prefix_text_de;
    this.courseWallPrefixTextValueIt = this.company?.course_wall_prefix_text_it;
  }

  getCourseWallMenuText() {
    return this.courseWallPrefix ? this.language == 'en' ? (this.courseWallPrefixTextValueEn || this.courseWallPrefixTextValue) : (this.language == 'fr' ? (this.courseWallPrefixTextValueFr || this.courseWallPrefixTextValue) : 
        (this.language == 'eu' ? (this.courseWallPrefixTextValueEu || this.courseWallPrefixTextValue) : (this.language == 'ca' ? (this.courseWallPrefixTextValueCa || this.courseWallPrefixTextValue) : 
        (this.language == 'de' ? (this.courseWallPrefixTextValueDe || this.courseWallPrefixTextValue) : this.courseWallPrefixTextValue)
      ))
    ) : this._translateService.instant('sidebar.activityfeed');
  }

  ngOnChanges(changes: SimpleChange) {
    let menuChange = changes["menus"];
    if (menuChange?.currentValue?.length > 0) {
      let menus = menuChange.currentValue;
      let navmenus = menus?.filter((cw) => {
        return cw.course_wall != 11;
      });
      this.navMenus = navmenus;
      this.checkCourseWalls(menuChange.currentValue);
    }

    let cartChange = changes["cart"];
    if (cartChange?.currentValue?.length > 0) {
      let cart = cartChange.currentValue;
      this.cart = cart;
    }

    let otherSettingsChange = changes["otherSettings"];
    if (otherSettingsChange?.currentValue?.length > 0) {
      this.getSettings();
    }

    let refreshedMenuChange = changes["refreshedMenu"];
    if (refreshedMenuChange && 
      (refreshedMenuChange?.previousValue != refreshedMenuChange?.currentValue ||
      refreshedMenuChange?.currentValue == true)
    ) {
      let menus = this.menus;
      if(menus?.length == 0) {
        this.refreshWallMenus(menus);
      } else {
        this.refreshWallMenus(menus);
      }
    }

    let companyChange = changes["company"];
    if (companyChange?.currentValue?.id > 0) {
      let company = companyChange.currentValue;
      this.company = company;
      this.initializePage();
    }

    let customMemberTypeChange = changes["customMemberType"];
    if (customMemberTypeChange?.currentValue?.id > 0) {
      this.customMemberType = customMemberTypeChange.currentValue;
      if(this.customMemberType) {
        this.canAccessPlatformSettings = this.customMemberType?.access_platform_settings == 1 ? true : false;
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

  refreshWallMenus(menus) {
    let local_menus = this._localService.getLocalStorage(environment.lsmenus);
    if(local_menus) {
      menus = JSON.parse(local_menus);
    }
    if(menus?.length > 0) {
      this.checkCourseWalls(menus);
    }
  }

  getSettings() {
    if (this.otherSettings) {
      this.otherSettings.forEach((m) => {
        if (m.title_es == "General") {
          if (m.content) {
            let hasActivityFeedSettings = m.content.filter((c) => {
              return c.title_en.indexOf("Activity feed") >= 0;
            });
            if (hasActivityFeedSettings && hasActivityFeedSettings[0]) {
              this.hasActivityFeed =
                hasActivityFeedSettings[0].active == 1 ? true : false;
            }

            let profileButtonSettings = m.content.filter((c) => {
              return c.title_en.indexOf("My Profile") >= 0;
            });

            if (profileButtonSettings && profileButtonSettings[0]) {
              this.showProfileButton =
                profileButtonSettings[0].active == 1 ? true : false;
            }
          }
        }

        if (m.title_es == "Módulos") {
          if (m.content) {
            let crmSettings = m.content.filter((c) => {
              return c.title_en == "CRM";
            });
            if (crmSettings && crmSettings[0]) {
              this.hasCRM = crmSettings[0].active == 1 ? true : false;
            }

            let inviteSettings = m.content.filter((c) => {
              return c.title_en == "Your Activity: Invitations";
            });
            if (inviteSettings && inviteSettings[0]) {
              this.hasInvitations =
                inviteSettings[0].active == 1 ? true : false;
            }
          }
        }
      });
    }
  }

  checkCourseWalls(menus) {
    if (menus?.length > 0) {
      let generic_wall_dropdown_row = menus?.filter((cw) => {
        return cw.path == '/activity-feed-0';
      });
      if(generic_wall_dropdown_row?.length > 0) {
        this.hasGenericWallDropdown = true;
        this.genericWallDropdownMenu = generic_wall_dropdown_row[0];
      }

      let course_wall_dropdown_row = menus?.filter((cw) => {
        return cw.course_wall == 11 || cw.course_wall == 1;
      });
      if (course_wall_dropdown_row?.length > 0 && !this.hasGenericWallDropdown) {
        this.hasCourseWallDropdown = true;
        this.courseWallDropdownMenu = course_wall_dropdown_row[0];
        if(this.courseWallDropdownMenu?.subs?.length > 0) {
        } else {
          let menu_items = [
            this.courseWallDropdownMenu
          ];
          this.courseWallDropdownMenu['subs'] = menu_items;
        }
      }

      setTimeout(() => {
        initFlowbite();
      }, 500);
    }
  }

  logout(): void {
    this._authService.logout();
    this._router.navigate(["/auth/login"]);
  }

  getLanguageTitle(language) {
    return this.language == "en"
      ? language.name_EN
      : this.language == "fr"
      ? language.name_FR || language.name_ES
      : this.language == "eu"
      ? language.name_EU || language.name_ES
      : this.language == "ca"
      ? language.name_CA || language.name_ES
      : this.language == "de"
      ? language.name_DE || language.name_ES
      : this.language == "it"
      ? language.name_IT || language.name_ES
      : language.name_ES;
  }

  useLanguage(lang) {
    this.language = lang;
    this.changeLanguage.emit(lang);
    this.languageHover = false;
    this.showLanguageOptions = false;
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

  getCourseWallMenus(menus) {
    let mnus = [];
    if (menus?.length > 0) {
      mnus = menus.filter((mnu) => {
        return mnu.course_wall == 1;
      });
    }
    return mnus;
  }

  goToCourseWall(menu) {
    let id = menu.path.replace("activity-feed-", "");
    this.selectedTab = id;
    this.showCourseWallOptions = false;
    setTimeout(() => {
      this.outsidebutton?.nativeElement.click();
      this._router
        .navigateByUrl("/", { skipLocationChange: true })
        .then(() => this._router.navigate([`/activity-feed/wall/${id}`]));
    }, 500)
  }

  getCourseWallName(wall) {
    return this.language == "en"
      ? wall.name
        ? wall.name || wall.title
        : wall.name_ES
      : this.language == "fr"
      ? wall.name_FR
        ? wall.name_FR || wall.name_ES
        : wall.name_ES
      : this.language == "eu"
      ? wall.name_EU
        ? wall.name_EU || wall.name_ES
        : wall.name_ES
      : this.language == "ca"
      ? wall.name_CA
        ? wall.name_CA || wall.name_ES
        : wall.name_ES
      : this.language == "de"
      ? wall.name_DE
        ? wall.name_DE || wall.name_ES
        : wall.name_ES
      : this.language == "it"
      ? wall.name_IT
        ? wall.name_IT || wall.name_ES
        : wall.name_ES
      : wall.name_ES;
  }

  getCourseWallPrefix() {
    return this.language == "en"
      ? this.courseWallPrefixTextValue
        ? this.courseWallPrefixTextValue
        : this.courseWallPrefixTextValue
      : this.language == "fr"
      ? this.courseWallPrefixTextValueFr
        ? this.courseWallPrefixTextValueFr || this.courseWallPrefixTextValue
        : this.courseWallPrefixTextValue
      : this.language == "eu"
      ? this.courseWallPrefixTextValueEu
        ? this.courseWallPrefixTextValueEu || this.courseWallPrefixTextValue
        : this.courseWallPrefixTextValue
      : this.language == "ca"
      ? this.courseWallPrefixTextValueCa
        ? this.courseWallPrefixTextValueCa || this.courseWallPrefixTextValue
        : this.courseWallPrefixTextValue
      : this.language == "de"
      ? this.courseWallPrefixTextValueDe
        ? this.courseWallPrefixTextValueDe || this.courseWallPrefixTextValue
        : this.courseWallPrefixTextValue
      : this.language == "it"
      ? this.courseWallPrefixTextValueIt
        ? this.courseWallPrefixTextValueIt || this.courseWallPrefixTextValue
        : this.courseWallPrefixTextValue
      : this.courseWallPrefixTextValue;
  }

  goToManageStudents() {
    this._router.navigate([]).then((result) => {
      window.open("/settings/students-management", "_blank");
    });
  }

  getMenuIcon(menu) {
    let menuItem = this.menuIcons.filter((mnu) => {
      return mnu.path == menu.path || mnu.path == menu?.return_url;
    });

    let iconImage = "";
    if (menuItem && menuItem.length > 0) {
      iconImage = this.menuColor == '#000000' && menuItem[0].icondark ? menuItem[0].icondark : menuItem[0].icon
    }

    return iconImage;
  }

  getMenuFaCode(menu) {
    let menuItem = this.menuIcons.filter((mnu) => {
      return mnu.path == menu.path;
    });

    let iconImage = "";
    if (menuItem && menuItem.length > 0) {
      iconImage = menuItem[0]["facode"];
    }

    return iconImage;
  }

  getMenuFaIcon(menu) {
    let menuItem = this.menuIcons.filter((mnu) => {
      return mnu.path == menu.path;
    });

    let path = "";
    if (menuItem && menuItem.length > 0) {
      path = menuItem[0]["path"];
    }

    let icon;
    switch (path) {
      case "home":
        icon = this.homeIcon;
        break;
      case "plans":
        icon = this.planIcon;
        break;
      case "clubs":
      case "discounts":
        icon = this.clubIcon;
        break;
      case "employmentchannel":
      case "startups":
        icon = this.employmentIcon;
        break;
      case "cityguide":
      case "services":
        icon = this.serviceIcon;
        break;
      case "members":
      case "tutors":
        icon = this.memberIcon;
        break;
      case "courses":
      case "dashboard":
        icon = this.courseIcon;
        break;
      case "blog":
        icon = this.blogIcon;
        break;
      default:
        icon = null;
    }

    return icon;
  }

  getMenuTitle(menu) {
    let text = menu?.new_url == 1 && this.isUESchoolOfLife ? 'Vida Universitaria' :
      (this.language == "en"
        ? menu.name
        : this.language == "fr"
        ? menu.name_FR || menu.name_ES
        : this.language == "eu"
        ? menu.name_EU || menu.name_ES
        : this.language == "ca"
        ? menu.name_CA || menu.name_ES
        : this.language == "de"
        ? menu.name_DE || menu.name_ES
        : this.language == "it"
        ? menu.name_IT || menu.name_ES
        : menu.name_ES);

    if(this.isUESchoolOfLife && text?.indexOf('de Vida Universitaria') >= 0) {
      text = text?.replace('de Vida Universitaria', 'de School of Life')
    }

    if(this.company?.id == 32 && !this.isUESchoolOfLife) {
      text = text?.replace("University Life Activities School of Life", "School of Life Activities")
    }

    return text;
  }

  changeSelectedTab(path) {
    this.selectedTab = path;
  }

  toggleSidebar(mode: string = '', menu: any) {
    if(mode == 'icon') {
      if(menu?.path) {
        this.selectedTab = menu?.path;
      } else {
        if((menu == 'settings' || menu == 'language') && !menu?.path) {
          this.selectedTab = menu;
        }
      }
    } else {
      this.collapsed = !this.collapsed;
    }
    setTimeout(() => {
      initFlowbite();
    }, 100)
  }

  openUrl(link) {
    window.open(link, "_blank");
  }

  handleKeyPressed() {
    this.toggleSidebar('', {});
  }

  navigateToPage(menu) {
    if(menu.new_button == 1 || menu.new_url == 1) {
      let path = menu.path;
      if(path?.indexOf('schooloflife') >= 0 && this.currentUser?.guid) {
        path = `${path}/sso/${this.currentUser?.guid}`;
      }
      this.openUrl(menu.new_url == 1 && this.isUESchoolOfLife ? `https://${this.company?.url}` : path);
    } else if(menu.return_url && menu.url != 'undefined') {
      let path = menu.path;
      if(path?.indexOf('plans/list/history') >= 0) {
      } else {
        if(path?.indexOf('schooloflife') >= 0 && this.currentUser?.guid) {
          path = `${path?.replace('plans', '')?.replace('courses', '')}/sso/${this.currentUser?.guid}`;
          if(menu.return_url && menu.return_url != 'undefined') {
            path += `?returnUrl=${menu.return_url}`
          }
          path = path?.replace('//sso', '/sso');
        }
      }
      this.openUrl(path);
    } else {
      let link = menu?.path == 'home' ? '/' : menu?.path

      if(menu?.path == 'testimonials' && this.company?.id == 52 && !this.isCursoGeniusTestimonials) {
        link = 'https://testimonios.vistingo.com'
        this._router.navigate([]).then((result) => {
          window.open(link, '_blank');
        });
      } else {
        this._router.navigate([link]);
      }
    }
  }

  toggleHover(event) {
   this.menuOpened = event;
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  toggleMenuHover(event, menu) {
    this.hoveredMenuPath = menu.path;
    this.menuHover = event;
  }

  toggleSearchHover(event) {
    this.searchHover = event;
  }

  toggleSettingsHover(event) {
    this.settingsHover = event;
  }

  toggleWallMenuHover(event) {
    this.wallMenuHover = event;
  }

  toggleLanguageHover(event, lang) {
    this.languageHover = event;
    this.hoveredLanguage = lang.code;
  }

  toggleCourseWallHover(event, menu) {
    this.hoveredCourseWallPath = menu.path;
    this.courseWallHover = event;
  }

  goToTerms() {
    if(this.company?.terms_and_conditions_option == 'url') {
      let link = this.language == 'en' ? this.company?.terms_and_conditions_url_en : (this.language == 'fr' ? (this.company?.terms_and_conditions_url_fr || this.company?.terms_and_conditions_url) : 
          (this.language == 'eu' ? (this.company?.terms_and_conditions_url_eu || this.company?.terms_and_conditions_url) : (this.language == 'ca' ? (this.company?.terms_and_conditions_url_ca || this.company?.terms_and_conditions_url) : 
          (this.language == 'de' ? (this.company?.terms_and_conditions_url_de || this.company?.terms_and_conditions_url) : this.company?.terms_and_conditions_url)
        ))
      )

      window.open(link, '_blank');
    } else {
      this._router.navigate(['/general/terms-and-conditions']);
    }
  }

  toggleTermsHover(event) {
    this.termsHover = event;
  }

  goToPrivacyPolicy() {
    if(this.company?.privacy_policy_option == 'url') {
      let link = this.language == 'en' ? this.company?.privacy_policy_url_en : (this.language == 'fr' ? (this.company?.privacy_policy_url_fr || this.company?.privacy_policy_url) : 
          (this.language == 'eu' ? (this.company?.privacy_policy_url_eu || this.company?.privacy_policy_url) : (this.language == 'ca' ? (this.company?.privacy_policy_url_ca || this.company?.privacy_policy_url) : 
          (this.language == 'de' ? (this.company?.privacy_policy_url_de || this.company?.privacy_policy_url) : this.company?.privacy_policy_url)
        ))
      )

      window.open(link, '_blank');
    } else {
      this._router.navigate(['/general/privacy-policy']);
    }
  }

  togglePrivacyPolicyHover(event) {
    this.privacyPolicyHover = event;
  }

  goToCookiePolicy() {
    if(this.company?.cookie_policy_option == 'url') {
      let link = this.language == 'en' ? this.company?.cookie_policy_url_en : (this.language == 'fr' ? (this.company?.cookie_policy_url_fr || this.company?.cookie_policy_url) : 
          (this.language == 'eu' ? (this.company?.cookie_policy_url_eu || this.company?.cookie_policy_url) : (this.language == 'ca' ? (this.company?.cookie_policy_url_ca || this.company?.cookie_policy_url) : 
          (this.language == 'de' ? (this.company?.cookie_policy_url_de || this.company?.cookie_policy_url) : this.company?.cookie_policy_url)
        ))
      )

      window.open(link, '_blank');
    } else {
      this._router.navigate(['/general/cookie-policy']);
    }
  }

  toggleCookiePolicyHover(event) {
    this.cookiePolicyHover = event;
  }

  toggleLanguageItemHover(event) {
    this.languageHover = false;
    this.languageItemHover = event;
    if(!this.languageItemHover) {
      this.showLanguageOptions = false;
    }
  }

  toggleLanguageOptions() {
    this.showLanguageOptions = !this.showLanguageOptions;
  }

  toggleCourseWallOptions() {
    this.showCourseWallOptions = !this.showCourseWallOptions;
  }

  toggleCourseWallItemHover(event) {
    this.wallMenuHover = false;
    this.courseWallItemHover = event;
    if(!this.courseWallItemHover) {
      this.showCourseWallOptions = false;
    }
  }

  toggleSupportTicketsHover(event) {
    this.supportTicketsHover = event;
  }

  toggleCustomerOnboardingHover(event) {
    this.customerOnboardingHover = event;
  }

  goToCustomerOnboarding() {
    this._router.navigate([`/customer-onboarding`])
  }

  getLanguage(language) {
    return language[`name_${this.language.toUpperCase()}`];
  }

  redirectPath(mode) {
    this.hideMenu = true;
    setTimeout(() => {
      this.outsidebutton?.nativeElement.click();
      let path = '';
      switch(mode) {
        case 'userprofile':
          path = `/users/profile/${this.userid}`;
          break;
        case 'useraccount':
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
        case 'myorders':
          path = '/shop/my-orders';
          break;
        case 'mytransactions':
          path = '/users/my-transactions';
          break;
      }

      this._router.navigate([path]).then(() => {
        window.location.reload();
      });
    }, 500)
  }

  getTotal(items: CartItem[]): number {
    return this._cartService.getTotal(items);
  }

  onClearCart(): void {
    this._cartService.clearCart();
  }

  ngOnDestroy() {
    this.navigationSubscription?.unsubscribe();
  }
}