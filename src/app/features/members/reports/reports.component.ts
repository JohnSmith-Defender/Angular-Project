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
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MembersService } from "@features/services/members/members.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { DateAdapter } from '@angular/material/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import moment from "moment";

@Component({
  selector: "app-members-reports",
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
  ],
  templateUrl: "./reports.component.html",
})
export class MembersReportsComponent {
    private destroy$ = new Subject<void>();

    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() userId: any;
    @Input() language: any;
    @Input() mode: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    searchZipText: any;
    placeholderZipText: any;
    allUsersData: any = [];
    usersData: any = [];
    searchKeyword: any;
    searchZipKeyword: any;
    dataSource: any;
    displayedColumns = [
        "name_display",
        "registration_date",
    ];
    pageSize: number = 10;
    pageIndex: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator:
        | MatPaginator
        | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    apiPath: string = environment.api + "/";
    eventTypes: any = [];
    selectedEventType: any = '';
    sectors: any = [];
    events: any = [];
    invitedBy: any = [];
    selectedEvent: any = '';
    selectedInvitedBy: any = '';
    postalCodes: any = [];
    selectedZipCode: any = '';
    selectedSector: any = '';
    selectedStartDate: any;
    selectedEndDate: any;
    dateRange = new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
    });
    minDate: any;
    maxDate: any;
    searchMode: string = '';
    hasQueryError: boolean = false;
    processingProgress: number = 0;
    isGeneratingReport: boolean = false;
    @ViewChild("modalbutton1", { static: false }) modalbutton1:
    | ElementRef
    | undefined;
    @ViewChild("closemodalbutton1", { static: false }) closemodalbutton1:
    | ElementRef
    | undefined;

    constructor(
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _membersService: MembersService,
        private _excelService: ExcelService,
        private dateAdapter: DateAdapter<Date>,
    ) {}

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

        this.displayedColumns = [
            "name_display",
            "registration_date",
            "event",
            "event_date",
            "event_type",
            "invited_by",
            "email_display",
            "phone",
            "zip_code",
            "sector"
        ]

        if(this.mode == 'guests') {
            this.dateAdapter.setLocale('es-ES');
            this.initializeDate();
        }
        this.initializeSearch();
        this.initializePage();
    }

    initializeDate() {
        this.selectedStartDate = moment().startOf('month').format("YYYY-MM-DD");
        this.selectedEndDate = moment().format("YYYY-MM-DD");
        // this.maxDate = moment().format("YYYY-MM-DD");
        this.dateRange = new FormGroup({
          start: new FormControl(this.selectedStartDate),
          end: new FormControl( this.selectedEndDate)
        });
      }

    initializePage() {
        if(this.mode == 'guests') {
            this.fetchGuestsReportData();
        } else if(this.mode == 'members') {
            this.fetchMembersReportData();
        }
    }

    fetchGuestsReportData() {
        if(this.isGeneratingReport) {
            this.processingProgress = 30;
        }

        this._membersService
        .fetchGuestsReport(this.company?.id, this.selectedStartDate, this.selectedEndDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
            (data) => {
                if(this.isGeneratingReport) {
                    this.processingProgress = 60;
                }
                this.formatUsers(data || []);
                if(this.isGeneratingReport) {
                    this.processingProgress = 90;
                    this.isGeneratingReport = false;
                    setTimeout(() => {
                        this.closemodalbutton1?.nativeElement.click();
                    }, 500)
                }
            },
            (error) => {
                console.log(error);
            }
        );
    }

    fetchMembersReportData() {
        if(this.isGeneratingReport) {
            this.processingProgress = 30;
        }

        this._membersService
            .fetchMembersReport(this.company?.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (data) => {
                    if(this.isGeneratingReport) {
                        this.processingProgress = 60;
                    }
                    this.sectors = data?.sectors;
                    this.formatMembers(data || []);
                    if(this.isGeneratingReport) {
                        this.processingProgress = 90;
                        this.isGeneratingReport = false;
                        setTimeout(() => {
                            this.closemodalbutton1?.nativeElement.click();
                        }, 500)
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    formatMembers(result) {
        this.mapSectors();
        let data = [];
        let users = result.members;

        if (users?.length > 0) {
            data = users?.map((user) => {
                if(user.zip_code) {
                    let zip_code_match = this.postalCodes?.some((a) => a.zip_code == user.zip_code);
                    if(!zip_code_match) {
                        this.postalCodes?.push({
                            zip_code: user.zip_code
                        })
                    }
                }

                return {
                    event: user.title,
                    name_display: user.first_name ? `${user.first_name} ${user.last_name}` : user.name,
                    email_display: user.email,
                    registration_date: user.created,
                    event_date: user.plan_date,
                    event_type: user.type_es,
                    ...user,
                };
            });
        }

        if(this.postalCodes?.length > 0) {
            this.postalCodes?.sort(function (a, b) {
              if (a.zip_code < b.zip_code) {
                return -1;
              }
              if (a.zip_code > b.zip_code) {
                return 1;
              }
              return 0;
            });
        }

        if (this.allUsersData?.length == 0) {
            this.allUsersData = data;
        }

        if (data?.length > 0) {
            data = data.sort((a, b) => {
                const oldDate: any = new Date(a['registration_date']);
                const newDate: any = new Date(b['registration_date']);
                return newDate - oldDate;
            });
        }

        this.loadUsers(data);
    }

    mapSectors() {
        this.sectors = this.sectors?.map((sector) => {
            return {
                sector: sector.name,
                ...sector,
            };
        });

        if(this.sectors?.length > 0) {
            this.sectors?.sort(function (a, b) {
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
            });
        }
    }

    formatUsers(result) {
        let data = [];
        let users = result.guests;

        if (users?.length > 0) {
            users = users?.filter(u => {
                return u.name
            })
            data = users?.map((user) => {
                let timezoneOffset = new Date().getTimezoneOffset()
                let plan_date = (moment(user.event_date).utc().utcOffset(timezoneOffset).format("YYYY-MM-DD HH:mm").toString() + ":00Z").replace(" ", "T")

                if(user.type_es) {
                    let event_type_match = this.eventTypes?.some((a) => a.type == user.type_es);
                    if(!event_type_match) {
                        this.eventTypes?.push({
                            type: user.type_es
                        })
                    }
                }

                if(user.sector) {
                    let sector_match = this.sectors?.some((a) => a.sector == user.sector);
                    if(!sector_match) {
                        this.sectors?.push({
                            sector: user.sector
                        })
                    }
                }

                if(user.title) {
                    let title_match = this.events?.some((a) => a.title == user.title);
                    if(!title_match) {
                        this.events?.push({
                            title: user.title
                        })
                    }
                }

                if(user.invited_by) {
                    let invited_by_match = this.invitedBy?.some((a) => a.invited_by == user.invited_by);
                    if(!invited_by_match) {
                        this.invitedBy?.push({
                            invited_by: user.invited_by
                        })
                    }
                }

                if(user.zip_code) {
                    let zip_code_match = this.postalCodes?.some((a) => a.zip_code == user.zip_code);
                    if(!zip_code_match) {
                        this.postalCodes?.push({
                            zip_code: user.zip_code
                        })
                    }
                }

                return {
                    name_display: user.name,
                    email_display: user.email,
                    event: user.title,
                    event_date: plan_date,
                    event_type: user.type_es,
                    ...user,
                };
            });
        }

        if(this.eventTypes?.length > 0) {
            this.eventTypes?.sort(function (a, b) {
              if (a.type < b.type) {
                return -1;
              }
              if (a.type > b.type) {
                return 1;
              }
              return 0;
            });
        }

        if(this.sectors?.length > 0) {
            this.sectors?.sort(function (a, b) {
              if (a.sector < b.sector) {
                return -1;
              }
              if (a.sector > b.sector) {
                return 1;
              }
              return 0;
            });
        }

        if(this.events?.length > 0) {
            this.events?.sort(function (a, b) {
              if (a.title < b.title) {
                return -1;
              }
              if (a.title > b.title) {
                return 1;
              }
              return 0;
            });
        }

        if(this.invitedBy?.length > 0) {
            this.invitedBy?.sort(function (a, b) {
              if (a.invited_by < b.invited_by) {
                return -1;
              }
              if (a.invited_by > b.invited_by) {
                return 1;
              }
              return 0;
            });
        }

        if(this.postalCodes?.length > 0) {
            this.postalCodes?.sort(function (a, b) {
              if (a.zip_code < b.zip_code) {
                return -1;
              }
              if (a.zip_code > b.zip_code) {
                return 1;
              }
              return 0;
            });
        }

        if (this.allUsersData?.length == 0) {
            this.allUsersData = data;
        }

        if (data?.length > 0) {
            data = data.sort((a, b) => {
                const oldDate: any = new Date(a['registration_date']);
                const newDate: any = new Date(b['registration_date']);
                return newDate - oldDate;
            });
        }

        this.loadUsers(data);
    }

    loadUsers(data) {
        if(this.isGeneratingReport) {
            this.processingProgress = 30;
        }

        this.usersData = data;
        if (this.searchKeyword && this.usersData?.length > 0) {
            this.usersData = this.usersData.filter((user) => {
                return (
                    (user.name &&
                        user.name
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/\p{Diacritic}/gu, "")
                        .indexOf(
                            this.searchKeyword
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                        ) >= 0) ||
                    (user.phone && user.phone.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
                    (user.email && user.email.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0)
                );
            });
        }

        if (this.searchZipKeyword && this.usersData?.length > 0) {
            this.usersData = this.usersData.filter((user) => {
                return user.zip_code && user.zip_code.toLowerCase().indexOf(this.searchZipKeyword.toLowerCase()) >= 0;
            });
        }

        if(this.selectedEventType) {
            this.usersData = this.usersData.filter((user) => {
                return user.type_es == this.selectedEventType;
            });
        }

        if(this.selectedEvent) {
            this.usersData = this.usersData.filter((user) => {
                return user.title == this.selectedEvent;
            });
        }

        if(this.selectedInvitedBy) {
            this.usersData = this.usersData.filter((user) => {
                return user.invited_by == this.selectedInvitedBy;
            });
        }

        if(this.selectedZipCode) {
            this.usersData = this.usersData.filter((user) => {
                return user.zip_code == this.selectedZipCode;
            });
        }

        if(this.selectedSector) {
            this.usersData = this.usersData.filter((user) => {
                return user.sector == this.selectedSector;
            });
        }

        if(this.selectedStartDate && this.selectedEndDate) {
            this.usersData = this.usersData?.filter((user) => {
              let include = false
      
              let formatted_registration_date = moment(user?.registration_date)?.format('YYYY-MM-DD');
              if(
                moment(formatted_registration_date).isSameOrAfter(moment(this.selectedStartDate))
                && moment(formatted_registration_date).isSameOrBefore(moment(this.selectedEndDate))
               ) {
                include = true;
              }
      
              return include
            })
        }

        if(this.isGeneratingReport) {
            this.processingProgress = 60;
        }

        this.refreshTable(this.usersData);

        if(this.isGeneratingReport) {
            this.processingProgress = 90;
            this.isGeneratingReport = false;
            setTimeout(() => {
                this.closemodalbutton1?.nativeElement.click();
            }, 500)
        }
    }

    refreshTable(list) {
        this.dataSource = new MatTableDataSource(
            list.slice(
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
            new MatTableDataSource(list).paginator = this.paginator;
            if (this.pageIndex > 0) {
            } else {
                this.paginator.firstPage();
            }
        } else {
            setTimeout(() => {
                if (this.paginator) {
                    new MatTableDataSource(list).paginator = this.paginator;
                    if (this.pageIndex > 0) {
                        this.paginator.firstPage();
                    }
                }
            });
        }
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant("news.searchbykeyword");
        this.searchZipText = this._translateService.instant("your-admin-area.searchbypostalcode");
        this.placeholderZipText = this._translateService.instant("your-admin-area.searchbypostalcode");
    }

    downloadCSV() {
        let export_data: any = [];
        if(this.usersData?.length > 0) {
            if(this.mode == 'guests') {
                this.usersData?.forEach(row => {
                    export_data.push({
                        'Nombre': row.name_display,
                        'Fecha de Registro': moment(row.registration_date).format("YYYY-MM-DD"),
                        'Evento': row.event,
                        'Fecha del evento': moment(row.event_date).format("YYYY-MM-DD"),
                        'Tipo de evento': row.event_type,
                        'Invitado por': row.invited_by,
                        'Correo electrónico': row.email_display,
                        'Teléfono': row.phone,
                        'Código Postal': row.zip_code,
                        'Sector': row.sector,
                    });
                })
            } else if(this.mode == 'members') {
                this.usersData?.forEach(row => {
                    export_data.push({
                        'Nombre': row.name_display,
                        'Fecha de Registro': moment(row.registration_date).format("YYYY-MM-DD"),
                        'Correo electrónico': row.email_display,
                        'Teléfono': row.phone,
                        'Código Postal': row.zip_code,
                        'Sector': row.sector,
                    });
                })
            }
        }

        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
        this._excelService.exportAsExcelFile(
            export_data,
            "informes-" + moment().format("YYYYMMDDHHmmss")
        );
    }

    handleSearch(event) {
        this.searchKeyword = event;
        this.loadUsers(this.allUsersData);
    }

    handleZipSearch(event) {
        this.searchZipKeyword = event;
        this.loadUsers(this.allUsersData);
    }

    getPageDetails(event: any) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.dataSource = new MatTableDataSource(
            this.usersData.slice(
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

    changeEventTypeFilter(event) {
        this.loadUsers(this.allUsersData);
    }

    changeEventFilter(event) {
        this.loadUsers(this.allUsersData);
    }

    changeInvitedByFilter(event) {
        this.loadUsers(this.allUsersData);
    }

    changeZipCodeFilter(event) {
        this.loadUsers(this.allUsersData);
    }

    changeSectorFilter(event) {
        this.loadUsers(this.allUsersData);
    }

    handleDateChange(type, event) {
        if (type == "start") {
          if(moment(event?.value).isValid()) {
            this.selectedStartDate = moment(event.value).format("YYYY-MM-DD");
            // if(this.mode == 'guests') {
            //     this.maxDate = moment(this.selectedStartDate).endOf('month').format("YYYY-MM-DD");
            // }
          } else {
            this.selectedStartDate = '';
            // if(this.mode == 'guests') {
            //     this.maxDate = moment().format("YYYY-MM-DD");
            // }
          }
        }
        if (type == "end") {
          if(moment(event?.value).isValid()) {
            this.selectedEndDate = moment(event.value).format("YYYY-MM-DD");
          } else {
            this.selectedEndDate = '';
          }
        }
    
        // if(this.mode == 'guests') {
        //     if(this.selectedStartDate && this.selectedEndDate) {
        //         this.initializePage();
        //     }
        // } else {
        //     this.loadUsers(this.allUsersData);
        // }
    }

    generateReport() {
        this.isGeneratingReport = true;
        setTimeout(() => {
            initFlowbite();
            this.modalbutton1?.nativeElement.click();
            this.processingProgress = 15;

            if(this.mode == 'guests') {
                if(this.selectedStartDate && this.selectedEndDate) {
                    this.initializePage();
                }
            } else {
                this.loadUsers(this.allUsersData);
            }
        }, 500);
    }

    resetDate() {
        this.initializeDate();
        this.initializePage(); 
    }

    closeProcessingModal() {
        this.closemodalbutton1?.nativeElement.click();
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