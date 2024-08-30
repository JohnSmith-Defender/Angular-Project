import { Component, OnInit, ViewChild } from "@angular/core";
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from "@ngx-translate/core";
import { MatListModule, MatSelectionList } from "@angular/material/list";
import { CommonModule, Location } from "@angular/common";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { BreadcrumbComponent, PageTitleComponent } from "@share/components";
import { CompanyService, LocalService, UserService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { MenuService } from "@lib/services";
import get from "lodash/get";

@Component({
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        MatSnackBarModule,
        MatListModule,
        BreadcrumbComponent,
        PageTitleComponent,
    ],
    templateUrl: "./registration-fields.component.html",
})
export class RegistrationFieldsComponent implements OnInit {
    private destroy$ = new Subject<void>();

    languageChangeSubscription;
    id: any;
    userId: any;
    companyId: any;
    language: any;
    companies: any;
    userEmailDomain: any;
    primaryColor: any;
    buttonColor: any;

    level1Title: string = "";
    level2Title: string = "";
    level3Title: string = "";
    level4Title: string = "";

    @ViewChild('selectfields', { static: false }) selectfields: MatSelectionList | undefined;
    @ViewChild('includefields', { static: false }) includefields: MatSelectionList | undefined;

    allRegistrationFields: any = []
    registrationFields: any = []
    allRegistrationFieldMapping: any = []
    selectedFields: any = []
    selectedOptions: any = []
    includedOptions: any = []
    showEditFieldModal: boolean = false
    fieldDisplayEs: any
    fieldDisplayEn: any
    fieldDescEs: any
    fieldDescEn: any
    selectedFieldId: any
    fieldGroupEs: any
    fieldGroupEn: any

    constructor(
        private _companyService: CompanyService,
        private _menuService: MenuService,
        private _userService: UserService,
        private _translateService: TranslateService,
        private _location: Location,
        private _localService: LocalService,
        private _snackBar: MatSnackBar
    ) { }

    async ngOnInit() {
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId);
        this.language = this._localService.getLocalStorage(environment.lslang);
        if (!this.language) {
            this.language = "es";
        }
        this._translateService.use(this.language);
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
            this.userEmailDomain = company[0].domain;
            this.companyId = company[0].id;
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

