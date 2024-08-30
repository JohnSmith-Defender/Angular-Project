import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
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
import { CompanyService, ExcelService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { SearchComponent } from "@share/components/search/search.component";
import { TutorsService } from "@features/services";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NoAccessComponent, ToastComponent } from "@share/components";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import moment from "moment";
import { searchSpecialCase } from "src/app/utils/search/helper";
import Fuse from 'fuse.js';
import { environment } from "@env/environment";

@Component({
  selector: "app-commissions-admin-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    SearchComponent,
    ToastComponent,
    NoAccessComponent,
  ],
  templateUrl: "./commissions-admin-list.component.html",
})
export class CommissionsAdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;
  @Input() company: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() canCreateJobOffer: any;
  @Input() commissionsTitle: any;
  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() status: any;
  @Input() language: any;
  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  allCommissionsData: any = [];
  commissionsData: any = [];
  searchKeyword: any;
  dataSource: any;
  displayedColumns = [
    "checked",
    "date",
    "student_name",
    "tutor_name",
    "course_title",
    "commission",
    "action"
  ];
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  selected: any = [];
  selectedBulkAction: any = '';
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: string = "";
  confirmDeleteItemDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  isProcessing: boolean = false;
  courses: any = [];
  selectedCourse: any = '';
  selectedDateFilter: any;
  selectedStartDate: any;
  selectedEndDate: any;
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  actionMode: string = '';
  companyId: number = 0;
  stripeTransfers: any = [];
  tutors: any = [];
  selectedTutor: any = '';
  idempotencyKey: any = '';
  bookingDataSource: any = [];
  displayedBookingColumns = [
    "booking_id",
    "status"
  ];
  processingProgress: number = 0;
  @ViewChild("modalbutton", { static: false }) modalbutton:
  | ElementRef
  | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
  | ElementRef
  | undefined;
  @ViewChild("processingmodalbutton", { static: false }) processingmodalbutton:
  | ElementRef
  | undefined;
  @ViewChild("closeprocessingmodalbutton", { static: false }) closeprocessingmodalbutton:
  | ElementRef
  | undefined;

  searchOptions = {
    keys: [{
      name: 'normalized_student_name',
      weight: 0.2
    }, {
      name: 'normalized_tutor_name',
      weight: 0.2
    }, {
      name: 'course_title',
      weight: 0.2
    }, {
      name: 'account_id',
      weight: 0.2
    }, {
      name: 'commission_transfer_id',
      weight: 0.2
    }]
  };
  statusList: any = [];
  selectedStatus: any = '';
  transferError: boolean = false;
  transferErrorType: any = '';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService,
    private _excelService: ExcelService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnChanges(changes: SimpleChange) {
    let statusChange = changes["status"];
    if (statusChange?.previousValue != statusChange?.currentValue) {
      this.status = statusChange.currentValue;
      this.loadCommissions(this.allCommissionsData);
    }
  }

  async ngOnInit() {
    this.onResize();
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.language = this._localService.getLocalStorage(environment.lslang);

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
    if(this.superAdmin) {
      this.fetchCommissions();
      this.initializeSearch();
    }
    this.idempotencyKey = this.generateGuid();
    if(this.companyId == 52){
      this.displayedColumns = [
        "checked",
        "booking_id",
        "date",
        "student_name",
        "tutor_name",
        "course_title",
        "commission",
        "action"
      ];
    }
    this.statusList = [
      { value: this._translateService.instant('tutors.charged') },
      { value: this._translateService.instant('tutors.moneyonthewaystatus') }
    ]
  }

  fetchCommissions(mode: any = '', status: any = '') {
    this._tutorsService
      .getCombinedCommissionsPrefetch(this.company?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
          data => {
            let commissions =  data[0] ? data[0]['commissions'] : [];
            this.stripeTransfers = data[1] ? data[1]['stripe_transfers'] : [];
            this.formatCommissions(commissions)
          },
          error => {
              console.log(error);
          }
      )
  }

  formatCommissions(commissions) {
    let data;
    if (commissions?.length > 0) {
      data = commissions?.map((commission) => {
        let match = this.courses?.some(
          (a) => a.course_title == commission.course_title
        );
        if(!match) {
          this.courses.push({
            course_title: commission?.course_title,
            value: commission?.course_title
          })
        }

        let tutor_name = commission?.tutor_name || (`${commission?.tutor_first_name} ${commission?.tutor_last_name}`)
        let tutor_match = this.tutors?.some(
          (a) => a.tutor_name == tutor_name
        );
        if(!tutor_match) {
          this.tutors.push({
            tutor_name: tutor_name,
          })
        }

        let transfer_date = commission?.commission_transfer_id ? this.getTransferDate(commission) : '';
        let student_name = commission?.student_name || (`${commission?.student_first_name} ${commission?.student_last_name}`)
        let transferred = transfer_date ? (moment(transfer_date).isBefore(moment().format('YYYY-MM-DD')) ? true : false) : false

        return {
          ...commission,
          student_name,
          tutor_name,
          normalized_tutor_name: this.normalizeCase(tutor_name?.toLowerCase()),
          normalized_student_name: this.normalizeCase(student_name?.toLowerCase()),
          date: moment(commission.booking_date).locale(this.language || 'es').format('DD MMM YYYY'),
          commission_display: `€ ${commission.commission_per_hour}`,
          transfer_date,
          transferred,
          checked: false,
          transfer_status: transferred ? this._translateService.instant('tutors.charged') : (this._translateService.instant('tutors.moneyontheway') + ' ' + (moment(transfer_date).format('DD/MM/YYYY'))),
        };
      });
    }
    if (this.allCommissionsData?.length == 0) {
      this.allCommissionsData = data;
    }

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
    this.loadCommissions(data);
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

  loadCommissions(data) {
    if(this.status == 'Completed') {
      this.displayedColumns = [
        "booking_id",
        "date",
        "student_name",
        "tutor_name",
        "course_title",
        "commission",
        "commission_transfer_id",
        "action"
      ];
    } else {
      this.displayedColumns = [
        "checked",
        "booking_id",
        "date",
        "student_name",
        "tutor_name",
        "course_title",
        "commission",
        "action"
      ];
    }
    let commissions = data;

    commissions = commissions?.filter((commission) => {
      let include = false
      if(this.status == "Completed" && commission.commission_transfer_id) {
        include = true
      }

      if(this.status != "Completed" && !commission?.commission_transfer_id) {
        include = true
      }

      return include;
    });

    if (this.searchKeyword) {
      commissions = this.filterSearchKeyword(commissions);
      let fuse = new Fuse(commissions, this.searchOptions);
      let filtered_search = fuse.search(this.normalizeCase(this.searchKeyword));
      commissions = []
      filtered_search?.forEach(item => {
        commissions.push(item?.item)
      })
    }

    if(this.selectedCourse) {
      commissions = commissions?.filter((commission) => {
        return commission?.course_title == this.selectedCourse
      })
    }

    if(this.selectedTutor) {
      commissions = commissions?.filter((commission) => {
        return commission?.tutor_name == this.selectedTutor
      })
    }

    if(this.selectedStatus) {
      commissions = commissions?.filter((commission) => {
        return commission?.transfer_status?.indexOf(this.selectedStatus) >= 0
      })
    }

    if(this.selectedStartDate && this.selectedEndDate) {
      commissions = commissions?.filter((commission) => {
        let include = false

        let formatted_booking_date = moment(commission?.booking_date)?.format('YYYY-MM-DD');
        if(
          moment(formatted_booking_date).isSameOrAfter(moment(this.selectedStartDate))
          && moment(formatted_booking_date).isSameOrBefore(moment(this.selectedEndDate))
         ) {
          include = true;
        }

        return include
      })
    }

    this.commissionsData = commissions;
    this.refreshTable(this.commissionsData);
  }

  filterSearchKeyword(commissions) {
    if (commissions?.length > 0) {
      return commissions?.filter((commission) => {
        let include = false;
       if(
        (commission?.course_title && (commission?.course_title?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0 
        || searchSpecialCase(this.searchKeyword,commission.course_title)
        ) ||
        (commission?.student_first_name && (commission?.student_first_name?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0 
        || searchSpecialCase(this.searchKeyword,commission.student_first_name)
        ) || 
        (commission?.student_last_name && (commission?.student_last_name?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0 
        || searchSpecialCase(this.searchKeyword,commission.student_last_name)
        ) ||
        (commission?.student_name && (commission?.student_name?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0 
        || searchSpecialCase(this.searchKeyword,commission.student_name)
        ) ||
        (commission?.student_email && (commission?.student_email?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0) ||
        (commission?.tutor_first_name && (commission?.tutor_first_name?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0 
        || searchSpecialCase(this.searchKeyword,commission.tutor_first_name)
        ) ||
        (commission?.tutor_last_name && (commission?.tutor_last_name?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0 
        || searchSpecialCase(this.searchKeyword,commission.tutor_last_name)
        ) ||
        (commission?.tutor_name && (commission?.tutor_name?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0 
        || searchSpecialCase(this.searchKeyword,commission.tutor_name)
        ) ||
        (commission?.tutor_email && (commission?.tutor_email?.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(this.searchKeyword?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0) ||
        (commission?.booking_id && (commission?.booking_id?.toLowerCase()).indexOf(this.searchKeyword?.toLowerCase()) >= 0) ||
        (commission?.account_id && (commission?.account_id?.toLowerCase()).indexOf(this.searchKeyword?.toLowerCase()) >= 0) ||
        (commission?.commission_transfer_id && (commission?.commission_transfer_id?.toLowerCase()).indexOf(this.searchKeyword?.toLowerCase()) >= 0)
       ) {
        include = true;
       }
        return include;
      });
    }
  }

  refreshTable(list) {
    this.dataSource = new MatTableDataSource(list);
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort));
    }
  }

  getTransferDate(commission) {
    let transfer_date = ''

    let stripe_transfer = this.stripeTransfers?.find((f) => f?.source?.id == commission.commission_transfer_id);
      if(stripe_transfer?.available_on) {
          transfer_date = moment.unix(stripe_transfer?.available_on).format("YYYY-MM-DD")
      }

    return transfer_date
}

  changeCourseFilter(event) {
    this.loadCommissions(this.allCommissionsData);
  }

  changeTutorFilter(event) {
    this.loadCommissions(this.allCommissionsData);
  }

  changeStatusFilter(event) {
    this.loadCommissions(this.allCommissionsData);
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  handleCreateRoute() {
    this._router.navigate([`/employmentchannel/create`]);
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.loadCommissions(this.allCommissionsData);
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

    this.loadCommissions(this.allCommissionsData);
  }

  onUserSelected(event, user) {
    let selected = this.selected;
    if(event.target.checked) {
      selected.push(user);
      this.selected = [...selected]
    } else {
      if(selected.length >0) {
        selected = selected.filter(item => item.user_id != user.user_id)
        this.selected = [...selected]
      }
    }
  }

  onAllSelected(event) {
    let selected: any[] = []
    if(event.target.checked) {
      if(this.commissionsData?.length > 0) {
        this.commissionsData?.forEach(item => {
          item.checked = true;
          selected.push(item);
        });
      }
      this.selected = [...selected]
    } else {
      this.selected = [];
      this.commissionsData?.forEach(item => {
        item.checked = false;
      });
    }
    this.refreshTable(this.commissionsData);
  }

  bulkApply() {
    if(this.selectedBulkAction && this.selected?.length > 0) {
      this.showConfirmationModal = false;
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmtransfer"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmtransferitem"
      );
      this.acceptText = "OK";
      this.actionMode = 'bulk';
      setTimeout(() => (this.showConfirmationModal = true));
    } else {
      this.open(this._translateService.instant('dialog.pleaseselectanaction'), '');
    }
  }

  confirm() {
    if(this.actionMode == 'bulk') {
      this.proceedTransfer(true);
    } else if(this.actionMode == 'delete') {
      this.handleDeleteCommission(true);
    }
  }

  generateGuid() : string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  proceedTransfer(confirmed) {
    this. processingProgress = 8;
    this.isProcessing = true;
    this.showConfirmationModal = false;
    this.processingmodalbutton?.nativeElement.click();
    this.applyBulkAction(confirmed);
  }

  applyBulkAction(confirmed) {
    if(confirmed) {
      let params = {
        user_id: this.userId,
        booking_id: this.selected.map( (data) => { return data.booking_id }).join(),
        company_id: this.company?.id,
        action: this.selectedBulkAction,
        idempotency_key: this.idempotencyKey,
      }
      this._tutorsService.bulkTransferCommissionImproved(params).subscribe(
        response => {
          this.isProcessing = false;
          if(response?.activeTransferBoookingIds?.length > 0) {
            this.bookingDataSource = response.activeTransferBoookingIds.map(booking_id => {
              return {
                booking_id: booking_id,
                status: 'success'
              }
            })
          }

          const temp:any = [];
          if(response?.inactiveTransferBoookingIds?.length > 0) {
            response.inactiveTransferBoookingIds.forEach(booking_id => {
              let match = temp?.some(
                (a) => a.booking_id == booking_id
              );
              if(!match) {
                temp.push({
                  booking_id: booking_id,
                  status: 'failed'
                })
              }
            })
          }

          this.bookingDataSource = [...this.bookingDataSource, ...temp]

          let message = `Bulk transfer ${this.bookingDataSource?.length > 0 ? JSON.stringify(this.bookingDataSource) : ''}`
          this._companyService.logMessage(this.companyId, this.userId, message, 'log')

          this.closeprocessingmodalbutton?.nativeElement.click();

          if(this.bookingDataSource?.length > 0) {
            this.modalbutton?.nativeElement.click();
          } else {
            setTimeout(() => {
              location.reload();
            }, 500);
          }
        },
        error => {
          this.transferError = true;
          console.log(error);
          let message = `Error in Bulk transfer ${JSON.stringify(error)}`;
          this._companyService.logMessage(this.companyId, this.userId, message, 'error');
          if(error?.status == 429) {
            this.transferErrorType = 'Too Many Requests'; 
          }
        }
      )
    }
  }

  deleteCommission(row) {
    this.showConfirmationModal = false;
    
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );

    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteitem"
    );

    this.acceptText = "OK";
    this.selectedItem = row;
    this.actionMode = 'delete';
    setTimeout(() => (this.showConfirmationModal = true));
  }

  handleDeleteCommission(confirmed) {
    if(confirmed) {
      this.showConfirmationModal = false;
      this._tutorsService.deleteCommission(this.selectedItem?.id).subscribe(
        response => {
          this.commissionsData.forEach((cat, index) => {
            if (cat.id == this.selectedItem?.id) {
              this.commissionsData.splice(index, 1);
            }
          });
          this.allCommissionsData.forEach((cat, index) => {
            if (cat.id == this.selectedItem?.id) {
              this.allCommissionsData.splice(index, 1);
            }
          });
          this.selectedItem = '';
          this.actionMode = '';
          this.refreshTable(this.commissionsData)
          this.open(`${this._translateService.instant('dialog.deletedsuccessfully')}`, '');
        },
        error => {
            console.log(error);
        }
      )
    }
  }

  downloadExcel() {
    let event_data: any[] = [];
    if(this.commissionsData?.length > 0){
      this.commissionsData?.forEach(booking => {
          let row: any

          if(this.status == 'Completed') {
            let status = booking?.transferred ? this._translateService.instant('tutors.charged') : (this._translateService.instant('tutors.moneyontheway') + ' ' + moment(row?.transfer_date).format('DD/MM/YYYY'))
            row = {
              'Fecha para registrarse': booking.booking_date,
              'Alumno': booking.student_name,
              'Tutor': booking.tutor_name,
              'Curso': booking.course_title,
              'Comisión': booking.commission,
              'ID de transferencia': booking?.commission_transfer_id,
              'Estado': status?.replace('<br/>', '')
            }
          } else {
            row = {
              'Fecha para registrarse': booking.booking_date,
              'Alumno': booking.student_name,
              'Tutor': booking.tutor_name,
              'Curso': booking.course_title,
              'Comisión': booking.commission,
            }
          }

          event_data.push(row);
      });

      let filename = this.status == "Completed" ? ('paid_commission_' + this.getTimestamp()) : ('pending_commission' + this.getTimestamp());
      this._excelService.exportAsExcelFile(event_data, filename);

      this.open(this._translateService.instant("dialog.filedownloaded"), "");
    }
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  closeTransfersSummaryDialog() {
    setTimeout(() => {
      location.reload();
    }, 300);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}