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
  selector: "app-manage-stripe-accounts",
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
  templateUrl: "./stripe-accounts.component.html",
})
export class ManageStripeAccountsComponent {
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
  otherStripeAccounts: any = [];
  allOtherStripeAccounts: any = [];
  selectedId: any;
  mode: any;
  formSubmitted: boolean = false;
  stripeForm = new FormGroup({
    'name': new FormControl('', [Validators.required]),
    'secret_key': new FormControl('', [Validators.required]),
    'publishable_key': new FormControl('', [Validators.required]),
    'cancel_subscription_text': new FormControl('', [Validators.required]),
    'stripe_account_id': new FormControl(''),
    'status': new FormControl(''),
    'default_account': new FormControl(''),
  })
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ['name' , 'secret_key', 'publishable_key', 'cancel_subscription_text', 'stripe_account_id', 'account_type', 'action'];
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
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  searchKeyword: any;
  selectedStatus: any;
  confirmationMode: any;
  webhooks: any;
  hasWebhook: boolean = false;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _excelService: ExcelService,
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
    this.getStripeAccounts();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.general"
    );
    this.level3Title = "Stripe";
    this.level4Title = "";
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getStripeAccounts() {
    this._companyService
      .getStripeAccounts(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.otherStripeAccounts = response['other_stripe_accounts'];
          this.allOtherStripeAccounts = this.otherStripeAccounts;
          this.refreshTable(this.otherStripeAccounts);
          this.isloading = false;
        },
        (error) => {
          let errorMessage = <any>error;
          if (errorMessage != null) {
            let body = JSON.parse(error._body);
          }
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
      this.otherStripeAccounts.slice(
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
    this.otherStripeAccounts = this.filterStripeAccounts();
    this.refreshTable(this.otherStripeAccounts);
  }

  filterStripeAccounts() {
    let otherStripeAccounts = this.allOtherStripeAccounts;
    if (otherStripeAccounts?.length > 0 && this.searchKeyword) {
      return otherStripeAccounts.filter((m) => {
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
      return otherStripeAccounts;
    }
  }

  toggleStripeAccountStatus(status, row){
    this.getStripeAccounts()
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteMember"
    );
    this.acceptText = "OK";
    this.confirmationMode = "update-status";
    this.selectedItem = row.id;
    this.selectedStatus = status;
    setTimeout(() => (this.showConfirmationModal = true));
  }

  create() {
    this.selectedId = -1
    this.stripeForm.controls['name'].setValue('')
    this.stripeForm.controls['secret_key'].setValue('')
    this.stripeForm.controls['publishable_key'].setValue('')
    this.stripeForm.controls['cancel_subscription_text'].setValue('')
    this.stripeForm.controls['stripe_account_id'].setValue('')
    this.stripeForm.controls['status'].setValue('')

    this.mode = "add";
    this.formSubmitted = false;

    this.modalbutton?.nativeElement.click();
  }

  editStripeAccount(item) {
    this.getStripeWebhooks(item.id);
    this.selectedId = item.id;
    this.stripeForm.controls['name'].setValue(item.name)
    this.stripeForm.controls['secret_key'].setValue(item.secret_key)
    this.stripeForm.controls['publishable_key'].setValue(item.publishable_key)
    this.stripeForm.controls['cancel_subscription_text'].setValue(item.cancel_subscription_text)
    this.stripeForm.controls['stripe_account_id'].setValue(item.stripe_account_id)
    this.stripeForm.controls['status'].setValue(item.status)

    this.mode = "edit";
    this.modalbutton?.nativeElement.click();
  }

  getStripeWebhooks(id) {
    this._companyService.getOtherStripeWebhooks(this.companyId, id).subscribe(
      async response => {
        this.webhooks = response.webhooks
        this.checkExistingWebhook()
      },
      error => {
        console.log(error)
      }
    )
  }

  checkExistingWebhook() {
    let exist = false

    let stripe_webhook_vcp = this.webhooks && this.webhooks.filter(webhook => {
      return webhook.url.indexOf('stripe-webhook-vcp') >= 0
    })
    if(stripe_webhook_vcp && stripe_webhook_vcp.length > 0) {
      exist = true
    } else {
      exist = false
    }
    
    this.hasWebhook = exist
  }

  createWebhook(id) {
    this._companyService.createOtherStripeWebhook(this.companyId, id).subscribe(
      async response => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        location.reload()
      },
      error => {
        console.log(error)
      }
    )
  }

  save() {
    this.formSubmitted = true;

    if(this.stripeForm.get('name')?.errors
    || this.stripeForm.get('secret_key')?.errors
      || this.stripeForm.get('publishable_key')?.errors
      || this.stripeForm.get('cancel_subscription_text')?.errors
    ) {
      return false;
    }

    let params = {
      id: this.selectedId,
      name: this.stripeForm.get('name')?.value,
      secret_key: this.stripeForm.get('secret_key')?.value,
      publishable_key: this.stripeForm.get('publishable_key')?.value,
      cancel_subscription_text: this.stripeForm.get('cancel_subscription_text')?.value,
      stripe_account_id: this.stripeForm.get('stripe_account_id')?.value,
      status: this.stripeForm.get('status')?.value,
      default_account: 0,
      company_id: this.companyId
    }

    if (this.mode == "add") {
      this._companyService.addStripeAccount(this.companyId, params).subscribe(
        (response) => {
          this.closemodalbutton?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getStripeAccounts();
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._companyService.editStripeAccount(this.companyId, params).subscribe(
        (response) => {
          this.closemodalbutton?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getStripeAccounts();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  deleteStripeAccount(item) {
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteMember"
    );
    this.acceptText = "OK";
    this.confirmationMode = "delete";
    this.selectedItem = item.id;
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    if(this.confirmationMode == "update-status") {
      this._companyService.toggleStripeAccountStatus(
        this.companyId,
        {
          id: this.selectedItem,
          status: this.selectedStatus
        }
      ).subscribe(
        async response => {
          this.getStripeAccounts()
        }
      )
    } else if(this.confirmationMode == "delete") {
      this._companyService.deleteStripeAccount(this.companyId, {
        id: this.selectedItem
      }).subscribe(
        (response) => {
          this.otherStripeAccounts.forEach((cat, index) => {
            if (cat.id == this.selectedItem) {
              this.otherStripeAccounts.splice(index, 1);
            }
          });
          this.allOtherStripeAccounts.forEach((cat, index) => {
            if (cat.id == this.selectedItem) {
              this.allOtherStripeAccounts.splice(index, 1);
            }
          });
          this.refreshTable(this.otherStripeAccounts);
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