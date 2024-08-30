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
import { MatTabsModule } from "@angular/material/tabs";
import {
  BreadcrumbComponent,
  PageTitleComponent,
  ToastComponent,
} from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
} from "@share/services";
import { TutorsService } from "@features/services";
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
import { EditorModule } from "@tinymce/tinymce-angular";
import get from "lodash/get";

@Component({
  selector: "app-manage-creditpackages",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    EditorModule,
    SearchComponent,
    BreadcrumbComponent,
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: "./credit-packages.component.html",
})
export class ManageCreditPackagesComponent {
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

  packages: any;
  mode: any;
  packageForm: FormGroup = new FormGroup({
    name: new FormControl("", [Validators.required]),
    description: new FormControl(""),
    price: new FormControl(""),
  });
  formSubmitted: boolean = false;
  selectedId: any;

  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ['name', 'credits', 'price', 'action'];
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  allPackages: any;
  searchKeyword: any;
  features: any;
  domain: any;
  featureId: any;
  courseFeatureId: any;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  selectedConfirmItem: any;
  selectedConfirmMode: string = "";
  company: any;
  dialogMode: string = "";
  dialogTitle: any;
  issaving: boolean = false;
  showConfirmationModal: boolean = false;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  courses: any = [];
  separateCourseCredits: any;
  hasDifferentStripeAccount: boolean = false;
  hasMultipleStripeAccountSetting: boolean = false;
  selectedCourse: any = '';

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private _location: Location
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

    this.features = this._localService.getLocalStorage(environment.lsfeatures)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (!this.features) {
      this.features = await this._companyService
        .getFeatures(this.domain)
        .toPromise();
    }
    if(this.features && this.companyId > 0) {
      let tutorsFeature = this.features.filter(f => {
        return f.feature_name == "Tutors"
      })
  
      if(tutorsFeature && tutorsFeature[0]) {
        this.featureId = tutorsFeature[0].id
      }

      let courseFeature = this.features.filter(f => {
        return f.feature_name == "Courses"
      })

      if(courseFeature && courseFeature[0]) {
        this.courseFeatureId = courseFeature[0].id
      }
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
    initFlowbite();
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.initializeData();
  }

  initializeData() {
    if(this.companyId == 52) {
      this.displayedColumns = ['name', 'credits', 'course', 'price', 'action']
    } else {
      this.displayedColumns = ['name', 'credits', 'price', 'action']
    }

    this.packageForm = new FormGroup({
      'name': new FormControl('', [Validators.required]),
      'credits': new FormControl(''),
      'price': new FormControl(''),
    })

    this.getSettings();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.modules"
    );
    this.level3Title = this._translateService.instant(
      "wall.tutors"
    );
    this.level4Title = `${this._translateService.instant("credit-package.credits")} ${this._translateService.instant("tutors.hourpackages")}`;
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getSettings() {
    this._tutorsService.getCombinedCreditPackagesPrefetch(this.companyId, this.featureId, this.courseFeatureId).subscribe(data => {
      let subfeatures = data[0] ? data[0]['subfeatures'] : []
      let courseSubfeatures = data[1] ? data[1]['subfeatures'] : []
      this.packages = data[2] ? data[2]['credit_packages'] : []
      this.courses = data[3] ? data[3]['courses'] : []
      this.mapSubfeatures(subfeatures, courseSubfeatures);
      this.allPackages = this.packages;
      this.refreshTable(this.packages);
      this.isloading = false
    }, error => {
        
    })
  }

