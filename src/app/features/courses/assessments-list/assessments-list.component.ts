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
import { MatTabsModule } from "@angular/material/tabs";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { BreadcrumbComponent, ButtonGroupComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { EditorModule } from "@tinymce/tinymce-angular";
import { CoursesService } from "@features/services";
import { initFlowbite } from "flowbite";
import get from "lodash/get";

import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { searchSpecialCase } from "src/app/utils/search/helper";
registerPlugin(FilepondPluginImagePreview, FilepondPluginImageEdit, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

@Component({
  selector: "app-course-assessments-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatTabsModule,
    EditorModule,
    FilePondModule,
    SearchComponent,
    BreadcrumbComponent,
    ToastComponent,
    PageTitleComponent,
    ButtonGroupComponent,
  ],
  templateUrl: "./assessments-list.component.html",
})
export class CourseAssessmentsListComponent {
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
  company: any;
  domain: any;
  assessments: any = [];
  allAssessments: any = [];
  selectedId: any;
  question: any;
  sequence: any;
  mode: any;
  formSubmitted: boolean = false;
  assessmentForm = new FormGroup({
    title: new FormControl("", [Validators.required]),
    title_en: new FormControl(""),
    title_fr: new FormControl(""),
    title_eu: new FormControl(""),
    title_ca: new FormControl(""),
    title_de: new FormControl(""),
    title_it: new FormControl(""),
    description: new FormControl(""),
    description_en: new FormControl(""),
    description_fr: new FormControl(""),
    description_eu: new FormControl(""),
    description_ca: new FormControl(""),
    description_de: new FormControl(""),
    description_it: new FormControl(""),
  });
  pageSize: number = 10;
  pageIndex: number = 0;
  dataSource: any;
  displayedColumns = ["title", "action"];
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  @ViewChild("modalbutton0", { static: false }) modalbutton0:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton0", { static: false }) closemodalbutton0:
    | ElementRef
    | undefined;
  searchKeyword: any;
  title: any;
  description: any;
  tabIndex = 0;
  tabSelected: boolean = false;
  createdAssessmentId: any;
  assessmentItems: any = [];
  assessmentTypes: any;
  assessmentItemMode: any;
  showAssessmentItemDetails: boolean = false;
  selectedAssessmentItemId: any;
  selectedAssessmentItemType: any = '';
  assessmentItemTitle: any;
  assessmentImageWidth: any = '384';
  assessmentImageWidthUnit: any = 'px';
  assessmentItemFormSubmitted: boolean = false;
  selectedAssessmentItem: any;
  selectedMultipleChoiceOption: any;
  selectedMultipleChoiceOptionId: any;
  showMultipleChoiceOptionDetails: boolean = false;
  multipleChoiceOptionFormSubmitted: boolean = false;
  multipleChoiceChoice: any;
  multipleChoiceCorrect: boolean = false;
  confirmMode: any;
  multipleChoiceOptionMode: any;

  apiPath: string = environment.api;
  assessmentImage: any;
  assessmentFileName: any;
  assessmentImageName: any;
  pondFiles = [];
  assessmentItemImage: any;
  clearedImage: boolean = false;
  @ViewChild('myPond', {static: false}) myPond: any;
  pondOptions = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: 'Arrastra y suelta tu archivo o <span class="filepond--label-action" style="color:#00f;text-decoration:underline;"> Navegar </span><div><small style="color:#006999;font-size:12px;">*Subir archivo</small></div>',
    labelFileProcessing: "En curso",
    labelFileProcessingComplete: "Carga completa",
    labelFileProcessingAborted: "Carga cancelada",
    labelFileProcessingError: "Error durante la carga",
    labelTapToCancel: "toque para cancelar",
    labelTapToRetry: "toca para reintentar",
    labelTapToUndo: "toque para deshacer",
    acceptedFileTypes: 'image/jpg, image/jpeg, image/png',
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.assessmentFileName = 'assmt_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('image', file, this.assessmentFileName);
        localStorage.setItem('course_assessment_file', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/v2/course-assessment/temp-upload');

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_assessment_file', 'complete');
          } else {
            error('oh no');
          }
        };

        request.send(formData);

        return {
          abort: () => {
              request.abort();
              abort();
          },
        };
      },
    },
  };

  languages: any = [];
  selectedLanguage: any = "es";
  defaultLanguage: any = "es";
  selectedLanguageChanged: boolean = false;
  buttonList: any = [];
  title_en: any;
  title_fr: any;
  title_eu: any;
  title_ca: any;
  title_de: any;
  title_it: any;
  description_en: any;
  description_fr: any;
  description_eu: any;
  description_ca: any;
  description_de: any;
  description_it: any;
  assessmentItemTitleEn: any;
  assessmentItemTitleFr: any;
  assessmentItemTitleEu: any;
  assessmentItemTitleCa: any;
  assessmentItemTitleDe: any;
  assessmentItemTitleIt: any;
  multipleChoiceChoiceEn: any;
  multipleChoiceChoiceFr: any;
  multipleChoiceChoiceEu: any;
  multipleChoiceChoiceCa: any;
  multipleChoiceChoiceDe: any;
  multipleChoiceChoiceIt: any;

  constructor(
    private _companyService: CompanyService,
    private _coursesService: CoursesService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
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
      this.domain = company[0].domain;
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
    this.getAssessments();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "search.courses"
    );
    this.level3Title = this._translateService.instant(
      "course-assessment.manageassessments"
    );
    this.level4Title = "";
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  getAssessments() {
    this._companyService
      .getAssessments(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.mapLanguages(response?.languages);
          this.assessmentTypes = response.assessment_types;
          this.formatAssessments(response.assessments);
          this.allAssessments = this.assessments;
          this.refreshTable(this.assessments);
          this.isloading = false;
        },
        (error) => {
          
        }
      );
  }

  formatAssessments(assessments) {
    assessments = assessments?.map((item) => {
      return {
        ...item,
        id: item?.id,
      };
    });
    if(this.assessmentItemMode == 'edit') {
      let selected_assessment_type = localStorage.getItem('selected_assessment_type');
      this.selectedAssessmentItemType = '';
      setTimeout(() => {
        this.selectedAssessmentItemType = selected_assessment_type;
      }, 500);
    }

    this.assessments = assessments;
    if(this.createdAssessmentId) {
      if(this.assessments?.length > 0) {
        let assessment_row = this.assessments?.filter(q => {
          return q.id == this.createdAssessmentId
        })
        if(assessment_row?.length > 0) {
          this.editAssessment(assessment_row[0]);
        }
      }
    }
  }

  getAssessmentTitle(assessment) {
    return assessment ? this.language == 'en' ? (assessment.title_en || assessment.title) : (this.language == 'fr' ? (assessment.title_fr || assessment.title) : 
      (this.language == 'eu' ? (assessment.title_eu || assessment.title) : (this.language == 'ca' ? (assessment.title_ca || assessment.title) : 
      (this.language == 'de' ? (assessment.title_de || assessment.title) : (this.language == 'it' ? (assessment.title_it || assessment.title) : assessment.title)
      )))
    ) : ''
  }

  getAssessmentType(id) {
    let type = ''
    if(this.assessmentTypes?.length > 0) {
      let typ = this.assessmentTypes?.filter(l => {
        return l.id == id
      })
      if(typ?.length > 0) {
        type = this.getTypeTitle(typ[0]);
      }
    }

    return type
  }

  getTypeTitle(type) {
    return type ? this.language == 'en' ? (type.type_en || type.type_es) : (this.language == 'fr' ? (type.type_fr || type.type_es) : 
      (this.language == 'eu' ? (type.type_eu || type.type_es) : (this.language == 'ca' ? (type.type_ca || type.type_es) : 
      (this.language == 'de' ? (type.type_de || type.type_es) : (this.language == 'it' ? (type.type_it || type.type_es) : type.type_es)
      )))
    ) : ''
  }

  mapLanguages(languages) {
    languages = languages?.map((language) => {
      return {
        ...language,
        name: this.getLanguageName(language),
      };
    });

    this.languages = languages?.filter((lang) => {
      return lang.status == 1;
    });
    this.defaultLanguage = languages
      ? languages.filter((lang) => {
          return lang.default == true;
        })
      : [];
    this.selectedLanguage = this.language || this.defaultLanguage;
    this.initializeButtonGroup();
  }

  getLanguageName(language) {
    return this.language == "en"
      ? language.name_EN
      : this.language == "fr"
      ? language.name_FR
      : this.language == "eu"
      ? language.name_EU
      : this.language == "ca"
      ? language.name_CA
      : this.language == "de"
      ? language.name_DE
      : this.language == "it"
      ? language.name_IT
      : language.name_ES;
  }

  initializeButtonGroup() {
    let list: any[] = [];
    this.languages?.forEach((language) => {
      list.push({
        id: language.id,
        value: language.code,
        text: this.getLanguageName(language),
        selected: this.selectedLanguage == language.code ? true : false,
        code: language.code,
      });
    });

    this.buttonList = list;
  }

  handleChangeLanguageFilter(event) {
    this.buttonList?.forEach((item) => {
      if (item.code == event.code) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedLanguage = event.code;
    this.selectedLanguageChanged = true;
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
      this.assessments.slice(
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
    this.assessments = this.filterAssessments();
    this.refreshTable(this.assessments);
  }

  filterAssessments() {
    let assessments = this.allAssessments;
    if (assessments?.length > 0 && this.searchKeyword) {
      return assessments.filter((m) => {
        let include = false;
        if (
          m.title &&
          m.title.toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .indexOf(
            this.searchKeyword
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
          ) >= 0
        ) {
          include = true;
        }

        return include;
      });
    } else {
      return assessments;
    }
  }

  create() {
    this.createdAssessmentId = '';
    this.assessmentForm.controls["title"].setValue("");
    this.assessmentForm.controls["description"].setValue("");

    this.mode = "add";
    this.formSubmitted = false;

    this.modalbutton0?.nativeElement.click();
  }

  editAssessment(item) {
    this.resetModes();
    this.selectedId = item.id;
    this.title = item.title;
    this.title_en = item.title_en;
    this.title_fr = item.title_fr;
    this.title_eu = item.title_eu;
    this.title_ca = item.title_ca;
    this.title_de = item.title_de;
    this.title_it = item.title_it;
    this.description = item.description;
    this.description_en = item.description_en;
    this.description_fr = item.description_fr;
    this.description_eu = item.description_eu;
    this.description_ca = item.description_ca;
    this.description_de = item.description_de;
    this.description_it = item.description_it;
    this.formatAssessmentItems(item.details);
    
    this.assessmentForm.controls["title"].setValue(this.title);
    this.assessmentForm.controls["title_en"].setValue(this.title_en || this.title);
    this.assessmentForm.controls["title_fr"].setValue(this.title_fr || this.title);
    this.assessmentForm.controls["title_eu"].setValue(this.title_eu || this.title);
    this.assessmentForm.controls["title_ca"].setValue(this.title_ca || this.title);
    this.assessmentForm.controls["title_de"].setValue(this.title_de || this.title);
    this.assessmentForm.controls["title_it"].setValue(this.title_it || this.title);
    this.assessmentForm.controls["description"].setValue(this.description);
    this.assessmentForm.controls["description_en"].setValue(this.description_en || this.description);
    this.assessmentForm.controls["description_fr"].setValue(this.description_fr || this.description);
    this.assessmentForm.controls["description_eu"].setValue(this.description_eu || this.description);
    this.assessmentForm.controls["description_ca"].setValue(this.description_ca || this.description);
    this.assessmentForm.controls["description_de"].setValue(this.description_de || this.description);
    this.assessmentForm.controls["description_it"].setValue(this.description_it || this.description);

    if(this.createdAssessmentId) {
      this.createdAssessmentId = '';
      this.tabIndex = 1;
    }

    this.mode = "edit";
    this.modalbutton0?.nativeElement.click();
  }

  resetModes() {
    this.createdAssessmentId = '';
    this.assessmentItemMode = '';
    this.showAssessmentItemDetails = false;
    this.selectedAssessmentItem = '';
    this.selectedAssessmentItemType = '';
    this.selectedAssessmentItem = '';
    this.selectedMultipleChoiceOption = '';
    this.selectedMultipleChoiceOptionId = '';
    this.showMultipleChoiceOptionDetails = false;
    this.multipleChoiceOptionMode = '';
  }

  formatAssessmentItems(items) {
    items = items?.map((item) => {
      return {
        ...item,
        id: item?.id,
        type: this.getAssessmentType(item?.assessment_type_id),
      };
    });

    this.assessmentItems = items;
  }

  save() {
    this.formSubmitted = true;

    if (
      this.assessmentForm.get("title")?.errors
    ) {
      return false;
    }

    let params = {
      title: this.assessmentForm.get("title")?.value,
      title_en: this.assessmentForm.get("title_en")?.value || this.assessmentForm.get("title")?.value,
      title_fr: this.assessmentForm.get("title_fr")?.value || this.assessmentForm.get("title")?.value,
      title_eu: this.assessmentForm.get("title_eu")?.value || this.assessmentForm.get("title")?.value,
      title_ca: this.assessmentForm.get("title_ca")?.value || this.assessmentForm.get("title")?.value,
      title_de: this.assessmentForm.get("title_de")?.value || this.assessmentForm.get("title")?.value,
      title_it: this.assessmentForm.get("title_it")?.value || this.assessmentForm.get("title")?.value,
      description: this.assessmentForm.get("description")?.value,
      description_en: this.assessmentForm.get("description_en")?.value || this.assessmentForm.get("description")?.value,
      description_fr: this.assessmentForm.get("description_fr")?.value || this.assessmentForm.get("description")?.value,
      description_eu: this.assessmentForm.get("description_eu")?.value || this.assessmentForm.get("description")?.value,
      description_ca: this.assessmentForm.get("description_ca")?.value || this.assessmentForm.get("description")?.value,
      description_de: this.assessmentForm.get("description_de")?.value || this.assessmentForm.get("description")?.value,
      description_it: this.assessmentForm.get("description_it")?.value || this.assessmentForm.get("description")?.value,
      company_id: this.companyId,
      created_by: this.userId,
    };

    if (this.mode == "add") {
      this._companyService.addAssessment(params).subscribe(
        (response) => {
          this.closemodalbutton0?.nativeElement.click();
          this.createdAssessmentId = response?.id;
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          setTimeout(() => {
            this.getAssessments();
          }, 500);
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.mode == "edit") {
      this._companyService.editAssessment(this.selectedId, params).subscribe(
        (response) => {
          this.closemodalbutton0?.nativeElement.click();
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.getAssessments();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  deleteAssessment(item) {
    this.showConfirmationModal = false;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteMember"
    );
    this.acceptText = "OK";
    this.selectedItem = item.id;
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    this._companyService.deleteAssessment(this.selectedItem).subscribe(
      (response) => {
        this.assessments.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.assessments.splice(index, 1);
          }
        });
        this.allAssessments.forEach((cat, index) => {
          if (cat.id == this.selectedItem) {
            this.allAssessments.splice(index, 1);
          }
        });
        this.refreshTable(this.assessments);
        this.open(
          this._translateService.instant("dialog.deletedsuccessfully"),
          ""
        );
        this.showConfirmationModal = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  changeTab(event) {

  }

  handleEditAssessmentItem(item) {
    this.assessmentItemMode = 'edit';
    this.selectedAssessmentItem = item;
    this.selectedAssessmentItemId = item.id;
    this.selectedAssessmentItemType = item.assessment_type_id;
    this.assessmentItemTitle = item.title;
    this.assessmentItemTitleEn = item?.title_en || item?.title;
    this.assessmentItemTitleFr = item?.title_fr || item?.title;
    this.assessmentItemTitleEu = item?.title_eu || item?.title;
    this.assessmentItemTitleCa = item?.title_ca || item?.title;
    this.assessmentItemTitleDe = item?.title_de || item?.title;
    this.assessmentItemTitleIt = item?.title_it || item?.title;
    this.assessmentItemImage = item.image;
    this.assessmentImageWidth = item?.image_width?.replace('px', '')?.replace('%', '');
    this.assessmentImageWidthUnit = item?.image_width?.replace(this.assessmentImageWidth, '');
    this.showAssessmentItemDetails = true;
  }

  handleDeleteAssessmentItem(item) {
    this._companyService.deleteAssessmentItem(item.id).subscribe(
      (response) => {
        this.assessmentItems.forEach((cat, index) => {
          if (cat.id == item.id) {
            this.assessmentItems.splice(index, 1);
          }
        });
        this.open(
          this._translateService.instant("dialog.deletedsuccessfully"),
          ""
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }

  addAssessmentItem() {
    this.resetAssessmentItemFields()
    this.assessmentItemMode = 'add';
    this.showAssessmentItemDetails = true;
  }

  resetAssessmentItemFields() {
    this.assessmentItemMode = '';
    this.selectedAssessmentItemId = '';
    this.selectedAssessmentItemType = '';
    this.assessmentItemTitle = '';
    this.assessmentItemTitleEn = '';
    this.assessmentItemTitleFr = '';
    this.assessmentItemTitleEu = '';
    this.assessmentItemTitleCa = '';
    this.assessmentItemTitleDe = '';
    this.assessmentItemTitleIt = '';
    this.assessmentItemFormSubmitted = false;
    this.showAssessmentItemDetails = false;
    localStorage.removeItem('selected_assessment_type');
  }

  saveAssessmentItem() {
    this.assessmentItemFormSubmitted = true;

    if (
      !this.assessmentItemTitle ||
      !this.selectedAssessmentItemType
    ) {
      return false;
    }

    let params = {
      company_id: this.companyId,
      assessment_id: this.selectedId,
      assessment_type_id: this.selectedAssessmentItemType,
      title: this.assessmentItemTitle,
      title_en: this.assessmentItemTitleEn || this.assessmentItemTitle,
      title_fr: this.assessmentItemTitleFr || this.assessmentItemTitle,
      title_eu: this.assessmentItemTitleEu || this.assessmentItemTitle,
      title_ca: this.assessmentItemTitleCa || this.assessmentItemTitle,
      title_de: this.assessmentItemTitleDe || this.assessmentItemTitle,
      title_it: this.assessmentItemTitleIt || this.assessmentItemTitle,
      image: this.assessmentFileName,
      image_width: this.assessmentImageWidth ? `${this.assessmentImageWidth}${this.assessmentImageWidthUnit}` : '',
      created_by: this.userId,
    };

    if (this.assessmentItemMode == "add") {
      this._companyService.addAssessmentItem(params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.assessmentItems = response.assessment_items;
          this.getAssessments();
          this.resetAssessmentItemFields();
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.assessmentItemMode == "edit") {
      this._companyService.editAssessmentItem(this.selectedAssessmentItemId, params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.assessmentItems = response.assessment_items;
          this.getAssessments();
          this.resetAssessmentItemFields();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  cancelAssessmentItem() {
    this.resetAssessmentItemFields();
    this.assessmentItemMode = '';
    this.showAssessmentItemDetails = false;
  }

  getChoiceTitle(choice) {
    return choice ? this.language == 'en' ? (choice.choice_en || choice.choice) : (this.language == 'fr' ? (choice.title_fr || choice.choice) : 
      (this.language == 'eu' ? (choice.choice_eu || choice.choice) : (this.language == 'ca' ? (choice.choice_ca || choice.choice) : 
      (this.language == 'de' ? (choice.choice_de || choice.choice) : (this.language == 'it' ? (choice.choice_it || choice.choice) : choice.choice)
      )))
    ) : ''
  }

  handleEditMultipleChoiceOption(option) {
    this.multipleChoiceOptionMode = 'edit';
    this.selectedMultipleChoiceOption = option;
    this.selectedMultipleChoiceOptionId = option.id;
    this.multipleChoiceChoice = option.choice;
    this.multipleChoiceChoiceEn = option.choice_en || option.choice;
    this.multipleChoiceChoiceFr = option.choice_fr || option.choice;
    this.multipleChoiceChoiceEu = option.choice_eu || option.choice;
    this.multipleChoiceChoiceCa = option.choice_ca || option.choice;
    this.multipleChoiceChoiceDe = option.choice_de || option.choice;
    this.multipleChoiceChoiceIt = option.choice_it || option.choice;
    this.multipleChoiceCorrect = option.correct == 1 ? true : false;
    this.showMultipleChoiceOptionDetails = true;
  }

  addMultipleChoiceOption() {
    this.multipleChoiceOptionMode = 'add';
    this.selectedMultipleChoiceOption = '';
    this.selectedMultipleChoiceOptionId = '';
    this.multipleChoiceChoice = '';
    this.multipleChoiceChoiceEn = '';
    this.multipleChoiceChoiceFr = '';
    this.multipleChoiceChoiceEu = '';
    this.multipleChoiceChoiceCa = '';
    this.multipleChoiceChoiceDe = '';
    this.multipleChoiceChoiceIt = '';
    this.multipleChoiceCorrect = false;
    this.showMultipleChoiceOptionDetails = true;
  }

  cancelMultipleChoiceOption() {
    this.multipleChoiceOptionMode = '';
    this.selectedMultipleChoiceOption = '';
    this.selectedMultipleChoiceOptionId = '';
    this.multipleChoiceChoice = '';
    this.multipleChoiceChoiceEn = '';
    this.multipleChoiceChoiceFr = '';
    this.multipleChoiceChoiceEu = '';
    this.multipleChoiceChoiceCa = '';
    this.multipleChoiceChoiceDe = '';
    this.multipleChoiceChoiceIt = '';
    this.multipleChoiceCorrect = false;
    this.showMultipleChoiceOptionDetails = false;
  }

  handleDeleteMultipleChoiceOption(option) {
    this._companyService.deleteAssessmentMultipleChoice(option.id).subscribe(
      (response) => {
        this.assessmentItems.forEach(cat => {
          if(cat?.assessment_multiple_choice_options) {
            cat?.assessment_multiple_choice_options?.forEach((co, index) => {
              if (co.id == option.id) {
                cat?.assessment_multiple_choice_options?.splice(index, 1);
              }
            })
          }
        });
        this.getAssessments();
        this.open(
          this._translateService.instant("dialog.deletedsuccessfully"),
          ""
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }

  saveMultipleChoice() {
    if (
      !this.multipleChoiceChoice
    ) {
      return false;
    }

    let params = {
      company_id: this.companyId,
      assessment_id: this.selectedId,
      assessment_type_id: this.selectedAssessmentItemType,
      assessment_detail_id: this.selectedAssessmentItemId,
      choice: this.multipleChoiceChoice,
      choice_en: this.multipleChoiceChoiceEn || this.multipleChoiceChoice,
      choice_fr: this.multipleChoiceChoiceFr || this.multipleChoiceChoice,
      choice_eu: this.multipleChoiceChoiceEu || this.multipleChoiceChoice,
      choice_ca: this.multipleChoiceChoiceCa || this.multipleChoiceChoice,
      choice_de: this.multipleChoiceChoiceDe || this.multipleChoiceChoice,
      choice_it: this.multipleChoiceChoiceIt || this.multipleChoiceChoice,
      correct: this.multipleChoiceCorrect ? 1 : 0,
      created_by: this.userId,
    };

    if (this.multipleChoiceOptionMode == "add") {
      this._companyService.addAssessmentMultipleChoice(params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.assessmentItems = response.assessment_items;
          let assessment_item
          if(this.assessmentItems?.length > 0) {
            let assessment_item_row = this.assessmentItems?.filter(qi => {
              return qi.id == this.selectedAssessmentItemId
            })
            if(assessment_item_row?.length > 0) {
              assessment_item = assessment_item_row[0];
            }
          }
          localStorage.setItem('selected_assessment_type', this.selectedAssessmentItemType);
          this.getAssessments();
          this.selectedAssessmentItem = assessment_item;
          this.multipleChoiceChoice = '';
          this.multipleChoiceChoiceEn = '';
          this.multipleChoiceChoiceFr = '';
          this.multipleChoiceChoiceEu = '';
          this.multipleChoiceChoiceCa = '';
          this.multipleChoiceChoiceDe = '';
          this.multipleChoiceChoiceIt = '';
          this.multipleChoiceCorrect = false;
          this.multipleChoiceOptionMode = '';
          this.showMultipleChoiceOptionDetails = false;
        },
        (error) => {
          console.log(error);
        }
      );
    } else if (this.multipleChoiceOptionMode == "edit") {
      this._companyService.editAssessmentMultipleChoice(this.selectedMultipleChoiceOptionId, params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.assessmentItems = response.assessment_items;
          let assessment_item
          if(this.assessmentItems?.length > 0) {
            let assessment_item_row = this.assessmentItems?.filter(qi => {
              return qi.id == this.selectedAssessmentItemId
            })
            if(assessment_item_row?.length > 0) {
              assessment_item = assessment_item_row[0];
            }
          }
          localStorage.setItem('selected_assessment_type', this.selectedAssessmentItemType);
          this.getAssessments();
          this.selectedAssessmentItem = assessment_item;
          this.multipleChoiceChoice = '';
          this.multipleChoiceChoiceEn = '';
          this.multipleChoiceChoiceFr = '';
          this.multipleChoiceChoiceEu = '';
          this.multipleChoiceChoiceCa = '';
          this.multipleChoiceChoiceDe = '';
          this.multipleChoiceChoiceIt = '';
          this.multipleChoiceCorrect = false;
          this.multipleChoiceOptionMode = '';
          this.showMultipleChoiceOptionDetails = false;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  cancelMultipleChoice() {
    this.showMultipleChoiceOptionDetails = false;
  }

  moveUp(type, array, index) {
    if (index >= 1) {
      this.swap(array, index, index - 1);
      this.updateAssessmentListSequence(type, array);
    }
  }

  moveDown(type, array, index) {
    if (index < array.length - 1) {
      this.swap(array, index, index + 1);
      this.updateAssessmentListSequence(type, array);
    }
  }

  swap(array: any[], x: any, y: any) {
    var b = array[x];
    array[x] = array[y];
    array[y] = b;
  }

  updateAssessmentListSequence(type, array) {
    let params = {
      id: this.selectedAssessmentItemId,
      list_type: type,
      list: array
    }
    this._coursesService.editCourseListSequence(params).subscribe(
      response => {
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
      },
      error => {
        console.log(error);
      }
    )
  }

  pondHandleInit() {
    console.log('FilePond has initialised', this.myPond);
  }

  pondHandleAddFile(event: any) {
    console.log('A file was added', event);
    if(localStorage.getItem('course_assessment_file') == 'complete' && this.assessmentFileName) {
      this.assessmentImage = `${environment.api}/get-course-image/${this.assessmentFileName}`;
    }
  }

  podHandleUpdateFiles(event: any) {
    console.log('A file was updated', event);
    if(localStorage.getItem('course_assessment_file') == 'complete' && this.assessmentFileName) {
      this.assessmentImage = `${environment.api}/get-course-image/${this.assessmentFileName}`;
    }
  }

  podHandleProcessFile(event: any) {
    console.log('A file was updated', event);
    if(localStorage.getItem('course_assessment_file') == 'complete' && this.assessmentFileName) {
      this.assessmentImage = `${environment.api}/get-course-image/${this.assessmentFileName}`;
    }
  }

  public getTimestamp() {
    const date = new Date()
    const timestamp = date.getTime()
    return timestamp
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

  clearImage() {
    this.clearedImage = true;
    this.assessmentItemImage = '';
    this.assessmentFileName = '';
  }

  clearFileLocal() {
    localStorage.removeItem('course_assessment_file');
  }

  ngOnDestroy() {
    this.clearFileLocal();
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}