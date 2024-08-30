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
import { BlogsService } from "@features/services";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IconFilterComponent, ToastComponent } from "@share/components";
import { environment } from "@env/environment";
import moment from "moment";

@Component({
  selector: "app-blogs-admin-list",
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
export class BlogsAdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;
  @Input() company: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() canCreateBlog: any;
  @Input() blogsTitle: any;
  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() status: any;
  @Input() language: any;

  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  allBlogsData: any = [];
  blogsData: any = [];
  searchKeyword: any;
  dataSource: any;
  displayedColumns = [
    "name_display",
    "status_display",
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
  apiPath: string = environment.api + "/";

  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _blogsService: BlogsService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnChanges(changes: SimpleChange) {
    let statusChange = changes["status"];
    if (statusChange.previousValue != statusChange.currentValue) {
      this.status = statusChange.currentValue;
      this.loadBlogs(this.allBlogsData);
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
    this.fetchBlogsManagementData();
    this.initializeSearch();
  }

  fetchBlogsManagementData() {
    this._blogsService
      .fetchBlogs(this.company?.id, this.userId, "all")
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.formatBlogs(data || []);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatBlogs(result) {
    let data;
    let blogs = result.blogs;

    if (blogs?.length > 0) {
      data = blogs?.map((blog) => {
        return {
          ...blog,
          name_display: this.getBlogName(blog),
          status_display:
            blog.status == 1
              ? this._translateService.instant("company-settings.active")
              : this._translateService.instant("company-settings.inactive"),
        };
      });
    }
    if (this.allBlogsData?.length == 0) {
      this.allBlogsData = data;
    }

    if (data?.length > 0) {
      data = data.sort((a, b) => {
        const oldDate: any = new Date(a.created_at);
        const newDate: any = new Date(b.created_at);
        return newDate - oldDate;
      });
    }

    this.loadBlogs(data);
  }

  getBlogName(blog) {
    return blog
      ? this.language == "en"
        ? blog.name_EN || blog.name_ES
        : this.language == "fr"
        ? blog.name_FR || blog.name_ES
        : this.language == "eu"
        ? blog.name_EU || blog.name_ES
        : this.language == "ca"
        ? blog.name_CA || blog.name_ES
        : this.language == "de"
        ? blog.name_DE || blog.name_ES
        : blog.name_ES
      : "";
  }

  loadBlogs(data) {
    this.blogsData = data?.filter((blog) => {
      let status = this.status == "active" ? 1 : 0;
      return status == (blog.status || 0);
    });

    if (this.searchKeyword && this.blogsData) {
      this.blogsData = this.blogsData.filter((blog) => {
        return (
          (blog.name_ES &&
            blog.name_ES
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (blog.name_EN &&
            blog.name_EN
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (blog.name_FR &&
            blog.name_FR
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (blog.name_EU &&
            blog.name_EU
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (blog.name_CA &&
            blog.name_CA
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (blog.name_DE &&
            blog.name_DE
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0)
        );
      });
    }

    this.refreshTable(this.blogsData);
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
    this._router.navigate([`/blog/create/0`]);
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.loadBlogs(this.allBlogsData);
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.dataSource = new MatTableDataSource(
      this.blogsData.slice(
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
    this._router.navigate([`/blog/details/${id}`]);
  }

  editItem(id) {
    this._router.navigate([`/blog/edit/${id}`]);
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
      this._blogsService.deleteBlog(id).subscribe(
        (response) => {
          let all_blogs = this.allBlogsData;
          if (all_blogs?.length > 0) {
            all_blogs.forEach((blog, index) => {
              if (blog.id == id) {
                all_blogs.splice(index, 1);
              }
            });
          }

          let blogs = this.blogsData;
          if (blogs?.length > 0) {
            blogs.forEach((blog, index) => {
              if (blog.id == id) {
                blogs.splice(index, 1);
              }
            });
          }
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this.blogsData = blogs;
          this.refreshTable(this.blogsData);
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