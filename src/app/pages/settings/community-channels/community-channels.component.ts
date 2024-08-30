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
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  ExcelService,
  LocalService,
  UserService,
} from "@share/services";
import { PlansService } from "@features/services";
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

@Component({
  selector: "app-manage-community-channels",
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
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: "./community-channels.component.html",
})
export class CommunityChannelsComponent {
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
  channels: any = [];
  allChannels: any = [];
  selectedId: any;
  coupon: any;
  mode: any;
  formSubmitted: boolean = false;
  channelForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
  });
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ["name", "type", "action"];
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
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  searchKeyword: any;
  name: any;
  amountOff: any;
  percentOff: any;
  selectedPlan: any = '';
  selectedType: any = '';
  plans: any = [];
  isUESchoolOfLife: boolean = false;

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
      this.isUESchoolOfLife = this._companyService.isUESchoolOfLife(company[0]);
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
    this.getPlans();
    this.getChannels();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.invoices"
    );
    this.level3Title = this._translateService.instant(
      "company-settings.channels"
    );
    this.level4Title = this._translateService.instant("community.communitychannels");
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getPlans() {
    this._plansService
    .fetchPlansCombined(this.companyId, "active", false, '')
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (data) => {
        this.plans = data?.plans || [];
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getChannels() {
    this._companyService
      .getChannels(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.formatChannels(response.channels);
          this.refreshTable(this.channels);
          this.isloading = false;
        },
        (error) => {
          console.log(error)
        }
      );
  }

  formatChannels(channels) {
    channels = channels?.filter(channel => {
      return !channel?.course_id
    })
    channels = channels?.map((item) => {
      return {
        ...item,
        id: item?.channel_id,
        name: item?.channel_name,
        type: item?.plan_id > 0 ? this._translateService.instant('plans.activity') : '',
      };
    });

    this.channels = channels;
    this.allChannels = channels;
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
      this.channels.slice(
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

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.channels = this.filterCoupons();
    this.refreshTable(this.channels);
  }

  filterCoupons() {
    let channels = this.allChannels;
    if (channels?.length > 0 && this.searchKeyword) {
      return channels.filter((m) => {
        let include = false;
        if (
          m.name &&
          m.name.toLowerCase()
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
      return channels;
    }
  }

  create() {
    this.channelForm.controls["name"].setValue("");

    this.mode = "add";
    this.formSubmitted = false;

    this.modalbutton?.nativeElement.click();
  }

  editChannel(item) {
    this.selectedId = item.id;
    this.name = item?.channel_name || item?.name;
    this.selectedType = item?.plan_id > 0 ? 'plan' : '';
    this.selectedPlan = item?.plan_id > 0 ? item?.plan_id : '';

    this.channelForm.controls["name"].setValue(this.name);

    this.mode = "edit";
    this.modalbutton?.nativeElement.click();
  }

  save() {
    this.formSubmitted = true;

    if (
      this.channelForm.get("name")?.errors
    ) {
      return false;
    }

    let selected_plan_row = this.plans?.filter(plan => {
      return plan?.id == this.selectedPlan
    })
    let selected_plan = selected_plan_row?.length > 0 ? selected_plan_row[0]: '';
    let params = {
      name: this.channelForm.get("name")?.value,
      plan_id: selected_plan?.id || 0,
      plan_type_id: selected_plan?.plan_type_id || 0,
      group_id: 0,
      status: 1,
      company_id: this.companyId,
    };

    if (this.mode == "add") {
      this._companyService.addChannel(params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getChannels();
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._companyService.editChannel(this.selectedId, params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getChannels();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  deleteChannel(item) {
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteitem"
    );
    this.acceptText = "OK";
    this.selectedItem = item.id;
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    this._companyService.deleteChannel(this.selectedItem).subscribe(
      (response) => {
        this.channels.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.channels.splice(index, 1);
          }
        });
        this.allChannels.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.allChannels.splice(index, 1);
          }
        });
        this.refreshTable(this.channels);
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