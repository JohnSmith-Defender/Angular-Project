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
  selector: "app-settings-lead-landing-pages",
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
  templateUrl: "./landing-pages.component.html",
})
export class LandingPagesComponent {
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
  landingPagesForm = new FormGroup({
    title: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ["title", "location", "action"];
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
  landingPages: any = [];
  allLandingPages: any = [];
  title: any;
  description: any;
  selectedLocation: any = '';
  questionLocations: any = [];
  selectedId: any;
  selectedItemId: any;
  selectedDefaultQuestion: any = '';
  questions: any[] = [];
  selectedSpainQuestion: any = '';
  selectedLatamQuestion: any = '';
  selectedOutsideSpainQuestion: any = '';

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
    this.getLandingPages();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.channels"
    );
    this.level3Title = "TikTok";
    this.level4Title = this._translateService.instant("leads.landingpages");
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  async getLandingPages() {
    this._companyService
      .getLeadsLandingPages(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.questions = response.questions;
          this.questionLocations = response.question_locations;
          this.formatLandingPages(response.landing_pages);
          this.allLandingPages = this.landingPages;
          this.refreshTable(this.landingPages);
          this.isloading = false;
        },
        (error) => {
          
        }
      );
  }

  formatLandingPages(landing_pages) {
    landing_pages = landing_pages?.map((item) => {
      return {
        ...item,
        id: item?.id,
        location: this.getLocation(item?.location_id),
      };
    });

    this.landingPages = landing_pages;
  }

  getLocation(id) {
    let location = ''
    if(this.questionLocations?.length > 0) {
      let loc = this.questionLocations?.filter(l => {
        return l.id == id
      })
      if(loc?.length > 0) {
        location = loc[0].location;
      }
    }

    return location
  }

  create() {
    this.landingPagesForm.controls["title"].setValue("");
    this.landingPagesForm.controls["description"].setValue("");
    this.selectedDefaultQuestion = '';
    this.selectedSpainQuestion = '';
    this.selectedOutsideSpainQuestion = '';
    this.selectedLatamQuestion = '';

    this.mode = "add";
    this.formSubmitted = false;

    this.modalbutton0?.nativeElement.click();
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.landingPages = this.filterLandingPages();
    this.refreshTable(this.landingPages);
  }

  filterLandingPages() {
    let landingPages = this.allLandingPages;
    if (landingPages?.length > 0 && this.searchKeyword) {
      return landingPages.filter((m) => {
        let include = false;
        if (
          m.title &&
          m.title.toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .indexOf(
            this.searchKeyword
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
          ) >= 0
          || searchSpecialCase(this.searchKeyword,m.title)
        ) {
          include = true;
        }

        return include;
      });
    } else {
      return landingPages;
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
      this.landingPages.slice(
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

  deleteLandingPage(item) {
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
    this._companyService.deleteLeadsLandingPage(this.selectedItem).subscribe(
      (response) => {
        this.landingPages.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.landingPages.splice(index, 1);
          }
        });
        this.allLandingPages.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.allLandingPages.splice(index, 1);
          }
        });
        this.refreshTable(this.landingPages);
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
      this.landingPagesForm.get("title")?.errors ||
      !this.selectedDefaultQuestion
    ) {
      return false;
    }

    let params = {
      title: this.landingPagesForm.get("title")?.value,
      description: this.landingPagesForm.get("description")?.value,
      company_id: this.companyId,
      location_id: this.selectedLocation,
      category: 'Leads',
      default_question_id: this.selectedDefaultQuestion || null,
      spain_question_id: this.selectedSpainQuestion || null,
      outside_spain_question_id: this.selectedOutsideSpainQuestion || null,
      latam_question_id: this.selectedLatamQuestion || null,
      created_by: this.userId,
    };

    if (this.mode == "add") {
      this._companyService.addLeadsLandingPage(params).subscribe(
        (response) => {
          this.closemodalbutton0?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          setTimeout(() => {
            this.getLandingPages();
          }, 500);
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._companyService.editLeadsLandingPage(this.selectedId, params).subscribe(
        (response) => {
          this.closemodalbutton0?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getLandingPages();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  editLandingPage(item) {
    this.selectedItem = item;
    this.selectedId = item.id;
    this.title = item.title;
    this.description = item.description;
    this.selectedLocation = item.location_id || '';
    this.selectedDefaultQuestion = item.default_question_id || '';
    this.selectedSpainQuestion = item.spain_question_id || '';
    this.selectedOutsideSpainQuestion = item.outside_spain_question_id || '';
    this.selectedLatamQuestion = item.latam_question_id || '';

    this.landingPagesForm.controls["title"].setValue(this.title);
    this.landingPagesForm.controls["description"].setValue(this.description);

    this.mode = "edit";
    this.modalbutton0?.nativeElement.click();
  }

  editLandingPageTemplate(item) {
    // this._router.navigate([`/settings/tiktok/landing-page/template/${item?.id}`])
    location.href = `/settings/tiktok/landing-page/template/${item?.id}`;
  }

  copyLink(row) {
    let location_row = this.questionLocations?.filter(ql => {
      return ql.id == row?.location_id
    })
    let slug = location_row?.length > 0 ? location_row[0].slug : '';
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = `https://${this.company?.url}/tiktok/landing/${slug}`;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);

    this.open(this._translateService.instant("checkout.linkgenerated"), "");
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