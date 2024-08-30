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
import moment from "moment";
import get from 'lodash/get';

@Component({
  selector: "app-courses-students-management",
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
  templateUrl: "./students-management.component.html",
})
export class CoursesStudentsManagementComponent {
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
  allCommissionsData: any = [];
  commissionsData: any = [];
  searchKeyword: any;
  dataSource: any;
  studentReportsColumns = ['name','email','course', 'start_date', 'status', 'current_module', 'unit_details', 'action'];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
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
  selectedCourse: any;
  courseCreditSetting: boolean = false;
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
  dialogMode: string =  '';
  selectedStudent: any;
  credits: any;
  creditsFormSubmitted: boolean = false;
  @ViewChild("modalbutton2", { static: false }) modalbutton2:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton2", { static: false }) closemodalbutton2:
    | ElementRef
    | undefined;

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

    if(this.userId) { this.getUserRole(); }
    this.initializePage();
  }

  initializePage() {
    this.pageTitle = this._translateService.instant('course-students.managestudents');
    this.initializeSearch();
    if(this.hasTutors) { 
      this.getTutors();
      this.getTutorSubfeatures(this.tutorsFeatureId);
    } else {
      this.fetchCourseStudents();
    }
  }

  getUserRole() {
    this._userService.getUserRole(this.userId).subscribe(
      response => {
        let roles = response.role;

        if (roles) {
          roles.forEach(role => {
            if (role.role == 'Super Admin') {
              this.superAdmin = true
            }
          });
        }
      },
      error => {
        console.log(error);
      }
    )
  }

  getTutors() {
    this._tutorsService.getTutors(this.companyId).subscribe(data => {
      this.tutors = data.tutors;
      this.fetchCourseStudents();
    }, error => {
      console.log(error);
    })
  }

  async getTutorSubfeatures(tutorsFeatureId) {
    let tutor_subfeatures = get(await this._companyService.getSubFeatures(tutorsFeatureId).toPromise(), 'subfeatures');
    if(tutor_subfeatures?.length > 0) {
      let subfeature_name = 'Credits';
      let sub = tutor_subfeatures.filter(sf => {
          return sf.name_en == subfeature_name
      })
      let subfeature = sub?.length > 0 ? sub[0] : ''
      if(subfeature) {
        let subfeatures = get(await this._companyService.getCompanySubFeatures(subfeature?.feature_id, this.companyId).toPromise(), 'subfeatures')
        if(subfeatures?.length > 0) {
          let feat = subfeatures.find((f) => f.feature_id == subfeature?.feature_id && f.subfeature_id == subfeature?.id && f.company_id == parseInt(this.companyId))
          if(feat?.active == 1) {
            this.courseCreditSetting = true
            if(this.courseCreditSetting) {
              this.studentReportsColumns = ['name','email','course', 'credits', 'start_date', 'status', 'current_module', 'unit_details', 'action']
            }
          }
        }
      }
    }
  }

  fetchCourseStudents(mode: any = '', status: any = '') {
    this._coursesService
      .getCourseStudentsReport(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          this.tableData = data['data']
          this.tableData2 = JSON.parse(JSON.stringify(data['data']));
          this.courses = this.tableData['courses'];
          this.courses = this.courses && this.courses.filter(course => {
            return course.status == 1 || course.id == 192
          });
          let result = this.filterResults(this.tableData.rows);
          this.dataSource = new MatTableDataSource(result);
          this.refreshDataSource(result);
        },
        error => {
          console.log(error);
        }
      )
  }

  refreshDataSource(students) {
    this.tableData2['rows'] = students;
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
    this.updateLists();
  }

  updateLists() {
    let tableData2 = this.tableData;
    this.tableData = JSON.parse(JSON.stringify(tableData2));
  }

  filterReports() {
    let reports = this.tableData['rows'];

    if(this.selectedCourse ) { reports = this.filterSearchCourses(reports)}

    if(this.searchKeyword) { reports = this.filterSearchKeyword(reports) }
    this.refreshDataSource(reports)
  }

  filterSearchKeyword(students) {
    if(students) {
      return students.filter(m => {
        let include = false
        if(
          (m.name && ((m.name.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).toLowerCase().indexOf(this.searchKeyword.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (m.email && m.email.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0)
          || (m.course && m.course.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0)
        ) {
          include = true
        }

        return include
      })
    }
  }

  filterSearchCourses(courses){
    if(courses) {
        let new_course = courses.filter(c => {
            let include = false
            if(c.course && c.course_id == this.selectedCourse){
                include = true
            }
            return include;
        })
        return new_course;
    }
  }

  filterResults(result) {
    if(this.hasTutors && this.tutors?.length > 0){
        let super_tutor = this.tutors?.filter(tutor => {
            return tutor?.user_id == this.userId && tutor?.super_tutor == 1
        })

        if(super_tutor?.length > 0) {
            this.superTutor = true
            let students = super_tutor[0].super_tutor_students
            result = result?.filter(res => {
                let match = students.some(a => a.user_id === res.user_id)
                return match
            })
        }
    }

    return result
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
    this.dataSource = new MatTableDataSource(this.tableData2['rows'].slice(event.pageIndex * event.pageSize, (event.pageIndex + 1) * event.pageSize))
    if (this.sort) {
        this.dataSource.sort = this.sort;
    } else {
        setTimeout(() => this.dataSource.sort = this.sort);
    }
  }

  unassignUserFromCourse(row) {
    if (row) {
      this.showConfirmationModal = false;
      this.selectedItem = row;
      this.confirmMode = "cancel";
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmunassign"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmunassigncourse"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  confirm() {
    if(this.confirmMode == 'cancel') {
      this.unassignStudentFromCourse();
      this.showConfirmationModal = false;
    } else if(this.confirmMode == 'resend') {
      this.resend();
      this.showConfirmationModal = false;
    }
  }

  unassignStudentFromCourse() {
    let payload = {
      courseId : this.selectedItem?.course_id,
      email : this.selectedItem?.email,
      companyId : this.companyId
    }

    this._coursesService.unassignUserFromCourse(payload).subscribe(data => {
      if(data){
        this.open(this._translateService.instant('quiz-details.updatesuccess'), '');
        this.fetchCourseStudents();
      }
    }, error => {
        
    })
  }

  resendEmail(row) {
    if (row) {
      this.showConfirmationModal = false;
      this.selectedItem = row;
      this.confirmMode = "resend";
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmresend"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmresendemail"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  resend() {
    let params = {
      email: this.selectedItem.email,
      company_id: this.companyId,
      course_id: this.selectedItem.course_id,
    }
    
    this._coursesService.resendCourseAccess(params).subscribe(data => {
      this.open(this._translateService.instant('dialog.sentsuccessfully'), '')
    }, error => {
      
    })
  }

  showAssignStudentsModal() {
    this._router.navigate(['/courses/students/assign'])
  }

  downloadExcel() {
    let export_data: any[] = []
    if(this.tableData && this.tableData.rows && this.tableData.rows.length > 0) {
      let result = this.tableData.rows
      result = this.filterResults(result)
      result.forEach(row => {
        export_data.push({
          'Nombre': row.name,
          'Email': row.email,
          'Telefono': row.phone,
          'Curso': row.course,
          'Fecha de inicio': moment(row.start_date).format('YYYY-MM-DD'),
          'Estado': row.status,
          'Módulo actual': row.current_module,
          'Nº de interacciones con el tutor': row.no_interactions,
        })
      })
    }

    this._excelService.exportAsExcelFile(export_data, 'report-' + moment().format('YYYYMMDDHHmmss'));
  }

  openEditStudentCredit(row) {
    this.dialogMode = 'credit';
    this.selectedStudent = row;
    this.credits = row.remaining_credits;
    this.modalbutton2?.nativeElement.click();
  }

  viewUnits(row) {
    this.dialogMode = 'units';
    this.courseId = row.course_id;
    this.course = row.course;
    this.name = row.name;
    this.selectedUserId = row.user_id;
    this.modalbutton2?.nativeElement.click();
  }

  updateCredits() {
    this.creditsFormSubmitted = true

    if(!this.credits) return false

    let params = {
        user_id: this.selectedStudent.user_id,
        course_id: this.selectedStudent.course_id,
        remaining_course_credits: this.credits
    }

    this._coursesService.updateStudentCredits(params).subscribe(data => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
        let result = this.filterResults(this.tableData.rows)
        if(result?.length > 0) {
          result?.forEach(res => {
            if(res.user_id == this.selectedStudent.user_id && res.course_id == this.selectedStudent.course_id) {
              res.remaining_credits = this.credits
            }
          })
        }
        this.refreshDataSource(result);
        this.closemodalbutton2?.nativeElement.click();
    }, error => {
        
    })
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