import { CommonModule, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import {
  BreadcrumbComponent,
  PageTitleComponent,
  ToastComponent,
} from "@share/components";
import { SearchComponent } from "@share/components/search/search.component";
import {
  CompanyService,
  LocalService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { EmailEditorModule } from '../../../external/email-editor/src/lib/email-editor.module';
import { EmailEditorComponent } from 'email-editor';
import { initFlowbite } from "flowbite";
import get from "lodash/get";

@Component({
  selector: "app-template-editor",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    EmailEditorModule,
    BreadcrumbComponent,
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: "./template-editor.component.html",
})
export class TemplateEditorComponent {
    private destroy$ = new Subject<void>();

    @Input() list: any;

    languageChangeSubscription;
    level1Title: string = "";
    level2Title: string = "";
    level3Title: string = "";
    level4Title: string = "";
    searchText: any;
    placeholderText: any;
    userId: any;
    companyId: any;
    company: any;
    language: any;
    isloading: boolean = true;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    searchKeyword: any;
    templates: any;
    template: any;
    source : any = "";
    html : any = "";
    body : any = "";
    css : any = ""; 
    source_es : any = "";
    html_es : any = "";
    body_es : any = "";
    css_es : any = "";
    source_eu : any = "";
    html_eu : any = "";
    body_eu : any = "";
    css_eu : any = "";
    source_fr : any = "";
    html_fr : any = "";
    body_fr : any = "";
    css_fr : any = "";
    source_de : any = "";
    html_de : any = "";
    body_de : any = "";
    css_de : any = "";
    source_ca : any = "";
    html_ca : any = "";
    body_ca : any = "";
    css_ca : any = "";
    selectedLanguage: any = "es";
    languages: any = [];
    showLanguages: boolean = false;

    // options = {
    //     fonts: {
    //       showDefaultFonts: false,
    //     }
    //   }
    
    @ViewChild('editor', {static: false})
    private emailEditor: EmailEditorComponent | undefined

    constructor(
        private _router: Router,
        private _companyService: CompanyService,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _snackBar: MatSnackBar,
        private _location: Location
    ) {}

  async ngOnInit() {
    this.language = this._localService.getLocalStorage(environment.lslang) || "es";
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
    initFlowbite();
    this.initializeBreadcrumb();
    this.getLandingTemplates();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.adminaccess"
    );
    this.level3Title = this._translateService.instant(
      "guest-landing.templates"
    );
    this.level4Title = this._translateService.instant(
      "guest-landing.editcontent"
    );
  }

 async getLandingTemplates() {
    if(!this.language) {
        let languages = get(await this._companyService.getLanguages(this.companyId).toPromise(), 'languages')
        this.languages = languages ? languages.filter(lang => { return lang.status == 1 }) : []
        this.showLanguages = true;
        this.selectedLanguage = this.language;
    } else {
        this.selectedLanguage = this.language;
    }

    this._companyService.getLandingTemplates(this.companyId)
      .subscribe(
        async (response) => {
            this.templates = response.templates;
            if(this.templates?.length > 0) {
                let template = this.templates?.filter(temp => {
                    return temp.status == 1
                })
                this.template = template?.length > 0 ? template[0] : {};
                if(this.template?.id > 0) {
                    this.loadContent();
                }
            }
        },
        error => {
            console.log(error)
        }
      )
  }

  editorLoaded(event) {
    this.loadContent();
  }

  loadContent() {
    if(this.template?.id > 0) {
        this._companyService.getLandingTemplate(this.template?.id, this.companyId)
        .subscribe(
            async (response) => {
                this.template = response.template
                if(response.template) {
                this.source = this.template.source
                this.source_es = this.template.source_es
                this.source_eu = this.template.source_eu
                this.source_fr = this.template.source_fr
                this.source_de = this.template.source_de
                this.source_ca = this.template.source_ca

                this.body = this.template.body
                this.body_es = this.template.body_es
                this.body_eu = this.template.body_eu
                this.body_fr = this.template.body_fr
                this.body_de = this.template.body_de
                this.body_ca = this.template.body_ca

                this.css = this.template.css
                this.css_es = this.template.css_es
                this.css_eu = this.template.css_eu
                this.css_fr = this.template.css_fr
                this.css_de = this.template.css_de
                this.css_ca = this.template.css_ca

                this.html = this.template.html
                this.html_es = this.template.html_es
                this.html_eu = this.template.html_eu
                this.html_fr = this.template.html_fr
                this.html_de = this.template.html_de
                this.html_ca = this.template.html_ca
                }
                this.setContent()
            },
            error => {
                console.log(error)
            }
        )
    }
  }

  setContent() {
    if(this.selectedLanguage == 'es') {
      if(this.template.source_es) {
        this.emailEditor?.editor.loadDesign(JSON.parse(this.source_es))
      }
    } else if(this.selectedLanguage == 'fr') {
      if(this.template.source_fr) {
        this.emailEditor?.editor.loadDesign(JSON.parse(this.source_fr))
      }
    } if(this.selectedLanguage == 'en') {
      if(this.template.source) {
        this.emailEditor?.editor.loadDesign(JSON.parse(this.source))
      }
    }if(this.selectedLanguage == 'eu') {
      if(this.template.source_eu) {
        this.emailEditor?.editor.loadDesign(JSON.parse(this.source_eu))
      }
    }if(this.selectedLanguage == 'de') {
      if(this.template.source_de) {
        this.emailEditor?.editor.loadDesign(JSON.parse(this.source_de))
      }
    }if(this.selectedLanguage == 'ca') {
      if(this.template.source_ca) {
        this.emailEditor?.editor.loadDesign(JSON.parse(this.source_ca))
      }
    }
  }

  save() {
    this.emailEditor?.exportHtml((data) => {
      let params
      const source = JSON.stringify(data['design']);
      const html = data['html'];
      const body = data['chunks']['body'];
      const css = data['chunks']['css'];
      if(this.selectedLanguage == "en"){
        this.source = source
        this.body = body
        this.html = html
        this.css = css
      } else if(this.selectedLanguage == "es"){
        this.source_es = source
        this.body_es = body
        this.html_es = html
        this.css_es = css
      } else if(this.selectedLanguage == "eu"){
        this.source_eu = source
        this.body_eu = body
        this.html_eu = html
        this.css_eu = css
      } else if(this.selectedLanguage == "de"){
        this.source_de = source
        this.body_de = body
        this.html_de = html
        this.css_de = css
      } else if(this.selectedLanguage == "ca"){
        this.source_ca = source
        this.body_ca = body
        this.html_ca = html
        this.css_ca = css
      } else if(this.selectedLanguage == "fr"){
        this.source_fr = source
        this.body_fr = body
        this.html_fr = html
        this.css_fr = css
      }

      params = {
        source: this.source,
        html: this.html,
        body: this.body,
        css: this.css,
        source_es: this.source_es,
        html_es: this.html_es,
        body_es: this.body_es,
        css_es: this.css_es,
        source_eu: this.source_eu,
        html_eu: this.html_eu,
        body_eu: this.body_eu,
        css_eu: this.css_eu,
        source_fr: this.source_fr,
        html_fr: this.html_fr,
        body_fr: this.body_fr,
        css_fr: this.css_fr,
        source_de: this.source_de,
        html_de: this.html_de,
        body_de: this.body_de,
        css_de: this.css_de,
        source_ca: this.source_ca,
        html_ca: this.html_ca,
        body_ca: this.body_ca,
        css_ca: this.css_ca,
      }

      this._companyService.editCompanyTemplate(this.template.id, this.companyId, params)
        .subscribe(
            response => {
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
                this.loadContent()
            },
            error => {
                console.log(error)
            }
        )
    });
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