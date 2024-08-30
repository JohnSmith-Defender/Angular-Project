import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    SimpleChange,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { initFlowbite } from 'flowbite';

@Component({
    selector: "app-call-notification-popup",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule, 
        TranslateModule
    ],
    templateUrl: "./call-notification-popup.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallNotificationPopupComponent {
    @Input() showToast: any;
    @Input() company: any;
    @Input() userId: any;
    @Input() toastMessage: any;
    @Input() toastMode: any;
    @Input() toastName: any;
    @Input() toastImage: any;
    @Input() communicationMode: any;
    @Output() handleAcceptClick = new EventEmitter();
    @Output() handleCancelClick = new EventEmitter()

    primaryColor: any;
    buttonColor: any;

    ngOnInit(): void {
        initFlowbite();
        this.primaryColor = this.company?.primary_color || this.company?.button_color;
        this.buttonColor = this.company?.button_color || this.company?.primary_color;
    }

    ngOnChanges(changes: SimpleChange) {
        let showToastChange = changes["showToast"];
        if (showToastChange?.currentValue != true && showToastChange?.currentValue == true) {
            this.showToast = true;
        }

        let toastModeChange = changes["toastMode"];
        if (toastModeChange?.currentValue != toastModeChange?.previousValue) {
            this.toastMode = toastModeChange?.currentValue;
        }

        let toastMessageChange = changes["toastMessage"];
        if (toastMessageChange?.currentValue != toastMessageChange?.previousValue) {
            this.toastMessage = toastMessageChange?.currentValue;
        }
    }

    handleCancelCall() {
        this.handleCancelClick.emit();
    }

    handleAcceptCall() {
        this.handleAcceptClick.emit();
    }
}