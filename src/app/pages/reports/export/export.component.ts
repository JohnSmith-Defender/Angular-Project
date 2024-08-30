import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import {
  BreadcrumbComponent,
  PageTitleComponent,
} from "@share/components";
import {
  CompanyService,
  LocalService,
  UserService,
  ExcelService,
} from "@share/services";
import { SearchComponent } from "@share/components/search/search.component";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from "@angular/forms";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { DateAdapter } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { OffersService, PlansService } from "@features/services";
import { initFlowbite } from "flowbite";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: "app-export",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    PageTitleComponent,
    SearchComponent,
  ],
  templateUrl: "./export.component.html",
})
export class ExportComponent {
  private destroy$ = new Subject<void>();

  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  userId: any;
  companyId: any;
  companyDomain: any;
  language: any;
  isloading: boolean = true;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  superAdmin: boolean = false;
  company: any;
  searchText: any;
  placeholderText: any;
  searchKeyword: any;
  dataSources: any = [];
  selectedDataSourceId: any = '';
  dataSourceFields: any = [];
  includedFields: any = [];
  dropdownSettings: any;
  selectedStartDate: any;
  selectedEndDate: any;
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  minDate: any;
  maxDate: any;
  data: any = [];
  columns: any[] = [];
  displayedColumns: any[] = [];
  dataSource: any;
  pageSize: number = 25;
  pageIndex: number = 0;
  tableData: any = [];
  allTableDataRows: any = [];
  p: any;
  sub: any;
  categories: any = [];
  subcategories: any = [];
  discountTypes: any = [];
  allProfileFields: any = [];
  allProfileFieldMapping: any = [];
  selectedFields: any = [];
  profileFields: any = [];
  showResults: boolean = false;
  queryCompleted: boolean = false;
  me: any;
  memberTypeId: any;
  customMemberTypes: any = [];
  customMemberType: any;
  hasQueryError: boolean = false;
  processingProgress: number = 0;
  @ViewChild("modalbutton1", { static: false }) modalbutton1:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton1", { static: false }) closemodalbutton1:
    | ElementRef
    | undefined;
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  enableGenerate: boolean = false;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _plansService: PlansService,
    private _offersService: OffersService,
    private _userService: UserService,
    private _excelService: ExcelService,
    private _location: Location,
    private _snackBar: MatSnackBar,
    private dateAdapter: DateAdapter<Date>,
  ) { }

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
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
      this.companyDomain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
    }

    this.languageChangeSubscription = this._translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.language = event.lang;
        this.initializePage();
      }
    );

    this.dateAdapter.setLocale('es-ES');
    this.initializeDate();
    this.initializePage();
  }

  initializePage() {
    this.initializeSearch();
    this.initializeBreadcrumb();

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: this.language == 'en' ? 'field_en' :
        (this.language == 'fr' ? 'field_fr' :
          (this.language == 'eu' ? 'field_eu' :
            (this.language == 'ca' ? 'field_ca' :
              (this.language == 'de' ? 'field_de' : 'field_es')
            )
          )
        ),
      selectAllText: this._translateService.instant('dialog.selectall'),
      unSelectAllText: this._translateService.instant('dialog.clearall'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
      noDataAvailablePlaceholderText: this._translateService.instant('your-admin-area.nodata'),
    }

    this.getFeatures();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant("news.searchbykeyword");
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant("company-settings.export");
    this.level2Title = "";
    this.level3Title = "";
    this.level4Title = "";
  }

  initializeDate() {
    this.selectedStartDate = moment().startOf('month').format("YYYY-MM-DD");
    this.selectedEndDate = moment().format("YYYY-MM-DD");
    this.dateRange = new FormGroup({
      start: new FormControl(this.selectedStartDate),
      end: new FormControl( this.selectedEndDate)
    });
  }

  resetDate() {
    this.selectedStartDate = '';
    this.selectedEndDate = '';
    this.initializePage();
  }

  getFeatureTitle(feature) {
    return feature
      ? this.language == "en"
        ? feature.name_en ||
        feature.feature_name ||
        feature.name_es ||
        feature.feature_name_ES
        : this.language == "fr"
          ? feature.name_fr ||
          feature.feature_name_FR ||
          feature.name_es ||
          feature.feature_name_ES
          : this.language == "eu"
            ? feature.name_eu ||
            feature.feature_name_EU ||
            feature.name_es ||
            feature.feature_name_ES
            : this.language == "ca"
              ? feature.name_ca ||
              feature.feature_name_CA ||
              feature.name_es ||
              feature.feature_name_ES
              : this.language == "de"
                ? feature.name_de ||
                feature.feature_name_DE ||
                feature.name_es ||
                feature.feature_name_ES
                : this.language == "it"
                  ? feature.name_it ||
                  feature.feature_name_IT ||
                  feature.name_es ||
                  feature.feature_name_ES
                  : feature.name_es || feature.feature_name_ES
      : "";
  }

  handleSearch(event) {
    this.searchKeyword = event;
  }

  handleDataSourceChange(event) {
    this.dataSourceFields = [];
    this.includedFields = [];
    this.data = [];
    this.dataSource = [];
    this.selectedDataSourceId = event?.target?.value;
    if (this.selectedDataSourceId == 15) {
      this.selectedStartDate = '';
      this.selectedEndDate = '';
      this.dateRange = new FormGroup({
        start: new FormControl(this.selectedStartDate),
        end: new FormControl( this.selectedEndDate)
      });
      if (this.companyId == 12) {
        this.getProfileFields()
      } else {
        this.getCustomProfileFields()
      }
    } else {
      if(this.selectedDataSourceId == 1) {
        this.initializeDate();
      }
      this.getDataSourceFields(this.selectedDataSourceId);
    }
  }

  getProfileFields() {
    this._userService.getProfileFields()
      .subscribe(
        async (response) => {
          this.allProfileFields = response.profile_fields
          this.getProfileFieldMapping()
        },
        error => {
          console.log(error)
        }
      )
  }

  getProfileFieldMapping() {
    this._userService.getProfileFieldMapping(this.companyId)
      .subscribe(
        async (response) => {
          this.allProfileFieldMapping = response.profile_field_mapping

          let profile_fields: any[] = []
          let selected_fields: any[] = []
          if (this.allProfileFields) {
            this.allProfileFields.forEach(field => {
              let match = this.allProfileFieldMapping.some(a => a.field_id === field.id)
              if (!match) {
                profile_fields.push(field)
              }
            });
          }

          if (this.allProfileFieldMapping) {
            this.allProfileFieldMapping.forEach(field => {
              let reg_field = this.allProfileFields.filter(f => {
                return f.id == field.field_id
              })

              let fld = {}
              if (reg_field && reg_field[0]) {
                let field_display_en = reg_field[0].field_display_en
                if (field.field_display_en && field.field_display_en != null) {
                  field_display_en = field.field_display_en
                }
                let field_display_es = reg_field[0].field_display_es
                if (field.field_display_es && field.field_display_es != null) {
                  field_display_es = field.field_display_es
                }
                let field_desc_en = reg_field[0].field_desc_en
                if (field.field_desc_en && field.field_desc_en != null) {
                  field_desc_en = field.field_desc_en
                }
                let field_desc_es = reg_field[0].field_desc_es
                if (field.field_desc_es && field.field_desc_es != null) {
                  field_desc_es = field.field_desc_es
                }
                let field_group_en = reg_field[0].field_group_en
                if (field.field_group_en && field.field_group_en != null) {
                  field_group_en = field.field_group_en
                }
                let field_group_es = reg_field[0].field_group_es
                if (field.field_group_es && field.field_group_es != null) {
                  field_group_es = field.field_group_es
                }

                fld = {
                  "id": reg_field[0].id,
                  "field": reg_field[0].field,
                  "field_type": reg_field[0].field_type,
                  "field_display_en": field_display_en,
                  "field_display_es": field_display_es,
                  "field_group_en": field_group_en,
                  "field_group_es": field_group_es,
                  "field_desc_en": field_desc_en,
                  "field_desc_es": field_desc_es,
                  "active": reg_field[0].active,
                  "created_at": reg_field[0].created_at
                }
                selected_fields.push(fld)
              }
            })
          }

          this.profileFields = profile_fields
          this.selectedFields = selected_fields

          let datasource_fields: any[] = []
          if (this.selectedFields) {
            this.selectedFields.forEach(field => {
              if (field.field_type != 'image' && field.field_type != 'password') {
                datasource_fields.push({
                  "id": field.id,
                  "data_source_id": this.selectedDataSourceId,
                  "field_en": field.field_display_en,
                  "field_es": field.field_display_es,
                  "field": field.field,
                  "created_at": field.created_at
                })
              }
            });

            if (this.selectedDataSourceId == 8) {
              datasource_fields.push({
                "id": 100,
                "data_source_id": this.selectedDataSourceId,
                "field_en": 'Role',
                "field_es": 'Papel',
                "field": 'user_role',
                "created_at": Date.now()
              })

              if (this.companyId == 12) {
                datasource_fields.push({
                  "id": 101,
                  "data_source_id": this.selectedDataSourceId,
                  "field_en": 'Member contract',
                  "field_es": 'Contrato de miembro',
                  "field": 'contract',
                  "created_at": Date.now()
                })
              }

              datasource_fields.push({
                "id": 102,
                "data_source_id": this.selectedDataSourceId,
                "field_en": 'Registered date',
                "field_es": 'La fecha registrada',
                "field": 'registered_date',
                "created_at": Date.now()
              })
            }

            setTimeout(() => {
              this.dataSourceFields = datasource_fields;
            }, 500)
          }
        },
        error => {
          console.log(error)
        }
      )
  }

  async getCustomProfileFields() {
    this.me = get(await this._userService.getUserById(this.userId).toPromise(), 'CompanyUser')
    this.memberTypeId = this.me.custom_member_type_id
    this._userService.getMemberTypeCustomProfileFields(this.companyId, this.memberTypeId).subscribe(
      (response: any) => {
        let allProfileFields = response.profile_fields
        let profile_fields: any[] = []
        if (allProfileFields) {
          let cnt = 1
          allProfileFields.forEach(p => {
            profile_fields.push({
              "id": p.id,
              "company_id": p.company_id,
              "custom_member_type_id": p.custom_member_type_id,
              "profile_field_id": p.profile_field_id,
              "field_type": p.field_type,
              "field_display_en": p.field_display_en,
              "field_display_es": p.field_display_es,
              "field_group_en": p.field_group_en,
              "field_group_es": p.field_group_es,
              "field_desc_en": p.field_desc_en,
              "field_desc_es": p.field_desc_es,
              "field": p.field,
              "required": p.required,
              "created_at": p.created_at,
              "sequence": cnt
            })
            cnt++
          });
        }
        this.allProfileFields = profile_fields
        this.getCustomProfileFieldMapping()
      },
      error => {
        console.log(error)
      }
    )
  }

  getCustomProfileFieldMapping() {
    this._userService.memberProfileFieldSettings(this.userId)
      .subscribe(
        async (response) => {
          this.allProfileFieldMapping = response.profile_fields

          let profile_fields = this.allProfileFields
          let selected_fields: any[] = []

          if (this.allProfileFieldMapping && this.allProfileFieldMapping.length > 0) {
            this.allProfileFieldMapping.forEach(field => {
              let reg_field = this.allProfileFields.filter(f => {
                return f.profile_field_id == field.profile_field_id
              })

              let fld = {}
              if (reg_field && reg_field[0]) {
                fld = {
                  "id": reg_field[0].profile_field_id,
                  "user_id": this.userId,
                  "company_id": this.companyId,
                  "field": reg_field[0].field,
                  "field_type": reg_field[0].field_type,
                  "field_display_en": reg_field[0].field_display_en,
                  "field_display_es": reg_field[0].field_display_es,
                  "field_group_en": reg_field[0].field_group_en,
                  "field_group_es": reg_field[0].field_group_es,
                  "field_desc_en": reg_field[0].field_desc_en,
                  "field_desc_es": reg_field[0].field_desc_es,
                  "show": field.show == 1 ? true : false,
                  "required": reg_field[0].required,
                  "created_at": reg_field[0].created_at,
                  "sequence": reg_field[0].sequence
                }

                selected_fields.push(fld)
              }
            })
          } else {
            this.allProfileFields.forEach(f => {
              selected_fields.push({
                "id": f.profile_field_id,
                "user_id": this.userId,
                "company_id": this.companyId,
                "field": f.field,
                "field_type": f.field_type,
                "field_display_en": f.field_display_en,
                "field_display_es": f.field_display_es,
                "field_group_en": f.field_group_en,
                "field_group_es": f.field_group_es,
                "field_desc_en": f.field_desc_en,
                "field_desc_es": f.field_desc_es,
                "show": true,
                "required": f.required,
                "created_at": f.created_at,
                "sequence": f.sequence
              })
            });
          }
          if (selected_fields) {
            selected_fields = selected_fields.sort((a, b) => {
              return a.sequence - b.sequence
            })
          }

          this.profileFields = profile_fields
          this.selectedFields = selected_fields

          let datasource_fields: any[] = []
          if (this.selectedFields) {
            this.selectedFields.forEach(field => {
              if (field.field_type != 'image' && field.field_type != 'password') {
                datasource_fields.push({
                  "id": field.id,
                  "data_source_id": this.selectedDataSourceId,
                  "field_en": field.field_display_en,
                  "field_es": field.field_display_es,
                  "field": field.field,
                  "created_at": field.created_at
                })
              }
            });

            if (this.selectedDataSourceId == 8) {
              datasource_fields.push({
                "id": 100,
                "data_source_id": this.selectedDataSourceId,
                "field_en": 'Role',
                "field_es": 'Papel',
                "field": 'user_role',
                "created_at": Date.now()
              })

              if (this.companyId == 12) {
                datasource_fields.push({
                  "id": 101,
                  "data_source_id": this.selectedDataSourceId,
                  "field_en": 'Member contract',
                  "field_es": 'Contrato de miembro',
                  "field": 'contract',
                  "created_at": Date.now()
                })
              }

              datasource_fields.push({
                "id": 102,
                "data_source_id": this.selectedDataSourceId,
                "field_en": 'Registered date',
                "field_es": 'La fecha registrada',
                "field": 'registered_date',
                "created_at": Date.now()
              })
            }

            setTimeout(() => {
              this.dataSourceFields = datasource_fields;
            }, 500)
          }
        },
        error => {
          console.log(error)
        }
      )
  }

  handleDateChange(type, event) {
    if (type == "start") {
      if (moment(event?.value).isValid()) {
        this.selectedStartDate = moment(event.value).format("YYYY-MM-DD");
      } else {
        this.selectedStartDate = '';
      }
    }
    if (type == "end") {
      if (moment(event?.value).isValid()) {
        this.selectedEndDate = moment(event.value).format("YYYY-MM-DD");
      } else {
        this.selectedEndDate = '';
      }
    }
  }

  async getFeatures() {
    this.dataSources = this._localService.getLocalStorage(environment.lsfeatures)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (!this.dataSources || this.dataSources?.length == 0) {
      this.dataSources = await this._companyService
        .getFeatures(this.companyDomain)
        .toPromise();
    }
  }

  getDataSourceFields(id) {
    this._companyService.getDataSourceFields(id)
      .subscribe(
        async (response) => {
          this.dataSourceFields = response.data_source_fields

          if (this.selectedDataSourceId == 1) {
            let categories = get(await this._plansService.getEventCategories(this.companyId).toPromise(), 'categories')
            if (categories) {
              categories.forEach(c => {
                this.categories.push({
                  id: c.id,
                  name_EN: c.name_en,
                  name_ES: c.name_es
                })
              });
            }
            let subcategories = get(await this._plansService.getEventSubcategories(this.companyId).toPromise(), 'subcategories')
            if (subcategories) {
              subcategories.forEach(c => {
                let category_en = ''
                let category_es = ''
                if (this.categories) {
                  let cat = this.categories.filter(cat => {
                    return cat.id == c.category_id
                  })
                  if (cat && cat[0]) {
                    category_en = cat[0].name_EN
                    category_es = cat[0].name_ES
                  }
                }

                this.subcategories.push({
                  id: c.id,
                  category_id: c.category_id,
                  category_EN: category_en,
                  category_ES: category_es,
                  name_EN: c.name_en,
                  name_ES: c.name_es,
                  mode: c.mode
                })
              });
            }
            if (this.categories && this.categories.length > 0 && this.subcategories && this.subcategories.length > 0) {

            } else {
              let data_source_fields = this.dataSourceFields.filter(f => {
                return f.field != 'event_type' && f.field != 'event_subcategory'
              })
              this.dataSourceFields = data_source_fields
            }
          }

          if (this.selectedDataSourceId == 3) {
            this.discountTypes = get(await this._offersService.getDiscountTypes(this.companyId).toPromise(), 'discount_types');
            if (this.discountTypes && this.discountTypes.length > 0) {
              let data_source_fields = this.dataSourceFields.filter(f => {
                return f.field != 'category'
              })
              this.dataSourceFields = data_source_fields
            } else {
              let data_source_fields = this.dataSourceFields.filter(f => {
                return f.field != 'discount_type'
              })
              this.dataSourceFields = data_source_fields
            }
          }

          setTimeout(() => {
            this.showResults = false
            this.queryCompleted = false
            this.data = []
          }, 500)
        },
        error => {
          console.log(error)
        }
      )
  }

  handleChangeField(event) {
    if(this.includedFields?.length > 0) {
      this.enableGenerate = true;
    } else {
      this.enableGenerate = false;
    }
  }

  onDeSelectField(event) {

  }

  loadData() {
    if(this.includedFields?.length == 0) {
      return false;
    }
    setTimeout(() => {
      initFlowbite();
      this.modalbutton1?.nativeElement.click();
      this.processingProgress = 15;
      
      this.p = 1;
      this.data = [];
      if(this.selectedDataSourceId && this.includedFields.length > 0) {
        if(this.includedFields) {
          this.includedFields = this.includedFields.sort((a, b) => (a.id > b.id) ? 1 : -1)
        }

        let selected_fields: any[] = []
        if(this.includedFields?.length > 0) {
          this.includedFields?.forEach(f => {
            let field = this.dataSourceFields?.filter(fld => {
              return fld.id == f.id
            })
            if(field?.length > 0) {
              selected_fields.push({
                id: f.id,
                field: field[0].field
              })
            }
          })
        }

        let params = {
          data_source_id: this.selectedDataSourceId ? this.selectedDataSourceId : 0,
          selected_fields,
          company_id: this.companyId,
          user_id: this.userId,
          start_date: this.selectedDataSourceId != 5 && this.selectedDataSourceId != 4 ? this.selectedStartDate : null,
          end_date: this.selectedDataSourceId != 5 && this.selectedDataSourceId != 4 ? this.selectedEndDate : null,
          role: ''
        }

        this.processingProgress = 35;

        this._companyService.queryDatabase(params)
        .subscribe(
          async (response) => {
            this.processingProgress = 100;
            this.queryCompleted = true;
            this.data = response.data;

            let table_data:any[] = [];
            if(this.data?.length > 0) {
              this.data?.forEach((row, index) => {
                table_data?.push({})
              })
            }

            if(table_data?.length > 0) {
              for(var i = 0; i < table_data?.length; i++) {
                let data = this.data[i]
                data?.columns?.forEach((item, idx) => {
                  table_data[i][item.field] = item.value;
                });
              }
            }
            
            this.tableData = table_data;
            this.initializeData(table_data);
            
            setTimeout(() => {
              this.closemodalbutton1?.nativeElement.click();
            }, 500)
          },
          error => {
            console.log(error)
          }
        )
      }
    }, 500)
  }

  initializeData(data) {
    const columns = data
      .reduce((columns, row) => {
        return [...columns, ...Object.keys(row)];
      }, [])
      .reduce((columns, column) => {
        return columns.includes(column) ? columns : [...columns, column];
      }, []);
    // Describe the columns for <mat-table>.
    this.columns = columns.map((column) => {
      return {
        columnDef: column,
        header: column,
        cell: (element: any) => `${element[column] ? element[column] : ``}`,
      };
    });

    this.displayedColumns = this.columns.map((c) => c.columnDef);
    this.refreshTable(data);
  }

  refreshTable(data) {
    this.dataSource = new MatTableDataSource(
      data.slice(
        this.pageIndex * this.pageSize,
        (this.pageIndex + 1) * this.pageSize
      )
    );
    setTimeout(() => {
      if (this.paginator) {
        new MatTableDataSource(data).paginator = this.paginator;
        this.paginator.firstPage();
      }
      this.dataSource.sort = this.sort;
    }, 500);
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    let list = this.tableData;
    this.dataSource = new MatTableDataSource(
      list?.slice(
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

  goToDetails(row, key) {
    if (this.sub == "joined" || this.sub == "clicks") {
      this._router.navigate([`plans/details/${row.ID}/1`]);
    } else if (this.sub == "clubs-joined") {
      this._router.navigate([`clubs/details/${row.ID}`]);
    } else if (this.sub == "joined-generated") {
      this._router.navigate([`plans/details/${row.ID}/4`]);
    } else if (this.sub == "clubs-generated") {
      if (key == "activity") {
        this._router.navigate([`plans/details/${row.ID}/4`]);
      } else if (key == "club") {
        this._router.navigate([`clubs/details/${row.ID}`]);
      }
    } else if (this.sub == "cityagenda-clicks") {
      this._router.navigate([`news/details/${row.ID}`]);
    } else if (this.sub == "offers-joined" || this.sub == "offer-clicks") {
      this._router.navigate([`employmentchannel/details/${row.ID}`]);
    } else if (this.sub == "teams-clicks") {
      window.open(row["key"], "_blank");
    }
  }

  downloadCSV() {
    if(this.data) {
      let export_data: any[] = []
      this.data.forEach(data => {
        let row = {}
        if(data.columns) {
          data.columns.forEach(col => {
            let field = this.includedFields.filter(f => {
              let field_row = this.dataSourceFields?.filter(fld => {
                return fld.id == f.id && col.field == fld.field
              })
              let field = col.field
              if(field_row?.length > 0) {
                field = field_row[0].field_es
              }

              return f.field_es == field
            })

            if(field && field[0]) {
              row[field[0].field_es] = col.value
            }
          });
        }
        export_data.push(row)
      });

      this._excelService.exportAsExcelFile(export_data, 'exportar-' + this.userId);
    }
  }

  getColumnHeader(header) {
    return this._translateService.instant(`database.${header?.replace('_', '')?.replace('_', '')}`)
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  closeProcessingModal() {
    this.closemodalbutton1?.nativeElement.click();
  }

  handleGoBack() {
    this._location.back();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}