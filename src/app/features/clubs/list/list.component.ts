import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, HostListener, Input } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ClubsService } from "@features/services";
import { SearchComponent } from "@share/components/search/search.component";
import { ButtonGroupComponent, FilterComponent, IconFilterComponent, PageTitleComponent } from "@share/components";
import { ClubCardComponent } from "@share/components/card/club/club.component";
import { NgxPaginationModule } from "ngx-pagination";
import get from "lodash/get";

@Component({
  selector: "app-clubs-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SearchComponent,
    IconFilterComponent,
    PageTitleComponent,
    FilterComponent,
    ButtonGroupComponent,
    NgOptimizedImage,
    RouterModule,
    NgxPaginationModule,
    ClubCardComponent,
  ],
  templateUrl: "./list.component.html",
})
export class ClubsListComponent {
  private destroy$ = new Subject<void>();

  @Input() parentComponent: any;
  @Input() limit: any;
  @Input() view: any;

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
  showSectionTitleDivider: boolean = false;
  searchText: any;
  placeholderText: any;
  cities: any = [];
  clubsFeature: any;
  featureId: any;
  pageName: any;
  categoryFilterActive: boolean = false;
  hasSubgroups: boolean = false;
  searchByKeyword: boolean = false;
  hasMobileLimit: boolean = false;
  superAdmin: boolean = false;
  canViewGroup: boolean = false;
  canCreateGroup: boolean = false;
  canManageGroup: boolean = false;
  list: any;
  supercategoriesList: any = [];
  subcategories: any = [];
  buttonList: any;
  subButtonList: any = [];
  allClubs: any = [];
  groups: any = [];
  filteredGroup: any = [];
  selectedGroupFilterId: any;
  selectedGroupFilter: any;
  category_type: string = "All";
  activeGroupFilter: string = "All";
  clubCategoryMapping: any = [];
  clubSubcategoryMapping: any = [];
  subcats: any = [];
  filterType: string = "All";
  apiPath: string = environment.api;
  isMyClubsActive: boolean = false;
  myClubs: any;
  search: any;
  selectedCity: any;
  title: any;
  subtitle: any;
  pageDescription: any;
  p: any;
  createHover: boolean = false;
  myClubsHover: boolean = false;
  hover: boolean = false;
  selectedClubId: any;
  userInfo: any;
  campus: any = '';
  filterTypeControl: any = '';
  defaultActiveFilter: boolean = false;
  filterSettings: any = [];
  showFilters: boolean = false;

  currentPage: number = 1;
  pageSize: number = 8;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _clubsService: ClubsService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  // @HostListener('window:scroll', ['$event'])
  // onScroll(event: Event) {
  //   if(this.companyId == 32 && !this.isMobile) {
  //     const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  //     const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
  //     const documentHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;

  //     if (scrollPosition + windowHeight >= documentHeight) {
  //       this.onScrollDown();
  //     }
  //   }
  // }

  // onScrollDown() {
  //   if(this.companyId == 32 && !this.isMobile) {
  //     this.currentPage++;
  //     this.fetchClubs();
  //   }
  // }

