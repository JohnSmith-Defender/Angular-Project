import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { CompanyService, ExcelService, LocalService } from "@share/services";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Subject } from "rxjs";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { BreadcrumbComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-reports-data",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    SearchComponent,
  ],
  templateUrl: "./reports-data.component.html",
})
export class ReportsDataComponent implements OnInit {
  private destroy$ = new Subject<void>();

  @Input() mode: any;
  @Input() sub: any;
  @Input() datapoint: any;

  languageChangeSubscription;
  isloading: boolean = true;
  userId: any;
  companyId: any;
  domain: any;
  language: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  modeTitle: any;
  subTitle: any;
  datapointTitle: any;
  tableData: any = [];
  allTableDataRows: any = [];
  p: any;
  searchKeyword: any;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  level5Title: string = "";
  level6Title: string = "";
  searchText: any;
  placeholderText: any;
  data: any[] = [];
  columns: any[] = [];
  displayedColumns: any[] = [];
  dataSource: any;
  pageSize: number = 25;
  pageIndex: number = 0;
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _excelService: ExcelService,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
    this.initializeSearch();
    this.getTitle();
    this.initializeBreadcrumb();
    this.getTableData();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getTitle() {
    if (this.mode) {
      if (this.mode == "clubs") {
      } else if (this.mode == "cityagenda") {
      } else {
        this.modeTitle = `${this._translateService.instant(
          `company-reports.${this.mode}`
        )}`;
      }
    }

    if (this.sub) {
      if (this.sub == "joined") {
        this.subTitle = `${this._translateService.instant(
          "company-reports.nojoined"
        )}`;
      }
      if (this.sub == "mentor-mentee-associations") {
        this.subTitle = `${this._translateService.instant(
          "company-reports.nomentormentees"
        )}`;
      }
      if (this.sub == "mentee-mentor-associations") {
        this.subTitle = `${this._translateService.instant(
          "company-reports.nomenteementors"
        )}`;
      }
      if (
        this.sub == "mentor-active-conversations" ||
        this.sub == "mentee-active-conversations"
      ) {
        this.subTitle = `${this._translateService.instant(
          "company-reports.noactiveconversations"
        )}`;
      }
    }

    if (this.datapoint) {
      this.datapointTitle = this.datapoint;
    }
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant("company-settings.tools");
    this.level3Title = this._translateService.instant(
      "company-settings.reports"
    );
    this.level4Title = this.modeTitle;
    this.level5Title = this.subTitle;
    this.level6Title = this.datapointTitle;
  }

