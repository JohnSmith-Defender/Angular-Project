import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { PageTitleComponent, ToastComponent } from '@share/components';
import { CompanyService, LocalService, UserService } from '@share/services';
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "@env/environment";
import { CoursesService, TutorsService } from '@features/services';
import { StarRatingComponent } from '@lib/components';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { HistoryListComponent } from '@features/tutors/history-list/history-list.component';
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
        FormsModule,
        PageTitleComponent,
        StarRatingComponent,
        ToastComponent,
        HistoryListComponent
    ],
    templateUrl: './history.component.html',
})
export class HistoryComponent {
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
    admin1: boolean = false
    admin2: boolean = false
    superAdmin: boolean = false
    canManageTutor: boolean = false
    featureId: any
    tutorsFeature: any
    isTutorUser: boolean = false
    tutorUsers: any = []
    statusFilter: any = 'All'
    superAdmins: any = []
    superTutor: boolean = false
    dataSource: any
    displayedColumns = ['student_name', 'history']
    isMobile: boolean = false
    superTutorStudents: any = []
    tutorsFeatureId: any;
    hasCourses: boolean = false;
    coursesFeatureId: any;
    pageTitle: any;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    courseFeatureId: any;
    company: any;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: any;
    confirmDeleteItemDescription: any;
    acceptText: string = "";
    cancelText: any = "";
    confirmMode: string = "";
    @ViewChild("modalbutton2", { static: false }) modalbutton2:
    | ElementRef
    | undefined;
    @ViewChild("closemodalbutton2", { static: false }) closemodalbutton2:
    | ElementRef
    | undefined;
    dialogTitle: any;
    dialogMode: string = '';
    historyListMode: any;
    historyListTitle: any;
    historyListBookingId: any;
    historyListUserId: any;
    courses: any;
    searchKeyword: any;
    selectedCourse: any;
    showStatusFilter: boolean = false;
    bookings: any;
    allBookings: any;
    cityAdmin: any;
    historyListStatusFilter: any;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private _tutorsService: TutorsService,
        private _coursesService: CoursesService,
        private _snackBar: MatSnackBar,
    ) {}

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        initFlowbite();
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

        this.initializePage();
    }

    initializePage() {
        this.pageTitle = `${this._translateService.instant('tutors.bookings')} ${this._translateService.instant('ranking.history')}`;
        
        this.features = this._localService.getLocalStorage(environment.lsfeatures) ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures)) : ''
        if(this.features && this.companyId > 0) {
            let tutorsFeature = this.features.filter(f => {
              return f.feature_name == "Tutors"
            })
        
            if(tutorsFeature && tutorsFeature[0]) {
              this.tutorsFeatureId = tutorsFeature[0].id
            }
      
            let courseFeature = this.features.filter(f => {
              return f.feature_name == "Courses"
            })
      
            if(courseFeature && courseFeature[0]) {
              this.courseFeatureId = courseFeature[0].id
              this.getCourses()
            }
        }
      
        this.getCombinedBookingsPrefetch();
    }

    async getCombinedBookingsPrefetch() {
        this._userService.getCombinedBookingsPrefetch(this.companyId, this.tutorsFeatureId, this.coursesFeatureId, this.userId).subscribe(data => {
            this.otherSettings = data[2] ? data[2]['other_settings'] : []
            this.me = data[3] ? data[3]['CompanyUser'] : []
            let roles = data[4] ? data[4]['role'] : []
            this.superAdmin = roles && roles.some(a => a.role == 'Super Admin')
            this.tutorUsers = data[5] ? data[5]['tutors'] : []
            if(this.tutorUsers?.length > 0) {
                this.isTutorUser = this.tutorUsers?.some(a => a.user_id == this.userId)
                let super_tutor = this.tutorUsers?.filter(tutor => {
                    return tutor?.user_id == this.userId && tutor?.super_tutor == 1
                })
                this.superTutor = super_tutor?.length > 0 ? true : false
            }
            let cityAdmins = data[5] ? data[5]['city_admins'] : []
            if(cityAdmins?.length > 0) {
                this.cityAdmin = cityAdmins.some(a => a.user_id == this.userId)
            }
            
            this.getBookings()
        }, error => {
          
        })
    }

    getCourses() {
        this._coursesService.getAllCourses(this.companyId).subscribe(data => {
          let courses = data['courses']
          if(courses) {
            courses = courses && courses.filter(c => {
                return !c.hotmart_product_id
            })
          }
          this.courses = courses
        }, error => {
          
        })
    }

    getBookings(mode: any = '') {
        let role = this.superAdmin ? 'admin' : (this.isTutorUser ? 'tutor' : 'user')
        role = this.superTutor ? 'super_tutor' : (this.cityAdmin ? 'city_admin' : role)
        this._tutorsService.getBookingsHistory(this.userId, this.companyId, role, this.selectedCourse || 0)
          .subscribe(
            async (response) => {
                let user_bookings = response['history']

                user_bookings = user_bookings.map((booking) => {
                    return {
                        student_name: booking?.user_name || (booking?.user_first_name + ' ' + booking?.user_last_name),
                        history: booking?.history,
                        ...booking,
                    };
                })

                user_bookings?.sort((a, b) => {
                    if (a.user_first_name < b.user_first_name) {
                        return -1
                    }
              
                    if (a.user_first_name > b.user_first_name) {
                        return 1
                    }
              
                    return 0
                })

                this.bookings = user_bookings;
                this.allBookings = this.bookings;
                this.isLoading = false;
                this.populateBookingsTable()
            
                if(mode) {
                    this.statusFilter = (mode == 'completed') ? 'Completed' : (mode == 'cancelled' ? 'Cancelled' : 'Action required')
                    this.filterBookings()
                }
            },
            error => {
              console.log(error)
            }
        )
    }

    populateBookingsTable() {
        this.dataSource = new MatTableDataSource(this.bookings)
        if (this.sort) {
            this.dataSource.sort = this.sort;
        } else {
            setTimeout(() => this.dataSource.sort = this.sort);
        }
    }

    getCourseTitle(booking) {
        return booking ? this.language == 'en' ? booking?.course_title_en : (
            this.language == 'fr' ? booking?.course_title_fr : (
                this.language == 'eu' ? booking?.course_title_eu : (
                    this.language == 'ca' ? booking?.course_title_ca : (
                        this.language == 'de' ?  booking?.course_title_de : booking?.course_title
                    )
                )
            )
        ) : ''
    }

    filterLessonStatus(status) {
        this.statusFilter = status
        this.filterBookings()
    }

    filterBookings() {
        let bookings = this.allBookings

        if(this.statusFilter == 'Upcoming') {
            bookings = bookings && bookings.filter(booking => {
                let upcoming = booking?.bookings?.filter(book => {
                    return book?.completed != 1 && book?.cancelled != 1 && moment(moment(book?.booking_date + ' ' + book?.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isSameOrAfter(moment().format('YYYY-MM-DD HH:mm:ss'))
                })
                return upcoming?.length > 0 ? true : false
            })
        } else if(this.statusFilter == 'Action required') {
            bookings = bookings && bookings.filter(booking => {
                let not_completed_cancelled = booking?.bookings?.filter(book => {
                    return (book?.completed != 1 && book?.cancelled != 1 && moment(moment(book?.booking_date + ' ' + book?.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))) ||
                        (book?.completed == 1 && book?.transfer_status == 0 && (this.superAdmin || this.isTutorUser))
                })
                return not_completed_cancelled?.length > 0 ? true : false
            })
        } else if(this.statusFilter == 'Cancelled') {
            bookings = bookings && bookings.filter(booking => {
                let cancelled = booking?.bookings?.filter(book => {
                    return book?.cancelled == 1
                })
               
                return cancelled?.length > 0 ? true : false
            })
        } else if(this.statusFilter == 'Completed') {
            bookings = bookings && bookings.filter(booking => {
                let completed = booking?.bookings?.filter(book => {
                    return book?.completed == 1
                })
               
                return completed?.length > 0 ? true : false
            })
        }

        if(this.searchKeyword) {
            bookings = bookings && bookings.filter(booking => {
                return booking?.user_first_name?.toLowerCase()?.indexOf(this.searchKeyword?.toLowerCase()) >= 0 ||
                    booking?.user_last_name?.toLowerCase()?.indexOf(this.searchKeyword?.toLowerCase()) >= 0 ||
                    booking?.user_name?.toLowerCase()?.indexOf(this.searchKeyword?.toLowerCase()) >= 0
            })
        }

        if(this.selectedCourse) {
            bookings = bookings && bookings.filter(booking => {
                let course = booking?.bookings?.filter(book => {
                    return book.course_id == this.selectedCourse
                })
                return course?.length > 0 ? true : false
            })
        }

        this.bookings = bookings
        this.populateBookingsTable()
    }

    handleSelectedCourse(event) {
        if(event) {
            this.showStatusFilter = true;
        }

       this.selectedCourse = event.target.value;
       this.filterBookings()
    }

    handleSearchByName(event) {
        this.searchKeyword = event;
        this.filterBookings();
    }

    viewHistory(row) {
        this.historyListMode = 'history';
        this.historyListTitle = this._translateService.instant('ranking.history');
        this.historyListUserId = row.user_id;
        this.historyListStatusFilter = this.statusFilter;
        this.dialogTitle = this._translateService.instant('ranking.history');
        this.modalbutton2?.nativeElement.click();
    }

    async open(message: string, action: string) {
        await this._snackBar.open(message, action, {
            duration: 3000,
            panelClass: ["info-snackbar"],
        });
    }
}
