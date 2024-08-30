import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonGroupComponent, ToastComponent } from '@share/components';
import { CompanyService, LocalService, UserService } from '@share/services';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotificationsService } from '@lib/services';
import { BuddyService } from '@features/services';
import { Subject } from 'rxjs';
import { initFlowbite } from "flowbite";
import get from "lodash/get";

@Component({
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonGroupComponent,
        ToastComponent
    ],
    templateUrl: './notifications.component.html',
})
export class NotificationsComponent {
    private destroy$ = new Subject<void>();

    @Input() id!: number;

    languageChangeSubscription;
    isMobile: boolean = false;
    language: any;
    domain: any;
    companyId: any;
    primaryColor: any;
    buttonColor: any;
    email: any;
    userId: any;
    userRole: any;
    companies: any;
    notificationTypes: any = [];
    buttonList: any = [];
    notifications: any = [];
    notificationsLength: number = 0;
    allNotifications: any = [];
    inviteNotifications: any;
    requestNotifications: any;
    approvalNotifications: any;
    clubActivityNotifications: any;
    commentNotifications: any;
    waitingListNotifications: any;
    otherNotifications: any;
    filter: any = 'ALL';
    apiPath: string = environment.api;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: any;
    confirmDeleteItemDescription: any;
    acceptText: string = "";
    cancelText: any = "";
    confirmMode: string = "";
    company: any;
    notificationsDataSource: any;
    notificationDisplayedColumns = ['message', 'email', 'created', 'status', 'object_type', 'action']
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined
    approveBlogParams: any;
    rejectBlogParams: any;
    mentorRequests: any = [];
    dialogMode: string = "";
    dialogTitle: any;
    selectedNotification: any;
    buddy: any;
    message: any;
    canAccept: boolean = false;
    contactFormSubmitted: boolean = false;
    @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
    @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private _notificationsService: NotificationsService,
        private _buddyService: BuddyService
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");
    
