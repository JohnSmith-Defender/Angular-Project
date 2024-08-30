import { CommonModule, Location } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService, ExcelService, UserService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { SearchComponent } from "@share/components/search/search.component";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BreadcrumbComponent, ButtonGroupComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { FormsModule } from "@angular/forms";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { CoursesService } from "@features/services";
import { environment } from "@env/environment";
import get from 'lodash/get';

@Component({
  selector: "app-keap-management",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    FormsModule,
    SearchComponent,
    ToastComponent,
    PageTitleComponent,
    BreadcrumbComponent,
    ButtonGroupComponent,
    ToastComponent,
  ],
  templateUrl: "./keap-management.component.html",
})
export class KeapManagementComponent {
    private destroy$ = new Subject<void>();

    pageTitle: any;
    userId: any;
    companyId: any;
    language: any;
    companies: any;
    company: any;
    domain: any;
    primaryColor: any;
    buttonColor: any;
    features: any = [];
    company_subfeatures: any = [];
    subfeature_id_global: number = 0;
    feature_global: string = '';

    languageChangeSubscription;
    level1Title: string = "";
    level2Title: string = "";
    level3Title: string = "";
    level4Title: string = "";
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    searchKeyword: any;
    dataSource: any;
    displayedColumns = ['title', 'event_type', 'tag', 'course', 'last_execution', 'action'];
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    
    data: any = [];
    allData: any = [];
    pageSize: number = 10;
    pageIndex: number = 0;
    superAdmin: boolean = false;
    confirmMode: string = "";
    isloading: boolean = false;
    buttonList: any = [];
    serviceAccountKey: any = '';
    keapSettings: any;
    hookEventTypes: any = [];
    hooks: any = [];
    allHooks: any = [];
    showEditKeapHookModal: boolean = false;
    mode: any = '';
    title: any;
    selectedEventType: any = '';
    keapTags: any = [];
    selectedTagId: any = '';
    selectedTag: any = '';
    courses: any = [];
    hasHotmartIntegration: boolean = false;
    hotmartSettings: any;
    selectedCourse: any = '';
    formSubmitted: boolean = false;
    selectedHook: any = '';
    hookLogs: any = [];
    allHookLogs: any = [];
    viewMode: any = 'hooks';
    integrations: any = [];
    allIntegrations: any = [];
    showEditKeapIntegrationModal: boolean = false;
    selectedIntegration: any = '';
    showKeapModal: boolean = false;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: string = "";
    confirmDeleteItemDescription: string = "";
    acceptText: string = "";
    cancelText: string = "";
    @ViewChild("modalbutton2", { static: false }) modalbutton2:
        | ElementRef
        | undefined;
    @ViewChild("closemodalbutton2", { static: false }) closemodalbutton2:
        | ElementRef
        | undefined;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _coursesService: CoursesService,
        private _location: Location,
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
            this.domain = company[0].domain
            this.companyId = company[0].id
            this.primaryColor = company[0].primary_color
            this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
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
        this.initializeBreadcrumb();
        this.initializeSearch();
        this.initializeButtonGroup();
        this.fetchKeapData();
    }

    initializeBreadcrumb() {
        this.level1Title = this._translateService.instant("company-settings.settings");
        this.level2Title = this._translateService.instant("company-settings.modules");
        this.level3Title = "Keap";
        this.level4Title = "";
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant("news.searchbykeyword");
    }

    initializeButtonGroup() {
        this.buttonList = [
            {
                id: 1,
                value: "hooks",
                text: 'Hooks',
                type: "hooks",
                selected: true
            },
            {
                id: 2,
                value: "logs",
                text: this._translateService.instant('keap.logs'),
                type: "logs",
                selected: false
            },
            {
                id: 3,
                value: "integrations",
                text: this._translateService.instant('keap.integrations'),
                type: "integrations",
                selected: false
            }
        ];
    }

    async fetchKeapData() {
        this.features = this._localService.getLocalStorage(environment.lsfeatures) ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures)) : ''
        if(!this.features) {
          this.features = await this._companyService.getFeatures(this.domain).toPromise()
        }
        if(this.features) {
            let coursesFeature = this.features.filter(f => {
                return f.feature_name == "Courses"
            })
            if(coursesFeature && coursesFeature[0]) {
                let subfeatures = get(await this._companyService.getSubFeatures(coursesFeature[0].id).toPromise(), 'subfeatures')
                if(subfeatures) {
                    let feature_name = 'Hotmart integration'
                    let sub1 = subfeatures.filter(sf => {
                        return sf.name_en == feature_name
                    })
                    let subfeatures1 = sub1 && sub1[0] ? sub1[0] : []
                    if(subfeatures1 && subfeatures1.feature_id){
                        this.getCompanySbfeatures(subfeatures1, feature_name)      
                    }
                }
            }
        }
        
        this.getKeapSettings()
        this.getKeapHookEventTypes()
        this.getKeapTags()
        this.getKeapHooks()
    }

    async getCompanySbfeatures(subfeatures, feature: string = '') {
        if(this.subfeature_id_global != subfeatures.feature_id || this.company_subfeatures.length == 0) {
            this.subfeature_id_global = subfeatures.feature_id
            this.company_subfeatures = get(await this._companyService.getCompanySubFeatures(subfeatures.feature_id, this.companyId).toPromise(), 'subfeatures')
        }
    
        if(this.feature_global != feature) {
            this.feature_global = feature
            if(this.company_subfeatures && this.company_subfeatures.length > 0) {
                let feat = this.company_subfeatures.find((f) => f.feature_id == subfeatures.feature_id && f.subfeature_id == subfeatures.id && f.company_id == parseInt(this.companyId))
        
                if(feat) {
                    switch(feature) {
                        case 'Hotmart integration':
                            this.hasHotmartIntegration = feat && feat.active == 1 ? true : false
                            if(this.hasHotmartIntegration) { 
                                this.getHotmartSettings()
                            } else {
                                this.getCourses()
                            }
                            break
                    }
                }
            }
        }
    }

    getHotmartSettings() {
        this._companyService.getHotmartSettings(this.companyId).subscribe(
            response => {
                this.hotmartSettings = response.hotmart_settings
                this.getCourses()
            },
            error => {
                console.log(error);
            }
        )
    }

    getKeapSettings() {
        this._companyService.getKeapSettings(this.companyId)
          .subscribe(
            async response => {
              this.keapSettings = response['keap_settings']
              this.serviceAccountKey = this.keapSettings ? this.keapSettings.service_account_key : ''
            },
            error => {
                console.log(error)
            }
        )
    }

    getKeapHookEventTypes() {
        this._companyService.getKeapHookEventTypes()
          .subscribe(
            async response => {
              this.hookEventTypes = response['hook_event_types']
            },
            error => {
                console.log(error)
            }
        )
    }

    getKeapTags() {
        this._companyService.getKeapTags(this.companyId)
          .subscribe(
            async response => {
              this.keapTags = response['tags']
            },
            error => {
                console.log(error)
            }
        )
    }

    getCourses() {
        this._coursesService.getAllCourses(this.companyId).subscribe(data => {
            let courses = data['courses']
            if(courses) {
                if(this.hasHotmartIntegration) {
                    courses = courses && courses.filter(c => {
                        let include = false
            
                        if(!c.hotmart_product_id || (c.hotmart_product_id && c.hotmart_show == 1 && this.hotmartSettings.show == 1)) {
                            include =  true
                        }
                        
                        return include
                    })
                } else {
                    courses = courses && courses.filter(c => {
                        return !c.hotmart_product_id
                    })
                }
                courses = courses.map((course, index) => {
                    let category_display = ''
                    if(course.categories) {
                        course.categories.forEach(c => {
                            if(!category_display) {
                                category_display = this.language == 'en' ? c.name_EN : c.name_ES
                            } else {
                                category_display += ', ' + this.language == 'en' ? c.name_EN : c.name_ES
                            }
                        });
                    }
        
                    return {
                        category_display,
                        ...course
                    }
                })
            }
            this.courses = courses && courses.filter(c => {
                return c.status = 1
            })
          }, error => {
            
          })
    }

    getKeapHooks() {
        this._companyService.getKeapHooks(this.companyId)
          .subscribe(
            async response => {
              this.hooks = response['hooks']
              this.allHooks = this.hooks
              this.populateTable(this.hooks)
              this.isloading = false
            },
            error => {
                console.log(error)
            }
        )
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
            this.data?.slice(
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

    setServiceAccountKey() {
        this.showKeapModal = true;
        this.showEditKeapHookModal = false;
        this.showEditKeapIntegrationModal = false;
        this.modalbutton2?.nativeElement.click();
    }

    saveServiceAccountKey() {
        if(this.serviceAccountKey) {
            let params = {
                company_id: this.companyId,
                service_account_key: this.serviceAccountKey,
            }

            this._companyService.editKeapSettings(params)
            .subscribe(
                response => {
                    this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                    this.showKeapModal = false;
                    this.closemodalbutton2?.nativeElement.click();
                },
                error => {
                    console.log(error)
                }
            )
        }
    }

    getCourseName(row) {
        let course = row.course
        return course ? (this.language == 'en' ? (course.title_en ? (course.title_en || course.title) : course.title) :
            (this.language == 'fr' ? (course.title_fr ? (course.title_fr || course.title) : course.title) : 
                (this.language == 'eu' ? (course.title_eu ? (course.title_eu || course.title) : course.title) : 
                    (this.language == 'ca' ? (course.title_ca ? (course.title_ca || course.title) : course.title) : 
                    (this.language == 'de' ? (course.title_de ? (course.title_de || course.title) : course.title) : course.title)
                    )
                )
            )
        ) : ''
    }

    getCourseTitle(course) {
        return this.language == 'en' ? (course.title_en ? (course.title_en || course.title) : course.title) :
            (this.language == 'fr' ? (course.title_fr ? (course.title_fr || course.title) : course.title) : 
                (this.language == 'eu' ? (course.title_eu ? (course.title_eu || course.title) : course.title) : 
                    (this.language == 'ca' ? (course.title_ca ? (course.title_ca || course.title) : course.title) : 
                        (this.language == 'de' ? (course.title_de ? (course.title_de || course.title) : course.title) : course.title)
                    )
                )
        )
    }

    getEventTypeDescription(type) {
        return this.language == 'en' ? (type.description_en ? (type.description_en || type.description) : type.description) :
            (this.language == 'fr' ? (type.description_fr ? (type.description_fr || type.description) : type.description) : 
                (this.language == 'eu' ? (type.description_eu ? (type.description_eu || type.description) : type.description) : 
                    (this.language == 'ca' ? (type.description_ca ? (type.description_ca || type.description) : type.description) : 
                    (this.language == 'de' ? (type.description_de ? (type.description_de || type.description) : type.description) : type.description)
                    )
                )
            )
    }

    editRow(row) {
        this.reset();
        this.mode = 'edit';
        this.title = row.title;
        this.selectedTagId = row.tag_id;
        this.selectedTag = row.tag;
        this.selectedEventType = row.event_type;
        this.selectedCourse = row.course_id;
        this.showKeapModal = false;
        this.showEditKeapHookModal = false;
        this.showEditKeapIntegrationModal = false;

        if(this.viewMode == 'hooks') {
            this.selectedHook = row;
            this.showEditKeapHookModal = true;
        } else if (this.viewMode == 'integrations') {
            this.selectedIntegration = row;
            this.showEditKeapIntegrationModal = true;
        }
        this.modalbutton2?.nativeElement.click();
    }

    editHookStatus(event, hook) {
        hook.status = event?.target?.checked ? 1 : 0
        let params = {
          id: hook.id,
          status: event?.target?.checked ? 1 : 0
        }
        this._companyService.editHookStatus(hook.id, params).subscribe(
          response => {
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          },
          error => {
            console.log(error);
          }
        )
    }

    confirmDeleteRow(row) {
        if (row) {
            this.showConfirmationModal = false;
            this.selectedItem = row;
            this.confirmMode = "delete";
            this.confirmDeleteItemTitle = this._translateService.instant(
              "dialog.confirmdelete"
            );
            this.confirmDeleteItemDescription = this._translateService.instant(
              "dialog.confirmdeleteitem"
            );
            this.acceptText = "OK";
            setTimeout(() => (this.showConfirmationModal = true));
        }
    }

    proceedDelete(id, confirmed) {
        if(this.viewMode == 'hooks') {
            this.proceedDeleteHook(id, confirmed)
        } else if(this.viewMode == 'integrations') {
            this.proceedDeleteIntegration(id, confirmed)
        }
    }

    proceedDeleteHook(id, confirmed) {
        if(confirmed) {
            this._companyService.deleteHook(id).subscribe(
                response => {
                    this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
                    this.getKeapHooks()
                },
                error => {
                    console.log(error)
                }
            )
        }
    }

    addNew() {
        this.reset();
        this.mode = 'add';
        this.showKeapModal = false;
        this.showEditKeapHookModal = false;
        this.showEditKeapIntegrationModal = false;
        if(this.viewMode == 'hooks') {
            this.showEditKeapHookModal = true;
        } else if(this.viewMode == 'integrations') {
            this.showEditKeapIntegrationModal = true;
        }
        this.modalbutton2?.nativeElement.click();
    }

    saveKeapHook() {
        this.formSubmitted = true

        if(!this.title || !this.selectedEventType || !this.selectedTag && !this.selectedCourse) {
            return false
        }

        if(this.mode == 'add') { 
            let params = {
                company_id: this.companyId,
                title: this.title,
                event_type: this.selectedEventType,
                tag_id: this.selectedTagId,
                tag: this.selectedTag,
                course_id: this.selectedCourse,
            }

            this._companyService.addHook(params).subscribe(
                response => {
                    this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                    this.showEditKeapHookModal = false;
                    this.getKeapHooks();
                    this.closemodalbutton2?.nativeElement.click();
                },
                error => {
                    console.log(error)
                }
            )
        } else if(this.mode == 'edit') {
            let params = {
                id: this.selectedHook.id,
                title: this.title,
                event_type: this.selectedEventType,
                tag_id: this.selectedTagId,
                tag: this.selectedTag,
                course_id: this.selectedCourse,
            }
            this._companyService.editHook(params).subscribe(
                response => {
                    this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
                    this.showEditKeapHookModal = false;
                    this.getKeapHooks();
                    this.closemodalbutton2?.nativeElement.click();
                },
                error => {
                    console.log(error)
                }
            )
        }
    }

    handleChangeTag(event) {
        let id = event.target.value
        if(this.keapTags && this.keapTags.length > 0) {
            let tag = this.keapTags.filter(t => {
                return t.id == id
            })
            if(tag && tag[0]) {
                this.selectedTag = tag[0].name
            }
        }
    }

    reset() {
        this.mode = '';
        this.title = '';
        this.selectedTagId = '';
        this.selectedEventType = '';
        this.selectedCourse = '';
        this.selectedHook = '';
    }

    handleChangeViewMode(event) {
        this.buttonList?.forEach((item) => {
            if (item.id === event.id) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });

        this.viewMode = event.type;
        this.isloading = true

        if(this.viewMode == 'hooks' || this.viewMode == 'integrations') {
            this. displayedColumns = ['title', 'event_type', 'tag', 'course', 'last_execution', 'action']
            if(this.viewMode == 'hooks') { this.getKeapHooks() }
            if(this.viewMode == 'integrations') { this.getKeapIntegrations() }
        } else if(this.viewMode == 'logs') {
            this.displayedColumns = ['name', 'course', 'event_type', 'tag', 'date', 'action']
            this.getKeapHookLogs()
        }
    }

    getKeapHookLogs() {
        this._companyService.getKeapHookLogs(this.companyId)
          .subscribe(
            async response => {
              this.hookLogs = response['logs']
              this.allHookLogs = this.hookLogs
              this.populateTable(this.hookLogs)
              this.isloading = false
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
        this.filterData();
    }

    filterData() {
        if(this.viewMode == 'hooks') {
            this.hooks = this.allHooks
            if(this.searchKeyword) {
                this.hooks = this.hooks && this.hooks.filter(h => {
                    return h.title && h.title.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.tag && h.tag.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.event_type && h.event_type.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.course && h.course.title && h.course.title.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.course && h.course.title_en && h.course.title_en.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.course && h.course.title_fr && h.course.title_fr.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.course && h.course.title_eu && h.course.title_eu.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.course && h.course.title_ca && h.course.title_ca.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.course && h.course.title_de && h.course.title_de.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0
                })
            }
            this.populateTable(this.hooks)
        } else if(this.viewMode == 'logs') {
            this.hookLogs = this.allHookLogs
            if(this.searchKeyword) {
                this.hookLogs = this.hookLogs && this.hookLogs.filter(h => {
                    return h.name && h.name.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.tag && h.tag.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.event_type && h.event_type.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.title && h.title.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.title_en && h.title_en.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.title_fr && h.title_fr.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.title_eu && h.title_eu.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.title_ca && h.title_ca.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 ||
                        h.title_de && h.title_de.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0
                })
            }
            this.populateTable(this.hookLogs)
        }
    }

    resendEmail(row) {
        if (row) {
            this.showConfirmationModal = false;
            this.selectedItem = row;
            this.confirmMode = "resend";
            this.confirmDeleteItemTitle = this._translateService.instant(
              "dialog.confirmresend"
            );
            this.confirmDeleteItemDescription = this._translateService.instant(
              "dialog.confirmresendemail"
            );
            this.acceptText = "OK";
            setTimeout(() => (this.showConfirmationModal = true));
        }
    }

    confirm() {
        if(this.confirmMode == 'resend') {
            this.resend();
            this.showConfirmationModal = false;
        } else if(this.confirmMode == 'delete') {
            this.proceedDelete(this.selectedItem.id, true);
            this.showConfirmationModal = false;
        }
    }

    resend() {
        let params = {
            email: this.selectedItem.email,
            company_id: this.companyId,
            course_id: this.selectedItem.course_id,
        }
        
        this._coursesService.resendCourseAccess(params).subscribe(data => {
            this.open(this._translateService.instant('dialog.sentsuccessfully'), '')
        }, error => {

        })
    }

    getKeapIntegrations() {
        this._companyService.getKeapIntegrations(this.companyId)
          .subscribe(
            async response => {
              this.integrations = response['integrations']
              this.allIntegrations = this.integrations
              this.populateTable(this.integrations)
              this.isloading = false
            },
            error => {
                console.log(error)
            }
        )
    }

    saveKeapIntegration() {
        this.formSubmitted = true

        if(!this.title || !this.selectedEventType || !this.selectedTag && !this.selectedCourse) {
            return false
        }

        if(this.mode == 'add') { 
            let params = {
                company_id: this.companyId,
                title: this.title,
                event_type: this.selectedEventType,
                tag_id: this.selectedTagId,
                tag: this.selectedTag,
                course_id: this.selectedCourse,
            }

            this._companyService.addIntegration(params).subscribe(
                response => {
                    this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                    this.showEditKeapIntegrationModal = false;
                    this.getKeapIntegrations();
                    this.closemodalbutton2?.nativeElement.click();
                },
                error => {
                    console.log(error)
                }
            )
        } else if(this.mode == 'edit') {
            let params = {
                id: this.selectedIntegration.id,
                title: this.title,
                event_type: this.selectedEventType,
                tag_id: this.selectedTagId,
                tag: this.selectedTag,
                course_id: this.selectedCourse,
            }
            this._companyService.editIntegration(params).subscribe(
                response => {
                    this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                    this.showEditKeapIntegrationModal = false;
                    this.getKeapIntegrations();
                    this.closemodalbutton2?.nativeElement.click();
                },
                error => {
                    console.log(error)
                }
            )
        }
    }

    proceedDeleteIntegration(id, confirmed) {
        if(confirmed) {
            this._companyService.deleteIntegration(id).subscribe(
                response => {
                    this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
                    this.getKeapIntegrations();
                },
                error => {
                    console.log(error)
                }
            )
        }
    }

    editIntegrationStatus(event, integration) {
        integration.status = event?.target?.checked ? 1 : 0
        let params = {
          id: integration.id,
          status: event?.target?.checked ? 1 : 0
        }
        this._companyService.editIntegrationStatus(integration.id, params).subscribe(
            response => {
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
            },
            error => {
                console.log(error);
            }
        )
    }

    handleGoBack() {
        this._location.back();
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