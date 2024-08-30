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
import { PlansService, TestimonialsService } from "@features/services";
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
  selector: "app-manage-agegroups",
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
  templateUrl: "./age-groups.component.html",
})
export class ManageAgeGroupsComponent {
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

  ageGroups: any;
  mode: any;
  form: FormGroup = new FormGroup({
    age_group: new FormControl("", [Validators.required]),
  });
  formSubmitted: boolean = false;
  selectedId: any;

  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ['age_group', 'action'];
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  allAgeGroups: any;
  searchKeyword: any;
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
    private _plansService: PlansService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
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
    this.getAgeGroups();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.modules"
    );
    this.level3Title = this._translateService.instant(
      "plan-create.agegroups"
    );
    this.level4Title = "";
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getAgeGroups() {
    this._plansService.getAgeGroups(this.companyId)
      .subscribe(
        data => {
          this.formatAgeGroups(data?.age_groups);
          this.allAgeGroups = this.ageGroups;
          this.refreshTable(this.ageGroups);
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

  formatAgeGroups(ageGroups) {
    this.ageGroups = ageGroups?.map((age_group) => {
      return {
        ...age_group,
      };
    });
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
      this.ageGroups.slice(
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

  async editAgeGroup(item) {
    this.mode = "edit";
    this.issaving = false;

    this.selectedId = item.id;
    this.form.controls["age_group"].setValue(item.age_group);
   
    this.dialogMode = "edit";
    this.modalbutton?.nativeElement.click();
  }

  deleteAgeGroup(item) {
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
      this._plansService
        .deleteAgeGroup(this.selectedConfirmItem, this.companyId)
        .subscribe(
          (data) => {
            this.showConfirmationModal = false;
            this.open(
              this._translateService.instant("dialog.deletedsuccessfully"),
              ""
            );
            this.getAgeGroups();
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
    this.form.reset();
    this.selectedId = "";
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.ageGroups = this.filterAgeGroups();
    this.formatAgeGroups(this.ageGroups);
    this.refreshTable(this.ageGroups);
  }

  filterAgeGroups() {
    let ageGroups = this.allAgeGroups;
    if (ageGroups?.length > 0 && this.searchKeyword) {
      return ageGroups.filter((m) => {
        let include = false;
        if (
          m.age_group
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
        ) {
          include = true;
        }

        return include;
      });
    } else {
      return ageGroups;
    }
  }

  saveDetails() {
    this.formSubmitted = true;

    if(this.form.get('age_group')?.errors
    ) {
      return false;
    }

    this.issaving = true;

    let params = {
      age_group: this.form.get('age_group')?.value,
      company_id: this.companyId
    };
    if (this.mode == "add") {
      this._plansService.addAgeGroup(params).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getAgeGroups();
          this.closemodalbutton?.nativeElement.click();
        },
        (err) => {
          this.issaving = false;
          console.log("err: ", err);
        }
      );
    } else if (this.mode == "edit") {
      this._plansService
        .editAgeGroup(this.selectedId, params)
        .subscribe(
          (data) => {
            this.formSubmitted = false;
            this.getAgeGroups();
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