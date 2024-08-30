import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { DateAdapter } from '@angular/material/core';
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
  ExcelService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { initFlowbite } from "flowbite";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-settings-submissions",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    SearchComponent,
    BreadcrumbComponent,
    PageTitleComponent,
    ToastComponent,
  ],
  templateUrl: "./submissions.component.html",
})
export class SubmissionsComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;

  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  searchText: any;
  placeholderText: any;
  userId: any;
  companyId: any;
  language: any;
  isloading: boolean = true;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  company: any;
  domain: any;
  mode: any;
  formSubmitted: boolean = false;
  locationForm = new FormGroup({
    location: new FormControl("", [Validators.required]),
    slug: new FormControl("", [Validators.required])
  });
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ["question_title", "created_at", "country", "whatsapp_community", "action"];
  selectedItem: any;
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  @ViewChild("modalbutton0", { static: false }) modalbutton0:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton0", { static: false }) closemodalbutton0:
    | ElementRef
    | undefined;
  searchKeyword: any;
  submissions: any = [];
  allSubmissions: any = [];
  selectedId: any;
  selectedItemId: any;
  questionAnswers: any = [];
  totalSubmissions: any;
  selectedStartDate: any;
  selectedEndDate: any;
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  minDate: any;
  maxDate: any;
  currentSubmissions: any;
  hasExportedError: boolean = false;
  processingProgress: number = 0;
  @ViewChild("modalbutton1", { static: false }) modalbutton1:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton1", { static: false }) closemodalbutton1:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private _location: Location,
    private dateAdapter: DateAdapter<Date>,
    private _excelService: ExcelService,
  ) {}

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslanguage) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
      this.company = company[0];
      this.companyId = company[0].id;
      this.domain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    initFlowbite();
    this.initializeBreadcrumb();
    this.initializeSearch();

    this.dateAdapter.setLocale('es-ES');
    this.initializeDate();

    this.initializePage();
  }

  initializePage() {
    this.getSubmissions();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.channels"
    );
    this.level3Title = "TikTok";
    this.level4Title = this._translateService.instant("your-admin-area.submissions");
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  initializeDate() {
    this.selectedStartDate = moment().startOf('month').format("YYYY-MM-DD");
    this.selectedEndDate = moment().format("YYYY-MM-DD");
    this.minDate = moment().startOf('year').format("YYYY-MM-DD");
    this.maxDate = moment().format("YYYY-MM-DD");
    this.dateRange = new FormGroup({
      start: new FormControl(this.selectedStartDate),
      end: new FormControl( this.selectedEndDate)
    });
  }

  async getSubmissions() {
    this._companyService
      .getSubmissions(this.companyId, this.userId, this.selectedStartDate, this.selectedEndDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.submissions = response.answers;
          this.allSubmissions = this.submissions;
          this.totalSubmissions = response.total_question_answers;
          this.currentSubmissions = response.current_question_answers;
          this.refreshTable(this.submissions);
          this.isloading = false;
        },
        (error) => {
          
        }
      );
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.submissions = this.filterSubmissions();
    this.refreshTable(this.submissions);
  }

  filterSubmissions() {
    let submissions = this.allSubmissions;
    if (submissions?.length > 0 && this.searchKeyword) {
      return submissions.filter((m) => {
        let include = false;
        if (
          (m.location &&
            m.location.toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0) ||
          (m.question_title &&
            m.question_title.toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0) ||
            (m.country &&
              m.country.toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
            (m.whatsapp_community &&
              m.whatsapp_community.toLowerCase()
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
    } else {
      return submissions;
    }
  }

  refreshTable(array) {
    this.dataSource = new MatTableDataSource(
      array.slice(
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
      new MatTableDataSource(array).paginator = this.paginator;
      if (this.pageIndex > 0) {
      } else {
        this.paginator.firstPage();
      }
    } else {
      setTimeout(() => {
        if (this.paginator) {
          new MatTableDataSource(array).paginator = this.paginator;
          if (this.pageIndex > 0) {
            this.paginator.firstPage();
          }
        }
      });
    }
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.submissions.slice(
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

  viewAnswer(item) {
    this.selectedId = item.id;
    this.selectedItem = item;
    this.getResponse();
  }

  getResponse() {
    this._companyService
      .getResponse(this.companyId, this.userId, this.selectedItem?.question_id, this.selectedItem?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.questionAnswers = response?.question_items || [];
          this.modalbutton0?.nativeElement.click();
        },
        (error) => {
          
        }
      );
  }

  getSubmissionDate(submission) {
    let date = moment
      .utc(submission?.created_at)
      .locale(this.language)
      .format("D MMM YYYY H:mm A");

    return date;
  }

  resetDate() {
    this.initializeDate();
    this.initializePage();
  }

  handleDateChange(type, event) {
    if (type == "start") {
      if(moment(event?.value).isValid()) {
        this.selectedStartDate = moment(event.value).format("YYYY-MM-DD");
        this.maxDate = moment(this.selectedStartDate).endOf('month').format("YYYY-MM-DD");
      } else {
        this.selectedStartDate = '';
        this.maxDate = moment().format("YYYY-MM-DD");
      }
    }
    if (type == "end") {
      if(moment(event?.value).isValid()) {
        this.selectedEndDate = moment(event.value).format("YYYY-MM-DD");
      } else {
        this.selectedEndDate = '';
      }
    }

    if(this.selectedStartDate && this.selectedEndDate) {
      this.initializePage();
    }
  }

  downloadCSV() {
    let export_data: any = [];
    if(this.submissions?.length > 0) {
      this.submissions?.forEach(row => {
        export_data.push({
          'Pregunta': row.question_title,
          'Fecha': moment(row.created_at).format("YYYY-MM-DD HH:mm:ss"),
          'País': row.country,
          'URL de la comunidad de WhatsApp': row.whatsapp_community,
        });
      })
    }

    this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    this._excelService.exportAsExcelFile(
      export_data,
      "tiktok-envios-" + moment().format("YYYYMMDDHHmmss")
    );
  }

  downloadCSVAll() {
    this.modalbutton1?.nativeElement.click();
    this.processingProgress = 25;
    this._companyService
      .getAllSubmissions(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          console.log(response)
          this.processingProgress = 60;
          let export_data: any = [];
          if(response.answers?.length > 0) {
            response.answers?.forEach(row => {
              export_data.push({
                'Pregunta': row.question_title,
                'Fecha': moment(row.registered_date).format("YYYY-MM-DD HH:mm:ss"),
                'Nombre': row.answer_first_name,
                'Apellido': row.answer_last_name,
                'Correo electrónico': row.answer_email,
                'Móvil': row.answer_mobile,
                'País': row.country,
                'URL de la comunidad de WhatsApp': row.whatsapp_community,
              });
            })
          }
          this._excelService.exportAsExcelFile(
            export_data,
            "tiktok-envios-todos-" + moment().format("YYYYMMDDHHmmss")
          );
          this.processingProgress = 100;
          setTimeout(() => {
            this.closemodalbutton1?.nativeElement.click();
            this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
          }, 500)
        },
        (error) => {
          this.hasExportedError = true;
        }
      );
  }

  closeProcessingModal() {
    this.closemodalbutton1?.nativeElement.click();
  }

  handleGoBack() {
    this._location.back();
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