        this.email = this._localService.getLocalStorage(environment.lsemail);
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(
          environment.lscompanyId
        );
        this.domain = this._localService.getLocalStorage(
          environment.lsdomain
        );
        this.userRole = this._localService.getLocalStorage(environment.lsuserRole);
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
            this.company = company[0]
          this.domain = company[0].domain;
          this.companyId = company[0].id;
          this.primaryColor = company[0].primary_color;
          this.buttonColor = company[0].button_color
            ? company[0].button_color
            : company[0].primary_color;
        }
    
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
        if(this.userId) { this.getNotifications(); }
    }

    getNotifications() {
        this._userService.allUserNotifications(this.userId, this.companyId)
          .subscribe(
            response => {
              let allNotifications = response['notifications']
              this.notifications = this.sortNotifications(allNotifications)
              this.notifications = this.notifications && this.notifications.map(notification => {
                let status = ''
                let approved = false
                let accepted = false
                let declined = false
                let not_approved = false
                let pending = false
                if(
                  (this.isRequest(notification) && !notification.read_status) ||
                  (this.isForApproval(notification) && !notification.read_status)
                 ) {
                  status = this._translateService.instant('plan-details.pending')
                  pending = true
                } else if(this.isRequest(notification) && (notification.read_status == -1 || notification.read_status == 1)) {
                  status = notification.read_status == 1 ? this._translateService.instant('notification-popup.accepted') : this._translateService.instant('notification-popup.declined')
                  accepted = notification.read_status == 1 ? true : false
                  declined = notification.read_status == 1 ? false : true
                } else if(this.isForApproval(notification) && notification.read_status == -1 || notification.read_status == 1) {
                  status =  notification.read_status == 1 ? this._translateService.instant('company-settings.approved') : this._translateService.instant('company-settings.notapproved')
                  approved =  notification.read_status == 1 ? true : false
                  not_approved =  notification.read_status == 1 ? false : true
                }
    
                let object_type = ''
                if(notification.type.indexOf('VS_COMPANY_GROUP_') >= 0 && notification.type.indexOf('VS_COMPANY_GROUP_PLAN_') < 0) {
                  object_type = 'Club'
                } else if(notification.type.indexOf('VS_COMPANY_PLAN_') >= 0 || notification.type.indexOf('VS_COMPANY_GROUP_PLAN_') >= 0 || notification.type.indexOf('VS_COMPANY_CLUB_PLAN_') >= 0 || notification.type.indexOf('WAITING_LIST') >= 0) {
                  object_type = 'Actividad'
                } else if(notification.type.indexOf('VS_COMPANY_CITY_AGENDA') >= 0) {
                  object_type = 'City Agenda'
                } else if(notification.type.indexOf('VS_COMPANY_BUDDY') >= 0) {
                  object_type = this.companyId == 32 ? 'IntroduceU' : 'Buddy'
                }

                if(object_type == 'IntroduceU') {
                  if(notification.read_status == -1 || !notification.read_status) {
                    status = this._translateService.instant('plan-details.pending')
                    pending = true
                  } else if (notification.read_status == 1) {
                    status = notification.read_status == 1 ? this._translateService.instant('notification-popup.accepted') : this._translateService.instant('notification-popup.declined')
                    accepted = notification.read_status == 1 ? true : false
                  }
                }
                
                return {
                    ...notification,
                    status,
                    approved,
                    accepted,
                    declined,
                    not_approved,
                    pending,
                    object_type
                }
              })
              this.allNotifications = this.notifications
              this.groupNotifications(this.notifications)
            },
            error => {
              console.log(error)
            }
          )
    }

    groupNotifications(notifications) {
        this.notificationTypes = []
        if(notifications && notifications.length > 0) {
          let invites = notifications && notifications.filter(notification => {
            return notification.type == 'VS_COMPANY_GROUP_INVITES' || notification.type == 'VS_COMPANY_PLAN_INVITES' || notification.type == 'VS_COMPANY_GROUP_PLAN_INVITES'
          })
    
          this.inviteNotifications = invites
          this.notificationTypes.push({
            id: 1,
            type: 'INVITES',
            text: this._translateService.instant('your-events.invites')
          })
    
          let requests = notifications && notifications.filter(notification => {
            return notification.type == 'VS_COMPANY_PLAN_REQUESTS' || notification.type == 'VS_COMPANY_GROUP_REQUESTS'
          })
    
          this.requestNotifications = requests
          this.notificationTypes.push({
            id: 2,
            type: 'REQUESTS',
            text: this._translateService.instant('notification-popup.requests')
          })
    
          let approvals = notifications && notifications.filter(notification => {
            return notification.type == 'VS_COMPANY_CLUB_PLAN_APPROVAL' || notification.type == 'VS_COMPANY_CITY_AGENDA_APPROVAL'
          })
    
          this.approvalNotifications = approvals
          this.notificationTypes.push({
            id: 3,
            type: 'APPROVALS',
            text: this._translateService.instant('notification-popup.forapproval')
          })

          let mentor_requests = notifications && notifications.filter(notification => {
            return notification.type == 'VS_COMPANY_BUDDY'
          })

          this.mentorRequests = mentor_requests;
          this.notificationTypes.push({
            id: 4,
            type: 'MENTOR_REQUESTS',
            text: this._translateService.instant('notification-popup.mentorrequests')
          })
    
          let club_activities = notifications && notifications.filter(notification => {
            return notification.type == 'VS_COMPANY_GROUP_PLANS'
          })
    
          this.clubActivityNotifications = club_activities
          this.notificationTypes.push({
            id: 5,
            type: 'GROUP_PLANS',
            text: this._translateService.instant('club-details.clubactivities')
          })
    
          let comments = notifications && notifications.filter(notification => {
            return notification.type == 'VS_COMPANY_GROUP_PLAN_COMMENTS' || notification.type == 'VS_COMPANY_PLAN_COMMENTS' || notification.type == 'VS_COMPANY_GROUP_COMMENTS'
          })
    
          this.commentNotifications = comments
          this.notificationTypes.push({
            id: 6,
            type: 'COMMENTS',
            text: this._translateService.instant('plan-details.comments')
          })
    
          let waitingLists = notifications && notifications.filter(notification => {
            return notification.type == 'WAITING_LIST'
          })
    
          this.waitingListNotifications = waitingLists
          this.notificationTypes.push({
            id: 7,
            type: 'WAITING_LIST',
            text: this._translateService.instant('edit-plan.waitinglist')
          })
        }
    
        this.initializeButtonGroup()
        this.filterNotifications(this.filter)
    }

    filterNotifications(type) {
        this.filter = type
        switch(type) {
          case 'ALL':
            this.notifications = this.allNotifications
            break
          case 'INVITES':
            this.notifications = this.inviteNotifications
            break
          case 'REQUESTS':
            this.notifications = this.requestNotifications
            break
          case 'APPROVALS':
            this.notifications = this.approvalNotifications
            break
          case 'MENTOR_REQUESTS':
            this.notifications = this.mentorRequests
            break
          case 'GROUP_PLANS':
            this.notifications = this.clubActivityNotifications
            break
          case 'COMMENTS':
            this.notifications = this.commentNotifications
            break
          case 'WAITING_LIST':
            this.notifications = this.waitingListNotifications
            break
          case 'OTHERS':
            this.notifications = this.otherNotifications
            break
        }
    
        this.refreshTable()
    }

    sortNotifications(allNotifications) {
        let notifications = allNotifications
        let sorted_notifications: any[] = []
        this.notificationsLength = 0
    
        if(notifications && notifications.length > 0) {
          // Get requests & invites
          let invites_requests = notifications.filter(notification => {
            return notification.type == 'VS_COMPANY_BUDDY' || notification.type == 'VS_COMPANY_GROUP_INVITES' || notification.type == 'VS_COMPANY_PLAN_INVITES' 
              || notification.type == 'VS_COMPANY_GROUP_PLAN_INVITES' || notification.type == 'VS_COMPANY_PLAN_REQUESTS' || notification.type == 'VS_COMPANY_GROUP_REQUESTS' 
              || notification.type == 'VS_COMPANY_CLUB_PLAN_APPROVAL' || notification.type == 'VS_COMPANY_CITY_AGENDA_APPROVAL' || notification.type == 'WAITING_LIST'
          })
          if(invites_requests && invites_requests.length > 0) {
            let sorted_invited_requests = invites_requests.sort((a, b) => {
              const oldDate: any = new Date(a.created)
              const newDate: any = new Date(b.created)
    
              return newDate - oldDate
            })
            if(sorted_invited_requests && sorted_invited_requests.length > 0)  {
              sorted_invited_requests.forEach(sir => {
                if(sir.author_image.indexOf("/") == 0) {
    
                } else {
                  sir.author_image = '/' + sir.author_image
                }
    
                let match = sorted_notifications && sorted_notifications.some(a => a.object_id === sir.object_id)
                if(!match) {
                  if(sir.read_status == 1 || sir.read_status == -1) { } else { this.notificationsLength += 1 }
                  sorted_notifications.push(sir)
                }
              })
            }
          }
    
          // Sort request notifications
          if(sorted_notifications && sorted_notifications.length > 0)  {
            sorted_notifications = sorted_notifications.sort((a: any, b: any) => {
              const oldDate: any = new Date(a.created)
              const newDate: any = new Date(b.created)
    
              return newDate - oldDate
            })
          }
    
          // Get other notifications
          let other_requests = notifications.filter(notification => {
            return notification.type != 'VS_COMPANY_BUDDY' && notification.type != 'VS_COMPANY_GROUP_INVITES' && notification.type != 'VS_COMPANY_PLAN_INVITES' 
              && notification.type != 'VS_COMPANY_GROUP_PLAN_INVITES' && notification.type != 'VS_COMPANY_PLAN_REQUESTS' && notification.type != 'VS_COMPANY_GROUP_REQUESTS' 
              && notification.type != 'VS_COMPANY_CLUB_PLAN_APPROVAL' && notification.type != 'VS_COMPANY_CITY_AGENDA_APPROVAL' && notification.type != 'WAITING_LIST'
          })
          if(other_requests && other_requests.length > 0) {
            let sorted_other_requests = other_requests.sort((a, b) => {
              const oldDate: any = new Date(a.created)
              const newDate: any = new Date(b.created)
    
              return newDate - oldDate
            })
            if(sorted_other_requests && sorted_other_requests.length > 0)  {
              sorted_other_requests.forEach(sor => {
                if(sor.author_image.indexOf("/") == 0) {
    
                } else {
                  sor.author_image = '/' + sor.author_image
                }
    
                sorted_notifications.push(sor)
              })
            }
          }
        }
    
        return sorted_notifications
    }

    isRequest(notification) {
        let result = false 
    
        if (notification.type == 'VS_COMPANY_GROUP_INVITES' || notification.type == 'VS_COMPANY_PLAN_INVITES' || notification.type == 'VS_COMPANY_GROUP_PLAN_INVITES' 
        || notification.type == 'VS_COMPANY_PLAN_REQUESTS' || notification.type == 'VS_COMPANY_GROUP_REQUESTS' || notification.type == 'WAITING_LIST') {
          result = true
        }
    
        return result
    }
    
    isComment(notification) {
        let result = false 
    
        if (notification.type == 'VS_COMPANY_GROUP_PLAN_COMMENTS' || notification.type == 'VS_COMPANY_PLAN_COMMENTS' || notification.type == 'VS_COMPANY_GROUP_COMMENTS') {
          result = true
        }
    
        return result
    }

    isForApproval(notification) {
        let result = false 
    
        if (notification.type == 'VS_COMPANY_CLUB_PLAN_APPROVAL' || notification.type == 'VS_COMPANY_CITY_AGENDA_APPROVAL') {
          result = true
        }
    
        return result
    }

    initializeButtonGroup() {
        this.buttonList = [
          {
            id: "All",
            value: "ALL",
            text: this._translateService.instant("plans.all"),
            type: "ALL",
            selected: true
          },
        ];
    
        this.notificationTypes?.forEach((type) => {
            this.buttonList.push({
                id: type.id,
                value: type.id,
                text: type.text,
                type: type.type,
                selected: false
            });
        });
    }

    refreshTable(keepPage: boolean = false) {
        this.notificationsDataSource = new MatTableDataSource(this.notifications)
        if (this.sort) {
            this.notificationsDataSource.sort = this.sort;
        } else {
            setTimeout(() => this.notificationsDataSource.sort = this.sort);
        }

        if (this.paginator) {
            this.notificationsDataSource.paginator = this.paginator
            this.paginator.firstPage()
        } else {
            setTimeout(() => {
                this.notificationsDataSource.paginator = this.paginator
                this.paginator?.firstPage()
            });
        }
        initFlowbite();
    }

    viewClubPlan(notification) {
        let link = `/plans/details/${notification.object_id}/4`
        this._router.navigate([]).then(() => {
            window.open(link, '_blank')
        })
    }

    viewComment(notification) {
        this._notificationsService.getCommentDetails(notification.object_id, notification.type)
          .subscribe(
            response => {
              let result = response['result']
              if(result) {
              if(notification.type == 'VS_COMPANY_GROUP_PLAN_COMMENTS') {
                this._router.navigate([`/plans/details/${result.group_plan_id}/4`])
              } else if(notification.type == 'VS_COMPANY_PLAN_COMMENTS') {
                this._router.navigate([`/plans/details/${result.plan_id}/1`])
              } else if(notification.type == 'VS_COMPANY_GROUP_COMMENTS') {
                this._router.navigate([`/clubs/details/${result.group_id}`])
              }
              }
            },
            error => {
              console.log(error)
            }
          )
    }
    
    viewRequest(notification) {
        if(notification.type == 'VS_COMPANY_CITY_AGENDA_APPROVAL') {
            let link = `/news/request/${notification.object_id}`
            this._router.navigate([]).then(() => {
                window.open(link, '_self')
            })
        } else {
            this._router.navigate([`/plans/details/${notification.object_id}/4`])
        }
    }
    
    approveRequest(notification) {
        if(notification.type == 'VS_COMPANY_CLUB_PLAN_APPROVAL') {
          const object_id = notification.object_id;
          const company_id = this.companyId;
          const user_id = this.userId;
    
          const payload = {
            object_id,
            company_id,
            user_id
          }
          this._notificationsService.approveClubActivityNotification(notification.id, payload)
          .subscribe(
            response => {
              this.filter = notification.type;
              this.open(this._translateService.instant('dialog.acceptedsuccessfully'), '')
              this.reloadNotifications('accepted', notification)
            },
            error => {
              console.log(error);
            }
          )
        } else if(notification.type == 'VS_COMPANY_CITY_AGENDA_APPROVAL') {
          this.approveBlog(notification.object_id, notification.id)
        } else if(notification.type == 'WAITING_LIST') {
          this.approveWaitingList(notification.object_id, notification.id)
        }
    }
    
    approveWaitingList(id, notification_id) {
        this._notificationsService.approveWaitingList(id, this.userId).subscribe(data => {
            this.reloadNotifications('approved', notification_id)
        }, error => {
          console.log(error);
        })
    }
    
    approveBlog(id, notification_id) {
        this._notificationsService.getContentRequest(id).subscribe(data => {
          let blog_request = data['company_request']
          if(blog_request) {
            let params = {
              'event_category_id': blog_request['news_category_id'],
              'date': blog_request['date'],
              'valid_until': blog_request['valid_until'] ? blog_request['valid_until'] : null,
              'name_ES': blog_request['name_ES'],
              'name_EN': blog_request['name_EN'],
              'name_FR': blog_request['name_FR'],
              'name_EU': blog_request['name_EU'],
              'name_CA': blog_request['name_CA'],
              'name_DE': blog_request['name_DE'],
              'leadin_ES': blog_request['leadin_ES'],
              'leadin_EN': blog_request['leadin_EN'],
              'leadin_FR': blog_request['leadin_FR'],
              'leadin_EU': blog_request['leadin_EU'],
              'leadin_CA': blog_request['leadin_CA'],
              'leadin_DE': blog_request['leadin_DE'],
              'description_ES': blog_request['description_ES'],
              'description_EN': blog_request['description_EN'],
              'description_FR': blog_request['description_FR'],
              'description_EU': blog_request['description_EU'],
              'description_CA': blog_request['description_CA'],
              'description_DE': blog_request['description_DE'],
              'company_id': blog_request['company_id'],
              'user_id': blog_request['user_id'],
              'image': blog_request['image'],
              'request_id': id,
              'notification_id': notification_id,
              'city_id': blog_request['city_id'],
              'supercategory_id': blog_request['category_id'] ? blog_request['category_id'] : 0,
              'video_file': blog_request['video_file'],
              'subcategory_id': blog_request['subcategory_id'] ? blog_request['subcategory_id'].map( (data) => { return data.subcategory_id }).join() : '',
            };
            this.approveBlogParams = params
    
            this.showConfirmationModal = false;
            this.selectedItem = notification_id;
            this.confirmMode = 'approve-blog';
            this.confirmDeleteItemTitle = this._translateService.instant("dialog.confirmapprove");
            this.confirmDeleteItemDescription = this._translateService.instant("dialog.confirmapproveitem");
            this.acceptText = "OK";
            setTimeout(() => (this.showConfirmationModal = true));
          }
        }, error => {
          console.log(error);
        })
    }
    
    rejectBlog(blog) {
        this._notificationsService.getContentRequest(blog.id).subscribe(data => {
          let blog_request = data['company_request']
          if(blog_request) {
            let params = {
              'event_category_id': blog_request['news_category_id'],
              'name_ES': blog_request['name_ES'],
              'name_EN': blog_request['name_EN'],
              'name_FR': blog_request['name_FR'],
              'leadin_ES': blog_request['leadin_ES'],
              'leadin_EN': blog_request['leadin_EN'],
              'leadin_FR': blog_request['leadin_FR'],
              'description_ES': blog_request['description_ES'],
              'description_EN': blog_request['description_EN'],
              'description_FR': blog_request['description_FR'],
              'company_id': blog_request['company_id'],
              'user_id': blog_request['user_id'],
              'image': blog_request['image'],
              'request_id': blog.id,
              'supercategory_id': blog_request['category_id'] ? blog_request['category_id'] : 0,
              'video_file': blog_request['video_file'],
              'city_id': blog_request['city_id'],
            };
            this.rejectBlogParams = params
    
            this.showConfirmationModal = false;
            this.selectedItem = blog;
            this.confirmMode = 'reject-blog';
            this.confirmDeleteItemTitle = this._translateService.instant("dialog.confirmreject");
            this.confirmDeleteItemDescription = this._translateService.instant("dialog.confirmrejectitem");
            this.acceptText = "OK";
            setTimeout(() => (this.showConfirmationModal = true));
          }
        }, error => {
          console.log(error);
        })
    }
    
    approveContent(id, confirmed, params) {
        if(confirmed) {
          this._notificationsService.approveBlog(id, params).subscribe(data => {
            this.reloadNotifications('accepted', id)
          }, err => {
            console.log('err: ', err);
          })
        }
    }
    
    rejectContent(notification, confirmed, params) {
        if(confirmed) {
          this._notificationsService.rejectBlog(notification.id, params).subscribe(data => {
            this.reloadNotifications('declined', notification)
          }, err => {
            console.log('err: ', err);
          })
        }
    }
    
    denyRequest(notification) {
        const company_id = this.companyId;
        const user_id = this.userId;
    
        const payload = {
          company_id,
          user_id,
        }
        this._notificationsService.declineNotification(notification.id, payload)
        .subscribe(
          response => {
            this.reloadNotifications('declined', notification)
          },
          error => {
            console.log(error);
          }
        )
    }

    declineNotification(notification) {
        if(notification.type == 'WAITING_LIST') {
          this._notificationsService.rejectWaitingList(notification.object_id).subscribe(data => {
            this.reloadNotifications('declined', notification)
          }, error => {
            console.log(error);
          })
        } else {
          const company_id = this.companyId;
          const user_id = this.userId
    
          const payload = {
            company_id,
            user_id,
          }
          this._notificationsService.declineNotification(notification.id, payload)
          .subscribe(
              response => {
                this.reloadNotifications('declined', notification)
              },
              error => {
                console.log(error);
              }
          )
        }
    }  

    acceptInvite(notification) {
        if(notification.type == 'VS_COMPANY_GROUP_INVITES') {
          const object_id = notification.object_id;
          const company_id = this.companyId;
          const user_id = this.userId;
    
          const payload = {
            object_id,
            company_id,
            user_id
          }
          this._notificationsService.acceptGroupNotification(notification.id, payload)
          .subscribe(
            response => {
                this.open(this._translateService.instant('dialog.acceptedsuccessfully'), '')
                this.reloadNotifications('accepted', notification)
            },
            error => {
              console.log(error);
            }
          )
        } else if(notification.type == 'VS_COMPANY_PLAN_INVITES') {
          const object_id = notification.object_id;
          const company_id = this.companyId;
          const user_id = this.userId;
    
          const payload = {
            object_id,
            company_id,
            user_id
          }
          this._notificationsService.acceptPlanNotification(notification.id, payload)
          .subscribe(
            response => {
                this.open(this._translateService.instant('dialog.acceptedsuccessfully'), '')
                this.reloadNotifications('accepted', notification)
            },
            error => {
              console.log(error);
            }
          )
        } else if(notification.type == 'VS_COMPANY_GROUP_PLAN_INVITES') {
          const object_id = notification.object_id;
          const company_id = this.companyId;
          const user_id = this.userId;
    
          const payload = {
            object_id,
            company_id,
            user_id
          }
          this._notificationsService.acceptGroupPlanNotification(notification.id, payload)
          .subscribe(
            response => {
                this.open(this._translateService.instant('dialog.acceptedsuccessfully'), '')
                this.reloadNotifications('accepted', notification)
            },
            error => {
              console.log(error);
            }
          )
        } else if(notification.type == 'VS_COMPANY_PLAN_REQUESTS') {
          const object_id = notification.object_id;
          const company_id = this.companyId;
          const user_id = this.userId;
    
          const payload = {
            object_id,
            company_id,
            user_id
          }
          this._notificationsService.acceptPlanRequestNotification(notification.id, payload)
          .subscribe(
            response => {
                this.open(this._translateService.instant('dialog.acceptedsuccessfully'), '')
                this.reloadNotifications('accepted', notification)
            },
            error => {
              console.log(error);
            }
          )
        } else if(notification.type == 'VS_COMPANY_GROUP_REQUESTS') {
          const object_id = notification.object_id;
          const company_id = this.companyId;
          const user_id = this.userId;
    
          const payload = {
            object_id,
            company_id,
            user_id
          }
          this._notificationsService.acceptJoinGroupRequestNotification(notification.id, payload)
          .subscribe(
            response => {
              this.open(this._translateService.instant('dialog.acceptedsuccessfully'), '')
              this.reloadNotifications('accepted', notification)
            },
            error => {
              console.log(error);
            }
          )
        } else if(notification.type == 'WAITING_LIST') {
          this._notificationsService.approveWaitingList(notification.object_id, this.userId).subscribe(data => {
            this.open(this._translateService.instant('dialog.acceptedsuccessfully'), '')
            this.reloadNotifications('accepted', notification)
          }, error => {
            console.log(error);
          })
        }
    }

    reloadNotifications(row: string = '', notification) {
        let notifications = this.notifications;
        if (notifications?.length > 0) {
            if(row == 'accepted') {
                notifications = notifications?.map(notif => {
                    let status = notification?.id && notif.id == notification?.id ? "ACEPTADO" : notif.status
                    if(!notification?.id) {
                        status = notif.id == notification ? "ACEPTADO" : notif.status
                    }
                    let read_status = notification?.id && notif.id == notification.id ? 1 : notif.read_status
                    if(!notification?.id) {
                        read_status = notif.id == notification ? "ACEPTADO" : notif.read_status
                    }
                    let accepted = notification?.id && notif.id == notification.id ? true : notif.accepted
                    if(!notification?.id) {
                        read_status = notif.id == notification ? "ACEPTADO" : notif.read_status
                    }
                    return {
                        ...notif,
                        accepted,
                        read_status,
                        status
                    }
                })
            } else if(row == 'declined') {
                notifications = notifications?.map(notif => {
                    let status = notif.id == notification.id ? "RECHAZADO" : notif.status
                    let read_status = notif.id == notification.id ? 1 : notif.read_status
                    let declined = notif.id == notification.id ? true : notif.declined
                    return {
                        ...notif,
                        declined,
                        read_status,
                        status
                    }
                })
            }
        }
        this.notifications = notifications
        this.refreshTable()
    }
    
    deleteNotification(notification) {
        this.showConfirmationModal = false;
        this.selectedItem = notification;
        this.confirmMode = 'delete';
        this.confirmDeleteItemTitle = this._translateService.instant("dialog.confirmdelete");
        this.confirmDeleteItemDescription = this._translateService.instant("dialog.confirmdeleteitem");
        this.acceptText = "OK";
        setTimeout(() => (this.showConfirmationModal = true));
    }
    
    deleteSelectedNotification(confirmed, notification) {
        if(confirmed) {
          let params = {
            'id': notification.id,
            'type': notification.type
          }
          this._notificationsService.deleteNotification(params).subscribe(
            response => {
                let notifications = this.notifications;
                if (notifications?.length > 0) {
                    notifications.forEach((notif, index) => {
                        if (notif.id == notification.id) {
                            notifications.splice(index, 1);
                        }
                    });
                }
                this.notifications = notifications
                this.refreshTable()
                this.open(this._translateService.instant('dialog.deletedsuccessfully'), '')
            },
            error => {
                console.log(error);
            }
          )
        }
    }

    confirm() {
        if(this.confirmMode == 'approve-blog') {
            this.approveContent(this.selectedItem, true, this.approveBlogParams)
            this.showConfirmationModal = false;
        } else if(this.confirmMode == 'reject-blog') {
            this.rejectContent(this.selectedItem, true, this.rejectBlogParams)
            this.showConfirmationModal = false;
        } else if(this.confirmMode == 'delete') {
            this.deleteSelectedNotification(true, this.selectedItem);
            this.showConfirmationModal = false;
        } else if(this.confirmMode == 'reject-buddy') {
          this.rejectBuddy(true, this.selectedNotification);
          this.showConfirmationModal = false;
      }
    }

    async open(message: string, action: string) {
        await this._snackBar.open(message, action, {
          duration: 3000,
          panelClass: ["info-snackbar"],
        });
    }

    filteredStatus(event) {
        this.buttonList?.forEach((item) => {
            if (item.id === event.id) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });

        this.filterNotifications(event.type)
    }

    viewBuddyDetails(notification) {
      this.dialogMode = "accept";
      this.dialogTitle =  this._translateService.instant('notification-popup.mentorrequests');
      this.selectedNotification = notification
      this._buddyService.getBuddyContactLog(notification.object_id)
      .subscribe(
          response => {
            this.buddy = response.buddy
            this.message = this.buddy ? this.buddy.message : ''
            if(this.buddy && this.buddy.limit_settings) {
              if(this.buddy.buddy_mentors.length < this.buddy.limit_settings) {
                this.canAccept = true
              }
            }
            this.modalbutton?.nativeElement.click();
          },
          error => {
            
          }
      )
    }

    acceptBuddy() {
      let params = {
        company_id: this.companyId,
        buddy_id: this.buddy.from_user_id,
        mentor_id: this.userId,
        notification_id: this.selectedNotification.id
      }
      this._buddyService.acceptBuddy(params)
        .subscribe(
          response => {
            this.open(this._translateService.instant('dialog.acceptedsuccessfully'), '');
            location.reload()
          },
          error => {
            let errorMessage = <any>error
            if (errorMessage != null) {
                let body = JSON.parse(error._body);
            }
          }
        )
    }

    denyBuddyRequest(notification) {
      this.selectedNotification = notification;
      this._buddyService.getBuddyContactLog(notification.object_id)
      .subscribe(
        response => {
          this.buddy = response.buddy;
          this.showConfirmationModal = false;
          this.confirmMode == 'reject-buddy';
          this.confirmDeleteItemTitle = this._translateService.instant(
            "dialog.confirmreject"
          );
          this.confirmDeleteItemDescription = this._translateService.instant(
            "dialog.confirmrejectitem"
          );
          this.acceptText = "OK";
          setTimeout(() => (this.showConfirmationModal = true));
        },
        error => {
          
        }
      )
    }

    rejectBuddy(confirmed, notification) {
      if(confirmed) {
        let params = {
          company_id: this.companyId,
          buddy_id: this.buddy.from_user_id,
          mentor_id: this.userId,
          notification_id: notification.id
        }
    
        this._buddyService.rejectBuddy(params)
        .subscribe(
          response => {
            this.selectedNotification.read_status = 1;
          },
          error => {
            
          }
        )
      }
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}