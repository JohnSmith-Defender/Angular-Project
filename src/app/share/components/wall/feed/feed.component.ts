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
import { WallService } from "@features/services";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { Subject } from "rxjs";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import { PostComponent } from "../post/post.component";
import { QuestionComponent } from "../question/question.component";
import { ResourcesComponent } from "../resources/resources.component";
import get from 'lodash/get';

import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
registerPlugin(FilepondPluginImagePreview, FilepondPluginImageEdit, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

@Component({
  selector: "app-wall-feed",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    FormsModule,
    MatSnackBarModule,
    FilePondModule,
    NgOptimizedImage,
    PostComponent,
    QuestionComponent,
    ResourcesComponent,
  ],
  templateUrl: "./feed.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent {
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
  @Input() courseId: any;
  @Input() courseTutors: any;
  @Input() courseWallSettings: any;
  @Input() isTutor: any;
  @Input() superAdmin: any;
  @Input() me: any;
  @Input() userId: any;
  @Input() isGroupMember: any;
  @Input() questionText: any;
  @Input() tabTitleText: any;
  @Input() company: any;
  @Input() hasCheckedCourseWallSettings: any;
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

  saveHover: boolean = false;
  cancelHover: boolean = false;
  addResourceHover: boolean = false;

  resourcePondOptions = {
    class: 'my-filepond',
    multiple: false,
    labelIdle: 'Arrastra y suelta tu archivo o <span class="filepond--label-action" style="color:#00f;text-decoration:underline;"> Navegar </span><div><small style="color:#006999;font-size:12px;">*Subir archivo</small></div>',
    // maxFileSize: 200000000,
    // labelMaxFileSizeExceeded: "El archivo es demasiado grande",
    // labelMaxFileSize: "El tamaño máximo de archivo es {filesize}",
    labelFileProcessing: "En curso",
    labelFileProcessingComplete: "Carga completa",
    labelFileProcessingAborted: "Carga cancelada",
    labelFileProcessingError: "Error durante la carga",
    labelTapToCancel: "toque para cancelar",
    labelTapToRetry: "toca para reintentar",
    labelTapToUndo: "toque para deshacer",
    server: {
    process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
        var course_resource_id = localStorage.getItem('course_resource_id');

        const formData = new FormData();
        let fileExtension = file ? file.name.split('.').pop() : '';
        this.courseResourceFileName = 'courseResourseFile_' + this.userId + '_' + this.getTimestamp() + '.' + fileExtension;
        formData.append('file', file, this.courseResourceFileName);
        if(course_resource_id) {
          formData.append('course_resource_id', course_resource_id);
        }
        localStorage.setItem('course_resource_file', 'uploading');

        const request = new XMLHttpRequest();
        request.open('POST', environment.api + '/company/course/download-temp-upload');

        request.upload.onprogress = (e) => {
        progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            localStorage.setItem('course_resource_file', 'complete');
            } else {
            error('oh no');
            }
        };

        request.send(formData);

        return {
        abort: () => {
            request.abort();
            abort();
        },
        };
      },
    },
  };
  resourcePondFiles = [];

  constructor(
    private _wallService: WallService,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.newPost = this._translateService.instant('wall.sharewhatsonyourmind');
    this.question = this._translateService.instant('posts.askquestion');
    this.displayPosts();

    if(this.notifier) {
      this.notifier.subscribe((data) => {
        if(data) {
          this.activeMenu = data;
          if(this.activeMenu == 'Q & A') {
            this.question = this.questionText;
            this.displayQuestions();
          } else if(this.activeMenu == 'General') {
            this.displayPosts();
          } else if(this.activeMenu == 'Resources') {
            this.getCourseResources();
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
      this.question != this._translateService.instant('posts.askquestion') &&
      this.question != this.questionText
    ) {
      this.question = event?.target?.innerHTML;
    } else {
      this.question = this.activeMenu == 'Q & A' ? this.questionText : this._translateService.instant('posts.askquestion');
    }
  }

  focusQuestion(event) {
    if(event?.target?.innerHTML == this.question && 
      (
        this.question == this._translateService.instant('posts.askquestion') ||
        this.question == this.questionText
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
      this.question == this._translateService.instant('posts.askquestion') ||
      this.question == this.questionText
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
        this._wallService.updatePost({ 
          id: this.id, 
          content: this.newPost,
          company_id: this.companyId,
          topic_id: this.selectedTopic ? (this.selectedTopic.map( (data) => { return data.id }).join()) : ''
        }).subscribe(
          (response) => {
            this.open(
              this._translateService.instant("dialog.savedsuccessfully"),
              ""
            );
            this.newPost = this._translateService.instant('wall.sharewhatsonyourmind');
            this.displayPosts();
          }
        )
      } else {
        this._wallService.createPost({ 
          company_id: this.companyId, 
          group_id: this.groupId ? this.groupId : 0,
          user_id: this.userId, 
          parent_id: this.parent_id, 
          content: this.newPost ,
          topic_id: this.selectedTopic ? (this.selectedTopic.map( (data) => { return data.id }).join()) : ''
        }).subscribe(
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
          }
        )
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
    if (this.tabindex == 1 || this.showFilter == 'liked') {
      this.posts = this.allposts && this.allposts.filter((i) => {
        return i.liked == 1
      })
    }

    if(this.topicFilter && this.topicFilter.length > 0) {
      if(this.posts) {
        let topic_posts: any[] = []
        this.posts.forEach(post => {
          let post_topics_row = this.postTopics.filter(pt => {
            return pt.post_id == post.id
          })
          if(post_topics_row && post_topics_row.length > 0) {
            post_topics_row.forEach(ptr => {
              let match = this.topicFilter.some(a => a.id === ptr.topic_id)
              if(match) {
                topic_posts.push(post)
              }
            });
          }
        })
        this.posts = topic_posts
      }
    }

    if(this.orderFilter) {
      this.posts = this.posts && this.posts.sort((a, b) => {
        const oldDate: any = new Date(a.created)
        const newDate: any = new Date(b.created)

        return oldDate - newDate
      })
    } else {
      this.posts = this.posts && this.posts.sort((a, b) => {
        const oldDate: any = new Date(a.created)
        const newDate: any = new Date(b.created)

        return newDate - oldDate
      })
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
    let results = get(await this._wallService.getPosts({ 
      company_id: this.companyId, 
      user_id: this.userId 
    }).toPromise(), 'results')
    if(results) {
      let posts = results.posts
      if(this.groupId > 0) {
        let group_posts = []
        if(posts) {
          group_posts = posts.filter(post => {
            return post.group_id == this.groupId
          })
        }
        results.posts = group_posts
      } else {
        let generic_posts = []
        if(posts) {
          generic_posts = posts.filter(post => {
            return !(post.group_id > 0)
          })
        }
        results.posts = generic_posts
      }
    }

    this.motherComponent.postsResults = results
    this.allposts = results.posts
    this.posts = results.posts
    if(this.posts) {
      this.featuredPosts = this.posts.filter(post => {
        return post.featured == 1
      })
    }
    this.postTopics = results.posttopics
    this.user = results.user
  }

  async heart(post) {
    if (post.liked) {
      this._wallService.removePostReaction({ 
        company_id: this.companyId, 
        user_id: this.userId, 
        post_id: post.id 
      }).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.displayPosts();
        }
      )
    } else {
      this._wallService.createPostReaction({ 
        company_id: this.companyId, 
        user_id: this.userId, 
        post_id: post.id 
      }).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          this.displayPosts()
        }
      )

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

  handleAskQuestion() {
    if(!this.question) {
      return false
    }

    let params = {
      company_id: this.companyId,
      course_id: this.courseId || 0,
      user_id: this.userId,
      question: this.question,
    }

    this._wallService.askTutorQuestion(params)
      .subscribe(
        (response) => {
          this.activeMenu = 'Q & A'; 
          this.question = this.activeMenu == 'Q & A' ? this.questionText : this._translateService.instant('posts.askquestion');
          this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
          this.handleMenuChange.emit(this.activeMenu);
          this.displayQuestions();
        },
        error => {
          console.log(error)
        }
      )
    this.askedQuestion = false;
  }

  async displayQuestions(getQuestions = true){
    if(getQuestions){
      await this.getCourseQuestions();
    }
  }

  getCourseQuestions() {
    this._wallService.getCourseQuestions(this.courseId || 0, this.companyId)
      .subscribe(
        async response => {
          let all_questions = response['course_questions']
          if(this.superAdmin || this.isTutor) {
            let pinned_questions = all_questions && all_questions.filter(question => {
              return question.pinned == 1
            })
        
            let other_questions = all_questions && all_questions.filter(question => {
              return question.pinned != 1
            })
            let new_questions = []
              .concat(pinned_questions)
              .concat(other_questions)

            this.questions = new_questions;
          } else {
            if(this.courseWallSettings && this.courseWallSettings.qa_visible == 1) {
              all_questions = all_questions && all_questions.filter(q => {
                return q.user_id == this.userId
              })

              let pinned_questions = all_questions && all_questions.filter(question => {
                return question.pinned == 1
              })
          
              let other_questions = all_questions && all_questions.filter(question => {
                return question.pinned != 1
              })
              let new_questions = []
                .concat(pinned_questions)
                .concat(other_questions)
                this.questions = new_questions
            } else {
              let pinned_questions = all_questions && all_questions.filter(question => {
                return question.pinned == 1
              })
          
              let other_questions = all_questions && all_questions.filter(question => {
                return question.pinned != 1
              })
              let new_questions = []
                .concat(pinned_questions)
                .concat(other_questions)
              this.questions = new_questions
            }
          }

          this.cd.detectChanges();
        },
        error => {
            console.log(error)
        }
    )
  }

  getCourseResources() {
    this._wallService.getCourseResources(this.courseId || 0, this.companyId)
      .subscribe(
        async response => {
          this.resources = response['course_resources']
          this.resources = this.resources && this.resources.filter(r => {
            return r.company_id == this.companyId
          })
          this.uploadResourceAvailability = get(await this._wallService.getCourseUploadResourceAvailability(this.courseId).toPromise(), 'upload_resource');
          this.cd.detectChanges();
        },
        error => {
          console.log(error)
        }
    )
  }

  toggleAddResourceHover(event) {
    this.addResourceHover = event;
  }

  addCourseResource() {
    this.selectedResourceId = ''
    this.selectedResourceCourseId = ''
    this.courseResourceTitle = ''
    this.courseResourceFileName = ''
    this.courseResourceMode = 'add'
    this.courseResourceFormSubmitted = false
    this.showResourceDetails = true
  }

  toggleSaveHover(event) {
    this.saveHover = event;
  }

  toggleCancelHover(event) {
    this.cancelHover = event;
  }

  cancelShowResource() {
    this.courseResourceMode = ''
    this.courseResourceTitle = ''
    this.courseResourceFormSubmitted = false
    this.showResourceDetails = false
  }

  addResource() {
    this.courseResourceFormSubmitted = true

    if(!this.courseResourceTitle
    || !this.courseResourceFileName) {
      return false
    }

    let course_file_status = localStorage.getItem('course_resource_file')
    let course_file = course_file_status == 'complete' ? this.courseResourceFileName : ''

    let params = {
      company_id: this.companyId,
      course_id: this.courseId,
      filename: this.courseResourceTitle,
      file: course_file,
      group_id: this.groupId,
      user_id: this.userId,
    }

    this._wallService.addCourseResource(
      params,
    ).subscribe(
      response => {
        this.getCourseResources()
        this.selectedResourceCourseId = ''
        this.courseResourceTitle = ''
        this.courseResourceFileName = ''
        this.courseResourceMode = ''
        this.showResourceDetails = false
        this.courseResourceFormSubmitted = false
        localStorage.removeItem('course_resource_file')
        this.open(
          this._translateService.instant("dialog.savedsuccessfully"),
          ""
        );
      },
      error => {
        this.open(
          this._translateService.instant("dialog.error"),
          ""
        );
      }
    )
  }

  resourcePondHandleInit() {
    console.log('Download FilePond has initialised', this.myPond);
  }

  resourcePondHandleAddFile(event: any) {
    console.log('A file was added (resource)', event);
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
