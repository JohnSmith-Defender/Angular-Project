import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Router } from '@angular/router'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SecurityContext,
} from "@angular/core";
import { BuddyService, ClubsService, WallService } from "@features/services";
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { Subject } from "rxjs";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import { SafeContentHtmlPipe } from "@lib/pipes";

@Component({
  selector: "app-mentor-message",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    SafeContentHtmlPipe,
    FormsModule,
    NgOptimizedImage,
  ],
  templateUrl: "./message.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorMessageComponent {
  private destroy$ = new Subject<void>();

  @Input() buttonColor: any
  @Input() language: any
  @Input() message: any
  @Input() motherComponent: any
  @Input() superAdmin: any
  @Input() me: any;
  @Input() userId: any;
  @Input() company: any;
  @Input() mentorId: any;
  @Output() handleDelete = new EventEmitter();
  @Output() handleRefresh = new EventEmitter();

  isGroupMember: boolean = false
  apiPath: string = environment.api +  '/'
  courseResourceSrc: string = environment.api +  '/get-course-unit-type-image/'

  content: any;
  truncatedContent: any
  expandedContent: boolean = false
  truncate: number = 200
  commentHover: boolean = false;
  newComment: any;
  errorMessage: string = '';

  constructor(
    private _buddyService: BuddyService,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
  ) { }

  async ngOnInit() {
    this.newComment = this._translateService.instant('wall.sharewhatsonyourmind');
    if(this.message) {
      this.content = this.message?.message;
      if(this.content) {
        if(this.content?.length > this.truncate) {
          this.truncatedContent = this.sanitize(this.getExcerpt(this.content));
        } else {
          this.truncatedContent = this.sanitize(this.content);
        }
      }
    }
  }

  getNewComment(event) {
    if(event?.target?.innerHTML && this.newComment != this._translateService.instant('wall.sharewhatsonyourmind')) {
      this.newComment = event?.target?.innerHTML;
    } else {
      this.newComment = this._translateService.instant('wall.sharewhatsonyourmind');
    }
  }

  focusNewComment(event) {
    if(event?.target?.innerHTML == this.newComment && this.newComment == this._translateService.instant('wall.sharewhatsonyourmind')) {
      this.newComment = '';
    } else {
      this.newComment = event?.target?.innerHTML;
    }
  }

  isNewCommentPlaceholder() {
    let result = false;
    if(this.newComment == this._translateService.instant('wall.sharewhatsonyourmind')) {
      result = true;
    }
    return result;
  }

  sanitize(content) {
    return this.sanitizer.sanitize(
      SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(content));
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

  isCurrentUserLiked(message) {
    let result = false
    let liked = message.Company_Group_Comment_Reactions?.filter(p => {
      return p.fk_user_id == this.userId
    })
    if(liked?.length > 0) {
      result = true
    }
    return result;
  }

  handleAddComment() {
    this.errorMessage = '';

    if(!this.newComment || this.isNewCommentPlaceholder()) {
      this.errorMessage = this._translateService.instant('wall.sharewhatsonyourmind');
      this.open(
        this.errorMessage,
        ""
      );
    } else {
      let params = {
        'id': this.message.id,
        'company_id': this.company?.id,
        'user_id': this.userId,
        'buddy_id': this.mentorId,
        'message': this.newComment,
    }
      this._buddyService.contactMentorReply(params).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.newComment = this._translateService.instant('wall.sharewhatsonyourmind');
          this.handleRefresh.emit();
        },
        async (err) => {
          console.log(err);
        }
      );
    }
  }

  refreshPosts() {
    this.handleRefresh.emit();
  }

  toggleCommentHover(event) {
    this.commentHover = event;
  }

  deletePost(message) {
    this.handleDelete.emit(message);
  }

  getCurrentUserImage() {
    let image = ''
    if(this.me.photo) {
      image = `data:image/png;base64,${this.me?.photo}`
    } else {
      image = this.me?.image == 'default-avatar.jpg' || this.me?.image == 'empty_avatar.png' ? ('./assets/images/default-profile.png') : (this.apiPath + this.me?.image)
    }
    
    return image;
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
