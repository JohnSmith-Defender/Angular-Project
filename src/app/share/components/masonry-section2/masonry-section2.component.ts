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
  selector: "app-masonry-section2",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NgOptimizedImage,
  ],
  templateUrl: "./masonry-section2.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasonrySection2Component {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() company: any;
  @Input() section2Data: any;
  @Input() cityGuideLikes: any;
  @Input() jobTypes: any;
  @Input() jobAreas: any;
  @Input() jobOfferAreas: any;

  languageChangeSubscription;
  language: any;
  buttonColor: any;
  cityGuide1Data: any = {}
  cityGuide2Data: any = {}
  jobOffer1Data: any = {}
  jobOffer2Data: any = {}
  jobOffer3Data: any = {}
  jobOffer4Data: any = {}
  featuredTextValue: any;
  featuredTextValueEn: any;
  featuredTextValueFr: any;
  featuredTextValueEu: any;
  featuredTextValueCa: any;
  featuredTextValueDe: any;
  readHover: boolean = false;
  hover: boolean = false;
  selectedOfferId: any;
  selectedGuideId: any;

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
    let section2DataChange = changes["section2Data"];
    if (section2DataChange?.currentValue?.length > 0) {
      this.section2Data = section2DataChange?.currentValue;
      this.formatData();
    }
  }

  formatData() {
    if(this.section2Data?.length > 0) {
      this.cityGuide1Data = this.section2Data?.length > 0 ? this.formatCityGuide(this.section2Data[0]) : {}
      this.cityGuide2Data = this.section2Data?.length >= 1 ? this.formatCityGuide(this.section2Data[1]) : {}
      this.jobOffer1Data = this.section2Data?.length >= 2 ? this.formatJobOffer(this.section2Data[2]) : {}
      this.jobOffer2Data = this.section2Data?.length >= 3 ? this.formatJobOffer(this.section2Data[3]) : {}
      this.jobOffer3Data = this.section2Data?.length >= 4 ? this.formatJobOffer(this.section2Data[4]) : {}
      this.jobOffer4Data = this.section2Data?.length >= 5 ? this.formatJobOffer(this.section2Data[5]) : {}
    }
  }

  formatCityGuide(city_guide) {
    let city_guides: any[] = []
    city_guides.push(city_guide)

    let dt = city_guides?.map(item => {
      let likes = this.cityGuideLikes?.filter((g) => {
        return g.object_id == item.id;
      });
      let limit_likes = likes
      if(likes?.length > 5) {
        limit_likes = likes.slice(0, 5)
      }

      return {
        ...item,
        id: item?.id,
        path: `/cityguide/details/${item.id}`,
        title: this.getCityGuideName(item),
        image: `${environment.api}/get-image/${item.image}`,
        excerpt: this.getCityGuideExcerpt(item),
        likes: this.formatLikes(limit_likes, item),
        likes_text:
          likes?.length > 0
            ? `${likes?.length}+ ${this._translateService.instant(
                "wall.likes"
              )}`
            : "",
      }
    })

    return dt[0]
  }

  formatLikes(likes, guide) {
    return likes?.map((like) => {
      return {
        ...like,
        image: `${environment.api}/${like.image}`,
      };
    });
  }

  formatJobOffer(job_offer) {
    let job_offers: any[] = []
    job_offers.push(job_offer)

    let dt = job_offers?.map(item => {
      let type_row = this.jobTypes?.filter(jt => {
        return jt.id == item?.type_id
      })

      return {
        ...item,
        id: item?.id,
        path: `/employmentchannel/details/${item?.id}`,
        title: this.getOfferTitle(item),
        type: type_row?.length > 0 ? this.getTypeTitle(type_row[0]) : '',
        area: this.getAreaDisplay(item)
      }
    })

    return dt[0]
  }

  formatPlan(plan) {
    let plans: any[] = []
    plans.push(plan)

    let dt = plans?.map(item => {
      return {
        ...item,
        id: item?.id,
        path: `/plans/details/${item.id}/${item?.plan_type_id}`,
        title: this.getPlanTitle(item),
        image: `${environment.api}${item?.path}${item.image}`,
        featured_title: this.getFeaturedTitle(),
        plan_date: this.getActivityDate(item)
      }
    })

    return dt[0]
  }

  getCityGuideName(guide) {
    return guide
      ? this.language == "en"
        ? guide.name_EN || guide.name_ES
        : this.language == "fr"
        ? guide.name_FR || guide.name_ES
        : this.language == "eu"
        ? guide.name_EU || guide.name_ES
        : this.language == "ca"
        ? guide.name_CA || guide.name_ES
        : this.language == "de"
        ? guide.name_DE || guide.name_ES
        : guide.name_ES
      : "";
  }

  getCityGuideExcerpt(guide) {
    return guide
      ? this.language == "en"
        ? guide.leadin_EN || guide.leadin_ES
        : this.language == "fr"
        ? guide.leadin_FR || guide.leadin_ES
        : this.language == "eu"
        ? guide.leadin_EU || guide.leadin_ES
        : this.language == "ca"
        ? guide.leadin_CA || guide.leadin_ES
        : this.language == "de"
        ? guide.leadin_DE || guide.leadin_ES
        : guide.leadin_ES
      : "";
  }

  getOfferTitle(offer) {
    return offer ? this.language == 'en' ? (offer.title_en || offer.title) : (this.language == 'fr' ? (offer.title_fr || offer.title) :
      (this.language == 'eu' ? (offer.title_eu || offer.title) : (this.language == 'ca' ? (offer.title_ca || offer.title) :
        (this.language == 'de' ? (offer.title_de || offer.title) : offer.title)
      ))
    ) : ''
  }

  getAreaDisplay(offer) {
    let area_display = ''

    let job_areas = this.jobAreas?.filter(ja => {
      return this.jobOfferAreas?.some((a) => a.job_offer_id === offer?.id && a.area_id == ja.id);
    })

    area_display = job_areas?.length > 1 ? job_areas?.map( (data) => { return data.title }).join(', ') : (job_areas?.length == 1 ? job_areas[0].title : '')

    return area_display
  }

  getTypeTitle(type) {
    return this.language == 'en' ? (type.title_en || type.title) : (this.language == 'fr' ? (type.title_fr || type.title) :
      (this.language == 'eu' ? (type.title_eu || type.title) : (this.language == 'ca' ? (type.title_ca || type.title) :
        (this.language == 'de' ? (type.title_de || type.title) : type.title)
      ))
    )
  }

  getPlanTitle(event) {
    return this.language == "en"
      ? event.title_en
        ? event.title_en || event.title
        : event.title
      : this.language == "fr"
      ? event.title_fr
        ? event.title_fr || event.title
        : event.title
      : this.language == "eu"
      ? event.title_eu
        ? event.title_eu || event.title
        : event.title
      : this.language == "ca"
      ? event.title_ca
        ? event.title_ca || event.title
        : event.title
      : this.language == "de"
      ? event.title_de
        ? event.title_de || event.title
        : event.title
      : event.title;
  }

  getActivityDate(activity) {
    let date = moment
      .utc(activity.plan_date)
      .locale(this.language)
      .format("D MMMM");
    if (activity.limit_date) {
      let start_month = moment
        .utc(activity.plan_date)
        .locale(this.language)
        .format("M");
      let end_month = moment
        .utc(activity.limit_date)
        .locale(this.language)
        .format("M");
      let activity_start_date = moment
        .utc(activity.plan_date)
        .locale(this.language)
        .format("YYYY-MM-DD");
      let activity_end_date = moment
        .utc(activity.limit_date)
        .locale(this.language)
        .format("YYYY-MM-DD");

      if (activity_start_date == activity_end_date) {
        date = `${moment
          .utc(activity.limit_date)
          .locale(this.language)
          .format("D MMMM")}`;
      } else {
        if (start_month == end_month) {
          date = `${moment
            .utc(activity.plan_date)
            .locale(this.language)
            .format("D")}-${moment(activity.limit_date)
            .locale(this.language)
            .format("D MMMM")}`;
        } else {
          date = `${moment
            .utc(activity.plan_date)
            .locale(this.language)
            .format("D MMMM")}-${moment(activity.limit_date)
            .locale(this.language)
            .format("D MMMM")}`;
        }
      }
    }
    return date;
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

  toggleReadHover(event, guide) {
    this.readHover = event;
    this.selectedGuideId = event ? guide.id : ''
  }

  toggleHover(state, offer) {
    this.hover = state
    this.selectedOfferId = state ? offer.id : ''
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}