import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, HostListener } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { BlogsService } from "@features/services";
import { SearchComponent } from "@share/components/search/search.component";
import { IconFilterComponent, PageTitleComponent } from "@share/components";
import { NgxPaginationModule } from "ngx-pagination";
import get from "lodash/get";
import * as he from 'he';

@Component({
  selector: "app-blogs-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SearchComponent,
    IconFilterComponent,
    NgOptimizedImage,
    RouterModule,
    NgxPaginationModule,
    PageTitleComponent
  ],
  templateUrl: "./list.component.html",
})
export class BlogListComponent {
  private destroy$ = new Subject<void>();

  languageChangeSubscription;
  isMobile: boolean = false;
  language: any;
  email: any;
  userId: any;
  companyId: any;
  domain: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  searchText: any;
  placeholderText: any;
  search: any;
  blogsFeature: any;
  featureId: any;
  pageName: any;
  cities: any;
  superAdmin: boolean = false;
  filterActive: any;
  searchByKeyword: any;
  hasMobileLimit: any;
  canViewBlog: boolean = false;
  canCreateBlog: boolean = false;
  canManageBlog: boolean = false;
  list: any[] = [];
  blogs: any;
  allBlogs: any[] = [];
  selectedCity: any;
  pageDescription: any;
  p: any;
  createHover: boolean = false;
  readHover: boolean = false;
  selectedBlogId: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _blogsService: BlogsService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.domain = this._localService.getLocalStorage(environment.lsdomain);
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
      this.domain = company[0].domain;
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

    this.initializePage();
  }

  initializePage() {
    this.initializeSearch();
    this.fetchBlogs();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchBlogs() {
    this._blogsService
      .fetchBlogs(this.companyId, this.userId, "active")
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures);
          this.mapUserPermissions(data?.user_permissions);
          this.formatBlogs(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.blogsFeature = features?.find((f) => f.feature_id == 21);
    this.featureId = this.blogsFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.blogsFeature);
    this.pageDescription = this.getFeatureDescription(this.blogsFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.filterActive = subfeatures.some(
        (a) => a.name_en == "Filter" && a.active == 1
      );
      this.searchByKeyword = subfeatures.some(
        (a) => a.name_en == "Search by keyword" && a.active == 1
      );
      this.hasMobileLimit = subfeatures.some(
        (a) => a.name_en == "View more" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canViewBlog = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 21
    )
      ? true
      : false;
    this.canCreateBlog =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 21
      );
    this.canManageBlog = user_permissions?.member_type_permissions?.find(
      (f) => f.manage == 1 && f.feature_id == 21
    )
      ? true
      : false;
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

  getFeatureDescription(feature) {
    return feature
      ? this.language == "en"
        ? feature.description_en || feature.description_es
        : this.language == "fr"
        ? feature.description_fr || feature.description_es
        : this.language == "eu"
        ? feature.description_eu || feature.description_es
        : this.language == "ca"
        ? feature.description_ca || feature.description_es
        : this.language == "de"
        ? feature.description_de || feature.description_es
        : feature.description_es
      : "";
  }

  async formatBlogs(data) {
    let blogs = data?.blogs;

    blogs = blogs?.map((blog) => {
      let description = this.getBlogDescription(blog);

      return {
        ...blog,
        name: this.getBlogName(blog),
        description,
        image: `${environment.api}/get-blog-image/${blog.image}`,
        author_image: `${environment.api}/${blog.created_by_image}`,
        truncated_description: this.getExcerpt(description),
      };
    });

    this.blogs = blogs;
    this.allBlogs = blogs;
  }

  getBlogName(blog) {
    return blog
      ? this.language == "en"
        ? blog.name_EN || blog.name_ES
        : this.language == "fr"
        ? blog.name_FR || blog.name_ES
        : this.language == "eu"
        ? blog.name_EU || blog.name_ES
        : this.language == "ca"
        ? blog.name_CA || blog.name_ES
        : this.language == "de"
        ? blog.name_DE || blog.name_ES
        : blog.name_ES
      : "";
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

  getExcerpt(description) {
    let charlimit = 100;
    if (!description || description.length <= charlimit) {
      return description;
    }

    let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  handleCreateRoute() {
    this._router.navigate([`/blog/create/0`]);
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.filterBlogs();
  }

  async filterBlogs() {
    this.blogs = this.allBlogs;

    if (this.search) {
      this.blogs = this.blogs.filter((blog) => {
        let include = false;

        if (
          (blog.name && blog.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0) ||
          (blog.description && he.decode(blog.description)
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.search
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
  }

  goToDetails(guide) {
    this._router.navigate([`/blog/details/${guide?.id}`]);
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  toggleReadHover(event, guide) {
    this.readHover = event;
    this.selectedBlogId = event ? guide.id : ''
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}