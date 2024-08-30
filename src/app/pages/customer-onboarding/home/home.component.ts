import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { Router } from "@angular/router";
import {
  LocalService,
  CompanyService,
} from "src/app/share/services";
import { SearchComponent } from "@share/components/search/search.component";
import { NoAccessComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { NgxPaginationModule } from "ngx-pagination";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CustomerCardComponent } from "@share/components/card/customer/customer.component";
import { environment } from "@env/environment";
import { Subject, takeUntil } from "rxjs";
import { FormsModule } from "@angular/forms";
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    NgxPaginationModule,
    MatSnackBarModule,
    FormsModule,
    SearchComponent, 
    PageTitleComponent,
    NoAccessComponent,
    CustomerCardComponent,
    ToastComponent,
],
templateUrl: "./home.component.html",
})
export class CustomerOnboardingHomeComponent {
  private destroy$ = new Subject<void>();

  language: any;
  userId: any;
  companyId: any;
  companies: any;
  companyDomain: any;
  companyImage: any;
  primaryColor: any;
  buttonColor: any;
  searchText: any = "";
  search: any = "";
  placeholderText: any = "";
  isInitialLoad: boolean = false;
  isloading: boolean = true;
  languageChangeSubscription: any;
  menuColor: any;
  user: any;
  createHover: boolean = false;
  superAdmin: boolean = false;
  p: any = 1;
  allCompanies: any = [];
  company: any;
  customerName: any;
  customerURL: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

    let companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";

    let company = this._companyService.getCompany(companies);
    if (company && company[0]) {
      this.company = company[0];
      this.companyId = company[0].id;
      this.companyDomain = company[0].domain;
      this.companyImage = company[0].image;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color;
      this.menuColor = company[0].menu_color
        ? company[0].menu_color
        : "#ffffff";
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

  async initializePage() {
    this.initializeSearch();
    this.loadCustomers();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  async loadCustomers() {
    let all_companies =  get(
        await this._companyService.getCompanies().toPromise(),
        "companies"
    );
    all_companies = all_companies?.filter(company => {
        return company.active == 1
    });
    this.companies = this.formatCompanies(all_companies);
    this.allCompanies = this.companies;
    this.user = this._localService.getLocalStorage(environment.lsuser);
    this.isloading = false;
    this.isInitialLoad = false;
  }

  formatCompanies(companies) {
    companies = companies?.map((item) => {
        return {
          ...item,
          id: item?.id,
          path: `/customers/details/${item.id}`,
          image: `${environment.api}/get-image-company/${item.image}`,
        };
    });

    if(companies?.length > 0) {
      companies = companies?.sort((a, b) => {
        return b.id - a.id;
      });
    }
  
    return companies;
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.filterCustomers();
  }

  filterCustomers() {
    let companies = this.allCompanies
    if (this.search) {
      companies = companies.filter(m => {
        return (
          (m.entity_name && m.entity_name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0)
        )
      })
    }

    this.companies = companies;
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  handleCreateRoute() {
    this._router.navigate([`/customer-onboarding/create`])
  }

  handleEdit(event) {
    this.selectedItem = this.companies?.find((f) => f.id == event);
    this.customerName = this.selectedItem?.entity_name;
    this.customerURL = this.selectedItem?.url;
    this.modalbutton?.nativeElement.click();
  }

  handleDelete(event) {
    this.showConfirmationModal = false;
    this.selectedItem = this.companies?.find((f) => f.id == event);
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
    this.deactivateCustomer(this.selectedItem.id, true);
  }

  deactivateCustomer(id, confirmed) {
    if(confirmed) {
      this._companyService.deactivateCustomer(id)
        .subscribe(
          response => {
            this.loadCustomers();
            this.showConfirmationModal = false;
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
          },
          error => {
            console.log(error)
          }
        )
    }
  }

  saveSiteDetails() {
    let params = {
      company_name: this.customerName,
      url: this.customerURL,
    }
    this._companyService.editCustomerSiteDetails(this.selectedItem?.id, params)
    .subscribe(
      response => {
        this.loadCustomers();
        this.showConfirmationModal = false;
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
        this.closemodalbutton?.nativeElement.click();
      },
      error => {
        console.log(error)
      }
    )
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