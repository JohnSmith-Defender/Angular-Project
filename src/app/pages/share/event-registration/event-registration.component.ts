import { CommonModule, NgOptimizedImage } from "@angular/common";
import { 
    Component, 
    Input, 
    OnDestroy, 
    OnInit,
    SecurityContext, 
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { environment } from "@env/environment";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PlansService } from "@features/services";
import { DomSanitizer } from '@angular/platform-browser';
import { NoAccessComponent } from "@share/components";
import { SafeContentHtmlPipe } from "@lib/pipes";
import momenttz from "moment-timezone";
import moment from "moment";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/eu";
import "moment/locale/ca";
import "moment/locale/de";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgOptimizedImage,
    NoAccessComponent,
    SafeContentHtmlPipe,
  ],
  templateUrl: "./event-registration.component.html",
})
export class EventRegistrationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() slug!: string;
  @Input() invite_guid!: string;

  languageChangeSubscription;
  language: any;
  userId: any;
  company: any;
  companyName: any;
  domain: any;
  template: any;
  html: any;
  css: any;
  apiPath: string = environment.api;
  hasRegistrationButtonForm: boolean = false;
  registerForm: any;
  primaryColor: any;
  buttonColor: any = "#006999";
  registerAsGuest: boolean = false;
  agreeTerms: any;
  mode: any;
  modal: any;
  submitted: boolean = false;
  event: any;
  registerComplete: boolean = false;
  companies: any;
  companyId: any;
  termsAndConditions: any;
  privacyPolicy: any;
  hasPaymentButtonForm: boolean = false;
  limitReached: boolean = false;
  plan: any;
  planParticipants: any = [];
  seats: any;
  isPlanOpen: boolean = true;
  planParticipantCount: any;
  limitReachedMessage: any = "";
  otherSettings: any;
  pastEvent: boolean = false;
  filteredProfileFields: any = [];
  fieldrequired: any;
  selectedSector: any = "";
  errors: any;
  selectOptions: any;
  companySubfeatures: any = [];
  feature: any;
  hasGuestRegistration: boolean = false;
  sectors: any;
  plansFeature: any;
  pageName: any;
  pageDescription: any;
  plansFeatureId: any;
  eventImage: any;
  featuredTitle: any;
  featuredTextValue: any;
  featuredTextValueEn: any;
  featuredTextValueFr: any;
  featuredTextValueEu: any;
  featuredTextValueCa: any;
  featuredTextValueDe: any;
  planDescription: any;
  eventDescription: any;
  planTruncatedDescription: any;
  planExpandedDescription: boolean = false;
  truncate: number = 200;
  planDay: string = "";
  planTime: string = "";
  planDate: any;
  limitDate: any;
  endDate: any;
  planDateCanary: any;
  planDateValue: any;
  calendarStartDate: any;
  calendarEndDate: any;
  isPastEvent: boolean = false;
  canAssignMultipleCities: boolean = false;
  activityCities: any;
  createdById: any;
  createdBy: any;
  createdByImage: any;
  planCreator: any;
  user: any;
  newAlias: any;
  isLoading: boolean = true;
  memberParticipants: any = [];
  guestParticipants: any = [];
  isOpenTerms: boolean = false;
  isOpenPrivacy: boolean = false;
  isImageCenterButton: boolean = false;

  constructor(
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _plansService: PlansService,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this._translateService.use(this.language || "es");

    this.companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
      this.company = company[0];
      this.companyId = company[0].id;
      this.companyName = company[0].entity_name;
      this.domain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.termsAndConditions = company[0].terms_and_conditions
      this.privacyPolicy = company[0].policy
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.getEventRegistration();
  }

  getEventRegistration() {
    this._plansService
      .fetchRegistrationData(this.slug, this.invite_guid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.mapFeatures(data?.features_mapping);
          this.mapSubfeatures(data);
          this.user = data?.user;
          this.formatEventRegistrationData(data);
          if(this.companyId == 20) {
            this.getLandingTemplate();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    this.initializeDefaultFields();
  }

  mapFeatures(features) {
    this.plansFeature = features?.find((f) => f.feature_id == 21);
    this.plansFeatureId = this.plansFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.plansFeature);
    this.pageDescription = this.getFeatureDescription(this.plansFeature);
  }

  mapSubfeatures(data) {
    let subfeatures = data?.settings?.subfeatures;
    if (subfeatures?.length > 0) {
      this.hasGuestRegistration = subfeatures.some(
        (a) => a.subfeature_id == 99 && a.active == 1
      );

      if (this.hasGuestRegistration) {
        this.getGuestRegistrationFields(data);
      } else {
        this.initializeDefaultFields();
      }
      this.canAssignMultipleCities = subfeatures.some(
        (a) => a.name_en == "Assign multiple cities" && a.active == 1
      );

      this.isImageCenterButton = subfeatures.some(
        (a) => a.name_en == "Event registration with image and center button" && a.active == 1
      );
    }

    let other_settings = data?.settings?.other_settings;
    if (other_settings?.length > 0) {
      let limitSettings = other_settings.filter((a) => {
        return a.title_en == "Registration Limit reached message";
      });
      if (limitSettings?.length > 0) {
        this.limitReachedMessage = limitSettings[0].value;
      }
    }
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
        : feature.description_es
      : "";
  }

  async getLandingTemplate() {
    this._plansService.getEventRegistrationTemplateByGuid(this.slug, this.invite_guid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        let template = data.template
        this.template = template
        if(this.template) {
          let style = ` <style>
            img.register-bg{max-width:420px;border-radius:8px;object-fit:contain;margin:20px auto 0px;}
            h1{text-transform:capitalize;}
            td.v-container-padding-padding{text-align:center;}
            @media (max-width: 767px) { 
              .u-col.u-col-100.u_column{min-width:320px !important;}
              img.register-bg{max-width:100% !important;}
              .v-col-padding.v-col-border.v-col-border-radius{padding-right:0px !important;}
            }
          </style> `
          let body = this.template.body
          body = body.replace('{event_image}', `<img class="register-bg" src="` + this.apiPath + data.imagePath + data.event.image + `" />`)
          body = body.replace('{event_name}', this.event ? this.event.title : '')
          body = body.replace('{event_description}', this.event ? this.event.description : '')

          if(body.indexOf('{event_register_button_form}') >= 0) {
            this.hasPaymentButtonForm = this.isPaidEvent(this.event) ? true : false
            this.hasRegistrationButtonForm = this.isPaidEvent(this.event) ? false : true
          }
              
          body = body.replace('{event_register_button_form}', '')
          if(this.event && this.event.plan_date) {
            let planDate = moment.utc(this.event.plan_date).locale(this.language).format('dddd, D MMM HH:mm')
            body = body.replace('{event_datetime}', planDate)
          } else {
            body = body.replace('{event_datetime}', '-')
          }
          body = body.replace('{event_login_link}', '<a href="' + 'https://' + this.company.url + '">aquí</a>')
          this.html = this.sanitizer.bypassSecurityTrustHtml(style + body)
          this.css = this.sanitizer.bypassSecurityTrustStyle(this.template.css)
        }
      }) 
  }

  getGuestRegistrationFields(data) {
    this.filteredProfileFields = data?.registration_fields;
    let registerFormObject = {};
    this.filteredProfileFields.forEach((f) => {
      registerFormObject[f.field] = new FormControl(
        "",
        f.required && [Validators.required]
      );
    });
    this.fieldrequired = this._translateService.instant(
      "member-type-registration.required"
    );
    this.filteredProfileFields.forEach((f) => {
      if (f.field_type == "select") {
        if (f.field == "business_category") {
          this.selectOptions = data?.categories;
        }
      }
    });
    this.registerForm = new FormGroup(registerFormObject);
  }

  initializeDefaultFields() {
    this.registerForm = new FormGroup({
        name: new FormControl("", [Validators.required]),
        email: new FormControl("", [Validators.required]),
        phone: new FormControl("", [Validators.required]),
        zip_code: new FormControl("", [Validators.required]),
    });
  }

  formatEventRegistrationData(data) {
    this.template = data?.template;
    this.event = data.event;
    this.isLoading = false;
    this.plan = this.event;
    this.activityCities = data?.activity_cities;
    this.sectors = data?.sectors;
    if(this.event) {
        let path = this.event?.plan_type_id > 0 ? '/get-ie-image-plan/' : '/get-image-group-plan/';
        if(this.isImageCenterButton) {
          if(this.event?.orig_image) {
            path = '/get-course-unit-file/'
          }
        }
        let image = this.isImageCenterButton ? (this.event?.orig_image || this.event?.image) : this.event?.image;
        this.eventImage = this.apiPath + path + image;
        this.featuredTitle = this.getFeaturedTitle();
        this.planCreator = data?.created_by;
        if (this.companyId == 32 && this.event?.plan_type_id != 4) {
            this.getUECreatedBy(data?.created_by_ue);
        }

        this.checkLimitReached();
        this.checkPastEvent();

        let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        if (this.plan?.plan_date) {
            this.planDate = moment
                .utc(this.plan.plan_date)
                .locale(this.language)
                .format("dddd, MMM D YYYY, HH:mm");
            this.planDateCanary = moment
                .utc(this.plan.plan_date)
                .subtract(1, "hours")
                .locale(this.language)
                .format("HH:mm");

            this.planDay = moment
                .utc(this.plan.plan_date)
                .locale(this.language)
                .format("D MMMM");

            this.planTime = moment
                .utc(this.plan.plan_date)
                .locale(this.language)
                .format("HH:mm A");

            var date = moment(
                this.plan.plan_date.replace("T", " ").replace(".000Z", "")
            );
            this.planDateValue = this.plan.plan_date.replace("T", " ").replace(".000Z", "");
            var zone = "Europe/Madrid";
            this.calendarStartDate = momenttz.tz(date, zone).format();

            if (this.plan.plan_date < today || moment(this.plan.plan_date).isBefore(moment(new Date()))) {
                this.isPastEvent = true;
            }
        }

        if (this.plan.end_date) {
            this.endDate = moment
            .utc(this.plan.end_date)
            .locale(this.language)
            .format("dddd, MMM D YYYY, HH:mm");
        }

        this.planDescription = this.getEventDescription(this.event);
        if (
            this.planDescription &&
            this.planDescription.indexOf("[canva]") >= 0
        ) {
            var index = this.planDescription.indexOf("[canva]");
            var endIndex = this.planDescription.indexOf("[/canva]");
            var linkLength = endIndex - index;
            var link = this.planDescription.substr(index + 7, linkLength - 7);
            if (
              link &&
              link.indexOf("canva.com") >= 0 &&
              link.indexOf("/watch?embed") < 0
            ) {
              link = link.replace("/watch", "/watch?embed");
            }
    
            let iframeHtml = `<iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;" src="${link}" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe>`;
            let desc = this.planDescription.replace(link, "");
            desc = desc.replace(
              /\[canva\]/g,
              '<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;border-radius: 8px; will-change: transform;">' +
                iframeHtml
            );
            desc = desc.replace(/\[\/canva\]/g, "</div>");
            this.planDescription = desc;
        }
    
        if (
            this.planDescription &&
            this.planDescription.indexOf("[vidalytics]") >= 0
        ) {
            var index = this.planDescription.indexOf("[vidalytics]");
            var endIndex = this.planDescription.indexOf("[/vidalytics]");
            var linkLength = endIndex - index;
            var link = this.planDescription.substr(index + 12, linkLength - 12);
    
            let iframeHtml = `<iframe style="border:none;" width="100%" height="400" id="video-container" src="https://preview.vidalytics.com/embed/${link}"></iframe>`;
            let desc = this.planDescription.replace(link, "");
            desc = desc.replace(/\[vidalytics\]/g, iframeHtml);
            desc = desc.replace(/\[\/vidalytics\]/g, "");
            this.planDescription = desc;
        }
    
        if (
            this.planDescription &&
            this.planDescription.indexOf("</script>") >= 0
        ) {
            this.eventDescription = this.sanitizer.sanitize(
              SecurityContext.SCRIPT,
              this.sanitizer.bypassSecurityTrustScript(this.planDescription)
            );
        } else {
            this.eventDescription = this.sanitizer.sanitize(
              SecurityContext.HTML,
              this.sanitizer.bypassSecurityTrustHtml(this.planDescription)
            );
        }
    
        // Get excerpt
        if(this.planDescription && this.planDescription.length > this.truncate) {
            this.planTruncatedDescription = this.getExcerpt(this.planDescription);
        } else {
            this.planTruncatedDescription = this.planDescription;
        }
    }
    if(this.template) {
        let style = ` <style>
            img.register-bg{max-width:420px;border-radius:8px;object-fit:contain;}
            h1{text-transform:capitalize;}
        </style> `
        let body = this.template.body
        body = body.replace('{event_image}', `<img class="register-bg" src="` + this.apiPath + data.imagePath + data.event.image + `" />`)
        body = body.replace('{event_name}', data.event ? data.event.title : '')
        body = body.replace('{event_description}', data.event ? data.event.description : '')

        if(body.indexOf('{event_register_button_form}') >= 0) {
          this.hasPaymentButtonForm = this.isPaidEvent(this.event) ? true : false
          this.hasRegistrationButtonForm = this.isPaidEvent(this.event) ? false : true
        }
            
        body = body.replace('{event_register_button_form}', '')
        if(data.event && data.event.plan_date) {
          let planDate = moment.utc(data.event.plan_date).locale(this.language).format('dddd, D MMM HH:mm')
          body = body.replace('{event_datetime}', planDate)
        } else {
          body = body.replace('{event_datetime}', '-')
        }
        body = body.replace('{event_login_link}', '<a href="' + 'https://' + data.company.url + '">aquí</a>')
        this.html = this.sanitizer.bypassSecurityTrustHtml(style + body)
        this.css = this.sanitizer.bypassSecurityTrustStyle(this.template.css)
    }
  }

  checkLimitReached() {
    let planParticipants =
    this.event?.CompanyPlanParticipants ||
    this.event?.Company_Group_Plan_Participants;
    if (planParticipants) {
      planParticipants.forEach((participant) => {
        let match = this.planParticipants.some(
          (a) => a.user_id === participant.user_id
        );
        if (!match) {
          this.planParticipants.push(participant);
        }

        let membermatch = this.memberParticipants.some(
          (a) => a.user_id === participant.user_id
        );
        if(!membermatch) {
          if (this.companyId == 12) {
            if (participant?.Company_User?.password) {
              this.memberParticipants.push(participant);
            }
          } else {
            if(participant?.Company_User?.custom_member_type_id > 0) {
              this.memberParticipants.push(participant);
            }
          }
        }

        let guestmatch = this.guestParticipants.some(
          (a) => a.user_id === participant.user_id
        );
        if(!guestmatch) {
          if (this.companyId == 12) {
            if (!participant?.Company_User?.password) {
              this.guestParticipants.push(participant);
            }
          } else {
            if(!(participant?.Company_User?.custom_member_type_id > 0)) {
              this.guestParticipants.push(participant);
            }
          }
        }
      });
    }

    this.seats = parseInt(this.event?.seats) || 0;
    this.planParticipantCount = this.planParticipants.length;

    let available_seats = this.seats - this.planParticipantCount;
    if (this.seats > 0 && available_seats <= 0) {
        this.limitReached = true;
    }

    if(this.event?.guest_seats > 0) {
      if(!(this.memberParticipants?.length < this.event?.guest_seats)) {
        this.limitReached = true;
      }
    }

    return this.limitReached;
  }

  checkPastEvent() {
    let today = moment(new Date()).format('YYYY-MM-DD')
    let planDate = moment(this.event.plan_date).format('YYYY-MM-DD')
    if(today > planDate) {
      this.pastEvent = true
    }
  }

  isPaidEvent(event) {
    const {
      price,
      plan_id,
      product_id,
    } = event

    return (price 
      && parseFloat(price) >= 0
      && plan_id
      && product_id
    ) ? true : false
  }

  getEventTitle(event) {
    return this.language == "en"
      ? event?.title_en
        ? event.title_en || event?.title
        : event?.title
      : this.language == "fr"
      ? event?.title_fr
        ? event?.title_fr || event?.title
        : event?.title
      : this.language == "eu"
      ? event?.title_eu
        ? event?.title_eu || event?.title
        : event?.title
      : this.language == "ca"
      ? event?.title_ca
        ? event?.title_ca || event?.title
        : event?.title
      : this.language == "de"
      ? event?.title_de
        ? event?.title_de || event?.title
        : event?.title
      : event?.title;
  }

  getEventDescription(event) {
    return this.language == "en"
      ? event?.description_en
        ? event?.description_en || event?.description
        : event?.description
      : this.language == "fr"
      ? event?.description_fr
        ? event?.description_fr || event?.description
        : event?.description
      : this.language == "eu"
      ? event?.description_eu
        ? event?.description_eu || event?.description
        : event?.description
      : this.language == "ca"
      ? event?.description_ca
        ? event?.description_ca || event?.description
        : event?.description
      : this.language == "de"
      ? event?.description_de
        ? event?.description_de || event?.description
        : event?.description
      : event?.description;
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

  getExcerpt(description) {
    let charlimit = this.truncate;
    if (!description || description.length <= charlimit) {
      return description;
    }

    let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  getAddress(plan) {
    let address = plan?.address;

    if (!address && this.canAssignMultipleCities && this.activityCities) {
      address = this.activityCities
        .map((data) => {
          return data.city;
        })
        .join(", ");
    }

    return address;
  }

  getUECreatedBy(created_by) {
    this.createdById = created_by ? created_by.id : "";
    this.createdBy = created_by
      ? `${created_by.first_name} ${created_by.last_name}`
      : "";
    this.createdByImage = `${this.apiPath}/${
      created_by ? created_by.image : "empty_avatar.png"
    }`;
  }

  readMore() {
    this.planExpandedDescription = true;
    this.planTruncatedDescription = this.planDescription;
  }

  showLess() {
    this.planExpandedDescription = false;
    if(this.planDescription?.length > this.truncate) {
      this.planTruncatedDescription = this.getExcerpt(this.planDescription);
    } else {
      this.planTruncatedDescription = this.planDescription;
    }
  }

  registerGuest() {
    this.scrollToBottom();
    this.registerAsGuest = true;
  }

  register() {
    this.submitted = true

    let name;
    let email;
    let phone;
    let zip_code;

    if(!this.hasGuestRegistration){
      name = this.registerForm.value.name
      email = this.registerForm.value.email
      phone = this.registerForm.value.phone
      zip_code = this.registerForm.value.zip_code
    }
    let params = {
      event_id: this.event.id,
      invite_guid: this.invite_guid,
      event_title: this.event.title,
    }
    if(this.hasGuestRegistration){
      this.filteredProfileFields.forEach((f) => {
        params[f.field] = this.registerForm.controls[f.field].value
      })
    }

    // Check existing registration
    this._plansService.checkExistingRegistration(params)    
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          if(response) {
            if(response.message == 'exists') {
              this.open(this._translateService.instant('dialog.emailalreadyregistered'), '');
            } else {
              let payload
              if(this.hasGuestRegistration){
                payload = params
              } else {
                payload = {
                  first_name: name.split(' ')[0] ? name.split(' ')[0] : name,
                  last_name : name.split(' ')[1] ? name.split(' ')[1] : '',
                  email: email,
                  phone: phone,
                  zip_code: zip_code,
                  event_id: this.event.id,
                  invite_guid: this.invite_guid,
                  event_title: this.event.title,
                }

                if(this.companyId == 12) {
                    payload = {
                        name: name,
                        email: email,
                        phone: phone,
                        zip_code: zip_code,
                        event_id: this.event.id,
                        invite_email: this.invite_guid,
                        new_alias: this.user?.alias,
                        group_id: this.event.group_id,
                        zoom_link: this.event.zoom_link,
                        event_title: this.event.title,
                        sector: this.selectedSector,
                        fk_company_id: this.event.fk_company_id,
                    }
                }
              }

              if(this.hasGuestRegistration) {
                let valid = this.isValidForm();
                if(valid) {
                  this.proceedRegister(payload);
                } else {
                  this.open(this._translateService.instant('wall.requiredfields'), '');
                }
              } else {
                if(!this.registerForm.errors) {
                  this.proceedRegister(payload);
                } else {
                  this.open(this._translateService.instant('wall.requiredfields'), '');
                }
              }
            }
          } else {
            this.open((this._translateService.instant('dialog.error')), '');
          }
        },
        error => {
          
        });
  }

  isValidForm() {
    let valid = true
    this.errors = {}

    Object.keys(this.registerForm.controls).forEach(key => {
      let proceed = true;

      if(proceed) {
        const controlErrors: ValidationErrors = this.registerForm.controls[key].errors
        if (controlErrors != null) {
          valid = false

          if (controlErrors['email']) {
            this.errors[key] = this._translateService.instant('company-settings.invalidemailaddress')
          } else if (controlErrors['alphabet']) {
            this.errors[key] = this._translateService.instant('company-settings.lettersonly')
          } else if (controlErrors['number']) {
            this.errors[key] = this._translateService.instant('company-settings.numbersonly')
          } else if (controlErrors['minlength']) {
            this.errors[key] = `${this._translateService.instant('dialog.atleast')} ${controlErrors['minlength'].requiredLength} ${this._translateService.instant('dialog.characters')}`
          } else if (controlErrors['maxlength']) {
            this.errors[key] = `${this._translateService.instant('dialog.maximumof')} ${controlErrors['maxlength'].requiredLength} ${this._translateService.instant('dialog.characters')}`
          }
        }
      }
    })

    return valid
  }

  proceedRegister(payload) {
    if(this.companyId == 12) {
        this._plansService.companyRegisterInvite(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
        (data: any) => {
            this.registerComplete = true;
        },
        error => {
            
        });
    } else {
        this._plansService.eventRegister(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
        (data: any) => {
            this.registerComplete = true;
        },
        error => {
            
        });
    }
  }

  pay() {
    let plan_type_id = this.event.plan_type_id > 0 ? this.event.plan_type_id : 4;
    let user_id = this.userId || 0;
    this._router.navigate([`/plan-registration/payment/${this.event.id}/${plan_type_id}/${user_id}`]);
  }

  openTermsDialog() {
    this.isOpenTerms = true;
    this.isOpenPrivacy = false;
  }

  closeTermsPrivacyDialog() {
    this.isOpenTerms = false;
    this.isOpenPrivacy = false;
  }

  openPrivacyDialog() {
    this.isOpenPrivacy = true;
    this.isOpenTerms = false;
  }

  scrollToBottom() {
    window.scrollTo({
      top: 300,
      behavior: "smooth",
    });
    const contentContainer = document.querySelector(".mat-sidenav-content") || window;
    contentContainer.scrollTo({
      top: 300,
      behavior: "smooth",
    });
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy(): void {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
