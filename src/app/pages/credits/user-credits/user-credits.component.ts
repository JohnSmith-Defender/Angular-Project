import { CommonModule } from '@angular/common';
import { Component,  HostListener, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { PageTitleComponent, ToastComponent } from '@share/components';
import { CompanyService, LocalService, UserService } from '@share/services';
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { environment } from "@env/environment";
import { StarRatingComponent } from '@lib/components';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { HistoryListComponent } from '@features/tutors/history-list/history-list.component';
import { SearchComponent } from '@share/components/search/search.component';
import moment from 'moment';
import get from 'lodash/get';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule,
        MatTableModule,
        MatSortModule,
        MatSnackBarModule,
        MatPaginatorModule,
        FormsModule,
        PageTitleComponent,
        StarRatingComponent,
        ToastComponent,
        HistoryListComponent,
        SearchComponent,
    ],
    templateUrl: './user-credits.component.html',
    styleUrls: ["./user-credits.component.scss"],
})
export class UserCreditsComponent {
    language: any
    emailDomain: any
    id: any
    companies: any
    companyName: any
    primaryColor: any
    buttonColor: any
    userId: any
    companyId: any
    isLoading: boolean = true
    pageSize: number = 10
    pageIndex: number = 0
    dataSource: any
    displayedColumns = [
        'user',
        'date',
        'time',
        'total_credits',
        'credits',
        'action',
        'status'
    ]
    isMobile: boolean = false;
    pageTitle: any;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
    company: any;
    searchText: any;
    placeholderText: any;
    searchKeyword: any;
    creditUserId:any
    creditLogData:any

    constructor(
        private _route: ActivatedRoute,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
    ) {}

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        this.userId = this._localService.getLocalStorage(environment.lsuserId)
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId)
        this.language = this._localService.getLocalStorage(environment.lslang)
        this._translateService.use(this.language || 'es')

        this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies)) : ''
        if(!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
        let company = this._companyService.getCompany(this.companies)
        if(company && company[0]) {
            this.company = company[0]
            this.emailDomain = company[0].domain
            this.companyId = company[0].id
            this.primaryColor = company[0].primary_color
            this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
        }
        this.initializeSearch();
        this.initializePage();
       
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant(
          "news.searchbykeyword"
        );
    }

    initializePage() {
        this.pageTitle = this._translateService.instant('credit-package.creditlogs');
        this.getCreditLogs()
    }


    getCreditLogs() {
        this._route.params.subscribe(params => {
            this.creditUserId = params['user-id'];
          });
        this._userService.getUserCreditLogsHistory(this.creditUserId)
          .subscribe(
            async (response) => {
                const {credit_logs_history} = response
                this.creditLogData  = credit_logs_history?.map(credit=>{
                  return {
                    ...credit,
                    credits: credit?.credits,
                    date:moment(credit?.created_at).format('DD/MM/YY'),
                    time:moment(credit?.created_at).format('hh:mm A'),
                    status: credit?.status?.toLowerCase() === 'user created' ? this._translateService.instant('credit-package.usercreated'):  credit?.status?.toLowerCase() === 'user edited' ? this._translateService.instant('credit-package.useredited'):
                    credit?.status?.toLowerCase() === 'booking' ? this._translateService.instant('credit-package.bookingcredit') : 
                    credit?.status?.toLowerCase() === 'credits purchased' ? this._translateService.instant('credit-package.purchasedcredit') : ''
                  }
                })
                this.isLoading = false
                this.populateBookingsTable()
            },
            error => {
              console.log(error)
            }
          )
    }


    handleSearch(event) {
        this.pageIndex = 0;
        this.pageSize = 10;
        this.searchKeyword = event;
        if(this.searchKeyword){
          this.filterBookings();
        }else{
          this.getCreditLogs()
        }
      }

    filterBookings() {
        let creditLogs = this.creditLogData;
        if (creditLogs?.length > 0 && this.searchKeyword) {
            creditLogs = creditLogs?.filter((m) => {
              let include = false;
              if (
                (m.date &&
                  m.date
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
        this.creditLogData = creditLogs
        this.populateBookingsTable()
    }

    populateBookingsTable() {
        setTimeout(() => {
            initFlowbite();
          }, 100);
        this.dataSource = new MatTableDataSource(
             this.creditLogData.slice(
                this.pageIndex * this.pageSize,
                (this.pageIndex + 1) * this.pageSize
            )
        )
        if (this.sort) {
            this.dataSource.sort = this.sort;
        } else {
            setTimeout(() => this.dataSource.sort = this.sort);
        }
        if (this.paginator) {
            new MatTableDataSource( this.creditLogData).paginator = this.paginator;
            if (this.pageIndex > 0) {
            } else {
              this.paginator.firstPage();
            }
          } else {
            setTimeout(() => {
              if (this.paginator) {
                new MatTableDataSource( this.creditLogData).paginator = this.paginator;
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
            this.creditLogData.slice(
                event.pageIndex * event.pageSize,
                (event.pageIndex + 1) * event.pageSize
                )
                );
        if(this.sort) {
              this.dataSource.sort = this.sort;
            } else {
                setTimeout(() => (this.dataSource.sort = this.sort));
        }
      }
}
