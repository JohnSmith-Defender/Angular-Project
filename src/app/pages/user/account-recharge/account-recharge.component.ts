import { CommonModule } from '@angular/common';
import { Component, EnvironmentInjector, Input, ViewChild, inject, runInInjectionContext, signal } from '@angular/core';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
    FormsModule,
    ReactiveFormsModule,
    FormBuilder,
    Validators
} from '@angular/forms';
import { NoAccessComponent, PageTitleComponent, ToastComponent } from '@share/components';
import { CompanyService, LocalService, UserService } from '@share/services';
import { StripePaymentService } from '@features/services/payment/stripe.service';
import { ProfessionalsService } from '@features/services';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { NgxPayPalModule } from 'ngx-paypal';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";
import {
    StripeElementsOptions,
    Appearance
} from '@stripe/stripe-js';
import {
    StripePaymentElementComponent,
    StripeService,
    NgxStripeModule,
    injectStripe
} from 'ngx-stripe';
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import moment from "moment";
import get from 'lodash/get';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule,
        MatSnackBarModule,
        NgxStripeModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPayPalModule,
        PageTitleComponent,
        ToastComponent,
        NoAccessComponent,
    ],
    templateUrl: './account-recharge.component.html',
})
export class AccountRechargeComponent {
    private destroy$ = new Subject<void>();

    @Input() mode: any;

    languageChangeSubscription;
    userId: any;
    companyId: any;
    language: any;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    languages: any;
    isLoading: boolean = false;
    company: any;
    user: any;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: string = '';
    confirmDeleteItemDescription: string = '';
    acceptText: string = '';
    cancelText: string = '';

    stripe = injectStripe(this.getStripePublicKey());
    @ViewChild(StripePaymentElementComponent)
    paymentElement!: StripePaymentElementComponent;
    appearance: Appearance = { theme: 'flat' };
    elementsOptions: StripeElementsOptions = {
        locale: 'es',
        appearance: this.appearance,
    };
    paying = signal(false);
    private readonly _stripePaymentService = inject(StripePaymentService);

    public payPalConfig?: IPayPalConfig;

