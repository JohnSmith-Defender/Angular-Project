import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, HostListener, Input, SimpleChange, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, ExcelService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { IconFilterComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PlansService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import moment from "moment";

@Component({
    selector: 'app-plans-statistics-list',
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        SearchComponent,
        IconFilterComponent,
        NgOptimizedImage
    ],
    templateUrl: './statistics-list.component.html',
})
export class PlansStatisticsListComponent {
    private destroy$ = new Subject<void>();

    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() plansTitle: any;
    @Input() userId: any;
    @Input() superAdmin: any;
    @Input() language: any;
    @Input() isUESchoolOfLife: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    plansData: any = [];
    dataSource: any;
    displayedColumns = ["title", "plan_date_display", "attendees"];
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
    expandedEventId: any = '';
    cities: any;
    list: any;
    userCreditLogs: any;
    attendanceStatus: any;
    selectedAttendanceStatusFilter: any = '';
    selectedDateFilter: any;
    selectedStartDate: any;
    selectedEndDate: any;
    dateRange = new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
    });
    planRatings: any = [];
    selectedEventFilter: any = '';

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _plansService: PlansService,
        private _excelService: ExcelService,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();

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

        this.attendanceStatus = [
            {
                id: 1,
                text: this._translateService.instant('guests.attended'), 
                value: 'attended'
            },
            {
                id: 2,
                text: this._translateService.instant('guests.notattended'),
                value: 'not-attended'
            }
        ]

        this.fetchPlansManagementData();
        this.initializeSearch();
    }

    fetchPlansManagementData() {
        this._plansService
          .fetchPlansManagementData(this.company?.id, this.userId, (this.superAdmin ? 'superadmin' : 'user'), this.isUESchoolOfLife)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.planParticipants = data?.plan_participants || [];
                this.userCreditLogs = data?.user_credit_logs || [];
                this.planRatings = data?.plan_ratings || [];
                this.allPlanDrafts = data?.plan_drafts || [];
                this.formatPlans(data?.plans || []);

                this.cities = data?.cities;
                this.initializeIconFilterList(this.cities);
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

    initializeIconFilterList(list) {
        this.list = [
            {
                id: "All",
                value: "",
                text: this._translateService.instant("plans.all"),
                selected: true,
                company_id: this.company?.id,
                city: "",
                province: "",
                region: "",
                country: "",
                sequence: "",
                campus: "",
            },
        ];
    
        list?.forEach((item) => {
            this.list.push({
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

    formatPlans(plans) {
        let data 
        if(plans?.length > 0) {
            data = plans?.map(plan => {
                let participants = this.planParticipants?.filter(pp => {
                    return pp.id == plan.id
                })
                let attended = participants?.filter(p => {
                    return p.attended == 1
                })

                participants = participants?.map((participant) => {
                    return {
                      ...participant,
                      credits: this.getUserActivityCredits(participant),
                      ratings: this.getUserActivityRatings(plan, participant),
                      feedback: this.getUserActivityFeedback(plan, participant)
                    };
                });

                return {
                    ...plan,
                    participants,
                    attended
                }
            })
        }
        if(this.allPlansData?.length == 0) {
            this.allPlansData = data
        }
        
        this.loadPlans(data);
    }

    getUserActivityCredits(participant) {
        let credits = '';

        if(this.userCreditLogs?.length > 0) {
            let user_credit = this.userCreditLogs?.filter(usc => {
                return usc.user_id == participant.fk_user_id && participant.id == usc.plan_id
            })
            if(user_credit?.length > 0) {
                credits = user_credit[0].credits;
            }
        }

        return credits;
    }

    getUserActivityRatings(plan, participant) {
        let ratings = '';

        if(this.planRatings?.length > 0) {
            let user_rating = this.planRatings?.filter(p => {
                return p.plan_id == plan.id && participant.fk_user_id == p.created_by
            })
            if(user_rating?.length > 0) {
                ratings = user_rating[0].rating;
            }
        }

        return ratings;
    }

    getUserActivityFeedback(plan, participant) {
        let feedback = '';

        if(this.planRatings?.length > 0) {
            let user_rating = this.planRatings?.filter(p => {
                return p.plan_id == plan.id && participant.fk_user_id == p.created_by
            })
            if(user_rating?.length > 0) {
                feedback = user_rating[0].feedback;
            }
        }

        return feedback;
    }

    handleSearch(event) {
        this.searchKeyword = event;
        this.loadPlans(this.allPlansData);
    }

    loadPlans(data) {
        this.plansData = data?.sort((a, b) => {
            const oldDate: any = new Date(a.plan_date);
            const newDate: any = new Date(b.plan_date);
    
            return newDate - oldDate;
        });

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

        if(this.selectedEventFilter) {
            this.plansData = this.plansData.filter(p => {
                return p.id == this.selectedEventFilter
            })
        }

        if(this.selectedAttendanceStatusFilter) {
            this.plansData = this.plansData.filter(p => {
                let include = false;

                if(this.selectedAttendanceStatusFilter == 'attended') {
                    if(p?.participants?.length > 0 && p?.attended?.length > 0) {
                        include = true;
                    }
                } else if(this.selectedAttendanceStatusFilter == 'not-attended') {
                    if(p?.participants?.length > 0) {
                        include = true;
                    }
                }

                return include;
            })

            if(this.selectedAttendanceStatusFilter == 'attended') {
                this.plansData = this.plansData?.map((plan) => {
                    let participants = plan?.participants?.filter(p => {
                        return p.attended == 1
                    })
                    return {
                      ...plan,
                      participants,
                    };
                });
            } else if(this.selectedAttendanceStatusFilter == 'not-attended') {
                this.plansData = this.plansData?.map((plan) => {
                    let participants = plan?.participants?.filter(p => {
                        return p.attended != 1
                    })
                    let attended = participants?.filter(p => {
                        return p.attended == 1
                    })
                    return {
                      ...plan,
                      participants,
                      attended
                    };
                });
            }
        }

        if(this.selectedStartDate && this.selectedEndDate) {
            this.plansData = this.plansData?.filter((plan) => {
              let include = false
      
              let formatted_plan_date = moment(plan?.plan_date)?.format('YYYY-MM-DD');
              if(
                moment(formatted_plan_date).isSameOrAfter(moment(this.selectedStartDate))
                && moment(formatted_plan_date).isSameOrBefore(moment(this.selectedEndDate))
               ) {
                include = true;
              }
      
              return include
            })
        }

        this.refreshTable(this.plansData);
    }

    refreshTable(list) {
        this.dataSource = new MatTableDataSource(list)
        if (this.sort) {
            this.dataSource.sort = this.sort;
        } else {
            setTimeout(() => this.dataSource.sort = this.sort);
        }

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

    expandParticipants(row) {
        this.expandedEventId = this.expandedEventId == row.id ? '' : row.id
    }

    changeAttendanceStatusFilter(event) {
        this.loadPlans(this.allPlansData);
    } 

    changeEventFilter(event) {
        this.loadPlans(this.allPlansData);
    } 

    handleDateChange(type, event) {
        if (type == "start") {
          if(moment(event?.value).isValid()) {
            this.selectedStartDate = moment(event.value).format("YYYY-MM-DD");
          } else {
            this.selectedStartDate = '';
          }
        }
        if (type == "end") {
          if(moment(event?.value).isValid()) {
            this.selectedEndDate = moment(event.value).format("YYYY-MM-DD");
          } else {
            this.selectedEndDate = '';
          }
        }
    
        this.loadPlans(this.allPlansData);
    }

    downloadExcel() {
        let event_data: any[] = [];
        if(this.plansData) {
            this.plansData.forEach(plan => {
                if(plan?.participants?.length > 0) {
                    plan?.participants?.forEach(p => {
                        let match = event_data.some(a => a.participant_id === p.participant_id && a.title == p.title);
                        if(!match) {
                            let status = this._translateService.instant('guests.notattended');
                            if(p.attended == 1) {
                                status = this._translateService.instant('guests.attended');
                            }
                
                            let plan_date_display = moment.utc(plan.plan_date).locale(this.language).format('DD-MM-YYYY HH:mm')
                            let user_name = (p.first_name ? (p.first_name + ' ') : '') + (p.last_name ? (p.last_name + ' ') : '')
                            let name = p?.first_name ? `${p?.last_name}, ${p?.first_name}` : (p?.name || p?.email)
                            if(this.company?.id == 32 && this.isUESchoolOfLife) {
                                let active_enrollment_array = p?.num_matricula?.indexOf(',') >= 0 ? p?.num_matricula?.split(',') : [];
                                if(active_enrollment_array?.length > 1) {
                                    active_enrollment_array?.forEach(ae => {
                                        event_data.push({
                                            'Num. Matrícula activa': ae,
                                            'Expediente': p.employee_id,
                                            'Código actividad SIGECA': p.activity_code_sigeca,
                                            'Apellidos y nombre': name,
                                            'Actividad': plan.title,
                                            'Fecha': p.participant_created ? moment(p.participant_created).format('DD-MM-YYYY HH:mm') : '',
                                            'Créditos': p.credits,
                                            'Campus': p.city,
                                        })
                                    })
                                } else {
                                    event_data.push({
                                        'Num. Matrícula activa': p.num_matricula,
                                        'Expediente': p.employee_id,
                                        'Código actividad SIGECA': p.activity_code_sigeca,
                                        'Apellidos y nombre': name,
                                        'Actividad': plan.title,
                                        'Fecha': p.participant_created ? moment(p.participant_created).format('DD-MM-YYYY HH:mm') : '',
                                        'Créditos': p.credits,
                                        'Campus': p.city,
                                    })
                                }
                            } else {
                                event_data.push({
                                    'Título': plan.title,
                                    'Fecha': plan_date_display,
                                    'Nombre': user_name,
                                    'Papel': p.role,
                                    'Teléfono': p.phone,
                                    'Correo electrónico': p.email,
                                    'Asistió': status,
                                    'Registrado': p.participant_created ? moment(p.participant_created).format('DD-MM-YYYY HH:mm') : '',
                                    'Créditos': p.credits,
                                    'Clasificación': p.ratings,
                                })
                            }
                        }
                    })
                }
            });
        }
    
        this._excelService.exportAsExcelFile(event_data, 'actividades_' + this.getTimestamp());
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    }

    public getTimestamp() {
        const date = new Date();
        const timestamp = date.getTime();
    
        return timestamp;
    }

    getEventTitle(event) {
        return this.language == 'en' ? (event.title_en ? (event.title_en || event.title) : event.title) :
            (this.language == 'fr' ? (event.title_fr ? (event.title_fr || event.title) : event.title) : 
                event.title)
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}