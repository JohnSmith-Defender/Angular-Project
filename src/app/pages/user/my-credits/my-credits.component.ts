import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { PageTitleComponent } from '@share/components';
import { CompanyService, LocalService, UserService } from '@share/services';
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "@env/environment";
import moment from "moment";
import get from 'lodash/get';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule,
        MatTableModule,
        MatSortModule,
        MatSnackBarModule,
        PageTitleComponent
    ],
    templateUrl: './my-credits.component.html',
})
export class MyCreditsComponent {
    @Input() mode: any;

    userId: any
    companyId: any
    language: any
    userCredits: any = []
    selectedId: any
    name: any
    companies: any
    primaryColor: any
    buttonColor: any
    domain: any
    features: any
    subfeatures: any
    packagesDataSource: any
    languages: any
    userCreditsDisplayedColumns: any[] = []
    showBuyCreditsModal: boolean = false
    packages: any = []
    selectedCreditpackage: any = 0
    user:any
    featureId: any;
    courseFeatureId: any;
    courses: any = [];
    separateCourseCredits: any;
    hasDifferentStripeAccount: any;
    userCourseCredits: any;
    pageTitle: any;
    isLoading: boolean = false;
    userTotalCredits: any = '';
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private _snackBar: MatSnackBar,
    ) {}

    async ngOnInit() {
        this.userId = this._localService.getLocalStorage(environment.lsuserId)
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId)
        this.language = this._localService.getLocalStorage(environment.lslang)
        this._translateService.use(this.language || 'es')

        this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies)) : ''
        if(!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
            let company = this._companyService.getCompany(this.companies)
            if(company && company[0]) {
            this.domain = company[0].domain
            this.companyId = company[0].id
            this.primaryColor = company[0].primary_color
            this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
        }

        this.initializePage();
    }

    initializePage() {
        this.pageTitle = this._translateService.instant('credit-package.mycredits');
        if(this.companyId == 52) {
            this.userCreditsDisplayedColumns = ['credit_package_name', 'credits', 'course', 'price', 'created_at', 'status']
        } else {
            if(this.mode == 'activities') {
                this.userCreditsDisplayedColumns = [ 'title', 'type', 'credits', 'created_at', 'status']
            } else {
                this.userCreditsDisplayedColumns = ['credit_package_name', 'credits', 'price', 'created_at', 'status']
            }
        }
          
        this.features = this._localService.getLocalStorage(environment.lsfeatures) ? JSON.parse(this._localService.getLocalStorage(environment.lsfeatures)) : ''
        if(this.features && this.companyId > 0) {
            let tutorsFeature = this.features.filter(f => {
              return f.feature_name == "Tutors"
            })
        
            if(tutorsFeature && tutorsFeature[0]) {
              this.featureId = tutorsFeature[0].id
            }
      
            let courseFeature = this.features.filter(f => {
              return f.feature_name == "Courses"
            })
      
            if(courseFeature && courseFeature[0]) {
              this.courseFeatureId = courseFeature[0].id
            }
        }
      
        this.getSettings()
    }

    getSettings() {
        if(this.mode == 'activities') {
            this._userService.getUserCreditLogs(this.userId).subscribe(data => {
                this.formatUserCreditLogs(data?.user_credit_logs);
                this.populateUserCreditsTable()
            }, error => {
                console.log(error)
            })
        } else {
            this._userService.getCombinedCreditsPrefetch(this.companyId, this.featureId, this.courseFeatureId, this.userId).subscribe(data => {
                let subfeatures = data[0] ? data[0]['subfeatures'] : []
                let courseSubfeatures = data[1] ? data[1]['subfeatures'] : []
                this.mapSubfeatures(subfeatures, courseSubfeatures)
                
                this.packages = data[2] ? data[2]['credit_packages'] : []
                this.packages = this.packages?.filter(cp => {
                    return cp.status == 1
                })
            
                this.courses = data[3] ? data[3]['courses'] : []
                this.userCredits = data[4] ? data[4]['user_credits'] : []
                this.user = data[4] ? data[4]['user'] : []
            
                this.userCourseCredits = data[5] ? data[5]['user_course_credits'] : []
                this.populateUserCreditsTable()
            }, error => {
                console.log(error)
            })
        }
      }
    
    async mapSubfeatures(subfeatures, courseSubfeatures) {
        if(subfeatures?.length > 0) {
            this.separateCourseCredits = subfeatures.some(a => a.name_en == 'Separate credits by course' && a.active == 1)
        }
    
        if(courseSubfeatures?.length > 0) {
            this.hasDifferentStripeAccount = courseSubfeatures.some(a => a.name_en == 'Different Stripe accounts' && a.active == 1)
        }
    }

    formatUserCreditLogs(user_credit_logs) {
        user_credit_logs = user_credit_logs?.map((item) => {
            return {
              ...item,
              id: item?.id,
              title: this.getPlanTitle(item),
              type: item?.course_id > 0 ? this._translateService.instant('course-create.course') : this._translateService.instant('plans.activity')
            };
        });
      
        let total_credits = 0
        if(user_credit_logs?.length > 0) {
            user_credit_logs?.forEach(log => {
                total_credits += parseFloat(log.credits || 0)
            })
        }

        this.userTotalCredits = parseFloat(total_credits.toString())?.toFixed(2);
        this.userCredits = user_credit_logs;
    }

    getPlanTitle(row) {
        return row ? this.language == 'en' ? (row.title_en || row.title) : (this.language == 'fr' ? (row.title_fr || row.title) : 
          (this.language == 'eu' ? (row.title_eu || row.title) : (this.language == 'ca' ? (row.title_ca || row.title) : 
          (this.language == 'de' ? (row.title_de || row.title) : row.title)
          ))
        ) : ''
    }
    
    populateUserCreditsTable() {
        this.packagesDataSource = new MatTableDataSource(this.userCredits)
        if (this.sort) {
            this.packagesDataSource.sort = this.sort;
        } else {
            setTimeout(() => this.packagesDataSource.sort = this.sort);
        }
        this.isLoading = false;
    }

    getCourseTitleByCredit(item) {
        let text = ''
        if(item?.course_id > 0) {
            if(this.courses?.length > 0) {
                let course_row = this.courses?.filter(c => {
                    return c.id == item?.course_id
                })
                if(course_row?.length > 0) {
                    let course = course_row[0];
                    text = course ? this.language == 'en' ? (course.title_en ? (course.title_en || course.title) : course.title) :
                            (this.language == 'fr' ? (course.title_fr ? (course.title_fr || course.title) : course.title) : 
                                (this.language == 'eu' ? (course.title_eu ? (course.title_eu || course.title) : course.title) : 
                                (this.language == 'ca' ? (course.title_ca ? (course.title_ca || course.title) : course.title) : 
                                    (this.language == 'de' ? (course.title_de ? (course.title_de || course.title) : course.title) : course.title)
                                )
                                )
                            ) : '';
                }
            }
        }
        return text;  
    }

    getCourseTitleById(id) {
        let package_row = this.packages?.filter(c => {
          return c.id == id
        })
    
        let course_id
        if(package_row?.length > 0) {
          course_id = package_row[0].course_id
        }
        let course_row = this.courses?.filter(c => {
          return c.id == course_id
        })
    
        let course
        if(course_row?.length > 0) {
          course = course_row[0]
        }
        return course ? this.language == 'en' ? (course.title_en ? (course.title_en || course.title) : course.title) :
        (this.language == 'fr' ? (course.title_fr ? (course.title_fr || course.title) : course.title) : 
            course.title) : ''
    }
}
