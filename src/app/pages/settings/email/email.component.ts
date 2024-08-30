import { CommonModule, Location } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BreadcrumbComponent, PageTitleComponent } from "@share/components";
import { CompanyService, LocalService } from "@share/services";
import { NgxPaginationModule } from "ngx-pagination";
import { QuillModule } from 'ngx-quill';
import { environment } from "@env/environment";
import get from "lodash/get";

@Component({
  standalone: true,
  selector: "app-email",
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    NgxPaginationModule,
    QuillModule,
    BreadcrumbComponent,
    PageTitleComponent,
  ],
  templateUrl: "./email.component.html",
})
export class EmailComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;
  @Input() type: any;

  languageChangeSubscription;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  level5Title: string = "";
  level6Title: string = "";
  userId: any;
  companyId: any;
  language: any;
  typeLabel: any;
  subject: any;
  body: any;
  email: any;
  companies: any;
  companyName: any;
  primaryColor: any;
  buttonColor: any;
  settings: any = [];
  editorToUse: any = "tinymce";
  editor: any;
  emailMapping: any = [];
  shortcodes: any = [];
  p: any;
  hasDifferentTemplate: boolean = false;
  memberTypes: any;
  selectedMemberType: any = "";
  differentEmailSetting: any = [];

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");
    this.companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";
    if (!this.companies) {
      this.companies = get(
        await this._companyService.getCompanies().toPromise(),
        "companies"
      );
    }

    if (this.companies) {
      let company = this._companyService.getCompany(this.companies);
      if (company && company[0]) {
        this.companyId = company[0].id;
        this.companyName = company[0].entity_name;
        this.primaryColor = company[0].primary_color;
        this.buttonColor = company[0].button_color
          ? company[0].button_color
          : company[0].primary_color;
        this._localService.setLocalStorage(
          environment.lscompanyId,
          this.companyId
        );
      }
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
    this.initData();
    this.fetchSettingsEmailData();
  }

  initData() {
    this.emailMapping = [
      { id: 49, type: "buy_course", title_en: "Course subscription email" },
      { id: 38, type: "change_password", title_en: "Change password" },
      { id: 80, type: "choose_plan", title_en: "Choose plan email" },
      { id: 81, type: "complete_data", title_en: "Complete data email" },
      { id: 79, type: "confirm_email", title_en: "Confirmation email" },
      { id: 95, type: "contact_buddy", title_en: "Contact Buddy email" },
      { id: 52, type: "event_invite", title_en: "Event invite" },
      { id: 76, type: "failed_payment", title_en: "Failed payment email" },
      { id: 47, type: "inviter", title_en: "Inviter email" },
      { id: 93, type: "job_register", title_en: "Job registration email" },
      { id: 32, type: "join", title_en: "Join activity email" },
      { id: 53, type: "member_created", title_en: "Created member email" },
      {
        id: 70,
        type: "new_require_approval",
        title_en: "New Registration (Require Approval) email to admin",
      },
      { id: 31, type: "register", title_en: "Registration email" },
      {
        id: 92,
        type: "register_admin",
        title_en: "Successful user registration email",
      },
      { id: 84, type: "reject_content", title_en: "Reject content email" },
      { id: 33, type: "reminder", title_en: "Event reminder email" },
      {
        id: 69,
        type: "require_approval",
        title_en: "New Registration (Require Approval) email to customer",
      },
      {
        id: 46,
        type: "sales_person_guest",
        title_en: "Sales person assigned to guest email",
      },
      { id: 74, type: "send_one_to_one", title_en: "Send one to one" },
      {
        id: 77,
        type: "send_payment_link",
        title_en: "Send payment link email",
      },
      { id: 39, type: "send_reference", title_en: "Send reference" },
      { id: 40, type: "support_ticket", title_en: "Support ticket email" },
      {
        id: 34,
        type: "thank_you",
        title_en: "Event participation Thank you email",
      },
      { id: 99, type: "buddy_accepted", title_en: "Buddy accepted email" },
      { id: 102, type: "activity_comment", title_en: "Activity comment email" },
      {
        id: 109,
        type: "course_wall_question",
        title_en: "Course wall question email",
      },
      {
        id: 110,
        type: "course_wall_answer",
        title_en: "Course wall answer email",
      },
      { id: 111, type: "buddy_rejected", title_en: "Buddy rejected email" },
      {
        id: 112,
        type: "for_approval_content",
        title_en: "Content for approval email",
      },
      {
        id: 113,
        type: "for_approval_join_club",
        title_en: "Request to join club email",
      },
      { id: 115, type: "club_comment", title_en: "Club comment email" },
      {
        id: 116,
        type: "club_activity_created",
        title_en: "Club activity created email",
      },
      {
        id: 117,
        type: "reminder_trial_end",
        title_en: "End of trial reminder email",
      },
      {
        id: 118,
        type: "reminder_member_expire",
        title_en: "Membership expiration reminder email",
      },
      {
        id: 119,
        type: "membership_expired",
        title_en: "Membership expired email",
      },
      { id: 120, type: "renewal", title_en: "Renewal email" },
      {
        id: 121,
        type: "wall_comment",
        title_en: "Response to posts/questions email",
      },
      {
        id: 122,
        type: "cancel_subscription",
        title_en: "Cancel subscription email",
      },
      { id: 122, type: "share_by_email", title_en: "Share by email" },
      { id: 125, type: "tutor_question", title_en: "Tutor question email" },
      {
        id: 127,
        type: "community_access",
        title_en: "Access to the community email",
      },
      {
        id: 130,
        type: "resend_course",
        title_en: "Resend student access email",
      },
      {
        id: 134,
        type: "wall_upload",
        title_en: "Resources uploaded in communities email",
      },
      {
        id: 146,
        type: "confirm_attendance",
        title_en: "Confirm attendance email",
      },
      {
        id: 148,
        type: "attendance_confirmed",
        title_en: "Confirmed attendance email",
      },
      {
        id: 150,
        type: "student_credits_data_email",
        title_en: "Student credits data email",
      },
      {
        id: 152,
        type: "course_completed",
        title_en: "Course completed email",
      },
      {
        id: 152,
        type: "questionnaire_completed",
        title_en: "Submitted questions email",
      },
      {
        id: 157,
        type: "join_in_charge",
        title_en: "Joined person to In charge email",
      },
      {
        id: 158,
        type: "admin_confirmed_attendance",
        title_en: "Admin confirmed attendance email",
      },
      {
        id: 160,
        type: "reminder_teacher",
        title_en: "Event reminder email (teacher)",
      },
      {
        id: 161,
        type: "incoming_voice_call",
        title_en: "Incoming voice call email",
      },
      {
        id: 162,
        type: "incoming_video_call",
        title_en: "Incoming video call email",
      },
      {
        id: 163,
        type: "incoming_chat",
        title_en: "Incoming chat email",
      },
    ];
    this.shortcodes = [
      {
        code: "{company_name}",
        description: this._translateService.instant("email.shcompanyname"),
      },
      {
        code: "{company_url}",
        description: this._translateService.instant("email.shcompanyurl"),
      },
      {
        code: "{user_name}",
        description: this._translateService.instant("email.shusername"),
      },
      {
        code: "{user_full_name}",
        description: this._translateService.instant("email.shuserfullname"),
      },
      {
        code: "{user_password}",
        description: this._translateService.instant("email.shuserpassword"),
      },
      {
        code: "{user_email}",
        description: this._translateService.instant("email.shuseremail"),
      },
      {
        code: "{user_phone}",
        description: this._translateService.instant("email.shuserphone"),
      },
      {
        code: "{user_type}",
        description: this._translateService.instant("email.shusertype"),
      },
      {
        code: "{event_name}",
        description: this._translateService.instant("email.sheventname"),
      },
      {
        code: "{event_datetime}",
        description: this._translateService.instant("email.sheventdatetime"),
      },
      {
        code: "{event_zoomlink}",
        description: this._translateService.instant("email.shzoomlink"),
      },
      {
        code: "{event_surveylink}",
        description: this._translateService.instant("email.shsurveylink"),
      },
      {
        code: "{changepassword_link}",
        description: this._translateService.instant(
          "email.shchangepasswordlink"
        ),
      },
      {
        code: "{recipient_name}",
        description: this._translateService.instant("email.shrecipientname"),
      },
      {
        code: "{sender_name}",
        description: this._translateService.instant("email.shsendername"),
      },
      {
        code: "{reference_name}",
        description: this._translateService.instant("email.shreferencename"),
      },
      {
        code: "{reference_email}",
        description: this._translateService.instant("email.shreferenceemail"),
      },
      {
        code: "{reference_phone}",
        description: this._translateService.instant("email.shreferencephone"),
      },
      {
        code: "{reference_description}",
        description: this._translateService.instant(
          "email.shreferencedescription"
        ),
      },
      {
        code: "{member_link}",
        description: this._translateService.instant("email.shmemberlink"),
      },
      {
        code: "{ticket_subject}",
        description: this._translateService.instant("email.shticketsubject"),
      },
      {
        code: "{ticket_description}",
        description: this._translateService.instant(
          "email.shticketdescription"
        ),
      },
      {
        code: "{sales_person_name}",
        description: this._translateService.instant("email.shsalespersonname"),
      },
      {
        code: "{guest_name}",
        description: this._translateService.instant("email.shguestname"),
      },
      {
        code: "{invited_by}",
        description: this._translateService.instant("email.shinvitedby"),
      },
      {
        code: "{event_description}",
        description: this._translateService.instant("email.shdescription"),
      },
      {
        code: "{event_image}",
        description: this._translateService.instant("email.sheventimage"),
      },
      {
        code: "{invite_link}",
        description: this._translateService.instant("email.shinvitelink"),
      },
      {
        code: "{invite_link_long}",
        description: this._translateService.instant("email.shinvitelinklong"),
      },
      {
        code: "{sender_message}",
        description: this._translateService.instant("email.shsendermessage"),
      },
      {
        code: "{payment_link}",
        description: this._translateService.instant("email.shpaymentlink"),
      },
      {
        code: "{complete_registration_link}",
        description: this._translateService.instant(
          "email.shcompleteregistrationlink"
        ),
      },
      {
        code: "{confirmemail_link}",
        description: this._translateService.instant("email.shconfirmemaillink"),
      },
      {
        code: "{content_name}",
        description: this._translateService.instant("email.shcontentname"),
      },
      {
        code: "{job_title}",
        description: this._translateService.instant("email.shjobtitle"),
      },
      {
        code: "{job_url}",
        description: this._translateService.instant("email.shjoburl"),
      },
      {
        code: "{job_cv}",
        description: this._translateService.instant("email.shjobcv"),
      },
      {
        code: "{comment}",
        description: this._translateService.instant("club-details.comment"),
      },
      {
        code: "{course_name}",
        description: this._translateService.instant("email.shcoursename"),
      },
      {
        code: "{course_question}",
        description: this._translateService.instant("email.shcoursequestion"),
      },
      {
        code: "{course_answer}",
        description: this._translateService.instant("email.shcourseanswer"),
      },
      {
        code: "{mentor_name}",
        description: this._translateService.instant("buddy.mentorname"),
      },
      {
        code: "{club_name}",
        description: `${this._translateService.instant(
          "signup.name"
        )} ${this._translateService.instant(
          "courses.of"
        )} ${this._translateService.instant("your-admin-area.club")}`,
      },
      {
        code: "{trial_end}",
        description: this._translateService.instant("email.shtrialend"),
      },
      {
        code: "{expire_date}",
        description: this._translateService.instant("email.shexpiredate"),
      },
      {
        code: "{renew_date}",
        description: this._translateService.instant("email.shrenewdate"),
      },
      {
        code: "{payment_methods_link}",
        description: this._translateService.instant(
          "email.shpaymentmethodslink"
        ),
      },
      {
        code: "{tutor_question}",
        description: this._translateService.instant("email.shtutorquestion"),
      },
      {
        code: "{community_name}",
        description: this._translateService.instant("email.shcommunityname"),
      },
      {
        code: "{resource_name}",
        description: this._translateService.instant("email.shresourcename"),
      },
      {
        code: "{activity_code}",
        description: this._translateService.instant("edit-plan.activitycode"),
      },
      {
        code: "{credits}",
        description: this._translateService.instant("course-create.credits"),
      },
      {
        code: "{rating}",
        description: this._translateService.instant("wall.rating"),
      },
      {
        code: "{community_link}",
        description: `${this._translateService.instant("plan-create")} URL`,
      },
    ];
  }

  fetchSettingsEmailData() {
    this._companyService
      .fetchSettingsEmailData(this.id, this.companyId, this.type)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.settings = data?.other_settings?.content || [];
          this.mapEmailSettings(data);
          this.initializeBreadcrumb();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  mapEmailSettings(data) {
    let other_setting_section_options = data?.other_setting_section_options;
    this.differentEmailSetting = other_setting_section_options.filter((ots) => {
      return ots.title_en == "Different welcome email template for members";
    });
    other_setting_section_options.forEach((os) => {
      let setting_name = "Different welcome email template for members";
      if (os.title_en == setting_name) {
        this.hasDifferentTemplate = os.active ? true : false;
        if (!this.hasDifferentTemplate) {
          this.memberTypes = [];
          this.getEmail(data);
        } else {
          this.getCustomMemberTypes(data);
        }
      }
    });
  }

  getEmail(data) {
    this.email = data.email;
    if (this.email) {
      this.subject = this.email.subject;
      this.body = this.email.body;
    }
  }

  getCustomMemberTypes(data) {
    this.memberTypes = data?.member_types;
    this.memberTypes?.forEach((type) => {
      type.body = "";
      type.subject = "";
    });
    this.getCustomMemberEmails(data);
  }

  getCustomMemberEmails(data) {
    this.email = data?.custom_member_emails;
    if (this.email && this.email?.length > 0) {
      this.email.forEach((e) => {
        this.memberTypes?.forEach((m, index) => {
          if (m.id == e.custom_member_type_id) {
            m.subject = e.subject;
            m.body = e.body;
          }
        });
      });
      this.selectedMemberType = this.memberTypes[0].id;
    }
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.modules"
    );
    this.level3Title = this._translateService.instant(
      "company-settings.communication"
    );
    this.level4Title = this._translateService.instant(
      "company-settings.automaticemails"
    );
    this.level5Title = this.getEmailType(this.type);
    this.level6Title = "";
  }

  getEmailType(type) {
    let title = "";
    if (this.settings) {
      let mapping_title = "";
      let mapping_row =
        this.emailMapping &&
        this.emailMapping.filter((em) => {
          return em.type == this.type;
        });
      if (mapping_row && mapping_row[0]) {
        mapping_title = mapping_row[0].title_en;
      }

      let setting =
        this.settings &&
        this.settings.filter((setting) => {
          return setting.title_en == mapping_title;
        });
      if (setting && setting[0]) {
        title =
          this.language == "en"
            ? setting[0].title_en
            : this.language == "fr"
            ? setting[0].title_fr
            : setting[0].title_es;
      }
    }

    return title;
  }

  save() {
    if (!this.hasDifferentTemplate) {
      if (!this.subject || !this.body) {
        return false;
      }

      let params = {
        company_id: this.companyId,
        type: this.type,
        subject: this.subject,
        body: this.body,
      };

      this._companyService
        .updateEmail(this.companyId, this.type, params)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
          },
          (error) => {
            console.log(error);
          }
        );
    }

    if (this.hasDifferentTemplate) {
      let params = {
        company_id: this.companyId,
        type: this.type,
        memeber: this.memberTypes,
      };
      this._companyService
        .updateMemberEmail(this.companyId, this.type, params)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  getSettingItemTitle(item) {
    return this.language == "en"
      ? item.title_en
      : this.language == "fr"
      ? item.title_fr
      : this.language == "eu"
      ? item.title_eu
      : this.language == "ca"
      ? item.title_ca
      : this.language == "de"
      ? item.title_de
      : item.title_es;
  }

  getSettingItemDescription(item) {
    return this.language == "en"
      ? item.description_en
      : this.language == "fr"
      ? item.description_fr
      : this.language == "eu"
      ? item.description_eu
      : this.language == "ca"
      ? item.description_ca
      : this.language == "de"
      ? item.description_de
      : item.description_es;
  }

  toggleChange(event, item) {
    if (event) {
      if (this.differentEmailSetting) {
        this.differentEmailSetting.forEach((setting) => {
          if (setting.id == item.id) {
            setting.active = 1;
          }
        });
      }
      this._companyService
        .activateOtherSetting(item.id, this.companyId, {})
        .subscribe(
          async (response) => {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
          },
          (error) => {
            console.log(error);
          }
        );
    } else {
      if (this.differentEmailSetting) {
        this.differentEmailSetting.forEach((setting) => {
          if (setting.id == item.id) {
            setting.active = 0;
          }
        });
      }
      this._companyService
        .deactivateOtherSetting(item.id, this.companyId, {})
        .subscribe(
          async (response) => {
            if (response) {
              this.open(
                this._translateService.instant("dialog.savedsuccessfully"),
                ""
              );
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }
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