import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Router } from '@angular/router'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  ViewChild
} from "@angular/core";
import { WallService } from "@features/services";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CompanyService, LocalService } from "@share/services";
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { Subject } from "rxjs";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import get from 'lodash/get';

@Component({
  selector: "app-wall-question",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    FormsModule,
    NgOptimizedImage,
  ],
  templateUrl: "./question.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  private destroy$ = new Subject<void>();

  @Input() me: any;
  @Input() userId: any;
  @Input() companyId: any;
  @Input() courseId: any;
  @Input() superAdmin: any;
  @Input() buttonColor: any;
  @Input() language: any;
  @Input() courseTutors: any;
  @Input() question: any;
  @Output() handleDisplayQuestions = new EventEmitter();
  
  content: any;
  truncatedContent: any
  expandedContent: boolean = false
  truncate: number = 200
  questionHover: boolean = false;
  newQuestion: any;
  errorMessage: string = '';
  apiPath: string = environment.api +  '/';

  constructor(
    private router: Router,
    private _wallService: WallService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
  ) { }

  async ngOnInit() {
    this.newQuestion = this._translateService.instant('wall.sharewhatsonyourmind');
    if(this.question) {
      this.content = this.question?.question;
      if(this.content) {
        if(this.content?.length > this.truncate) {
          this.truncatedContent = this.sanitize(this.getExcerpt(this.content));
        } else {
          this.truncatedContent = this.sanitize(this.content);
        }
      }
    }
  }

  canAnswer() {
    let result = false

    if(this.superAdmin) {
      result = true
    } else {
      result = this.courseTutors && this.courseTutors.some(a => a.id === this.userId)
    }

    return result
  }

  sanitize(content) {
    return this.sanitizer.bypassSecurityTrustHtml(content)
  }

  readMore() {
    this.expandedContent = true;
    this.truncatedContent = this.sanitize(this.content);;
  }

  showLess() {
    this.expandedContent = false;
    if(this.content?.length > this.truncate) {
      this.truncatedContent = this.sanitize(this.getExcerpt(this.content));
    } else {
      this.truncatedContent = this.sanitize(this.content);
    }
  }

  getExcerpt(content) {
    let charlimit = this.truncate;
    if (!content || content.length <= charlimit) {
      return content;
    }

    let without_html = content.replace(/<(?:.|\n)*?>/gm, "");
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  getImage(image) {
    return `${environment.api}/${image}`
  }

  getMemberName(member) {
    return `${member.first_name} ${member.last_name}`
  }

  convert(totalminutes) {
    if (this.language == 'en') {
      return this.convertEN(totalminutes)
    } else if (this.language == 'es') {
      return this.convertES(totalminutes)
    } else if (this.language == 'fr') {
      return this.convertFR(totalminutes)
    }
  }

  convertEN(totalminutes) {
    const obj1: any = {}
    obj1.aa = 0
    obj1.bb = 0
    obj1.cc = 0
    obj1.dd = 0
    obj1.ee = 0
    obj1.ff = 0

    const obj2: any = {}
    obj2.aa = 525600
    obj2.bb =  43800
    obj2.cc =  10080
    obj2.dd =   1440
    obj2.ee =     60
    obj2.ff =      1

    const list1 = ['aa'  , 'bb'   , 'cc'  , 'dd' , 'ee'  , 'ff'    ]
    const list2 = {}

    list2['aa1'] = 'year'
    list2['bb1'] = 'month'
    list2['cc1'] = 'week'
    list2['dd1'] = 'day'
    list2['ee1'] = 'hour'
    list2['ff1'] = 'minute'

    list2['aa2'] = 'years'
    list2['bb2'] = 'months'
    list2['cc2'] = 'weeks'
    list2['dd2'] = 'days'
    list2['ee2'] = 'hours'
    list2['ff2'] = 'minutes'

    let result = 'just now'

    list1.every((key) => {
      while (totalminutes >= obj2[key]) {
        obj1[key] = obj1[key] + 1
        totalminutes = totalminutes - obj2[key]
      }
      if (obj1[key] > 0) {
        const word = obj1[key] == 1 ? list2[`${key}1`] : list2[`${key}2`]
        result = `${obj1[key]} ${word} ago`
        return false
      }
      return true
    })

    return result
  }

  convertES(totalminutes) {
    const obj1: any = {}
    obj1.aa = 0
    obj1.bb = 0
    obj1.cc = 0
    obj1.dd = 0
    obj1.ee = 0
    obj1.ff = 0

    const obj2: any = {}
    obj2.aa = 525600
    obj2.bb =  43800
    obj2.cc =  10080
    obj2.dd =   1440
    obj2.ee =     60
    obj2.ff =      1

    const list1 = ['aa'  , 'bb'   , 'cc'  , 'dd' , 'ee'  , 'ff'    ]
    const list2 = {}

    list2['aa1'] = 'año'
    list2['bb1'] = 'mes'
    list2['cc1'] = 'semana'
    list2['dd1'] = 'd' // 'día'
    list2['ee1'] = 'h' // 'hora'
    list2['ff1'] = 'm' // 'minuto'

    list2['aa2'] = 'años'
    list2['bb2'] = 'meses'
    list2['cc2'] = 'semanas'
    list2['dd2'] = 'd' // 'días'
    list2['ee2'] = 'h' // 'horas'
    list2['ff2'] = 'm' // 'minutos'

    let result = 'justo ahora'

    list1.every((key) => {
      while (totalminutes >= obj2[key]) {
        obj1[key] = obj1[key] + 1
        totalminutes = totalminutes - obj2[key]
      }
      if (obj1[key] > 0) {
        const word = obj1[key] == 1 ? list2[`${key}1`] : list2[`${key}2`]
        // result = `hace ${obj1[key]} ${word}`
        result = `${obj1[key]} ${word}`
        return false
      }
      return true
    })

    return result
  }

  convertFR(totalminutes) {
    const obj1: any = {}
    obj1.aa = 0
    obj1.bb = 0
    obj1.cc = 0
    obj1.dd = 0
    obj1.ee = 0
    obj1.ff = 0

    const obj2: any = {}
    obj2.aa = 525600
    obj2.bb =  43800
    obj2.cc =  10080
    obj2.dd =   1440
    obj2.ee =     60
    obj2.ff =      1

    const list1 = ['aa'  , 'bb'   , 'cc'  , 'dd' , 'ee'  , 'ff'    ]
    const list2 = {}

    list2['aa1'] = 'an'
    list2['bb1'] = 'mois'
    list2['cc1'] = 'la semaine'
    list2['dd1'] = 'jour'
    list2['ee1'] = 'heure'
    list2['ff1'] = 'minute'

    list2['aa2'] = 'années'
    list2['bb2'] = 'mois'
    list2['cc2'] = 'semaines'
    list2['dd2'] = 'jours'
    list2['ee2'] = 'heures'
    list2['ff2'] = 'minutes'

    let result = 'à l\'heure actuelle'

    list1.every((key) => {
      while (totalminutes >= obj2[key]) {
        obj1[key] = obj1[key] + 1
        totalminutes = totalminutes - obj2[key]
      }
      if (obj1[key] > 0) {
        const word = obj1[key] == 1 ? list2[`${key}1`] : list2[`${key}2`]
        result = `est-ce que ${obj1[key]} ${word}`
        return false
      }
      return true
    })

    return result
  }

  toggleQuestionHover(event) {
    this.questionHover = event;
  }

  updateQuestionPinStatus(question: any) {
    let params = {
      id: question.id,
      status: question.pinned == 1 ? 0 : 1
    }

    this._wallService.updateQuestionPinStatus(params).subscribe(
      (response) => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        this.handleDisplayQuestions.emit();
      }
    )
  }

  getNewQuestion(event) {
    if(event?.target?.innerHTML && this.newQuestion != this._translateService.instant('wall.sharewhatsonyourmind')) {
      this.newQuestion = event?.target?.innerHTML;
    } else {
      this.newQuestion = this._translateService.instant('wall.sharewhatsonyourmind');
    }
  }

  focusNewQuestion(event) {
    if(event?.target?.innerHTML == this.newQuestion && this.newQuestion == this._translateService.instant('wall.sharewhatsonyourmind')) {
      this.newQuestion = '';
    } else {
      this.newQuestion = event?.target?.innerHTML;
    }
  }

  isNewQuestionPlaceholder() {
    let result = false;
    if(this.newQuestion == this._translateService.instant('wall.sharewhatsonyourmind')) {
      result = true;
    }
    return result;
  }

  handleAddQuestion() {
    this.errorMessage = '';

    if(!this.newQuestion || this.isNewQuestionPlaceholder()) {
      this.errorMessage = this._translateService.instant('wall.sharewhatsonyourmind');
      this.open(
        this.errorMessage,
        ""
      );
    } else {
      this._wallService.answerTutorQuestion({
        company_id: this.companyId,
        course_id: this.courseId || 0,
        user_id: this.userId,
        question_id: this.question.id,
        answer: this.newQuestion,
      }).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.newQuestion = this._translateService.instant('wall.sharewhatsonyourmind');
          this.handleDisplayQuestions.emit();
        }
      )
    }
  }

  deleteQuestion(question) {
    this._wallService.deleteQuestion(question).subscribe(
      response => {
        this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
        this.handleDisplayQuestions.emit();
      },
      error => {
        console.log(error);
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
