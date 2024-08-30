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
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { SearchComponent } from "@share/components/search/search.component";
import { CoursesService } from "@features/services";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ButtonGroupComponent, ToastComponent } from "@share/components";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { COURSE_IMAGE_URL } from "@lib/api-constants";
import { searchSpecialCase } from "src/app/utils/search/helper";
import { environment } from "@env/environment";

@Component({
  selector: "app-courses-admin-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    SearchComponent,
    ToastComponent,
    ButtonGroupComponent,
  ],
  templateUrl: "./admin-list.component.html",
})
export class CoursesAdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;
  @Input() company: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() canCreateCourse: any;
  @Input() coursesTitle: any;
  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() status: any;
  @Input() language: any;
  @Input() isUESchoolOfLife: any;

  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  allCoursesData: any = [];
  coursesData: any = [];
  searchKeyword: any;
  dataSource: any;
  displayedColumns = [
    "course_title",
    "category",
    "payment",
    "courseaction",
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: string = "";
  confirmDeleteItemDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  courses: any;
  user: any;
  coursesFeature: any;
  featureId: any;
  pageName: any;
  canLinkQuizToCourse: boolean = false;
  hasCoursePayment: boolean = false;
  hasCourseCategories: boolean = false;
  isAdvancedCourse: boolean = false;
  hasCourseCustomSections: boolean = false;
  canLockUnlockModules: boolean = false;
  hasHotmartIntegration: boolean = false;
  hasCourseWallAccess: boolean = false;
  hasStripeInstalment: boolean = false;
  hasDifferentStripeAccount: boolean = false;
  canCreate: any;
  memberTypes: any;
  memberRoles: any;
  requireApproval: boolean = false;
  unitTypes: any;
  courseCategories: any;
  paymentTypes: any;
  data: any;
  courseForm: any;
  hotmartSettings: any;
  courseDifficultyLevels: any;
  courseDurationUnits: any;
  otherStripeAccounts: any;

  buttonList: any = [];
  viewMode: any = 'courses';
  isLoading: boolean = false;
  category: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _coursesService: CoursesService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();
    this.userId = this._localService.getLocalStorage(environment.lsuserId)
    this.language = this._localService.getLocalStorage(environment.lslang)
    this._translateService.use(this.language || 'es')
    this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(this.company)

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this._route.queryParams.subscribe((params) => {
      this.category = params ? params["category"] : "";
    });

    this.initializePage();
  }

  initializePage() {
    this.initializeSearch();
    if(this.isUESchoolOfLife) { this.initializeButtonGroup(); }
    this.fetchCoursesManagementData();
  }

  fetchCoursesManagementData() {
    this._coursesService
      .fetchAdminCourses(this.company?.id, this.userId, this.isUESchoolOfLife)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.data = data;
          this.user = data?.user_permissions?.user;
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data);
          this.mapUserPermissions(data?.user_permissions);
          this.mapCustomMemberTypes(data?.member_types);
          this.courseDifficultyLevels = data?.difficulty_levels;
          this.courseDurationUnits = data?.duration_units;
          this.unitTypes = data.unit_types;
          this.courseCategories = data.course_categories;
          this.otherStripeAccounts = data?.other_stripe_accounts;
          this.paymentTypes = data?.payment_types;
          this.hotmartSettings = data?.hotmart_settings;
          this.formatCourses(data?.courses);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.coursesFeature = features?.find((f) => f.feature_id == 11);
    this.featureId = this.coursesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.coursesFeature);
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
        : this.language == "it"
        ? feature.name_it ||
          feature.feature_name_IT ||
          feature.name_es ||
          feature.feature_name_IT
        : feature.name_es || feature.feature_name_ES
      : "";
  }

  mapSubfeatures(data) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.canLinkQuizToCourse = subfeatures.some(
        (a) => a.name_en == "Link quiz to courses" && a.active == 1
      );
      this.hasCoursePayment = subfeatures.some(
        (a) => a.name_en == "Course fee" && a.active == 1
      );
      this.hasCourseCategories = subfeatures.some(
        (a) => a.name_en == "Categories" && a.active == 1
      );
      this.isAdvancedCourse = subfeatures.some(
        (a) => a.name_en == "Advanced course" && a.active == 1
      );
      this.hasCourseCustomSections = subfeatures.some(
        (a) => a.name_en == "Custom sections for course details" && a.active == 1
      );
      this.canLockUnlockModules = subfeatures.some(
        (a) => a.name_en == "Lock/unlock upon completion" && a.active == 1
      );
      this.hasHotmartIntegration = subfeatures.some(
        (a) => a.name_en == "Hotmart integration" && a.active == 1
      );
      this.hasCourseWallAccess = subfeatures.some(
        (a) => a.name_en == "Course-specific wall access" && a.active == 1
      );
      this.hasStripeInstalment = subfeatures.some(
        (a) => a.name_en == "Stripe Instalments" && a.active == 1
      );
      this.hasDifferentStripeAccount = subfeatures.some(
        (a) => a.name_en == "Different Stripe accounts" && a.active == 1
      );
    }

    if(this.isAdvancedCourse) {
      this.courseForm = new FormGroup({
        'title_es': new FormControl('', [Validators.required]),
        'title_en': new FormControl(''),
        'title_fr': new FormControl(''),
        'title_eu': new FormControl(''),
        'title_ca': new FormControl(''),
        'title_de': new FormControl(''),
        'title_it': new FormControl(''),
        'description_es': new FormControl('', [Validators.required]),
        'description_en': new FormControl(''),
        'description_fr': new FormControl(''),
        'description_eu': new FormControl(''),
        'description_ca': new FormControl(''),
        'description_de': new FormControl(''),
        'description_it': new FormControl(''),
        'course_date': new FormControl(''),
        'duration': new FormControl(''),
        'points': new FormControl(''),
        'price': new FormControl(''),
      })
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 11
      );
  }

  mapCustomMemberTypes(member_types) {
    this.memberTypes = member_types;
    this.memberRoles = [];
    if(this.memberTypes) {
      this.memberTypes.forEach(mt => {
        this.memberRoles.push({
          id: mt.id,
          role: mt.type_es
        })
        if(mt.require_approval == 1 || this.company?.id != 15) {
          this.requireApproval = true
        }
      })

      this.memberRoles.push({
        id: 4,
        role: 'Super Admin'
      })
    }
  }

  formatCourses(all_courses) {
    let courses;
    if (all_courses?.length > 0) {
      courses = all_courses?.map((item) => {
        return {
          ...item,
          checked: 0,
          path: `/courses/details/${item.id}`,
          course_title: this.getCourseTitle(item),
          category: this.getCategoryTitle(item),
          payment: item?.payment_type && (!this.hasHotmartIntegration || !item?.hotmart_product_id),
          image: `${COURSE_IMAGE_URL}/${item.image}`,
        };
      });
    }

    if(courses?.length > 0) {
      if(this.hasHotmartIntegration) {
        courses = courses && courses.filter(c => {
          let include = false

          if(!c.hotmart_product_id || (c.hotmart_product_id && c.hotmart_show == 1 && this.hotmartSettings?.show == 1)) {
            include =  true
          }
          
          return include
        })
      } else {
        courses = courses && courses.filter(c => {
          return !c.hotmart_product_id
        })
      }
      courses = courses.map((course, index) => {
        let category_display = ''
        if(course.categories) {
          course.categories.forEach(c => {
            if(!category_display) {
              category_display = this.language == 'en' ? c.name_EN : c.name_ES
            } else {
              category_display += ', ' + this.language == 'en' ? c.name_EN : c.name_ES
            }
          });
        }

        return {
            category_display,
            ...course
        }
      })
    }

    if(this.buttonList?.length > 0 && courses?.length > 0) {
      let selected = this.buttonList?.find((c) => c.selected);
      if(selected.type == 'courses') {
        courses = courses?.filter(course => {
          return course?.sol_nivelacion != 1
        })
      } else if(selected.type == 'courses-nivelacion') {
        courses = courses?.filter(course => {
          return course?.sol_nivelacion == 1
        })
      }
    }

    if(this.allCoursesData?.length == 0) {
      this.allCoursesData = courses;
    }
    this.loadCourses(courses);
  }

  loadCourses(data) {
    this.coursesData = data;

    if (this.searchKeyword && this.coursesData) {
      this.coursesData = this.coursesData.filter((course) => {
        return (
          (course.title &&
            course.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            || searchSpecialCase(this.searchKeyword,course.title)
            ) ||
          (course.title_en &&
            course.title_en
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            
            || searchSpecialCase(this.searchKeyword,course.title_en)
            ) ||
          (course.title_fr &&
            course.title_fr
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            
            || searchSpecialCase(this.searchKeyword,course.title_fr)
            ) ||
          (course.title_eu &&
            course.title_eu
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            
            || searchSpecialCase(this.searchKeyword,course.title_eu)
            ) ||
          (course.title_ca &&
            course.title_ca
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            
            || searchSpecialCase(this.searchKeyword,course.title_ca)
            ) ||
          (course.title_de &&
            course.title_de
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            
            || searchSpecialCase(this.searchKeyword,course.title_de)
            ) ||
          (course.title_it &&
            course.title_it
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            
            || searchSpecialCase(this.searchKeyword,course.title_it)
            )
        );
      });
    }

    this.refreshTable(this.coursesData);
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
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  handleCreateRoute() {
    let url = `/courses/create/0`;
    url += this.isUESchoolOfLife && this.viewMode == 'courses-nivelacion' ? `/nivelacion` : '';

    this._router.navigate([url]);
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.loadCourses(this.allCoursesData);
  }

  getCourseTitle(course) {
    return course ? this.language == 'en' ? (course.title_en || course.title) : (this.language == 'fr' ? (course.title_fr || course.title) : 
        (this.language == 'eu' ? (course.title_eu || course.title) : (this.language == 'ca' ? (course.title_ca || course.title) : 
        (this.language == 'de' ? (course.title_de || course.title) : (this.language == 'it' ? (course.title_it || course.title) : course.title)
      )))
    ) : '';
  }

  getCategoryTitle(course) {
    let category_ES = course?.categories?.map((data) => { return data.name_ES }).join(', ');
    let category_EN = course?.categories?.map((data) => { return data.name_EN }).join(', ');
    let category_FR = course?.categories?.map((data) => { return data.name_FR }).join(', ');
    let category_EU = course?.categories?.map((data) => { return data.name_EU }).join(', ');
    let category_CA = course?.categories?.map((data) => { return data.name_CA }).join(', ');
    let category_DE = course?.categories?.map((data) => { return data.name_DE }).join(', ');
    let category_IT = course?.categories?.map((data) => { return data.name_IT }).join(', ');

    return this.language == 'en' ? (category_EN || category_ES) : (this.language == 'fr' ? (category_FR || category_ES) : 
        (this.language == 'eu' ? (category_EU || category_ES) : (this.language == 'ca' ? (category_CA || category_ES) : 
        (this.language == 'de' ? (category_DE || category_ES) : (this.language == 'it' ? (category_IT || category_ES) : category_ES)
      )))
    );
  }

  viewCategory() {
    this._router.navigate([`/settings/list/${this.featureId}/categories`]);
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.coursesData.slice(
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

  viewItem(id) {
    this._router.navigate([`/courses/details/${id}`]);
  }

  editItem(id) {
    let url = `/courses/edit/${id}`;
    url += this.isUESchoolOfLife && this.viewMode == 'courses-nivelacion' ? `/nivelacion` : '';

    this._router.navigate([url]);
  }

  confirmDeleteItem(id) {
    this.showConfirmationModal = false;
    this.selectedItem = id;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteitem"
    );
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    this.deleteItem(this.selectedItem, true);
    this.showConfirmationModal = false;
  }

  deleteItem(id, confirmed) {
    if (confirmed) {
      this._coursesService.deleteCourse(id).subscribe(
        (response) => {
          let all_courses = this.allCoursesData;
          if (all_courses?.length > 0) {
            all_courses.forEach((course, index) => {
              if (course.id == id) {
                all_courses.splice(index, 1);
              }
            });
          }

          let courses = this.coursesData;
          if (courses?.length > 0) {
            courses.forEach((course, index) => {
              if (course.id == id) {
                courses.splice(index, 1);
              }
            });
          }
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this.coursesData = courses;
          this.refreshTable(this.coursesData);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  editCourseStatus(event, course) {
    let new_status = event?.target?.checked
    course.status = new_status ? 1 : 0
    let params = {
      id: course.id,
      status: new_status ? 1 : 0
    }
    this._coursesService.editCourseStatus(params).subscribe(
      response => {
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
      },
      error => {
        console.log(error);
      }
    )
  }

  editCourseLocked(event, course) {
    course.locked = event ? 1 : 0
    let params = {
      id: course.id,
      locked: event ? 1 : 0
    }
    this._coursesService.editCourseLocked(params).subscribe(
      response => {
        this.allCoursesData?.forEach(cpurse => {
          course.locked = event ? 1 : 0
        })
        this.coursesData?.forEach(cpurse => {
          course.locked = event ? 1 : 0
        })
        this.refreshTable(this.coursesData);
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
      },
      error => {
        console.log(error);
      }
    )
  }

  duplicateCourse(course) {
    this._coursesService.duplicateCourse(course.id).subscribe(
      response => {
        this.open(this._translateService.instant('dialog.copiedcourse'), '')
        this.fetchCoursesManagementData()
      },
      error => {
        console.log(error);
      }
    )
  }

  initializeButtonGroup() {
    this.buttonList = [
      {
        id: 1,
        value: "courses",
        text: this._translateService.instant('training.training'),
        type: "courses",
        selected: this.category == 'nivelacion' ? false : true,
      },
      {
        id: 2,
        value: "courses-nivelacion",
        text: this._translateService.instant('landing.solcourses'),
        type: "courses-nivelacion",
        selected: this.category == 'nivelacion' ? true : false,
      },
    ];
    if(this.category == 'nivelacion') {
      this.viewMode = 'courses-nivelacion';
    }
  }

  handleChangeViewMode(event) {
    this.buttonList?.forEach((item) => {
      if (item.id === event.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.viewMode = event.type;
    this.fetchCoursesManagementData();
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