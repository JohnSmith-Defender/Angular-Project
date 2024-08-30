import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, HostListener, Input, SimpleChange, ViewChild } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { environment } from '@env/environment';
import moment from "moment";

@Component({
    selector: 'app-credits-admin-list',
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        SearchComponent,
        IconFilterComponent,
        NgOptimizedImage
    ],
    templateUrl: './credits-admin-list.component.html',
})
export class CreditsAdminListComponent {
    private destroy$ = new Subject<void>();

    @Input() list: any;
    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() userId: any;
    @Input() superAdmin: any;
    @Input() language: any;
    @Input() isUESchoolOfLife: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    creditsData: any = [];
    dataSource: any;
    displayedColumns = ["user_name", "event", "credits", "date_display"];
    pageSize: number = 10;
    pageIndex: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    planParticipants: any = [];
    searchKeyword: any;
    date: Date = new Date();
    allCreditsData: any[] = [];
    selectedCity: any;
    allPlanDrafts: any = [];
    @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
    @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

    activateAutomatedEmail: boolean = false;
    sendEveryNumber: number = 1;
    sendEverySchedule: string = '';
    schedules: any = [];
    days: any = false;
    activateIncludeAttachment: boolean = false;
    selectedDay: any;
    selectedDays: any = [];
    companyId: any;
    emailRecipients: any = '';
    sending: boolean = false;

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
      this.language = this._localService.getLocalStorage(environment.lslanguage) || "es";
      this.userId = this._localService.getLocalStorage(environment.lsuserId);
      this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
      this._translateService.use(this.language || "es");

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
      if(this.company?.id == 32) {
        this.displayedColumns = ["active_enrollment", "expediente", "activity_code_sigeca", "user_name", "event", "credits", "date_display", "city"];
      } else {
        this.displayedColumns = ["user_name", "event", "credits", "date_display"];
      }
      this.schedules = [
        {
          value: 'days',
          text: this.sendEveryNumber <= 1 ? this._translateService.instant('credits.day') : this._translateService.instant('credits.days')
        },
        {
          value: 'weeks',
          text: this.sendEveryNumber <= 1 ? this._translateService.instant('credits.week') : this._translateService.instant('credits.weeks')
        },
        {
          value: 'months',
          text: this.sendEveryNumber <= 1 ? this._translateService.instant('credits.month') : this._translateService.instant('credits.months')
        },
        {
          value: 'years',
          text: this.sendEveryNumber <= 1 ? this._translateService.instant('credits.year') : this._translateService.instant('credits.years')
        }
      ]
      this.days = [
        {
          value: 'monday',
          text: moment().locale(this.language).startOf('isoWeek').day(1).format('dddd').substring(0,1).toUpperCase()
        },
        {
          value: 'tuesday',
          text: moment().locale(this.language).startOf('isoWeek').day(2).format('dddd').substring(0,1).toUpperCase()
        },
        {
          value: 'wednesday',
          text: moment().locale(this.language).startOf('isoWeek').day(3).format('dddd').substring(0,1).toUpperCase()
        },
        {
          value: 'thursday',
          text: moment().locale(this.language).startOf('isoWeek').day(4).format('dddd').substring(0,1).toUpperCase()
        },
        {
          value: 'friday',
          text: moment().locale(this.language).startOf('isoWeek').day(5).format('dddd').substring(0,1).toUpperCase()
        },
        {
          value: 'saturday',
          text: moment().locale(this.language).startOf('isoWeek').day(6).format('dddd').substring(0,1).toUpperCase()
        },
        {
          value: 'sunday',
          text: moment().locale(this.language).startOf('isoWeek').day(0).format('dddd').substring(0,1).toUpperCase()
        },
      ]
      this.fetchCreditsSettings();
      this.fetchCreditsData();
      this.initializeSearch();
    }

    fetchCreditsSettings() {
      this._companyService
        .getCreditsSettings(this.company?.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.formatCreditsSettings(data?.credits_settings);
          },
          (error) => {
            console.log(error);
          }
        );
    }

    fetchCreditsData() {
      this._plansService
        .fetchCreditsData(this.company?.id, this.isUESchoolOfLife)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            console.log(data)
            this.formatCredits(data?.credits);
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

    handleSearch(event) {
      this.searchKeyword = event;
      this.loadCredits(this.allCreditsData);
    }

    formatCreditsSettings(settings) {
      if(settings) {
        this.activateAutomatedEmail = settings?.automated_email_sending == 1 ? true : false;
        this.sendEveryNumber = settings?.frequency;
        this.sendEverySchedule = settings?.schedule;
        this.activateIncludeAttachment = settings?.attachment == 1 ? true : false;
        this.emailRecipients = settings?.recipients
        if(this.days?.length > 0) {
          let row = this.days?.filter(dy => {
            return dy.value == settings?.schedule_day
          })
          if(row?.length > 0) {
            this.selectedDay =  row[0];
          }
        }
      }
    }

    formatCredits(credits) {
      let data;
      if (credits?.length > 0) {
        data = credits?.map((item) => {
          let name = item?.first_name ? `${item?.last_name}, ${item?.first_name}` : (item?.name || item?.email);
  
          return {
            ...item,
            expediente: item?.employee_id,
            user_name: name,
            active_enrollment: item?.num_matricula,
            active_enrollment_array: item?.num_matricula?.indexOf(',') >= 0 ? item?.num_matricula?.split(',') : [],
            event: this.getEventTitle(item),
            type: item?.course_id > 0 ? this._translateService.instant('course-create.course') : this._translateService.instant('plans.activity'),
            date_display: moment.utc(item.created_at).locale(this.language).format('DD-MM-YYYY')
          };
        });
      }
      if (this.allCreditsData?.length == 0) {
        this.allCreditsData = data;
      }
  
      if (data?.length > 0) {
        data = data.sort((a, b) => {
          const oldDate: any = new Date(a.created_at);
          const newDate: any = new Date(b.created_at);
          return newDate - oldDate;
        });
      }
  
      this.loadCredits(data);
    }

    getEventTitle(event) {
      return this.language == "en"
        ? (event.title_en && event.title_en != 'undefined')
          ? event.title_en || event.title
          : event.title
        : this.language == "fr"
        ? event.title_fr
          ? event.title_fr || event.title
          : event.title
        : this.language == "eu"
        ? event.title_eu
          ? event.title_eu || event.title
          : event.title
        : this.language == "ca"
        ? event.title_ca
          ? event.title_ca || event.title
          : event.title
        : this.language == "de"
        ? event.title_de
          ? event.title_de || event.title
          : event.title
        : event.title;
    }

    loadCredits(data) {
      this.creditsData = this.allCreditsData;

      if(this.searchKeyword && this.creditsData) {
        this.creditsData = this.creditsData.filter(p => {
          return (p.name && p.name.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ) ||
            p.event && p.event.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 
        })
      }

      if(this.selectedCity) {
        this.creditsData = this.creditsData.filter(p => {
          return p.city && p.city.toLowerCase().indexOf(this.selectedCity.toLowerCase()) >= 0 
        })
      }

      this.refreshTable(this.creditsData);
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
        this.creditsData.slice(
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
      this.loadCredits(this.allCreditsData);
    }

    downloadExcel() {
      let credits_data: any[] = [];
      if(this.creditsData?.length > 0) {
        this.creditsData.forEach(p => {
          let date_display = moment.utc(p?.created_at).locale(this.language).format('DD-MM-YYYY')
          if(this.companyId == 32) {
            credits_data.push({
              'Num. Matrícula activa': p.active_enrollment,
              'Expediente': p.employee_id,
              'Código actividad SIGECA': p.activity_code_sigeca,
              'Apellidos y nombre': p.user_name,
              'Actividad': p.event,
              'Fecha': date_display,
              'Créditos': p.credits,
              'Campus': p.city,
            })
          } else {
            credits_data.push({
              'Apellidos y nombre': p.name,
              'Actividad': p.event,
              'Fecha': date_display,
              'Créditos': p.credits,
            })
          }
        });
      }
    
      this._excelService.exportAsExcelFile(credits_data, 'creditos-' +  moment().format('YYYYMMDDHHmmss'));
      this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    }

    openSettings() {
      this.modalbutton?.nativeElement.click();
    }

    getSelectedSchedule() {
      let text = '';
      if(this.sendEverySchedule) {
        let sched = this.schedules?.filter(sc => {
          return sc.value == this.sendEverySchedule
        })
        if(sched?.length > 0) {
          text = sched[0].text;
        }
      }

      return text;
    }

    selectDay(day) {
      if(this.sendEveryNumber == 1) {
        this.selectedDay = day;
      } else if(this.sendEveryNumber > 1) {
        let match = this.selectedDays?.some(
          (a) => a.value == day?.value
        );
        if(!match) {
          this.selectedDays?.push(day);
        }
      }
    }

    saveCreditsSettings() {
      let params = {
        company_id: this.companyId,
        automated_email_sending: this.activateAutomatedEmail,
        frequency: this.sendEveryNumber || null,
        schedule: this.sendEverySchedule || '',
        schedule_day: this.selectedDay?.value || '',
        attachment: this.activateIncludeAttachment,
        recipients: this.emailRecipients || '',
      };

      this._companyService.editCreditsSettings(params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.closemodalbutton?.nativeElement.click();
        },
        (error) => {
          console.log(error);
        }
      );
    }

    sendCredits() {
      this.sending = true;
      let params = {
        id: this.companyId,
        school_of_life: this.isUESchoolOfLife,
      };

      this._plansService.sendCreditsData(params).subscribe(
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
    }

    ngOnDestroy() {
      this.languageChangeSubscription?.unsubscribe();
      this.destroy$.next();
      this.destroy$.complete();
    }
}