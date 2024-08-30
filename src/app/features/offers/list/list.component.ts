import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonGroupComponent, FilterComponent, PageTitleComponent } from '@share/components';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { SearchComponent } from "@share/components/search/search.component";
import { NgxPaginationModule } from "ngx-pagination";
import { CompanyService, LocalService } from '@share/services';
import { environment } from '@env/environment';
import { MemberCardComponent } from '@share/components/card/member/member.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { OffersService } from '@features/services/offers/offers.service';
import { OfferCardComponent } from '@share/components/card/offer/offer.component';
import get from 'lodash/get';

@Component({
  selector: 'app-offers-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgOptimizedImage,
    PageTitleComponent,
    SearchComponent,
    MemberCardComponent,
    FilterComponent,
    OfferCardComponent,
    ButtonGroupComponent,
  ],
  templateUrl: './list.component.html'
})
export class OffersListComponent {
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
  offersFeature: any;
  featureId: any;
  canViewOffer: boolean = false;
  canCreateOffer: boolean = false;
  canManageOffer: boolean = false;
  createHover: boolean = false;
  searchText: any;
  placeholderText: any;
  search: any;
  p: any;
  offers: any = [];
  allOffers: any = [];
  apiPath: string = environment.api + '/';
  sendReferenceForm: any;
  sendReferenceFormSubmitted: boolean = false;
  processingSendReference: boolean = false;
  member: any;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
  dialogMode: string = "";
  dialogTitle: any;
  cities: any;
  list: any = [];
  sectors: any;
  buttonList: any = [];
  selectedCity: any;
  selectedSector: any;
  categoryFilterActive: boolean = false;
  filterTypeControl: any = '';
  discountCategories: any = [];
  discountTypes: any = [];
  selectedCategory: any = '';
  defaultActiveFilter: boolean = false;
  filterSettings: any = [];
  showFilters: boolean = false;

  constructor(
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _offersService: OffersService,
    private _snackBar: MatSnackBar
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
    this.fetchOffers();
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  fetchOffers() {
    this._offersService
      .fetchOffers(this.companyId, this.userId, 'active')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data?.settings?.subfeatures );
          this.mapUserPermissions(data?.user_permissions);
          this.initializeFilterSettings(data?.module_filter_settings);
          this.discountCategories = data?.discount_categories;
          this.discountTypes = data?.discount_types;
          this.filterTypeControl = data?.filter_settings?.filter_type || 'dropdown';
          this.initializeButtonGroup();
          this.allOffers = data?.offers;
          this.formatOffers(data?.offers);
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

  mapFeatures(features) {
    this.offersFeature = features?.find((f) => f.feature_id == 4);
    this.featureId = this.offersFeature?.id;
    this.pageName = this.getFeatureTitle(this.offersFeature);
    this.pageDescription = this.getFeatureDescription(this.offersFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.categoryFilterActive = subfeatures.some(
        (a) => a.name_en == "Filter" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canViewOffer = user_permissions?.member_type_permissions?.find(
      (f) => f.view == 1 && f.feature_id == 4
    )
      ? true
      : false;
    this.canCreateOffer =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 4);
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
    let categories = this.companyId == 12 ? this.discountTypes : this.discountCategories;
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
        fk_company_id: this.companyId,
        fk_supercategory_id: category.id,
        name_CA: category.name_EN,
        name_DE: category.name_DE,
        name_EN: category.name_EN,
        name_ES: category.name_ES,
        name_EU: category.name_EU,
        name_FR: category.name_FR,
        sequence: category.sequence,
        status: 1,
      });
    });
  }

  formatOffers(offers) {
    offers = offers?.map((item) => {
      return {
        ...item,
        id: item?.id,
        path: `/discounts/details/${item.id}`,
        image: `${environment.api}/get-ie-image-disc/${item.image}`,
        name: this.getOfferTitle(item),
      };
    });

    this.offers = offers;
    if(this.offers?.length > 0) {
      this.offers = this.offers?.sort((a, b) => {
        const oldDate: any = new Date(a.created);
        const newDate: any = new Date(b.created);

        return  newDate - oldDate;
      });
    }
  }

  getOfferTitle(offer) {
    return offer ? (this.language == 'en' ? (offer.title_en || offer.title) : (this.language == 'fr' ? (offer.title_fr || offer.title) : 
        (this.language == 'eu' ? (offer.title_eu || offer.title) : (this.language == 'ca' ? (offer.title_ca || offer.title) : 
        (this.language == 'de' ? (offer.title_de || offer.title) : offer.title)
      ))
    )) : ''
  }

  getCategoryTitle(category) {
    return this.language == "en"
      ? category.name_EN
      : this.language == "fr"
      ? category.name_FR
      : this.language == "eu"
      ? category.name_EU ||
        category.name_ES
      : this.language == "ca"
      ? category.name_CA ||
        category.name_ES
      : this.language == "de"
      ? category.name_DE ||
        category.name_ES
      : category.name_ES;
  }

  handleSearchChanged(event) {
    this.search = event || "";
    this.filterOffers();
  }

  filterOffers() {
    let offers = this.allOffers
    if (this.search) {
      offers = offers.filter(offer => {
        let include = false;

        if (
          (offer?.title && ((offer?.title).normalize("NFD").replace(/\p{Diacritic}/gu, "")).toLowerCase().indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.title_EN && ((offer?.title_EN.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.title_FR && ((offer?.title_FR.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.title_EU && ((offer?.title_EU.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.title_CA && ((offer?.title_CA.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.title_DE && ((offer?.title_DE.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.description && ((offer?.description.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.description_EN && ((offer?.description_EN.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.description_FR && ((offer?.description_FR.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.description_EU && ((offer?.description_EU.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.description_CA && ((offer?.description_CA.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.description_DE && ((offer?.description_DE.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          || (offer?.discountCode && ((offer?.discountCode.toLowerCase()).normalize("NFD").replace(/\p{Diacritic}/gu, "")).indexOf(this.search.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >= 0)
          ) {
          include = true
        }

        return include;
      })
    }

    if(this.selectedCategory?.id != 'All') {
      if(this.companyId == 12) {
        offers = offers?.filter(off => {
          return off?.discount_type_id == this.selectedCategory?.id
        })
      } else {
        offers = offers?.filter(off => {
          return off?.fk_supercategory_id == this.selectedCategory?.id
        })
      }
    }

    this.formatOffers(offers);
  }

  handleCreateRoute() {
    this._router.navigate([`/discounts/create/0`]);
  }

  toggleCreateHover(event) {
    this.createHover = event;
  }

  filteredCategory(category) {
    this.buttonList?.forEach((item) => {
      if (item.id === category.id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedCategory = category;
    this.filterOffers();
  }

  filterViewChanged(event) {
    this.defaultActiveFilter = event;
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