  async ngOnInit() {
    this.onResize();

    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this.userInfo = this._localService.getLocalStorage(environment.lsuser);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
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
      this.showSectionTitleDivider = company[0].show_section_title_divider;
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
    this.fetchClubs();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchClubs() {
    this._clubsService
      .fetchClubs(this.companyId, this.userId, 'active', this.campus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapCities(data?.cities);
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures);

          this.initializeFilterSettings(data?.module_filter_settings);

          this.mapUserPermissions(data?.user_permissions);

          this.mapDashboard(data?.settings?.dashboard);
          this.initializeIconFilterList(this.cities);

          this.mapPageTitle();

          this.supercategoriesList = data?.club_categories;
          this.mapSubcategories(data?.club_subcategories);
          this.clubCategoryMapping = data?.club_category_mapping;
          this.clubSubcategoryMapping = data?.club_subcategory_mapping;

          this.filterTypeControl = data?.filter_settings?.filter_type || 'dropdown';

          this.initializeButtonGroup();
          this.formatClubs(data?.clubs, data?.club_members);
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
    if(filter_settings_active?.length > 0 && this.categoryFilterActive) {
      this.showFilters = true;
      this.filterSettings = filter_settings;
    }
  }

  mapCities(cities) {
    this.cities = cities;
    if(this.cities?.length > 0 && this.companyId == 32) {
      let campus = this.cities?.find((f) => f.campus?.indexOf(this.userInfo?.campus?.replace(/ /g,"_")) >= 0);
      if(campus?.city) {
        localStorage.setItem('club-filter-city', campus?.city);
      }
    }
  }

  mapPageTitle() {
    this.title = this.view == 'joined' ? this.getMyClubsTitle() : this.pageName;
    this.subtitle = this.pageDescription;
  }

  mapFeatures(features) {
    this.clubsFeature = features?.find((f) => f.feature_id == 5);
    this.featureId = this.clubsFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.clubsFeature);
    this.pageDescription = this.getFeatureDescription(this.clubsFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.categoryFilterActive = subfeatures.some(
        (a) => a.name_en == "Categories filter" && a.active == 1
      );
      this.hasSubgroups = subfeatures.some(
        (a) => a.name_en == "Subgroups" && a.active == 1
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
    this.canViewGroup = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 5
    )
      ? true
      : false;
    this.canCreateGroup =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 5);
    this.canManageGroup = user_permissions?.member_type_permissions?.find(
      (f) => f.manage == 1 && f.feature_id == 5
    )
      ? true
      : false;
  }

