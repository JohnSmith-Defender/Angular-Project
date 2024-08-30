import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '@env/environment';
import { BuddyService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormsModule } from '@angular/forms';
import { FilterComponent, NoAccessComponent, PageTitleComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MentorCardComponent } from '@share/components/card/mentor/mentor.component';
import { LanguageFilterComponent } from '@share/components/language-filter/language-filter.component';
import get from 'lodash/get';

@Component({
    selector: 'app-buddy-list',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        NgOptimizedImage,
        FormsModule,
        PageTitleComponent,
        SearchComponent,
        FilterComponent,
        MentorCardComponent,
        LanguageFilterComponent,
        NoAccessComponent,
    ],
    templateUrl: './list.component.html'
})
export class BuddyListComponent {
    private destroy$ = new Subject<void>();

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
    buddyFeature: any;
    featureId: any;
    searchText: any;
    placeholderText: any;
    search: any;
    p: any;
    mentors: any = [];
    allMentors: any = [];
    list: any[] = [];
    buttonList: any;
    cities: any = [];
    selectedCity: any = '';
    defaultActiveFilter: boolean = false;
    filterActive: boolean = false;
    filterSettings: any = [];
    showFilters: boolean = false;
    filterTypeControl: any = '';
    majors: any = [];
    years: any = [];
    selectedMajor: any = '';
    currentPage: number = 1;
    pageSize: number = 8;
    languages: any = [];
    languageList: any = [];
    selectedLanguage: any = '';

    currentUser: any;
    isLoading: boolean = true;
    hasAccess: boolean = false;

    constructor(
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _buddyService: BuddyService
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(event: Event) {
        if(!this.isMobile) {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
            const documentHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;

            if (scrollPosition + windowHeight >= documentHeight) {
                this.onScrollDown();
            }
        }
    }

    onScrollDown() {
        if(!this.isMobile) {
            this.currentPage++;
            this.fetchBuddies();
        }
    }

    async ngOnInit() {
        this.onResize();
        initFlowbite();

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
        this.fetchBuddies();
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant(
          "news.searchbykeyword"
        );
    }

    fetchBuddies() {
        this._buddyService
          .fetchBuddies(this.companyId, this.userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.currentUser = data?.user;
                this.languages = this.formatLanguages(data?.languages);

                this.mapFeatures(data?.features_mapping);
                this.mapSubfeatures(data?.settings?.subfeatures);

                this.initializeFilterSettings(data?.module_filter_settings);

                this.mapUserPermissions(data?.user_permissions);

                this.cities = data?.cities;
                this.initializeIconFilterList(this.cities);

                this.allMentors = data?.mentors;
                this.mentors = this.getSlicedMentors(this.formatMentors(data?.mentors));

                this.majors = this.sortArray(this.majors);
                this.years = this.sortArray(this.years);

                this.initializeButtonGroup();
                this.filterTypeControl = 'dropdown';
                this.isLoading = false;
            },
            (error) => {
              console.log(error);
            }
        );
    }

    formatLanguages(languages) {
        let lang = languages?.map((item, index) => {
            return {
                ...item,
                selected: false,
                name: this.getLanguageName(item),
            };
        });
    
        return lang;
    }

