import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, HostListener, Input, SimpleChange, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, ExcelService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { IconFilterComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { initFlowbite } from "flowbite";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import moment from "moment";

@Component({
    selector: 'app-questionnaires-statistics-list',
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        SearchComponent,
        IconFilterComponent,
        NgOptimizedImage
    ],
    templateUrl: './statistics-list.component.html',
})
export class QuestionnairesStatisticsListComponent {
    private destroy$ = new Subject<void>();

    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() plansTitle: any;
    @Input() userId: any;
    @Input() superAdmin: any;
    @Input() language: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    dataSource: any;
    displayedColumns = ["title", "views", "clicks"];
    pageSize: number = 10;
    pageIndex: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    searchKeyword: any;
    allQuestionnairesData: any = [];
    questionnairesData: any = [];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _excelService: ExcelService,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
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
        setTimeout(() => {
            initFlowbite();
        }, 500);
        this.fetchQuestionnairesManagementData();
        this.initializeSearch();
    }

    fetchQuestionnairesManagementData() {
        this._companyService
          .fetchQuestionnairesTrackingData(this.company?.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.questionnairesData = data?.questionnaires;
                this.allQuestionnairesData = data?.questionnaires;
                this.loadQuestionnaires(this.allQuestionnairesData);
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
        this.loadQuestionnaires(this.allQuestionnairesData);
    }

    loadQuestionnaires(data) {
        this.questionnairesData = data;

        if(this.searchKeyword && this.questionnairesData) {
            this.questionnairesData = this.questionnairesData.filter(p => {
              return p.title && p.title.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 
            })
        }

        this.refreshTable(this.questionnairesData);
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
        this.dataSource = new MatTableDataSource(this.questionnairesData);
        if (this.sort) {
          this.dataSource.sort = this.sort;
        } else {
          setTimeout(() => (this.dataSource.sort = this.sort));
        }
    }

    async open(message: string, action: string) {
      await this._snackBar.open(message, action, {
          duration: 3000,
          panelClass: ["info-snackbar"],
      });
    }

    downloadExcel() {
        let questionnaires_data: any[] = [];
        if(this.questionnairesData) {
            this.questionnairesData.forEach(questionnaire => {
                questionnaires_data.push({
                    'Título': questionnaire.title,
                    'Clics': questionnaire.clicks,
                    'Páginas vistas': questionnaire.views,
                })
            });
        }

        this._excelService.exportAsExcelFile(questionnaires_data, 'cuestionarios_' + this.getTimestamp());
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    }

    public getTimestamp() {
        const date = new Date();
        const timestamp = date.getTime();

        return timestamp;
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}