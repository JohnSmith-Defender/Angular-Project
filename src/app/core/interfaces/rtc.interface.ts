import AgoraRTC, { IMicrophoneAudioTrack, IAgoraRTCClient, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

export interface RTC {
    client: IAgoraRTCClient | null,
    localAudioTrack: IMicrophoneAudioTrack | null,
    remoteAudioTracks: IRemoteAudioTrack | {},
    micMuted: boolean | true,
}