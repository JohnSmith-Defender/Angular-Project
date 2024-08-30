import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { STRIPE_CREATE_IDENTITY_VERIFICATION_SESSION_URL, STRIPE_CREATE_PAYMENT_INTENT_URL } from '@lib/api-constants';
import { PaymentIntent } from '@stripe/stripe-js';
import Stripe from 'stripe';

export const STRIPE_CLIENT_ID = new InjectionToken<string>('[VCP] ClientID');
export const STRIPE_PUBLIC_KEY = 'pk_test_51Ii5RpH2XTJohkGafOSn3aoFFDjfCE4G9jmW48Byd8OS0u2707YHusT5PojHOwWAys9HbvNylw7qDk0KkMZomdG600TJYNYj20';

@Injectable({
    providedIn: 'root'
})
export class StripePaymentService {
    constructor(
        @Inject(STRIPE_CLIENT_ID) private readonly clientId: string,
        private readonly http: HttpClient
    ) { }

    createPaymentIntent(
        params: Stripe.PaymentIntentCreateParams
    ): Observable<PaymentIntent> {
        return this.http.post<PaymentIntent>(
            STRIPE_CREATE_PAYMENT_INTENT_URL,
            params,
            { headers: { merchant: this.clientId } }
        );
    }

    createVerificationSession(userid: string): Observable<any> {
        return this.http.post<PaymentIntent>(
            STRIPE_CREATE_IDENTITY_VERIFICATION_SESSION_URL,
            { userid },
            { headers: { merchant: this.clientId } }
        );
    }
}