import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, HostListener, Input, SimpleChange, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, ExcelService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { FilterComponent, IconFilterComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { DateAdapter } from '@angular/material/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { PlansService } from '@features/services';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import moment from "moment";

@Component({
    selector: 'app-plans-admin-list',
    standalone: true,
    imports: [
      CommonModule, 
      TranslateModule,
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatSnackBarModule,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatNativeDateModule,
      MatDatepickerModule,
      SearchComponent,
      IconFilterComponent,
      FilterComponent,
      NgOptimizedImage
    ],
    templateUrl: './admin-list.component.html',
})
export class PlansAdminListComponent {
    private destroy$ = new Subject<void>();

    @Input() list: any;
    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() canCreatePlan: any;
    @Input() plansTitle: any;
    @Input() userId: any;
    @Input() superAdmin: any;
    @Input() status: any;
    @Input() language: any;
    @Input() isUESchoolOfLife: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    plansData: any = [];
    dataSource: any;
    displayedColumns = ["plan_image", "title", "plan_date_display", "attendees", "action"];
    pageSize: number = 10;
    pageIndex: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    planParticipants: any = [];
    searchKeyword: any;
    date: Date = new Date();
    allPlansData: any[] = [];
    selectedCity: any;
    allPlanDrafts: any = [];
    buttonList: any = [];
    categories: any = [];
    isLoading: boolean = false;
    selectedFilterCategory: any = '';
    assignEventId: any;
    assignParticipantId: any;
    assignParticipantName: any;
    selectedSalesPerson: any = '';
    kcnSalesperson: any = [];
    @ViewChild("modalbutton", { static: false }) modalbutton: ElementRef<HTMLInputElement> = {} as ElementRef;
    @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
      | ElementRef
      | undefined;
    dialogMode: string = '';
    salesPeople: any = [];
    isSalesPerson: boolean = false;
    paidPlanSubscriptions: any = [];
    invoiceDetails: any;
    apiPath: string = environment.api;
    kcnTypes: any = [];
    selectedConfirmEvent: any = '';
    sending: boolean = false;
    sortedPlansData: any;
    guestHistory: any = [];
    allGuestHistory: any = [];
    selectedGuestId: any;
    showHistory: boolean = false;
    assignParticipantIds: any;
    defaultActiveFilter: boolean = true;
    selectedStartDate: any;
    selectedEndDate: any;
    dateRange = new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
    });
    minDate: any;
    maxDate: any;
    filterSettings: any;
    customMemberType: any;
    customMemberTypePermissions: any;

    bizumPlanParticipants: any = [];
    bizumGroupPlanParticipants: any = [];
    confirmedBizumPlanParticipants: any = [];
    confirmedBizumGroupPlanParticipants: any = [];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _plansService: PlansService,
        private _excelService: ExcelService,
        private dateAdapter: DateAdapter<Date>,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    ngOnChanges(changes: SimpleChange) {
        let statusChange = changes["status"];
        if(statusChange.previousValue != statusChange.currentValue) {
            this.status = statusChange.currentValue;
            this.initializeDate();
            this.initializePage();
        }
    }

    async ngOnInit() {
        initFlowbite();
        this.onResize();

        this.dateAdapter.setLocale('es-ES');
        this.initializeSearch();
        this.initializeDate();

        if(this.company) {
          this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(this.company);
        }

        this.languageChangeSubscription =
        this._translateService.onLangChange.subscribe(
          (event: LangChangeEvent) => {
            this.language = event.lang;
            this.initializePage();
          }
        );

        if(this.company?.id == 12) {
          this.getEventTypes();
          this.guestSalesPersonList();
        }

        this.isLoading = true;
    }

    initializeDate() {
      this.selectedStartDate = this.status == 'past' || this.status == 'salesprocess' ? 
        moment().add(-1, 'months').format("YYYY-MM-DD") :
        moment().format("YYYY-MM-DD");
      this.selectedEndDate = this.status == 'past' || this.status == 'salesprocess' ?
        moment().add(-1, 'days').format("YYYY-MM-DD") :
        moment().add(1, 'months').format("YYYY-MM-DD");
      this.minDate = this.status == 'past' || this.status == 'salesprocess' ?
        null :
        moment().format("YYYY-MM-DD");
      this.maxDate = this.status == 'past' || this.status == 'salesprocess' ?
        moment().add(-1, 'days').format("YYYY-MM-DD") :
        null;
      this.dateRange = new FormGroup({
        start: new FormControl(this.selectedStartDate),
        end: new FormControl( this.selectedEndDate)
      });
    }

    initializePage() {
      this.initializeFilterSettings();
      this.fetchPlansManagementData();
      if(this.company?.id == 12) {
        this.getAllGuestHistory();
      }
    }

    initializeFilterSettings() {
      this.filterSettings = [{
        id: 1,
        company_id: this.company?.id,
        feature_id: 1,
        field: 'category',
        text: this._translateService.instant('company-settings.selectcategory'),
        display: 'dropdown',
        active: 1,
        select_text: this._translateService.instant('company-settings.selectcategory'),
      }]
    }

    getAllGuestHistory() {
      this._plansService.getGuestHistory(this.company?.id, this.selectedStartDate, this.selectedEndDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          this.guestHistory = response.guest_history;
          this.allGuestHistory = this.guestHistory;
        }, err => {
          console.log('err: ', err);
        })
    }

    getGuestHistory(id) {
      let history: any[] = [];
  
      if(this.allGuestHistory?.length > 0) {
        history = this.allGuestHistory.filter(guest => {
          return guest.user_id == id
        })
      }

      return history;
    }

    showGuestHistory(id) {
      if(this.selectedGuestId == id) {
        this.showHistory = !this.showHistory;
      }
      else {
        this.showHistory = true;
      }
      this.selectedGuestId = id;
    }

    guestSalesPersonList() {
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
      }, err => {
        console.log(err);
      });
    }

    fetchPlansManagementData() {
      this._plansService
        .fetchPlansManagementData(this.company?.id, this.userId, (this.superAdmin ? 'superadmin' : 'user'), this.isUESchoolOfLife, this.selectedStartDate, this.selectedEndDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.planParticipants = data?.plan_participants || [];
            this.bizumPlanParticipants = data?.bizum_plan_participants || [];
            this.confirmedBizumPlanParticipants = data?.confirmed_bizum_plan_participants || [];
            this.confirmedBizumGroupPlanParticipants = data?.confirmed_bizum_group_plan_participants || [];
            this.allPlanDrafts = data?.plan_drafts || [];
            this.paidPlanSubscriptions = data?.paid_plan_subscriptions || [];
            this.categories = data?.plan_categories;
            this.customMemberType = data?.custom_member_type;
            this.customMemberTypePermissions = data?.role_permissions;
            this.formatPlans(data?.plans || []);
            if(this.company?.id == 12) {
              this.initializeButtonGroup();
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant("news.searchbykeyword");
    }

    initializeButtonGroup() {
     if(this.categories?.length > 0) {
      this.buttonList = [
        {
          id: "All",
          value: "All",
          text: this._translateService.instant("plans.all"),
          selected: true,
          fk_company_id: this.company?.id,
          fk_supercategory_id: "All",
          name_CA: "All",
          name_DE: "All",
          name_EN: "All",
          name_ES: "All",
          name_EU: "All",
          name_FR: "All",
          sequence: 1,
          status: 1,
        },
      ];
  
      this.categories?.forEach((category) => {
        this.buttonList.push({
          id: category?.fk_supercategory_id || category?.id,
          value: category.fk_supercategory_id || category?.id,
          text: this.getCategoryTitle(category),
          selected: false,
          fk_company_id: category.fk_company_id,
          fk_supercategory_id: category?.fk_supercategory_id || category?.id,
          name_CA: category.name_CA || category?.name_ca,
          name_DE: category.name_DE || category?.name_de,
          name_EN: category.name_EN || category.name_en,
          name_ES: category.name_ES || category.name_es,
          name_EU: category.name_EU || category.name_eu,
          name_FR: category.name_FR || category.name_fr,
          sequence: category.sequence,
          status: category.status,
        });
      });
     }
    }

    getEventTypes() {
      this._plansService.getEventTypes(this.company?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.kcnTypes = data.types;
      }, err => {
        console.log(err);
      });
    }

    getCategoryTitle(category) {
      return this.language == "en"
        ? category.name_EN || category.name_en
        : this.language == "fr"
        ? category.name_FR || category.name_fr
        : this.language == "eu"
        ? category.name_EU ||
          category.name_eu ||
          category.name_ES ||
          category.name_es
        : this.language == "ca"
        ? category.name_CA ||
          category.name_ca ||
          category.name_ES ||
          category.name_es
        : this.language == "de"
        ? category.name_DE ||
          category.name_de ||
          category.name_ES ||
          category.name_es
        : category.name_ES || category.name_es;
    }

    formatPlans(plans, mode = '') {
        let data 
        if(plans?.length > 0) {
          data = plans?.map(plan => {
            let filtered_participants = this.planParticipants?.filter(pp => {
              return pp.id == plan.id
            })

            let paid_activity = plan?.price > 0 && plan?.plan_id ? true : false;

            let participants = filtered_participants?.map(participant => {
              let invoice = '';
              if(paid_activity) {
                let paid_activity_subscription = this.paidPlanSubscriptions?.find((f) => f.activity_id == plan.id && f.user_id == participant?.fk_user_id);
                if(paid_activity_subscription) {
                  invoice = paid_activity_subscription.subscription_id;
                }

                if(!invoice) {
                  if(participant?.type == 'company_plan' && this.confirmedBizumPlanParticipants?.length > 0) {
                    let match = this.confirmedBizumPlanParticipants.some(
                      (a) => a.user_id == participant.fk_user_id && a.plan_id == participant.id
                    );
                    if(match) {
                      invoice = 'Bizum';
                    }
                  }
                  if(participant?.type == 'plan' && this.confirmedBizumGroupPlanParticipants?.length > 0) {
                    let match = this.confirmedBizumGroupPlanParticipants.some(
                      (a) => a.user_id == participant.fk_user_id && a.plan_id == participant.id
                    );
                    if(match) {
                      invoice = 'Bizum';
                    }
                  }
                }
              }

              return {
                ...participant,
                role: this.getParticipantRole(participant),
                paid_activity,
                invoice,
              }
            })

            let filtered_bizum_plan_participants = this.bizumPlanParticipants?.filter(pp => {
              return pp.plan_id == plan.id && pp.confirmed != 1
            })

            let filtered_bizum_group_plan_participants = this.bizumGroupPlanParticipants?.filter(pp => {
              return pp.plan_id == plan.id && pp.confirmed != 1
            })

            return {
              ...plan,
              paid_activity,
              participants,
              bizum_plan_participants: filtered_bizum_plan_participants,
              bizum_group_plan_participants: filtered_bizum_group_plan_participants,
            }
          })
        }

        this.allPlansData = data
        
        this.loadPlans(data, mode);
    }

    getParticipantRole(participant) {
      let memberType = participant.role
  
      if(this.company?.id == 12) {
        if(participant.role == 'Member') {
          memberType = this._translateService.instant('plan-details.member');
        } else if(participant.role == 'Guest') {
          memberType = this._translateService.instant('plan-details.guest');
        }
      }
      
      return memberType
    }

    handleSearch(event) {
        this.searchKeyword = event;
        this.loadPlans(this.allPlansData);
    }

    loadPlans(data, mode = '') {
      if(this.status == 'draft') {
        this.plansData = this.allPlanDrafts
      } else if(this.status == 'inactive') {
        this.plansData = data?.filter(activity => {
          return activity.status == 0
        });
      } else {
        this.plansData = data?.filter(activity => {
          let plan_date = moment(activity.plan_date).format("YYYY-MM-DD");
          var day = this.date.getDate();
          var day_number = (day < 10 ? '0' : '') + day;
          var month_number = ((this.date.getMonth() + 1) < 10 ? '0' : '') + (this.date.getMonth() + 1);
          let date = this.date.getFullYear() + "-" + month_number + "-" + day_number;
    
          let active;
          if(activity.type == 2) {
            let today = moment(new Date()).utcOffset('+0200').format('YYYY-MM-DD HH:mm:ss');
            let endDateReached = true;
            if(activity.end_date) {
                if(activity.end_date > activity.plan_date) {
                    if(activity.end_date >= today.replace(" ", "T") + '.000Z') {
                        endDateReached = false;
                    }
                }
            }
    
            let include = false;
            if(activity.id == 0) {
                include = true;
            } else if(!endDateReached) {
                include = true;
            } else if(!activity.end_date && activity.plan_date >= today.replace(" ", "T") + '.000Z' ) {
                include = true;
            }
    
            if(!activity.plan_date) {
              include = true;
            } 
            
            if(this.status == 'active' && activity) {
              active = include;
            } else {
              active = !include;
            }
          } else {
            let include = false;
            if(!activity.plan_date) {
              include = true;
            }
    
            if(
              (this.status == 'active' && activity.status == 1) ||
              (this.status == 'inactive' && activity.status == 0)
            ) {
              if(plan_date != 'Invalid date') {
                active = plan_date >= date;
              } else {
                active = include;
              }
            } else {
              if(plan_date != 'Invalid date') {
                active = plan_date < date;
              } else {
                active = !include;
              }
            }
          }
          
          return active
        })
      }
      
      if(this.status == 'salesprocess') {
        this.plansData = this.plansData?.map(plan => {
          let filtered_participants = this.planParticipants?.filter(pp => {
            return pp.id == plan.id && pp.attended == 1 && pp.clear_attended != 1 && pp.role == 'Guest'
          })

          let participants = filtered_participants?.map(participant => {
            return {
              ...participant,
              role: this.getParticipantRole(participant)
            }
          })

          return {
            ...plan,
            participants
          }
        })

        if(this.plansData?.length > 0) {
          this.plansData = this.plansData?.filter(plan => {
            return plan?.participants?.length > 0
          })
        }
      }

      if(this.company?.id == 12 && this.status == 'active') {
        this.plansData = this.plansData?.map(plan => {
          let filtered_participants = this.planParticipants?.filter(pp => {
            return pp.id == plan.id
          })

          let participants = filtered_participants?.map(participant => {
            return {
              ...participant,
              role: this.getParticipantRole(participant)
            }
          })

          return {
            ...plan,
            participants
          }
        })
      }

      if(this.searchKeyword && this.plansData) {
          this.plansData = this.plansData.filter(p => {
            return p.title && p.title.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 
          })
      }

      if(this.selectedCity) {
          this.plansData = this.plansData.filter(p => {
              return p.address && p.address.toLowerCase().indexOf(this.selectedCity.toLowerCase()) >= 0 
          })
      }

      if(this.selectedFilterCategory?.id > 0) {
        this.plansData = this.plansData?.filter(p => {
          return p?.event_category_id == this.selectedFilterCategory?.id
        })
      }

      let formattedPlans = this.plansData?.map((item) => {
        let plan_date_display = moment.utc(item.plan_date).locale(this.language).format('DD-MM-YYYY HH:mm')
        let date_display = moment.utc(item.plan_date).locale(this.language).format('M/D/YYYY')
        let time_display = moment.utc(item.plan_date).locale(this.language).format('HH:mm A')
        return {
          ...item,
          time_display,
        };
      });

      if((this.status == 'past' || this.status == 'salesprocess') && formattedPlans?.length > 0) {
        formattedPlans = formattedPlans?.sort((a, b) => {
          const oldDate: any = new Date(a.plan_date)
          const newDate: any = new Date(b.plan_date)

          return newDate - oldDate
        })
      }

      if(this.selectedStartDate && this.selectedEndDate) {
        formattedPlans = formattedPlans?.filter((plan) => {
          let include = false
  
          let formatted_plan_date = moment(plan?.plan_date?.substr(0, 10))?.format('YYYY-MM-DD');
          if(
            moment(formatted_plan_date).isSameOrAfter(moment(this.selectedStartDate))
            && moment(formatted_plan_date).isSameOrBefore(moment(this.selectedEndDate))
           ) {
            include = true;
          }

          if(this.status == 'past' || this.status == 'salesprocess') {
            let current_day = moment().format('YYYY-MM-DD')
            if(moment(formatted_plan_date).isSame(moment(current_day))) {
              include = true;
            }
          }
  
          return include
        })
      }

      this.plansData = formattedPlans;
      this.refreshTable(this.plansData, mode);
    }

    refreshTable(list, mode = '') {
        this.dataSource = new MatTableDataSource(list)
        if (this.sort) {
            this.dataSource.sort = this.sort;
        } else {
            setTimeout(() => this.dataSource.sort = this.sort);
        }

        if(mode == 'refresh') {
          if (this.paginator) {
            this.paginator._changePageSize(this.paginator.pageSize);
          } else {
            setTimeout(() => {
              this.dataSource.paginator = this.paginator;
              this.paginator?._changePageSize(this.paginator.pageSize);
            });
          }
        } else {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator
            this.paginator.firstPage()
          } else {
            setTimeout(() => {
              this.dataSource.paginator = this.paginator
              this.paginator?.firstPage()
            });
          }
        }

        this.isLoading = false;
    }

    getPageDetails(event: any) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.dataSource = new MatTableDataSource(
          this.plansData.slice(
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

    viewItem(id, planType) {
        let link = '';
        if (planType == 1) {
          link = `/plans/details/${id}/1`;
        } else if (planType == 5) {
          link = `/plans/details/${id}/5`;
        } else if (planType == 2) {
          link = `/plans/details/${id}/4`;
        }
    
        if(link) {
          this._router.navigate([]).then(result => {  window.open(link, 'self'); });
        }
    }

    editItem(id, type) {
        let link = '';
        if(type == 1) {
          link = `/plans/edit/${id}/1`;
        } else if(type == 5) {
          link = `/plans/edit/${id}/5`;
        } else if(type == 2) {
          link = `/plans/edit/${id}/4`;
        }
    
        if(link) {
          this._router.navigate([]).then(result => {  window.open(link, 'self'); });
        }
    }

    deleteItem(id, type) {
        const navigationExtras: NavigationExtras = {
          state: {
              mode: 'delete'
          },
          relativeTo: this._route
        };
    
        if (type == 1) {
          this._router.navigate([`/plans/details/${id}/1`], navigationExtras);
        } else if (type == 5) {
          this._router.navigate([`/plans/details/${id}/5`], navigationExtras);
        } else if (type == 2) {
          this._router.navigate([`/plans/details/${id}/4`], navigationExtras);
        }
    }

    confirmAttendance(id, type, actionUserId, eventId, plan_type) {
      if(this.superAdmin || this.customMemberTypePermissions?.admin_attendance == 1) {
        let param = {
          user_id: this.userId,
          action_user_id: actionUserId,
          event_id: eventId
        }
    
        if(plan_type == 'company_plan') {
          this._plansService.confirmPlanParticipantAttendance(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.planParticipants.forEach((participant, index) => {
              if(participant.participant_id == id) {
                this.planParticipants[index].attended = 1;
                this.planParticipants[index].clear_attended = 0;
              }
            })
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach(par => {
                      if(par.participant_id == id) {
                        par.attended = 1;
                        par.clear_attended = 0;
                      }
                    })
                  }
                }
              })
            }
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        } else {
          this._plansService.confirmParticipantAttendance(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.planParticipants.forEach((participant, index) => {
              if(participant.participant_id == id) {
                this.planParticipants[index].attended = 1;
                this.planParticipants[index].clear_attended = 0;
              }
            })
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach(par => {
                      if(par.participant_id == id) {
                        par.attended = 1;
                        par.clear_attended = 0;
                      }
                    })
                  }
                }
              })
            }
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        }
      }
    }
    
    clearAttendance(id, type, actionUserId, eventId, plan_type) {
      if(this.superAdmin || this.customMemberTypePermissions?.admin_attendance == 1) {
        let param = {
          user_id: this.userId,
          action_user_id: actionUserId,
          event_id: eventId
        }
    
        if(plan_type == 'company_plan') {
          this._plansService.clearPlanParticipantAttendance(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.planParticipants.forEach((participant, index) => {
              if(participant.participant_id == id) {
                  this.planParticipants[index].attended = 0;
                  this.planParticipants[index].clear_attended = 1;
              }
            })
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach(par => {
                      if(par.participant_id == id) {
                        par.attended = 0;
                        par.clear_attended = 1;
                      }
                    })
                  }
                }
              })
            }
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        } else {
          this._plansService.clearParticipantAttendance(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.planParticipants.forEach((participant, index) => {
              if(participant.participant_id == id) {
                  this.planParticipants[index].attended = 0;
                  this.planParticipants[index].clear_attended = 1;
              }
            })
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach(par => {
                      if(par.participant_id == id) {
                        par.attended = 0;
                        par.clear_attended = 1;
                      }
                    })
                  }
                }
              })
            }
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        }
      }
    }

    confirmation(id, type, actionUserId, eventId, plan_type) {
      if(this.superAdmin || this.customMemberTypePermissions?.admin_attendance == 1) {
        let param = {
          user_id: this.userId,
          action_user_id: actionUserId,
          event_id: eventId
        }
        if(plan_type == 'company_plan') {
          this._plansService.confirmPlanParticipant(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.planParticipants.forEach((participant, index) => {
              if(participant.participant_id == id) {
                  this.planParticipants[index].confirmed = 1;
                  this.planParticipants[index].clear_confirmed = 0;
              }
            })
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach(par => {
                      if(par.participant_id == id) {
                        par.confirmed = 1;
                        par.clear_confirmed = 0;
                      }
                    })
                  }
                }
              })
            }
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        } else {
          this._plansService.confirmParticipant(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.planParticipants.forEach((participant, index) => {
              if(participant.participant_id == id) {
                this.planParticipants[index].confirmed = 1;
                this.planParticipants[index].clear_confirmed = 0;
              }
            })
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach(par => {
                      if(par.participant_id == id) {
                        par.confirmed = 1;
                        par.clear_confirmed = 0;
                      }
                    })
                  }
                }
              })
            }
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        }
      }
    }
    
    clearConfirmation(id, type, actionUserId, eventId, plan_type) {
      if(this.superAdmin || this.customMemberTypePermissions?.admin_attendance == 1) {
        let param = {
          user_id: this.userId,
          action_user_id: actionUserId,
          event_id: eventId
        }
        if(plan_type == 'company_plan') {
          this._plansService.clearPlanConfirmation(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.planParticipants.forEach((participant, index) => {
              if(participant.participant_id == id) {
                  this.planParticipants[index].confirmed = 0;
                  this.planParticipants[index].clear_confirmed = 1;
              }
            })
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach(par => {
                      if(par.participant_id == id) {
                        par.confirmed = 0;
                        par.clear_confirmed = 1;
                      }
                    })
                  }
                }
              })
            }
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        } else {
          this._plansService.clearConfirmation(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.planParticipants.forEach((participant, index) => {
              if(participant.participant_id == id) {
                  this.planParticipants[index].confirmed = 0;
                  this.planParticipants[index].clear_confirmed = 1;
              }
            })
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach(par => {
                      if(par.participant_id == id) {
                        par.confirmed = 0;
                        par.clear_confirmed = 1;
                      }
                    })
                  }
                }
              })
            }
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        }
      }
    }

    confirmBizumPayment(id, type, actionUserId, eventId, plan_type) {
      if(this.superAdmin || this.customMemberTypePermissions?.admin_attendance == 1) {
        let param = {
          user_id: this.userId,
          action_user_id: actionUserId,
          event_id: eventId,
          company_id: this.company?.id,
        }
        if(plan_type == 'company_plan') {
          this._plansService.confirmBizumPlanParticipant(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            let plan_participant
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.bizum_plan_participants?.length > 0) {
                    p.bizum_plan_participants?.forEach((par, index) => {
                      if(par.participant_id == id) {
                        plan_participant = par;
                        p.bizum_plan_participants.splice(index, 1);
                      }
                    })
                  }
                }
              })
            }

            if(plan_participant) {
              let pt = {
                id: plan_participant.plan_id,
                user_id: plan_participant.user_id,
                participant_id: plan_participant.participant_id,
                name: plan_participant.name,
                role: plan_participant.role,
                email: plan_participant.email,
                phone: plan_participant.phone,
                invited_by: plan_participant.invited_by,
                plan_type: 'company_plan',
                confirmed: 1,
                clear_confirmed: 0,
                invoice: 'Bizum',
              }
              this.planParticipants.push(pt)

              if(this.plansData?.length > 0) {
                this.plansData?.forEach(p => {
                  if(p.id == eventId) {
                    p.participants?.push(pt);
                  }
                })
              }
            }
            
            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        } else {
          this._plansService.confirmBizumGroupPlanParticipant(id, param)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            let plan_participant
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == eventId) {
                  if(p.bizum_group_plan_participants?.length > 0) {
                    p.bizum_group_plan_participants?.forEach((par, index) => {
                      if(par.participant_id == id) {
                        plan_participant = par;
                        p.bizum_group_plan_participants.splice(index, 1);
                      }
                    })
                  }
                }
              })
            }

            if(plan_participant) {
              let pt = {
                id: plan_participant.plan_id,
                user_id: plan_participant.user_id,
                participant_id: plan_participant.participant_id,
                name: plan_participant.name,
                role: plan_participant.role,
                email: plan_participant.email,
                phone: plan_participant.phone,
                invited_by: plan_participant.invited_by,
                plan_type: 'group_plan',
                confirmed: 1,
                clear_confirmed: 0,
                invoice: 'Bizum',
              }
              this.planParticipants.push(pt)

              if(this.plansData?.length > 0) {
                this.plansData?.forEach(p => {
                  if(p.id == eventId) {
                    p.participants?.push(pt);
                  }
                })
              }
            }

            this.refreshTable(this.plansData, 'refresh');
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, err => {
            console.log('err: ', err);
          })
        }
      }
    }

    clearConfirmBizumPayment(id, type, actionUserId, eventId, plan_type) {

    }

    async open(message: string, action: string) {
      await this._snackBar.open(message, action, {
          duration: 3000,
          panelClass: ["info-snackbar"],
      });
  }

    filterCity(event) {
        this.list?.forEach((item) => {
            if (item.city === event) {
              item.selected = true;
            } else {
              item.selected = false;
            }
        });
        this.selectedCity = event || "";
        this.loadPlans(this.allPlansData);
    }

    handleCreateRoute() {
        this._router.navigate([`/plans/create/0/4`]);
    }

    downloadEventExcel(event) {
      let plan_data = this.plansData.filter(evt => {
        return event.id == evt.id
      })
      let participants = this.planParticipants.filter(p => {
        return p.id == event.id
      })
      if(participants && participants.length > 0) {
        participants = participants.sort((a, b) => {
          return b.participant_order - a.participant_order
        })
      }
  
      // if(this.status == 'past') {
      //   participants = participants.filter(cp => {
      //     return cp.confirmed == 1 && cp.clear_confirmed != 1
      //   })
      // } else if(this.status == 'salesprocess') {
      //   participants = participants.filter(cp => {
      //     return cp.attended == 1 && cp.clear_attended != 1 && cp.role == 'Guest'
      //   })
      // }
  
      let event_data: any[] = [];
      if(participants) {
        participants.forEach(p => {
          let match = event_data.some(a => a.participant_id === p.participant_id);
          if(!match) {
            let status = this._translateService.instant('guests.notconfirmed');
            if(this.status == 'past') {
              if(p.attended == 1) {
                status = this._translateService.instant('guests.attended');
              } else {
                status = this._translateService.instant('guests.notattended');
              }
            } else {
              if(p.confirmed == 1) {
                status = this._translateService.instant('guests.confirmed');
              }
            }
  
            let plan_date_display = moment.utc(plan_data[0].plan_date).locale(this.language).format('DD-MM-YYYY HH:mm')
            let date_display = moment.utc(plan_data[0].plan_date).locale(this.language).format('M/D/YYYY')
            let time_display = moment.utc(plan_data[0].plan_date).locale(this.language).format('HH') + 'h'
            let user_name = p.first_name ? `${p.first_name?.trim()} ${p.last_name?.trim()}` : p.name
            
            let dt = {}
            if(event?.paid_activity) {
              let invoice = '';
              let paid_activity_subscription = this.paidPlanSubscriptions?.find((f) => f.activity_id == event.id && f.user_id == p?.fk_user_id);
              if(paid_activity_subscription) {
                invoice = paid_activity_subscription.subscription_id;
              }

              dt = {
                'Evento': plan_data[0].title,
                'Fecha': plan_date_display,
                'Hora': time_display,
                'Nombre': user_name,
                'Papel': p.role,
                'Teléfono': p.phone,
                'Email': p.email,
                'Código postal': p.zip_code,
                'Invitado por': p.invited_by,
                'Asistio': status,
                'Registrado': p.participant_created ? moment(p.participant_created).format('DD-MM-YYYY HH:mm') : '',
                'Pagado': invoice,
              }
            } else {
              if(this.company?.id == 12) {
                dt = {
                  'Tipo de evento': plan_data[0].title,
                  'Modalidad': this.getEventType(plan_data[0].event_type_id),
                  'Fecha': plan_date_display,
                  'Hora': time_display,
                  'Nombre y apellidos': user_name,
                  'Role': p.role,
                  'Teléfono': p.phone,
                  'Email': p.email,
                  'Código postal': p.zip_code,
                  'Pais': p.country,
                  'zona': '',
                  'Asistencia': status,
                  'Invitado por': p.invited_by,
                  'Comercial': '',
                  'Delegado': '',
                  'coordinador': '',
                  'Observaciones': '',
                  'Registrado': p.participant_created ? moment(p.participant_created).format('DD-MM-YYYY HH:mm') : '',
                }
              } else {
                dt = {
                  'Evento': plan_data[0].title,
                  'Fecha': plan_date_display,
                  'Hora': time_display,
                  'Nombre': user_name,
                  'Papel': p.role,
                  'Teléfono': p.phone,
                  'Email': p.email,
                  'Código postal': p.zip_code,
                  'Invitado por': p.invited_by,
                  'Asistio': status,
                  'Registrado': p.participant_created ? moment(p.participant_created).format('DD-MM-YYYY HH:mm') : ''
                }
              }
            }
            event_data.push(dt)
          }
        });
      }
  
      this._excelService.exportAsExcelFile(event_data, 'event-' + event.id);
      this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    }

    getEventType(type_id) {
      let type = ''
      if(this.kcnTypes?.length > 0) {
        let type_row = this.kcnTypes?.filter(kt => {
          return kt.id == type_id
        })
        if(type_row?.length > 0) {
          type = this.language == 'en' ? type_row[0].type_en : type_row[0].type_es
        }
      }
  
      return type
    }

    filteredCity(event) { 
    }

    filteredCategory(category) {
      this.buttonList?.forEach((item) => {
        if (item.id === category.id) {
          item.selected = true;
        } else {
          item.selected = false;
        }
      });
  
      if (category) {
        this.selectedFilterCategory = category;
        this.loadPlans(this.allPlansData);
      }
    }

    assignSalesPerson(participant) {
      if(this.kcnSalesperson) {
        let sales_person = this.kcnSalesperson.filter(sp => {
          return sp.name
        })
        if(sales_person) {
          let spn: any[] = [];
          sales_person.forEach(sp => {
            let match = spn.some((a: any) => a.name === sp.name); 
            if(!match) {
              spn.push(sp);
            }
          });
          this.kcnSalesperson = spn;
        }
      }
      this.assignEventId = participant.id;
      this.assignParticipantId = participant.fk_user_id;
      this.assignParticipantName = (participant.first_name ? participant.first_name : '') + ' ' + (participant.last_name ? participant.last_name : '');
      if(participant.assigned_sales_person_id > 0) {
        this.selectedSalesPerson = participant.assigned_sales_person_id;
      } else {
        this.selectedSalesPerson = '';
      }

      this.dialogMode = 'assign-sales-person';
      this.modalbutton?.nativeElement.click();
    }

    assignSales() {
      if(this.dialogMode == 'assign-sales-person') {
        let params = {
          'plan_id': this.assignEventId,
          'user_id': this.assignParticipantId,
          'assigned_sales_person_id': this.selectedSalesPerson,
          'action_user_id': this.userId,
          'action_id': 5, // Assign Sales Person 
        }
    
        this._plansService.assignGuestToSalesPerson(
          params
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          response => {
            // update local array
            if(this.planParticipants) {
              this.planParticipants.forEach((p, index) => {
                if(p.fk_user_id == this.assignParticipantId && p.id == this.assignEventId) {
                  if(this.salesPeople) {
                    this.salesPeople.forEach(sp => {
                      if(sp.id == this.selectedSalesPerson) {
                        this.planParticipants[index].assigned_sales_person = sp.name;
                      }
                    });
                  }
                }
              });
            }
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == this.assignEventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach((par, idx) => {
                      if(this.salesPeople?.length > 0) {
                        this.salesPeople.forEach(sp => {
                          if(sp.id == this.selectedSalesPerson && par.fk_user_id == this.assignParticipantId) {
                            p.participants[idx].assigned_sales_person_id = this.selectedSalesPerson;
                            p.participants[idx].assigned_sales_person = sp.name;
                          }
                        });
                      }
                    })
                  }
                }
              })
            }
            setTimeout(() => {
              this.refreshTable(this.plansData, 'refresh');
              this.closemodalbutton?.nativeElement.click();
            }, 500)
          },
          error => {
              console.log(error);
          }
        );
      } else if(this.dialogMode == 'assign-event-sales-person') {
        let params = {
          'plan_id': this.assignEventId,
          'assigned_sales_person_id': this.selectedSalesPerson,
          'action_user_id': this.userId,
          'action_id': 5, // Assign Sales Person 
          'participants': this.assignParticipantIds,
        }

        this._plansService.assignSalesPersonToEvent(
          params
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          response => {
            // update local array
            if(this.planParticipants) {
              this.planParticipants.forEach((p, index) => {
                if(p.id == this.assignEventId) {
                  if(this.salesPeople) {
                    this.salesPeople.forEach(sp => {
                      if(sp.id == this.selectedSalesPerson) {
                        if(this.status == 'active') {
                          if(this.planParticipants[index].role == 'Guest') {
                            this.planParticipants[index].assigned_sales_person = sp.name;
                          }
                        } else {
                          this.planParticipants[index].assigned_sales_person = sp.name;
                        }
                      }
                    });
                  }
                }
              });
            }
            if(this.plansData?.length > 0) {
              this.plansData?.forEach(p => {
                if(p.id == this.assignEventId) {
                  if(p.participants?.length > 0) {
                    p.participants?.forEach((par, idx) => {
                      if(this.salesPeople?.length > 0) {
                        this.salesPeople.forEach(sp => {
                          if(sp.id == this.selectedSalesPerson) {
                            if(this.status == 'active') {
                              if(p.participants[idx].role == 'Guest') {
                                p.participants[idx].assigned_sales_person_id = this.selectedSalesPerson;
                                p.participants[idx].assigned_sales_person = sp.name;
                              }
                            } else {
                              p.participants[idx].assigned_sales_person_id = this.selectedSalesPerson;
                              p.participants[idx].assigned_sales_person = sp.name;
                            }
                          }
                        });
                      }
                    })
                  }
                }
              })
            }
            setTimeout(() => {
              this.refreshTable(this.plansData, 'refresh');
              this.closemodalbutton?.nativeElement.click();
            }, 500)
          },
          error => {
              console.log(error);
          }
        );
      }
    }

    assignEventToSalesPerson(event) {
      this.assignEventId = event.id;
      this.assignParticipantIds = event?.participants?.map((data) => { return data.fk_user_id }).join(', ');

      this.dialogMode = 'assign-event-sales-person';
      this.modalbutton?.nativeElement.click();
    }

    changeSalesPerson(event) {

    }

    goToInvoice(invoice) {
      this._plansService
      .getInvoiceDetails(invoice, this.company?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.invoiceDetails = data.invoice;
          if(this.invoiceDetails?.hosted_invoice_url) {
            window.open(this.invoiceDetails?.hosted_invoice_url, "_blank");
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }

    handleDateChange(type, event) {
      if (type == "start") {
        if(moment(event?.value).isValid()) {
          this.selectedStartDate = moment(event.value).format("YYYY-MM-DD");
        } else {
          this.selectedStartDate = '';
        }
        this.selectedEndDate = '';
      }
      if (type == "end") {
        if(moment(event?.value).isValid()) {
          this.selectedEndDate = moment(event.value).format("YYYY-MM-DD");
        } else {
          this.selectedEndDate = '';
        }
      }

      if(this.selectedStartDate && this.selectedEndDate) {
        this.isLoading = true;
        this.initializePage();
      }
    }
  
    sendConfirmAttendance() {
      if(this.plansData?.length > 0) {
        this.sortedPlansData = this.plansData.sort((a, b) => {
          return b.id - a.id
        })
      }

      this.dialogMode = 'send-confirm-attendance';
      this.modalbutton?.nativeElement.click();
    }

    sendConfirmAttendanceEmail() {
      this.sending = true;
      let plan = this.sortedPlansData.find((c) => c.id == this.selectedConfirmEvent);
      let params = {
        id: this.company?.id,
        plan_id: plan?.id,
        plan_type_id: plan?.plan_type_id,
      };

      this._plansService.sendConfirmAttendanceEmail(params).subscribe(
        (response) => {
          this.sending = false;
          this.open(
            this._translateService.instant("dialog.sentsuccessfully"),
            ""
          );
          this.closemodalbutton?.nativeElement.click();
        },
        (error) => {
          console.log(error);
        }
      );

      this.sending = false;
    }

    editPlanStatus(event, plan) {
      let new_status = event?.target?.checked
      plan.status = new_status ? 1 : 0
      let params = {
        id: plan.id,
        status: new_status ? 1 : 0,
        plan_type_id: plan.plan_type_id,
      }
      this._plansService.editPlanStatus(params).subscribe(
        response => {
          this.refreshStatus(plan, new_status);
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
        },
        error => {
          console.log(error);
        }
      )
    }

    refreshStatus(plan, new_status) {
      let allPlansData = this.allPlansData;
      if(allPlansData?.length > 0) {
        this.allPlansData?.forEach(item => {
          if(item.id == plan.id && item.plan_type_id == plan.plan_type_id) {
            item.status = new_status ? 1 : 0
          }
        })
      }
      this.allPlansData = allPlansData;
      this.loadPlans(this.allPlansData);
    }

    filterViewChanged(event) {
      this.defaultActiveFilter = event;
    }

    ngOnDestroy() {
      this.languageChangeSubscription?.unsubscribe();
      this.destroy$.next();
      this.destroy$.complete();
    }
}