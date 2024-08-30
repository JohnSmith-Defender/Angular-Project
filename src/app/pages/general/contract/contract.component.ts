import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService, UserService } from "@share/services";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import { AuthService } from "@lib/services";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import moment from "moment";

@Component({
  selector: "app-contract",
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule, 
    FormsModule, 
    MatSnackBarModule
  ],
  templateUrl: "./contract.component.html",
})
export class ContractComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() id!: number;
  @Input() typeId!: number;


  languageChangeSubscription;
  userId: any;
  language: any;
  features: any;
  companies: any;
  companyId: any;
  domain: any;
  buttonColor: any;
  primaryColor: any;
  isloading: boolean = true;
  groupsTitle: any = "";
  clubsFeature: any;
  companyName: any;
  company: any;
  acceptTermsAndConditions: boolean = false;
  contracts: any;
  contract: any;
  
  constructor(
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _authService: AuthService,
    private _userService: UserService,
    private _router: Router,
    private _snackBar: MatSnackBar,
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
      this.company = company[0];
      this.companyId = company[0].id;
      this.companyName = company[0].entity_name;
      this.domain = company[0].domain;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
      ? company[0].button_color
      : company[0].primary_color;
    }

    this.languageChangeSubscription =
    this._translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.language = event.lang;
        this.initializePage();
      }
      );
      
      this.getContract();
    }

 getContract() {
    this._companyService
    .getCompanyContracts(this.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (data) => {
        this.contracts = data.contracts;
        this.initializePage();
      },
      (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    if(this.typeId) {
      let contract = this.contracts?.filter(contract => {
        return contract.custom_member_type_id == this.typeId
      })
      this.contract = contract?.length > 0 ? contract[0].contract : '';
    }
  }

  async goHome() {
    const dateOfAcceptance = new Date()
    let userId = this._localService.getLocalStorage(environment.lsuserId)
    this._userService
      .acceptConditions(userId,{date_of_acceptance:dateOfAcceptance})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this._authService.redirectToPlatform()
          this._router.navigate([`/`]);
        },
        (error) => {
          this.open(this._translateService.instant("dialog.error"), "");
        }
      );
   
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy(): void {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}