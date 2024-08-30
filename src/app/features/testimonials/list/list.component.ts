import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '@env/environment';
import { Router } from '@angular/router';
import { TestimonialsService } from '@features/services';
import { ButtonGroupComponent, FilterComponent, PageTitleComponent } from '@share/components';
import { SearchComponent } from "@share/components/search/search.component";
import { NgxPaginationModule } from "ngx-pagination";
import { TestimonialCardComponent } from '@share/components/card/testimonial/testimonial.component';
import { searchSpecialCase, sortSerchedMembers } from 'src/app/utils/search/helper';
import * as he from 'he';
import Fuse from 'fuse.js';
import get from 'lodash/get';
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";
import "moment/locale/it";

@Component({
  selector: 'app-testimonials-list',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    NgOptimizedImage,
    PageTitleComponent,
    SearchComponent,
    TestimonialCardComponent,
    FilterComponent,
    ButtonGroupComponent,
    NgxPaginationModule,
  ],
  templateUrl: './list.component.html'
})
export class TestimonialsListComponent {
  private destroy$ = new Subject<void>();

  @Input() parentComponent: any;
  @Input() limit: any;

  languageChangeSubscription;
  user: any;
  email: any;
  language: any;
  companyId: any = 0;
  companies: any;
  domain: any;
  pageTitle: any;
  features: any;

  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  userId: any;
  subfeatures: any;
  superAdmin: boolean = false;
  pageName: any;
  pageDescription: any;
  showSectionTitleDivider: boolean = false;
  isMobile: boolean = false;
  testimonialsFeature: any;
  featureId: any;
  canViewTestimonial: boolean = false;
  canCreateTestimonial: boolean = false;
  canManageTestimonial: boolean = false;
  createHover: boolean = false;
  searchText: any;
  placeholderText: any;
  search: any;
  p: any;
  testimonials: any = [];
  allTestimonials: any = [];
  tagMapping: any = [];
  tags: any = [];
  list: any[] = [];
  buttonList: any;
  courses: any = [];
  selectedCourse: any;
  superTutor: boolean = false;
  potSuperTutor: boolean = false;

  searchOptions = {
    keys: [{
      name: 'author',
      weight: 0.25
    }, {
      name: 'tags_display',
      weight: 0.25
    }, {
      name: 'short_description',
      weight: 0.25
    }, {
      name: 'description',
      weight: 0.25
    }]
  };
  filterActive: boolean = false;
  defaultActiveFilter: boolean = false;
  filterSettings: any = [];
  showFilters: boolean = false;
  isCursoGeniusTestimonials: boolean = false;
  filterTypeControl: any = '';

