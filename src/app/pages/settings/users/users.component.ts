import { CommonModule, DatePipe, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import {
  BreadcrumbComponent,
  ButtonGroupComponent,
  IconFilterComponent,
  ToastComponent,
} from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  ExcelService,
  LocalService,
  UserService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { initFlowbite } from "flowbite";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ClubsService, CoursesService, TutorsService } from "@features/services";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import moment from "moment";
import get from "lodash/get";
import { searchSpecialCase, sortSerchedMembers } from "src/app/utils/search/helper";
import Fuse from 'fuse.js';

@Component({
  selector: "app-manage-users",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FontAwesomeModule,
    MatSnackBarModule,
    MatTabsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    NgMultiSelectDropDownModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule,
    SearchComponent,
    BreadcrumbComponent,
    IconFilterComponent,
    ButtonGroupComponent,
    ToastComponent,
  ],
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class ManageUsersComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;

  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  searchText: any;
  placeholderText: any;
  language: string = "es";
  companyId: any;
  domain: any;
  primaryColor: any;
  buttonColor: any;
  companies: any;
  userId: any;
  memberTypes: any = [];
  hasCustomMemberTypeSettings: boolean = false;
  citiesList: any = [];
  buttonList: any = [];
  pageSize: number = 10;
  pageIndex: number = 0;
  isloading: boolean = true;
  otherSettings: any;
  requireApproval: boolean = false;
  requirePayment: boolean = false;
  hasExpiration: boolean = false;
  memberRoles: any = [];
  isUsersLoading: boolean = true;
  hasMemberContract: boolean = false;
  hasRegistrationFields: boolean = false;
  hasProfileFields: boolean = false;
  businessCategories: any = [];
  allRegistrationFields: any = [];
  allRegistrationFieldMapping: any = [];
  hasStartupField: boolean = false;
  registrationFields: any = [];
  selectedFields: any = [];
  formTemplate: any;
  showDefaultRegistrationFields: boolean = false;
  dataSource: any;
  memberDisplayedColumns = [
    "checked",
    "first_name",
    "last_name",
    "email",
    "user_role",
    // "invited_by",
    "recordStatus",
    "action",
  ];
  asMemberDisplayedColumns = [
    "checked",
    "startup_name",
    "founder_name",
    "email",
    "user_role",
    "action",
  ];
  userForm: any;
  userFormSubmitted: boolean = false;
  showEditUserModal: boolean = false;
  selectedRole: any = "";
  selectedUser: any;
  userMode: any;
  roles: any;
  allProfileFields: any = [];
  profileFields: any = [];
  allProfileFieldMapping: any = [];
  searchKeyword: any;
  selectedCustomMemberTypeRole: any = "";
  memberStatusFilter: any = "Active";
  selectedBusinessCategories: any;
  dropdownSettings = {};
  categoryDropdownSettings = {};
  userLogoSrc: any;
  logoFile: any;
  salesPeopleList: any = [];
  invitedByPeople: any = [];
  sectors: any = [];
  areaGroups: any = [];
  memberContractDurations: any = [];
  memberContract: any;
  selectedMemberContractDuration: any = "";
  showAdditionalMemberTypeDropdown: boolean = false;
  requiredMemberList: any = [];
  selectedRequiredMember: any = "";
  requiredMemberRole: any = "";
  requiredMemberRoleId: any;
  hasMemberCommissions: boolean = false;
  features: any;
  sendMemberEmail: boolean = false;
  errorMessage: any = "";
  selectedUsers: any = [];
  selectedUserBulkAction: any = "";
  countryDropdown: any;
  countries: any;
  hasOneToOne: boolean = false;
  oneToOnes: any = [];
  showReceivedOneToOneModal: boolean = false;
  receivedOneToOnes: any = [];
  showGeneratePaymentLinkModal: boolean = false;
  generatePaymentLinkFormSubmitted: boolean = false;
  selectedMemberType: any = "";
  paymentMemberTypes: any = [];
  showExistingUser: boolean = false;
  selectedExistingUser: any = "";
  isLinkProcessing: boolean = false;
  paymentLink: any;
  paymentLinkCopied: boolean = false;
  invalidEmail: boolean = false;
  showSendPaymentLinkModal: boolean = false;
  hasCustomInvoice: boolean = false;
  showAlsoTeamManagerOption: boolean = false;
  alsoTeamManager: boolean = false;
  team_managers: any = [];
  hasAffiliates: boolean = false;
  generateLinkMode: any = "";
  showLogo: boolean = false;
  membersAll: any = [];
  members: any = [];
  membersForApproval: any = [];
  membersForConfirm: any = [];
  membersExpired: any = [];
  membersCancelled: any = [];
  membersFailed: any = [];
  membersDeleted: any = [];
  membersNotApproved: any = [];
  membersIncomplete: any = [];
  membersAll2: any = [];
  members2: any = [];
  membersForApproval2: any = [];
  membersForConfirm2: any = [];
  membersExpired2: any = [];
  membersCancelled2: any = [];
  membersFailed2: any = [];
  membersDeleted2: any = [];
  membersNotApproved2: any = [];
  membersIncomplete2: any = [];
  superAdmins: any = [];
  tutores: any = [];
  roleGroups: any = [];
  memberRoleGroups: any = [];
  hasProfileImageField: boolean = false;
  hasCompanyImageField: boolean = false;
  memberTypeId: any;
  customMemberType: any;
  superAdmin: boolean = false;
  startups: any = [];
  company_subfeatures = [];
  subfeature_id_global: number = 0;
  feature_global: string = "";
  showClubsDropdown: boolean = false;
  selectedClubPresidentGroup: any = "";
  cities: any = [];
  selectedCityFilter: any = "";
  selectedCityFilterCampus: any;
  hasCRM: boolean = false;
  newUserForm: any;
  showEditUserStatusModal: boolean = false;
  userStatusFormSubmitted: boolean = false;
  selectedUserStatus: any = "";
  selectedUserStatusRole: any = "";
  bulkSelection: any = 0;
  isUserStatusUpdateProcessing: boolean = false;
  hasConfirmEmail: boolean = false;
  hasBuddy: boolean = false;
  isMentor: boolean = false;
  mentors: any = [];
  datePipe = new DatePipe("en-US");
  startDate: any;
  showPassword: boolean = false;
  allUserMemberTypes: any = [];
  tutor: boolean = false;
  superTutor: boolean = false;
  potSuperTutor: boolean = false;
  tutorDropDownSettings: any;
  selectedAssignedTutor: any = "";
  tutorToAssign: any = [];
  tutorToAssign2: any = [];
  courseCreditSetting: boolean = false;
  courseCredits: any;
  remainingCourseCredits: any;
  tutorsFeatureId: any;
  hasTutors: boolean = false;
  isSuperAdmin: boolean = false;
  studentDropDownSettings: any;
  selectedAssignedStudent: any = "";
  studentToAssign: any = [];
  studentToAssign2: any = [];
  filteredMembers: any = [];
  allMembers: any = [];
  showAssignTutorModal: boolean = false;
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  courses: any = [];
  selectedCourses: any = [];
  courseDropDownSettings: any;
  selectedTutor: any;
  hasClubs: boolean = false;
  clubsFeature: any;
  clubsFeatureId: any;
  buddyFeature: any;
  buddyFeatureId: any;
  tutorsFeature: any;
  canShareRegistrationLink: boolean = false;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  fieldTextType: boolean = false;
  dialogTitle: any;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  company: any;
  dialogMode: string = "";
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
  | ElementRef
  | undefined;
  selectedConfirmItem: any;
  selectedConfirmMode: string = "";
  customMemberProfileFields: any;
  isGuardianType: boolean = false;
  coursesFeatureId: any;
  hasCourses: boolean = false;
  hasCategoryAccess: boolean = false;
  hasCourseCategories: boolean = false;
  courseCategories: any = [];
  courseCategoryMapping: any;
  separateCourseCredits: boolean = false;
  courseCreditsList: any = [];
  courseCategoriesAccessRoles: any;
  courseSubscriptions: any;
  courseExceptionUser: any;
  userCourseCredits: any;
  userTypeName: any;
  coursesFeature: any;
  roleMemberGroupChanged: boolean = false;
  newSelectedRole: any;
  allCourses: any;
  filteredCourses: any;
  tabIndex = 0;
  tabSelected: boolean = false;
  assignedStudents: any;
  hasAddedUser: boolean = false;
  createdUserId: any;
  currentUser: any;
  selectedOperation: any;
  netculturaUsersList: any = [];
  netculturaPeople: any = [];
  adminSedeCity: any;
  customMemberTypes :any;
  userRoleType:any;
  customMemberTypeId:any;
  showCreditIcon :boolean = false;
  potTutor:boolean = false;
  isOpenContact:boolean= false;
  contracts: any;
  contract: any;
  searchOptions = {
    keys: [{
      name: 'normalized_first_name',
      weight: 0.2
    }, {
      name: 'normalized_last_name',
      weight: 0.2
    }, {
      name: 'normalized_name',
      weight: 0.2
    }, {
      name: 'email',
      weight: 0.2
    }, {
      name: 'recordStatus',
      weight: 0.2
    }]
  };

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _userService: UserService,
    private _clubsService: ClubsService,
    private _tutorsService: TutorsService,
    private _coursesService: CoursesService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _excelService: ExcelService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
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
      this.domain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
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
    initFlowbite();
    this.tutorDropDownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      itemsShowLimit: 3,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.courseDropDownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "title",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      itemsShowLimit: 3,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search')
    };
    this.studentDropDownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      itemsShowLimit: 3,
      allowSearchFilter: true,
      limitSelection: 300,
      searchPlaceholderText: this._translateService.instant('guests.search')
    };
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: this.language == "en" ? "name_EN" : "name_ES",
      limitSelection: 4,
      itemsShowLimit: 4,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.categoryDropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.fetchManageUsersData();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant("company-settings.users");
    this.level3Title = this._translateService.instant(
      "company-settings.members"
    );
    this.level4Title = "";
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchManageUsersData() {
    this._userService
      .fetchManageUsersData(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data);
          this.customMemberTypeId = data?.user?.custom_member_type_id ? data.user.custom_member_type_id: ''
          this.mapUserPermissions(data?.user_permissions);
          this.mapSettings(data);
          this.adminSedeCity = data?.user?.city ? data.user.city : '' 
          this.cities = data?.cities;
          this.superAdmins = data?.super_admins;
          this.customMemberProfileFields = data?.custom_member_profile_fields;
          this.courseCategories = data?.course_categories;
          this.courseCategoryMapping = data?.course_category_mapping;
          this.courseCategoriesAccessRoles = data?.course_category_access_roles;
          this.customMemberTypes = data?.member_types ? data?.member_types : [];
          this.showCredits(data)
          this.initializeIconFilterList(this.cities);
          this.getUserType()
          this.getContract()
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getContract() {
    this._companyService
    .getCompanyContracts(this.companyId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (data) => {
        this.contracts = data.contracts
      },
      (error) => {
          console.log(error);
        }
      );
  }

  showCredits(data){
    const featureToCheck = [
      {
        feature_id:20,
        subfeatuers:[140,141],
        title:"tutors"
      }
    ]

    const featuredList = data?.features_mapping?.map(e=> e?.feature_id)
    const isFeatureExsist = featureToCheck?.every(feature => featuredList.includes(feature?.feature_id));

    if(isFeatureExsist){
      const subfeaturedList = data?.settings?.subfeatures.map(e=> e?.subfeature_id)
      const isSubfeatureExist = featureToCheck?.some(feature => {
        return feature?.subfeatuers?.some(subfeature => subfeaturedList.includes(subfeature));
      });
      if(isFeatureExsist && isSubfeatureExist){
        this.showCreditIcon = true
      }
    }
  }

  mapFeatures(features) {
    this.clubsFeature = features?.find(
      (f) => f.feature_id == 5 && f.status == 1
    );
    this.clubsFeatureId = this.clubsFeature?.feature_id;
    this.hasClubs = this.clubsFeatureId > 0 ? true : false;

    this.buddyFeature = features?.find(
      (f) => f.feature_id == 19 && f.status == 1
    );
    this.buddyFeatureId = this.buddyFeature?.feature_id;
    this.hasBuddy = this.buddyFeatureId > 0 ? true : false;

    this.tutorsFeature = features?.find(
      (f) => f.feature_id == 20 && f.status == 1
    );
    this.tutorsFeatureId = this.tutorsFeature?.feature_id;
    this.hasTutors = this.tutorsFeatureId > 0 ? true : false;

    this.coursesFeature = features?.find(
      (f) => f.feature_id == 11 && f.status == 1
    );
    this.coursesFeatureId = this.tutorsFeature?.feature_id;
    this.hasCourses = this.coursesFeatureId > 0 ? true : false;

    if(this.hasTutors) { this.getTutors() }
    if(this.hasCourses) { this.getCourses() }
  }

  mapSubfeatures(data: any) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.countryDropdown = subfeatures.some(
        (a) => a.name_en == "Country" && a.active == 1
      );
      this.hasMemberCommissions = subfeatures.some(
        (a) => a.name_en == "Commissions" && a.active == 1
      );
      this.hasOneToOne = subfeatures.some(
        (a) => a.name_en == "One to one" && a.active == 1
      );
      this.courseCreditSetting = subfeatures.some(
        (a) => a.name_en == "Credits" && a.active == 1
      );
      this.hasCategoryAccess = subfeatures.some(
        (a) => a.name_en == "Category access" && a.active == 1
      );
      this.separateCourseCredits = subfeatures.some(
        (a) => a.name_en == "Separate credits by course" && a.active == 1
      );
    }

    if (this.countryDropdown) {
      this.countries = data?.countries;
    }
  }

  mapUserPermissions(user_permissions: any) {
    this.isSuperAdmin =  user_permissions?.super_admin_user ? true : false;
  }

  mapSettings(data) {
    let other_settings = data?.settings?.other_settings;
    if (other_settings?.length) {
      this.hasMemberContract = other_settings.some(
        (a) => a.title_en == "Country" && a.active == 1
      );
      this.hasRegistrationFields = other_settings.some(
        (a) => a.title_en == "Registration fields" && a.active == 1
      );
      this.hasConfirmEmail = other_settings.some(
        (a) => a.title_en == "Confirm email address" && a.active == 1
      );
      this.hasProfileFields = other_settings.some(
        (a) => a.title_en == "Profile fields" && a.active == 1
      );
      this.hasCustomMemberTypeSettings = other_settings.some(
        (a) =>
          a.title_en == "Require Stripe payment on specific member types" &&
          a.active == 1
      );
      this.hasCRM = other_settings.some(
        (a) => a.title_en == "CRM" && a.active == 1
      );
      this.initializeMemberRoles();

      this.getMembers();
      if (this.hasRegistrationFields) {
        this.businessCategories = data?.business_categories;
        this.getRegistrationFields(data);
      } else {
        if (this.hasProfileFields) {
          this.getProfileFields(data);
        } else {
          this.initializeDefaultForm();
        }
      }

      if(this.companyId == 12) {
        this.hasCustomMemberTypeSettings = true;
      }
      if (this.hasCustomMemberTypeSettings) {
        this.getCustomMemberTypes(data?.member_types);
      }
    }
  }

  initializeIconFilterList(list) {
    if(list?.length > 0) {
      this.citiesList = [
        {
          id: "All",
          value: "",
          text: this._translateService.instant("plans.all"),
          selected: true,
          company_id: this.companyId,
          city: "",
          province: "",
          region: "",
          country: "",
          sequence: "",
          campus: "",
        },
      ];

      list?.forEach((item) => {
        this.citiesList.push({
          id: item.id,
          value: item.id,
          text: item.city,
          selected: false,
          company_id: item.company_id,
          city: item.city,
          province: item.province,
          region: item.region,
          country: item.country,
          sequence: item.sequence,
          campus: item.campus,
        });
      });
    }
  }

  async getCustomMemberTypes(member_types) {
    this.memberTypes = member_types;
    this.memberRoles = [];
    if (this.memberTypes) {
      this.memberTypes.forEach((mt) => {
        this.memberRoles.push({
          id: mt.id,
          role: mt.type_es,
        });
        if (mt.require_approval == 1) {
          this.requireApproval = true;
        }
        if (mt.require_payment == 1) {
          this.requirePayment = true;
        }
        if (mt.expire_days > 0) {
          this.hasExpiration = true;
        }
      });
    }
    if (this.memberTypes?.length > 0) {
      this.memberTypes.sort((a, b) => {
        if (a.type_es < b.type_es) {
          return -1;
        }

        if (a.type_es > b.type_es) {
          return 1;
        }

        return 0;
      });
    }
    if (this.memberRoles?.length > 0) {
      this.memberRoles.sort((a, b) => {
        if (a.role < b.role) {
          return -1;
        }

        if (a.role > b.role) {
          return 1;
        }

        return 0;
      });
    }

    const columns = this.memberDisplayedColumns;
    const index = columns.indexOf("recordStatus");
    if (index != -1) {
      // if (this.requirePayment) {
      //   this.memberDisplayedColumns.splice(index, 0, "created", "reactivate");
      // } else {
        this.memberDisplayedColumns.splice(index, 0, "created");
      // }
      // if (this.requirePayment) {
      //   this.memberDisplayedColumns.splice(index + 1, 0, "duration", "finish");
      // }
    }
  }

  getMembers(refresh: boolean = false) {
    this.members = [];
    this._userService.getCombinedMiembrosListPrefetch(this.companyId).subscribe(
      async (response) => {
        console.log(response)
        this.members = response[0] ? response[0]["all_members"] : [];
        if(this.members?.length > 0 && !this.currentUser && this.userId) {
          let current_user = this.members?.filter(member => {
            return member.id == this.userId
          })
          let current = current_user?.length > 0 ? current_user[0] : ''
          if(current && current.custom_member_type_id == 243) {
            this.currentUser = current
          }
        }

        let all_members = this.members;
        let members_expired: any[] = [];
        let members_cancelled: any[] = [];
        let members_failed: any[] = [];

        if (all_members) {
          let allmembers: any = [];
          all_members.forEach((m) => {
            let include = true;

            if (m.expire_days && m.expire_days > 0) {
              let a;
              if (m.last_renewal_date) {
                a = moment(m.last_renewal_date).add(m.expire_days + 1, "days");
              } else {
                a = moment(m.created).add(m.expire_days + 1, "days");
              }
              var b = moment(new Date());
              let diff = a.diff(b, "days");

              let difference = "";
              if (diff > 0) {
              } else if (diff <= 0) {
                if (
                  this.allUserMemberTypes &&
                  this.allUserMemberTypes.length > 0
                ) {
                  let user_member_types =
                    this.allUserMemberTypes &&
                    this.allUserMemberTypes.filter((aumt) => {
                      return aumt.user_id == m.id;
                    });
                  if (user_member_types && user_member_types.length > 0) {
                    let user_member_types_count = user_member_types.length;
                    let expired_count = 0;

                    user_member_types.forEach((umt) => {
                      const cmt =
                        this.memberTypes &&
                        this.memberTypes.filter((cm) => {
                          return cm.id == umt.custom_member_type_id;
                        });
                      if (cmt && cmt[0] && cmt[0].expire_days > 0) {
                        let created = moment(umt.created_at, "YYYY-MM-DD");
                        let today = moment(new Date(), "YYYY-MM-DD");

                        let diff = Math.floor(
                          moment.duration(today.diff(created)).asDays()
                        );
                        if (diff > cmt[0].expire_days) {
                          expired_count += 1;
                        }
                      }
                    });

                    if (expired_count == user_member_types_count) {
                      // All memberships expired
                      include = false;
                    }
                  } else {
                    include = false;
                  }
                } else {
                  include = false;
                }
              }
            }

            let cancelled = false;
            let failed = false;
            if (m.cancelled && m.cancelled_date) {
              include = false;
              cancelled = true;
            } else if (m.failed_payment && m.failed_payment_date) {
              include = false;
              failed = true;
            }

            if (include) {
              allmembers.push(m);
            } else {
              if (cancelled) {
                members_cancelled.push(m);
              } else if (failed) {
                members_failed.push(m);
              } else {
                members_expired.push(m);
              }
            }
          });

          all_members = allmembers;
          allmembers =
            allmembers?.length > 0 &&
            allmembers.filter((alm) => {
              let include = true;
              this.membersNotApproved.forEach((mna) => {
                if (mna.id == alm.id) {
                  include = false;
                }
              });
              if (include) {
                return alm;
              }
            });
          this.members = allmembers;
        }

        if (this.requirePayment) {
          this.members =
            this.members &&
            this.members.map((i) => ({
              ...i,
              duration:
                i.custom_member_type_id > 0
                  ? this.getMembershipDuration(i)
                  : "",
              end: i.custom_member_type_id > 0 ? this.getMembershipEnd(i) : "",
              invitedby: i.invited_by_name
                ? i.invited_by_name
                : i.invited_by_guid && !i.invited_by_name
                ? this.getInvitedBy(all_members, i.invited_by_guid)
                : "",
            }));
        }

        this.members = this.members.filter((data) => {
          let include = true;
          let failed = false;
          let difference = 0;
          let a;
          if (data.duration && data.end) {
            let duration = Number(data.duration.split(" ")[0]);
            if (data.last_renewal_date) {
              a = moment(data.last_renewal_date).add(duration + 1, "days");
            } else {
              a = moment(data.created).add(duration + 1, "days");
            }
            var b = moment(new Date());
            let diff = a.diff(b, "days");
            difference = diff;
            if (diff > 0) {
              include = true;
            } else if (diff <= 0 && data.failed_payment == 1) {
              include = false;
              failed = true;
            }
          }
          if (failed) {
            members_failed.push(data);
          }
          if (include && difference <= 0 && data.expire_days > 0) {
            data.end = "";
            data.duration = this.getUpdatedDuration(data);
          }
          return include;
        });
        this.membersForConfirm = response[1] ? response[1]["all_members"] : [];
        this.membersDeleted = response[2] ? response[2]["all_members"] : [];
        this.membersNotApproved = response[3] ? response[3]["all_members"] : [];
        this.membersIncomplete = response[4] ? response[4]["all_members"] : [];

        // Remove duplicates
        if (this.membersIncomplete?.length > 0) {
          let incomplete: any[] = [];
          this.membersIncomplete.forEach((mi) => {
            let match = incomplete.some(
              (a) => a.id === mi.id || a.email == mi.email
            );
            if (!match) {
              incomplete.push(mi);
            }
          });
          this.membersIncomplete = incomplete;
        }

        this.membersForApproval = response[5] ? response[5]["all_members"] : [];
        this.membersForApproval = this.removeIncomplete(
          this.membersForApproval
        );

        // Remove incomplete from For confirmation view
        if (
          this.membersForConfirm?.length > 0 &&
          this.membersIncomplete?.length > 0
        ) {
          this.membersForConfirm =
            this.membersForConfirm?.length > 0 &&
            this.membersForConfirm.filter((me) => {
              let include = true;
              this.membersIncomplete.forEach((mna) => {
                if (mna.id == me.id) {
                  include = false;
                }
              });
              if (include) {
                return me;
              }
            });
        }

        this.membersExpired = members_expired;
        if (this.requirePayment) {
          this.membersExpired =
            this.membersExpired &&
            this.membersExpired.map((i) => ({
              ...i,
              duration:
                i.custom_member_type_id > 0
                  ? this.getMembershipDuration(i)
                  : "",
              end: i.custom_member_type_id > 0 ? this.getMembershipEnd(i) : "",
            }));
        }

        this.membersCancelled = members_cancelled;
        this.membersCancelled =
          this.membersCancelled &&
          this.membersCancelled.map((i) => ({
            ...i,
            duration:
              i.custom_member_type_id > 0 ? this.getMembershipDuration(i) : "",
            end: i.custom_member_type_id > 0 ? this.getMembershipEnd(i) : "",
          }));

        this.membersFailed = members_failed;
        this.membersFailed =
          this.membersFailed &&
          this.membersFailed.map((i) => ({
            ...i,
            duration:
              i.custom_member_type_id > 0 ? this.getMembershipDuration(i) : "",
            end: i.custom_member_type_id > 0 ? this.getMembershipEnd(i) : "",
          }));

        this.members = this.members.map((i) => ({
          ...i,
          normalized_name: this.normalizeCase(i.name),
          normalized_first_name: this.normalizeCase(i.first_name?.toLowerCase()),
          normalized_last_name: this.normalizeCase(i.last_name?.toLowerCase()),
          recordStatus: "company-settings.active",
        }));
        this.allMembers = this.members;
        this.filteredMembers = this.allMembers;
        this.membersForApproval = this.membersForApproval
          ? this.membersForApproval.map((i) => ({
              ...i,
              recordStatus: "company-settings.forapproval",
            }))
          : [];
        this.membersForConfirm = this.membersForConfirm.map((i) => ({
          ...i,
          recordStatus: "company-settings.foremailconfirmation",
        }));
        this.membersDeleted = this.membersDeleted.map((i) => ({
          ...i,
          recordStatus: "company-settings.deleted",
        }));
        this.membersNotApproved = this.membersNotApproved.map((i) => ({
          ...i,
          recordStatus: "company-settings.notapproved",
        }));
        this.membersIncomplete = this.membersIncomplete.map((i) => ({
          ...i,
          recordStatus: "company-settings.incomplete",
        }));
        this.membersExpired = this.membersExpired.map((i) => ({
          ...i,
          recordStatus: "company-settings.expired",
        }));
        this.membersCancelled = this.membersCancelled.map((i) => ({
          ...i,
          recordStatus: "company-settings.cancelled",
        }));
        this.membersFailed = this.membersFailed.map((i) => ({
          ...i,
          recordStatus: "company-settings.failedpayments",
        }));

        this.membersAll = []
          .concat(this.members)
          .concat(this.membersForApproval)
          .concat(this.membersForConfirm)
          .concat(this.membersDeleted)
          .concat(this.membersNotApproved)
          .concat(this.membersIncomplete)
          .concat(this.membersExpired)
          .concat(this.membersCancelled)
          .concat(this.membersFailed);
        this.membersAll.sort((a, b) => a.name.localeCompare(b.name));

        this.membersAll2 = this.membersAll;
        this.members2 = this.members;
        this.membersForApproval2 = this.membersForApproval;
        this.membersForConfirm2 = this.membersForConfirm;
        this.membersDeleted2 = this.membersDeleted;
        this.membersNotApproved2 = this.membersNotApproved;
        this.membersIncomplete2 = this.membersIncomplete;
        this.membersExpired2 = this.membersExpired;
        this.membersExpired2 =
          this.membersExpired2?.length > 0 &&
          this.membersExpired2.filter((me) => {
            let include = true;
            this.membersNotApproved2.forEach((mna) => {
              if (mna.id == me.id) {
                include = false;
              }
            });
            if (include) {
              return me;
            }
          });
        this.membersCancelled2 = this.membersCancelled;
        this.membersFailed2 = this.membersFailed;

        if (this.companyId == 12) {
          this.getInvitedByPeople();
          this.getNetculturaUsers();
        }

        if(this.searchKeyword) {
          this.members = this.filterSearchKeyword(this.members);
        }

        if (refresh) {
          this.filterMembers();
        } else {
          if (this.memberStatusFilter == "Incomplete") {
            this.dataSource = new MatTableDataSource(this.membersIncomplete);
          } else {
            this.dataSource = new MatTableDataSource(
              this.members.slice(
                this.pageIndex * this.pageSize,
                this.pageIndex + 1 * this.pageSize
              )
            );
          }

          if (this.sort) {
            this.dataSource.sort = this.sort;
          } else {
            setTimeout(() => (this.dataSource.sort = this.sort));
          }
          if (this.paginator) {
            new MatTableDataSource(this.members).paginator = this.paginator;
            this.paginator.firstPage();
          } else {
            setTimeout(() => {
              if (this.paginator) {
                new MatTableDataSource(this.members).paginator = this.paginator;
                this.paginator.firstPage();
              }
            }, 500);
          }
        }

        this.initializeButtonGroup();
        this.isUsersLoading = false;
      },
      (error) => {
        console.log(error);
        this.isloading = false;
      }
    );
  }

  getNetculturaUsers() {
    this._userService.netculturaUsersList()
      .subscribe(
        response => {
          this.netculturaUsersList = response.people
          if(this.members) {
            this.members.forEach(m => {
              let match = this.netculturaPeople.some(a => a.name === m.name);
              if(!match) {
                let spmatch = this.netculturaUsersList && this.netculturaUsersList.some(a => a.id === m.id)
                if(spmatch) {
                  if(m.user_role == 'Member') {
                    m.user_role = 'Netcultura'
                  }
                }
                this.netculturaPeople.push(m)
              }
            });
          }
          this.netculturaPeople = this.netculturaPeople.sort((a, b) => {
            if (a.name < b.name) {
                return -1
            }
      
            if (a.name > b.name) {
                return 1
            }
      
            return 0
          })
        },
        error => {
          console.log(error)
        }
      )
  }

  changeCustomMemberTypeRoleFilter(event) {
    this.filterMembers();
  }

  filterMembers() {
    let members = this.membersAll;
    this.getActiveMembers(this.membersAll);
    this.members2 = this.members;
    this.membersForApproval2 = this.membersForApproval;
    this.membersForConfirm2 = this.membersForConfirm;
    this.membersExpired2 = this.filterExpired(this.membersExpired);
    this.membersCancelled2 = this.filterCancelled(this.membersCancelled);
    this.membersDeleted2 = this.membersDeleted;
    this.membersFailed2 = this.membersFailed;
    this.membersNotApproved2 = this.membersNotApproved;
    this.membersIncomplete2 = this.membersIncomplete;

    if (this.memberStatusFilter) {
      if (this.memberStatusFilter == "Active") {
        members = this.members;
      } else if (this.memberStatusFilter == "Approval") {
        members = this.membersForApproval;
      } else if (this.memberStatusFilter == "Confirm") {
        members = this.membersForConfirm;
      } else if (this.memberStatusFilter == "Expired") {
        members = this.filterExpired(this.membersExpired);
      } else if (this.memberStatusFilter == "Cancelled") {
        members = this.filterCancelled(this.membersCancelled);
      } else if (this.memberStatusFilter == "Deleted") {
        members = this.membersDeleted;
      } else if (this.memberStatusFilter == "Failed") {
        members = this.membersFailed;
      } else if (this.memberStatusFilter == "NotApproved") {
        members = this.membersNotApproved;
      } else if (this.memberStatusFilter == "Incomplete") {
        members = this.membersIncomplete;
      }
    }

    if (this.searchKeyword) {
      members = this.filterSearchKeyword(members);
      let fuse = new Fuse(members, this.searchOptions);
      let filtered_search = fuse.search(this.normalizeCase(this.searchKeyword));
      members = []
      filtered_search?.forEach(item => {
        members.push(item?.item)
      })
    }
    if (this.selectedCustomMemberTypeRole) {
      members = this.filterRole(members);
    }
    if (this.selectedCityFilterCampus || this.selectedCityFilter) {
      members = this.filterCampus(members);
    }

    this.refreshDataSource(members);
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.members.slice(
        event.pageIndex * event.pageSize,
        (event.pageIndex + 1) * event.pageSize
        )
        );
        if (this.sort) {
          this.dataSource.sort = this.sort;
        } else {
          setTimeout(() => (this.dataSource.sort = this.sort));
        }
  
  }

  refreshDataSource(members) {
    this.updateLists();
    this.members = members;
    this.members2 = members;
    this.dataSource = new MatTableDataSource(
      members.slice(
        this.pageIndex * this.pageSize,
        this.pageIndex + 1 * this.pageSize
      )
    );
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort));
    }
    if (this.paginator) {
      new MatTableDataSource(members).paginator = this.paginator;
      this.paginator.firstPage();
    } else {
      setTimeout(() => {
        if (this.paginator) {
          new MatTableDataSource(members).paginator = this.paginator;
          this.paginator.firstPage();
        }
      });
    }
  }

  updateLists() {
    let members2 = this.members2;
    let membersForApproval2 = this.membersForApproval2;
    let membersForConfirm2 = this.membersForConfirm2;
    let membersDeleted2 = this.membersDeleted2;
    let membersNotApproved2 = this.membersNotApproved2;
    let membersIncomplete2 = this.membersIncomplete2;
    let membersExpired2 = this.membersExpired2;
    let membersCancelled2 = this.membersCancelled2;
    let membersFailed2 = this.membersFailed2;

    if (this.searchKeyword) {
      members2 = this.filterSearchKeyword(members2);
      membersForApproval2 = this.filterSearchKeyword(membersForApproval2);
      membersForConfirm2 = this.filterSearchKeyword(membersForConfirm2);
      membersDeleted2 = this.filterSearchKeyword(membersDeleted2);
      membersNotApproved2 = this.filterSearchKeyword(membersNotApproved2);
      membersIncomplete2 = this.filterSearchKeyword(membersIncomplete2);
      membersExpired2 = this.filterSearchKeyword(membersExpired2);
      membersCancelled2 = this.filterSearchKeyword(membersCancelled2);
      membersFailed2 = this.filterSearchKeyword(membersFailed2);
    }

    if (this.selectedCustomMemberTypeRole) {
      members2 = this.filterRole(members2);
      membersForApproval2 = this.filterRole(membersForApproval2);
      membersForConfirm2 = this.filterRole(membersForConfirm2);
      membersDeleted2 = this.filterRole(membersDeleted2);
      membersNotApproved2 = this.filterRole(membersNotApproved2);
      membersIncomplete2 = this.filterRole(membersIncomplete2);
      membersExpired2 = this.filterRole(membersExpired2);
      membersCancelled2 = this.filterRole(membersCancelled2);
      membersFailed2 = this.filterRole(membersFailed2);
    }

    if (this.selectedCityFilterCampus) {
      members2 = this.filterCampus(members2);
      membersForApproval2 = this.filterCampus(membersForApproval2);
      membersForConfirm2 = this.filterCampus(membersForConfirm2);
      membersDeleted2 = this.filterCampus(membersDeleted2);
      membersNotApproved2 = this.filterCampus(membersNotApproved2);
      membersIncomplete2 = this.filterCampus(membersIncomplete2);
      membersExpired2 = this.filterCampus(membersExpired2);
      membersCancelled2 = this.filterCampus(membersCancelled2);
      membersFailed2 = this.filterCampus(membersFailed2);
    }

    this.members2 = members2;
    this.membersForApproval2 = membersForApproval2;
    this.membersForConfirm2 = membersForConfirm2;
    this.membersDeleted2 = membersDeleted2;
    this.membersNotApproved2 = membersNotApproved2;
    this.membersIncomplete2 = membersIncomplete2;
    this.membersExpired2 = membersExpired2;
    this.membersCancelled2 = membersCancelled2;
    this.membersFailed2 = membersFailed2;
  }

  filterExpired(expired) {
    let result = expired;
    if (this.membersDeleted && this.membersDeleted.length > 0) {
      result =
        result &&
        result.filter((member) => {
          let match = this.membersDeleted.some((a) => a.id === member.id);
          return !match;
        });
    }

    if (this.membersForApproval && this.membersForApproval.length > 0) {
      result =
        result &&
        result.filter((member) => {
          let match = this.membersForApproval.some((a) => a.id === member.id);
          return !match;
        });
    }

    if (this.membersIncomplete && this.membersIncomplete.length > 0) {
      result =
        result &&
        result.filter((member) => {
          let match = this.membersIncomplete.some((a) => a.id === member.id);
          return !match;
        });
    }

    if (this.membersForConfirm && this.membersForConfirm.length > 0) {
      result =
        result &&
        result.filter((member) => {
          let match = this.membersForConfirm.some((a) => a.id === member.id);
          return !match;
        });
    }

    if (this.membersNotApproved && this.membersNotApproved.length > 0) {
      result =
        result &&
        result.filter((member) => {
          let match = this.membersNotApproved.some((a) => a.id === member.id);
          return !match;
        });
    }

    return result;
  }

  filterCancelled(cancelled) {
    let result = cancelled;
    if (this.membersDeleted && this.membersDeleted.length > 0) {
      result =
        result &&
        result.filter((member) => {
          let match = this.membersDeleted.some((a) => a.id === member.id);
          return !match;
        });
    }

    if (this.membersForApproval && this.membersForApproval.length > 0) {
      result =
        result &&
        result.filter((member) => {
          let match = this.membersForApproval.some((a) => a.id === member.id);
          return !match;
        });
    }

    if (this.membersNotApproved && this.membersNotApproved.length > 0) {
      result =
        result &&
        result.filter((member) => {
          let match = this.membersNotApproved.some((a) => a.id === member.id);
          return !match;
        });
    }

    return result;
  }
  
  filterSearchKeyword(members) {
    if (members?.length > 0) {
      return members.filter((m) => {
        let include = false;
        if (
          (m.name &&
            (m.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            ||
            searchSpecialCase(this.searchKeyword, m.name)
            )
            ) ||
          (m.first_name &&
            (m.first_name
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0
              ||
              searchSpecialCase(this.searchKeyword, m.first_name)
              )
              ) ||
          (m.last_name &&
           (( m.last_name
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0)
              ||
              (searchSpecialCase(this.searchKeyword, m.last_name))
              )
              ) ||
          (m.startup_name &&
            m.startup_name
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (m.founder_name &&
            m.founder_name
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (m.email &&
            m.email.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >=
              0) ||
          (m.recordStatus &&
            this._translateService.instant(m.recordStatus)?.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >=
              0) ||
          (m.user_role &&
            this.getTranslatedRole(m)?.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >=
              0)
        ) {
          include = true;
        }

        return include;
      });
    }
  }

  filterRole(members) {
    if (members) {
      if (this.selectedCustomMemberTypeRole == "Premium-Expert") {
        return members.filter((m) => {
          return m.user_role == "Premium" || m.user_role == "Expert@";
        });
      } else {
        return members.filter((m) => {
          return m.user_role == this.selectedCustomMemberTypeRole;
        });
      }
    }
  }

  filterCampus(members) {
    if (members) {
      return members.filter((m) => {
        let include = false;

        if (this.companyId == 32) {
          if (m.canonical_name) {
            if (this.selectedCityFilterCampus.indexOf(",") > 0) {
              let campus = this.selectedCityFilterCampus.split(",");
              let match =
                campus && campus.some((a) => m.canonical_name.indexOf(a) >= 0);
              if (match) {
                include = true;
              }
            } else if (
              m.canonical_name.indexOf(this.selectedCityFilterCampus) >= 0
            ) {
              include = true;
            }
          }
        } else {
          if (this.selectedCityFilterCampus) {
            if (
              m.city &&
              m.city
                .toLowerCase()
                .indexOf(this.selectedCityFilterCampus.toLowerCase()) >= 0
            ) {
              include = true;
            }
          }

          if (this.selectedCityFilter) {
            if (
              m.city &&
              m.city
                .toLowerCase()
                .indexOf(this.selectedCityFilter.toLowerCase()) >= 0
            ) {
              include = true;
            }
            if (this.cities?.length > 0 && !include) {
              let selectedCityRow = this.cities.filter((city) => {
                return city.id == this.selectedCityFilter;
              });
              if (selectedCityRow?.length > 0) {
                let selectedCity = selectedCityRow[0].city;
                if (selectedCity) {
                  if (
                    m.city &&
                    m.city.toLowerCase().indexOf(selectedCity.toLowerCase()) >=
                      0
                  ) {
                    include = true;
                  }
                }
              }
            }
          }
        }

        return include;
      });
    }
  }

  getActiveMembers(members) {
    let all_members = members;
    let members_expired: any[] = [];
    let members_cancelled: any[] = [];
    let members_failed: any[] = [];

    if (all_members) {
      let allmembers: any = [];
      all_members.forEach((m) => {
        let include = true;

        if (m.expire_days && m.expire_days > 0) {
          let a;
          if (m.last_renewal_date) {
            a = moment(m.last_renewal_date).add(m.expire_days + 1, "days");
          } else {
            a = moment(m.created).add(m.expire_days + 1, "days");
          }
          var b = moment(new Date());
          let diff = a.diff(b, "days");

          let difference = "";
          if (diff > 0) {
          } else if (diff <= 0) {
            if (this.allUserMemberTypes && this.allUserMemberTypes.length > 0) {
              let user_member_types =
                this.allUserMemberTypes &&
                this.allUserMemberTypes.filter((aumt) => {
                  return aumt.user_id == m.id;
                });
              if (user_member_types && user_member_types.length > 0) {
                let user_member_types_count = user_member_types.length;
                let expired_count = 0;

                user_member_types.forEach((umt) => {
                  const cmt =
                    this.memberTypes &&
                    this.memberTypes.filter((cm) => {
                      return cm.id == umt.custom_member_type_id;
                    });
                  if (cmt && cmt[0] && cmt[0].expire_days > 0) {
                    let created = moment(umt.created_at, "YYYY-MM-DD");
                    let today = moment(new Date(), "YYYY-MM-DD");

                    let diff = Math.floor(
                      moment.duration(today.diff(created)).asDays()
                    );
                    if (diff > cmt[0].expire_days) {
                      expired_count += 1;
                    }
                  }
                });

                if (expired_count == user_member_types_count) {
                  // All memberships expired
                  include = false;
                }
              } else {
                include = false;
              }
            } else {
              include = false;
            }
          }
        }

        let cancelled = false;
        let failed = false;
        if (m.cancelled && m.cancelled_date) {
          include = false;
          cancelled = true;
        } else if (m.failed_payment && m.failed_payment_date) {
          include = false;
          failed = true;
        }

        if (m.deleted_by || m.status != 1) {
          include = false;
        }

        if (include) {
          allmembers.push(m);
        } else {
          if (cancelled) {
            members_cancelled.push(m);
          } else if (failed) {
            members_failed.push(m);
          } else {
            if (m.expire_days > 0 && m.status == 1) {
              members_expired.push(m);
            }
          }
        }
      });
      allmembers =
        allmembers?.length > 0 &&
        allmembers.filter((alm) => {
          let include = true;
          this.membersNotApproved.forEach((mna) => {
            if (mna.id == alm.id) {
              include = false;
            }
          });
          this.membersDeleted.forEach((md) => {
            if (md.id == alm.id) {
              include = false;
            }
          });
          this.membersIncomplete.forEach((mi) => {
            if (mi.id == alm.id) {
              include = false;
            }
          });
          this.membersForApproval.forEach((mfa) => {
            if (mfa.id == alm.id) {
              include = false;
            }
          });
          this.membersForConfirm.forEach((mfc) => {
            if (mfc.id == alm.id) {
              include = false;
            }
          });
          if (include) {
            return alm;
          }
        });

      allmembers =
        allmembers &&
        allmembers.filter((data) => {
          let include = true;
          let failed = false;
          let difference = 0;
          let a;
          if (data.duration && data.end) {
            let duration = Number(data.duration.split(" ")[0]);
            if (data.last_renewal_date) {
              a = moment(data.last_renewal_date).add(duration + 1, "days");
            } else {
              a = moment(data.created).add(duration + 1, "days");
            }
            var b = moment(new Date());
            let diff = a.diff(b, "days");
            difference = diff;
            if (diff > 0) {
              include = true;
            } else if (diff <= 0 && data.failed_payment == 1) {
              include = false;
              failed = true;
            }
          }
          if (failed) {
            members_failed.push(data);
          }
          if (include && difference <= 0 && data.expire_days > 0) {
            data.end = "";
            data.duration = this.getUpdatedDuration(data);
          }
          return include;
        });
      all_members = allmembers;
      this.members = all_members;
      this.membersExpired = members_expired;
      this.membersCancelled = members_cancelled;
      this.membersFailed = members_failed;
    }
  }

  getInvitedByPeople() {
    this._userService.guestSalesPersonList().subscribe(
      (response) => {
        this.salesPeopleList = response.people;
        if (this.members) {
          this.members.forEach((m) => {
            let match = this.invitedByPeople.some((a) => a.name === m.name);
            if (!match) {
              let spmatch =
                this.salesPeopleList &&
                this.salesPeopleList.some((a) => a.id === m.id);
              if (spmatch) {
                if (m.user_role == "Member") {
                  m.user_role = "Sales Person";
                }
              }
              this.invitedByPeople.push(m);
            }
          });
        }
        this.invitedByPeople = this.invitedByPeople.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  removeIncomplete(membersForApproval) {
    if (this.memberTypes && this.memberTypes.length > 0) {
      membersForApproval = membersForApproval.filter((mfa) => {
        let include = true;

        let ct = this.memberTypes.find(
          (f) => f.id == mfa.custom_member_type_id
        );
        if (
          ct.id > 0 &&
          ct.require_payment == 1 &&
          !mfa.subscription_id &&
          !mfa.created_by
        ) {
          include = false;

          let match =
            this.membersIncomplete &&
            this.membersIncomplete.some((a) => a.id === mfa.id);
          if (!match) {
            this.membersIncomplete.push(mfa);
          }
        }

        return include;
      });
      return membersForApproval;
    }
    return [];
  }

  getUpdatedDuration(member) {
    let result = "";
    const type =
      this.memberTypes &&
      this.memberTypes.find((i) => i.id == member.custom_member_type_id);
    if (type) {
      let today = moment().format("YYYY-MM-DD");
      let expire_date = "";
      if (type.expire_days > 0) {
        if (member.last_renewal_date) {
          expire_date = moment(member.last_renewal_date)
            .add(type.expire_days, "days")
            .format("YYYY-MM-DD");
        } else {
          expire_date = moment(member.created)
            .add(type.expire_days, "days")
            .format("YYYY-MM-DD");
        }
      }
      if (type.trial_period == 1 && type.trial_days > 0) {
        if (member.last_renewal_date) {
          expire_date = moment(member.last_renewal_date)
            .add(type.trial_days, "days")
            .format("YYYY-MM-DD");
        } else {
          expire_date = moment(member.created)
            .add(type.trial_days, "days")
            .format("YYYY-MM-DD");
        }
      }

      if (
        type.trial_period == 1 &&
        expire_date &&
        moment(today).isBefore(expire_date)
      ) {
        result = `${type.trial_days} ${this._translateService.instant(
          "edit-plan.days"
        )}`;
      } else if (
        type.expire_days > 0 &&
        expire_date &&
        moment(today).isBefore(expire_date)
      ) {
        result = `${type.expire_days} ${this._translateService.instant(
          "edit-plan.days"
        )}`;
      } else {
        result =
          type.payment_type == 2
            ? `1 ${this._translateService
                .instant("company-reports.month")
                .toLowerCase()}`
            : type.payment_type == 3
            ? `12 ${this._translateService.instant("edit-plan.months")}`
            : "";
      }
    }

    return result;
  }

  getInvitedBy(members, invited_by_guid) {
    let name = "";
    if (members && members.length > 0) {
      let member = members.filter((m) => {
        return m.invite_guid == invited_by_guid;
      });
      if (member && member.length > 0) {
        name = member[0].first_name
          ? `${member[0].first_name} ${member[0].last_name}`
          : member[0].name || "";
      }
    }
    return name;
  }

  getMembershipDuration(member) {
    let result = "";
    const type =
      this.memberTypes &&
      this.memberTypes.find((i) => i.id == member.custom_member_type_id);
    if (type) {
      if (type.trial_period == 1) {
        result = `${type.trial_days} ${this._translateService.instant(
          "edit-plan.days"
        )}`;
      } else if (type.expire_days > 0) {
        result = `${type.expire_days} ${this._translateService.instant(
          "edit-plan.days"
        )}`;
      } else {
        result =
          type.payment_type == 2
            ? `1 ${this._translateService
                .instant("company-reports.month")
                .toLowerCase()}`
            : type.payment_type == 3
            ? `12 ${this._translateService.instant("edit-plan.months")}`
            : "";
      }
    }

    return result;
  }

  getMembershipEnd(member) {
    let result = "";
    const type =
      this.memberTypes &&
      this.memberTypes.find((i) => i.id == member.custom_member_type_id);
    if (type) {
      if (type.trial_period == 1) {
        let end_trial;
        if (member.last_renewal_date) {
          end_trial = moment(member.last_renewal_date).add(
            type.trial_days,
            "days"
          );
        } else {
          end_trial = moment(member.created).add(type.trial_days, "days");
        }
        result = end_trial ? end_trial.format("DD/MM/YYYY") : "";
      } else if (type.expire_days > 1) {
        let days = 0;
        let end;
        if (type.payment_type == 4) {
          end = moment(member.last_renewal_date || member.created).add(
            3,
            "months"
          );
        } else if (type.payment_type == 5) {
          end = moment(member.last_renewal_date || member.created).add(
            6,
            "months"
          );
        } else {
          end = moment(member.last_renewal_date || member.created).add(
            type.expire_days,
            "days"
          );
        }

        result = end ? end.format("DD/MM/YYYY") : "";
      } else {
        let end;
        if (member.cancelled == 1 || member.failed == 1) {
          if (type.payment_type == 2) {
            end = moment(member.last_renewal_date || member.created).add(
              1,
              "months"
            );
          } else if (type.payment_type == 3) {
            end = moment(member.last_renewal_date || member.created).add(
              1,
              "years"
            );
          } else if (type.payment_type == 4) {
            end = moment(member.last_renewal_date || member.created).add(
              3,
              "months"
            );
          } else if (type.payment_type == 5) {
            end = moment(member.last_renewal_date || member.created).add(
              6,
              "months"
            );
          } else {
            end = "";
          }
        }

        result = end ? moment(end).format("DD/MM/YYYY") : "";
      }
    }

    return result;
  }

  getRegistrationFields(data) {
    let registration_fields = data?.registration_fields;
    this.allRegistrationFields = registration_fields;
    this.getRegistrationFieldMapping(data);
  }

  getRegistrationFieldMapping(data) {
    let registration_field_mapping = data?.registration_field_mapping;
    this.allRegistrationFieldMapping = registration_field_mapping;
    let registration_fields: any[] = [];
    let selected_fields: any = [];
    if (this.allRegistrationFields) {
      this.allRegistrationFields.forEach((field) => {
        let match = this.allRegistrationFieldMapping.some(
          (a) => a.field_id === field.id
        );
        if (!match) {
          registration_fields.push(field);
        }
      });
    }

    if (this.allRegistrationFieldMapping) {
      this.allRegistrationFieldMapping.forEach((field) => {
        let reg_field = this.allRegistrationFields.filter((f) => {
          return f.id == field.field_id;
        });

        let fld = {};
        if (reg_field && reg_field[0]) {
          let field_display_en = reg_field[0].field_display_en;
          if (field.field_display_en && field.field_display_en != null) {
            field_display_en = field.field_display_en;
          }
          let field_display_es = reg_field[0].field_display_es;
          if (field.field_display_es && field.field_display_es != null) {
            field_display_es = field.field_display_es;
          }
          let field_display_fr = reg_field[0].field_display_fr;
          if (field.field_display_fr && field.field_display_fr != null) {
            field_display_fr = field.field_display_fr;
          }
          let field_display_eu = reg_field[0].field_display_eu;
          if (field.field_display_eu && field.field_display_eu != null) {
            field_display_eu = field.field_display_eu;
          }
          let field_display_ca = reg_field[0].field_display_ca;
          if (field.field_display_ca && field.field_display_ca != null) {
            field_display_ca = field.field_display_ca;
          }
          let field_display_de = reg_field[0].field_display_de;
          if (field.field_display_de && field.field_display_de != null) {
            field_display_de = field.field_display_de;
          }
          let field_display_it = reg_field[0].field_display_it;
          if (field.field_display_it && field.field_display_it != null) {
            field_display_it = field.field_display_it;
          }
          let field_desc_en = reg_field[0].field_desc_en;
          if (field.field_desc_en && field.field_desc_en != null) {
            field_desc_en = field.field_desc_en;
          }
          let field_desc_es = reg_field[0].field_desc_es;
          if (field.field_desc_es && field.field_desc_es != null) {
            field_desc_es = field.field_desc_es;
          }
          let field_desc_fr = reg_field[0].field_desc_fr;
          if (field.field_desc_fr && field.field_desc_fr != null) {
            field_desc_fr = field.field_desc_fr;
          }
          let field_desc_eu = reg_field[0].field_desc_eu;
          if (field.field_desc_eu && field.field_desc_eu != null) {
            field_desc_eu = field.field_desc_eu;
          }
          let field_desc_ca = reg_field[0].field_desc_ca;
          if (field.field_desc_ca && field.field_desc_ca != null) {
            field_desc_ca = field.field_desc_ca;
          }
          let field_desc_de = reg_field[0].field_desc_de;
          if (field.field_desc_de && field.field_desc_de != null) {
            field_desc_de = field.field_desc_de;
          }
          let field_desc_it = reg_field[0].field_desc_it;
          if (field.field_desc_it && field.field_desc_it != null) {
            field_desc_it = field.field_desc_it;
          }

          fld = {
            id: reg_field[0].id,
            field: reg_field[0].field,
            field_type: reg_field[0].field_type,
            field_display_en: field_display_en,
            field_display_es: field_display_es,
            field_display_fr: field_display_fr,
            field_display_eu: field_display_eu,
            field_display_ca: field_display_ca,
            field_display_de: field_display_de,
            field_display_it: field_display_it,
            field_group_en: reg_field[0].field_group_en,
            field_group_es: reg_field[0].field_group_es,
            field_group_fr: reg_field[0].field_group_fr,
            field_group_eu: reg_field[0].field_group_eu,
            field_group_ca: reg_field[0].field_group_ca,
            field_group_de: reg_field[0].field_group_de,
            field_group_it: reg_field[0].field_group_it,
            field_desc_en: field_desc_en,
            field_desc_es: field_desc_es,
            field_desc_fr: field_desc_fr,
            field_desc_eu: field_desc_eu,
            field_desc_ca: field_desc_ca,
            field_desc_de: field_desc_de,
            field_desc_it: field_desc_it,
            active: reg_field[0].active,
            required:
              this.companyId == 26 &&
              (reg_field[0].field == "company_name" ||
                reg_field[0].field == "direccion" ||
                reg_field[0].field == "cif")
                ? 0
                : reg_field[0].required,
            created_at: reg_field[0].created_at,
          };
          if (reg_field[0].field == "startup_name") {
            this.hasStartupField = true;
          }
          selected_fields.push(fld);
        }
      });
    }

    this.registrationFields = registration_fields;
    this.selectedFields = selected_fields;

    if (this.selectedFields && this.selectedFields.length > 0) {
      this.initializeFormGroup();
    } else {
      this.getProfileFields(data);
    }
  }

  getProfileFields(data) {
    let allProfileFields = data?.profile_fields;
    this.allProfileFields =
      allProfileFields &&
      allProfileFields.filter((f) => {
        return f.field_type != "image";
      });
    this.getProfileFieldMapping(data);
  }

  getProfileFieldMapping(data) {
    this.allProfileFieldMapping = data?.profile_field_mapping;
    let profile_fields: any[] = [];
    let selected_fields: any[] = [];
    if (this.allProfileFields) {
      this.allProfileFields.forEach((field) => {
        let match = this.allProfileFieldMapping.some(
          (a) => a.field_id === field.id
        );
        if (!match) {
          profile_fields.push(field);
        }
      });
    }

    if (this.allProfileFieldMapping) {
      this.allProfileFieldMapping.forEach((field) => {
        let reg_field = this.allProfileFields.filter((f) => {
          return f.id == field.field_id;
        });

        let fld = {};
        if (reg_field && reg_field[0]) {
          let field_display_en = reg_field[0].field_display_en;
          if (field.field_display_en && field.field_display_en != null) {
            field_display_en = field.field_display_en;
          }
          let field_display_es = reg_field[0].field_display_es;
          if (field.field_display_es && field.field_display_es != null) {
            field_display_es = field.field_display_es;
          }
          let field_display_fr = reg_field[0].field_display_fr;
          if (field.field_display_fr && field.field_display_fr != null) {
            field_display_fr = field.field_display_fr;
          }
          let field_display_eu = reg_field[0].field_display_eu;
          if (field.field_display_eu && field.field_display_eu != null) {
            field_display_eu = field.field_display_eu;
          }
          let field_display_ca = reg_field[0].field_display_ca;
          if (field.field_display_ca && field.field_display_ca != null) {
            field_display_ca = field.field_display_ca;
          }
          let field_display_de = reg_field[0].field_display_de;
          if (field.field_display_de && field.field_display_de != null) {
            field_display_de = field.field_display_de;
          }
          let field_display_it = reg_field[0].field_display_it;
          if (field.field_display_it && field.field_display_it != null) {
            field_display_it = field.field_display_it;
          }
          let field_desc_en = reg_field[0].field_desc_en;
          if (field.field_desc_en && field.field_desc_en != null) {
            field_desc_en = field.field_desc_en;
          }
          let field_desc_es = reg_field[0].field_desc_es;
          if (field.field_desc_es && field.field_desc_es != null) {
            field_desc_es = field.field_desc_es;
          }
          let field_desc_fr = reg_field[0].field_desc_fr;
          if (field.field_desc_fr && field.field_desc_fr != null) {
            field_desc_fr = field.field_desc_fr;
          }
          let field_desc_eu = reg_field[0].field_desc_eu;
          if (field.field_desc_eu && field.field_desc_eu != null) {
            field_desc_eu = field.field_desc_eu;
          }
          let field_desc_ca = reg_field[0].field_desc_ca;
          if (field.field_desc_ca && field.field_desc_ca != null) {
            field_desc_ca = field.field_desc_ca;
          }
          let field_desc_de = reg_field[0].field_desc_de;
          if (field.field_desc_de && field.field_desc_de != null) {
            field_desc_de = field.field_desc_de;
          }
          let field_desc_it = reg_field[0].field_desc_it;
          if (field.field_desc_it && field.field_desc_it != null) {
            field_desc_it = field.field_desc_it;
          }

          fld = {
            id: reg_field[0].id,
            field: reg_field[0].field,
            field_type: reg_field[0].field_type,
            field_display_en: field_display_en,
            field_display_es: field_display_es,
            field_display_fr: field_display_fr,
            field_display_eu: field_display_eu,
            field_display_ca: field_display_ca,
            field_display_de: field_display_de,
            field_display_it: field_display_it,
            field_group_en: reg_field[0].field_group_en,
            field_group_es: reg_field[0].field_group_es,
            field_group_fr: reg_field[0].field_group_fr,
            field_group_eu: reg_field[0].field_group_eu,
            field_group_ca: reg_field[0].field_group_ca,
            field_group_de: reg_field[0].field_group_de,
            field_group_it: reg_field[0].field_group_it,
            field_desc_en: field_desc_en,
            field_desc_es: field_desc_es,
            active: reg_field[0].active,
            required: reg_field[0].required,
            created_at: reg_field[0].created_at,
          };
          if (reg_field[0].field == "startup_name") {
            this.hasStartupField = true;
          }
          selected_fields.push(fld);
        }
      });
    }

    this.profileFields = profile_fields;
    this.selectedFields = selected_fields;

    if (this.selectedFields && this.selectedFields.length > 0) {
      this.initializeFormGroup();
    } else {
      this.showDefaultRegistrationFields = true;
      this.initializeDefaultForm();
    }
  }

  initializeDefaultForm() {
    this.userForm = new FormGroup({
      first_name: new FormControl("", [Validators.required]),
      last_name: new FormControl(""),
      email: new FormControl("", [Validators.required]),
      password: new FormControl(""),
    });
  }

  initializeFormGroup() {
    this.formTemplate = [];

    this.selectedFields.forEach((field) => {
      if (field.field_type) {
        this.formTemplate.push({
          label: field.field,
          required: field.required == 1 ? true : false,
        });
      }
    });

    let group = {};
    this.formTemplate.forEach((input_template) => {
      if (input_template.required) {
        group[input_template.label] = new FormControl("", [
          Validators.required,
        ]);
      } else {
        group[input_template.label] = new FormControl("");
      }
    });

    this.userForm = new FormGroup(group);
    if (
      this.userMode == "edit" ||
      this.userMode == "approve" ||
      this.userMode == "deny"
    ) {
      if (this.selectedFields) {
        this.selectedFields.forEach((f) => {
          if (
            f.field != "coupon" &&
            f.field != "business_category" &&
            f.field != "logo"
          ) {
            if (f.field == "webpage") {
              if (!this.selectedUser[f.field] && this.selectedUser["website"]) {
                this.userForm?.controls[f.field].setValue(
                  this.selectedUser["website"]
                    ? this.selectedUser["website"]
                    : ""
                );
              } else {
                this.userForm?.controls[f.field].setValue(
                  this.selectedUser[f.field] ? this.selectedUser[f.field] : ""
                );
              }
            } else {
              this.userForm?.controls[f.field].setValue(
                this.selectedUser[f.field] ? this.selectedUser[f.field] : ""
              );
            }
          } else if (f.field == "business_category") {
            this.selectedBusinessCategories =
              this.selectedUser.business_categories;
          } else if (f.field == "logo") {
            this.userLogoSrc =
              environment.api + "/" + this.selectedUser[f.field];
          }
        });
        this.loadUserCity();
        setTimeout(() => {
          if(this.roleMemberGroupChanged && this.newSelectedRole) {
            
          } else {
            this.selectedRole = "";
            this.selectedRole = this.selectedUser.custom_member_type_id;
          }
        }, 500);
      }
    } else if (this.userMode == "add") {
      if (this.userForm?.controls["password"]) {
        let password = this.generatePassword();
        setTimeout(() => {
          this.userForm?.controls["password"].setValue(password);
        }, 500);
      }
      if (this.newUserForm) {
        this.loadEnteredUserData(this.newUserForm);
      }
    }
  }

  generatePassword() {
    let password = "";

    let str =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890@#$";

    for (let i = 1; i <= 12; i++) {
      let char = Math.floor(Math.random() * str.length + 1);
      password += str.charAt(char);
    }

    return password;
  }

  loadEnteredUserData(userForm) {
    if (userForm) {
      if (this.selectedFields) {
        this.selectedFields.forEach((f) => {
          if (userForm.controls[f.field]) {
            if (
              f.field != "coupon" &&
              f.field != "business_category" &&
              f.field != "logo"
            ) {
              if (f.field == "webpage") {
                if (
                  !userForm.controls[f.field] &&
                  userForm.controls["website"].value
                ) {
                  this.userForm?.controls[f.field].setValue(
                    userForm.controls["website"].value
                      ? userForm.controls["website"].value
                      : ""
                  );
                } else {
                  this.userForm?.controls[f.field].setValue(
                    userForm.controls[f.field].value
                      ? userForm.controls[f.field].value
                      : ""
                  );
                }
              } else {
                this.userForm?.controls[f.field].setValue(
                  userForm.controls[f.field].value
                    ? userForm.controls[f.field].value
                    : ""
                );
              }
            }
          }
        });
      }
    }
  }

  initializeMemberRoles() {
    if(this.companyId == 12) {
      this.memberRoles.push({
        id: 1,
        role: "Miembro",
      });
      this.memberRoles.push({
        id: 2,
        role: "Admin 1",
      });
    }
    if (this.hasCRM) {
      this.memberRoles.push({
        id: 5,
        role: "Sales Person",
      });
    }
    if (this.companyId == 12) {
      this.memberRoles.push({
        id: 96,
        role: "Miembro Gar",
      });
      this.memberRoles.push({
        id: 97,
        role: "Miembro Grupos temáticos",
      });
      this.memberRoles.push({
        id: 98,
        role: "Admin Gar",
      });
      this.memberRoles.push({
        id: 99,
        role: "Admin Grupos temáticos",
      });
      this.memberRoles.push({
        id: 102,
        role: 'Netcultura'
      })
    }
  }

  initializeButtonGroup() {
    let buttonList: any[] = [];
    buttonList.push({
      id: 1,
      value: "Active",
      text: this._translateService.instant("company-settings.active"),
      selected: true,
      fk_company_id: this.companyId,
    });

    if (this.hasConfirmEmail || this.membersForConfirm2?.length > 0) {
      buttonList.push({
        id: 2,
        value: "Confirm",
        text: this._translateService.instant(
          "company-settings.foremailconfirmation"
        ),
        selected: false,
        fk_company_id: this.companyId,
      });
    }

    if (this.requireApproval || this.membersForApproval2?.length > 0) {
      buttonList.push({
        id: 3,
        value: "Approval",
        text: this._translateService.instant("company-settings.forapproval"),
        selected: false,
        fk_company_id: this.companyId,
      });
    }

    if (this.hasExpiration || this.membersNotApproved2?.length > 0) {
      buttonList.push({
        id: 4,
        value: "NotApproved",
        text: this._translateService.instant("company-settings.notapproved"),
        selected: false,
        fk_company_id: this.companyId,
      });
    }

    if (this.requireApproval || this.membersIncomplete2?.length > 0) {
      buttonList.push({
        id: 5,
        value: "Incomplete",
        text: this._translateService.instant("company-settings.incomplete"),
        selected: false,
        fk_company_id: this.companyId,
      });
    }

    if (this.hasExpiration || this.membersExpired2?.length > 0) {
      buttonList.push({
        id: 6,
        value: "Expired",
        text: this._translateService.instant("company-settings.expired"),
        selected: false,
        fk_company_id: this.companyId,
      });
    }

    if (this.requirePayment || this.membersCancelled2?.length > 0) {
      buttonList.push({
        id: 7,
        value: "Cancelled",
        text: this._translateService.instant("company-settings.cancelled"),
        selected: false,
        fk_company_id: this.companyId,
      });
    }

    if (this.requirePayment || this.membersFailed2?.length > 0) {
      buttonList.push({
        id: 8,
        value: "Failed",
        text: this._translateService.instant("company-settings.failedpayments"),
        selected: false,
        fk_company_id: this.companyId,
      });
    }

    buttonList.push({
      id: 9,
      value: "Deleted",
      text: this._translateService.instant("company-settings.deleted"),
      selected: false,
      fk_company_id: this.companyId,
    });

    this.buttonList = buttonList;
  }

  handleSearchByName(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.filterMembers();
  }

  filterCity(event) {
    this.citiesList?.forEach((item) => {
      if (item.city === event) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedCityFilterCampus = "";
    this.selectedCityFilter = event;

    if (this.cities) {
      let city_row = this.cities.filter((city) => {
        return (
          city.id == this.selectedCityFilter ||
          city.city == this.selectedCityFilter
        );
      });
      if (city_row && city_row.length > 0) {
        this.selectedCityFilterCampus = city_row[0].campus;
      }
    }

    this.filterMembers();
  }

  filterMemberStatus(type) {
    this.buttonList?.forEach((item) => {
      if (item.id === type.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.memberStatusFilter = type.value;
    this.filterMembers();
  }

  addUser() {
    this.selectedUser = {};
    this.userMode = "add";
    this.errorMessage = "";
    this.selectedAssignedStudent = "";
    this.selectedAssignedTutor = "";
    this.roleMemberGroupChanged = false;
    this.newSelectedRole = "";
    this.tabIndex = 0;
    this.hasAddedUser = false;
    this.createdUserId = '';
    this.tutor = false;
    this.superTutor = false;
    this.potSuperTutor = false;
    this.potTutor = false;
    this.startDate = new Date() // moment().format('YYYY-MM-DD HH:mm:ss');

    if (this.showDefaultRegistrationFields) {
      this.userForm?.controls["first_name"].setValue("");
      this.userForm?.controls["last_name"].setValue("");
      this.userForm?.controls["email"].setValue("");
      this.userForm?.controls["password"].setValue("");
      this.selectedRole = "";
    } else {
      if (this.selectedFields) {
        this.selectedFields.forEach((f) => {
          this.userForm?.controls[f.field].setValue("");
          this.selectedBusinessCategories = [];
          this.userLogoSrc = "";
          this.logoFile = {};
          this.selectedRole = 1;
        });
      }
    }

    if (this.hasMemberContract) {
      this.memberContract = "";
      this.selectedMemberContractDuration = "";
    }

    if (this.userForm && this.userForm?.controls["country"]) {
      // Set default to Spain
      this.userForm?.controls["country"].setValue("Spain");
    }

    this.dialogMode = "adduser";
    this.dialogTitle = this.getDialogTitle();
    this.selectedRole = "";
    this.modalbutton?.nativeElement.click();
  }

  editUserStatus(row) {
    this.bulkSelection = 0;
    this.selectedUser = row;
    this.selectedUserStatus = "Incomplete";
    this.showEditUserStatusModal = true;
  }

  editUserConfirmStatus(row) {
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmapprove"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmapproveitem"
    );
    this.selectedOperation = 'confirm';
    this.selectedUser = row;
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  updateUserConfirmStatus(id, confirmed) {
    if (confirmed) {
      this._userService
        .updateUserConfirmStatus(
          this.selectedUser.id,
          this.selectedUser.custom_member_type_id
        )
        .subscribe(
          (response) => {
            this.membersForConfirm.forEach((u, idx) => {
              if (u.id === this.selectedUser.id) {
                this.membersForConfirm.splice(idx, 1);
              }
            });
            this.membersForConfirm2.forEach((u, idx) => {
              if (u.id === this.selectedUser.id) {
                this.membersForConfirm2.splice(idx, 1);
              }
            });
            this.resetUserStatusForm();
            this.memberStatusFilter = "Confirm";
            this.dataSource = this.membersForConfirm;
            this.getMembers(true);
          },
          (error) => {
            console.log(error);
            this.isUserStatusUpdateProcessing = false;
            this.open(this._translateService.instant("dialog.error"), "");
          }
        );
    }
  }

  updateUserStatus() {
    this.isUserStatusUpdateProcessing = true;
    this.userStatusFormSubmitted = true;
    this.errorMessage = "";
    if (this.selectedUserStatus && this.selectedUserStatus != "Incomplete") {
      let role = this.selectedUserStatusRole;
      if (!role && this.selectedUsers?.length > 0) {
        role = this.selectedUsers[0].custom_member_type_id;
      }
      if (this.bulkSelection == 0) {
        let payload = {
          role: role,
          status: this.selectedUserStatus,
          company_id: this.companyId,
          updated_by: this.userId,
        };
        this._userService
          .updateUserStatus(this.selectedUser.id, payload)
          .subscribe(
            (response) => {
              this.membersIncomplete.forEach((u, idx) => {
                if (u.id === this.selectedUser.id) {
                  this.membersIncomplete.splice(idx, 1);
                }
              });
              this.membersIncomplete2.forEach((u, idx) => {
                if (u.id === this.selectedUser.id) {
                  this.membersIncomplete2.splice(idx, 1);
                }
              });
              let incomplete = this.membersIncomplete;
              let incomplete2 = this.membersIncomplete2;
              this.resetUserStatusForm();
              this.memberStatusFilter = "Incomplete";
              this.getMembers(false);
              this.refreshMembers(incomplete);
              this.open(
                this._translateService.instant("dialog.savedsuccessfully"),
                ""
              );
            },
            (error) => {
              console.log(error);
              this.isUserStatusUpdateProcessing = false;
              this.open(this._translateService.instant("dialog.error"), "");
            }
          );
      } else {
        let payload = {
          role: role,
          status: this.selectedUserStatus,
          company_id: this.companyId,
          updated_by: this.userId,
          user_ids: this.selectedUsers
            .map((data) => {
              return data.id;
            })
            .join(),
        };
        this._userService.updateBulkUserStatus(payload).subscribe(
          (response) => {
            this.selectedUsers.forEach((element) => {
              this.membersIncomplete.forEach((u, idx) => {
                if (u.id === element.id) {
                  this.membersIncomplete.splice(idx, 1);
                }
              });
              this.membersIncomplete2.forEach((u, idx) => {
                if (u.id === element.id) {
                  this.membersIncomplete2.splice(idx, 1);
                }
              });
            });
            let incomplete = this.membersIncomplete;
            let incomplete2 = this.membersIncomplete2;
            this.resetUserStatusForm();
            this.memberStatusFilter = "Incomplete";
            this.getMembers(false);
            this.refreshMembers(incomplete);
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
          },
          (error) => {
            console.log(error);
            this.isUserStatusUpdateProcessing = false;
            this.open(this._translateService.instant("dialog.error"), "");
          }
        );
      }
    } else {
      this.isUserStatusUpdateProcessing = false;
    }
  }

  resetUserStatusForm() {
    this.isUserStatusUpdateProcessing = false;
    this.selectedUserStatusRole = "";
    this.showEditUserStatusModal = false;
    this.userStatusFormSubmitted = false;
    this.errorMessage = "";
  }

  closeEditUserStatusModal() {
    this.resetUserStatusForm();
  }

  async editUser(user, mode) {
    this.userMode = mode;
    this.selectedUser = user;
    this.showAdditionalMemberTypeDropdown = false;
    this.requiredMemberRole = "";
    this.selectedRequiredMember = "";
    this.isMentor = false;
    this.errorMessage = "";
    this.courseCreditsList = [];
    this.selectedCourses = [];
    this.roleMemberGroupChanged = false;
    this.newSelectedRole = "";
    this.superTutor = false;
    this.potSuperTutor = false;
    this.potTutor = false;
    this.isGuardianType = false;
    this.tabIndex = 0;
    this.hasAddedUser = false;
    this.createdUserId = '';
    if (this.hasBuddy && this.mentors && this.mentors.length > 0) {
      this.isMentor = this.mentors.some(
        (a) => a.user_id === this.selectedUser.id
      );
    }

    if (this.showDefaultRegistrationFields) {
      if (this.selectedUser) {
        if (this.courseCreditSetting) {
          this.courseCredits = this.selectedUser.course_credits;
          this.remainingCourseCredits =
            this.selectedUser.remaining_course_credits;
        }
        this.userForm?.controls["first_name"].setValue(
          this.selectedUser.first_name
        );
        this.userForm?.controls["last_name"].setValue(
          this.selectedUser.last_name
        );
        this.userForm?.controls["email"].setValue(this.selectedUser.email);

        let selected_role;
        if (this.hasCustomMemberTypeSettings) {
          if (this.selectedUser.user_role == "Super Admin") {
            selected_role = 4;
          } else {
            selected_role = this.selectedUser.custom_member_type_id;
          }
        } else {
          switch (this.selectedUser.user_role) {
            case "Member":
              selected_role = 1;
              break;
            case "Admin 1":
              selected_role = 2;
              break;
            case "Admin 2":
              selected_role = 3;
              break;
            case "Super Admin":
              selected_role = 4;
              break;
            case "Miembro Gar":
              selected_role = 96;
              break;
            case "Miembro Grupos temáticos":
              selected_role = 97;
              break;
            case "Admin Gar":
              selected_role = 98;
              break;
            case "Admin Grupos temáticos":
              selected_role = 99;
              break;
            case 'Netcultura': 
              selected_role = 102
              break
          }
        }
        this.selectedRole = selected_role;
      }
    } else {
      if (this.selectedUser) {
        if (this.courseCreditSetting) {
          this.courseCredits = this.selectedUser.course_credits;
          this.remainingCourseCredits =
            this.selectedUser.remaining_course_credits;
        }
        let selected_role;
        if (this.hasCustomMemberTypeSettings) {
          if (this.selectedUser.user_role == "Super Admin") {
            selected_role = 4;
          } else {
            selected_role = this.selectedUser.custom_member_type_id;
          }
        } else {
          switch (this.selectedUser.user_role) {
            case "Member":
              selected_role = 1;
              break;
            case "Admin 1":
              selected_role = 2;
              break;
            case "Admin 2":
              selected_role = 3;
              break;
            case "Super Admin":
              selected_role = 4;
              break;
            case "Sales Person":
              selected_role = 5;
              break;
            case "Miembro Gar":
              selected_role = 96;
              break;
            case "Miembro Grupos temáticos":
              selected_role = 97;
              break;
            case "Admin Gar":
              selected_role = 98;
              break;
            case "Admin Grupos temáticos":
              selected_role = 99;
              break;
            case 'Netcultura': 
              selected_role = 102
              break
          }
        }

        setTimeout(async () => {
          this.selectedRole = selected_role;
          if(this.hasCategoryAccess && this.hasCourses && this.courseCategories?.length > 0 && this.courseCategoryMapping?.length > 0) {
            this.mapUserTypeCourses(this.selectedRole);
          }
  
          if (this.hasCustomMemberTypeSettings) {
            if(this.hasTutors) {
              if(this.tutorToAssign2?.length > 0) {
                let match = this.tutorToAssign2?.some((a) => a.user_id == user.id);
                this.tutor = match ? true : false;
              }
            }
  
            let selected = this.memberTypes?.find((f) => f.id == this.selectedRole)
            this.isGuardianType = selected?.guardian == 1 ? true : false
  
            if(this.tutor) {
              let super_match = this.tutorToAssign2?.some(
                (a) => a.user_id == user.id && a.super_tutor == 1
              );
              this.superTutor = super_match ? true : false;
              let super_tutor = this.tutorToAssign2?.filter((tut) => {
                return tut.user_id == user.id && tut.super_tutor == 1 
              });
              let potsuper_match = this.tutorToAssign2?.some(
                (a) => a.user_id == user.id && a.potsuper_tutor == 1
              );
              this.potSuperTutor = potsuper_match ? true : false;

              let pottutor_match = this.tutorToAssign2?.some(
                (a) => a.user_id == user.id && a.pot_tutor == 1
                );
              this.potTutor = pottutor_match ? true : false;

              let potsuper_tutor = this.tutorToAssign2?.filter((tut) => {
                return tut.user_id == user.id && tut.potsuper_tutor == 1 
              });

              if (super_tutor && super_tutor.length > 0) {
                let assigned_tutor_ids: any[] = [];
                this.tutorToAssign = this.tutorToAssign2;
                this.tutorToAssign =
                this.tutorToAssign?.length > 0
                ? this.tutorToAssign.filter((tta) => {
                        return (
                          (!tta.parent_tutor_id ||
                            tta.parent_tutor_id == super_tutor[0].id) &&
                            tta.super_tutor != 1
                            );
                          })
                          : [];
                          this.tutorToAssign2?.forEach((tuts) => {
                            if (
                              tuts.parent_tutor_id &&
                    tuts.parent_tutor_id == super_tutor[0]?.id
                  ) {
                    assigned_tutor_ids.push(tuts.id);
                  }
                });
              
                this.selectedAssignedTutor =
                assigned_tutor_ids.length > 0
                ? this.tutorToAssign.filter((tta) => {
                  return assigned_tutor_ids.indexOf(tta.id) != -1;
                })
                : "";
  
                if (super_tutor?.length > 0) {
                  let assigned_student_ids: any[] = [];
                  let super_tutor_students = get(await this._userService.getSuperTutorStudents(user.id).toPromise(), 'super_tutor_students');
                  super_tutor_students?.forEach((student) => {
                    let member = this.allMembers.filter((member) => {
                      return member.id == student.user_id;
                    });
                    if (member?.length > 0) {
                      assigned_student_ids.push(member[0]);
                    }
                  });
                  this.selectedAssignedStudent = assigned_student_ids;
                }
              }

              if (potsuper_tutor && potsuper_tutor.length > 0) {
                let assigned_tutor_ids: any[] = [];
                this.tutorToAssign = this.tutorToAssign2;
                this.tutorToAssign =
                  this.tutorToAssign?.length > 0
                    ? this.tutorToAssign.filter((tta) => {
                        return (
                          (!tta.parent_tutor_id ||
                            tta.parent_tutor_id == potsuper_tutor[0].id) &&
                            tta.potsuper_tutor != 1
                            );
                          })
                          : [];
                this.tutorToAssign2?.forEach((tuts) => {
                  if (
                    tuts.parent_tutor_id &&
                    tuts.parent_tutor_id == potsuper_tutor[0]?.id
                  ) {
                    assigned_tutor_ids.push(tuts.id);
                  }
                });
  
                    
                this.selectedAssignedTutor =
                  assigned_tutor_ids.length > 0
                    ? this.tutorToAssign.filter((tta) => {
                        return assigned_tutor_ids.indexOf(tta.id) != -1;
                      })
                    : "";
                if (potsuper_tutor?.length > 0) {
                  let assigned_student_ids: any[] = [];
                  let pot_super_tutor_students = get(await this._userService.getPotSuperTutorStudents(user.id).toPromise(), 'potsuper_tutor_students');
                  pot_super_tutor_students?.forEach((student) => {
                    let member = this.allMembers.filter((member) => {
                      return member.id == student.user_id;
                    });
                    if (member?.length > 0) {
                      assigned_student_ids.push(member[0]);
                    }
                  });
                  this.selectedAssignedStudent = assigned_student_ids;
                }
              }
            }
  
            if(this.isGuardianType) {
              let guardian_students = get(await this._userService.getGuardianStudents(user.id, this.companyId).toPromise(), 'guardian_students');
              if(guardian_students?.length > 0) {
                let assigned_student_ids: any[] = []
                guardian_students?.forEach(student => {
                  let member = this.allMembers.filter(member => {
                    return member.id == student.user_id
                  })
                  if(member?.length > 0) {
                    assigned_student_ids.push(member[0])
                  }
                })
                this.selectedAssignedStudent = assigned_student_ids
              }
            }
  
            this.checkClubPresident();
  
            if (this.showClubsDropdown) {
              this.memberRoleGroups = this.handleSortClubs(this.memberRoleGroups);
              let own_club =
                this.memberRoleGroups &&
                this.memberRoleGroups.filter((club) => {
                  return club.fk_user_id == this.selectedUser.id;
                });
              if (own_club && own_club[0]) {
                this.selectedClubPresidentGroup = own_club[0].id;
              } else {
                let club_presidents_mapping = get(await this._clubsService.getClubPresidents(this.companyId).toPromise(), 'club_presidents_mapping')
                if(club_presidents_mapping && club_presidents_mapping.length > 0) {
                  let club = club_presidents_mapping && club_presidents_mapping.filter(club => {
                    return club.user_id == this.selectedUser.id
                  })
                  if(club && club[0]) {
                    this.selectedClubPresidentGroup = club[0].club_id
                  }
                }
              }
            }
  
            this.getCustomProfileFields();
          } else {
            this.loadFieldValues();
          }
        }, 500);
      }
    }

    if (this.hasMemberContract && this.selectedUser) {
      this.selectedMemberContractDuration = this.selectedUser.contract_duration
        ? this.selectedUser.contract_duration +
          " " +
          this.selectedUser.contract_unit
        : "";
    }

    if (user.created) {
      this.startDate = user.created;
    }

    if (this.superAdmins) {
      let match = this.superAdmins.some((a) => a.id === user.id);
      this.superAdmin = match ? true : false;
    }

    this.dialogMode = "edituser";
    this.dialogTitle = this.getDialogTitle();
    this.selectedRole = "";
    this.modalbutton?.nativeElement.click();
    this.showEditUserModal = true;
  }

  mapUserTypeCourses(custom_member_type_id) {
    if(custom_member_type_id > 0) {
      let member_type_row = this.memberTypes?.filter(mt => {
        return mt.id == custom_member_type_id
      })
      if(member_type_row?.length > 0) {
        this.userTypeName = member_type_row[0].type
        if(member_type_row[0].id == 313) {
          this.getUserAssignedTutors()
        }
      }
    }
    this._userService.getCombinedUserCoursesPrefetch(this.selectedUser?.id).subscribe(data => {
      this.courseSubscriptions = data[0] ? data[0]['course_subscriptions'] : []
      this.courseExceptionUser = data[1] ? data[1]['company_course_exception_user'] : []
      this.userCourseCredits = data[2] ? data[2]['user_course_credits'] : []
      this.mapCourseUserCredits();
    })
  }

  getUserAssignedTutors() {
    this._userService.getUserAsignedTutors(this.selectedUser?.id).subscribe(data => {
      let assigned_tutors = data?.assigned_tutors
      let filtered = this.tutorToAssign.filter(tta => {
        let match = assigned_tutors?.some(a => a.tutor_id == tta.id);
        return match
      })
      this.selectedAssignedTutor = filtered?.length > 0 ? filtered : ''
    })
  }

  mapCourseUserCredits() {
    let selected_courses: any[] = []
    if(this.courseSubscriptions?.length > 0) {
      this.courseSubscriptions?.forEach(event => {
        let course_item
        if(event?.course) {
          course_item = event?.course
        } else {
          let course_row = this.courses?.filter(c => {
            return c.id == event?.course_id
          })
          if(course_row?.length > 0) {
            course_item = course_row[0]
          }
        }

        if(this.courseCreditSetting) {
          let match = this.courseCreditsList.some(a => a.id === course_item?.id)

          let credits = 0
          let course = this.userCourseCredits?.filter((data) => {
            return data.course_id == course_item?.id
          })
          if(course?.length > 0) {
            credits = course[0].remaining_credits
          }
  
          if(!match) {
            this.courseCreditsList.push({
              id: course_item?.id,
              title: course_item?.title,
              credits,
            })
          }
        }
        let course_row = this.courses?.filter(c => {
          return c.id == course_item?.id
        })
        if(course_row?.length > 0) {
          let course_match = selected_courses?.some(a => a.id === course_row[0].id)
          if(!course_match) {
            selected_courses.push({
              id: course_row[0].id,
              title: course_row[0].title
            })
          }
        }
      })
    }

    if(selected_courses?.length > 0) {
      setTimeout(() => {
        this.selectedCourses = selected_courses;
      }, 1000);
    }
  }

  async getCustomProfileFields() {
    this.memberTypeId = this.selectedRole;
    if (this.memberTypeId && this.memberTypeId > 0) {
      if (this.memberTypes) {
        let user_custom_member_type = this.memberTypes.filter((mt) => {
          return mt.id == this.memberTypeId;
        });
        if (user_custom_member_type && user_custom_member_type[0]) {
          this.customMemberType = user_custom_member_type[0];
        }
      }

      let is_cmt = false;
      let cmt =
        this.memberTypes &&
        this.memberTypes.filter((mt) => {
          return mt.id == this.memberTypeId;
        });
      if (cmt && cmt[0]) {
      } else {
        let max_mt = this.memberTypes[0];
        if (max_mt) {
          this.memberTypeId = max_mt.id;
          this.customMemberType = max_mt;
        }
      }

      if (this.memberTypeId > 0 && this.customMemberType) {
        let allProfileFields = this.customMemberProfileFields?.filter(
          (cmpf) => {
            return (
              cmpf.custom_member_type_id == this.memberTypeId &&
              cmpf.field_type != "image"
            );
          }
        );
        let profile_fields: any[] = [];
        if (allProfileFields && allProfileFields.length > 0) {
          let cnt = 1;
          allProfileFields.forEach((p) => {
            profile_fields.push({
              id: p.id,
              company_id: p.company_id,
              custom_member_type_id: p.custom_member_type_id,
              profile_field_id: p.profile_field_id,
              field_type: p.field_type,
              field_display_en: p.field_display_en,
              field_display_es: p.field_display_es,
              field_display_fr: p.field_display_fr,
              field_display_eu: p.field_display_eu,
              field_display_ca: p.field_display_ca,
              field_display_de: p.field_display_de,
              field_display_it: p.field_display_it,
              field_group_en: p.field_group_en,
              field_group_es: p.field_group_es,
              field_group_fr: p.field_group_fr,
              field_group_eu: p.field_group_eu,
              field_group_ca: p.field_group_ca,
              field_group_de: p.field_group_de,
              field_group_it: p.field_group_it,
              field_desc_en: p.field_desc_en,
              field_desc_es: p.field_desc_es,
              field_desc_fr: p.field_desc_fr,
              field_desc_eu: p.field_desc_eu,
              field_desc_ca: p.field_desc_ca,
              field_desc_de: p.field_desc_de,
              field_desc_it: p.field_desc_it,
              field: p.field,
              required: p.required,
              created_at: p.created_at,
              sequence: cnt,
            });
            cnt++;
          });

          this.allProfileFields = profile_fields;
          this.getCustomProfileFieldMapping();
        } else {
          this.loadFieldValues();
        }
      }
    }
  }

  async getCustomProfileFieldMapping() {
    this.allProfileFieldMapping = [];
    let profile_fields = this.allProfileFields;
    let selected_fields: any[] = [];

    if (this.allProfileFieldMapping && this.allProfileFieldMapping.length > 0) {
      this.allProfileFieldMapping.forEach((field) => {
        let reg_field = this.allProfileFields.filter((f) => {
          return f.profile_field_id == field.profile_field_id;
        });

        let fld = {};
        if (reg_field && reg_field[0]) {
          fld = {
            id: reg_field[0].profile_field_id,
            user_id: this.userId,
            company_id: this.companyId,
            field: reg_field[0].field,
            field_type: reg_field[0].field_type,
            field_display_en: reg_field[0].field_display_en,
            field_display_fr: reg_field[0].field_display_fr,
            field_display_eu: reg_field[0].field_display_eu,
            field_display_ca: reg_field[0].field_display_ca,
            field_display_de: reg_field[0].field_display_de,
            field_display_it: reg_field[0].field_display_it,
            field_group_en: reg_field[0].field_group_en,
            field_group_es: reg_field[0].field_group_es,
            field_group_fr: reg_field[0].field_group_fr,
            field_group_eu: reg_field[0].field_group_eu,
            field_group_ca: reg_field[0].field_group_ca,
            field_group_de: reg_field[0].field_group_de,
            field_group_it: reg_field[0].field_group_it,
            field_desc_en: reg_field[0].field_desc_en,
            field_desc_es: reg_field[0].field_desc_es,
            field_desc_fr: reg_field[0].field_desc_fr,
            field_desc_eu: reg_field[0].field_desc_eu,
            field_desc_ca: reg_field[0].field_desc_ca,
            field_desc_de: reg_field[0].field_desc_de,
            field_desc_it: reg_field[0].field_desc_it,
            show: field.show == 1 ? true : false,
            required: reg_field[0].required,
            created_at: reg_field[0].created_at,
            sequence: reg_field[0].sequence,
          };

          if (field.field == "image") {
            this.hasProfileImageField = true;
          }
          if (field.field == "company_logo") {
            this.hasCompanyImageField = true;
          }

          selected_fields.push(fld);
        }
      });
    } else {
      this.allProfileFields.forEach((f) => {
        if (f.field == "image") {
          this.hasProfileImageField = true;
        }
        if (f.field == "company_logo") {
          this.hasCompanyImageField = true;
        }

        selected_fields.push({
          id: f.profile_field_id,
          user_id: this.userId,
          company_id: this.companyId,
          field: f.field,
          field_type: f.field_type,
          field_display_en: f.field_display_en,
          field_display_es: f.field_display_es,
          field_display_fr: f.field_display_fr,
          field_display_eu: f.field_display_eu,
          field_display_ca: f.field_display_ca,
          field_display_de: f.field_display_de,
          field_display_it: f.field_display_it,
          field_group_en: f.field_group_en,
          field_group_es: f.field_group_es,
          field_group_fr: f.field_group_fr,
          field_group_eu: f.field_group_eu,
          field_group_ca: f.field_group_ca,
          field_group_de: f.field_group_de,
          field_group_it: f.field_group_it,
          field_desc_en: f.field_desc_en,
          field_desc_es: f.field_desc_es,
          field_desc_fr: f.field_desc_fr,
          field_desc_eu: f.field_desc_eu,
          field_desc_ca: f.field_desc_ca,
          field_desc_de: f.field_desc_de,
          field_desc_it: f.field_desc_it,
          show: true,
          required: f.required,
          created_at: f.created_at,
          sequence: f.sequence,
        });
      });
    }
    if (selected_fields) {
      selected_fields = selected_fields.sort((a, b) => {
        return a.sequence - b.sequence;
      });
    }

    this.profileFields = profile_fields;
    this.selectedFields = selected_fields;

    if (this.selectedFields && this.selectedFields.length > 0) {
      this.initializeFormGroup();
    } else {
      this.showDefaultRegistrationFields = true;
      this.initializeDefaultForm();
    }
  }

  loadUserCity() {
    if (
      this.userForm?.controls["city"] &&
      this.cities.length > 0 &&
      this.selectedUser.canonical_name
    ) {
      let city;
      let city_row = this.cities.filter((city) => {
        let include = false;

        if (this.companyId == 32) {
          if (city.campus) {
            if (city.campus.indexOf(",") >= 0) {
              let campus = city.campus.split(",");
              let match =
                campus &&
                campus.some(
                  (a) => this.selectedUser.canonical_name.indexOf(a) >= 0
                );
              if (match) {
                include = true;
              }
            } else {
              if (this.selectedUser.canonical_name.indexOf(city.campus) >= 0) {
                include = true;
              }
            }
          }
        } else {
          if (this.selectedUser.city.indexOf(city.city) >= 0) {
            include = true;
          }
        }

        return include;
      });
      if (city_row && city_row.length > 0) {
        city = city_row[0].city;
        this.userForm?.controls["city"].setValue(city);
      }
    }
  }

  loadFieldValues() {
    if (this.userMode != "add") {
      if (this.selectedFields) {
        this.selectedFields.forEach((f) => {
          if (
            f.field != "coupon" &&
            f.field != "business_category" &&
            f.field != "logo"
          ) {
            if (f.field == "webpage") {
              if (!this.selectedUser[f.field] && this.selectedUser["website"]) {
                this.userForm?.controls[f.field].setValue(
                  this.selectedUser["website"]
                    ? this.selectedUser["website"]
                    : ""
                );
              } else {
                this.userForm?.controls[f.field].setValue(
                  this.selectedUser[f.field] ? this.selectedUser[f.field] : ""
                );
              }
            } else {
              this.userForm?.controls[f.field].setValue(
                this.selectedUser[f.field] ? this.selectedUser[f.field] : ""
              );
            }
          } else if (f.field == "business_category") {
            this.selectedBusinessCategories =
              this.selectedUser.business_categories;
          } else if (f.field == "logo") {
            this.userLogoSrc =
              environment.api + "/" + this.selectedUser[f.field];
          }

          if (
            f.field == "invited_by" &&
            this.companyId == 12 &&
            this.selectedUser.invited_by_guid
          ) {
            if (this.membersAll && this.membersAll.length > 0) {
              let inviter = this.membersAll.filter((member) => {
                return member.invite_guid == this.selectedUser.invited_by_guid;
              });
              if (inviter && inviter[0]) {
                this.userForm?.controls[f.field].setValue(inviter[0].id);
              }
            }
          }
        });
      }
    }
  }

  closeEditUserModal() {
    this.showEditUserModal = false;
  }

  changeMemberEmailOption(event) {
    if (event) {
      this.sendMemberEmail = event.target.checked;
    }
  }

  getErrorMsg(id) {
    let status = "";
    let searched_user = "";

    if (this.membersForApproval?.length > 0) {
      searched_user = this.membersForApproval.filter((u) => {
        return u.id == id;
      });
      if (searched_user.length > 0) {
        return (status = "approval");
      }
    }

    if (this.membersExpired?.length > 0) {
      searched_user = this.membersExpired.filter((u) => {
        return u.id == id;
      });
      if (searched_user.length > 0) {
        return (status = "expired");
      }
    }

    if (this.membersFailed?.length > 0) {
      searched_user = this.membersFailed.filter((u) => {
        return u.id == id;
      });
      if (searched_user.length > 0) {
        return (status = "failed");
      }
    }

    if (this.membersNotApproved?.length > 0) {
      searched_user = this.membersNotApproved.filter((u) => {
        return u.id == id;
      });
      if (searched_user.length > 0) {
        return (status = "not_approved");
      }
    }

    if (this.membersForConfirm?.length > 0) {
      searched_user = this.membersForConfirm.filter((u) => {
        return u.id == id;
      });
      if (searched_user.length > 0) {
        return (status = "confirm");
      }
    }

    if (this.membersCancelled?.length > 0) {
      searched_user = this.membersCancelled.filter((u) => {
        return u.id == id;
      });
      if (searched_user.length > 0) {
        return (status = "cancelled");
      }
    }

    if (this.membersIncomplete?.length > 0) {
      searched_user = this.membersIncomplete.filter((u) => {
        return u.id == id;
      });
      if (searched_user.length > 0) {
        return (status = "incomplete");
      }
    }

    if (this.members?.length > 0) {
      searched_user = this.members.filter((u) => {
        return u.id == id;
      });
      if (searched_user.length > 0) {
        return (status = "active");
      }
    }
  }

  getUserType() {
    let member_type = this.customMemberTypes && this.customMemberTypes.filter(mt => {
      return mt.id == this.customMemberTypeId
    })
    
    if(member_type && member_type.length > 0) {
      this.userRoleType = this.language == 'en' ? (member_type[0].type) : (this.language == 'fr' ? (member_type[0].type_fr || member_type[0].type_es) : 
      (this.language == 'eu' ? (member_type[0].type_eu || member_type[0].type_es) : (this.language == 'ca' ? (member_type[0].type_ca || member_type[0].type_es) : 
      (this.language == 'de' ? (member_type[0].type_de || member_type[0].type_es) : (member_type[0].type_es))
      ))
      )
    }
  }

  saveUser() {
    this.userFormSubmitted = true;
    this.errorMessage = "";

    if (this.showDefaultRegistrationFields) {
      if (this.userMode != "deny") {
        if (this.hasMemberContract) {
          if (
            this.userForm?.get("first_name")?.errors ||
            this.userForm?.get("last_name")?.errors ||
            this.userForm?.get("email")?.errors ||
            !this.selectedRole ||
            !this.selectedMemberContractDuration
          ) {
            return false;
          }
        } else {
          if (
            this.userForm?.get("first_name")?.errors ||
            this.userForm?.get("last_name")?.errors ||
            this.userForm?.get("email")?.errors ||
            !this.selectedRole
          ) {
            return false;
          }
        }
      }

      let user_role = "";
      switch (parseInt(this.selectedRole)) {
        case 1:
          user_role = "Member";
          break;
        case 2:
          user_role = "Admin 1";
          break;
        case 3:
          user_role = "Admin 2";
          break;
        case 4:
          user_role = "Super Admin";
          break;
        case 5:
          user_role = "Sales Person";
          break;
        case 96:
          user_role = "Miembro Gar";
          break;
        case 97:
          user_role = "Miembro Grupos temáticos";
          break;
          case 98:
          user_role = "Admin Gar";
          break;
        case 99:
          user_role = "Admin Grupos temáticos";
          break;
        }
        
        if (this.userMode == "add") {
          let params;
        if (this.hasMemberContract) {
          if (!this.selectedMemberContractDuration) {
            return false;
          }
          let contract_duration =
            this.selectedMemberContractDuration == "6 month"
              ? 6
              : this.selectedMemberContractDuration == "1 year"
              ? 1
              : null;
          let contract_unit =
            this.selectedMemberContractDuration == "6 month"
              ? "month"
              : this.selectedMemberContractDuration == "1 year"
              ? "year"
              : null;
          params = {
            first_name: this.userForm?.get("first_name")?.value,
            last_name: this.userForm?.get("last_name")?.value,
            email: this.userForm?.get("email")?.value,
            password: this.userForm?.get("password")?.value,
            company_id: this.companyId,
            user_role: user_role,
            gar_thematic_group: 0,
            contract_duration: contract_duration,
            contract_unit: contract_unit,
            user_id: this.userId,
            custom_member_type_id: this.hasCustomMemberTypeSettings
              ? this.selectedRole == 4
                ? 2
                : this.selectedRole
              : 0,
            send_member_email: this.sendMemberEmail ? 1 : 0,
          };
        } else {
          params = {
            first_name: this.userForm?.get("first_name")?.value,
            last_name: this.userForm?.get("last_name")?.value,
            email: this.userForm?.get("email")?.value,
            password: this.userForm?.get("password")?.value,
            company_id: this.companyId,
            user_role: user_role,
            user_id: this.userId,
            custom_member_type_id: this.hasCustomMemberTypeSettings
              ? this.selectedRole == 4
                ? 2
                : this.selectedRole
              : 0,
            send_member_email: this.sendMemberEmail ? 1 : 0,
          };
        }

        this._userService.addCompanyUser(params).subscribe(
          (response) => {
            this.getMembers();
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (this.userMode == "edit") {
        let params;
        if (this.hasMemberContract) {
          if (!this.selectedMemberContractDuration) {
            return false;
          }
          let contract_duration =
            this.selectedMemberContractDuration == "6 month"
              ? 6
              : this.selectedMemberContractDuration == "1 year"
              ? 1
              : null;
          let contract_unit =
            this.selectedMemberContractDuration == "6 month"
              ? "month"
              : this.selectedMemberContractDuration == "1 year"
              ? "year"
              : null;
          params = {
            first_name: this.userForm?.get("first_name")?.value,
            last_name: this.userForm?.get("last_name")?.value,
            email: this.userForm?.get("email")?.value,
            password: this.userForm?.get("password")?.value,
            user_role: user_role,
            gar_thematic_group: 0,
            contract_duration: contract_duration,
            contract_unit: contract_unit,
            user_id: this.userId,
          };
        } else {
          params = {
            first_name: this.userForm?.get("first_name")?.value,
            last_name: this.userForm?.get("last_name")?.value,
            email: this.userForm?.get("email")?.value,
            password: this.userForm?.get("password")?.value,
            user_role: user_role,
            user_id: this.userId,
          };
        }

        if (this.courseCreditSetting) {
          if (this.remainingCourseCredits > 0) {
            params["course_credits"] = this.courseCredits;
            params["remaining_course_credits"] = this.remainingCourseCredits;
          } else {
            return false;
          }
        }
      }
    } else {
      if (this.userMode != "deny") {
        if (this.hasMemberContract) {
          if (
            !this.isValidForm() ||
            !this.selectedRole ||
            !this.selectedMemberContractDuration
          ) {
            return false;
          }
        } else {
          if (!this.isValidForm() || !this.selectedRole) {
            return false;
          }
        }
      }
      let user_role = "";
      switch (parseInt(this.selectedRole)) {
        case 1:
          user_role = "Member";
          break;
        case 2:
          user_role = "Admin 1";
          break;
        case 3:
          user_role = "Admin 2";
          break;
        case 4:
          user_role = "Super Admin";
          break;
        case 5:
          user_role = "Sales Person";
          break;
        case 96:
          user_role = "Miembro Gar";
          break;
        case 97:
          user_role = "Miembro Grupos temáticos";
          break;
        case 98:
          user_role = "Admin Gar";
          break;
        case 99:
          user_role = "Admin Grupos temáticos";
          break;
        case 102: 
          user_role = 'Netcultura'
          break
      }

      let formData = [];
      formData = this.userForm?.value;
      if(formData['city'] == '' && this.userRoleType == 'Admin SEDE' && this.adminSedeCity) {
        formData['city'] = this.adminSedeCity
      }
      formData["user_role"] = user_role;
      (formData["gar_thematic_group"] = 0), (formData["user_id"] = this.userId);
      formData["custom_member_type_id"] = this.hasCustomMemberTypeSettings
      ? this.selectedRole == 4
      ? 2
      : this.selectedRole
      : 0;
      formData["send_member_email"] = this.sendMemberEmail ? 1 : 0;
      formData["super_admin"] = this.superAdmin ? 1 : 0;
      formData['tutor'] = this.tutor ? 1 : 0;
      formData['super_tutor'] = this.superTutor ? 1 : 0;
      formData['potsuper_tutor'] = this.potSuperTutor ? 1 : 0;
      formData['pot_tutor'] = this.potTutor ? 1 : 0;
      formData['companion'] = this.userTypeName == 'Acompañante' ? 1 : 0;
      formData['assigned_students'] = this.selectedAssignedStudent;
      formData['guardian'] = this.isGuardianType ? 1 : 0;
      if(this.courseCreditsList?.length && (this.isSuperAdmin || this.customMemberTypeId == 243)) {
        formData['separate_course_credits'] = this.separateCourseCredits ? 1 : 0
        formData['user_course_credits'] = this.courseCreditsList

        let message = `Existing User credits ${this.userCourseCredits?.length > 0 ? JSON.stringify(this.userCourseCredits) : ''} will be updated to ${this.courseCreditsList?.length > 0 ? JSON.stringify(this.courseCreditsList) : ''} `
        this._companyService.logMessage(this.companyId, this.userId, message, 'log')
      }
      if(this.selectedCourses?.length && (this.isSuperAdmin || this.customMemberTypeId == 243)) {
        let user_courses: any[] = []
        this.selectedCourses?.forEach(c => {
          user_courses.push({
            id: c?.id,
            title: c?.title
          })
        })
        formData['user_courses'] = user_courses;
      }

      if (this.startDate) {
        formData["created_at"] = moment(this.startDate).format('YYYY-MM-DD HH:mm:ss')
      }

      if (this.selectedBusinessCategories) {
        formData["business_category_id"] = this.selectedBusinessCategories
          .map((data) => {
            return data.id;
          })
          .join();
      }

      if (this.hasMemberContract) {
        if (!this.selectedMemberContractDuration) {
          return false;
        }
        let contract_duration =
          this.selectedMemberContractDuration == "6 month"
            ? 6
            : this.selectedMemberContractDuration == "1 year"
            ? 1
            : null;
        let contract_unit =
          this.selectedMemberContractDuration == "6 month"
          ? "month"
            : this.selectedMemberContractDuration == "1 year"
            ? "year"
            : null;

        formData["contract_duration"] = contract_duration; // this.memberContract ? this.memberContract : null
        formData["contract_unit"] = contract_unit; // this.selectedMemberContractDuration
      }

      if (this.hasMemberCommissions && this.selectedRequiredMember) {
        formData["require_member_id"] = this.selectedRequiredMember
          ? this.selectedRequiredMember
          : 0;
        formData["require_member_role"] = this.requiredMemberRole
          ? this.requiredMemberRole
          : "";
        formData["require_member_type_id"] = this.requiredMemberRoleId
          ? this.requiredMemberRoleId
          : 0;
      }

      if (this.selectedClubPresidentGroup) {
        formData["club_president_group"] =
        this.selectedClubPresidentGroup || null;
        }
      if (this.userMode == "add") {
        this._userService
          .addVCPUserDynamicCustom(this.companyId, formData)
          .subscribe(
            (response) => {
              if (response.code == "user_exists") {
                let message = `Existing User ${response?.existing_vcp_user ? JSON.stringify(response.existing_vcp_user) : ''} `
                this._companyService.logMessage(this.companyId, this.userId, message, 'warn')
                this.open(this._translateService.instant("dialog.userexists"), "");
              } else {
                let message = `User created ${response?.user ? JSON.stringify(response.user) : ''} ${response?.add_user_credits ? JSON.stringify(response?.add_user_credits) : ''} ${response?.add_course_user ? JSON.stringify(response?.add_course_user) : ''}`
                this._companyService.logMessage(this.companyId, this.userId, message, 'log')

                this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
                this.reloadMembersInfo();
                this.hasAddedUser = true;
                this.createdUserId = this.userForm?.get("email")?.value;
                this.closemodalbutton?.nativeElement.click();
              }
            },
            (error) => {
              console.log(error);
              let message = 'Unable to add user ' + JSON.stringify(error)
              this._companyService.logMessage(this.companyId, this.userId, message, 'error')
              this.open(this._translateService.instant("dialog.error"), "");
            }
          );
      } else if (this.userMode == "edit" || this.userMode == "approve") {
        if (this.userMode == "approve") {
          formData["last_renewal_date"] = 1;
        }
        if (this.courseCreditSetting) {
          if (this.remainingCourseCredits > 0) {
            formData["course_credits"] = this.courseCredits;
            formData["remaining_course_credits"] = this.remainingCourseCredits;
          } else {
            formData["course_credits"] = this.courseCredits || 0;
            formData["remaining_course_credits"] =
              this.remainingCourseCredits || 0;
          }
        }
        this._userService
          .updateUserDynamicCustom(
            this.selectedUser.id,
            this.companyId,
            formData
          )
          .subscribe(
            (response) => {
              this.reloadMembersInfo("Active");
              this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
              this.closemodalbutton?.nativeElement.click();
            },
            (error) => {
              console.log(error);
              let message = 'Unable to edit user ' + JSON.stringify(error)
              this._companyService.logMessage(this.companyId, this.userId, message, 'error')
              this.open(this._translateService.instant("dialog.error"), "");
            }
          );
      } else if (this.userMode == "deny") {
        this._userService.denyMember(
          this.selectedUser.id
        ).subscribe(
          async response => {
            this.showEditUserModal = false
            if(this.membersForApproval) {
              this.membersForApproval.forEach((p, idx) => {
                if(p.id == this.selectedUser.id) {
                  this.membersForApproval.splice(idx, 1);
                }
              })
              this.membersForApproval2 = this.membersForApproval
            }
            this.membersNotApproved = get(await this._userService.getMembersNotApproved(this.companyId).toPromise(), 'all_members')
            this.membersNotApproved2 = this.membersNotApproved
            this.filterMemberStatus('Active')
            setTimeout(() => {
              this.filterMemberStatus('Approval')
            }, 500)
          },
          error => {
            console.log(error)
            this.open(this._translateService.instant('dialog.error'), '')
          });
      }        
    }
  }

  async reloadMembersInfo(status: any = "") {
    this.reloadMembers(status);
  }

  reloadMembers(status: any = "", reload: boolean = false) {
    setTimeout(() => {
      if (status) {
        this.memberStatusFilter = "Active";
      }
      this.getMembers();
      if(this.hasTutors) {
        this.getTutors();
      }
      // this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    }, 500);
  }

  isValidForm() {
    let valid = true;
    // Object.keys(this.userForm?.controls).forEach(key => {
    //   const controlErrors: ValidationErrors = this.userForm?.get(key).errors;
    //   if(controlErrors != null) {
    //     valid = false;
    //   }
    // });
    return valid;
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  deleteUser(user) {
    if (user.id) {
      var confirmdeleteitem = this._translateService.instant(
        "dialog.confirmdeleteitem"
      );
      if (this.memberStatusFilter != "Deleted" && user.subscription_id) {
        confirmdeleteitem = this._translateService.instant(
          "dialog.confirmdeleteitemsubscription"
        );
      }

      this.showConfirmationModal = false;
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmdelete"
      );
      this.confirmDeleteItemDescription = confirmdeleteitem;
      this.acceptText = "OK";
      this.selectedConfirmItem = user.id;
      this.selectedConfirmMode = "delete";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  deleteSingleDeletedUser(id, confirmed) {
    if (confirmed) {
      this._userService.deleteCompanyDeletedUser(id).subscribe(
        (response) => {
          let new_members = this.members.filter((c) => {
            return c.id != id;
          });
          this.refreshMembers(new_members);
          this.selectedConfirmItem = "";
          this.selectedConfirmMode = "";
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  deleteSingleUser(id, confirmed) {
    if (confirmed) {
      this._userService.deleteCompanyUser(id, this.userId).subscribe(
        (response) => {
          let new_members = this.members.filter((c) => {
            return c.id != id;
          });
          this.refreshMembers(new_members);
          this.selectedConfirmItem = "";
          this.selectedConfirmMode = "";
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  recoverUser(user) {
    if (user.id) {
      this.showConfirmationModal = false;
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmrecover"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmrecoveruser"
      );
      this.acceptText = "OK";
      this.selectedConfirmItem = user;
      this.selectedConfirmMode = "recover";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  recoverSingleDeletedUser(user, confirmed) {
    if (confirmed) {
      this._userService.recoverCompanyDeletedUser(user.id).subscribe(
        async (response) => {
          this.dataSource = this.members;
          this.getMembers(true);
          this.selectedConfirmItem = "";
          this.selectedConfirmMode = "";
          this.open(
            this._translateService.instant("dialog.recoveredsuccessfully"),
            ""
          );
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  recoverSelectedDeletedUser(confirmed) {
    if (confirmed) {
      let params = {
        user_id: this.selectedUsers
          .map((data) => {
            return data.id;
          })
          .join(),
      };
      this._userService.bulkRecoverDeletedUser(params).subscribe(
        async (response) => {
          let new_members = this.members.filter((c) => {
            let match = this.selectedUsers.some((a) => a.id == c.id);
            return !match;
          });
          this.refreshMembers(new_members);
          this.selectedUsers = [];
          this.open(
            this._translateService.instant("dialog.recoveredsuccessfully"),
            ""
          );
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  onUserSelected(event, user) {
    if (event.target.checked) {
      this.members.forEach((p, index) => {
        if (p.id == user.id) {
          this.members[index].checked = 1;
        }
      });
      if (this.selectedUsers) {
        let match = this.selectedUsers.some((a) => a.id === user.id);
        if (!match) {
          this.selectedUsers.push(user);
        }
      } else {
        this.selectedUsers.push(user);
      }
    } else {
      this.selectedUsers.forEach((p, index) => {
        if (p.id == user.id) {
          this.selectedUsers[index].checked = 0;
        }
      });
      if (this.selectedUsers) {
        this.selectedUsers.forEach((p, idx) => {
          if (p.id === user.id) {
            this.selectedUsers.splice(idx, 1);
          }
        });
      }
    }
  }

  bulkOperateUser() {
    if (this.selectedUsers?.length > 0 && this.selectedUserBulkAction) {
      if (this.selectedUserBulkAction == "delete") {
        this.showConfirmationModal = false;
        this.confirmDeleteItemTitle = this._translateService.instant(
          "dialog.confirmdelete"
        );
        this.confirmDeleteItemDescription = this._translateService.instant(
          "dialog.confirmdeleteitem"
        );
        this.acceptText = "OK";
        setTimeout(() => (this.showConfirmationModal = true));
      } else if (this.selectedUserBulkAction == "recover") {
        this.showConfirmationModal = false;
        this.confirmDeleteItemTitle = this._translateService.instant(
          "dialog.confirmrecover"
        );
        this.confirmDeleteItemDescription = this._translateService.instant(
          "dialog.confirmrecoveruser"
        );
        this.acceptText = "OK";
        setTimeout(() => (this.showConfirmationModal = true));
      } else if (this.selectedUserBulkAction == "editstatus") {
        this.editBulkUserStatus();
      }
    } else {
      this.open(
        this._translateService.instant("dialog.pleaseselectanaction"),
        ""
      );
    }
  }

  editBulkUserStatus() {
    this.bulkSelection = 1;
    this.selectedUserStatus = "Incomplete";
    this.dialogMode = "editstatus";
    this.dialogTitle = this.getDialogTitle();
    this.modalbutton?.nativeElement.click();
  }

  getDialogTitle() {
    let title;
    if (this.dialogMode == "editstatus") {
      title = this._translateService.instant("your-admin-area.editstatus");
    } else if (this.dialogMode == "adduser") {
      title = this._translateService.instant("customer.createnewuser");
    } else if (this.dialogMode == "edituser") {
      title = this._translateService.instant("customer.edituser");
    }
    return title;
  }

  saveDialog() {
    if (this.dialogMode == "editstatus") {
      this.updateUserStatus();
    } else if (this.dialogMode == "adduser" || this.dialogMode == "edituser") {
      this.saveUser();
    }
  }

  confirm() {
    if (this.selectedUsers?.length > 0) {
      if (this.selectedUserBulkAction == "delete") {
        if (this.memberStatusFilter == "Deleted") {
          this.deleteSelectedDeletedUser(true);
          this.showConfirmationModal = false;
        } else {
          this.deleteSelectedUser(true);
          this.showConfirmationModal = false;
        }
      } else if (this.selectedUserBulkAction == "recover") {
        if (this.memberStatusFilter == "Deleted") {
          this.recoverSelectedDeletedUser(true);
          this.showConfirmationModal = false;
        }
      }
    }

    if (this.selectedConfirmItem) {
      if (this.selectedConfirmMode == "delete") {
        if (this.memberStatusFilter == "Deleted") {
          this.deleteSingleDeletedUser(this.selectedConfirmItem, true);
          this.showConfirmationModal = false;
        } else {
          this.deleteSingleUser(this.selectedConfirmItem, true);
          this.showConfirmationModal = false;
        }
      } else if (this.selectedConfirmMode == "recover") {
        if (this.memberStatusFilter == "Deleted") {
          this.recoverSingleDeletedUser(this.selectedConfirmItem, true);
          this.showConfirmationModal = false;
        }
      }
    }

    if(this.selectedOperation == 'confirm' && this.selectedUser) {
      this.updateUserConfirmStatus(this.selectedUser.id, true);
      this.showConfirmationModal = false;
    }
  }

  deleteSelectedDeletedUser(confirmed) {
    if (confirmed) {
      let params = {
        user_id: this.selectedUsers
          .map((data) => {
            return data.id;
          })
          .join(),
      };
      this._userService.bulkDeleteDeletedUser(params).subscribe(
        (response) => {
          let new_members = this.members.filter((c) => {
            let match = this.selectedUsers.some((a) => a.id == c.id);
            return !match;
          });
          this.refreshMembers(new_members);
          this.selectedUsers = [];
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  deleteSelectedUser(confirmed) {
    if (confirmed) {
      let params = {
        user_id: this.selectedUsers
          .map((data) => {
            return data.id;
          })
          .join(),
      };

      this._userService.bulkDeleteUser(params, this.userId).subscribe(
        (response) => {
          let new_members = this.members.filter((c) => {
            let match = this.selectedUsers.some((a) => a.id == c.id);
            return !match;
          });
          this.refreshMembers(new_members);
          this.selectedUsers = [];
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  refreshMembers(array) {
    this.members = array;
    this.members2 = array;
    this.dataSource = new MatTableDataSource(
      this.members.slice(
        this.pageIndex * this.pageSize,
        (this.pageIndex + 1) * this.pageSize
      )
    );
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort));
    }
    if (this.paginator) {
      new MatTableDataSource(this.members).paginator = this.paginator;
      if (this.pageIndex > 0) {
      } else {
        this.paginator.firstPage();
      }
    } else {
      setTimeout(() => {
        if (this.paginator) {
          new MatTableDataSource(this.members).paginator = this.paginator;
          if (this.pageIndex > 0) {
            this.paginator.firstPage();
          }
        }
      });
    }
  }

  closeReceivedOneToOneModal() {
    this.showReceivedOneToOneModal = false;
  }

  getMemberOneToOne(id) {
    this.oneToOnes = [];
    this.receivedOneToOnes = [];
    // this.mainService.getMemberOneToOne(id)
    //   .subscribe(
    //       async (response) => {
    //           this.oneToOnes = response.one_to_one
    //           if(this.oneToOnes) {
    //             this.oneToOnes.forEach(q => {
    //               if(q.sender_id == id) {
    //                 this.receivedOneToOnes.push(q)
    //               }
    //             })

    //             this.oneToOnes = this.oneToOnes.map(onetoone => {
    //               return {
    //                 truncated_message: true,
    //                 ...onetoone
    //               }
    //             })
    //             this.receivedOneToOnes = this.receivedOneToOnes.map(onetoone => {
    //               return {
    //                 truncated_message: true,
    //                 ...onetoone
    //               }
    //             })
    //           }
    //       },
    //       error => {
    //           console.log(error)
    //       }
    //   )
  }

  showOneToOne(member) {
    this.getMemberOneToOne(member.id);
    this.showReceivedOneToOneModal = true;
  }

  goBack() {
    this._location.back();
  }

  generatePaymentLink() {
    this.showExistingUser = false;
    this.isLinkProcessing = false;
    this.paymentLink = "";
    this.generateLinkMode = "";
    this.paymentMemberTypes = this.memberTypes.filter((mt) => {
      return mt.require_payment == 1;
    });
    this.showGeneratePaymentLinkModal = true;
  }

  closeGeneratePaymentLinkModal() {
    this.showGeneratePaymentLinkModal = false;
    this.paymentLink = "";
    this.generateLinkMode = "";
  }

  generatePaymentLinkForUser(user) {
    this.isLinkProcessing = false;
    this.paymentLink = "";
    this.generateLinkMode = "selectedUserLink";
    this.selectedExistingUser = user.id;
    this.paymentMemberTypes = this.memberTypes.filter((mt) => {
      return mt.require_payment == 1;
    });
    this.showGeneratePaymentLinkModal = true;
  }

  generateLink() {
    this.isLinkProcessing = true;

    let params = {
      company_id: this.companyId,
      user_id: this.selectedExistingUser,
      custom_member_type_id: this.selectedMemberType,
    };
    // this.mainService.generatePaymentLink(params)
    //   .subscribe(
    //     async response => {
    //       this.paymentLink = response.payment_link
    //       this.isLinkProcessing = false
    //     },
    //     error => {
    //       this.isLinkProcessing = false
    //       console.log(error)
    //     }
    // )
  }

  handleExistUser(event) {
    if (event.target.checked) {
      this.showExistingUser = true;
    } else {
      this.showExistingUser = false;
    }
  }

  changeSelectedExistingUser(event) {
    this.selectedExistingUser = event.target.value;
  }

  copyPaymentLink() {
    this.paymentLinkCopied = false;
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = this.paymentLink;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    // this.paymentLinkCopied = true
    this.open(
      this._translateService.instant("dashboard.registrationlinkcopied"),
      ""
    );
  }

  async changeMemberRoleGroup(event) {
    this.roleMemberGroupChanged = true;
    this.newSelectedRole = this.selectedRole
    this.newUserForm = "";
    var existingUserForm;
    if (this.hasCustomMemberTypeSettings) {
      if (this.userMode == "add") {
        existingUserForm = this.userForm;
        this.newUserForm = existingUserForm;
      }
      this.getCustomProfileFields();
    }

    this.loadSelectedUserData(existingUserForm);
    this.checkClubPresident();

    this.roleGroups = [];
    if (
      !this.memberRoleGroups ||
      (this.memberRoleGroups && this.memberRoleGroups.length == 0) ||
      this.showClubsDropdown
    ) {
      //   this.memberRoleGroups = get(await this.mainService.getGroups(this.domain).toPromise(), 'CompanyGroup')
      this.memberRoleGroups = this.handleSortClubs(this.memberRoleGroups);
    }

    this.showAdditionalMemberTypeDropdown = false;
    this.requiredMemberRole = "";
    this.selectedRequiredMember = "";
    if (this.hasMemberCommissions) {
      let required_member_type_id;
      let required_member_type = this.memberTypes.filter((mt) => {
        return mt.id == this.selectedRole;
      });
      if (required_member_type && required_member_type[0]) {
        required_member_type_id = required_member_type[0].require_member_type;
      }
      if (required_member_type_id && required_member_type_id > 0) {
        let req_member_type = this.memberTypes.filter((mt) => {
          return mt.id == required_member_type_id;
        });
        if (req_member_type && req_member_type[0]) {
          this.requiredMemberRoleId = req_member_type[0].id;
          this.requiredMemberRole =
            this.language == "en"
              ? req_member_type[0].type
              : req_member_type[0].type_es;
        }

        this.showAdditionalMemberTypeDropdown = true;
        this.requiredMemberList =
          this.members &&
          this.members.filter((u) => {
            return u.custom_member_type_id == required_member_type_id;
          });
      }
    }
  }

  handleSortClubs(clubs) {
    return (
      clubs &&
      clubs.sort((a, b) =>
        this.language == "en" && a.title_en
          ? a.title_en.localeCompare(b.title_en)
          : this.language == "fr" && a.title_fr
          ? a.title_fr.localeCompare(b.title_fr)
          : a.title.localeCompare(b.title)
      )
    );
  }

  checkClubPresident() {
    let member_type = this.memberTypes.filter((mt) => {
      return mt.id == this.selectedRole;
    });
    this.showClubsDropdown =
      member_type &&
      member_type.length > 0 &&
      member_type[0].club_president == 1
        ? this.hasClubs
          ? true
          : false
        : false;
  }

  async loadSelectedUserData(userForm) {
    if (this.showDefaultRegistrationFields) {
      if (this.selectedUser) {
        this.userForm?.controls["first_name"].setValue(
          this.selectedUser.first_name
        );
        this.userForm?.controls["last_name"].setValue(
          this.selectedUser.last_name
        );
        this.userForm?.controls["email"].setValue(this.selectedUser.email);
      }
    } else {
      if (this.selectedUser && this.selectedUser.id) {
        if (this.selectedFields) {
          this.selectedFields.forEach((f) => {
            if (
              f.field != "coupon" &&
              f.field != "business_category" &&
              f.field != "logo"
            ) {
              if (f.field == "webpage") {
                if (
                  !this.selectedUser[f.field] &&
                  this.selectedUser["website"]
                ) {
                  this.userForm?.controls[f.field].setValue(
                    this.selectedUser["website"]
                      ? this.selectedUser["website"]
                      : ""
                  );
                } else {
                  this.userForm?.controls[f.field].setValue(
                    this.selectedUser[f.field] ? this.selectedUser[f.field] : ""
                  );
                }
              } else {
                this.userForm?.controls[f.field].setValue(
                  this.selectedUser[f.field] ? this.selectedUser[f.field] : ""
                );
              }
            } else if (f.field == "business_category") {
              this.selectedBusinessCategories =
                this.selectedUser.business_categories;
            } else if (f.field == "logo") {
              this.userLogoSrc =
                environment.api + "/" + this.selectedUser[f.field];
            }
          });
        }
      } else {
        if (userForm) {
          this.loadEnteredUserData(userForm);
        }
      }
    }

    if (this.hasMemberContract && this.selectedUser) {
      this.selectedMemberContractDuration =
        this.selectedUser.contract_duration +
        " " +
        this.selectedUser.contract_unit;
    }

    if (
      this.selectedUser &&
      this.userForm &&
      this.userForm?.controls["country"] &&
      !this.selectedUser.country
    ) {
      // Set default to Spain
      this.userForm?.controls["country"].setValue("Spain");
    }
  }

  sendPaymentLink(user) {
    this.isLinkProcessing = false;
    this.paymentLink = "";
    this.paymentMemberTypes = this.memberTypes.filter((mt) => {
      return mt.require_payment == 1;
    });
    if (this.paymentMemberTypes && this.paymentMemberTypes[0]) {
      if (user.custom_member_type_id > 0) {
        this.selectedMemberType = user.custom_member_type_id;
      } else {
        this.selectedMemberType = this.paymentMemberTypes[0].id;
      }
    }
    // this.members = this.membersForApproval
    this.selectedExistingUser = user.id;
    this.showSendPaymentLinkModal = true;

    // Generate payment link
    this.isLinkProcessing = true;

    let params = {
      company_id: this.companyId,
      user_id: this.selectedExistingUser,
      custom_member_type_id: this.selectedMemberType,
    };
    // this.mainService.generatePaymentLink(params)
    //   .subscribe(
    //     async response => {
    //       this.paymentLink = response.payment_link
    //       this.isLinkProcessing = false
    //     },
    //     error => {
    //       this.isLinkProcessing = false
    //       console.log(error)
    //     }
    // )
  }

  closeSendPaymentLinkModal() {
    this.showSendPaymentLinkModal = false;
  }

  sendLink() {
    // this.isLinkProcessing = true
    // let params = {
    //   company_id: this.companyId,
    //   user_id: this.selectedExistingUser,
    //   custom_member_type_id: this.selectedMemberType,
    //   payment_link: this.paymentLink,
    // }
    // this.mainService.sendPaymentLink(params)
    //   .subscribe(
    //     async response => {
    //       this.isLinkProcessing = false
    //       this.open(this._translateService.instant("dialog.sentsuccessfully"), null);
    //       setTimeout(() => {
    //         this.showSendPaymentLinkModal = false
    //       }, 1000)
    //     },
    //     error => {
    //       this.isLinkProcessing = false
    //       console.log(error)
    //     }
    // )
  }

  reactivateUser(user) {
    // this.confirmationDialogService.confirm(
    //   this._translateService.instant('dialog.confirmreactivation'),
    //   this._translateService.instant('dialog.confirmreactivationitem')
    // ).then((confirmed) =>
    //   this.reactivateSelectedUser(confirmed, user)
    // ).catch(() =>
    //   console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)')
    // )
  }

  reactivateSelectedUser(confirmed, user) {
    if (confirmed) {
      //   this.mainService.reactivateUser(user.id).subscribe(
      //     async response => {
      //       this.memberStatusFilter = 'Approval'
      //       this.membersForApproval = get(await this.mainService.getMembersForApproval(this.companyId).toPromise(), 'all_members')
      //       this.membersForApproval2 = this.membersForApproval
      //       if(this.membersForApproval) {
      //         this.membersExpired.forEach( (u, idx) => {
      //           if(u.id === user.id) {
      //             this.membersExpired.splice(idx, 1)
      //           }
      //         })
      //         this.membersExpired2 = this.membersExpired
      //       }
      //       if(this.membersNotApproved) {
      //         this.membersNotApproved.forEach( (u, idx) => {
      //           if(u.id === user.id) {
      //             this.membersNotApproved.splice(idx, 1)
      //           }
      //         })
      //         this.membersNotApproved2 = this.membersNotApproved
      //       }
      //       this.filterMembers()
      //       this.open(this._translateService.instant("dialog.reactivatedsuccessfully"), null);
      //     },
      //     error => {
      //       console.log(error);
      //     }
      //   )
    }
  }

  typeRequirePayment(row) {
    let result = false;

    if (
      this.memberTypes &&
      this.memberTypes.length > 0 &&
      row.custom_member_type_id > 0
    ) {
      let type = this.memberTypes.filter((mt) => {
        return mt.id == row.custom_member_type_id && mt.require_payment == 1;
      });
      if (type && type[0]) {
        result = true;
      }
    }

    return result;
  }

  getTranslatedRole(row) {
    if (row.user_role == "Guest" && this.memberStatusFilter == "Incomplete") {
      return this._translateService.instant("plan-details.guest");
    } else {
      let role = row.user_role;
      if (row.user_role == "Member") {
        role = this.language == 'es' && this.companyId == 12 ? 'Miembro' : this._translateService.instant("your-admin-area.member");
        if (this.companyId == 12 && this.salesPeopleList?.length > 0) {
          let match = this.salesPeopleList?.some((a) => a.id === row.id);
          if (match) {
            role = "Sales Person";
          }
        }
      }
      return role;
    }
  }

  async checkTutor(event) {
    this.tutor = event.target.checked
    if(!this.tutor){
      this.superTutor = false;
      this.potSuperTutor = false;
      this.potTutor = false;
      this.selectedAssignedTutor = ''
    }
    this.checkClubPresident();
    if(!this.memberRoleGroups || (this.memberRoleGroups && this.memberRoleGroups.length == 0) || this.showClubsDropdown) {
      this.memberRoleGroups = get(await this._clubsService.getGroups(this.domain).toPromise(), 'CompanyGroup')
      this.memberRoleGroups = this.handleSortClubs(this.memberRoleGroups)
    }

  }

  async checkSuperTutor(event,key) {
      this.tutorToAssign = get(await this._tutorsService.getTutors(this.companyId).toPromise(), 'tutors')
        if(key === 'supertutor'){
          let super_tutor = this.tutorToAssign2?.filter(tut => {
            return (tut.user_id == this.selectedUser?.id && tut.super_tutor == 1)
          })
          this.tutorToAssign = this.tutorToAssign?.length > 0 ? this.tutorToAssign.filter(tta => {
            return !tta.parent_tutor_id || tta.super_tutor != 1
          }) : [  ]
          if(!this.superTutor || super_tutor?.length == 0){
            this.selectedAssignedTutor = ''
          }
          
          this.superTutor = event.target.checked
          this.potSuperTutor = false
          this.potTutor = false
        }else if(key === 'potsupertutor'){
          let potsuper_tutor = this.tutorToAssign2?.filter(tut => {
            return (tut.user_id == this.selectedUser?.id && tut.potsuper_tutor == 1)
          })
          this.tutorToAssign = this.tutorToAssign?.length > 0 ? this.tutorToAssign.filter(tta => {
            return !tta.parent_tutor_id || tta.potsuper_tutor != 1
          }) : [  ]
          if(!this.potSuperTutor || potsuper_tutor?.length == 0){
            this.selectedAssignedTutor = ''
          }
          
          this.potSuperTutor = event.target.checked
          this.superTutor = false
          this.potTutor = false
        }else if (key === 'pottutor'){
          this.superTutor = false
          this.potSuperTutor = false
        }
  }


  assignTutor(row) {
    this.selectedTutor = row;
    this.getSelectedCourses();
  }

  getSelectedCourses() {
    let tutor = this.tutorToAssign2?.filter(t => {
      return t.user_id == this.selectedTutor?.id
    })
    if(tutor?.length > 0) {
      this._tutorsService.getTutorCourses(tutor[0].id).subscribe(
        response => {
          let course_tutors = response['tutor_courses'] || []
          course_tutors?.forEach(cd => {
            let title = this.getCourseTitle(cd.course_id)
            if(title) {
              this.selectedCourses.push({
                id: cd.id,
                title: title
              })
            }
          })
          this.showAssignTutorModal = true
        })
    } else {
      this.showAssignTutorModal = true
    }
  }

  getCourseTitle(course_id) {
    let course_row = this.courses?.filter((t) => {
      return t.id == course_id;
    });
    let course = course_row?.length > 0 ? course_row[0] : "";
    return course
      ? this.language == "en"
        ? course.title_en
          ? course.title_en || course.title
          : course.title
        : this.language == "fr"
        ? course.title_fr
          ? course.title_fr || course.title
          : course.title
        : course.title
      : "";
  }

  closeAssignTutorModal() {
    this.showAssignTutorModal = false;
  }

  isTutorRole(row) {
    let tutor = false;
    if (this.tutorToAssign2?.length > 0) {
      let match = this.tutorToAssign2.some((a) => a.user_id == row.id);
      tutor = match ? true : false;
    }
    return tutor;
  }

  assignCourses() {
    let tutor = this.tutorToAssign2?.filter(t => {
      return t.user_id == this.selectedTutor?.id
    })
    let params = {
      course_id: this.selectedCourses ? this.selectedCourses.map((data) => { return data.id }).join() : '',
      tutor_id: tutor?.length > 0 ? tutor[0].id : 0,
    }
    if(this.selectedCourses?.length > 0) {
      this._tutorsService.assignTutorCourses(params)
      .subscribe(
        response => {
          this.open(this._translateService.instant("dialog.savedsuccessfully"), '');
          this.showAssignTutorModal = false
        },
        error => {
          this.isLinkProcessing = false
          console.log(error)
        }
      )
    }
  }

  actionConditionA(recordStatus) {
    if (this.memberStatusFilter != "All") {
      if (
        this.memberStatusFilter != "Approval" &&
        this.memberStatusFilter != "Confirm" &&
        this.memberStatusFilter != "Expired" &&
        this.memberStatusFilter != "Cancelled" &&
        this.memberStatusFilter != "Incomplete"
      ) {
        return true;
      }
    } else {
      if (recordStatus) {
        if (
          recordStatus != "company-settings.forapproval" &&
          recordStatus != "company-settings.foremailconfirmation" &&
          recordStatus != "company-settings.expired" &&
          recordStatus != "company-settings.cancelled" &&
          recordStatus != "company-settings.deleted"
        ) {
          return true;
        }
      }
    }
    return false;
  }

  actionConditionB(recordStatus) {
    if (this.memberStatusFilter != "All") {
      if (this.memberStatusFilter == "Approval") {
        return true;
      }
    } else {
      if (recordStatus) {
        if (recordStatus == "company-settings.forapproval") {
          return true;
        }
      }
    }
    return false;
  }

  actionConditionC(recordStatus) {
    if (this.memberStatusFilter != "All") {
      if (
        this.memberStatusFilter == "NotApproved" ||
        this.memberStatusFilter == "Expired" ||
        this.memberStatusFilter == "Cancelled" ||
        this.memberStatusFilter == "Failed"
      ) {
        return true;
      }
    } else {
      if (recordStatus) {
        if (
          recordStatus == "company-settings.notapproved" ||
          recordStatus == "company-settings.expired" ||
          recordStatus == "company-settings.cancelled" ||
          recordStatus == "company-settings.failed"
        ) {
          return true;
        }
      }
    }
    return false;
  }

  actionConditionD(row) {
    let hasInvoice =
      this.hasCustomInvoice && row.subscription_id && row.user_invoices > 0
        ? true
        : false;

    if (this.memberStatusFilter != "All") {
      if (
        this.requireApproval &&
        !hasInvoice &&
        (this.memberStatusFilter == "Active" ||
          this.memberStatusFilter == "Approval" ||
          (this.memberStatusFilter != "Expired" &&
            this.memberStatusFilter == "Cancelled" &&
            this.memberStatusFilter == "Failed" &&
            this.memberStatusFilter == "Deleted" &&
            this.memberStatusFilter == "NotApproved"))
      ) {
        return true;
      }
    } else {
      if (row.recordStatus) {
        if (
          this.requireApproval &&
          !hasInvoice &&
          (row.recordStatus == "company-settings.active" ||
            row.recordStatus == "company-settings.forapproval" ||
            (row.recordStatus != "company-settings.expired" &&
              row.recordStatus != "company-settings.cancelled" &&
              row.recordStatus != "company-settings.failed" &&
              row.recordStatus != "company-settings.deleted" &&
              row.recordStatus != "company-settings.notapproved"))
        ) {
          return true;
        }
      }
    }
  }

  getStartDate(row) {
    return row.created || "";
  }

  getReactivationDate(row) {
    return row.last_renewal_date || "";
  }

  showInvoices(row) {}

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  getTutors() {
    this._tutorsService.getTutors(this.companyId)
      .subscribe(
        async (response) => {
          this.tutorToAssign2 = response['tutors']
          this.tutorToAssign = this.tutorToAssign2
        },
        error => {
          console.log(error)
        }
      )
  }

  getCourses() {
    this._coursesService.getAllCourses(this.companyId)
      .subscribe(
        async (response) => {
          let courses = response['courses']
          this.courses = courses?.filter(course => {
            return course.status == 1
          })
          this.allCourses = this.courses
          this.filteredCourses = this.allCourses
        },
        error => {
          console.log(error)
        }
      )
  }

  handleChangeCourse(event) {
    let credits = 0;
    let course = this.courses?.filter((data) => {
      return data.id == event.id
    })
    if(course?.length > 0) {
      credits = course[0].course_credits
    }

    if(this.userCourseCredits?.length > 0) {
      let course_credits = this.userCourseCredits?.filter(ucc => {
        return ucc.course_id == course[0].id 
      })
      if(course_credits?.length > 0) {
        credits = course_credits[0].remaining_credits || course_credits[0].credits
      }
    }

    let totalCourseCredit = 0
    if(this.courseCreditsList?.length > 0){
      totalCourseCredit = this.courseCreditsList.reduce((result, value) => {
        result = value?.credits + result;
        return result;
      }, 0);
    }

    let match = this.courseCreditsList?.some(a => a.id === event.id)
    if(!match) {
      if(this.selectedUser?.custom_member_type_id !== 282 && event?.id == 131 && totalCourseCredit > 0){
        this.courseCreditsList.push({
          id: event.id,
          title: event.title,
          credits:0,
        })

      }else{
        this.courseCreditsList.push({
          id: event.id,
          title: event.title,
          credits,
        })

      }

    }

    if(this.courseCreditsList?.length == 0 && credits > 0) {
      this.courseCreditsList.push({
        id: event.id,
        title: event.title,
        credits,
      })
    }
  }

  handleSelectAllCourse(items) {
    if(items?.length > 0) {
      items?.forEach(event => {
        let credits = 0;
        let course = this.courses?.filter((data) => {
          return data.id == event.id
        })
        if(course?.length > 0) {
          credits = course[0].course_credits
        }

        let totalCourseCredit = 0
        if(this.courseCreditsList?.length > 0){
          totalCourseCredit = this.courseCreditsList.reduce((result, value) => {
            result = value?.credits + result;
            return result;
          }, 0);
        }

        let match = this.courseCreditsList.some(a => a.id === event.id)
        if(!match) {

          if(this.selectedUser?.custom_member_type_id !== 282 && event?.id == 131 && totalCourseCredit > 0){
            this.courseCreditsList.push({
              id: event.id,
              title: event.title,
              credits:0,
            })
    
          }else{
            this.courseCreditsList.push({
              id: event.id,
              title: event.title,
              credits,
            })

          }
        }
      })
    }
  }

  handleDeSelectAllCourse(items) {
    this.courseCreditsList = [];
  }

  handleDeselectCourse(event) {
    if(this.courseCreditsList?.length > 0) {
      this.courseCreditsList && this.courseCreditsList.forEach((credit, index) => {
        if(credit.id == event.id) {
          this.courseCreditsList.splice(index, 1)
        }
      })
    }
  }

  onFilterStudentChange(search) {
    if(search) {
      let filteredMembers = this.allMembers?.filter(m => {
        return (
          (m.name &&
            m.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0) ||
          (m.first_name &&
            m.first_name
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                search
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.last_name &&
            m.last_name
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                search
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.startup_name &&
            m.startup_name
              .toLowerCase()
              .indexOf(search.toLowerCase()) >= 0) ||
          (m.founder_name &&
            m.founder_name
              .toLowerCase()
              .indexOf(search.toLowerCase()) >= 0) ||
          (m.email &&
            m.email.toLowerCase().indexOf(search.toLowerCase()) >=
              0)
        );
      })
      this.filteredMembers = filteredMembers;
    } else {
      this.filteredMembers = this.allMembers;
    }
  }

  onFilterCourseChange(search) {
    if(search) {
      let filteredCourses = this.allCourses?.filter(m => {
        return (
          (m.title &&
            m.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0)
        );
      })
      this.filteredCourses = filteredCourses;
    } else {
      this.filteredCourses = this.allCourses;
    }
  }

  handleGoBack() {
    this._location.back();
  }

  changeTab(event) {

  }

  addStudent() {
    if(this.assignedStudents?.length > 0) {
      this.filteredMembers?.forEach(member => {
        let match = this.assignedStudents?.some(a => a.id == member.id);
        if(match) {
          let selected_match = this.selectedAssignedStudent?.some(a => a.id == member.id);
          if(!selected_match) {
            this.selectedAssignedStudent.push(member);
          }
        }
      })
    }
    this.assignedStudents = [];
  }

  deleteAssignedStudent(row) {
    this.selectedAssignedStudent.forEach((g, idx) => {
      if(g.id == row.id) {
        this.selectedAssignedStudent.splice(idx, 1)
      }
    })
  }


  goToCredits(id){
    this._router.navigate([`/credits/${id}`]);
  }


  openTermDialog(custommemberID){
    if(custommemberID) {
      let contract = this.contracts?.filter(contract => {
        return contract.custom_member_type_id == custommemberID
      })
      this.contract = contract?.length > 0 ? contract[0].contract : '';
      this.isOpenContact = true
    }
  }

  closeTermDialog(){
    this.isOpenContact = false
  }

  getFieldDisplay(field) {
    // language == 'en' ? field?.field_display_en : field?.field_display_es
    return field
    ? this.language == "en"
      ? field.field_display_en ||
        field.field_display_es
      : this.language == "fr"
      ? field.field_display_fr ||
        field.field_display_es
      : this.language == "eu"
      ? field.field_display_eu ||
        field.field_display_es
      : this.language == "ca"
      ? field.field_display_ca ||
        field.field_display_es
      : this.language == "de"
      ? field.field_display_de ||
        field.field_display_es
      : this.language == "it"
      ? field.field_display_it ||
        field.field_display_es
      : field.field_display_es
    : "";
  }

  normalizeCase(str) {
    if (str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
    }
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}