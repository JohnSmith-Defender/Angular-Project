import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService, ExcelService, UserService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { SearchComponent } from "@share/components/search/search.component";
import { CoursesService, TutorsService } from "@features/services";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PageTitleComponent, ToastComponent } from "@share/components";
import { FormsModule } from "@angular/forms";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { CourseUnitsListComponent } from "../units-list/units-list.component";
import { 
  faEye,
  faPencil,
  faEnvelope,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { environment } from "@env/environment";
import get from 'lodash/get';

@Component({
  selector: "app-courses-students-assign-courses",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    FormsModule,
    FontAwesomeModule,
    SearchComponent,
    ToastComponent,
    PageTitleComponent,
    CourseUnitsListComponent,
  ],
  templateUrl: "./assign-courses.component.html",
})
export class CoursesAssignStudentsComponent {
  private destroy$ = new Subject<void>();

  pageTitle: any;
  userId: any;
  companyId: any;
  language: any;
  companies: any;
  company: any;
  domain: any;
  primaryColor: any;
  buttonColor: any;
  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  searchKeyword: any;
  dataSource: any;
  studentReportsColumns = ['checked', 'name','email'];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  selected: any = []
  tableData: any;
  tableData2: any;
  courses: any;
  features: any;
  hasTutors: boolean = false;
  tutorsFeature: any;
  tutorsFeatureId: any;
  hasCourses: boolean = false;
  coursesFeatureId: any;
  tutors: any;
  superTutor: boolean = false;
  pageSize: number = 10;
  pageIndex: number = 0;
  selectedCourse: string = "";
  superAdmin: boolean = false;
  confirmMode: string = "";
  courseId: any;
  course: any;
  name: any;
  selectedUserId: any;
  viewIcon = faEye;
  editIcon = faPencil;
  sendEmailIcon = faEnvelope;
  unassignIcon = faUserMinus;
  isloading: boolean = false;
  userIds: any = [];
  error: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService,
    private _coursesService: CoursesService,
    private _userService: UserService,
    private _excelService: ExcelService,
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
      this.domain = company[0].domain
      this.companyId = company[0].id
      this.primaryColor = company[0].primary_color
      this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
    }

    this.features = this._localService.getLocalStorage(environment.lsfeatures)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (!this.features) {
      this.features = await this._companyService
        .getFeatures(this.domain)
        .toPromise();
    }
    let tutorsFeature = this.features.filter(f => {
      return f.feature_name == "Tutors"
    })

    if(tutorsFeature && tutorsFeature[0]) {
      this.hasTutors = true;
      this.tutorsFeature = tutorsFeature[0];
      this.tutorsFeatureId = tutorsFeature[0].id;
    }

    let coursesFeature = this.features.filter(f => {
      return f.feature_name == "Courses"
    })

    if(coursesFeature && coursesFeature[0]) {
      this.hasCourses = true;
      this.coursesFeatureId = coursesFeature[0].id;
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
    this.pageTitle = this._translateService.instant('course-students.assignstudentstocourses');
    this.initializeSearch();
    if(this.hasTutors) { 
      this.getTutors();
    } else {
      this.getTableData();
    }
  }

  getTutors() {
    this._tutorsService.getTutors(this.companyId).subscribe(data => {
      this.tutors = data.tutors;
      this.getTableData();
    }, error => {
      console.log(error);
    })
  }

  getTableData(mode: any = '', status: any = '') {
    this._coursesService
      .getNoCourseStudentsReport(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          this.tableData = data['data']
          this.tableData['users'] = [...this.tableData['users'], ...this.tableData['rows']];
          this.tableData['users'] = this.uniqByKeepLast(this.tableData['users'], it => it.email)
          this.tableData.users = this.tableData.users.map((tabledata) => {
              tabledata.checked = false
              return tabledata
          })
          this.tableData2 = JSON.parse(JSON.stringify(data['data']));
          this.courses = this.tableData['courses'];
          this.courses = this.courses && this.courses.filter(course => {
              return course.status == 1 || course.id == 192
          })

          let result = this.tableData.users

          if(this.hasTutors && this.tutors?.length > 0){
              let super_tutor = this.tutors?.filter(tutor => {
                  return tutor?.user_id == this.userId && tutor?.super_tutor == 1
              })

              if(super_tutor?.length > 0) {
                  let students = super_tutor[0].super_tutor_students

                  result = result?.filter(res => {
                      let match = students.some(a => a.user_id === res.id)
                      return match
                  })
              }
          }

          this.dataSource = new MatTableDataSource(result);

          this.refreshDataSource(result);
          if(mode == 'reset') { this.filterReports(); }
          this.isloading = false;
        },
        error => {
          console.log(error);
        }
      )
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.pageIndex = 0;
    this.pageSize = 10;
    this.filterReports();
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(this.tableData['users'].slice(event.pageIndex * event.pageSize, (event.pageIndex + 1) * event.pageSize));
  }

  filterReports() {
    this.userIds.length = 0
    let reports = this.tableData2['users'];
    
    if(this.searchKeyword) { 
        reports = this.filterSearchKeyword(reports)
    }

    this.refreshDataSource(reports)
  }

  filterSearchKeyword(students) {
    if(students) {
      return students.filter(m => {
        let include = false
        if(
          (m.name && m.name.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0)
          || (m.email && m.email.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0)
          || (m.course && m.course.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0)
        ) {
          include = true
        }

        return include
      })
    }
  }

  uniqByKeepLast( data, key) {
    return [
      ...new Map(
        data.map( x => [key(x), x])
      ).values( )
    ]
  }

  refreshDataSource(students) {
    this.tableData['users'] = students;
    this.dataSource = new MatTableDataSource(students.slice(this.pageIndex * this.pageSize, this.pageIndex + 1 * this.pageSize))
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => this.dataSource.sort = this.sort);
    }
    if (this.paginator) {
      new MatTableDataSource(students).paginator = this.paginator
      this.paginator.firstPage()
    } else {
      setTimeout(() => {
        if (this.paginator) {
          new MatTableDataSource(students).paginator = this.paginator
          this.paginator.firstPage()
        }
      });
    }
  }

  updateLists() {
    let tableData2 = this.tableData2;
    this.tableData = JSON.parse(JSON.stringify(tableData2));
  }

  getDataUsers(user_id){
    if(this.userIds.includes(user_id)) {
      this.userIds = this.userIds.filter(id => {
        let include = true
        if(id == user_id){
          include = false
        }
        if(include){
          return id
        }
      })
    } else{
      this.userIds.push(user_id)
    }
  }

  assignUserToCourse() {
    if(this.userIds.length == 0 || !this.selectedCourse){
      this.error = true
    }else{
      this.error = false
    }

    if(this.selectedCourse && this.userIds?.length > 0) { 
      this._coursesService.assignUserToCourses(this.userIds, this.selectedCourse).subscribe(data => {
        if(data){
          this.getTableData('reset');
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
        }
      }, error => {
          
      })
    }
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