    initializeLanguageList(list) {
        let text = this._translateService.instant("plans.all");
        if(this.filterSettings?.length > 0) {
          let language_filter = this.filterSettings?.filter(fs => {
            return fs.field == 'language'
          })
          if(language_filter?.length > 0) {
            text = language_filter[0].select_text;
          }
        }
        this.languageList = [
          {
            id: "All",
            value: "All",
            text,
            selected: true,
            company_id: this.companyId,
            name: "All",
          },
        ];
    
        list?.forEach((item) => {
          this.languageList.push({
            id: item.id,
            value: item.name,
            text: item.name,
            selected: false,
            company_id: this.companyId,
            name: item.name,
          });
        });
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

    getSlicedMentors(formattedMentors) {
        let mentors: any[] = [];
    
        if(!this.search && !this.isMobile && this.companyId == 32) {
            const prev = formattedMentors
            if(prev?.length != formattedMentors?.length && formattedMentors?.length > 0) {
                mentors = formattedMentors?.splice((this.currentPage - 1),this.pageSize);
                mentors = [...prev, ...this.mentors];
            } else {
                mentors = formattedMentors?.splice(0,this.pageSize * this.currentPage);
            }
        } else {
            mentors = formattedMentors;
        }
    
        return mentors;
    }

    mapFeatures(features) {
        this.buddyFeature = features?.find((f) => f.feature_id == 19);
        this.featureId = this.buddyFeature?.id;
        this.pageName = this.getFeatureTitle(this.buddyFeature);
        this.pageDescription = this.getFeatureDescription(this.buddyFeature);
    }

    mapSubfeatures(subfeatures) {
        if (subfeatures?.length > 0) {
            this.filterActive = subfeatures.some(
                (a) => a.name_en == "Buddies filter" && a.active == 1
            );
        }
    }

    initializeFilterSettings(filter_settings) {
        let filter_settings_active = filter_settings?.filter(fs => {
            return fs.active == 1
        })
        if(filter_settings_active?.length > 0 && this.filterActive) {
            this.showFilters = true;
            this.filterSettings = filter_settings;
            this.initializeLanguageList(this.languages);
        }
    }

    mapUserPermissions(user_permissions) {
        this.superAdmin = user_permissions?.super_admin_user ? true : false;
        if(this.superAdmin) { 
            this.hasAccess = true; 
        } else {
            if(this.currentUser?.bussines_unit &&
                !(this.currentUser?.bussines_unit?.toLowerCase()?.indexOf('online') >= 0) &&
                this.currentUser?.segment?.toLowerCase()?.indexOf('grado') >= 0) {
                this.hasAccess = true;
            }
        }
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

    formatMentors(mentors) {
        this.majors = [];
        this.years = [];

        mentors = mentors?.map((item, index) => {
            let major_match = this.majors.some(a => a.title == item.major);    
            if(!major_match) {
                this.majors.push({
                    id: index,
                    title: item.major
                })
            }

            let year_match = this.years.some(a => a.title == item.year);    
            if(!year_match) {
                this.years.push({
                    id: index,
                    title: item.year
                })
            }

            return {
                ...item,
                path: `/buddy/mentor/${item.user_id}`,
                buddy_image: `${environment.api}/${item.image}`,
                buddy_photo: item?.photo ? `data:image/png;base64,${item?.photo}` : '',
                languages: item?.language,
            };
        });
    
        return mentors;
    }

    sortArray(array) {
        return array?.sort((a, b) => {
            if (a.title < b.title) {
                return -1
            }
        
            if (a.title > b.title) {
                return 1
            }
        
            return 0
        })
    }

    initializeButtonGroup() {
        let categories = this.majors;
        let text = this._translateService.instant("plans.all");
        if(this.filterSettings?.length > 0) {
            let category_filter = this.filterSettings?.filter(fs => {
                return fs.field == 'category'
            })
            if(category_filter?.length > 0) {
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
                text: category.title,
                selected: false,
                fk_company_id: category.company_id,
                fk_supercategory_id: category.id,
                name_CA: category.title,
                name_DE: category.title,
                name_EN: category.title,
                name_ES: category.title,
                name_EU: category.title,
                name_FR: category.title,
                sequence: null,
                status: 1,
            });
        });
    }

    handleSearchChanged(event) {
        this.search = event || "";
        this.filterBuddies();
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
        this.filterBuddies();
    }
    
    filteredType(category) {
        this.buttonList?.forEach((item) => {
            if (item.id === category.id) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });
    
        this.selectedMajor = category || "";
        this.filterBuddies();
    }

    filteredLanguageList(event) {
        this.languageList?.forEach((item) => {
        if (item.name == event) {
            item.selected = true;
        } else {
            item.selected = false;
        }
        });
    
        this.selectedLanguage = event || "";
        this.filterBuddies();
    }

    filterViewChanged(event) {
        this.defaultActiveFilter = event;
    }

    filterBuddies() {
        let mentors = this.allMentors
        if(this.search) {
            mentors = mentors.filter(m => {
                let include = false
        
                if(
                (m.name && m.name.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
                || (m.introduction && m.introduction.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
                || (m.major && m.major.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
                || (m.year && m.year.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
                || (m.location && m.location.toLowerCase().indexOf(this.search.toLowerCase()) >= 0)
                ) {
                    include = true
                }
        
                return include
            })
        }
    
        if(this.selectedMajor && this.selectedMajor?.value != 'All') {
            mentors = mentors.filter(m => {
                return m.major == this.selectedMajor?.text
            })
        }
    
        if(this.selectedCity) {
            mentors = mentors.filter(m => {
                return m.location == this.selectedCity
            })
        }

        if(this.selectedLanguage && this.selectedLanguage != 'All') {
            mentors = mentors.filter(m => {
                return m.language?.indexOf(this.selectedLanguage) >= 0
            })
        }
    
        this.mentors = this.formatMentors(mentors);
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
