import { CommonModule, NgOptimizedImage, Location } from '@angular/common';
import { 
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, 
    ElementRef, 
    HostListener, 
    Input, 
    ViewChild 
} from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Router } from "@angular/router";
import { Subject, takeUntil } from 'rxjs';
import { EditorModule } from "@tinymce/tinymce-angular";
import { environment } from '@env/environment';
import { BuddyService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from '@share/components';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { checkIfValidCalendlyAccount } from "src/app/utils/calendly/helper";
import { MentorCalendlyComponent } from '../calendly/calendly.component';
import { MentorMessageComponent } from '../message/message.component';
import get from 'lodash/get';

@Component({
    selector: 'app-mentor',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        NgOptimizedImage,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        MatSnackBarModule,
        FontAwesomeModule,
        PageTitleComponent,
        BreadcrumbComponent,
        ToastComponent,
        MentorCalendlyComponent,
        MentorMessageComponent,
    ],
    templateUrl: './mentor.component.html'
})
export class MentorComponent {
    private destroy$ = new Subject<void>();

    @Input() id!: number;

    languageChangeSubscription;
    apiPath: string = environment.api + "/";
    me: any;
    user: any;
    email: any;
    language: any;
    company: any;
    companyId: any = 0;
    companies: any;
    domain: any;
    pageTitle: any;
    features: any;
    level1Title: string = "";
    level2Title: string = "";
    level3Title: string = "";
    level4Title: string = "";
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
    canCreate: boolean = false;
    editHover: boolean = false;
    deactivateHover: boolean = false;
    askHover: boolean = false;
    contactBuddyLog: any = [];
    message: any;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: any;
    confirmDeleteItemDescription: any;
    acceptText: string = "";
    cancelText: any = "";
    confirmMode: string = "";
    mentor: any;
    image: any;
    location: any;
    languages: any;
    dialogMode: string = "";
    dialogTitle: any;
    setupCalendlyFormSubmitted: boolean = false;
    setupCalendlyForm: FormGroup = new FormGroup({
        'link': new FormControl("", [Validators.required]),
        'personal_access_token': new FormControl('', [Validators.required])
    });
    contactFormSubmitted: boolean = false;
    errorMessage: any;
    processing: boolean = false;
    isMyMentor: boolean = false;
    isValidCalendlyAccount: boolean = false;
    hasCheckedCalendly: boolean = false;
    newPost: any;
    postHover: boolean = false;
    allmessages: any = [];
    messages: any = [];
    canAcceptMentee: boolean = false;
    showRequestMentor: boolean = false;
    hasLimitReached: boolean = false;
    limitSettings: any;
    photo: any;
    @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
    @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

    constructor(
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _buddyService: BuddyService,
        private _location: Location,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef
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
        this.fetchBuddiesData();
    }

