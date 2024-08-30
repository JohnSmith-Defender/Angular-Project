import { CommonModule, Location } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { JobOffersService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from "@share/components";
import {
  LocalService,
  CompanyService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SafeContentHtmlPipe } from "@lib/pipes";
import { FormsModule } from "@angular/forms";
import { EditorModule } from "@tinymce/tinymce-angular";
import { initFlowbite } from "flowbite";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: 'app-job-offers-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatSnackBarModule,
    EditorModule,
    BreadcrumbComponent,
    SafeContentHtmlPipe,
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: './detail.component.html'
})
export class JobOfferDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  language: any
  emailDomain: any
  companies: any
  companyName: any
  primaryColor: any
  buttonColor: any
  userId: any
  companyId: any
  isloading: boolean = true
  job: any
  features: any
  pageName: any
  showTermsAndConditionsModal: boolean = false
  termsAndConditions: any = ''
  termsAndConditionsEn: any = ''
  termsAndConditionsFr: any = ''
  me: any
  isRegistered: boolean = false
  jobDescription: any
  jobRequirements: any
  jobExperience: any
  featureId: any
  otherSettings: any
  roles: any
  admin1: boolean = false
  admin2: boolean = false
  superAdmin: boolean = false
  hasCustomMemberTypeSettings: boolean = false
  canCreateJobOffer: boolean = false
  jobOffersFeature: any
  privacyPolicy: any
  privacyPolicyEn: any
  privacyPolicyFr: any
  cookiePolicy: any
  cookiePolicyEn: any
  cookiePolicyFr: any
  termsAndConditionsURL: any
  termsAndConditionsURLEn: any
  termsAndConditionsURLFr: any
  privacyPolicyURL: any
  privacyPolicyURLEn: any
  privacyPolicyURLFr: any
  cookiePolicyURL: any
  cookiePolicyURLEn: any
  cookiePolicyURLFr: any
  acceptTermsAndConditions: boolean = false
  acceptPrivacyPolicy: boolean = false
  acceptCookiePolicy: boolean = false
  canShowTermsAndConditions: boolean = false
  canShowPrivacyPolicy: boolean = false
  canShowCookiePolicy: boolean = false
  showAcceptTermsAndConditionsModal: boolean = false
  userRoles: any
  company: any;
  jobOfferData: any;
  user: any;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  areas: any;
  types: any;
  jobOfferAreasMapping: any;
  showConfirmationModal: boolean = false;

  @ViewChild('iframeDescription', { static: false }) iframeDescription: ElementRef | undefined
  @ViewChild('descriptionEditor', { static: false }) descriptionEditor: ElementRef | undefined
  @ViewChild('iframeExperience', { static: false }) iframeExperience: ElementRef | undefined
  @ViewChild('experienceEditor', { static: false }) experienceEditor: ElementRef | undefined
  @ViewChild('iframeRequirements', { static: false }) iframeRequirements: ElementRef | undefined
  @ViewChild('requirementsEditor', { static: false }) requirementsEditor: ElementRef | undefined
  @ViewChild("modalbutton", { static: false }) modalbutton: ElementRef | undefined;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: string = "";
  title: string = "";
  editHover: boolean = false;
  deleteHover: boolean = false;
  sendHover: boolean = false;
  closeDays: any;
  jobActiveStatus: any;

  constructor(
    private _router: Router,
    private _jobOffersService: JobOffersService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang)
    this._translateService.use(this.language || 'es')
    this.emailDomain = this._localService.getLocalStorage(environment.lsemail)
    this.userId = this._localService.getLocalStorage(environment.lsuserId)
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId)
    this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies) ) : ''
    if(!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
    let company = this._companyService.getCompany(this.companies)
    if(company && company[0]) {
      this.company = company[0]
      this.emailDomain = company[0].domain
      this.companyId = company[0].id
      this.companyName = company[0].entity_name
      this.primaryColor = company[0].primary_color
      this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
      this.termsAndConditions = company[0].job_terms_and_conditions
      this.termsAndConditionsEn = company[0].job_terms_and_conditions_en
      this.termsAndConditionsFr = company[0].job_terms_and_conditions_fr
      this.privacyPolicy = company[0].policy
      this.privacyPolicyEn = company[0].policy_en
      this.privacyPolicyFr = company[0].policy_fr
      this.cookiePolicy = company[0].cookie_policy
      this.cookiePolicyEn = company[0].cookie_policy_en
      this.cookiePolicyFr = company[0].cookie_policy_fr
      this.canShowTermsAndConditions = company[0].show_terms == 1 ? true : false
      this.canShowPrivacyPolicy = company[0].show_privacy_policy == 1 ? true : false
      this.canShowCookiePolicy = company[0].show_cookie_policy == 1 ? true : false
      this.termsAndConditionsURL = company[0].terms_and_conditions_url
      this.privacyPolicyURL = company[0].privacy_policy_url
      this.privacyPolicyURLEn = company[0].privacy_policy_url_en
      this.privacyPolicyURLFr = company[0].privacy_policy_url_fr
      this.cookiePolicyURL = company[0].cookie_policy_url
      this.cookiePolicyURLEn = company[0].cookie_policy_url_en
      this.cookiePolicyURLFr = company[0].cookie_policy_url_fr
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.getJobOffer();
  }

  getJobOffer() {
    this._jobOffersService
      .fetchJobOffer(
        this.id,
        this.companyId,
        this.userId
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.closeDays = data?.settings?.offer_hide_days_settings?.hide_days || 0;
          this.jobOfferData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.jobOfferData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data);
    this.mapUserPermissions(data?.user_permissions);
    this.areas = data?.job_areas;
    this.types = data?.job_types;
    this.jobOfferAreasMapping = data?.job_offer_areas;
    this.formatJobOffer(
      data?.job_offer,
      data?.job_offer_applications
    );
    this.initializeBreadcrumb();
  }

  mapFeatures(features) {
    this.jobOffersFeature = features?.find((f) => f.feature_id == 18);
    this.featureId = this.jobOffersFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.jobOffersFeature);
  }

  mapSubfeatures(data) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.showAcceptTermsAndConditionsModal = subfeatures.some(
        (a) => a.name_en == "Terms and Conditions" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreateJobOffer =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find((f) => f.create == 1 && f.feature_id == 18);
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

  formatJobOffer(offer, job_offer_applications) {
    this.job = offer;
    this.title = this.getOfferTitle(offer);
    if(this.job && job_offer_applications?.length > 0) {
      let user_job_application = job_offer_applications.filter(application => {
        return application.user_id == this.userId
      })
      if(user_job_application && user_job_application[0]) {
        this.isRegistered = true
      }
    }
    let description = this.getJobDescriptionTitle()
    this.jobDescription = description ? this.sanitizer.bypassSecurityTrustHtml(description) : ''
    let requirements = this.getJobRequirementsTitle()
    this.jobRequirements = requirements ? this.sanitizer.bypassSecurityTrustHtml(requirements) : ''
    let experience = this.getJobExperienceTitle()
    this.jobExperience = experience ? this.sanitizer.bypassSecurityTrustHtml(experience) : ''
    this.jobActiveStatus = this.getStatus(offer);
  }

  getStatus(offer) {
    var a = moment(offer.created_at);
    var b = moment(new Date());
    let diff = b.diff(a, "days");

    let status = diff > this.closeDays ? 'closed' : '';
    return status;
  }

  getJobDescriptionTitle() {
    return this.language == 'en' ? (this.job.description_en || this.job.description) : (this.language == 'fr' ? (this.job.description_fr || this.job.description) : 
        (this.language == 'eu' ? (this.job.description_eu || this.job.description) : (this.language == 'ca' ? (this.job.description_ca || this.job.description) : 
        (this.language == 'de' ? (this.job.description_de || this.job.description) : this.job.description)
      ))
    )
  }

  getJobRequirementsTitle() {
    return this.language == 'en' ? (this.job.requirements_en || this.job.requirements) : (this.language == 'fr' ? (this.job.requirements_fr || this.job.requirements) : 
        (this.language == 'eu' ? (this.job.requirements_eu || this.job.requirements) : (this.language == 'ca' ? (this.job.requirements_ca || this.job.requirements) : 
        (this.language == 'de' ? (this.job.requirements_de || this.job.requirements) : this.job.requirements)
      ))
    )
  }

  getJobExperienceTitle() {
    return this.language == 'en' ? (this.job.experience_en || this.job.experience) : (this.language == 'fr' ? (this.job.experience_fr || this.job.experience) : 
        (this.language == 'eu' ? (this.job.experience_eu || this.job.experience) : (this.language == 'ca' ? (this.job.experience_ca || this.job.experience) : 
        (this.language == 'de' ? (this.job.experience_de || this.job.experience) : this.job.experience)
      ))
    )
  }

  getOfferTitle(offer) {
    return offer ? (this.language == 'en' ? (offer.title_en || offer.title) : (this.language == 'fr' ? (offer.title_fr || offer.title) : 
        (this.language == 'eu' ? (offer.title_eu || offer.title) : (this.language == 'ca' ? (offer.title_ca || offer.title) : 
        (this.language == 'de' ? (offer.title_de || offer.title) : offer.title)
      ))
    )) : ''
  }

  getTypeTitle(type) {
    return type ? this.language == 'en' ? (type.title_en || type.title) : (this.language == 'fr' ? (type.title_fr || type.title) :
      (this.language == 'eu' ? (type.title_eu || type.title) : (this.language == 'ca' ? (type.title_ca || type.title) :
        (this.language == 'de' ? (type.title_de || type.title) : type.title)
      ))
    ) : ''
  }

  initializeBreadcrumb() {
    this.level1Title = this.pageName;
    this.level2Title = this.job?.title;
    this.level3Title = "";
    this.level4Title = "";
  }

  getAreaValues() {
    let area_display = ''

    let job_areas = this.areas?.filter(ja => {
      return this.jobOfferAreasMapping?.some((a) => a.job_offer_id === this.job.id && a.area_id == ja.id);
    })

    area_display = job_areas?.length > 1 ? job_areas?.map( (data) => { return data.title }).join(', ') : (job_areas?.length == 1 ? job_areas[0].title : '')

    return area_display
  }

  handleEditorDescriptionInit(e) {
    if (this.jobDescription?.changingThisBreaksApplicationSecurity &&
      this.descriptionEditor && this.iframeDescription) {
        this.descriptionEditor.nativeElement.style.display = 'block';
        e.editor.setContent(this.jobDescription.changingThisBreaksApplicationSecurity);
        this.iframeDescription.nativeElement.style.height = `${e.editor.container.clientHeight - 50}px`;
        this.descriptionEditor.nativeElement.style.display = 'none';
        this.iframeDescription.nativeElement.src = this.setText(e);
        this.iframeDescription.nativeElement.style.display = 'block';
    }
  }

  handleEditorExperienceInit(e) {
    if (this.jobExperience?.changingThisBreaksApplicationSecurity &&
      this.experienceEditor && this.iframeExperience) {
        this.experienceEditor.nativeElement.style.display = 'block';
        e.editor.setContent(this.jobExperience.changingThisBreaksApplicationSecurity);
        this.iframeExperience.nativeElement.style.height = `${e.editor.container.clientHeight - 50}px`;
        this.experienceEditor.nativeElement.style.display = 'none';
        this.iframeExperience.nativeElement.src = this.setText(e);
        this.iframeExperience.nativeElement.style.display = 'block';
    }
  }

  handleEditorRequirementsInit(e) {
    if (this.jobRequirements?.changingThisBreaksApplicationSecurity &&
      this.requirementsEditor && this.iframeRequirements) {
        this.requirementsEditor.nativeElement.style.display = 'block';
        e.editor.setContent(this.jobRequirements.changingThisBreaksApplicationSecurity);
        this.iframeRequirements.nativeElement.style.height = `${e.editor.container.clientHeight - 50}px`;
        this.requirementsEditor.nativeElement.style.display = 'none';
        this.iframeRequirements.nativeElement.src = this.setText(e);
        this.iframeRequirements.nativeElement.style.display = 'block';
    }
  }

  setText(e){
    let txt =  'data:text/html;charset=utf-8,' +
    '<html>' +
    '<head>' + e.editor.getDoc().head.innerHTML + '<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins" /><style>* {font-family: "Poppins", sans-serif;}</style></head>' +
    '<body>' + e.editor.getDoc().body.innerHTML + '</body>' +
    '</html>';
    return txt
  }

  register() {
    if(this.userId > 0) {
      if(this.userId && this.user.accept_job_terms != 1 && this.showAcceptTermsAndConditionsModal) {
        setTimeout(() => {
          initFlowbite();
          this.modalbutton?.nativeElement.click();
        }, 100);
      } else {
        this.continueRegister()
      }
    } else {
      this._router.navigate(["/auth/login"]);
    }
  }

  continueRegister() {
    this._router.navigate([`/employmentchannel/register/${this.id}`])
  }

  getDisabledStatus() {
    let status = false
    if(this.termsAndConditionsURL && this.privacyPolicyURL && this.cookiePolicyURL) {
        if(!this.acceptTermsAndConditions || !this.acceptPrivacyPolicy || !this.acceptCookiePolicy) {
            status = true
        }
    }

    return status
  }

  handleGoBack() {
    this._location.back();
  }

  handleEditRoute() {
    this._router.navigate([`/employmentchannel/edit/${this.id}`])
  }

  handleDelete() {
    if(this.id) {
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
    this.deleteJobOffer(this.id, true);
    this.showConfirmationModal = false;
  }

  deleteJobOffer(id, confirmed) {
    if(confirmed) {
      this._jobOffersService.deleteJobOffer(id)
      .subscribe(
        response => {
          this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
          this._location.back()
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  toggleEditHover(event) {
    this.editHover = event;
  }

  toggleDeleteHover(event) {
    this.deleteHover = event;
  }

  toggleSendHover(event) {
    this.sendHover = event;
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
