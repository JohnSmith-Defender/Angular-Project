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
import { COURSE_IMAGE_URL } from "@lib/api-constants";
import { CourseCardComponent } from "../card/course/course.component";
import { TutorCardComponent } from "../card/tutor/tutor.component";
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";

@Component({
  selector: "app-masonry-section1-1",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NgOptimizedImage,
    CourseCardComponent,
    TutorCardComponent,
  ],
  templateUrl: "./masonry-section1-1.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasonrySection11Component {
  private destroy$ = new Subject<void>();

  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() company: any;
  @Input() coursesData: any;
  @Input() tutorsData: any;
  @Input() tutorTypes: any;
  @Input() coursesProgress: any;
  @Input() user: any;
  languageChangeSubscription;
  language: any;
  buttonColor: any;
  course1Data: any = {}
  course2Data: any = {}
  course3Data: any = {}
  course4Data: any = {}
  course5Data: any = {}
  course6Data: any = {}
  tutor1Data: any = {}
  tutor2Data: any = {}
  tutor3Data: any = {}
  tutor4Data: any = {}
  tutor5Data: any = {}
  tutor6Data: any = {}
  tutor7Data: any = {}
  tutor8Data: any = {}
  hasCategoryAccess: boolean = false;

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
    let coursesDataChange = changes["coursesData"];
    if (coursesDataChange?.currentValue?.length > 0) {
      this.coursesData = coursesDataChange?.currentValue;
      this.formatData();
    }

    let tutorsDataChange = changes["tutorsData"];
    if (tutorsDataChange?.currentValue?.length > 0) {
      this.tutorsData = tutorsDataChange?.currentValue;
      this.formatData();
    }

    let tutorTypesDataChange = changes["tutorTypes"];
    if (tutorTypesDataChange?.currentValue?.length > 0) {
      this.tutorTypes = tutorTypesDataChange?.currentValue;
      this.formatData();
    }

    let coursesProgressDataChange = changes["coursesProgress"];
    if (coursesProgressDataChange?.currentValue?.length > 0) {
      this.coursesProgress = coursesProgressDataChange?.currentValue;
      this.formatData();
    }

    let superAdminDataChange = changes["superAdmin"];
    if (superAdminDataChange?.currentValue) {
      this.superAdmin = superAdminDataChange?.currentValue;
      this.formatData();
    }
  }

  formatData() {
    if(this.coursesData?.length > 0) {
      this.course1Data = this.coursesData?.length > 0 ? this.formatCourse(this.coursesData[0]) : {}
      this.course2Data = this.coursesData?.length >= 2 ? this.formatCourse(this.coursesData[1]) : {}
      if(this.coursesData?.length >= 6) {
        this.course3Data = this.coursesData?.length >= 3 ? this.formatCourse(this.coursesData[2]) : {}
        this.course4Data = this.coursesData?.length >= 4 ? this.formatCourse(this.coursesData[3]) : {}
        this.course5Data = this.coursesData?.length >= 5 ? this.formatCourse(this.coursesData[4]) : {}
        this.course6Data = this.coursesData?.length >= 6 ? this.formatCourse(this.coursesData[5]) : {}
      } else {
        if(this.coursesData?.length >= 3 && this.tutorsData?.length == 0) {
          this.course3Data = this.coursesData?.length >= 3 ? this.formatCourse(this.coursesData[2]) : {}
        }
      }
    }

    if(this.tutorsData?.length > 0 && (this.coursesData?.length <= 2 || this.coursesData?.length < 6)) {
      this.tutor1Data = this.tutorsData?.length > 0 ? this.formatTutor(this.tutorsData[0]) : {}
      this.tutor2Data = this.tutorsData?.length >= 2 ? this.formatTutor(this.tutorsData[1]) : {}
      this.tutor3Data = this.tutorsData?.length >= 3 ? this.formatTutor(this.tutorsData[2]) : {}
      this.tutor4Data = this.tutorsData?.length >= 4 ? this.formatTutor(this.tutorsData[3]) : {}

      if(this.coursesData?.length == 1) {
        this.tutor5Data = this.tutorsData?.length >= 5 ? this.formatTutor(this.tutorsData[4]) : {}
        this.tutor6Data = this.tutorsData?.length >= 6 ? this.formatTutor(this.tutorsData[5]) : {}
        this.tutor7Data = this.tutorsData?.length >= 7 ? this.formatTutor(this.tutorsData[6]) : {}
        this.tutor8Data = this.tutorsData?.length >= 8 ? this.formatTutor(this.tutorsData[7]) : {}
      }
    }
  }

  formatCourse(course) {
    let courses: any[] = []
    courses.push(course);

    let progress = this.getUserProgress(course);
    let category_texts = this.getCategoriesDisplay(course);
    let button_text = this.getButtonText(course, progress);
    let show_details = true
    if(button_text == `${this._translateService.instant("courses.begin")} ${this._translateService.instant("invite.here")}` ||
      button_text == this._translateService.instant("courses.continue")) {
    } else {
      show_details = false
    }
    let buy_now_shown = false
    if(button_text == this._translateService.instant("courses.buynow")) {
      buy_now_shown = true
    }
    let dt = courses?.map(item => {
      return {
        ...item,
        id: item?.id,
        path: `/courses/details/${item.id}`,
        title: this.getCourseTitle(item),
        image: `${COURSE_IMAGE_URL}/${item.image}`,
        category: category_texts?.map((data) => { return data.label }).join(', '),
        progress: progress,
        button_text,
        show_details,
        assigned_button_color: show_details ? course?.button_color : (buy_now_shown ? course?.buy_now_button_color : ''),
      }
    })

    return dt[0]
  }

  getUserProgress(course) {
    let progress = 0;
    let user_course = this.coursesProgress?.find(
      (cp) => cp?.user_id == this.userId && cp?.course_id == course?.id
    );
    if (user_course) {
      progress = user_course?.progress;
    }
    return progress;
  }

  getButtonText(course, progress: number = 0) {
    let text = "";

    if (
      (((course?.locked == 1 && this.hasCourseStarted(course)) ||
        (course?.buy_now_status == 0 && this.hasCourseStarted(course)) ||
        (!this.hasCourseStarted(course) && course?.show_buy_now)) &&
        course?.show_buy_now &&
        course?.cta_status != 1) ||
      course.unassigned_status == 1
    ) {
      text = this._translateService.instant("courses.blocked");
    }

    if (
      (!course?.locked || course?.locked != 1) &&
      this.hasCourseStarted(course) &&
      course?.show_buy_now &&
      course?.buy_now_status == 1
    ) {
      text =
        course.buy_now_status == 1 &&
        (this.hasCategoryAccess
          ? this.userId
            ? this._translateService.instant("courses.buynow")
            : this._translateService.instant("courses.logintoaccess")
          : this._translateService.instant("courses.buynow"));
    }

    if (
      ((!course?.locked || course?.locked != 1) &&
        !this.hasCourseStarted(course) &&
        !course?.show_buy_now) ||
      (course.exception_access == 1 && !this.hasCourseStarted(course))
    ) {
      text = `${this._translateService.instant("courses.startson")} ${moment(
        course.date
      )
        .locale(this.language)
        .format("D MMM")}`;
    }

    if (
      course?.cta_status == 1 &&
      !(
        (!course?.locked || course?.locked != 1) &&
        this.hasCourseStarted(course) &&
        !course?.show_buy_now
      ) &&
      !(
        (!course?.locked || course?.locked != 1) &&
        !this.hasCourseStarted(course) &&
        !course?.show_buy_now
      )
    ) {
      text = course.cta_text;
    }

    if (
      ((!course?.locked || course?.locked != 1) &&
        this.hasCourseStarted(course) &&
        !course?.show_buy_now) ||
      ((course.exception_access == 1 || this.superAdmin) &&
        this.hasCourseStarted(course))
    ) {
      text = this.userId
        ? progress == 0
          ? `${this._translateService.instant(
              "courses.begin"
            )} ${this._translateService.instant("invite.here")}`
          : this._translateService.instant("courses.continue")
        : this._translateService.instant("courses.logintoaccess");
    }

    return text;
  }

  hasCourseStarted(course) {
    let show = true;
    let start_date = course.date;
    let today = moment().format("YYYY-MM-DD");

    if (start_date) {
      start_date = moment(course.date).format("YYYY-MM-DD");
      if (moment(today).isBefore(course.date)) {
        show = false;
      }
    }

    return show;
  }

  getCategoriesDisplay(course) {
    let list_categories: any[] = []
    if(course?.course_categories?.length > 0) {
      course?.course_categories?.forEach(category => {
        list_categories.push({
          label: this.getCategoryLabel(category)
        })
      })
    }
    return list_categories
  }

  getCategoryLabel(category) {
    return category
      ? this.language == "en"
        ? category.name_EN ||
          category.name_ES
        : this.language == "fr"
        ? category.name_FR ||
          category.name_ES
        : this.language == "eu"
        ? category.name_EU ||
          category.name_ES
        : this.language == "ca"
        ? category.name_CA ||
          category.name_ES
        : this.language == "de"
        ? category.name_DE ||
          category.name_ES
        : category.name_ES
      : "";
  }

  getCourseTitle(course) {
    return this.language == "en"
      ? course.title_en
        ? course.title_en || course.title
        : course.title
      : this.language == "fr"
      ? course.title_fr
        ? course.title_fr || course.title
        : course.title
      : this.language == "eu"
      ? course.title_eu
        ? course.title_eu || course.title
        : course.title
      : this.language == "ca"
      ? course.title_ca
        ? course.title_ca || course.title
        : course.title
      : this.language == "de"
      ? course.title_de
        ? course.title_de || course.title
        : course.title
      : course.title;
  }

  formatTutor(tutor) {
    let tutors: any[] = []
    tutors.push(tutor)

    let dt = tutors?.map(item => {
      return {
        ...item,
        id: item?.id,
        path: `/tutors/details/${item?.id}`,
        image: `${environment.api}/${item.image}`,
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
        this.tutorTypes.forEach(tt => {
            let typeTutor = tt.tutorTypes.name_ES
            if(tt.tutor_id == item.id && !(types).includes(typeTutor)){
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

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}