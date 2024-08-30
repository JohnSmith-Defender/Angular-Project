import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { BlogsService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer } from '@angular/platform-browser';
import { initFlowbite } from "flowbite";
import get from "lodash/get";

@Component({
  selector: "app-blog-detail",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
  ],
  templateUrl: "./detail.component.html",
})
export class BlogDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  emailDomain;
  user;
  canCreate: boolean = false;
  language: any;
  userId: any;
  companyId: any;
  pageName: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  superAdmin: boolean = false;
  company: any;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  blogData: any;
  blog: any;
  blogOwner: boolean = false;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  featureId: any;
  blogsFeature: any;
  blogTitle: any;
  blogImage: any;
  blogDescription: any;
  editHover: boolean = false;
  deleteHover: boolean = false;
  showBlogDescription: boolean = false;
  blogDesc: any = '';
  @ViewChild('iframeBlogDescription', { static: false }) iframeBlogDescription: ElementRef | undefined;
  @ViewChild('editor', { static: false }) editor: ElementRef | undefined;
  blogAuthor: any;

  constructor(
    private _router: Router,
    private _blogsService: BlogsService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar,
    private _sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
    this._translateService.use(this.language || "es");

    this.emailDomain = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
      this.emailDomain = company[0].domain;
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.hoverColor = company[0].hover_color
        ? company[0].hover_color
        : company[0].primary_color;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.getBlog();
  }

  zoomIn() {
    
  }
 
  zoomOut() {
    
  }

  getBlog() {
    this._blogsService
      .fetchBlog(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.blogData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.blogData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapUserPermissions(data?.user_permissions);
    this.formatBlog(data);
    this.initializeBreadcrumb(data?.blog);
  }

  mapFeatures(features) {
    this.blogsFeature = features?.find((f) => f.feature_id == 21);
    this.featureId = this.blogsFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.blogsFeature);
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 21
      );
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

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = this.getBlogName(data);
    this.level3Title = "";
    this.level4Title = "";
  }

  formatBlog(data) {
    this.blog = data?.blog;
    this.blogImage = `${environment.api}/get-blog-image/${this.blog?.image}`;
    this.blogOwner = this.userId == this.blog.created_by ? true : false;
    this.blogAuthor = this.blog?.creator?.name || `${this.blog?.creator?.first_name} ${this.blog?.creator?.last_name}`;
    this.blogDescription = this.getBlogDescription(this.blog);
    this.blogDesc = this._sanitizer.bypassSecurityTrustHtml(this.blogDescription);
    if(this.blogDesc) {
      this.blogDesc = this.blogDesc?.changingThisBreaksApplicationSecurity;
    }
    this.showBlogDescription = true;
    this.blogTitle = this.getBlogName(data?.blog);
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

  handleDelete() {
    if (this.id) {
      this.showConfirmationModal = false;
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

  confirm() {
    this.deleteBlog(this.id, true);
  }

  deleteBlog(id, confirmed) {
    if (confirmed) {
      this._blogsService.deleteBlog(id).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this._location.back();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  handleEditRoute() {
    this._router.navigate([`/blog/edit/${this.id}`]);
  }

  toggleEditHover(event) {
    this.editHover = event;
  }

  toggleDeleteHover(event) {
    this.deleteHover = event;
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