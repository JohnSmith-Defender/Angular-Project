import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  Input,
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
import { BlogsService } from "@features/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { ButtonGroupComponent, NoAccessComponent, PageTitleComponent } from "@share/components";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { QuillModule } from 'ngx-quill';
import {
  ImageCropperModule,
  ImageCroppedEvent,
  ImageTransform,
  base64ToFile,
} from "ngx-image-cropper";
import { DomSanitizer } from "@angular/platform-browser";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { faRotateLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import get from "lodash/get";

@Component({
  selector: "app-blog-edit",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatTabsModule,
    QuillModule,
    ImageCropperModule,
    FontAwesomeModule,
    ButtonGroupComponent,
    NoAccessComponent,
    PageTitleComponent,
  ],
  templateUrl: "./edit.component.html",
})
export class BlogEditComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;

  languageChangeSubscription: any;
  isMobile: boolean = false;
  language: any;
  companyId: number = 0;
  userId: number = 0;
  company: any;
  domain: any;
  primaryColor: any;
  buttonColor: any;
  companies: any;
  userRole: any;
  email: any;
  blogFeature: any;
  featureId: any;
  pageName: any;
  superAdmin: boolean = false;
  canCreateBlog: any;
  languages: any = [];
  isLoading: boolean = true;
  selectedLanguage: string = "es";
  selectedLanguageChanged: boolean = false;
  showLanguageNote: boolean = true;
  buttonList: any = [];
  issaving: boolean = false;
  errorMessage: string = "";
  formSubmitted: boolean = false;
  status: boolean = true;
  showImageCropper: boolean = false;
  imageChangedEvent: any = "";
  imgSrc: any;
  croppedImage: any = "";
  file: any = [];
  @ViewChild("modalbutton", { static: false })
  modalbutton: ElementRef<HTMLInputElement> = {} as ElementRef;
  rotateLeftIcon = faRotateLeft;
  rotateRightIcon = faRotateRight;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  transform: ImageTransform = {};

  blogForm: FormGroup = new FormGroup({
    name_ES: new FormControl("", [Validators.required]),
    name_EN: new FormControl("", [Validators.required]),
    name_FR: new FormControl("", [Validators.required]),
    name_EU: new FormControl("", [Validators.required]),
    name_CA: new FormControl("", [Validators.required]),
    name_DE: new FormControl("", [Validators.required]),
    description_ES: new FormControl("", [Validators.required]),
    description_EN: new FormControl("", [Validators.required]),
    description_FR: new FormControl("", [Validators.required]),
    description_EU: new FormControl("", [Validators.required]),
    description_CA: new FormControl("", [Validators.required]),
    description_DE: new FormControl("", [Validators.required]),
    seo_title: new FormControl(''),
    seo_keywords: new FormControl(''),
    seo_description: new FormControl(''),
  });

  CompanyUser: any;
  name: any;
  defaultLanguage: any = "es";
  description: any;
  editorToUse: string = "tinymce";
  editor: any;
  hasSetting: any;
  apiPath: string = environment.api;
  pageTitle: string = "";

  blog: any = {};
  blogTitle: any;
  blogImage: any;
  blogDescription: any;
  blogOwner: boolean = false;
  showConfirmationModal: boolean = false;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  blogCategories: any = [];
  selectedCategory: any = '';
  categories: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _blogsService: BlogsService,
    private sanitizer: DomSanitizer
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

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

    this.initializePage();
  }

  initializePage() {
    this.fetchBlogData();
  }

  fetchBlogData() {
    this._blogsService
      .fetchBlog(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapUserPermissions(data?.user_permissions);
          this.mapLanguages(data?.languages);
          this.blogCategories = data?.blog_categories;
          this.formatBlog(data);
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatBlog(data) {
    this.blog = data?.blog;

    if(this.id > 0) {
      const {
        name_ES,
        name_EN,
        name_FR,
        name_EU,
        name_CA,
        name_DE,
        description_ES,
        description_EN,
        description_FR,
        description_EU,
        description_CA,
        description_DE,
        image,
        status,
      } = this.blog;

      this.blogForm.controls["name_ES"].setValue(name_ES);
      this.blogForm.controls["name_EN"].setValue(name_EN);
      this.blogForm.controls["name_FR"].setValue(name_FR);
      this.blogForm.controls["name_EU"].setValue(name_EU);
      this.blogForm.controls["name_CA"].setValue(name_CA);
      this.blogForm.controls["name_DE"].setValue(name_DE);
      this.blogForm.controls["description_ES"].setValue(description_ES);
      this.blogForm.controls["description_EN"].setValue(description_EN);
      this.blogForm.controls["description_FR"].setValue(description_FR);
      this.blogForm.controls["description_EU"].setValue(description_EU);
      this.blogForm.controls["description_CA"].setValue(description_CA);
      this.blogForm.controls["description_DE"].setValue(description_DE);
      this.imgSrc = `${this.apiPath}/get-blog-image/${image}`;
      this.status = status == 1 ? true : false;
      this.blogTitle = this.getBlogName(this.blog);
      this.blogDescription = this.getBlogDescription(data?.blog);
      this.selectedCategory = this.blog?.category_id || '';
    }
  }

  getBlogName(blog) {
    this.blogTitle =
      this.language == "en"
        ? blog.name_EN
          ? blog.name_EN || blog.name_ES
          : blog.name_ES
        : this.language == "fr"
        ? blog.name_FR
          ? blog.name_FR || blog.name_ES
          : blog.name_ES
        : this.language == "eu"
        ? blog.name_EU
          ? blog.name_EU || blog.name_ES
          : blog.name_ES
        : this.language == "ca"
        ? blog.name_CA
          ? blog.name_CA || blog.name_ES
          : blog.name_ES
        : this.language == "de"
        ? blog.name_DE
          ? blog.name_de || blog.name_ES
          : blog.name_ES
        : blog.name_ES;
    return this.blogTitle;
  }

  getBlogDescription(blog) {
    return blog
      ? this.language == "en"
        ? blog.description_EN || blog.description_ES
        : this.language == "fr"
        ? blog.description_FR || blog.description_ES
        : this.language == "eu"
        ? blog.description_EU || blog.description_ES
        : this.language == "ca"
        ? blog.description_CA || blog.description_ES
        : this.language == "de"
        ? blog.description_DE || blog.description_ES
        : blog.description_ES
      : "";
  }

  getBlogDescriptionTruncated(blog) {
    let description = blog
      ? this.language == "en"
        ? blog.description_EN || blog.description_ES
        : this.language == "fr"
        ? blog.description_FR || blog.description_ES
        : this.language == "eu"
        ? blog.description_EU || blog.description_ES
        : this.language == "ca"
        ? blog.description_CA || blog.description_ES
        : this.language == "de"
        ? blog.description_DE || blog.description_ES
        : blog.description_ES
      : "";

      let charlimit = 180;
      if (!description || description.length <= charlimit) {
        return description;
      }
  
      let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
      let shortened = without_html.substring(0, charlimit) + "...";
      return shortened;
  }

  mapFeatures(features) {
    this.blogFeature = features?.find((f) => f.feature_id == 21);
    this.featureId = this.blogFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.blogFeature);
    this.pageTitle = `${this.id > 0 ? this._translateService.instant('edit-club.edityourclub') : this._translateService.instant('club-create.createyour')} ${this.pageName}`
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreateBlog =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 21
      );
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
    this.selectedLanguage = this.language || "es";
    this.initializeButtonGroup();
  }

  initializeButtonGroup() {
    let list: any[] = [];

    this.languages?.forEach((language) => {
      list.push({
        id: language.id,
        value: language.code,
        text: this.getLanguageName(language),
        selected: language.default ? true : false,
        code: language.code,
      });
    });

    this.buttonList = list;
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
        : feature.name_es || feature.feature_name_ES
      : "";
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
      : language.name_ES;
  }

  getCategoryTitle(category) {
    return this.language == 'en' ? category.name_EN : (this.language == 'fr' ? category.name_FR :
        (this.language == 'eu' ? category.name_EU : (this.language == 'ca' ? category.name_CA :
            (this.language == 'de' ? category.name_DE : category.name_ES)
        ))
    )
  }

  closeLanguageNote() {
    this._localService.setLocalStorage("showLanguageNote", new Date());
    this.showLanguageNote = false;
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

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    const file = event.target.files[0];
    if (file.size > 2000000) {
    } else {
      initFlowbite();
      setTimeout(() => {
        this.modalbutton?.nativeElement.click();
      }, 500);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      this.imgSrc = this.croppedImage = event.base64;
      this.file = {
        name: "image",
        image: base64ToFile(event.base64),
      };
    }
  }

  imageLoaded() {
    // show cropper
  }

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {
    // show message
  }

  imageCropperModalSave() {
    this.showImageCropper = false;
  }

  imageCropperModalClose() {
    this.showImageCropper = false;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    const contentContainer =
      document.querySelector(".mat-sidenav-content") || window;
    contentContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  validationCheck() {
    let code =
      this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    if (this.id == 0) {
      if (
        this.blogForm?.value["name_" + code?.toString()?.toUpperCase()] &&
        this.blogForm?.value["description_" + code?.toString()?.toUpperCase()] &&
        this.file &&
        this.file.image
      ) {
        return true;
      }
    } else {
      if (
        this.blogForm?.value["name_" + code?.toString()?.toUpperCase()] &&
        this.blogForm?.value["description_" + code?.toString()?.toUpperCase()]
      ) {
        return true;
      }
    }

    return false;
  }

  setDescription() {
    if (this.editorToUse == "tinymce" && this.editor) {
      if (this.blogForm.controls["description"]) {
        this.blogForm.controls["description"].setValue(
          this.editor.getContent()
        );
      }
      if (this.blogForm.controls["descrition_EN"]) {
        this.blogForm.controls["description_EN"].setValue(
          this.editor.getContent()
        );
      }
      if (this.blogForm.controls["description_FR"]) {
        this.blogForm.controls["description_FR"].setValue(
          this.editor.getContent()
        );
      }
      if (this.blogForm.controls["description_EU"]) {
        this.blogForm.controls["description_EU"].setValue(
          this.editor.getContent()
        );
      }
      if (this.blogForm.controls["description_CA"]) {
        this.blogForm.controls["description_CA"].setValue(
          this.editor.getContent()
        );
      }
      if (this.blogForm.controls["description_DE"]) {
        this.blogForm.controls["description_DE"].setValue(
          this.editor.getContent()
        );
      }
    }

    if (this.blogForm.controls["description"]) {
      this.blogForm.controls["description"].setValue(
        this.blogForm
          .get("description")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.blogForm.controls["description_EN"]) {
      this.blogForm.controls["description_EN"].setValue(
        this.blogForm
          .get("description_EN")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.blogForm.controls["description_FR"]) {
      this.blogForm.controls["description_FR"].setValue(
        this.blogForm
          .get("description_FR")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.blogForm.controls["description_EU"]) {
      this.blogForm.controls["description_EU"].setValue(
        this.blogForm
          .get("description_EU")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.blogForm.controls["description_CA"]) {
      this.blogForm.controls["description_CA"].setValue(
        this.blogForm
          .get("description_CA")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }

    if (this.blogForm.controls["description_DE"]) {
      this.blogForm.controls["description_DE"].setValue(
        this.blogForm
          .get("description_DE")
          ?.value?.replace("*|MC:SUBJECT|*", "")
          .replace("<!--*|IF:MC_PREVIEW_TEXT|*-->", "")
          .replace(
            '<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->',
            ""
          )
          .replace("<!--*|END:IF|*-->", "")
      );
    }
  }

  public getTimestamp() {
    const date = new Date();
    const timestamp = date.getTime();

    return timestamp;
  }

  saveBlog() {
    this.errorMessage = "";
    this.formSubmitted = true;
    this.issaving = true;

    let code =
      this.defaultLanguage?.length > 0 ? this.defaultLanguage[0].code : "es";
    this.name = this.blogForm.get("name_" + code)?.value || "";
    this.description = this.blogForm.get("description_" + code)?.value || "";

    if (
      this.blogForm.get("name_" + code)?.errors
    ) {
      this.scrollToTop();
      this.issaving = false;
      return false;
    }

    if (!this.validationCheck()) {
      this.scrollToTop();
      this.issaving = false;
      return false;
    }

    this.setDescription();

    this.blogForm["name"] = this.name;
    this.blogForm["description"] = this.description;
    this.blogForm.value.name = this.name;
    this.blogForm.value.description = this.description;

    let formData = new FormData();

    formData.append("company_id", this.companyId.toString());
    formData.append("user_id", this.userId.toString());
    formData.append("category_id", this.selectedCategory || null);
    formData.append(
      "name_ES",
      this.blogForm?.value["name_ES"]
        ? this.blogForm?.value["name_ES"]
        : this.blogForm?.value["name"]
    );
    formData.append(
      "name_EN",
      this.blogForm?.value["name_EN"]
        ? this.blogForm?.value["name_EN"]
        : this.blogForm?.value["name"]
    );
    formData.append(
      "name_FR",
      this.blogForm?.value["name_FR"]
        ? this.blogForm?.value["name_FR"]
        : this.blogForm?.value["name"]
    );
    formData.append(
      "name_EU",
      this.blogForm?.value["name_EU"]
        ? this.blogForm?.value["name_EU"]
        : this.blogForm?.value["name"]
    );
    formData.append(
      "name_CA",
      this.blogForm?.value["name_CA"]
        ? this.blogForm?.value["name_CA"]
        : this.blogForm?.value["name"]
    );
    formData.append(
      "name_DE",
      this.blogForm?.value["name_DE"]
        ? this.blogForm?.value["name_DE"]
        : this.blogForm?.value["name"]
    );
    formData.append(
      "description_ES",
      this.blogForm?.value["description_ES"]
        ? this.blogForm?.value["description_ES"]
        : this.blogForm?.value["description"]
    );
    formData.append(
      "description_EN",
      this.blogForm?.value["description_EN"]
        ? this.blogForm?.value["description_EN"]
        : this.blogForm?.value["description"]
    );
    formData.append(
      "description_FR",
      this.blogForm?.value["description_FR"]
        ? this.blogForm?.value["description_FR"]
        : this.blogForm?.value["description"]
    );
    formData.append(
      "description_EU",
      this.blogForm?.value["description_EU"]
        ? this.blogForm?.value["description_EU"]
        : this.blogForm?.value["description"]
    );
    formData.append(
      "description_CA",
      this.blogForm?.value["description_CA"]
        ? this.blogForm?.value["description_CA"]
        : this.blogForm?.value["description"]
    );
    formData.append(
      "description_DE",
      this.blogForm?.value["description_DE"]
        ? this.blogForm?.value["description_DE"]
        : this.blogForm?.value["description"]
    );

    if(this.id > 0) {
      formData.append('id', this.id);
      formData.append('status', this.status ? '1' : '0');
    } else {
      formData.append('status', '1');
    }

    if (this.file?.image) {
      const filename = 'blog_' + this.userId + '_' + this.getTimestamp();
      formData.append('image', this.file.image, filename + '.jpg');
    }

    if (this.id > 0) {
      //   Edit
      this._blogsService.editBlog(this.id, formData).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this._router.navigate([`/blog/details/${this.id}`]);
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      // Create
      this._blogsService.addBlog(formData).subscribe(
        (response) => {
          if (response?.blog?.id > 0) {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this._router.navigate([`/blog/details/${response?.blog?.id}`]);
          } else {
            this.issaving = false;
            this.open(this._translateService.instant("dialog.error"), "");
          }
        },
        (error) => {
          this.issaving = false;
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

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}