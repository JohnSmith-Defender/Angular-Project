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
import { CityGuidesService } from "@features/services";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IconFilterComponent, ToastComponent } from "@share/components";
import { environment } from "@env/environment";
import moment from "moment";

@Component({
  selector: "app-city-guide-admin-list",
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
    IconFilterComponent,
  ],
  templateUrl: "./admin-list.component.html",
})
export class CityGuideAdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;
  @Input() company: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() canCreateCityGuide: any;
  @Input() cityGuideTitle: any;
  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() status: any;
  @Input() language: any;

  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  allCityGuidesData: any = [];
  cityGuidesData: any = [];
  searchKeyword: any;
  dataSource: any;
  displayedColumns = [
    "title_display",
    "status_display",
    "city_display",
    "likes",
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
  cities: any = [];
  apiPath: string = environment.api + "/";
  selectedCity: any;

  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _cityGuidesService: CityGuidesService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnChanges(changes: SimpleChange) {
    let statusChange = changes["status"];
    if (statusChange.previousValue != statusChange.currentValue) {
      this.status = statusChange.currentValue;
      this.loadCityGuides(this.allCityGuidesData);
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
    this.fetchCityGuidesManagementData();
    this.initializeSearch();
  }

  fetchCityGuidesManagementData() {
    this._cityGuidesService
      .fetchCityGuides(this.company?.id, this.userId, "all")
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.cities = data?.cities || [];
          this.formatCityGuides(data || []);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatCityGuides(result) {
    let data;
    let city_guides = result.city_guides;
    let city_guide_likes = result.city_guide_likes;

    if (city_guides?.length > 0) {
      data = city_guides?.map((city_guide) => {

        let likes = city_guide_likes?.filter((g) => {
          return g.object_id == city_guide.id;
        });

        return {
          ...city_guide,
          title_display: this.getCityGuideName(city_guide),
          city_display: this.getCity(city_guide),
          likes: likes?.length || 0,
          status_display:
            city_guide.status == 1
              ? this._translateService.instant("company-settings.active")
              : this._translateService.instant("company-settings.inactive"),
        };
      });
    }
    if (this.allCityGuidesData?.length == 0) {
      this.allCityGuidesData = data;
    }

    if (data?.length > 0) {
      data = data.sort((a, b) => {
        const oldDate: any = new Date(a.created_at);
        const newDate: any = new Date(b.created_at);
        return newDate - oldDate;
      });
    }

    this.loadCityGuides(data);
  }

  getCityGuideName(guide) {
    return guide
      ? this.language == "en"
        ? guide.name_EN || guide.name_ES
        : this.language == "fr"
        ? guide.name_FR || guide.name_ES
        : this.language == "eu"
        ? guide.name_EU || guide.name_ES
        : this.language == "ca"
        ? guide.name_CA || guide.name_ES
        : this.language == "de"
        ? guide.name_DE || guide.name_ES
        : guide.name_ES
      : "";
  }

  getCity(guide) {
    let city = '';

    if(this.cities?.length > 0) {
      let city_row = this.cities?.find((f) => f.id == guide?.city_id);
      if(city_row) {
        city = city_row.city;
      }
    }

    return city;
  }

  loadCityGuides(data) {
    this.cityGuidesData = data?.filter((city_guide) => {
      let status = this.status == "active" ? 1 : 0;
      return status == (city_guide.status || 0);
    });

    if (this.searchKeyword && this.cityGuidesData) {
      this.cityGuidesData = this.cityGuidesData.filter((city_guide) => {
        return (
          (city_guide.name_ES &&
            city_guide.name_ES
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (city_guide.name_EN &&
            city_guide.name_EN
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (city_guide.name_FR &&
            city_guide.name_FR
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (city_guide.name_EU &&
            city_guide.name_EU
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (city_guide.name_CA &&
            city_guide.name_CA
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
          (city_guide.name_DE &&
            city_guide.name_DE
              .toLowerCase()
              .indexOf(this.searchKeyword.toLowerCase()) >= 0)
        );
      });
    }

    if(this.selectedCity) {
      let city = this.cities?.find((f) => f.city == this.selectedCity);
      if(city) {
        this.cityGuidesData = this.cityGuidesData.filter(p => {
          return p.city_id == city?.id
        })
      }
  }

    this.refreshTable(this.cityGuidesData);
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
    this._router.navigate([`/cityguide/create/0`]);
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.loadCityGuides(this.allCityGuidesData);
  }

  filterCity(event) {
    this.list?.forEach((item) => {
        if (item.city === event) {
          item.selected = true;
        } else {
          item.selected = false;
        }
    });
    this.selectedCity = event || "";
    this.loadCityGuides(this.allCityGuidesData);
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.cityGuidesData.slice(
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
    this._router.navigate([`/cityguide/details/${id}`]);
  }

  editItem(id) {
    this._router.navigate([`/cityguide/edit/${id}`]);
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
      this._cityGuidesService.deleteCityGuide(id, this.userId).subscribe(
        (response) => {
          let all_city_guides = this.allCityGuidesData;
          if (all_city_guides?.length > 0) {
            all_city_guides.forEach((job_offer, index) => {
              if (job_offer.id == id) {
                all_city_guides.splice(index, 1);
              }
            });
          }

          let city_guides = this.cityGuidesData;
          if (city_guides?.length > 0) {
            city_guides.forEach((city_guide, index) => {
              if (city_guide.id == id) {
                city_guides.splice(index, 1);
              }
            });
          }
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this.cityGuidesData = city_guides;
          this.refreshTable(this.cityGuidesData);
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