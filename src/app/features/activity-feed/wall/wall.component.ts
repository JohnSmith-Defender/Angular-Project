import { CommonModule } from '@angular/common';
import { 
    Component, 
    HostListener, 
    Input,
    ChangeDetectorRef, 
} from '@angular/core';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NoAccessComponent, PageTitleComponent } from '@share/components';
import { WallService } from '@features/services';
import { FeedComponent } from '@share/components/wall/feed/feed.component';
import { TutorsComponent } from '@share/components/wall/tutors/tutors.component';
import { RecentMembersComponent } from '@share/components/wall/recent-members/recent-members.component';
import { ToastComponent } from "@share/components/toast/toast.component";
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { environment } from "@env/environment";
import get from "lodash/get";

@Component({
    selector: 'activity-feed-wall',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule,
        MatSnackBarModule,
        PageTitleComponent,
        NoAccessComponent,
        FeedComponent,
        TutorsComponent,
        RecentMembersComponent,
        ToastComponent,
    ],
    templateUrl: './wall.component.html',
})
export class WallComponent {
    private destroy$ = new Subject<void>();

    @Input() id!: number;

    languageChangeSubscription;
    isMobile: boolean = false;
    language: any;
    email: any;
    userId: any;
    companyId: any;
    domain: any;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    hoverColor: any;
    pageName: any;
    pageDescription: any;
    coursesFeature: any;
    courseFeatureId: any;
    onlyAssignedTutorAccess: boolean = false;
    hasCategoryAccess: boolean = false;
    superAdmin: boolean = false;
    canViewCourse: boolean = false;
    canCreateCourse: boolean = false;
    canManageCourse: boolean = false;
    tutorsFeature: any;
    tutorFeatureId: any;
    courseTutors: any;
    allCourseTutors: any;
    isTutor: boolean = false;
    tutorUser: any;
    wallTutorVisibility: any;
    tutorSectionVisible: boolean = true;
    courseWallSettings: any;
    courseId: any;
    hasAccess: boolean = false;
    isAccessChecked: boolean = false;
    clubsFeature: any;
    clubFeatureId: any;
    group: any;
    groupMembers: any[] = [];
    members: any[] = [];
    pusherData: any = {}
    questionText: any;
    tabTitleText: any;
    activeMenu: any = 'General';
    user: any;
    childNotifier: Subject<boolean> = new Subject<boolean>();
    isGroupMember: boolean = false;
    hasCheckedCourseWallSettings: boolean = false;
    memberTitle: any;
    company: any;

    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: any;
    confirmDeleteItemDescription: any;
    acceptText: string = "";
    cancelText: any = "";
    confirmMode: string = "";
    onlineMembers: any;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _wallService: WallService,
        private _snackBar: MatSnackBar,
        private cd: ChangeDetectorRef
    ) {}

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
    
        this.email = this._localService.getLocalStorage(environment.lsemail);
        this.language = this._localService.getLocalStorage(environment.lslang);
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(
          environment.lscompanyId
        );
        this.domain = this._localService.getLocalStorage(environment.lsdomain);
        this._translateService.use(this.language || "es");
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
            this.company = company[0];
            this.domain = company[0].domain;
            this.companyId = company[0].id;
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color
                ? company[0].button_color
                : company[0].primary_color;
            this.hoverColor = company[0].hover_color
                ? company[0].hover_color
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
        this.fetchWall();
    }

    fetchWall() {
        this._wallService
            .fetchWall(this.id, this.companyId, this.userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (data) => {
                    this.mapFeatures(data?.features_mapping);
                    this.mapSubfeatures(data?.settings?.subfeatures);
                    this.mapUserPermissions(data?.user_permissions);
                    this.initData(data);
                    if(this.id > 0) { 
                        this.getGroup(data); 
                    } else {
                        this.hasAccess = true;
                        this.isAccessChecked = true;
                        this.pageName = this._translateService.instant('sidebar.activityfeed');
                        this.getMembers();
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    mapFeatures(features) {
        this.coursesFeature = features?.find((f) => f.feature_id == 11);
        this.courseFeatureId = this.coursesFeature?.feature_id;

        this.tutorsFeature = features?.find((f) => f.feature_id == 20);
        this.tutorFeatureId = this.tutorsFeature?.feature_id;

        this.clubsFeature = features?.find((f) => f.feature_id == 5);
        this.clubFeatureId = this.clubsFeature?.feature_id;
    }

    mapSubfeatures(subfeatures) {
        if (subfeatures?.length > 0) {
            this.onlyAssignedTutorAccess = subfeatures.some(
                (a) => a.name_en == "Tutors assigned to courses" && a.active == 1 && a.feature_id == 11
            );
            this.hasCategoryAccess = subfeatures.some(
                (a) => a.name_en == "Category access" && a.active == 1 && a.feature_id == 11
            );
        }
    }

    mapUserPermissions(user_permissions) {
        this.superAdmin = user_permissions?.super_admin_user ? true : false;
        this.canViewCourse = user_permissions?.member_type_permissions?.find(
          (f) => f.view == 1 && f.feature_id == 11
        )
          ? true
          : false;
        this.canCreateCourse =
          user_permissions?.create_plan_roles?.length > 0 ||
          user_permissions?.member_type_permissions?.find(
            (f) => f.create == 1 && f.feature_id == 11
          );
        this.canManageCourse = user_permissions?.member_type_permissions?.find(
          (f) => f.manage == 1 && f.feature_id == 11
        )
          ? true
          : false;

        if(this.superAdmin) {
            this.hasAccess = true
            this.isAccessChecked = true
        }
    }

    initData(data) {
        this.user = data?.user;
        this.onlineMembers = data?.online_members;
        if(this.tutorsFeature) {
            let new_course_tutors: any[] = [];
            let course_tutors = data?.course_tutors;
            if(course_tutors?.length > 0) {
                course_tutors?.forEach(tutor => {
                    let match = new_course_tutors?.some((a) => a.id == tutor.id);
                    if(!match) {
                        new_course_tutors.push(tutor)
                    }
                })
            }
            this.courseTutors = new_course_tutors;
            this.allCourseTutors = new_course_tutors;
            this.isTutor = this.courseTutors && this.courseTutors.some(a => a.id == this.userId);
            if(this.isTutor) {
                this.tutorUser =  this.courseTutors && this.courseTutors.filter(a => {return a.id == this.userId});
                this.hasAccess = true;
                this.isAccessChecked = true;
            }
            this.wallTutorVisibility = data?.wall_tutor_visibility;
            if(this.wallTutorVisibility?.length > 0) {
                let section = this.wallTutorVisibility?.filter(wtv => {
                    return wtv.mode == 'section'
                }) 
                if(section?.length > 0) {
                    if(section[0].visible != 1) { this.tutorSectionVisible = false }
                }
            }
            if(this.courseTutors?.length > 0) {
                let tutors: any[] = []
                this.courseTutors.forEach(t => {
                    let visible = true
                    let tutor = this.wallTutorVisibility && this.wallTutorVisibility?.filter(wtv => {
                        return wtv.mode == 'tutor' && wtv.tutor_id == t.tutor_id 
                    }) 
                    if(tutor?.length > 0) {
                        if(tutor[0].visible == 1) { }
                        else { visible = false }
                    }
                    tutors.push({
                        first_name:t.first_name,
                        id: t.id,
                        image:t.image,
                        last_name: t.last_name,
                        name: t.name,
                        tutor_id: t.tutor_id,
                        visible,
                    })
                })
                
                if(!this.superAdmin) {
                    tutors = tutors && tutors.filter(t => {
                        return t.visible
                    })
                }
                this.courseTutors = tutors;
            }
        }

        if(this.id > 0) {
            this.courseWallSettings = data?.wall_settings;
            this.hasCheckedCourseWallSettings = true
            this.courseId = data?.course ? data?.course?.id : 0;
            if(data?.company_tutors?.length > 0 && this.onlyAssignedTutorAccess) {
                let courseAssignedTutors = data?.company_tutors;
                this.courseTutors = this.courseTutors.filter(ct => {
                    let include = false
                    courseAssignedTutors.forEach(cat => {
                        if(cat.tutor_id == ct.tutor_id){
                            include = true
                        }
                    })
                    if(include){
                        return ct
                    }
                })
                
                if(this.isTutor && this.onlyAssignedTutorAccess) {
                    let tutorAccess = this.courseTutors.some(a => a.id == this.tutorUser[0].id);
                    if(!tutorAccess){
                        this.hasAccess = false;
                        this.isAccessChecked = false
                    }
                    if(tutorAccess){
                        this.hasAccess = true
                        this.isAccessChecked = true
                    }
                }
            }   
        }

        this.questionText = data?.question_text?.value;
        this.tabTitleText = data?.tab_title?.value?.split(',');
    }

    getMembers() {
        this._wallService.getMembers(this.companyId).subscribe(
          (response) => {
            this.members = response.all_members
            if(this.members && this.members.length > 0) {
                this.getOnlineMembers()
            }
          }
        )
    }

    getOnlineMembers() {
        if(this.onlineMembers?.length > 0) {
            this.onlineMembers?.forEach((i) => {
                const current = new Date()
                const recordeddate = new Date(current.getTime() - i.totalseconds)
                this.pusherData[i.id] = recordeddate
            })
            this.applyOnlineMembers()
        }
    }

    getGroup(data) {
        this.group = data?.group;
        this.pageName = this.language == 'en' ? (this.group.title_en || this.group.title) : (this.language == 'fr' ? (this.group.title_fr || this.group.title) : 
            (this.language == 'eu' ? (this.group.title_eu || this.group.title) : (this.language == 'ca' ? (this.group.title_ca || this.group.title) : 
            (this.language == 'de' ? (this.group.title_de || this.group.title) : (this.group.title))
            ))
        );
        if(this.group) {
            this.groupMembers = [];
            if(this.group.CompanyGroupMembers) {
                this.group.CompanyGroupMembers.forEach(gm => {
                    let match = this.groupMembers.some(a => a.user_id === gm.user_id);
                    if(!match) {
                        this.groupMembers.push(gm)
                    } else {
                    }
                })
            }
  
            if(this.id > 0) {
                this.isGroupMember = this.groupMembers.some(a => a.user_id == this.userId);
                this.members = this.groupMembers;
                let online = data?.online_members;
                if(online?.length > 0) {
                    online.forEach((i) => {
                        const current = new Date()
                        const recordeddate = new Date(current.getTime() - i.totalseconds)
                        this.pusherData[i.id] = recordeddate
                    })
                    this.applyOnlineMembers()
                }
            }
        }

        if(!this.hasAccess) {
            // Check if current user belongs to the group
            let match = this.groupMembers.some(a => a.user_id === this.userId)
            if(match) { 
              this.hasAccess = true 
              this.isAccessChecked = true
            } else {
              this.isAccessChecked = true
            }
        }
    }

    applyOnlineMembers() {
        const online = {}
        const keys = Object.keys(this.pusherData)
        keys.forEach((key) => {
            const current = new Date()
            const recordeddate = this.pusherData[key]
            const totalseconds = (current.getTime() - recordeddate.getTime()) / 1000
            if (totalseconds < 120) {
                online[key] = 1
            } else {
                delete this.pusherData[key]
            }
        })
    
        this.members.forEach((i) => {
            i.online = online[i.user_id] ? 1 : 0
        })
    }

    setActiveMenu(menu) {
        this.activeMenu = menu
        this.notifyChild(menu)
    }

    notifyChild(menu) {
        this.childNotifier.next(menu)
    }

    handleMenuChanged(event: any) {
        this.activeMenu = event || 'General'
    }

    deletePost(post) {
        if (post) {
            this.showConfirmationModal = false;
            this.selectedItem = post;
            this.confirmDeleteItemTitle = this._translateService.instant(
                "dialog.confirmdelete"
            );
            this.confirmDeleteItemDescription = this._translateService.instant(
                "dialog.confirmdeleteitem"
            );
            this.acceptText = "OK";
            setTimeout(() => (this.showConfirmationModal = true));
        }
    }
    
    confirm() {
        this._wallService.deletePost(this.selectedItem).subscribe(
          response => {
            this.showConfirmationModal = false;
            this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
            this.notifyChild(this.activeMenu);
            this.cd.detectChanges();
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
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}