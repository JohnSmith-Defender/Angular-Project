import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { CoursesService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { initFlowbite } from "flowbite";
import { CourseUnitCardComponent } from "@share/components/card/course-unit/course-unit.component";
import { NgxPaginationModule } from "ngx-pagination";
import { COURSE_IMAGE_URL } from "@lib/api-constants";
import get from "lodash/get";

@Component({
  selector: 'app-courses-detail-old',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
    CourseUnitCardComponent,
    NgxPaginationModule,
  ],
  templateUrl: './detail.component.html'
})
export class CourseDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  emailDomain;
  user;
  canCreate: boolean = false;
  language: any;
  userId: any;
  companyId: any;
  pageName: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  superAdmin: boolean = false;
  company: any;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  courseData: any;
  course: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  featureId: any;
  coursesFeature: any;
  editHover: boolean = false;
  deleteHover: boolean = false;
  courseTitle: string = '';
  courseImage: string = '';
  courseDescription: string = '';
  courseUnits: any = [];
  p: any;

  constructor(
    private _router: Router,
    private _coursesService: CoursesService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
    this._translateService.use(this.language || "es");

    this.emailDomain = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
      this.company = company[0];
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

    this.getCourse();
  }

  getCourse() {
    this._coursesService
      .fetchCourse(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.courseData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.courseData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapUserPermissions(data?.user_permissions);
    this.formatCourse(data?.course);
    this.initializeBreadcrumb(data);
  }

  mapFeatures(features) {
    this.coursesFeature = features?.find((f) => f.feature_id == 11);
    this.featureId = this.coursesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.coursesFeature);
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 11
      );
  }

  formatCourse(data) {
    this.course = data;
    this.courseTitle =this.getCourseTitle(this.course);
    this.courseDescription = this.getCourseDescription(this.course);
    this.courseImage = `${COURSE_IMAGE_URL}/${this.course?.image}`;
    this.courseUnits = this.formatCourseUnits(this.course?.course_units);
  }

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = this.getCourseTitle(data?.course);
    this.level3Title = "";
    this.level4Title = "";
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

  getCourseDescription(course) {
    return this.language == "en"
      ? course.description_en
        ? course.title_en || course.description
        : course.description
      : this.language == "fr"
      ? course.title_fr
        ? course.title_fr || course.description
        : course.description
      : this.language == "eu"
      ? course.title_eu
        ? course.title_eu || course.description
        : course.description
      : this.language == "ca"
      ? course.title_ca
        ? course.title_ca || course.description
        : course.description
      : this.language == "de"
      ? course.title_de
        ? course.title_de || course.description
        : course.description
      : course.description;
  }

  formatCourseUnits(course_units) {
    return course_units?.map((unit) => {

      return {
        ...unit,
        path: `/courses/unit/${this.id}/${unit.id}`,
        title: this.getCourseTitle(unit),
        description: this.getCourseDescription(unit),
        image: `${COURSE_IMAGE_URL}/${(unit?.video_cover || this.course?.image)}`,
        progress: unit?.Company_Course_Unit_Users?.length > 0 ? unit.Company_Course_Unit_Users[0].progress : 0,
      };
    });
  }

  handleEditRoute() {
    this._router.navigate([`/courses/edit/${this.id}`]);
  }

  toggleEditHover(event) {
    this.editHover = event;
  }

  handleDelete() {
    if (this.id) {
      this.showConfirmationModal = false;
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmdelete"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmdeleteitem"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  confirm() {
    this.deleteCourse(this.id, true);
  }

  deleteCourse(id, confirmed) {
    if (confirmed) {
      // this._cityGuidesService.deleteCityGuide(id, this.userId).subscribe(
      //   (response) => {
      //     this.open(
      //       this._translateService.instant("dialog.deletedsuccessfully"),
      //       ""
      //     );
      //     this._location.back();
      //   },
      //   (error) => {
      //     console.log(error);
      //   }
      // );
    }
  }

  toggleDeleteHover(event) {
    this.deleteHover = event;
  }

  handleGoBack() {
    this._location.back();
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