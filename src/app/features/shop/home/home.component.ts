import { CommonModule, Location } from "@angular/common";
import { Component, HostListener, Input } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { ActivatedRoute, Router } from "@angular/router";
import { SearchComponent } from "@share/components/search/search.component";
import { PageTitleComponent } from "@share/components";
import { ShopService } from "@features/services/shop/shop.service";
import { ProductCardComponent } from "@share/components/card/product/product.component";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { RitualeCardComponent } from "@share/components/astro-ideal/rituale-card/rituale-card.component";
import { BreadcrumbComponent } from "@share/components";
import { ElementRef, ViewChild } from '@angular/core';
import { CarouselComponent } from "@share/components/astro-ideal/carousel/carousel.component";

import get from "lodash/get";

@Component({
  selector: "app-shop-home",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SearchComponent,
    PageTitleComponent,
    ProductCardComponent,
    RitualeCardComponent,
    BreadcrumbComponent,
    CarouselComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class ShopHomeComponent {
  @ViewChild('elementRef', { static: false }) elementRef!: ElementRef;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";

  magic_flag: number = 0;

  index = 0;
  items = [{ title: 'Slide 1' }, { title: 'Slide 2' }, { title: 'Slide 3' }];

  jumpToSlide(number) {
    this.index = number;
  }



  initializeBreadcrumb() {
    this.level1Title = "Home";
    this.level2Title ="Cursors";
    this.level3Title = "";
    this.level4Title = "";
  }

  getRandomColorAndFont(type = true) {
    let colors1 = ["#725CAF", "#654DA8", "#543E91"];
    let colors2 = ["#A77FE0", "#9A6BDC", "#A77FE0"];
    let base_font = type ? 15 : 12;
    let array = type ? colors1 : colors2;
    let randomIndex = Math.floor(Math.random() * array.length);
    let font = base_font + Math.random() * 5;
    return {color: array[randomIndex], font};
  }

  magic() {
    if (this.elementRef.nativeElement.children.length == 0 || this.magic_flag)
      return ;

    this.magic_flag = 1;
    let length = this.subcategories.length - 1;
		let start_x = 350, start_y = 250;
    this.subcategories.forEach((item, index) => {
      if (index > 14) return;
      const itemElement: HTMLElement = this.elementRef.nativeElement.children[index];
      let dimension = (index > 6) ? 1 : 0;
      if (index > 0) {
        index -= 1;
        let data = this.getRandomColorAndFont(dimension ? true : false);

        let angle_unit = 360 / (dimension ? 8 : 6);
        if (index * angle_unit % 180 < 30 && dimension) {
          itemElement.style.fontSize = "0px";
          return ;
        }
        let angle = index * angle_unit + Math.floor(Math.random() * 10);
        let radians = angle * (Math.PI / 180);
        let radius_x = 200, radius_y = 80;
        if (dimension) radius_x = 300, radius_y = 200;
        let x = radius_x * Math.cos(radians);
        let y = radius_y * Math.sin(radians);
        x = start_x + x;
        y = start_y + y;

        itemElement.style.backgroundColor = data.color;
        itemElement.style.fontSize = data.font + "px";

        
        const itemWidth = itemElement.offsetWidth;
        const itemHeight = itemElement.offsetHeight;

        x -= itemWidth / 2;
        y -= itemHeight / 2;

        itemElement.style.transform = `${"translate(" + x +"px, " + y +"px)"}`;
      } else {
        itemElement.style.backgroundColor = "#A77FE0";
        itemElement.style.fontSize = "29px";
          
        const itemWidth = itemElement.offsetWidth;
        const itemHeight = itemElement.offsetHeight;

        let x = start_x, y = start_y;
        x -= itemWidth / 2;
        y -= itemHeight / 2;
        
        itemElement.style.transform = `${"translate(" + x + "px, " + y + "px)"}`;
      }
    });
  }

  ngAfterViewChecked() {
    if (this.subcategories.length > 0) {
      this.magic();
    }
  }

  private destroy$ = new Subject<void>();

  @Input() parentComponent: any;
  @Input() limit: any;

  pcategories: any[] = [];
  subcategories: any[] = [];
  products: any[] = [];
  featured_products: any[] = [];

  arrowRightIcon = faArrowRight;

  languageChangeSubscription;
  searchText: any;
  placeholderText: any;
  language: any;
  apiPath: string = environment.api;
  user: any;
  email: any;
  userId: any = 0
  userEmailDomain: any
  companyId: any = 0
  companies: any
  primaryColor: any
  buttonColor: any
  isMobile: boolean = false
  categories: any = []

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _shopService: ShopService,
    private _location: Location,
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || 'es');
    this.user = this._localService.getLocalStorage(environment.lsuser);
    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.userEmailDomain = this._localService.getLocalStorage(environment.lsdomain);
    this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies)) : '';
    if (!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
      this.userEmailDomain = company[0].domain;
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color;
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
    this.initializeBreadcrumb();

    this.fetchShopCategories();

    this._companyService
      .getCompanyProfessionalCategories(this.companyId)
      .subscribe(
        (response) => {
          this.pcategories = response.categories.map((item) => ({
            id: item.id,
            en_title: item.category_en,
            es_title: item.category_es,
            ca_title: item.category_ca,
            fr_title: item.category_fr,
            eu_title: item.category_eu,
            de_title: item.category_de,
            it_title: item.category_it,
          }));
        },
        (error) => {
          console.log(error);
        }
      );

    this._companyService
      .getCompanyProfessionalSubCategories(this.companyId)
      .subscribe(
        (response) => {
          this.subcategories = response.subcategories.map((item) => ({
            id: item.id,
            en_title: item.subcategory_en,
            es_title: item.subcategory_es,
            ca_title: item.subcategory_ca,
            fr_title: item.subcategory_fr,
            eu_title: item.subcategory_eu,
            de_title: item.subcategory_de,
            it_title: item.subcategory_it,
          }));
          this.magic();
        },
        (error) => {
          console.log(error);
        }
      );

      this._companyService
        .getCompanyProducts(this.companyId)
        .subscribe(
          (response) => {
            this.products = response.products.map((item) => ({
              id: item.id,
              en_title: item.name_en,
              es_title: item.name_es,
              ca_title: item.name_ca,
              fr_title: item.name_fr,
              eu_title: item.name_eu,
              de_title: item.name_de,
              it_title: item.name_it,
              en_description: item.description_en,
              es_description: item.description_es,
              ca_description: item.description_ca,
              fr_description: item.description_fr,
              eu_description: item.description_eu,
              de_description: item.description_de,
              it_description: item.description_it,
              image: `${environment.api}/v2/image/product/${item.image}`,
              currency: item.currency,
              amount: item.amount,
              featured: item.featured,
            }));
            this.featured_products = this.products.filter((item) => {
              return item.featured;
            });
          },
          (error) => {
            console.log(error);
          }
        );
  }

  titleTranslator(item: any): string {
    switch (this.language) {
      case "en":
        return item.en_title;
      case "es":
        return item.es_title;
      case "fr":
        return item.fr_title;
      case "eu":
        return item.eu_title;
      case "ca":
        return item.ca_title;
      case "de":
        return item.de_title;
      case "it":
        return item.it_title;
      default:
        return "dummy";
    }
  }

  descriptionTranslator(item: any): string {
    switch (this.language) {
      case "en":
        return item.en_description;
      case "es":
        return item.es_description;
      case "fr":
        return item.fr_description;
      case "eu":
        return item.eu_description;
      case "ca":
        return item.ca_description;
      case "de":
        return item.de_description;
      case "it":
        return item.it_description;
      default:
        return "dummy";
    }
  }

  fetchShopCategories() {
    this._shopService
      .fetchShopCategories(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.formatCategories(data?.categories, data?.shop_products);
        },
        (error) => {
          console.log(error);
        }
    );
  }

  formatCategories(categories, products) {
    let data;
    if (categories?.length > 0) {
      data = categories?.map((item) => {
        return {
          ...item,
          name: this.getCategoryName(item),
          description: this.getCategoryDescription(item),
          no_items: this.getCategoryItems(item, products)?.length || 0,
          label: item?.type == 'services' ? this._translateService.instant('news.services')?.toLowerCase() : this._translateService.instant('shop.products')?.toLowerCase(),
          image: `${this.apiPath}/get-ie-image-plan/${item.image}`
        };
      });
    }

    this.categories = data;
  }

  getCategoryName(category) {
    return this.language == "en"
      ? category.name_en
        ? category.name_en || category.name_es
        : category.name_es
      : this.language == "fr"
      ? category.name_fr
        ? category.name_fr || category.name_es
        : category.name_es
      : this.language == "eu"
      ? category.name_eu
        ? category.name_eu || category.name_es
        : category.name_es
      : this.language == "ca"
      ? category.name_ca
        ? category.name_ca || category.name_es
        : category.name_es
      : this.language == "de"
      ? category.name_de
        ? category.name_de || category.name_es
        : category.name_es
      : this.language == "it"
      ? category.name_it
        ? category.name_it || category.name_es
        : category.name_es
      : category.name_es;
  }

  getCategoryDescription(category) {
    return this.language == "en"
      ? category.description_en
        ? category.description_en || category.description_es
        : category.description_es
      : this.language == "fr"
      ? category.description_fr
        ? category.description_fr || category.description_es
        : category.description_es
      : this.language == "eu"
      ? category.description_eu
        ? category.description_eu || category.description_es
        : category.description_es
      : this.language == "ca"
      ? category.description_ca
        ? category.description_ca || category.description_es
        : category.description_es
      : this.language == "de"
      ? category.description_de
        ? category.description_de || category.description_es
        : category.description_es
      : this.language == "it"
      ? category.description_it
        ? category.description_it || category.description_es
        : category.description_es
      : category.description_es;
  }

  getCategoryItems(category, products) {
    return products?.filter(product => {
      return product?.category_id == category.id
    })
  }

  goToCategoryPage(category) {
    this._router.navigate([`/shop/list/${category.id}`]);
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleGoBack() {
    this._location.back();
  }
}