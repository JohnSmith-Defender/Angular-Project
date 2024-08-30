import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChange,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subject } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { LocalService } from "@share/services";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";

@Component({
  selector: "app-masonry-section3",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NgOptimizedImage
  ],
  templateUrl: "./masonry-section3.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasonrySection3Component {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() company: any;
  @Input() section3Data: any;
  @Input() clubCategories: any;
  @Input() clubCategoryMapping: any;

  languageChangeSubscription;
  language: any;
  buttonColor: any;
  club1Data: any = {}
  club2Data: any = {}
  club3Data: any = {}
  club4Data: any = {}
  featuredTextValue: any;
  featuredTextValueEn: any;
  featuredTextValueFr: any;
  featuredTextValueEu: any;
  featuredTextValueCa: any;
  featuredTextValueDe: any;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    this.buttonColor = this.company.button_color
      ? this.company.button_color
      : this.company.primary_color;
    this.featuredTextValue =
      this.company?.featured_text ||
      this._translateService.instant("courses.featured");
    this.featuredTextValueEn =
      this.company?.featured_text_en ||
      this._translateService.instant("courses.featured");
    this.featuredTextValueFr =
      this.company?.featured_text_fr ||
      this._translateService.instant("courses.featured");
    this.featuredTextValueEu =
      this.company?.featured_text_eu ||
      this._translateService.instant("courses.featured");
    this.featuredTextValueCa =
      this.company?.featured_text_ca ||
      this._translateService.instant("courses.featured");
    this.featuredTextValueDe =
      this.company?.featured_text_de ||
      this._translateService.instant("courses.featured");

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.formatData();
        }
      );

    this.formatData();
  }

  ngOnChanges(changes: SimpleChange) {
    let section3DataChange = changes["section3Data"];
    if (section3DataChange?.currentValue?.length > 0) {
      this.section3Data = section3DataChange?.currentValue;
      this.formatData();
    }
  }

  formatData() {
    if(this.section3Data?.length > 0) {
      this.club1Data = this.section3Data?.length > 0 ? this.formatClub(this.section3Data[0]) : {}
      this.club2Data = this.section3Data?.length > 1 ? this.formatClub(this.section3Data[1]) : {}
      this.club3Data = this.section3Data?.length > 2 ? this.formatClub(this.section3Data[2]) : {}
      this.club4Data = this.section3Data?.length > 3 ? this.formatClub(this.section3Data[3]) : {}
    }
  }

  formatClub(club) {
    let clubs: any[] = []
    clubs.push(club)

    let dt = clubs?.map(item => {
      return {
        ...item,
        id: item?.id,
        path: `/clubs/details/${item.id}`,
        title: this.getClubTitle(item),
        category: this.getCategory(item),
        image: item.image?.indexOf('http') >= 0 ? item.image : `${environment.api}/get-image-group/${item.image}`
      }
    })

    return dt[0]
  }

  getClubTitle(club) {
    return club ? (this.language == 'en' ? (club.title_en || club.title) : (this.language == 'fr' ? (club.title_fr || club.title) : 
        (this.language == 'eu' ? (club.title_eu || club.title) : (this.language == 'ca' ? (club.title_ca || club.title) : 
        (this.language == 'de' ? (club.title_de || club.title) : club.title)
      ))
    )) : ''
  }

  getFeaturedTitle() {
    return this.language == "en"
      ? this.featuredTextValueEn
        ? this.featuredTextValueEn || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "fr"
      ? this.featuredTextValueFr
        ? this.featuredTextValueFr || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "eu"
      ? this.featuredTextValueEu
        ? this.featuredTextValueEu || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "ca"
      ? this.featuredTextValueCa
        ? this.featuredTextValueCa || this.featuredTextValue
        : this.featuredTextValue
      : this.language == "de"
      ? this.featuredTextValueDe
        ? this.featuredTextValueDe || this.featuredTextValue
        : this.featuredTextValue
      : this.featuredTextValue;
  }

  getCategory(club) {
    let category = ''
    let club_category = this.clubCategoryMapping?.filter(cc => {
      return cc.fk_group_id == club.id
    })

    if(club_category?.length > 0) {
      let mapped = club_category?.map(cc => {
        let category = this.clubCategories?.filter(c => {
          return cc.fk_supercategory_id == c.id
        })
        let title = category?.length > 0 ? this.getCategoryTitle(category[0]) : ''
        
        return {
          ...cc,
          title,
        }
      })

      if(mapped?.length > 0) {
        category = mapped.map( (data) => { return data.title }).join(',')
      }
    }

    return category
  }

  getCategoryTitle(category) {
    return category ? (this.language == 'en' ? (category.name_EN || category.name_ES) : (this.language == 'fr' ? (category.name_fr || category.name_ES) : 
        (this.language == 'eu' ? (category.name_eu || category.name_ES) : (this.language == 'ca' ? (category.name_ca || category.name_ES) : 
        (this.language == 'de' ? (category.name_de || category.name_ES) : category.name_ES)
      ))
    )) : ''
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}