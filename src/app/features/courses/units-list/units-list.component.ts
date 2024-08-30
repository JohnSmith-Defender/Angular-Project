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
import { CompanyService, ExcelService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { SearchComponent } from "@share/components/search/search.component";
import { CoursesService } from "@features/services";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ToastComponent } from "@share/components";
import { environment } from "@env/environment";
import { DatePipe } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { 
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import * as _ from "lodash";

@Component({
    selector: "app-courses-units-list",
    standalone: true,
    imports: [
      CommonModule,
      TranslateModule,
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatSnackBarModule,
      FontAwesomeModule,
      SearchComponent,
      ToastComponent,
    ],
    templateUrl: "./units-list.component.html",
  })
  export class CourseUnitsListComponent {
    private destroy$ = new Subject<void>();

    @Input() userId: any;
    @Input() companyId: any;
    @Input() courseId: any;
    @Input() course: any;
    @Input() name: any;
    @Input() primaryColor: any;
    @Input() buttonColor: any;

    isloading: boolean = true;
    domain: any;
    language: any;
    companies: any;
    mode: any;
    p: any;
    _: any = _;
    unitDetailDataSource: any;
    unitDetailsColumns = [
      "course",
      "module",
      "unit",
      "progress",
      "status",
      "start_date",
      "end_date",
    ];
    courseUnits: any = [];
    unitCourse: any = "";
    isLoading: boolean = true;
    datePipe = new DatePipe("en-US");
    visitedIcon = faCheckCircle;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    @ViewChild(MatSort) set matSort(sort: MatSort) {
      if(this.unitDetailDataSource){
          this.unitDetailDataSource.sort = sort
      }
    }

    constructor(
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _coursesService: CoursesService,
        private _excelService: ExcelService,
    ) { }

    ngOnChanges(changes: SimpleChange) {
      let courseIdChange = changes["courseId"];
      if (courseIdChange?.previousValue != courseIdChange?.currentValue) {
        this.courseId = courseIdChange.currentValue;
        this.initializeData();
      }

      let courseChange = changes["course"];
      if (courseChange?.previousValue != courseChange?.currentValue) {
        this.course = courseChange.currentValue;
        this.initializeData();
      }

      let nameChange = changes["name"];
      if (nameChange?.previousValue != nameChange?.currentValue) {
        this.name = nameChange.currentValue;
        this.initializeData();
      }
    }

    async ngOnInit() {
      this.language = this._localService.getLocalStorage(environment.lslang);
      this._translateService.use(this.language || "es");
      this.initializeData();   
    }

    initializeData() {
      this._coursesService
      .getCourseUnitDetails(
        this.userId,
        this.companyId,
        this.courseId
      )
      .subscribe(async (response) => {
        this.unitCourse = this.course;
        this.courseUnits = [];
        if (response?.course_units) {
          this.isloading = false;
          let courseUnits = response["course_units"];
          courseUnits.forEach(row => {
              let start_date = row["Company_Course_Unit_Users.start_date"]
              ? row["Company_Course_Unit_Users.start_date"]
              : row["Company_Course_Unit_Users.created_at"];
              start_date = this.datePipe.transform(start_date, "dd-MM-YYYY hh:mm:ss")
              let end_date =
                row["Company_Course_Unit_Users.progress"] == 100
                  ? row["Company_Course_Unit_Users.updated_at"]
                  : "";
              end_date = this.datePipe.transform(end_date, "dd-MM-YYYY hh:mm:ss")
            this.courseUnits.push({
                course: this.unitCourse,
                module: row["CompanyCourseModule.title"],
                unit: row.title,
                progress: row["Company_Course_Unit_Users.progress"],
                visited: row['Company_Course_Unit_Users.visited'],
                start_date: start_date,
                end_date: end_date,
                updated_at : row['Company_Course_Unit_Users.updated_at'],
                created_at : row['Company_Course_Unit_Users.created_at']
            })
          })
        }
        this.isLoading = false;
        this.refreshDataSource2(this.courseUnits);
      });
    }
    
    downloadExcel() {
      let export_data: any[] = [];
      if (this.courseUnits && this.courseUnits.length > 0) {
        this.courseUnits.forEach((row) => {
          export_data.push({
            Curso: this.unitCourse,
            Módulo: row["module"],
            Unidad: row.unit,
            Progreso: row["progress"],
            Estado:
              row["progress"] != 100 &&
              row["visited"] == 1
                ? this._translateService.instant("general-details.visited")
                : row["progress"] == 100
                ? this._translateService.instant("general-details.completed")
                : this._translateService.instant("general-details.notvisited"),
            "Fecha de inicio": row.start_date,
            "Fecha final": row.end_date,
          });
        });
      }
  
      this._excelService.exportAsExcelFile(export_data, (this.name).replaceAll(" ", "-") +'-course-units-report-' + moment().format('YYYYMMDDHHmmss'))
    }
  
    refreshDataSource2(units) {
      this.unitDetailDataSource = new MatTableDataSource(units);
      if (this.sort) {
          this.unitDetailDataSource.sort = this.sort;
      } else {
          setTimeout(() => (this.unitDetailDataSource.sort = this.sort));
      }
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }