import { CommonModule, Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { Subject, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, ExcelService, LocalService } from "@share/services";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { NgApexchartsModule } from "ng-apexcharts";
import { environment } from "@env/environment";
import { ButtonGroupComponent } from "../button-group/button-group.component";
import { LineChartComponent } from "../line-chart/line-chart.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { PageTitleComponent } from "../page-title/page-title.component";
import { initFlowbite } from "flowbite";
import moment from "moment";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatSnackBarModule,
    NgApexchartsModule,
    BreadcrumbComponent,
    ButtonGroupComponent,
    LineChartComponent,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    PageTitleComponent,
  ],
  templateUrl: "./reports.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() companyId: any;
  @Input() domain: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() language: any;

  isLoadingReport: boolean = true;
  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  search: any;
  reportTypes: any = [];
  reportType: any;
  subReportTypes: any = [];
  subReportTypeList: any = [];
  subReportType: any;
  subReportTypeSelected: any;
  subSubReportTypes: any = [];
  subSubReportTypeList: any = [];
  subSubReportType: any;
  reportTitle: any;
  reportData: any = [];
  reloadChart: boolean = false;
  showTeamsSettingsModal: boolean = false;
  clientId: any;
  clientSecret: any;
  tenantId: any;
  features: any = [];
  plansTitle: any;
  clubsTitle: any;
  jobOffersTitle: any;
  text: any;
  selectedDateFilter: any;
  selectedStartDate: any;
  selectedEndDate: any;
  selectedDatePeriodFilter: any = "D30";
  filterYear: any = "";
  filterCity: any = "";
  filterTitle: any = "";
  cities: any = [];
  majors: any = [];
  locale: any;
  reportsData: any = [];
  childNotifier: Subject<boolean> = new Subject<boolean>();
  plansFeature: any;
  plansFeatureId: any;
  clubsFeature: any;
  clubsFeatureId: any;
  jobOffersFeature: any;
  jobOffersFeatureId: any;
  superAdmin: boolean = false;
  user: any;
  buttonList: any = [];
  subButtonList: any = [];
  subSubButtonList: any = [];
  settings: any;
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;

  constructor(
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _excelService: ExcelService,
    private _location: Location,
    private _snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    localStorage.removeItem("report-type");

    moment.locale(this.language);
    this.locale = {
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek(),
      format: "DD-MM-YYYY",
    };
    this.selectedStartDate = moment().subtract(1, "year").startOf("year");
    this.selectedEndDate = moment().endOf("year");
    this.selectedDateFilter = {
      start: this.selectedStartDate,
      end: this.selectedEndDate,
    };

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    setTimeout(() => {
      initFlowbite();
    }, 100);

    this.fetchReportsData();
  }

  fetchReportsData() {
    this._companyService
      .fetchReportsData(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.reportsData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    this.initializeBreadcrumb();
    let data = this.reportsData;
    this.mapFeatures(data?.features_mapping);
    this.mapUserPermissions(data?.user_permissions);
    this.user = data?.user;
    this.cities = data?.cities;
    this.settings = data?.teams_settings;
    this.loadReportTypes();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant("company-settings.tools");
    this.level3Title = this._translateService.instant(
      "company-settings.reports"
    );
    this.level4Title = "";
    this.cd.detectChanges();
  }

  mapFeatures(features) {
    this.plansFeature = features?.find(
      (f) => f.feature_id == 1 && f.status == 1
    );
    this.plansFeatureId = this.plansFeature?.feature_id;
    this.plansTitle = this.getFeatureTitle(this.plansFeature);

    this.clubsFeature = features?.find(
      (f) => f.feature_id == 5 && f.status == 1
    );
    this.clubsFeatureId = this.clubsFeature?.feature_id;
    this.clubsTitle = this.clubsFeature
      ? this.getFeatureTitle(this.clubsFeature)
      : "";

    this.jobOffersFeature = features?.find(
      (f) => f.feature_id == 18 && f.status == 1
    );
    this.jobOffersFeatureId = this.jobOffersFeature?.feature_id;
    this.jobOffersTitle = this.jobOffersFeature
      ? this.getFeatureTitle(this.jobOffersFeature)
      : "";
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
  }

  loadReportTypes() {
    this.initializeReportTypes();
    this.initializeButtonGroup();
    this.initializeSubreportTypes();
    this.loadSubReportTypes(this.reportType);
  }

  initializeReportTypes() {
    if (this.plansTitle) {
      this.reportTypes.push({
        id: 1,
        type: "workshops",
        text:
          this.companyId == 32
            ? this._translateService.instant("company-reports.workshops")
            : this.plansTitle,
        selected: true,
      });
    }

    if (this.clubsTitle) {
      this.reportTypes.push({
        id: 2,
        type: "clubs",
        text:
          this.companyId == 32
            ? this._translateService.instant("company-reports.clubs")
            : this.clubsTitle,
        selected: false,
      });
    }

    if (this.jobOffersTitle) {
      this.reportTypes.push({
        id: 3,
        type: "employmentchannel",
        text:
          this.jobOffersTitle ||
          this._translateService.instant("company-reports.employmentchannel"),
        selected: false,
      });
    }

    this.reportType =
      this.reportTypes && this.reportTypes[0] ? this.reportTypes[0] : "";
  }

  initializeButtonGroup() {
    this.buttonList = this.reportTypes;
    this.cd.detectChanges();
  }

  initializeSubreportTypes() {
    this.subReportTypes = [
      {
        id: 5,
        report_type_id: 1,
        type: "joined",
        text: this._translateService.instant("company-reports.nojoined"),
        selected: true,
      },
    ];

    if (this.companyId == 32) {
      this.subReportTypes.push({
        id: 6,
        report_type_id: 1,
        type: "attended",
        text: "Teams",
        selected: false,
      });
    }

    this.subReportTypes.push(
      {
        id: 7,
        report_type_id: 1,
        type: "clicks",
        text: this._translateService.instant("company-reports.noclicks"),
        selected: false,
      },
      {
        id: 8,
        report_type_id: 2,
        type: "clubs-joined",
        text: this._translateService.instant("company-reports.nojoined"),
        selected: false,
      },
      {
        id: 9,
        report_type_id: 2,
        type: "clubs-generated",
        text: this._translateService.instant(
          "company-reports.noclubsgenerated"
        ),
        selected: false,
      },
      {
        id: 0,
        report_type_id: 2,
        type: "joined-generated",
        text: this._translateService.instant(
          "company-reports.nojoinedgenerated"
        ),
        selected: false,
      },
      {
        id: 10,
        report_type_id: 3,
        type: "offers-joined",
        text: this._translateService.instant("company-reports.nojoined"),
        selected: false,
      },
      {
        id: 11,
        report_type_id: 3,
        type: "offer-clicks",
        text: this._translateService.instant("company-reports.noclicks"),
        selected: false,
      },
      {
        id: 12,
        report_type_id: 4,
        type: "cityagenda-clicks",
        text: this._translateService.instant("company-reports.noclicks"),
        selected: false,
      },
      {
        id: 17,
        report_type_id: 5,
        type: "mentors",
        text: this._translateService.instant("ambassadors.mentors"),
        selected: false,
      },
      {
        id: 18,
        report_type_id: 5,
        type: "mentees",
        text: this._translateService.instant("buddy.mentees"),
        selected: false,
      }
    );

    this.subSubReportTypes = [
      {
        id: 13,
        subreport_type_id: 6,
        type: "teams-attended",
        text: `${this._translateService.instant(
          "company-reports.noattended"
        )} (MS Graph)`,
        selected: true,
      },
      {
        id: 14,
        subreport_type_id: 6,
        type: "teams-audio-time",
        text: `${this._translateService.instant(
          "company-reports.audiotime"
        )} (MS Graph) hrs`,
        selected: false,
      },
      {
        id: 15,
        subreport_type_id: 6,
        type: "teams-video-time",
        text: `${this._translateService.instant(
          "company-reports.videotime"
        )} (MS Graph) hrs`,
        selected: false,
      },
      {
        id: 16,
        subreport_type_id: 6,
        type: "teams-clicks",
        text: `${this._translateService.instant(
          "company-reports.noclicks"
        )} (GA)`,
        selected: false,
      },
      {
        id: 19,
        subreport_type_id: 17,
        type: "mentor-mentee-associations",
        text: `${this._translateService.instant(
          "company-reports.nomentormentees"
        )}`,
        selected: false,
      },
      {
        id: 20,
        subreport_type_id: 17,
        type: "mentor-active-conversations",
        text: `${this._translateService.instant(
          "company-reports.noactiveconversations"
        )}`,
        selected: false,
      },
      {
        id: 21,
        subreport_type_id: 18,
        type: "mentee-mentor-associations",
        text: `${this._translateService.instant(
          "company-reports.nomenteementors"
        )}`,
        selected: false,
      },
      {
        id: 21,
        subreport_type_id: 18,
        type: "mentee-active-conversations",
        text: `${this._translateService.instant(
          "company-reports.noactiveconversations"
        )}`,
        selected: false,
      },
    ];
  }

  loadSubReportTypes(
    type,
    notify: boolean = false,
    change_date: boolean = false
  ) {
    if (!change_date) {
      this.subReportType = "";
    }
    if (type) {
      this.subReportTypeList =
        this.subReportTypes &&
        this.subReportTypes.filter((str) => {
          return str.report_type_id == type.id;
        });
      if (
        this.subReportTypeList &&
        this.subReportTypeList.length > 0 &&
        !change_date
      ) {
        this.subReportType = this.subReportTypeList[0];
      }
      this.initializeSubButtonGroup();
    }

    if (this.subReportType) {
      this.loadSubSubReportTypes(this.subReportType, notify, change_date);
    } else {
      this.isLoadingReport = false;
      this.cd.detectChanges();
    }
  }

  initializeSubButtonGroup() {
    this.subButtonList = this.subReportTypeList?.map((sub, index) => {
      return {
        ...sub,
        selected: index == 0 ? true : false,
      };
    });

    this.cd.detectChanges();
  }

  loadSubSubReportTypes(
    type,
    notify: boolean = false,
    change_date: boolean = false
  ) {
    if (!change_date) {
      this.subSubReportType = "";
    }
    if (type) {
      this.subSubReportTypeList =
        this.subSubReportTypes &&
        this.subSubReportTypes.filter((str) => {
          return str.subreport_type_id == type.id;
        });
      if (
        this.subSubReportTypeList &&
        this.subSubReportTypeList.length > 0 &&
        !change_date
      ) {
        this.subSubReportType = this.subSubReportTypeList[0];
        localStorage.setItem("report-type", this.subSubReportType.type);
      }
      this.initializeSubSubButtonGroup();
    }

    if (this.subSubReportType) {
      if (this.subReportType.text == "Teams") {
        this.getTeamsSettings(false);
      }
      this.loadReport(this.subSubReportType, notify);
    } else {
      this.loadReport(type, notify);
    }
  }

  initializeSubSubButtonGroup() {
    this.subSubButtonList = this.subSubReportTypeList?.map((sub, index) => {
      return {
        ...sub,
        selected: index == 0 ? true : false,
      };
    });

    this.cd.detectChanges();
  }

  loadReport(subreport, notify: boolean = false) {
    if (subreport.type && subreport.type.indexOf("joined") >= 0) {
      this.text = this._translateService.instant(
        "company-reports.peoplejoined"
      );
    }

    if (subreport.type && subreport.type.indexOf("attended") >= 0) {
      this.text = this._translateService.instant(
        "company-reports.peopleattended"
      );
    }

    if (subreport.type && subreport.type.indexOf("click") >= 0) {
      this.text = this._translateService.instant("company-reports.clicks");
    }

    if (subreport.type && subreport.type.indexOf("clubs-generated") >= 0) {
      this.text = this._translateService.instant(
        "company-reports.generatedactivities"
      );
    }

    if (subreport.type && subreport.type.indexOf("joined-generated") >= 0) {
      this.text = this._translateService.instant(
        "company-reports.peoplejoinedclubactivities"
      );
    }

    if (subreport.type && subreport.type.indexOf("teams-attended") >= 0) {
      this.text = this._translateService.instant(
        "company-reports.meetingsattended"
      );
    }

    if (subreport.type && subreport.type.indexOf("teams-audio-time") >= 0) {
      this.text = this._translateService.instant("company-reports.audiohrs");
    }

    if (subreport.type && subreport.type.indexOf("teams-video-time") >= 0) {
      this.text = this._translateService.instant("company-reports.videohrs");
    }

    if (
      subreport.type &&
      subreport.type.indexOf("mentor-mentee-associations") >= 0
    ) {
      this.text = this._translateService.instant(
        "company-reports.mentormenteerelationships"
      );
    }

    if (
      subreport.type &&
      subreport.type.indexOf("mentee-mentor-associations") >= 0
    ) {
      this.text = this._translateService.instant(
        "company-reports.menteementorrelationships"
      );
    }

    if (
      (subreport.type &&
        subreport.type.indexOf("mentor-active-conversations") >= 0) ||
      (subreport.type &&
        subreport.type.indexOf("mentee-active-conversations") >= 0)
    ) {
      this.text = this._translateService.instant(
        "company-reports.conversations"
      );
    }

    this.getReportData(subreport.type, notify);
  }

  selectReport(type) {
    this.buttonList?.forEach((item) => {
      if (item.id == type.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    localStorage.removeItem("report-type");
    this.isLoadingReport = true;
    this.reportTitle = "";
    this.reportData = [];
    this.reportType = type;
    this.setDateFilters(type);
    this.loadSubReportTypes(this.reportType, true);
  }

  selectSubReport(type) {
    this.subButtonList?.forEach((item) => {
      if (item.id == type.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    localStorage.removeItem("report-type");
    this.isLoadingReport = true;
    this.reportTitle = "";
    this.reportData = [];
    this.subReportTypeSelected = type.text;
    this.subReportType = type;
    this.setDateFilters(type);
    this.loadSubSubReportTypes(this.subReportType, true);
  }

  setDateFilters(type) {
    if (
      type.type == "cityagenda" ||
      type.type == "clicks" ||
      type.type == "offer-clicks" ||
      type.type == "cityagenda-clicks" ||
      type.type == "teams-clicks"
    ) {
      this.selectedStartDate = moment().subtract(14, "days");
      this.selectedEndDate = moment();
      this.selectedDateFilter = {
        start: this.selectedStartDate,
        end: this.selectedEndDate,
      };
    }
  }

  selectSubSubReport(type) {
    this.isLoadingReport = true;
    this.reportTitle = "";
    this.reportData = [];
    this.subSubReportType = type;
    localStorage.setItem("report-type", type.type);
    this.setDateFilters(type);
    this.loadReport(type, true);
  }

  getReportData(type, notify: boolean = false) {
    this._companyService
      .getReportData(
        this.companyId,
        type,
        this.selectedStartDate,
        this.selectedEndDate,
        this.selectedDatePeriodFilter,
        this.filterYear,
        this.filterCity,
        this.filterTitle
      )
      .subscribe(
        (response) => {
          this.refreshReport(response["data"], notify);
        },
        (error) => {
          console.log(error);
          this.isLoadingReport = false;
        }
      );
  }

  refreshReport(data, notify: boolean = false) {
    this.reportData = data;
    this.isLoadingReport = false;
    this.cd.detectChanges();
    if (notify) {
      this.notifyChild();
    }
  }

  notifyChild() {
    this.reloadChart = true;
    this.childNotifier.next(this.reloadChart);
  }

  getFeatureTitle(feature) {
    return feature
      ? this.language == "en"
        ? feature.name_en ||
          feature.feature_name ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "fr"
        ? feature.name_fr ||
          feature.feature_name_FR ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "eu"
        ? feature.name_eu ||
          feature.feature_name_EU ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "ca"
        ? feature.name_ca ||
          feature.feature_name_CA ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "de"
        ? feature.name_de ||
          feature.feature_name_DE ||
          feature.name_es ||
          feature.feature_name_ES
        : feature.name_es || feature.feature_name_ES
      : "";
  }

  changeCityFilter() {
    this.loadSubReportTypes(this.reportType, true, true);
  }

  changeTitleFilter() {
    this.loadSubReportTypes(this.reportType, true, true);
  }

  downloadCSV() {
    let url = "";
    let start_date = moment(this.selectedStartDate).format("YYYY-MM-DD");
    let end_date = moment(this.selectedEndDate).format("YYYY-MM-DD");
    if (this.subReportType.type == "joined") {
      url = `/company/reports/activities/joined/details-export/${this.companyId}/${start_date}/${end_date}`;
    } else if (this.subReportType.type == "clicks") {
      let start_date = moment(this.selectedStartDate).format("YYYY-MM-DD");
      let end_date = moment(this.selectedEndDate).format("YYYY-MM-DD");
      url = `/company/reports/activities/clicked/details-export/${this.companyId}/${start_date}/${end_date}`;
    }

    if (url) {
      this._companyService.getExportData(url).subscribe(
        (response) => {
          let tableData = response["data"];
          let export_data: any[] = [];
          if (tableData.rows && tableData.rows.length > 0) {
            tableData.rows.forEach((row) => {
              if (this.subReportType.type == "joined") {
                export_data.push({
                  Actividad: row.activity,
                  Nombre: row.member,
                  Email: row.email,
                  Role: row.role,
                  Fecha: moment(row.date).format("YYYY-MM-DD"),
                  Campus: row.campus,
                });
              } else if (this.subReportType.type == "clicks") {
                export_data.push({
                  Actividad: row.activity,
                  Clicks: row.click,
                  Fecha: moment(row.date).format("YYYY-MM-DD"),
                  Campus: row.campus,
                });
              }
            });

            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this._excelService.exportAsExcelFile(
              export_data,
              "report-" + moment().format("YYYYMMDDHHmmss")
            );
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  openTeamsSettingsModal() {
    this.getTeamsSettings();
  }

  getTeamsSettings(showModal: boolean = true) {
    let settings = this.settings;
    if (settings) {
      this.clientId = settings.client_id;
      this.clientSecret = settings.client_secret;
      this.tenantId = settings.tenant_id;
    }
    this.modalbutton?.nativeElement.click();
  }

  saveTeamsSettings() {
    if (!this.clientId || !this.clientSecret || !this.tenantId) {
      return false;
    } else {
      let payload = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        tenant_id: this.tenantId,
      };

      this._companyService
        .updateTeamsGraphSettings(this.companyId, payload)
        .subscribe(
          (response) => {
            if (response) {
              this.open(
                this._translateService.instant("dialog.savedsuccessfully"),
                ""
              );
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  handleDateChange(type, event) {
    if (type == "start" && moment(event?.value).isValid()) {
      this.selectedStartDate = moment(event.value).format("YYYY-MM-DD");
    }
    if (type == "end" && moment(event?.value).isValid()) {
      this.selectedEndDate = moment(event.value).format("YYYY-MM-DD");
    }

    if (this.selectedStartDate && this.selectedEndDate) {
      this.loadSubReportTypes(this.reportType, true, true);
    }
  }

  handleGoBack() {
    this._location.back();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}