import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from 'rxjs';
import { PageTitleComponent, ToastComponent } from '@share/components';
import { CompanyService, LocalService, UserService } from '@share/services';
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "@env/environment";
import { BuddyService } from '@features/services';
import { StarRatingComponent } from '@lib/components';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { SearchComponent } from '@share/components/search/search.component';
import { searchSpecialCase, sortSerchedMembers } from 'src/app/utils/search/helper';
import moment from 'moment';
import get from 'lodash/get';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule,
        MatTableModule,
        MatSortModule,
        MatSnackBarModule,
        MatPaginatorModule,
        FormsModule,
        PageTitleComponent,
        StarRatingComponent,
        ToastComponent,
        SearchComponent,
    ],
    templateUrl: './my-sessions.component.html',
    styleUrls: ["./my-sessions.component.scss"],
})
export class MySessionsComponent {
    private destroy$ = new Subject<void>();

    languageChangeSubscription;
    language: any
    emailDomain: any
    id: any
    companies: any
    companyName: any
    primaryColor: any
    buttonColor: any
    userId: any
    companyId: any
    tutor: any
    features: any
    pageName: any
    me: any
    company_subfeatures = []
    subfeature_id_global: number = 0
    feature_global: string = ''
    isLoading: boolean = true
    otherSettings: any
    roles: any = []
    hasCustomMemberTypeSettings: boolean = false
    admin1: boolean = false
    admin2: boolean = false
    superAdmin: boolean = false
    canManageTutor: boolean = false
    featureId: any
    buddyFeature: any
    userPackages: any = []
    tutorPackages: any = []
    durationUnits: any = []
    showPackages: boolean = false
    isTutorUser: boolean = false
    tutorUsers: any = []
    statusFilter: any = 'All'
    superAdmins: any = []
    sessions: any = []
    allSessions: any = []
    superTutor: boolean = false
    rating: any = 0
    prevRatingValue: any = 0
    perHourCommission: boolean = false
    hasDifferentStripeAccounts: boolean = false
    tutorAccountId: any = []
    pageSize: number = 10
    pageIndex: number = 0
    dataSource: any
    displayedColumns = [
        'action',
        'session_date_display', 
        'session_time', 
        'mentor_name', 
        'mentee_name', 
        'status', 
    ]
    isMobile: boolean = false
    showGiveFeedbackModal: boolean = false
    selectedSession: any;
    feedback: any;
    feedbackFormSubmitted: boolean = false;
    buddyFeatureId: any;
    pageTitle: any;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
    courseFeatureId: any;
    company: any;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: any;
    confirmDeleteItemDescription: any;
    acceptText: string = "";
    cancelText: any = "";
    confirmMode: string = "";
    @ViewChild("modalbutton1", { static: false }) modalbutton1:
    | ElementRef
    | undefined;
    @ViewChild("closemodalbutton1", { static: false }) closemodalbutton1:
    | ElementRef
    | undefined;
    dialogTitle: any;
    dialogMode: string = '';
    searchText: any;
    placeholderText: any;
    searchKeyword: any;
    mentees: any = [];
    selectedMentee: any = '';
    mentors: any = [];
    selectedMentor: any = '';
    selectedSessionMentor: any = '';

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private _buddyService: BuddyService,
        private _snackBar: MatSnackBar,
    ) {}

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        this.userId = this._localService.getLocalStorage(environment.lsuserId)
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId)
        this.language = this._localService.getLocalStorage(environment.lslang)
        this._translateService.use(this.language || 'es')

        this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies)) : ''
        if(!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
        let company = this._companyService.getCompany(this.companies)
        if(company && company[0]) {
            this.company = company[0]
            this.emailDomain = company[0].domain
            this.companyId = company[0].id
            this.primaryColor = company[0].primary_color
            this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
        }

        this.initializeSearch();

        this.languageChangeSubscription =
        this._translateService.onLangChange.subscribe(
          (event: LangChangeEvent) => {
            this.language = event.lang;
            this.initializePage();
          }
        );

        this.initializePage();
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant(
          "news.searchbykeyword"
        );
    }

    initializePage() {
        this.pageTitle = this._translateService.instant('buddy.mysessions');
        
        this.features = this._localService.getLocalStorage(environment.lsfeatures) ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures)) : ''
        if(this.features && this.companyId > 0) {
            let buddyFeature = this.features.filter(f => {
              return f.feature_name == "Buddy"
            })
        
            if(buddyFeature && buddyFeature[0]) {
              this.buddyFeatureId = buddyFeature[0].id
            }
        }
      
        this.getSessions();
    }

    getSessions(mode: any = '') {
        this._userService.getUserMentorSessions(this.companyId, this.userId)
          .subscribe(
            async (response) => {
                let user_sessions = response['sessions']
                user_sessions = user_sessions?.map((session) => {
                    let mentee_name = session?.mentee_name
                    if(mentee_name == "null null") { mentee_name = ''; } 
                    let mentee_match = this.mentees?.some(
                        (a) => a.mentee_name == mentee_name
                      );
                      if(!mentee_match && mentee_name) {
                        this.mentees.push({
                            mentee_name: mentee_name,
                        })
                    }


                    let mentor_user_id = session?.mentor_user_id
                    let mentor_name = session?.mentor_name
                    let mentor_match = this.mentors?.some(
                        (a) => a.mentor_name == mentor_name
                    );
                    if(!mentor_match && mentor_name) {
                        this.mentors.push({
                            id: mentor_user_id,
                            mentor_name,
                        })
                    }

                    return {
                        session_date_display: moment(session?.session_date).format('DD/MM/YYYY'),
                        created_at_display: moment(session?.created_at).format('DD/MM/YYYY'),
                        session_time: `${this.getTime(session?.session_start_time)} - ${this.getTime(session?.session_end_time)}`,
                        mentee_name: session.mentee_name,
                        rating: session?.mentor_rating,
                        status: this.getStatus(session),
                        past_booking: moment(session.session_date).isSameOrBefore(moment().format('YYYY-MM-DD')) ? true : false,
                        show_feedback_button: !session.feedback && session.mentee_complete && (session.user_id == this.userId) ? true : false,
                        show_mark_complete: this.showMarkCompleteButton(session),
                        session_action_required: this.isSessionActionRequired(session),
                        show_cancel: this.showCancelButton(session),
                        show_delete: this.showDeleteButton(session),
                        ...session,
                    };
                })

                if(this.mentors?.length > 0) {
                    this.mentors.sort(function (a, b) {
                        if (a.mentor_name < b.mentor_name) {
                            return -1;
                        }
                        if (a.mentor_name > b.mentor_name) {
                            return 1;
                        }
                        return 0;
                    });
                }

                if(this.mentees?.length > 0) {
                    this.mentees.sort(function (a, b) {
                        if (a.mentee_name < b.mentee_name) {
                            return -1;
                        }
                        if (a.mentee_name > b.mentee_name) {
                            return 1;
                        }
                        return 0;
                    });
                }

                user_sessions?.sort((a, b) => {
                    const oldDate: any = new Date(a.session_date)
                    const newDate: any = new Date(b.session_date)
            
                    return newDate - oldDate
                })

                this.sessions = user_sessions
                this.allSessions = this.sessions

                if(this.allSessions?.length > 0){
                    const sessions = this.allSessions && this.allSessions?.filter(session => {
                        let include = false
                        if(session.completed != 1 && session?.cancelled != 1) {
                            if (moment().isSame(moment(session?.session_date + ' ' + session?.session_start_time), 'day') && moment().isAfter(moment(session?.session_date + ' ' + session?.session_start_time).add(1, 'minute'))) {
                                include = true
                            }
                        }
                        if(session.completed == 1 && this.superAdmin) {
                            include = true
                        }
        
                        return include
                    })
                }
                this.isLoading = false
                this.populateSessionsTable()
            
                if(mode) {
                    this.statusFilter = (mode == 'completed') ? 'Completed' : (mode == 'cancelled' ? 'Cancelled' : 'Action required')
                    this.filterSessions()
                }
            },
            error => {
              console.log(error)
            }
          )
    }

    populateSessionsTable() {
        setTimeout(() => {
            initFlowbite();
          }, 100);
        this.dataSource = new MatTableDataSource(
            this.sessions.slice(
                this.pageIndex * this.pageSize,
                (this.pageIndex + 1) * this.pageSize
            )
        )
        if (this.sort) {
            this.dataSource.sort = this.sort;
        } else {
            setTimeout(() => this.dataSource.sort = this.sort);
        }
        if (this.paginator) {
            new MatTableDataSource(this.sessions).paginator = this.paginator;
            if (this.pageIndex > 0) {
            } else {
              this.paginator.firstPage();
            }
          } else {
            setTimeout(() => {
              if (this.paginator) {
                new MatTableDataSource(this.sessions).paginator = this.paginator;
                if (this.pageIndex > 0) {
                  this.paginator.firstPage();
                }
              }
            });
          }
    }

    handleSearch(event) {
        this.pageIndex = 0;
        this.pageSize = 10;
        this.searchKeyword = event;
        this.filterSessions();
    }

    filterLessonStatus(status) {
        this.statusFilter = status
        this.filterSessions()
    }

    filterSessions() {
        let sessions = this.allSessions

        if (sessions?.length > 0 && this.searchKeyword) {
            sessions = sessions?.filter((m) => {
              let include = false;
              if (
                (m.mentor_name &&
                  (m.mentor_name
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
                    searchSpecialCase(this.searchKeyword, m.mentor_name)
                    )
                    ) ||
                (m.mentee_name &&
                    (m.mentee_name
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
                        searchSpecialCase(this.searchKeyword, m.mentee_name))
                        )
              ) {
                include = true;
              }
      
              return include;
            });
        }

        if(this.selectedMentee) {
            sessions = sessions?.filter((session) => {
              return session?.mentee_name == this.selectedMentee
            })
        }

        if(this.selectedMentor) {
            sessions = sessions?.filter((session) => {
              return session?.mentor_name == this.selectedMentor
            })
        }

        if(this.statusFilter == 'Upcoming') {
            sessions = sessions && sessions.filter(session => {
                let include = false

                if(session.completed != 1 && session?.cancelled != 1) {
                    if(moment(moment(session.session_date + ' ' + session.session_end_time).format('YYYY-MM-DD HH:mm:ss')).isSameOrAfter(moment().format('YYYY-MM-DD HH:mm:ss'))) {
                        include = true
                    }

                }

                return include
            })
        } else if(this.statusFilter == 'Action required') {
            sessions = sessions && sessions.filter(session => {
                let include = false
                if(session.completed != 1 && session?.cancelled != 1) {
                    if (moment().isSame(moment(session?.session_date + ' ' + session?.session_start_time), 'day') && moment().isAfter(moment(session?.session_date + ' ' + session?.session_start_time).add(1, 'minute'))) {
                        include = true
                    }

                    if(moment(moment(session.session_date + ' ' + session.session_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))){
                        include = true
                    }
                }

                return include
            })
        } else if(this.statusFilter == 'Cancelled') {
            sessions = sessions && sessions.filter(session => {
                return session?.cancelled == 1
            })
        } else if(this.statusFilter == 'Completed') {
            sessions = sessions && sessions.filter(session => {
                return session?.completed == 1
            })
        }

        sessions = sortSerchedMembers(sessions,this.searchKeyword, 'LESSONS')
        this.sessions = sessions
        this.populateSessionsTable()
    }

    getTime(time) {
        let date = moment(new Date()).format('YYYY-MM-DD')
        let date_time = date + ' ' + time
        return moment(date_time).format('h:mm a').toUpperCase()
    }

    showCancelButton(session) {
        return (
            (this.superAdmin || session?.mentor_user_id == this.userId || session?.user_id == this.userId) 
            && session?.cancelled != 1 && session?.completed != 1 && session?.mentor_complete != 1 && session?.mentee_complete != 1 
            && !session?.mentor_rating && this.statusFilter != 'Completed' 
            && moment(moment(session.session_date + ' ' + session.session_end_time).format('YYYY-MM-DD HH:mm:ss')).isSameOrAfter(moment().format('YYYY-MM-DD HH:mm:ss'))
        ) || (
            (this.superAdmin || session?.mentor_user_id == this.userId) 
            && session?.cancelled != 1 && session?.completed != 1
            && moment(moment(session.session_date + ' ' + session.session_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))
        )
    }

    showDeleteButton(session) {
        return (this.superAdmin || session?.mentor_user_id == this.userId) 
            && session?.completed != 1
            && moment(moment(session.session_date + ' ' + session.session_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))
    }

    showMarkCompleteButton(session) { 
        let show = false

        let isTutorUser = session.mentor_user_id == this.userId ? true : false

        if(isTutorUser && session?.mentor_complete != 1) {
            show = true
        }

        if(!isTutorUser && !this.superAdmin && session?.mentee_complete != 1) {
            show = true
        }

        if(this.superAdmin) {
            show = true
        }

        if(this.superAdmin && !isTutorUser && session?.mentor_complete != 1 && session?.mentee_complete == 1){
            show = false
        }

        return show && session?.completed != 1
    }

    isSessionActionRequired(session) {
        let action_required_bookings = this.allSessions && this.allSessions.filter(bk => {
            let include = false
            if(moment(moment(session.session_date + ' ' + session.session_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))) {
                include = true
            }

            return include && session?.id == bk?.id && bk?.completed != 1
        })

        if(action_required_bookings && action_required_bookings.length > 0) {
            return true
        } else {
            return false
        }
    }

    getStatus(session) {
        let status = ''

        if(session.completed != 1) {
            status = this._translateService.instant('buddy.pendingcompletion')
        }

        if(moment(session.session_date).isSameOrAfter(moment().format('YYYY-MM-DD'))) {
            status = ''
        }

        return status
    }

    handleCancelSession(row) {
        if (row.id) {
            this.showConfirmationModal = false;
            this.selectedItem = row;
            this.confirmMode = "cancel";
            this.confirmDeleteItemTitle = this._translateService.instant(
              "dialog.confirmcancel"
            );
            this.confirmDeleteItemDescription = this._translateService.instant(
              "dialog.confirmcancelitem"
            );
            this.acceptText = "OK";
            setTimeout(() => (this.showConfirmationModal = true));
        }
    }

    handleDeleteSession(row) {
        if (row.id) {
            this.showConfirmationModal = false;
            this.selectedItem = row;
            this.confirmMode = "delete";
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

    confirm() {
        if (this.confirmMode == "cancel") {
            this.cancelSession(this.selectedItem.id, this.selectedItem.user_id, true);
            this.showConfirmationModal = false;
        } else if (this.confirmMode == "complete") {
            this.markComplete(this.selectedItem, true);
            this.showConfirmationModal = false;
        } else if (this.confirmMode == "delete") {
            this.deleteSession(this.selectedItem.id, true);
            this.showConfirmationModal = false;
        } 
    }

    cancelSession(id, user_id, confirmed) {
        const mentor_user_id = this.sessions.find(session=> {
            if(session.id == id){
                return session
            }
        })?.mentor_user_id || ''
        if(confirmed) {
            let params = {
                id,
                user_id,
                mentor_user_id
            }
            
            this._buddyService.cancelSession(params).subscribe(data => {
                if(data?.status == 200 && data?.message == "success"){
                    let sessions = this.allSessions
                    sessions?.forEach(b => {
                        if(b.id == this.selectedItem.id) {
                            b.cancelled = 1
                            b.show_cancel = false
                        }
                    })
                    this.statusFilter = 'Cancelled';
                    this.filterSessions();
                    this.open(this._translateService.instant('dialog.bookingcancel'), '');
                }
            }, err => {
                console.log('err: ', err);
            })
        }
    }

    deleteSession(id, confirmed) {
        if(confirmed) {
            this._buddyService.deleteSession(id).subscribe(data => {
                if(data?.message == "success"){
                    let all_sessions = this.allSessions
                    all_sessions?.forEach((b, index) => {
                        if(b.id == this.selectedItem.id) {
                            all_sessions.splice(index, 1);
                        }
                    })
                    this.allSessions = all_sessions;

                    let sessions = this.sessions
                    sessions?.forEach((b, index) => {
                        if(b.id == this.selectedItem.id) {
                            sessions.splice(index, 1);
                        }
                    })
                    this.sessions = sessions;

                    this.populateSessionsTable();
                    this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
                }
            }, err => {
                console.log('err: ', err);
            })
        }
    }

    confirmMarkComplete(row) {
        if (row.id) {
            this.showConfirmationModal = false;
            this.selectedItem = row;
            this.confirmMode = "complete";
            this.confirmDeleteItemTitle = this._translateService.instant(
              "campaign-details.confirmation"
            );
            this.confirmDeleteItemDescription = this._translateService.instant(
              "tutors.markcomplete"
            );
            this.acceptText = "OK";
            setTimeout(() => (this.showConfirmationModal = true));
        }
    }

    markComplete(session, confirmed) {
        if(confirmed) {
            let params = {
                id: session.id,
                user_id: session.user_id,
                mentor_user_id: session.mentor_user_id,
                role: this.superAdmin ? 'admin' : (session.mentor_user_id == this.userId ? 'mentor' : 'mentee'),
                company_id: this.companyId,
            }
            
            this._buddyService.editSessionStatus(params)
            .subscribe(
                async (response) => {
                    this.refreshFilter();
                    this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                },
                error => {
                    console.log(error)
                }
            )
        }
    }

    refreshFilter() {
        let sessions = this.allSessions
        sessions?.forEach(b => {
            if(b.id == this.selectedItem.id) {
                b.completed = 1
            }
        })
        this.statusFilter = 'Completed';
        this.filterSessions();
    }

    async open(message: string, action: string) {
        await this._snackBar.open(message, action, {
            duration: 3000,
            panelClass: ["info-snackbar"],
        });
    }

    getPageDetails(event: any) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.dataSource = new MatTableDataSource(
            this.sessions.slice(
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

    changeMenteeFilter(event) {
        this.filterSessions();
    }

    changeMentorFilter(event) {
        this.filterSessions();
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}