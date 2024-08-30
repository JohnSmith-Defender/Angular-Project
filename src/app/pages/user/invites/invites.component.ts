import { CommonModule, Location } from "@angular/common";
import { Component, Input, ViewChild } from "@angular/core";
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
import { ButtonGroupComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import { CompanyService, LocalService, UserService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { initFlowbite } from "flowbite";
import { EditorModule } from "@tinymce/tinymce-angular";
import get from "lodash/get";

@Component({
  selector: "app-invites",
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
    ButtonGroupComponent,
  ],
  templateUrl: "./invites.component.html",
})
export class InvitesComponent {
    private destroy$ = new Subject<void>();

    @Input() mode: any;

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
    pageSize: number = 10;
    pageIndex: number = 0;
    dataSource: any;
    displayedColumns = [
        "plan_title",
        "plan_date",
        "category",
        "subcategory",
        "guest_name",
        "invited_by",
        "alias",
        "guest_phone",
        "guest_zip_code",
        "guest_email",
        "attended",
        "member",
    ];
    @ViewChild(MatPaginator, { static: false }) paginator:
        | MatPaginator
        | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    searchKeyword: any;
    company: any;
    user: any;
    superAdmin: boolean = false;
    filterType: string = "invites";
    allInvites: any;
    invites: any;
    categories: any;
    subcategories: any;
    hasInvitations: boolean = false;
    hasCRM: boolean = false;
    userAliases: any = [];
    additionalInvitationLinks: any = [];
    buttonList: any = [];
    selectedCategory: any = '';

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _userService: UserService,
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
    this.getData();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getData() {
    this._userService
      .fetchInvitationsData(this.companyId, this.userId)
      .subscribe(
        (data) => {
          this.user = data?.user;
          this.mapUserPermissions(data?.user_permissions);
          this.mapCategories(data);
          this.mapSettings(data);
          this.formatInvites(data?.invites);
          this.allInvites = this.invites;
          this.refreshTable(this.invites);
          this.initializeButtonGroup();
          this.isloading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapCategories(data) {
    this.categories = data?.categories;
    if(this.categories && this.categories.length > 0) {
        this.categories = this.categories.map(category => {
            let url = 'https://' + window.location.host + '/';
            let link = url;
            let aliasLink = '';
            let slug = '';
            if(category.id == 1) {
                link += 'speed-networking-3';
                slug = 'speed-networking-3';
            } else if(category.id == 2) {
                link += 'eat-meet';
                slug = 'eat-meet'
            } else if(category.id == 3) {
                link += 'gar-grupos-de-alto-rendimiento';
                slug = 'gar-grupos-de-alto-rendimiento';
            } else if(category.id == 4) {
                link += 'talleres-de-herramientas-digitales';
                slug = 'talleres-de-herramientas-digitales';
            } else if(category.id == 21) {
                link += 'internos';
                slug = 'internos';
            }  else if(category.id == 23) {
                link += 'networking-eat-meet';
                slug = 'networking-eat-meet';
            } 
            aliasLink += link + '/';
            link += '/' + this.user?.alias;
            let copylink = url + slug + '/' + this.user.alias;
            let whatsapplink = 'https://api.whatsapp.com/send?text=' + (
              this.user.name + this._translateService.instant('dialog.hasinvitedyou') + '! '
              + this._translateService.instant('dialog.clicklinktoregister') +
              'https://' + window.location.host + '/' + slug + '/' + this.user.alias);
            let emaillink = `mailto:?Subject=Shared Event&Body=` + (this.companyId != 12 ? window.location.href : (
              this.user.name + this._translateService.instant('dialog.hasinvitedyou') + '! '
              + this._translateService.instant('dialog.clicklinktoregister') +
              'https://' + window.location.host + '/' + slug + '/' + this.user.alias));
      
            return {
              slug: slug,
              link: link,
              aliasLink: aliasLink,
              copylink: copylink,
              whatsapplink: whatsapplink,
              emaillink: emaillink,
              ...category
            }
        });
    }
    
    this.subcategories = data?.subcategories;
  }

  mapSettings(data) {
    let other_settings = data?.settings?.other_settings;
    if(other_settings?.length > 0) {
      this.hasInvitations = other_settings.some(
        (a) => a.title_en == "Your Activity: Invitations" && a.active == 1
      );
      this.hasCRM = other_settings.some(
        (a) => a.title_en == "CRM" && a.active == 1
      );
    }

    if(this.hasCRM) {
      this.displayedColumns = [
        "plan_title",
        "plan_date",
        "category",
        "subcategory",
        "guest_name",
        "invited_by",
        "alias",
        "guest_phone",
        "guest_zip_code",
        "guest_email",
        "attended",
        "sp_name",
        "status",
      ];
    }

    if(this.hasInvitations) {
        this.userAliases = data?.user_alias;
        if(this.userAliases?.length > 0) {
            this.userAliases.forEach(data => {
                const { alias, id, default_alias } = data;
                this.additionalInvitationLinks.push({
                    link: alias,
                    aliasId: id,
                    isEditLink: false,
                    defaultAlias: default_alias
                })
            });
        }
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
  }

  initializeButtonGroup() {
    let buttonList: any[] = [];
    buttonList.push({
      id: 1,
      value: "All",
      text: this._translateService.instant("plans.all"),
      selected: true,
      fk_company_id: this.companyId,
    });

    if(this.categories?.length > 0) {
        this.categories?.forEach(category => {
            buttonList.push({
                id: category.id,
                value: category.id,
                text: this.language == 'en' ? (category.name_en || category.name_EN) : (category.name_es || category.name_ES),
                selected: false,
                fk_company_id: this.companyId,
            });
        })
    }

    this.buttonList = buttonList;
  }

  formatInvites(invites) {
    this.invites = invites;
    this.invites = this.invites?.map((item) => {
      return {
        category: this.language == 'en' ? item?.category_en : item?.category_es,
        subcategory: this.language == 'en' ? item?.subcategory_en : item?.subcategory_es,
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
      this.invites.slice(
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

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.filterInvites();
  }

  filterCategory(category) {
    this.buttonList?.forEach((item) => {
        if (item.value == category.value) {
          item.selected = true;
        } else {
          item.selected = false;
        }
    });

    this.selectedCategory = category;
    this.filterInvites();
  }

  filterInvites() {
    let invites = this.allInvites;
    if (invites?.length > 0) {
        if(this.searchKeyword) {
            invites = invites?.filter((m) => {
                let include = false;
                if (
                (m.plan_title &&
                m.plan_title
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/\p{Diacritic}/gu, "")
                    .indexOf(
                    this.searchKeyword
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/\p{Diacritic}/gu, "")
                    ) >= 0) ||
                    (m.category &&
                    m.category
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/\p{Diacritic}/gu, "")
                        .indexOf(
                        this.searchKeyword
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                        ) >= 0) ||
                    (m.subcategory &&
                    m.subcategory
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/\p{Diacritic}/gu, "")
                        .indexOf(
                        this.searchKeyword
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                        ) >= 0) ||
                    (m.guest_name &&
                    m.guest_name
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/\p{Diacritic}/gu, "")
                        .indexOf(
                        this.searchKeyword
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                        ) >= 0) ||
                    (m.invited_by &&
                    m.invited_by
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/\p{Diacritic}/gu, "")
                        .indexOf(
                        this.searchKeyword
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                        ) >= 0) ||
                    (m.guest_email &&
                    m.guest_email
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/\p{Diacritic}/gu, "")
                        .indexOf(
                        this.searchKeyword
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                        ) >= 0) ||
                    (m.sp_name &&
                    m.sp_name
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

        if(this.selectedCategory?.value != 'All') {
            invites = invites?.filter(invite => {
                let include = false;

                if(this.selectedCategory?.id == 23) {
                    include = invite.event_category_id == this.selectedCategory?.id ||
                        invite.event_category_id == 1 ||
                        invite.event_category_id == 2;
                } else {
                    include = invite.event_category_id == this.selectedCategory?.id;
                }

                return include;
            }) 
        }
    }

    this.invites = invites;
    this.formatInvites(this.invites);
    this.refreshTable(this.invites);
  }

  copyToClipboard(link) {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = link;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);

    this.open(this._translateService.instant("dialog.copiedlink"), "");
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