  constructor(
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _testimonialsService: TestimonialsService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

    this.email = this._localService.getLocalStorage(environment.lsemail);
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
      this.showSectionTitleDivider = company[0].show_section_title_divider;
      this._localService.setLocalStorage(
        environment.lscompanyId,
        this.companyId
      );
      this.isCursoGeniusTestimonials = this._companyService.isCursoGeniusTestimonials(company[0]);
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
    this.fetchTestimonials();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchTestimonials() {
    this._testimonialsService
      .fetchTestimonials(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures);

          this.initializeFilterSettings(data?.module_filter_settings);

          this.mapUserPermissions(data?.user_permissions);
          this.courses = data?.courses;
          this.tags = data?.tags;
          this.tagMapping = data?.tags_mapping;
          let testimonials = this.shuffleArray(data?.testimonials);
          this.allTestimonials = testimonials;
          this.formatTestimonials(testimonials);

          this.filterTypeControl = 'dropdown';
          if(data?.module_filter_settings?.length > 0) {
            this.filterTypeControl = data?.module_filter_settings[0].filter_type || 'dropdown';
          } else {
            this.filterTypeControl = data?.filter_settings?.filter_type || 'dropdown';
          }

          this.initializeButtonGroup();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializeFilterSettings(filter_settings) {
    let filter_settings_active = filter_settings?.filter(fs => {
      return fs.active == 1
    })
    if(filter_settings_active?.length > 0 && this.filterActive) {
      this.showFilters = true;
      this.filterSettings = filter_settings;
    }
  }

  shuffleArray(array) {
    var m = array.length, t, i;
 
    while (m) {    
     i = Math.floor(Math.random() * m--);
     t = array[m];
     array[m] = array[i];
     array[i] = t;
    }
 
   return array;
 }

  mapFeatures(features) {
    this.testimonialsFeature = features?.find((f) => f.feature_id == 23);
    this.featureId = this.testimonialsFeature?.id;
    this.pageName = this.getFeatureTitle(this.testimonialsFeature);
    this.pageDescription = this.getFeatureDescription(this.testimonialsFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.filterActive = subfeatures.some(
        (a) => a.name_en == "Testimonials filter" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.superTutor = user_permissions?.super_tutor ? true : false;
    this.potSuperTutor = user_permissions?.potsuper_tutor ? true : false;
    this.canViewTestimonial = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 23
    )
      ? true
      : false;
    this.canCreateTestimonial =
    this.potSuperTutor ||
    this.superTutor ||
    user_permissions?.create_plan_roles?.length > 0 ||
    user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 23);
    this.canManageTestimonial = user_permissions?.member_type_permissions?.find(
      (f) => f.manage == 1 && f.feature_id == 23
      )
      ? true
      : false;
  }

  formatTestimonials(testimonials) {
    testimonials = testimonials?.map((item) => {
      let tags_texts = this.getTagsDisplay(item);

      return {
        ...item,
        id: item?.id,
        path: `/testimonials/details/${item.id}`,
        image: `${environment.api}/get-testimonial-image/${item.image}`,
        video: `${environment.api}/get-testimonial-video/${item.video}`,
        isCoverImage: item.isCoverImage || !item.video ? true :  false,
        tags_display: tags_texts?.map((data) => { return data.tag_label }).join(', '),
        date_display: moment.utc(item.created_at).locale(this.language).format('D MMMM')
      };
    });

    this.testimonials = testimonials;
  }

  getTagsDisplay(testimonial) {
    let list_tags: any[] = []
    if(this.tagMapping?.length > 0) {
      let testimonial_tags = this.tagMapping?.filter(tm => {
        return tm.testimonial_id == testimonial.id
      })
      if(testimonial_tags?.length > 0) {
        testimonial_tags?.forEach(t => {
          let tag = this.tags?.filter(tag => {
            return tag.id == t.tag_id
          })

          list_tags.push({
            tag_id: t.tag_id,
            tag_label: tag?.length > 0 ? this.getTagLabel(tag[0]) : ''
          })
        })
      }
    }
    return list_tags
  }

  getTagLabel(tag) {
    return tag
      ? this.language == "en"
        ? tag.tag_en ||
          tag.tag_es
        : this.language == "fr"
        ? tag.tag_fr ||
          tag.tag_es
        : this.language == "eu"
        ? tag.tag_eu ||
          tag.tag_es
        : this.language == "ca"
        ? tag.tag_ca ||
          tag.tag_es
        : this.language == "de"
        ? tag.tag_de ||
          tag.tag_es
        : tag.tag_es
      : "";
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
        : this.language == "it"
        ? feature.description_it || feature.description_es
        : feature.description_es
      : "";
  }

  initializeButtonGroup() {
    let categories = this.courses;
    let text = this._translateService.instant("plans.all");
    if(this.filterSettings?.length > 0) {
      let category_filter = this.filterSettings?.filter(fs => {
        return fs.field == 'category'
      })
      if(category_filter?.length > 0 && category_filter[0].filter_type == 'dropdown') {
        text = category_filter[0].select_text;
      }
    }
    this.buttonList = [
      {
        id: "All",
        value: "All",
        text,
        selected: true,
        fk_company_id: this.companyId,
        fk_supercategory_id: "All",
        name_CA: "All",
        name_DE: "All",
        name_EN: "All",
        name_ES: "All",
        name_EU: "All",
        name_FR: "All",
        sequence: 1,
        status: 1,
      },
    ];

    if(categories?.length > 0) {
      categories = categories.sort((a, b) => {
        return b.id - a.id
      })
    }

    categories?.forEach((category) => {
      this.buttonList.push({
        id: category.id,
        value: category.id,
        text: this.getCourseTitle(category),
        selected: false,
        fk_company_id: category.company_id,
        fk_supercategory_id: category.id,
        name_CA: category.title_ca,
        name_DE: category.title_de,
        name_EN: category.title_en,
        name_ES: category.title,
        name_EU: category.title_eu,
        name_FR: category.title_fr,
        sequence: null,
        status: category.status,
      });
    });
  }

  getCourseTitle(course) {
    return this.language == "en"
      ? course.title_en
        ? course.title_en || course.title
        : course.title
      : this.language == "fr"
      ? course.title_fr
        ? course.title_fr || course.title
        : course.title
      : this.language == "eu"
      ? course.title_eu
        ? course.title_eu || course.title
        : course.title
      : this.language == "ca"
      ? course.title_ca
        ? course.title_ca || course.title
        : course.title
      : this.language == "de"
      ? course.title_de
        ? course.title_de || course.title
        : course.title
      : course.title;
  }

  handleCreateRoute() {
    this._router.navigate([`/testimonials/create/0`]);
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.filterTestimonials();
  }

  filteredList(event) {
    
  }

  filteredType(category) {
    this.buttonList?.forEach((item) => {
      if (item.id === category.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedCourse = category || "";
    localStorage.setItem('testimonial-filter-course', this.selectedCourse);
    this.filterTestimonials();
  }

  filterTestimonials() {
    let testimonials = this.allTestimonials
    if (this.search) {
      testimonials = this.filterSearchKeyword(testimonials)
      let fuse = new Fuse(testimonials, this.searchOptions);
      let filtered_search = fuse.search(this.normalizeCase(this.search));
      testimonials = []
      filtered_search?.forEach(item => {
        testimonials.push(item?.item)
      })
    }

    if(this.selectedCourse?.id > 0) {
      testimonials = testimonials.filter(m => {
        return m.testimonial_course_id == this.selectedCourse?.id
      })
    }

    this.formatTestimonials(testimonials);
  }

  filterSearchKeyword(testimonials) {
    if(testimonials?.length > 0) {
      return testimonials.filter(m => {
        return (
          (m.author && 
            (m.author
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0 
            || searchSpecialCase(this.search,m.author))
            ) ||
          (m.tags_display && m.tags_display
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.search
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0) ||
          (m.short_description && he.decode(m.short_description)
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.search
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) || 
            (m.description && he.decode(m.description)
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.search
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0)
        )
      })
    }
  }

  normalizeCase(str) {
    if (str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
    }
  }

  filterViewChanged(event) {
    this.defaultActiveFilter = event;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