        this.initializePage();
    }

    initializePage() {
        this.initializeBreadcrumb();
        this.getRegistrationFields();
    }

    initializeBreadcrumb() {
        this.level1Title = this._translateService.instant(
            "company-settings.settings"
        );
        this.level2Title = this._translateService.instant(
            "your-admin-area.registration"
        );
        this.level3Title = this._translateService.instant(
            "registration-fields.registrationfields"
        );
        this.level4Title = "";
    }

    getRegistrationFields() {
        this._userService.getRegistrationFields()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                async (response) => {
                    this.allRegistrationFields = response.registration_fields
                    this.getRegistrationFieldMapping()
                },
                error => {
                    console.log(error)
                }
            )
    }

    getRegistrationFieldMapping() {
        this._userService.getRegistrationFieldMapping(this.companyId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                async (response) => {
                    this.allRegistrationFieldMapping = response.registration_field_mapping

                    let registration_fields: any[] = []
                    let selected_fields: any[] = []
                    if (this.allRegistrationFields) {
                        this.allRegistrationFields.forEach(field => {
                            let match = this.allRegistrationFieldMapping.some(a => a.field_id === field.id)
                            if (!match) {
                                registration_fields.push(field)
                            }
                        });
                    }

                    if (this.allRegistrationFieldMapping) {
                        this.allRegistrationFieldMapping.forEach(field => {
                            let reg_field = this.allRegistrationFields.filter(f => {
                                return f.id == field.field_id
                            })

                            let fld = {}
                            if (reg_field && reg_field[0]) {
                                let field_display_en = reg_field[0].field_display_en
                                if (field.field_display_en && field.field_display_en != null) {
                                    field_display_en = field.field_display_en
                                }
                                let field_display_es = reg_field[0].field_display_es
                                if (field.field_display_es && field.field_display_es != null) {
                                    field_display_es = field.field_display_es
                                }
                                let field_desc_en = reg_field[0].field_desc_en
                                if (field.field_desc_en && field.field_desc_en != null) {
                                    field_desc_en = field.field_desc_en
                                }
                                let field_desc_es = reg_field[0].field_desc_es
                                if (field.field_desc_es && field.field_desc_es != null) {
                                    field_desc_es = field.field_desc_es
                                }
                                let field_group_en = reg_field[0].field_group_en
                                if (field.field_group_en && field.field_group_en != null) {
                                    field_group_en = field.field_group_en
                                }
                                let field_group_es = reg_field[0].field_group_es
                                if (field.field_group_es && field.field_group_es != null) {
                                    field_group_es = field.field_group_es
                                }

                                fld = {
                                    "id": reg_field[0].id,
                                    "field": reg_field[0].field,
                                    "field_type": reg_field[0].field_type,
                                    "field_display_en": field_display_en,
                                    "field_display_es": field_display_es,
                                    "field_group_en": field_group_en,
                                    "field_group_es": field_group_es,
                                    "field_desc_en": field_desc_en,
                                    "field_desc_es": field_desc_es,
                                    "active": reg_field[0].active,
                                    "created_at": reg_field[0].created_at
                                }
                                selected_fields.push(fld)
                            }
                        })
                    }

                    this.registrationFields = registration_fields
                    this.selectedFields = selected_fields
                },
                error => {
                    console.log(error)
                }
            )
    }

    getField(field) {
        return field
          ? this.language == "en"
            ? field.field_display_en ||
              field.field_display_es
            : this.language == "fr"
            ? field.field_display_fr ||
              field.field_display_es
            : this.language == "eu"
            ? field.field_display_eu ||
              field.field_display_es
            : this.language == "ca"
            ? field.field_display_ca ||
              field.field_display_es
            : this.language == "de"
            ? field.field_display_de ||
              field.field_display_es
            : field.field_display_es
          : "";
    }

    onSelectListControlChanged(list) {
        if (list) {
            this.selectedOptions = list.selectedOptions.selected.map(item => item.value);
        }
    }

    addFields() {
        let all_fields = this.selectedFields
        let selected_options = this.selectedOptions
        let registration_fields = this.registrationFields

        if (selected_options) {
            selected_options.forEach(option => {
                let match = this.selectedFields.some(a => a.id === option.id)
                if (!match) {
                    all_fields.push(option)
                }

                registration_fields.forEach((field, idx) => {
                    if (field.id === option.id) {
                        registration_fields.splice(idx, 1);
                    }
                })
            });
        }

        if(this.selectfields) {
            this.selectfields.deselectAll()
        }
        this.selectedFields = all_fields
        this.registrationFields = registration_fields
        this.selectedOptions = []
    }

    onIncludeListControlChanged(list) {
        if (list) {
            this.includedOptions = list.selectedOptions.selected.map(item => item.value);
        }
    }

    removeFields() {
        let registration_fields = this.registrationFields
        let included_options = this.includedOptions
        let selected_fields = this.selectedFields


        if (included_options) {
            included_options.forEach(option => {
                let match = this.registrationFields.some(a => a.id === option.id)
                if (!match) {
                    registration_fields.push(option)
                }

                selected_fields.forEach((field, idx) => {
                    if (field.id === option.id) {
                        selected_fields.splice(idx, 1);
                    }
                })
            })
        }

        if (registration_fields) {
            registration_fields = registration_fields.sort((a, b) => {
                if (a.field_display_es < b.field_display_es) {
                    return -1
                }

                if (a.field_display_es > b.field_display_es) {
                    return 1
                }

                return 0
            })
        }

        if(this.includefields) {
            this.includefields.deselectAll()
        }
        this.registrationFields = registration_fields
        this.selectedFields = selected_fields
        this.includedOptions = []
    }

    moveUp() {
        let selected_fields = this.selectedFields
        let included_options = this.includedOptions

        let selected_option
        if (included_options) {
            selected_option = included_options[0]
        }

        // get included option index
        let index = 0
        if (selected_fields) {
            selected_fields.forEach((field, idx) => {
                if (field.id == selected_option.id) {
                    index = idx
                }
            });
        }

        if (index >= 1)
            this.swap(this.selectedFields, index, index - 1)
    }

    swap(array: any[], x: any, y: any) {
        var b = array[x];
        array[x] = array[y];
        array[y] = b;
    }

    moveDown() {
        let selected_fields = this.selectedFields
        let included_options = this.includedOptions

        let selected_option
        if (included_options) {
            selected_option = included_options[0]
        }

        // get included option index
        let index = 0
        if (selected_fields) {
            selected_fields.forEach((field, idx) => {
                if (field.id == selected_option.id) {
                    index = idx
                }
            });
        }

        if (index < this.selectedFields.length - 1)
            this.swap(this.selectedFields, index, index + 1)
    }

    save() {
        if (!this.selectedFields
            || (this.selectedFields && this.selectedFields.length == 0)) {
            return false
        }

        let params = {
            company_id: this.companyId,
            fields: this.selectedFields.map((data) => { return data.id }).join()
        }

        this._userService.updateRegistrationFields(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                response => {
                    if (response) {
                        this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
                    }
                },
                error => {
                    console.log(error)
                }
            )
    }

    editField() {
        if (this.includedOptions) {
            let edit_field = this.includedOptions[0]
            if (edit_field) {
                this.selectedFieldId = edit_field.id
            }

            this._userService.getFieldDetails(edit_field.id, this.companyId)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    response => {
                        let field = response.field
                        if (field) {
                            this.fieldDisplayEn = field.field_display_en
                            this.fieldDisplayEs = field.field_display_es
                            this.fieldDescEn = field.field_desc_en
                            this.fieldDescEs = field.field_desc_es
                            this.fieldGroupEn = field.field_group_en
                            this.fieldGroupEs = field.field_group_es
                        }
                        this.showEditFieldModal = true
                    },
                    error => {
                        console.log(error)
                    }
                )
        }
    }

    closeEditFieldModal() {
        this.showEditFieldModal = false
    }

    saveField() {
        if (!this.fieldDisplayEs) {
            return false
        }

        let params = {
            company_id: this.companyId,
            field_display_en: this.fieldDisplayEn,
            field_display_es: this.fieldDisplayEs,
            field_desc_en: this.fieldDescEn,
            field_desc_es: this.fieldDescEs,
            field_group_en: this.fieldGroupEn,
            field_group_es: this.fieldGroupEs
        }

        this._userService.updateFieldDetails(this.selectedFieldId, params)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                response => {
                    // Update field name in list
                    if (this.selectedFields) {
                        this.selectedFields.forEach(field => {
                            if (field.id == this.selectedFieldId) {
                                field.field_display_en = this.fieldDisplayEn
                                field.field_display_es = this.fieldDisplayEs
                                field.field_desc_en = this.fieldDescEn
                                field.field_desc_es = this.fieldDescEs
                                field.field_group_en = this.fieldGroupEn
                                field.field_group_es = this.fieldGroupEs
                            }
                        });
                    }

                    this.showEditFieldModal = false
                },
                error => {
                    console.log(error)
                }
            )
    }

    async open(message: string, action: string) {
        await this._snackBar.open(message, action, {
            duration: 3000,
            panelClass: ["info-snackbar"],
        });
    }

    handleGoBack() {
        this._location.back();
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}