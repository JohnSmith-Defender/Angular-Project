import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subject } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { LocalService } from "@share/services";
import { FormsModule } from "@angular/forms";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";

@Component({
  selector: "app-comments",
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    TranslateModule,
    FormsModule,
    NgOptimizedImage,
  ],
  templateUrl: "./comments.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsComponent {
  private destroy$ = new Subject<void>();

  @Input() private: any;
  @Input() joinedMember: any;
  @Input() newComment: any;
  @Input() list: any;
  @Input() superAdmin: any;
  @Input() primaryColor: any;
  @Input() buttonColor: any;
  @Output() addComment = new EventEmitter();
  @Output() addChildComment = new EventEmitter();
  @Output() deleteComment = new EventEmitter();
  @Output() deleteChildComment = new EventEmitter();
  @Output() reactToComment = new EventEmitter();

  languageChangeSubscription;
  language: any;
  childComment: any;

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
  ) {}

  async ngOnInit() {
    initFlowbite();
    this.language = this._localService.getLocalStorage(environment.lslang);
    this._translateService.use(this.language || "es");

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.formatData();
        }
      );

    this.formatData();
  }

  ngOnChanges(changes: SimpleChange) {
    let newCommentChange = changes["newComment"];
    if (newCommentChange?.previousValue != newCommentChange?.currentValue) {
      this.newComment = newCommentChange.currentValue;
    }

    let listChange = changes["list"];
    if (listChange?.currentValue?.length > 0) {
      let list = listChange.currentValue;
      this.list = list;
    }

    let privateChange = changes["private"];
    if (privateChange?.previousValue != privateChange?.currentValue) {
      this.private = privateChange.currentValue;
    }

    let joinedMemberChange = changes["joinedMember"];
    if (joinedMemberChange?.previousValue != joinedMemberChange?.currentValue) {
      this.joinedMember = joinedMemberChange.currentValue;
    }
  }

  formatData() {
    
  }

  handleComment() {
    this.addComment.emit(this.newComment);
  }

  handleDeleteComment(item) {
    this.deleteComment.emit(item);
  }

  handleReactToComment(item) {
    this.reactToComment.emit(item);
  }

  handleShowReply(item) {
    if(this.list?.length > 0) {
      this.list?.forEach(l => {
        if(l.id == item.id) {
          l.show_reply = !l.show_reply;
        }
      })
    }
  }

  handleChildComment(item) {
    let payload = {
      item,
      child_comment: this.childComment
    }
    this.addChildComment.emit(payload);
    setTimeout(() => {
      this.childComment = '';
    }, 500)
  }

  handleDeleteChildComment(parent_comment_id, child_comment_id) {
    this.deleteChildComment.emit({
      parent_comment_id, 
      child_comment_id
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
