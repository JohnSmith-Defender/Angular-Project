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
import { CompanyService } from "@share/services";
import { environment } from "@env/environment";
import { TranslateModule } from "@ngx-translate/core";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-astroideal-home",
  standalone: true,
  templateUrl: "./astroideal-home.component.html",
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
    TranslateModule,
  ],
})
export class AstroIdealHomeComponent {
  @Input() companyId: any;
  @Input() language: any;
  @Input() buttonColor: any;

  professionals: any[] = [];
  categories: any[] = [];
  testimonial: any = {};
  services: any[] = [];
  instagram_feed: string = "";
  banner_title: any = {};

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
    this._companyService.getCompanyProfessionals(this.companyId).subscribe(
      (response) => {
        this.professionals = response.professionals.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.user.name,
          image: `${environment.api}/${item.user.image}`,
          description: item.user.who_am_i,
          rating: item.experience,
          salary: `${item.rate_currency} ${item.rate}`,
          rate: item.rate,
          rate_currency: item.rate_currency,
          chat: item.chat,
          voice_call: item.voice_call,
          video_call: item.video_call,
          specialties: item.subcategories.slice(0,3),
        }));
      },
      (error) => {
        console.log(error);
      }
    );

    this._companyService
      .getCompanyProfessionalCategories(this.companyId)
      .subscribe(
        (response) => {
          this.categories = response.categories.slice(0, 5).map((item) => ({
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
      .getCompanyProfessionalFreeServices(this.companyId)
      .subscribe(
        (response) => {
          this.services = response.services.slice(0, 4).map((item) => ({
            id: item.id,
            en_title: item.title_en,
            es_title: item.title_es,
            ca_title: item.title_ca,
            fr_title: item.title_fr,
            eu_title: item.title_eu,
            de_title: item.title_de,
            it_title: item.title_it,
            en_description: item.description_en,
            es_description: item.description_es,
            ca_description: item.description_ca,
            fr_description: item.description_fr,
            eu_description: item.description_eu,
            de_description: item.description_de,
            it_description: item.description_it,
          }));
        },
        (error) => {
          console.log(error);
        }
      );

    this._companyService.getCompanyTestimonial(this.companyId).subscribe(
      (response) => {
        this.testimonial = response.testimonial;
        const image_url = this.testimonial.image || this.testimonial.author_image;
        this.testimonial.image = `${environment.api}/${image_url}`;
      },
      (error) => {
        console.log(error);
      }
    );

    this._companyService.getCompanyInstagramFeed(this.companyId).subscribe(
      (response) => {
        this.instagram_feed = response.instagram_feed;
      },
      (error) => {
        console.log(error);
      }
    );

    this._companyService.getCompanyBannerTitle(this.companyId).subscribe(
      (response) => {
        this.banner_title = response.banner_title;
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

  handleOnClick(event) {
    this._router.navigate([`/professionals/details/${event}`])
    .then(() => {
      window.location.reload();
    });
  }
}
