import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from "@angular/router";
import { QuillModule } from 'ngx-quill';
import { environment } from '@env/environment';
import { BuddyService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FilterComponent, PageTitleComponent, ToastComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MentorCardComponent } from '@share/components/card/mentor/mentor.component';
import {
    ImageCropperModule,
    ImageCroppedEvent,
    ImageTransform,
    base64ToFile,
  } from "ngx-image-cropper";
  import {
    faRotateLeft,
    faRotateRight,
    faEye,
    faEyeSlash,
  } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { MatTabsModule } from "@angular/material/tabs";
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MentorMessageComponent } from '../message/message.component';
import get from 'lodash/get';

@Component({
    selector: 'app-mentor-profile',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        NgOptimizedImage,
        FormsModule,
        ReactiveFormsModule,
        QuillModule,
        MatSnackBarModule,
        ImageCropperModule,
        FontAwesomeModule,
        NgMultiSelectDropDownModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        PageTitleComponent,
        SearchComponent,
        FilterComponent,
        MentorCardComponent,
        ToastComponent,
        MentorMessageComponent,
    ],
    templateUrl: './mentor-profile.component.html'
})
export class MentorProfileComponent {
    private destroy$ = new Subject<void>();

    @Input() id: any;

    languageChangeSubscription;
    user: any;
    email: any;
    language: any;
    companyId: any = 0;
    companies: any;
    domain: any;
    pageTitle: any;
    features: any;

    primaryColor: any;
    buttonColor: any;
    hoverColor: any;
    userId: any;
    subfeatures: any;
    superAdmin: boolean = false;
    pageName: any;
    pageDescription: any;
    showSectionTitleDivider: boolean = false;
    isMobile: boolean = false;
    buddyFeature: any;
    featureId: any;
    searchText: any;
    placeholderText: any;
    search: any;
    p: any;
    mentors: any = [];
    allMentors: any = [];
    list: any[] = [];
    buttonList: any;
    cities: any = [];
    selectedCity: any = '';
    defaultActiveFilter: boolean = false;
    filterActive: boolean = false;
    filterSettings: any = [];
    showFilters: boolean = false;
    filterTypeControl: any = '';
    majors: any = [];
    years: any = [];
    selectedMajor: any = '';
    currentPage: number = 1;
    pageSize: number = 8;

    profileForm: any;
    hasImage: boolean = false;
    myImage: any;
    me: any;
    mentor: any;
    
    imageSrc: string = environment.api + "/";
    rotateLeftIcon = faRotateLeft;
    rotateRightIcon = faRotateRight;
    @ViewChild("modalbutton", { static: false })
    modalbutton: ElementRef<HTMLInputElement> = {} as ElementRef;
    // Cropper
    showImageCropper: boolean = false;
    imageChangedEvent: any;
    croppedImage: any;
    canvasRotation = 0;
    rotation = 0;
    scale = 1;
    transform: ImageTransform = {};
    file: any;

    languages: any = [];
    languageSettings: any;
    selectedLanguage: any = '';

    tabIndex = 0;
    notifications: any = [];
    notificationsDataSource: any;
    notificationDisplayedColumns = ['action', 'message', 'email', 'created', 'status']
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined
    allNotifications: any;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: any;
    confirmDeleteItemDescription: any;
    acceptText: string = "";
    cancelText: any = "";
    confirmMode: string = "";
    dialogMode: string = "";
    dialogTitle: any;
    selectedNotification: any;
    buddy: any;
    message: any;
    canAccept: boolean = false;
    company: any;
    tabInnerIndex = 0;
    allMessages: any = [];
    messages: any = [];
    selectedMenteeMessage: any;
    menteeMessages: any = [];
    newPost: any;
    postHover: boolean = false;
    errorMessage: any;
    apiPath: string = environment.api + "/";

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _buddyService: BuddyService,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        initFlowbite();

