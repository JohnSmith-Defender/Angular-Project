import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  Input,
  SimpleChange,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { SearchComponent } from "@share/components/search/search.component";
import { JobOffersService, TutorsService } from "@features/services";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ToastComponent } from "@share/components";
import { environment } from "@env/environment";
import { DatePipe } from "@angular/common";
import { get } from "lodash";
import moment from "moment";
import * as _ from "lodash";

@Component({
    selector: "app-tutors-history-list",
    standalone: true,
    imports: [
      CommonModule,
      TranslateModule,
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatSnackBarModule,
      SearchComponent,
      ToastComponent,
    ],
    templateUrl: "./history-list.component.html",
  })
  export class HistoryListComponent {
    private destroy$ = new Subject<void>();

    @Input() mode: any;
    @Input() title: any;
    @Input() bookingId: any;
    @Input() userId: any;
    @Input() companyId: any;
    @Input() statusFilter: any;
    @Input() superAdmin: any;
    @Input() isTutorUser: any;

    domain: any;
    language: any;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    p: any;
    _: any = _;
    records: any = [];
    dataSource: any;
    dataColumns: any;

    isLoading: boolean = true;
    datePipe = new DatePipe("en-US");
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    modalTitle: any;

    constructor(
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _tutorsService: TutorsService,
    ) { }

    ngOnChanges(changes: SimpleChange) {
      let modeChange = changes["mode"];
      if (modeChange?.previousValue != modeChange?.currentValue) {
        this.mode = modeChange.currentValue;
        this.initializeData();
      }

      let userIdChange = changes["userId"];
      if (userIdChange?.previousValue != userIdChange?.currentValue) {
        this.userId = userIdChange.currentValue;
        this.initializeData();
      }

      let bookingIdChange = changes["bookingId"];
      if (bookingIdChange?.previousValue != bookingIdChange?.currentValue) {
        this.bookingId = bookingIdChange.currentValue;
        this.initializeData();
      }
    }

    async ngOnInit() {
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
          this.companyId = company[0].id;
          this.domain = company[0].domain;
          this.primaryColor = company[0].primary_color;
          this.buttonColor = company[0].button_color
              ? company[0].button_color
              : company[0].primary_color;
          }

      this.initializeData();   
    }

    initializeData() {
      if(this.mode == 'notes') {
        this.dataColumns = [
            "notes",
            "created_by",
            "date_display",
        ]
      } else if(this.mode == 'history') {
          this.dataColumns = [
              "date_display",
              "booking_date_display",
              "tutor",
              "student",
              "status",
              "rating",
              "feedback",
              "notes",
          ]
      }
      this.loadData();
    }

    loadData() {
      this.records = [];
      if(this.mode == 'notes') {
        this.modalTitle = this._translateService.instant('guests.notes')
        this._tutorsService
        .getTutorBookingNotes(
          this.bookingId
        ).subscribe(async (response) => {
          this.records = response.tutor_booking_notes;
          this.mapHistory(this.records);
          this.isLoading = false;
          this.refreshDataSource(this.records);
        });
      } else if(this.mode == 'history') {
        this.modalTitle = this._translateService.instant('ranking.history')
        this._tutorsService
        .getTutorBookingHistory(
          this.userId
        ).subscribe(async (response) => {
          let user_bookings = response.user_bookings
          if(this.statusFilter != 'All') {
            if(this.statusFilter == 'Completed') {
              this.records = user_bookings?.filter(ub => {
                return ub.status == 1
              })
            } else if(this.statusFilter == 'Cancelled') {
              this.records = user_bookings?.filter(ub => {
                return ub.cancelled
              })
            } else if(this.statusFilter == 'Upcoming') {
              this.records = user_bookings?.filter(book => {
                return book?.status != 1 && !book?.cancelled && moment(moment(book?.booking_date + ' ' + book?.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isSameOrAfter(moment().format('YYYY-MM-DD HH:mm:ss'))
              })
            } else if(this.statusFilter == 'Action required') {
              this.records = user_bookings?.filter(book => {
                return (book?.status != 1 && !book?.cancelled && moment(moment(book?.booking_date + ' ' + book?.booking_end_time).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))) ||
                  (book?.status == 1 && book?.transfer_status == 0 && (this.superAdmin || this.isTutorUser))
              })
            } 
          } else {
            if(this.bookingId) {
              this.records = user_bookings?.filter(ub => {
                return ub.id != this.bookingId
              })
            } else {
              this.records = user_bookings
            }
          }
          
          this.mapHistory(this.records)
        });
      }
    }
    
    mapHistory(records) {
      if(this.mode == 'notes') {
        this.records = records.map((record) => {
          return {
              date_display: moment(record?.date).format('DD/MM/YYYY h:mm A'),
              ...record,
          };
        })
      } else if(this.mode == 'history') {
        this.records = records.map((record) => {
          return {
              date_display: moment(record?.date).format('DD/MM/YYYY'),
              booking_date_display: `${moment(record?.booking_date).format('DD/MM/YYYY')} ${this.getTime(record?.booking_start_time)} - ${this.getTime(record?.booking_end_time)}`,
              ...record,
          };
        })
      }
  
      this.isLoading = false;
      this.refreshDataSource(this.records);
    }
    
    refreshDataSource(data) {
      this.dataSource = new MatTableDataSource(data);
      if (this.sort) {
        this.dataSource.sort = this.sort;
      } else {
        setTimeout(() => (this.dataSource.sort = this.sort));
      }
    }
    
    getTime(time) {
      let date = moment(new Date()).format('YYYY-MM-DD')
      let date_time = date + ' ' + time
      return moment(date_time).format('h:mm a').toUpperCase()
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }