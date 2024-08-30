import { BehaviorSubject, ReplaySubject } from "rxjs";
import { ChatMessages } from "@lib/interfaces";
import AgoraRTM, { RtmClient, RtmChannel } from 'agora-rtm-sdk';
import { ProfessionalsService } from "../professionals.service";
import { environment } from "@env/environment";
import moment from "moment";

export class ChatStream {
    private appId = environment.agoraAppId;
    private channel: string = '';
    private token: string = '';
    private uid: string = '';
    private recipientJoined: boolean = false;
    private rtmClient!: RtmClient;
    private rtmChannel!: RtmChannel;
    public loading: boolean = false;
    public isJoined: boolean = false;

    /**
    * Replay subject to emit the events like
    * peerToPeerMsg, chatMessages, errors.
    */
    public errors = new ReplaySubject<{ code: number | string; msg: string }>();
    public peerToPeerMsg = new ReplaySubject<{ text: string, messageType: string; sendPeerId: string }>();
    public chatMessages: ChatMessages[] = [];

    chatMessagesUpdated$ = new BehaviorSubject<boolean>(false);
    recipientJoined$ = new BehaviorSubject<boolean>(false);

    _professionalsService: ProfessionalsService | undefined;

    constructor(channel: string, token: string, uid: string, professionalsService: ProfessionalsService) {
        this.channel = channel;
        this.token = token;
        this.uid = uid;
        this._professionalsService = professionalsService;
        this.rtmClient = AgoraRTM.createInstance(this.appId);
    }

    /**
    * Join the Local streamer client channel.
    */
    async joinChannel(channel: string, token: string, username: string, image: string, recipientJoined: boolean, chat: any, chatGuid: string) {
        await this.loginRTM(username, image);
        this.recipientJoined = recipientJoined;
        this.isJoined = true;
        this.loading = false;

        if(this.recipientJoined) {
            this.triggerNotification(channel, token, chat);
        }
    }

    triggerNotification(channelName: string, token: string | null, chat: any) {
        this.recipientJoined$.next(true);

        let timezoneOffset = new Date().getTimezoneOffset();
        let offset = moment().format('Z');
        let params = {
            id: chat?.id,
            user_id: chat?.user_id,
            company_id: chat?.company_id,
            mode: 'recipient-joined-chat',
            channel: chat?.user_id,
            room: chat?.room,
            timezone: timezoneOffset,
            offset,
            recipient_uid: this.uid,
            chat_guid: chat?.chat_guid,
        }

        this._professionalsService?.notifyChatProfessional(params).subscribe(
            (response) => { 
            },
            (error) => {
                console.log(error);
            })
    }

    /**
    * Leave channel.
    */
    async leaveChannel(): Promise<void> {
        this.loading = true;
        this.rtmClient.logout();
        this.isJoined = false;
        this.loading = false;
    }

    /**
    * Login into the RTM account.
    */
    async loginRTM(username: string, image: string): Promise<void> {
        console.log('login ' + this.uid.toString())
        await this.rtmClient.login({ uid: this.uid.toString(), token: this.token })
            .then(async () => {
                await this.rtmClient.setLocalUserAttributes({ 
                    name: username, 
                    image,
                    isPresenting: '0' 
                });
                await this.createChannel();
            })
            .catch((res: any) => {
                this.errors.next({ code: res.code, msg: res.message });
            });
    }

    /**
    * Create the RTM Channel.
    */
    async createChannel(): Promise<void> {
        this.rtmChannel = await this.rtmClient.createChannel(this.channel);
        await this.joinRTM();
    }

    /**
    * Join the RTM Channel.
    */
    async joinRTM(): Promise<void> {
        await this.rtmChannel.join()
            .then(() => {
                this.rtmEventListener();
            })
            .catch((res: any) => {
                console.log(res.message);
                this.errors.next({ code: res.code, msg: res.message });
                return;
            });
    }

    /**
    * EventListener of the rtm client.
    */
    rtmEventListener(): void {
        this.rtmChannel.on('ChannelMessage', async (message: any, memberId: string) => {
            let name = '';
            let image = '';
            await this.getUserAttribute(memberId)
                .then((value) => {
                    name = value.name;
                    image = value.image;
                })
                .catch((reason: any) => console.log("getUserAttribute error", reason));
            this.chatMessages.push({
                memberId,
                memberName: name,
                memberImage: image,
                message: message.text,
                messageType: message.messageType,
                timestamp: Date.now()
            })
            this.chatMessagesUpdated$.next(true);
        })
        this.rtmChannel.on('MemberJoined', (memberId: string) => {
            console.log("MemberJoined", memberId);
        })
        this.rtmChannel.on('MemberLeft', (memberId: string) => {
            console.log("MemberLeft", memberId);
        })
        this.rtmClient.on('MessageFromPeer', (message: any, peerId: string) => {
            console.log("MessageFromPeer", message, peerId);
            this.peerToPeerMsg.next({ text: message.text, messageType: message.messageType, sendPeerId: peerId });
        })
    }

    /**
      * Get user name from the rtm.
      */
    async getUserAttribute(id: string): Promise<any> {
        return await this.rtmClient.getUserAttributes(id);
    }

    /**
    * Send message to the channel.
    */
    async sendMessage(message: string, memberName: string, memberImage: string): Promise<void> {
        await this.rtmChannel.sendMessage({ text: message })
        .then(() => {
            this.chatMessages.push({
                memberId: this.uid.toString(),
                memberName,
                memberImage,
                message: message,
                messageType: 'TEXT',
                timestamp: Date.now()
            })
            this.chatMessagesUpdated$.next(true);
        })
        .catch((reason: any) => {
            console.log(reason.message)
        });
    }
}