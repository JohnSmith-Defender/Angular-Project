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
import { MatTabsModule } from "@angular/material/tabs";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  ExcelService,
  LocalService,
  UserService,
} from "@share/services";
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
import get from "lodash/get";
import { searchSpecialCase } from "src/app/utils/search/helper";

@Component({
  selector: "app-settings-lead-locations",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    SearchComponent,
    BreadcrumbComponent,
    PageTitleComponent,
    ToastComponent,
  ],
  templateUrl: "./locations.component.html",
})
export class LocationsComponent {
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
  company: any;
  domain: any;
  mode: any;
  formSubmitted: boolean = false;
  locationForm = new FormGroup({
    location: new FormControl("", [Validators.required]),
    slug: new FormControl("", [Validators.required])
  });
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ["location", "slug", "action"];
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  @ViewChild("modalbutton0", { static: false }) modalbutton0:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton0", { static: false }) closemodalbutton0:
    | ElementRef
    | undefined;
  searchKeyword: any;
  locations: any = [];
  allLocations: any = [];
  title: any;
  description: any;
  selectedLocation: any = '';
  questionLocations: any = [];
  selectedId: any;
  selectedItemId: any;
  location: any;
  slug: any;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
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
    this.getLocations();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.channels"
    );
    this.level3Title = "TikTok";
    this.level4Title = this._translateService.instant("leads.locations");
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  async getLocations() {
    this._companyService
      .getLeadsLocations(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.locations = response.locations;
          this.allLocations = this.locations;
          this.refreshTable(this.locations);
          this.isloading = false;
        },
        (error) => {
          
        }
      );
  }

  create() {
    this.locationForm.controls["location"].setValue("");
    this.locationForm.controls["slug"].setValue("");

    this.mode = "add";
    this.formSubmitted = false;

    this.modalbutton0?.nativeElement.click();
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.locations = this.filterLocations();
    this.refreshTable(this.locations);
  }

  filterLocations() {
    let locations = this.allLocations;
    if (locations?.length > 0 && this.searchKeyword) {
      return locations.filter((m) => {
        let include = false;
        if (
          m.location &&
          m.location.toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .indexOf(
            this.searchKeyword
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
          ) >= 0
          || searchSpecialCase(this.searchKeyword, m.location)
        ) {
          include = true;
        }

        return include;
      });
    } else {
      return locations;
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
      this.locations.slice(
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

  deleteLocation(item) {
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteMember"
    );
    this.acceptText = "OK";
    this.selectedItem = item.id;
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    this._companyService.deleteLeadsLocation(this.selectedItem).subscribe(
      (response) => {
        this.locations.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.locations.splice(index, 1);
          }
        });
        this.allLocations.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.allLocations.splice(index, 1);
          }
        });
        this.refreshTable(this.locations);
        this.open(
          this._translateService.instant("dialog.deletedsuccessfully"),
          ""
        );
        this.showConfirmationModal = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  save() {
    this.formSubmitted = true;

    if (
      this.locationForm.get("location")?.errors ||
      this.locationForm.get("slug")?.errors
    ) {
      return false;
    }

    let params = {
      location: this.locationForm.get("location")?.value,
      slug: this.locationForm.get("slug")?.value,
      company_id: this.companyId,
      created_by: this.userId,
    };

    if (this.mode == "add") {
      this._companyService.addLeadsLocation(params).subscribe(
        (response) => {
          this.closemodalbutton0?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          setTimeout(() => {
            this.getLocations();
          }, 500);
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._companyService.editLeadsLocation(this.selectedId, params).subscribe(
        (response) => {
          this.closemodalbutton0?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getLocations();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  editLocation(item) {
    this.selectedId = item.id;
    this.location = item.location;
    this.slug = item.slug;
    this.description = item.description;
    this.selectedLocation = item.location_id || '';

    this.locationForm.controls["location"].setValue(this.location);
    this.locationForm.controls["slug"].setValue(this.slug);

    this.mode = "edit";
    this.modalbutton0?.nativeElement.click();
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