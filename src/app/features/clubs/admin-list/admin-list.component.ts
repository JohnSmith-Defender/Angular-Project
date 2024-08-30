import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, SimpleChange, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from 'rxjs';
import { IconFilterComponent, ToastComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { ClubsService } from '@features/services';

@Component({
    selector: 'app-clubs-admin-list',
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        SearchComponent,
        IconFilterComponent,
        ToastComponent
    ],
    templateUrl: './admin-list.component.html',
})
export class ClubsAdminListComponent {
    private destroy$ = new Subject<void>();

    @Input() list: any;
    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() canCreateClub: any;
    @Input() clubsTitle: any;
    @Input() userId: any;
    @Input() superAdmin: any;
    @Input() status: any;
    @Input() language: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    dataSource: any;
    displayedColumns = ["name", "members", "action"];
    pageSize: number = 10;
    pageIndex: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: string = '';
    confirmDeleteItemDescription: string = '';
    acceptText: string = '';
    cancelText: string = '';
    allClubsData: any = [];
    clubMembers: any = [];
    clubsData: any = [];
    searchKeyword: any;
    selectedCity: any;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _clubsService: ClubsService,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    ngOnChanges(changes: SimpleChange) {
        let statusChange = changes["status"];
        if(statusChange.previousValue != statusChange.currentValue) {
            this.status = statusChange.currentValue;
            this.loadClubs(this.allClubsData);
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
        this.fetchClubsManagementData();
        this.initializeSearch();
    }

    fetchClubsManagementData() {
        this._clubsService
          .fetchClubs(this.company?.id, this.userId, 'all')
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.clubMembers = data?.club_members || [];
                this.formatClubs(data?.clubs || []);
            },
            (error) => {
              console.log(error);
            }
          );
    }

    formatClubs(clubs) {
        let data 
        if(clubs?.length > 0) {
            data = clubs?.map(club => {
                let members = this.clubMembers?.filter(pp => {
                    return pp.group_id == club.id
                })

                return {
                    ...club,
                    name: this.getClubTitle(club),
                    members,
                }
            })
        }
        if(this.allClubsData?.length == 0) {
            this.allClubsData = data
        }
        
        if(data?.length > 0) {
            data = data.sort((a, b) => {
                this.language == "en" && a.title_en
                    ? a.title_en.localeCompare(b.title_en)
                    : this.language == "fr" && a.title_fr
                    ? a.title_fr.localeCompare(b.title_fr)
                    : a.title.localeCompare(b.title)
            })
        }

        this.loadClubs(data);
    }

    loadClubs(data) {
        this.clubsData = data?.filter(club => {
            let status = this.status == 'active' ? 1 : 0
            return status == (club.status || 0)
        })
        

        if(this.searchKeyword && this.clubsData) {
            this.clubsData = this.clubsData.filter(club => {
                return (club.title && club.title.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
                    (club.title_en && club.title_en.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
                    (club.title_fr && club.title_fr.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
                    (club.title_eu && club.title_eu.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
                    (club.title_ca && club.title_ca.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0) ||
                    (club.title_de && club.title_de.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0)
            })
        }

        if(this.selectedCity) {
            this.clubsData = this.clubsData.filter(p => {
                return p.city && p.city.toLowerCase().indexOf(this.selectedCity.toLowerCase()) >= 0 
            })
        }

        this.refreshTable(this.clubsData);
    }

    refreshTable(list) {
        this.dataSource = new MatTableDataSource(list.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize))
        if (this.sort) {
            this.dataSource.sort = this.sort;
        } else {
            setTimeout(() => this.dataSource.sort = this.sort);
        }
        if (this.paginator) {
            new MatTableDataSource(list).paginator = this.paginator
            if(this.pageIndex > 0) {
            } else {
              this.paginator.firstPage()
            }
        } else {
            setTimeout(() => {
                if (this.paginator) {
                    new MatTableDataSource(list).paginator = this.paginator
                    if(this.pageIndex > 0) {
                        this.paginator.firstPage()
                    }
                }
            });
        }
    }

    getClubTitle(club) {
        return club ? (this.language == 'en' ? (club.title_en || club.title) : (this.language == 'fr' ? (club.title_fr || club.title) : 
            (this.language == 'eu' ? (club.title_eu || club.title) : (this.language == 'ca' ? (club.title_ca || club.title) : 
            (this.language == 'de' ? (club.title_de || club.title) : club.title)
          ))
        )) : ''
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant("news.searchbykeyword");
    }

    handleCreateRoute() {
        this._router.navigate([`/clubs/create/0`]);
    }

    handleSearch(event) {
        this.searchKeyword = event;
        this.loadClubs(this.allClubsData);
    }

    getPageDetails(event: any) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.dataSource = new MatTableDataSource(
          this.clubsData.slice(
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

    filterCity(event) {
        this.list?.forEach((item) => {
            if (item.city === event) {
              item.selected = true;
            } else {
              item.selected = false;
            }
        });
        this.selectedCity = event || "";
        this.loadClubs(this.allClubsData);
    }

    viewItem(id) {
        this._router.navigate([`/clubs/details/${id}`])
    }

    editItem(id) {
        this._router.navigate([`/clubs/edit/${id}`])
    }

    deleteItem(id) {
        const navigationExtras: NavigationExtras = {
            state: {
                mode: 'delete'
            },
            relativeTo: this._route
        };
    
        this._router.navigate([`/clubs/details/${id}`], navigationExtras);
    }

    confirmDeleteGroupMember(row) {
        this.showConfirmationModal = false;
        this.selectedItem = row;
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
        this.deleteMember(this.selectedItem, true);
        this.showConfirmationModal = false;
    }

    deleteMember(selected, confirmed) {
        if(confirmed) {
          this._clubsService.removeGroupMember(selected.group_id, selected.user_id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            response => {
                if(this.clubsData) {
                    this.clubsData.forEach((g, idx) => {
                        if(g.members) {
                            g.members.forEach((p, index) => {
                                if(p.user_id == selected.user_id) {
                                    g.members.splice(index, 1)
                                }
                            });
                        }
                    })
                }
                this.open(this._translateService.instant("dialog.deletedsuccessfully"), "");
                this.refreshTable(this.clubsData);
            },
            error => {
                console.log(error);
            }
          )
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