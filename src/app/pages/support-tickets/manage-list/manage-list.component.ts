import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { SearchComponent } from "@share/components/search/search.component";
import { CompanyService, LocalService } from "@share/services";
import { ButtonGroupComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { environment } from "@env/environment";
import get from "lodash/get";

@Component({
    selector: "app-manage-list",
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        MatSnackBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
        ReactiveFormsModule,
        NgOptimizedImage,
        ButtonGroupComponent,
        PageTitleComponent,
        SearchComponent,
        ToastComponent,

    ],
    templateUrl: "./manage-list.component.html",
})
export class ManageSupportTicketsListComponent {
    private destroy$ = new Subject<void>();

    @Input() list: any;

    language: any;
    email: any;
    userId: any;
    companyId: any;
    domain: any;
    userRole: any;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    languageChangeSubscription: any;
    superAdmin: boolean = false;
    buttonList: any[] = [];
    filter: any;
    allStatus: any = [];
    isLoading: boolean = true;
    level1Title: string = "";
    level2Title: string = "";
    level3Title: string = "";
    level4Title: string = "";
    searchText: any;
    placeholderText: any;
    searchKeyword: any;
    pageSize: number = 10;
    pageIndex: number = 0;
    dataSource: any;
    categories: any = [];
    priorities: any = [];
    supportTickets: any = [];
    allSupportTickets: any = [];
    selectedStatus: any = 'All';
    displayedColumns = [
        'subject', 
        'created_at', 
        'status_display', 
        'action'
    ];
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    
    formSubmitted: any = false;
    company: any;
    createHover: boolean = false;
    mode: string = '';
    subject: any;
    description: any;
    file: any;
    fileName: any;
    selectedCategory: any = '';
    selectedPriority: any = '';
    supportTicket: any = {};
    allSupportTicketsReplies: any = [];
    replies: any = [];
    supportTicketForm: FormGroup = new FormGroup({
        'subject': new FormControl("", [Validators.required]),
        'description': new FormControl("", [Validators.required]),
        'message': new FormControl("", [Validators.required]),
    });
    supportTicketFormSubmitted: boolean = false;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: string = "";
    confirmDeleteItemDescription: string = "";
    acceptText: string = "";
    cancelText: string = "";
    apiPath: string = `${environment.api}/`;
    @ViewChild("modalbutton2", { static: false }) modalbutton2:
        | ElementRef
        | undefined;
    @ViewChild("closemodalbutton2", { static: false }) closemodalbutton2:
        | ElementRef
        | undefined;

    constructor(
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _snackBar: MatSnackBar,
    ) {}

    async ngOnInit() {
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");

        this.email = this._localService.getLocalStorage(environment.lsemail);
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(
        environment.lscompanyId
        );
        this.domain = this._localService.getLocalStorage(environment.lsdomain);
        this.userRole = this._localService.getLocalStorage(environment.lsuserRole);
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
            this.domain = company[0].domain;
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
        this.allStatus = [
            {
                id: 1,
                value: 'Not Started',
                key: 'your-support-cases.notstarted',
                text: this._translateService.instant('your-support-cases.notstarted')
            },
            {
                id: 2,
                value: 'In Progress',
                key: 'your-support-cases.inprogress',
                text: this._translateService.instant('your-support-cases.inprogress')
            },
            {
                id: 3,
                value: 'Closed',
                key: 'your-support-cases.closed',
                text: this._translateService.instant('your-support-cases.closed')
            }
        ]
        this.fetchSupportTicketsData();
    }

