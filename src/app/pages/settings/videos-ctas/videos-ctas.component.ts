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
  LocalService,
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
  selector: "app-settings-lead-videos-ctas",
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
    MatTabsModule,
    SearchComponent,
    BreadcrumbComponent,
    PageTitleComponent,
    ToastComponent,
  ],
  templateUrl: "./videos-ctas.component.html",
})
export class LandingVideosCTAsComponent {
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
  videosCTAsForm = new FormGroup({
    title: new FormControl("", [Validators.required]),
    description: new FormControl(""),
    slug: new FormControl("", [Validators.required]),
  });
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ["title", "slug", "action"];
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
  videosCTAs: any = [];
  allVideosCTAs: any = [];
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
  slug: any;
  tabIndex = 0;
  tabSelected: boolean = false;

  activateTimedButton: boolean = false;
  selectedTimerOption: any = '';
  timerOptions: any = [];
  timedDuration: any;

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
    this.timerOptions = [
      {
        value: 'video',
        text: this._translateService.instant('videos-ctas.videotime')
      },
      {
        value: 'time',
        text: this._translateService.instant('videos-ctas.time')
      }
    ]
    initFlowbite();
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.getVideosCTAs();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.channels"
    );
    this.level3Title = "TikTok";
    this.level4Title = this._translateService.instant("leads.videosandctas");
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  async getVideosCTAs() {
    this._companyService
      .getVideosCTAs(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.videosCTAs = response.videos_ctas;
          this.allVideosCTAs = this.videosCTAs;
          this.refreshTable(this.videosCTAs);
          this.isloading = false;
        },
        (error) => {
          
        }
      );
  }

  create() {
    this.videosCTAsForm.controls["title"].setValue("");
    this.videosCTAsForm.controls["description"].setValue("");

    this.mode = "add";
    this.formSubmitted = false;

    this.modalbutton0?.nativeElement.click();
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.videosCTAs = this.filterVideosCTAs();
    this.refreshTable(this.videosCTAs);
  }

  filterVideosCTAs() {
    let videosCTAs = this.allVideosCTAs;
    if (videosCTAs?.length > 0 && this.searchKeyword) {
      return videosCTAs.filter((m) => {
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
      return videosCTAs;
    }
  }

  refreshTable(array) {
    this.dataSource = new MatTableDataSource(array);
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort));
    }
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.videosCTAs.slice(
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

  deleteVideosCTAs(item) {
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
    this._companyService.deleteVideosCTAs(this.selectedItem).subscribe(
      (response) => {
        this.videosCTAs.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.videosCTAs.splice(index, 1);
          }
        });
        this.allVideosCTAs.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.allVideosCTAs.splice(index, 1);
          }
        });
        this.refreshTable(this.videosCTAs);
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
      this.videosCTAsForm.get("title")?.errors ||
      this.videosCTAsForm.get("slug")?.errors
    ) {
      return false;
    }

    let params = {
      title: this.videosCTAsForm.get("title")?.value,
      description: this.videosCTAsForm.get("description")?.value,
      slug: this.videosCTAsForm.get("slug")?.value,
      company_id: this.companyId,
      created_by: this.userId,
    };

    if (this.mode == "add") {
      this._companyService.addVideosCTAs(params).subscribe(
        (response) => {
          this.closemodalbutton0?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          setTimeout(() => {
            this.getVideosCTAs();
          }, 500);
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._companyService.editVideosCTAs(this.selectedId, params).subscribe(
        (response) => {
          this.closemodalbutton0?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getVideosCTAs();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  editVideosCTAs(item) {
    this.selectedItem = item;
    this.selectedId = item.id;
    this.title = item.title;
    this.description = item.description;
    this.slug = item.slug;

    this.videosCTAsForm.controls["title"].setValue(this.title);
    this.videosCTAsForm.controls["description"].setValue(this.description);
    this.videosCTAsForm.controls["slug"].setValue(this.slug);

    this.activateTimedButton = item?.timed_cta == 1 ? true : false;
    this.selectedTimerOption = item?.cta_time == 1 ? 'time' : (item?.cta_video_time == 1 ? 'video' : '')
    this.timedDuration = item?.duration || 0

    this.mode = "edit";
    this.modalbutton0?.nativeElement.click();
  }

  editVideosCTAsTemplate(item) {
    // this._router.navigate([`/settings/tiktok/video-cta/template/${item?.id}`])
    location.href = `/settings/tiktok/video-cta/template/${item?.id}`;
  }

  copyLink(row) {
    let slug = row.slug;
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = `https://${this.company?.url}/tiktok/video-cta/${slug}`;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);

    this.open(this._translateService.instant("checkout.linkgenerated"), "");
  }

  changeTab(event) {

  }

  saveCTASettings() {
    let params = {
      timed_cta: this.activateTimedButton ? 1 : 0,
      cta_time: this.selectedTimerOption == 'time' ? 1 : 0,
      cta_video_time: this.selectedTimerOption == 'video' ? 1 : 0,
      duration: this.timedDuration || null,
    }
    this._companyService.editVideosCTAsCTASettings(this.selectedId, params).subscribe(
      (response) => {
        this.closemodalbutton0?.nativeElement.click();
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
        this.getVideosCTAs();
      },
      (error) => {
        console.log(error);
      }
    );
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