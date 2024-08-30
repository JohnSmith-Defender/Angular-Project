import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
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
import { DateAdapter } from '@angular/material/core';
import { ButtonGroupComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import { CompanyService, LocalService, UserService } from "@share/services";
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
import { EditorModule } from "@tinymce/tinymce-angular";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-crm",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    EditorModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    NgxMaterialTimepickerModule,
    SearchComponent,
    ToastComponent,
    PageTitleComponent,
    ButtonGroupComponent,
    ToastComponent,
  ],
  templateUrl: "./crm.component.html",
})
export class CRMComponent {
  private destroy$ = new Subject<void>();

  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  searchText: any;
  placeholderText: any;
  userId: any;
  companyId: any;
  language: any;
  isloading: boolean = true;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = [
    "guest_name",
    "guest_phone",
    "guest_email",
    "zip_code",
    "sector",
  ];
  @ViewChild(MatPaginator, { static: false }) paginator:
      | MatPaginator
      | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  searchKeyword: any;
  company: any;
  user: any;
  superAdmin: boolean = false;
  filterType: string = "crm";
  allInvites: any;
  data: any;
  categories: any;
  buttonList: any = [];
  selectedCategory: any = 'All';
  hasSalesFunnel: boolean = false;
  filterRole: any = 'All';
  selectedFilterStatus: any = '';
  status: any = [];
  selectedStatus: any = 'Contacted';
  followup: any = [];
  selectedFollowup: any = '';
  notfollowupreason: any = [];
  selectedNotfollowupReason: any = '';
  contactDate: any;
  followupDate: any;
  sectors: any = [];
  eventparticipants: any = [];
  communicationTypes: any = [];
  roles: any = [];
  memberTypeId: any;
  admin1: boolean = false;
  admin2: boolean = false;
  salesPerson: any = [];
  isSalesPerson: boolean = false;
  canCRM: boolean = false;
  adminGarList: any = [];
  adminThematicList: any = [];
  memberGarList: any = [];
  memberThematicList: any = [];
  crmData: any = [];
  filteredData: any = [];
  cities: any = [];
  events: any = [];
  latestEvents: any = [];
  allData: any = [];
  manageGuestsData: any = [];
  allManagedGuestsData: any = [];
  allCRMData: any;
  selectedSector: string = '';
  zipCode: string = '';
  selectedTab: any = 'Status';
  updateStatusTitle: any = '';
  updateStatusComment: any;
  updateStatusEvent: any;
  updateStatusCommunicationType: any = '';
  updateStatusContactedDate: any;
  updateStatusContactDate: any;
  updateStatusSalesPerson: any = '';
  updateStatusSuccessMessage: any;
  updateStatusErrorMessage: any;
  communicationType: any = '';
  communications: any;
  filteredCommunications: any;
  p1: any;
  p2: any;
  communicationDate: any;
  crmTabIndex: number = 0;
  updateStatusId: any;
  updateInviteRegistrationId: any;
  alarms: any;
  showAlarms: boolean = false;
  updateContactId: any;
  updateContactName: any;
  updateContactPhone: any;
  updateContactEmail: any;
  updateContactPosition: any;
  updateContactWebsite: any;
  updateContactPostalCode: any;
  updateContactSector: any;
  updateContactStatus: any;
  updateContactDate: any;
  updateContactInvitedBy: any;
  updateContactComment: any;
  updateFollowupStatus: any;
  updateFollowupDate: any;
  updateFollowupReason: any;
  updateComment: any;
  comment: any;
  selectedEvent: any;
  showDateRangeControl: boolean = false;
  selectedOtherDateFilter: any;
  invitedBy: any = [];
  notContactQuestion1Answer: any;
  showNotContactQuestion2: boolean = false;
  notContactQuestion2Answer: any;
  updateStatusSubmitted: boolean = false;
  signedQuestion1Answer: any;
  missingTitle: boolean = false;
  missingContactedDate: boolean = false;
  missingContactDate: boolean = false;
  missingCommunicationType: boolean = false;
  hasCRMManage: boolean = false;
  createNewStatusMode: boolean = false;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: string = "";
  confirmDeleteItemDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  @ViewChild('title', { static: false }) titleElement: ElementRef | undefined;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _userService: UserService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslanguage) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
    this.status = [
      {
        status_en: 'Contacted',
        status_es: 'Contactado',
        value: 'Contacted'
      },
      {
        status_en: 'Contact',
        status_es: 'Contactar',
        value: 'Contact'
      },
      {
        status_en: 'Not to contact',
        status_es: 'No contactar',
        value: 'Not to contact'
      }
    ]
    this.followup = [
      {
        followup_en: 'Follow up',
        followup_es: 'Seguimiento',
        value: 'Follow up'
      },
      {
        followup_en: 'Not follow up',
        followup_es: 'No dar seguimiento',
        value: 'Not follow up'
      }
    ]
    this.notfollowupreason = [
      {
        notfollowupreason_en: 'Customer not interested',
        notfollowupreason_es: 'Cliente no interesado',
        value: 'Customer not interested'
      },
      {
        notfollowupreason_en: 'New customer',
        notfollowupreason_es: 'Nuevo cliente',
        value: 'New customer'
      }
    ]
    this.initializeSearch();
    this.getCRMData();
    this.getAssignedGuests();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getCRMData() {
    this._userService
      .fetchCRMData(this.companyId, this.userId)
      .subscribe(
        (data) => {
          this.user = data?.user;
          this.mapUserPermissions(data?.user_permissions);
          this.mapSettings(data);

          this.sectors = data?.sectors;
          this.eventparticipants = data?.participants;
          this.mapCommunicationTypes(data);
          this.mapRolesSales(data);

          this.allData = data?.crm;
          this.allCRMData = data?.crm;
          this.invitedBy = data?.all_members?.filter(ib => {
            return ib.password && ib.name;
          });
          this.formatCRM(data?.crm);
          this.refreshTable(this.data);
          this.initializeButtonGroup();
          this.isloading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getAssignedGuests() {
    this._userService
      .fetchCRMAssignedGuestsData(this.companyId, this.userId)
      .subscribe(
        (data) => {
          this.manageGuestsData = data?.assigned_guests;
          this.allManagedGuestsData = data?.assigned_guests;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapCommunicationTypes(data) {
    this.communicationTypes = data?.guest_actions;
    if(this.communicationTypes) {
      this.communicationTypes = this.communicationTypes?.filter(ct => {
        return ct.id <= 4
      });
    }
  }

  mapRolesSales(data) {
    this.roles = data?.role;
    if(this.roles) {
      this.roles.forEach(role => {
          if(role.role == 'Super Admin') {
            this.memberTypeId = role.id
            this.superAdmin = true
          }
          if(role.role == 'Admin 1') {
            this.memberTypeId = role.id
            this.admin1 = true
          }
          if(role.role == 'Admin 2') {
            this.memberTypeId = role.id
            this.memberTypeId = 2
            this.admin2 = true
          }
      });
    }

    if(!this.memberTypeId) {
      this.memberTypeId = 1
    }
    this.salesPerson = data?.sales_people
    if(this.salesPerson) {
      this.salesPerson = this.salesPerson.filter(sp => {
        return sp.id && sp.name
      })
      if(this.salesPerson) {
        this.salesPerson.forEach(sp => {
          if(sp.id == this.userId) {
            if(this.memberTypeId == 1) {
              this.memberTypeId = 5
            }
            this.isSalesPerson = true
          }
        });
      }
    }

    if(this.companyId == 12 && this.userId > 0 && !this.admin1 && !this.admin2) {
      this.adminGarList = data?.admin_gar;
      this.adminThematicList = data?.admin_thematic;
      this.memberGarList = data?.member_gar;
      this.memberThematicList = data?.member_thematic;
      
      let mgmatch = this.memberGarList && this.memberGarList?.some(a => a.id == this.userId)
      if(mgmatch && !this.superAdmin) {
        this.memberTypeId = 96
      }

      let mtmatch = this.memberThematicList && this.memberThematicList.some(a => a.id == this.userId)
      if(mtmatch && !this.superAdmin) {
        this.memberTypeId = 97
      }

      let agmatch = this.adminGarList && this.adminGarList.some(a => a.id == this.userId)
      if(agmatch && !this.superAdmin) {
        this.memberTypeId = 98
      }

      let atmatch = this.adminThematicList && this.adminThematicList.some(a => a.id == this.userId)
      if(atmatch && !this.superAdmin) {
        this.memberTypeId = 99
      }
    }
    
    let permissions = data?.user_permissions?.member_permissions;
    let content_permission = permissions && permissions.filter(p => {
      return p.custom_member_type_id == this.memberTypeId && p.feature_id == 1
    })
    
    if(content_permission && content_permission[0]) {
      this.canCRM = content_permission[0].crm == 1 ? true : false
    } else {
      if(this.superAdmin || this.admin1 || this.admin2) {
        this.canCRM = true
      }
    }

    let crm_manage_permission = permissions && permissions.filter(p => {
      return p.custom_member_type_id == this.memberTypeId && p.feature_id == 22
    })
    if(crm_manage_permission && crm_manage_permission[0]) {
      this.hasCRMManage = crm_manage_permission[0].create == 1 ? true : false
    } 
  }

  mapSettings(data) {
    let other_settings = data?.settings?.other_settings;
    if(other_settings?.length > 0) {
      this.hasSalesFunnel = other_settings.some(
        (a) => a.title_en == "Sales funnel" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
  }

  initializeButtonGroup() {
    let buttonList: any[] = [];
    buttonList.push({
      id: 1,
      value: "All",
      text: this._translateService.instant("plans.all"),
      selected: true,
      fk_company_id: this.companyId,
    });

    this.categories = [
      {
        id: 2,
        value: 'Member',
        text: this._translateService.instant('crm.member')
      },
      {
        id: 3,
        value: 'Guest',
        text: this._translateService.instant('crm.guest')
      },
      {
        id: 4,
        value: 'ManageGuest',
        text: this._translateService.instant('crm.manageguest')
      },
    ]

    if(this.superAdmin && this.hasSalesFunnel) {
      this.categories.push({
        id: 5,
        value: 'SalesFunnel',
        text: this._translateService.instant('crm.salesfunnel')
      })
    }

    if(this.categories?.length > 0) {
        this.categories?.forEach(category => {
            buttonList.push({
                id: category.id,
                value: category.value,
                text: category.text,
                selected: false,
                fk_company_id: this.companyId,
            });
        })
    }

    this.buttonList = buttonList;
  }

  formatCRM(crm) {
    let evts: any[] = [];
    this.data = crm;
    this.data = this.data?.map((item) => {
      return {
        guest_name: item?.name,
        guest_phone: item?.phone,
        guest_email: item?.email,
        ...item,
      };
    });
    this.crmData = this.data;
    this.filteredData = this.data;
    
    if(!this.filterRole || (this.filterRole && this.filterRole != 'ManageGuest')) {
      if(this.data) {
        this.data.forEach(d => {
          if(d.city) {
            let cityMatch = this.cities.some(a => a.city && a.city.toLowerCase().trim() === d.city.toLowerCase().trim());
            if(!cityMatch && d.city.length > 1) {
              if(d.city) {
                this.cities.push({
                  city: d.city
                });
              }
            }
          }

          let match = evts.some(a => a.id === d.event_id);
          if(!match) {
            let timezoneOffset = new Date().getTimezoneOffset();
            let plan_date = moment(d.plan_date).utc().utcOffset(timezoneOffset).format("ddd, D MMM").toString();
            if(d.event && d.event !== null && plan_date != 'Invalid Date') {
              evts.push({
                id: d.event_id,
                title: d.event + ' - ' + plan_date.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
              })
            }
          }
        });

        // Sort
        this.sectors.sort((a, b) => {
          if (a.sector < b.sector) {
              return -1
          }
  
          if (a.sector > b.sector) {
              return 1
          }
  
          return 0
        });

        this.cities.sort((a, b) => {
          if (a.city < b.city) {
            return -1
          }
  
          if (a.city > b.city) {
            return 1
          }
  
          return 0
        });
      }
    } 
    this.events = evts;
    this.latestEvents = evts;
    if(this.events && this.events.length > 5) {
      this.events = this.latestEvents.slice(0, 5);
    }
  }

  refreshTable(array) {
    this.displayedColumns = [
      "guest_name",
      "guest_phone",
      "guest_email",
      "zip_code",
      "sector",
    ];
    if(this.filterRole != 'Member') {
      this.displayedColumns.push('invited_by');
      this.displayedColumns.push('event');
      this.displayedColumns.push('event_date');
    }
    if(this.filterRole != 'Member' && this.filterRole != 'Guest' && this.filterRole != 'ManageGuest') {
      this.displayedColumns.push('attended');
    }
    if(this.filterRole != 'Member' && this.filterRole != 'Guest' && this.filterRole != 'ManageGuest' && !this.admin1 && !this.admin2 && !this.superAdmin) {
      this.displayedColumns.push('sales_person');
    }
    if(this.filterRole != 'Member') {
      this.displayedColumns.push('status');
    }

    if(this.hasCRMManage || this.superAdmin || this.admin1 || this.admin2) {
      this.displayedColumns.push('crm_action');
    }
    
    this.dataSource = new MatTableDataSource(
      array.slice(
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
      new MatTableDataSource(array).paginator = this.paginator;
      if (this.pageIndex > 0) {
      } else {
        this.paginator.firstPage();
      }
    } else {
      setTimeout(() => {
        if (this.paginator) {
          new MatTableDataSource(array).paginator = this.paginator;
          if (this.pageIndex > 0) {
            this.paginator.firstPage();
          }
        }
      });
    }
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.filteredData.slice(
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

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.filterCRM();
  }

  filterCategory(category) {
    this.buttonList?.forEach((item) => {
        if (item.value == category.value) {
          item.selected = true;
        } else {
          item.selected = false;
        }
    });
    this.filterRole = category.value;
    if(this.filterRole == 'ManageGuest') {
      this.allData = this.allManagedGuestsData;
      this.data = this.allManagedGuestsData;
    } else {
      this.allData = this.allCRMData;
      this.data = this.allCRMData;
    }
    this.crmData = this.data;
      this.filteredData = this.data;

    this.selectedCategory = category;
    this.filterCRM();
  }

  filterByStatus(item) {
    let val = item?.status_en || item;
    if(val != this.selectedFilterStatus) {
      this.selectedFilterStatus = val;
    } else {
      this.selectedFilterStatus = '';
    }
    this.filterCRM();
  }

  filterCRM() {
    let crm = this.allData;
    if (crm?.length > 0) {
      if(this.searchKeyword) {
        crm = crm?.filter((m) => {
          let include = false;
          if (
            (m.name &&
            m.name
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
            (m.phone &&
            m.phone
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
            (m.email &&
            m.email
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
            (m.sector &&
            m.sector
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
            (m.invited_by &&
            m.invited_by
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
            (m.sales_person &&
            m.sales_person
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
            (m.event &&
            m.event
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
              ) >= 0)
            ) {
              include = true;
            }

            return include;
          });
      }

      if(this.filterRole != 'All' && this.filterRole != 'ManageGuest') {
        crm = crm?.filter(item => {
          return item.role == this.filterRole;
        }) 
      }

      if(this.filterRole == 'ManageGuest') {
        if(!this.selectedFilterStatus) {
          crm = crm?.filter(d => {
            return d.sales_funnel != 1
          })
        }
      }

      if(this.filterRole == 'SalesFunnel') {
        crm = crm?.filter(d => {
          let active = false
  
          if(d.sales_funnel == 1) {
            active = true
          }
  
          return active
        })
      }

      if(this.selectedFilterStatus) {
        if(this.selectedFilterStatus == 'converted') {
          crm = crm.filter(data => {
            return data.converted == 1 || data.status == 'Signed' || data.status == 'Firmado'
          });
        } else if(this.selectedFilterStatus == 'No action') {
          crm = crm.filter(data => {
            return !data.status && data.converted != 1
          });
        } else if(this.selectedFilterStatus == 'Sales Funnel') {
          crm = crm.filter(d => {
            let active = false
  
            if(d.sales_funnel == 1) {
              active = true
            }
  
            return active
          })
        } else {
          crm = crm.filter(data => {
            if(this.superAdmin && this.hasSalesFunnel) {
              return this.selectedFilterStatus == data.status && data.converted != 1 && data.sales_funnel != 1
            } else {
              return this.selectedFilterStatus == data.status && data.converted != 1
            }
          })
        }
      }

      if(this.selectedSector) {
        crm = crm?.filter(d => {
          return d.sector == this.selectedSector
        })
      }

      if(this.zipCode) {
        crm = crm?.filter(d => {
          return d.zip_code?.indexOf(this.zipCode) >= 0
        })
      }
    }

    this.filteredData = crm;
    this.formatCRM(this.filteredData);
    this.refreshTable(this.filteredData);
  }

  handleChangeSector() {
    this.filterCRM();
  }

  onZipCodeChange() {
    this.filterCRM();
  }

  async changeTab(event) {
    switch(event.index) {
      case 0:
        if(this.isSalesPerson || (!this.superAdmin && !this.admin1 && !this.admin2)) {
          this.selectedTab = 'Contact';
        } else {
          this.selectedTab = 'Status';
        }
        break;
      case 1:
        if(this.isSalesPerson || (!this.superAdmin && !this.admin1 && !this.admin2)) {
          this.selectedTab = 'Status';
        } else {
          this.selectedTab = 'Contact';
        }
        break;
      case 2:
        this.selectedTab = 'Alarms';
        this.alarms = get(await this._userService.getAlarms(this.updateContactId).toPromise(), 'alarms');
        this.alarms = this.alarms.map(alarm => {
          return {
            truncated_comment: true,
            ...alarm
          }
        });
        if(!this.superAdmin) {
          this.alarms = this.alarms.filter(a => {
            return a.created_by == this.userId;
          })
        }
        break;
      case 3: 
        this.selectedTab = 'Communications';
        this.communications = get(await this._userService.getCommunications(this.updateContactId).toPromise(), 'communications');
        this.communications = this.communications.map(communication => {
          return {
            truncated_comment: true,
            ...communication
          }
        });
        if(!this.superAdmin) {
          this.communications = this.communications.filter(c => {
            return c.created_by == this.userId;
          })
        }
        this.filteredCommunications = this.communications;
        break;
      default:
        this.selectedTab = 'Status';
        break;
    }
    this.selectedTab = event;
  }

  checkNotContactQuestion1Answer(event) {
    let answer = event.target.value
    if(answer == 11) {
      this.showNotContactQuestion2 = true;
    } else {
      this.showNotContactQuestion2 = false;
    }
  }

  createAlarm() {
    this.crmTabIndex = 1;
    this.selectedStatus = 'Contact';
  }

  addAlarm() {
    this.updateStatusErrorMessage = '';
    this.updateStatusSuccessMessage = '';

    let action_date;
    if(this.updateStatusContactedDate) {
      action_date = this.updateStatusContactedDate;
    }
    let payload = {
      'title': this.updateStatusTitle,
      'event_id': this.updateStatusEvent,
      'contact_status': 'Contact',
      'user_id': this.updateContactId,
      'action_id': this.updateStatusCommunicationType,
      'action_date': action_date,
      'notes': this.updateStatusComment,
      'assigned_sales_person_id': this.updateStatusSalesPerson ? this.updateStatusSalesPerson : 0,
      'created_by': this.userId,
      'mode': 'alarm'
    }

    this._userService.addCRMStatus(
      this.updateContactId,
      payload
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      async (response) => {
        this.updateStatusTitle = '';
        this.updateStatusCommunicationType = '';
        this.updateStatusContactDate = '';
        this.updateStatusContactedDate = '';
        this.updateStatusComment = '';
        this.updateStatusSalesPerson = '';
        this.updateStatusSuccessMessage = 'Guardado exitosamente';

        this.selectedTab = 'Alarms';
        this.alarms = get(await this._userService.getAlarms(this.updateContactId).toPromise(), 'alarms');
        this.alarms = this.alarms.map(alarm => {
          return {
            truncated_comment: true,
            ...alarm
          }
        });
        if(!this.superAdmin) {
          this.alarms = this.alarms.filter(a => {
            return a.created_by == this.userId;
          })
        }
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        this.crmTabIndex = 2;
      },
      error => {
        console.log(error);
        this.updateStatusTitle = '';
        this.updateStatusCommunicationType = '';
        this.updateStatusContactDate = '';
        this.updateStatusContactedDate = '';
        this.updateStatusComment = '';
        this.updateStatusSalesPerson = '';
        this.updateStatusSuccessMessage = 'Guardado exitosamente';

        this.selectedTab = 'Alarms';
        this._userService.getAlarms(this.updateContactId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          async (response) => {
            this.alarms = response.alarms;
            this.alarms = this.alarms.map(alarm => {
              return {
                truncated_comment: true,
                ...alarm
              }
            });
            if(!this.superAdmin) {
              this.alarms = this.alarms.filter(a => {
                return a.created_by == this.userId;
              })
            }
            this.crmTabIndex = 2;
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          });
      }
    );
  }

  updateStatusData() {
    this.updateStatusSubmitted = true;
    this.updateStatusErrorMessage = '';
    this.updateStatusSuccessMessage = '';
    this.missingTitle = false;
    this.missingContactedDate = false;
    this.missingContactDate = false;
    this.missingCommunicationType = false;

    if(this.selectedStatus == 'Contacted' || this.selectedStatus == 'Contact') {
      // Check required fields
      if(!this.updateStatusTitle) {
        this.missingTitle = true;
      }

      if(!this.updateStatusCommunicationType) {
        this.missingCommunicationType = true;
      }

      if(this.selectedStatus == 'Contacted') {
        if(!this.updateStatusContactedDate) {
          this.missingContactedDate = true;
        }

        if(this.missingTitle || this.missingCommunicationType || this.missingContactedDate) {
          return false;
        }
      }

      if(this.selectedStatus == 'Contact') {
        if(!this.updateStatusContactDate) {
          this.missingContactDate = true;
        }

        if(this.missingTitle || this.missingCommunicationType || this.missingContactDate) {
          return false;
        }
      }
    }

    let question1_question = '';
    let question1_answer = '';
    let question2_question = '';
    let question2_answer = '';
    let question3_question = '';
    let question3_answer = '';
    if(this.selectedStatus == 'Not to contact') {
      if(!this.notContactQuestion1Answer) {
        return false;
      } else {
        if(this.showNotContactQuestion2) {
          if(!this.notContactQuestion2Answer) {
            return false;
          }
        }
      }
      
      if(this.selectedStatus == 'Not to contact') {
        if(this.notContactQuestion1Answer) {
          question1_question = 'Por favor seleccione una de estas tres opciones'
          if(this.notContactQuestion1Answer == "11") {
            question1_answer = 'Después de una Cita';
          } else if(this.notContactQuestion1Answer == "12") {
            question1_answer = 'Se enviaron varios intentos de conectar y no se obtuvo la respuesta';
          } else if(this.notContactQuestion1Answer == "13") {
            question1_answer = 'Decisión de commercial';
          }
        }
        if(this.showNotContactQuestion2 && this.notContactQuestion2Answer) {
          question2_question = '¿Cual es el motivo de descarte?'
          if(this.notContactQuestion2Answer == '21') {
            question2_answer = 'Dinero';
          } else if(this.notContactQuestion2Answer == '22') {
            question2_answer = 'Forma de pago';
          } else if(this.notContactQuestion2Answer == '23') {
            question2_answer = 'No está interesado en el funcionamiento del club';
          }
        }
      }
    }

    if(this.selectedStatus == 'converted') {
      if(this.selectedStatus == 'converted') {
        if(!this.signedQuestion1Answer) {
          return false;
        }
      }
      if(this.signedQuestion1Answer) {
        question3_question = '¿Cuando se firmó el contrato?'
        if(this.signedQuestion1Answer == "31") {
          question3_answer = 'Primera cita post evento';
        } else if(this.signedQuestion1Answer == "32") {
          question3_answer = 'Dos citas post evento';
        } else if(this.signedQuestion1Answer == "33") {
          question3_answer = 'Seguimiento posterior  de un mes post evento.';
        }
      }
    }

    let payload = {
      signed_comments: this.updateStatusComment,
      signed_question: question3_question,
      signed_answer: question3_answer
    }

    if(this.selectedStatus == 'converted' || this.selectedStatus == 'Signed' || this.selectedStatus == 'Firmado') {
      this._userService.signGuest(
        this.updateContactId,
        this.updateStatusEvent,
        payload
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        response => {
          this.filteredData.forEach(data => {
            if(data.user_id == this.updateContactId && data.event_id == this.updateStatusEvent) {
              data.converted = 1;
            }
          });
          this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          this.formatCRM(this.filteredData)
          this.refreshTable(this.filteredData)
        },
        error => {
            console.log(error);
        }
      );
    } else {
      if(this.updateStatusId > 0) {
        let action_date;
        if(this.selectedStatus == 'Contacted') {
          if(this.updateStatusContactedDate) {
            let timezoneOffset = new Date().getTimezoneOffset();
            action_date = moment(this.updateStatusContactedDate).utc().utcOffset(timezoneOffset * -1).format("YYYY-MM-DD HH:mm").toString();
          }
        } else if(this.selectedStatus == 'Contact') {
          let timezoneOffset = new Date().getTimezoneOffset();
          action_date = moment(this.updateStatusContactDate).utc().utcOffset(timezoneOffset * -1).format("YYYY-MM-DD HH:mm").toString();
        }
        
        if(!this.updateContactId || !this.selectedStatus) {
          this.updateStatusErrorMessage = 'Por favor complete los campos obligatorios';
          return false;
        } else {
          let payload = {
            'title': this.updateStatusTitle,
            'event_id': this.updateStatusEvent,
            'invite_registration_id': this.updateInviteRegistrationId,
            'contact_status': this.selectedStatus,
            'user_id': this.updateContactId,
            'action_id': this.updateStatusCommunicationType ? this.updateStatusCommunicationType : 0,
            'action_date': action_date,
            'notes': this.updateStatusComment,
            'assigned_sales_person_id': this.updateStatusSalesPerson ? this.updateStatusSalesPerson : 0,
            'created_by': this.userId,
            'question1_question': question1_question,
            'question1_answer': question1_answer,
            'question2_question': question2_question,
            'question2_answer': question2_answer,
          }
      
          this._userService.editCRMCommunication(
            this.updateStatusId,
            payload
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            async (response) => {
              this.updateStatusSuccessMessage = 'Guardado exitosamente';
  
              if(this.selectedStatus == 'Contacted') {
                this.selectedTab = 'Communications';
                this.communications = get(await this._userService.getCommunications(this.updateContactId).toPromise(), 'communications');
                this.communications = this.communications.map(communication => {
                  return {
                    truncated_comment: true,
                    ...communication
                  }
                });
                if(!this.superAdmin) {
                  this.communications = this.communications.filter(c => {
                    return c.created_by == this.userId;
                  })
                }
                this.filteredCommunications = this.communications;
                this.selectedStatus = 'Contacted'; 
              } else if(this.selectedStatus == 'Contact') {
                this.selectedTab = 'Alarms';
                this.alarms = get(await this._userService.getAlarms(this.updateContactId).toPromise(), 'alarms');
                this.alarms = this.alarms.map(alarm => {
                  return {
                    truncated_comment: true,
                    ...alarm
                  }
                });
                if(!this.superAdmin) {
                  this.alarms = this.alarms.filter(a => {
                    return a.created_by == this.userId;
                  })
                }
                this.selectedStatus = 'Contact'; 
              } else {
                this.selectedStatus = 'Not to contact';
              }
              this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
            },
            error => {
                console.log(error);
            }
          );
        }
      } else {
        let action_date;
        if(this.selectedStatus == 'Contacted') {
          if(this.updateStatusContactedDate) {
            action_date = this.updateStatusContactedDate;
          }
        } else if(this.selectedStatus == 'Contact') {
          action_date = this.updateStatusContactDate;
        }

        if(action_date) {
          let timezoneOffset = new Date().getTimezoneOffset();
          action_date = moment(action_date).utc().utcOffset(timezoneOffset * -1).format("YYYY-MM-DD HH:mm").toString();
        }
        
        if(!this.updateContactId || !this.selectedStatus) {
          this.updateStatusErrorMessage = 'Por favor complete los campos obligatorios';
          return false;
        } else {
          let payload = {
            'title': this.updateStatusTitle,
            'event_id': this.updateStatusEvent,
            'contact_status': this.selectedStatus,
            'user_id': this.updateContactId,
            'action_id': this.updateStatusCommunicationType ? this.updateStatusCommunicationType : 0,
            'action_date': action_date,
            'notes': this.updateStatusComment,
            'assigned_sales_person_id': this.updateStatusSalesPerson ? this.updateStatusSalesPerson : 0,
            'created_by': this.userId,
            'question1_question': question1_question,
            'question1_answer': question1_answer,
            'question2_question': question2_question,
            'question2_answer': question2_answer,
          }
      
          this._userService.addCRMStatus(
            this.updateContactId,
            payload
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            async (response) => {
              this.updateStatusSuccessMessage = 'Guardado exitosamente';
  
              if(this.selectedStatus == 'Contacted') {
                this.selectedTab = 'Communications';
                this.communications = get(await this._userService.getCommunications(this.updateContactId).toPromise(), 'communications');
                this.communications = this.communications.map(communication => {
                  return {
                    truncated_comment: true,
                    ...communication
                  }
                });
                if(!this.superAdmin) {
                  this.communications = this.communications.filter(c => {
                    return c.created_by == this.userId;
                  })
                }
                this.filteredCommunications = this.communications;
                this.selectedStatus = 'Contacted';
                this.crmTabIndex = 3;
                this.resetCRMTabFields()
              } else if(this.selectedStatus == 'Contact') {
                this.selectedTab = 'Alarms';
                this.alarms = get(await this._userService.getAlarms(this.updateContactId).toPromise(), 'alarms');
                this.alarms = this.alarms.map(alarm => {
                  return {
                    truncated_comment: true,
                    ...alarm
                  }
                });
                if(!this.superAdmin) {
                  this.alarms = this.alarms.filter(a => {
                    return a.created_by == this.userId;
                  })
                }
                this.crmTabIndex = 3;
                this.resetCRMTabFields()
                this.selectedStatus = 'Contact';
              } else {
                this.selectedStatus = 'Not to contact';
              }

              this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
            },
            error => {
                console.log(error);
            }
          );
        }
      }
    }

    this.updateStatusSubmitted = false;
  }

  resetCRMTabFields() {
    this.updateStatusErrorMessage = ''
    this.updateStatusSuccessMessage = ''
    this.updateStatusTitle = ''
    this.updateStatusContactedDate = ''
    this.updateStatusContactDate = ''
    this.updateStatusCommunicationType = ''
    this.updateStatusComment = ''
  }

  updateStatus(data) {
    console.log(data)
    this.updateStatusErrorMessage = '';
    this.updateStatusSuccessMessage = '';
    this.communicationType = '';
    this.updateContactId = data.user_id;
    this.updateContactName = data.name;
    this.updateStatusEvent = data.event_id;
    this.crmTabIndex = 0;

    this.updateContactEmail = data.email;
    this.updateContactPhone = data.phone;
    this.updateContactWebsite = data.website;
    this.updateContactPosition = data.position;
    this.updateContactPostalCode = data.zip_code;
    this.updateContactSector = data.sector;
    this.updateContactComment = data.comment;

    this.selectedStatus = data.status;
    if(!data.status) {
      this.selectedStatus = 'Contacted';
    }

    if(data.invited_by) {
      this.invitedBy.forEach(inv => {
        if(inv.name == data.invited_by) {
          this.updateContactInvitedBy = inv.id;
        }
      });
    }

    initFlowbite();
    setTimeout(() => {
      this.modalbutton?.nativeElement.click();
    }, 500);
  }

  updateContactData() {
    if(this.superAdmin) {
      let params = {
        'name': this.updateContactName,
        'email': this.updateContactEmail,
        'phone': this.updateContactPhone,
        'website': this.updateContactWebsite,
        'sector': this.updateContactSector,
        'position': this.updateContactPosition,
        'comment': this.updateContactComment,
        'zip_code': this.updateContactPostalCode,
        'invited_by': this.updateContactInvitedBy
      }
  
      this._userService.editContactInfo(
        this.updateContactId,
        params
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        response => {
          // update local array
          if(this.filteredData) {
            this.filteredData.forEach((p, index) => {
              if(p.user_id == this.updateContactId) {
                this.filteredData[index].name = this.updateContactName;
                this.filteredData[index].guest_name = this.updateContactName;
                this.filteredData[index].email = this.updateContactEmail;
                this.filteredData[index].phone = this.updateContactPhone;
                this.filteredData[index].website = this.updateContactWebsite;
                this.filteredData[index].sector = this.updateContactSector;
                this.filteredData[index].position = this.updateContactPosition;
                this.filteredData[index].comment = this.updateContactComment;
                this.filteredData[index].zip_code = this.updateContactPostalCode;

                if(this.updateContactInvitedBy) {
                  this.invitedBy.forEach(inv => {
                    if(inv.id == this.updateContactInvitedBy) {
                      this.filteredData[index].invited_by = inv.name;
                    }
                  });
                }
              }
            });
          }

          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          this.formatCRM(this.filteredData);
          this.refreshTable(this.filteredData);
        },
        error => {
          console.log(error);
        }
      );
    } else {
      let params = {
        'user_id': this.updateContactId,
        'comments': this.updateContactComment,
        'created_by': this.userId
      }

      this._userService.editCrmUserComment(
        this.updateContactId,
        params
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        response => {
          // update local array
          if(this.filteredData) {
            this.filteredData.forEach((p, index) => {
              if(p.user_id == this.updateContactId) {
                this.filteredData[index].comment = this.updateContactComment;
              }
            });
          }

          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          this.formatCRM(this.filteredData);
          this.refreshTable(this.filteredData);
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  readAlarmMore(item) {
    item.truncated_comment = false;
    return item.comment;
  }

  showAlarmLess(item) {
    item.truncated_comment = true;
    if(item.comment && item.comment.length > 30) {
      return item.comment.substring(0, 30);
    } else {
      return item.comment;
    }
  }

  getAlarmComment(item) {
    if(item.comment && item.comment.length > 30) {
      if(item.truncated_comment) {
        return item.comment.substring(0, 30);
      } else {
        return item.comment;
      }
    } else {
      return item.comment;
    }
  }

  updateAlarm(item) {
    this.createNewStatusMode = true;
    this.updateStatusId = item.id;
    this.updateInviteRegistrationId = item.invite_registration_id;
    this.selectedStatus = item.contact_status;
    this.updateStatusCommunicationType = item.communication_type_id;
    this.updateStatusTitle = item.title;
    // if(item.contact_status == 'Contacted') {
    //   let year = parseInt(this.datePipe.transform(item.contact_date, 'yyyy').toString());
    //   let month = parseInt(this.datePipe.transform(item.contact_date, 'MM').toString());
    //   let day = parseInt(this.datePipe.transform(item.contact_date, 'dd').toString());
    //   let contact_date = new NgbDate(year, month, day);
    //   this.updateStatusContactedDate = contact_date;
    // } else {
    //   var d = new Date(item.contact_date.substring(0, 10));
    //   d.setHours(parseInt(item.contact_date.substr(11, 2)), parseInt(item.contact_date.substr(14, 2)), 0, 0);
    //   this.updateStatusContactDate = d;
    // }
    this.updateStatusComment = item.comment;
    this.crmTabIndex = 1;
  }

  createNew() {
    this.createNewStatusMode = true;
    this.updateStatusTitle = '';
    this.updateStatusCommunicationType = '';
    this.updateStatusContactDate = '';
    this.updateStatusContactedDate = '';
    this.updateStatusComment = '';
    this.updateStatusSalesPerson = '';
    this.updateStatusSuccessMessage = '';
    this.updateStatusId = 0;
    this.notContactQuestion1Answer = '';
    this.notContactQuestion2Answer = '';
    this.showNotContactQuestion2 = false;
    this.signedQuestion1Answer = '';
    setTimeout(()=>{ 
      this.titleElement?.nativeElement.focus();
    },0);
  }

  createCommunication() {
    this.crmTabIndex = 1;
    this.selectedStatus = 'Contacted';
  }

  getComment(item) {
    if(item.comment && item.comment.length > 30) {
      if(item.truncated_comment) {
        return item.comment.substring(0, 30);
      } else {
        return item.comment;
      }
    } else {
      return item.comment;
    }
  }

  readMore(item) {
    item.truncated_comment = false;
    return item.comment;
  }

  showLess(item) {
    item.truncated_comment = true;
    if(item.comment && item.comment.length > 30) {
      return item.comment.substring(0, 30);
    } else {
      return item.comment;
    }
  }

  updateCommunication(item) {
    this.updateStatusId = item.id;
    this.updateInviteRegistrationId = item.invite_registration_id;
    this.selectedStatus = item.contact_status;
    this.updateStatusCommunicationType = item.communication_type_id;
    this.updateStatusTitle = item.title;
    if(item.contact_status == 'Contacted') {
      this.updateStatusContactedDate = item.contact_date;
    } else{
      this.updateStatusContactDate = item.contact_date;
    }
    if(item.contact_status == 'Not to contact') {
      if(item.question1_answer) {
        let answer;
        if(item.question1_answer == 'Después de una Cita') {
          answer = "11";
        } else if(item.question1_answer == 'Se enviaron varios intentos de conectar y no se obtuvo la respuesta') {
          answer = "12";
        } else if(item.question1_answer == 'Decisión de commercial') {
          answer = "13";
        }
        this.notContactQuestion1Answer = answer;
      }
      if(item.question2_answer) {
        this.showNotContactQuestion2 = true;
        let answer;
        if(item.question2_answer == 'Dinero') {
          answer = "21";
        } else if(item.question2_answer == 'Forma de pago') {
          answer = "22";
        } else if(item.question2_answer == 'No está interesado en el funcionamiento del club') {
          answer = "23";
        }
        this.notContactQuestion2Answer = answer;
      } else {
        this.showNotContactQuestion2 = false;
      }
    }
    if(item.contact_status == 'converted') {
      if(item.question1_answer) {
        let answer;
        if(item.question1_answer == 'Primera cita post evento') {
          answer = "31";
        } else if(item.question1_answer == 'Dos citas post evento') {
          answer = "32";
        } else if(item.question1_answer == 'Seguimiento posterior  de un mes post evento.') {
          answer = "33";
        }
        this.signedQuestion1Answer = answer;
      }
    }
    this.updateStatusComment = item.comment;

    if(this.isSalesPerson || (!this.superAdmin && !this.admin1 && !this.admin2)) {
      this.crmTabIndex = 1;
    } else {
      this.crmTabIndex = 0;
    }
    this.createNewStatusMode = true;
  }

  filterCommunications(event) {
    this.filteredCommunications = this.communications;
    if(event.target.value) {
      this.filteredCommunications = this.filteredCommunications.filter(f => {
        return f.communication_type_id == event.target.value;
      })
    }
    if(this.communicationDate) {
      let communication_date = this.communicationDate.year + '-' 
        + (this.communicationDate.month >= 10 ? '' : '0') + this.communicationDate.month  + '-'
        + (this.communicationDate.day >= 10 ? '' : '0') + this.communicationDate.day;

      this.filteredCommunications = this.filteredCommunications.filter(f => {
        return f.contact_date == communication_date;
      })
    }
  }

  handleCommunicationDateChange() {
    this.filteredCommunications = this.communications;
    if(this.communicationDate) {
      let communication_date = this.communicationDate.year + '-' 
        + (this.communicationDate.month >= 10 ? '' : '0') + this.communicationDate.month  + '-'
        + (this.communicationDate.day >= 10 ? '' : '0') + this.communicationDate.day;

      this.filteredCommunications = this.filteredCommunications.filter(f => {
        return f.contact_date == communication_date;
      })
    } 
    if(this.communicationType) {
      this.filteredCommunications = this.filteredCommunications.filter(f => {
        return f.communication_type_id == this.communicationType;
      })
    }
  }

  changeSelectedStatus(item) {
    this.selectedStatus = item.value ? item.value : item;
  }

  confirmDeleteItem(id) {
    this.showConfirmationModal = false;
    this.selectedItem = id;
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
    this.deleteItem(this.selectedItem, true);
    this.showConfirmationModal = false;
  }

  deleteItem(item, confirmed) {
    if (confirmed) {
      this.continueDeleteGuest(item.invite_registration_id, item.user_id, confirmed)
    }
  }

  continueDeleteGuest(id, user_id, confirmed) {
    if(confirmed) {
      this._userService.deleteGuest(id, user_id).subscribe(data => {
        if(this.filteredData) {
          this.filteredData.forEach((guest , index)=> {
            if(guest.invite_registration_id == id && guest.user_id == user_id) {
              this.filteredData.splice(index, 1)
            }
          })
        }
        this.open(
          this._translateService.instant("dialog.deletedsuccessfully"),
          ""
        );
        this.formatCRM(this.filteredData);
        this.refreshTable(this.filteredData);
      }, err => {
        console.log('err: ', err);
      })
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}