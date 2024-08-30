import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { LogoComponent } from "../logo/logo.component";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule } from "@angular/forms";
import { DateAgoPipe } from "@lib/pipes";
import { LocalService, UserService } from "@share/services";
import { COURSE_IMAGE_URL } from "@lib/api-constants";

@Component({
  selector: "app-credits-display",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    FontAwesomeModule,
    DateAgoPipe,
    LogoComponent,
    NgOptimizedImage,
  ],
  templateUrl: "./credits-display.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsDisplayComponent {
    userCourseCredits$ = inject(UserService).userCourseCredits$;

    @Input() currentUser: any;
    @Input() primaryColor: any;
    @Input() buttonColor: any;
    @Input() userId: any;
    @Input() companyId: any;
    @Input() separateCourseCredits: any;
    @Input() courseSubscriptions: any;
    @Input() userCourseCredits: any;
    @Input() courses: any;
    @Input() language: any;
    @Input() creditPackages: any;
    courseCredits: any = 0;
    remainingCourseCredits: any = 0;
    creditsPercentage: any;
    showBuyCreditsModal: boolean = false;
    selectedCreditpackage: any = 0;
    selectedCourse: any = '';
    courseCreditPackages: any = [];
    showCredits: boolean = false;
    @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
    @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;
    constructor(
        private _router: Router,
        private _userService: UserService,
        private _translateService: TranslateService,
        private _localService: LocalService,) {
            
    }

    async ngOnInit() {
        let courseCredits = this.currentUser?.course_credits ? this.currentUser.course_credits : 0
        if(courseCredits) {
            this.courseCredits = this.currentUser?.course_credits;
            this.remainingCourseCredits = this.currentUser?.remaining_course_credits ? this.currentUser.remaining_course_credits : 0                    
            this.creditsPercentage = (this.remainingCourseCredits/courseCredits)*100
        }
    }

    buyCredits() {
        this.modalbutton?.nativeElement.click();

        let existingSubscriptions = this.courseSubscriptions;
        this.courseSubscriptions = [];
        let course_subscriptions: any[] = [];
        if(existingSubscriptions?.length > 0) {
            existingSubscriptions?.forEach(cs => {
                let match = course_subscriptions?.some(
                    (a) => a.id == cs.id
                );

                if(!match && cs.course?.course_credits > 0) {
                    course_subscriptions.push(cs);
                }
            })
        }

        this.courseSubscriptions = course_subscriptions;
    }

    getCourseImageByCredit(item) {
        let image = ''
        if(item?.course_id > 0) {
            let course_match = this.courseSubscriptions?.filter(cs => {
                return cs.course_id == item?.course_id
            })
            if(this.courseSubscriptions?.length > 0 && course_match?.length > 0) {
                let course_row = this.courseSubscriptions?.filter(c => {
                    return c.course_id == item?.course_id
                })
                if(course_row?.length > 0) {
                    let course = course_row[0].course;
                    image = `${COURSE_IMAGE_URL}/${course.image}`;
                    
                }
            } else {
                if(this.courses?.length > 0) {
                    let course_row = this.courses?.filter(c => {
                        return c.id == item?.course_id
                    })
                    if(course_row?.length > 0) {
                        let course = course_row[0];
                        image = `${COURSE_IMAGE_URL}/${course.image}`;
                    }
                }
            }
        }
        return image;
    }

    selectCourse(item) {
        this.selectedCourse = item;
        this.loadCourseCredits();
    }

    getCourseTitle(course) {
        return course ? this.language == 'en' ? (course.title_en ? (course.title_en || course.title) : course.title) :
          (this.language == 'fr' ? (course.title_fr ? (course.title_fr || course.title) : course.title) : 
            (this.language == 'eu' ? (course.title_eu ? (course.title_eu || course.title) : course.title) : 
              (this.language == 'ca' ? (course.title_ca ? (course.title_ca || course.title) : course.title) : 
                (this.language == 'de' ? (course.title_de ? (course.title_de || course.title) : course.title) : course.title)
              )
            )
          ) : '';
    }

    loadCourseCredits() {
        let courseCreditPackages = this.creditPackages?.filter(c => {
            return c.course_id == this.selectedCourse?.id
        })
        
        this.courseCreditPackages = courseCreditPackages?.sort((a, b) => {
            return a.credits - b.credits;
        });
    }

    getSelectedCourse() {
        if(this.selectedCourse) {
            return true;
        } else {
            if(this.courseSubscriptions?.length == 1) {
                this.selectedCourse = this.courseSubscriptions[0];
                this.loadCourseCredits();
                return true;
            }
        }
    }

    selectedPackage(credit_package){
        this.selectedCreditpackage = credit_package.id
    }

    goToPayment() {
        this._router.navigate([`/tutors/payment/credits/${this.selectedCreditpackage}/${this.userId}`]);
    }

    ngOnDestroy() {
        
    }
}