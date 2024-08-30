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
import { TutorsService } from '@features/services';
import { StarRatingComponent } from '@lib/components';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { HistoryListComponent } from '@features/tutors/history-list/history-list.component';
import { SearchComponent } from '@share/components/search/search.component';
import moment from 'moment';
import get from 'lodash/get';
import { searchSpecialCase, sortSerchedMembers } from 'src/app/utils/search/helper';

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
        HistoryListComponent,
        SearchComponent,
    ],
    templateUrl: './my-lessons.component.html',
    styleUrls: ["./my-lessons.component.scss"],
})
export class MyLessonsComponent {
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
    tutorsFeature: any
    userPackages: any = []
    tutorPackages: any = []
    durationUnits: any = []
    showPackages: boolean = false
    isTutorUser: boolean = false
    tutorUsers: any = []
    statusFilter: any = 'All'
    superAdmins: any = []
    bookings: any = []
    allBookings: any = []
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
        'booking_date_display', 
        'booking_time', 
        'tutor_name', 
        'student_name', 
        // 'created_at_display', 
        'course', 
        // 'package_name', 
        'status', 
        'rating',
        'notes',
        'feedback', 
    ]
    isMobile: boolean = false
    showGiveFeedbackModal: boolean = false
    selectedBooking: any;
    feedback: any;
    feedbackFormSubmitted: boolean = false;
    superTutorStudents: any = []
    tutorsFeatureId: any;
    hasCourses: boolean = false;
    coursesFeatureId: any;
    showAddNotesModal: boolean = false;
    notes: any;
    notesFormSubmitted: boolean = false;
    cityAdmin: boolean = false;
    memberTypes: any = [];
    isGuardianType: boolean = false;
    transferCommissionsByBulk: any;
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
    historyListMode: any;
    historyListTitle: any;
    historyListBookingId: any;
    historyListUserId: any;
    searchText: any;
    placeholderText: any;
    searchKeyword: any;
    isRoleCompanion:any
    potsuperTutor:any;
    potTutor:any;
    showPendingLessonAlert:boolean = false;
    stripeTransfers: any = [];
    students: any = [];
    selectedStudent: any = '';
    tutors: any = [];
    selectedTutor: any = '';
    selectedBookingTutor: any = '';

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private _tutorsService: TutorsService,
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
        this.pageTitle = this._translateService.instant('tutors.mylessons');
        
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
            }
        }
      
        this.getCombinedBookingsPrefetch();
    }

    async getCombinedBookingsPrefetch() {
        this._userService.getCombinedBookingsPrefetch(this.companyId, this.tutorsFeatureId, this.coursesFeatureId, this.userId).subscribe(data => {
            let subfeatures = data[0] ? data[0]['subfeatures'] : []
            let courses_subfeatures = data[1] ? data[1]['subfeatures'] : []
            
            this.otherSettings = data[2] ? data[2]['other_settings'] : []
            this.getOtherSettings()

            this.me = data[3] ? data[3]['CompanyUser'] : []
            let roles = data[4] ? data[4]['role'] : []
            this.superAdmin = roles && roles.some(a => a.role == 'Super Admin')

            this.tutorUsers = data[5] ? data[5]['tutors'] : []
            if(this.tutorUsers?.length > 0) {
                this.tutorUsers.sort(function (a, b) {
                    if (a.name < b.name) {
                      return -1;
                    }
                    if (a.name > b.name) {
                      return 1;
                    }
                    return 0;
                });
            }
            
            if(this.tutorUsers?.length > 0) {
                this.isTutorUser = this.tutorUsers?.some(a => a.user_id == this.userId)
                let super_tutor = this.tutorUsers?.filter(tutor => {
                    return tutor?.user_id == this.userId && tutor?.super_tutor == 1
                })
                this.superTutor = super_tutor?.length > 0 ? true : false


                let potsuper_tutor = this.tutorUsers?.filter(tutor => {
                    return tutor?.user_id == this.userId && tutor?.potsuper_tutor == 1
                })
                this.potsuperTutor = potsuper_tutor?.length > 0 ? true : false
                
                let pot_tutor = this.tutorUsers?.filter(tutor => {
                    return tutor?.user_id == this.userId && tutor?.pot_tutor == 1
                })
                this.potTutor = pot_tutor?.length > 0 ? true : false

                if(this.superTutor) {
                    this.superTutorStudents = super_tutor[0].super_tutor_students
                }
                this.tutorAccountId =  data[6] ? data[6]['account_ids'] : []  
            }

            let cityAdmins = data[5] ? data[5]['city_admins'] : []
            if(cityAdmins?.length > 0) {
                this.cityAdmin = cityAdmins.some(a => a.user_id == this.userId)
              }

            if(!this.isTutorUser) {
                this.userPackages = data[7] ? data[7]['user_packages'] : []
                this.tutorPackages = data[7] ? data[7]['tutor_packages'] : []
            }
            this.tutorPackages = this.tutorPackages?.filter(p => {
                return p.default != 1
            })
            this.durationUnits = data[7] ? data[7]['durations'] : []
            if(this.userPackages.length == 0) {
                this.showPackages = true
            }

            this.memberTypes = data[8] ? data[8]['member_types'] : []
            if(this.memberTypes?.length > 0) {
                let selected = this.memberTypes?.find((f) => f.id == this.me?.custom_member_type_id)
        
                this.isGuardianType = selected?.guardian == 1 ? true : false

                this.isRoleCompanion = selected?.type == 'Acompañante'? true : false
                if(this.isGuardianType) {
                    this.displayedColumns = ['booking_date_display', 'booking_time', 'tutor_name', 'student_name', 'created_at_display', 'course', 'package_name', 'status', 'rating']
                    
                }
                if(this.isRoleCompanion){
                    this.displayedColumns = ['booking_date_display', 'booking_time', 'tutor_name', 'student_name',  'course','rating']
                }
            }
            
            this.stripeTransfers = data[9] ? data[9]['stripe_transfers'] : [];

            this.mapSubfeatures(subfeatures, courses_subfeatures)
            this.getBookings()
        }, error => {
          
        })
    }

    async mapSubfeatures(subfeatures,courses_subfeatures) {
        if(subfeatures?.length > 0) {
            this.perHourCommission = subfeatures.some(a => a.name_en == 'Per hour commission' && a.active == 1)
            this.transferCommissionsByBulk = subfeatures.some(a => a.name_en == 'Transfer commissions by bulk' && a.active == 1)
        }
        if(courses_subfeatures?.length > 0) {
            this.hasDifferentStripeAccounts = courses_subfeatures.some(a => a.name_en == 'Different Stripe accounts' && a.active == 1)
        }
    }

    getOtherSettings() {
        let other_settings: any[] = []
        if(this.otherSettings) {
            this.otherSettings.forEach(setting => {
                let section_title = setting.title_en
                let cont: any[] = []
                let content = setting.content
                if(content) {
                    content.forEach(c => {
                        if((section_title == 'Registration/Services' && c.title_en == 'Require subscription during registration with Stripe payment') ||
                            (section_title == 'Registration/Services' && c.title_en == 'STRIPE Secret API Key') ||
                            (section_title == 'Registration/Services' && c.title_en == 'Stripe Monthly Subscription API ID') ||
                            (section_title == 'Registration/Services' && c.title_en == 'Monthly Subscription Fee') ||
                            (section_title == 'Registration/Services' && c.title_en == 'STRIPE Publishable API Key') ||
                            (section_title == 'Registration/Services' && c.title_en == 'Require Stripe payment on specific member types') || 
                            (section_title == 'Registration/Services' && c.title_en == 'Custom member type expiration')
                        ) {
                            // Skip
                        } else {
                            cont.push(c)
                        }
                    });
                }

                other_settings.push({
                    active: setting.active,
                    content: cont,
                    created_at: setting.created_at,
                    id: setting.id,
                    title_en: setting.title_en,
                    title_es: setting.title_es
                })
            });
        }

        this.otherSettings = other_settings
        
        if(this.otherSettings) {
            this.otherSettings.forEach(async m => {
                if(m.title_es == 'Stripe') {
                    if(m.content) {
                        let stripeSettings = m.content.filter(c => {
                            return c.title_en.indexOf('Multiple Stripe Accounts') >= 0
                        })

                        if(stripeSettings && stripeSettings[0]) {
                            this.hasDifferentStripeAccounts = (stripeSettings[0].active == 1 && this.hasDifferentStripeAccounts) ? true : false
                        }
                    }
                }
            })
        }
    }

    getBookings(mode: any = '') {
        let role = this.isTutorUser ? 'tutor' : (this.superAdmin ? 'admin' : 'user')
        role = this.superTutor ? 'super_tutor' : this.isRoleCompanion ? 'companion': this.potsuperTutor ? 'potsuper_tutor': (this.cityAdmin ? 'city_admin' : (this.isGuardianType ? 'guardian' : role))

        this._userService.getUserBookings(this.userId, this.companyId, role)
          .subscribe(
            async (response) => {
                let user_bookings = response['bookings']
                if(role == 'tutor' || role == 'super_tutor' || role == 'admin' || role == 'city_admin'){
                    user_bookings.forEach(ub => {
                        ub.stripe_connect = this.tutorAccountId?.find((ta) => ((ub.stripe_id == ta.stripe_id) && ta.stripe_connect)) ? true : false;
                    })
                }
                
                user_bookings = user_bookings?.map((booking) => {
                    let student_name = booking?.user_name || (booking?.user_first_name + ' ' + booking?.user_last_name)
                    if(student_name == "null null") { student_name = ''; } 
                    let student_match = this.students?.some(
                        (a) => a.student_name == student_name
                      );
                      if(!student_match && student_name) {
                        this.students.push({
                            student_name: student_name,
                        })
                    }

                    let tutor_id = booking?.tutor_id
                    let tutor_name = booking?.tutor_name
                    let tutor_match = this.tutors?.some(
                        (a) => a.tutor_name == tutor_name
                    );
                    if(!tutor_match && tutor_name) {
                        this.tutors.push({
                            id: tutor_id,
                            tutor_name,
                        })
                    }

                    let transfer_date = booking?.completed == 1 ? this.getTransferDate(booking) : '';

                    return {
                        booking_date_display: moment(booking?.booking_date).format('DD/MM/YYYY'),
                        created_at_display: moment(booking?.created_at).format('DD/MM/YYYY'),
                        booking_time: `${this.getTime(booking?.booking_start_time)} - ${this.getTime(booking?.booking_end_time)}`,
                        student_name,
                        course: this.getCourseTitle(booking),
                        tutor_commission: `${booking?.commission ? (booking.commission).replace('.',',') : 0}€`,
                        rating: booking?.tutor_rating,
                        status: this.getStatus(booking),
                        past_booking: moment(booking.booking_date).isSameOrBefore(moment().format('YYYY-MM-DD')) ? true : false,
                        transfer_status: booking.transfer_status,
                        error_code: booking.error_code,
                        show_feedback_button: !booking.feedback && booking.student_complete && (booking.user_id == this.userId) ? true : false,
                        notes: booking?.notes,
                        history: booking?.history,
                        show_mark_complete: this.showMarkCompleteButton(booking),
                        booking_action_required: this.isBookingActionRequired(booking),
                        pending_transfer: booking?.completed == 1 && booking?.transfer_status != 1 ? true : false,
                        can_receive_commission: booking?.tutor_user_type?.toLowerCase()?.indexOf('tutor') >= 0 && !booking?.super_tutor ? true : false,
                        show_cancel: this.showCancelButton(booking),
                        transfer_date: booking?.completed == 1 ? this.getTransferDate(booking) : '',
                        transferred: transfer_date ? (moment(transfer_date).isBefore(moment().format('YYYY-MM-DD')) ? true : false) : false,
                        show_delete: this.showDeleteButton(booking),
                        show_tutor_edit: (this.superAdmin || (this.companyId == 52 && this.me.custom_member_type_id == 243)) && booking?.cancelled != 1 && booking?.completed != 1,
                        ...booking,
                    };
                })

                if(this.tutors?.length > 0) {
                    this.tutors.sort(function (a, b) {
                        if (a.tutor_name < b.tutor_name) {
                            return -1;
                        }
                        if (a.tutor_name > b.tutor_name) {
                            return 1;
                        }
                        return 0;
                    });
                }

                if(this.students?.length > 0) {
                    this.students.sort(function (a, b) {
                        if (a.student_name < b.student_name) {
                            return -1;
                        }
                        if (a.student_name > b.student_name) {
                            return 1;
                        }
                        return 0;
                    });
                }

                user_bookings?.sort((a, b) => {
                    const oldDate: any = new Date(a.booking_date)
                    const newDate: any = new Date(b.booking_date)
            
                    return newDate - oldDate
                })

                this.bookings = user_bookings
                this.allBookings = this.bookings

                if(this.allBookings?.length > 0){
                    const bookings = this.allBookings && this.allBookings?.filter(booking => {
                        let include = false
                        if(booking.completed != 1 && booking?.cancelled != 1) {
                            if (moment().isSame(moment(booking?.booking_date + ' ' + booking?.booking_start_time), 'day') && moment().isAfter(moment(booking?.booking_date + ' ' + booking?.booking_start_time).add(1, 'minute'))) {
                                include = true
                            }
                        }
                        if(booking.completed == 1 && booking.transfer_status == 0 && (this.superAdmin || this.isTutorUser)){
                            include = true
                        }
        
                        return include
                    })
                    if(bookings?.length > 0){
                        this.showPendingLessonAlert = true
                    }
                }
                this.isLoading = false
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

    getTransferDate(booking) {
        let transfer_date = ''

        if(this.isTutorUser || this.superAdmin) {
            let stripe_transfer = this.stripeTransfers?.find((f) => f?.source?.id == booking.commission_transfer_id);
            if(stripe_transfer?.available_on) {
                transfer_date = moment.unix(stripe_transfer?.available_on).format("YYYY-MM-DD")
            }
        }

        return transfer_date
    }

    getCourseTitle(booking) {
        return this.language == 'en' ? booking?.course_title_en : (
            this.language == 'fr' ? booking?.course_title_fr : (
                this.language == 'eu' ? booking?.course_title_eu : (
                    this.language == 'ca' ? booking?.course_title_ca : (
                        this.language == 'de' ?  booking?.course_title_de : booking?.course_title
                    )
                )
            )
        )
    }

    populateBookingsTable() {
        setTimeout(() => {
            initFlowbite();
          }, 100);
        this.dataSource = new MatTableDataSource(
            this.bookings.slice(
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
            new MatTableDataSource(this.bookings).paginator = this.paginator;
            if (this.pageIndex > 0) {
            } else {
              this.paginator.firstPage();
            }
          } else {
            setTimeout(() => {
              if (this.paginator) {
                new MatTableDataSource(this.bookings).paginator = this.paginator;
                if (this.pageIndex > 0) {
                  this.paginator.firstPage();
                }
              }
            });
          }
    }

    getDurationText(item) {
        let text = ''

        if(this.durationUnits && this.durationUnits.length > 0) {
            let duration

            let duration_row = this.durationUnits && this.durationUnits.filter(d => {
                return d.id == item.package.student_allotted_unit
            })

            if(duration_row && duration_row[0]) {
                duration = duration_row[0]
            }

            if(duration) {
                item = this.language == 'en' ? (duration.unit ? (duration.unit || duration.unit_es) : duration.unit_es) :
                    (this.language == 'fr' ? (duration.title_fr ? (duration.unit_fr || duration.unit_es) : duration.unit_es) : 
                        (this.language == 'eu' ? (duration.unit_eu ? (duration.unit_eu || duration.unit_es) : duration.unit_es) : 
                        (this.language == 'ca' ? (duration.unit_ca ? (duration.unit_ca || duration.unit_es) : duration.unit_es) : 
                            (this.language == 'de' ? (duration.unit_de ? (duration.unit_de || duration.unit_es) : duration.unit_es) : duration.unit_es)
                        )
                        )
                    )
            }
        }

        return item
    }

    handleSearch(event) {
        this.pageIndex = 0;
        this.pageSize = 10;
        this.searchKeyword = event;
        this.filterBookings();
    }

    filterLessonStatus(status) {
        this.statusFilter = status
        this.filterBookings()
    }

    filterBookings() {
        let bookings = this.allBookings

        if (bookings?.length > 0 && this.searchKeyword) {
            bookings = bookings?.filter((m) => {
              let include = false;
              if (
                (m.tutor_name &&
                  (m.tutor_name
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
                    searchSpecialCase(this.searchKeyword, m.tutor_name)
                    )
                    ) ||
                (m.student_name &&
                    (m.student_name
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
                        searchSpecialCase(this.searchKeyword, m.student_name))
                        ) ||
                (m.course &&
                    m.course
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

        if(this.selectedStudent) {
            bookings = bookings?.filter((booking) => {
              return booking?.student_name == this.selectedStudent
            })
        }

        if(this.selectedTutor) {
            bookings = bookings?.filter((booking) => {
              return booking?.tutor_name == this.selectedTutor
            })
        }

        if(this.statusFilter == 'Upcoming') {
            bookings = bookings && bookings.filter(booking => {
                let include = false

                if(booking.completed != 1 && booking?.cancelled != 1) {
                    if(moment(moment(booking.booking_date + ' ' + booking.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isSameOrAfter(moment().format('YYYY-MM-DD HH:mm:ss'))) {
                        include = true
                    }

                }

                return include
            })
        } else if(this.statusFilter == 'Action required') {
            bookings = bookings && bookings.filter(booking => {
                let include = false
                if(booking.completed != 1 && booking?.cancelled != 1) {
                    if (moment().isSame(moment(booking?.booking_date + ' ' + booking?.booking_start_time), 'day') && moment().isAfter(moment(booking?.booking_date + ' ' + booking?.booking_start_time).add(1, 'minute'))) {
                        include = true
                    }

                    if(moment(moment(booking.booking_date + ' ' + booking.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))){
                        include = true
                    }
                }
                if(booking.completed == 1 && booking.transfer_status == 0 && (this.superAdmin || this.isTutorUser)){
                    include = true
                }

                return include
            })
        } else if(this.statusFilter == 'Cancelled') {
            bookings = bookings && bookings.filter(booking => {
                return booking?.cancelled == 1
            })
        } else if(this.statusFilter == 'Completed') {
            bookings = bookings && bookings.filter(booking => {
                let completed = false
                if(booking.completed == 1 && (this.superAdmin || this.isTutorUser) && booking.transfer_status == 0){
                    completed = false
                }
                if(booking.completed == 1 && (this.superAdmin || this.isTutorUser) && booking.transfer_status != 0){
                    completed = true
                }
                if(booking.completed == 1 && (!this.superAdmin && !this.isTutorUser)){
                    completed = true
                }
                return completed
            })
        }

        bookings = sortSerchedMembers(bookings,this.searchKeyword, 'LESSONS')
        this.bookings = bookings
        this.populateBookingsTable()
    }

    getTime(time) {
        let date = moment(new Date()).format('YYYY-MM-DD')
        let date_time = date + ' ' + time
        return moment(date_time).format('h:mm a').toUpperCase()
    }

    showCancelButton(booking) {
        return (
            (this.superAdmin || booking?.tutor_user_id == this.userId || booking?.user_id == this.userId) 
            && booking?.cancelled != 1 && booking?.completed != 1 && booking?.tutor_complete != 1 && booking?.student_complete != 1 
            && !booking?.tutor_rating && this.statusFilter != 'Completed' 
            && moment(moment(booking.booking_date + ' ' + booking.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isSameOrAfter(moment().format('YYYY-MM-DD HH:mm:ss'))
        ) || (
            (this.superAdmin || booking?.tutor_user_id == this.userId) 
            && booking?.cancelled != 1 && booking?.completed != 1
            && moment(moment(booking.booking_date + ' ' + booking.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))
        )
    }

    showDeleteButton(booking) {
        return (this.superAdmin || booking?.tutor_user_id == this.userId) 
            && booking?.completed != 1
            && moment(moment(booking.booking_date + ' ' + booking.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))
    }

    showMarkCompleteButton(booking) { 
        let show = false

        if(this.isTutorUser && booking?.tutor_complete != 1) {
            show = true
        }

        if(!this.isTutorUser && !this.superAdmin && booking?.student_complete != 1) {
            show = true
        }

        if(this.superAdmin) {
            show = true
        }

        if(this.superAdmin && !this.isTutorUser && booking?.tutor_complete != 1 && booking?.student_complete == 1){
            show = false
        }
        return show && booking?.completed != 1
    }

    isBookingActionRequired(booking) {
        let action_required_bookings = this.allBookings && this.allBookings.filter(bk => {
            let include = false
            if(moment(moment(booking.booking_date + ' ' + booking.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))) {
                include = true
            }

            return include && booking?.id == bk?.id && bk?.completed != 1
        })

        if(action_required_bookings && action_required_bookings.length > 0) {
            return true
        } else {
            return false
        }
    }

    getStatus(booking) {
        let status = ''

        if(this.isTutorUser && !booking.student_complete) {
            status = this._translateService.instant('tutors.waitingstudentcomplete')
        }
        if(!this.isTutorUser && !this.superAdmin && !booking.tutor_complete) {
            status = this._translateService.instant('tutors.waitingtutorcomplete')
        }

        if(this.superAdmin) {
            if(this.isTutorUser && !booking.student_complete) {
                status = `<p>${this._translateService.instant('tutors.waitingstudentcomplete')}</p>`
            }
    
            if(!this.isTutorUser && !this.superAdmin && !booking.tutor_complete) {
                status += `<p>${this._translateService.instant('tutors.waitingtutorcomplete')}</p>`
            }
        }

        if(this.superAdmin && !this.isTutorUser && booking.tutor_complete != 1){
            status = this._translateService.instant('tutors.waitingtutorcomplete')
        }

        if(moment(booking.booking_date).isSameOrAfter(moment().format('YYYY-MM-DD'))) {
            status = ''
        }

        return status
    }

    getPacakgeDuration(duration_unit){
        duration_unit = Number(duration_unit)
        switch(duration_unit){
            case 1:
                return this._translateService.instant('timeunits.minutes')
            case 2:
                return this._translateService.instant('timeunits.hours')
            case 3:
                return this._translateService.instant('timeunits.days')
            case 4:
                return this._translateService.instant('timeunits.weeks')
            case 5:
                return this._translateService.instant('timeunits.months')
            case 6:
                return this._translateService.instant('timeunits.years')
        }

    }

    getTutoringType(package_name) {
        return package_name ? this._translateService.instant('course-create.package') : this._translateService.instant('tutors.individualtutoring');
    }

    openFeedbackPopup(row) {
        this.feedback = ''
        this.selectedBooking = ''
        this.dialogMode = 'feedback'
        this.dialogTitle = this._translateService.instant('company-settings.givefeedback')
        this.selectedBooking = row
        this.modalbutton1?.nativeElement.click();
    }

    submitFeedback() {
        this.feedbackFormSubmitted = true

        if(!this.feedback) return false

        let params = {
            id : this.selectedBooking?.id || 0,
            feedback: this.feedback,
        }

        this._tutorsService.giveFeedback(params)
        .subscribe(
            async (response) => {
                let bookings = this.bookings
                bookings?.forEach(b => {
                    if(b.id == this.selectedBooking.id) {
                        b.feedback = this.feedback;
                        b.show_feedback_button = false;
                    }
                })
                this.bookings = bookings;
                this.populateBookingsTable();
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                this.closemodalbutton1?.nativeElement.click();
            }
        )
    }

    handleCancelBooking(row) {
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

    handleDeleteBooking(row) {
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
            this.cancelBooking(this.selectedItem.id, this.selectedItem.user_id, true);
            this.showConfirmationModal = false;
        } else if (this.confirmMode == "complete") {
            this.markComplete(this.selectedItem, true);
            this.showConfirmationModal = false;
        } else if (this.confirmMode == "delete") {
            this.deleteBooking(this.selectedItem.id, true);
            this.showConfirmationModal = false;
        } 
    }

    cancelBooking(id, user_id, confirmed) {
        const tutor_id = this.bookings.find(booking=> {
            if(booking.id == id){
                return booking
            }
        })?.tutor_user_id || ''
        if(confirmed) {
            let params = {
                id,
                user_id,
                tutor_id
            }
            
            this._tutorsService.cancelBooking(params).subscribe(data => {
                if(data?.status == 200 && data?.message == "success"){
                    let bookings = this.allBookings
                    bookings?.forEach(b => {
                        if(b.id == this.selectedItem.id) {
                            b.cancelled = 1
                            b.show_cancel = false
                        }
                    })
                    this.statusFilter = 'Cancelled';
                    this.filterBookings();
                    this.open(this._translateService.instant('dialog.bookingcancel'), '');
                }
            }, err => {
                console.log('err: ', err);
            })
        }
    }

    deleteBooking(id, confirmed) {
        if(confirmed) {
            this._tutorsService.deleteBooking(id).subscribe(data => {
                if(data?.message == "success"){
                    let all_bookings = this.allBookings
                    all_bookings?.forEach((b, index) => {
                        if(b.id == this.selectedItem.id) {
                            all_bookings.splice(index, 1);
                        }
                    })
                    this.allBookings = all_bookings;

                    let bookings = this.bookings
                    bookings?.forEach((b, index) => {
                        if(b.id == this.selectedItem.id) {
                            bookings.splice(index, 1);
                        }
                    })
                    this.bookings = bookings;

                    this.populateBookingsTable();
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

    markComplete(booking, confirmed) {
        if(confirmed) {
            let role = this.superTutor ? 'super_tutor' :  this.isTutorUser && !this.superAdmin ? 'tutor' : (this.superAdmin ? 'admin' : 'user')
            let params = {
                id: booking.id,
                role: role,
            }

            params['user_id'] = booking.user_id
            params['tutor_id'] = booking.tutor_id
            params['course_id'] = booking.course_id
            params['company_id'] = this.companyId
            if(this.hasDifferentStripeAccounts){
                params['has_diff_stripe_account'] = this.hasDifferentStripeAccounts
            }
            let booking_id = booking.id
            this._tutorsService.editBookingStatus(params)
            .subscribe(
                async (response) => {
                        let completedLesson = response?.booking ? response.booking : '';
                        let lessonCompleted = response?.booking?.completed == 1 ? true : false
    
                        if(lessonCompleted && !this.potTutor && !this.potsuperTutor){
                            let params2 = {
                                booking_id : completedLesson?.id ? completedLesson.id : 0,
                                course_id: completedLesson?.course_id,
                                package_id: completedLesson?.package_id,
                                user_id: completedLesson?.user_id,
                                tutor_id: completedLesson?.tutor_id,
                                tutor_minutes: booking.tutor_minutes,
                                per_hour_commission: this.perHourCommission
                            }
    
                            if(this.hasDifferentStripeAccounts){
                                params2['has_diff_stripe_account'] = this.hasDifferentStripeAccounts
                                params2['stripe_id'] = response.stripe_id
                            }
                            await this._tutorsService.handleTutorTransfer(booking_id, params2)
                            .subscribe(
                                async (response) => {
                                    if(response?.message == 'balance_insufficient' && (this.isTutorUser || this.superAdmin)){
                                        this.getBookings('refresh-action')
                                    } else {
                                        this.refreshFilter();
                                    }
                                    this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
                                }
                            )
                        } else {
                            this.refreshFilter();
                            this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
                        }
                },
                error => {
                    console.log(error)
                }
            )
        }
    }

    refreshFilter() {
        let bookings = this.allBookings
        bookings?.forEach(b => {
            if(b.id == this.selectedItem.id) {
                b.completed = 1
            }
        })
        this.statusFilter = 'Completed';
        this.filterBookings();
    }

    async open(message: string, action: string) {
        await this._snackBar.open(message, action, {
            duration: 3000,
            panelClass: ["info-snackbar"],
        });
    }

    addNotes(row) {
        this.notes = ''
        this.selectedBooking = ''
        this.dialogMode = 'add-notes'
        this.dialogTitle = this._translateService.instant('guests.notes')
        this.selectedBooking = row
        this.modalbutton1?.nativeElement.click();
    }

    submitNotes() {
        this.notesFormSubmitted = true

        if(!this.notes) return false

        let params = {
            booking_id : this.selectedBooking?.id || 0,
            created_by: this.userId,
            company_id: this.companyId,
            notes: this.notes,
        }

        this._tutorsService.addNotes(params)
        .subscribe(
            async (response) => {
                this.closemodalbutton1?.nativeElement.click();
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
            }
        )
    }

    viewNotes(row) {
        this.historyListMode = 'notes';
        this.historyListTitle = this._translateService.instant('guests.notes');
        this.historyListBookingId = row.id;
        this.dialogMode = 'view-notes';
        this.dialogTitle = this._translateService.instant('guests.notes');
        this.modalbutton1?.nativeElement.click();
    }

    provideRating(row) {
        this.dialogMode = 'rating'
        this.dialogTitle = this._translateService.instant('event-survey.rate')
        this.selectedBooking = row
        this.modalbutton1?.nativeElement.click();
    }

    acceptRating() {
        this.prevRatingValue = this.rating
        let tutor_rating = this.rating ? parseFloat(this.rating)?.toFixed(1) : 0
        let booking = this.selectedBooking
        let tutor_id = booking.tutor_id
        this._tutorsService.addTutorRating(booking.user_id, booking.company_id, tutor_id, {rating : this.rating, booking_id : booking.id}).subscribe(
            async response => {
                if(response){
                    booking.tutor_rating = tutor_rating
                    // Update booking rating
                    let bookings = this.bookings
                    bookings?.forEach(b => {
                        if(b.id == this.selectedBooking.id) {
                            b.tutor_rating = tutor_rating
                        }
                    })
                    this.bookings = bookings;
                    this.populateBookingsTable();
                    this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                    this.closemodalbutton1?.nativeElement.click();
                }
        });
    }

    getPageDetails(event: any) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.dataSource = new MatTableDataSource(
            this.bookings.slice(
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

    changeStudentFilter(event) {
        this.filterBookings();
    }

    changeTutorFilter(event) {
        this.filterBookings();
    }

    handleEditTutor(row) {
        console.log('edit tutor')
        console.log(row)
        this.selectedTutor = '';
        this.selectedBooking = '';
        this.selectedBookingTutor = row.tutor_id;
        this.dialogMode = 'edit-tutor';
        this.dialogTitle = this._translateService.instant('tutors.edittutor');
        this.selectedBooking = row;
        this.modalbutton1?.nativeElement.click();
    }

    editAssignedTutor() {
        let params = {
            booking_id: this.selectedBooking?.id,
            tutor_id: this.selectedBookingTutor,
            company_id: this.companyId,
            user_id: this.userId,
        }
        this._tutorsService.editAssignedTutor(params).subscribe(
            async response => {
                let bookings = this.bookings;
                bookings?.forEach(b => {
                    if(b.id == this.selectedBooking.id) {
                        let selected_tutor = this.tutorUsers?.filter(t => {
                            return t.id == this.selectedBookingTutor
                        })
                        b.tutor_id = this.selectedBookingTutor;
                        b.tutor_name = selected_tutor?.length > 0 ? 
                            (selected_tutor[0].first_name ? (selected_tutor[0].first_name + ' ' + selected_tutor[0].last_name) : selected_tutor[0].name)
                            : '';
                    }
                })
                this.bookings = bookings;
                this.populateBookingsTable();
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                this.closemodalbutton1?.nativeElement.click();
            });
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}