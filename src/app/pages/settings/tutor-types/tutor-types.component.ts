import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
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
import {
  BreadcrumbComponent,
  PageTitleComponent,
  ToastComponent,
} from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
} from "@share/services";
import { TutorsService } from "@features/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { initFlowbite } from "flowbite";
import { EditorModule } from "@tinymce/tinymce-angular";
import get from "lodash/get";

@Component({
  selector: "app-manage-tutortypes",
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
    BreadcrumbComponent,
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: "./tutor-types.component.html",
})
export class ManageTutorTypesComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;

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

  types: any;
  mode: any;
  typeForm: FormGroup = new FormGroup({
    name_ES: new FormControl("", [Validators.required]),
    name_EN: new FormControl(""),
    name_FR: new FormControl(""),
    name_EU: new FormControl(""),
    name_CA: new FormControl(""),
    name_DE: new FormControl(""),
    name_IT: new FormControl(""),
    sequence: new FormControl(""),
  });
  formSubmitted: boolean = false;
  selectedId: any;

  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ['name_ES', 'action'];
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  allTypes: any;
  searchKeyword: any;
  languages: any = [];
  isSpanishEnabled: boolean = false;
  isFrenchEnabled: boolean = false;
  isEnglishEnabled: boolean = false;
  isBasqueEnabled: boolean = false;
  isCatalanEnabled: boolean = false;
  isGermanEnabled: boolean = false;
  isItalianEnabled: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  selectedConfirmItem: any;
  selectedConfirmMode: string = "";
  company: any;
  dialogMode: string = "";
  dialogTitle: any;
  issaving: boolean = false;
  showConfirmationModal: boolean = false;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
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
    this.initializeBreadcrumb();
    this.initializeSearch();
    this.initializeLanguage();
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

          if (this.languages) {
            let spanish = this.languages.filter((lang) => {
              return lang.code == "es" && lang.status == 1;
            });
            this.isSpanishEnabled = spanish && spanish[0] ? true : false;

            let french = this.languages.filter((lang) => {
              return lang.code == "fr" && lang.status == 1;
            });
            this.isFrenchEnabled = french && french[0] ? true : false;

            let english = this.languages.filter((lang) => {
              return lang.code == "en" && lang.status == 1;
            });
            this.isEnglishEnabled = english && english[0] ? true : false;

            let basque = this.languages.filter((lang) => {
              return lang.code == "eu" && lang.status == 1;
            });
            this.isBasqueEnabled = basque && basque[0] ? true : false;

            let catalan = this.languages.filter((lang) => {
              return lang.code == "ca" && lang.status == 1;
            });
            this.isCatalanEnabled = catalan && catalan[0] ? true : false;

            let german = this.languages.filter((lang) => {
              return lang.code == "de" && lang.status == 1;
            });
            this.isGermanEnabled = german && german[0] ? true : false;

            let italian = this.languages.filter((lang) => {
              return lang.code == "it" && lang.status == 1;
            });
            this.isItalianEnabled = italian && italian[0] ? true : false;
          }
          this.setInitialParam();
          this.getTutorTypes();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  setInitialParam(name_ES = '', name_EN = '', name_FR = '', name_EU = '', name_CA = '', name_DE = '', name_IT = '', sequence = ''){
    this.typeForm.controls['name_ES'].setValue(name_ES)
    if(this.isEnglishEnabled) { this.typeForm.controls['name_EN'].setValue(name_EN) }
    if(this.isFrenchEnabled) { this.typeForm.controls['name_FR'].setValue(name_FR) }
    if(this.isBasqueEnabled) { this.typeForm.controls['name_EU'].setValue(name_EU) }
    if(this.isCatalanEnabled) { this.typeForm.controls['name_CA'].setValue(name_CA) }
    if(this.isGermanEnabled) { this.typeForm.controls['name_DE'].setValue(name_DE) }
    if(this.isItalianEnabled) { this.typeForm.controls['name_IT'].setValue(name_IT) }

    this.displayedColumns = ['name_ES']

    if(this.isEnglishEnabled) { this.displayedColumns.push('name_EN'); }
    if(this.isFrenchEnabled) { this.displayedColumns.push('name_FR'); }
    if(this.isBasqueEnabled) { this.displayedColumns.push('name_EU'); }
    if(this.isCatalanEnabled) { this.displayedColumns.push('name_CA'); }
    if(this.isGermanEnabled) { this.displayedColumns.push('name_DE'); }
    if(this.isItalianEnabled) { this.displayedColumns.push('name_IT'); }

    this.displayedColumns.push('action')

    this.typeForm = new FormGroup({
      'name_ES': new FormControl('', [Validators.required]),
      'name_EN': this.isEnglishEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'name_FR': this.isFrenchEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'name_EU': this.isBasqueEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'name_CA': this.isCatalanEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'name_DE': this.isGermanEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'name_IT': this.isItalianEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
    })
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.modules"
    );
    this.level3Title = this._translateService.instant(
      "wall.tutors"
    );
    this.level4Title = this._translateService.instant(
      "tutors.tutortypes"
    );
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getTutorTypes() {
    this._tutorsService.getTutorTypes(this.companyId)
      .subscribe(
        data => {
          this.formatTypes(data?.types);
          this.allTypes = this.types;
          this.refreshTable(this.types);
          this.isloading = false
        },
        error => {
          let errorMessage = <any>error
          if (errorMessage != null) {
              let body = JSON.parse(error._body);
          }
        }
      )
  }

  formatTypes(types) {
    this.types = types?.map((type) => {
      return {
        ...type,
        title: this.getTypeTitle(type),
      };
    });
  }

  sortBySequence(types) {
    let sorted_types
    if(types) {
      sorted_types = types.sort((a, b) => {
        return a.sequence - b.sequence
      })
    }

    return sorted_types
  }

  refreshTable(array) {
    this.sortBySequence(this.types)
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
      this.types.slice(
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

  getTypeTitle(type) {
    return this.language == "en"
      ? type.name_EN || type.name_ES
      : this.language == "fr"
      ? type.name_FR || type.name_ES
      : this.language == "eu"
      ? type.name_EU || type.name_ES
      : this.language == "ca"
      ? type.name_CA || type.name_ES
      : this.language == "de"
      ? type.name_DE || type.name_ES
      : this.language == "it"
      ? type.name_IT || type.name_ES
      : type.name_ES;
  }

  async editType(item) {
    this.mode = "edit";
    this.issaving = false;

    this.selectedId = item.id;
    this.typeForm.controls["name_ES"].setValue(item.name_ES);
    this.typeForm.controls["name_EN"].setValue(item.name_EN);
    this.typeForm.controls["name_FR"].setValue(item.name_FR);
    this.typeForm.controls["name_EU"].setValue(item.name_EU);
    this.typeForm.controls["name_CA"].setValue(item.name_CA);
    this.typeForm.controls["name_DE"].setValue(item.name_DE);
    this.typeForm.controls["name_IT"].setValue(item.name_IT);
   
    this.dialogMode = "edit";
    this.modalbutton?.nativeElement.click();
  }

  deleteType(item) {
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteMember"
    );
    this.acceptText = "OK";
    this.selectedConfirmItem = item.id;
    this.selectedConfirmMode = "delete";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    if (this.selectedConfirmItem && this.selectedConfirmMode == "delete") {
      this._tutorsService
        .deleteTutorType(this.selectedConfirmItem, this.companyId)
        .subscribe(
          (data) => {
            this.showConfirmationModal = false;
            this.open(
              this._translateService.instant("dialog.deletedsuccessfully"),
              ""
            );
            this.getTutorTypes();
          },
          (err) => {
            this.showConfirmationModal = false;
            console.log("err: ", err);
          }
        );
    }
  }

  create() {
    this.resetDetailsForm();

    this.mode = "add";
    this.issaving = false;

    this.dialogMode = "add";
    this.modalbutton?.nativeElement.click();
  }

  resetDetailsForm() {
    this.typeForm.reset();
    this.selectedId = "";
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.types = this.filterTypes();
    this.formatTypes(this.types);
    this.refreshTable(this.types);
  }

  filterTypes() {
    let types = this.allTypes;
    if (types?.length > 0 && this.searchKeyword) {
      return types.filter((m) => {
        let include = false;
        if (
          (m.name_ES &&
            m.name_ES
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.name_EN &&
            m.name_EN
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.name_FR &&
            m.name_FR
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.name_EU &&
            m.name_EU
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.name_CA &&
            m.name_CA
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.name_DE &&
            m.name_DE
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.name_IT &&
            m.name_IT
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
    } else {
      return types;
    }
  }

  saveDetails() {
    this.formSubmitted = true;

    if (this.typeForm.get("name_ES")?.errors) {
      return false;
    }

    this.issaving = true;

    let params = {
      name_ES: this.typeForm.get('name_ES')?.value,
      name_EN: this.isEnglishEnabled ? this.typeForm.get('name_EN')?.value : this.typeForm.get('name_ES')?.value,
      name_FR: this.isFrenchEnabled ? this.typeForm.get('name_FR')?.value : this.typeForm.get('name_ES')?.value,
      name_EU: this.isBasqueEnabled ? this.typeForm.get('name_EU')?.value : this.typeForm.get('name_ES')?.value,
      name_CA: this.isCatalanEnabled ? this.typeForm.get('name_CA')?.value : this.typeForm.get('name_ES')?.value,
      name_DE: this.isGermanEnabled ? this.typeForm.get('name_DE')?.value : this.typeForm.get('name_ES')?.value,
      name_IT: this.isItalianEnabled ? this.typeForm.get('name_IT')?.value : this.typeForm.get('name_ES')?.value,
      // sequence: this.typeForm.get('sequence')?.value || null,
      company_id: this.companyId
    };
    if (this.mode == "add") {
      this._tutorsService.addTutorType(params).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getTutorTypes();
          this.closemodalbutton?.nativeElement.click();
        },
        (err) => {
          this.issaving = false;
          console.log("err: ", err);
        }
      );
    } else if (this.mode == "edit") {
      this._tutorsService
        .editTutorType(this.selectedId, params)
        .subscribe(
          (data) => {
            this.formSubmitted = false;
            this.getTutorTypes();
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this.closemodalbutton?.nativeElement.click();
          },
          (err) => {
            this.issaving = false;
            console.log("err: ", err);
          }
        );
    }
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