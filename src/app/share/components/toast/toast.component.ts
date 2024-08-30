import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { AuthService } from "@lib/services";
import { initFlowbite } from 'flowbite';

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: "./toast.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
    @Input() company: any;
    @Input() update: any;
    @Input() done: any;
    @Input() confirm: any;
    @Input() title: any;
    @Input() description: any;
    @Input() acceptText: any;
    @Input() cancelText: any;
    @Output() onAccept = new EventEmitter();

    
    primaryColor: any;
    buttonColor: any;

    private readonly _router = inject(Router);
    private readonly _authService = inject(AuthService);

    ngOnInit(): void {
        initFlowbite();
        this.primaryColor = this.company?.primary_color || this.company?.button_color;
        this.buttonColor = this.company?.button_color || this.company?.primary_color;
    }

    applyUpdates() {
        let newVersion = localStorage.getItem('new-version')?.toString();
        let requireRelogin = localStorage.getItem('require-relogin');
        if(newVersion) {
            localStorage.setItem('version', newVersion);
            if(requireRelogin == '1') {
                this._authService.logout();
                this._router.navigate(['/'])
                .then(() => {
                    window.location.reload();
                });
            }
        }
    }

    handleAccept() {
        this.onAccept.emit();
    }
}
