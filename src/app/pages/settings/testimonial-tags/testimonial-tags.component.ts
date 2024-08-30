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
import { TestimonialsService } from "@features/services";
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
  selector: "app-manage-testimonialtags",
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
  templateUrl: "./testimonial-tags.component.html",
})
export class ManageTestimonialTagsComponent {
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

  tags: any;
  mode: any;
  tagForm: FormGroup = new FormGroup({
    tag_es: new FormControl("", [Validators.required]),
    tag_en: new FormControl(""),
    tag_fr: new FormControl(""),
    tag_eu: new FormControl(""),
    tag_ca: new FormControl(""),
    tag_de: new FormControl(""),
    tag_it: new FormControl(""),
  });
  formSubmitted: boolean = false;
  selectedId: any;

  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ['tag_es', 'action'];
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  allTags: any;
  searchKeyword: any;
  languages: any = [];
  isSpanishEnabled: boolean = false;
  isFrenchEnabled: boolean = false;
  isEnglishEnabled: boolean = false;
  isBasqueEnabled: boolean = false;
  isCatalanEnabled: boolean = false;
  isGermanEnabled: boolean = false;
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
  isItalianEnabled: boolean = false;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _testmonialsService: TestimonialsService,
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
          console.log(languages)
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
          this.getTestimonialTags();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  setInitialParam(tag_es = '', tag_en = '', tag_fr = '', tag_eu = '', tag_ca = '', tag_de = '', tag_it = ''){
    this.tagForm.controls['tag_es'].setValue(tag_es)
    if(this.isEnglishEnabled) { this.tagForm.controls['tag_en'].setValue(tag_en) }
    if(this.isFrenchEnabled) { this.tagForm.controls['tag_fr'].setValue(tag_fr) }
    if(this.isBasqueEnabled) { this.tagForm.controls['tag_eu'].setValue(tag_eu) }
    if(this.isCatalanEnabled) { this.tagForm.controls['tag_ca'].setValue(tag_ca) }
    if(this.isGermanEnabled) { this.tagForm.controls['tag_de'].setValue(tag_de) }
    if(this.isItalianEnabled) { this.tagForm.controls['tag_it'].setValue(tag_it) }

    this.displayedColumns = ['tag_es']

    if(this.isEnglishEnabled) { this.displayedColumns.push('tag_en'); }
    if(this.isFrenchEnabled) { this.displayedColumns.push('tag_fr'); }
    if(this.isBasqueEnabled) { this.displayedColumns.push('tag_eu'); }
    if(this.isCatalanEnabled) { this.displayedColumns.push('tag_ca'); }
    if(this.isGermanEnabled) { this.displayedColumns.push('tag_de'); }
    if(this.isItalianEnabled) { this.displayedColumns.push('tag_it'); }

    this.displayedColumns.push('action')

    this.tagForm = new FormGroup({
      'tag_es': new FormControl('', [Validators.required]),
      'tag_en': this.isEnglishEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'tag_fr': this.isFrenchEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'tag_eu': this.isBasqueEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'tag_ca': this.isCatalanEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'tag_de': this.isGermanEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
      'tag_it': this.isItalianEnabled ? new FormControl('', [Validators.required]) : new FormControl(''),
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
      "testimonials.testimonials"
    );
    this.level4Title = this._translateService.instant(
      "testimonials.tags"
    );
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getTestimonialTags() {
    this._testmonialsService.getTestimonialTags(this.companyId)
      .subscribe(
        data => {
          this.formatTags(data?.tags);
          this.allTags = this.tags;
          this.refreshTable(this.tags);
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

  formatTags(tags) {
    this.tags = tags?.map((type) => {
      return {
        ...type,
      };
    });
  }

  sortTags(tags) {
    let sorted_tags
    if(tags) {
      sorted_tags = tags.sort((a, b) => {
        if (a.tag_es < b.tag_es) {
          return -1
        }

        if (a.tag_es > b.tag_es) {
          return 1
        }

        return 0
      })
    }

    return sorted_tags
  }

  refreshTable(array) {
    this.sortTags(this.tags);
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
      this.tags.slice(
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

  async editTag(item) {
    this.mode = "edit";
    this.issaving = false;

    this.selectedId = item.id;
    this.tagForm.controls["tag_es"].setValue(item.tag_es);
    this.tagForm.controls["tag_en"].setValue(item.tag_en);
    this.tagForm.controls["tag_fr"].setValue(item.tag_fr);
    this.tagForm.controls["tag_eu"].setValue(item.tag_eu);
    this.tagForm.controls["tag_ca"].setValue(item.tag_ca);
    this.tagForm.controls["tag_de"].setValue(item.tag_de);
    this.tagForm.controls["tag_it"].setValue(item.tag_it);
   
    this.dialogMode = "edit";
    this.modalbutton?.nativeElement.click();
  }

  deleteTag(item) {
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
      this._testmonialsService
        .deleteTestimonialTag(this.selectedConfirmItem, this.companyId)
        .subscribe(
          (data) => {
            this.showConfirmationModal = false;
            this.open(
              this._translateService.instant("dialog.deletedsuccessfully"),
              ""
            );
            this.getTestimonialTags();
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
    this.tagForm.reset();
    this.selectedId = "";
  }

  handleSearch(event) {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.searchKeyword = event;
    this.tags = this.filterTags();
    this.formatTags(this.tags);
    this.refreshTable(this.tags);
  }

  filterTags() {
    let tags = this.allTags;
    if (tags?.length > 0 && this.searchKeyword) {
      return tags.filter((m) => {
        let include = false;
        if (
          (m.tag_es &&
            m.tag_es
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.tag_en &&
            m.tag_en
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.tag_fr &&
            m.tag_fr
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.tag_eu &&
            m.tag_eu
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.tag_ca &&
            m.tag_ca
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.tag_de &&
            m.tag_de
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (m.tag_it &&
            m.tag_it
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
      return tags;
    }
  }

  saveDetails() {
    this.formSubmitted = true;

    if(this.tagForm.get('tag_es')?.errors 
      || this.tagForm.get('tag_fr')?.errors
      || this.tagForm.get('tag_en')?.errors
      || this.tagForm.get('tag_eu')?.errors
      || this.tagForm.get('tag_ca')?.errors
      || this.tagForm.get('tag_de')?.errors
      || this.tagForm.get('tag_it')?.errors
    ) {
      return false;
    }

    this.issaving = true;

    let params = {
      tag_es: this.tagForm.get('tag_es')?.value,
      tag_en: this.isEnglishEnabled ? this.tagForm.get('tag_en')?.value : this.tagForm.get('tag_es')?.value,
      tag_fr: this.isFrenchEnabled ? this.tagForm.get('tag_fr')?.value : this.tagForm.get('tag_es')?.value,
      tag_eu: this.isBasqueEnabled ? this.tagForm.get('tag_eu')?.value : this.tagForm.get('tag_es')?.value,
      tag_ca: this.isCatalanEnabled ? this.tagForm.get('tag_ca')?.value : this.tagForm.get('tag_es')?.value,
      tag_de: this.isGermanEnabled ? this.tagForm.get('tag_de')?.value : this.tagForm.get('tag_es')?.value,
      tag_it: this.isItalianEnabled ? this.tagForm.get('tag_it')?.value : this.tagForm.get('tag_it')?.value,
      company_id: this.companyId
    };
    if (this.mode == "add") {
      this._testmonialsService.addTestimonialTag(params).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getTestimonialTags();
          this.closemodalbutton?.nativeElement.click();
        },
        (err) => {
          this.issaving = false;
          console.log("err: ", err);
        }
      );
    } else if (this.mode == "edit") {
      this._testmonialsService
        .editTestimonialTag(this.selectedId, params)
        .subscribe(
          (data) => {
            this.formSubmitted = false;
            this.getTestimonialTags();
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