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
  selector: "app-manage-tutorpackages",
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
  templateUrl: "./tutor-packages.component.html",
})
export class ManageTutorPackagesComponent {
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
  displayedColumns = ['name', 'time', 'validuntil', 'action'];
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  allPackages: any;
  searchKeyword: any;
  durationUnits: any = []
  studentAllotted: any
  studentAllottedUnit: any = ''
  studentAllottedDuration: any
  studentAllottedDurationUnit: any = ''
  requireApproval: boolean = false
  default: boolean = false
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
    initFlowbite();
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.getDurationUnits();
    this.getTutorPackages();
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
    this.level4Title = this._translateService.instant(
      "tutors.hourpackages"
    );
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getDurationUnits() {
    this._tutorsService.getDurationUnits()
      .subscribe(
        data => {
          this.durationUnits = data?.duration_units;
        },
        error => {
          let errorMessage = <any>error
          if (errorMessage != null) {
              let body = JSON.parse(error._body);
          }
        }
      )
  }

  getTutorPackages() {
    this._tutorsService.getTutorPackages(this.companyId)
      .subscribe(
        data => {
          this.packages = data?.packages;
          this.allPackages = this.packages;
          this.refreshTable(this.packages);
          this.isloading = false
        },
        error => {
          let errorMessage = <any>error
          if (errorMessage != null) {
              let body = JSON.parse(error._body);
          }
        }
      )
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

  async editPackage(item) {
    this.mode = "edit";
    this.issaving = false;

    this.selectedId = item.id;
    this.packageForm.controls["name"].setValue(item.name);
    this.packageForm.controls["description"].setValue(item.description);
    this.packageForm.controls["price"].setValue(item.price);
    this.studentAllotted = item.student_allotted
    this.studentAllottedUnit = item.student_allotted_unit
    this.studentAllottedDuration = item.student_allotted_duration
    this.studentAllottedDurationUnit = item.student_allotted_duration_unit
    this.requireApproval = item.require_approval == 1 ? true : false
    this.default = item.default == 1 ? true : false
   
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
        .deleteTutorPackage(this.selectedConfirmItem, this.companyId)
        .subscribe(
          (data) => {
            this.showConfirmationModal = false;
            this.open(
              this._translateService.instant("dialog.deletedsuccessfully"),
              ""
            );
            this.getTutorPackages();
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
    this.studentAllotted = '';
    this.studentAllottedUnit = '';
    this.studentAllottedDuration = '';
    this.studentAllottedDurationUnit = '';
    this.requireApproval = false;
    this.default = false;
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
              ) >= 0) ||
          (m.description &&
            m.description
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
    this._tutorsService.editTutorPackageStatus(params).subscribe(
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
      !this.studentAllotted || !this.studentAllottedUnit ||
      !this.studentAllottedDuration || !this.studentAllottedDurationUnit) {
      return false;
    }

    this.issaving = true;

    let params = {
      name: this.packageForm.get('name')?.value,
      description: this.packageForm.get('description')?.value,
      company_id: this.companyId,
		  student_allotted: this.studentAllotted,
      student_allotted_unit: this.studentAllottedUnit,
      student_allotted_duration: this.studentAllottedDuration,
      student_allotted_duration_unit: this.studentAllottedDurationUnit,
      price: this.packageForm.get('price')?.value || 0,
      require_approval: this.requireApproval ? 1 : 0,
      set_default: this.default ? 1 : 0
    };
    if (this.mode == "add") {
      this._tutorsService.addTutorPackage(params).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getTutorPackages();
          this.closemodalbutton?.nativeElement.click();
        },
        (err) => {
          this.issaving = false;
          console.log("err: ", err);
        }
      );
    } else if (this.mode == "edit") {
      this._tutorsService
        .editTutorPackage(this.selectedId, params)
        .subscribe(
          (data) => {
            this.formSubmitted = false;
            this.getTutorPackages();
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

  getDurationUnitTitle(duration) {
    return this.language == 'en' ? duration.unit : (this.language == 'fr' ? duration.unit_fr : 
      (this.language == 'eu' ? duration.unit_eu : (this.language == 'ca' ? duration.unit_ca : 
      (this.language == 'de' ? duration.unit_de : duration.unit_es)
      ))
    )
  }

  handleChangeStudentAllottedUnit(event) {
    this.studentAllottedUnit = event.target.value
  }

  handleChangeStudentAllottedDurationUnit(event) {
    this.studentAllottedDurationUnit = event.target.value
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