  mapDashboard(dashboard) {
    this.isMyClubsActive =
      dashboard?.length > 0 ? (dashboard[0].active == 1 ? true : false) : false;
    if (this.isMyClubsActive) {
      this.myClubs = dashboard[0];
    }
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

  initializeButtonGroup() {
    let categories = this.supercategoriesList;
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

    categories?.forEach((category) => {
      this.buttonList.push({
        id: category.id,
        value: category.id,
        text: this.getCategoryTitle(category),
        selected: false,
        fk_company_id: category.fk_company_id,
        fk_supercategory_id: category.id,
        name_CA: category.name_EN,
        name_DE: category.name_DE,
        name_EN: category.name_EN,
        name_ES: category.name_ES,
        name_EU: category.name_EU,
        name_FR: category.name_FR,
        sequence: category.sequence,
        status: category.status,
      });
    });
  }

  initializeSubButtonGroup(subcats) {
    this.subButtonList = [
      {
        id: "All",
        value: "All",
        text: this._translateService.instant("plans.all"),
        selected: true,
        fk_company_id: this.companyId,
        category_id: "All",
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

    subcats?.forEach((category) => {
      this.subButtonList.push({
        id: category.id,
        value: category.id,
        text: this.getSubcategoryTitle(category),
        selected: false,
        fk_company_id: category.fk_company_id,
        category_id: category.category_id,
        name_CA: category.name_EN,
        name_DE: category.name_DE,
        name_EN: category.name_EN,
        name_ES: category.name_ES,
        name_EU: category.name_EU,
        name_FR: category.name_FR,
        sequence: category.sequence,
        status: category.status,
      });
    });
  }

  initializeIconFilterList(list) {
    if(list?.length > 0) {
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
  }

  mapSubcategories(club_subcategories) {
    let subcategories = club_subcategories;
    this.subcategories = [];

    if (subcategories?.length > 0) {
      subcategories.forEach((c) => {
        let category_en = "";
        let category_es = "";
        let category_fr = "";
        let category_eu = "";
        let category_ca = "";
        let category_de = "";
        if (this.supercategoriesList) {
          let cat = this.supercategoriesList.filter((cat) => {
            return cat.id == c.category_id;
          });
          if (cat && cat[0]) {
            category_en = cat[0].name_EN;
            category_es = cat[0].name_ES;
            category_fr = cat[0].name_FR;
            category_eu = cat[0].name_EU;
            category_ca = cat[0].name_CA;
            category_de = cat[0].name_DE;
          }
        }

        let match = this.subcategories.some((a) => a.id === c.id);
        if (!match) {
          this.subcategories.push({
            id: c.id,
            category_id: c.category_id,
            category_EN: category_en,
            category_ES: category_es,
            category_FR: category_fr,
            category_EU: category_eu,
            category_CA: category_ca,
            category_DE: category_de,
            name_EN: c.name_EN,
            name_ES: c.name_ES,
            name_FR: c.name_FR,
            name_EU: c.name_EU,
            name_CA: c.name_CA,
            name_DE: c.name_DE,
            sequence: c.sequence,
          });
        }
      });
    }

    this.sortBySequence(this.supercategoriesList);
    this.sortBySequence(this.subcategories);
  }

  sortBySequence(categories) {
    let sorted_categories;
    if (categories) {
      sorted_categories = categories.sort((a, b) => {
        return a.sequence - b.sequence;
      });
    }

    return sorted_categories;
  }

  getCategoryTitle(category) {
    return this.language == "en"
      ? category.name_EN || category.name_en
      : this.language == "fr"
      ? category.name_FR || category.name_fr
      : this.language == "eu"
      ? category.name_EU ||
        category.name_eu ||
        category.name_ES ||
        category.name_es
      : this.language == "ca"
      ? category.name_CA ||
        category.name_ca ||
        category.name_ES ||
        category.name_es
      : this.language == "de"
      ? category.name_DE ||
        category.name_de ||
        category.name_ES ||
        category.name_es
      : category.name_ES || category.name_es;
  }

  getSubcategoryTitle(category) {
    return this.language == "en"
      ? category.name_EN || category.name_en
      : this.language == "fr"
      ? category.name_FR
      : this.language == "eu"
      ? category.name_EU ||
        category.name_eu ||
        category.name_ES ||
        category.name_es
      : this.language == "ca"
      ? category.name_CA ||
        category.name_ca ||
        category.name_ES ||
        category.name_es
      : this.language == "de"
      ? category.name_DE ||
        category.name_de ||
        category.name_ES ||
        category.name_es
      : category.name_ES || category.name_es;
  }

  async formatClubs(clubs, club_members) {
    if(this.view == 'joined') {
      this.groups = this.filterCreatedJoined(clubs, club_members);
    } else {
      this.groups = clubs;
    }

    let joined_groups = this.filterCreatedJoined(clubs, club_members);
    if(this.groups?.length > 0) {
      let dt = this.groups?.map(item => {
        let joined = false;
        if(joined_groups?.length > 0) {
          let joined_rows = joined_groups?.filter(jg => {
            return jg.id == item.id
          })
          if(joined_rows?.length > 0) {
            joined = true;
          }
        }
        return {
          ...item,
          title: this.getGroupTitle(item),
          category: this.getCategory(item),
          is_member: joined,
          mailto: item?.contact_email ? `mailto:${item.contact_email}` : ''
        }
      })
      this.groups = dt;
    }

    this.groups =
      this.groups?.length > this.limit && this.parentComponent
        ? this.groups?.slice(0, this.limit)
        : this.groups;
    
    
    if (parseInt(this.selectedGroupFilterId) > 0 && this.selectedGroupFilter) {
      this.filteredGroup = [];

      this.category_type = this.selectedGroupFilter;
      this.filteredGroup = clubs;
      this.activeGroupFilter = "All";

      if (this.selectedGroupFilterId !== "All") {
        this.activeGroupFilter = this.selectedGroupFilter;
        this.filteredGroup = await this.groups.filter((group) => {
          const hasCategory = this.clubCategoryMapping.filter((category) => {
            return category.id === parseInt(this.selectedGroupFilterId);
          });

          return hasCategory && hasCategory.length > 0;
        });

        if (this.subcategories && this.subcategories.length > 0) {
          this.subcats = this.subcategories.filter((sc) => {
            return sc.category_id == this.selectedGroupFilterId;
          });
          this.filterType = "All";
        }
      }

      this.filteredGroup.sort((a, b) => {
        const prevDate: any = new Date(a.created);
        const currDate: any = new Date(b.created);

        return currDate - prevDate;
      });
    } else {
      // if(this.companyId == 32) {
      //   this.filteredGroup = this.getSlicedGroups(this.groups);
      // } else {
        this.filteredGroup = this.groups;
      // }
    }

    this.filteredGroup = this.sortAlphabetically(this.filteredGroup);
    this.allClubs = this.filteredGroup;

    let selected = localStorage.getItem('club-filter-city');
    if(selected && this.list?.length > 0) {
      this.list.forEach(item => {
        if(item.city == selected) {
          item.selected = true;
          this.selectedCity = selected;
        } else {
          item.selected = false;
        }
      })
      this.searchGroups();
    }
  }

  // getSlicedGroups(group) {
  //   let clubs: any[] = [];
  //   if(!this.search && !this.isMobile && this.companyId == 32) {
  //     const prev = group
  //     if(prev?.length != group?.length && group?.length > 0) {
  //       clubs = group?.splice((this.currentPage - 1),this.pageSize);
  //       clubs = [...prev, ...this.groups];
  //     } else {
  //       clubs = group?.splice(0,this.pageSize * this.currentPage);
  //     }
  //   } else {
  //     clubs = group;
  //   }

  //   return clubs;
  // }

  getCategory(club) {
    let category = ''
    let club_category = this.clubCategoryMapping?.filter(cc => {
      return cc.fk_group_id == club.id
    })

    if(club_category?.length > 0) {
      let mapped = club_category?.map(cc => {
        let category = this.supercategoriesList?.filter(c => {
          return cc.fk_supercategory_id == c.id
        })
        let title = category?.length > 0 ? this.getCategoryTitle(category[0]) : ''
        
        return {
          ...cc,
          title,
        }
      })

      if(mapped?.length > 0) {
        category = mapped.map( (data) => { return data.title }).join(', ')
      }
    }

    return category
  }

  filterCreatedJoined(clubs, club_members) {
    let filtered_clubs = clubs

    if(filtered_clubs?.length > 0) {
      filtered_clubs = filtered_clubs?.filter(club => {
        return club.fk_user_id == this.userId || this.isJoinedMember(club, club_members)
      })
    }

    return filtered_clubs;
  }

  isJoinedMember(club, club_members) {
    let joined_clubs = club_members?.filter(p => {
      return p.user_id == this.userId && club.id == p.group_id
    })

    return joined_clubs?.length > 0 ? true : false
  }

  sortAlphabetically(array) {
    if (array?.length > 0) {
      array.sort((a, b) =>
        this.language == "en" && a.title_en
          ? a.title_en.localeCompare(b.title_en)
          : this.language == "fr" && a.title_fr
          ? a.title_fr.localeCompare(b.title_fr)
          : a.title.localeCompare(b.title)
      );
    }

    return array;
  }

  getGroupTitle(group) {
    return this.language == "en"
      ? group.title_en
        ? group.title_en || group.title_es
        : group.title
      : this.language == "fr"
      ? group.title_fr
        ? group.title_fr || group.title
        : group.title
      : this.language == "eu"
      ? group.title_eu
        ? group.title_eu || group.title
        : group.title
      : this.language == "ca"
      ? group.title_ca
        ? group.title_ca || group.title
        : group.title
      : this.language == "de"
      ? group.title_de
        ? group.title_de || group.title
        : group.title
      : group.title;
  }

  handleCreateRoute() {
    this._router.navigate([`/clubs/create/0`]);
  }

  createNewTitle(page) {
    let text = ''
    if(page?.toLowerCase().indexOf("club") >= 0) {
      text = this._translateService.instant('plans.club')
    } else {
      text = page
    }

    return `${this._translateService.instant("dashboard.new")} ${
      text
    }`;
  }

  goToDashboard() {
    this._router.navigate(["/dashboard/5"]);
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.searchGroups();
  }

  async searchGroups() {
    this.filteredGroup = [];
    this.filteredGroup = this.groups;

    let filter_category_id = 0;
    let filter_category = this.supercategoriesList.filter((cat) => {
      return (
        cat.name_EN == this.activeGroupFilter ||
        cat.name_ES == this.activeGroupFilter
      );
    });
    if (filter_category && filter_category[0]) {
      filter_category_id = filter_category[0].id;
    }

    if (this.activeGroupFilter !== "All") {
      this.filteredGroup = await this.groups.filter((group) => {
        const { Company_Supercategories } = group;
        const hasCategory = Company_Supercategories.filter((category) => {
          return (
            category.id === this.activeGroupFilter ||
            category.fk_supercategory_id == this.activeGroupFilter
          );
        });

        return hasCategory && hasCategory.length > 0;
      });

      if (this.subcategories && this.subcategories.length > 0) {
        this.subcats = this.subcategories.filter((sc) => {
          return sc.category_id == this.activeGroupFilter;
        });
        this.filterType = "All";
      }
    }

    this.filteredGroup = this.sortAlphabetically(this.filteredGroup);

    if (this.filterType != "All") {
      let category_id = 0;
      let category = this.subcats.filter((cat) => {
        return cat.name_EN == this.filterType || cat.name_ES == this.filterType;
      });
      if (category && category[0]) {
        category_id = category[0].id;
      }
      this.filteredGroup = this.filteredGroup.filter((g) => {
        let match =
          g.Company_Subcategories &&
          g.Company_Subcategories.some((a) => a.fk_category_id == category_id);
        return match;
      });
    } else {
      let cat = this.supercategoriesList.filter((c) => {
        return c.name_ES == this.activeGroupFilter;
      });
      if (cat && cat[0]) {
        this.filterSuperCategory(cat[0].id, cat[0].name_ES);
      }
    }

    if (this.search) {
      this.filteredGroup = this.filteredGroup.filter((group) => {
        let include = false;

        if (
          group.title.toLowerCase().indexOf(this.search.toLowerCase()) >= 0 ||
          (group.title_en &&
            group.title_en.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (group.title_fr &&
            group.title_fr.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (group.title_eu &&
            group.title_eu.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (group.title_ca &&
            group.title_ca.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (group.title_de &&
            group.title_de.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0)
        ) {
          include = true;
        }

        return include;
      });
    }

    if (this.selectedCity) {
      this.filteredGroup = this.filteredGroup.filter((group) => {
        return group.city == this.selectedCity;
      });
    }
  }

  filterSuperCategory = async (filter, categoryName) => {
    this.filteredGroup = [];

    this.category_type = categoryName;
    this.filteredGroup = this.groups;
    this.activeGroupFilter = "All";

    this._localService.setLocalStorage(
      environment.lsselectedGroupFilterId,
      filter
    );
    this._localService.setLocalStorage(
      environment.lsselectedGroupFilter,
      categoryName
    );

    if (filter !== "All") {
      this.activeGroupFilter = categoryName;
      this.filteredGroup = await this.groups.filter((group) => {
        const hasCategory = this.clubCategoryMapping.filter((category) => {
          return (
            category.fk_group_id == group.id &&
            (category.id === filter || category.fk_supercategory_id == filter)
          );
        });

        return hasCategory && hasCategory.length > 0;
      });

      if (this.subcategories && this.subcategories.length > 0) {
        this.subcats = this.subcategories.filter((sc) => {
          return sc.category_id == filter;
        });
        this.filterType = "All";
      }
    }

    this.filteredGroup = this.sortAlphabetically(this.filteredGroup);

    if (this.search) {
      this.filteredGroup = this.filteredGroup.filter((group) => {
        let include = false;

        if (
          group.title.toLowerCase().indexOf(this.search.toLowerCase()) >= 0 ||
          (group.title_en &&
            group.title_en.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (group.title_fr &&
            group.title_fr.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (group.title_eu &&
            group.title_eu.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (group.title_ca &&
            group.title_ca.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0) ||
          (group.title_de &&
            group.title_de.toLowerCase().indexOf(this.search.toLowerCase()) >=
              0)
        ) {
          include = true;
        }

        return include;
      });
    }

    if (this.selectedCity) {
      this.filteredGroup = this.filteredGroup.filter((group) => {
        return group.city == this.selectedCity;
      });
    }
  };

  async filterSubcategories(category) {
    if (category != "All") {
      this.filteredGroup = this.groups.filter((group) => {
        let include = false;

        if (group.Company_Subcategories) {
          group.Company_Subcategories.forEach((sub) => {
            include = this.subcats.some(
              (a) => a.category_id === sub.fk_category_id
            );
          });
        }

        return include;
      });

      this.filterType =
        this.language == "en" ? category.name_EN : category.name_ES;
      this.filteredGroup = this.filteredGroup.filter((g) => {
        let match =
          g.Company_Subcategories &&
          g.Company_Subcategories.some((a) => a.fk_category_id == category.id);
        return match;
      });
    } else {
      this.filterType = "All";
      let cat = this.supercategoriesList.filter((c) => {
        return c.name_ES == this.activeGroupFilter;
      });
      if (cat && cat[0]) {
        this.filterSuperCategory(cat[0].id, cat[0].name_ES);
      }
    }
  }

  filteredCategory(category) {
    this.buttonList?.forEach((item) => {
      if (item.id === category.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    if (category.id == "All") {
      this.subButtonList = [];
    }

    if (category) {
      this.filterSuperCategory(category.id || "All", category.name_ES);
    }
  }

  filteredSubcategory(category) {
    if (category) {
      this.filterSubcategories(
        category && category.fk_supercategory_id == "All" ? "All" : category
      );
    }
  }

  filteredCity(event) {
    this.list?.forEach((item) => {
      if (item.city === event) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    
    this.selectedCity = event || "";
    localStorage.setItem('club-filter-city', this.selectedCity);
    this.searchGroups();
  }

  getMyClubsTitle() {
    return this.myClubs ? (this.language == "en"
      ? this.myClubs.title_en
        ? this.myClubs.title_en || this.myClubs.title_es
        : this.myClubs.title_es
      : this.language == "fr"
      ? this.myClubs.title_fr
        ? this.myClubs.title_fr || this.myClubs.title_es
        : this.myClubs.title_es
      : this.language == "eu"
      ? this.myClubs.title_eu
        ? this.myClubs.title_eu || this.myClubs.title_es
        : this.myClubs.title_es
      : this.language == "ca"
      ? this.myClubs.title_ca
        ? this.myClubs.title_ca || this.myClubs.title_es
        : this.myClubs.title_es
      : this.language == "de"
      ? this.myClubs.title_de
        ? this.myClubs.title_de || this.myClubs.title_es
        : this.myClubs.title_es
      : this.myClubs.title_es) : '';
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  toggleMyClubsHover(event) {
    this.myClubsHover = event;
  }

  toggleHover(state, club) {
    this.hover = state
    this.selectedClubId = state ? club.id : ''
  }

  goToClubDetails(club) {
    this._router.navigate([`/clubs/details/${club.id}`]);
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