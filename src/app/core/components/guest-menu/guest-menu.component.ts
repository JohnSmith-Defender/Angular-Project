import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  inject,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject } from "rxjs";
import { initFlowbite } from "flowbite";
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
  } from "@ngx-translate/core";
import { LocalService } from "@share/services";
import { environment } from "@env/environment";

@Component({
  selector: "app-guest-menu",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: "./guest-menu.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestMenuComponent {
    private destroy$ = new Subject<void>();

    @Input() company: any;
    @Input() language: any;
    @Input() primaryColor: any;
    @Input() buttonColor: any;
    @Input() canRegister: any;
    @Input() navigation: any;

    languageChangeSubscription;
    signupHover: boolean = false;

    constructor(
        private _router: Router,
        private _localService: LocalService,
        private _translateService: TranslateService,) {  
    }

    async ngOnInit() {
        initFlowbite();
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");

        this.languageChangeSubscription =
        this._translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
                this.language = event.lang;
            }
        );
    }

    login(): void {
        this._router.navigate(["/auth/login"], {
            queryParams: {
                returnUrl: this._router.routerState.snapshot.url
            }
        });
    }

    signup(): void {
        this._router.navigate(["/auth/signup"]);
    }

    toggleSignupHover(event) {
        this.signupHover = event;
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}