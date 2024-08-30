import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
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
import { BuddyService } from "@features/services";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ToastComponent } from "@share/components";
import { searchSpecialCase, sortSerchedMembers } from "src/app/utils/search/helper";
import { environment } from "@env/environment";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import Fuse from 'fuse.js';
import moment from "moment";
import * as he from 'he';

@Component({
  selector: "app-buddy-admin-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    SearchComponent,
    ToastComponent,
  ],
  templateUrl: "./admin-list.component.html",
})
export class BuddyAdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;
  @Input() company: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() canCreateTestimonial: any;
  @Input() testimonialsTitle: any;
  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() status: any;
  @Input() language: any;

  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  allMentorsData: any = [];
  mentorsData: any = [];
  allMentorRequestsData: any = [];
  mentorRequestsData: any = [];
  searchKeyword: any;
  dataSource: any;
  displayedColumns = [
    "name",
    "location",
    "major",
    "action"
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  acceptText: string = '';
  cancelText: string = '';
  confirmMode: any = '';
  confirmItemTitle: any = '';
  confirmItemDescription: any = '';
  searchOptions = {
    keys: [{
      name: 'first_name',
      weight: 0.2
    }, {
      name: 'last_name',
      weight: 0.2
    }, {
      name: 'major',
      weight: 0.2
    }, {
      name: 'language',
      weight: 0.2
    }, {
      name: 'location',
      weight: 0.2
    }]
  };
  searchUser: any = '';
  results: any = [];
  dialogMode: string = "";
  dialogTitle: any;
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
    private _buddyService: BuddyService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnChanges(changes: SimpleChange) {
    let statusChange = changes["status"];
    if (statusChange?.previousValue != statusChange?.currentValue) {
      this.status = statusChange.currentValue;
      this.loadData();
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
    this.initializeSearch();
    this.loadData();
  }

  loadData() {
    if(this.company?.id == 32) {
      this.displayedColumns = [
        "name",
        "location",
        "major",
        "faculty",
        "business_unit",
        "segment",
        "action"
      ];
    } else {
      this.displayedColumns = [
        "name",
        "location",
        "major",
        "action"
      ];
    }
    if(this.status == 'MentorRequests') {
      this.fetchMentorRequests();
    } else {
      this.fetchBuddyManagementData();
    }
  }

  fetchMentorRequests() {
    this._buddyService
      .fetchMentorRequests(this.company?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.formatMentorRequests(data?.mentors || []);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatMentorRequests(mentors) {
    let data;
    if (mentors?.length > 0) {
      data = mentors?.map((item) => {
        return {
          ...item,
          path: `/buddy/request/${item.id}`,
          image: `${environment.api}/${item.image}`,
          name: `${item.first_name} ${item.last_name}`,
        };
      });
    }
    if (this.allMentorRequestsData?.length == 0) {
      this.allMentorRequestsData = data;
    }

    this.loadMentorRequests(data);
  }

  loadMentorRequests(data) {
    this.mentorRequestsData = data;

    if (this.searchKeyword) {
      this.mentorRequestsData = this.filterSearchKeyword(this.mentorRequestsData)
      let fuse = new Fuse(this.mentorRequestsData, this.searchOptions);
      let filtered_search = fuse.search(this.normalizeCase(this.searchKeyword));
      this.mentorRequestsData = []
      filtered_search?.forEach(item => {
        this.mentorRequestsData.push(item?.item)
      })
    }

    this.refreshTable(this.mentorRequestsData);
  }

  fetchBuddyManagementData() {
    this._buddyService
      .fetchBuddies(this.company?.id, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.formatMentors(data?.mentors || []);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatMentors(mentors) {
    let data;
    if (mentors?.length > 0) {
      data = mentors?.map((item) => {
        return {
          ...item,
          path: `/buddy/details/${item.id}`,
          image: `${environment.api}/${item.image}`,
          name: `${item.first_name} ${item.last_name}`,
        };
      });
    }
    if (this.allMentorsData?.length == 0) {
      this.allMentorsData = data;
    }

    this.loadMentors(data);
  }

  loadMentors(data) {
    this.mentorsData = data;

    if (this.searchKeyword) {
      this.mentorsData = this.filterSearchKeyword(this.mentorsData)
      let fuse = new Fuse(this.mentorsData, this.searchOptions);
      let filtered_search = fuse.search(this.normalizeCase(this.searchKeyword));
      this.mentorsData = []
      filtered_search?.forEach(item => {
        this.mentorsData.push(item?.item)
      })
    }

    this.refreshTable(this.mentorsData);
  }

  normalizeCase(str) {
    if (str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
    }
  }

  filterSearchKeyword(mentors) {
    if(mentors?.length > 0) {
      return mentors.filter((mentor) => {
        return (
          (mentor.first_name &&
            mentor.first_name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            || searchSpecialCase(this.searchKeyword,mentor.author)
            ) ||
          (mentor.last_name &&
            he.decode(mentor.last_name)
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (mentor.major &&
            he.decode(mentor.major)
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
  }

  refreshTable(list) {
    this.dataSource = new MatTableDataSource(list);
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort));
    }
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.loadMentors(this.allMentorsData);
  }

  approveMentorRequest(row) {
    this.showConfirmationModal = false;
    this.selectedItem = row;
    this.confirmMode = 'approve';
    this.confirmItemTitle = this._translateService.instant(
      "dialog.confirmapprove"
    );
    this.confirmItemDescription = this._translateService.instant(
      "dialog.confirmapproveitem"
    );
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  } 

  rejectMentorRequest(row) {
    this.showConfirmationModal = false;
    this.selectedItem = row;
    this.confirmMode = 'reject';
    this.confirmItemTitle = this._translateService.instant(
      "dialog.confirmreject"
    );
    this.confirmItemDescription = this._translateService.instant(
      "dialog.confirmrejectitem"
    );
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  viewItem(id) {
    this._router.navigate([`/buddy/mentor/${id}`]);
  }

  editItem(id) {
    this._router.navigate([`/buddy/profile/mentor/${id}`]);
  }

  confirmDeleteItem(id) {
    this.showConfirmationModal = false;
    this.selectedItem = id;
    this.confirmMode = 'delete-mentor';
    this.confirmItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmItemDescription = this._translateService.instant(
      "dialog.confirmdeleteitem"
    );
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    if(this.confirmMode == 'approve') {
      this.approveRequest(this.selectedItem, true);
    } else if(this.confirmMode == 'reject') {
      this.rejectRequest(this.selectedItem, true);
    } else if(this.confirmMode == 'delete-mentor') {
      this.deleteMentor(this.selectedItem, true);
    }
    this.showConfirmationModal = false;
  }

  approveRequest(row, confirmed) {
    if(confirmed) {
      let params = {
        id: row.id
      }
      this._buddyService.approveMentorRequest(params).subscribe(
        (response) => {
          let all_mentor_requests = this.allMentorRequestsData;
          if (all_mentor_requests?.length > 0) {
            all_mentor_requests.forEach((request, index) => {
              if (request.id == row.id) {
                request.approved = 1;
              }
            });
          }

          let mentor_requests = this.mentorRequestsData;
          if (mentor_requests?.length > 0) {
            mentor_requests.forEach((request, index) => {
              if (request.id == row.id) {
                request.approved = 1;
              }
            });
          }
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.mentorRequestsData = mentor_requests;
          this.loadMentorRequests(this.mentorRequestsData);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  rejectRequest(row, confirmed) {
    if(confirmed) {
      let params = {
        id: row.id
      }
      this._buddyService.rejectMentorRequest(params).subscribe(
        (response) => {
          let all_mentor_requests = this.allMentorRequestsData;
          if (all_mentor_requests?.length > 0) {
            all_mentor_requests.forEach((request, index) => {
              if (request.id == row.id) {
                request.rejected = 1;
              }
            });
          }

          let mentor_requests = this.mentorRequestsData;
          if (mentor_requests?.length > 0) {
            mentor_requests.forEach((request, index) => {
              if (request.id == row.id) {
                request.rejected = 1;
              }
            });
          }
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.mentorRequestsData = mentor_requests;
          this.loadMentorRequests(this.mentorRequestsData);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  deleteMentor(row, confirmed) {
    if(confirmed) {
      this._buddyService.deleteMentor(row).subscribe(
        (response) => {
          this.fetchBuddyManagementData();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  handleCreateRoute() {
    this.dialogMode = "new-mentor";
    this.dialogTitle =  `${this._translateService.instant('dashboard.new')} ${this._translateService.instant('buddy.mentor')}`;
    this.modalbutton?.nativeElement.click();
  }

  findUser() {
    this._buddyService
    .searchUser(this.company?.id, this.searchUser)
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (data) => {
        let results = data.results;
        if(results?.length > 0) {
          results = results?.map((item) => {
            return {
              ...item,
              name: item.first_name ? `${item.first_name} ${item.last_name}` : item.name,
              email: item.email,
            };
          });
          this.results = results;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  addMentor(id) {
    let params = {
      company_id: this.company?.id,
      user_id: id
    }
    this._buddyService.addMentor(params).subscribe(
      (response) => {
        this.fetchBuddyManagementData();
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
      },
      (error) => {
        console.log(error);
      }
    );
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