  mapSubfeatures(subfeatures, courseSubfeatures) {
    if(subfeatures?.length > 0) {
      this.separateCourseCredits = subfeatures.some(a => a.name_en == 'Separate credits by course' && a.active == 1)
    }

    if(courseSubfeatures?.length > 0) {
      this.hasDifferentStripeAccount = courseSubfeatures.some(a => a.name_en == 'Different Stripe accounts' && a.active == 1)
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
      this.packages.slice(
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

  getCourseTitleById(id) {
    let course_row = this.courses?.filter(c => {
      return c.id == id
    })

    let course
    if(course_row?.length > 0) {
      course = course_row[0]
    }
    return course ? this.language == 'en' ? (course.title_en ? (course.title_en || course.title) : course.title) :
    (this.language == 'fr' ? (course.title_fr ? (course.title_fr || course.title) : course.title) : 
        course.title) : ''
  }

  getCourseTitle(course) {
    return course ? this.language == 'en' ? (course.title_en ? (course.title_en || course.title) : course.title) :
    (this.language == 'fr' ? (course.title_fr ? (course.title_fr || course.title) : course.title) : 
        course.title) : ''
  }

  getCreditPackages() {
    this._tutorsService.getCreditPackages(this.companyId)
      .subscribe(
        response => {
          if(response?.credit_packages){
            this.packages = response.credit_packages;
            this.allPackages = this.packages;
            this.refreshTable(this.packages);
          }
        },
        error => {
          console.log(error);
        }
      )
  }

  async editPackage(item) {
    this.mode = "edit";
    this.issaving = false;

    this.selectedId = item.id;
    this.packageForm.controls["name"].setValue(item.name);
    this.packageForm.controls["credits"].setValue(item.credits);
    this.packageForm.controls["price"].setValue(item.price);
    if(this.separateCourseCredits) {
      this.selectedCourse = item.course_id || '';
    }
   
    this.dialogMode = "edit";
    this.modalbutton?.nativeElement.click();
  }

  deletePackage(item) {
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteMember"
    );
    this.acceptText = "OK";
    this.selectedConfirmItem = item.id;
    this.selectedConfirmMode = "delete";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    if (this.selectedConfirmItem && this.selectedConfirmMode == "delete") {
      this._tutorsService
        .deleteCreditPackage(this.selectedConfirmItem, this.companyId)
        .subscribe(
          (data) => {
            this.showConfirmationModal = false;
            this.open(
              this._translateService.instant("dialog.deletedsuccessfully"),
              ""
            );
            this.getCreditPackages();
          },
          (err) => {
            this.showConfirmationModal = false;
            console.log("err: ", err);
          }
        );
    }
  }

  create() {
    this.resetDetailsForm();

    this.mode = "add";
    this.issaving = false;

    this.dialogMode = "add";
    this.modalbutton?.nativeElement.click();
  }

  resetDetailsForm() {
    this.packageForm.reset();
    this.selectedId = '';
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.packages = this.filterPackages();
    this.refreshTable(this.packages);
  }

  filterPackages() {
    let packages = this.allPackages;
    if (packages?.length > 0 && this.searchKeyword) {
      return packages.filter((m) => {
        let include = false;
        if (
          (m.name &&
            m.name
              .toLowerCase()
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
      return packages;
    }
  }

  editPackageStatus(event, item) {
    item.status = event?.target?.checked ? 1 : 0
    let params = {
      id: item.id,
      status: event?.target?.checked  ? 1 : 0
    }
    this._tutorsService.editCreditPackageStatus(params).subscribe(
      response => {
        
      },
      error => {
        console.log(error);
      }
    )
  }

  saveDetails() {
    this.formSubmitted = true;

    if (this.packageForm.get("name")?.errors ||
      this.packageForm.get('credits')?.errors ||
      this.packageForm.get('price')?.errors
      ) {
      return false;
    }

    let selected_course_row = this.courses?.filter(c => {
      return c.id == this.selectedCourse
    })

    let selected_course
    if(selected_course_row ?.length > 0) {
      selected_course = selected_course_row[0]
    }

    this.issaving = true;

    let params = {
      name: this.packageForm.get('name')?.value,
      credits: this.packageForm.get('credits')?.value,
      company_id: this.companyId,
      price: this.packageForm.get('price')?.value || 0,
      course_id: this.separateCourseCredits ? this.selectedCourse : null,
      different_stripe_account: this.hasDifferentStripeAccount ? 1 : 0,
      stripe_account_id: this.hasDifferentStripeAccount ? selected_course?.other_stripe_account_id : null
    };
    if (this.mode == "add") {
      this._tutorsService.addCreditPackage(params).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getCreditPackages();
          this.closemodalbutton?.nativeElement.click();
        },
        (err) => {
          this.issaving = false;
          console.log("err: ", err);
        }
      );
    } else if (this.mode == "edit") {
      this._tutorsService
        .editCreditPackage(this.selectedId, params)
        .subscribe(
          (data) => {
            this.formSubmitted = false;
            this.getCreditPackages();
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this.closemodalbutton?.nativeElement.click();
          },
          (err) => {
            this.issaving = false;
            console.log("err: ", err);
          }
        );
    }
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