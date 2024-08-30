import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, HostListener, Input, SimpleChange, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, ExcelService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { ButtonGroupComponent, IconFilterComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BuddyService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import moment from "moment";

@Component({
    selector: 'app-buddy-statistics-list',
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
        ButtonGroupComponent,
        NgOptimizedImage
    ],
    templateUrl: './statistics-list.component.html',
})
export class BuddyStatisticsListComponent {
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
    mentorsData: any = [];
    dataSource: any;
    displayedColumns = ["mentor_name", "mentees"];
    pageSize: number = 10;
    pageIndex: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    mentorMentees: any = [];
    searchKeyword: any;
    date: Date = new Date();
    allMentorsData: any[] = [];
    expandedMentorId: any = '';
    list: any;
    buttonList: any = [];
    viewMode: any = '';

    allMentorRequestsData: any[] = [];
    expandedMentorRequestId: any = '';
    mentorRequestsData: any[] = [];
    allStatistics: any = [];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _buddyService: BuddyService,
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
        setTimeout(() => {
            initFlowbite();
        }, 500);
        this.buttonList = [
            {
              id: 1,
              value: "mentor-mentees",
              text: this._translateService.instant("company-reports.nomentormentees"),
              selected: true,
            },
            {
              id: 2,
              value: "mentor-mentee-requests",
              text: this._translateService.instant("notification-popup.mentorrequests"),
              selected: false,
            },
        ];
        this.viewMode = this.buttonList?.length > 0 ? this.buttonList[0].value : 'mentor-mentees';
        this.initializeData();
        this.initializeSearch();
    }

    initializeData() {
        if(this.viewMode == 'mentor-mentees') {
            this.displayedColumns = [
                "mentor_name",
                "mentees"
            ];
            this.fetchMentorsManagementData();
        } else if(this.viewMode == 'mentor-mentee-requests') {
            this.displayedColumns = [
                "mentor_name",
                "requests",
                "accepted",
                "declined"
            ];
            this.fetchMenteeMentorRequestsStatus();
        }
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant("news.searchbykeyword");
    }

    handleSearch(event) {
        this.searchKeyword = event;
        this.loadMentors(this.allMentorsData);
    }

    fetchMentorsManagementData() {
        this._buddyService
            .fetchBuddies(this.company?.id, this.userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (data) => {
                    this.formatMentors(data?.mentors || []);
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    formatMentors(mentors) {
        let data 
        if(mentors?.length > 0) {
            data = mentors?.map(mentor => {
                let mentees = mentor?.buddies?.filter(pp => {
                    return pp.mentor_id == mentor.user_id
                })

                mentees = mentees?.map((mentee) => {
                    return {
                      ...mentee,
                    };
                });

                return {
                    ...mentor,
                    id: mentor.user_id,
                    mentor_name: mentor?.name, 
                    mentees,
                }
            })
        }

        if(this.allMentorsData?.length == 0) {
            this.allMentorsData = data
        }
        
        this.loadMentors(data);
    }

    loadMentors(data) {
        this.mentorsData = data;

        if(this.searchKeyword && this.mentorsData) {
            this.mentorsData = this.mentorsData.filter(p => {
              return p.mentor_name && p.mentor_name.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 
            })
        }

        this.refreshTable(this.mentorsData);
    }

    fetchMenteeMentorRequestsStatus() {
        this._buddyService
            .fetchMentorMenteeRequests(this.company?.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (data) => {
                    this.formatMentorRequests(data?.statistics || []);
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    formatMentorRequests(statistics) {
        let all_statistics = statistics;
        this.allStatistics = statistics;
        let mentors: any[] = [];

        if(statistics?.length > 0) {
            statistics?.forEach(stat => {
                let match = mentors?.some(
                    (a) => a.mentor_id == stat.mentor_id
                );

                if(!match) {
                    let mentor_requests = all_statistics?.filter(as => {
                        return as.mentor_id == stat.mentor_id
                    })

                    let accepted = []
                    let declined = []
                    if(mentor_requests?.length > 0) {
                        accepted = mentor_requests?.filter(mr => {
                            return mr.read == 1
                        })
                        declined = mentor_requests?.filter(mr => {
                            return mr.declined == 1
                        })
                    }

                    mentors?.push({
                        mentor_id: stat.mentor_id,
                        mentor_name: stat.mentor_name,
                        requests: mentor_requests?.length || 0,
                        mentor_requests,
                        accepted: accepted?.length || 0,
                        mentor_accepted: accepted,
                        declined: declined?.length || 0,
                        mentor_declined: declined,
                    })
                }
            })
        }

        if(this.allMentorRequestsData?.length == 0) {
            this.allMentorRequestsData = mentors
        }

        console.log(mentors)
        
        this.loadMentorRequests(mentors);
    }

    loadMentorRequests(data) {
        this.mentorRequestsData = data;

        if(this.searchKeyword && this.mentorRequestsData) {
            this.mentorRequestsData = this.mentorRequestsData.filter(p => {
              return p.mentor_name && p.mentor_name.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 
            })
        }

        this.refreshTable(this.mentorRequestsData);
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
          this.mentorsData.slice(
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

    viewItem(id) {
        this._router.navigate([]).then(result => {  window.open(`buddy/mentor/${id}`, 'self'); });
    }

    async open(message: string, action: string) {
      await this._snackBar.open(message, action, {
          duration: 3000,
          panelClass: ["info-snackbar"],
      });
    }

    expandMentees(row) {
        this.expandedMentorId = this.expandedMentorId == row.id ? '' : row.id
    }

    downloadExcel() {
        let mentor_data: any[] = [];
        if(this.viewMode == 'mentor-mentees') {
            if(this.mentorsData) {
                this.mentorsData.forEach(mentor => {
                    if(mentor?.mentees?.length > 0) {
                        mentor?.mentees?.forEach(p => {
                            let match = mentor_data.some(a => a.user_id === p.user_id && p.mentor_name == mentor.mentor_name);
                            if(!match) {
                                mentor_data.push({
                                    'Mentor': mentor.mentor_name,
                                    'Mentee': p.name,
                                    'Correo electrónico': p.email,
                                    'Nº de Interacción': p.no_of_interactions,
                                    'Nº de sesión (Calendly)': p.no_of_schedules,
                                })
                            }
                        })
                    }
                });
            }
        } else if(this.viewMode == 'mentor-mentee-requests') {
            if(this.allStatistics) {
                this.allStatistics.forEach(mentor => {
                    mentor_data.push({
                        'Mentor': mentor.mentor_name,
                        'Mentee': mentor.mentee_name,
                        'Estado': mentor.read == 1 ? this._translateService.instant('notification-popup.accepted') : (mentor?.declined == 1 ? this._translateService.instant('notification-popup.declined') : this._translateService.instant('campaign-details.pendingrequest')),
                    })
                })
            }
        }
    
        this._excelService.exportAsExcelFile(mentor_data, 'mentors_' + this.getTimestamp());
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    }

    public getTimestamp() {
        const date = new Date();
        const timestamp = date.getTime();
    
        return timestamp;
    }

    handleChangeViewClick(event) {
        this.viewMode = event?.value;
        if (event) {
            this.buttonList?.forEach((item) => {
                if (item.id === event.id) {
                    item.selected = true;
                } else {
                    item.selected = false;
                }
            });
        }
        this.initializeData();
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}