import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { environment } from "@env/environment";
import { CoursesService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { initFlowbite } from "flowbite";
import { COURSE_IMAGE_URL } from "@lib/api-constants";
import get from "lodash/get";

@Component({
  selector: 'app-course-intro',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    NgOptimizedImage,
  ],
  templateUrl: './intro.component.html'
})
export class CourseIntroComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  language: any;
  apiPath: string = environment.api;
  userId: any;
  companyId: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  emailDomain: any;
  languageChangeSubscription: any;
  courseData: any;
  course: any;
  courseTitle: any;
  courseDescription: any;
  courseImage: any;
  courseDurationUnitTitle: any;
  courseDifficulty: any;
  courseIntroPDFURL: any;
  courseIntroPDFURLEn: any;
  courseIntroPDFURLFr: any;
  courseIntroPDFURLEu: any;
  courseIntroPDFURLCa: any;
  courseIntroPDFURLDe: any;
  courseIntroPDFURLIt: any;

    constructor(
        private _router: Router,
        private _coursesService: CoursesService,
        private _companyService: CompanyService,
        private _translateService: TranslateService,
        private _localService: LocalService,
    ) { }

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
    this._translateService.use(this.language || "es");

    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
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
      this.companyId = company[0];
      this.emailDomain = company[0].domain;
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.hoverColor = company[0].hover_color
        ? company[0].hover_color
        : company[0].primary_color;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.fetchCourseDetails();
  }

  initializePage() {
    this.formatCourse(this.courseData?.course);
  }

  fetchCourseDetails() {
    this._coursesService
      .fetchCourseCombined(this.id, this.companyId, this.userId)
      .subscribe(
        (data) => {
          let course_data =  data[0] ? data[0] : [];
          this.courseData = course_data; // data?.course;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatCourse(data) {
    this.course = data;
    this.courseTitle = this.getCourseTitle(this.course);
    this.courseDescription = this.getCourseDescription(this.course);
    this.courseImage = `${COURSE_IMAGE_URL}/${this.course?.image}`;
    this.courseDurationUnitTitle = this.getCourseDurationUnitTitle(this.course);
    this.courseDifficulty = this.getDifficultyLevelTitle(this.course);
    
    this.courseIntroPDFURL = this.course.intro_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_pdf}` : '';
    this.courseIntroPDFURLEn = this.course.intro_en_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_en_pdf}` : '';
    this.courseIntroPDFURLFr = this.course.intro_fr_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_fr_pdf}` : '';
    this.courseIntroPDFURLEu = this.course.intro_eu_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_eu_pdf}` : '';
    this.courseIntroPDFURLCa = this.course.intro_ca_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_ca_pdf}` : '';
    this.courseIntroPDFURLDe = this.course.intro_de_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_de_pdf}` : '';
    this.courseIntroPDFURLIt = this.course.intro_it_pdf ? `${environment.api}/get-course-unit-file/${this.course.intro_it_pdf}` : '';
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
      : this.language == "it"
      ? course.title_it
        ? course.title_it || course.title
        : course.title
      : course.title;
  }

  getCourseDescription(course) {
    return course
      ? this.language == "en"
        ? course.description_en || course.description
        : this.language == "fr"
        ? course.description_fr || course.description
        : this.language == "eu"
        ? course.description_eu || course.description
        : this.language == "ca"
        ? course.description_ca || course.description
        : this.language == "de"
        ? course.description_de || course.description
        : this.language == "it"
        ? course.description_it || course.description
        : course.description
      : "";
  }

  getCourseDurationUnitTitle(course) {
    return this.language == 'en' ? course.duration_unit_en : (this.language == 'fr' ? course.duration_unit_fr : 
      (this.language == 'eu' ? course.duration_unit_eu : (this.language == 'ca' ? course.duration_unit_ca : 
      (this.language == 'de' ? course.duration_unit_de : (this.language == 'it' ? course.duration_unit_it : course.duration_unit_es)
      )))
    )
  }

  getDifficultyLevelTitle(course) {
    return this.language == 'en' ? course.difficulty_en : (this.language == 'fr' ? course.difficulty_fr : 
      (this.language == 'eu' ? course.difficulty_eu : (this.language == 'ca' ? course.difficulty_ca : 
      (this.language == 'de' ? course.difficulty_de : (this.language == 'it' ? course.difficulty_it : course.difficulty_es)
      )))
    )
  }

  getCourseIntroPDFURL() {
    return this.language == "en"
      ? this.courseIntroPDFURLEn
        ? this.courseIntroPDFURLEn || this.courseIntroPDFURL
        : this.courseIntroPDFURL
      : this.language == "fr"
      ? this.courseIntroPDFURLFr
        ? this.courseIntroPDFURLFr || this.courseIntroPDFURL
        : this.courseIntroPDFURL
      : this.language == "eu"
      ? this.courseIntroPDFURLEu
        ? this.courseIntroPDFURLEu || this.courseIntroPDFURL
        : this.courseIntroPDFURL
      : this.language == "ca"
      ? this.courseIntroPDFURLCa
        ? this.courseIntroPDFURLCa || this.courseIntroPDFURL
        : this.courseIntroPDFURL
      : this.language == "de"
      ? this.courseIntroPDFURLDe
        ? this.courseIntroPDFURLDe || this.courseIntroPDFURL
        : this.courseIntroPDFURL
      : this.language == "it"
      ? this.courseIntroPDFURLIt
        ? this.courseIntroPDFURLIt || this.courseIntroPDFURL
        : this.courseIntroPDFURL
      : this.courseIntroPDFURL;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}