import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  Input,
  SimpleChange,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { SearchComponent } from "@share/components/search/search.component";
import { JobOffersService } from "@features/services";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ToastComponent } from "@share/components";
import { environment } from "@env/environment";
import moment from "moment";

@Component({
  selector: "app-job-offers-admin-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    SearchComponent,
    ToastComponent,
  ],
  templateUrl: "./admin-list.component.html",
})
export class JobOffersAdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;
  @Input() company: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() canCreateJobOffer: any;
  @Input() jobOffersTitle: any;
  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() status: any;
  @Input() language: any;

  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  jobOfferApplications: any = [];
  allJobOffersData: any = [];
  jobOffersData: any = [];
  searchKeyword: any;
  dataSource: any;
  displayedColumns = [
    "title_display",
    "status_display",
    "type_display",
    "date_display",
    "candidates",
    "action",
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: string = "";
  confirmDeleteItemDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  types: any = [];
  apiPath: string = environment.api + "/get-job-cv-file/";

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _jobOffersService: JobOffersService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnChanges(changes: SimpleChange) {
    let statusChange = changes["status"];
    if (statusChange.previousValue != statusChange.currentValue) {
      this.status = statusChange.currentValue;
      this.loadJobOffers(this.allJobOffersData);
    }
  }

  async ngOnInit() {
    this.onResize();

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
    this.fetchJobOffersManagementData();
    this.initializeSearch();
  }

  fetchJobOffersManagementData() {
    this._jobOffersService
      .fetchJobOffers(this.company?.id, this.userId, "all")
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.types = data?.job_types || [];
          this.jobOfferApplications = data?.job_offer_applications || [];
          this.formatJobOffers(data?.job_offers || []);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatJobOffers(offers) {
    let data;
    if (offers?.length > 0) {
      data = offers?.map((offer) => {
        let applications = this.jobOfferApplications?.filter((pp) => {
          return pp.job_offer_id == offer.id;
        });

        let type_row = this.types?.filter((jt) => {
          return jt.id == offer.type_id;
        });
        return {
          ...offer,
          title_display: this.getOfferTitle(offer),
          status_display:
            offer.status == 1
              ? this._translateService.instant("company-settings.active")
              : this._translateService.instant("company-settings.inactive"),
          type_display:
            type_row?.length > 0 ? this.getTypeTitle(type_row[0]) : "",
          date_display: moment(offer.created_at).format("DD MMM YYYY"),
          applications,
        };
      });
    }
    if (this.allJobOffersData?.length == 0) {
      this.allJobOffersData = data;
    }

    if (data?.length > 0) {
      data = data.sort((a, b) => {
        const oldDate: any = new Date(a.created_at);
        const newDate: any = new Date(b.created_at);
        return newDate - oldDate;
      });
    }

    this.loadJobOffers(data);
  }

  getOfferTitle(offer) {
    return offer
      ? this.language == "en"
        ? offer.title_en || offer.title
        : this.language == "fr"
        ? offer.title_fr || offer.title
        : this.language == "eu"
        ? offer.title_eu || offer.title
        : this.language == "ca"
        ? offer.title_ca || offer.title
        : this.language == "de"
        ? offer.title_de || offer.title
        : offer.title
      : "";
  }

  getTypeTitle(type) {
    return type
      ? this.language == "en"
        ? type.title_en || type.title
        : this.language == "fr"
        ? type.title_fr || type.title
        : this.language == "eu"
        ? type.title_eu || type.title
        : this.language == "ca"
        ? type.title_ca || type.title
        : this.language == "de"
        ? type.title_de || type.title
        : type.title
      : "";
  }

  loadJobOffers(data) {
    this.jobOffersData = data?.filter((offer) => {
      let status = this.status == "active" ? 1 : 0;
      return status == (offer.status || 0);
    });

    if (this.searchKeyword && this.jobOffersData) {
      this.jobOffersData = this.jobOffersData.filter((offer) => {
        return (
          (offer.title &&
            offer.title
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (offer.title_en &&
            offer.title_en
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (offer.title_fr &&
            offer.title_fr
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (offer.location &&
            offer.location
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (offer.company &&
            offer.company
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0)
        );
      });
    }

    this.refreshTable(this.jobOffersData);
  }

  refreshTable(list) {
    this.dataSource = new MatTableDataSource(
      list.slice(
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
      new MatTableDataSource(list).paginator = this.paginator;
      if (this.pageIndex > 0) {
      } else {
        this.paginator.firstPage();
      }
    } else {
      setTimeout(() => {
        if (this.paginator) {
          new MatTableDataSource(list).paginator = this.paginator;
          if (this.pageIndex > 0) {
            this.paginator.firstPage();
          }
        }
      });
    }
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  handleCreateRoute() {
    this._router.navigate([`/employmentchannel/create/0`]);
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.loadJobOffers(this.allJobOffersData);
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.jobOffersData.slice(
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

  viewItem(id) {
    this._router.navigate([`/employmentchannel/job/${id}`]);
  }

  editItem(id) {
    this._router.navigate([`/employmentchannel/edit/${id}`]);
  }

  confirmDeleteItem(id) {
    this.showConfirmationModal = false;
    this.selectedItem = id;
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
    this.deleteItem(this.selectedItem, true);
    this.showConfirmationModal = false;
  }

  deleteItem(id, confirmed) {
    if (confirmed) {
      this._jobOffersService.deleteJobOffer(id).subscribe(
        (response) => {
          let all_job_offers = this.allJobOffersData;
          if (all_job_offers?.length > 0) {
            all_job_offers.forEach((job_offer, index) => {
              if (job_offer.id == id) {
                all_job_offers.splice(index, 1);
              }
            });
          }

          let job_offers = this.jobOffersData;
          if (job_offers?.length > 0) {
            job_offers.forEach((job_offer, index) => {
              if (job_offer.id == id) {
                job_offers.splice(index, 1);
              }
            });
          }
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this.jobOffersData = job_offers;
          this.refreshTable(this.jobOffersData);
        },
        (error) => {
          console.log(error);
        }
      );
    }
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