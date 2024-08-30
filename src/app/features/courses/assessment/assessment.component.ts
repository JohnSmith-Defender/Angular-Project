import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, SimpleChange } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CoursesService } from '@features/services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '@env/environment';

@Component({
    selector: 'app-course-assessment',
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './assessment.component.html',
})
export class AssessmentComponent {
    private destroy$ = new Subject<void>();

    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() userId: any;
    @Input() superAdmin: any;
    @Input() language: any;
    @Input() assessment: any;
    @Input() courseId: any;
    @Output() onFinishAssessment = new EventEmitter();
    @Output() onResetAssessment = new EventEmitter();

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    isLoading: boolean = false;
    currentIndex: number = 0;
    currentItem: any;
    showNextQuestionButton: boolean = false;
    showFinishButton: boolean = false;
    finished: boolean = false;
    currentItemSubmitted: boolean = false;
    correctAnswers: any;
    rating: any;
    apiPath: string = environment.api;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _coursesService: CoursesService,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    ngOnChanges(changes: SimpleChange) {
        let assessmentChange = changes["assessment"];
        if (assessmentChange?.currentValue) {
          this.assessment = assessmentChange.currentValue;
          this.checkStatus()
        }
      }

    async ngOnInit() {
        this.onResize();

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
        this.checkStatus();
    }

    checkStatus() {
        this.finished = false;
        this.rating = 0;
        this.correctAnswers = 0;
        if(this.assessment?.ratings) {
            this.finished = true;
            this.rating = this.assessment?.ratings?.toString()?.replace('.00', '');
            this.correctAnswers = (this.assessment?.ratings * this.assessment?.assessment_details?.length) / 100;
        }
    }

    nextQuestion() {
        this.currentItemSubmitted = false;
        this.showNextQuestionButton = false;
        this.showFinishButton = false;
        this.currentIndex += 1;
    }

    submitAnswer() {
        let current_item = this.assessment?.assessment_details?.length > 0 ? this.assessment?.assessment_details[this.currentIndex] : {};
        if(current_item?.answer) {
            this.currentItemSubmitted = true;

            if(this.currentIndex == this.assessment?.assessment_details?.length - 1) {
                this.showFinishButton = true;
            } else {
                this.showNextQuestionButton = true;
            }
        }
    }

    finishQuestion() {
        this.correctAnswers = 0;
        if(this.assessment?.assessment_details?.length > 0) {
            
            this.assessment?.assessment_details?.forEach(item => {
                let answer = item?.answer;
                let correct_answer = item?.multiple_choice_options?.find((f) => f.correct);

                if(answer == correct_answer?.id) {
                    this.correctAnswers += 1;
                }
            })
        }
        let rating = (this.correctAnswers / this.assessment?.assessment_details?.length) * 100;
        this.rating = rating || 0;

        let params = {
            company_id: this.company?.id,
            assessment: this.assessment,
            user_id: this.userId,
            course_id: this.courseId,
            ratings: this.rating,
        }

        this._coursesService.submitCourseAssessment(
            params,
        ).subscribe(
            response => {
                this.finished = true;
                let assessment = this.assessment;
                assessment['ratings'] = this.rating;
                this.onFinishAssessment.emit(assessment);
            },
            error => {
              this.open(this._translateService.instant("dialog.error"), "");
            }
        )
    }

    reset() {
        let params = {
            company_id: this.company?.id,
            course_id: this.courseId,
            user_id: this.userId,
            course_assessment_item_id: this.assessment?.id,
        }

        this._coursesService.resetCourseAssessment(
            params,
        ).subscribe(
            response => {
                this.currentIndex = 0;
                this.finished = false;
                this.rating = 0;
                this.correctAnswers = 0;
                let assessment = this.assessment;
                assessment['ratings'] = 0;
                this.onResetAssessment.emit(assessment);
            },
            error => {
              this.open(this._translateService.instant("dialog.error"), "");
            }
        )
    }

    getAssessmentTitle(assessment) {
        return assessment ? this.language == 'en' ? (assessment.title_en || assessment.title) : (this.language == 'fr' ? (assessment.title_fr || assessment.title) : 
          (this.language == 'eu' ? (assessment.title_eu || assessment.title) : (this.language == 'ca' ? (assessment.title_ca || assessment.title) : 
          (this.language == 'de' ? (assessment.title_de || assessment.title) : (this.language == 'it' ? (assessment.title_it || assessment.title) : assessment.title)
          )))
        ) : ''
    }

    getChoiceTitle(choice) {
        return choice ? this.language == 'en' ? (choice.choice_en || choice.choice) : (this.language == 'fr' ? (choice.title_fr || choice.choice) : 
          (this.language == 'eu' ? (choice.choice_eu || choice.choice) : (this.language == 'ca' ? (choice.choice_ca || choice.choice) : 
          (this.language == 'de' ? (choice.choice_de || choice.choice) : (this.language == 'it' ? (choice.choice_it || choice.choice) : choice.choice)
          )))
        ) : ''
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