    amountPackages: any = [];
    selectedAmountPackage: number = 0;
    currentStep: number = 1;
    completedStep: boolean = false;
    selectedPaymentMethod: string = '';
    canProceedToPayment: boolean = false;
    showStripePaymentSection: boolean = false;
    selectedCurrency: any;
    transactionDate: any;
    transactionID: any;
    paymentMethods: any;
    stripeActive: boolean = false;
    paypalActive: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private _stripeService: StripeService,
        private _professionalsService: ProfessionalsService,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
    ) { }

    async ngOnInit() {
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.user = this._localService.getLocalStorage(environment.lsuser);
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || 'es');

        this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies)) : ''
        if (!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
        let company = this._companyService.getCompany(this.companies)
        if (company && company[0]) {
            this.company = company[0];
            this.companyId = company[0].id;
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color;
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

    async initializePage() {
        this.isLoading = false;
        this.amountPackages = [
            {
                amount: 5,
                currency: 'eur'
            },
            {
                amount: 10,
                currency: 'eur'
            },
            {
                amount: 20,
                currency: 'eur'
            },
            {
                amount: 50,
                currency: 'eur'
            },
            {
                amount: 100,
                currency: 'eur'
            },
            {
                amount: 200,
                currency: 'eur'
            },
            {
                amount: 500,
                currency: 'eur'
            },
            {
                amount: 1000,
                currency: 'eur'
            },
            {
                amount: 2000,
                currency: 'eur'
            },
        ];

        await this.getStripePublicKey();
    }

    getStripePublicKey() {
        this.paymentMethods = this._localService.getLocalStorage(environment.lspaymentmethods);
        if(this.paymentMethods) {
            this.stripeActive = this.paymentMethods?.stripe == 1 ? true : false;
            this.paypalActive = this.paymentMethods?.paypal == 1 ? true : false;
        }
        return this.paymentMethods?.stripe_public_key || 'pk_test_51K3poJHvVGwmkGFHgZ5W8OWuLZHogTgMypmV8DHsadSvEzDrv8KNrcJyijLoGFsHCvVSa56XODq4pF2dkg721BXl000hSyJ1sm';
    }

    get amount() {
        const amountValue = this.selectedAmountPackage;
        if (!amountValue || amountValue < 0) return 0;

        return Number(amountValue) * 100;
    }

    get amountDisplay() {
        const amountValue = this.selectedAmountPackage;
        if (!amountValue || amountValue < 0) return 0;

        return Number(amountValue).toFixed(2);
    }

    createPaymentIntent() {
        this._stripePaymentService
            .createPaymentIntent({
                amount: this.amount,
                currency: this.selectedCurrency?.toLowerCase(),
            })
            .subscribe((response) => {
                let pi = response['paymentIntent'];
                if (pi?.client_secret) {
                    this.elementsOptions.clientSecret = pi?.client_secret as string;
                    this.canProceedToPayment = true;
                }
            });
    }

    collectPayment() {
        if (this.paying()) return;
        this.paying.set(true);

        const name = this.user ? (this.user?.first_name ? (`${this.user?.first_name} ${this.user?.last_name}`) : this.user?.name) : '';
        const email = this.user?.email;
        const address = this.user?.direccion || '';
        const zipcode = this.user?.zip_code || ''
        const city = this.user?.city || '';

        this.stripe
            .confirmPayment({
                elements: this.paymentElement.elements,
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            name: name as string,
                            email: email as string,
                            address: {
                                line1: address as string,
                                postal_code: zipcode as string,
                                city: city as string,
                            },
                        },
                    },
                },
                redirect: 'if_required'
            })
            .subscribe({
                next: (result) => {
                    this.paying.set(false);
                    if (result.error) {
                        this.open(result.error.message || this._translateService.instant('dialog.error'), '');
                    } else if (result.paymentIntent.status === 'succeeded') {
                        this.showSummary(result);
                    }
                },
                error: (err) => {
                    this.paying.set(false);
                    this.open(err.message || this._translateService.instant('dialog.error'), '');
                },
            });
    }

    showSummary(result) {
        let transaction_id = result?.id || result?.paymentIntent?.id;
        let params = {
            company_id: this.companyId,
            user_id: this.userId,
            currency: this.selectedCurrency,
            amount: parseFloat(this.amountDisplay?.toString()).toFixed(2),
            payment_method: this.selectedPaymentMethod,
            transaction_id,
        }
        this._professionalsService
          .accountRecharge(params)
          .subscribe(
            (response) => {
                this.currentStep = 3;
                this.completedStep = true;
                this.transactionID = transaction_id;
                this.transactionDate = moment().format('D MMMM YYYY');
            },
            (error) => {
                console.log(error);
                this.open(error?.message || this._translateService.instant('dialog.error'), '');
            }
        );
    }

    setCurrentStep(step) {
        let proceed = false;
        if(!this.completedStep) {
            if(step == 1) {
                proceed = true;
            }

            if(step == 2) {
                if(this.selectedAmountPackage) {
                    proceed = true;
                }
            }
        }

        if(proceed) {
            this.currentStep = step;
            if(step == 3) {
                this.completedStep = true;
            }
        }
    }

    selectAmountPackage(amountPackage){
        this.selectedAmountPackage = amountPackage.amount;
        this.selectedCurrency = amountPackage.currency?.toUpperCase();
        this.currentStep = 2;
    }

    async handleChangePaymentMethod(event) {
        this.showStripePaymentSection = false;
        this.selectedPaymentMethod = event?.target?.value;
        if(this.selectedPaymentMethod == 'PayPal') {
            this.initPayPalConfig();
        } else {
            this.createPaymentIntent();
            setTimeout(() => {
                this.showStripePaymentSection = true;
            }, 500)
        }
    }

    private initPayPalConfig(): void {
        this.payPalConfig = {
            currency: this.selectedCurrency,
            clientId: this.paymentMethods?.paypal_client_id || 'AUu1PL_6SA1d7yynxUIW7bVt45TJCsn2Z2eNMHu2y-6-RN6rfCpH27ce7pqw5mLtWn5QVMynAmL580Fn',
            createOrderOnClient: (data) => <ICreateOrderRequest>{
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: this.selectedCurrency,
                            value: this.selectedAmountPackage.toString(),
                            breakdown: {
                                item_total: {
                                    currency_code: this.selectedCurrency,
                                    value: this.selectedAmountPackage.toString()
                                }
                            }
                        },
                        items: [
                            {
                                name: this._translateService.instant('professionals.addmoneytowallet'),
                                quantity: '1',
                                category: 'DIGITAL_GOODS',
                                unit_amount: {
                                    currency_code: this.selectedCurrency,
                                    value: this.selectedAmountPackage.toString(),
                                },
                            }
                        ]
                    }
                ]
            },
            advanced: {
                commit: 'true'
            },
            style: {
                label: 'paypal',
                layout: 'vertical'
            },
            onApprove: (data, actions) => {
                actions.order.get().then(details => {
                    if(details.status == 'COMPLETED') {
                        this.showSummary(details);
                    }
                });
            },
            onClientAuthorization: (data) => {
                if(data.status == 'COMPLETED') {
                    this.showSummary(data);
                }
            },
            onCancel: (data, actions) => {
                console.log('OnCancel', data, actions);
            },
            onError: err => {
                console.log('OnError', err);
            },
            onClick: (data, actions) => {
                console.log('onClick', data, actions);
            },
        };
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