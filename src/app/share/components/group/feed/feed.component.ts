import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  ViewChild
} from "@angular/core";
import { ClubsService, WallService } from "@features/services";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { Subject } from "rxjs";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import { GroupPostComponent } from "../post/post.component";

@Component({
  selector: "app-group-feed",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    FormsModule,
    MatSnackBarModule,
    NgOptimizedImage,
    GroupPostComponent,
  ],
  templateUrl: "./feed.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupFeedComponent {
  private destroy$ = new Subject<void>();
  
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() companyId: any;
  @Input() language: any;
  @Input() motherComponent: any;
  @Input() resultsPosts: any;
  @Input() groupId: any;
  @Input() groupMembers: any;
  @Input() activeMenu: any;
  @Input() superAdmin: any;
  @Input() groupOwner: any;
  @Input() me: any;
  @Input() userId: any;
  @Input() isGroupMember: any;
  @Input() company: any;
  @Input() commentsList: any;
  @Input() notifier: Subject<boolean> | undefined;
  @Output() handleMenuChange = new EventEmitter();
  @Output() handleDelete = new EventEmitter();

  myName: any
  allposts: any = []
  posts: any = []
  user: any = {}

  editorModal: any
  editorInline: any
  errorMessage: any

  showModal: boolean = false
  showInline: boolean = false
  image: any
  caption: any
  id: any = 0
  parent_id: any = 0
  content: any = ''
  searchvalue: any = ''
  tabindex: any = 0

  showTopicDropdown: boolean = false
  dropdownSettings = {}
  activityTopics: any = []
  selectedTopic: any
  postTopics: any = []
  featuredPosts: any = []
  responsiveOptions: any = []
  showFilter: any = ''
  orderFilter: any = ''
  topicFilter: any = ''
  topicDropdownSettings = {}
  json: any
  showPollOptions: boolean = false
  pollType: any = ''
  showPollModal: boolean = false
  createPollFormSubmitted: boolean = false
  choices: any = []
  rateMin: any
  rateMax: any
  minRateDescription: any = ''
  maxRateDescription: any = ''
  title: any
  requiredFieldsError: boolean = false
  addChoice: any
  polls: any = []
  showPollDetailsModal: boolean = false
  selectedPoll: any
  selectedPollJson: any
  submissions: any = []
  showPollSubmissionsModal: boolean = false
  selectedPollSubmission: any
  hasReachedMaxPostsPinned: boolean = false

  askedQuestion: boolean = false
  questions: any = []
  question: any
  resources: any = []
  showQuestions: any = []
  courseResourceSrc: string = environment.api +  '/get-course-unit-file/'
  @ViewChild("askquestion") askQuestionElement: ElementRef | undefined;

  selectedResourceId: any
  selectedResourceCourseId: any = ''
  courseResourceTitle: any
  courseResourceFileName: any
  courseResourceMode: any
  courseResourceFormSubmitted: boolean = false
  showResourceDetails: boolean = false
  @ViewChild('myPond', {static: false}) myPond: any;
  @ViewChild('downloadPond', {static: false}) downloadPond: any;
  courseLessonFileSrc: string = environment.api +  '/get-course-unit-file/'
  companyButtonColor: any = ''
  companies: any
  uploadResourceAvailability: boolean = false

  apiPath: string = `${environment.api}/`;
  postHover: boolean = false;
  questionHover: boolean = false;
  newPost: any;
  @ViewChild('inputsearch', { static: false }) inputsearch: ElementRef | undefined;

  constructor(
    private _wallService: WallService,
    private _clubsService: ClubsService,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChange) {
    let commentsListChange = changes["commentsList"];
    let commentsList = commentsListChange.currentValue;
    this.posts = commentsList; 
  }

  async ngOnInit() {
    this.newPost = this._translateService.instant('wall.sharewhatsonyourmind');
    this.question = this._translateService.instant('posts.askquestion');
    this.displayPosts();

    if(this.notifier) {
      this.notifier.subscribe((data) => {
        if(data) {
          this.activeMenu = data;
          if(this.activeMenu == 'General') {
            this.displayPosts();
          }
        }
      });
    }
  }

  togglePostHover(event) {
    this.postHover = event;
  }

  toggleQuestionHover(event) {
    this.questionHover = event;
  }

  getQuestion(event) {
    if(event?.target?.innerHTML && 
      this.question != this._translateService.instant('posts.askquestion')
    ) {
      this.question = event?.target?.innerHTML;
    } else {
      this.question = this._translateService.instant('posts.askquestion');
    }
  }

  focusQuestion(event) {
    if(event?.target?.innerHTML == this.question && 
      (
        this.question == this._translateService.instant('posts.askquestion')
      )
    ) {
      this.question = '';
    } else {
      this.question = event?.target?.innerHTML;
    }
  }

  isQuestionPlaceholder() {
    let result = false;
    if(
      this.question == this._translateService.instant('posts.askquestion')
    ) {
      result = true;
    }
    return result;
  }

  getNewPost(event) {
    if(event?.target?.innerHTML && this.newPost != this._translateService.instant('wall.sharewhatsonyourmind')) {
      this.newPost = event?.target?.innerHTML;
    } else {
      this.newPost = this._translateService.instant('wall.sharewhatsonyourmind');
    }
  }

  focusNewPost(event) {
    if(event?.target?.innerHTML == this.newPost && this.newPost == this._translateService.instant('wall.sharewhatsonyourmind')) {
      this.newPost = '';
    } else {
      this.newPost = event?.target?.innerHTML;
    }
  }

  isNewPostPlaceholder() {
    let result = false;
    if(this.newPost == this._translateService.instant('wall.sharewhatsonyourmind')) {
      result = true;
    }
    return result;
  }

  handleCreatePost() {
    this.errorMessage = '';

    if(!this.newPost || this.isNewPostPlaceholder()) {
      this.errorMessage = this._translateService.instant('wall.pleaseinputavalue');
      this.open(
        this.errorMessage,
        ""
      );
    } else {
      if (this.id) {
        
      } else {
        this._clubsService
        .addGroupComment(
          this.groupId,
          this.userId,
          this.newPost,
          this.companyId,
        )
        .subscribe(
          (response) => {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this.newPost = this._translateService.instant('wall.sharewhatsonyourmind');
            if (this.parent_id == 0) {
              this.tabindex = 0;
            }
            this.displayPosts();
          },
          (error) => {
            console.log(error);
          }
        );
      }
    }
  }

  async displayPosts(getPosts = true, scroll = false) {
    if (getPosts) {
      await this.getPosts()
    }
    if (this.tabindex == 0 || this.showFilter == '') {
      this.posts = this.allposts
    }
    
    let pinned_posts = this.posts && this.posts.filter(post => {
      return post.pinned == 1
    })
    let other_posts = this.posts && this.posts.filter(post => {
      return post.pinned != 1
    })
    if(pinned_posts && pinned_posts.length == 3) {
      this.hasReachedMaxPostsPinned = true
    } else {
      this.hasReachedMaxPostsPinned = false
    }
    let new_posts = []
      .concat(pinned_posts)
      .concat(other_posts)
    this.posts = new_posts

    this.cd.detectChanges();

    if(scroll) {
      this.scrollToTop()
    }
  }

  async getPosts() {
    this._clubsService.getGroupComments(this.groupId).subscribe(async (response) => {
      let results = response.CompanyGroupComments.filter(
        (data) => {
          data.comment = data.comment.replaceAll("\n", "<br/>");
          if (data.CommentChild && data.CommentChild.length > 0) {
            data.CommentChild.filter((data) => {
              data.comment = data.comment.replaceAll("\n", "<br/>");
            });
          }
          return data;
        }
      );

      this.motherComponent.postsResults = results
      this.allposts = results
      this.posts = results
      this.user = results?.length > 0 ? results[0].CompanyUser : {}
      this.cd.detectChanges();
    });
  }

  async heart(event) {
    let current_user_reaction = event?.Company_Group_Comment_Reactions?.filter(react => {
      return react.fk_user_id == this.userId
    })

    let mode = current_user_reaction?.length > 0 ? 'unlike' : 'like';
    
    if(mode == 'like') {
      let param = {
        userId: this.userId,
        heart: 1,
      };
      this._clubsService.heartGroupComment(event.id, param).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.displayPosts();
        },
        async (err) => {
          console.log(err);
        }
      );
    } else {
      let param = {
        userId: this.userId,
      };
      this._clubsService.deleteGroupCommentHeart(event.id, param).subscribe(
        (data) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.displayPosts();
        },
        async (err) => {
          console.log(err);
        }
      );
    }
  }

  updatePinStatus(post) {
    if(this.hasReachedMaxPostsPinned && post.pinned != 1) {
      this.open(this._translateService.instant('dialog.canonlypin3posts'), '')
      this.scrollToTop()
      return false
    }

    let params = {
      id: post.id,
      status: post.pinned == 1 ? 0 : 1
    }

    this._wallService.updatePinStatus(params).subscribe(
      (response) => {
        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
        this.displayPosts(true, true);
      }
    )
  }

  deletePost(post) {
    this.handleDelete.emit(post);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    const contentContainer =
      document.querySelector(".mat-sidenav-content") || window;
      contentContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
  }

  public getTimestamp() {
    const date = new Date()
    const timestamp = date.getTime()
    return timestamp
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