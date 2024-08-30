import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef, Input, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { IAgoraRTCClient, IAgoraRTCRemoteUser, UID } from 'agora-rtc-sdk-ng';
import { RemoteUserComponent } from '../remote-user/remote-user.component';
import { VideoCallService } from '@features/services';

@Component({
    selector: 'app-remote-stream',
    standalone: true,
    imports: [],
    templateUrl: './remote-stream.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoteStreamComponent implements OnInit, OnDestroy {
    @Input() participantInfo: any;
    @Input() statusText: any;
    
    client: IAgoraRTCClient | undefined;
    remoteUserComponentRefs: Map<string, ComponentRef<RemoteUserComponent>>;

    isRemoteStreamVisible: boolean = false;
    callEnded: boolean = false;

    @ViewChild('remoteVideoContainer', { read: ViewContainerRef }) remoteVideoContainer!: ViewContainerRef;
    
    constructor(
        private _videoCallService: VideoCallService,
        private cd: ChangeDetectorRef
    ) {
        this.client = this._videoCallService.getClient()
        this.remoteUserComponentRefs = new Map()
    }

    ngOnInit(): void {
        this.client?.on('user-published', this.handleRemoteUserPublished)
        this.client?.on('user-unpublished', this.handleRemoteUserUnpublished)
    }

    ngOnDestroy(): void {
        this.client?.off('user-published', this.handleRemoteUserPublished)
        this.client?.off('user-unpublished', this.handleRemoteUserUnpublished)
    }

    private handleRemoteUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video" | "datachannel") => {
        await this.client?.subscribe(user, mediaType);

        if (mediaType === 'audio') {
            user.audioTrack?.play()
        } else if (mediaType === 'video') {
            const uid = user.uid
            this._videoCallService.addRemoteUser(uid);
            const remoteUserComponentRef: ComponentRef<RemoteUserComponent> = this.remoteVideoContainer.createComponent(RemoteUserComponent);
            remoteUserComponentRef.instance.uid = uid;
            let remoteUserContainer = remoteUserComponentRef.instance['elementRef'].nativeElement;
            let remoteUserDiv = remoteUserContainer?.children[0]?.children[0];
            if(remoteUserDiv) {
                user.videoTrack?.play(remoteUserDiv);
            }
            this.remoteUserComponentRefs.set(uid.toString(), remoteUserComponentRef);
            this.isRemoteStreamVisible = true;
            this.cd.detectChanges();
        }
    }

    private handleRemoteUserUnpublished = async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video" | "datachannel") => {
        if (mediaType === 'video') {
            const remoteUserUid = user.uid.toString()
            const componentRef = this.remoteUserComponentRefs.get(remoteUserUid)
            if (componentRef) {
                const viewIndex = this.remoteVideoContainer.indexOf(componentRef?.hostView)
                this.remoteVideoContainer.remove(viewIndex)
                this.remoteUserComponentRefs.delete(remoteUserUid)
            } else {
                console.log(`Unable to find remoteUser with UID: ${user.uid}`)
            }
            
            this.isRemoteStreamVisible = false;
        }
    }

    goHome() {
        location.href = '/';
    }

    clearRemoteUsers(): void {
        this.remoteVideoContainer.clear();
        this.remoteUserComponentRefs.clear();
        this.isRemoteStreamVisible = false;
    }
}