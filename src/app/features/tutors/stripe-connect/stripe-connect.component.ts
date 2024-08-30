import { CommonModule } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { PageTitleComponent } from "@share/components";
import { environment } from "@env/environment";
import {
  LocalService,
  CompanyService,
} from "src/app/share/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";
import { TutorsService } from "@features/services";
import get from "lodash/get";

@Component({
  selector: "app-stripe-connect",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    RouterModule,
    PageTitleComponent,
  ],
  templateUrl: "./stripe-connect.component.html",
})
export class StripeConnectComponent {
  private destroy$ = new Subject<void>();

  userId: any;
  companyId: any;
  language: any;
  pageTitle: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  features: any;
  domain: any;
  tutorsFeature: any;
  tutorsFeatureId: any;
  hasCourses: boolean = false;
  coursesFeatureId: any;
  otherSettings: any;
  me: any;
  roles: any;
  courses: any;
  tutorTypes: any;
  packages: any;
  hasDifferentStripeAccount: boolean = false;
  hasCustomMemberTypeSettings: boolean = false;
  hasMultipleStripeAccountSetting: boolean = false;
  tutor: any;
  accountIds: any;
  otherStripeAccounts: any;
  stripeAccounts: any;
  hasDifferentStripeAccounts: boolean = false;
  isLoading: boolean = true;
  isStripeRestricted:boolean = false

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _tutorsService: TutorsService,
    private _snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || 'es');

    this.companies = get(
      await this._companyService.getCompanies().toPromise(),
      "companies"
    );

    if (this.companies) {
      let company = this._companyService.getCompany(this.companies);
      if (company && company[0]) {
        this.companyId = company[0].id;
        this.primaryColor = company[0].primary_color;
        this.buttonColor = company[0].button_color
          ? company[0].button_color
          : company[0].primary_color;
      }
    }

    this.features = this._localService.getLocalStorage(environment.lsfeatures)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures))
      : "";
    if (!this.features) {
      this.features = await this._companyService
        .getFeatures(this.domain)
        .toPromise();
    }
    let tutorsFeature = this.features.filter(f => {
      return f.feature_name == "Tutors"
    })

    if(tutorsFeature && tutorsFeature[0]) {
      this.tutorsFeature = tutorsFeature[0]
      this.tutorsFeatureId = tutorsFeature[0].id
    }

    let coursesFeature = this.features.filter(f => {
      return f.feature_name == "Courses"
    })

    if(coursesFeature && coursesFeature[0]) {
      this.hasCourses = true
      this.coursesFeatureId = coursesFeature[0].id
    }

    this.getSettings();
  }

  getSettings() {
    if(this.hasCourses) {
      this._tutorsService.getTutorPrefetch(this.companyId, this.userId, this.tutorsFeatureId, this.coursesFeatureId).subscribe(data => {
        let subfeatures = data[0] ? data[0]['subfeatures'] : []
        this.otherSettings = data[1] ? data[1]['other_settings'] : []
        this.me = data[2] ? data[2]['CompanyUser'] : []
        this.roles = data[3] ? data[3]['role'] : []
        this.courses = data[4] ? data[4]['courses'] : []
        this.tutorTypes = data[5] ? data[5]['types'] : []
        this.packages = data[6] ? data[6]['packages'] : []
        let courseSubfeatures = data[7] ? data[7]['subfeatures'] : []
        this.mapSubfeatures(subfeatures, courseSubfeatures)
        this.getOtherSettings()
        this.getTutor()
      }, error => {
          
      })
    } else {
      this._tutorsService.getTutorMinPrefetch(this.companyId, this.userId, this.tutorsFeatureId).subscribe(data => {
        let subfeatures = data[0] ? data[0]['subfeatures'] : []
        this.otherSettings = data[1] ? data[1]['other_settings'] : []
        this.me = data[2] ? data[2]['CompanyUser'] : []
        this.roles = data[3] ? data[3]['role'] : []
        this.courses = data[4] ? data[4]['courses'] : []
        this.tutorTypes = data[5] ? data[5]['types'] : []
        this.packages = data[6] ? data[6]['packages'] : []
        this.mapSubfeatures(subfeatures, [])
        this.getOtherSettings()
        this.getTutor()
      }, error => {
          
      })
    }
  }

  async mapSubfeatures(subfeatures, courseSubfeatures) {
    if(courseSubfeatures?.length > 0) {
      this.hasDifferentStripeAccount = courseSubfeatures.some(a => a.name_en == 'Different Stripe accounts' && a.active == 1)
    }
  }

  getOtherSettings() {
    if(this.otherSettings) {
      this.otherSettings.forEach(m => {
        if(m.title_es == 'Stripe') {
          if(m.content) {
            let customMemberTypeSettings = m.content.filter(c => {
              return c.name_EN && c.name_EN.indexOf('Require Stripe payment on specific member types') >= 0
            })
            if(customMemberTypeSettings && customMemberTypeSettings[0]) {
              this.hasCustomMemberTypeSettings = customMemberTypeSettings[0].active == 1 ? true : false
            }

            let stripeSettings = m.content.filter(c => {
              return c.title_en.indexOf('Multiple Stripe Accounts') >= 0
              })

            if(stripeSettings && stripeSettings[0]) {
              this.hasMultipleStripeAccountSetting = stripeSettings[0].active == 1 ? true : false
            }
          }
        }
      })

      if(!this.hasMultipleStripeAccountSetting) { this.hasDifferentStripeAccount = false }
    }
  }

  getTutor() {
    this._tutorsService.getTutor(this.userId).subscribe(
      async response => {
        this.tutor = response.tutor

        if(this.hasDifferentStripeAccount && this.tutor) { 
          this.getTutorAccountIds(this.tutor?.user_id) 
        } else {
          this.loadStripe()
        }
      },
      error => {
        console.log(error);
      }
    )
  }

  getTutorAccountIds(userId) {
    this._tutorsService.getTutorAccountIds(userId, this.companyId)
    .subscribe(
      response => {
        this.accountIds = response.account_ids
        this.getStripeAccounts()
      },
      error => {
        console.log(error)
      }
    )
  }

  getStripeAccounts() {
    this._tutorsService.getStripeAccountsId(this.companyId)
    .subscribe(
      response => {
        this.otherStripeAccounts = response['other_stripe_accounts']
        this.loadStripe('multiple')
      },
      error => {
        console.log(error)
      }
    )
  }

  loadStripe(mode: string = '') {
    let stripeAccounts: any[] = []
    if(mode == 'multiple') {
      this.otherStripeAccounts?.forEach(stripe => {
        let course_stripe_match = this.courses.some(a => a.other_stripe_account_id === stripe.id)
        
        let course_tutor_match = false
        let course = this.courses?.find((f) => f.other_stripe_account_id == stripe.id)
        
        if(course?.course_tutors?.length > 0) {
          course_tutor_match = course?.course_tutors?.some(a => a.tutor_id == this.tutor?.id)
        } else {
          if(course?.tutor_ids?.length > 0) {
            course_tutor_match = course?.tutor_ids?.some(a => a == this.tutor?.id)
          }
        }

        let account_match = this.accountIds?.find((f) => f.stripe_id == stripe.id)
        
        if((course_stripe_match && course_tutor_match) || account_match) {
          let account = this.accountIds?.find((f) => f.stripe_id == stripe.id)
          stripeAccounts.push({
            id: stripe.id,
            name: stripe.name,
            account_id: account?.account_id || '',
            course_id: course?.id,
            status: '',
            secret_key: stripe?.secret_key,
            publishable_key: stripe?.publishable_key,
          })
        }

        if(this.accountIds?.length == 0 && course_stripe_match && course_tutor_match) {
          let match =  stripeAccounts.some(a => a.id === stripe.id)
          if(!match) {
            stripeAccounts.push({
              id: stripe.id,
              name: stripe.name,
              account_id: '',
              course_id: course?.id,
              status: '',
              secret_key: stripe.secret_key,
              publishable_key: stripe?.publishable_key,
            })
          }
        }
      })
    }
    this.stripeAccounts = stripeAccounts
    if(this.stripeAccounts?.length > 0) {
      this.getStripeAccountStatus();
    }
    this.isLoading = false;
  }

  getStripeAccountStatus() {
    let params = {
      company_id: this.companyId,
      stripe_accounts: this.stripeAccounts
    }
    this._tutorsService.getStripeConnectAccountStatus(params).subscribe(
      async response => {
        let stripe_accounts = response?.stripe_accounts;
        if(stripe_accounts?.length > 0 && this.stripeAccounts?.length > 0) {
          this.stripeAccounts?.forEach(account => {
            let account_row = stripe_accounts?.filter(acc => {
              return acc.id == account.id
            })
            if(account_row?.length > 0) {
              account.status = account_row[0].status
            }
          })
        }

        this.isStripeRestricted = stripe_accounts?.some( acc => acc?.status == 'incomplete')
      }
    )
  }

  configureStripeConnect(item){
    let params = {}
    if(this.hasDifferentStripeAccounts || this.otherStripeAccounts?.length > 1){
      params['has_diff_stripe_account'] = this.hasDifferentStripeAccounts
      params['user_id'] = this.userId
      params['tutor_id'] = this.tutor?.id
      params['course_id'] = item?.course_id
      params['company_id'] = this.companyId
      params['stripe_id'] = item.id
    }

    this._tutorsService.configureStripeConnect(this.userId, this.tutor?.id, this.companyId, params).subscribe(
      async response => {
        if(response?.stripe_url){
          window.open(response.stripe_url, "_self")
        } else{
          location.reload()
        }
      }
    )
  }

  getStripeLoginLink(item) {
    let params = {
      company_id: this.companyId,
      account_id: item.account_id,
      stripe_id: item.id,
      multiple: this.otherStripeAccounts?.length > 1 ? 1 : 0,
    }
    
    this._tutorsService.getStripeLoginLink(params).subscribe(
      async response => {
        if(response?.loginLink){
          window.open(response.loginLink, "_blank")
        } else {
          
        }
      }
    )
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
