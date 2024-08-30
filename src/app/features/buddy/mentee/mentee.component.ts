import { CommonModule, NgOptimizedImage, Location } from '@angular/common';
import { 
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, 
    ElementRef, 
    HostListener, 
    Input, 
    ViewChild 
} from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService, UserService } from '@share/services';
import { Router } from "@angular/router";
import { Subject, takeUntil } from 'rxjs';
import { environment } from '@env/environment';
import { BuddyService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from '@share/components';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import get from 'lodash/get';

@Component({
    selector: 'app-mentor',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        NgOptimizedImage,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        FontAwesomeModule,
        PageTitleComponent,
        BreadcrumbComponent,
        ToastComponent,
    ],
    templateUrl: './mentee.component.html'
})
export class MenteeComponent {
    private destroy$ = new Subject<void>();

    @Input() id!: number;

    languageChangeSubscription;
    apiPath: string = environment.api + "/";
    me: any;
    user: any;
    email: any;
    language: any;
    company: any;
    companyId: any = 0;
    companies: any;
    domain: any;
    pageTitle: any;
    features: any;
    level1Title: string = "";
    level2Title: string = "";
    level3Title: string = "";
    level4Title: string = "";
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
    canCreate: boolean = false;
    mentor: any;
    image: any;
    mentee: any;

    constructor(
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _buddyService: BuddyService,
        private _userService: UserService,
        private _location: Location,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef
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
            this.company = company[0];
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
        this.pageName = this._translateService.instant('buddy.mentee');
        this.pageDescription = '';
        this.fetchMenteeData();
    }

    fetchMenteeData() {
        this._userService
          .getUserById(this.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.formatMentee(data?.CompanyUser);
                this.initializeBreadcrumb();
            },
            (error) => {
              console.log(error);
            }
        );
    }

    formatMentee(mentee) {
        let mentee_campus = mentee?.campus || mentee?.city;
        if(
            mentee.canonical_name?.indexOf("VILLAVICIOSA") >= 0 ||
            mentee.canonical_name?.indexOf("ALCOBENDAS") >= 0 ||
            mentee.canonical_name?.indexOf("MADRID") >= 0
        ) {
            mentee_campus = 'Madrid';
        } else if(mentee.canonical_name?.indexOf("VALENCIA") >= 0) {
            mentee_campus = 'Valencia';
        } else if(mentee.canonical_name?.indexOf("SALAZAR") >= 0) {
            mentee_campus = 'Canarias'
        }

        let campus = mentee?.campus || mentee?.city;
        if(
            mentee.campus?.indexOf("VILLAVICIOSA") >= 0 ||
            mentee.campus?.indexOf("ALCOBENDAS") >= 0 ||
            mentee.campus?.indexOf("MADRID") >= 0
        ) {
            campus = 'Madrid';
        } else if(mentee.campus?.indexOf("VALENCIA") >= 0) {
            campus = 'Valencia';
        } else if(mentee.campus?.indexOf("SALAZAR") >= 0) {
            campus = 'Canarias'
        }
        
        let mentee_image = `${environment.api}/${mentee?.image}`;
        if(mentee?.photo) {
            mentee_image = `data:image/png;base64,${mentee?.photo}`
        }

        let mentee_type_array = mentee?.type ? mentee?.type?.split(',') : [];
        let mentee_types: any[] = [];
        if(mentee_type_array?.length > 0) {
            mentee_type_array?.forEach(mt => {
                let match = mentee_types?.some(
                    (a) => a.type == mt
                );
                if(!match) {
                    mentee_types.push({
                        type: mt
                    })
                }
            })
        }

        let segment_array = mentee?.segment ? mentee?.segment?.split(',') : [];
        let mentee_segments: any[] = [];
        if(segment_array?.length > 0) {
            segment_array?.forEach(sg => {
                let match = mentee_segments?.some(
                    (a) => a.segment == sg
                );
                if(!match) {
                    mentee_segments.push({
                        segment: sg
                    })
                }
            })
        }

        let business_unit_array = mentee?.bussines_unit ? mentee?.bussines_unit?.split(',') : [];
        let mentee_business_units: any[] = [];
        if(business_unit_array?.length > 0) {
            business_unit_array?.forEach(sg => {
                let match = mentee_business_units?.some(
                    (a) => a.bussines_unit == sg
                );
                if(!match) {
                    mentee_business_units.push({
                        bussines_unit: sg
                    })
                }
            })
        }

        let num_matricula_array = mentee?.title_name ? mentee?.title_name?.split(',') : [];
        let mentee_num_matricula: any[] = [];
        if(num_matricula_array?.length > 0) {
            num_matricula_array?.forEach(mt => {
                let match = mentee_num_matricula?.some(
                    (a) => a.title_name == mt
                );
                if(!match) {
                    mentee_num_matricula.push({
                        num_matricula: mt
                    })
                }
            })
        }

        this.mentee = {
            id: mentee.id,
            display_name: mentee?.first_name ? `${mentee?.first_name} ${mentee?.last_name}` : mentee?.name,
            mentee_image,
            email: `mailto:${mentee?.personal_email || mentee?.email}`,
            email_display: mentee?.personal_email || mentee?.email,
            phone: `tel:${mentee?.phone1 || mentee?.phone}`,
            phone_display: mentee?.phone1 || mentee?.phone,
            phone2: `tel:${mentee?.phone2}`,
            phone2_display: mentee?.phone2,
            mentee_campus,
            registration_num: mentee?.registration_num,
            document_type: mentee?.document_type,
            id_document: mentee?.document,
            types: mentee_types,
            segments: mentee_segments,
            business_units: mentee_business_units,
            num_matricula: mentee_num_matricula,
            faculty: mentee?.faculty,
            campus,
        }
    }

    initializeBreadcrumb() {
        this.level1Title = this._translateService.instant('buddy.mentee');
        this.level2Title = this.mentee?.display_name;
        this.level3Title = "";
        this.level4Title = "";
    }

    handleGoBack() {
        this._location.back();
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