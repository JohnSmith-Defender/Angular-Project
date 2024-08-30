import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Input,
    SimpleChange,
    ViewChild,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalService } from "@share/services";
import { FormsModule } from "@angular/forms";
import { initFlowbite } from 'flowbite';
import { environment } from "@env/environment";
import { ChatService, ChatStream, ProfessionalsService } from "@features/services";
import { timer } from "@lib/utils/timer/timer.utils";
import moment from "moment";
import get from "lodash/get";

@Component({
    selector: "app-chat-room",
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule,
        FormsModule,
    ],
    templateUrl: "./chat.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
    private destroy$ = new Subject<void>();

    @Input() canChat: any;
    @Input() buttonColor: any;
    @Input() companyId: any;
    @Input() id: any;
    @Input() image: any;
    @Input() firstName: any;
    @Input() name: any;
    @Input() userId: any;
    @Input() userFirstName: any;
    @Input() userName: any;
    @Input() userImage: any;
    @Input() userData: any;
    @Input() senderBalance: any;
    @Input() reloadData: any;
    @Input() chatRole: any;
    @Input() currentUserImage: any;
    @Input() chatTimer: any;
    @Input() chatEnded: any;
    @Input() existingChatGuid: any;
    @Input() insufficientBalanceTitle: any;
    @Input() insufficientBalanceDescription: any;

    languageChangeSubscription;
    language: any;
    isMobile: boolean = false;
    chatMessages: any = [];
    messages: any = [];
    message: string = '';
    formSubmitted: boolean = false;
    leave: boolean = false;

    public client!: ChatStream;
    private channel!: string;
    private token = '';
    public memberId!: string;

    private _username!: string;
    get username(): string { return this._username; }

    private errorsSub!: Subscription;
    private peerToPeerMsgSub!: Subscription;
    
    chatTime: number = 0;
    chatInterval;
    chatTrackingTime: number = 0;
    chatTrackingInterval;
    waitingText: string = '';
    timeDisplay: string = '';
    notificationParams: any;
    
    pusherSubscription: Subscription | undefined;

    @ViewChild("closebutton", { static: false }) closebutton:
    | ElementRef
    | undefined;

    ngOnChanges(changes: SimpleChange) {
        let canChatChange = changes["canChat"];
        if (canChatChange && canChatChange.previousValue != canChatChange.currentValue) {
            this.canChat = canChatChange.currentValue;
            this.initializeData();
        }

        let reloadDataChange = changes["reloadData"];
        if (reloadDataChange && reloadDataChange.previousValue != reloadDataChange.currentValue) {
            this.reloadData = reloadDataChange.currentValue;
            this.initializeData();
        }

        let chatTimerDataChange = changes["chatTimer"];
        if (chatTimerDataChange && chatTimerDataChange.previousValue != chatTimerDataChange.currentValue) {
            this.chatTimer = chatTimerDataChange.currentValue;
            this.initializeTimeDisplay();
        }

        let chatEndedDataChange = changes["chatEnded"];
        if (chatEndedDataChange && chatEndedDataChange.previousValue != chatEndedDataChange.currentValue) {
            this.chatEnded = chatEndedDataChange.currentValue;
            if(this.chatEnded) {
                this.closeChat();
                setTimeout(() => {
                    this.closebutton?.nativeElement?.click();
                }, 500)
            }
        }

        let existingChatGuidDataChange = changes["existingChatGuid"];
        if (existingChatGuidDataChange && existingChatGuidDataChange.previousValue != existingChatGuidDataChange.currentValue) {
            this.existingChatGuid = existingChatGuidDataChange.currentValue;
        }

        let insufficientBalanceTitleDataChange = changes["insufficientBalanceTitle"];
        if (insufficientBalanceTitleDataChange && insufficientBalanceTitleDataChange.previousValue != insufficientBalanceTitleDataChange.currentValue) {
            this.insufficientBalanceTitle = insufficientBalanceTitleDataChange.currentValue;
            this.cd.detectChanges();
        }

        let insufficientBalanceDescriptionDataChange = changes["insufficientBalanceDescription"];
        if (insufficientBalanceDescriptionDataChange && insufficientBalanceDescriptionDataChange.previousValue != insufficientBalanceDescriptionDataChange.currentValue) {
            this.insufficientBalanceDescription = insufficientBalanceDescriptionDataChange.currentValue;
            this.cd.detectChanges();
        }
    }

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _chatService: ChatService,
        private _professionalsService: ProfessionalsService,
        private cd: ChangeDetectorRef
    ) {

    }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");

        this.languageChangeSubscription =
            this._translateService.onLangChange.subscribe(
                (event: LangChangeEvent) => {
                    this.language = event.lang;
                    this.initializeData();
                }
            );

        if (this.canChat) {
            initFlowbite();
        }

        this.subscribeChat();
        this.initializeData();
    }

    subscribeChat() {
        this.pusherSubscription = this._chatService
          .getFeedItems()
          .subscribe(async(response) => {
            if(
              (!localStorage.getItem('chat-session') || response.mode == 'end-chat') && 
              (response?.id == this.userId || response?.channel == this.userId)
            ) {
          
              if(response.mode == 'end-chat') {
                this.canChat = false;
                this.chatEnded = true;
                this.cd.detectChanges();

                setTimeout(() => {
                    this.closeChat();
                })
              }
            }
          })
    }

    initializeData() {
        this.waitingText = `${this._translateService.instant('professionals.waitingfor')} ${this.firstName} ${this._translateService.instant('professionals.acceptchatrequest')}`;
        if (this.canChat) { this.initializeChatService(); }
    }

    initializeTimeDisplay() {
        if(this.chatTimer) { 
            this.waitingText = ''; 
            this.timeDisplay = `${this.chatTimer} ${this._translateService.instant('timeunits.minutes')}`;
        }
        this.cd.detectChanges();
    }

    async initializeChatService() {
        if(!this.memberId) {
            this.memberId = String(Math.floor(Math.random() * 2032));
            this._username = this.userName;
    
            this.token = get(await this._chatService.generateRTMToken(this.memberId).toPromise(), 'rtmToken');
    
            if(this.token && this.memberId) {
                this.channel = `agora-vcp-chat-${this.id}-${this.userId}`;
                this.client = new ChatStream(
                    this.channel,
                    this.token,
                    this.memberId,
                    this._professionalsService,
                );
        
                if (!this.client.isJoined) {
                    let chat_guid = Math.random().toString(36).substring(6);
                    let chat_passcode = Math.random().toString(36).substring(6);

                    this.notificationParams = {
                        id: this.id,
                        user_id: this.userId,
                        company_id: this.companyId,
                        mode: 'accept-chat',
                        message: this._translateService.instant('professionals.incomingchat'),
                        sender_name: this.userName,
                        sender_image: this.userImage,
                        room: this.channel,
                        sender_uid: this.memberId,
                        sender_balance_before_chat: this.senderBalance,
                        chat_guid: this.existingChatGuid || chat_guid,
                        chat_passcode,
                        token: this.token,
                    }

                    await this.client.joinChannel(
                        this.channel,
                        this.token,
                        this.username,
                        this.currentUserImage || this.userImage,
                        this.chatRole == 'recipient' ? true : false,
                        this.notificationParams,
                        this.existingChatGuid || chat_guid,
                    );
        
                    this.internalEventListener();
        
                    let currentUserId = this._localService.getLocalStorage(environment.lsuserId);
                    if (this.userId == currentUserId) { this.initiateChat(this.notificationParams) };
                }
            }
        }

        if(this.client) {
            this.client.chatMessagesUpdated$.subscribe(status =>{
                setTimeout(() => {
                    this.chatMessages = this.client.chatMessages;
                    this.cd.detectChanges();
                }, 500)
            })

            if(this.chatRole == 'recipient') {
                this.client.recipientJoined$.subscribe(status =>{
                    setTimeout(() => {
                        if(!this.chatInterval) {
                            this.initializeTimer();
                        }
                    }, 500)
                })
            }
        }
    }

    initializeTimer() {
        this.startChatTimer();
        this.startTrackingChatDuration();
    }

    startChatTimer() {
        this.chatInterval = setInterval(() => {
            if (this.chatTime === 0) {
                this.chatTime++;
            } else {
                this.chatTime++;
            }
            this.chatTimer = timer.transform(this.chatTime);
            this.initializeTimeDisplay();
        }, 1000);
    }

    startTrackingChatDuration() {
        this.chatTrackingInterval = setInterval(() => {
            if (this.chatTrackingTime === 0) {
                this.chatTrackingTime++;
            } else {
                this.chatTrackingTime++;
            }
    
            this.editChatSenderBalance();
        }, 5000);
    }

    /**
        * Listeners event like remote info update, left, join, error, volume indicator.
        */
    private internalEventListener(): void {
        this.errorsSub = this.client.errors.subscribe(async (res: { code: string | number; msg: string; }) => {
            console.log('errorsSub', res);
            switch (res.code) {
                case 'CAN_NOT_GET_GATEWAY_SERVER':
                    await this.leaveChannel();
                    break;
                default:
                    break;
            }
        })

        this.peerToPeerMsgSub = this.client.peerToPeerMsg.subscribe((res: { text: string, messageType: string, sendPeerId: string }) => {
            switch (res.text) {
                case 'leave-channel':
                    this.leaveChannel();
                    break;
                default:
                    break;
            }
        })
    }

    editChatSenderBalance() {
        let stats = this.chatTime || 0;
    
        if(stats > 0) {
            let params = {
                chat_guid: this.notificationParams?.chat_guid,
                stats,
                professional_user_id: this.notificationParams?.id,
                sender_user_id: this.notificationParams?.user_id,
                room: this.notificationParams?.room,
            }
            
            this._professionalsService.editChatSenderBalance(params).subscribe(
                (response) => {
                    
                },
                (error) => {
                    console.log(error);
                })
        }
    }

    /**
    * Leave the chanel.
    */
    async leaveChannel(): Promise<void> {
        await this.client?.leaveChannel();
        this.leave = true;
    }

    async initiateChat(params) {
        this.notifyChatProfessional(params);
    }

    notifyChatProfessional(params) {
        this._professionalsService.notifyChatProfessional(params).subscribe(
            (response) => {
            },
            (error) => {
                console.log(error);
            })
    }

    async sendMessage() {
        this.formSubmitted = true;
        await this.client.sendMessage(
            this.message,
            this.userName,
            this.currentUserImage,
        );

        setTimeout(() => {
            this.message = '';
            this.chatMessages = this.client?.chatMessages;
            this.cd.detectChanges();
            this.formSubmitted = false;
        }, 500)
    }

    closeChat() {
        this.handleOnLeave();
        this.pauseTimer();
        this.editChatSenderBalance();

        let timezoneOffset = new Date().getTimezoneOffset();
        let offset = moment().format('Z');
        let params = {
            id: this.notificationParams?.id,
            user_id: this.notificationParams?.user_id,
            company_id: this.notificationParams?.company_id,
            mode: 'end-chat',
            channel: this.notificationParams?.id,
            room: this.notificationParams?.room,
            sender_uid: this.notificationParams?.sender_uid,
            chat_guid: this.notificationParams?.chat_guid,
            duration: this.chatTime || 0,
            timezone: timezoneOffset,
            offset,
        }
        this.notifyChatProfessional(params);

        setTimeout(() => {
            this._router.navigate(['/'])
            .then(() => {
                window.location.reload();
            });
        })
    }

    pauseTimer() {
        clearInterval(this.chatInterval);
        clearInterval(this.chatTrackingInterval);
    }

    handleOnLeave() {
        if (this.canChat) {
            this.errorsSub?.unsubscribe();
            this.peerToPeerMsgSub?.unsubscribe();
        }
    }

    ngOnDestroy() {
        localStorage.removeItem('chat-session');
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}