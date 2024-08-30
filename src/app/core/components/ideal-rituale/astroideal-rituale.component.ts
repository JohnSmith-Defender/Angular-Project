import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StarRatingComponent } from "@lib/components";
import { IdealButtonComponent } from "@share/components/ideal-button/ideal-button.component";
import { TarotCardComponent } from "@share/components";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CategoryCardComponent } from "@share/components/category-card/category-card.component";
import { TarotCardPortraitComponent } from "@share/components/tarot-card-portrait/tarot-card-portrait.component";
import { TestimonialCardComponent } from "@share/components/testimonial-card/testimonial-card.component";
import { BlogCardComponent } from "@share/components/blog-card/blog-card.component";
import { RitualeCardComponent } from "@share/components/astro-ideal/rituale-card/rituale-card.component";
import { CompanyService } from "@share/services";
import { environment } from "@env/environment";
import { TranslateModule } from "@ngx-translate/core";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-astroideal-rituale",
  standalone: true,
  templateUrl: "./astroideal-rituale.component.html",
  imports: [
    CommonModule,
    RouterModule,
    StarRatingComponent,
    TarotCardComponent,
    IdealButtonComponent,
    FontAwesomeModule,
    CategoryCardComponent,
    TarotCardPortraitComponent,
    BlogCardComponent,
    TestimonialCardComponent,
    RitualeCardComponent,
    TranslateModule,
  ],
})
export class AstroIdealHomeComponent {
  @Input() companyId: any;
  @Input() language: any;
  @Input() buttonColor: any;

  subcategories: any[] = [];
  products: any[] = [];
  featured_products: any[] = [];

  arrowRightIcon = faArrowRight;

  constructor(
    private _companyService: CompanyService,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this.initializePage();
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

  async initializePage() {
    this._companyService
      .getCompanyProfessionalSubCategories(this.companyId)
      .subscribe(
        (response) => {
          this.subcategories = response.subcategories.map((item) => ({
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
              image: `${environment.api}/${item.image}`,
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

  navigateToPage(link) {
    this._router.navigate([link])
    .then(() => {
      window.location.reload();
    });
  }
}
