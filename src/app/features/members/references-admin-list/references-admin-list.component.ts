import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, HostListener, Input, SimpleChange, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { ToastComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormsModule } from '@angular/forms';
import { MembersService } from '@features/services/members/members.service';
import { environment } from '@env/environment';
import moment from "moment";

@Component({
    selector: 'app-references-admin-list',
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        SearchComponent,
        ToastComponent,
    ],
    templateUrl: './references-admin-list.component.html',
})
export class ReferencesAdminListComponent {
    private destroy$ = new Subject<void>();

    @Input() list: any;
    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() userId: any;
    @Input() superAdmin: any;
    @Input() language: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    referencesData: any = [];
    dataSource: any;
    displayedColumns = ["date_display", "from_name", "to_name", "reference_name", "email", "phone", "reference_description", "reference_action"];
    pageSize: number = 10;
    pageIndex: number = 0;
    searchKeyword: any;
    allReferencesData: any[] = [];
    companyId: any;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: string = "";
    confirmDeleteItemDescription: string = "";
    acceptText: string = "";
    cancelText: string = "";
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
    @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _membersService: MembersService,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
      this.onResize();
      this.language = this._localService.getLocalStorage(environment.lslanguage) || "es";
      this.userId = this._localService.getLocalStorage(environment.lsuserId);
      this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
      this._translateService.use(this.language || "es");

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
      this.fetchReferencesData();
      this.initializeSearch();
    }

    fetchReferencesData() {
      this._membersService
        .fetchReferencesData(this.company?.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.formatReferences(data?.references);
          },
          (error) => {
            console.log(error);
          }
        );
    }

    initializeSearch() {
      this.searchText = this._translateService.instant("guests.search");
      this.placeholderText = this._translateService.instant("news.searchbykeyword");
    }

    handleSearch(event) {
      this.searchKeyword = event;
      this.loadReferences(this.allReferencesData);
    }

    formatReferences(references) {
      let data;
      if (references?.length > 0) {
        data = references?.map((item) => {
          return {
            ...item,
            reference_name: item?.name,
            reference_description: item?.description,
            date_display: moment.utc(item.created_at).locale(this.language).format('D MMMM YYYY')
          };
        });
      }
      if (this.allReferencesData?.length == 0) {
        this.allReferencesData = data;
      }
  
      if (data?.length > 0) {
        data = data.sort((a, b) => {
          const oldDate: any = new Date(a.created_at);
          const newDate: any = new Date(b.created_at);
          return newDate - oldDate;
        });
      }
  
      this.loadReferences(data);
    }

    loadReferences(data) {
      this.referencesData = this.allReferencesData;

      if(this.searchKeyword && this.referencesData) {
        this.referencesData = this.referencesData.filter(p => {
          return (
            p?.from_name.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
            p?.to_name.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
            p?.name.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
            p?.description.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0
          )
        })
      }

      this.refreshTable(this.referencesData);
    }

    refreshTable(list) {
      this.dataSource = new MatTableDataSource(list)
      if (this.sort) {
          this.dataSource.sort = this.sort;
      } else {
          setTimeout(() => this.dataSource.sort = this.sort);
      }

      if (this.paginator) {
          this.dataSource.paginator = this.paginator
          this.paginator.firstPage()
      } else {
          setTimeout(() => {
              this.dataSource.paginator = this.paginator
              this.paginator?.firstPage()
          });
      }
    }

    getPageDetails(event: any) {
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;
      this.dataSource = new MatTableDataSource(
        this.referencesData.slice(
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

    confirmDeleteItem(row) {
      this.showConfirmationModal = false;
      this.selectedItem = row.id;
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
        this._membersService.deleteReference(id).subscribe(
          (response) => {
            let all_references = this.allReferencesData;
            if (all_references?.length > 0) {
              all_references.forEach((reference, index) => {
                if (reference.id == id) {
                  all_references.splice(index, 1);
                }
              });
            }
  
            let references = this.referencesData;
            if (references?.length > 0) {
              references.forEach((reference, index) => {
                if (reference.id == id) {
                  references.splice(index, 1);
                }
              });
            }
            this.open(
              this._translateService.instant("dialog.deletedsuccessfully"),
              ""
            );
            this.referencesData = references;
            this.refreshTable(this.referencesData);
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