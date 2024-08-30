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
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { NgImageSliderModule } from 'ng-image-slider';
import { SafeContentHtmlPipe } from "@lib/pipes";
import { NoAccessComponent } from "@share/components";
import get from "lodash/get";

@Component({
  selector: "app-landing-questions",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgImageSliderModule,
    SafeContentHtmlPipe,
    NgOptimizedImage,
    NoAccessComponent,
  ],
  templateUrl: "./landing-questions.component.html"
})
export class TikTokLandingQuestionsComponent {
  private destroy$ = new Subject<void>();

  @Input() id: any;

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
  questionImage: any;
  questionImages: any;
  questionImagesObject: any = [];
  imageSrc: string = `${environment.api}/get-testimonial-image/`
  showOtherImages: boolean = false;
  latinWhatsappUrl : string = '';

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

      this._companyService
      .getLeadsQuestions(this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          const latinQuestion = response?.questions?.find((question:any)=>{
            if(question.location_id == 2){
              return question
            }
          }) || {}
          if(latinQuestion){
            const questionObj = latinQuestion?.question_rules?.find((item:any) => item.question_id == 25)
            this.latinWhatsappUrl = questionObj.whatsapp_community
          }
        },
        (error) => {
          
        }
      );
    this.initializePage();
  }

  initializePage() {
    this.fetchQuestionsData();
  }

  fetchQuestionsData() {
    this._companyService.getLandingQuestionsById(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          this.questionnaire = data?.question;
          if(this.questionnaire?.image && this.questionnaire?.image_filename) {
            this.questionImage = `${environment.api}/get-landing-page-image/${this.questionnaire?.image_filename}`;
          }
          this.questionItems = data?.question?.items;
          this.questionRules = data?.question?.question_rules;
          this.questionImages = data?.question?.question_images;
          if(this.questionImages?.length > 0) {
            this.questionImagesObject = [];
            this.questionImages?.forEach(image => {
              this.questionImagesObject.push({
                image: `${this.imageSrc}${image?.image}`,
                thumbImage: `${this.imageSrc}${image?.image}`,
              })
            });
          }
          this.showOtherImages = this.questionnaire?.images_beforebutton == 1 ? true : false;
          this.isloading = false;
        },
        error => {
          console.log(error)
        }
      )
  }

  submit() {
    const isValid = this.isValidForm()
    const emailQues = this.questionItems?.find(qi => qi?.title == 'Correo electrónico')

    let validEmail = true
    if(emailQues){
      validEmail = this.emailValidator(emailQues?.answer?.trim())
    }
    if(isValid && validEmail){
      let whatsAppCommunityURL:string = "";
      let locAnsObj = this.questionItems?.find(qi => {
        return qi.title == 'Selecciona tu ubicación'
      });
      let locAns = {
        choice : ''
      };
      if(locAnsObj){
        locAns.choice = locAnsObj?.question_multiple_choice_options.find((ans) => locAnsObj?.answer == ans.id)?.choice || '';
      }
      if(locAns && locAns?.choice == 'América Latina'){
        whatsAppCommunityURL = this.latinWhatsappUrl;
      }else{
        whatsAppCommunityURL = this.getMappedCommunityFromAnswers();
      }
      let email = '';
      if(this.questionItems?.length > 0) {
        let email_row = this.questionItems?.filter(qi => {
          return qi.title == 'Correo electrónico' || qi.title == 'Email' || qi.title == 'Email address'
        })
        if(email_row?.length > 0) {
          email = email_row[0].answer;
        }
      }
  
      if(whatsAppCommunityURL) {
        let params = {
          location: this.questionnaire?.Location_id?.toString(),
          city: this.city,
          country: this.country,
          ip_address: this.ipAddress,
          company_id: this.companyId,
          whatsapp_community: whatsAppCommunityURL,
          question_id: this.questionItems?.length > 0 ? this.questionItems[0].question_id : 0, 
          created_by: this.userId || null,
          question_items: this.questionItems,
          email_recipient: email,
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
  }

  emailValidator(email) {
      if(!email) return false
      const emailRegEx = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
      const isEmailValid = emailRegEx?.test(email)

      if(!isEmailValid){
        this.open(
          this._translateService.instant("dialog.validemail"),
          ""
        );
      }
      return isEmailValid
  }


  isValidForm() {
    let unanswered = this.questionItems?.filter(qi => {
      return !qi.answer
    })
    if(unanswered?.length){
      this.open(
        this._translateService.instant("dialog.questionnairemandatoryfields"),
        ""
      );
    }

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
    } else {
      if(this.questionRules?.length == 1) {
        whatsapp_community = this.questionRules[0].whatsapp_community;
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