    fetchSupportTicketsData() {
        this._companyService
          .fetchSupportTicketsData(this.companyId, this.userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.mapUserPermissions(data?.user_permissions);
                this.categories = data?.categories;
                this.priorities = data?.priorities;
                this.allSupportTicketsReplies = data?.replies;
                this.initializeButtonGroup();
                this.formatSupportTickets(data?.support_tickets);
                this.populateTable(this.supportTickets)
                this.isLoading = false;
            },
            (error) => {
              console.log(error);
            }
          );
    }

    mapUserPermissions(user_permissions) {
        this.superAdmin = user_permissions?.super_admin_user ? true : false;
    }

    initializeButtonGroup() {
        let categories = this.allStatus;
        this.buttonList = [
            {
                id: "All",
                value: "All",
                text: this._translateService.instant("plans.all"),
                selected: true,
                fk_company_id: this.companyId,
                fk_supercategory_id: "All",
                name_CA: "All",
                name_DE: "All",
                name_EN: "All",
                name_ES: "All",
                name_EU: "All",
                name_FR: "All",
                sequence: 1,
                status: 1,
            },
        ];
    
        categories?.forEach((category, index) => {
            this.buttonList.push({
                id: category.id,
                value: category.value,
                text: category.text,
                selected: false,
                fk_company_id: this.companyId,
                fk_supercategory_id: category.id,
                name_CA: category.text,
                name_DE: category.text,
                name_EN: category.text,
                name_ES: category.text,
                name_EU: category.text,
                name_FR: category.text,
                sequence: index + 2,
                status: 1,
            });
        });
    }

    formatSupportTickets(support_tickets) {
        support_tickets = support_tickets?.map((item) => {
            let status = this.allStatus?.find((f) => f.value == item?.status);

            return {
              ...item,
              id: item?.id,
              status_display: status ? this._translateService.instant(status?.key) : '',
            };
        });
      
        this.supportTickets = support_tickets;
        this.allSupportTickets = support_tickets;
    }

    handleSearch(event) {
        this.pageIndex = 0;
        this.pageSize = 10;
        this.searchKeyword = event;
        this.filterSupportTickets();
    }

    handleChangeStatus(event) {
        this.buttonList?.forEach((item) => {
            if (item.id === event.id) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });

        this.selectedStatus = event.value;
        this.filterSupportTickets();
        this.isLoading = true
    }

    populateTable(list) {
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
            this.supportTickets?.slice(
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

    filterSupportTickets() {
        this.supportTickets = this.allSupportTickets;
        if(this.searchKeyword) {
            this.supportTickets = this.supportTickets && this.supportTickets.filter(h => {
                return h.subject && h.subject.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                    h.status && h.status.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0
            })
        }

        if(this.selectedStatus && this.selectedStatus != 'All') {
            this.supportTickets = this.supportTickets && this.supportTickets.filter(h => {
                return h.status == this.selectedStatus
            })
        }

        this.populateTable(this.supportTickets)
    }

    toggleCreateHover(event) {
        this.createHover = event;
    }

    handleCreateRoute() {
        this.mode = 'create';
        this.modalbutton2?.nativeElement.click();
    }

    ticketDetails(data) {
        this.mode = 'view';
        this.supportTicket = data;
        this.replies = this.allSupportTicketsReplies?.filter(reply => {
            return reply.ticket_id == data?.id
        });
        
        this.modalbutton2?.nativeElement.click();
    }

    submitTicket() {
        this.formSubmitted = true

        if(
          !this.subject
        || !this.description
        || !this.selectedCategory
        || !this.selectedPriority) {
            return false;
        }
    
        this._companyService.createTicket(
          this.subject,
          this.description,
          this.selectedCategory,
          this.selectedPriority,
          this.companyId,
          this.userId,
          this.file
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          response => {
            this.resetFields();
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
            this.fetchSupportTicketsData();
            this.closemodalbutton2?.nativeElement.click();
          },
          error => {
            console.log(error);
          }
        );
    }

    editSupportTicket(data) {
        this.resetForm();
        this.mode = 'edit';
        this.supportTicket = data;
    
        if(this.supportTicket) {
          this.selectedCategory = data.category_id;
          this.selectedPriority = data.priority_id;
          this.supportTicketForm.controls['subject'].setValue(data.subject)
          this.supportTicketForm.controls['description'].setValue(data.description)
    
          this.replies = this.allSupportTicketsReplies?.filter(reply => {
            return reply.ticket_id == data?.id
        });
        }
    
        this.modalbutton2?.nativeElement.click();
    }

    resetFields() {
        this.mode = '';
        this.subject = '';
        this.description = '';
        this.selectedCategory = '';
        this.selectedPriority = '';
    }

    resetForm() {
        this.supportTicketForm.reset();
        this.selectedStatus = '';
        this.formSubmitted = false;
        this.replies = [];
    }

    confirm() {

    }

    getCategoryTitle(category) {
        return category ? (this.language == 'en' ? (category.title || category.title_ES) : (this.language == 'fr' ? (category.title_FR || category.title_ES) : 
            (this.language == 'eu' ? (category.title_EU || category.title_ES) : (this.language == 'ca' ? (category.title_CA || category.title_ES) : 
            (this.language == 'de' ? (category.title_DE || category.title_ES) : (this.language == 'it' ? (category.title_IT || category.title_ES) :
            category.title_ES)
        )))
        )) : ''
    }

    getPriorityTitle(priority) {
        return priority ? (this.language == 'en' ? (priority.priority || priority.priority_ES) : (this.language == 'fr' ? (priority.priority_FR || priority.priority_ES) : 
            (this.language == 'eu' ? (priority.priority_EU || priority.priority_ES) : (this.language == 'ca' ? (priority.priority_CA || priority.priority_ES) : 
            (this.language == 'de' ? (priority.priority_DE || priority.priority_ES) : (this.language == 'it' ? (priority.priority_IT || priority.priority_ES) :
            priority.priority_ES)
        )))
        )) : ''
    }

    saveSupportTicket() {
        this.formSubmitted = true

        if(this.supportTicketForm.get('message')?.errors
          || !this.selectedStatus
          || !this.supportTicket
        ) {
          return false
        }
    
        this._companyService.createReply(
            this.supportTicket.id,
            this.selectedStatus,
            0,
            this.userId,
            this.supportTicketForm.get('message')?.value,
            null
          ).subscribe(
            response => {
                this.resetForm();
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                this.fetchSupportTicketsData();
                this.closemodalbutton2?.nativeElement.click();
            },
            error => {
              console.log(error);
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