        this.email = this._localService.getLocalStorage(environment.lsemail);
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(
            environment.lscompanyId
        );
        this.language = this._localService.getLocalStorage(environment.lslang);
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
            this.domain = company[0].domain;
            this.company = company[0].company;
            this.companyId = company[0].id;
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color
                ? company[0].button_color
                : company[0].primary_color;
            this.hoverColor = company[0].hover_color
                ? company[0].hover_color
                : company[0].primary_color;
            this.showSectionTitleDivider = company[0].show_section_title_divider;
            this._localService.setLocalStorage(
                environment.lscompanyId,
                this.companyId
            );
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
        this.pageTitle = this._translateService.instant("sidebar.profilesettings");
        this.profileForm = this.fb.group({
            first_name: new FormControl('', [Validators.required]),
            last_name: new FormControl('', [Validators.required]),
            major: new FormControl('', [Validators.required]),
            introduction: new FormControl('', [Validators.required]),
            interests: new FormControl('', [Validators.required]),
            personality: new FormControl('', [Validators.required]),
            location: new FormControl('', [Validators.required]),
            faculty: new FormControl('', [Validators.required]),
            business_unit: new FormControl('', [Validators.required]),
            segment: new FormControl('', [Validators.required]),
        })

        this.loadProfileData();
    }

    loadProfileData() {
        this._buddyService
            .fetchMentorProfile(this.id, this.userId, this.companyId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (response) => {
                    let data = response[0] ? response[0] : [];
                    let allNotifications = response[1] ? response[1]['notifications'] : [];
                    let allMessages = response[2] ? response[2]['messages'] : [];

                    this.cities = data['cities'];
                    this.languages = data['languages'];

                    this.initializeRequests(allNotifications);
                    this.initializeMessages(allMessages);
                    this.initializeDropdowns();
                    this.initializeProfile(data);
                },
                (error) => {
                    console.log(error);
                }
        );
    }

    initializeRequests(allNotifications) {
        this.notifications = this.sortNotifications(allNotifications);
        this.notifications = this.notifications && this.notifications.map(notification => {
            let status = ''
            let approved = false
            let accepted = false
            let declined = false
            let not_approved = false
            let pending = false

            let object_type = ''
            if(notification.type.indexOf('VS_COMPANY_BUDDY') >= 0) {
              object_type = this.companyId == 32 ? 'IntroduceU' : 'Buddy'
            }

            if(object_type == 'IntroduceU') {
              if(notification.read_status == -1 || !notification.read_status) {
                if(notification?.declined == 1) {
                    status = this._translateService.instant('notification-popup.declined')
                    declined = true
                } else {
                    status = this._translateService.instant('plan-details.pending')
                    pending = true
                }
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
        this.refreshTable();
    }

    sortNotifications(allNotifications) {
        let notifications = allNotifications
        let sorted_notifications: any[] = []
    
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

    initializeMessages(allMessages) {
        this.allMessages = allMessages;
        this.messages = allMessages;
        this.setSelectedMessage(this.messages?.length > 0 ? this.messages[0] : {});
    }

    initializeDropdowns() {
        this.languageSettings = {
            singleSelection: false,
            idField: "id",
            textField: "name_ES",
            selectAllText: this._translateService.instant("dialog.selectall"),
            unSelectAllText: this._translateService.instant("dialog.clearall"),
            itemsShowLimit: 6,
            allowSearchFilter: true,
            searchPlaceholderText: this._translateService.instant('guests.search'),
        };
    }

    initializeProfile(data) {
        this.me = data?.user;
        this.mentor = data?.mentor;
        this.myImage =  `${environment.api}/${this.me.image}`;
        this.hasImage = true

        if(this.me) {
            this.profileForm.get('first_name').setValue(this.me.first_name);
            this.profileForm.get('last_name').setValue(this.me.last_name);
        }

        if(this.mentor) {
            this.profileForm.get('major').setValue(this.mentor.major);
            this.profileForm.get('introduction').setValue(this.mentor.introduction);
            this.profileForm.get('interests').setValue(this.mentor.interests);
            this.profileForm.get('personality').setValue(this.mentor.personality);
            this.profileForm.get('location').setValue(this.mentor.location);
            this.profileForm.get('faculty').setValue(this.mentor.faculty);
            this.profileForm.get('business_unit').setValue(this.mentor.business_unit);
            this.profileForm.get('segment').setValue(this.mentor.segment);

            let mentor_language = this.me?.language || data?.current_user?.language;
            let selected_languages = this.languages.filter((language) => {
                return mentor_language?.indexOf(language.name_ES) >= 0
            })
            this.selectedLanguage = selected_languages.map((language) => {
                const { id, name_ES } = language;
                return {
                    id,
                    name_ES,
                }
            });
        }
    }

    getMenteeName(mentee) {
        return mentee.first_name ? `${mentee.first_name} ${mentee.last_name}` : mentee.name;
    }

    getMenteeImage(mentee) {
        let image = '';
        let menteeImage = mentee.image;
        if(menteeImage == 'default-avatar.jpg' || menteeImage == 'empty_avatar.png') {
            image = './assets/images/default-profile.png';
        } else {
            image = `${environment.api}/${menteeImage}`
        }
    
        return image
    }

    async uploadPhoto(event: any) {
        this.imageChangedEvent = event;
        const file = event.target.files[0];
        if (file.size > 2000000) {
        } else {
            initFlowbite();
            setTimeout(() => {
                this.dialogMode = "profile";
                this.modalbutton?.nativeElement.click();
            }, 500);
        }
    }

    imageCropped(event: ImageCroppedEvent) {
        if (event.base64) {
            this.imageSrc = this.croppedImage = event.base64;
            this.file = {
              name: "image",
              image: base64ToFile(event.base64), //event.file
            };
            this.hasImage = true;
            this.myImage = this.imageSrc;
        }
    }
    
    imageLoaded() {}
    
    cropperReady() {
        // cropper ready
    }
    
    loadImageFailed() {}
    
    imageCropperModalSave() {
        this.showImageCropper = false;
    }
    
    imageCropperModalClose() {
        this.showImageCropper = false;
    }
    
    rotateLeft() {
        this.canvasRotation--;
        this.flipAfterRotate();
    }
    
    rotateRight() {
        this.canvasRotation++;
        this.flipAfterRotate();
    }
    
    private flipAfterRotate() {
        const flippedH = this.transform.flipH;
        const flippedV = this.transform.flipV;
        this.transform = {
          ...this.transform,
          flipH: flippedV,
          flipV: flippedH,
        };
    }

    public getTimestamp() {
        const date = new Date();
        const timestamp = date.getTime();
    
        return timestamp;
    }

    async save() {
        if(this.isValidForm()) {
            let image = '';
            if(this.file) {
                const mentorForm = new FormData();

                let image_filename
                const filename = 'profile_' + this.me.id + '_' + this.getTimestamp();
                mentorForm.append('image_file', filename + '.jpg');
                mentorForm.append('image', this.file.image, filename + '.jpg');
                image_filename = filename + '.jpg'

                this._buddyService.uploadMentorPhoto(mentorForm).subscribe(
                    res => {
                        image = image_filename;
                        this.saveChanges(image);
                    },
                    error => {
                        console.log(error)
                        this.open(this._translateService.instant('dialog.error'), '')
                })
            } else {
                this.saveChanges(image);
            }
        } else {
            this.open(this._translateService.instant('wall.requiredfields'), '')
        }
    }

    saveChanges(image) {
        const major: any = document.getElementById('major')
        let language = this.selectedLanguage;
        if(language) {
            language = language?.map((data) => { return data.name_ES }).join(',');
        }

        let params
        if(image) {
            params = {
                user_id: this.id,
                company_id: this.companyId,
                major: this.profileForm.get('major').value ? this.profileForm.get('major').value : major.value,
                introduction: this.profileForm.get('introduction').value,
                interests: this.profileForm.get('interests').value,
                personality: this.profileForm.get('personality').value,
                location: this.profileForm.get('location').value,
                faculty: this.profileForm.get('faculty').value,
                business_unit: this.profileForm.get('business_unit').value,
                segment: this.profileForm.get('segment').value,
                language,
                image: image,
                }
        } else {
            params = {
                user_id: this.id,
                company_id: this.companyId,
                major: this.profileForm.get('major').value ? this.profileForm.get('major').value : major.value,
                introduction: this.profileForm.get('introduction').value,
                interests: this.profileForm.get('interests').value,
                personality: this.profileForm.get('personality').value,
                location: this.profileForm.get('location').value,
                faculty: this.profileForm.get('faculty').value,
                business_unit: this.profileForm.get('business_unit').value,
                segment: this.profileForm.get('segment').value,
                language,
            }
        }

        this._buddyService.updateMentorProfile(params).subscribe(
            res => {
                this.file = '';
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
            },
            error => {
                console.log(error)
                this.open(this._translateService.instant('dialog.error'), '')
        })
    }

    isValidForm() {
        let valid = true;
        Object.keys(this.profileForm.controls).forEach(key => {
          const controlErrors: ValidationErrors = this.profileForm.get(key).errors;
          if (controlErrors == null) {
            valid = true;
          } else {
            if (controlErrors != null) {
              valid = false;
            }
          }
        });
        return valid;
    }

    viewPublicProfile() {
        this._router.navigate([`/buddy/mentor/${this.id}`]);
    }

    changeTab(event) {
        if(event?.index == 2) {
            this.menteeMessages = this.selectedMenteeMessage?.mentee_id > 0 ? this.selectedMenteeMessage?.messages : [];
        }
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

    confirm() {
        if(this.confirmMode == 'reject-buddy') {
            this.rejectBuddy(true, this.selectedNotification);
            this.showConfirmationModal = false;
        } else if(this.confirmMode == 'message') {
            this.deleteMessage(this.selectedItem?.id, true);
        }
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

    changeInnerTab(event) {
        
    }

    setSelectedMessage(mentee) {
        this.selectedMenteeMessage = mentee;
        this.menteeMessages = this.selectedMenteeMessage?.mentee_id > 0 ? this.selectedMenteeMessage?.messages : [];
    }

    selectMenteeMessage(mentee) {
        this.setSelectedMessage(mentee);
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

    togglePostHover(event) {
        this.postHover = event;
    }

    sendMessage() {
        this.errorMessage = '';
    
        if(!this.newPost || this.isNewPostPlaceholder()) {
          this.errorMessage = this._translateService.instant('wall.pleaseinputavalue');
          this.open(
            this.errorMessage,
            ""
          );
        } else {
            let params = {
                'company_id': this.companyId,
                'user_id': this.selectedMenteeMessage?.mentee_id,
                'buddy_id': this.selectedMenteeMessage?.mentor_id,
                'message': this.newPost,
            }
            this._buddyService.contactMentor(params).subscribe(data => {
                this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
                this.newPost = this._translateService.instant('wall.sharewhatsonyourmind');
                this.displayMessages();
            }, err => {
                console.log('err: ', err)
                this.errorMessage = this._translateService.instant('dialog.error')
            })
        }
    }

    async displayMessages(getMessages = true, scroll = false) {
        this._buddyService.getMentorProfileMessages(this.userId, this.companyId).subscribe(async (response) => {
            this.allMessages = response?.messages;
            this.messages = response?.messages;

            let mentee_messages = this.messages?.filter(msg => {
                return msg.mentee_id == this.selectedMenteeMessage?.mentee_id
            })
            let mentee = mentee_messages?.length > 0 ? mentee_messages[0] : {}
            this.setSelectedMessage(mentee);

            this.cd.detectChanges();

            if(scroll) {
                this.scrollToTop()
            }
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        const contentContainer = document.querySelector(".mat-sidenav-content") || window;
        contentContainer.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    isNewPostPlaceholder() {
        let result = false;
        if(this.newPost == this._translateService.instant('wall.sharewhatsonyourmind')) {
            result = true;
        }
        return result;
    }

    handleDeleteMessage(message) {
        if (message) {
            this.showConfirmationModal = false;
            this.selectedItem = message;
            this.confirmMode = 'message';
    
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

    deleteMessage(id, confirmed) {
        if (confirmed) {
            this._buddyService.deleteMentorMessage(id).subscribe(data => {
                this.open(this._translateService.instant('dialog.deletedsuccessfully'), '');
                this.displayMessages();
             }, err => {
                console.log('err: ', err);
            })
        }
    }

    viewMenteeProfile(notification) {
        this._router.navigate([`/buddy/mentee/${notification.requestor_id}`]);
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