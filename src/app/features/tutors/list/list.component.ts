import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '@env/environment';
import { TutorsService } from '@features/services';
import { FilterComponent, PageTitleComponent } from '@share/components';
import { SearchComponent } from "@share/components/search/search.component";
import { NgxPaginationModule } from "ngx-pagination";
import { TutorCardComponent } from '@share/components/card/tutor/tutor.component';
import { TutorSmallCardComponent } from '@share/components/card/tutor-small/tutor-small.component';
import { searchSpecialCase, sortSerchedMembers } from 'src/app/utils/search/helper';
import Fuse from 'fuse.js';
import get from 'lodash/get';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    NgOptimizedImage,
    PageTitleComponent,
    SearchComponent,
    TutorCardComponent,
    TutorSmallCardComponent,
    FilterComponent,
    NgxPaginationModule,
  ],
  templateUrl: './list.component.html'
})
export class TutorsListComponent {
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
  tutorsFeature: any;
  featureId: any;
  searchText: any;
  placeholderText: any;
  search: any;
  p: any;
  tutors: any = [];
  allTutors: any = [];
  list: any[] = [];
  buttonList: any;
  tutorTypes: any;
  cities: any = [];
  allTutorTypes: any = [];
  selectedCity: any = '';
  selectedType: any = '';
  defaultActiveFilter: boolean = false;
  tutorCardSmallImage: boolean = false;
  searchOptions = {
    keys: [{
      name: 'normalized_first_name',
      weight: 0.25
    }, {
      name: 'normalized_last_name',
      weight: 0.25
    }, {
      name: 'normalized_name',
      weight: 0.25
    }, {
      name: 'type_values',
      weight: 0.25
    }]
  };
  filterActive: boolean = false;
  filterSettings: any = [];
  showFilters: boolean = false;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService
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
    this.fetchTutors();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchTutors() {
    this._tutorsService
      .fetchTutorsCombined(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures);

          this.initializeFilterSettings(data?.module_filter_settings);

          this.mapUserPermissions(data?.user_permissions);
          this.tutorTypes = data?.tutor_types;

          let tutors = data?.tutors?.filter(tutor => {
            return tutor.status == 1
          });
          if(data?.user?.custom_member_type_id == 282) {
            this.allTutors = this.filter30idiomasTutors(tutors);
          } else {
            this.allTutors = tutors;
          }
          
          this.cities = data?.cities;
          this.initializeIconFilterList(this.cities);

          this.allTutorTypes = data?.all_tutor_types;
          this.initializeButtonGroup();

          this.formatTutors(this.allTutors);

          if(this.companyId == 52) { this.defaultActiveFilter = true; }
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

  filter30idiomasTutors(tutors) {
    let filtered_tutors = tutors;

    filtered_tutors = filtered_tutors?.filter(tutor => {
      let include = false
      
      if(tutor?.courseTutor?.length > 0) {
        include = tutor?.courseTutor.some(a => a.course_id == 131)
      }

      return include
    })

    return filtered_tutors;
  }

  mapFeatures(features) {
    this.tutorsFeature = features?.find((f) => f.feature_id == 20);
    this.featureId = this.tutorsFeature?.id;
    this.pageName = this.getFeatureTitle(this.tutorsFeature);
    this.pageDescription = this.getFeatureDescription(this.tutorsFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.tutorCardSmallImage = subfeatures.some(
        (a) => a.name_en == "Tutor card (small image)" && a.active == 1
      );
      this.filterActive = subfeatures.some(
        (a) => a.name_en == "Tutors filter" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
  }

  formatTutors(tutors) {
    tutors = tutors?.map((item) => {
      let types = this.getTutorTypes(item)
      return {
        ...item,
        id: item?.id,
        path: `/tutors/details/${item.user_id}`,
        image: `${environment.api}/${item.image}`,
        normalized_name: this.normalizeCase(item.name),
        normalized_first_name: this.normalizeCase(item.first_name?.toLowerCase()),
        normalized_last_name: this.normalizeCase(item.last_name?.toLowerCase()),
        rating: this.getTutorRating(item),
        types,
        type_values: types?.length > 0 ? types?.map( (data) => { return data }).join(', ') : '',
      };
    });

    this.tutors = tutors;
    this.allTutors = tutors;

    let selected = localStorage.getItem('tutor-filter-city');
    if(selected && this.list?.length > 0) {
      this.list.forEach(item => {
        if(item.city == selected) {
          item.selected = true;
          this.selectedCity = selected;
        } else {
          item.selected = false;
        }
      })
      this.searchTutors();
    }
  }

  getTutorRating(item) {
    let rating

    if(item?.tutor_ratings?.length > 0){
      let rating_array = item['tutor_ratings']
      let tut_rating = 0.0
      let no_of_rating = 0
      rating_array.forEach((tr) => {
          tut_rating += tr.tutor_rating ? parseFloat(tr.tutor_rating) : 0
          no_of_rating++
      })
      rating = Math.round((tut_rating/no_of_rating)).toFixed(1);
    }

    return rating
  }

  getTutorTypes(item) {
    let types: any = []
    if(this.tutorTypes?.length > 0){
      types = []
        this.tutorTypes.forEach(tt => {
            let typeTutor = tt.tutorTypes[`name_${this.language?.toUpperCase()}`]
            if(tt.tutor_id == item.id && !(types).includes(typeTutor) && typeTutor != 'Curso Genius' && typeTutor != '30 días 1 idioma'){
                (types)?.push(typeTutor)
            }
        })
    }
    if(item?.tutor_type_tags?.length > 0) {
      item?.tutor_type_tags?.forEach(ttt => {
        let typeTutor = ''
        let tt = this.allTutorTypes?.filter(t => {
          return t.id == ttt.type_id
        })
        if(tt?.length > 0) {
          typeTutor = tt[0][`name_${this.language?.toUpperCase()}`]
        }
        if(typeTutor) {
          let match = types?.some(
            (a) => a == typeTutor
          );
          if(!match && typeTutor != 'Curso Genius' && typeTutor != '30 días 1 idioma') {
            (types)?.push(typeTutor)
          }
        }
      })
    }

    return types
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

  initializeIconFilterList(list) {
    let text = this._translateService.instant("plans.all");
    if(this.filterSettings?.length > 0) {
      let city_filter = this.filterSettings?.filter(fs => {
        return fs.field == 'city'
      })
      if(city_filter?.length > 0) {
        text = city_filter[0].select_text;
      }
    }
    this.list = [
      {
        id: "All",
        value: "",
        text,
        selected: true,
        company_id: this.companyId,
        city: "",
        province: "",
        region: "",
        country: "",
        sequence: "",
        campus: "",
      },
    ];

    list?.forEach((item) => {
      this.list.push({
        id: item.id,
        value: item.id,
        text: item.city,
        selected: false,
        company_id: item.company_id,
        city: item.city,
        province: item.province,
        region: item.region,
        country: item.country,
        sequence: item.sequence,
        campus: item.campus,
      });
    });
  }

  initializeButtonGroup() {
    let categories = this.allTutorTypes;
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
        name_IT: "All",
        sequence: 1,
        status: 1,
      },
    ];

    if(categories?.length > 0) {
      categories = categories.sort((a, b) => {
        if (a.name_ES < b.name_ES) {
          return -1;
        }
        if (a.name_ES > b.name_ES) {
          return 1;
        }
        return 0;
      })
    }

    categories?.forEach((category) => {
      this.buttonList.push({
        id: category.id,
        value: category.id,
        text: this.getTutorTypeTitle(category),
        selected: false,
        fk_company_id: category.company_id,
        fk_supercategory_id: category.id,
        name_CA: category.name_CA,
        name_DE: category.name_DE,
        name_EN: category.name_EN,
        name_ES: category.name_ES,
        name_EU: category.name_EU,
        name_FR: category.name_FR,
        name_IT: category.name_IT,
        sequence: category.sequence,
        status: category.status,
      });
    });
  }

  getTutorTypeTitle(type) {
    return type ? (this.language == 'en' ? (type.name_EN ? (type.name_EN || type.name_ES) : type.name_ES) :
        (this.language == 'fr' ? (type.name_FR ? (type.name_FR || type.name_ES) : type.name_ES) : 
            (this.language == 'eu' ? (type.name_EU ? (type.name_EU || type.name_ES) : type.name_ES) : 
                (this.language == 'ca' ? (type.name_CA ? (type.name_CA || type.name_ES) : type.name_ES) : 
                  (this.language == 'de' ? (type.name_DE ? (type.name_DE || type.name_ES) : type.name_ES) :
                    (this.language == 'it' ? (type.name_IT ? (type.name_IT || type.name_ES) : type.name_ES) : type.name_ES)
                ))
            )
        )
    ) : '';
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.searchTutors();
  }

  filteredList(event) {
    this.list?.forEach((item) => {
      if (item.city === event) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    
    this.selectedCity = event || "";
    localStorage.setItem('tutor-filter-city', this.selectedCity);
    this.searchTutors();
  }

  filteredType(category) {
    this.buttonList?.forEach((item) => {
      if (item.id === category.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedType = category?.id || "";
    this.searchTutors();
  }

  searchTutors() {
    let tutors = this.allTutors
    if (this.search) {
        this.search = this.search.toLowerCase()
        tutors = this.filterSearchKeyword(tutors);
        let fuse = new Fuse(tutors, this.searchOptions);
        let filtered_search = fuse.search(this.normalizeCase(this.search));
        tutors = []
        filtered_search?.forEach(item => {
          tutors.push(item?.item)
        })
    }

    if(this.selectedType) {
        let selected_type
        if(this.allTutorTypes?.length > 0) {
            let row = this.allTutorTypes?.filter(typ => {
                return typ.id == this.selectedType
            })
            selected_type = row?.length > 0 ? row[0] : ''
        }
        if(selected_type) {
            tutors = tutors?.filter(tutor => {
                return tutor?.types.some(a => a == selected_type.name_ES || a == selected_type.name_EN || a == selected_type.name_FR || a == selected_type.name_EU || a == selected_type.name_CA || a == selected_type.name_DE)
            })
        }
    }

    if(this.selectedCity) {
      tutors = tutors.filter(m => {
        return m?.city == this.selectedCity
      })
    }

    this.tutors = tutors;
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

  filterSearchKeyword(tutors) {
    if(tutors?.length > 0) {
      return tutors.filter(m => {
        let include = false
        let tutor_type_match = m?.types.some(a => ((a.toString().toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)

        if (
            (m.name && ((m.name).normalize("NFD").replace(/\p{Diacritic}/gu, "")).toLowerCase().indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0
            ||  searchSpecialCase(this.search,m.name)
            )
            || (m.first_name && ((m.first_name.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0
            || searchSpecialCase(this.search,m.first_name)
            )
            || (m.last_name && ((m.last_name.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0
            || searchSpecialCase(this.search,m.last_name)
            ) || tutor_type_match ||
            (m.type_values &&
              m.type_values
                .toLowerCase()
                .indexOf(this.search.toLowerCase()) >= 0)
            ) {
            include = true
        }

        return include
      })
    }
  }

  getTutorTypesText(types) {
    return types?.join(', ')
  }

  filterViewChanged(event) {
    this.defaultActiveFilter = event;
  }
}
