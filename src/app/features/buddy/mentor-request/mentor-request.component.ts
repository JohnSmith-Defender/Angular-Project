import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { QuillModule } from 'ngx-quill';
import { environment } from '@env/environment';
import { BuddyService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PageTitleComponent } from '@share/components';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import get from 'lodash/get';

@Component({
    selector: 'app-mentor-request',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        NgOptimizedImage,
        FormsModule,
        ReactiveFormsModule,
        QuillModule,
        MatSnackBarModule,
        FontAwesomeModule,
        NgMultiSelectDropDownModule,
        PageTitleComponent,
    ],
    templateUrl: './mentor-request.component.html'
})
export class MentorRequestComponent {
    private destroy$ = new Subject<void>();

    languageChangeSubscription;
    user: any;
    email: any;
    language: any;
    companyId: any = 0;
    companies: any;
    domain: any;
    pageTitle: any;
    features: any;

    primaryColor: any;
    buttonColor: any;
    hoverColor: any;
    userId: any;
    subfeatures: any;
    superAdmin: boolean = false;
    pageName: any;
    pageDescription: any;
    showSectionTitleDivider: boolean = false;
    isMobile: boolean = false;
    buddyFeature: any;
    featureId: any;

    form: any;
    me: any;
    hasRequest: boolean = false;
    approvedRequest: boolean = false;

    cities: any = [];
    languages: any = [];
    languageSettings: any;
    selectedLanguage: any = '';

    constructor(
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _buddyService: BuddyService,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();
        initFlowbite();

        this.email = this._localService.getLocalStorage(environment.lsemail);
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(
            environment.lscompanyId
        );
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");
        this.companies = this._localService.getLocalStorage(environment.lscompanies)
            ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
            : "";
        if (!this.companies) {
            this.companies = get(
                await this._companyService.getCompanies().toPromise(),
                "companies"
            );
        }
        let company = this._companyService.getCompany(this.companies);
        if (company && company[0]) {
            this.domain = company[0].domain;
            this.companyId = company[0].id;
            this.primaryColor = company[0].primary_color;
            this.buttonColor = company[0].button_color
                ? company[0].button_color
                : company[0].primary_color;
            this.hoverColor = company[0].hover_color
                ? company[0].hover_color
                : company[0].primary_color;
            this.showSectionTitleDivider = company[0].show_section_title_divider;
            this._localService.setLocalStorage(
                environment.lscompanyId,
                this.companyId
            );
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
        this.pageTitle = this._translateService.instant("buddy.applyasmentor");
        this.initializeForm();
    }

    initializeForm() {
        this.form = this.fb.group({
            first_name: ["", Validators.required],
            last_name: ["", Validators.required],
            major: new FormControl('', [Validators.required]),
            location: new FormControl('', [Validators.required]),
            faculty: new FormControl('', [Validators.required]),
            business_unit: new FormControl('', [Validators.required]),
            segment: new FormControl('', [Validators.required]),
            message: new FormControl('', [Validators.required]),
        });

        this.loadMentorRequestData();
    }

    loadMentorRequestData() {
        this._buddyService
          .fetchMentorRequestData(this.userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.cities = data?.cities;
                this.languages = data?.languages;
                this.initializeDropdowns();
                this.initializeProfile(data);
            },
            (error) => {
              console.log(error);
            }
        );
    }

    initializeDropdowns() {
        this.languageSettings = {
            singleSelection: false,
            idField: "id",
            textField: "name_ES",
            selectAllText: this._translateService.instant("dialog.selectall"),
            unSelectAllText: this._translateService.instant("dialog.clearall"),
            itemsShowLimit: 6,
            allowSearchFilter: true,
            searchPlaceholderText: this._translateService.instant('guests.search'),
        };
    }

    initializeProfile(data) {
        this.me = data?.mentor;
        this.form.get('first_name').setValue(this.me?.first_name || data?.current_user?.first_name);
        this.form.get('last_name').setValue(this.me?.last_name || data?.current_user?.last_name);
        this.form.get('location').setValue(this.me?.location || data?.current_user?.city);
        this.form.get('major').setValue(this.me?.major || data?.current_user?.major);
        this.form.get('faculty').setValue(this.me?.faculty || data?.current_user?.faculty);
        this.form.get('business_unit').setValue(this.me?.business_unit || data?.current_user?.business_unit);
        this.form.get('segment').setValue(this.me?.segment || data?.current_user?.segment);
        
        let mentor_language = this.me?.language || data?.current_user?.language;
        let selected_languages = this.languages.filter((language) => {
            return mentor_language?.indexOf(language.name_ES) >= 0
        })
        this.selectedLanguage = selected_languages.map((language) => {
            const { id, name_ES } = language;
            return {
                id,
                name_ES,
            }
        });
        
        this.form.get('message').setValue(this.me?.message);

        this.hasRequest = this.me?.created_at ? true : false;
        this.approvedRequest = this.me?.approved == 1 ? true : false;
    }

    submit() {
        let language = this.selectedLanguage;
        if(language) {
            language = language?.map((data) => { return data.name_ES }).join(',');
        }
        let params = {
            company_id: this.companyId,
            user_id: this.userId,
            first_name: this.form.get('first_name').value,
            last_name: this.form.get('last_name').value,
            major: this.form.get('major').value,
            location: this.form.get('location').value,
            faculty: this.form.get('faculty').value,
            business_unit: this.form.get('business_unit').value,
            segment: this.form.get('segment').value,
            language,
            message: this.form.get('message').value,
        }
        this._buddyService.applyMentor(params).subscribe(
            res => {
                this.hasRequest = true;
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
            },
            error => {
                console.log(error)
                this.open(this._translateService.instant('dialog.error'), '')
        })
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