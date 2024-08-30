import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from '@env/environment';
import { ProfessionalsService } from '@features/services';
import { LocalService } from '@share/services';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  swPushpayload: any;

  constructor(
    private swPush: SwPush,
    private _localService: LocalService,
    private _professionalsService: ProfessionalsService,
  ) {

  }

  subscribeToNotifications(professional: any): void {
    if (this.swPush.isEnabled) {
      this.swPush
        .requestSubscription({
          serverPublicKey: environment.webPushServerPublicKey
        })
        .then((sub: PushSubscription) => {
          this.saveSubscription(sub, professional);
          this.storeSubscription(sub);
        })
        .catch((err: any) => console.error('Could not subscribe to notifications', err));
    }
  }

  unsubscribeFromPushNotifications(): void {
    this.swPush
      .unsubscribe()
      .then(() => {
        console.log('Unsubscribed from push notifications.');
      })
      .catch(error => {
        console.error('Error unsubscribing from push notifications:', error);
      });
  }

  subscribeMessage(): void {
    this.swPush.messages.subscribe((res: any) => {
      if(res.notification.data.url) {
        location.href = res.notification.data.url;
      }
    });
  }

  private saveSubscription(sub: PushSubscription, professional): void {
    let params = {
      id: professional.user_id,
      subscription: JSON.stringify(sub),
    }

    this._professionalsService.notificationSubscription(params).subscribe(
      (response) => {
        
      },
      (error) => {
        console.log(error);
      })
  }

  private storeSubscription(sub: PushSubscription): void {
    this._localService.setLocalStorage(environment.lsprofessionalsubscription, JSON.stringify(sub))
  }
}