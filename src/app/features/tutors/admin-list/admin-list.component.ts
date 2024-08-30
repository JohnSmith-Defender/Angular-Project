import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  Input,
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
import { CoursesService, TutorsService } from "@features/services";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { searchSpecialCase, sortSerchedMembers } from "src/app/utils/search/helper";
import Fuse from 'fuse.js';

@Component({
  selector: "app-tutors-admin-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    SearchComponent,
  ],
  templateUrl: "./admin-list.component.html",
})
export class TutorsAdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;
  @Input() company: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() tutorsTitle: any;
  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() status: any;
  @Input() language: any;

  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  allTutorsData: any = [];
  tutorsData: any = [];
  searchKeyword: any;
  dataSource: any;
  displayedColumns = [
    "first_name",
    "last_name",
    "email",
    "action",
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: string = "";
  confirmDeleteItemDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  coursesData: any = [];
  dropdownSettings: any;
  selectedCourse : any = [];
  selectedTutorToAssign: any = '';
  tutorUserId: any = '';
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

  searchOptions = {
    keys: [{
      name: 'normalized_first_name',
      weight: 0.25
    }, {
      name: 'normalized_last_name',
      weight: 0.25
    }, {
      name: 'normalized_name',
      weight: 0.25
    }, {
      name: 'email',
      weight: 0.25
    }]
  };

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService,
    private _coursesService: CoursesService
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

    this.initializePage();
  }

  initializePage() {
    this.initializeSearch();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: this.language == 'en' ? 'title_en' :
        (this.language == 'fr' ? 'title_fr' : 
            (this.language == 'eu' ? 'title_eu' : 
            (this.language == 'ca' ? 'title_ca' : 
                (this.language == 'de' ? 'title_de' : 'title')
            )
            )
        ),
      selectAllText: this._translateService.instant('dialog.selectall'),
      unSelectAllText: this._translateService.instant('dialog.clearall'),
      itemsShowLimit: 8,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    }
    this.fetchTutorsManagementData();
    this.getCourses();
  }

  fetchTutorsManagementData() {
    this._tutorsService
      .fetchTutorsCombined(this.company?.id, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.formatTutors(data?.tutors || []);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatTutors(tutors) {
    let data;
    if (tutors?.length > 0) {
      data = tutors?.map((item) => {
        return {
          ...item,
          normalized_name: this.normalizeCase(item.name),
          normalized_first_name: this.normalizeCase(item.first_name?.toLowerCase()),
          normalized_last_name: this.normalizeCase(item.last_name?.toLowerCase()),
          path: `/tutors/details/${item.id}`,
          image: `${environment.api}/${item.image}`,
        };
      });
    }
    if (this.allTutorsData?.length == 0) {
      this.allTutorsData = data;
    }

    this.loadTutors(data);
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

  loadTutors(data) {
    this.tutorsData = data;

    if (this.searchKeyword) {
      this.tutorsData = this.filterSearchKeyword(this.tutorsData);
      let fuse = new Fuse(this.tutorsData, this.searchOptions);
      let filtered_search = fuse.search(this.normalizeCase(this.searchKeyword));
      this.tutorsData = []
      filtered_search?.forEach(item => {
        this.tutorsData.push(item?.item)
      })
    }
    this.refreshTable(this.tutorsData);
  }

  filterSearchKeyword(tutors) {
    if(tutors?.length > 0) {
      return tutors.filter((tutor) => {
        return (
          (tutor.first_name &&
            tutor.first_name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            || searchSpecialCase(this.searchKeyword,tutor.first_name)
            ) ||
          (tutor.last_name &&
            tutor.last_name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            ||  searchSpecialCase(this.searchKeyword,tutor.last_name)
            ) ||
          (tutor.email &&
            tutor.email
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0)
        );
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

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getCourses(){
    this._coursesService.getAllCourses(this.company?.id).subscribe(data => {
      let courses = data['courses']
      if(courses) {
        courses = courses && courses.filter(c => {
          return !c.hotmart_product_id
        })
      }

      if(courses?.length > 0) {
        courses.sort((a, b) => a.title.localeCompare(b.title))
      }
      this.coursesData = courses;
    }, error => {
      
    })
  }

  handleCreateRoute() {
    this._router.navigate([`/settings/manage-list/users`]);
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.loadTutors(this.allTutorsData);
  }

  viewItem(row) {
    this._router.navigate([`/tutors/details/${row.user_id}`]);
  }

  editItem(row) {
    this._router.navigate([`/tutors/edit/${row.user_id}`]);
  }

  showAssignCourses(row) {
    this.selectedTutorToAssign = row.id;
    this.tutorUserId = row.user_id;
    let courseAccessTutors = [];
    let selected_courses: any[] = [];
    this.modalbutton?.nativeElement.click();
    this._tutorsService.getTutorCoursesAccess(this.company?.id, this.tutorUserId, row.id).subscribe(
      response => {
        courseAccessTutors = response?.courses?.length > 0 ? response?.courses : []
        this.coursesData?.forEach(cd => {
          if(courseAccessTutors?.length > 0){
            let match = courseAccessTutors.some((a: any) => a.course_id == cd.id)
            if(match){
              selected_courses.push({
                id: cd.id,
                title: this.language == 'en' ? cd.title_en :
                (this.language == 'fr' ? cd.title_fr : 
                    (this.language == 'eu' ? cd.title_eu : 
                    (this.language == 'ca' ? cd.title_ca : 
                        (this.language == 'de' ? cd.title_de : cd.title
                    )
                    )
                  )
                )
              })
            }
          }
        })
        setTimeout(() => {
          this.selectedCourse = selected_courses;
        }, 500);
      }
    )
  }

  assignCourses() {
    let payload: any[] = [];
    this.selectedCourse?.forEach(sc => {
      payload.push({
        id: sc.id,
        title: sc.ttile,
        tutor_id: this.selectedTutorToAssign
      })
    })
    this._tutorsService.assignCourseToTutors(this.company?.id, this.tutorUserId, payload).subscribe(
      async response => {
        this.selectedCourse.length = 0;
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
        this.closemodalbutton?.nativeElement.click();
      }
    )
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