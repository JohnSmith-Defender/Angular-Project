import { CommonModule } from "@angular/common";
import { Component,  Input, OnDestroy, OnInit } from "@angular/core";
import {  RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TutorsService } from "@features/services";

@Component({
  selector:'app-tutor-hourly-rate-banner',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule, 
    FormsModule, 
    MatSnackBarModule
  ],
  templateUrl: "./tutor-hourly-rate.component.html",
})
export class TutorHourlyateBanner implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() id!: number;
  @Input() typeId!: number;

  languageChangeSubscription;
  userId: any;
  language: any;
  companies:any;
  companyId: any;
  domain: any;
  tutorPerHourRate:number = 0;
  showBanner:boolean = true

  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _tutorService: TutorsService,
  ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this._translateService.use(this.language || "es");

    this.companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
      this.companyId = company[0].id;
      this.domain = company[0].domain;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
        }
      );

    this.getContract();
  }

  getContract() {
    this._tutorService
      .gettutorPerHourRate(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.tutorPerHourRate = data?.tutor_per_hour_rate
        },
        (error) => {
          console.log(error);
        }
      );
  }

  closeBanner(){
    this.showBanner = false
  }
  

  ngOnDestroy(): void {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}