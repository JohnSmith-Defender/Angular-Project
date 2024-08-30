import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { TestimonialsService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { TestimonialCardComponent } from "@share/components/card/testimonial/testimonial.component";
import { initFlowbite } from "flowbite";
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";
import "moment/locale/it";
import get from "lodash/get";

@Component({
  selector: 'app-testimonials-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
    PageTitleComponent,
    TestimonialCardComponent,
  ],
  templateUrl: './detail.component.html'
})
export class TestimonialDetailComponent {
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
  pageDescription: any;
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
  testimonialData: any;
  testimonial: any;
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
  testimonialsFeature: any;
  editHover: boolean = false;
  deleteHover: boolean = false;
  superTutor: boolean = false;
  canEdit: boolean = false;
  testimonialImages:any = [];
  testimonialVideos:any = []
  isCursoGeniusTestimonials: boolean = false;

  constructor(
    private _router: Router,
    private _testimonialsService: TestimonialsService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
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
      this.isCursoGeniusTestimonials = this._companyService.isCursoGeniusTestimonials(company[0]);
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.getTestimonial();
  }
  getTestimonial() {
    this._testimonialsService
      .fetchTestimonial(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.testimonialData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.testimonialData;
    this.user = data?.user_permissions?.user;
    this.testimonialVideos = data?.testimonial_videos
    this.testimonialImages = data?.testimonial_images
    if(this.testimonialVideos?.length > 0)
    this.testimonialVideos = this.testimonialVideos.map(testimonial=>{
      return {
        id:testimonial.id,
        video:`${environment.api}/get-testimonial-video/${testimonial.video}`,
      }
    })
    
    if(this.testimonialImages?.length > 0)
    this.testimonialImages = this.testimonialImages.map(testimonial=>{
      return {
        id:testimonial.id,
        image:`${environment.api}/get-testimonial-image/${testimonial.image}`,
      }
    })

    this.mapFeatures(data?.features_mapping);
    this.mapUserPermissions(data);
    this.formatTestimonial(data?.testimonial);
    this.initializeBreadcrumb(data);
  }

  mapFeatures(features) {
    this.testimonialsFeature = features?.find((f) => f.feature_id == 23);
    this.featureId = this.testimonialsFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.testimonialsFeature);
    this.pageDescription = this.getFeatureDescription(this.testimonialsFeature);
  }

  mapUserPermissions(data) {
    let user_permissions = data?.user_permissions;
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.superTutor = user_permissions?.super_tutor ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 23
      );
    this.canEdit = this.superAdmin || data?.testimonial?.created_by == this.userId;
  }

  formatAuthorName(author){
    const parser = new DOMParser();
    const parsedHTML = parser.parseFromString(author, 'text/html');
    return parsedHTML.body.textContent;
  }
  // format testimonial

  formatTestimonial(testimonial) {
    let highlight_description = testimonial.description?.replace(testimonial?.short_description?.replace(/<(?:.|\n)*?>/gm, ''), '<div class="font-semibold px-4 py-1 border border-2 border-black border-t-0 border-b-0 border-r-0 italic">' + testimonial?.short_description?.replace(/<(?:.|\n)*?>/gm, '') + '</div>')
    let t = {
      id: testimonial.id,
      company_id: testimonial.company_id,
      short_description: testimonial.short_description,
      author: this.formatAuthorName(testimonial.author),
      social_media_url: testimonial.social_media_url,
      trimmed: testimonial?.short_description?.length > 9 ? `${testimonial?.short_description?.replace(/<(?:.|\n)*?>/gm, '').substring(0, 10)}...` : testimonial?.short_description?.replace(/<(?:.|\n)*?>/gm, ''),
      description: highlight_description,
      image: testimonial.image,
      testimonial_image: `${environment.api}/get-testimonial-image/${testimonial.image}`,
      created_by: testimonial.created_by,
      created_at: testimonial.created_at,
      isCoverImage: testimonial.isCoverImage || !testimonial.video ? true :  false,
      date_display: moment.utc(testimonial.created_at).locale(this.language).format('D MMMM YYYY'),
      video: `${environment.api}/get-testimonial-video/${testimonial.video}`
    }
    this.testimonial = t;
  };

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = "";
    this.level3Title = "";
    this.level4Title = "";
  }

  handleEditRoute() {
    this._router.navigate([`/testimonials/edit/${this.id}`]);
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
    this.deleteTestimonial(this.id, true);
  }

  deleteTestimonial(id, confirmed) {
    if (confirmed) {
      this._testimonialsService.deleteTestimonial(id).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this._location.back();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  toggleDeleteHover(event) {
    this.deleteHover = event;
  }

  handleGoBack() {
    this._location.back();
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
        : this.language == "it"
        ? feature.name_it ||
          feature.feature_name_IT ||
          feature.name_es ||
          feature.feature_name_ES
        : feature.name_es || feature.feature_name_ES
      : "";
  }

  getFeatureDescription(feature) {
    return feature
      ? this.language == "en"
        ? feature.description_en || feature.description_es
        : this.language == "fr"
        ? feature.description_fr || feature.description_es
        : this.language == "eu"
        ? feature.description_eu || feature.description_es
        : this.language == "ca"
        ? feature.description_ca || feature.description_es
        : this.language == "de"
        ? feature.description_de || feature.description_es
        : this.language == "it"
        ? feature.description_it || feature.description_es
        : feature.description_es
      : "";
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
