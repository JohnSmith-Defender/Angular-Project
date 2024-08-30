import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { environment } from "@env/environment";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import {
  BreadcrumbComponent,
  ButtonGroupComponent,
  PageTitleComponent,
  ToastComponent,
} from "@share/components";
import { CompanyService, LocalService, UserService } from "@share/services";
import { ClubsService, CoursesService, OffersService, PlansService } from "@features/services";
import { SearchComponent } from "@share/components/search/search.component";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";
import { MatOptionModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    SearchComponent,
    ButtonGroupComponent,
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: "./admin-list.component.html",
})
export class AdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() id?: any;
  @Input() list?: any;

  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  featureTitle: string = "";
  searchText: string = "";
  placeholderText: string = "";
  userId: any;
  companyId: any;
  language: any;
  companies: any;
  domain: any;
  primaryColor: any;
  buttonColor: any;
  features: any;
  allButtonList: any = [];
  buttonList: any = [];
  defaultLanguage: any;
  categories: any = [];
  allCategories: any = [];
  completeCategories: any = [];
  subcategories: any = [];
  allSubcategories: any = [];
  completeSubcategories: any = [];
  data: any[] = [];
  columns: any[] = [];
  displayedColumns: any[] = [];
  dataSource: any;
  languages: any[] = [];
  mode: string = "";
  company: any;
  formFields: any = [];
  formTemplate: any;
  confirmDeleteItemTitle: string = "";
  confirmDeleteItemDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  selectedItem: any;
  selectedFilter: any = "";
  showConfirmationModal: boolean = false;
  pageSize: number = 25;
  pageIndex: number = 0;
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  form: FormGroup = new FormGroup({});
  memberTypes: any = [];
  userRoles: any = [];
  allContactFields: any;
  contactFields: any;
  completeContactFields: any;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _plansService: PlansService,
    private _clubsService: ClubsService,
    private _coursesService: CoursesService,
    private _offersService: OffersService,
    private _userService: UserService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.language = this._localService.getLocalStorage(environment.lslang);
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
    if (company?.length > 0) {
      this.company = company[0];
      this.companyId = company[0].id;
      this.domain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
    }

    this.initialize();

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initialize();
        }
      );
  }
  
  initialize() {
    let companyFeatures = this._localService.getLocalStorage(
      environment.lsfeatures
    )
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (companyFeatures?.length > 0) {
      let feature_row = companyFeatures.filter((f) => {
        return f.id == this.id;
      });

      let feature = feature_row?.length > 0 ? feature_row[0] : {};
      this.featureTitle = feature
        ? this.language == "en"
          ? feature.name_en
            ? feature.name_en
            : feature.feature_name
          : this.language == "fr"
          ? feature.name_fr
            ? feature.name_fr
            : feature.feature_name
          : feature.name_es
          ? feature.name_es
          : feature.feature_name_ES
        : "";
    }

    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteitem"
    );
    this.acceptText = this._translateService.instant("guests.save");
    this.cancelText = this._translateService.instant("guests.cancel");
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.initializeButtonGroup();
    this.initializeLanguage();
    if (this.id == 11) {
      this.getCustomMemberTypes();
    }
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.modules"
    );
    this.level3Title = this.featureTitle;
    this.level4Title = this.getPage();
  }

  getPage() {
    let page = "";
    switch (this.list) {
      case "categories":
        page = this._translateService.instant("categories.categories");
        break;
      case "contactdetails":
        page = this._translateService.instant("clubs.contactdetails");
        break;
    }

    return page;
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  initializeButtonGroup() {
    if (this.id != 11 && this.id != 4 && this.list == "categories") {
      this.allButtonList = [
        {
          id: 1,
          value: "category",
          text: this._translateService.instant("categories.categories"),
          selected: true,
        },
        {
          id: 2,
          value: "subcategory",
          text: this._translateService.instant("categories.subcategories"),
          selected: false,
        },
      ];
    }
    this.buttonList = this.allButtonList;
  }

  initializeLanguage() {
    this._companyService
      .getLanguages(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let languages = response.languages;
          this.languages = languages
            ? languages.filter((lang) => {
                return lang.status == 1;
              })
            : [];

          if (this.languages && this.languages.length > 0) {
            this.languages = this.languages.sort((a, b) => {
              return b.default - a.default;
            });
          }
          let defaultLanguage = languages
            ? languages.filter((lang) => {
                return lang.default == true;
              })
            : [];
          this.defaultLanguage = defaultLanguage?.length > 0 ? defaultLanguage[0] : {}
          this.generateFormFields();
          this.initializeList();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializeList() {
    if (this.list == "categories") {
      if (this.id == 1) {
        if(this.companyId == 12) {
          this.selectedFilter?.value == "subcategory"
          ? this.getEventSubcategories()
          : this.getEventCategories();
        } else {
          this.selectedFilter?.value == "subcategory"
          ? this.getPlanSubcategories()
          : this.getPlanCategories();
        }
      }
      if (this.id == 5) {
        this.selectedFilter?.value == "subcategory"
          ? this.getGroupSubcategories()
          : this.getGroupCategories();
      }
      if (this.id == 11) {
        this.getCourseCategories();
      }
      if (this.id == 3) {
        this.getCityGuideCategories();
      }
      if (this.id == 4) {
        this.getDiscountCategories();
      }
    } else if (this.list == "contactdetails") {
      this.getContactDetailsFields();
    }
  }

  getEventCategories() {
    this._plansService.getEventCategories(this.companyId).subscribe(
      async response => {
        console.log(response.categories);
        let categories = response.categories;
        this.completeCategories = categories;
        categories = this.formatCategories(categories);
        this.categories = this.sortBySequence(categories);
        this.allCategories = this.categories;
        this.initializeData(this.categories);
      },
      error => {
          console.log( error );
      }
    );
  }

  getEventSubcategories() {
    this._plansService.getEventSubcategories(this.companyId).subscribe(
        async response => {
          console.log(response.subcategories)
          let subcategories = response.subcategories;
          this.completeSubcategories = subcategories;
          subcategories = this.formatSubcategories(subcategories);
          this.subcategories = this.sortBySequence(subcategories);
          this.allSubcategories = this.subcategories;
          this.initializeData(this.subcategories);
          // this.subcategories = response.subcategories;
          // if(this.categories && this.categories.length > 0) {
          //     this.fType = this.language == 'en' ? this.categories[0].name_en : this.categories[0].name_es;
          //     let catId = this.categories[0].id;
          //     this.subcats = this.subcategories.filter(sc => {
          //         return sc.category_id == catId
          //     });
          //     if(this.subcats && this.subcats.length > 0) {
          //         this.filterType = this.language == 'en' ? this.subcats[0].name_es : this.subcats[0].name_en;
          //     }
          // }
        },
        error => {
          console.log( error );
        }
    );
  }

  getPlanCategories() {
    this._plansService
      .getPlanCategories(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let categories = response.CompanySupercategory;
          this.completeCategories = categories;
          categories = this.formatCategories(categories);
          this.categories = this.sortBySequence(categories);
          this.allCategories = this.categories;
          this.initializeData(this.categories);
        },
        (error) => {
          let errorMessage = <any>error;
          if (errorMessage != null) {
            let body = JSON.parse(error._body);
          }
        }
      );
  }

  getPlanSubcategories() {
    this._plansService
      .getPlanSubcategories(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let subcategories = response.subcategories;
          this.completeSubcategories = subcategories;
          subcategories = this.formatSubcategories(subcategories);
          this.subcategories = this.sortBySequence(subcategories);
          this.allSubcategories = this.subcategories;
          this.initializeData(this.subcategories);
        },
        (error) => {
          let errorMessage = <any>error;
          if (errorMessage != null) {
            let body = JSON.parse(error._body);
          }
        }
      );
  }

  getGroupCategories() {
    this._clubsService
      .getGroupCategories(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let categories = response.categories;
          this.completeCategories = categories;
          categories = this.formatCategories(categories);
          this.categories = this.sortBySequence(categories);
          this.allCategories = this.categories;
          this.initializeData(this.categories);
        },
        (error) => {
          let errorMessage = <any>error;
          if (errorMessage != null) {
            let body = JSON.parse(error._body);
          }
        }
      );
  }

  getGroupSubcategories() {
    this._clubsService
      .getGroupSubcategories(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let subcategories = response.subcategories;
          this.completeSubcategories = subcategories;
          subcategories = this.formatSubcategories(subcategories);
          this.subcategories = this.sortBySequence(subcategories);
          this.allSubcategories = this.subcategories;
          this.initializeData(this.subcategories);
        },
        (error) => {
          let errorMessage = <any>error;
          if (errorMessage != null) {
            let body = JSON.parse(error._body);
          }
        }
      );
  }

  getCourseCategories() {
    this._coursesService
      .getCourseCategories(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          let categories = response.CompanySupercategory;
          this.completeCategories = categories;
          categories = this.formatCategories(categories);
          this.categories = this.sortBySequence(categories);
          this.allCategories = this.categories;
          this.initializeData(this.categories);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getCityGuideCategories() {
    // this._coursesService
    //   .getCourseCategories(this.companyId)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(
    //     (response) => {
    //       let categories = response.CompanySupercategory;
    //       this.completeCategories = categories;
    //       categories = this.formatCategories(categories);
    //       this.categories = this.sortBySequence(categories);
    //       this.allCategories = this.categories;
    //       this.initializeData(this.categories);
    //     },
    //     (error) => {
    //       console.log(error);
    //     }
    //   );
  }

  getDiscountCategories() {
    if(this.companyId == 12) {
      this._offersService.getDiscountTypes(this.companyId)
      .subscribe(
        response => {
          let categories = response.discount_types;
          this.completeCategories = categories;
          categories = this.formatCategories(categories);
          this.categories = this.sortBySequence(categories);
          this.allCategories = this.categories;
          this.initializeData(this.categories);
        },
        error => {
          let errorMessage = <any>error
          if (errorMessage != null) {
            let body = JSON.parse(error._body);
          }
        }
      )
    } else {
      this._offersService.getDiscountCategories(this.companyId)
      .subscribe(
        response => {
          let categories = response.CompanySupercategory;
          this.completeCategories = categories;
          categories = this.formatCategories(categories);
          this.categories = this.sortBySequence(categories);
          this.allCategories = this.categories;
          this.initializeData(this.categories);
        },
        error => {
          let errorMessage = <any>error
          if (errorMessage != null) {
            let body = JSON.parse(error._body);
          }
        }
      )
    }
    
  }

  getCustomMemberTypes() {
    this._userService
      .getCustomMemberTypes(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.memberTypes = response.member_types;
          this.userRoles = [];
          if (this.memberTypes) {
            this.memberTypes.forEach((mt) => {
              this.userRoles.push({
                id: mt.id,
                name_EN: mt.type_en,
                name_ES: mt.type_es,
                name_FR: mt.type_fr || mt.type_es,
                name_EU: mt.type_eu || mt.type_es,
                name_CA: mt.type_ca || mt.type_es,
                name_DE: mt.type_de || mt.type_es,
              });
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatCategories(categories) {
    let array: any[] = [];
    let default_language = this.defaultLanguage?.code || "es";
    console.log('default: ' + default_language)
    categories?.forEach((category) => {
      array.push({
        "guests.id": category.id,
        "guests.name": this.getNameInDefaultLanguage(
          category,
          default_language
        ),
        "pricing.order": category.sequence,
        "pricing.action":
          this.id == 11 ? ["access", "edit", "delete"] : ["edit", "delete"],
      });
    });
    return array;
  }

  formatSubcategories(subcategories) {
    let array: any[] = [];
    let default_language = this.defaultLanguage?.code || "es";
    subcategories?.forEach((subcategory) => {
      array.push({
        "guests.id": subcategory.id,
        "landing.category": this.getCategoryName(subcategory),
        "guests.name": this.getNameInDefaultLanguage(
          subcategory,
          default_language
        ),
        "pricing.order": subcategory.sequence,
        "pricing.action": ["edit", "delete"],
      });
    });
    return array;
  }

  getNameInDefaultLanguage(item, default_language) {
    console.log(item)
    return default_language == "en"
      ? item.name_EN || item.name_en || item.name_ES || item.name_es
      : default_language == "fr"
      ? item.name_FR || item.name_fr || item.name_ES || item.name_es
      : default_language == "eu"
      ? item.name_EU || item.name_eu || item.name_ES || item.name_es
      : default_language == "ca"
      ? item.name_CA || item.name_ca || item.name_ES || item.name_es
      : default_language == "de"
      ? item.name_DE || item.name_de || item.name_ES || item.name_es
      : default_language == "it"
      ? item.name_IT || item.name_it || item.name_ES || item.name_es
      : item.name_ES || item.name_es;
  }

  getCategoryName(item) {
    let category_name = "";
    if (this.categories) {
      let cat = this.categories.filter((cat) => {
        return cat["guests.id"] == item.category_id;
      });
      if (cat?.length > 0) {
        category_name = cat[0]["guests.name"];
      }
    }

    return category_name;
  }

  sortBySequence(list) {
    let sorted_list;
    if (list) {
      sorted_list = list.sort((a, b) => {
        return a["pricing.order"] - b["pricing.order"];
      });
    }

    return sorted_list;
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
    this.dataSource = new MatTableDataSource(data);
    setTimeout(() => {
      if (this.paginator) {
        new MatTableDataSource(data).paginator = this.paginator;
        this.paginator.firstPage();
      }
    });
    setTimeout(() => (this.dataSource.sort = this.sort));
  }

  handleSearchChanged(event) {
    this.filterList(event);
  }

  filterList(search) {
    if (this.selectedFilter?.value == "subcategory") {
      let subcategories = this.allSubcategories;
      if (search) {
        subcategories = subcategories?.filter((category) => {
          return (
            category["guests.name"]
              ?.toLowerCase()
              ?.indexOf(search?.toLowerCase()) >= 0 ||
            category["landing.category"]
              ?.toLowerCase()
              ?.indexOf(search?.toLowerCase()) >= 0
          );
        });
      }
      this.initializeData(subcategories);
    } else {
      let list: any[] = [];
      if (this.list == "categories") {
        list = this.allCategories;
      } else if (this.list == "contactdetails") {
        list = this.allContactFields;
      }

      if (search) {
        list = list?.filter((item) => {
          return (
            item["guests.name"]
              ?.toLowerCase()
              ?.indexOf(search?.toLowerCase()) >= 0
          );
        });
      }
      this.initializeData(list);
    }
  }

  handleButtonClick(event) {
    this.selectedFilter = event;
    if (event) {
      this.buttonList?.forEach((item) => {
        if (item.id === event.id) {
          item.selected = true;
        } else {
          item.selected = false;
        }
      });

      switch (event.value) {
        case "category":
          if (this.id == 1) {
            if(this.companyId == 12) {
              this.getEventCategories();
            } else {
              this.getPlanCategories();
            }
          } else if (this.id == 5) {
            this.getGroupCategories();
          } else if (this.id == 11) {
            this.getCourseCategories();
          } else if (this.id == 4) {
            this.getDiscountCategories();
          }
          break;
        case "subcategory":
          if (this.id == 1) {
            if(this.companyId == 12) {
              this.getEventSubcategories();
            } else {
              this.getPlanSubcategories();
            }
          } else if (this.id == 5) {
            this.getGroupSubcategories();
          }
          break;
      }
    }

    this.generateFormFields();
  }

  handleCreate() {
    this.mode = "add";
    this.form.reset();
    this.modalbutton?.nativeElement.click();
  }

  generateFormFields() {
    this.formFields = [];
    if (
      (this.list == "categories" || this.list == "contactdetails") &&
      this.mode != "access"
    ) {
      this.languages.forEach((language, index) => {
        let language_code = this.companyId == 12 ? language.code : language.code.toUpperCase();
        if (this.list == "contactdetails") {
          language_code = language.code;
        }
        this.formFields.push({
          id: index + 1,
          field_type: "text",
          field: `name_${language_code}`,
          display_text: `${this._translateService.instant(
            "members.name"
          )} (${language_code})`,
          required: true,
        });
      });
      this.formFields.push({
        id: this.languages?.length + 1,
        field_type: "number",
        field: "sequence",
        display_text: this._translateService.instant("pricing.order"),
        required: true,
      });

      if (this.selectedFilter?.value == "subcategory") {
        this.formFields.push({
          id: this.languages?.length + 1,
          field_type: "select",
          field: "category_id",
          display_text: this._translateService.instant("landing.category"),
          required: true,
        });
      }
    }

    if (this.mode == "access") {
      this.formFields.push({
        id: this.formFields?.length + 1,
        field_type: "multiselect",
        field: "user_roles",
        display_text: this._translateService.instant(
          "your-admin-area.selectrole"
        ),
        required: true,
      });
    }

    if (this.list == "contactdetails") {
      this.formFields.push({
        id: this.formFields?.length + 1,
        field_type: "checkbox",
        field: "active",
        display_text: this._translateService.instant("your-admin-area.active"),
        required: false,
      });
      this.formFields.push({
        id: this.formFields?.length + 1,
        field_type: "checkbox",
        field: "show_as_link",
        display_text: this._translateService.instant("clubs.showaslink"),
        required: true,
      });
    }

    if (this.formFields?.length > 0) {
      this.initializeFormGroup();
    }
  }

  initializeFormGroup() {
    this.formTemplate = [];

    this.formFields.forEach((field) => {
      if (field.field_type) {
        this.formTemplate.push({
          label: field.field,
          required: field.required,
          min_length: field.min_length,
          max_length: field.max_length,
        });
      }
    });

    let group = {};
    this.formTemplate.forEach((input_template) => {
      const validators: any[] = [];
      if (input_template.required) validators.push(Validators.required);
      if (input_template.min_length > 0)
        validators.push(Validators.minLength(input_template.min_length));
      if (input_template.max_length > 0)
        validators.push(Validators.maxLength(input_template.max_length));
      group[input_template.label] = new FormControl("", validators);
    });

    this.form = new FormGroup(group);
  }

  handleEdit(row) {
    this.mode = "edit";
    this.selectedItem = row;
    this.loadData(row);
    this.modalbutton?.nativeElement.click();
  }

  loadData(row) {
    let selected_row = row;
    if (this.categories) {
      if (this.selectedFilter) {
        if (this.selectedFilter?.value == "category") {
          let selected_row_item = this.completeCategories.filter((category) => {
            return category.id == row["guests.id"];
          });
          if (selected_row_item?.length > 0) {
            selected_row = selected_row_item[0];
          }
        } else if (this.selectedFilter?.value == "subcategory") {
          let selected_row_item = this.completeSubcategories.filter(
            (category) => {
              return category.id == row["guests.id"];
            }
          );
          if (selected_row_item?.length > 0) {
            selected_row = selected_row_item[0];
          }
        }
      } else {
        let selected_row_item = this.completeCategories.filter((category) => {
          return category.id == row["guests.id"];
        });
        if (selected_row_item?.length > 0) {
          selected_row = selected_row_item[0];
        }
      }
    }

    if (this.contactFields) {
      let selected_row_item = this.completeContactFields.filter(
        (contactField) => {
          return contactField.id == row["guests.id"];
        }
      );
      if (selected_row_item?.length > 0) {
        selected_row = selected_row_item[0];
      }
    }

    this.formFields?.forEach((f) => {
      this.form.controls[f.field].setValue(
        selected_row[f.field] ? selected_row[f.field] || "" : ""
      );
    });
  }

  getPageDetails(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    let list = [];
    if (this.list == "categories") {
      if (this.selectedFilter?.value == "subcategory") {
        list = this.subcategories;
      } else {
        list = this.categories;
      }
    }
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

  handleDelete(row) {
    this.showConfirmationModal = false;
    this.selectedItem = row;
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    if (this.list == "categories") {
      if (this.id == 1) {
        if(this.companyId == 12) {
          this.deleteEventCategory();
        } else {
          this.deletePlanCategory();
        }
      }
      if (this.id == 5) {
        this.deleteGroupCategory();
      }
      if (this.id == 11) {
        this.deleteCourseCategory();
      } 
      if (this.id == 4) {
        this.deleteDiscountCategory();
      }
    }
  }

  deletePlanCategory() {
    if (this.selectedFilter?.value == "subcategory") {
      this._plansService
        .deletePlanSubcategory(this.selectedItem["guests.id"])
        .subscribe(
          (response) => {
            this.initializeList();
            this.showConfirmationModal = false;
          },
          (error) => {
            console.log(error);
          }
        );
    } else {
      this._plansService
        .deletePlanEventCategory(this.selectedItem["guests.id"])
        .subscribe(
          (response) => {
            this.initializeList();
            this.showConfirmationModal = false;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  deleteEventCategory() {
    if (this.selectedFilter?.value == "subcategory") {
      this._plansService
        .deleteEventSubcategory(this.selectedItem["guests.id"])
        .subscribe(
          (response) => {
            this.initializeList();
            this.showConfirmationModal = false;
          },
          (error) => {
            console.log(error);
          }
        );
    } else {
      this._plansService
        .deleteEventOtherCategory(this.selectedItem["guests.id"])
        .subscribe(
          (response) => {
            this.initializeList();
            this.showConfirmationModal = false;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  deleteGroupCategory() {
    if (this.selectedFilter?.value == "subcategory") {
      this._clubsService
        .deleteGroupSubcategory(this.selectedItem["guests.id"], this.companyId)
        .subscribe(
          (response) => {
            this.initializeList();
            this.showConfirmationModal = false;
          },
          (error) => {
            console.log(error);
          }
        );
    } else {
      this._clubsService
        .deleteGroupCategory(this.selectedItem["guests.id"], this.companyId)
        .subscribe(
          (response) => {
            this.initializeList();
            this.showConfirmationModal = false;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  deleteCourseCategory() {
    this._coursesService
      .deleteCourseCategory(this.selectedItem["guests.id"], this.companyId)
      .subscribe(
        (response) => {
          this.initializeList();
          this.showConfirmationModal = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  deleteDiscountCategory() {
    if(this.companyId == 12) {
      this._offersService.deleteDiscountType(
        this.selectedItem["guests.id"],
        this.companyId
      ).subscribe(
        response => {
          this.initializeList();
          this.showConfirmationModal = false;
        },
        error => {
            console.log(error);
        }
      )
    } else {
      this._offersService.deleteDiscountCategory(
        this.selectedItem["guests.id"],
        this.companyId
      ).subscribe(
        response => {
          this.initializeList();
          this.showConfirmationModal = false;
        },
        error => {
            console.log(error);
        }
      )
    }
    
  }

  handleGoBack() {
    this._location.back();
  }

  saveItem() {
    this.doSave();
  }

  doSave() {
    if (this.list == "categories") {
      if (this.id == 1) {
        if(this.companyId == 12) {
          this.saveEventCategoryForm();
        } else {
          this.savePlanCategoryForm();
        }
      }
      if (this.id == 5) {
        this.saveGroupCategoryForm();
      }
      if (this.id == 11) {
        if (this.mode == "access") {
          this.saveCourseAccessForm();
        } else {
          this.saveCourseCategoryForm();
        }
      }
      if (this.id == 4) {
        this.saveDiscountCategoryForm();
      }
    } else if (this.list == "contactdetails") {
      this.saveContactDetailsForm();
    }
  }

  savePlanCategoryForm() {
    if (
      this.form.get("name_ES")?.errors ||
      this.form.get("name_FR")?.errors ||
      this.form.get("name_EN")?.errors ||
      this.form.get("name_EU")?.errors ||
      this.form.get("name_CA")?.errors ||
      this.form.get("name_DE")?.errors
    ) {
      return false;
    }

    if (this.selectedFilter?.value == "subcategory") {
      let params = {
        name_ES: this.form.get("name_ES")?.value,
        name_EN:
          this.form.get("name_EN")?.value || this.form.get("name_ES")?.value,
        name_FR:
          this.form.get("name_FR")?.value || this.form.get("name_ES")?.value,
        name_EU:
          this.form.get("name_EU")?.value || this.form.get("name_ES")?.value,
        name_CA:
          this.form.get("name_CA")?.value || this.form.get("name_ES")?.value,
        name_DE:
          this.form.get("name_DE")?.value || this.form.get("name_ES")?.value,
        fk_company_id: this.companyId,
        category_id: this.form.get("category_id")?.value,
        sequence: this.form.get("sequence")?.value,
      };

      if (this.mode == "add") {
        this._plansService.addPlanSubcategory(params).subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (this.mode == "edit") {
        this._plansService
          .editPlanSubcategory(this.selectedItem["guests.id"], params)
          .subscribe(
            (response) => {
              this.initializeList();
            },
            (error) => {
              console.log(error);
            }
          );
      }
    } else {
      let params = {
        name_ES: this.form.get("name_ES")?.value,
        name_EN:
          this.form.get("name_EN")?.value || this.form.get("name_ES")?.value,
        name_FR:
          this.form.get("name_FR")?.value || this.form.get("name_ES")?.value,
        name_EU:
          this.form.get("name_EU")?.value || this.form.get("name_ES")?.value,
        name_CA:
          this.form.get("name_CA")?.value || this.form.get("name_ES")?.value,
        name_DE:
          this.form.get("name_DE")?.value || this.form.get("name_ES")?.value,
        fk_company_id: this.companyId,
        sequence: this.form.get("sequence")?.value,
      };

      if (this.mode == "add") {
        this._plansService.addPlanEventCategory(params).subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (this.mode == "edit") {
        this._plansService
          .editPlanEventCategory(this.selectedItem["guests.id"], params)
          .subscribe(
            (response) => {
              this.initializeList();
            },
            (error) => {
              console.log(error);
            }
          );
      }
    }
  }

  saveEventCategoryForm() {
    if (
      this.form.get("name_es")?.errors ||
      this.form.get("name_fr")?.errors ||
      this.form.get("name_en")?.errors ||
      this.form.get("name_eu")?.errors ||
      this.form.get("name_ca")?.errors ||
      this.form.get("name_de")?.errors
    ) {
      return false;
    }

    if (this.selectedFilter?.value == "subcategory") {
      let params = {
        name_ES: this.form.get("name_es")?.value,
        name_EN: this.form.get("name_en")?.value || this.form.get("name_es")?.value,
        name_FR: this.form.get("name_fr")?.value || this.form.get("name_es")?.value,
        name_EU: this.form.get("name_eu")?.value || this.form.get("name_es")?.value,
        name_CA: this.form.get("name_ca")?.value || this.form.get("name_es")?.value,
        name_DE: this.form.get("name_de")?.value || this.form.get("name_es")?.value,
        fk_company_id: this.companyId,
        category_id: this.form.get("category_id")?.value,
        sequence: this.form.get("sequence")?.value,
      };

      if (this.mode == "add") {
        this._plansService.addEventSubcategory(params).subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (this.mode == "edit") {
        this._plansService
          .editEventSubcategory(this.selectedItem["guests.id"], params)
          .subscribe(
            (response) => {
              this.initializeList();
            },
            (error) => {
              console.log(error);
            }
          );
      }
    } else {
      let params = {
        name_ES: this.form.get("name_es")?.value,
        name_EN: this.form.get("name_en")?.value || this.form.get("name_es")?.value,
        name_FR: this.form.get("name_fr")?.value || this.form.get("name_es")?.value,
        name_EU: this.form.get("name_eu")?.value || this.form.get("name_es")?.value,
        name_CA: this.form.get("name_ca")?.value || this.form.get("name_es")?.value,
        name_DE: this.form.get("name_de")?.value || this.form.get("name_es")?.value,
        fk_company_id: this.companyId,
        sequence: this.form.get("sequence")?.value,
      };

      if (this.mode == "add") {
        this._plansService.addEventOtherCategory(params).subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (this.mode == "edit") {
        this._plansService
          .editEventOtherCategory(this.selectedItem["guests.id"], params)
          .subscribe(
            (response) => {
              this.initializeList();
            },
            (error) => {
              console.log(error);
            }
          );
      }
    }
  }

  saveGroupCategoryForm() {
    if (
      this.form.get("name_ES")?.errors ||
      this.form.get("name_FR")?.errors ||
      this.form.get("name_EN")?.errors ||
      this.form.get("name_EU")?.errors ||
      this.form.get("name_CA")?.errors ||
      this.form.get("name_DE")?.errors
    ) {
      return false;
    }

    if (this.selectedFilter?.value == "subcategory") {
      let params = {
        name_ES: this.form.get("name_ES")?.value,
        name_EN:
          this.form.get("name_EN")?.value || this.form.get("name_ES")?.value,
        name_FR:
          this.form.get("name_FR")?.value || this.form.get("name_ES")?.value,
        name_EU:
          this.form.get("name_EU")?.value || this.form.get("name_ES")?.value,
        name_CA:
          this.form.get("name_CA")?.value || this.form.get("name_ES")?.value,
        name_DE:
          this.form.get("name_DE")?.value || this.form.get("name_ES")?.value,
        fk_company_id: this.companyId,
        category_id: this.form.get("category_id")?.value,
        sequence: this.form.get("sequence")?.value,
        status: 1,
      };

      if (this.mode == "add") {
        this._clubsService.addGroupSubcategory(params).subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (this.mode == "edit") {
        this._clubsService
          .editGroupSubcategory(this.selectedItem["guests.id"], params)
          .subscribe(
            (response) => {
              this.initializeList();
            },
            (error) => {
              console.log(error);
            }
          );
      }
    } else {
      let params = {
        name_ES: this.form.get("name_ES")?.value,
        name_EN:
          this.form.get("name_EN")?.value || this.form.get("name_ES")?.value,
        name_FR:
          this.form.get("name_FR")?.value || this.form.get("name_ES")?.value,
        name_EU:
          this.form.get("name_EU")?.value || this.form.get("name_ES")?.value,
        name_CA:
          this.form.get("name_CA")?.value || this.form.get("name_ES")?.value,
        name_DE:
          this.form.get("name_DE")?.value || this.form.get("name_ES")?.value,
        fk_company_id: this.companyId,
        sequence: this.form.get("sequence")?.value,
      };

      if (this.mode == "add") {
        this._clubsService.addGroupCategory(params).subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (this.mode == "edit") {
        this._clubsService
          .editGroupCategory(this.selectedItem["guests.id"], params)
          .subscribe(
            (response) => {
              this.initializeList();
            },
            (error) => {
              console.log(error);
            }
          );
      }
    }
  }

  saveCourseCategoryForm() {
    if (
      this.form.get("name_ES")?.errors ||
      this.form.get("name_FR")?.errors ||
      this.form.get("name_EN")?.errors ||
      this.form.get("name_EU")?.errors ||
      this.form.get("name_CA")?.errors ||
      this.form.get("name_DE")?.errors ||
      this.form.get("name_IT")?.errors
    ) {
      return false;
    }

    let params = {
      name_ES: this.form.get("name_ES")?.value,
      name_EN:
        this.form.get("name_EN")?.value || this.form.get("name_ES")?.value,
      name_FR:
        this.form.get("name_FR")?.value || this.form.get("name_ES")?.value,
      name_EU:
        this.form.get("name_EU")?.value || this.form.get("name_ES")?.value,
      name_CA:
        this.form.get("name_CA")?.value || this.form.get("name_ES")?.value,
      name_DE:
        this.form.get("name_DE")?.value || this.form.get("name_ES")?.value,
      name_IT:
        this.form.get("name_IT")?.value || this.form.get("name_IT")?.value,
      fk_company_id: this.companyId,
      sequence: this.form.get("sequence")?.value,
    };

    if (this.mode == "add") {
      this._coursesService.addCourseCategory(params).subscribe(
        (response) => {
          this.initializeList();
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._coursesService
        .editCourseCategory(this.selectedItem["guests.id"], params)
        .subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  saveCourseAccessForm() {
    let selected_user_roles = this.form.get("user_roles")?.value;
    if (!(selected_user_roles?.length > 0)) {
      return false;
    }

    let params = {
      category_id: this.selectedItem["guests.id"],
      company_id: this.companyId,
      role_ids:
        selected_user_roles?.length > 0
          ? this.form
              .get("user_roles")
              ?.value.map((data) => {
                return data;
              })
              .join()
          : "",
    };

    this._coursesService.editCourseCategoryAccess(params).subscribe(
      (data) => {
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
      },
      (err) => {
        console.log("err: ", err);
        this.open(this._translateService.instant("dialog.error"), "");
      }
    );
  }

  saveDiscountCategoryForm() {
    if (
      this.form.get("name_ES")?.errors ||
      this.form.get("name_FR")?.errors ||
      this.form.get("name_EN")?.errors ||
      this.form.get("name_EU")?.errors ||
      this.form.get("name_CA")?.errors ||
      this.form.get("name_DE")?.errors
    ) {
      return false;
    }

    let params = {
      name_ES: this.form.get("name_ES")?.value,
      name_EN:
        this.form.get("name_EN")?.value || this.form.get("name_ES")?.value,
      name_FR:
        this.form.get("name_FR")?.value || this.form.get("name_ES")?.value,
      name_EU:
        this.form.get("name_EU")?.value || this.form.get("name_ES")?.value,
      name_CA:
        this.form.get("name_CA")?.value || this.form.get("name_ES")?.value,
      name_DE:
        this.form.get("name_DE")?.value || this.form.get("name_ES")?.value,
      fk_company_id: this.companyId,
      company_id: this.companyId,
      sequence: this.form.get("sequence")?.value,
    };

    if (this.mode == "add") {
      if(this.companyId == 12) {
        this._offersService.addDiscountType(params).subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
      } else {
        this._offersService.addDiscountCategory(params).subscribe(
          (response) => {
            this.initializeList();
          },
          (error) => {
            console.log(error);
          }
        );
      }
    } else if (this.mode == "edit") {
      if(this.companyId == 12) {
        this._offersService
          .editDiscountType(this.selectedItem["guests.id"], params)
          .subscribe(
            (response) => {
              this.initializeList();
            },
            (error) => {
              console.log(error);
            }
          );
      } else {
        this._offersService
          .editDiscountCategory(this.selectedItem["guests.id"], params)
          .subscribe(
            (response) => {
              this.initializeList();
            },
            (error) => {
              console.log(error);
            }
          );
      }
      
    }
  }

  saveContactDetailsForm() {
    if (
      this.form.get("name_es")?.errors ||
      this.form.get("name_fr")?.errors ||
      this.form.get("name_en")?.errors ||
      this.form.get("name_eu")?.errors ||
      this.form.get("name_ca")?.errors ||
      this.form.get("name_de")?.errors
    ) {
      return false;
    }

    let params = {
      name_es: this.form.get("name_es")?.value,
      name_en:
        this.form.get("name_en")?.value || this.form.get("name_es")?.value,
      name_fr:
        this.form.get("name_fr")?.value || this.form.get("name_es")?.value,
      name_eu:
        this.form.get("name_eu")?.value || this.form.get("name_es")?.value,
      name_ca:
        this.form.get("name_ca")?.value || this.form.get("name_es")?.value,
      name_de:
        this.form.get("name_de")?.value || this.form.get("name_es")?.value,
      sequence: this.form.get("sequence")?.value,
      show_as_link:
        this.form.get("show_as_link")?.value ||
        this.form.get("show_as_link")?.value ||
        0,
      active:
        this.form.get("active")?.value || this.form.get("active")?.value || 0,
    };

    if (this.mode == "add") {
      this._clubsService.addContactField(this.companyId, params).subscribe(
        (response) => {
          this.initializeList();
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._clubsService
        .editContactField(
          this.selectedItem["guests.id"],
          this.companyId,
          params
        )
        .subscribe(
          (data) => {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this.initializeList();
          },
          (err) => {
            console.log("err: ", err);
            this.open(this._translateService.instant("dialog.error"), "");
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

  handleAccess(row) {
    this.mode = "access";
    this.selectedItem = row;
    this.generateFormFields();
    this.loadRoles(row);
    this.modalbutton?.nativeElement.click();
  }

  loadRoles(row) {
    this._coursesService
      .getCourseCategoryAccessRoles(row["guests.id"])
      .subscribe(
        (response) => {
          let roles = response["roles"];
          let selected_roles: any[] = [];

          roles?.forEach((role) => {
            selected_roles.push(role.id);
          });

          this.formFields?.forEach((f) => {
            if (f.field == "user_roles" && selected_roles?.length > 0) {
              this.form.controls[f.field].setValue(selected_roles);
            }
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getContactDetailsFields() {
    this._clubsService.getContactFields(this.companyId).subscribe(
      async (response) => {
        let contactFields = response.fields;
        this.completeContactFields = contactFields;
        contactFields = this.formatContactFields(contactFields);
        this.contactFields = this.sortBySequence(contactFields);
        this.allContactFields = this.contactFields;
        this.initializeData(this.contactFields);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  formatContactFields(contactFields) {
    let array: any[] = [];
    let default_language = this.defaultLanguage?.code || "es";
    contactFields?.forEach((contactField) => {
      array.push({
        "guests.id": contactField.id,
        "guests.name": this.getNameInDefaultLanguage(
          contactField,
          default_language
        ),
        "pricing.active": contactField.active,
        "clubs.showaslink": contactField.show_as_link,
        "pricing.order": contactField.sequence,
        "pricing.action": ["edit"],
      });
    });
    return array;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
