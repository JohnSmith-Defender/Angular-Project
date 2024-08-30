import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import {
    LangChangeEvent,
    TranslateModule, 
    TranslateService,
} from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { PageTitleComponent, ToastComponent } from '@share/components';
import { CompanyService, LocalService, UserService } from '@share/services';
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "@env/environment";
import { initFlowbite } from "flowbite";
import { Subject } from 'rxjs';
import moment from "moment";
import get from 'lodash/get';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule,
        MatTableModule,
        MatSortModule,
        MatSnackBarModule,
        PageTitleComponent,
        ToastComponent,
    ],
    templateUrl: './my-transactions.component.html',
})
export class MyTransactionsComponent {
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
    leftTabs: any = [];
    isLoading: boolean = false;
    hasVoiceCall: boolean = false;
    hasVideoCall: boolean = false;
    hasChat: boolean = false;
    company: any;
    user: any;
    viewMode: string = 'voicecalls';
    displayedColumns: any[] = [ 'description', 'transaction_amount', 'date'];
    callLogs: any = [];
    videoCallLogs: any = [];
    chatLogs: any = [];
    walletLogs: any = [];
    dataSource: any;
    showConfirmationModal: boolean = false;
    selectedItem: any;
    confirmDeleteItemTitle: string = '';
    confirmDeleteItemDescription: string = '';
    acceptText: string = '';
    cancelText: string = '';
    viewTitle: string = '';
    list: any = [];
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private _snackBar: MatSnackBar,
    ) {}

    async ngOnInit() {
        this.userId = this._localService.getLocalStorage(environment.lsuserId)
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId)
        this.language = this._localService.getLocalStorage(environment.lslang)
        this._translateService.use(this.language || 'es')

        this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies)) : ''
        if(!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
        let company = this._companyService.getCompany(this.companies)
        if(company && company[0]) {
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

    initializePage() {
        this.initializeView();
        this.getTransactions();
    }

    initializeView() {
        let key = `professionals.${this.viewMode}`
        this.viewTitle = this._translateService.instant(key);
    }

    getTransactions() {
        this._userService.getUserTransactions(this.companyId, this.userId).subscribe(data => {
            this.mapSubfeatures(data?.subfeatures);
            this.user = data?.user;
            this.callLogs = this.formatList(data?.call_logs, 'deduct');
            this.videoCallLogs = this.formatList(data?.video_call_logs, 'deduct');
            this.chatLogs = this.formatList(data?.chat_logs, 'deduct');
            this.walletLogs = this.formatList(data?.wallet_transactions, 'add');
            this.initializeTable();
        }, error => {
            console.log(error)
        })
    }

    initializeTable() {
        let list = [];

        switch(this.viewMode) {
            case 'voicecalls':
                list = this.callLogs;
                break;
            case 'videocalls':
                list = this.videoCallLogs;
                break;
            case 'chatmessages':
                list = this.chatLogs;
                break;
            case 'wallet':
                list = this.walletLogs;
                break;
        }


        this.populateTable(list);
    }
    
    async mapSubfeatures(subfeatures) {
        this.leftTabs = [];
        this.list = [];
        this.dataSource = '';

        if(subfeatures?.length > 0) {
            this.hasVoiceCall = subfeatures.some(a => a.name_en == 'Call feature' && a.active == 1);
            this.hasVideoCall = subfeatures.some(a => a.name_en == 'Video call feature' && a.active == 1);
            this.hasChat = subfeatures.some(a => a.name_en == 'Chat feature' && a.active == 1);
        }

        if(this.hasVideoCall) {
            this.leftTabs.push({
                mode: 'voicecalls',
                text: this._translateService.instant('professionals.voicecalls')
            })
        }
        if(this.hasVideoCall) {
            this.leftTabs.push({
                mode: 'videocalls',
                text: this._translateService.instant('professionals.videocalls')
            })
        }
        if(this.hasChat) {
            this.leftTabs.push({
                mode: 'chatmessages',
                text: this._translateService.instant('professionals.chatmessages')
            })
        }
        this.leftTabs.push({
            mode: 'wallet',
            text: this._translateService.instant('professionals.wallet')
        })

        initFlowbite();
    }

    formatList(list, type) {
        this.list = list;

        return list?.map((item) => {
            let description = '';
            let transaction_amount = '';

            if(type == 'add') {
                description = `${this._translateService.instant('professionals.purchased')} ${this._translateService.instant('professionals.via')} ${item.payment_method}`;
                transaction_amount = `${item?.amount ? ' + ' : ''} ${item?.currency || ''} ${item?.amount || ''}`;
            } else {
                let minutes_duration;
                let seconds_duration = 0;

                if(item?.duration > 0) {
                    if(item?.duration < 60) {
                        seconds_duration = item?.duration;
                    } else {
                        let duration = item?.duration / 60;
                        minutes_duration = parseFloat(duration?.toString())?.toFixed(2);
                    }
                } else {
                    minutes_duration = moment(item?.updated_at).diff(moment(item?.created_at), 'minutes');
                    if(minutes_duration > 0) {
                    } else {
                        seconds_duration = seconds_duration = moment(item?.updated_at).diff(moment(item?.created_at), 'seconds');
                    }
                }

                let duration_text = minutes_duration > 0 ? 
                    `${minutes_duration} ${this._translateService.instant('timeunits.minutes')}` :
                    `${seconds_duration} ${this._translateService.instant('videos-ctas.seconds')}`

                description = `${this._translateService.instant('professionals.callwith')} ${item.professional_name} ${duration_text}`;
                
                let amount = item?.caller_balance_before_call ? (parseFloat((parseFloat(item?.caller_balance_before_call) - parseFloat(item?.caller_balance_after_call)).toString()).toFixed(2)) : 0;
                transaction_amount = `${amount ? ' - ' : ''} ${amount ? (item?.currency || 'EUR') : ''} ${amount || ''}`;
            }

            return {
              ...item,
              id: item?.id,
              description,
              transaction_amount,
              type,
            };
        });
    }

    handleSwitchView(mode) {
        this.viewMode = mode;
        this.initializeView();
        this.getTransactions();
    }
    
    populateTable(list) {
        this.dataSource = new MatTableDataSource(list);
        if (this.sort) {
            this.dataSource.sort = this.sort;
        } else {
            setTimeout(() => this.dataSource.sort = this.sort);
        }
        this.isLoading = false;
    }

    confirmDeleteItem(id) {
        this.showConfirmationModal = false;
        this.selectedItem = id;
        this.confirmDeleteItemTitle = this._translateService.instant(
          "dialog.confirmdelete"
        );
        this.confirmDeleteItemDescription = this._translateService.instant(
          "dialog.confirmdeleteitem"
        );
        this.acceptText = "OK";
        setTimeout(() => (this.showConfirmationModal = true));
    }

    confirm() {
        this.deleteItem(this.selectedItem, true);
        this.showConfirmationModal = false;
    }
    
    deleteItem(id, confirmed) {
        
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
