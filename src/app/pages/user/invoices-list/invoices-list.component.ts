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
  PageTitleComponent,
  ToastComponent,
} from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
  ExcelService,
} from "@share/services";
import { TestimonialsService } from "@features/services";
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
import moment from 'moment';
import get from "lodash/get";

@Component({
  selector: "app-invoices-list",
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
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: "./invoices-list.component.html",
})
export class InvoicesListComponent {
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
  selectedId: any;
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ['recipient_name', 'created_at', 'invoice_no', 'base', 'iva', 'amount', 'action'];
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  searchKeyword: any;
  company: any;
  user: any;
  superAdmin: boolean = false;
  invoices: any = [];
  allInvoices: any = [];
  selectedInvoice: any;
  memberTypes: any = [];
  selectedCustomMemberType: any = '';
  invoiceDetails: any;
  senders: any = [];
  selectedSender: any = '';

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _testmonialsService: TestimonialsService,
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
    this.initializeSearch();
    this.getInvoices();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getInvoices() {
    this._companyService.fetchInvoicesData(this.companyId, this.userId)
      .subscribe(
        data => {
          this.user = data?.user;
          this.mapUserPermissions(data?.user_permissions);
          this.initData(data);
          this.formatInvoices(data?.invoices);
          this.allInvoices = this.invoices;
          this.refreshTable(this.invoices);
          this.isloading = false
        },
        error => {
          console.log(error)
        }
      )
  }

  initData(data) {
    this.invoiceDetails = data?.invoice_details;
    if(this.invoiceDetails) {
      this.senders.push(`De ${this.invoiceDetails.name}`)
      this.senders.push(`Para ${this.invoiceDetails.name}`)
    }

    this.memberTypes = data?.member_types?.filter(type => {
      return type.require_payment == 1
    });
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
  }

  getTypeTitle(type) {
    return this.language == "en"
      ? type.type || type.type_es
      : this.language == "fr"
      ? type.type_fr || type.type_es
      : this.language == "eu"
      ? type.type_eu || type.type_es
      : this.language == "ca"
      ? type.type_ca || type.type_es
      : this.language == "de"
      ? type.type_de || type.type_es
      : type.type_es;
  }

  formatInvoices(invoices) {
    this.invoices = invoices;
    if(!this.superAdmin) {
      this.invoices = invoices?.filter(invoice => {
        return invoice?.user?.id == this.userId
      })
    }
    this.invoices = this.invoices?.map((item) => {
      return {
        base: item?.amount > 0 ? item?.base : '0.00',
        iva: item?.amount > 0 ? (item?.iva ? ('€' + item?.iva) : '€ 0.00') : '€ 0.00',
        ...item,
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
      this.invoices.slice(
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

  viewInvoice(invoice) {
    this._companyService.viewInvoice(invoice.id).subscribe(data => {
      setTimeout(() => {
        const link = `${environment.api}/get-invoice-file/${invoice.invoice_no.replace('/', '_')}.pdf`
        window.open(
          link,
          '_blank'
        )
      }, 2000)
    }, err => {
      console.log('err: ', err);
    })
  }

  resendInvoice(invoice) {
    this._companyService.resendInvoice(invoice.id).subscribe(data => {
      this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
    }, err => {
      console.log('err: ', err);
    })
  }

  downloadExcel() {
    let invoices: any[] = []
    if(this.invoices) {
      this.invoices.forEach(invoice => {
        invoices.push({
          'Nombre': invoice.recipient_name,
          'Fecha': moment(invoice.created_at).format("YYYY=MM-DD"),
          'Factura N°': invoice.invoice_no,
          'Email': invoice.email,
          'Nombre del remitente': invoice.sender_name,
          'Dirección del remitente': `${invoice.sender_address1} ${invoice.sender_address2}`,
          'NIF/CIF del remitente': `${invoice.sender_if_label}: ${invoice.sender_if}`,
          'Nombre del Recipiente': invoice.recipient_name,
          'Dirección del destinatario':`${invoice.recipient_address1} ${invoice.recipient_address2}`,
          'NIF/CIF del destinatario': `${invoice.recipient_if_label}: ${invoice.recipient_if}`,
          'Base': invoice.base,
          'IVA': invoice.iva ? invoice.iva : '',
          'Total': invoice.amount,
        })
      })
    }
    this._excelService.exportAsExcelFile(invoices, 'Facturas')
  }

  handleMemberTypeChange(event) {
    this.filterInvoices();
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.filterInvoices();
  }

  filterInvoices() {
    let invoices = this.allInvoices;
    if (invoices?.length > 0 && this.searchKeyword) {
      return invoices.filter((m) => {
        let include = false;
        if (
          (m.recipient_name &&
            m.recipient_name
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
    }

    if(this.selectedCustomMemberType) {
      invoices = invoices?.filter((c) => {
        return c.custom_member_type_id == this.selectedCustomMemberType
      })
    }

    this.invoices = invoices;
    this.formatInvoices(this.invoices);
    this.refreshTable(this.invoices);
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