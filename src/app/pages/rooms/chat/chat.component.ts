import { CommonModule } from '@angular/common';
import { 
    ChangeDetectionStrategy,
    ChangeDetectorRef, 
    Component, 
    HostListener,
    Input
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
  } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompanyService, LocalService } from '@share/services';
import { ProfessionalsService, ChatService } from '@features/services';
import { ChatComponent } from '@share/components/rooms/chat/chat.component';
import { Subject } from 'rxjs';
import { environment } from '@env/environment';
import moment from "moment";
import get from "lodash/get";

@Component({
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule,
        ReactiveFormsModule,
        TranslateModule, 
        RouterModule,
        ChatComponent,
    ],
    templateUrl: './chat.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatRoomComponent {
    private destroy$ = new Subject<void>();

    @Input() guid: any;
    @Input() code: any;
    @Input() role: any;
    
    languageChangeSubscription;
    language: any;
    companyId: any;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    isMobile: boolean = false;

    requirePasscode: boolean = true;
    invalidPasscode: boolean = false;
    userData: any = [];
    chatTimer: string = '';

    existingChatLog: any;
    room: any;
    recipientUid: any;
    sender: any;
    isLoading; boolean = true;
    professional: any;
    mode: string = '';
    hasJoined: boolean = false;
    canChat: boolean = false;
    reloadData: boolean = false;

    statusText: any;
    id: any;
    image: any;
    firstName: any;
    name: any;
    userId: any;
    userFirstName: any;
    userName: any;
    userImage: any;
    senderBalance: any;
    chatRole: string = '';
    currentUserImage: any;
    chatEnded: boolean = false;
    existingChatGuid: any;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _chatService: ChatService,
        private _professionalsService: ProfessionalsService,
        private cd: ChangeDetectorRef
    ) {
        localStorage.removeItem('joined-video-channel');
    }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");

        this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
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
        let params = {
            company_id: this.companyId,
            chat_guid: this.guid,
            chat_passcode: this.code,
        }

        this._professionalsService.validateChatPasscode(params).subscribe(
            (response) => {
                this.isLoading = false;
                if(response?.existing_chat_log?.id > 0) {
                    this.requirePasscode = false;
                    this.initializeData(response);
                } else {
                    this.invalidPasscode = true;
                }
                this.cd.detectChanges();
            },
            (error) => {
                console.log(error);
            })
    }

    initializeData(response: any) {
        if(!this.requirePasscode && response) {
            this.statusText =  this._translateService.instant('professionals.connecting');
            this.existingChatLog = response.existing_chat_log;
        
            this.sender = response.user;
            this.professional = response.professional;
            this.mode = this.role;

            this.initializeChat();

            this.cd.detectChanges();
        }
    }

    initializeChat() {
        this.chatTimer = '';
        this.canChat = false;
        this.reloadData = false;
        
        this.initializeUserDetails();
        
        this.existingChatGuid = this.existingChatLog?.chat_guid;
        localStorage.setItem('chat-session',  this.existingChatGuid);
        
        setTimeout(() => {
            this.canChat = true;
            this.reloadData = true;
            this.cd.detectChanges();
        })
    }

    initializeUserDetails() {
        this.id = this.professional.id;
        this.userId = this.sender.id;
        this.image = this.professional?.image;
        this.firstName = this.professional?.first_name;
        this.userName = this.sender?.name;
        this.userFirstName = this.sender?.first_name;
        this.userImage = this.sender?.image;
        this.senderBalance = this.sender?.available_balance;
        this.chatRole = this.role;
        this.currentUserImage = this.professional.image;
    
        this.userData = [
          {
            label: this._translateService.instant('company-settings.name'),
            value: this.sender?.name,
          },
          {
            label: this._translateService.instant('profile-settings.birthday'),
            value: this.sender?.birthday ? moment(this.sender?.birthday).format('DD/MM/YYYY') : '-'
          },
          {
            label: this._translateService.instant('professionals.gender'),
            value: this.sender?.gender || '-'
          },
          {
            label: this._translateService.instant('professionals.civilstatus'),
            value: this.sender?.civil_status || '-'
          },
          {
            label: this._translateService.instant('profile-settings.position'),
            value: this.sender?.position || ''
          },
          {
            label: this._translateService.instant('profile-settings.city'),
            value: this.sender?.city || ''
          },
          {
            label: this._translateService.instant('profile-settings.country'),
            value: this.sender?.country || ''
          },
        ]
      }

    goHome() {
        this._router.navigate(['/'])
    }

    ngOnDestroy() {
        localStorage.removeItem('chat-session');
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}