    fetchBuddiesData() {
        this._buddyService
          .fetchBuddiesData(this.companyId, this.userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.mapFeatures(data?.features_mapping);
                this.mapUserPermissions(data?.user_permissions);
                this.initializeBreadcrumb();
                if(this.id > 0) {
                    this.loadMentorData();
                }
            },
            (error) => {
              console.log(error);
            }
        );
    }

    mapFeatures(features) {
        this.buddyFeature = features?.find((f) => f.feature_id == 19);
        this.featureId = this.buddyFeature?.feature_id;
        this.pageName = this.getFeatureTitle(this.buddyFeature);
    }

    mapUserPermissions(user_permissions) {
        this.superAdmin = user_permissions?.super_admin_user ? true : false;
        this.canCreate =
          user_permissions?.create_plan_roles?.length > 0 ||
          user_permissions?.member_type_permissions?.find(
            (f) => f.create == 1 && f.feature_id == 20
          );
    }

    initializeBreadcrumb() {
        this.level1Title = this.pageName;
        this.level2Title = this._translateService.instant('buddy.mentor');
        this.level3Title = "";
        this.level4Title = "";
    }

    handleEditRoute() {
        this._router.navigate([`/buddy/profile/mentor/${this.id}`]);
    }
    
    toggleEditHover(event) {
        this.editHover = event;
    }

    handleDeactivate() {
        if (this.id) {
            this.confirmMode = 'deactivate';
            this.showConfirmationModal = false;
            this.confirmDeleteItemTitle = this._translateService.instant(
                "dialog.confirmupdate"
            );
            this.confirmDeleteItemDescription = this._translateService.instant(
                "dialog.confirmupdateitem"
            );
            this.acceptText = "OK";
            setTimeout(() => (this.showConfirmationModal = true));
        }
    }

    toggleDeactivateHover(event) {
        this.deactivateHover = event;
    }

    confirm() {
        if(this.confirmMode == 'deactivate') {
            this.deactivateMentor(this.id, true);
        } else if(this.confirmMode == 'message') {
            this.deleteMessage(this.selectedItem?.id, true);
        }
    }

    deactivateMentor(id, confirmed) {
        if (confirmed) {

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

    getFeatureTitle(feature) {
        return feature
          ? this.language == "en"
            ? feature.name_en ||
              feature.feature_name ||
              feature.name_es ||
              feature.feature_name_ES
            : this.language == "fr"
            ? feature.name_fr ||
              feature.feature_name_FR ||
              feature.name_es ||
              feature.feature_name_ES
            : this.language == "eu"
            ? feature.name_eu ||
              feature.feature_name_EU ||
              feature.name_es ||
              feature.feature_name_ES
            : this.language == "ca"
            ? feature.name_ca ||
              feature.feature_name_CA ||
              feature.name_es ||
              feature.feature_name_ES
            : this.language == "de"
            ? feature.name_de ||
              feature.feature_name_DE ||
              feature.name_es ||
              feature.feature_name_ES
            : this.language == "it"
            ? feature.name_it ||
              feature.feature_name_IT ||
              feature.name_es ||
              feature.feature_name_ES
            : feature.name_es || feature.feature_name_ES
          : "";
    }

    loadMentorData() {
        this._buddyService
          .fetchMentor(this.id, this.userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                console.log(data)
                this.initializeMentorProfile(data);
            },
            (error) => {
              console.log(error);
            }
        );
    }

    async initializeMentorProfile(data) {
        this.me = data?.current_user;
        this.user = data?.user;
        this.mentor = data?.mentor;
        this.image =  `${environment.api}/${this.user?.image}`;
        this.photo =  this.user?.photo ? `data:image/png;base64,${this.user?.photo}` : '';
        this.location = this.mentor?.location || this.user?.city;
        this.languages = this.mentor?.languages || this.user?.language;
        this.contactBuddyLog = data.buddy_contact_log;
        this.limitSettings = data?.limit_settings;

        let buddy_mentors = data?.buddy_mentors?.filter(bm => {
            return bm.mentor_id == this.id && bm.buddy_id == this.userId
        })
        if(buddy_mentors?.length > 0) {
            this.isMyMentor = true;
        }

        if(this.superAdmin || this.isMyMentor || this.id == this.userId) {
            this.getMessages();
        }

        this.getRequestMentorStatus();
        this.initializeCalendar();
    }

    getRequestMentorStatus() {
        this.hasLimitReached = this.limitSettings?.limit > 0 && this.mentor?.buddies?.length == this.limitSettings?.limit ? true : false;
        this.canAcceptMentee = this.hasLimitReached ? false : true;
        this.showRequestMentor = this.userId != this.mentor?.user_id 
            && !this.isMyMentor 
            && (
                (this.contactBuddyLog?.id > 0) ||
                (!(this.contactBuddyLog?.id > 0) && this.canAcceptMentee)
            ) ? true : false;
    }

    async initializeCalendar() {
        const eventObj = await checkIfValidCalendlyAccount(this.user?.calendly_personal_access_token, this.user?.calendly_url)
    
        if(eventObj?.isValidToken && eventObj?.isValidURL){
            this.isValidCalendlyAccount = true
        }else{
            this.isValidCalendlyAccount = false
        }
        this.hasCheckedCalendly = true;
    }

    handleSettingsClick() {
        initFlowbite();
        this.setupCalendlyFormSubmitted = false;
        this.setupCalendlyForm.controls['link'].setValue(this.user?.calendly_url || '');
        this.setupCalendlyForm.controls['personal_access_token'].setValue(this.user?.calendly_personal_access_token);
        this.dialogMode = "settings";
        this.dialogTitle =  this._translateService.instant('members.setupcalendly');
        this.modalbutton?.nativeElement.click();
    }

    async saveCalendlySettings() {
        const personal_access_token = this.setupCalendlyForm.value?.personal_access_token;
        const link = this.setupCalendlyForm.value?.link;
    
        let isValidCalendlyToken = true
        let isValidCalendlyUrl = true
        if (link) {
            const eventObj = await checkIfValidCalendlyAccount(personal_access_token, link);
            isValidCalendlyToken = eventObj?.isValidToken;
            isValidCalendlyUrl = eventObj?.isValidURL
        }
    
        if(isValidCalendlyToken){
            this.setupCalendlyFormSubmitted = true
    
            if(!this.isValidCalendlyForm()) {
              return false
            }
    
            let params = {
              company_id: this.companyId,
              user_id: this.mentor?.user_id,
              link,
              mentor_id: this.mentor?.id,
              personal_access_token,
            }
            this._buddyService.updateMentorCalendly(params).subscribe(data => {
              this.user.calendly_url = link;
              this.mentor.calendly_url = link;
              this.user.personal_access_token = personal_access_token;
              this.mentor.personal_access_token = personal_access_token;
              this.closemodalbutton?.nativeElement.click();
              this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
            }, err => {
              console.log('err: ', err);
            })
        } else if(!isValidCalendlyUrl || !isValidCalendlyToken){
            this.open(this._translateService.instant('tutors.correctcalendlycredntials'), '');
        }
    }

    isValidCalendlyForm() {
        let valid = true;
        Object.keys(this.setupCalendlyForm?.controls).forEach(key => {
            const controlErrors: ValidationErrors = this.setupCalendlyForm?.get(key)?.errors!;
            if(controlErrors != null) {
                valid = false;
            }
        });
        return valid;
    }

    handleAskAsMentor() {
        if(this.userId > 0) {
            this.dialogMode = "ask-mentor";
            this.dialogTitle =  this._translateService.instant('buddy.asktobementor');
            this.modalbutton?.nativeElement.click();
        } else {
            this._router.navigate(['/auth/login']);
        }
    }

    toggleAskHover(event) {
        this.askHover = event;
    }

    askToBeMentor() {
        this.errorMessage = ''
        this.contactFormSubmitted = true
        this.processing = true

        let params = {
            'company_id': this.companyId,
            'user_id': this.userId,
            'buddy_id': this.mentor.user_id,
            'message': this.message,
        }
        if(this.dialogMode == 'ask-mentor') {
            this._buddyService.askToBeMentor(params).subscribe(data => {
                this.getColleagueAsked();
                this.processing = false;
                this.closemodalbutton?.nativeElement.click();
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
            }, err => {
                console.log('err: ', err)
                this.errorMessage = this._translateService.instant('dialog.error');
            })
        } else {
            this._buddyService.contactMentor(params).subscribe(data => {
                this.processing = false
                this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
            }, err => {
                console.log('err: ', err)
                this.errorMessage = this._translateService.instant('dialog.error');
            })
        }
    }

    getColleagueAsked() {
        this._buddyService.getColleagueAsked(this.userId, this.id)
        .subscribe(
            response => {
                this.contactBuddyLog = response.buddy_contact_log
            },
            error => {
              
            }
        )
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
                'user_id': this.userId,
                'buddy_id': this.mentor?.user_id,
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
        if (getMessages) {
          await this.getMessages();
        }
        this.messages = this.allmessages;
    
        this.cd.detectChanges();
    
        if(scroll) {
            this.scrollToTop()
        }
    }

    async getMessages() {
        this._buddyService.getMentorMenteeMessages(this.id, this.userId, this.superAdmin).subscribe(async (response) => {
            let results = response.messages.filter(
                (data) => {
                    data.message = data.message.replaceAll("\n", "<br/>");
                    return data;
                }
            );

            this.allmessages = results;
            this.messages = results;
            this.cd.detectChanges();
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

    handleGoBack() {
        this._location.back();
    }

    getCurrentUserImage() {
        let image = ''
        if(this.me?.photo) {
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
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}