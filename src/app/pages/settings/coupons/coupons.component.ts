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
  selector: "app-manage-coupons",
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
  templateUrl: "./coupons.component.html",
})
export class CouponsComponent {
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
  coupons: any = [];
  allCoupons: any = [];
  selectedId: any;
  coupon: any;
  mode: any;
  formSubmitted: boolean = false;
  couponForm = new FormGroup({
    coupon: new FormControl("", [Validators.required]),
    name: new FormControl("", [Validators.required]),
    amount_off: new FormControl(""),
    percent_off: new FormControl(""),
  });
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ["name", "amount_off", "percent_off", "action"];
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
    this.getCoupons();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.invoices"
    );
    this.level3Title = "Stripe";
    this.level4Title = this._translateService.instant("company-settings.coupons");
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getCoupons() {
    this._companyService
      .getCoupons(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.coupons = response.coupons;
          this.allCoupons = this.coupons;
          this.refreshTable(this.coupons);
          this.isloading = false;
        },
        (error) => {
          console.log(error)
        }
      );
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
      this.coupons.slice(
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
    this.coupons = this.filterCoupons();
    this.refreshTable(this.coupons);
  }

  filterCoupons() {
    let coupons = this.allCoupons;
    if (coupons?.length > 0 && this.searchKeyword) {
      return coupons.filter((m) => {
        let include = false;
        if (
          (m.coupon &&
          m.coupon.toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .indexOf(
            this.searchKeyword
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
          ) >= 0) ||
          (m.name &&
            m.name.toLowerCase()
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
      return coupons;
    }
  }

  create() {
    this.couponForm.controls["coupon"].setValue("");
    this.couponForm.controls["name"].setValue("");
    this.couponForm.controls["amount_off"].setValue("");
    this.couponForm.controls["percent_off"].setValue("");

    this.mode = "add";
    this.formSubmitted = false;

    this.modalbutton?.nativeElement.click();
  }

  editCoupon(item) {
    this.selectedId = item.id;
    this.coupon = item.name || item.coupon;
    this.name = item.name;
    this.amountOff = item.amount_off || '';
    this.percentOff = item.percent_off || '';

    this.couponForm.controls["coupon"].setValue(this.coupon);
    this.couponForm.controls["name"].setValue(this.coupon);
    this.couponForm.controls["amount_off"].setValue(this.amountOff);
    this.couponForm.controls["percent_off"].setValue(this.percentOff);

    this.mode = "edit";
    this.modalbutton?.nativeElement.click();
  }

  save() {
    this.formSubmitted = true;

    if (
      this.couponForm.get("coupon")?.errors // ||
      // this.couponForm.get("name")?.errors
    ) {
      return false;
    }

    let params = {
      coupon: this.couponForm.get("coupon")?.value,
      name: this.couponForm.get("coupon")?.value,
      amount_off: this.couponForm.get('amount_off')?.value,
      percent_off: this.couponForm.get('percent_off')?.value,
      company_id: this.companyId,
    };

    if (this.mode == "add") {
      this._companyService.addCoupon(params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getCoupons();
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._companyService.editCoupon(this.selectedId, params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getCoupons();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  deleteCoupon(item) {
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
    this._companyService.deleteCoupon(this.selectedItem, this.companyId).subscribe(
      (response) => {
        this.coupons.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.coupons.splice(index, 1);
          }
        });
        this.allCoupons.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.allCoupons.splice(index, 1);
          }
        });
        this.refreshTable(this.coupons);
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