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
import { PlanCardComponent } from "../card/plan/plan.component";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";

@Component({
  selector: "app-masonry-section1",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NgOptimizedImage,
    PlanCardComponent,
  ],
  templateUrl: "./masonry-section1.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasonrySection1Component {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() company: any;
  @Input() section1Data: any;

  languageChangeSubscription;
  language: any;
  buttonColor: any;
  plan1Data: any = {}
  plan2Data: any = {}
  plan3Data: any = {}
  plan4Data: any = {}
  plan5Data: any = {}
  plan6Data: any = {}
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
    let section1DataChange = changes["section1Data"];
    if (section1DataChange?.currentValue?.length > 0) {
      this.section1Data = section1DataChange?.currentValue;
      this.formatData();
    }
  }

  formatData() {
    if(this.section1Data?.length > 0) {
      this.plan1Data = this.section1Data?.length > 0 ? this.formatPlan(this.section1Data[0]) : {}
      this.plan4Data = this.section1Data?.length > 1 ? this.formatPlan(this.section1Data[1]) : {}
      this.plan2Data = this.section1Data?.length > 2 ? this.formatPlan(this.section1Data[2]) : {}
      this.plan3Data = this.section1Data?.length > 3 ? this.formatPlan(this.section1Data[3]) : {}
      this.plan5Data = this.section1Data?.length > 4 ? this.formatPlan(this.section1Data[4]) : {}
      this.plan6Data = this.section1Data?.length > 5 ? this.formatPlan(this.section1Data[5]) : {}
    }
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

  getPlanTitle(event) {
    return this.language == "en"
      ? (event.title_en && event.title_en != 'undefined')
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

  getClubTitle(club) {
    return club ? (this.language == 'en' ? (club.title_en || club.title) : (this.language == 'fr' ? (club.title_fr || club.title) : 
        (this.language == 'eu' ? (club.title_eu || club.title) : (this.language == 'ca' ? (club.title_ca || club.title) : 
        (this.language == 'de' ? (club.title_de || club.title) : club.title)
      ))
    )) : ''
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

  handleDetailsClickRoute(event) {
    console.log(event)
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}