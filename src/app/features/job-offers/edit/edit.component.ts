import { CommonModule } from "@angular/common";
import { Component, HostListener, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { JobOffersService } from "@features/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ButtonGroupComponent, NoAccessComponent, PageTitleComponent } from "@share/components";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { QuillModule } from 'ngx-quill';
import { environment } from "@env/environment";
import get from "lodash/get";

import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import 'quill-paste-smart';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: "app-job-offers-edit",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgMultiSelectDropDownModule,
    QuillModule,
    ButtonGroupComponent,
    PageTitleComponent,
    NoAccessComponent,
  ],
  templateUrl: "./edit.component.html",
})
export class JobOfferEditComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;

  languageChangeSubscription: any;
  isMobile: boolean = false;
  language: any;
  companyId: number = 0;
  userId: number = 0;
  company: any;
  domain: any;
  primaryColor: any;
  buttonColor: any;
  companies: any;
  userRole: any;
  email: any;
  jobOffersFeature: any;
  featureId: any;
  pageName: any;
  superAdmin: boolean = false;
  canCreateJobOffer: any;
  areas: any = [];
  types: any = [];
  languages: any = [];
  isLoading: boolean = true;
  selectedLanguage: string = "es";
  selectedLanguageChanged: boolean = false;
  showLanguageNote: boolean = true;
  buttonList: any = [];
  issaving: boolean = false;
  jobType: any = "";
  jobAreaDropdownSettings: any;
  jobArea: any = "";
  errorMessage: string = "";
  formSubmitted: boolean = false;
  job: any;
  status: boolean = false;
  pageTitle: string = "";

  jobOfferForm: FormGroup = new FormGroup({
    title: new FormControl("", [Validators.required]),
    title_en: new FormControl(""),
    title_fr: new FormControl(""),
    title_eu: new FormControl(""),
    title_ca: new FormControl(""),
    title_de: new FormControl(""),
    company: new FormControl("", [Validators.required]),
    location: new FormControl("", [Validators.required]),
    description: new FormControl(""),
    description_en: new FormControl(""),
    description_fr: new FormControl(""),
    description_eu: new FormControl(""),
    description_ca: new FormControl(""),
    description_de: new FormControl(""),
    mission: new FormControl(""),
    mission_en: new FormControl(""),
    mission_fr: new FormControl(""),
    mission_eu: new FormControl(""),
    mission_ca: new FormControl(""),
    mission_de: new FormControl(""),
    duties: new FormControl(""),
    duties_en: new FormControl(""),
    duties_fr: new FormControl(""),
    duties_eu: new FormControl(""),
    duties_ca: new FormControl(""),
    duties_de: new FormControl(""),
    requirements: new FormControl(""),
    requirements_en: new FormControl(""),
    requirements_fr: new FormControl(""),
    requirements_eu: new FormControl(""),
    requirements_ca: new FormControl(""),
    requirements_de: new FormControl(""),
    experience: new FormControl(""),
    experience_en: new FormControl(""),
    experience_fr: new FormControl(""),
    experience_eu: new FormControl(""),
    experience_ca: new FormControl(""),
    experience_de: new FormControl(""),
    notes: new FormControl(""),
    notes_en: new FormControl(""),
    notes_fr: new FormControl(""),
    notes_eu: new FormControl(""),
    notes_ca: new FormControl(""),
    notes_de: new FormControl(""),
  });

  modules = {}
  quill: Quill | undefined;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _jobOffersService: JobOffersService
  ) {
    this.modules = {
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        ["clean"],
        ["link", "image", "video"],
      ],
      imageResize: true,
      clipboard: {
        matchVisual: false,
        allowed: {
          tags: ['a', 'b', 'strong', 'u', 's', 'i', 'p', 'br', 'ul', 'ol', 'li', 'span'],
          attributes: ['href', 'rel', 'target', 'class']
        },
        keepSelection: true,
        substituteBlockElements: true,
        magicPasteLinks: true,
        hooks: {
          uponSanitizeElement(node, data, config) {
            console.log(node);
          },
        },
        handleImagePaste(image) {
          console.log("Image file pasted", image);
        }
      },
    }
  }

  @HostListener("window:resize", [])
  private onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  async ngOnInit() {
    this.onResize();

    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

    this.email = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.domain = this._localService.getLocalStorage(environment.lsdomain);
    this.userRole = this._localService.getLocalStorage(environment.lsuserRole);
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
      this.domain = company[0].domain;
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.initializePage();
  }

  initializePage() {
    this.jobAreaDropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "title",
      selectAllText: this._translateService.instant("dialog.selectall"),
      unSelectAllText: this._translateService.instant("dialog.clearall"),
      itemsShowLimit: 2,
      allowSearchFilter: true,
      searchPlaceholderText: this._translateService.instant('guests.search'),
    };
    this.fetchJobOffersData();
    this.pageTitle = this.id > 0 ? this._translateService.instant('job-offers.edityouroffer') : this._translateService.instant('job-offers.createyouroffer');
  }

  fetchJobOffersData() {
    this._jobOffersService
      .fetchJobOffersData(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapUserPermissions(data?.user_permissions);

          this.mapLanguages(data?.languages);
          this.mapTypes(data?.job_types);

          this.areas = data?.job_areas;

          this.isLoading = false;

          if (this.id > 0) {
            this.fetchJobOffer();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapFeatures(features) {
    this.jobOffersFeature = features?.find((f) => f.feature_id == 18);
    this.featureId = this.jobOffersFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.jobOffersFeature);
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreateJobOffer =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 18
      );
  }

  mapLanguages(languages) {
    languages = languages?.map((language) => {
      return {
        ...language,
        name: this.getLanguageName(language),
      };
    });

    this.languages = languages?.filter((lang) => {
      return lang.status == 1;
    });
    this.selectedLanguage = this.language || "es";
    this.initializeButtonGroup();
  }

  mapTypes(types) {
    types = types?.map((type) => {
      return {
        ...type,
        name: this.getTypeTitle(type),
      };
    });

    this.types = types;
  }

  fetchJobOffer() {
    this._jobOffersService
      .fetchJobOffer(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          let job_offer_areas = this.mapAreas(data?.job_offer_areas);
          this.formatJobOffer(data?.job_offer, job_offer_areas);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatJobOffer(offer, job_offer_areas) {
    this.job = offer;
    this.jobOfferForm.controls["title"].setValue(this.job?.title);
    this.jobOfferForm.controls["title_en"].setValue(this.job?.title_en);
    this.jobOfferForm.controls["title_fr"].setValue(this.job?.title_fr);
    this.jobOfferForm.controls["title_eu"].setValue(this.job?.title_eu);
    this.jobOfferForm.controls["title_ca"].setValue(this.job?.title_ca);
    this.jobOfferForm.controls["title_de"].setValue(this.job?.title_de);
    this.jobOfferForm.controls["company"].setValue(this.job?.company);
    this.jobOfferForm.controls["location"].setValue(this.job?.location);
    this.jobOfferForm.controls["description"].setValue(this.job?.description);
    this.jobOfferForm.controls["description_en"].setValue(
      this.job?.description_en
    );
    this.jobOfferForm.controls["description_fr"].setValue(
      this.job?.description_fr
    );
    this.jobOfferForm.controls["description_eu"].setValue(
      this.job?.description_eu
    );
    this.jobOfferForm.controls["description_ca"].setValue(
      this.job?.description_ca
    );
    this.jobOfferForm.controls["description_de"].setValue(
      this.job?.description_de
    );
    this.jobOfferForm.controls["requirements"].setValue(this.job?.requirements);
    this.jobOfferForm.controls["requirements_en"].setValue(
      this.job?.requirements_en
    );
    this.jobOfferForm.controls["requirements_fr"].setValue(
      this.job?.requirements_fr
    );
    this.jobOfferForm.controls["requirements_eu"].setValue(
      this.job?.requirements_eu
    );
    this.jobOfferForm.controls["requirements_ca"].setValue(
      this.job?.requirements_ca
    );
    this.jobOfferForm.controls["requirements_de"].setValue(
      this.job?.requirements_de
    );
    this.jobOfferForm.controls["experience"].setValue(this.job?.experience);
    this.jobOfferForm.controls["experience_en"].setValue(
      this.job?.experience_en
    );
    this.jobOfferForm.controls["experience_fr"].setValue(
      this.job?.experience_fr
    );
    this.jobOfferForm.controls["experience_eu"].setValue(
      this.job?.experience_eu
    );
    this.jobOfferForm.controls["experience_ca"].setValue(
      this.job?.experience_ca
    );
    this.jobOfferForm.controls["experience_de"].setValue(
      this.job?.experience_de
    );
    this.jobType = this.job?.type_id;
    this.status = this.job?.status == 1 ? true : false;
    this.jobArea = job_offer_areas?.map((area) => {
      const { area_id, title } = area;

      return {
        id: area_id,
        title,
      };
    });
  }

  mapAreas(areas) {
    let formatted_areas = areas?.map((area) => {
      return {
        ...area,
        title: this.getAreaTitle(area),
      };
    });

    return formatted_areas;
  }

  initializeButtonGroup() {
    let list: any[] = [];

    this.languages?.forEach((language) => {
      list.push({
        id: language.id,
        value: language.code,
        text: this.getLanguageName(language),
        selected: language.default ? true : false,
        code: language.code,
      });
    });

    this.buttonList = list;
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

  getLanguageName(language) {
    return this.language == "en"
      ? language.name_EN
      : this.language == "fr"
      ? language.name_FR
      : this.language == "eu"
      ? language.name_EU
      : this.language == "ca"
      ? language.name_CA
      : this.language == "de"
      ? language.name_DE
      : language.name_ES;
  }

  getTypeTitle(type) {
    return type
      ? this.language == "en"
        ? type.title_en || type.title
        : this.language == "fr"
        ? type.title_fr || type.title
        : this.language == "eu"
        ? type.title_eu || type.title
        : this.language == "ca"
        ? type.title_ca || type.title
        : this.language == "de"
        ? type.title_de || type.title
        : type.title
      : "";
  }

  getAreaTitle(area) {
    let filtered_area = this.areas?.filter((a) => {
      return a.id == area.area_id;
    });
    let area_row = filtered_area?.length > 0 ? filtered_area[0] : {};

    return area_row
      ? this.language == "en"
        ? area_row.title_en || area_row.title
        : this.language == "fr"
        ? area_row.title_fr || area_row.title
        : this.language == "eu"
        ? area_row.title_eu || area_row.title
        : this.language == "ca"
        ? area_row.title_ca || area_row.title
        : this.language == "de"
        ? area_row.title_de || area_row.title
        : area_row.title
      : "";
  }

  closeLanguageNote() {
    this._localService.setLocalStorage("showLanguageNote", new Date());
    this.showLanguageNote = false;
  }

  handleChangeLanguageFilter(event) {
    this.buttonList?.forEach((item) => {
      if (item.code == event.code) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    this.selectedLanguage = event.code;
    this.selectedLanguageChanged = true;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    const contentContainer =
      document.querySelector(".mat-sidenav-content") || window;
    contentContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  saveJobOffer() {
    this.errorMessage = "";
    this.formSubmitted = true;

    if (
      this.jobOfferForm?.get("title")?.errors ||
      this.jobOfferForm?.get("company")?.errors ||
      this.jobOfferForm?.get("location")?.errors ||
      this.jobOfferForm?.get("description")?.errors ||
      this.jobOfferForm?.get("requirements")?.errors ||
      this.jobOfferForm?.get("experience")?.errors ||
      !this.jobType
    ) {
      this.scrollToTop();
      return false;
    }

    let title = this.jobOfferForm.get("title")?.value;
    let title_en = this.jobOfferForm.get("title_en")?.value
      ? this.jobOfferForm.get("title_en")?.value || title
      : title;
    let title_fr = this.jobOfferForm.get("title_fr")?.value
      ? this.jobOfferForm.get("title_fr")?.value || title
      : title;
    let title_eu = this.jobOfferForm.get("title_eu")?.value
      ? this.jobOfferForm.get("title_eu")?.value || title
      : title;
    let title_ca = this.jobOfferForm.get("title_ca")?.value
      ? this.jobOfferForm.get("title_ca")?.value || title
      : title;
    let title_de = this.jobOfferForm.get("title_de")?.value
      ? this.jobOfferForm.get("title_de")?.value || title
      : title;
    let company = this.jobOfferForm.get("company")?.value;
    let location = this.jobOfferForm.get("location")?.value;
    let description = this.jobOfferForm.get("description")?.value;
    let description_en = this.jobOfferForm.get("description_en")?.value
      ? this.jobOfferForm.get("description_en")?.value || description
      : description;
    let description_fr = this.jobOfferForm.get("description_fr")?.value
      ? this.jobOfferForm.get("description_fr")?.value || description
      : description;
    let description_eu = this.jobOfferForm.get("description_eu")?.value
      ? this.jobOfferForm.get("description_eu")?.value || description
      : description;
    let description_ca = this.jobOfferForm.get("description_ca")?.value
      ? this.jobOfferForm.get("description_ca")?.value || description
      : description;
    let description_de = this.jobOfferForm.get("description_de")?.value
      ? this.jobOfferForm.get("description_de")?.value || description
      : description;
    let requirements = this.jobOfferForm.get("requirements")?.value;
    let requirements_en = this.jobOfferForm.get("requirements_en")?.value
      ? this.jobOfferForm.get("requirements_en")?.value || requirements
      : requirements;
    let requirements_fr = this.jobOfferForm.get("requirements_fr")?.value
      ? this.jobOfferForm.get("requirements_fr")?.value || requirements
      : requirements;
    let requirements_eu = this.jobOfferForm.get("requirements_eu")?.value
      ? this.jobOfferForm.get("requirements_eu")?.value || requirements
      : requirements;
    let requirements_ca = this.jobOfferForm.get("requirements_ca")?.value
      ? this.jobOfferForm.get("requirements_ca")?.value || requirements
      : requirements;
    let requirements_de = this.jobOfferForm.get("requirements_de")?.value
      ? this.jobOfferForm.get("requirements_de")?.value || requirements
      : requirements;
    let experience = this.jobOfferForm.get("experience")?.value;
    let experience_en = this.jobOfferForm.get("experience_en")?.value
      ? this.jobOfferForm.get("experience_en")?.value || experience
      : experience;
    let experience_fr = this.jobOfferForm.get("experience_fr")?.value
      ? this.jobOfferForm.get("experience_fr")?.value || experience
      : experience;
    let experience_eu = this.jobOfferForm.get("experience_eu")?.value
      ? this.jobOfferForm.get("experience_eu")?.value || experience
      : experience;
    let experience_ca = this.jobOfferForm.get("experience_ca")?.value
      ? this.jobOfferForm.get("experience_ca")?.value || experience
      : experience;
    let experience_de = this.jobOfferForm.get("experience_de")?.value
      ? this.jobOfferForm.get("experience_de")?.value || experience
      : experience;

    let formData = new FormData();
    formData.append("title", title);
    formData.append("title_en", title_en);
    formData.append("title_fr", title_fr);
    formData.append("title_eu", title_eu);
    formData.append("title_ca", title_ca);
    formData.append("title_de", title_de);
    formData.append("company_id", this.companyId.toString());
    formData.append("type_id", this.jobType);
    formData.append("company", company);
    formData.append("location", location);
    formData.append(
      "area_id",
      this.jobArea
        .map((data) => {
          return data.id;
        })
        .join()
    );
    formData.append("description", description);
    formData.append("description_en", description_en);
    formData.append("description_fr", description_fr);
    formData.append("description_eu", description_eu);
    formData.append("description_ca", description_ca);
    formData.append("description_de", description_de);
    formData.append("requirements", requirements);
    formData.append("requirements_en", requirements_en);
    formData.append("requirements_fr", requirements_fr);
    formData.append("requirements_eu", requirements_eu);
    formData.append("requirements_ca", requirements_ca);
    formData.append("requirements_de", requirements_de);
    formData.append("experience", experience);
    formData.append("experience_en", experience_en);
    formData.append("experience_fr", experience_fr);
    formData.append("experience_eu", experience_eu);
    formData.append("experience_ca", experience_ca);
    formData.append("experience_de", experience_de);

    if (this.id == 0) {
      formData.append("created_by", this.userId.toString());
    } else {
      formData.append("status", this.status ? "1" : "0");
    }

    if (this.id > 0) {
      // Edit
      this._jobOffersService.editJobOffer(this.id, formData).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this._router.navigate([`/employmentchannel/details/${this.id}`]);
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
    } else {
      // Create
      this._jobOffersService.addJobOffer(formData).subscribe(
        (response) => {
          if (response.id > 0) {
            this._router.navigate([
              `/employmentchannel/details/${response.id}`,
            ]);
          } else {
            this.issaving = false;
            this.open(this._translateService.instant("dialog.error"), "");
          }
        },
        (error) => {
          this.issaving = false;
          this.open(this._translateService.instant("dialog.error"), "");
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

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}