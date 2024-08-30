import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import {
  CompanyService,
  LocalService,
  UserService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NoAccessComponent } from "@share/components";
import get from "lodash/get";

@Component({
  selector: "app-questions",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgOptimizedImage,
    NoAccessComponent,
  ],
  templateUrl: "./questions.component.html"
})
export class TikTokQuestionsComponent {
  private destroy$ = new Subject<void>();

  @Input() slug: any;

  languageChangeSubscription;
  userId: any;
  companyId: any;
  language: any;
  isloading: boolean = true;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  company: any;
  domain: any;
  country: any = 'Spain';
  city: any = '';
  ipAddress: any = '';
  questionnaire: any;
  questionItems: any;
  questionRules: any;
  formSubmitted: boolean = false;

  constructor(
    private _router: Router,
    private _companyService: CompanyService,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslanguage) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
        this.domain = company[0].domain
        this.companyId = company[0].id
        this.domain = company[0].domain
        this.primaryColor = company[0].primary_color
        this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
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
    this.fetchQuestionsData();
  }

  fetchQuestionsData() {
    this._userService.getUserGeolocation('')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          this.country = data?.country;
          this.city = data?.city;
          this.ipAddress = data?.ip_address
          this.getQuestions();
        },
        error => {
          console.log(error)
        }
      )
  }

  getQuestions() {
    this._companyService.getLandingQuestions(this.country)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          this.questionnaire = data?.question;
          this.questionItems = data?.question?.items;
          this.questionRules = data?.question?.question_rules;
          this.isloading = false;
        },
        error => {
          console.log(error)
        }
      )
  }

  submit() {
    let whatsAppCommunityURL = this.getMappedCommunityFromAnswers();

    if(whatsAppCommunityURL) {
      let params = {
        location: this.slug,
        city: this.city,
        country: this.country,
        ip_address: this.ipAddress,
        company_id: this.companyId,
        whatsapp_community: whatsAppCommunityURL,
        question_id: this.questionItems?.length > 0 ? this.questionItems[0].question_id : 0, 
        created_by: this.userId || null,
        question_items: this.questionItems,
      };

      this._companyService.submitAnswerToQuestions(params).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.sentsuccessfully"),
            ""
          );
          this.formSubmitted = true;
          setTimeout(() => {
            // window.open(whatsAppCommunityURL, "_self");
            location.href = whatsAppCommunityURL;
          }, 1000);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  isValidForm(question_items) {
    let unanswered = question_items?.filter(qi => {
      return !qi.answer
    })

    return unanswered?.length == 0 ? true : false
  }

  getMappedCommunityFromAnswers() {
    let whatsapp_community = '';

    let rule_items_match: any[] = [];
    let rule_match: any[] = [];

    if(this.questionRules?.length > 0) {
      this.questionRules?.forEach(qr => {
        if(qr.question_rule_items?.length > 0) {
          qr.question_rule_items?.forEach((qri, index) => {
            let rule_item_match = false
            let question_item = this.questionItems?.filter(qi => {
              return qi.id == qri.question_item_id
            })
            let val = ''
            if(question_item?.length > 0) {
              if(question_item[0].question_type_id == 1) {
                let choice = question_item[0]?.question_multiple_choice_options?.filter(qmco => {
                  return qmco.id == question_item[0].answer && qmco.question_item_id == question_item[0]?.id
                })
                if(choice?.length > 0) {
                  val = choice[0].choice
                }
              } else {
                val = question_item[0].answer
              }
            }

            if(qri.condition && qri.value || (!qri.condition && !qri.value)) {
              if(qri.condition == 'equals' && qri.value == val) {
                rule_item_match = true
              } else if(qri.condition == 'contains' && val?.toLowerCase()?.indexOf(qri.value?.toLowerCase()) >= 0) {
                rule_item_match = true
              }
  
              rule_items_match.push({
                id: qr.id,
                condition: qri.condition,
                match: (!qri.condition && !qri.value) ? true : rule_item_match,
                operator: qri.operator,
                whatsapp_community: qr.whatsapp_community,
              })
            }
          })
        }
        
        if(rule_items_match?.length > 0) {
          let filtered_rule_items_match = rule_items_match?.filter(m => {
            return m.match && m.condition
          })
          if(filtered_rule_items_match?.length == 0) { }
          else {
            filtered_rule_items_match?.forEach((rim, index) => {
              if(rim.match == true && index == 0) {
                rule_match.push({
                  idx: index,
                  passed: true,
                  whatsapp_community: rim.whatsapp_community,
                })
              } else if(index > 0) {
                if(rim.match == true) {
                  if(filtered_rule_items_match[index-1].operator == 'and') {
                    if(rim.match == true) {
                      rule_match.push({
                        idx: index,
                        passed: true,
                        whatsapp_community: rim.whatsapp_community,
                      })
                    } else {
                      rule_match.push({
                        idx: index,
                        passed: false,
                        whatsapp_community: rim.whatsapp_community,
                      })
                    }
                  } else if(filtered_rule_items_match[index-1].operator == 'or') {
                    rule_match.push({
                      idx: index,
                      passed: true,
                      whatsapp_community: rim.whatsapp_community,
                    })
                  }
                }
              }
            })
          }
        }
      })
    }

    if(rule_match?.length > 0) {
      let failed_mapping = rule_match?.filter(m => {
        return !m.passed
      })
      if(failed_mapping?.length > 0) {

      } else {
        whatsapp_community = rule_match[0].whatsapp_community;
      }
    }
    return whatsapp_community;
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