  getTableData() {
    let date = "";
    let area = "";
    let datapoint = this.datapoint;

    if (
      (this.mode == "workshops" &&
        (this.sub == "clicks" ||
          this.sub == "teams-clicks" ||
          this.sub == "teams-attended" ||
          this.sub == "teams-audio-time" ||
          this.sub == "teams-video-time")) ||
      (this.mode == "cityagenda" && this.sub == "cityagenda-clicks") ||
      (this.mode == "employmentchannel" &&
        (this.sub == "offers-joined" || this.sub == "offer-clicks"))
    ) {
      if (this.datapoint) {
        let datapoint_array = this.datapoint.split("-");
        if (datapoint_array) {
          if (
            this.mode == "employmentchannel" &&
            (this.sub == "offers-joined" || this.sub == "offer-clicks")
          ) {
            area = datapoint_array[1];
          } else {
            date = datapoint_array[1];
            if (date) {
              date = `${moment().format("YYYY")}-${moment(date).format(
                "MM-DD"
              )}`;
              if (moment(date).isAfter(moment())) {
                date = `${moment().subtract(1, "year").format("YYYY")}-${moment(
                  date
                ).format("MM-DD")}`;
              }
            }
          }

          datapoint = datapoint_array[0];
        }
      }
    }

    this._companyService
      .getReportDetailsData(this.companyId, this.sub, datapoint, date, area)
      .subscribe(
        (response) => {
          this.tableData = response["data"];
          let results = this.mapTableData(this.tableData.rows);
          this.allTableDataRows = results;

          if (this.tableData && results?.length > 0) {
            if (this.mode == "workshops" && this.sub == "clicks") {
              let result: any[] = [];

              results.forEach((a) => {
                let match = result.some((b) => b.ID == a.ID);
                if (!match) {
                  result.push({
                    ID: a.ID,
                    Actividad: a.Actividad,
                    Clicks: a.Clicks,
                  });
                } else {
                  let row = result.find((c) => c.ID == a.ID);
                  row.Clicks = parseInt(row.Clicks) + parseInt(a.Clicks);
                }
              });

              if (result && result.length > 0) {
                result = result.sort((a, b) => {
                  return b.Clicks - a.Clicks;
                });
              }

              results = result;
            } else if (this.mode == "workshops" && this.sub == "teams-clicks") {
              let result: any[] = [];

              results.forEach((a) => {
                let match = result.some(
                  (b) =>
                    b["Teams URL"]?.toString()?.replace("unsafe: ", "") ==
                    a["Teams URL"]?.toString()?.replace("unsafe: ", "")
                );
                if (!match) {
                  result.push({
                    "Teams URL": a["Teams URL"]
                      ?.toString()
                      ?.replace("unsafe: ", ""),
                    Clicks: a.Clicks,
                  });
                } else {
                  let row = result.find(
                    (c) =>
                      c["Teams URL"]?.toString()?.replace("unsafe: ", "") ==
                      a["Teams URL"]?.toString()?.replace("unsafe: ", "")
                  );
                  if (row) {
                    row.Clicks = parseInt(row.Clicks) + parseInt(a.Clicks);
                  }
                }
              });

              if (result && result.length > 0) {
                result = result.sort((a, b) => {
                  return b.Clicks - a.Clicks;
                });
              }

              results = result;
            }
          }

          this.initializeData(results);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapTableData(tableData) {
    if (this.sub == "joined" || this.sub == "joined-generated") {
      return tableData?.map((data) => {
        return {
          ID: data.id,
          Actividad: data.activity,
          Nombre: data.member,
          Email: data.email,
          Role: data.role,
          Fecha: data.date,
        };
      });
    } else if (this.sub == "clubs-joined") {
      return tableData?.map((data) => {
        return {
          ID: data.club_id,
          Club: data.club,
          Nombre: data.member,
          Email: data.email,
          Role: data.role,
          Fecha: data.date,
        };
      });
    } else if (this.sub == "clubs-generated") {
      return tableData?.map((data) => {
        return {
          ID: data.id,
          Actividad: data.activity,
          Club: data.club,
          Fecha: data.date,
        };
      });
    } else if (this.sub == "clicks" || this.sub == "cityagenda-clicks") {
      return tableData?.map((data) => {
        return {
          ID: data.id,
          Actividad: data.activity,
          Clicks: data.click,
        };
      });
    } else if (this.sub == "offers-joined") {
      return tableData?.map((data) => {
        return {
          ID: data.id,
          "Oferta de trabajo": data.offer,
          Nombre: data.member,
          Email: data.email,
          Role: data.role,
          Fecha: data.date,
        };
      });
    } else if (this.sub == "offer-clicks") {
      return tableData?.map((data) => {
        return {
          ID: data.id,
          "Oferta de trabajo": data.offer,
          Clicks: data.click,
        };
      });
    } else if (this.sub == "teams-attended") {
      return tableData?.map((data) => {
        return {
          ID: data.id,
          Nombre: data.member,
          Email: data.email,
          "Reuniones a las que asistió": data.attended,
        };
      });
    } else if (this.sub == "teams-audio-time") {
      return tableData?.map((data) => {
        return {
          ID: data.id,
          Nombre: data.member,
          Email: data.email,
          "Horas de audio": data.attended,
        };
      });
    } else if (this.sub == "teams-video-time") {
      return tableData?.map((data) => {
        return {
          ID: data.id,
          Nombre: data.member,
          Email: data.email,
          "Horas de video": data.attended,
        };
      });
    } else if (this.sub == "teams-clicks") {
      return tableData?.map((data) => {
        return {
          "Teams URL": data.teams,
          Clicks: data.click,
        };
      });
    }
  }

  initializeData(data) {
    const columns = data
      .reduce((columns, row) => {
        return [...columns, ...Object.keys(row)];
      }, [])
      .reduce((columns, column) => {
        return columns.includes(column) ? columns : [...columns, column];
      }, []);
    // Describe the columns for <mat-table>.
    this.columns = columns.map((column) => {
      return {
        columnDef: column,
        header: column,
        cell: (element: any) => `${element[column] ? element[column] : ``}`,
      };
    });

    this.displayedColumns = this.columns.map((c) => c.columnDef);
    this.refreshTable(data);
  }

  refreshTable(data) {
    this.dataSource = new MatTableDataSource(
      data.slice(
        this.pageIndex * this.pageSize,
        (this.pageIndex + 1) * this.pageSize
      )
    );
    setTimeout(() => {
      if (this.paginator) {
        new MatTableDataSource(data).paginator = this.paginator;
        this.paginator.firstPage();
      }
      this.dataSource.sort = this.sort;
    }, 500);
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    let list = this.allTableDataRows;
    this.dataSource = new MatTableDataSource(
      list?.slice(
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

  goToDetails(row, key) {
    if (this.sub == "joined" || this.sub == "clicks") {
      this._router.navigate([`plans/details/${row.ID}/1`]);
    } else if (this.sub == "clubs-joined") {
      this._router.navigate([`clubs/details/${row.ID}`]);
    } else if (this.sub == "joined-generated") {
      this._router.navigate([`plans/details/${row.ID}/4`]);
    } else if (this.sub == "clubs-generated") {
      if (key == "activity") {
        this._router.navigate([`plans/details/${row.ID}/4`]);
      } else if (key == "club") {
        this._router.navigate([`clubs/details/${row.ID}`]);
      }
    } else if (this.sub == "cityagenda-clicks") {
      this._router.navigate([`news/details/${row.ID}`]);
    } else if (this.sub == "offers-joined" || this.sub == "offer-clicks") {
      this._router.navigate([`employmentchannel/details/${row.ID}`]);
    } else if (this.sub == "teams-clicks") {
      window.open(row["key"], "_blank");
    }
  }

  downloadCSV() {
    let export_data: any = [];
    if (this.tableData.rows && this.tableData.rows.length > 0) {
      this.tableData.rows.forEach((row) => {
        if (this.sub == "joined" || this.sub == "joined-generated") {
          export_data.push({
            Actividad: row.activity,
            Nombre: row.member,
            Email: row.email,
            Role: row.role,
            Fecha: moment(row.date).format("YYYY-MM-DD"),
          });
        } else if (this.sub == "clubs-joined") {
          export_data.push({
            Club: row.club,
            Nombre: row.member,
            Email: row.email,
            Role: row.role,
            Fecha: moment(row.date).format("YYYY-MM-DD"),
          });
        } else if (this.sub == "clubs-generated") {
          export_data.push({
            Actividad: row.activity,
            Club: row.club,
            Fecha: moment(row.date).format("YYYY-MM-DD"),
          });
        }
        if (this.sub == "clicks" || this.sub == "cityagenda-clicks") {
          export_data.push({
            Actividad: row.activity,
            Clicks: row.click,
          });
        } else if (this.sub == "offers-joined") {
          export_data.push({
            "Oferta de trabajo": row.offer,
            Nombre: row.member,
            Email: row.email,
            Role: row.role,
            Fecha: moment(row.date).format("YYYY-MM-DD"),
          });
        } else if (this.sub == "offer-clicks") {
          export_data.push({
            "Oferta de trabajo": row.offer,
            Clicks: row.click,
          });
        } else if (this.sub == "teams-attended") {
          export_data.push({
            Nombre: row.member,
            Email: row.email,
            "Reuniones a las que asistió": row.attended,
          });
        } else if (this.sub == "teams-audio-time") {
          export_data.push({
            Nombre: row.member,
            Email: row.email,
            "Horas de audio": row.attended,
          });
        } else if (this.sub == "teams-video-time") {
          export_data.push({
            Nombre: row.member,
            Email: row.email,
            "Horas de video": row.attended,
          });
        } else if (this.sub == "teams-clicks") {
          export_data.push({
            "Teams URL": row.teams,
            Clicks: row.click,
          });
        } else if (this.sub == "mentor-mentee-associations") {
          export_data.push({
            "Nombre del mentor": row.mentor,
            "Email del mentor": row.mentor_email,
            Curso: row.year,
            "Nombre del mentee": row.mentee,
            "Email del mentee": row.mentee_email,
            Fecha: moment(row.date).format("YYYY-MM-DD"),
          });
        } else if (this.sub == "mentee-mentor-associations") {
          export_data.push({
            "Nombre del mentee": row.mentee,
            "Email del mentee": row.mentee_email,
            "Nombre del mentor": row.mentor,
            "Email del mentor": row.mentor_email,
            Curso: row.year,
            Fecha: moment(row.date).format("YYYY-MM-DD"),
          });
        } else if (this.sub == "mentor-active-conversations") {
          export_data.push({
            "Nombre del mentor": row.mentor,
            "Email del mentor": row.mentor_email,
            Curso: row.year,
            "Nombre del mentee": row.mentee,
            "Email del mentee": row.mentee_email,
            Mensaje: row.message,
            Fecha: moment(row.date).format("YYYY-MM-DD"),
          });
        } else if (this.sub == "mentee-active-conversations") {
          export_data.push({
            "Nombre del mentee": row.mentee,
            "Email del mentee": row.mentee_email,
            "Nombre del mentor": row.mentor,
            "Email del mentor": row.mentor_email,
            Curso: row.year,
            Mensaje: row.message,
            Fecha: moment(row.date).format("YYYY-MM-DD"),
          });
        }
      });
    }

    this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    this._excelService.exportAsExcelFile(
      export_data,
      "report-" + moment().format("YYYYMMDDHHmmss")
    );
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  handleGoBack() {
    this._router.navigate(["/settings/reports"]);
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.filterData();
  }

  filterData() {
    let tableDataRows = this.allTableDataRows;
    let filteredRows = this.allTableDataRows;
    if (filteredRows && filteredRows.length > 0 && this.searchKeyword) {
      filteredRows =
        filteredRows &&
        filteredRows.filter((r) => {
          return (
            (r.Actividad &&
              r.Actividad.toLowerCase().indexOf(
                this.searchKeyword.toLowerCase()
              ) >= 0) ||
            (r.Club &&
              r.Club.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >=
                0) ||
            (r["Oferta de trabajo"] &&
              r["Oferta de trabajo"]
                .toLowerCase()
                .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
            (r.Email &&
              r.Email.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >=
                0)
          );
        });
    }

    this.refreshTable(filteredRows);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}