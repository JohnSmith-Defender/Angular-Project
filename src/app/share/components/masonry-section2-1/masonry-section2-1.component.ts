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
import { TutorCardComponent } from "../card/tutor/tutor.component";
import { TestimonialCardComponent } from "../card/testimonial/testimonial.component";
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";

@Component({
  selector: "app-masonry-section2-1",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NgOptimizedImage,
    TutorCardComponent,
    TestimonialCardComponent,
  ],
  templateUrl: "./masonry-section2-1.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasonrySection21Component {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() company: any;
  @Input() section21Data: any;
  @Input() tags: any;
  @Input() tagMapping: any;
  @Input() tutorTypes: any;
  @Input() user: any;

  languageChangeSubscription;
  language: any;
  buttonColor: any;
  testimonial1Data: any = {}
  testimonial2Data: any = {}
  tutor1Data: any = {}
  tutor2Data: any = {}
  tutor3Data: any = {}
  tutor4Data: any = {}
  readHover: boolean = false;
  selectedTutorId: any;
  selectedTestimonialId: any;

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
    let section21DataChange = changes["section21Data"];
    if (section21DataChange?.currentValue?.length > 0) {
      this.section21Data = section21DataChange?.currentValue;
      this.formatData();
    }

    let tagsDataChange = changes["tags"];
    if (tagsDataChange?.currentValue?.length > 0) {
      this.tags = tagsDataChange?.currentValue;
      this.formatData();
    }

    let tagMappingDataChange = changes["tagMapping"];
    if (tagMappingDataChange?.currentValue?.length > 0) {
      this.tagMapping = tagMappingDataChange?.currentValue;
      this.formatData();
    }

    let tutorTypesDataChange = changes["tutorTypes"];
    if (tutorTypesDataChange?.currentValue?.length > 0) {
      this.tutorTypes = tutorTypesDataChange?.currentValue;
      this.formatData();
    }
  }

  formatData() {
    if(this.section21Data?.length > 0) {
      this.testimonial1Data = this.section21Data?.length > 0 ? this.formatTestimonial(this.section21Data[0]) : {}
      this.testimonial2Data = this.section21Data?.length >= 1 ? this.formatTestimonial(this.section21Data[1]) : {}
      this.tutor1Data = this.section21Data?.length >= 2 ? this.formatTutor(this.section21Data[2]) : {}
      this.tutor2Data = this.section21Data?.length >= 3 ? this.formatTutor(this.section21Data[3]) : {}
      this.tutor3Data = this.section21Data?.length >= 4 ? this.formatTutor(this.section21Data[4]) : {}
      this.tutor4Data = this.section21Data?.length >= 5 ? this.formatTutor(this.section21Data[5]) : {}
    }
  }

  formatTestimonial(testimonial) {
    let testimonials: any[] = []
    testimonials.push(testimonial)

    let tags_texts = this.getTagsDisplay(testimonial);

    let dt = testimonials?.map(item => {
      return {
        ...item,
        id: item?.id,
        path: `/testimonials/details/${item.id}`,
        image: `${environment.api}/get-testimonial-image/${item.image}`,
        tags_display: tags_texts?.map((data) => { return data.tag_label }).join(', '),
        date_display: moment.utc(testimonial.created_at).locale(this.language).format('D MMMM')
      }
    })

    return dt[0]
  }

  getTagsDisplay(testimonial) {
    let list_tags: any[] = []
    if(this.tagMapping?.length > 0) {
      let testimonial_tags = this.tagMapping?.filter(tm => {
        return tm.testimonial_id == testimonial.id
      })
      if(testimonial_tags?.length > 0) {
        testimonial_tags?.forEach(t => {
          let tag = this.tags?.filter(tag => {
            return tag.id == t.tag_id
          })

          list_tags.push({
            tag_id: t.tag_id,
            tag_label: tag?.length > 0 ? this.getTagLabel(tag[0]) : ''
          })
        })
      }
    }
    return list_tags
  }

  getTagLabel(tag) {
    return tag
      ? this.language == "en"
        ? tag.tag_en ||
          tag.tag_es
        : this.language == "fr"
        ? tag.tag_fr ||
          tag.tag_es
        : this.language == "eu"
        ? tag.tag_eu ||
          tag.tag_es
        : this.language == "ca"
        ? tag.tag_ca ||
          tag.tag_es
        : this.language == "de"
        ? tag.tag_de ||
          tag.tag_es
        : tag.tag_es
      : "";
  }

  formatTutor(tutor) {
    let tutors: any[] = []
    tutors.push(tutor)

    let dt = tutors?.map(item => {
      return {
        ...item,
        id: item?.id,
        path:  `/tutors/details/${item?.id}`,
        image: `${environment.api}/${item?.image}`,
        rating: this.getTutorRating(item),
        types: this.getTutorTypes(item)
      }
    })

    return dt[0]
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
      rating = (tut_rating/no_of_rating).toFixed(1);
    }

    return rating
  }

  getTutorTypes(item) {
    let types:any = []
    if(this.tutorTypes?.length > 0){
        types = []
        this.tutorTypes?.forEach(tt => {
            let typeTutor = tt.tutorTypes.name_ES
            if(tt.tutor_id == item?.id && !(types).includes(typeTutor)){
                (types)?.push(typeTutor)
            }
        })
    }

    if(this.tutorTypes?.length > 0){
        this.tutorTypes.forEach(tt => {
            let typeTutor = tt.name_ES
            item?.tutor_type_tags?.forEach(ttt => {
                if(ttt.type_id == tt.id && !(types)?.includes(typeTutor)){
                    (types)?.push(typeTutor)
                }
            })
        })
    }

    return types
  }

  toggleReadHover(event, testimonial) {
    this.readHover = event;
    this.selectedTestimonialId = event ? testimonial.id : ''
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}